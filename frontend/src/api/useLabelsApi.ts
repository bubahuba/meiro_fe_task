import apiClient from "./apiClient";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LabelsQueryParams, LabelsQueryResult } from "./types";

const getLabels = async (
  params: LabelsQueryParams
): Promise<LabelsQueryResult> => {
  const { data } = await apiClient.get(`/labels`, { params });

  return data;
};

export const useLabelsApi = (params: LabelsQueryParams) => {
  return useInfiniteQuery<LabelsQueryResult, Error>({
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage
        ? lastPage.meta.offset + lastPage.data.length
        : undefined,
    queryFn: async ({ pageParam }) =>
      getLabels({ ...params, offset: pageParam as number }),
    queryKey: ["Labels", params ],
  });
};
