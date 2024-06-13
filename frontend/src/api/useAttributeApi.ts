import apiClient from "./apiClient";
import { useQuery } from "@tanstack/react-query";
import { AttributeQueryResult } from "./types";

const getAttribute = async (id: string): Promise<AttributeQueryResult> => {
  const { data } = await apiClient.get(`/attributes/${id}`);

  return data;
};

export const useAttributeApi = (id: string) => {
  return useQuery<AttributeQueryResult, Error>({
    queryFn: async () => getAttribute(id),
    queryKey: ["Attribute", { id }],
  });
};
