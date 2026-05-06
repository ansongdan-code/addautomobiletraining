import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { store } from './src/store';
import { setCredentials } from './src/store/slices/authSlice';
import RootNavigator from './src/navigation/RootNavigator';

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userString = await SecureStore.getItemAsync('user');
        if (token && userString) {
          const user = JSON.parse(userString);
          dispatch(setCredentials({ user, token }));
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
      }
    };

    initializeAuth();
  }, [dispatch]);

  return <RootNavigator />;
};

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
      <Toast />
      <StatusBar style="auto" />
    </Provider>
  );
}
