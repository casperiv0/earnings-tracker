import type { Prisma } from "@prisma/client";
import type { Header, RowData } from "@tanstack/react-table";
import { Button } from "components/Button";
import { Dropdown } from "components/dropdown/Dropdown";
import * as React from "react";
import { Plus } from "react-bootstrap-icons";

interface Props<TData extends RowData> {
  headers: Header<TData, any>[];
}

export type TableFilterType = "string" | "date" | "number";
export type TableFilter<Type extends TableFilterType> = Type extends "string"
  ? Prisma.StringFilter
  : Type extends "date"
  ? Prisma.DateTimeFilter
  : Type extends "number"
  ? Prisma.FloatFilter
  : Prisma.StringFilter;

const EXCLUDED_HEADER_NAMES = ["actions", "select"];

export function TableFilters<TData extends RowData>({ headers }: Props<TData>) {
  const [filters, setFilters] = React.useState<string[]>([]);

  const filteredHeaders = React.useMemo(() => {
    return headers.filter((header) => !EXCLUDED_HEADER_NAMES.includes(header.id));
  }, [headers]);

  return (
    <header className="flex items-center gap-1 mb-3">
      {filters.map((filter, idx) => {
        return (
          <Button size="xss" key={idx}>
            {filter}
          </Button>
        );
      })}

      <Dropdown
        alignOffset={0}
        trigger={
          <Button size="xss" className="flex items-center gap-1">
            <Plus className="w-5 h-5" /> Add Filter
          </Button>
        }
      >
        {filteredHeaders.map((header) => {
          return (
            <Dropdown
              triggerKind="trigger-item"
              key={header.id}
              trigger={
                <Dropdown.TriggerItem className="capitalize">{header.id}</Dropdown.TriggerItem>
              }
            >
              <Dropdown.Item>{}</Dropdown.Item>
            </Dropdown>
          );
        })}
      </Dropdown>
    </header>
  );
}
