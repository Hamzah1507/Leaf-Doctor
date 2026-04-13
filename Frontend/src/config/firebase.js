import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDsbtrnzJhUpVnfitKpSllHOWIOtAzO9jk",
  authDomain: "leafdoctor-1f806.firebaseapp.com",
  projectId: "leafdoctor-1f806",
  storageBucket: "leafdoctor-1f806.firebasestorage.app",
  messagingSenderId: "693272202008",
  appId: "1:693272202008:android:022789fca6d1df61d1ec6d"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app); 
export default app;
