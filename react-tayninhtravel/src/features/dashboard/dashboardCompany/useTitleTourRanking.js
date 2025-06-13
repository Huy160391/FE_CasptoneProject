
import { useQuery } from "@tanstack/react-query";
import { mockData } from "./mockData";

export function useTitleTourRanking() {
  const { isLoading, data: titleTourRankingCompany } = useQuery({
    queryFn: () => Promise.resolve(mockData.titleTourRanking),
    queryKey: ["titleTourRankingCompany"],
  });

  return { isLoading, titleTourRankingCompany };
}