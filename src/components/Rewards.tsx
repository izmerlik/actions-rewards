'use client';

import { Box, Button, Input, Heading, Stack, Icon } from '@chakra-ui/react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus } from 'react-icons/fi';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { Reward } from '@/types';
import RewardCard from './RewardCard';

export default function Rewards() {
  const { user, updateUserXP } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [newRewardTitle, setNewRewardTitle] = useState('');
  const [newRewardXPCost, setNewRewardXPCost] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

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
    console.log('Delete pressed for reward:', rewardId);
    setMenuOpenId(null);
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

  // Helper to reorder array
  function reorder(list: Reward[], startIndex: number, endIndex: number): Reward[] {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  // Only reorder active (not redeemed) cards
  const activeRewards = sortedRewards.filter(r => !r.redeemedAt);
  const redeemedRewards = sortedRewards.filter(r => r.redeemedAt);

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = reorder(activeRewards, result.source.index, result.destination.index);
    setRewards([
      ...reordered,
      ...redeemedRewards,
    ]);
  }

  if (loading) {
    return <Box textAlign="center">Loading rewards...</Box>;
  }

  return (
    <Box className="space-y-4">
      <Heading as="h2" size="lg" fontWeight={600} color="gray.800" mb={1} mt={6} display={{ base: 'none', md: 'block' }}>
        Rewards
      </Heading>
      <Box bg="white" p={5} borderRadius="16px" borderWidth={1} borderColor="gray.200" boxShadow="sm" mb={12}>
        <Heading as="h3" size="sm" fontWeight={600} color="gray.800" mb={4}>Add new reward</Heading>
        <form onSubmit={handleAddReward} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Box display={{ base: 'block', md: 'flex' }} gap={2} alignItems="center">
            <Input
              id="reward-title"
              placeholder="Name"
              value={newRewardTitle}
              onChange={(e) => setNewRewardTitle(e.target.value)}
              required
              size="md"
              mb={{ base: 2, md: 0 }}
              fontSize="md"
              borderRadius="8px"
              px={3}
              h="48px"
              _placeholder={{ color: 'gray.400', fontSize: 'md' }}
              flex={2}
            />
            <Input
              id="reward-xp-cost"
              placeholder="XP"
              type="number"
              value={newRewardXPCost}
              onChange={(e) => setNewRewardXPCost(e.target.value)}
              required
              min={1}
              size="md"
              fontSize="md"
              borderRadius="8px"
              px={3}
              h="48px"
              _placeholder={{ color: 'gray.400', fontSize: 'md' }}
              flex={1}
            />
            <Button
              type="submit"
              bg="black"
              color="white"
              borderRadius="8px"
              w="48px"
              h="48px"
              minW="48px"
              minH="48px"
              flex="none"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{ bg: 'gray.800' }}
              _active={{ bg: 'gray.900' }}
              mt={{ base: 2, md: 0 }}
            >
              <Icon as={FiPlus} w={5} h={5} />
            </Button>
          </Box>
        </form>
      </Box>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="rewards-droppable">
          {(provided) => (
            <Stack spacing={3} mt={8} ref={provided.innerRef} {...provided.droppableProps}>
              {activeRewards.map((reward, index) => (
                <Draggable key={reward.id} draggableId={reward.id} index={index}>
                  {(provided, snapshot) => (
                    <RewardCard
                      reward={reward}
                      menuOpenId={menuOpenId}
                      setMenuOpenId={setMenuOpenId}
                      handleDeleteReward={handleDeleteReward}
                      handleRedeemReward={handleRedeemReward}
                      handleRepeatReward={handleRepeatReward}
                      provided={provided}
                      snapshot={snapshot}
                      isRedeemed={false}
                      userXP={user?.xp ?? 0}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {/* Redeemed rewards below, not draggable */}
              {redeemedRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  menuOpenId={menuOpenId}
                  setMenuOpenId={setMenuOpenId}
                  handleDeleteReward={handleDeleteReward}
                  handleRedeemReward={handleRedeemReward}
                  handleRepeatReward={handleRepeatReward}
                  isRedeemed={true}
                  userXP={user?.xp ?? 0}
                />
              ))}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}