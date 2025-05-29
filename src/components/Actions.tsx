'use client';

import { Box, Button, Input, Heading, Icon, Stack } from '@chakra-ui/react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useState, useEffect, useCallback } from 'react';
import { FiPlus } from 'react-icons/fi';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { Action } from '@/types';

import ActionCard from './ActionCard';

export default function Actions() {
  const { user, updateUserXP } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionXP, setNewActionXP] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

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
    console.log('Delete pressed for action:', actionId);
    setMenuOpenId(null);
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

  // Helper to reorder array
  function reorder(list: Action[], startIndex: number, endIndex: number): Action[] {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  // Only reorder active (not completed) cards
  const activeActions = sortedActions.filter(a => !a.completed);
  const completedActions = sortedActions.filter(a => a.completed);

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const reordered = reorder(activeActions, result.source.index, result.destination.index);
    setActions([
      ...reordered,
      ...completedActions,
    ]);
  }

  if (loading) {
    return <Box textAlign="center">Loading actions...</Box>;
  }

  return (
    <Box className="space-y-4">
      <Heading as="h2" size="lg" fontWeight={600} color="gray.800" mb={1} mt={6} display={{ base: 'none', md: 'block' }}>
        Actions
      </Heading>
      <Box bg="white" p={5} borderRadius="16px" borderWidth={1} borderColor="gray.200" boxShadow="sm" mb={12}>
        <Heading as="h3" size="sm" fontWeight={600} color="gray.800" mb={4}>Add new action</Heading>
        <form onSubmit={handleAddAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Box display={{ base: 'block', md: 'flex' }} gap={2} alignItems="center">
            <Input
              id="action-title"
              placeholder="Name"
              value={newActionTitle}
              onChange={(e) => setNewActionTitle(e.target.value)}
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
              id="action-xp"
              placeholder="XP"
              type="number"
              value={newActionXP}
              onChange={(e) => setNewActionXP(e.target.value)}
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
        <Droppable droppableId="actions-droppable">
          {(provided) => (
            <Stack spacing={3} mt={8} ref={provided.innerRef} {...provided.droppableProps}>
              {activeActions.map((action) => (
                <Draggable key={action.id} draggableId={action.id} index={activeActions.findIndex(a => a.id === action.id)}>
                  {(provided, snapshot) => (
                    <ActionCard
                      action={action}
                      menuOpenId={menuOpenId}
                      setMenuOpenId={setMenuOpenId}
                      handleDeleteAction={handleDeleteAction}
                      handleCompleteAction={handleCompleteAction}
                      handleRepeatAction={handleRepeatAction}
                      provided={provided}
                      snapshot={snapshot}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {/* Completed actions below, not draggable */}
              {completedActions.map((action) => (
                <Draggable key={action.id} draggableId={action.id} index={completedActions.findIndex(a => a.id === action.id)}>
                  {(provided, snapshot) => (
                    <ActionCard
                      action={action}
                      menuOpenId={menuOpenId}
                      setMenuOpenId={setMenuOpenId}
                      handleDeleteAction={handleDeleteAction}
                      handleCompleteAction={handleCompleteAction}
                      handleRepeatAction={handleRepeatAction}
                      provided={provided}
                      snapshot={snapshot}
                      isCompleted
                    />
                  )}
                </Draggable>
              ))}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
} 