export interface User {
  id: string;
  email: string;
  xp: number;
  isGuest?: boolean;
}

export interface Action {
  id: string;
  userId: string;
  title: string;
  xp: number;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date | null;
}

export interface Reward {
  id: string;
  userId: string;
  title: string;
  xpCost: number;
  createdAt: Date;
  redeemedAt?: Date | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  guestSignIn: () => Promise<void>;
  updateUserXP: (newXP: number) => void;
} 