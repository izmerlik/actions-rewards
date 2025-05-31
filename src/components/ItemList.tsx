import { Stack, Text } from '@chakra-ui/react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import React from 'react';

interface ItemListProps<T> {
  items: T[];
  droppableId: string;
  onDragEnd: (result: DropResult) => void;
  renderItem: (item: T, index: number, provided: any, snapshot: any) => React.ReactNode;
  emptyMessage?: string;
}

function ItemList<T>({ items, droppableId, onDragEnd, renderItem, emptyMessage }: ItemListProps<T>) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <Stack spacing={4} {...provided.droppableProps} ref={provided.innerRef}>
            {items.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                {emptyMessage}
              </Text>
            ) : (
              items.map((item, index) => (
                <Draggable key={(item as any).id} draggableId={(item as any).id} index={index}>
                  {(provided, snapshot) => renderItem(item, index, provided, snapshot)}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default ItemList; 