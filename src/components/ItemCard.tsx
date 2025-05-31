import { Box, IconButton, Menu, MenuButton, MenuList, MenuItem, Text } from '@chakra-ui/react';
import { ReactNode, useRef, useEffect, useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';

interface ItemCardProps {
  id: string;
  title: string;
  xp: number;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  onDelete: (id: string) => void;
  onEdit?: () => void;
  isInactive?: boolean;
  provided?: any;
  snapshot?: any;
  children?: ReactNode;
}

const ItemCard: React.FC<ItemCardProps> = ({
  id,
  title,
  xp,
  menuOpenId,
  setMenuOpenId,
  onDelete,
  onEdit,
  isInactive = false,
  provided,
  snapshot,
  children,
}) => {
  const [isMultiLine, setIsMultiLine] = useState(false);
  const nameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (nameRef.current) {
      const lineHeight = parseInt(getComputedStyle(nameRef.current).lineHeight);
      const height = nameRef.current.scrollHeight;
      setIsMultiLine(height > lineHeight + 1);
    }
  }, [title]);

  return (
    <Box
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      {...(provided?.dragHandleProps || {})}
      bg={isInactive ? 'transparent' : 'white'}
      borderRadius="16px"
      borderWidth={1}
      borderColor="gray.200"
      boxShadow={isInactive ? 'none' : snapshot?.isDragging ? 'xl' : 'sm'}
      transition="box-shadow 0.2s"
      display="flex"
      alignItems={isMultiLine ? 'flex-start' : 'center'}
      justifyContent="space-between"
      p={4}
      _hover={!isInactive ? { boxShadow: 'xl', zIndex: 1 } : undefined}
      position="relative"
    >
      {menuOpenId === id && (
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
        <Menu isOpen={menuOpenId === id} onOpen={() => setMenuOpenId(id)} onClose={() => setMenuOpenId(null)}>
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
          <MenuList
            boxShadow="2xl"
            borderRadius="16px"
            zIndex={1400}
            bg="white"
            p={0}
          >
            {onEdit && (
              <MenuItem
                onClick={onEdit}
                bg="white"
                _hover={{ bg: 'gray.100' }}
                _focus={{ bg: 'gray.100' }}
                borderRadius="16px 16px 0 0"
              >
                Edit
              </MenuItem>
            )}
            <MenuItem
              onClick={() => { setMenuOpenId(null); onDelete(id); }}
              color="red.500"
              bg="white"
              _hover={{ bg: 'gray.100' }}
              _focus={{ bg: 'gray.100' }}
              borderRadius={onEdit ? "0 0 16px 16px" : "16px"}
            >
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
      <Box flex={1} minW={0} display="flex" alignItems={isMultiLine ? 'flex-start' : 'center'} justifyContent="space-between" gap={4} ml={4}>
        <Box minW={0} flex={1} ref={nameRef}>
          <Text fontWeight={600} color={isInactive ? 'gray.400' : 'gray.800'}>
            {title}
          </Text>
          <Text fontSize="sm" color={isInactive ? 'gray.400' : 'gray.500'}>{xp} XP</Text>
        </Box>
        {children}
      </Box>
    </Box>
  );
};

export default ItemCard; 