'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import ReplayIcon from '@mui/icons-material/Replay';

import { Button, IconButton, TextField, Typography, Paper, Tooltip } from '@mui/material';

import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

import { useState, useEffect, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { Action } from '@/types';

export default function Actions() {
  const { user, updateUserXP } = useAuth();
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
      const userRef = doc(db, 'users', user.id);
      const newXP = user.xp + action.xp;

      await updateDoc(actionRef, {
        completed: true,
        completedAt: new Date(),
      });

      await updateDoc(userRef, {
        xp: newXP,
      });

      updateUserXP(newXP);

      setActions(actions.map(a => 
        a.id === action.id 
          ? { ...a, completed: true, completedAt: new Date() }
          : a
      ));
    } catch (error) {
      console.error('Error completing action:', error);
    }
  };

  const handleRepeatAction = async (action: Action) => {
    if (!user) return;
    try {
      const actionRef = doc(db, 'actions', action.id);
      await updateDoc(actionRef, {
        completed: false,
        completedAt: null,
      });
      setActions(actions.map(a =>
        a.id === action.id
          ? { ...a, completed: false, completedAt: undefined }
          : a
      ));
    } catch (error) {
      console.error('Error repeating action:', error);
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

  const sortedActions = [...actions].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  if (loading) {
    return <div className="text-center">Loading actions...</div>;
  }

  return (
    <div className="space-y-4">
      <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 600 }} className="hidden md:block">
        Actions
      </Typography>
      <Paper sx={{ p: 2, backgroundColor: '#ECEFF7', borderRadius: 2, boxShadow: 'none' }}>
        <form onSubmit={handleAddAction} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <TextField
            label="Action title"
            value={newActionTitle}
            onChange={(e) => setNewActionTitle(e.target.value)}
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
            label="XP value"
            type="number"
            value={newActionXP}
            onChange={(e) => setNewActionXP(e.target.value)}
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
            Add Action
          </Button>
        </form>
      </Paper>
      {sortedActions.map((action) => (
        <Paper
          key={action.id}
          elevation={!action.completed ? 1 : 0}
          variant={action.completed ? 'outlined' : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            backgroundColor: !action.completed ? '#fff' : 'transparent',
            borderRadius: 2,
            boxShadow: !action.completed ? undefined : 'none',
          }}
        >
          <div>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: action.completed ? 'text.secondary' : 'text.primary' }}
            >
              {action.title}
            </Typography>
            <p className="text-sm text-gray-500">{action.xp} XP</p>
          </div>
          <div className="flex space-x-2">
            {action.completed ? (
              <Tooltip title="Repeat">
                <IconButton
                  onClick={() => handleRepeatAction(action)}
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
                onClick={() => handleCompleteAction(action)}
                sx={{ ml: 2 }}
              >
                Complete
              </Button>
            )}
            <IconButton
              onClick={() => handleDeleteAction(action.id)}
              color="default"
              sx={{ ml: 1 }}
              aria-label="delete"
            >
              <DeleteIcon />
            </IconButton>
          </div>
        </Paper>
      ))}
    </div>
  );
} 