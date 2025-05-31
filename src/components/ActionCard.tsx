import { IconButton, Tooltip } from '@chakra-ui/react';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import React, { useRef, useEffect, useState } from 'react';
import { MdCheck, MdReplay } from 'react-icons/md';

import { Action } from '@/types';

import ItemCard from './ItemCard';

interface ActionCardProps {
  action: Action;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  handleDeleteAction: (id: string) => void;
  handleCompleteAction: (action: Action) => void;
  handleRepeatAction: (action: Action) => void;
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
  provided,
  snapshot,
  isCompleted = false,
  onEdit,
}) => {
  const nameRef = useRef<HTMLDivElement>(null);

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