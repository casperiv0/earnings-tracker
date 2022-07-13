import * as React from "react";
import { Table } from "components/table/Table";
import { trpc } from "utils/trpc";
import { useTablePagination } from "src/hooks/useTablePagination";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import { EarningsEntryDate, Income as _Income, IncomeType } from "@prisma/client";
import { Button } from "components/Button";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { Dropdown } from "components/dropdown/Dropdown";
import { Modal } from "components/modal/Modal";
import { IncomeForm } from "components/income/IncomeForm";
import { Loader } from "components/Loader";
import { Select } from "components/form/Select";
import { getSelectedRowDataIds } from "utils/utils";

export interface Income extends _Income {
  date: Pick<EarningsEntryDate, "month" | "year">;
}

export default function IncomePage() {
  const [page, setPage] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedRows, setSelectedRows] = React.useState<RowSelectionState>({});

  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleteOpen, setDeleteOpen] = React.useState(false);
  const [tempIncome, setTempIncome] = React.useState<Income | null>(null);

  const [selectedType, setSelectedType] = React.useState<IncomeType | "null">("null");

  const incomeQuery = trpc.useQuery(["income.all-infinite", { page, sorting }], {
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

  const bulkEditIncomeType = trpc.useMutation("income.bulk-update-type", {
    onSuccess: () => {
      context.invalidateQueries(["income.all-infinite"]);
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

  async function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as IncomeType | "null";
    setSelectedType(value);

    if (value === "null") return;

    await bulkEditIncomeType.mutateAsync({
      ids: getSelectedRowDataIds(selectedRows, incomeQuery.data?.items),
      type: value,
    });

    setSelectedType("null");
    setSelectedRows({});
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
        {incomeQuery.isLoading ? (
          <Loader fixed />
        ) : (incomeQuery.data?.items.length ?? 0) <= 0 ? (
          <p className="text-neutral-300">There is no income yet.</p>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Select
                disabled={bulkEditIncomeType.isLoading || Object.keys(selectedRows).length <= 0}
                value={String(selectedType)}
                onChange={handleTypeChange}
                className="w-fit"
              >
                <option value={"null"}>Select type...</option>
                {Object.values(IncomeType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
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
                type: income.type,
                amount: <span className="font-mono">{income.amount}</span>,
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
                    <Dropdown.Item onClick={() => handleDeleteIncomeClick(income)}>
                      Delete
                    </Dropdown.Item>
                  </Dropdown>
                ),
              }))}
              columns={[
                { header: "Type", accessorKey: "type" },
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

      <Modal isOpen={isDeleteOpen} onOpenChange={handleCloseDelete}>
        <form onSubmit={handleDeleteIncome}>
          <Modal.Title>Delete Income</Modal.Title>
          <Modal.Description>
            Are you sure you want to delete this income? This action cannot be undone.
          </Modal.Description>

          <footer className="mt-5 flex justify-end gap-2">
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
