'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/utils/firebase';
import { db } from '@/utils/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, where } from 'firebase/firestore';


type Review = {
  id: string;
  userId: string;
  userName: string; 
  text: string;
  createdAt: { seconds: number; nanoseconds: number };
};

export default function FoodReviewsPage() {
  const router = useRouter();
  const { foodId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    if (foodId) {
      const reviewsRef = collection(db, 'foodReviews');
      const q = query(reviewsRef, where('foodId', '==', foodId), orderBy('createdAt', 'desc'));
      const unsubscribeReviews = onSnapshot(q, (snapshot) => {
        const fetchedReviews: Review[] = [];
        snapshot.forEach((doc) => {
          fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
        });
        setReviews(fetchedReviews);
      });
      return () => unsubscribeReviews();
    }
  }, [foodId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !user?.email) { 
      setError('ログインが必要です。');
      return;
    }
    setError(null);
    try {
      await addDoc(collection(db, 'foodReviews'), {
        foodId: foodId,
        userId: user.uid,
        userName: user.email,
        text: reviewText,
        createdAt: serverTimestamp(),
      });
      setReviewText('');
    } catch (error: any) {
      console.error('Error adding review: ', error);
      setError('感想の投稿に失敗しました。');
    }
  };

  return (
    <div>
  
      <div className="container mx-auto py-8 min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-[#333]">食品レビュー</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* 感想投稿フォーム */}
        {user && (
          <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded border-[#333]">
            <h3 className="text-lg font-semibold mb-2 text-[#333]">感想を投稿する</h3>
            <div className="mb-2">
              <label htmlFor="reviewText" className="block text-[#333] text-sm font-bold mb-1">感想:</label>
              <textarea
                id="reviewText"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-[#333] leading-tight focus:outline-none focus:shadow-outline"
                rows={4}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-[#333333] text-white hover:bg-[#332b1e] font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              投稿する
            </button>
          </form>
        )}
        {!user && <p>感想を投稿するにはログインが必要です。</p>}
<div className='border border-[#333] mb-10 w-full'/>
        {/* 投稿された感想リスト */}
        <h3 className="text-lg font-semibold mb-2 text-[#333]">投稿された感想</h3>
        {reviews.length > 0 ? (
         <ul>
         {reviews.map((review) => (
           <li key={review.id} className="mb-4 p-4 border rounded border-[#333]">
             <p className="font-semibold text-[#333]">ユーザー ID: {review.userName}</p>
             <p className="italic text-[#333]">
               {review.createdAt?.seconds
                 ? new Date(review.createdAt.seconds * 1000).toLocaleString()
                 : '日時情報がありません'}
             </p>
             <p className='text-[#333]'>{review.text}</p>
           
           
           </li>
           
         ))}<div className="border border-[#333]" />
       </ul>
        ) : (
          <p className='text-[#333]'>まだ感想はありません。</p>
        )}
      </div>
    </div>
  );
}