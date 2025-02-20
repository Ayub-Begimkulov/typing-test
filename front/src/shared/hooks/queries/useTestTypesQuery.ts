import { useQuery } from "@tanstack/react-query";
import { request } from "../../../shared/utils";

export interface TestType {
  type: string;
  name: string;
}

export function useTestTypesQuery() {
  const { data: types, ...rest } = useQuery({
    queryKey: ["typing-tests"],
    queryFn: () => request<TestType[]>("/typing-tests"),
  });

  return {
    types,
    ...rest,
  };
}
