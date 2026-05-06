import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { enrollInCourse, createPaymentIntent } from '../../store/slices/courseSlice';
import { RootState, AppDispatch } from '../../store';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { COLORS } from '../../constants/colors';

type CourseStackParamList = {
  CourseDetail: { courseId: string; courseData: any };
};

const CourseDetailScreen = () => {
  const route = useRoute<RouteProp<CourseStackParamList, 'CourseDetail'>>();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { isLoading } = useSelector((state: RootState) => state.courses);

  const { courseData } = route.params;

  const handleEnroll = async () => {
    try {
      await dispatch(enrollInCourse(courseData._id)).unwrap();
      showSuccessToast('Enrollment Successful', 'You are now enrolled in this course');
      setTimeout(() => {
        navigation.navigate('MyCourses' as never);
      }, 2000);
    } catch (error: any) {
      showErrorToast('Enrollment Failed', error?.message || 'Unable to enroll');
    }
  };

  const handlePaypal = async () => {
    try {
      const result = await dispatch(
        createPaymentIntent({
          courseId: courseData._id,
          amount: courseData.price,
          gateway: 'paypal',
        })
      ).unwrap();

      showSuccessToast('Payment Intent Created', 'Redirecting to PayPal...');
      
      // Navigate to payment screen with returned URL
      setTimeout(() => {
        (navigation as any).navigate('Payment', {
          paymentUrl: result.data.approvalUrl,
          paymentId: result.data.id,
          courseId: courseData._id,
          gateway: 'paypal',
        });
      }, 1000);
    } catch (error: any) {
      showErrorToast('PayPal Error', error?.message || 'Unable to create PayPal intent');
    }
  };

  const handlePaystack = async () => {
    try {
      const result = await dispatch(
        createPaymentIntent({
          courseId: courseData._id,
          amount: courseData.price,
          gateway: 'paystack',
        })
      ).unwrap();

      showSuccessToast('Payment Intent Created', 'Redirecting to Paystack...');

      // Navigate to payment screen with returned URL
      setTimeout(() => {
        (navigation as any).navigate('Payment', {
          paymentUrl: result.data.authorization_url,
          paymentId: result.data.id,
          courseId: courseData._id,
          gateway: 'paystack',
        });
      }, 1000);
    } catch (error: any) {
      showErrorToast('Paystack Error', error?.message || 'Unable to create Paystack intent');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{courseData.title}</Text>
        <Text style={styles.description}>{courseData.description}</Text>
        <View style={styles.detailsContainer}>
          <Text style={styles.detail}>Price: <Text style={styles.detailValue}>${courseData.price}</Text></Text>
          <Text style={styles.detail}>Category: <Text style={styles.detailValue}>{courseData.category}</Text></Text>
          <Text style={styles.detail}>Level: <Text style={styles.detailValue}>{courseData.level}</Text></Text>
          <Text style={styles.detail}>Duration: <Text style={styles.detailValue}>{courseData.duration?.weeks} weeks</Text></Text>
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#0070ba' }]} onPress={handlePaypal} disabled={isLoading}>
          <Text style={styles.buttonText}>Pay with PayPal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.success }]} onPress={handlePaystack} disabled={isLoading}>
          <Text style={styles.buttonText}>Pay with Paystack</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.primary }]} onPress={handleEnroll} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Enrolling...' : 'Enroll Now'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 12, color: COLORS.text },
  description: { fontSize: 16, color: COLORS.textLight, marginBottom: 20, lineHeight: 24 },
  detailsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20
  },
  detail: { fontSize: 16, marginBottom: 8, color: COLORS.textLight },
  detailValue: { fontWeight: 'bold', color: COLORS.text },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});

export default CourseDetailScreen;