import { Box, IconButton, Menu, MenuButton, MenuList, MenuItem, Text, Input } from '@chakra-ui/react';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import React, { useRef, useEffect, useState } from 'react';
import { FiMoreVertical, FiX, FiSave } from 'react-icons/fi';
import { MdCheck, MdReplay } from 'react-icons/md';
import ItemCard from './ItemCard';

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
  onEdit?: (action: Action) => void;
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
    <ItemCard
      id={action.id}
      title={action.title}
      xp={action.xp}
      menuOpenId={menuOpenId}
      setMenuOpenId={setMenuOpenId}
      onDelete={handleDeleteAction}
      onEdit={onEdit ? () => onEdit(action) : undefined}
      isInactive={isCompleted}
      provided={provided}
      snapshot={snapshot}
    >
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
    </ItemCard>
  );
};

export default ActionCard; 