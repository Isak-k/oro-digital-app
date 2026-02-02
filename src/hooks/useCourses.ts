import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Course } from '@/types';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('courseName', 'asc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const coursesList: Course[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];
        setCourses(coursesList);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addCourse = async (courseData: Omit<Course, 'id'>) => {
    try {
      await addDoc(collection(db, 'courses'), courseData);
    } catch (err) {
      console.error('Error adding course:', err);
      throw err;
    }
  };

  const updateCourse = async (id: string, courseData: Partial<Course>) => {
    try {
      const courseRef = doc(db, 'courses', id);
      await updateDoc(courseRef, courseData);
    } catch (err) {
      console.error('Error updating course:', err);
      throw err;
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'courses', id));
    } catch (err) {
      console.error('Error deleting course:', err);
      throw err;
    }
  };

  return {
    courses,
    isLoading,
    error,
    addCourse,
    updateCourse,
    deleteCourse,
  };
};
