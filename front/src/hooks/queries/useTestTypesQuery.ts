import { useQuery } from "@tanstack/react-query";
import { request } from "../../utils/request";

export function useTestTypesQuery() {
  const { data: types, ...rest } = useQuery({
    queryKey: ["typingTests"],
    queryFn: () => request<string[]>("/typing-tests"),
  });

  return {
    types,
    ...rest,
  };
}
