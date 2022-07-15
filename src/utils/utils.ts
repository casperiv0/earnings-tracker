import { Prisma } from "@prisma/client";
import type { RowSelectionState } from "@tanstack/react-table";
import type { TABLE_FILTER } from "server/routers/income";
import type { z } from "zod";

export function getSelectedRowDataIds<T extends { id: string }>(
  selectedRows: RowSelectionState,
  data: T[] | null | undefined,
) {
  const ids = [];

  for (const idx in selectedRows) {
    const item = data?.[parseInt(idx, 10)];
    if (!item) continue;

    ids.push(item.id);
  }

  return ids;
}

export function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(" ");
}

export function getOrderByFromInput<T extends { sorting?: { desc: boolean; id: string }[] }>(
  input: T,
) {
  const orderBy =
    (input.sorting?.length ?? 0) >= 1
      ? input.sorting?.reduce(
          (ac, cv) => ({
            ...ac,
            ...createOrderByObj(cv),
          }),
          {},
        )
      : { createdAt: "desc" };

  return orderBy;
}

function createOrderByObj(sort: { desc: boolean; id: string }) {
  if (["month", "year"].includes(sort.id)) {
    return { date: { [sort.id]: getSortingDir(sort) } };
  }

  return { [sort.id]: getSortingDir(sort) };
}

export function getSortingDir(cv: { desc?: boolean | null }): Prisma.SortOrder {
  if (!cv.desc) return Prisma.SortOrder.asc;
  return Prisma.SortOrder.desc;
}

export function createPrismaWhereFromFilters(
  filters: z.infer<typeof TABLE_FILTER>[],
  userId: string,
): any {
  const andClause: any[] = [{ userId }];

  for (const filter of filters) {
    if (!filter.type || !filter.content) continue;

    const useDateObj = ["month", "year"].includes(filter.name);
    const addMode = ["string"].includes(filter.filterType);

    const obj = {
      [filter.name]: {
        [filter.type]: filter.content,
        mode: addMode ? Prisma.QueryMode.insensitive : undefined,
      },
    };

    andClause.push(useDateObj ? { date: obj } : obj);
  }

  return { AND: andClause };
}
