import { useEffect, useRef, useState } from "react";
import { useLatest } from "./hooks/useLatest";
import { isNumber } from "./utils";

/*

- рассчитывать время
- собирать статистику (слова в минуту + точность)
- управление клавиатурой (стар / следующий тест)
- показывать ошибки / прогресс по ходу написания

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

const TIME_DURATION = 30_000;

export function App() {
  const [started, setStarted] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [timePassed, setTimePassed] = useState(0);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const latestStarted = useLatest(started);

  console.log(typedText);

  useEffect(() => {
    let intervalId: number | null = null;

    const handleGlobalKeydown = (event: KeyboardEvent) => {
      console.log(event);
      const key = event.key;

      if (latestStarted.current) {
        return;
      }

      if (key.length !== 1) {
        return;
      }
      const textArea = textAreaRef.current;

      if (!textArea) {
        return;
      }

      textArea.focus();
      setStarted(true);

      const startTime = performance.now();
      intervalId = setInterval(() => {
        const newTimePassed = performance.now() - startTime;
        setTimePassed(Math.floor(newTimePassed / 1000));
        if (newTimePassed > TIME_DURATION) {
          setStarted(false);
          if (isNumber(intervalId)) {
            clearInterval(intervalId);
          }
          intervalId = null;
        }
      }, 1_000);
    };

    window.addEventListener("keydown", handleGlobalKeydown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeydown);
      if (isNumber(intervalId)) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const handleTypedTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTypedText(e.target.value);
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div>{started ? "Started" : "Start typing"}</div>
      <div>Time: {timePassed}</div>
      <div style={{ fontSize: "25px" }}>{testInput}</div>
      <div>{typedText}</div>
      <textarea
        style={{ padding: "0", border: "0", height: 0, overflow: "hidden" }}
        ref={textAreaRef}
        value={typedText}
        onChange={handleTypedTextChange}
      />
    </div>
  );
}
