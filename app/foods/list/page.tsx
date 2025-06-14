'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/utils/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
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

function FoodListPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [teamIdFromURL, setTeamIdFromURL] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const teamIdParam = searchParams.get('teamId');
    setTeamIdFromURL(teamIdParam);

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const idTokenResult = await currentUser.getIdTokenResult();
          const userTeamId = (idTokenResult.claims.teamId as string | null) || null;
          setTeamId(userTeamId);
          // console.log("List Page: Team ID from claims:", userTeamId);

        } catch (e) {
          console.error("Error getting teamId from claims in FoodListPage:", e);
          setTeamId(null); 
        }
        } else {
        router.push('/auth/login');
      }
    });
    return () => unsubscribeAuth();
  }, [router, searchParams]);

  useEffect(() => {
    setCurrentTeamId(teamId);
  }, [teamId]);

  useEffect(() => {
    const fetchFoods = async () => {
      if (user?.uid && currentTeamId) {
        setLoading(true);
        setError(null);
        try {
          const q = query(collection(db, 'foods'), where('teamId', '==', currentTeamId), where('uid', '==', user.uid), where('isArchived', '==', false));
          const querySnapshot = await getDocs(q);
          const foodList: Food[] = [];
          querySnapshot.forEach((doc) => {
            foodList.push({ id: doc.id, ...doc.data() } as Food);
          });
          setFoods(foodList);
        } catch (e: any) {
          console.error('Error fetching foods: ', e);
          setError('データの取得に失敗しました。');
        } finally {
          setLoading(false);
        }
      } else if (user?.uid && !currentTeamId) {
        setFoods([]);
      }
    };

    fetchFoods();
  }, [user, currentTeamId]);

    const handleArchiveFood = async (foodIdToArchive: string) => {
    if (!window.confirm('この非常食アイテムをリストから非表示にします。もう二度と表示されなくなりますがよろしいですか？（「過去の保存食」ページからは確認できます）')) {
      return;
    }
    if (!user?.uid || !teamId) {
      setError('ログインまたはチームIDが不明です。');
      return;
    }

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/actions/archive-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ foodId: foodIdToArchive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '食品の非表示に失敗しました。');
      }

      setFoods(prevFoods => prevFoods.filter(food => food.id !== foodIdToArchive));
      console.log(`Food item ${foodIdToArchive} archived successfully.`);

    } catch (e: any) {
      console.error('Error archiving food: ', e);
      setError(`食品の非表示に失敗しました: ${e.message || '不明なエラー'}`);
    }
  };

  const handleUpdateFood = (foodIdToUpdate: string) => {
  router.push(`/foods/edit/${foodIdToUpdate}`);
  console.log(`Navigating to edit page for food ID: ${foodIdToUpdate}`);
};

  return (
    <div className='mt-12 items-center flex flex-col mix-h-screen'>
        <h1 className="text-5xl font-bold mb-10 text-[#333]">非常食一覧</h1>
        {currentTeamId ? (
          <>
            {loading && <p>ロード中...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <div className="mt-4">
              <Link href={`/foods/add?teamId=${currentTeamId}`} className="inline-block bg-[#333333] hover:bg-[#332b1e] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-20">
                新しい非常食を登録する
              </Link>
            </div>
            {foods.length > 0 ? (
              <ul className="mt-4 w-3/4 items-center justify-center flex flex-col bottom-0 ">
                {foods.map((food) => (
                  <FoodItem key={food.id} food={food} onArchiveFood={handleArchiveFood} onUpdateFood={handleUpdateFood} />
                ))}
              </ul>
            ) : (
              <p className='text-[#333]'>登録された非常食はありません。</p>
            )}
            
          </>
        ) : (
          <p className='text-[#333]'>チームIDが設定されていません。チームに参加または作成してください。</p>
        )}
      </div>
  );
}

export default function FoodListPage() {
  return (
    <Suspense fallback={<p>Loading foods...</p>}>
      <FoodListPageClient />
    </Suspense>
  );
}