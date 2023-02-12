import * as React from "react";
import { Table } from "components/table/Table";
import { trpc } from "utils/trpc";
import { useTablePagination } from "src/hooks/useTablePagination";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import { EarningsEntryDate, Hours, Month } from "@prisma/client";
import { Button } from "components/ui/Button";
import type { ExpandedState, SortingState } from "@tanstack/react-table";
import { Dropdown } from "components/dropdown/Dropdown";
import { Modal } from "components/modal/Modal";
import { Loader } from "components/ui/Loader";
import type { TableFilter } from "components/table/filters/TableFilters";
import { PageHeader } from "components/ui/PageHeader";
import { HoursForm } from "components/hours/HoursForm";

export interface Hour extends Hours {
  date: Pick<EarningsEntryDate, "month" | "year">;
}

export default function HoursPage() {
  const [page, setPage] = React.useState<number>(0);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filters, setFilters] = React.useState<TableFilter[]>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleteOpen, setDeleteOpen] = React.useState(false);
  const [tempHourLog, setTempHour] = React.useState<Hour | null>(null);

  const NUMBER_FORMATTER = new Intl.NumberFormat("be-NL", { compactDisplay: "short" });

  const context = trpc.useContext();

  const hoursQuery = trpc.hours.getInfinitelyScrollableHours.useQuery(
    { page, sorting, filters },
    { keepPreviousData: true },
  );

  const deleteHour = trpc.hours.deleteHour.useMutation({
    onSuccess: () => {
      context.hours.getInfinitelyScrollableHours.invalidate();
    },
  });

  const pagination = useTablePagination({
    isLoading: hoursQuery.isRefetching || hoursQuery.isLoading,
    query: hoursQuery,
    page,
    setPage,
  });

  async function handleDeleteHour(e: React.FormEvent) {
    e.preventDefault();
    if (!tempHourLog) return;

    await deleteHour.mutateAsync({
      id: tempHourLog.id,
    });

    setTempHour(null);
    setDeleteOpen(false);
  }

  function handleEditHour(hour: Hour) {
    setIsOpen(true);
    setTempHour(hour);
  }

  function handleDeleteHourClick(hour: Hour) {
    setDeleteOpen(true);
    setTempHour(hour);
  }

  function handleClose() {
    setTempHour(null);
    setIsOpen(false);
  }

  function handleCloseDelete() {
    setDeleteOpen(false);
    setTempHour(null);
  }
  async function addNewHour() {
    setIsOpen(true);
  }

  return (
    <div className="m-8 mx-5 md:mx-10 h-full">
      <PageHeader title="Hour logs" description="View and manage hour logs.">
        <Button onClick={addNewHour}>Add new hour log</Button>
      </PageHeader>

      <div className="mt-5">
        {hoursQuery.isLoading ? (
          <Loader fixed />
        ) : (hoursQuery.data?.items.length ?? 0) <= 0 && filters.length <= 0 ? (
          <p className="text-neutral-300">There are no hours yet.</p>
        ) : (
          <Table
            options={{ sorting, setSorting, filters, setFilters, expanded, setExpanded }}
            pagination={pagination}
            query={hoursQuery}
            filterTypes={[
              { name: "id", filterType: "id" },
              { name: "amount", filterType: "number" },
              { name: "month", filterType: "enum", options: Object.values(Month) },
              { name: "year", filterType: "number" },
              { name: "description", filterType: "string" },
            ]}
            data={(hoursQuery.data?.items ?? []).map((hourLog) => {
              const fullDate = `${hourLog.date.day ?? "1"} ${hourLog.date.month} ${
                hourLog.date.year
              }`;

              return {
                amount: (
                  <span className="font-mono">
                    &euro;
                    {NUMBER_FORMATTER.format(hourLog.amount)}
                  </span>
                ),
                date: fullDate,
                description: hourLog.description || "None",
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
                    <Dropdown.Item onClick={() => handleEditHour(hourLog)}>Edit</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDeleteHourClick(hourLog)}>
                      Delete
                    </Dropdown.Item>
                  </Dropdown>
                ),
              };
            })}
            columns={[
              { header: "Amount", accessorKey: "amount" },
              { header: "Date", accessorKey: "date" },
              { header: "Description", accessorKey: "description" },
              { header: "actions", accessorKey: "actions" },
            ]}
          />
        )}
      </div>

      <Modal isOpen={isOpen} onOpenChange={handleClose}>
        <Modal.Title>{tempHourLog ? "Edit Hour log" : "Add new hour log"}</Modal.Title>
        {tempHourLog ? null : (
          <Modal.Description>Add a new hour log to the database.</Modal.Description>
        )}

        <div>
          <HoursForm onSubmit={handleClose} hour={tempHourLog} />
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onOpenChange={handleCloseDelete}>
        <form onSubmit={handleDeleteHour}>
          <Modal.Title>Delete Hour</Modal.Title>
          <Modal.Description>
            Are you sure you want to delete this hour? This action cannot be undone.
          </Modal.Description>

          <footer className="mt-5 flex justify-end gap-3">
            <Modal.Close>
              <Button disabled={deleteHour.isLoading} type="reset">
                Nope, Cancel
              </Button>
            </Modal.Close>
            <Button
              className="flex items-center gap-2"
              disabled={deleteHour.isLoading}
              variant="danger"
              type="submit"
            >
              {deleteHour.isLoading ? <Loader size="sm" /> : null}
              Yes, delete hour
            </Button>
          </footer>
        </form>
      </Modal>
    </div>
  );
}
