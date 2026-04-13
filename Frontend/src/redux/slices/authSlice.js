import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    verifyBeforeUpdateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

// ─── Register User ───────────────────────────────────────────────
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async(userData, { rejectWithValue }) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: userData.email,
                username: userData.name || userData.email.split('@')[0],
                createdAt: new Date().toISOString(),
                isBlocked: false,
                isActive: true,
                lastSeen: new Date().toISOString(),
            });

            return { uid: user.uid, email: user.email, username: userData.name };
        } catch (error) {
            let errorMsg = 'Registration failed';
            if (error.code === 'auth/email-already-in-use') errorMsg = 'Email already in use';
            else if (error.code === 'auth/weak-password') errorMsg = 'Password should be at least 6 characters';
            else if (error.code === 'auth/invalid-email') errorMsg = 'Invalid email address';
            return rejectWithValue(errorMsg);
        }
    }
);

// ─── Login User ───────────────────────────────────────────────────
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async(credentials, { rejectWithValue, dispatch }) => {
        try {
            console.log('🔐 [LOGIN] Attempting login for:', credentials.email);

            const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
            const user = userCredential.user;
            console.log('✅ [LOGIN] Firebase Auth success, UID:', user.uid);

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().isBlocked === true) {
                await signOut(auth);
                await new Promise(resolve => setTimeout(resolve, 1200));
                return rejectWithValue('Your account has been blocked. Please contact support.');
            }

            const result = {
                uid: user.uid,
                email: user.email,
                username: user.email.split('@')[0],
            };

            dispatch(fetchProfile());

            return result;
        } catch (error) {
            let errorMsg = 'Login failed';
            if (error.code === 'auth/user-not-found') errorMsg = 'No account found with this email';
            else if (error.code === 'auth/wrong-password') errorMsg = 'Incorrect password';
            else if (error.code === 'auth/invalid-email') errorMsg = 'Invalid email address';
            else if (error.code === 'auth/invalid-credential') errorMsg = 'Invalid email or password';
            return rejectWithValue(errorMsg);
        }
    }
);

// ─── Fetch Profile ────────────────────────────────────────────────
export const fetchProfile = createAsyncThunk(
    'auth/fetchProfile',
    async(_, { getState, rejectWithValue }) => {
        try {
            const uid = auth.currentUser?.uid;
            if (!uid) return rejectWithValue('No user logged in');
            const userDoc = await getDoc(doc(db, 'users', uid));
            const data = userDoc.exists() ? userDoc.data() : {};
            console.log('✅ [FETCH PROFILE] Loaded in background');
            return data;
        } catch (error) {
            return rejectWithValue('Failed to fetch profile');
        }
    }
);

// ─── Update Profile ───────────────────────────────────────────────
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async(profileData, { getState, rejectWithValue }) => {
        try {
            const { user } = getState().auth;
            const currentUser = auth.currentUser;

            if (!currentUser) return rejectWithValue('No user logged in');

            if (profileData.email !== user.email || profileData.password) {
                const currentPassword = profileData.currentPassword;
                if (!currentPassword) return rejectWithValue('Please enter your current password to update email or password');
                const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
                await reauthenticateWithCredential(currentUser, credential);
            }

            if (profileData.email && profileData.email !== currentUser.email) {
                await verifyBeforeUpdateEmail(currentUser, profileData.email);
            }

            if (profileData.password) {
                await updatePassword(currentUser, profileData.password);
            }

            const firestoreData = {
                username: profileData.username,
                ...(profileData.password ? {} : { email: profileData.email }),
            };
            await updateDoc(doc(db, 'users', user.uid), firestoreData);

            return {...user, username: profileData.username, email: profileData.email };
        } catch (error) {
            let errorMsg = 'Update failed';
            if (error.code === 'auth/wrong-password') errorMsg = 'Current password is incorrect';
            else if (error.code === 'auth/email-already-in-use') errorMsg = 'Email already in use';
            else if (error.code === 'auth/requires-recent-login') errorMsg = 'Please logout and login again before updating';
            else if (error.message) errorMsg = error.message;
            return rejectWithValue(errorMsg);
        }
    }
);

// ─── Logout ───────────────────────────────────────────────────────
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async(_, { rejectWithValue }) => {
        try {
            await signOut(auth);
        } catch (error) {
            return rejectWithValue('Logout failed');
        }
    }
);

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                console.log('✅ [REDUX] Login fulfilled → isAuthenticated = true');
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                if (state.user && action.payload) {
                    const { isBlocked, isActive, ...safeData } = action.payload;
                    state.user = {...state.user, ...safeData };
                }
            })
            .addCase(updateProfile.fulfilled, (state, action) => { state.user = action.payload; })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;