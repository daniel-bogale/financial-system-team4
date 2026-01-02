import {
  parseAsString,
  parseAsInteger,
  parseAsArrayOf,
  createLoader,
} from "nuqs/server";

export const cashRequestsSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(""),
  status: parseAsArrayOf(parseAsString).withDefault([]),
  sortBy: parseAsString.withDefault("created_at"),
  sortOrder: parseAsString.withDefault("desc"),
};

export const loadCashRequestsSearchParams = createLoader(
  cashRequestsSearchParams
);
