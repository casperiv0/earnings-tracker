import {
  ChevronDoubleLeft,
  ChevronDoubleRight,
  ChevronLeft,
  ChevronRight,
} from "react-bootstrap-icons";
import { Button } from "components/Button";
import type { TablePaginationOptions } from "src/hooks/useTablePagination";

interface Props {
  pagination: TablePaginationOptions;
}

export function TablePagination({ pagination }: Props) {
  return (
    <div className="mt-5 flex justify-center items-center gap-3">
      <Button onClick={() => pagination.gotoPage(0)} disabled={pagination.isPreviousDisabled}>
        <ChevronDoubleLeft aria-label="Show first page" width={15} height={25} />
      </Button>
      <Button onClick={() => pagination.onPreviousPage()} disabled={pagination.isPreviousDisabled}>
        <ChevronLeft aria-label="Previous page" width={15} height={25} />
      </Button>
      <span>
        {pagination.currentPage + 1} of {pagination.totalPageCount + 1}
      </span>
      <Button onClick={() => pagination.onNextPage()} disabled={pagination.isNextDisabled}>
        <ChevronRight aria-label="Next page" width={15} height={25} />
      </Button>
      <Button
        onClick={() => pagination.gotoPage(pagination.totalPageCount)}
        disabled={pagination.isNextDisabled}
      >
        <ChevronDoubleRight aria-label="Show last page" width={15} height={25} />
      </Button>
    </div>
  );
}
