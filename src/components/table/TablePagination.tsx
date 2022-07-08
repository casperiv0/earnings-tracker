import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/outline";
import { Button } from "components/Button";
import type { TablePaginationOptions } from "src/hooks/useTablePagination";

interface Props {
  pagination: TablePaginationOptions;
}

export function TablePagination({ pagination }: Props) {
  return (
    <div className="mt-5 flex justify-center items-center gap-3">
      <Button onClick={() => pagination.gotoPage(0)} disabled={pagination.isPreviousDisabled}>
        <ChevronDoubleLeftIcon aria-label="Show first page" width={15} height={25} />
      </Button>
      <Button onClick={() => pagination.onPreviousPage()} disabled={pagination.isPreviousDisabled}>
        <ChevronLeftIcon aria-label="Previous page" width={15} height={25} />
      </Button>
      <span>
        {pagination.currentPage + 1} of {pagination.totalPageCount + 1}
      </span>
      <Button onClick={() => pagination.onNextPage()} disabled={pagination.isNextDisabled}>
        <ChevronRightIcon aria-label="Next page" width={15} height={25} />
      </Button>
      <Button
        onClick={() => pagination.gotoPage(pagination.totalPageCount)}
        disabled={pagination.isNextDisabled}
      >
        <ChevronDoubleRightIcon aria-label="Show last page" width={15} height={25} />
      </Button>
    </div>
  );
}
