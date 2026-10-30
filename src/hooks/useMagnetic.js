import { useRef } from 'react';

/**
 * useMagnetic - Neutralized (No cursor attaching/pulling)
 * Returns a stable ref without translating elements toward the cursor.
 */
export function useMagnetic() {
  const ref = useRef(null);
  return ref;
}

export default useMagnetic;

