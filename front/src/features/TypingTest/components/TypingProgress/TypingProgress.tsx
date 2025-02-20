import { memo, useMemo } from "react";
import styles from "./TypingProgress.module.scss";
import {
  calculateLineRanges,
  calculateVisibleTextRange,
  iterateTextParts,
} from "../../utils";
import { Word } from "../Word";
import { Separator } from "../Separator";

const LINES_TO_RENDER = 16;

interface TypingProgressProps {
  text: string;
  typedText: string;
  currentLetterRef: React.RefObject<HTMLSpanElement>;
  width: number;
}

export const TypingProgress = memo(function TypingProgress({
  text,
  typedText,
  currentLetterRef,
  width,
}: TypingProgressProps) {
  const lineRanges = useMemo(() => {
    return calculateLineRanges(text);
  }, [text]);

  const letters = useMemo(() => {
    const result: JSX.Element[] = [];

    const caretItemIndex = Math.min(typedText.length, text.length - 1);

    const visibleRange = calculateVisibleTextRange(
      text,
      typedText,
      lineRanges,
      LINES_TO_RENDER
    );

    iterateTextParts(
      text,
      ({ type, part, range }) => {
        const caret =
          range[0] <= caretItemIndex && caretItemIndex <= range[1]
            ? { index: caretItemIndex - range[0], ref: currentLetterRef }
            : undefined;

        const typed =
          range[0] < typedText.length
            ? typedText.slice(range[0], range[1] + 1)
            : undefined;

        if (type === "word") {
          result.push(
            <Word key={range[0]} word={part} typed={typed} caret={caret} />
          );
        } else {
          result.push(
            <Separator
              key={range[0]}
              separator={part}
              typed={typed}
              caret={caret}
            />
          );
        }
      },
      visibleRange
    );

    return result;
  }, [text, typedText, lineRanges, currentLetterRef]);

  return (
    <div className={styles.typingProgress} style={{ width }}>
      {letters}
    </div>
  );
});
