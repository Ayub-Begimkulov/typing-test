import { random } from "./random.js";

export function shuffle<T>(array: T[]) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = random(0, i);

    swap(copy, i, j);
  }

  return copy;
}

function swap<T>(arr: T[], idx1: number, idx2: number) {
  const temp = arr[idx1]!;
  arr[idx1] = arr[idx2]!;
  arr[idx2] = temp;
}
