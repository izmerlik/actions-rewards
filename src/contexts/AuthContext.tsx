'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            const userData = userDoc.data();
            
            if (userData) {
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                xp: userData.xp || 0,
              });
            } else {
              const newUser: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                xp: 0,
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
              setUser(newUser);
            }
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('Error in auth state change:', err);
          setError('Failed to load user data');
        } finally {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up auth listener:', err);
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
        email: result.user.email!,
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
          email: result.user.email!,
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
    updateUserXP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};