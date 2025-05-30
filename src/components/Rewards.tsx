'use client';

import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useState, useEffect, useCallback } from 'react';
import { FiPlus } from 'react-icons/fi';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { Reward } from '@/types';

import AddItemForm from './AddItemForm';
import RewardCard from './RewardCard';

export default function Rewards() {
  const { user, updateUserXP } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

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

  const handleAddReward = async (title: string, xpCost: number) => {
    if (!user) return;

    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'rewards'), {
        userId: user.id,
        title,
        xpCost,
        redeemedAt: null,
        createdAt: now,
      });

      // Prepend new reward to the list
      const newReward: Reward = {
        id: docRef.id,
        userId: user.id,
        title,
        xpCost,
        redeemedAt: undefined,
        createdAt: now,
      };
      setRewards([newReward, ...rewards]);
    } catch (error) {
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
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    setMenuOpenId(null);
    try {
      await deleteDoc(doc(db, 'rewards', rewardId));
      setRewards(rewards.filter(r => r.id !== rewardId));
    } catch (error) {
    }
  };

  const handleEditReward = async (id: string, title: string, xpCost: number) => {
    if (!user) return;
    try {
      const rewardRef = doc(db, 'rewards', id);
      await updateDoc(rewardRef, { title, xpCost });
      setRewards(rewards.map(r => r.id === id ? { ...r, title, xpCost } : r));
    } catch (error) {
    }
  };

  // Only reorder active (not redeemed) cards
  const activeRewards = rewards
    .filter(r => !r.redeemedAt)
    .sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
  const redeemedRewards = rewards
    .filter(r => r.redeemedAt)
    .sort((a, b) => (b.redeemedAt?.getTime?.() || 0) - (a.redeemedAt?.getTime?.() || 0));

  // Helper to reorder array
  function reorder(list: Reward[], startIndex: number, endIndex: number): Reward[] {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = reorder(activeRewards, result.source.index, result.destination.index);
    setRewards([
      ...reordered,
      ...redeemedRewards,
    ]);
  }

  if (loading) {
    return null;
  }

  return (
    <Box className="space-y-4" pt={6}>
      <Box>
        <Heading as="h2" size="md" fontWeight={600} color="gray.800" display={{ base: 'none', md: 'block' }} mb={4}>
          Rewards
        </Heading>
        <Button
          leftIcon={<FiPlus />}
          variant="outline"
          borderColor="gray.200"
          color="black"
          onClick={() => setIsAddFormOpen(true)}
          size="md"
          h="48px"
          borderRadius="12px"
          fontSize="md"
          w="full"
        >
          Add New Reward
        </Button>
      </Box>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="rewards">
          {(provided) => (
            <Stack spacing={4} mt={4} {...provided.droppableProps} ref={provided.innerRef}>
              {activeRewards.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={4}>
                  No rewards yet. Add your first reward!
                </Text>
              ) : (
                activeRewards.map((reward, index) => (
                  <Draggable key={reward.id} draggableId={reward.id} index={index}>
                    {(provided, snapshot) => (
                      <RewardCard
                        reward={reward}
                        menuOpenId={menuOpenId}
                        setMenuOpenId={setMenuOpenId}
                        handleDeleteReward={handleDeleteReward}
                        handleRedeemReward={handleRedeemReward}
                        handleRepeatReward={handleRepeatReward}
                        handleEditReward={handleEditReward}
                        provided={provided}
                        snapshot={snapshot}
                        userXP={user?.xp ?? 0}
                        onEdit={(r) => {
                          setEditingReward(r);
                          setIsEditFormOpen(true);
                        }}
                      />
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>

      {redeemedRewards.length > 0 && (
        <Box mt={8}>
          <Stack spacing={3}>
            {redeemedRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
                handleDeleteReward={handleDeleteReward}
                handleRedeemReward={handleRedeemReward}
                handleRepeatReward={handleRepeatReward}
                handleEditReward={handleEditReward}
                provided={undefined as unknown as DraggableProvided}
                snapshot={undefined as unknown as DraggableStateSnapshot}
                isRedeemed
                userXP={user?.xp ?? 0}
                onEdit={(r) => {
                  setEditingReward(r);
                  setIsEditFormOpen(true);
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      <AddItemForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onSubmit={handleAddReward}
        type="reward"
      />
      <AddItemForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setEditingReward(null);
        }}
        onSubmit={(title, xpCost) => {
          if (editingReward) {
            handleEditReward(editingReward.id, title, xpCost);
            setIsEditFormOpen(false);
            setEditingReward(null);
          }
        }}
        type="reward"
        mode="edit"
        initialTitle={editingReward?.title}
        initialXP={editingReward?.xpCost}
      />
    </Box>
  );
}