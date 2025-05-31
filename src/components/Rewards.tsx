'use client';

import { useCallback, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { DragDropContext, Droppable, DropResult, Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { Box, Button, Card, CardBody, CardHeader, Flex, Heading, Menu, MenuButton, MenuItem, MenuList, Skeleton, SkeletonCircle, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { FaEllipsisV, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { useRewards } from '@/hooks/useRewards';
import { Reward } from '@/types';

import AddItemForm from './AddItemForm';
import ItemList from './ItemList';
import RewardCard from './RewardCard';
import ShimmerCard from './ShimmerCard';

const Rewards = () => {
  const { user } = useAuth();
  const { items: rewards, loading, addItem: addReward, updateItem: updateReward, deleteItem: deleteReward } = useRewards();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward);
    onOpen();
  };

  const handleDeleteReward = async (rewardId: string) => {
    await deleteReward(rewardId);
    setMenuOpenId(null);
  };

  const handleRedeemReward = async (rewardId: string) => {
    const reward = rewards.find((r: Reward) => r.id === rewardId);
    if (!reward) return;
    await updateReward(rewardId, {
      ...reward,
      redeemedAt: new Date(),
    });
  };

  const handleRepeatReward = async (rewardId: string) => {
    const reward = rewards.find((r: Reward) => r.id === rewardId);
    if (!reward) return;
    await updateReward(rewardId, {
      ...reward,
      redeemedAt: null,
    });
  };

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(rewards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order in Firestore
    items.forEach((item, index) => {
      updateDoc(doc(db, 'rewards', item.id), { order: index });
    });
  }, [rewards]);

  const activeRewards = rewards.filter((reward: Reward) => !reward.redeemedAt);
  const redeemedRewards = rewards.filter((reward: Reward) => reward.redeemedAt);

  if (loading) {
    return (
      <Stack spacing={4}>
        <ShimmerCard />
        <ShimmerCard />
        <ShimmerCard />
      </Stack>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Rewards
      </Heading>
      <Button
        leftIcon={<FaPlus />}
        variant="outline"
        borderColor="gray.200"
        onClick={onOpen}
        mb={4}
        width="100%"
      >
        Add New Reward
      </Button>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="active-rewards">
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {activeRewards.map((reward, index) => (
                <Draggable key={reward.id} draggableId={reward.id} index={index}>
                  {(provided, snapshot) => (
                    <RewardCard
                      reward={reward}
                      onEdit={handleEditReward}
                      onDelete={handleDeleteReward}
                      onRedeem={handleRedeemReward}
                      onRepeat={handleRepeatReward}
                      isRedeemed={false}
                      menuOpenId={menuOpenId}
                      setMenuOpenId={setMenuOpenId}
                      handleEditReward={handleEditReward}
                      provided={provided}
                      snapshot={snapshot}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>

        {redeemedRewards.length > 0 && (
          <>
            <Heading size="md" mt={8} mb={4}>
              Redeemed Rewards
            </Heading>
            <Droppable droppableId="redeemed-rewards">
              {(provided) => (
                <Box ref={provided.innerRef} {...provided.droppableProps}>
                  {redeemedRewards.map((reward, index) => (
                    <Draggable key={reward.id} draggableId={reward.id} index={index}>
                      {(provided, snapshot) => (
                        <RewardCard
                          reward={reward}
                          onEdit={handleEditReward}
                          onDelete={handleDeleteReward}
                          onRedeem={handleRedeemReward}
                          onRepeat={handleRepeatReward}
                          isRedeemed={true}
                          menuOpenId={menuOpenId}
                          setMenuOpenId={setMenuOpenId}
                          handleEditReward={handleEditReward}
                          provided={provided}
                          snapshot={snapshot}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </>
        )}
      </DragDropContext>

      <AddItemForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={(title, xpCost) => {
          if (editingReward) {
            updateReward(editingReward.id, { title, xpCost });
          } else {
            if (!user) return;
            addReward({
              userId: user.id,
              title,
              xpCost,
              redeemedAt: null,
              createdAt: new Date(),
            });
          }
        }}
        title={editingReward ? 'Edit Reward' : 'Add New Reward'}
        type="reward"
        mode={editingReward ? 'edit' : 'add'}
        initialTitle={editingReward?.title}
        initialXP={editingReward?.xpCost}
      />
    </Box>
  );
};

export default Rewards;