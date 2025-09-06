'use client';

import { usePathname } from 'next/navigation';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import AuthProvider, {
  useAuthContext,
} from '@/components/providers/AuthProvider';
import { ErrorBoundary, LoadingSpinner } from '@/components/ui';

interface ClientLayoutContentProps {
  children: React.ReactNode;
}

function ClientLayoutContent({ children }: ClientLayoutContentProps) {
  const pathname = usePathname();
  const { user, teamId, isCheckingAuth, handleLogoClick } = useAuthContext();

  if (isCheckingAuth) {
    return (
      <div className='flex flex-col justify-center items-center min-h-screen'>
        <LoadingSpinner size='lg' />
        <p className='text-gray-600 mt-4'>認証情報を確認中...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className='min-h-screen flex flex-col'>
        {!pathname.startsWith('/event') && (
          <Header
            isLoggedIn={!!user}
            teamId={teamId}
            onLogoClick={handleLogoClick}
          />
        )}
        <main className='flex-1 px-4 sm:px-6 py-4 sm:py-6'>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </AuthProvider>
  );
}
