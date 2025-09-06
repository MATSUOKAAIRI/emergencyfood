import React from 'react';

import { Select } from '@/components/ui';
import type { SupplyFormData } from '@/types/forms';
import { EVACUATION_LEVELS, FOOD_CATEGORIES } from '@/utils/constants';

interface SupplyCategoryFieldsProps {
  formData: SupplyFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

export function SupplyCategoryFields({
  formData,
  onChange,
}: SupplyCategoryFieldsProps) {
  const categoryOptions = FOOD_CATEGORIES.map(category => ({
    value: category,
    label: category,
  }));

  const evacuationOptions = EVACUATION_LEVELS.map(level => ({
    value: level,
    label: level,
  }));

  return (
    <div className='space-y-4'>
      <Select
        required
        id='category'
        label='カテゴリ'
        name='category'
        options={categoryOptions}
        placeholder='選択してください'
        value={formData.category}
        onChange={onChange}
      />

      <Select
        required
        id='evacuationLevel'
        label='何次避難用'
        name='evacuationLevel'
        options={evacuationOptions}
        placeholder='選択してください'
        value={formData.evacuationLevel}
        onChange={onChange}
      />
    </div>
  );
}
