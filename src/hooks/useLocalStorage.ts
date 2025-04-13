import { useState } from "react";

export function useLocalStorage<T>(
  key: string
): [T | undefined, (value: T | undefined) => void] {
  const [value, setValue] = useState<T | undefined>(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : undefined;
    }
    return undefined;
  });

  const setLocalStorageValue = (newValue: T | undefined) => {
    if (typeof window !== "undefined") {
      if (newValue !== undefined) {
        localStorage.setItem(key, JSON.stringify(newValue));
      } else {
        localStorage.removeItem(key);
      }
      setValue(newValue);
    }
  };

  return [value, setLocalStorageValue];
}
