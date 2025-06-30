import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='bg-transparent py-12 text-center text-black border-t border-gray-300/50'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='flex flex-col items-center space-y-6'>
          <div className='flex items-center space-x-6'>
            <Link
              href='https://x.com/rii_3112'
              target='_blank'
              rel='noopener noreferrer'
              className='group relative p-3 bg-gray-200/60 backdrop-blur-sm rounded-xl hover:bg-gray-300/80 transition-all duration-300 hover:scale-110 hover:shadow-lg'
              aria-label='Follow us on X'
            >
              <svg
                className='w-6 h-6 text-gray-700 group-hover:text-black transition-colors'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </svg>
            </Link>
          </div>

          <div className='border-t border-gray-300/50 pt-6 w-full max-w-md'>
            <p className='text-sm text-gray-600 font-light'>
              &copy; {new Date().getFullYear()} SonaBase. All rights reserved.
            </p>
            <p className='text-xs text-gray-500 mt-2'>
              Emergency food management system
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
