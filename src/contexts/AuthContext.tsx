import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface Admin {
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const adminDocRef = doc(db, 'admins', firebaseUser.uid);
        const adminDoc = await getDoc(adminDocRef);
        if (adminDoc.exists()) {
          setAdmin(adminDoc.data() as Admin);
        } else if (firebaseUser.email === 'abdi@gmail.com') {
          await setDoc(adminDocRef, {
            name: firebaseUser.displayName || 'Abdi',
            email: firebaseUser.email,
            role: 'admin',
            createdAt: serverTimestamp(),
          });
          setAdmin({
            name: firebaseUser.displayName || 'Abdi',
            email: firebaseUser.email || '',
            role: 'admin',
            createdAt: new Date(),
          });
        } else {
          setAdmin(null);
          await firebaseSignOut(auth);
        }
      } else {
        setAdmin(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const adminDocRef = doc(db, 'admins', userCredential.user.uid);
      const adminDoc = await getDoc(adminDocRef);
      if (!adminDoc.exists()) {
        if (userCredential.user.email === 'abdi@gmail.com') {
          await setDoc(adminDocRef, {
            name: userCredential.user.displayName || 'Abdi',
            email: userCredential.user.email,
            role: 'admin',
            createdAt: serverTimestamp(),
          });
          setAdmin({
            name: userCredential.user.displayName || 'Abdi',
            email: userCredential.user.email || '',
            role: 'admin',
            createdAt: new Date(),
          });
        } else {
          await firebaseSignOut(auth);
          throw new Error('Access denied. You are not authorized as an admin.');
        }
      } else {
        setAdmin(adminDoc.data() as Admin);
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setAdmin(null);
  };

  const value = {
    user,
    admin,
    isLoading,
    isAdmin: !!admin,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
