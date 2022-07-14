import { Button } from "components/Button";
import { Dropdown } from "components/dropdown/Dropdown";
import * as React from "react";
import { ChevronDown, Plus } from "react-bootstrap-icons";
import type { UseQueryResult } from "react-query";
import { classNames } from "utils/utils";
import type { TableFiltersStateProps } from "../Table";
import { TableFilterForms } from "./Forms";

interface Props extends TableFiltersStateProps {
  filterTypes: TableFilter[];
  query?: UseQueryResult;
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

export function TableFilters({ query, filterTypes, filters, setFilters }: Props) {
  const isLoading = query?.isLoading || query?.isRefetching || query?.isFetching;

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
    setFilters((prev) => prev.filter((v) => v.name !== filter.name));
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
              isLoading={isLoading}
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
                isLoading={isLoading}
              />
            </Dropdown>
          );
        })}
      </Dropdown>
    </header>
  );
}
