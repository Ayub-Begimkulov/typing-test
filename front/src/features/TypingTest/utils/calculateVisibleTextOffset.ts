// calculate how much lines we should skip
// at the top so that we don't render more than
// `linesToRender`
export function calculateVisibleTextOffset(
  text: string,
  textTyped: string,
  totalLines: number,
  linesToRender: number
) {
  if (totalLines <= linesToRender) {
    return 0;
  }

  let linesTyped = 0;
  let lastLineStartIndex = 0;
  let prevLineStartIndex = 0;

  for (let i = 0, l = text.length; i < l; i++) {
    if (i >= textTyped.length) {
      break;
    }

    if (text[i] === "\n") {
      linesTyped++;
      prevLineStartIndex = lastLineStartIndex;
      lastLineStartIndex = i + 1;
    }

    // +1 since we keep one line at the top
    if (totalLines - linesTyped + 1 === linesToRender) {
      break;
    }
  }

  return prevLineStartIndex;
}
