'use client';
import { Inter } from 'next/font/google';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import './globals.css';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { auth, onAuthStateChanged } from '@/utils/firebase';

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

  const handleRedirect = useCallback(
    async (currentUser: any, currentPath: string) => {
      const isAuthPage = currentPath.startsWith('/auth/');
      const isHomepage = currentPath === '/';
      const isEventPage = currentPath.startsWith('/event');
      const isTeamRelatedPage =
        pathname === '/teams/select' ||
        pathname === '/teams/join' ||
        pathname === '/teams/create';

      const isAllowedForTeamUsersPage =
        currentPath.startsWith('/foods/') ||
        currentPath.startsWith('/settings');

      const isSettingsPage = currentPath.startsWith('/settings');
      let targetPath: string | null = null;

      if (!currentUser) {
        setTeamId(null);
        if (!isAuthPage && !isHomepage && !isEventPage) {
          targetPath = '/auth/login';
        } else {
          targetPath = currentPath;
        }
      } else {
        let userTeamId: string | null = null;

        try {
          const idTokenResult = await currentUser.getIdTokenResult(true);
          userTeamId = (idTokenResult.claims.teamId as string | null) || null;
        } catch (error) {
          console.error('Error fetching ID token result in layout:', error);
          userTeamId = null;
        }

        setTeamId(userTeamId);

        if (userTeamId) {
          if (!isAllowedForTeamUsersPage) {
            targetPath = `/foods/list?teamId=${userTeamId}`;
          } else {
            targetPath = currentPath;
          }
        } else {
          if (!isTeamRelatedPage && !isHomepage && !isSettingsPage) {
            targetPath = '/teams/select';
          } else {
            targetPath = currentPath;
          }
        }
      }
      if (targetPath && targetPath !== currentPath) {
        console.log(
          `DEBUG: Attempting redirect from ${currentPath} to ${targetPath}`
        );
        router.replace(targetPath);
      } else {
        console.log(
          `DEBUG: No redirect needed. Current path: ${currentPath}, Target path: ${targetPath}`
        );
      }
      console.log('--- LAYOUT DEBUG: onAuthStateChanged End ---');
    },
    [router, pathname]
  );
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);
      setIsCheckingAuth(true);
      await handleRedirect(currentUser, pathname);
      setIsCheckingAuth(false);
    });
    return () => {
      unsubscribeAuth();
    };
  }, [pathname, router, handleRedirect]);
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
      <html lang='ja'>
        <body className={inter.className}>
          <div className='flex justify-center items-center min-h-screen'>
            読み込み中...
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang='ja'>
      <body className={inter.className}>
        <div className='min-h-screen'>
          <Header
            isLoggedIn={!!user}
            onLogoClick={handleLogoClick}
            teamId={teamId}
          />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
