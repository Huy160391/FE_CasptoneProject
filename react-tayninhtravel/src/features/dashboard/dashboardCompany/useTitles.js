import { useQuery } from "@tanstack/react-query";
import { mockData } from "./mockData";

export function useTitles() {
  const { isLoading, data: titlesCompany } = useQuery({
    queryFn: () => Promise.resolve(mockData.titles),
    queryKey: ["titlesCompany"],
  });

  return { isLoading, titlesCompany };
}