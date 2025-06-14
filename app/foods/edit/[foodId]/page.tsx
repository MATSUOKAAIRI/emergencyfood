// app/foods/edit/[foodId]/page.tsx 
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { auth, onAuthStateChanged } from '@/utils/firebase'; 

type FoodDocumentData = {
  name: string;
  quantity: number;
  expiryDate: string;
  category: string;
  isArchived: boolean;
  registeredAt: { seconds: number; nanoseconds: number; };
  teamId: string;
  uid: string;
  amount?: number | null;
  purchaseLocation?: string | null;
  label?: string | null;
  storageLocation?: string | null;
};

type Food = FoodDocumentData & {
  id: string;
};

export default function FoodEditPage() {
  const router = useRouter();
  const { foodId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [foodData, setFoodData] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [purchaseLocation, setPurchaseLocation] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [storageLocation, setStorageLocation] = useState<string | null>(null);
  
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/auth/login');
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    const fetchFood = async () => {
      if (!foodId || typeof foodId !== 'string') {
        setError('無効な食品IDです。');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'foods', foodId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const rawData = docSnap.data();
          const { id, ...dataWithoutId } = rawData; 
          setFoodData({ id: docSnap.id, ...dataWithoutId as FoodDocumentData });

          setName(rawData.name);
          setQuantity(rawData.quantity);
          setExpiryDate(rawData.expiryDate);
          setCategory(rawData.category);
          setAmount(rawData.amount || null);
          setPurchaseLocation(rawData.purchaseLocation || null);
          setLabel(rawData.label || null);
          setStorageLocation(rawData.storageLocation || null);

        } else {
          setError('指定された食品が見つかりません。');
        }
      } catch (e: any) {
        console.error('Error fetching food for edit:', e);
        setError('食品データの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [foodId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);


   if (!user?.uid) {
      setError('更新するにはログインが必要です。');
      return;
    }
    if (!foodData?.id) {
        setError('更新対象の食品情報が見つかりません。');
        return;
    }

    try {
      const idToken = await user.getIdToken();

      const updates = {
        name,
        quantity,
        expiryDate,
        category,
        amount: amount || null,
        purchaseLocation: purchaseLocation || null,
        label: label || null,
        storageLocation: storageLocation || null,

      };

      const response = await fetch('/api/actions/update-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ foodId: foodData.id, updates }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '食品情報の更新に失敗しました。');
      }

      setSuccessMessage('食品情報が正常に更新されました！');
      console.log('Food item updated successfully:', result.message);
      router.replace(`/foods/list?teamId=${foodData.teamId}`); 

    } catch (e: any) {
      console.error('Error updating food: ', e);
      setError(`食品情報の更新に失敗しました: ${e.message || '不明なエラー'}`);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">食品データを読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!foodData) {
    return <div className="text-center mt-10 text-gray-500">データが見つかりませんでした。</div>;
  }

  return (
    <div className="container mx-auto py-8 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-[#333}">食品情報を更新</h1>
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="p-4 border rounded border-[#333]">
        <div className="mb-4">
          <label htmlFor="foodName" className="block text-[#333] text-sm font-bold mb-2">品名</label>
          <input
            type="text"
            id="foodName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="foodQuantity" className="block text-[#333] text-sm font-bold mb-2">数量</label>
          <input
            type="number"
            id="foodQuantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="expiryDate" className="block text-[#333] text-sm font-bold mb-2">賞味期限</label>
          <input
            type="date"
            id="expiryDate"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="foodCategory" className="block text-[#333] text-sm font-bold mb-2">カテゴリ</label>
          <input
            type="text"
            id="foodCategory"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-[#333] text-sm font-bold mb-2">金額 (円)</label>
          <input
            type="number"
            id="amount"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value) || null)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="purchaseLocation" className="block text-[#333] text-sm font-bold mb-2">買った場所</label>
          <input
            type="text"
            id="purchaseLocation"
            value={purchaseLocation || ''}
            onChange={(e) => setPurchaseLocation(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="label" className="block text-[#333] text-sm font-bold mb-2">ラベル</label>
          <input
            type="text"
            id="label"
            value={label || ''}
            onChange={(e) => setLabel(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="storageLocation" className="block text-[#333] text-sm font-bold mb-2">保存場所</label>
          <input
            type="text"
            id="storageLocation"
            value={storageLocation || ''}
            onChange={(e) => setStorageLocation(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <button
          type="submit"
          className="bg-[#333333] text-white hover:bg-[#332b1e] font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          更新
        </button>
      </form>
    </div>
  );
}