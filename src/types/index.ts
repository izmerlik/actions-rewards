export interface User {
  id: string;
  email: string;
  xp: number;
}

export interface Action {
  id: string;
  userId: string;
  title: string;
  xp: number;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface Reward {
  id: string;
  userId: string;
  title: string;
  xpCost: number;
  createdAt: Date;
  redeemedAt?: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  googleSignIn: () => Promise<void>;
} 