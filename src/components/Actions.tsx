'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Box, Button, Heading, Text, Stack, useDisclosure } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';

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
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingRepeatId, setPendingRepeatId] = useState<string | null>(null);

  const handleAddAction = async (title: string, xp: number) => {
    if (!user) return;
    const now = new Date();
    await addItem({
      userId: user.id,
      title,
      xp,
      completed: false,
      createdAt: now,
    } as Omit<Action, 'id'>);
  };

  const handleCompleteAction = async (actionId: string) => {
    if (!user) return;
    const action = actions.find(a => a.id === actionId);
    if (!action) return;
    const userRef = doc(db, 'users', user.id);
    const newXP = user.xp + action.xp;
    await updateItem(actionId, {
      completed: true,
      completedAt: new Date(),
    });
    await updateDoc(userRef, { xp: newXP });
    updateUserXP(newXP);
  };

  const handleRepeatAction = async (actionId: string) => {
    if (!user) return;
    await updateItem(actionId, {
      completed: false,
      completedAt: null,
    });
  };

  const handleDeleteAction = async (action: Action) => {
    setMenuOpenId(null);
    setPendingDeleteId(action.id);
    await deleteItem(action.id);
    setPendingDeleteId(null);
  };

  const handleEditAction = async (id: string, title: string, xp: number) => {
    if (!user) return;
    setPendingEditId(id);
    await updateItem(id, { title, xp });
    setPendingEditId(null);
  };

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

  return (
    <Box className="space-y-4" pt={6} position="relative">
      <Box>
        <Heading as="h2" size="md" fontWeight={600} color="gray.800" display={{ base: 'none', md: 'block' }} mb={4}>
          Actions
        </Heading>
        <Button
          leftIcon={<FaPlus />}
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
              <ShimmerCard />
            </Box>
          ) : actions.length === 0 ? (
            <Text color="gray.500" textAlign="center" py={4}>
              No actions yet. Add your first action!
            </Text>
          ) : (
            <ItemList
              id="actions-list"
              title="Actions"
              items={activeActions.map(action => ({
                id: action.id,
                title: action.title,
                userId: action.userId,
                xp: action.xp,
                completed: action.completed,
                createdAt: action.createdAt,
                completedAt: action.completedAt
              }))}
              renderItem={(item, index) =>
                pendingEditId === item.id || pendingDeleteId === item.id ? (
                  <ShimmerCard key={item.id} />
                ) : (
                  <ActionCard
                    key={item.id}
                    action={item as unknown as Action}
                    index={index}
                    onDelete={handleDeleteAction}
                    onEdit={(a) => {
                      setEditingAction(a);
                      setIsEditFormOpen(true);
                    }}
                  />
                )
              }
              provided={{} as any}
              snapshot={{} as any}
            />
          )}
        </Box>
      )}

      {completedActions.length > 0 && (
        <Box mt={4}>
          <Stack spacing={3}>
            {completedActions.map((action, index) =>
              pendingRepeatId === action.id ? (
                <ShimmerCard key={action.id} />
              ) : (
                <ActionCard
                  key={action.id}
                  action={action}
                  index={index}
                  onDelete={handleDeleteAction}
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