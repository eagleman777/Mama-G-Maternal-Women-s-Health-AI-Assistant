import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  query,
} from 'firebase/firestore';
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { SupportedLanguage } from '../types';

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  role: 'mother' | 'postpartum' | 'adolescent' | 'chw';
  preferredLanguage?: SupportedLanguage;
  gestationWeeks?: number;
  lastPeriodDate?: string;
  cycleLength?: number;
  periodDuration?: number;
  cycleAlertEnabled?: boolean;
  cycleNotes?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface ConsultationRecord {
  id: string;
  userId: string;
  title: string;
  content: string;
  severity: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  notes: ConsultationRecord[];
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  saveNote: (title: string, content: string, severity: 'ROUTINE' | 'URGENT' | 'EMERGENCY') => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notes, setNotes] = useState<ConsultationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserProfile(null);
        setNotes([]);
        setLoading(false);
        return;
      }

      // Sync or create user profile in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUserProfile(snap.data() as UserProfile);
        } else {
          // Initialize fresh profile
          const initialProfile: any = {
            userId: currentUser.uid,
            email: currentUser.email || 'user@mama-g.org',
            displayName: currentUser.displayName || 'Mama Care Recipient',
            role: 'mother',
            preferredLanguage: 'English',
            gestationWeeks: 24,
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, initialProfile);
          setUserProfile(initialProfile);
        }
      } catch (err) {
        console.error('Error fetching/creating user profile:', err);
        try {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        } catch {}
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen for user's saved consultation notes in Firestore
  useEffect(() => {
    if (!user) return;
    const notesRef = collection(db, 'users', user.uid, 'notes');
    const q = query(notesRef);

    const unsubscribeNotes = onSnapshot(
      q,
      (snapshot) => {
        const loaded: ConsultationRecord[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as ConsultationRecord);
        });
        setNotes(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/notes`);
      }
    );

    return () => unsubscribeNotes();
  }, [user]);

  const signIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      // Format friendly message
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in window was closed before completing. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setAuthError('Another sign-in attempt was opened.');
      } else {
        setAuthError(err.message || 'Unable to sign in at this moment.');
      }
      throw err;
    }
  };

  const signOut = async () => {
    setAuthError(null);
    try {
      await signOutUser();
      setUser(null);
      setUserProfile(null);
      setNotes([]);
    } catch (err: any) {
      console.error('Sign-out error:', err);
      setAuthError(err.message || 'Sign out failed.');
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const sanitized: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    try {
      await updateDoc(userRef, sanitized);
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const saveNote = async (
    title: string,
    content: string,
    severity: 'ROUTINE' | 'URGENT' | 'EMERGENCY'
  ) => {
    if (!user) return;
    const noteId = `note-${Date.now()}`;
    const noteRef = doc(db, 'users', user.uid, 'notes', noteId);
    const newNote: ConsultationRecord = {
      id: noteId,
      userId: user.uid,
      title: title.slice(0, 200),
      content: content.slice(0, 5000),
      severity,
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(noteRef, newNote);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/notes/${noteId}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        notes,
        signIn,
        signOut,
        updateProfile,
        saveNote,
        authError,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
