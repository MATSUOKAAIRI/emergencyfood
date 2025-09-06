import React from 'react';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

/**
 * Skip link for keyboard navigation accessibility
 * Allows users to skip to main content
 */
export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      className='
        sr-only focus:not-sr-only
        focus:absolute focus:top-4 focus:left-4
        bg-blue-600 text-white
        px-4 py-2 rounded-md
        font-medium text-sm
        z-50
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      '
      href={href}
    >
      {children}
    </a>
  );
}
