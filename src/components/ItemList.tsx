import { Droppable, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import { Box, Text } from '@chakra-ui/react';

interface Item {
  id: string;
  title: string;
  [key: string]: unknown;
}

interface ItemListProps {
  id: string;
  title: string;
  items: Item[];
  renderItem: (item: Item, index: number) => React.ReactNode;
  provided: DroppableProvided;
  snapshot: DroppableStateSnapshot;
}

const ItemList: React.FC<ItemListProps> = ({
  id,
  title,
  items,
  renderItem,
  provided,
  snapshot,
}) => {
  return (
    <Box
      ref={provided.innerRef}
      {...provided.droppableProps}
      bg={snapshot.isDraggingOver ? 'gray.50' : 'transparent'}
      borderRadius="8px"
      p={2}
    >
      {items.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={4}>
          No {title.toLowerCase()} yet
        </Text>
      ) : (
        items.map((item, index) => renderItem(item, index))
      )}
      {provided.placeholder}
    </Box>
  );
};

export default ItemList; 