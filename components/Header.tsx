'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const shouldHideNavLinks =
    pathname.startsWith('/auth/') ||
    pathname === '/' ||
    pathname.startsWith('/event') ||
    pathname.startsWith('/teams');

  const shouldShowNavLinks =
    (isLoggedIn && !shouldHideNavLinks && pathname.startsWith('/foods')) ||
    pathname.startsWith('/settings');

  const getUrlWithTeamId = (basePath: string) => {
    return teamId ? `${basePath}?teamId=${teamId}` : basePath;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: getUrlWithTeamId('/foods/list'), label: '非常食リスト' },
    { href: getUrlWithTeamId('/foods/add'), label: '非常食登録' },
    { href: getUrlWithTeamId('/foods/archived'), label: '過去の非常食' },
    { href: getUrlWithTeamId('/settings'), label: '設定' },
  ];

  return (
    <header className='bg-white shadow-sm border-b border-gray-300 py-4 z-50 sticky top-0 w-full relative'>
      <div className='container mx-auto px-4 flex justify-between items-center'>
        <button
          className='text-xl font-bold cursor-pointer text-black hover:text-gray-700 transition-colors'
          onClick={onLogoClick}
        >
          SonaBase
        </button>

        {shouldShowNavLinks && (
          <>
            <nav className='hidden md:flex items-center space-x-6'>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  className='text-gray-700 hover:text-black transition-colors font-medium'
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <button
              className='md:hidden p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 transition-colors'
              onClick={toggleMenu}
              aria-label='メニューを開く'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                ) : (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                )}
              </svg>
            </button>
          </>
        )}
      </div>

      {shouldShowNavLinks && isMenuOpen && (
        <div className='md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg'>
          <nav className='container mx-auto px-4 py-4 space-y-2'>
            {navLinks.map(link => (
              <Link
                key={link.href}
                className='block py-3 px-4 text-gray-700 hover:text-black hover:bg-gray-50/80 rounded-lg transition-all duration-200 font-medium'
                href={link.href}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
