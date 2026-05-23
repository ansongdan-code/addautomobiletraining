const https = require('https');
const crypto = require('crypto');
const Course = require('../models/Course');
const User = require('../models/User');
const WebsiteSettings = require('../models/WebsiteSettings');
const HttpError = require('../utils/httpError');
const logger = require('../utils/logger');
const PaymentServiceInterface = require('./interfaces/paymentServiceInterface');

class PaymentService extends PaymentServiceInterface {
  async initializePaystackPayment({ courseId, email, user, protocol, host }) {
    if (!courseId) {
      throw new HttpError(400, 'Course ID is required');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new HttpError(404, 'Course not found');
    }

    if (typeof course.price !== 'number' || Number.isNaN(course.price) || course.price <= 0) {
      throw new HttpError(400, 'Invalid course price configured');
    }

    const userEmail = user?.email || email;
    if (!userEmail) {
      throw new HttpError(400, 'User email is required for payment');
    }

    const paystackSecretKey = await this.getPaystackSecretKey();

    const paymentData = {
      email: userEmail,
      amount: Math.round(course.price * 100),
      currency: 'NGN',
      reference: `course_${courseId}_${Date.now()}`,
      callback_url: `${protocol}://${host}/payment/paystack/callback`,
      metadata: {
        courseId,
        userId: user.id,
        courseName: course.title
      }
    };

    const paystackResponse = await this.makePaystackRequest({
      path: '/transaction/initialize',
      method: 'POST',
      secretKey: paystackSecretKey,
      payload: paymentData
    });

    if (!paystackResponse.status) {
      throw new HttpError(400, paystackResponse.message || 'Unable to initialize payment');
    }

    return {
      authorization_url: paystackResponse.data.authorization_url,
      access_code: paystackResponse.data.access_code,
      reference: paystackResponse.data.reference
    };
  }

  async verifyPaystackPayment({ reference, authenticatedUserId }) {
    if (!reference) {
      throw new HttpError(400, 'Payment reference is required');
    }

    const paystackSecretKey = await this.getPaystackSecretKey();
    const verificationResponse = await this.makePaystackRequest({
      path: `/transaction/verify/${encodeURIComponent(reference)}`,
      method: 'GET',
      secretKey: paystackSecretKey
    });

    if (!verificationResponse.status || verificationResponse.data.status !== 'success') {
      throw new HttpError(400, 'Payment verification failed');
    }

    const metadata = verificationResponse.data.metadata || {};
    const { courseId, userId } = metadata;
    if (!courseId || !userId) {
      throw new HttpError(400, 'Payment metadata is missing required information');
    }

    if (userId !== authenticatedUserId) {
      throw new HttpError(403, 'Payment reference does not belong to the authenticated user');
    }

    await this.enrollUserInCourse(authenticatedUserId, courseId);
    return verificationResponse.data;
  }

  async processPaystackWebhook({ signature, rawBody }) {
    if (!Buffer.isBuffer(rawBody)) {
      throw new HttpError(400, 'Invalid webhook payload format');
    }

    const paystackSecretKey = await this.getPaystackSecretKey();
    const expectedHash = crypto
      .createHmac('sha512', paystackSecretKey)
      .update(rawBody.toString('utf8'))
      .digest('hex');

    if (!signature || signature.length !== expectedHash.length) {
      throw new HttpError(400, 'Invalid signature');
    }

    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedHashBuffer = Buffer.from(expectedHash, 'utf8');
    const isValidSignature = crypto.timingSafeEqual(signatureBuffer, expectedHashBuffer);

    if (!isValidSignature) {
      throw new HttpError(400, 'Invalid signature');
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    switch (event.event) {
      case 'charge.success':
        await this.handleSuccessfulPayment(event.data);
        break;
      case 'charge.failed':
        await this.handleFailedPayment(event.data);
        break;
      default:
        logger.debug(`Unhandled Paystack webhook event: ${event.event}`);
        break;
    }
  }

  async getPaymentHistory(userId) {
    const paidCourses = await Course.find({
      enrolledStudents: {
        $elemMatch: {
          student: userId,
          paymentStatus: 'paid'
        }
      }
    }).select('title price enrolledStudents');

    const history = [];
    for (const course of paidCourses) {
      const matchingEnrollments = course.enrolledStudents.filter((enrollment) => {
        return enrollment.student.toString() === userId && enrollment.paymentStatus === 'paid';
      });

      for (const enrollment of matchingEnrollments) {
        history.push({
          course: {
            _id: course._id,
            title: course.title,
            price: course.price
          },
          enrolledAt: enrollment.enrolledAt,
          paymentStatus: enrollment.paymentStatus
        });
      }
    }

    return history.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));
  }

  async getPaystackSecretKey() {
    const settings = await WebsiteSettings.getSettings();
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || settings.paymentMethods?.paystack?.secretKey;

    if (!paystackSecretKey) {
      throw new HttpError(500, 'Paystack is not configured');
    }

    return paystackSecretKey;
  }

  async makePaystackRequest({ path, method = 'GET', secretKey, payload }) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path,
        method,
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        }
      };

      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error('Unexpected response format from Paystack'));
          }
        });
      });

      request.on('error', (error) => reject(error));

      if (payload) {
        request.write(JSON.stringify(payload));
      }

      request.end();
    });
  }

  async enrollUserInCourse(userId, courseId) {
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!user || !course) {
      throw new HttpError(404, 'User or course not found');
    }

    const existingEnrollment = user.enrolledCourses.find(
      (enrollment) => enrollment.course.toString() === courseId
    );

    if (!existingEnrollment) {
      user.enrolledCourses.push({
        course: courseId
      });
      await user.save();
    }

    const existingStudentEnrollment = course.enrolledStudents.find(
      (enrollment) => enrollment.student.toString() === userId
    );

    if (existingStudentEnrollment) {
      existingStudentEnrollment.paymentStatus = 'paid';
    } else {
      course.enrolledStudents.push({
        student: userId,
        paymentStatus: 'paid'
      });
    }

    await course.save();
  }

  async handleSuccessfulPayment(paymentData) {
    if (paymentData?.metadata?.courseId && paymentData?.metadata?.userId) {
      await this.enrollUserInCourse(paymentData.metadata.userId, paymentData.metadata.courseId);
    }
  }

  async handleFailedPayment(paymentData) {
    logger.warn('Paystack payment failed', {
      reference: paymentData?.reference,
      gateway_response: paymentData?.gateway_response
    });
  }
}

module.exports = new PaymentService();
