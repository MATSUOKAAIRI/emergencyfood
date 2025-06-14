//component/foods/FoodItem.tsx
"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale/ja";

type Food = {
  id: string;
  name: string;
  quantity: number;
  expiryDate: string;
  isArchived: boolean;
  category: string;
  registeredAt: { seconds: number; nanoseconds: number };
  teamId: string;
  uid: string;
  amount?: number | null;
  purchaseLocation?: string | null;
  label?: string | null;
  storageLocation?: string | null;
};

type FoodItemProps = {
  food: Food;
  onArchiveFood: (foodId: string) => void;
  onUpdateFood: (foodId: string) => void;
  onRestoreFood?: (foodId: string) => void;
};

export default function FoodItem({ food, onArchiveFood, onUpdateFood, onRestoreFood }: FoodItemProps) {
  const expiryDate = new Date(food.expiryDate);
  const daysUntilExpiry = formatDistanceToNow(expiryDate, { locale: ja });
  const isNearExpiry =expiryDate > new Date() &&
    expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isOverExpiry =
    expiryDate.getTime() <  Date.now();
  const registeredDate = new Date(food.registeredAt.seconds * 1000);
  const formattedRegisteredDate = registeredDate.toLocaleString("ja-JP");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuToggle = () => {
    setShowMenu((prev) => !prev);
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
    if (onRestoreFood){
      onRestoreFood(food.id);
      setShowMenu(false);
    }
  };

  return (
    <>
      <li
        className={`p-4 ${
          isNearExpiry ? "bg-yellow-200 border-yellow-200":isOverExpiry? "border-red-500 bg-red-300" : "bg-white "
        }`}
      >
        <div className="flex flex-row">
          <h3 className="text-lg font-semibold text-[#333]">{food.name}</h3>
          <div className="relative ml-auto" ref={menuRef}>
            <button
              onClick={handleMenuToggle}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <span className="text-2xl">⋮</span>
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
              {food.isArchived ? ( // アーカイブ済みの場合
                onRestoreFood && ( // onRestoreFood が渡されている場合のみ
                  <button
                    onClick={handleRestoreClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    リストに戻す
                  </button>
                )
              ) : ( // 未アーカイブの場合（通常のリストページ）
                <>
                  <button
                    onClick={handleArchiveClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    消す
                  </button>
                  <button
                    onClick={handleUpdateClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    更新
                  </button>
                </>
              )}
              </div>
            )}
          </div>
          </div>
          <p className="text-[#333]">数量: {food.quantity}</p>
          <p className="text-[#333]">
            賞味期限: {food.expiryDate} ({daysUntilExpiry})
          </p>
          <p className="text-[#333]">カテゴリ: {food.category}</p>
          <p className="text-[#333]">登録日時: {formattedRegisteredDate}</p>
          {food.amount !== undefined && food.amount !== null && (
            <p className="text-[#333]">金額: {food.amount} 円</p>
          )}
          {food.purchaseLocation && (
            <p className="text-[#333]">買った場所: {food.purchaseLocation}</p>
          )}
          {food.label && <p className="text-[#333]">ラベル: {food.label}</p>}
          {food.storageLocation && (
            <p className="text-[#333]">保存場所: {food.storageLocation}</p>
          )}
          {isNearExpiry && (
            <p className="text-red-500">賞味期限が近づいています！</p>
          )}
          {isOverExpiry && (
            <p className="text-red-600">賞味期限が切れています！</p>
          )}
        <div>
          <Link
            href={`/foods/${food.id}/reviews`}
            className="inline-block bg-[#333333] hover:bg-[#332b1e] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
          >
            感想を見る・書く
          </Link>
        </div>
      </li>
      <div className="border-b border-[#333] w-full mt-10 mb-10"></div>
    </>
  );
}