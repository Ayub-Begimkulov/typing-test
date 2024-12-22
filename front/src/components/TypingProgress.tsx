import { useMemo } from "react";

interface TypingProgressProps {
  text: string;
  textTyped: string;
}

export function TypingProgress({ text, textTyped }: TypingProgressProps) {
  const letters = useMemo(() => {
    const result: JSX.Element[] = [];

    const addWord = (word: string, separator: string, baseIndex: number) => {
      result.push(
        <span key={result.length}>
          {word.split("").map((item, index) => {
            const typedLetter = textTyped[baseIndex + index];
            const color =
              typedLetter === item ? "white" : !typedLetter ? "#a1a1a1" : "red";
            return (
              <span key={index} style={{ color }}>
                {item}
              </span>
            );
          })}
        </span>
      );
      result.push(<span key={result.length}>{separator}</span>);
    };

    let wordStart = 0;
    for (let i = 0, l = text.length; i < l; i++) {
      if (text[i] !== " " && text !== "\n") {
        continue;
      }

      const word = text.slice(wordStart, i);
      addWord(word, text[i], i);

      wordStart = i + 1;
    }
    return result;
    // return text.split(" ").map((word, baseIndex) => (
    //   <span key={baseIndex}>
    //     {word.split("").map((item, index) => {
    //       const typedLetter = textTyped[baseIndex + index];
    //       const color =
    //         typedLetter === item ? "white" : !typedLetter ? "#a1a1a1" : "red";

    //       return (
    //         <span key={baseIndex + index} style={{ color }}>
    //           {item}
    //         </span>
    //       );
    //     })}
    //   </span>
    // ));
  }, [text, textTyped]);

  return <pre style={{ fontSize: "25px", padding: "0 24px" }}>{letters}</pre>;
}
