
import { useQuery } from "@tanstack/react-query";
import { mockData } from "./mockData";

export function revenue() {
  const { isLoading, data: revCom } = useQuery({
    queryFn: () => Promise.resolve(mockData.rev),
    queryKey: ["revCom"],
  });

  return { isLoading, revCom };
}