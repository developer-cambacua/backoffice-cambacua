import { useEffect, useState } from "react";

export function useDebounce<T>(
  value: T,
  delay: number
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return [debounced, setDebounced];
}
