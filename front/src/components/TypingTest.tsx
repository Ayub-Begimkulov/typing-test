import { useState, useRef, useEffect, useMemo, useLayoutEffect } from "react";
import { useEvent } from "../hooks/useEvent";
import { useLatest } from "../hooks/useLatest";
import { isNumber } from "../utils";
import { TypingProgress } from "./TypingProgress";
import { Statistics } from "./Statistics";
import { WordConfig } from "../hooks/queries/useTestQuery";

interface TypingTestProps {
  timeDuration: number;
  inputText: string;
  wordsConfig: WordConfig[];
}

export function TypingTest({
  inputText,
  timeDuration,
  wordsConfig,
}: TypingTestProps) {
  const [status, setStatus] = useState<"stopped" | "started" | "finished">(
    "stopped"
  );
  const [typedText, setTypedText] = useState("");
  const [timePassed, setTimePassed] = useState(0);
  const [statistics, setStatistics] = useState({
    typed: 0,
    correct: 0,
    incorrect: 0,
  });

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const currentLetterRef = useRef<HTMLSpanElement>(null);
  const latestStatus = useLatest(status);
  const intervalId = useRef<number | null>(null);

  const startHandler = useEvent(() => {
    const textArea = textAreaRef.current;

    if (!textArea) {
      return;
    }

    if (status === "started") {
      return;
    }

    setStatus("started");

    textArea.focus();

    const startTime = performance.now();
    const timeDurationMs = timeDuration * 1_000;

    intervalId.current = setInterval(() => {
      const currentTime = performance.now();

      const newTimePassed = timePassed + currentTime - startTime;

      setTimePassed(newTimePassed);

      if (newTimePassed > timeDurationMs) {
        stopHandler(true);
      }
    }, 1_000);
  });

  const stopHandler = useEvent((ended: boolean = false) => {
    setStatus(ended ? "finished" : "stopped");

    if (isNumber(intervalId.current)) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  });

  const restart = () => {
    setStatistics({
      typed: 0,
      correct: 0,
      incorrect: 0,
    });
    setTypedText("");
    setStatus("stopped");
    setTimePassed(0);
  };

  useEffect(() => {
    const handleGlobalKeydown = (event: KeyboardEvent) => {
      const key = event.key;

      if (latestStatus.current === "started") {
        return;
      }

      if (key.length !== 1) {
        return;
      }

      startHandler();
    };

    window.addEventListener("keydown", handleGlobalKeydown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeydown);
    };
  }, [startHandler]);

  const handleTypedTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    setTypedText(newValue);

    if (newValue.length < typedText.length) {
      return;
    }

    const newCharIndex = newValue.length - 1;
    const newChar = newValue[newCharIndex];

    if (newChar === inputText[newCharIndex]) {
      setStatistics((stats) => ({
        ...stats,
        correct: stats.correct + 1,
        typed: stats.typed + 1,
      }));
    } else {
      setStatistics((stats) => ({
        ...stats,
        incorrect: stats.incorrect + 1,
        typed: stats.typed + 1,
      }));
    }
  };

  const handleBlur = () => {
    stopHandler();
  };

  const wpm = useMemo(() => {
    if (status !== "finished") {
      return;
    }

    let correctWords = 0;
    let incorrectWords = 0;

    let previousRangeEnd = 0;
    for (const item of wordsConfig) {
      if (item.range[1] >= typedText.length) {
        break;
      }

      const wordOriginal = inputText.slice(item.range[0], item.range[1]);
      const wordTyped = typedText.slice(item.range[0], item.range[1]);

      const symbolsBeforeOriginal = inputText.slice(
        previousRangeEnd,
        item.range[0]
      );
      const symbolsBeforeTyped = typedText.slice(
        previousRangeEnd,
        item.range[0]
      );

      if (
        symbolsBeforeOriginal === symbolsBeforeTyped &&
        wordOriginal === wordTyped
      ) {
        correctWords++;
      } else {
        incorrectWords++;
      }

      previousRangeEnd = item.range[1];
    }

    return (correctWords * 60) / timeDuration;
  }, [status, typedText, inputText]);

  if (status === "finished") {
    return (
      <Statistics
        accuracy={Math.round((statistics.correct / statistics.typed) * 100)}
        wpm={wpm!}
        restart={restart}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <textarea
        style={{ padding: "0", border: "0", height: 0, overflow: "hidden" }}
        ref={textAreaRef}
        value={typedText}
        onChange={handleTypedTextChange}
        onBlur={handleBlur}
      />
      <div>{status === "started" ? "Started" : "Start typing"}</div>
      <div>Time: {Math.floor(timeDuration - timePassed / 1_000)}</div>

      <TypingProgress
        text={inputText}
        textTyped={typedText}
        currentLetterRef={currentLetterRef}
      />
      <Caret targetElementRef={currentLetterRef} typedText={typedText} />

      {/* TODO delete */}
      <pre>{typedText}</pre>
    </div>
  );
}

interface CaretProps {
  typedText: string;
  targetElementRef: React.RefObject<HTMLElement>;
}

function Caret({ targetElementRef, typedText }: CaretProps) {
  const [rect, setRect] = useState<DOMRectReadOnly | null>(null);

  useLayoutEffect(() => {
    const element = targetElementRef.current;

    if (!element) {
      return;
    }

    const sizes = element.getBoundingClientRect();
    setRect(sizes);
  }, [typedText]);

  if (!rect) {
    return null;
  }

  return (
    <span
      style={{
        height: rect.height,
        width: 2,
        background: "yellow",
        position: "absolute",
        top: 0,
        left: 0,
        transform: `translate3d(${rect.left}px, ${rect.top}px, 0)`,
        transition: "transform 100ms",
      }}
    ></span>
  );
}
