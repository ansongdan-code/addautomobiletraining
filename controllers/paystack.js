const https = require('https');

// @desc    Initialize Paystack payment
// @route   POST /api/v1/paystack/initialize-payment
// @access  Private
exports.initializePayment = async (req, res, next) => {
  const { amount, email } = req.body;

  const params = JSON.stringify({
    email: email,
    amount: amount * 100, // Paystack expects amount in kobo
  });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: '/transaction/initialize',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  const clientReq = https
    .request(options, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        res.status(200).json(JSON.parse(data));
      });
    })
    .on('error', (error) => {
      console.error(error);
      res.status(500).json({ success: false, error: 'Server Error' });
    });

  clientReq.write(params);
  clientReq.end();
};

// @desc    Verify Paystack payment
// @route   GET /api/v1/paystack/verify-payment/:reference
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  const reference = req.params.reference;

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  const clientReq = https
    .request(options, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        res.status(200).json(JSON.parse(data));
      });
    })
    .on('error', (error) => {
      console.error(error);
      res.status(500).json({ success: false, error: 'Server Error' });
    });

  clientReq.end();
};
