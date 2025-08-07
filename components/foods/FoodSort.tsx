'use client';
import { useState } from 'react';

export type SortOption = 'name' | 'expiryDate' | 'registeredAt' | 'category';
export type SortOrder = 'asc' | 'desc';

interface FoodSortProps {
  onSortChange: (option: SortOption, order: SortOrder) => void;
  currentSort: SortOption;
  currentOrder: SortOrder;
}

export default function FoodSort({
  onSortChange,
  currentSort,
  currentOrder,
}: FoodSortProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'name', label: '名前' },
    { value: 'expiryDate', label: '賞味期限' },
    { value: 'registeredAt', label: '登録日' },
    { value: 'category', label: 'カテゴリ' },
  ] as const;

  const handleSortChange = (option: SortOption) => {
    const newOrder =
      currentSort === option && currentOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(option, newOrder);
    setIsOpen(false);
  };

  const getCurrentSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === currentSort);
    return option ? option.label : '名前';
  };

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-black focus:border-black'
      >
        <span className='text-sm text-gray-700'>
          並び替え: {getCurrentSortLabel()}
        </span>
        <span className='text-gray-400'>
          {currentOrder === 'asc' ? '↑' : '↓'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10'>
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                currentSort === option.value
                  ? 'bg-gray-100 text-black font-medium'
                  : 'text-gray-700'
              }`}
            >
              {option.label}
              {currentSort === option.value && (
                <span className='ml-2 text-gray-400'>
                  {currentOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
