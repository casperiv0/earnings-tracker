import * as React from "react";
import { Table } from "components/table/Table";
import { trpc } from "utils/trpc";
import { useTablePagination } from "src/hooks/useTablePagination";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import { EarningsEntryDate, Income as _Income, IncomeType, Month } from "@prisma/client";
import { Button } from "components/ui/Button";
import type { SortingState } from "@tanstack/react-table";
import { Dropdown } from "components/dropdown/Dropdown";
import { Modal } from "components/modal/Modal";
import { IncomeForm } from "components/income/IncomeForm";
import { Loader } from "components/ui/Loader";
import type { TableFilter } from "components/table/filters/TableFilters";
import { PageHeader } from "components/ui/PageHeader";

export interface Income extends _Income {
  date: Pick<EarningsEntryDate, "month" | "year">;
}

export default function IncomePage() {
  const [page, setPage] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filters, setFilters] = React.useState<TableFilter[]>([]);

  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleteOpen, setDeleteOpen] = React.useState(false);
  const [tempIncome, setTempIncome] = React.useState<Income | null>(null);

  const NUMBER_FORMATTER = new Intl.NumberFormat("be-NL", { compactDisplay: "short" });

  const incomeQuery = trpc.income.getInfiniteScrollableIncome.useQuery(
    { page, sorting, filters },
    { keepPreviousData: true },
  );

  const pagination = useTablePagination({
    isLoading: incomeQuery.isRefetching || incomeQuery.isLoading,
    query: incomeQuery,
    page,
    setPage,
  });
  const context = trpc.useContext();

  const deleteIncome = trpc.income.deleteIncome.useMutation({
    onSuccess: () => {
      context.income.getInfiniteScrollableIncome.invalidate();
    },
  });

  async function handleDeleteIncome(e: React.FormEvent) {
    e.preventDefault();
    if (!tempIncome) return;

    await deleteIncome.mutateAsync({
      id: tempIncome.id,
    });

    setTempIncome(null);
    setDeleteOpen(false);
  }

  function handleEditIncome(income: Income) {
    setIsOpen(true);
    setTempIncome(income);
  }

  function handleDeleteIncomeClick(income: Income) {
    setDeleteOpen(true);
    setTempIncome(income);
  }

  function handleClose() {
    setTempIncome(null);
    setIsOpen(false);
  }

  function handleCloseDelete() {
    setDeleteOpen(false);
    setTempIncome(null);
  }

  async function addNewIncome() {
    setIsOpen(true);
  }

  return (
    <div className="m-8 mx-5 md:mx-10 h-full">
      <PageHeader title="Income" description="A list of all income from any year starting in 2018.">
        <Button onClick={addNewIncome}>Add new income</Button>
      </PageHeader>

      <div className="mt-5">
        {incomeQuery.isLoading ? (
          <Loader fixed />
        ) : (incomeQuery.data?.items.length ?? 0) <= 0 && filters.length <= 0 ? (
          <p className="text-neutral-300">There is no income yet.</p>
        ) : (
          <Table
            options={{
              sorting,
              setSorting,
              filters,
              setFilters,
            }}
            query={incomeQuery}
            pagination={pagination}
            data={(incomeQuery.data?.items ?? []).map((income) => ({
              type: income.type,
              amount: (
                <span className="font-mono">&euro;{NUMBER_FORMATTER.format(income.amount)}</span>
              ),
              month: income.date.month,
              year: income.date.year,
              description: income.description || "None",
              actions: (
                <Dropdown
                  side="left"
                  className="flex flex-col"
                  trigger={
                    <Button size="xxs" aria-label="Row options">
                      <ThreeDotsVertical />
                    </Button>
                  }
                >
                  <Dropdown.Item onClick={() => handleEditIncome(income)}>Edit</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleDeleteIncomeClick(income)}>
                    Delete
                  </Dropdown.Item>
                </Dropdown>
              ),
            }))}
            filterTypes={[
              { name: "type", filterType: "enum", options: Object.values(IncomeType) },
              { name: "amount", filterType: "number" },
              { name: "month", filterType: "enum", options: Object.values(Month) },
              { name: "year", filterType: "number" },
              { name: "description", filterType: "string" },
            ]}
            columns={[
              { header: "Type", accessorKey: "type" },
              { header: "Amount", accessorKey: "amount" },
              { header: "Month", accessorKey: "month" },
              { header: "Year", accessorKey: "year" },
              { header: "Description", accessorKey: "description" },
              { header: "actions", accessorKey: "actions" },
            ]}
          />
        )}
      </div>

      <Modal isOpen={isOpen} onOpenChange={handleClose}>
        <Modal.Title>{tempIncome ? "Edit Income" : "Add new income"}</Modal.Title>
        {tempIncome ? null : (
          <Modal.Description>
            Add a new income. This income will be visible on the chart once added.
          </Modal.Description>
        )}

        <div>
          <IncomeForm onSubmit={handleClose} income={tempIncome} />
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onOpenChange={handleCloseDelete}>
        <form onSubmit={handleDeleteIncome}>
          <Modal.Title>Delete Income</Modal.Title>
          <Modal.Description>
            Are you sure you want to delete this income? This action cannot be undone.
          </Modal.Description>

          <footer className="mt-5 flex justify-end gap-3">
            <Modal.Close>
              <Button disabled={deleteIncome.isLoading} type="reset">
                Nope, Cancel
              </Button>
            </Modal.Close>
            <Button
              className="flex items-center gap-2"
              disabled={deleteIncome.isLoading}
              variant="danger"
              type="submit"
            >
              {deleteIncome.isLoading ? <Loader size="sm" /> : null}
              Yes, delete income
            </Button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}
