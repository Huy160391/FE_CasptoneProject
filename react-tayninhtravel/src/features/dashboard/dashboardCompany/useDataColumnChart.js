
import { useQuery } from "@tanstack/react-query";
import { mockData } from "./mockData";

export function useDataColumnChart() {
  const { isLoading, data: dataColumnChartCompany } = useQuery({
    queryFn: () => Promise.resolve(mockData.dataColumnChart),
    queryKey: ["dataColumnChartCompany"],
  });

  return { isLoading, dataColumnChartCompany };
}