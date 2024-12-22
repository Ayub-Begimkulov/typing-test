import { useQuery } from "@tanstack/react-query";
import { request } from "../../utils/request";

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
    queryKey: ["typing-test", type],
    queryFn: () => request<TypingTest>(`/typing-tests/${type}`),
  });

  return {
    testData,
    ...rest,
  };
}
