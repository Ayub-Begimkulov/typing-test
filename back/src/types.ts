export type TestType =
  | "typescript"
  | "javascript"
  | "typescript-jsx"
  | "javascript-jsx"
  | "english";

interface TestTypeOption {
  name: string;
  type: TestType;
}

export const testTypes: TestTypeOption[] = [
  {
    type: "english",
    name: "english",
  },
  {
    type: "javascript",
    name: "javascript",
  },
  {
    type: "typescript",
    name: "typescript",
  },
  {
    type: "typescript-jsx",
    name: "typescript jsx",
  },
  {
    type: "javascript-jsx",
    name: "javascript jsx",
  },
];
