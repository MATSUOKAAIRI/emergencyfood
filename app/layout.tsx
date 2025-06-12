'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/utils/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const isRedirecting = useRef(false);
  const lastRedirectPath = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsCheckingAuth(false);
    
      const currentPath = pathname;
      if (isRedirecting.current) {
          console.log("DEBUG: Already redirecting, skipping onAuthStateChanged execution.");
          return;
      }

      const isAuthPage = pathname.startsWith('/auth/');
      const isHomepage = pathname === '/';

      const isAllowedWithoutTeamPage = 
        pathname === '/teams/select' ||
        pathname === '/teams/join' ||
        pathname === '/teams/create';

      const isFoodsListPage = pathname.startsWith('/foods/');
      let targetPath: string | null = null;

      if (!currentUser) {
        setTeamId(null); 
        if (!isAuthPage && !isHomepage) {
          targetPath = '/auth/login';
        } else if (isHomepage) {
          targetPath = currentPath; 
        }
      } else {
        let userTeamId: string | null = null;

      try {
        const idTokenResult = await currentUser.getIdTokenResult(true);
        userTeamId = (idTokenResult.claims.teamId as string | null) || null;
      } catch (error) {
        console.error("Error fetching ID token result in layout:", error);
        userTeamId = null;
      }

      setTeamId(userTeamId);

      if (userTeamId) {
        if (!isFoodsListPage) { 
            targetPath = `/foods/list?teamId=${userTeamId}`;
        } else {
          targetPath = currentPath;
        }
      } else {
        if (!isAllowedWithoutTeamPage && !isHomepage) {
          targetPath = '/teams/select';
        } else {
          targetPath = currentPath;
        }
      }
    }
    if (targetPath && targetPath !== currentPath) {
      isRedirecting.current = true;
      lastRedirectPath.current = targetPath;
      console.log(`DEBUG: Attempting redirect from ${currentPath} to ${targetPath}`);
      router.replace(targetPath);
    } else {
      console.log(`DEBUG: No redirect needed. Current path: ${currentPath}, Target path: ${targetPath}`);
    }
      console.log("--- LAYOUT DEBUG: onAuthStateChanged End ---");
    });
    return () => {
      unsubscribeAuth();
      isRedirecting.current = false;
      lastRedirectPath.current = null;
    };
  }, [pathname, router]); 

  const handleLogoClick = () => {
    if (isCheckingAuth) return;
    if (!user) {
      router.push('/');
    } else if (teamId !== null) {
      router.push(`/foods/list?teamId=${teamId}`);
    } else {
      router.push('/teams/select');
    }
  };

  if (isCheckingAuth) {
    return (
      <html lang="ja">
        <body className={inter.className}>
          <div className="flex justify-center items-center min-h-screen">
            読み込み中...
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className='min-h-screen'>
        <Header 
          onLogoClick={handleLogoClick} 
          isLoggedIn={!!user}
        />
        <main>{children}</main>
        <Footer />
        </div>
      </body>
    </html>
  );
}

//   return (
//     <html lang="ja">
//       <body className=" flex-col flex min-h-screen">
//         <Header onLogoClick={handleLogoClick} />
//         <main className='flex-grow'>{children}</main>
//         <Footer />
//       </body>
//     </html>
//   );
// }