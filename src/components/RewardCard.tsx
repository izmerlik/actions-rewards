import { Box, IconButton, Menu, MenuButton, MenuList, MenuItem, Text, Tooltip, Input } from '@chakra-ui/react';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import React, { useRef, useEffect, useState } from 'react';
import { FiMoreVertical, FiX, FiSave } from 'react-icons/fi';
import { MdReplay, MdStarOutline } from 'react-icons/md';
import ItemCard from './ItemCard';

import { Reward } from '@/types';

interface RewardCardProps {
  reward: Reward;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  handleDeleteReward: (id: string) => void;
  handleRedeemReward: (reward: Reward) => void;
  handleRepeatReward: (reward: Reward) => void;
  handleEditReward: (id: string, title: string, xpCost: number) => void;
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
  isRedeemed?: boolean;
  userXP: number;
  onEdit?: (reward: Reward) => void;
}

const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  menuOpenId,
  setMenuOpenId,
  handleDeleteReward,
  handleRedeemReward,
  handleRepeatReward,
  handleEditReward,
  provided,
  snapshot,
  isRedeemed = false,
  userXP,
  onEdit,
}) => {
  const [isMultiLine, setIsMultiLine] = useState(false);
  const nameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (nameRef.current) {
      const lineHeight = parseInt(getComputedStyle(nameRef.current).lineHeight);
      const height = nameRef.current.scrollHeight;
      const isSingleLine = height <= lineHeight + 2;
      setIsMultiLine(!isSingleLine);
    }
  }, [reward.title]);

  const notEnoughXP = !isRedeemed && userXP < reward.xpCost;

  return (
    <ItemCard
      id={reward.id}
      title={reward.title}
      xp={reward.xpCost}
      menuOpenId={menuOpenId}
      setMenuOpenId={setMenuOpenId}
      onDelete={handleDeleteReward}
      onEdit={onEdit ? () => onEdit(reward) : undefined}
      isInactive={isRedeemed}
      provided={provided}
      snapshot={snapshot}
    >
      {isRedeemed ? (
        <IconButton
          aria-label="Repeat"
          icon={<MdReplay size={20} color="black" />}
          variant="outline"
          borderColor="gray.200"
          onClick={() => handleRepeatReward(reward)}
          sx={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', borderRadius: '8px' }}
          flexShrink={0}
          flex="none"
        />
      ) : (
        <Tooltip label={notEnoughXP ? 'Not enough XP' : ''} isDisabled={!notEnoughXP} placement="top">
          <Box pointerEvents={notEnoughXP ? 'none' : 'auto'} sx={{ display: 'flex' }}>
            <IconButton
              aria-label="Redeem"
              icon={<MdStarOutline size={24} color="black" />}
              variant="outline"
              borderColor="gray.200"
              onClick={() => !notEnoughXP && handleRedeemReward(reward)}
              sx={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', borderRadius: '8px' }}
              flexShrink={0}
              flex="none"
            />
          </Box>
        </Tooltip>
      )}
    </ItemCard>
  );
};

export default RewardCard; 