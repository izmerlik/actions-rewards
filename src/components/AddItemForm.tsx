import { Box, Button, Input, useBreakpointValue, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

interface AddItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, xp: number) => void;
  title: string;
  type: 'action' | 'reward';
  mode?: 'add' | 'edit';
  initialTitle?: string;
  initialXP?: number;
}

export default function AddItemForm({ isOpen, onClose, onSubmit, title, type, mode = 'add', initialTitle = '', initialXP }: AddItemFormProps) {
  const [itemTitle, setItemTitle] = useState(initialTitle);
  const [itemXP, setItemXP] = useState(initialXP !== undefined ? initialXP.toString() : '');
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    setItemTitle(initialTitle);
    setItemXP(initialXP !== undefined ? initialXP.toString() : '');
  }, [initialTitle, initialXP, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle || !itemXP) return;

    const xp = parseInt(itemXP);
    if (isNaN(xp) || xp <= 0) return;

    onSubmit(itemTitle, xp);
    setItemTitle('');
    setItemXP('');
    onClose();
  };

  const formContent = (
    <Box as="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={4}>
      <Input
        placeholder="Name"
        value={itemTitle}
        onChange={(e) => setItemTitle(e.target.value)}
        required
        size="md"
        fontSize="md"
        borderRadius="8px"
        px={3}
        h="48px"
        _placeholder={{ color: 'gray.400', fontSize: 'md' }}
      />
      <Input
        placeholder="XP"
        type="number"
        value={itemXP}
        onChange={(e) => setItemXP(e.target.value)}
        required
        min={1}
        size="md"
        fontSize="md"
        borderRadius="8px"
        px={3}
        h="48px"
        _placeholder={{ color: 'gray.400', fontSize: 'md' }}
      />
      <Button
        type="submit"
        bg="black"
        color="white"
        _hover={{ bg: 'gray.800' }}
        _active={{ bg: 'gray.900' }}
        h="48px"
        borderRadius="8px"
        fontSize="md"
      >
        {mode === 'edit' ? 'Save' : `Add ${type === 'action' ? 'Action' : 'Reward'}`}
      </Button>
    </Box>
  );

  const headerText = mode === 'edit'
    ? `Edit ${type === 'action' ? 'Action' : 'Reward'}`
    : `Add New ${type === 'action' ? 'Action' : 'Reward'}`;

  if (isMobile) {
    return (
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            {headerText}
          </DrawerHeader>
          <DrawerBody pt={6}>
            {formContent}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          {headerText}
        </DrawerHeader>
        <DrawerBody pt={6}>
          {formContent}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
} 