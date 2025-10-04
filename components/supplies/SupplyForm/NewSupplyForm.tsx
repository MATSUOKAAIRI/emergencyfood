'use client';
import { Card, ErrorMessage, SuccessMessage } from '@/components/ui';
import { useSupplyForm } from '@/hooks/forms/useSupplyForm';
import type { SupplyFormProps } from '@/types/forms';

import { SupplyBasicFields } from './SupplyBasicFields';
import { SupplyCategoryFields } from './SupplyCategoryFields';
import { SupplyFormActions } from './SupplyFormActions';
import { SupplyOptionalFields } from './SupplyOptionalFields';

export function NewSupplyForm({
  uid,
  teamId,
  mode = 'add',
  supplyId,
  initialData,
  onCancel,
}: SupplyFormProps) {
  const {
    formData,
    errorMessage,
    successMessage,
    submitting,
    handleChange,
    handleSubmit,
  } = useSupplyForm({
    uid,
    teamId,
    mode,
    supplyId,
    initialData,
  });

  return (
    <div className='max-w-2xl mx-auto'>
      <Card>
        <form onSubmit={handleSubmit}>
          {/* Error and Success Messages */}
          {errorMessage && <ErrorMessage message={errorMessage} />}
          {successMessage && <SuccessMessage message={successMessage} />}

          {/* Form Fields */}
          <div className='space-y-6'>
            <SupplyBasicFields formData={formData} onChange={handleChange} />
            <SupplyCategoryFields formData={formData} onChange={handleChange} />
            <SupplyOptionalFields formData={formData} onChange={handleChange} />
          </div>

          {/* Form Actions */}
          <SupplyFormActions
            mode={mode}
            submitting={submitting}
            onCancel={onCancel}
          />
        </form>
      </Card>
    </div>
  );
}
