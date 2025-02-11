import { Fragment, memo, useMemo } from "react";

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

              const color =
                typedLetter === item
                  ? "white"
                  : !typedLetter
                  ? "#a1a1a1"
                  : "red";

              return (
                <span
                  ref={ref}
                  key={index}
                  style={{ color, position: "relative" }}
                >
                  {item}
                </span>
              );
            })}
          </span>

          {separator.split("").map((item, index) => {
            const separatorIndex = baseIndex + word.length + index;

            const separatorColor =
              textTyped.length > separatorIndex &&
              textTyped[separatorIndex] !== item
                ? "#b73434"
                : undefined;
            const separatorRef =
              separatorIndex === textTyped.length
                ? currentLetterRef
                : undefined;

            return (
              <Fragment key={index}>
                <span
                  ref={separatorRef}
                  style={{
                    backgroundColor: separatorColor,
                    color: "#a1a1a1",
                    borderRadius: 5,
                    whiteSpace: "pre-wrap",
                  }}
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

    let wordStart = 0;
    let i = 0;
    while (i < text.length + 1) {
      if (text[i] !== " " && text[i] !== "\n" && text[i] !== undefined) {
        i++;
        continue;
      }

      const word = text.slice(wordStart, i);

      let newWordStart = text.length;
      for (let j = i; j < text.length; j++) {
        if (text[j] !== " " && text[j] !== "\n") {
          newWordStart = j;
          break;
        }
      }

      const separator = text.slice(i, newWordStart);

      addWord(word, separator, wordStart);

      wordStart = newWordStart;
      i = newWordStart + 1;
    }

    return result;
  }, [text, textTyped, currentLetterRef]);

  return (
    <div
      style={{
        fontSize: "25px",
        fontFamily: "monospace",
        padding: "0 24px",
        whiteSpace: "normal",
        maxWidth: "100%",
      }}
    >
      {letters}
    </div>
  );
});
