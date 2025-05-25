'use client';

import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useState, useEffect, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { Reward } from '@/types';

export default function Rewards() {
  const { user, updateUserXP } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardXPCost, setNewRewardXPCost] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRewards = useCallback(async () => {
    if (!user) return;
    
    const rewardsRef = collection(db, 'rewards');
    const q = query(rewardsRef, where('userId', '==', user.id));
    const querySnapshot = await getDocs(q);
    
    const rewardsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      redeemedAt: doc.data().redeemedAt?.toDate(),
    })) as Reward[];
    
    setRewards(rewardsData);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRewards();
    }
  }, [user, fetchRewards]);

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newRewardTitle || !newRewardXPCost) return;

    const xpCost = parseInt(newRewardXPCost);
    if (isNaN(xpCost) || xpCost <= 0) return;

    try {
      const docRef = await addDoc(collection(db, 'rewards'), {
        userId: user.id,
        title: newRewardTitle,
        xpCost: xpCost,
        createdAt: new Date(),
      });

      const newReward: Reward = {
        id: docRef.id,
        userId: user.id,
        title: newRewardTitle,
        xpCost: xpCost,
        createdAt: new Date(),
      };

      setRewards([...rewards, newReward]);
      setNewRewardTitle('');
      setNewRewardXPCost('');
    } catch (error) {
      console.error('Error adding reward:', error);
    }
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (!user || user.xp < reward.xpCost) return;

    try {
      const rewardRef = doc(db, 'rewards', reward.id);
      const userRef = doc(db, 'users', user.id);
      const newXP = user.xp - reward.xpCost;

      await updateDoc(rewardRef, {
        redeemedAt: new Date(),
      });

      await updateDoc(userRef, {
        xp: newXP,
      });

      updateUserXP(newXP);

      setRewards(rewards.map(r => 
        r.id === reward.id 
          ? { ...r, redeemedAt: new Date() }
          : r
      ));
    } catch (error) {
      console.error('Error redeeming reward:', error);
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    try {
      await deleteDoc(doc(db, 'rewards', rewardId));
      setRewards(rewards.filter(r => r.id !== rewardId));
    } catch (error) {
      console.error('Error deleting reward:', error);
    }
  };

  if (loading) {
    return <div className="text-center">Loading rewards...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddReward} className="space-y-4">
        <div>
          <input
            type="text"
            value={newRewardTitle}
            onChange={(e) => setNewRewardTitle(e.target.value)}
            placeholder="Reward title"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <input
            type="number"
            value={newRewardXPCost}
            onChange={(e) => setNewRewardXPCost(e.target.value)}
            placeholder="XP cost"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
            min="1"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Add Reward
        </button>
      </form>

      <div className="space-y-4">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
          >
            <div>
              <h3 className="font-medium text-gray-900">{reward.title}</h3>
              <p className="text-sm text-gray-500">{reward.xpCost} XP</p>
            </div>
            <div className="flex space-x-2">
              {!reward.redeemedAt && user && user.xp >= reward.xpCost && (
                <button
                  onClick={() => handleRedeemReward(reward)}
                  className="rounded-md bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-500"
                >
                  Redeem
                </button>
              )}
              <button
                onClick={() => handleDeleteReward(reward.id)}
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