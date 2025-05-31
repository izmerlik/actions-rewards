import { useAuth } from '@/contexts/AuthContext';
import { useFirestoreCollection } from './useFirestoreCollection';
import { Reward } from '@/types';

export function useRewards() {
  const { user } = useAuth();
  return useFirestoreCollection<Reward>('rewards', user?.id);
} 