// Lazy loading components for better performance
import { lazy } from 'react';

// Form Components - Lazy loaded for better initial page load
export const LazySupplyForm = lazy(
  () => import('@/components/supplies/SupplyForm')
);

// Modal Components - Only load when needed
export const LazyModal = lazy(() => import('./Modal'));
export const LazyConfirmDialog = lazy(() => import('./ConfirmDialog'));

// Chart/Analytics Components (if you add them later)
// export const LazyChart = lazy(() => import('./Chart'));
// export const LazyAnalytics = lazy(() => import('./Analytics'));

// Heavy components that are not immediately visible
export const LazySupplySort = lazy(
  () => import('@/components/supplies/SupplySort')
);
