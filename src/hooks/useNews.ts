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
import { News } from '@/types';

export const useNews = () => {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        try {
          const newsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          })) as News[];
          setNews(newsData);
          setError(null);
        } catch (err) {
          console.error('Error processing news data:', err);
          setError('Failed to load news data');
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching news:', err);
        setError('Failed to fetch news. Please check your permissions.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addNews = async (newsItem: Omit<News, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      
      // Validate required fields
      if (!newsItem.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!newsItem.content?.trim()) {
        throw new Error('Content is required');
      }

      const docData = {
        title: newsItem.title.trim(),
        content: newsItem.content.trim(),
        ...(newsItem.imageUrl && { imageUrl: newsItem.imageUrl.trim() }),
        createdAt: Timestamp.now(),
      };

      console.log('Adding news with data:', docData);
      
      await addDoc(collection(db, 'news'), docData);
      
      // Add notification
      await addDoc(collection(db, 'notifications'), {
        message: `New news posted: ${docData.title}`,
        read: false,
        createdAt: Timestamp.now(),
      });

      console.log('News added successfully');
    } catch (err: any) {
      console.error('Error adding news:', err);
      
      // Provide specific error messages
      if (err.code === 'permission-denied') {
        throw new Error('Permission denied. Please ensure you are logged in as an admin.');
      } else if (err.code === 'unauthenticated') {
        throw new Error('Authentication required. Please log in again.');
      } else if (err.message) {
        throw new Error(err.message);
      } else {
        throw new Error('Failed to add news. Please try again.');
      }
    }
  };

  const updateNews = async (id: string, data: Partial<News>) => {
    try {
      setError(null);
      
      if (!id) {
        throw new Error('News ID is required');
      }

      // Clean up the data
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title.trim();
      if (data.content !== undefined) updateData.content = data.content.trim();
      if (data.imageUrl !== undefined) {
        if (data.imageUrl.trim()) {
          updateData.imageUrl = data.imageUrl.trim();
        } else {
          updateData.imageUrl = null; // Remove empty image URL
        }
      }

      console.log('Updating news with data:', updateData);
      
      const docRef = doc(db, 'news', id);
      await updateDoc(docRef, updateData);
      console.log('News updated successfully');
    } catch (err: any) {
      console.error('Error updating news:', err);
      
      if (err.code === 'permission-denied') {
        throw new Error('Permission denied. Please ensure you are logged in as an admin.');
      } else if (err.code === 'not-found') {
        throw new Error('News item not found.');
      } else if (err.message) {
        throw new Error(err.message);
      } else {
        throw new Error('Failed to update news. Please try again.');
      }
    }
  };

  const deleteNews = async (id: string) => {
    try {
      setError(null);
      
      if (!id) {
        throw new Error('News ID is required');
      }

      console.log('Deleting news with ID:', id);
      
      const docRef = doc(db, 'news', id);
      await deleteDoc(docRef);
      console.log('News deleted successfully');
    } catch (err: any) {
      console.error('Error deleting news:', err);
      
      if (err.code === 'permission-denied') {
        throw new Error('Permission denied. Please ensure you are logged in as an admin.');
      } else if (err.code === 'not-found') {
        throw new Error('News item not found.');
      } else if (err.message) {
        throw new Error(err.message);
      } else {
        throw new Error('Failed to delete news. Please try again.');
      }
    }
  };

  return {
    news,
    isLoading,
    error,
    addNews,
    updateNews,
    deleteNews,
  };
};
