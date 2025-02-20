import { useState, useRef, useEffect, useMemo } from "react";
import { useEvent, useLatest } from "../../shared/hooks";
import { WordConfig } from "../../shared/hooks/queries/useTestQuery";
import { TypingProgress } from "./components/TypingProgress";
import { Statistics } from "./components/Statistics";
import { Caret } from "./components/Caret";
import { TypingTimer } from "./services/typingTimer";
import { calculateTestResults, getLastWordRange } from "./utils";
import styles from "./TypingTest.module.scss";

const startTestKeys = ["Enter", "Backspace"];

interface TypingTestProps {
  duration: number;
  text: string;
  wordsConfig: WordConfig[];
  width: number;
}

export function TypingTest({
  text,
  duration,
  wordsConfig,
  width,
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

  const handleTestEnd = useEvent((timePassed: number) => {
    setStatus("finished");
    setTimePassed(timePassed);
  });
  const handleTimeUpdate = useEvent((timePassed: number) => {
    setTimePassed(timePassed);
  });

  const typingTimer = useMemo(() => {
    const durationMs = duration * 1_000;
    return new TypingTimer({
      duration: durationMs,
      onTimeUpdate: handleTimeUpdate,
      onEnd: handleTestEnd,
    });
  }, [duration, handleTimeUpdate, handleTestEnd]);

  const handleStartTest = useEvent(() => {
    const textArea = textAreaRef.current;

    if (!textArea) {
      return;
    }

    if (status === "started") {
      return;
    }

    setStatus("started");

    textArea.focus();

    typingTimer.start();
  });

  const handleStopTest = useEvent(() => {
    setStatus("stopped");
    typingTimer.stop();
  });

  const handleRestart = () => {
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

      // ignore keys that don't change text (f keys, shift, meta etc.)
      if (!startTestKeys.includes(key) && key.length !== 1) {
        return;
      }

      handleStartTest();
    };

    window.addEventListener("keydown", handleGlobalKeydown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeydown);
    };
  }, [handleStartTest]);

  const handleTypedTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setTypedText(newValue);

    // only calculate statistics for newly typed chars
    if (newValue.length > typedText.length) {
      const newCharIndex = newValue.length - 1;
      const newChar = newValue[newCharIndex];

      if (newChar === text[newCharIndex]) {
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
    }

    if (newValue.length === text.length) {
      const lastWordRange = getLastWordRange(text);
      const lastWordOriginal = text.slice(...lastWordRange);
      const lastWordTyped = newValue.slice(...lastWordRange);

      // the length of the typed and original text is same
      // and last word doesn't have typos - finish test
      if (lastWordTyped === lastWordOriginal) {
        typingTimer.finish();
      }
    } else if (newValue.length > text.length) {
      // the last word had a typo, however the user
      // continued typing, therefor we finish test...
      typingTimer.finish();
    } else {
      // if the time already past, but interval wasn't
      // called yet, we must stop the timer
      typingTimer.checkForTime();
    }
  };

  const wpm = useMemo(() => {
    if (status !== "finished") {
      return;
    }

    return calculateTestResults({
      wordsConfig,
      text,
      typedText,
      timePassed,
    });
  }, [status, typedText, text, timePassed, wordsConfig]);

  if (status === "finished") {
    return (
      <Statistics
        accuracy={Math.round((statistics.correct / statistics.typed) * 100)}
        wpm={wpm!}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className={styles.typingTest}>
      <textarea
        className={styles.typingTestTextarea}
        ref={textAreaRef}
        value={typedText}
        onChange={handleTypedTextChange}
        onBlur={handleStopTest}
      />
      <div className={styles.typingTestStatus}>
        {status === "started" ? "Started" : "Start typing"}
      </div>
      <div className={styles.typingTestTime}>
        Time: {Math.floor(duration - timePassed / 1_000)}
      </div>

      <TypingProgress
        text={text}
        typedText={typedText}
        currentLetterRef={currentLetterRef}
        width={width}
      />
      <Caret
        targetElementRef={currentLetterRef}
        typedText={typedText}
        text={text}
      />
    </div>
  );
}
