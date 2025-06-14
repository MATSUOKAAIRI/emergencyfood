// app/foods/archived/page.tsx
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/utils/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import FoodItem from '@/components/foods/FoodItem';
import Link from 'next/link';

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

function ArchivedFoodListPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const idTokenResult = await currentUser.getIdTokenResult();
          const userTeamId = (idTokenResult.claims.teamId as string | null) || null;
          setTeamId(userTeamId);
        } catch (e) {
          console.error("Error getting teamId from claims in ArchivedFoodListPage:", e);
          setTeamId(null); 
        }
      } else {
        router.push('/auth/login');
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    const fetchArchivedFoods = async () => {
      if (user?.uid && teamId) {
        setLoading(true);
        setError(null);
        try {
          const q = query(
            collection(db, 'foods'),
            where('teamId', '==', teamId),
            where('uid', '==', user.uid),
            where('isArchived', '==', true)
          );
          const querySnapshot = await getDocs(q);
          const foodList: Food[] = [];
          querySnapshot.forEach((doc) => {
            foodList.push({ id: doc.id, ...doc.data() } as Food);
          });
          setFoods(foodList);
        } catch (e: any) {
          console.error('Error fetching archived foods: ', e);
          setError('過去の食品データの取得に失敗しました。');
        } finally {
          setLoading(false);
        }
      } else if (user?.uid && !teamId) {
        setFoods([]);
        setLoading(false);
      }
    };

    fetchArchivedFoods();
  }, [user, teamId]);

  const handleRestoreFood = async (foodIdToRestore: string) => {
    if (!window.confirm('この食品をリストに戻しますか？')) {
      return;
    }
    if (!user?.uid || !teamId) {
        setError('ログインまたはチームIDが不明です。');
        return;
    }
    try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/actions/restore-food', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ foodId: foodIdToRestore }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '食品のリストへの復帰に失敗しました。');
        }
        setFoods(prevFoods => prevFoods.filter(food => food.id !== foodIdToRestore));
        console.log(`Food item ${foodIdToRestore} restored successfully.`);
    } catch (e: any) {
        console.error('Error restoring food: ', e);
        setError(`食品の復帰に失敗しました: ${e.message || '不明なエラー'}`);
    }
  };

  const handleUpdateFood = (foodIdToUpdate: string) => {
    router.push(`/foods/edit/${foodIdToUpdate}`); 
    console.log(`Navigating to edit page for food ID: ${foodIdToUpdate}`);
  };


  return (
    <div className='mt-12 items-center flex flex-col h-screen'>
        <h1 className="text-5xl font-bold mb-10 text-[#333]">過去の保存食</h1>
        {teamId ? (
          <>
            {loading && <p>ロード中...</p>}
            {error && <p className="text-red-500">{error}</p>}
            
            {foods.length > 0 ? (
              <ul className="mt-4 w-3/4 items-center justify-center flex flex-col bottom-0 ">
                {foods.map((food) => (

                  <FoodItem 
                    key={food.id} 
                    food={food} 
                    onArchiveFood={() => { }} 
                    onUpdateFood={handleUpdateFood} 
                    onRestoreFood={handleRestoreFood}
                  />
                ))}
              </ul>
            ) : (
              <p className='text-[#333]'>過去にアーカイブされた非常食はありません。</p>
            )}
            <div className="mt-4">
              <Link href={`/foods/list?teamId=${teamId}`} className="inline-block bg-[#333333] hover:bg-[#332b1e] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-20">
                現在の非常食リストに戻る
              </Link>
            </div>
          </>
        ) : (
          <p className='text-[#333]'>チームIDが設定されていません。チームに参加または作成してください。</p>
        )}
      </div>
  );
}

export default function ArchivedFoodListPage() {
  return (
    <Suspense fallback={<p>Loading archived foods...</p>}>
      <ArchivedFoodListPageClient />
    </Suspense>
  );
}