import { useQuery } from "@tanstack/react-query";
import { request } from "../../../shared/utils";

export interface WordConfig {
  text: string;
  range: [number, number];
  type: string;
}

export interface TypingTest {
  type: string;
  text: string;
  words: WordConfig[];
}

export function useTestQuery(type: string) {
  const { data: testData, ...rest } = useQuery({
    queryKey: ["typing-tests", type],
    queryFn: () => request<TypingTest>(`/typing-tests/${type}`),
  });

  return {
    testData,
    ...rest,
  };
}
