import * as React from "react";
import type { UseQueryResult } from "react-query";

interface Options<T extends { maxPages: number }> {
  query: UseQueryResult<T>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export function useTablePagination<T extends { maxPages: number }>(options: Options<T>) {
  const isNextDisabled = options.query.isLoading || options.page === options.query.data?.maxPages;
  const isPreviousDisabled = options.query.isLoading || options.page <= 0;

  function onNextPage() {
    options.setPage((prevPage) =>
      prevPage === options.query.data?.maxPages ? prevPage : prevPage + 1,
    );
  }

  function onPreviousPage() {
    options.setPage((prevPage) => (prevPage <= 0 ? 0 : prevPage - 1));
  }

  function gotoPage(page: number) {
    options.setPage(page);
  }

  React.useEffect(() => {
    window.scrollTo({ behavior: "smooth", top: 0 });
  }, [options.page]);

  return {
    totalPageCount: options.query.data?.maxPages ?? 0,
    currentPage: options.page,
    isNextDisabled,
    isPreviousDisabled,
    onNextPage,
    onPreviousPage,
    gotoPage,
  };
}
