import * as React from "react";
import { Table } from "components/table/Table";
import { trpc } from "utils/trpc";
import { useTablePagination } from "src/hooks/useTablePagination";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import { Subscription, SubscriptionType } from "@prisma/client";
import { Button } from "components/ui/Button";
import type { SortingState } from "@tanstack/react-table";
import { Dropdown } from "components/dropdown/Dropdown";
import { Modal } from "components/modal/Modal";
import { Loader } from "components/ui/Loader";
import type { TableFilter } from "components/table/filters/TableFilters";
import { SubscriptionForm } from "components/subscriptions/SubscriptionForm";
import { PageHeader } from "components/ui/PageHeader";

export default function SubscriptionsPage() {
  const [page, setPage] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filters, setFilters] = React.useState<TableFilter[]>([]);

  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleteOpen, setDeleteOpen] = React.useState(false);
  const [tempSubscription, setTempSubscription] = React.useState<Subscription | null>(null);

  const subscriptionsQuery = trpc.useQuery(
    ["subscriptions.all-infinite", { page, sorting, filters }],
    {
      keepPreviousData: true,
    },
  );

  const pagination = useTablePagination({
    isLoading: subscriptionsQuery.isRefetching || subscriptionsQuery.isLoading,
    query: subscriptionsQuery,
    page,
    setPage,
  });
  const context = trpc.useContext();

  const deleteSubscription = trpc.useMutation("subscriptions.delete-subscription", {
    onSuccess: () => {
      context.invalidateQueries(["subscriptions.all-infinite"]);
    },
  });

  async function handleDeleteSubscription(e: React.FormEvent) {
    e.preventDefault();
    if (!tempSubscription) return;

    await deleteSubscription.mutateAsync({
      id: tempSubscription.id,
    });

    setTempSubscription(null);
    setDeleteOpen(false);
  }

  function handleEditSubscription(subscription: Subscription) {
    setIsOpen(true);
    setTempSubscription(subscription);
  }

  function handleDeleteSubscriptionClick(subscription: Subscription) {
    setDeleteOpen(true);
    setTempSubscription(subscription);
  }

  function handleClose() {
    setTempSubscription(null);
    setIsOpen(false);
  }

  function handleCloseDelete() {
    setDeleteOpen(false);
    setTempSubscription(null);
  }

  async function addNewSubscription() {
    setIsOpen(true);
  }

  return (
    <div className="m-8 mx-5 md:mx-10 h-full">
      <PageHeader title="Subscriptions" description="A list of all subscriptions.">
        <Button onClick={addNewSubscription}>Add new subscription</Button>
      </PageHeader>

      <div className="mt-5">
        {(subscriptionsQuery.data?.items.length ?? 0) <= 0 && filters.length <= 0 ? (
          <p className="text-neutral-300">There are no Subscriptions yet.</p>
        ) : (
          <Table
            options={{
              sorting,
              setSorting,
              filters,
              setFilters,
            }}
            query={subscriptionsQuery}
            pagination={pagination}
            data={(subscriptionsQuery.data?.items ?? []).map((subscription) => ({
              type: subscription.type,
              price: <span className="font-mono">&euro;{subscription.price}</span>,
              name: subscription.name,
              description: subscription.description || "None",
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
                  <Dropdown.Item onClick={() => handleEditSubscription(subscription)}>
                    Edit
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleDeleteSubscriptionClick(subscription)}>
                    Delete
                  </Dropdown.Item>
                </Dropdown>
              ),
            }))}
            filterTypes={[
              { name: "type", filterType: "enum", options: Object.values(SubscriptionType) },
              { name: "price", filterType: "number" },
              { name: "name", filterType: "string" },
              { name: "description", filterType: "string" },
            ]}
            columns={[
              { header: "Type", accessorKey: "type" },
              { header: "Price", accessorKey: "price" },
              { header: "Name", accessorKey: "name" },
              { header: "Description", accessorKey: "description" },
              { header: "actions", accessorKey: "actions" },
            ]}
          />
        )}
      </div>

      <Modal isOpen={isOpen} onOpenChange={handleClose}>
        <Modal.Title>{tempSubscription ? "Edit Subscription" : "Add new subscription"}</Modal.Title>
        {tempSubscription ? null : (
          <Modal.Description>
            Add a new subscription. This subscription will be visible on the chart once added.
          </Modal.Description>
        )}

        <div>
          <SubscriptionForm onSubmit={handleClose} subscription={tempSubscription} />
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onOpenChange={handleCloseDelete}>
        <form onSubmit={handleDeleteSubscription}>
          <Modal.Title>Delete Subscription</Modal.Title>
          <Modal.Description>
            Are you sure you want to delete this subscription? This action cannot be undone.
          </Modal.Description>

          <footer className="mt-5 flex justify-end gap-3">
            <Modal.Close>
              <Button disabled={deleteSubscription.isLoading} type="reset">
                Nope, Cancel
              </Button>
            </Modal.Close>
            <Button
              className="flex items-center gap-2"
              disabled={deleteSubscription.isLoading}
              variant="danger"
              type="submit"
            >
              {deleteSubscription.isLoading ? <Loader size="sm" /> : null}
              Yes, delete subscription
            </Button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}
