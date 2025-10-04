'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function EventHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/event/supplies', label: '備蓄品リスト' },
    { href: '/event/supplies/add', label: '備蓄品登録' },
    { href: '/event/supplies/archived', label: '過去の備蓄品' },
    { href: '/event/settings', label: '設定' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogoClick = () => {
    window.location.href = '/event';
  };

  return (
    <header className='bg-white shadow-sm border-b border-gray-300 py-4 z-50 sticky top-0 w-full'>
      <div className='container mx-auto px-4 flex justify-between items-center'>
        <button
          className='text-xl font-bold cursor-pointer text-black hover:text-gray-700 transition-colors'
          onClick={handleLogoClick}
        >
          技育博2025
        </button>

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
          aria-label='メニューを開く'
          className='md:hidden p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 transition-colors'
          onClick={toggleMenu}
        >
          <svg
            className='w-6 h-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            {isMenuOpen ? (
              <path
                d='M6 18L18 6M6 6l12 12'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
              />
            ) : (
              <path
                d='M4 6h16M4 12h16M4 18h16'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
              />
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
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
