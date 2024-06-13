import apiClient from "./apiClient";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AttributesQueryParams, AttributesQueryResult } from "./types";

const getAttributes = async (
  params: AttributesQueryParams
): Promise<AttributesQueryResult> => {
  const { data } = await apiClient.get(`/attributes`, { params });

  return data;
};

export const useAttributesApi = (params: AttributesQueryParams) => {
  return useInfiniteQuery<AttributesQueryResult, Error>({
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage
        ? lastPage.meta.offset + lastPage.data.length
        : undefined,
    queryFn: async ({ pageParam }) =>
      getAttributes({ ...params, offset: pageParam as number }),
    queryKey: ["Attributes", params ],
  });
};
