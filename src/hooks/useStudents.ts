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
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Student } from '@/types';

export const useStudents = (options: { enableFetch?: boolean } = { enableFetch: true }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(options.enableFetch);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!options.enableFetch) {
      return;
    }

    const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const studentsList: Student[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Student[];
        setStudents(studentsList);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching students:', err);
        setError('Failed to load students');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [options.enableFetch]);

  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'students'), {
        ...studentData,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (err) {
      console.error('Error adding student:', err);
      throw err;
    }
  };

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    try {
      const studentRef = doc(db, 'students', id);
      await updateDoc(studentRef, studentData);
    } catch (err) {
      console.error('Error updating student:', err);
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (err) {
      console.error('Error deleting student:', err);
      throw err;
    }
  };

  return {
    students,
    isLoading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
  };
};
