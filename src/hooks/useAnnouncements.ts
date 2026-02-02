import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Announcement } from '@/types';

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Announcement[];
      setAnnouncements(announcementsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addAnnouncement = async (item: Omit<Announcement, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, 'announcements'), {
      ...item,
      createdAt: Timestamp.now(),
    });
    
    // Add notification
    await addDoc(collection(db, 'notifications'), {
      message: `New announcement: ${item.title}`,
      read: false,
      createdAt: Timestamp.now(),
    });
  };

  const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
    const docRef = doc(db, 'announcements', id);
    await updateDoc(docRef, data);
  };

  const deleteAnnouncement = async (id: string) => {
    const docRef = doc(db, 'announcements', id);
    await deleteDoc(docRef);
  };

  return {
    announcements,
    isLoading,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
};
