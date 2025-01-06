import { Fragment, useMemo } from "react";

interface TypingProgressProps {
  text: string;
  textTyped: string;
}

export function TypingProgress({ text, textTyped }: TypingProgressProps) {
  const letters = useMemo(() => {
    const result: JSX.Element[] = [];

    const addWord = (word: string, separator: string, baseIndex: number) => {
      const separatorIndex = word.length + baseIndex;
      const separatorColor =
        textTyped.length > separatorIndex &&
        textTyped[separatorIndex] !== separator
          ? "#b73434"
          : undefined;

      result.push(
        <Fragment key={baseIndex}>
          <span>
            {word.split("").map((item, index) => {
              const typedLetter = textTyped[baseIndex + index];
              const color =
                typedLetter === item
                  ? "white"
                  : !typedLetter
                  ? "#a1a1a1"
                  : "red";
              return (
                <span key={index} style={{ color }}>
                  {item}
                </span>
              );
            })}
          </span>

          {separator !== undefined && (
            <span
              style={{
                backgroundColor: separatorColor,
                color: "#a1a1a1",
                borderRadius: 5,
              }}
            >
              {separator === "\n" ? "↩\n" : " "}
            </span>
          )}
        </Fragment>
      );
    };

    // let wordStart = 0;
    // let i = 0;
    // while (i < text.length + 1) {
    //   if (text[i] !== " " && text[i] !== "\n" && text[i] !== undefined) {
    //     i++;
    //     continue;
    //   }

    //   const word = text.slice(wordStart, i);

    //   let newWordStart = text.length;
    //   for (let j = i; j < text.length; j++) {
    //     if (text[j] !== " " && text[j] !== "\n") {
    //       newWordStart = j;
    //       break;
    //     }
    //   }

    //   const separator = text.slice(i, newWordStart);

    //   addWord(word, separator, wordStart);

    //   wordStart = newWordStart;
    //   i = newWordStart + 1;
    // }

    let wordStart = 0;
    for (let i = 0, l = text.length; i < l + 1; i++) {
      if (text[i] !== " " && text[i] !== "\n" && text[i] !== undefined) {
        continue;
      }

      // multiple space
      if (text[i] === " " && i === wordStart) {
        result.push(<span key={i}> </span>);
      } else {
        const word = text.slice(wordStart, i);
        addWord(word, text[i], wordStart);
      }
      wordStart = i + 1;
    }
    return result;
  }, [text, textTyped]);

  return <pre style={{ fontSize: "25px", padding: "0 24px" }}>{letters}</pre>;
}
