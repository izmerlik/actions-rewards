import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, DocumentData, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFirestoreCollection<T extends { id: string }>(
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
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.(),
        completedAt: doc.data().completedAt?.toDate?.(),
        redeemedAt: doc.data().redeemedAt?.toDate?.(),
      })) as unknown as T[];
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