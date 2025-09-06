// components/supplies/SupplyForm/index.tsx
'use client';

import { useRouter } from 'next/navigation';

import { SupplyActions } from './SupplyActions';
import { SupplyAdvancedFields } from './SupplyAdvancedFields';
import { SupplyBasicFields } from './SupplyBasicFields';
import type { SupplyFormProps } from './types';
import { useSupplyForm } from './useSupplyForm';

export default function SupplyForm({
  uid,
  teamId,
  mode = 'add',
  supplyId,
  initialData,
}: SupplyFormProps) {
  const router = useRouter();
  const {
    formData,
    errorMessage,
    successMessage,
    loading,
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
    <form onSubmit={handleSubmit} className='space-y-6'>
      <SupplyBasicFields
        formData={formData}
        onChange={handleChange}
        disabled={loading}
      />

      <SupplyAdvancedFields
        formData={formData}
        onChange={handleChange}
        disabled={loading}
      />

      <SupplyActions
        mode={mode}
        loading={loading}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    </form>
  );
}

export type { SupplyFormData, SupplyFormProps } from './types';
