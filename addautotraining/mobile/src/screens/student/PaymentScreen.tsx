import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';
import { useDispatch } from 'react-redux';
import { confirmPayment } from '../../store/slices/courseSlice';
import { COLORS } from '../../constants/colors';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toast';

type RouteProps = {
  Payment: {
    paymentUrl: string;
    paymentId: string;
    courseId: string;
    gateway: 'paypal' | 'paystack';
  };
};

const PaymentScreen = () => {
  const route = useRoute<RouteProp<RouteProps, 'Payment'>>();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const webviewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  const { paymentUrl, paymentId, courseId, gateway } = route.params;

  useEffect(() => {
    const handleDeepLink = async () => {
      const url = await Linking.getInitialURL();
      if (url != null) {
        handlePaymentCallback(url);
      }

      const subscription = Linking.addEventListener('url', ({ url }) => {
        handlePaymentCallback(url);
      });

      return () => subscription.remove();
    };

    handleDeepLink();
  }, [paymentId]);

  const handlePaymentCallback = async (url: string) => {
    try {
      // Extract transaction ID from callback URL
      const transactionId = extractTransactionId(url, gateway);

      if (transactionId) {
        // Confirm payment with backend
        await dispatch(
          confirmPayment({
            paymentId,
            transactionId,
          }) as any
        ).unwrap();

        showSuccessToast('Payment Successful', 'Your payment has been confirmed!');
        navigation.goBack();
        navigation.navigate('MyCourses' as never);
      }
    } catch (error: any) {
      showErrorToast('Payment Error', error?.message || 'Failed to confirm payment');
    }
  };

  const extractTransactionId = (url: string, gateway: string): string | null => {
    if (gateway === 'paypal') {
      const match = url.match(/token=([^&]*)/);
      return match ? match[1] : null;
    } else if (gateway === 'paystack') {
      const match = url.match(/reference=([^&]*)/);
      return match ? match[1] : null;
    }
    return null;
  };

  const handleNavigationStateChange = (webviewState: any) => {
    const { url } = webviewState;
    if (url.includes('cancelled') || url.includes('cancel')) {
      showInfoToast('Payment Cancelled', 'Your payment was cancelled');
      navigation.goBack();
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{gateway === 'paypal' ? 'PayPal' : 'Paystack'} Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <WebView
        ref={webviewRef}
        source={{ uri: paymentUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading payment gateway...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  backButton: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textLight,
  },
});

export default PaymentScreen;