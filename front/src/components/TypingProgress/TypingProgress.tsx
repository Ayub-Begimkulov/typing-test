import { Fragment, memo, useMemo } from "react";
import styles from "./TypingProgress.module.scss";
import clsx from "clsx";

const LINES_TO_RENDER = 16;

function getStartOffset(
  text: string,
  textTyped: string,
  totalLines: number,
  linesToRender: number
) {
  if (totalLines <= linesToRender) {
    return 0;
  }

  let linesTyped = 0;
  let lastLine = 0;
  let prevLine = 0;

  for (let i = 0, l = text.length; i < l; i++) {
    if (i >= textTyped.length) {
      break;
    }

    if (text[i] === "\n") {
      linesTyped++;
      prevLine = lastLine;
      lastLine = i + 1;
    }

    // +1 since we keep one line at the top
    if (totalLines - linesTyped + 1 === linesToRender) {
      break;
    }
  }

  return prevLine;
}

interface TypingProgressProps {
  text: string;
  textTyped: string;
  currentLetterRef: React.RefObject<HTMLSpanElement>;
}

export const TypingProgress = memo(function TypingProgress({
  text,
  textTyped,
  currentLetterRef,
}: TypingProgressProps) {
  const totalLines = useMemo(() => {
    let totalLines = text.length > 0 ? 1 : 0;

    for (let i = 0, l = text.length; i < l; i++) {
      if (text[i] === "\n" && i !== text.length - 1) {
        totalLines++;
      }
    }

    return totalLines;
  }, [text]);

  const letters = useMemo(() => {
    const result: JSX.Element[] = [];

    const addWord = (word: string, separator: string, baseIndex: number) => {
      result.push(
        <Fragment key={baseIndex}>
          <span>
            {word.split("").map((item, index) => {
              const itemIndex = baseIndex + index;
              const typedLetter = textTyped[itemIndex];
              const ref =
                itemIndex === textTyped.length ? currentLetterRef : undefined;

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
              separatorIndex === textTyped.length
                ? currentLetterRef
                : undefined;

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

    let i = getStartOffset(text, textTyped, totalLines, LINES_TO_RENDER);
    let wordStart = i;
    let linesRendered = 0;

    while (i < text.length + 1) {
      if (text[i] !== " " && text[i] !== "\n" && text[i] !== undefined) {
        i++;
        continue;
      }

      const word = text.slice(wordStart, i);

      let newWordStart = text.length;
      for (let j = i; j < text.length; j++) {
        if (text[j] === "\n") {
          linesRendered++;
          if (linesRendered >= LINES_TO_RENDER) {
            newWordStart = j;
            break;
          }
        }

        if (text[j] !== " " && text[j] !== "\n") {
          newWordStart = j;
          break;
        }
      }

      const separator = text.slice(i, newWordStart);

      addWord(word, separator, wordStart);

      if (linesRendered >= LINES_TO_RENDER) {
        break;
      }

      wordStart = newWordStart;
      i = newWordStart + 1;
    }

    return result;
  }, [text, textTyped, totalLines, currentLetterRef]);

  return <div className={styles.typingProgress}>{letters}</div>;
});
