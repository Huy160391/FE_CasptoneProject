
import { useQuery } from "@tanstack/react-query";
import { mockData } from "./mockData";

export function useTourRanking() {
  const { isLoading, data: tourRankingCompany } = useQuery({
    queryFn: () => Promise.resolve(mockData.tourRanking),
    queryKey: ["tourRankingCompany"],
  });

  return { isLoading, tourRankingCompany };
}