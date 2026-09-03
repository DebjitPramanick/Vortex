import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "@components/atoms/button";
import { ChevronUpIcon, ChevronDownIcon, FunnelIcon } from "@icons";
import { cx } from "../../cx.ts";
import { FilterPopup } from "./FilterPopup.tsx";
import {
  DEFAULT_TABLE_VIEW,
  type TableSortDirection,
  type TableViewState,
} from "./tableViewState.ts";
import "./table.css";
import useStickyOffsets from "./useStickyOffset.ts";

export type { TableSortDirection, TableViewState } from "./tableViewState.ts";

type TableColumnBase<T> = {
  id: string;
  header: string;
  sticky?: boolean;
  render: (row: T) => ReactNode;
};

type TableColumnSort<T> =
  | {
      sortable?: true;
      getSortValue: (row: T) => string | number | null;
    }
  | {
      sortable: false;
      getSortValue?: never;
    };

type TableColumnFilter<T> =
  | {
      filterable?: true;
      getFilterValue: (row: T) => string;
    }
  | {
      filterable: false;
      getFilterValue?: never;
    };

export type TableColumn<T> = TableColumnBase<T> &
  TableColumnSort<T> &
  TableColumnFilter<T>;

export type TableProps<T> = {
  ref?: React.RefObject<HTMLDivElement>;
  rows: T[];
  columns: TableColumn<T>[];
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  getSearchValue?: (row: T) => string;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  view?: TableViewState;
  onViewChange?: (view: TableViewState) => void;
};

type SortState = TableViewState["sort"];

function compareValues(
  a: string | number | null,
  b: string | number | null,
  direction: TableSortDirection,
): number {
  const empty = direction === "asc" ? 1 : -1;
  if (a == null && b == null) return 0;
  if (a == null) return empty;
  if (b == null) return -empty;

  const result =
    typeof a === "number" && typeof b === "number"
      ? a - b
      : String(a).localeCompare(String(b), undefined, { numeric: true });

  return direction === "asc" ? result : -result;
}

function SortButton({
  direction,
  onCycle,
}: {
  direction: TableSortDirection | null;
  onCycle: () => void;
}) {
  const isAsc = direction === "asc";
  const label =
    direction === null
      ? "Sort ascending"
      : isAsc
        ? "Sort descending"
        : "Clear sort";

  return (
    <Button
      size="sm"
      variant="ghost"
      icon={isAsc ? <ChevronUpIcon /> : <ChevronDownIcon />}
      aria-label={label}
      className={cx(direction && "vx-table-icon-active")}
      onClick={onCycle}
    />
  );
}

