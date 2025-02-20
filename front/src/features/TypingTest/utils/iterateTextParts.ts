import { isSpaceOrLineBreak } from "./isSpaceOrLineBreak";

type TextPart = "word" | "separator";

interface IterateTextPartsCallbackOptions {
  type: TextPart;
  part: string;
  range: [number, number];
}

export function iterateTextParts(
  text: string,
  cb: (options: IterateTextPartsCallbackOptions) => void,
  visibleRange: [number, number]
) {
  const [visibleRangeStart, visibleRangeEnd] = visibleRange;
  let type: "word" | "separator" = isSpaceOrLineBreak(text[visibleRangeStart])
    ? "separator"
    : "word";
  let index = visibleRangeStart + 1;
  let rangeStart = visibleRange[0];

  while (index <= visibleRangeEnd) {
    if (visibleRangeEnd === index && type === "word") {
      const word = text.slice(rangeStart, index + 1);

      cb({
        type: "word",
        part: word,
        range: [rangeStart, index],
      });

      index++;
    } else if (visibleRangeEnd === index && type === "separator") {
      const separator = text.slice(rangeStart, index + 1);

      cb({
        type: "separator",
        part: separator,
        range: [rangeStart, index],
      });

      index++;
    } else if (isSpaceOrLineBreak(text[index]) && type === "separator") {
      index++;
    } else if (isSpaceOrLineBreak(text[index]) && type == "word") {
      const word = text.slice(rangeStart, index);

      cb({
        type: "word",
        part: word,
        range: [rangeStart, index - 1],
      });

      type = "separator";
      rangeStart = index;
      index++;
    } else if (!isSpaceOrLineBreak(text[index]) && type === "separator") {
      const separator = text.slice(rangeStart, index);

      cb({
        type: "separator",
        part: separator,
        range: [rangeStart, index - 1],
      });

      type = "word";
      rangeStart = index;
      index++;
    } else if (!isSpaceOrLineBreak(text[index]) && type === "word") {
      index++;
    }
  }
}
