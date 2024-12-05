export const TS_CODE_INPUT = `import { useCallback } from "react";
import { useLatest } from "./useLatest";

export function useEvent<T extends Function>(fn: T) {
  const latestFn = useLatest(fn);

  const eventCb = useCallback((...args: any[]) => {
    return latestFn.current(...args);
  }, []) as unknown as T;

  return eventCb;
}
`;
