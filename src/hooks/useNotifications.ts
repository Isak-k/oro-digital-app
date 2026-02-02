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
import { Notification } from '@/types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Notification[];
      setNotifications(notificationsData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addNotification = async (message: string) => {
    await addDoc(collection(db, 'notifications'), {
      message,
      read: false,
      createdAt: Timestamp.now(),
    });
  };

  const markAsRead = async (id: string) => {
    const docRef = doc(db, 'notifications', id);
    await updateDoc(docRef, { read: true });
  };
  
  const markAllAsRead = async () => {
    // Note: Batch updates would be better here for many docs
    const unread = notifications.filter(n => !n.read);
    unread.forEach(async (n) => {
        if (n.id) await markAsRead(n.id);
    });
  };

  const deleteNotification = async (id: string) => {
    const docRef = doc(db, 'notifications', id);
    await deleteDoc(docRef);
  };

  return {
    notifications,
    isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
