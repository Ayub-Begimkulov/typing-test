export const TS_CODE_INPUT = `import { useCallback } from "react";
import { useLatest } from "./useLatest";

const a = 'qwerty';
const b = 42;
interface Foo {
 bar: string;
}
const c = null;
const d = /\d+/

/**
 * Foo bar  
 * @type number
 * 
*/ 
export function useEvent<T extends Function>(fn: T) {
  // foo bar
  const latestFn = useLatest(fn);

  const eventCb = useCallback((...args: any[]) => {
    return latestFn.current(...args);
  }, []) as unknown as T;

  return eventCb;
}
`;

export const WORDS_INPUT =
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, eaque.";

export const testsMap = {
  words: WORDS_INPUT,
  typescript: TS_CODE_INPUT,
};
