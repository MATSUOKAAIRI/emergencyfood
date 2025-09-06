// components/supplies/SupplyForm/types.ts

export interface SupplyFormData {
  name: string;
  quantity: number;
  expiryDate: string;
  category: string;
  unit: string;
  evacuationLevel: string;
  amount?: string | number | null | undefined;
  purchaseLocation?: string | null | undefined;
  label?: string | null | undefined;
  storageLocation?: string | null | undefined;
}

export interface SupplyFormProps {
  uid: string | null;
  teamId: string | null;
  mode?: 'add' | 'edit';
  supplyId?: string;
  initialData?: SupplyFormData;
}

export interface UseSupplyFormProps extends SupplyFormProps {}

export interface SupplyFieldsProps {
  formData: SupplyFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  disabled?: boolean;
}

export interface SupplyActionsProps {
  mode: 'add' | 'edit';
  loading: boolean;
  errorMessage: string | null;
  successMessage: string | null;
}
