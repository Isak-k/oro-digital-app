import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Registration } from '@/types';

export const useRegistrations = (
  filters?: { month?: number; year?: number; studentId?: string; courseId?: string },
  options: { enableFetch?: boolean } = { enableFetch: true }
) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(options.enableFetch);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!options.enableFetch) {
      return;
    }

    let q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        let registrationsList: Registration[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Registration[];

        // Apply filters client-side for flexibility
        if (filters?.month !== undefined) {
          registrationsList = registrationsList.filter(r => r.month === filters.month);
        }
        if (filters?.year !== undefined) {
          registrationsList = registrationsList.filter(r => r.year === filters.year);
        }
        if (filters?.studentId) {
          registrationsList = registrationsList.filter(r => r.studentId === filters.studentId);
        }
        if (filters?.courseId) {
          registrationsList = registrationsList.filter(r => r.courseId === filters.courseId);
        }

        setRegistrations(registrationsList);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching registrations:', err);
        setError('Failed to load registrations');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters?.month, filters?.year, filters?.studentId, filters?.courseId, options.enableFetch]);

  const addRegistration = async (registrationData: Omit<Registration, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'registrations'), {
        ...registrationData,
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('Error adding registration:', err);
      throw err;
    }
  };

  const updateRegistration = async (id: string, registrationData: Partial<Registration>) => {
    try {
      const registrationRef = doc(db, 'registrations', id);
      await updateDoc(registrationRef, registrationData);
    } catch (err) {
      console.error('Error updating registration:', err);
      throw err;
    }
  };

  const deleteRegistration = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'registrations', id));
    } catch (err) {
      console.error('Error deleting registration:', err);
      throw err;
    }
  };

  return {
    registrations,
    isLoading,
    error,
    addRegistration,
    updateRegistration,
    deleteRegistration,
  };
};
