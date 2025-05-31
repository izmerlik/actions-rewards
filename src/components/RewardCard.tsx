import { Box, IconButton, Menu, MenuButton, MenuList, MenuItem, Text, Tooltip, Input } from '@chakra-ui/react';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import React, { useRef, useEffect, useState } from 'react';
import { FiMoreVertical, FiX, FiSave } from 'react-icons/fi';
import { MdReplay, MdStarOutline } from 'react-icons/md';

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
    <Box
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      bg={isRedeemed ? 'transparent' : 'white'}
      borderRadius="16px"
      borderWidth={1}
      borderColor="gray.200"
      boxShadow={isRedeemed ? 'none' : snapshot?.isDragging ? 'xl' : 'sm'}
      transition="box-shadow 0.2s"
      display="flex"
      alignItems={isMultiLine ? 'flex-start' : 'center'}
      justifyContent="space-between"
      p={4}
      _hover={!isRedeemed ? { boxShadow: 'xl', zIndex: 1 } : undefined}
      position="relative"
    >
      {menuOpenId === reward.id && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          zIndex={1399}
          bg="transparent"
          onClick={() => setMenuOpenId(null)}
        />
      )}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="24px"
        {...(isMultiLine ? { h: '36px', alignSelf: 'flex-start' } : { alignSelf: 'stretch' })}
      >
        <Menu isOpen={menuOpenId === reward.id} onOpen={() => setMenuOpenId(reward.id)} onClose={() => setMenuOpenId(null)}>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            variant="unstyled"
            bg="transparent"
            color="gray.400"
            _hover={{ bg: 'transparent', color: 'gray.600' }}
            _active={{ bg: 'transparent' }}
            _focus={{ bg: 'transparent' }}
            sx={{
              width: '24px',
              height: '24px',
              minWidth: '24px',
              minHeight: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'static',
              '& svg': {
                transition: 'color 0.2s',
              },
              '&:hover svg': {
                color: '#4A5568',
              },
            }}
            icon={<FiMoreVertical size={24} />}
          />
          <MenuList boxShadow="2xl" borderRadius="16px" zIndex={1400}>
            <MenuItem 
              onClick={() => {
                setMenuOpenId(null);
                handleDeleteReward(reward.id);
              }} 
              color="red.500"
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                },
              }}
            >
              Delete
            </MenuItem>
            {!isRedeemed && <MenuItem onClick={() => onEdit && onEdit(reward)}>Edit</MenuItem>}
          </MenuList>
        </Menu>
      </Box>
      <Box flex={1} minW={0} display="flex" alignItems={isMultiLine ? 'flex-start' : 'center'} justifyContent="space-between" gap={4} ml={4}>
        <Box minW={0} flex={1} ref={nameRef}>
          <Text fontWeight={600} color={isRedeemed ? 'gray.400' : 'gray.800'} noOfLines={2}>
            {reward.title}
          </Text>
          <Text fontSize="sm" color={isRedeemed ? 'gray.400' : 'gray.500'}>{reward.xpCost} XP</Text>
        </Box>
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
          !isRedeemed && (
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
          )
        )}
      </Box>
    </Box>
  );
};

export default RewardCard; 