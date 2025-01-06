import { getTSCodeWords } from "./utils/getTSCodeWords.js";

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

function getWordsFromText(text: string) {
  const result = [];
  let start = 0;

  for (let i = 0, l = text.length; i < l + 1; i++) {
    if (text[i] !== " " && text[i] !== "\n" && text[i] !== undefined) {
      continue;
    }

    if (start === i) {
      start++;
      continue;
    }

    const word = text.slice(start, i);

    result.push({
      text: word,
      type: "word",
      range: [start, i],
    });

    start = i + 1;
  }

  return result;
}

export const testsMap = {
  words: {
    type: "english",
    text: WORDS_INPUT,
    words: getWordsFromText(WORDS_INPUT),
  },
  typescript: {
    type: "typescript",
    text: TS_CODE_INPUT,
    words: getTSCodeWords(TS_CODE_INPUT),
  },
};
