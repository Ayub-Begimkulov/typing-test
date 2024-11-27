import { useEffect, useMemo, useRef, useState } from "react";
import { useLatest } from "./hooks/useLatest";
import { isNumber } from "./utils";
import { useEvent } from "./hooks/useEvent";

/*

- собирать статистику (слова в минуту + точность)
- управление клавиатурой (стар / следующий тест)
  - restart по клику на alt+r

- каретка???
- (точность времени???)
- пропускать по проблему??? (возможно не стоит)

*/

// const ignoreKeysForStart = [
//   "Backspace",
//   "ShiftRight",
//   "ShiftLeft",
//   "AltLeft",
//   "AltRight",
//   "Space",
//   "Tab",
//   "Escape",
//   "MetaLeft",
//   "MetaRight",
//   "F1",
//   "F2",
//   "F3",
//   "F4",
//   "F5",
//   "F6",
//   "F7",
//   "F8",
//   "F9",
//   "F10",
//   "F11",
//   "F12",
// ];

const testInput =
  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, eaque.";

const TIME_DURATION = 10_000;

export function App() {
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

    intervalId.current = setInterval(() => {
      const currentTime = performance.now();

      const newTimePassed = timePassed + currentTime - startTime;

      setTimePassed(newTimePassed);

      if (newTimePassed > TIME_DURATION) {
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

    if (newChar === testInput[newCharIndex]) {
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
    const testWords = testInput.split(" ").filter(Boolean);

    const wordsTyped = typedWords.reduce((acc, word, index) => {
      if (word === testWords[index]) {
        return acc + 1;
      }

      return acc;
    }, 0);

    return (wordsTyped * 60_000) / TIME_DURATION;
  }, [status, typedText, testInput]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {status === "finished" ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div>Your are done!</div>
          <div>
            <div>
              Accuracy:{" "}
              {Math.round((statistics.correct / statistics.typed) * 100)}%
            </div>
            <div>WPM: {wpm}</div>
          </div>
          <button onClick={restart}>Restart</button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div>{status === "started" ? "Started" : "Start typing"}</div>
          <div>Time: {Math.floor(timePassed / 1_000)}</div>

          <TypingProgress text={testInput} textTyped={typedText} />

          <div>{typedText}</div>
          <textarea
            style={{ padding: "0", border: "0", height: 0, overflow: "hidden" }}
            ref={textAreaRef}
            value={typedText}
            onChange={handleTypedTextChange}
            onBlur={handleBlur}
          />
        </div>
      )}
    </div>
  );
}

interface TypingProgressProps {
  text: string;
  textTyped: string;
}

function TypingProgress({ text, textTyped }: TypingProgressProps) {
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

  return <div style={{ fontSize: "25px" }}>{letters}</div>;
}
