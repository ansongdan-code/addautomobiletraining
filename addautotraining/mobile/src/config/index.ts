import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator to access localhost, otherwise use localhost
const DEV_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export const API_BASE_URL = DEV_API_URL;
