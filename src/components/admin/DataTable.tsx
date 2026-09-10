"use client";

import React from "react";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filterSlot?: React.ReactNode;
  actionSlot?: React.ReactNode;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filterSlot,
  actionSlot,
  page = 1,
  totalPages = 1,
  onPageChange,
  isLoading = false,
  emptyTitle = "No records found",
  emptySubtitle = "Try adjusting your search terms or filters.",
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="bg-surface rounded-2xl border border-parchment-border/80 shadow-[0_2px_12px_rgba(26,56,40,0.03)] overflow-hidden flex flex-col">
      {/* Top Filter & Search Toolbar */}
      {(onSearchChange || filterSlot || actionSlot) && (
        <div className="p-4 sm:p-5 border-b border-surface-container bg-surface flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {onSearchChange && (
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchValue || ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-xs font-body-md text-primary placeholder:text-on-surface-variant/60 focus:outline-none focus:border-forest-green focus:bg-surface transition-all"
                />
              </div>
            )}
            {filterSlot}
          </div>

          {actionSlot && <div className="flex items-center gap-2">{actionSlot}</div>}
        </div>
      )}

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans antialiased">
          <thead>
            <tr className="border-b border-surface-container bg-surface-container-low/70">
              {columns.map((col, idx) => (
                <th
                  key={col.header || idx}
                  className={`py-3.5 px-4 sm:px-5 font-label-caps text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-container/60 font-body-md text-xs">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="py-4 px-4 sm:px-5">
                      <div className="h-4 bg-surface-container rounded-md w-4/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-xs mx-auto text-on-surface-variant">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant/60 mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <div className="font-headline-sm text-base text-primary font-medium">
                      {emptyTitle}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {emptySubtitle}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Row Data
              data.map((item) => {
                const key = keyExtractor(item);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(item)}
                    className={`transition-colors ${
                      onRowClick
                        ? "hover:bg-surface-container-low/80 cursor-pointer"
                        : "hover:bg-surface-container-low/40"
                    }`}
                  >
                    {columns.map((col, cIdx) => {
                      let cellContent: React.ReactNode = null;
                      if (typeof col.accessor === "function") {
                        cellContent = col.accessor(item);
                      } else if (col.accessor) {
                        cellContent = (item as Record<string, unknown>)[
                          col.accessor as string
                        ] as React.ReactNode;
                      }

                      return (
                        <td
                          key={cIdx}
                          className={`py-3.5 px-4 sm:px-5 text-on-surface align-middle ${
                            col.className || ""
                          }`}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && onPageChange && (
        <div className="p-4 border-t border-surface-container bg-surface-container-low/40 flex items-center justify-between text-xs text-on-surface-variant">
          <span>
            Page <span className="font-semibold text-primary">{page}</span> of{" "}
            <span className="font-semibold text-primary">{totalPages}</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-surface-container hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-surface-container hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
