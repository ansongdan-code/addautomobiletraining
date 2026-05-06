import Toast from 'react-native-toast-message';

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom';
}

export const showSuccessToast = (message: string, subtext?: string, options?: ToastOptions) => {
  Toast.show({
    type: 'success',
    text1: message,
    text2: subtext,
    visibilityTime: options?.duration || 3000,
    position: options?.position || 'bottom',
  });
};

export const showErrorToast = (message: string, subtext?: string, options?: ToastOptions) => {
  Toast.show({
    type: 'error',
    text1: message,
    text2: subtext,
    visibilityTime: options?.duration || 3000,
    position: options?.position || 'bottom',
  });
};

export const showInfoToast = (message: string, subtext?: string, options?: ToastOptions) => {
  Toast.show({
    type: 'info',
    text1: message,
    text2: subtext,
    visibilityTime: options?.duration || 3000,
    position: options?.position || 'bottom',
  });
};

export const showWarningToast = (message: string, subtext?: string, options?: ToastOptions) => {
  Toast.show({
    type: 'error',
    text1: message,
    text2: subtext,
    visibilityTime: options?.duration || 3000,
    position: options?.position || 'bottom',
  });
};
