import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='bg-transparent py-8 sm:py-12 text-center text-black border-t border-gray-300/50 mt-auto'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6'>
        <div className='flex flex-col items-center space-y-4 sm:space-y-6'>
          <div className='flex items-center space-x-4 sm:space-x-6'>
            <Link
              aria-label='Follow us on X'
              className='group relative p-2 sm:p-3 bg-gray-200/60 backdrop-blur-sm rounded-xl hover:bg-gray-300/80 transition-all duration-300 hover:scale-110 hover:shadow-lg'
              href='https://x.com/rii_3112'
              rel='noopener noreferrer'
              target='_blank'
            >
              <svg
                className='w-5 h-5 sm:w-6 sm:h-6 text-gray-700 group-hover:text-black transition-colors'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </svg>
            </Link>
          </div>

          <div className='border-t border-gray-300/50 pt-4 sm:pt-6 w-full max-w-md'>
            <p className='text-xs sm:text-sm text-gray-600 font-light'>
              &copy; {new Date().getFullYear()} SonaBase. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
