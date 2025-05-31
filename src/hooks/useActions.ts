import { useAuth } from '@/contexts/AuthContext';
import { useFirestoreCollection } from './useFirestoreCollection';
import { Action } from '@/types';

export function useActions() {
  const { user } = useAuth();
  return useFirestoreCollection<Action>('actions', user?.id);
} 