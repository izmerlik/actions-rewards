'use client';

import { Box, Button, Input, Heading, Icon, Stack, Text, Spinner, Skeleton, VStack, SkeletonCircle } from '@chakra-ui/react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useState, useEffect, useCallback } from 'react';
import { FiPlus } from 'react-icons/fi';
import { DropResult } from '@hello-pangea/dnd';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { Action } from '@/types';
import { useActions } from '@/hooks/useActions';

import ActionCard from './ActionCard';
import AddItemForm from './AddItemForm';
import ItemList from './ItemList';
import ShimmerCard from './ShimmerCard';

export default function Actions() {
  const { user, updateUserXP } = useAuth();
  const { items: actions, loading, addItem, updateItem, deleteItem } = useActions();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [pendingAdd, setPendingAdd] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingRepeatId, setPendingRepeatId] = useState<string | null>(null);

  const handleAddAction = async (title: string, xp: number) => {
    if (!user) return;
    setPendingAdd(true);
    const now = new Date();
    await addItem({
      userId: user.id,
      title,
      xp,
      completed: false,
      createdAt: now,
    } as Omit<Action, 'id'>);
    setPendingAdd(false);
  };

  const handleCompleteAction = async (action: Action) => {
    if (!user) return;
    const actionRef = action.id;
    const userRef = doc(db, 'users', user.id);
    const newXP = user.xp + action.xp;
    await updateItem(actionRef, {
      completed: true,
      completedAt: new Date(),
    });
    await updateDoc(userRef, { xp: newXP });
    updateUserXP(newXP);
  };

  const handleRepeatAction = async (action: Action) => {
    if (!user) return;
    setPendingRepeatId(action.id);
    await updateItem(action.id, {
      completed: false,
      completedAt: null,
    });
    setPendingRepeatId(null);
  };

  const handleDeleteAction = async (actionId: string) => {
    setMenuOpenId(null);
    setPendingDeleteId(actionId);
    await deleteItem(actionId);
    setPendingDeleteId(null);
  };

  const handleEditAction = async (id: string, title: string, xp: number) => {
    if (!user) return;
    setPendingEditId(id);
    await updateItem(id, { title, xp });
    setPendingEditId(null);
  };

  const sortedActions = [...actions].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  // Helper to reorder array
  function reorder(list: Action[], startIndex: number, endIndex: number): Action[] {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  // Only reorder active (not completed) cards
  const activeActions = actions
    .filter(a => !a.completed)
    .sort((a, b) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
  const completedActions = actions
    .filter(a => a.completed)
    .sort((a, b) => (b.completedAt?.getTime?.() || 0) - (a.completedAt?.getTime?.() || 0));

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = reorder(activeActions, result.source.index, result.destination.index);
    // Update the actions in the useActions hook
    // This is a placeholder implementation. You might want to implement a more robust way to update the actions in the useActions hook
  }

  function renderActionCard(action: Action, index: number, provided: any, snapshot: any) {
    if (pendingEditId === action.id || pendingDeleteId === action.id) {
      return <ShimmerCard key={action.id} />;
    }
    return (
      <ActionCard
        key={action.id}
        action={action}
        menuOpenId={menuOpenId}
        setMenuOpenId={setMenuOpenId}
        handleDeleteAction={handleDeleteAction}
        handleCompleteAction={handleCompleteAction}
        handleRepeatAction={handleRepeatAction}
        handleEditAction={() => {}}
        provided={provided}
        snapshot={snapshot}
        onEdit={(a) => {
          setEditingAction(a);
          setIsEditFormOpen(true);
        }}
        isCompleted={action.completed}
      />
    );
  }

  return (
    <Box className="space-y-4" pt={6} position="relative">
      <Box>
        <Heading as="h2" size="md" fontWeight={600} color="gray.800" display={{ base: 'none', md: 'block' }} mb={4}>
          Actions
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
          Add New Action
        </Button>
      </Box>

      {(activeActions.length > 0 || loading) && (
        <Box position="relative" mt={4}>
          {loading ? (
            <Box mt={4}>
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
              items={pendingAdd ? [null, ...activeActions] : activeActions}
              droppableId="actions"
              onDragEnd={onDragEnd}
              renderItem={(item, index, provided, snapshot) =>
                item === null ? <ShimmerCard key="shimmer-add" /> : renderActionCard(item, index, provided, snapshot)
              }
              emptyMessage={actions.length === 0 ? "No actions yet. Add your first action!" : undefined}
            />
          )}
        </Box>
      )}

      {completedActions.length > 0 && (
        <Box mt={4}>
          <Stack spacing={3}>
            {completedActions.map((action) =>
              pendingRepeatId === action.id ? (
                <ShimmerCard key={action.id} />
              ) : (
                <ActionCard
                  key={action.id}
                  action={action}
                  menuOpenId={menuOpenId}
                  setMenuOpenId={setMenuOpenId}
                  handleDeleteAction={handleDeleteAction}
                  handleCompleteAction={handleCompleteAction}
                  handleRepeatAction={handleRepeatAction}
                  handleEditAction={() => {}}
                  provided={{} as any}
                  snapshot={{} as any}
                  isCompleted
                  onEdit={(a) => {
                    setEditingAction(a);
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
        onSubmit={handleAddAction}
        title="Add New Action"
        type="action"
      />
      <AddItemForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setEditingAction(null);
        }}
        onSubmit={(title, xp) => {
          if (editingAction) {
            handleEditAction(editingAction.id, title, xp);
            setIsEditFormOpen(false);
            setEditingAction(null);
          }
        }}
        title="Edit Action"
        type="action"
        mode="edit"
        initialTitle={editingAction?.title}
        initialXP={editingAction?.xp}
      />
    </Box>
  );
} 