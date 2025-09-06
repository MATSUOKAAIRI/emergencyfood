//component/supplies/SupplyItem.tsx
'use client';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/ui';
import { useClickOutside } from '@/hooks';
import type { Supply } from '@/types';
import { UI_CONSTANTS } from '@/utils/constants';

type SupplyItemProps = {
  supply: Supply;
  onArchiveSupply: (supplyId: string) => void;
  onUpdateSupply: (supplyId: string) => void;
  onRestoreSupply?: (supplyId: string) => void;
  onDeleteSupply?: (supplyId: string) => void;
  canDelete?: boolean;
};

// カテゴリに応じて期限表示を決定する関数
const getExpiryLabel = (category: string) => {
  const foodCategories = [
    '米・パン',
    '麺類',
    '缶詰・レトルト',
    '調味料',
    '飲料',
    'お菓子・スイーツ',
  ];
  const dailyNecessities = [
    'トイレットペーパー',
    'マスク・消毒液',
    '電池・電球',
    'その他日用品',
  ];

  if (foodCategories.includes(category)) {
    return '賞味期限';
  } else if (dailyNecessities.includes(category)) {
    return '使用期限';
  } else {
    return '期限';
  }
};

export default function SupplyItem({
  supply,
  onArchiveSupply,
  onUpdateSupply,
  onRestoreSupply,
  onDeleteSupply,
  canDelete = false,
}: SupplyItemProps) {
  const pathname = usePathname();
  const expiryDate = new Date(supply.expiryDate);
  const daysUntilExpiry = formatDistanceToNow(expiryDate, { locale: ja });
  const isNearExpiry =
    expiryDate > new Date() &&
    expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isOverExpiry = expiryDate.getTime() < Date.now();
  const registeredDate = new Date(supply.registeredAt.seconds * 1000);
  const _formattedRegisteredDate = registeredDate.toLocaleString('ja-JP');
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useClickOutside(() => setShowMenu(false));

  const expiryLabel = getExpiryLabel(supply.category);

  const isEventPage = pathname.startsWith('/event');
  const reviewsLink = isEventPage
    ? `/event/supplies/${supply.id}/reviews`
    : `/supplies/${supply.id}/reviews`;

  const handleMenuToggle = () => {
    setShowMenu(prev => !prev);
  };

  const handleArchiveClick = () => {
    onArchiveSupply(supply.id);
    setShowMenu(false);
  };

  const handleUpdateClick = () => {
    onUpdateSupply(supply.id);
    setShowMenu(false);
  };

  const handleRestoreClick = () => {
    if (onRestoreSupply) {
      onRestoreSupply(supply.id);
      setShowMenu(false);
    }
  };

  const handleDeleteClick = () => {
    if (onDeleteSupply) {
      setConfirmDelete(true);
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
    <>
      <div className={`border rounded-lg p-3 sm:p-4 ${getExpiryStyle()}`}>
        <div className='flex items-start justify-between mb-3 gap-3'>
          <div className='flex-1 min-w-0'>
            <h3 className='text-base sm:text-lg font-semibold text-gray-900 truncate'>
              {supply.name}
            </h3>
            <p className='text-xs sm:text-sm text-gray-600'>
              カテゴリ: {supply.category}
            </p>
          </div>

          <div ref={menuRef} className='relative flex-shrink-0'>
            <button
              aria-label='メニューを開く'
              className='p-1 text-gray-500 hover:text-gray-700 transition-colors'
              onClick={handleMenuToggle}
            >
              <span className='text-lg sm:text-xl'>⋮</span>
            </button>

            {showMenu && (
              <div className='absolute right-0 mt-1 w-28 sm:w-32 bg-white border border-gray-200 rounded shadow-lg z-10'>
                {supply.isArchived ? (
                  <>
                    {onRestoreSupply && (
                      <button
                        className='block w-full text-left px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors'
                        onClick={handleRestoreClick}
                      >
                        リストに戻す
                      </button>
                    )}
                    {canDelete && onDeleteSupply && (
                      <button
                        className='block w-full text-left px-3 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors'
                        onClick={handleDeleteClick}
                      >
                        {UI_CONSTANTS.DELETE}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      className='block w-full text-left px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors'
                      onClick={handleArchiveClick}
                    >
                      アーカイブ
                    </button>
                    <button
                      className='block w-full text-left px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors'
                      onClick={handleUpdateClick}
                    >
                      編集
                    </button>
                    {canDelete && onDeleteSupply && (
                      <button
                        className='block w-full text-left px-3 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors'
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

        <div className='space-y-1 sm:space-y-2 mb-3'>
          <p className='text-xs sm:text-sm text-gray-700'>
            数量: {supply.quantity} {supply.unit}
          </p>
          <p className='text-xs sm:text-sm text-gray-700'>
            {expiryLabel}: {supply.expiryDate} ({daysUntilExpiry})
          </p>
          {supply.amount !== undefined &&
            supply.amount !== null &&
            supply.amount !== 0 && (
              <p className='text-xs sm:text-sm text-gray-700'>
                金額: {supply.amount} 円
              </p>
            )}
          {supply.storageLocation &&
            supply.storageLocation.trim() !== '' &&
            supply.storageLocation !== '未設定' && (
              <p className='text-xs sm:text-sm text-gray-700'>
                保存場所: {supply.storageLocation}
              </p>
            )}
          {supply.purchaseLocation && supply.purchaseLocation.trim() !== '' && (
            <p className='text-xs sm:text-sm text-gray-700'>
              購入場所: {supply.purchaseLocation}
            </p>
          )}
          {supply.label && supply.label.trim() !== '' && (
            <p className='text-xs sm:text-sm text-gray-700'>
              ラベル: {supply.label}
            </p>
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
            <p className='text-xs sm:text-sm font-medium'>
              {isOverExpiry
                ? `${expiryLabel}が切れています！`
                : `${expiryLabel}が近づいています！`}
            </p>
          </div>
        )}

        <div>
          <Link
            className='inline-block bg-gray-800 text-white text-xs sm:text-sm font-medium py-2 px-3 sm:px-4 rounded hover:bg-gray-700 transition-colors'
            href={reviewsLink}
          >
            感想を見る・書く
          </Link>
        </div>
      </div>

      {onDeleteSupply && (
        <ConfirmDialog
          cancelText='キャンセル'
          confirmText='削除'
          confirmVariant='danger'
          isOpen={confirmDelete}
          message={UI_CONSTANTS.CONFIRM_DELETE_FOOD}
          title='削除の確認'
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => onDeleteSupply(supply.id)}
        />
      )}
    </>
  );
}
