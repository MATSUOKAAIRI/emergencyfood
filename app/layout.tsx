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
  const [user, setUser] = useState<unknown>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const handleRedirect = useCallback(
    async (currentUser: unknown, currentPath: string) => {
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
          if (
            currentUser &&
            typeof currentUser === 'object' &&
            'getIdTokenResult' in currentUser &&
            typeof (currentUser as { getIdTokenResult: unknown })
              .getIdTokenResult === 'function'
          ) {
            const idTokenResult = await (
              currentUser as {
                getIdTokenResult: (forceRefresh?: boolean) => Promise<{
                  claims: { teamId?: string };
                }>;
              }
            ).getIdTokenResult(true);
            userTeamId = (idTokenResult.claims.teamId as string | null) || null;
          }
        } catch (_error) {
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
        router.replace(targetPath);
      } else {
      }
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
        <div className='min-h-screen flex flex-col'>
          {!pathname.startsWith('/event') && (
            <Header
              isLoggedIn={!!user}
              teamId={teamId}
              onLogoClick={handleLogoClick}
            />
          )}
          <main className='flex-1 px-4 sm:px-6 py-4 sm:py-6'>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
