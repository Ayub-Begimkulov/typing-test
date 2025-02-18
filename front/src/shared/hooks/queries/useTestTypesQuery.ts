import { useQuery } from "@tanstack/react-query";
import { request } from "../../../shared/utils";

export function useTestTypesQuery() {
  const { data: types, ...rest } = useQuery({
    queryKey: ["typing-tests"],
    queryFn: () => request<string[]>("/typing-tests"),
  });

  return {
    types,
    ...rest,
  };
}
