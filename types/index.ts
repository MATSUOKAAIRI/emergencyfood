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

export interface Food {
  id: string;
  name: string;
  quantity: number;
  expiryDate: string;
  isArchived: boolean;
  category: string;
  registeredAt: { seconds: number; nanoseconds: number };
  teamId: string;
  uid: string;
  amount?: number | null;
  purchaseLocation?: string | null;
  label?: string | null;
  storageLocation?: string | null;
}

export interface Review {
  id: string;
  foodId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: { seconds: number; nanoseconds: number };
}

export interface FoodFormData {
  name: string;
  quantity: number;
  expiryDate: string;
  category: string;
  amount?: number | null;
  purchaseLocation?: string | null;
  label?: string | null;
  storageLocation?: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

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

export interface UseFoodsReturn {
  foods: Food[];
  loading: boolean;
  error: string | null;
  archiveFood: (foodId: string) => Promise<void>;
  updateFood: (foodId: string) => void;
}
