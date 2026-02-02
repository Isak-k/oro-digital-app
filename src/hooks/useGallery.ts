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
import { GalleryItem } from '@/types';

export const useGallery = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const galleryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as GalleryItem[];
      setGallery(galleryData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addImage = async (item: Omit<GalleryItem, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, 'gallery'), {
      ...item,
      createdAt: Timestamp.now(),
    });
  };

  const updateImage = async (id: string, data: Partial<GalleryItem>) => {
    const docRef = doc(db, 'gallery', id);
    await updateDoc(docRef, data);
  };

  const deleteImage = async (id: string) => {
    const docRef = doc(db, 'gallery', id);
    await deleteDoc(docRef);
  };

  return {
    gallery,
    isLoading,
    addImage,
    updateImage,
    deleteImage,
  };
};
