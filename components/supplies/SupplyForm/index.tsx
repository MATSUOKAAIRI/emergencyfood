// Re-export the new improved SupplyForm
export { NewSupplyForm as default, NewSupplyForm } from './NewSupplyForm';

// Export sub-components for flexibility
export { SupplyBasicFields } from './SupplyBasicFields';
export { SupplyCategoryFields } from './SupplyCategoryFields';
export { SupplyFormActions } from './SupplyFormActions';
export { SupplyOptionalFields } from './SupplyOptionalFields';

// Export types
export type { SupplyFormData, SupplyFormProps } from '../../../types/forms';
