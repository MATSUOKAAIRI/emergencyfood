'use client';
import { useEffect, useState } from 'react';
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

export default function FoodListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [teamIdFromURL, setTeamIdFromURL] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null); // 現在使用する teamId
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
    setCurrentTeamId(teamIdFromURL || teamId); // 現在使用する teamId を設定
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

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">非常食一覧</h1>
        {currentTeamId ? ( // currentTeamId の存在を確認
          <>
            {loading && <p>ロード中...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {foods.length > 0 ? (
              <ul className="mt-4">
                {foods.map((food) => (
                  <FoodItem key={food.id} food={food} />
                ))}
              </ul>
            ) : (
              <p>登録された非常食はありません。</p>
            )}
            <div className="mt-4">
              <Link href={`/foods/add?teamId=${currentTeamId}`} className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                新しい非常食を登録する
              </Link>
            </div>
          </>
        ) : (
          <p>チームIDが設定されていません。チームに参加または作成してください。</p>
        )}
      </div>
    </div>
  );
}