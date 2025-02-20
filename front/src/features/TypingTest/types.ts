export interface TextPartProps {
  typed?: string;
  caret?: { index: number; ref: React.RefObject<HTMLElement> };
}
