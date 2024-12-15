import { parse } from "@typescript-eslint/typescript-estree";
import { getTSCodeTokens } from "./getTSCodeTokens.js";

export function getTSCodeWords(code: string) {
  const parsed = parse(code, { tokens: true, comment: true, jsx: true });

  return getTSCodeTokens(parsed.tokens, parsed.comments).map((token) => ({
    word: token.value,
    type: token.type,
    range: token.range,
  }));
}
