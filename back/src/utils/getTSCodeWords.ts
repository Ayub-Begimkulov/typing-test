import { AST_TOKEN_TYPES, parse } from "@typescript-eslint/typescript-estree";
import { getTSCodeTokens } from "./getTSCodeTokens.js";

interface GetTSCodeWordsOptions {
  jsx?: boolean;
}

export interface TSCodeWord {
  text: string;
  type: AST_TOKEN_TYPES;
  range: [number, number];
}

export function getTSCodeWords(
  code: string,
  { jsx = true }: GetTSCodeWordsOptions = {}
) {
  const parsed = parse(code, { tokens: true, comment: true, jsx });

  return getTSCodeTokens(parsed.tokens, parsed.comments).map((token) => ({
    text: token.value,
    type: token.type,
    range: token.range,
  }));
}
