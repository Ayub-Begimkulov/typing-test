import { useMemo } from "react";

interface TypingProgressProps {
  text: string;
  textTyped: string;
}

export function TypingProgress({ text, textTyped }: TypingProgressProps) {
  const letters = useMemo(() => {
    return text.split("").map((item, index) => {
      const typedLetter = textTyped[index];
      const color =
        typedLetter === item ? "white" : !typedLetter ? "#a1a1a1" : "red";

      return (
        <span key={index} style={{ color }}>
          {item}
        </span>
      );
    });
  }, [text, textTyped]);

  return <pre style={{ fontSize: "25px", padding: "0 24px" }}>{letters}</pre>;
}
