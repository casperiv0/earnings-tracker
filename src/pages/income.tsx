import * as React from "react";
import { Table } from "components/table/Table";
import { trpc } from "utils/trpc";
import { useTablePagination } from "src/hooks/useTablePagination";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import type { EarningsEntryDate, Income as _Income } from "@prisma/client";
import { Button } from "components/Button";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { Dropdown } from "components/dropdown/Dropdown";
import { Modal } from "components/modal/Modal";
import { IncomeForm } from "components/income/IncomeForm";

export interface Income extends _Income {
  date: Pick<EarningsEntryDate, "month" | "year">;
}

export default function IncomePage() {
  const [page, setPage] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedRows, setSelectedRows] = React.useState<RowSelectionState>({});

  const [isOpen, setIsOpen] = React.useState(false);
  const [tempIncome, setTempIncome] = React.useState<Income | null>(null);

  const incomeQuery = trpc.useQuery(["income.all-infinite", page], {
    keepPreviousData: true,
  });

  const pagination = useTablePagination({
    isLoading: incomeQuery.isRefetching || incomeQuery.isLoading,
    query: incomeQuery,
    page,
    setPage,
  });
  const context = trpc.useContext();

  const deleteIncome = trpc.useMutation("income.delete-income", {
    onSuccess: () => {
      context.invalidateQueries(["income.all-infinite"]);
    },
  });

  const deleteBulkIncome = trpc.useMutation("income.bulk-delete-income", {
    onSuccess: () => {
      context.invalidateQueries(["income.all-infinite"]);
    },
  });

  function handleDeleteIncome(income: Income) {
    deleteIncome.mutate({
      id: income.id,
    });
  }

  async function handleBulkDeleteIncome() {
    const incomeIds = [];

    for (const idx in selectedRows) {
      const income = incomeQuery.data?.items[parseInt(idx, 10)];
      if (!income) continue;

      incomeIds.push(income.id);
    }

    await deleteBulkIncome.mutateAsync({
      ids: incomeIds,
    });
    setSelectedRows({});
  }

  function handleEditIncome(income: Income) {
    setIsOpen(true);
    setTempIncome(income);
  }

  function handleClose() {
    setTempIncome(null);
    setIsOpen(false);
  }

  async function addNewIncome() {
    setIsOpen(true);
  }

  return (
    <div className="m-8 mx-10 h-full">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between w-full mb-5 gap-y-3">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-serif">Income</h1>
          <p className="mt-4 font-medium">A list of all income from any year starting in 2018.</p>
        </div>

        <div>
          <Button onClick={addNewIncome}>Add new income</Button>
        </div>
      </header>

      <div className="mt-5">
        {(incomeQuery.data?.items.length ?? 0) <= 0 ? (
          <p className="text-neutral-300">There is no income yet.</p>
        ) : (
          <div>
            <div className="mb-2">
              <Button
                onClick={handleBulkDeleteIncome}
                disabled={deleteBulkIncome.isLoading || Object.keys(selectedRows).length <= 0}
              >
                Delete selected income
              </Button>
            </div>

            <Table
              options={{
                sorting,
                setSorting,
                rowSelection: selectedRows,
                setRowSelection: setSelectedRows,
              }}
              pagination={pagination}
              data={(incomeQuery.data?.items ?? []).map((income) => ({
                amount: income.amount,
                month: income.date.month,
                year: income.date.year,
                description: income.description || "None",
                actions: (
                  <Dropdown
                    trigger={
                      <Button>
                        <ThreeDotsVertical />
                      </Button>
                    }
                  >
                    <Dropdown.Item onClick={() => handleEditIncome(income)}>Edit</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDeleteIncome(income)}>Delete</Dropdown.Item>
                  </Dropdown>
                ),
              }))}
              columns={[
                { header: "Amount", accessorKey: "amount" },
                { header: "Month", accessorKey: "month" },
                { header: "Year", accessorKey: "year" },
                { header: "Description", accessorKey: "description" },
                { header: "actions", accessorKey: "actions" },
              ]}
            />
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onOpenChange={handleClose}>
        <Modal.Title>Add new income</Modal.Title>
        <Modal.Description>
          Add a new income. This income will be visible on the chart once added.
        </Modal.Description>

        <div>
          <IncomeForm onSubmit={handleClose} income={tempIncome} />
        </div>
      </Modal>
    </div>
  );
}
