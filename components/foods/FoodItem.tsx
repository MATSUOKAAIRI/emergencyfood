//component/foods/FoodItem.tsx
'use client';
import { useClickOutside } from '@/hooks';
import type { Food } from '@/types';
import { UI_CONSTANTS } from '@/utils/constants';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import Link from 'next/link';
import { useState } from 'react';

type FoodItemProps = {
  food: Food;
  onArchiveFood: (foodId: string) => void;
  onUpdateFood: (foodId: string) => void;
  onRestoreFood?: (foodId: string) => void;
  onDeleteFood?: (foodId: string) => void;
  canDelete?: boolean;
};

export default function FoodItem({
  food,
  onArchiveFood,
  onUpdateFood,
  onRestoreFood,
  onDeleteFood,
  canDelete = false,
}: FoodItemProps) {
  const expiryDate = new Date(food.expiryDate);
  const daysUntilExpiry = formatDistanceToNow(expiryDate, { locale: ja });
  const isNearExpiry =
    expiryDate > new Date() &&
    expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isOverExpiry = expiryDate.getTime() < Date.now();
  const registeredDate = new Date(food.registeredAt.seconds * 1000);
  const formattedRegisteredDate = registeredDate.toLocaleString('ja-JP');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useClickOutside(() => setShowMenu(false));

  const handleMenuToggle = () => {
    setShowMenu(prev => !prev);
  };

  const handleArchiveClick = () => {
    onArchiveFood(food.id);
    setShowMenu(false);
  };

  const handleUpdateClick = () => {
    onUpdateFood(food.id);
    setShowMenu(false);
  };

  const handleRestoreClick = () => {
    if (onRestoreFood) {
      onRestoreFood(food.id);
      setShowMenu(false);
    }
  };

  const handleDeleteClick = () => {
    if (onDeleteFood && window.confirm(UI_CONSTANTS.CONFIRM_DELETE_FOOD)) {
      onDeleteFood(food.id);
      setShowMenu(false);
    }
  };

  const getExpiryStyle = () => {
    if (isOverExpiry) {
      return 'border-red-500 bg-red-50';
    } else if (isNearExpiry) {
      return 'border-yellow-500 bg-yellow-50';
    }
    return 'border-gray-200 bg-white';
  };

  return (
    <div className={`border rounded-lg p-4 ${getExpiryStyle()}`}>
      <div className='flex items-center justify-between mb-3'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>{food.name}</h3>
          <p className='text-sm text-gray-600'>カテゴリ: {food.category}</p>
        </div>

        <div ref={menuRef} className='relative'>
          <button
            className='p-1 text-gray-500 hover:text-gray-700'
            onClick={handleMenuToggle}
          >
            <span className='text-xl'>⋮</span>
          </button>

          {showMenu && (
            <div className='absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg z-10'>
              {food.isArchived ? (
                <>
                  {onRestoreFood && (
                    <button
                      className='block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      onClick={handleRestoreClick}
                    >
                      リストに戻す
                    </button>
                  )}
                  {canDelete && onDeleteFood && (
                    <button
                      className='block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50'
                      onClick={handleDeleteClick}
                    >
                      {UI_CONSTANTS.DELETE}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    className='block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100'
                    onClick={handleArchiveClick}
                  >
                    アーカイブ
                  </button>
                  <button
                    className='block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100'
                    onClick={handleUpdateClick}
                  >
                    編集
                  </button>
                  {canDelete && onDeleteFood && (
                    <button
                      className='block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50'
                      onClick={handleDeleteClick}
                    >
                      {UI_CONSTANTS.DELETE}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className='space-y-2 mb-3'>
        <p className='text-sm text-gray-700'>数量: {food.quantity}</p>
        <p className='text-sm text-gray-700'>
          賞味期限: {food.expiryDate} ({daysUntilExpiry})
        </p>
        {food.amount !== undefined &&
          food.amount !== null &&
          food.amount !== 0 && (
            <p className='text-sm text-gray-700'>金額: {food.amount} 円</p>
          )}
        {food.storageLocation &&
          food.storageLocation.trim() !== '' &&
          food.storageLocation !== '未設定' && (
            <p className='text-sm text-gray-700'>
              保存場所: {food.storageLocation}
            </p>
          )}
        {food.purchaseLocation && food.purchaseLocation.trim() !== '' && (
          <p className='text-sm text-gray-700'>
            購入場所: {food.purchaseLocation}
          </p>
        )}
        {food.label && food.label.trim() !== '' && (
          <p className='text-sm text-gray-700'>ラベル: {food.label}</p>
        )}
      </div>

      {(isNearExpiry || isOverExpiry) && (
        <div
          className={`p-2 rounded mb-3 ${
            isOverExpiry
              ? 'bg-red-100 text-red-700'
              : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          <p className='text-sm font-medium'>
            {isOverExpiry
              ? '賞味期限が切れています！'
              : '賞味期限が近づいています！'}
          </p>
        </div>
      )}

      <div>
        <Link
          className='inline-block bg-gray-800 text-white text-sm font-medium py-2 px-4 rounded hover:bg-gray-700'
          href={`/foods/${food.id}/reviews`}
        >
          感想を見る・書く
        </Link>
      </div>
    </div>
  );
}
