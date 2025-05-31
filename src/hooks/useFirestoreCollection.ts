import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FirestoreDocument {
  id: string;
  createdAt?: Date;
  completedAt?: Date;
  redeemedAt?: Date;
  [key: string]: unknown;
}

export function useFirestoreCollection<T extends FirestoreDocument>(
  collectionName: string,
  userId?: string,
  extraQuery?: QueryConstraint[]
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      let q = query(collection(db, collectionName));
      if (userId) {
        q = query(collection(db, collectionName), where('userId', '==', userId), ...(extraQuery || []));
      }
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        return {
          id: doc.id,
          ...docData,
          createdAt: docData.createdAt?.toDate?.(),
          completedAt: docData.completedAt?.toDate?.(),
          redeemedAt: docData.redeemedAt?.toDate?.(),
        } as T;
      });
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [collectionName, userId, extraQuery]);

  useEffect(() => {
    if (userId) fetchItems();
  }, [userId, fetchItems]);

  const addItem = async (data: Omit<T, 'id'>) => {
    const docRef = await addDoc(collection(db, collectionName), data as DocumentData);
    await fetchItems();
    return docRef.id;
  };

  const updateItem = async (id: string, data: Partial<T>) => {
    await updateDoc(doc(db, collectionName, id), data as DocumentData);
    await fetchItems();
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, collectionName, id));
    await fetchItems();
  };

  return { items, loading, fetchItems, addItem, updateItem, deleteItem };
} 