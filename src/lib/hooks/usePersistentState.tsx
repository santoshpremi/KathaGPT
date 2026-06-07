import { useState } from "react";

/**
 * Hook to create a state that is persisted in the local storage
 *
 * @param key - key for the local storage
 * @param value - initital value
 * @returns [state, stateDispatcher] - tuple with the state and the dispatch function
 */
export default function usePersistentState<T>(key: string, value: T) {
  const getStoredValue = () => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return value;
      const parsed = JSON.parse(item);
      return parsed as T;
    } catch (error) {
      console.warn(`Error reading ${key} from localStorage:`, error);
      return value;
    }
  };
  const [state, setInternalState] = useState<T>(getStoredValue());

  const setState = (newValue: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    } finally {
      setInternalState(newValue);
    }
  };
  return [state, setState] as const;
}