export function Table<T>({
  rows,
  columns,
  getRowId,
  searchPlaceholder = "Search",
  getSearchValue,
  pageSize = 10,
  loading = false,
  emptyMessage = "No rows to display.",
  onRowClick,
  className,
  view: viewProp,
  onViewChange,
  ref,
}: TableProps<T>) {
  const { setThRef, columnOffsets } = useStickyOffsets(columns);
  const [internalView, setInternalView] = useState(DEFAULT_TABLE_VIEW);

  const view = viewProp ?? internalView;
  const { query, sort, filters, page } = view;

  const updateView = (next: TableViewState) => {
    if (viewProp && onViewChange) onViewChange(next);
    else setInternalView(next);
  };

  const filterAnchorRef = useRef<HTMLElement | null>(null);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const haystack = getSearchValue
        ? getSearchValue(row)
        : columns
            .map((column) =>
              column.filterable === false ? "" : column.getFilterValue(row),
            )
            .join(" ");
      return haystack.toLowerCase().includes(q);
    });
  }, [columns, getSearchValue, query, rows]);

  const filtered = useMemo(() => {
    return searched.filter((row) =>
      columns.every((column) => {
        if (column.filterable === false) return true;
        const selected = filters[column.id];
        if (!selected?.length) return true;
        return selected.includes(column.getFilterValue(row));
      }),
    );
  }, [columns, filters, searched]);

  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    for (const column of columns) {
      if (column.filterable === false) continue;
      const values = new Set<string>();
      for (const row of rows) {
        values.add(column.getFilterValue(row));
      }
      options[column.id] = [...values].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      );
    }
    return options;
  }, [columns, rows]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const column = columns.find((item) => item.id === sort.columnId);
    if (!column || column.sortable === false) return filtered;
    return [...filtered].sort((a, b) =>
      compareValues(
        column.getSortValue(a),
        column.getSortValue(b),
        sort.direction,
      ),
    );
  }, [columns, filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage =
    loading && rows.length === 0
      ? Math.max(1, page)
      : Math.min(Math.max(1, page), pageCount);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [pageSize, safePage, sorted]);

  const rangeStart = sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, sorted.length);

  const cycleSort = (columnId: string) => {
    const nextSort: SortState =
      sort?.columnId !== columnId
        ? { columnId, direction: "asc" }
        : sort.direction === "asc"
          ? { columnId, direction: "desc" }
          : null;
    updateView({ ...view, sort: nextSort, page: 1 });
  };

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    row: T,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick?.(row);
    }
  };

  const closeFilter = useCallback(() => {
    filterAnchorRef.current = null;
    setOpenFilterId(null);
  }, []);

  const toggleFilter = (columnId: string, anchor: HTMLElement) => {
    if (openFilterId === columnId) {
      filterAnchorRef.current = null;
      setOpenFilterId(null);
      return;
    }
    filterAnchorRef.current = anchor;
    setOpenFilterId(columnId);
  };

  const toggleFilterValue = (columnId: string, value: string) => {
    const selected = new Set(filters[columnId] ?? []);
    if (selected.has(value)) selected.delete(value);
    else selected.add(value);
    updateView({
      ...view,
      filters: { ...filters, [columnId]: [...selected] },
      page: 1,
    });
  };

  const clearFilter = (columnId: string) => {
    updateView({
      ...view,
      filters: { ...filters, [columnId]: [] },
      page: 1,
    });
  };

  const openFilterColumn = columns.find((column) => column.id === openFilterId);

  return (
    <div className={cx("vx-table", className)} ref={ref}>
      <div className="vx-table-toolbar">
        <label className="vx-table-search">
          <span className="sr-only">{searchPlaceholder}</span>
          <input
            className="vx-input"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) =>
              updateView({ ...view, query: event.target.value, page: 1 })
            }
          />
        </label>
        <div className="vx-table-toolbar-lead">
          <span className="vx-meta">
            {loading ? "Loading…" : `${sorted.length} rows`}
          </span>
        </div>
      </div>

      <div className="vx-table-scroll">
        <table className="vx-table-grid">
          <thead>
            <tr>
              {columns.map((column) => {
                const direction =
                  sort?.columnId === column.id ? sort.direction : null;
                const filterOpen = openFilterId === column.id;
                const filterActive = Boolean(filters[column.id]?.length);
                return (
                  <th
                    key={column.id}
                    scope="col"
                    className={cx(column.sticky && "vx-table-th-sticky")}
                    ref={setThRef(column.id)}
                    data-col={column.id}
                  >
                    <div className="vx-table-th">
                      <span>{column.header}</span>
                      <span className="vx-table-th-actions">
                        {column.sortable !== false ? (
                          <SortButton
                            direction={direction}
                            onCycle={() => cycleSort(column.id)}
                          />
                        ) : null}
                        {column.filterable !== false ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            icon={<FunnelIcon />}
                            className={cx(
                              (filterOpen || filterActive) &&
                                "vx-table-icon-active",
                            )}
                            aria-label={`Filter ${column.header}`}
                            aria-expanded={filterOpen}
                            aria-haspopup="dialog"
                            onClick={(event) =>
                              toggleFilter(column.id, event.currentTarget)
                            }
                          />
                        ) : null}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr className="vx-table-empty-row">
                <td colSpan={columns.length}>
                  {loading ? "Loading…" : emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={getRowId(row)}
                  tabIndex={onRowClick ? 0 : undefined}
                  className={
                    onRowClick ? "vx-table-row-interactive" : undefined
                  }
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(event) => handleRowKeyDown(event, row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cx(column.sticky && "vx-table-td-sticky")}
                      style={{
                        left: columnOffsets[column.id] ?? 0,
                      }}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="vx-table-pagination">
        <p className="vx-table-page-status">
          {sorted.length === 0
            ? "No results"
            : `Showing ${rangeStart}–${rangeEnd} of ${sorted.length}`}
        </p>
        <div className="vx-table-page-controls">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={safePage <= 1}
            onClick={() =>
              updateView({ ...view, page: Math.max(1, safePage - 1) })
            }
          >
            Previous
          </Button>
          <span className="vx-table-page-index">
            Page {safePage} of {pageCount}
          </span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={safePage >= pageCount || sorted.length === 0}
            onClick={() => updateView({ ...view, page: safePage + 1 })}
          >
            Next
          </Button>
        </div>
      </div>

      <FilterPopup
        open={Boolean(openFilterColumn)}
        columnId={openFilterColumn?.id ?? ""}
        title={
          openFilterColumn ? `Filter ${openFilterColumn.header}` : "Filter"
        }
        options={
          openFilterColumn ? (filterOptions[openFilterColumn.id] ?? []) : []
        }
        selected={openFilterColumn ? (filters[openFilterColumn.id] ?? []) : []}
        anchorRef={filterAnchorRef}
        onToggle={(value) => {
          if (openFilterColumn) toggleFilterValue(openFilterColumn.id, value);
        }}
        onClear={() => {
          if (openFilterColumn) clearFilter(openFilterColumn.id);
        }}
        onClose={closeFilter}
      />
    </div>
  );
}
