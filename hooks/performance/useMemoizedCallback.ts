import { useCallback, useRef } from 'react';

/**
 * Enhanced useCallback that compares dependencies deeply
 * Useful for preventing unnecessary re-renders
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const ref = useRef<{ deps: React.DependencyList; callback: T } | undefined>(
    undefined
  );

  // Deep comparison of dependencies
  const depsChanged =
    !ref.current ||
    deps.length !== ref.current.deps.length ||
    deps.some((dep, i) => dep !== ref.current!.deps[i]);

  if (depsChanged) {
    ref.current = { deps, callback };
  }

  return useCallback(ref.current!.callback, deps);
}
