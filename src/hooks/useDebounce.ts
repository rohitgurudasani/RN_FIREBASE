import {useEffect, useCallback, DependencyList} from 'react';

export default function useDebounce(
  func: () => void,
  dependencies: DependencyList,
  delay: number,
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(func, dependencies);

  useEffect(() => {
    const timeout = setTimeout(callback, delay);
    return () => clearTimeout(timeout);
  }, [callback, delay]);
}
