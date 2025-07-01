'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onLogoClick: () => void;
  isLoggedIn: boolean;
  teamId?: string | null;
}

export default function Header({
  onLogoClick,
  isLoggedIn,
  teamId,
}: HeaderProps) {
  const pathname = usePathname();

  const shouldHideNavLinks = pathname.startsWith('/auth/') || pathname === '/';

  const getUrlWithTeamId = (basePath: string) => {
    return teamId ? `${basePath}?teamId=${teamId}` : basePath;
  };

  return (
    <header className='bg-transparent py-5 z-20 sticky top-0 w-full'>
      <div className='container mx-auto flex justify-between items-center'>
        <button
          className='text-xl font-bold cursor-pointer ml-2 text-black'
          onClick={onLogoClick}
        >
          SonaBase
        </button>

        {isLoggedIn && (
          <nav className='flex items-center'>
            {!shouldHideNavLinks && (
              <>
                <Link
                  className='mr-4 text-black hover:text-gray-600 text-base sm:text-lg'
                  href={getUrlWithTeamId('/foods/list')}
                >
                  非常食リスト
                </Link>
                <Link
                  className='mr-4 text-black hover:text-gray-600 text-base sm:text-lg'
                  href={getUrlWithTeamId('/foods/add')}
                >
                  非常食登録
                </Link>
                <Link
                  className='mr-4 text-black hover:text-gray-600 text-base sm:text-lg'
                  href={getUrlWithTeamId('/foods/archived')}
                >
                  過去の非常食
                </Link>
                <Link
                  className='mr-4 text-black hover:text-gray-600 text-base sm:text-lg'
                  href={getUrlWithTeamId('/settings')}
                >
                  設定
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
