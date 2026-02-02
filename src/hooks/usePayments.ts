import { useState, useEffect, useMemo } from 'react';
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
import { Payment } from '@/types';

export const usePayments = (filters?: { month?: number; year?: number; studentId?: string }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        let paymentsList: Payment[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Payment[];

        // Apply filters client-side
        if (filters?.month !== undefined) {
          paymentsList = paymentsList.filter(p => p.month === filters.month);
        }
        if (filters?.year !== undefined) {
          paymentsList = paymentsList.filter(p => p.year === filters.year);
        }
        if (filters?.studentId) {
          paymentsList = paymentsList.filter(p => p.studentId === filters.studentId);
        }

        setPayments(paymentsList);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching payments:', err);
        setError('Failed to load payments');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters?.month, filters?.year, filters?.studentId]);

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'payments'), {
        ...paymentData,
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('Error adding payment:', err);
      if (err instanceof Error) {
        throw new Error(`Failed to add payment: ${err.message}`);
      }
      throw new Error('Failed to add payment: Unknown error');
    }
  };

  const updatePayment = async (id: string, paymentData: Partial<Payment>) => {
    try {
      const paymentRef = doc(db, 'payments', id);
      await updateDoc(paymentRef, paymentData);
    } catch (err) {
      console.error('Error updating payment:', err);
      throw err;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'payments', id));
    } catch (err) {
      console.error('Error deleting payment:', err);
      throw err;
    }
  };

  // Reports calculations
  const reports = useMemo(() => {
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const byMonth = payments.reduce((acc, p) => {
      const key = `${p.year}-${p.month}`;
      acc[key] = (acc[key] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>);

    const byYear = payments.reduce((acc, p) => {
      acc[p.year] = (acc[p.year] || 0) + p.amount;
      return acc;
    }, {} as Record<number, number>);

    const byMethod = payments.reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>);

    return { totalAmount, byMonth, byYear, byMethod };
  }, [payments]);

  return {
    payments,
    isLoading,
    error,
    addPayment,
    updatePayment,
    deletePayment,
    reports,
  };
};
