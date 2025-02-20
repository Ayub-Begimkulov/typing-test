import type { WordConfig } from "../../../shared/hooks/queries/useTestQuery";

interface CalculateTestResultsOptions {
  text: string;
  typedText: string;
  wordsConfig: WordConfig[];
  timePassed: number;
}

export function calculateTestResults({
  wordsConfig,
  typedText,
  text,
  timePassed,
}: CalculateTestResultsOptions) {
  let correctWords = 0;
  let incorrectWords = 0;

  let previousRangeEnd = 0;
  for (const item of wordsConfig) {
    if (item.range[1] >= typedText.length) {
      break;
    }

    const wordOriginal = text.slice(item.range[0], item.range[1]);
    const wordTyped = typedText.slice(item.range[0], item.range[1]);

    const symbolsBeforeOriginal = text.slice(previousRangeEnd, item.range[0]);
    const symbolsBeforeTyped = typedText.slice(previousRangeEnd, item.range[0]);

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
}
