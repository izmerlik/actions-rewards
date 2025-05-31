import { Box, Button, Card, CardBody, CardHeader, Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Text, useDisclosure } from '@chakra-ui/react';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { useRef } from 'react';
import { FaEllipsisV, FaEdit, FaTrash, FaCheck, FaRedo } from 'react-icons/fa';

import { Action } from '@/types';
import AddItemForm from './AddItemForm';
import ItemCard from './ItemCard';

interface ActionCardProps {
  action: Action;
  onEdit: (action: Action) => void;
  onDelete: () => void;
  onComplete: () => void;
  onRepeat: () => void;
  isCompleted: boolean;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  handleEditAction: (action: Action) => void;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}

const ActionCard: React.FC<ActionCardProps> = ({
  action,
  onEdit,
  onDelete,
  onComplete,
  onRepeat,
  isCompleted,
  menuOpenId,
  setMenuOpenId,
  handleEditAction,
  provided,
  snapshot,
}) => {
  const nameRef = useRef<HTMLDivElement>(null);

  return (
    <ItemCard
      id={action.id}
      title={action.title}
      menuOpenId={menuOpenId}
      setMenuOpenId={setMenuOpenId}
      onDelete={onDelete}
      onEdit={onEdit ? () => onEdit(action) : undefined}
      isInactive={isCompleted}
      provided={provided}
      snapshot={snapshot}
    >
      {isCompleted ? (
        <IconButton
          aria-label="Repeat"
          icon={<FaRedo size={20} color="black" />}
          variant="outline"
          borderColor="gray.200"
          onClick={onRepeat}
          sx={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', borderRadius: '8px' }}
          flexShrink={0}
          flex="none"
        />
      ) : (
        <IconButton
          aria-label="Complete"
          icon={<FaCheck size={20} color="black" />}
          variant="outline"
          borderColor="gray.200"
          onClick={onComplete}
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