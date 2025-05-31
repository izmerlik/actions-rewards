import React from 'react';
import { Box, Button, Card, CardBody, CardHeader, Flex, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { Draggable } from '@hello-pangea/dnd';
import { FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';

import { Action } from '@/types';

interface ActionCardProps {
  action: Action;
  index: number;
  onEdit: (action: Action) => void;
  onDelete: (action: Action) => void;
}

export default function ActionCard({ action, index, onEdit, onDelete }: ActionCardProps) {
  const handleEditAction = (action: Action) => {
    onEdit(action);
  };

  const handleDeleteAction = (action: Action) => {
    onDelete(action);
  };

  return (
    <Draggable draggableId={action.id} index={index}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          mb={4}
          borderWidth={1}
          borderColor="gray.200"
          borderRadius="lg"
          overflow="hidden"
          bg="white"
          _hover={{ borderColor: 'gray.300' }}
        >
          <CardHeader p={4} pb={2}>
            <Flex justify="space-between" align="center">
              <Text fontSize="md" fontWeight={600} color="gray.800">
                {action.title}
              </Text>
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  size="sm"
                  p={1}
                  _hover={{ bg: 'gray.100' }}
                >
                  <FaEllipsisV />
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<FaEdit />} onClick={() => handleEditAction(action)}>
                    Edit
                  </MenuItem>
                  <MenuItem icon={<FaTrash />} onClick={() => handleDeleteAction(action)}>
                    Delete
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          </CardHeader>
          <CardBody p={4} pt={2}>
            <Text color="gray.600" fontSize="sm">
              {action.xp} XP
            </Text>
          </CardBody>
        </Card>
      )}
    </Draggable>
  );
} 