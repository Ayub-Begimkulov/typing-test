import {
  AST_TOKEN_TYPES,
  TSESTree,
} from "@typescript-eslint/typescript-estree";

const notWordTokens = [AST_TOKEN_TYPES.Punctuator];

export function getTSCodeTokens(
  tokens: TSESTree.Token[],
  comments: TSESTree.Comment[]
) {
  const result = [];

  let tokensIndex = 0;
  let commentsIndex = 0;

  while (tokensIndex < tokens.length || commentsIndex < comments.length) {
    const token = tokens[tokensIndex];
    const comment = comments[commentsIndex];

    if (notWordTokens.includes(token.type)) {
      tokensIndex++;
      continue;
    }

    const tokenRangeStart = token?.range[0] ?? Infinity;
    const commentRangeStart = comment?.range[0] ?? Infinity;

    if (tokenRangeStart < commentRangeStart) {
      tokensIndex++;
      result.push(token);
    } else {
      commentsIndex++;
      result.push(comment);
    }
  }

  return result;
}
