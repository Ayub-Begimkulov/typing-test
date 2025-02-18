export function calculateTotalLines(text: string) {
  let totalLines = text.length > 0 ? 1 : 0;

  for (let i = 0, l = text.length; i < l; i++) {
    if (text[i] === "\n" && i !== text.length - 1) {
      totalLines++;
    }
  }

  return totalLines;
}
