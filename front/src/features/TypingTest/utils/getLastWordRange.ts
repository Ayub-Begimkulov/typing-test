import { isSpaceOrLineBreak } from "./isSpaceOrLineBreak";

export function getLastWordRange(typedText: string) {
  let i = typedText.length - 1;

  // make it 0, since if there are more than 1 word
  // in our test - we will update it.
  // otherwise, it's a correct start of the last word
  let lastWordIndexStart = 0;

  while (i--) {
    const prev = typedText[i];
    const next = typedText[i + 1];

    if (isSpaceOrLineBreak(prev) && !isSpaceOrLineBreak(next)) {
      lastWordIndexStart = i + 1;
      break;
    }
  }

  // we have trimmed content file, so we don't account
  // for trailing spaces/new lines
  return [lastWordIndexStart, typedText.length - 1];
}
