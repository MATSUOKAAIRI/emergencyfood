'use client';
import { useEffect, useState, Suspense } from 'react'; // Suspense をインポート
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
  category: string;
  registeredAt: { seconds: number; nanoseconds: number };
  teamId: string;
  uid: string;
};

// クライアントサイドコンポーネントをラップする
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
  }, [searchParams]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setTeamId(userDocSnap.data()?.teamId || null);
        } else {
          setTeamId(null);
          console.warn('ユーザー情報が見つかりません (list)');
        }
      } else {
        router.push('/auth/login');
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    setCurrentTeamId(teamIdFromURL || teamId);
  }, [teamIdFromURL, teamId]);

  useEffect(() => {
    const fetchFoods = async () => {
      if (user?.uid && currentTeamId) {
        setLoading(true);
        setError(null);
        try {
          const q = query(collection(db, 'foods'), where('teamId', '==', currentTeamId), where('uid', '==', user.uid));
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

  return (
    <div>
      <div className="p-4 items-center justify-center flex flex-col bottom-0 pt-40 w-full max-w-screen-lg mx-auto">
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
              <ul className="mt-4 w-3/4 items-center justify-center flex flex-col bg-[#ffd699] bottom-0 ">
                {foods.map((food) => (
                  <FoodItem key={food.id} food={food} />
                ))}
              </ul>
            ) : (
              <p>登録された非常食はありません。</p>
            )}
            
          </>
        ) : (
          <p>チームIDが設定されていません。チームに参加または作成してください。</p>
        )}
      </div>
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