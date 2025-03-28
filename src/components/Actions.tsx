'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Action } from '@/types';

export default function Actions() {
  const { user } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionXP, setNewActionXP] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchActions = useCallback(async () => {
    if (!user) return;
    
    const actionsRef = collection(db, 'actions');
    const q = query(actionsRef, where('userId', '==', user.id));
    const querySnapshot = await getDocs(q);
    
    const actionsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
    })) as Action[];
    
    setActions(actionsData);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchActions();
    }
  }, [user, fetchActions]);

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newActionTitle || !newActionXP) return;

    const xp = parseInt(newActionXP);
    if (isNaN(xp) || xp <= 0) return;

    try {
      const docRef = await addDoc(collection(db, 'actions'), {
        userId: user.id,
        title: newActionTitle,
        xp: xp,
        completed: false,
        createdAt: new Date(),
      });

      const newAction: Action = {
        id: docRef.id,
        userId: user.id,
        title: newActionTitle,
        xp: xp,
        completed: false,
        createdAt: new Date(),
      };

      setActions([...actions, newAction]);
      setNewActionTitle('');
      setNewActionXP('');
    } catch (error) {
      console.error('Error adding action:', error);
    }
  };

  const handleCompleteAction = async (action: Action) => {
    if (!user) return;

    try {
      const actionRef = doc(db, 'actions', action.id);
      await updateDoc(actionRef, {
        completed: true,
        completedAt: new Date(),
      });

      setActions(actions.map(a => 
        a.id === action.id 
          ? { ...a, completed: true, completedAt: new Date() }
          : a
      ));
    } catch (error) {
      console.error('Error completing action:', error);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    try {
      await deleteDoc(doc(db, 'actions', actionId));
      setActions(actions.filter(a => a.id !== actionId));
    } catch (error) {
      console.error('Error deleting action:', error);
    }
  };

  if (loading) {
    return <div className="text-center">Loading actions...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddAction} className="space-y-4">
        <div>
          <input
            type="text"
            value={newActionTitle}
            onChange={(e) => setNewActionTitle(e.target.value)}
            placeholder="Action title"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <input
            type="number"
            value={newActionXP}
            onChange={(e) => setNewActionXP(e.target.value)}
            placeholder="XP value"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
            min="1"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Add Action
        </button>
      </form>

      <div className="space-y-4">
        {actions.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
          >
            <div>
              <h3 className="font-medium text-gray-900">{action.title}</h3>
              <p className="text-sm text-gray-500">{action.xp} XP</p>
            </div>
            <div className="flex space-x-2">
              {!action.completed && (
                <button
                  onClick={() => handleCompleteAction(action)}
                  className="rounded-md bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-500"
                >
                  Complete
                </button>
              )}
              <button
                onClick={() => handleDeleteAction(action.id)}
                className="rounded-md bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 