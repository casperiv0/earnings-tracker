import * as React from "react";
import type { UseQueryResult } from "@tanstack/react-query";

interface Options<T extends { maxPages: number }> {
  isLoading: boolean;
  query: UseQueryResult<T>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export interface TablePaginationOptions {
  isLoading: boolean;
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
  currentPage: number;
  totalPageCount: number;
  onNextPage(): void;
  onPreviousPage(): void;
  gotoPage(page: number): void;
}

export function useTablePagination<T extends { maxPages: number }>(
  options: Options<T>,
): TablePaginationOptions {
  const isNextDisabled = options.query.isLoading || options.page === options.query.data?.maxPages;
  const isPreviousDisabled = options.query.isLoading || options.page <= 0;

  function onNextPage() {
    window.scrollTo({ behavior: "smooth", top: 0 });

    options.setPage((prevPage) =>
      prevPage === options.query.data?.maxPages ? prevPage : prevPage + 1,
    );
  }

  function onPreviousPage() {
    window.scrollTo({ behavior: "smooth", top: 0 });

    options.setPage((prevPage) => (prevPage <= 0 ? 0 : prevPage - 1));
  }

  function gotoPage(page: number) {
    window.scrollTo({ behavior: "smooth", top: 0 });

    options.setPage(page);
  }

  return {
    isLoading: options.isLoading,
    totalPageCount: options.query.data?.maxPages ?? 0,
    currentPage: options.page,
    isNextDisabled,
    isPreviousDisabled,
    onNextPage,
    onPreviousPage,
    gotoPage,
  };
}
