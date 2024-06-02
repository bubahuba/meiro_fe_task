export type SortBy = "name" | "createdAt";
export type SortDir = "asc" | "desc";

export interface AttributesQueryParams {
  limit: number;
  offset: number;
  searchText: string;
  sortBy: SortBy;
  sortDir: SortDir;
}

export interface AttributesQueryResult {
  data: Attribute[];
  meta: {
    offset: number;
    limit: number;
    searchText: string;
    sortBy: SortBy;
    sortDir: SortDir;
    hasNextPage?: boolean;
  };
}

export interface Attribute {
  createdAt: string;
  deleted: boolean;
  id: string;
  labelIds: Label["id"][];
  name: string;
}

export interface Label {
  id: string;
  name: string;
}

export type LabelsQueryParams = {
  limit: number;
  offset: number;
};

export interface LabelsQueryResult {
  data: Label[];
  meta: {
    hasNextPage?: boolean;
    limit: number;
    offset: number;
  };
}

export interface AttributeQueryResult {
  data: Attribute;
}

export interface DeleteAttributeQueryParams {
  id: string;
  params: AttributesQueryParams;
}