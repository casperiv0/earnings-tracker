import type { RowSelectionState } from "@tanstack/react-table";

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
