import { autoUpdate } from "@floating-ui/dom";
import { useState, useLayoutEffect, useRef } from "react";

interface CaretProps {
  typedText: string;
  targetElementRef: React.RefObject<HTMLElement>;
}

export function Caret({ targetElementRef, typedText }: CaretProps) {
  const [rect, setRect] = useState({ height: 0, top: 0, left: 0 });
  const caretRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const targetElement = targetElementRef.current;
    const caretElement = caretRef.current;

    if (!targetElement || !caretElement) {
      return;
    }

    const cleanup = autoUpdate(targetElement, caretElement, () => {
      setRect(targetElement.getBoundingClientRect());
    });

    return cleanup;
  }, [typedText]);

  return (
    <span
      ref={caretRef}
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
