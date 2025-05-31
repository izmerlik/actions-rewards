'use client';

import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useState, useEffect, useCallback } from 'react';
import { FiPlus } from 'react-icons/fi';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { Action } from '@/types';

import ActionCard from './ActionCard';
import AddItemForm from './AddItemForm';

export default function Actions() {
  const { user, updateUserXP } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

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

  const handleAddAction = async (title: string, xp: number) => {
    if (!user) return;

    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, 'actions'), {
        userId: user.id,
        title,
        xp,
        completed: false,
        createdAt: now,
      });

      const newAction: Action = {
        id: docRef.id,
        userId: user.id,
        title,
        xp,
        completed: false,
        createdAt: now,
      };

      setActions([newAction, ...actions]);
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
    setMenuOpenId(null);
    try {
      await deleteDoc(doc(db, 'actions', actionId));
      setActions(actions.filter(a => a.id !== actionId));
    } catch (error) {
      console.error('Error deleting action:', error);
    }
  };

  const handleEditAction = async (id: string, title: string, xp: number) => {
    if (!user) return;
    try {
      const actionRef = doc(db, 'actions', id);
      await updateDoc(actionRef, { title, xp });
      setActions(actions.map(a => a.id === id ? { ...a, title, xp } : a));
    } catch (error) {
      console.error('Error editing action:', error);
    }
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
    setActions([
      ...reordered,
      ...completedActions,
    ]);
  }

  if (loading) {
    return null;
  }

  return (
    <Box className="space-y-4" pt={6}>
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

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="actions">
          {(provided) => (
            <Stack spacing={4} mt={4} {...provided.droppableProps} ref={provided.innerRef}>
              {activeActions.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={4}>
                  No actions yet. Add your first action!
                </Text>
              ) : (
                activeActions.map((action, index) => (
                  <Draggable key={action.id} draggableId={action.id} index={index}>
                    {(provided, snapshot) => (
                      <ActionCard
                        action={action}
                        menuOpenId={menuOpenId}
                        setMenuOpenId={setMenuOpenId}
                        handleDeleteAction={handleDeleteAction}
                        handleCompleteAction={handleCompleteAction}
                        handleRepeatAction={handleRepeatAction}
                        handleEditAction={handleEditAction}
                        provided={provided}
                        snapshot={snapshot}
                        onEdit={(a) => {
                          setEditingAction(a);
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

      {completedActions.length > 0 && (
        <Box mt={8}>
          <Stack spacing={3}>
            {completedActions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                menuOpenId={menuOpenId}
                setMenuOpenId={setMenuOpenId}
                handleDeleteAction={handleDeleteAction}
                handleCompleteAction={handleCompleteAction}
                handleRepeatAction={handleRepeatAction}
                handleEditAction={handleEditAction}
                provided={{} as any}
                snapshot={{} as any}
                isCompleted
                onEdit={(a) => {
                  setEditingAction(a);
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