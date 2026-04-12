import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDsbtrnzJhUpVnfitKpSllHOWIOtAzO9jk",
    authDomain: "leafdoctor-1f806.firebaseapp.com",
    projectId: "leafdoctor-1f806",
    storageBucket: "leafdoctor-1f806.firebasestorage.app",
    messagingSenderId: "693272202008",
    appId: "1:693272202008:android:022789fca6d1df61d1ec6d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;