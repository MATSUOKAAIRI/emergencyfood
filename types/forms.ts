// Base form interfaces
export interface BaseFormData {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Supply form specific types
export interface SupplyFormData extends BaseFormData {
  name: string;
  quantity: number;
  expiryDate: string;
  category: string;
  unit: string;
  evacuationLevel: string;
  amount?: string | number | null;
  purchaseLocation?: string | null;
  label?: string | null;
  storageLocation?: string | null;
}

// Form validation types
export interface FormError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormError[];
}

// Form state types
export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Form mode types
export type FormMode = 'add' | 'edit' | 'view';

// Common form props
export interface BaseFormProps {
  mode?: FormMode;
  onSubmit?: (data: any) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

// Supply form specific props
export interface SupplyFormProps extends BaseFormProps {
  uid: string | null;
  teamId: string | null;
  supplyId?: string;
  initialData?: SupplyFormData;
}
