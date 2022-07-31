import { Month } from "@prisma/client";
import { createKeyFunc } from "../src/utils/chart-utils";
import { describe, it, expect } from "vitest";

describe("createKeyFunc", () => {
  it("all-time", () => {
    expect(createKeyFunc("all-time", { date: { year: 2020, month: Month.April } } as any)).toBe(
      "2020-April",
    );
  });

  it("per year - April 2022", () => {
    expect(createKeyFunc(2022, { date: { year: 2022, month: Month.April } } as any)).toBe("April");
  });
});

// todo: add more tests
