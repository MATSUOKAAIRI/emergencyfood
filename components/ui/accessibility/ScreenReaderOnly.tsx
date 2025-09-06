import React from 'react';

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Component that renders content only for screen readers
 * Visually hidden but accessible to assistive technologies
 */
export function ScreenReaderOnly({
  children,
  as: Component = 'span',
}: ScreenReaderOnlyProps) {
  return <Component className='sr-only'>{children}</Component>;
}
