'use client';

import { Box, Button, Input, Heading, Stack, Icon, Text, Spinner, Skeleton, VStack, SkeletonCircle } from '@chakra-ui/react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useState, useEffect, useCallback } from 'react';
import { FiPlus } from 'react-icons/fi';
import { DropResult } from '@hello-pangea/dnd';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { Reward } from '@/types';

import RewardCard from './RewardCard';
import AddItemForm from './AddItemForm';
import ItemList from './ItemList';
import { useRewards } from '@/hooks/useRewards';
import ShimmerCard from './ShimmerCard';

export default function Rewards() {
  const { user, updateUserXP } = useAuth();
  const { items: rewards, loading, addItem, updateItem, deleteItem } = useRewards();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [pendingAdd, setPendingAdd] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingRepeatId, setPendingRepeatId] = useState<string | null>(null);

  const handleAddReward = async (title: string, xpCost: number) => {
    if (!user) return;
    setPendingAdd(true);
    const now = new Date();
    await addItem({
      userId: user.id,
      title,
      xpCost,
      redeemedAt: null,
      createdAt: now,
    } as unknown as Omit<Reward, 'id'>);
    setPendingAdd(false);
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (!user || user.xp < reward.xpCost) return;
    const rewardRef = reward.id;
    const userRef = doc(db, 'users', user.id);
    const newXP = user.xp - reward.xpCost;
    await updateItem(rewardRef, {
      redeemedAt: new Date(),
    });
    await updateDoc(userRef, { xp: newXP });
    updateUserXP(newXP);
  };

  const handleRepeatReward = async (reward: Reward) => {
    if (!user) return;
    setPendingRepeatId(reward.id);
    await updateItem(reward.id, {
      redeemedAt: null,
    });
    setPendingRepeatId(null);
  };

  const handleDeleteReward = async (rewardId: string) => {
    setMenuOpenId(null);
    setPendingDeleteId(rewardId);
    await deleteItem(rewardId);
    setPendingDeleteId(null);
  };

  const handleEditReward = async (id: string, title: string, xpCost: number) => {
    if (!user) return;
    setPendingEditId(id);
    await updateItem(id, { title, xpCost });
    setPendingEditId(null);
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
  const activeRewards = rewards
    .filter(r => !r.redeemedAt)
    .sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
  const redeemedRewards = rewards
    .filter(r => r.redeemedAt)
    .sort((a, b) => (b.redeemedAt?.getTime?.() || 0) - (a.redeemedAt?.getTime?.() || 0));

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = reorder(activeRewards, result.source.index, result.destination.index);
    updateItem(reordered[0].id, {
      ...reordered[0],
      ...reordered.slice(1),
    });
  }

  function renderRewardCard(reward: Reward, index: number, provided: unknown, snapshot: unknown) {
    if (pendingEditId === reward.id || pendingDeleteId === reward.id) {
      return <ShimmerCard key={reward.id} />;
    }
    return (
      <RewardCard
        key={reward.id}
        reward={reward}
        menuOpenId={menuOpenId}
        setMenuOpenId={setMenuOpenId}
        handleDeleteReward={handleDeleteReward}
        handleRedeemReward={handleRedeemReward}
        handleRepeatReward={handleRepeatReward}
        provided={provided as any}
        snapshot={snapshot as any}
        userXP={user?.xp ?? 0}
        isRedeemed={reward.redeemedAt !== undefined}
        onEdit={(r) => {
          setEditingReward(r);
          setIsEditFormOpen(true);
        }}
      />
    );
  }

  console.log('Rendering rewards. Active:', activeRewards.length, 'Redeemed:', redeemedRewards.length);

  return (
    <Box className="space-y-4" pt={6} position="relative">
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

      {(activeRewards.length > 0 || loading) && (
        <Box position="relative" mt={4}>
          {loading ? (
            <Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bg="white"
                borderRadius="16px"
                borderWidth={1}
                borderColor="gray.200"
                p={4}
                h="88px"
              >
                <SkeletonCircle size="6" startColor="gray.200" endColor="gray.300" />
                <Box flex={1} minW={0} ml={4}>
                  <Skeleton height="20px" width="70%" mb={2} borderRadius="6px" startColor="gray.200" endColor="gray.300" />
                  <Skeleton height="16px" width="40%" borderRadius="6px" startColor="gray.200" endColor="gray.300" />
                </Box>
                <Skeleton height="48px" width="48px" borderRadius="8px" ml={4} startColor="gray.200" endColor="gray.300" />
              </Box>
            </Box>
          ) : (
            <ItemList
              items={pendingAdd ? [null, ...activeRewards] : activeRewards}
              droppableId="rewards"
              onDragEnd={onDragEnd}
              renderItem={(item, index, provided, snapshot) =>
                item === null ? <ShimmerCard key="shimmer-add" /> : renderRewardCard(item, index, provided, snapshot)
              }
              emptyMessage={rewards.length === 0 ? "No rewards yet. Add your first reward!" : undefined}
            />
          )}
        </Box>
      )}

      {redeemedRewards.length > 0 && (
        <Box mt={4}>
          <Stack spacing={3}>
            {redeemedRewards.map((reward) =>
              pendingRepeatId === reward.id ? (
                <ShimmerCard key={reward.id} />
              ) : (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  menuOpenId={menuOpenId}
                  setMenuOpenId={setMenuOpenId}
                  handleDeleteReward={handleDeleteReward}
                  handleRedeemReward={handleRedeemReward}
                  handleRepeatReward={handleRepeatReward}
                  provided={{} as any}
                  snapshot={{} as any}
                  isRedeemed
                  userXP={user?.xp ?? 0}
                  onEdit={(r) => {
                    setEditingReward(r);
                    setIsEditFormOpen(true);
                  }}
                />
              )
            )}
          </Stack>
        </Box>
      )}

      <AddItemForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onSubmit={handleAddReward}
        title="Add New Reward"
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
        title="Edit Reward"
        type="reward"
        mode="edit"
        initialTitle={editingReward?.title}
        initialXP={editingReward?.xpCost}
      />
    </Box>
  );
}