'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { auth, onAuthStateChanged } from '@/utils/firebase';

interface AuthContextType {
  user: unknown;
  teamId: string | null;
  isCheckingAuth: boolean;
  handleLogoClick: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
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
        currentPath.startsWith('/supplies/') ||
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
          if (
            !isAllowedForTeamUsersPage &&
            !isAuthPage &&
            !isHomepage &&
            !isEventPage
          ) {
            targetPath = `/supplies/list?teamId=${userTeamId}`;
          } else {
            targetPath = currentPath;
          }
        } else {
          if (
            !isTeamRelatedPage &&
            !isHomepage &&
            !isSettingsPage &&
            !isAuthPage &&
            !isEventPage
          ) {
            targetPath = '/teams/select';
          } else {
            targetPath = currentPath;
          }
        }
      }

      if (targetPath && targetPath !== currentPath) {
        router.replace(targetPath);
      }
    },
    [router, pathname]
  );

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const unsubscribeAuth = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);
      setIsCheckingAuth(true);

      // デバウンス処理で無限ループを防ぐ
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          await handleRedirect(currentUser, pathname);
        } catch (error) {
          console.error('Redirect error:', error);
        } finally {
          setIsCheckingAuth(false);
        }
      }, 100);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribeAuth();
    };
  }, [pathname, router, handleRedirect]);

  const handleLogoClick = useCallback(() => {
    if (isCheckingAuth) return;
    if (!user) {
      router.push('/');
    } else if (teamId !== null) {
      router.push(`/supplies/list?teamId=${teamId}`);
    } else {
      router.push('/teams/select');
    }
  }, [isCheckingAuth, user, teamId, router]);

  const contextValue: AuthContextType = {
    user,
    teamId,
    isCheckingAuth,
    handleLogoClick,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
