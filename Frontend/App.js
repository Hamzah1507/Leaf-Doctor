import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BackHandler, Alert } from 'react-native';
import './src/i18n';
import RootNavigator from './src/navigation/RootNavigator';
import { store } from './src/redux/store';

export default function App() {

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Leave LeafDoctor? 🌿',
        'Are you sure you want to exit the app?',
        [
          { text: 'Stay', style: 'cancel', onPress: () => null },
          { text: 'Leave', style: 'destructive', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: true }
      );
      return true; // prevents default back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <RootNavigator />
          <StatusBar style="auto" />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}