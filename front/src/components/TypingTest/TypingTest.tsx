import { useState, useRef, useEffect, useMemo } from "react";
import { useEvent } from "../../hooks/useEvent";
import { useLatest } from "../../hooks/useLatest";
import { isNumber } from "../../utils";
import { TypingProgress } from "../TypingProgress";
import { Statistics } from "../Statistics";
import { WordConfig } from "../../hooks/queries/useTestQuery";
import { Caret } from "../Caret";

class TypingTimer {
  private intervalId: number | null = null;
  private timePassed: number = 0;
  private prevTime: number | null = null;

  constructor(
    private config: {
      duration: number;
      onEnd: (timePassed: number) => void;
      onTimeUpdate: (timePassed: number) => void;
    }
  ) {}

  start() {
    if (isNumber(this.intervalId)) {
      return;
    }

    this.prevTime = performance.now();
    this.intervalId = setInterval(() => {
      this.checkForTime();
    }, 1_000);
  }

  stop() {
    if (!isNumber(this.intervalId)) {
      return;
    }

    this.updateTimePassed();

    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  checkForTime() {
    if (!isNumber(this.intervalId)) {
      return;
    }

    this.updateTimePassed();

    if (this.timePassed >= this.config.duration) {
      this.finishTimer();
    } else {
      this.config.onTimeUpdate(this.timePassed);
    }
  }

  // public method since we can finish test
  // before the timer runs out. so we need the ability to
  // stop at any point
  finish() {
    if (!isNumber(this.intervalId)) {
      return;
    }

    this.updateTimePassed();
    this.finishTimer();
  }

  private finishTimer() {
    if (!isNumber(this.intervalId)) {
      return;
    }

    const { timePassed } = this;

    clearInterval(this.intervalId);
    this.intervalId = null;
    this.prevTime = null;
    this.timePassed = 0;

    this.config.onEnd(timePassed);
  }

  private updateTimePassed() {
    if (!isNumber(this.prevTime)) {
      return;
    }

    const now = performance.now();
    this.timePassed = this.timePassed + now - this.prevTime;
    this.prevTime = now;
  }
}

interface TypingTestProps {
  timeDuration: number;
  inputText: string;
  wordsConfig: WordConfig[];
  width: number;
}

export function TypingTest({
  inputText,
  timeDuration,
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
    const durationMs = timeDuration * 1_000;
    return new TypingTimer({
      duration: durationMs,
      onTimeUpdate: handleTimeUpdate,
      onEnd: handleTestEnd,
    });
  }, [timeDuration, handleTimeUpdate, handleTestEnd]);

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

    typingTimer.start();
  });

  const stopHandler = useEvent(() => {
    setStatus("stopped");
    typingTimer.stop();
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

    // only calculate statistics for newly typed chars
    if (newValue.length > typedText.length) {
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
    }

    if (newValue.length === inputText.length) {
      // last word has error
      let lastWordIndex;
      let prev = inputText[inputText.length - 1];
      for (let i = inputText.length - 2; i >= 0; i--) {
        const current = inputText[i];
        if (
          prev !== "\n" &&
          prev !== " " &&
          (current === " " || current === "\n")
        ) {
          lastWordIndex = i + 1;
          break;
        }
        prev = current;
      }
      const lastWord = inputText.slice(lastWordIndex, inputText.length);

      if (lastWord === newValue.slice(lastWordIndex, inputText.length)) {
        typingTimer.finish();
      }
    } else if (newValue.length > inputText.length) {
      // if there is an error in last word but person continues typing
      // TODO check for space here???
      typingTimer.finish();
    } else {
      // interval might be called after the event, but if the
      // time passed - we shouldn't wait to stop
      typingTimer.checkForTime();
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

    return (correctWords * 60) / (timePassed / 1_000);
  }, [status, typedText, inputText, timePassed]);

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
        width: "100%",
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
        width={width}
      />
      <Caret targetElementRef={currentLetterRef} typedText={typedText} />
    </div>
  );
}
