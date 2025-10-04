// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Firebase specific types
export interface FirebaseDocument {
  id: string;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any; // Firestore Timestamp
}

// Supply API types
export interface SupplyDocument extends FirebaseDocument {
  name: string;
  quantity: number;
  expiryDate: string;
  isArchived: boolean;
  category: string;
  unit: string;
  evacuationLevel: string;
  amount?: number | null;
  purchaseLocation?: string | null;
  label?: string | null;
  storageLocation?: string;
  registeredAt: any; // Firestore Timestamp
  teamId: string;
  uid: string;
}

// Team API types
export interface TeamDocument extends FirebaseDocument {
  name: string;
  adminUids: string[];
  memberUids: string[];
  inviteCode: string;
}

// User API types
export interface UserDocument extends FirebaseDocument {
  email: string;
  displayName?: string;
  teamId?: string;
  isAdmin?: boolean;
}

// API operation types
export type ApiOperation = 'create' | 'read' | 'update' | 'delete' | 'list';

// Request/Response patterns
export interface CreateRequest<T> {
  data: Omit<T, keyof FirebaseDocument>;
}

export interface UpdateRequest<T> {
  id: string;
  data: Partial<Omit<T, keyof FirebaseDocument>>;
}

export interface ListRequest {
  limit?: number;
  offset?: number;
  filters?: Record<string, any>;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}
