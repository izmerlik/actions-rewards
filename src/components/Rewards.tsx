'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, IconButton, TextField, Typography, Paper, Tooltip } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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

  const handleRepeatReward = async (reward: Reward) => {
    if (!user) return;
    try {
      const rewardRef = doc(db, 'rewards', reward.id);
      await updateDoc(rewardRef, {
        redeemedAt: null,
      });
      setRewards(rewards.map(r =>
        r.id === reward.id
          ? { ...r, redeemedAt: undefined }
          : r
      ));
    } catch (error) {
      console.error('Error repeating reward:', error);
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

  const sortedRewards = [...rewards].sort((a, b) => {
    if (!!a.redeemedAt === !!b.redeemedAt) return 0;
    return a.redeemedAt ? 1 : -1;
  });

  if (loading) {
    return <div className="text-center">Loading rewards...</div>;
  }

  return (
    <div className="space-y-4">
      <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 600 }} className="hidden md:block">
        Rewards
      </Typography>
      <Paper sx={{ p: 2, backgroundColor: '#ECEFF7', borderRadius: 2, boxShadow: 'none' }}>
        <form onSubmit={handleAddReward} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <TextField
            label="Reward title"
            value={newRewardTitle}
            onChange={(e) => setNewRewardTitle(e.target.value)}
            fullWidth
            required
            margin="dense"
            size="small"
            InputLabelProps={{ required: false }}
            sx={{
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4f46e5',
              },
            }}
          />
          <TextField
            label="XP cost"
            type="number"
            value={newRewardXPCost}
            onChange={(e) => setNewRewardXPCost(e.target.value)}
            fullWidth
            required
            margin="dense"
            inputProps={{ min: 1 }}
            size="small"
            InputLabelProps={{ required: false }}
            sx={{
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4f46e5',
              },
            }}
          />
          <Button
            type="submit"
            variant="text"
            color="primary"
            fullWidth
            size="medium"
            sx={{ mt: 0.5, fontSize: '0.9375rem', fontWeight: 600 }}
          >
            Add Reward
          </Button>
        </form>
      </Paper>
      {sortedRewards.map((reward) => (
        <Paper
          key={reward.id}
          elevation={!reward.redeemedAt ? 1 : 0}
          variant={reward.redeemedAt ? 'outlined' : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            backgroundColor: !reward.redeemedAt ? '#fff' : 'transparent',
            borderRadius: 2,
            boxShadow: !reward.redeemedAt ? undefined : 'none',
          }}
        >
          <div>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: reward.redeemedAt ? 'text.secondary' : 'text.primary' }}
            >
              {reward.title}
            </Typography>
            <p className="text-sm text-gray-500">{reward.xpCost} XP</p>
          </div>
          <div className="flex space-x-2">
            {reward.redeemedAt ? (
              <Tooltip title="Repeat">
                <IconButton
                  onClick={() => handleRepeatReward(reward)}
                  color="default"
                  aria-label="repeat"
                  sx={{ ml: 1 }}
                >
                  <ReplayIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleRedeemReward(reward)}
                sx={{ ml: 2 }}
              >
                Redeem
              </Button>
            )}
            <Tooltip title="Delete">
              <IconButton
                onClick={() => handleDeleteReward(reward.id)}
                color="default"
                sx={{ ml: 1 }}
                aria-label="delete"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </div>
        </Paper>
      ))}
    </div>
  );
}