import { IconButton, Tooltip } from '@chakra-ui/react';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import React, { useRef, useEffect, useState } from 'react';
import { MdReplay, MdStarOutline } from 'react-icons/md';

import { Reward } from '@/types';

import ItemCard from './ItemCard';

interface RewardCardProps {
  reward: Reward;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  handleDeleteReward: (id: string) => void;
  handleRedeemReward: (reward: Reward) => void;
  handleRepeatReward: (reward: Reward) => void;
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
  provided,
  snapshot,
  isRedeemed = false,
  userXP,
  onEdit,
}) => {
  const nameRef = useRef<HTMLDivElement>(null);

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
          <div style={{ display: 'flex', pointerEvents: notEnoughXP ? 'none' : 'auto' }}>
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
          </div>
        </Tooltip>
      )}
    </ItemCard>
  );
};

export default RewardCard; 