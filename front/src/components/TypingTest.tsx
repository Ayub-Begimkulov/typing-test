import { useState, useRef, useEffect, useMemo } from "react";
import { WORDS_INPUT } from "../constants/words";
import { useEvent } from "../hooks/useEvent";
import { useLatest } from "../hooks/useLatest";
import { isNumber } from "../utils";
import { TypingProgress } from "./TypingProgress";
import { Statistics } from "./Statistics";

interface TypingTestProps {
  timeDuration: number;
  inputText: string;
}

export function TypingTest({ inputText, timeDuration }: TypingTestProps) {
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

    if (newChar === WORDS_INPUT[newCharIndex]) {
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

    const typedWords = typedText.split(" ").filter(Boolean);
    const testWords = WORDS_INPUT.split(" ").filter(Boolean);

    const wordsTyped = typedWords.reduce((acc, word, index) => {
      if (word === testWords[index]) {
        return acc + 1;
      }

      return acc;
    }, 0);

    return (wordsTyped * 60) / timeDuration;
  }, [status, typedText, WORDS_INPUT]);

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
      <div>{status === "started" ? "Started" : "Start typing"}</div>
      <div>Time: {Math.floor(timeDuration - timePassed / 1_000)}</div>

      <TypingProgress text={inputText} textTyped={typedText} />

      <pre>{typedText}</pre>

      <textarea
        style={{ padding: "0", border: "0", height: 0, overflow: "hidden" }}
        ref={textAreaRef}
        value={typedText}
        onChange={handleTypedTextChange}
        onBlur={handleBlur}
      />
    </div>
  );
}
