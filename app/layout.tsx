'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/utils/firebase';
import { db } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setTeamId(userDocSnap.data()?.teamId || null);
        }
      } else {
        setTeamId(null);
      }
      setIsCheckingAuth(false);
    });
    return () => unsubscribeAuth();
  }, []);

  const handleLogoClick = () => {
    if (isCheckingAuth) {
      return; // まだ認証状態を確認中の場合は何もしない
    }

    if (!user) {
      router.push('/'); // 未ログインならホームページへ
    } else if (teamId !== null) {
      router.push('/teams/select'); // ログイン済みでチームに所属していれば食品リストへ
    } else {
      router.push('/foods/add'); // ログイン済みだがチームに所属していなければチーム選択へ
    }
  };

  return (
    <html lang="ja">
      <body className={inter.className}>
        <Header onLogoClick={handleLogoClick} /> {/* クリックイベントを Header に渡す */}
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}