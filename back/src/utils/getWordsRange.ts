export function getWordsRange(words: string[]) {
  let length = 0;
  const result = [];

  for (let i = 0, l = words.length; i < l; i++) {
    const word = words[i]!;

    result.push({
      type: "word",
      text: word,
      range: [length, length + word.length],
    });
    // add word length + space
    length += word.length + 1;
  }

  return result;
}
