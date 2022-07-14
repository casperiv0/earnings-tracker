import { Button } from "components/Button";
import { Dropdown } from "components/dropdown/Dropdown";
import * as React from "react";
import { ChevronDown, Plus } from "react-bootstrap-icons";
import { classNames } from "utils/utils";
import type { TableFiltersStateProps } from "../Table";
import { TableFilterForms } from "./Forms";

interface Props extends TableFiltersStateProps {
  filterTypes: TableFilter[];
}

export interface TableFilter<FilterType extends TableFilterType = TableFilterType> {
  name: string;
  filterType: FilterType;
  type?: TableFilterFilterType;
  content?: FilterType extends "string" ? string : FilterType extends "number" ? number : string;
  options?: string[];
}

export type TableFilterFilterType = "equals" | "contains" | "lt" | "gt";
export type TableFilterType = "string" | "date" | "number" | "enum";

export function TableFilters({ filterTypes, filters, setFilters }: Props) {
  function handleFiltersSubmit(data: TableFilter) {
    const hasFilter = filters.some((v) => v.name === data.name);

    if (hasFilter) {
      const copied = [...filters];
      const idx = filters.findIndex((v) => v.name === data.name);

      copied[idx] = data as any;
      setFilters(copied);
    } else {
      setFilters((prevFilters) => [...prevFilters, data as any]);
    }
  }

  function handleRemoveFilter(filter: TableFilter | TableFilter) {
    const filterType = "filterType" in filter ? filter.filterType : filter.type;
    setFilters((prev) => prev.filter((v) => v.filterType !== filterType));
  }

  return (
    <header className="flex items-center gap-1 mb-3">
      {filters.map((filter, idx) => {
        return (
          <Dropdown
            key={idx}
            extra={{ maxWidth: 250 }}
            sideOffset={5}
            alignOffset={0}
            trigger={
              <Button size="xss" className="flex items-center gap-1">
                {filter.name}

                <ChevronDown className="w-3 h-3" />
              </Button>
            }
          >
            <TableFilterForms
              handleRemoveFilter={handleRemoveFilter}
              handleFiltersSubmit={handleFiltersSubmit}
              filter={filter}
              isRemovable
            />
          </Dropdown>
        );
      })}

      <Dropdown
        alignOffset={0}
        trigger={
          <Button variant="accent" size="xss" className="flex items-center gap-1">
            <Plus className="w-5 h-5" /> Add Filter
          </Button>
        }
      >
        {filterTypes.map((filter) => {
          const isFilterAlreadySet = filters.some((v) => v.name === filter.name);

          return (
            <Dropdown
              extra={{ maxWidth: 250 }}
              triggerKind="trigger-item"
              key={filter.name}
              trigger={
                <Dropdown.TriggerItem
                  disabled={isFilterAlreadySet}
                  className={classNames("capitalize", isFilterAlreadySet && "pointer-events-none")}
                >
                  {filter.name}
                </Dropdown.TriggerItem>
              }
            >
              <TableFilterForms
                handleRemoveFilter={handleRemoveFilter}
                handleFiltersSubmit={handleFiltersSubmit}
                filter={filter}
              />
            </Dropdown>
          );
        })}
      </Dropdown>
    </header>
  );
}
