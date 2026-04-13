import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { useSelector, useDispatch } from 'react-redux';
import { onSnapshot, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { logout } from '../redux/slices/authSlice';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const unsubscribeRef = useRef(null);
    const isLoggingOut = useRef(false);

    useEffect(() => {
        if (!isAuthenticated || !user?.uid) {
            isLoggingOut.current = false;
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            return;
        }

        isLoggingOut.current = false;

        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }

        unsubscribeRef.current = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
            if (snapshot.exists() && !isLoggingOut.current) {
                const data = snapshot.data();
                if (data.isBlocked === true) {
                    isLoggingOut.current = true;
                    if (unsubscribeRef.current) {
                        unsubscribeRef.current();
                        unsubscribeRef.current = null;
                    }
                    signOut(auth).then(() => {
                        dispatch(logout());
                    }).catch(() => {
                        dispatch(logout());
                    });
                }
            }
        });

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };

    }, [isAuthenticated, user?.uid]);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
                {isAuthenticated ? (
                    <Stack.Screen name="Main" component={AppNavigator} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;