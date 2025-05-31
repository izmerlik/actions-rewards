import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { Box, Card, CardBody, CardHeader, Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';

interface ItemCardProps {
  id: string;
  title: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isInactive?: boolean;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  children?: React.ReactNode;
}

const ItemCard: React.FC<ItemCardProps> = ({
  id,
  title,
  onEdit,
  onDelete,
  isInactive,
  menuOpenId,
  setMenuOpenId,
  provided,
  snapshot,
  children,
}) => {
  return (
    <Card
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      opacity={isInactive ? 0.5 : 1}
      mb={4}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="8px"
      boxShadow={snapshot.isDragging ? 'lg' : 'sm'}
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
    >
      <CardHeader p={4}>
        <Flex justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="medium">
            {title}
          </Text>
          <Menu isOpen={menuOpenId === id} onClose={() => setMenuOpenId(null)}>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(id);
              }}
            />
            <MenuList>
              {onEdit && (
                <MenuItem icon={<FaEdit />} onClick={onEdit}>
                  Edit
                </MenuItem>
              )}
              {onDelete && (
                <MenuItem icon={<FaTrash />} onClick={onDelete}>
                  Delete
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </Flex>
      </CardHeader>
      <CardBody p={4} pt={0}>
        {children}
      </CardBody>
    </Card>
  );
};

export default ItemCard; 