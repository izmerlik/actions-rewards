import { useRef, useEffect, useState } from 'react';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { Box, Button, Card, CardBody, CardHeader, Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Text, useDisclosure, Tooltip } from '@chakra-ui/react';
import { FaEllipsisV, FaEdit, FaTrash, FaCheck, FaRedo, FaStar } from 'react-icons/fa';

import { Reward } from '@/types';
import AddItemForm from './AddItemForm';
import ItemCard from './ItemCard';

interface RewardCardProps {
  reward: Reward;
  onEdit: (reward: Reward) => void;
  onDelete: (rewardId: string) => Promise<void>;
  onRedeem: (rewardId: string) => Promise<void>;
  onRepeat: (rewardId: string) => Promise<void>;
  isRedeemed: boolean;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  handleEditReward: (reward: Reward) => void;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}

const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  onEdit,
  onDelete,
  onRedeem,
  onRepeat,
  isRedeemed,
  menuOpenId,
  setMenuOpenId,
  handleEditReward,
  provided,
  snapshot,
}) => {
  const nameRef = useRef<HTMLDivElement>(null);

  return (
    <Card
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      opacity={isRedeemed ? 0.5 : 1}
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
            {reward.title}
          </Text>
          <Menu isOpen={menuOpenId === reward.id} onClose={() => setMenuOpenId(null)}>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(reward.id);
              }}
            />
            <MenuList>
              <MenuItem icon={<FaEdit />} onClick={() => handleEditReward(reward)}>
                Edit
              </MenuItem>
              <MenuItem icon={<FaTrash />} onClick={() => onDelete(reward.id)}>
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </CardHeader>
      <CardBody p={4} pt={0}>
        <Flex justify="space-between" align="center">
          <Tooltip label={`${reward.xpCost} XP`} placement="top">
            <Box>
              <FaStar color="gold" />
              <Text as="span" ml={2}>
                {reward.xpCost}
              </Text>
            </Box>
          </Tooltip>
          <Flex gap={2}>
            <Tooltip label="Repeat" placement="top">
              <IconButton
                aria-label="Repeat"
                icon={<FaRedo size={20} color="black" />}
                variant="outline"
                borderColor="gray.200"
                onClick={() => onRepeat(reward.id)}
                sx={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', borderRadius: '8px' }}
                flexShrink={0}
              />
            </Tooltip>
            <Tooltip label="Redeem" placement="top">
              <IconButton
                aria-label="Redeem"
                icon={<FaCheck size={20} color="black" />}
                variant="outline"
                borderColor="gray.200"
                onClick={() => onRedeem(reward.id)}
                size="md"
                borderRadius="8px"
              />
            </Tooltip>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default RewardCard; 