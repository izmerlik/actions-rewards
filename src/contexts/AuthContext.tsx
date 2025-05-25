'use client';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createContext, useContext, useState, useEffect } from 'react';

import { auth, db } from '@/lib/firebase';
import { AuthContextType, User } from '@/types';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth listener');
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        console.log('AuthProvider: Auth state changed', { firebaseUser });
        try {
          if (firebaseUser) {
            console.log('AuthProvider: User is signed in', { uid: firebaseUser.uid });
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            const userData = userDoc.data();
            
            if (userData) {
              console.log('AuthProvider: Found existing user data', userData);
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email ?? '',
                xp: userData.xp || 0,
              });
            } else {
              console.log('AuthProvider: Creating new user data');
              const newUser: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email ?? '',
                xp: 0,
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
              setUser(newUser);
            }
          } else {
            console.log('AuthProvider: No user is signed in');
            setUser(null);
          }
        } catch (err) {
          console.error('AuthProvider: Error in auth state change:', err);
          setError('Failed to load user data');
        } finally {
          console.log('AuthProvider: Setting loading to false');
          setLoading(false);
        }
      });

      return () => {
        console.log('AuthProvider: Cleaning up auth listener');
        unsubscribe();
      };
    } catch (err) {
      console.error('AuthProvider: Error setting up auth listener:', err);
      setError('Failed to initialize authentication');
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in');
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = {
        id: result.user.uid,
        email: result.user.email ?? '',
        xp: 0,
      };
      await setDoc(doc(db, 'users', result.user.uid), newUser);
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Failed to sign up');
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
      throw err;
    }
  };

  const googleSignIn = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        const newUser: User = {
          id: result.user.uid,
          email: result.user.email ?? '',
          xp: 0,
        };
        await setDoc(doc(db, 'users', result.user.uid), newUser);
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('Failed to sign in with Google');
      throw err;
    }
  };

  const guestSignIn = async () => {
    try {
      setError(null);
      console.log('Starting guest sign in...');
      
      const result = await signInAnonymously(auth);
      console.log('Anonymous sign in successful:', result.user.uid);
      
      const newUser: User = {
        id: result.user.uid,
        email: 'guest@example.com',
        xp: 0,
        isGuest: true,
      };
      
      console.log('Creating guest user document...');
      await setDoc(doc(db, 'users', result.user.uid), newUser);
      console.log('Guest user document created successfully');
      
    } catch (err) {
      console.error('Guest sign in error:', err);
      if (err instanceof Error) {
        setError(`Failed to sign in as guest: ${err.message}`);
      } else {
        setError('Failed to sign in as guest');
      }
      throw err;
    }
  };

  const updateUserXP = (newXP: number) => {
    if (user) {
      setUser({ ...user, xp: newXP });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    googleSignIn,
    guestSignIn,
    updateUserXP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};