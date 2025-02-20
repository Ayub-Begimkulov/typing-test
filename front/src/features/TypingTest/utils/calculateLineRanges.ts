export function calculateLineRanges(text: string) {
  const ranges: [number, number][] = [];

  let lineStart = 0;
  for (let i = 0, l = text.length; i < l; i++) {
    if (text[i] === "\n") {
      ranges.push([lineStart, i]);
      lineStart = i + 1;
    }
  }

  return ranges;
}
