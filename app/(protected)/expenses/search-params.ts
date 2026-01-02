import {
  parseAsString,
  parseAsInteger,
  parseAsArrayOf,
  createLoader,
} from "nuqs/server";

export const expensesSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(""),
  category: parseAsArrayOf(parseAsString).withDefault([]),
  verified: parseAsArrayOf(parseAsString).withDefault([]),
  sortBy: parseAsString.withDefault("created_at"),
  sortOrder: parseAsString.withDefault("desc"),
};

export const loadExpensesSearchParams = createLoader(expensesSearchParams);
