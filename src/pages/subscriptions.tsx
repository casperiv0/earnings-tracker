import * as React from "react";
import { Table } from "components/table/Table";
import { trpc } from "utils/trpc";
import { useTablePagination } from "src/hooks/useTablePagination";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import type { Subscription } from "@prisma/client";
import { Button } from "components/Button";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { Dropdown } from "components/dropdown/Dropdown";
import { Modal } from "components/modal/Modal";
import { MAX_ITEMS_PER_TABLE } from "utils/constants";

export default function ExpensesPage() {
  const [page, setPage] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedRows, setSelectedRows] = React.useState<RowSelectionState>({});

  const [isOpen, setIsOpen] = React.useState(false);
  const [, setTempExpense] = React.useState<Subscription | null>(null);

  const subscriptionsQUery = trpc.useQuery(["subscriptions.all-infinite", page], {
    keepPreviousData: true,
  });

  const pagination = useTablePagination({
    isLoading: subscriptionsQUery.isRefetching || subscriptionsQUery.isLoading,
    query: subscriptionsQUery,
    page,
    setPage,
  });
  const context = trpc.useContext();

  const deleteExpense = trpc.useMutation("subscriptions.delete-subscription", {
    onSuccess: () => {
      context.invalidateQueries(["subscriptions.all-infinite"]);
    },
  });

  const deleteBulkExpense = trpc.useMutation("subscriptions.bulk-delete-subscription", {
    onSuccess: () => {
      context.invalidateQueries(["subscriptions.all-infinite"]);
    },
  });

  function handleDeleteSubscription(expense: Subscription) {
    deleteExpense.mutate({
      id: expense.id,
    });
  }

  async function handleBulkDeleteExpenses() {
    const expenseIds = [];

    for (const idx in selectedRows) {
      const expense = subscriptionsQUery.data?.items[parseInt(idx, 10)];
      if (!expense) continue;

      expenseIds.push(expense.id);
    }

    await deleteBulkExpense.mutateAsync({
      ids: expenseIds,
    });
    setSelectedRows({});
  }

  function handleEditSubscription(expense: Subscription) {
    setIsOpen(true);
    setTempExpense(expense);
  }

  function handleClose() {
    setTempExpense(null);
    setIsOpen(false);
  }

  async function addNewExpense() {
    setIsOpen(true);
  }

  return (
    <div className="m-8 mx-10 h-full">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between w-full mb-5 gap-y-3">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold font-serif">
            Subscriptions
          </h1>
          <p className="mt-4 font-medium">
            A list of subscriptions you are subscripted to. You can view the type and the amount of
            the subscription
          </p>
        </div>

        <div className="min-w-fit">
          <Button className="min-w-fit" onClick={addNewExpense}>
            Add new subscription
          </Button>
        </div>
      </header>

      <div className="mt-5">
        {(subscriptionsQUery.data?.items.length ?? 0) <= 0 ? (
          <p className="text-neutral-300">You are not subscripted to anything yet.</p>
        ) : (
          <div>
            <div className="mb-2">
              <Button
                onClick={handleBulkDeleteExpenses}
                disabled={deleteBulkExpense.isLoading || Object.keys(selectedRows).length <= 0}
              >
                Delete selected subscriptions
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
              data={(subscriptionsQUery.data?.items ?? []).map((subscription, idx) => ({
                id: MAX_ITEMS_PER_TABLE * page + idx + 1,
                price: <span className="font-mono">{subscription.price}</span>,
                name: subscription.name,
                type: subscription.type,
                description: subscription.description || "None",
                actions: (
                  <Dropdown
                    trigger={
                      <Button aria-label="Row options">
                        <ThreeDotsVertical />
                      </Button>
                    }
                  >
                    <Dropdown.Item onClick={() => handleEditSubscription(subscription)}>
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDeleteSubscription(subscription)}>
                      Delete
                    </Dropdown.Item>
                  </Dropdown>
                ),
              }))}
              columns={[
                { header: "#", accessorKey: "id" },
                { header: "Price", accessorKey: "price" },
                { header: "Name", accessorKey: "name" },
                { header: "Type", accessorKey: "type" },
                { header: "Description", accessorKey: "description" },
                { header: "actions", accessorKey: "actions" },
              ]}
            />
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onOpenChange={handleClose}>
        <Modal.Title>Add new subscription</Modal.Title>
        <Modal.Description>TODO</Modal.Description>
      </Modal>
    </div>
  );
}
