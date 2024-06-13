import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import apiClient from "./apiClient";
import { AttributesQueryResult, DeleteAttributeQueryParams } from "./types";

const deleteAttribute = async (id: string): Promise<AttributesQueryResult> => {
  const { data } = await apiClient.delete(`/attributes/${id}`);

  return data;
};

export const useAttributeDeleteApi = () => {
  const queryClient = useQueryClient();

  return useMutation<AttributesQueryResult, Error, DeleteAttributeQueryParams>({
    mutationFn: (params) => deleteAttribute(params.id),
    onMutate: async ({ params }) => {
      await queryClient.cancelQueries({
        queryKey: ["Attributes", params ],
      });
    },
    onSettled: (_data, _error, params ) => {

      return queryClient.invalidateQueries({ queryKey: ["Attributes", params ] });
    },
  });
};
