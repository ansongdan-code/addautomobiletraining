import React, { useEffect } from \u0027react\u0027;\nimport { StatusBar } from \u0027expo-status-bar\u0027;\nimport { Provider, useDispatch } from \u0027react-redux\u0027;\nimport * as SecureStore from \u0027expo-secure-store\u0027;\nimport Toast from \u0027react-native-toast-message\u0027;\nimport { store } from \u0027./src/store\u0027;\n
import { setCredentials } from './src/store/slices/authSlice';
import RootNavigator from './src/navigation/RootNavigator';

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() \u003d\u003e {\n    const initializeAuth \u003d async () \u003d\u003e {\n      try {\n        const token \u003d await SecureStore.getItemAsync(\u0027token\u0027);\n        const userString \u003d await SecureStore.getItemAsync(\u0027user\u0027);\n        if (token \u0026\u0026 userString) {\n          const user \u003d JSON.parse(userString);\n          dispatch(setCredentials({ user, token }));\n        }\n      } catch (error) {\n        console.error(\u0027Failed to load auth data:\u0027, error);\n      }\n    };\n\n    initializeAuth();\n  }, [dispatch]);\n

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
