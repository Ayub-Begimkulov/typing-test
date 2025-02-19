export function calculateVisibleTextRange(
  text: string,
  textTyped: string,
  lineRanges: [number, number][],
  linesToRender: number
) {
  if (lineRanges.length <= linesToRender) {
    return [0, text.length];
  }

  // make a type assertion here (i.e bang operator `!`)
  // since `textTyped.length` can't be longer then `text`
  // therefor we must always find correct line if our code works
  const currentTypingLineIndex = calculateCurrentLineIndex(
    lineRanges,
    textTyped.length
  )!;

  // -1 since we add one line at the top
  let topLineIndex = Math.max(currentTypingLineIndex - 1, 0);
  let bottomLineIndex = topLineIndex + linesToRender - 1;

  if (bottomLineIndex > lineRanges.length) {
    bottomLineIndex = lineRanges.length - 1;
    topLineIndex = lineRanges.length - linesToRender;
  }

  return [lineRanges[topLineIndex][0], lineRanges[bottomLineIndex][1]];
}

function calculateCurrentLineIndex(
  ranges: [number, number][],
  typedTextLength: number
) {
  // we search current line based on next index where we will
  // type. so we need an additional case for the last char, since
  // we can't type past it
  if (typedTextLength - 1 === ranges[ranges.length - 1][1]) {
    return ranges.length - 1;
  }

  // we calculate current line based on the index
  // to which we will type next.
  // e.g. if we typed the first line fully
  // we will be moved to the second line
  // even though we haven't wrote there anything yet
  const nextTypingIndex = typedTextLength;

  let start = 0;
  let end = ranges.length - 1;

  while (start <= end) {
    const rangeIndex = Math.floor(start + (end - start) / 2);
    const range = ranges[rangeIndex];

    if (nextTypingIndex >= range[0] && nextTypingIndex <= range[1]) {
      return rangeIndex;
    } else if (nextTypingIndex < range[0]) {
      end = rangeIndex - 1;
    } else {
      start = rangeIndex + 1;
    }
  }
}
