export type TableSortDirection = "asc" | "desc";

export type TableSortState = {
  columnId: string;
  direction: TableSortDirection;
} | null;

export type TableViewState = {
  query: string;
  sort: TableSortState;
  filters: Record<string, string[]>;
  page: number;
};

export const DEFAULT_TABLE_VIEW: TableViewState = {
  query: "",
  sort: null,
  filters: {},
  page: 1,
};

const FILTER_PREFIX = "filter.";

export function tableViewFromSearchParams(
  params: URLSearchParams,
): TableViewState {
  const query = params.get("q")?.trim() ?? "";
  const columnId = params.get("sort")?.trim() ?? "";
  const dir = params.get("dir");
  const sort: TableSortState =
    columnId && (dir === "asc" || dir === "desc")
      ? { columnId, direction: dir }
      : null;

  const filters: Record<string, string[]> = {};
  for (const [key, value] of params.entries()) {
    if (!key.startsWith(FILTER_PREFIX) || !value) continue;
    const column = key.slice(FILTER_PREFIX.length);
    if (!column) continue;
    if (!filters[column]) filters[column] = [];
    if (!filters[column].includes(value)) filters[column].push(value);
  }

  const page = Number.parseInt(params.get("page") ?? "1", 10);

  return {
    query,
    sort,
    filters,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function searchParamsFromTableView(
  view: TableViewState,
  current: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
  const next = new URLSearchParams(current);
  next.delete("q");
  next.delete("sort");
  next.delete("dir");
  next.delete("page");
  for (const key of [...next.keys()]) {
    if (key.startsWith(FILTER_PREFIX)) next.delete(key);
  }

  if (view.query.trim()) next.set("q", view.query.trim());
  if (view.sort) {
    next.set("sort", view.sort.columnId);
    next.set("dir", view.sort.direction);
  }
  if (view.page > 1) next.set("page", String(view.page));

  for (const [columnId, values] of Object.entries(view.filters)) {
    for (const value of values) {
      if (value) next.append(`${FILTER_PREFIX}${columnId}`, value);
    }
  }

  return next;
}
