// Re-export organized types
export * from './api';
export * from './forms';

// User & Auth types
export interface AppUser {
  uid: string;
  email: string;
  displayName?: string | null;
  teamId?: string | null;
  lineUserId?: string | null;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
  getIdTokenResult: (forceRefresh?: boolean) => Promise<{
    claims: {
      teamId?: string | null;
      [key: string]: any;
    };
    [key: string]: any;
  }>;
}

// Team types
export interface Team {
  id: string;
  name: string;
  password: string;
  members: string[];
  admins: string[];
  ownerId: string;
  createdAt: Date;
  createdBy: string;
}

export type TeamRole = 'owner' | 'admin' | 'member';

export interface TeamMember {
  uid: string;
  email: string;
  displayName?: string | null;
  role: TeamRole;
}

// Supply types (keeping existing interface for compatibility)
export interface Supply {
  id: string;
  name: string;
  quantity: number;
  expiryDate: string;
  isArchived: boolean;
  category: string;
  unit: string;
  evacuationLevel: string;
  registeredAt: { seconds: number; nanoseconds: number };
  teamId: string;
  uid: string;
  amount?: number | null;
  purchaseLocation?: string | null;
  label?: string | null;
  storageLocation?: string | null;
}

// Review types
export interface Review {
  id: string;
  supplyId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: { seconds: number; nanoseconds: number };
}

// Hook return types
export interface UseAuthReturn {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
}

export interface UseTeamReturn {
  teamId: string | null;
  teamIdFromURL: string | null;
  currentTeamId: string | null;
  loading: boolean;
  error: string | null;
}

export interface UseSuppliesReturn {
  supplies: Supply[];
  loading: boolean;
  error: string | null;
  archiveSupply: (supplyId: string) => Promise<void>;
  updateSupply: (supplyId: string) => void;
}
