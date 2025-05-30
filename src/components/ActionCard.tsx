import { Box, IconButton, Menu, MenuButton, MenuList, MenuItem, Text, Input } from '@chakra-ui/react';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import React, { useRef, useEffect, useState } from 'react';
import { FiMoreVertical, FiX, FiSave } from 'react-icons/fi';
import { MdCheck, MdReplay } from 'react-icons/md';

import { Action } from '@/types';

interface ActionCardProps {
  action: Action;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  handleDeleteAction: (id: string) => void;
  handleCompleteAction: (action: Action) => void;
  handleRepeatAction: (action: Action) => void;
  handleEditAction: (id: string, title: string, xp: number) => void;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  isCompleted?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({
  action,
  menuOpenId,
  setMenuOpenId,
  handleDeleteAction,
  handleCompleteAction,
  handleRepeatAction,
  handleEditAction,
  provided,
  snapshot,
  isCompleted = false,
}) => {
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(action.title);
  const [editXP, setEditXP] = useState(action.xp.toString());
  const nameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (nameRef.current) {
      const lineHeight = parseInt(getComputedStyle(nameRef.current).lineHeight);
      const height = nameRef.current.scrollHeight;
      setIsMultiLine(height > lineHeight + 1);
    }
  }, [action.title]);

  const handleEditClick = () => {
    setIsEditing(true);
    setMenuOpenId(null);
  };

  const handleEditSave = () => {
    if (!editTitle.trim() || isNaN(Number(editXP)) || Number(editXP) <= 0) return;
    handleEditAction(action.id, editTitle.trim(), Number(editXP));
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditTitle(action.title);
    setEditXP(action.xp.toString());
  };

  return (
    <Box
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      bg={isCompleted ? 'transparent' : 'white'}
      borderRadius="16px"
      borderWidth={1}
      borderColor="gray.200"
      boxShadow={isCompleted ? 'none' : snapshot.isDragging ? 'xl' : 'sm'}
      transition="box-shadow 0.2s"
      display="flex"
      alignItems={isMultiLine ? 'flex-start' : 'center'}
      justifyContent="space-between"
      p={5}
      _hover={!isCompleted ? { boxShadow: 'xl', zIndex: 1 } : undefined}
      position="relative"
    >
      {menuOpenId === action.id && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          zIndex={1399}
          bg="transparent"
          onClick={() => setMenuOpenId(null)}
        />
      )}
      {!isEditing && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="24px"
          {...(isMultiLine ? { h: '36px', alignSelf: 'flex-start' } : { alignSelf: 'stretch' })}
        >
          <Menu isOpen={menuOpenId === action.id} onOpen={() => setMenuOpenId(action.id)} onClose={() => setMenuOpenId(null)}>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              variant="unstyled"
              bg="transparent"
              color="gray.400"
              _hover={{ bg: 'transparent', color: 'gray.600' }}
              _active={{ bg: 'transparent' }}
              _focus={{ bg: 'transparent' }}
              sx={{
                width: '24px',
                height: '24px',
                minWidth: '24px',
                minHeight: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'static',
                '& svg': {
                  transition: 'color 0.2s',
                },
                '&:hover svg': {
                  color: '#4A5568',
                },
              }}
              icon={<FiMoreVertical size={24} />}
            />
            <MenuList boxShadow="2xl" borderRadius="16px" zIndex={1400}>
              <MenuItem onClick={() => handleDeleteAction(action.id)} color="red.500">Delete</MenuItem>
              {!isCompleted && <MenuItem onClick={handleEditClick}>Edit</MenuItem>}
            </MenuList>
          </Menu>
        </Box>
      )}
      <Box flex={1} minW={0} display="flex" alignItems={isMultiLine ? 'flex-start' : 'center'} justifyContent="space-between" gap={4} ml={!isEditing ? 4 : 0}>
        <Box minW={0} flex={1} ref={nameRef}>
          {isEditing ? (
            <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gap={2} alignItems={{ base: 'stretch', md: 'center' }} w="100%" justifyContent="space-between">
              <Input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                size="md"
                fontWeight={600}
                color="gray.800"
                borderRadius="8px"
                px={3}
                h="48px"
                fontSize="md"
                _placeholder={{ color: 'gray.400', fontSize: 'md' }}
                flex={2}
                mb={{ base: 2, md: 0 }}
                placeholder="Name"
                autoFocus
              />
              <Input
                value={editXP}
                onChange={e => setEditXP(e.target.value.replace(/[^0-9]/g, ''))}
                size="md"
                fontWeight={600}
                color="gray.800"
                borderRadius="8px"
                px={3}
                h="48px"
                fontSize="md"
                _placeholder={{ color: 'gray.400', fontSize: 'md' }}
                type="number"
                min={1}
                flex={1}
                mb={{ base: 2, md: 0 }}
                placeholder="XP"
              />
              <Box display="flex" gap={0}>
                <IconButton
                  aria-label="Cancel"
                  icon={<FiX size={24} />}
                  size="md"
                  variant="unstyled"
                  onClick={handleEditCancel}
                  borderRadius="8px"
                  h="48px"
                  w="48px"
                  minW="48px"
                  minH="48px"
                  flexShrink={0}
                  color="gray.400"
                  _hover={{ color: 'gray.600', bg: 'transparent' }}
                />
                <IconButton
                  aria-label="Save"
                  icon={<FiSave size={22} color="white" />}
                  size="md"
                  bg="black"
                  color="white"
                  _hover={{ bg: 'gray.800' }}
                  _active={{ bg: 'gray.900' }}
                  borderRadius="8px"
                  h="48px"
                  w="48px"
                  minW="48px"
                  minH="48px"
                  onClick={handleEditSave}
                  flexShrink={0}
                />
              </Box>
            </Box>
          ) : (
            <>
              <Text fontWeight={600} color={isCompleted ? 'gray.400' : 'gray.800'}>
                {action.title}
              </Text>
              <Text fontSize="sm" color={isCompleted ? 'gray.400' : 'gray.500'}>{action.xp} XP</Text>
            </>
          )}
        </Box>
        {isCompleted ? (
          <IconButton
            aria-label="Repeat"
            icon={<MdReplay size={20} color="black" />}
            variant="outline"
            borderColor="gray.200"
            onClick={() => handleRepeatAction(action)}
            sx={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', borderRadius: '8px' }}
            flexShrink={0}
            flex="none"
          />
        ) : (
          !isEditing && (
            <IconButton
              aria-label="Complete"
              icon={<MdCheck size={20} color="black" />}
              variant="outline"
              borderColor="gray.200"
              onClick={() => handleCompleteAction(action)}
              size="md"
              borderRadius="8px"
              sx={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', borderRadius: '8px' }}
              flexShrink={0}
              flex="none"
            />
          )
        )}
      </Box>
    </Box>
  );
};

export default ActionCard; 