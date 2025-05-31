import { Box, IconButton, Menu, MenuButton, MenuList, MenuItem, Text } from '@chakra-ui/react';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import React, { useRef, useEffect, useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import { MdCheck, MdReplay } from 'react-icons/md';

import { Action } from '@/types';

interface ActionCardProps {
  action: Action;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  handleDeleteAction: (id: string) => void;
  handleCompleteAction: (action: Action) => void;
  handleRepeatAction: (action: Action) => void;
  handleEditAction: (_id: string, _title: string, _xp: number) => void;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  isCompleted?: boolean;
  onEdit?: (action: Action) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
  action,
  menuOpenId,
  setMenuOpenId,
  handleDeleteAction,
  handleCompleteAction,
  handleRepeatAction,
  handleEditAction: _handleEditAction,
  provided,
  snapshot,
  isCompleted = false,
  onEdit,
}) => {
  const [isMultiLine, setIsMultiLine] = useState(false);
  const nameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (nameRef.current) {
      const lineHeight = parseInt(getComputedStyle(nameRef.current).lineHeight);
      const height = nameRef.current.scrollHeight;
      setIsMultiLine(height > lineHeight + 1);
    }
  }, [action.title]);

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
      p={4}
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
            {!isCompleted && <MenuItem onClick={() => onEdit && onEdit(action)}>Edit</MenuItem>}
          </MenuList>
        </Menu>
      </Box>
      <Box flex={1} minW={0} display="flex" alignItems={isMultiLine ? 'flex-start' : 'center'} justifyContent="space-between" gap={4} ml={4}>
        <Box minW={0} flex={1} ref={nameRef}>
          <Text fontWeight={600} color={isCompleted ? 'gray.400' : 'gray.800'}>
            {action.title}
          </Text>
          <Text fontSize="sm" color={isCompleted ? 'gray.400' : 'gray.500'}>{action.xp} XP</Text>
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
        )}
      </Box>
    </Box>
  );
};

export default ActionCard; 