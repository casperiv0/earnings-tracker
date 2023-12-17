import { Month } from "@prisma/client";

export const MAX_ITEMS_PER_TABLE = 35;

export const DEFINED_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;
export type Year = (typeof DEFINED_YEARS)[number];

export const DEFINED_MONTHS: Month[] = [
  Month.January,
  Month.February,
  Month.March,
  Month.April,
  Month.May,
  Month.June,
  Month.July,
  Month.August,
  Month.September,
  Month.October,
  Month.November,
  Month.December,
];

export const GRAPH_COLORS = {
  INCOME: "rgb(59 130 246)",
  EXPENSE: "rgb(185 28 28)",
  NETTO: "rgb(22 163 74)",
} as const;
export type GRAPH_COLORS = (typeof GRAPH_COLORS)[keyof typeof GRAPH_COLORS];
