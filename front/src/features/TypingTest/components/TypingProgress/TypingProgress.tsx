import { Fragment, memo, useMemo } from "react";
import styles from "./TypingProgress.module.scss";
import clsx from "clsx";
import {
  calculateLineRanges,
  calculateVisibleTextRange,
  isSpaceOrLineBreak,
} from "../../utils";
import { isNumber } from "../../../../shared/utils";

const LINES_TO_RENDER = 16;

interface TypingProgressProps {
  text: string;
  textTyped: string;
  currentLetterRef: React.RefObject<HTMLSpanElement>;
  width: number;
}

export const TypingProgress = memo(function TypingProgress({
  text,
  textTyped,
  currentLetterRef,
  width,
}: TypingProgressProps) {
  const lineRanges = useMemo(() => {
    return calculateLineRanges(text);
  }, [text]);

  const letters = useMemo(() => {
    const result: JSX.Element[] = [];
    const caretItemIndex = Math.min(textTyped.length, text.length - 1);

    const addWord = (word: string, separator: string, baseIndex: number) => {
      result.push(
        <Fragment key={baseIndex}>
          <span>
            {word.split("").map((item, index) => {
              const itemIndex = baseIndex + index;
              const typedLetter = textTyped[itemIndex];
              const ref =
                itemIndex === caretItemIndex ? currentLetterRef : undefined;

              return (
                <span
                  ref={ref}
                  key={index}
                  className={clsx(styles.typingProgressLetter, {
                    [styles.typingProgressLetter_correct]: typedLetter === item,
                    [styles.typingProgressLetter_error]:
                      typedLetter && typedLetter !== item,
                  })}
                >
                  {item}
                </span>
              );
            })}
          </span>

          {separator.split("").map((item, index) => {
            const separatorIndex = baseIndex + word.length + index;

            const isError =
              textTyped.length > separatorIndex &&
              textTyped[separatorIndex] !== item;
            const separatorRef =
              separatorIndex === caretItemIndex ? currentLetterRef : undefined;

            return (
              <Fragment key={index}>
                <span
                  ref={separatorRef}
                  className={clsx(
                    styles.typingProgressSeparator,
                    isError && styles.typingProgressSeparator_error
                  )}
                >
                  {item === "\n" ? "↩" : " "}
                </span>
                {item === "\n" && <br />}
              </Fragment>
            );
          })}
        </Fragment>
      );
    };

    const visibleRange = calculateVisibleTextRange(
      text,
      textTyped,
      lineRanges,
      LINES_TO_RENDER
    );

    let i = visibleRange[0];
    const end = visibleRange[1];

    let wordStart = i;

    while (i <= end) {
      // if the last index isn't whitespace, we must add
      // the word ourself
      if (!isSpaceOrLineBreak(text[i]) && i === end) {
        addWord(text.slice(wordStart, i + 1), "", wordStart);
        break;
      }

      if (!isSpaceOrLineBreak(text[i])) {
        i++;
        continue;
      }

      const word = text.slice(wordStart, i);

      let newWordStart: number | null = null;
      for (let j = i + 1; j <= end; j++) {
        if (!isSpaceOrLineBreak(text[j])) {
          newWordStart = j;
          break;
        }
      }

      if (isNumber(newWordStart)) {
        const separator = text.slice(i, newWordStart);
        addWord(word, separator, wordStart);
        wordStart = newWordStart;
        i = newWordStart;
      } else {
        // we only enter this case if the text has
        // whitespaces at the end.
        const separator = text.slice(i, end + 1);
        addWord(word, separator, wordStart);
        break;
      }
    }

    return result;
  }, [text, textTyped, lineRanges, currentLetterRef]);

  return (
    <div className={styles.typingProgress} style={{ width }}>
      {letters}
    </div>
  );
});

interface WordProps {
  word: string;
  baseIndex: number;
  textTyped: string;
}

function Word({ word, baseIndex, textTyped }: WordProps) {
  return (
    <span>
      {word.split("").map((item, index) => {
        const itemIndex = baseIndex + index;
        const typedLetter = textTyped[itemIndex];
        const ref = itemIndex === caretItemIndex ? currentLetterRef : undefined;

        return (
          <span
            ref={ref}
            key={index}
            className={clsx(styles.typingProgressLetter, {
              [styles.typingProgressLetter_correct]: typedLetter === item,
              [styles.typingProgressLetter_error]:
                typedLetter && typedLetter !== item,
            })}
          >
            {item}
          </span>
        );
      })}
    </span>
  );
}

interface SeparatorProps {
  separator: string;
  baseIndex: number;
  textTyped: string;
}

function Separator({ separator, textTyped, baseIndex }: SeparatorProps) {
  return (
    <Fragment key={baseIndex}>
      {separator.split("").map((item, index) => {
        const separatorIndex = baseIndex + index;

        const isError =
          textTyped.length > separatorIndex &&
          textTyped[separatorIndex] !== item;
        const separatorRef =
          separatorIndex === caretItemIndex ? currentLetterRef : undefined;

        return (
          <Fragment key={index}>
            <span
              ref={separatorRef}
              className={clsx(
                styles.typingProgressSeparator,
                isError && styles.typingProgressSeparator_error
              )}
            >
              {item === "\n" ? "↩" : " "}
            </span>
            {item === "\n" && <br />}
          </Fragment>
        );
      })}
    </Fragment>
  );
}
