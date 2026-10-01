import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  RotateCcw,
} from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  accessor?: (row: T) => any;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  width?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string | number;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  showCountBadge?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T | ((row: T) => string | number | boolean | null | undefined))[];
  searchFilter?: (row: T, query: string) => boolean;
  toolbarActions?: React.ReactNode;
  initialSortKey?: string;
  initialSortDirection?: 'asc' | 'desc';
  pageSizeOptions?: number[];
  initialPageSize?: number;
  showPagination?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  minWidth?: string;
  hideToolbar?: boolean;
  wrapInCard?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  title,
  subtitle,
  icon,
  showCountBadge = true,
  searchPlaceholder = 'Search records...',
  searchKeys,
  searchFilter,
  toolbarActions,
  initialSortKey,
  initialSortDirection = 'asc',
  pageSizeOptions = [10, 25, 50],
  initialPageSize = 10,
  showPagination = true,
  isLoading = false,
  emptyMessage = 'No records found matching your criteria.',
  emptyTitle,
  emptyDescription,
  rowClassName,
  onRowClick,
  minWidth = '750px',
  hideToolbar = false,
  wrapInCard = true,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  // Handle Sort Toggle
  const handleSort = (column: ColumnDef<T>) => {
    if (!column.sortable) return;
    if (sortKey === column.key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        // Reset sort
        setSortKey(undefined);
        setSortDirection('asc');
      }
    } else {
      setSortKey(column.key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filter Data
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase().trim();

    return data.filter((row) => {
      if (searchFilter) {
        return searchFilter(row, query);
      }

      if (searchKeys && searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = typeof k === 'function' ? k(row) : (row as any)[k];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(query);
        });
      }

      // Default: inspect all column accessors
      return columns.some((col) => {
        if (col.accessor) {
          const val = col.accessor(row);
          return val !== null && val !== undefined && String(val).toLowerCase().includes(query);
        }
        return false;
      });
    });
  }, [data, searchQuery, searchKeys, searchFilter, columns]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const targetCol = columns.find((c) => c.key === sortKey);
    if (!targetCol) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA = targetCol.accessor ? targetCol.accessor(a) : (a as any)[sortKey];
      let valB = targetCol.accessor ? targetCol.accessor(b) : (b as any)[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true });
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // Paginate Data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, showPagination, currentPage, pageSize]);

  // Content
  const content = (
    <div className="space-y-4">
      {/* Top Toolbar (Title & Search/Actions) */}
      {!hideToolbar && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {title || icon ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {icon && <div className="text-slate-500 shrink-0 flex items-center">{icon}</div>}
                {title && <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>}
                {showCountBadge && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-semibold text-[10px] border border-slate-200 shadow-2xs">
                    {searchQuery.trim() && sortedData.length !== data.length
                      ? `${sortedData.length} of ${data.length}`
                      : `${data.length} Total`}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          ) : (
            <div />
          )}

          <div className="flex flex-wrap items-center gap-3">
            {toolbarActions}

            {/* Built-in Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white text-slate-900 text-xs rounded-md py-2 pl-9 pr-8 border border-slate-300 focus:border-blue-600 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full text-xs text-left border-collapse" style={{ minWidth }}>
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left';

                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`p-3 border-r border-slate-200 last:border-r-0 ${alignClass} ${
                      col.headerClassName || ''
                    } ${
                      col.sortable
                        ? 'cursor-pointer hover:bg-slate-200/80 transition-colors select-none'
                        : ''
                    }`}
                    onClick={() => handleSort(col)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'center'
                          ? 'justify-center w-full'
                          : col.align === 'right'
                          ? 'justify-end w-full'
                          : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-400 hover:text-slate-600" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Loading data records...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-400">
                  {emptyTitle ? (
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-700">{emptyTitle}</div>
                      {emptyDescription && (
                        <div className="text-xs text-slate-400">{emptyDescription}</div>
                      )}
                    </div>
                  ) : (
                    emptyMessage
                  )}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const key = rowKey(row, idx);
                const alignClass = (align?: 'left' | 'center' | 'right') =>
                  align === 'center'
                    ? 'text-center'
                    : align === 'right'
                    ? 'text-right'
                    : 'text-left';

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${rowClassName ? rowClassName(row, idx) : ''}`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`p-3 border-r border-slate-200 last:border-r-0 ${alignClass(
                          col.align
                        )} ${col.className || ''}`}
                      >
                        {col.render
                          ? col.render(row, idx)
                          : col.accessor
                          ? col.accessor(row)
                          : (row as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {showPagination && !isLoading && sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-1">
          {/* Result Count & Page Size */}
          <div className="flex items-center gap-3">
            <span>
              Showing{' '}
              <strong className="text-slate-800">
                {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-800">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </strong>{' '}
              of <strong className="text-slate-800">{sortedData.length}</strong> entries
              {sortedData.length !== data.length && (
                <span className="text-slate-400"> (filtered from {data.length} total)</span>
              )}
            </span>

            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-slate-400">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700 outline-none focus:border-blue-600 cursor-pointer"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-2 font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (wrapInCard) {
    return <div className="card-enterprise p-5">{content}</div>;
  }

  return content;
}
