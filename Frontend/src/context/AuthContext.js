import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const { user, isAuthenticated } = useSelector(state => state.auth);
    const [firebaseUser, setFirebaseUser] = useState(auth.currentUser);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((fbUser) => {
            setFirebaseUser(fbUser);
        });
        return unsubscribe;
    }, []);

    const mergedUser = firebaseUser
        ? { ...user, uid: firebaseUser.uid, displayName: firebaseUser.displayName }
        : user;

    return (
        <AuthContext.Provider value={{
            user: mergedUser,
            isAuthenticated,
            userProfile: user,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        return { user: null, isAuthenticated: false, userProfile: null };
    }
    return context;
};

export default AuthContext;