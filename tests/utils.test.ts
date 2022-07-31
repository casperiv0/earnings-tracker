import { createOrderByObj, getSortingDir, getOrderByFromInput } from "../src/utils/utils";
import { describe, it, expect } from "vitest";

describe("createOrderByObj", () => {
  it("Descending", () => {
    expect(createOrderByObj({ desc: true, id: "a" })).toEqual({ a: "desc" });
  });

  it("Ascending", () => {
    expect(createOrderByObj({ desc: false, id: "a" })).toEqual({ a: "asc" });
  });

  it("Ascending - month", () => {
    expect(createOrderByObj({ desc: false, id: "month" })).toEqual({ date: { month: "asc" } });
  });

  it("Descending - year", () => {
    expect(createOrderByObj({ desc: true, id: "year" })).toEqual({ date: { year: "desc" } });
  });
});

describe("getSortingDir", () => {
  it("Descending", () => {
    expect(getSortingDir({ desc: true })).toEqual("desc");
  });

  it("Default Direction", () => {
    expect(getSortingDir({ desc: null })).toEqual("asc");
  });

  it("Ascending", () => {
    expect(getSortingDir({ desc: false })).toEqual("asc");
  });
});

describe("getOrderByFromInput", () => {
  it("Descending", () => {
    expect(getOrderByFromInput({ sorting: [{ desc: true, id: "a" }] })).toEqual({ a: "desc" });
  });

  it("Ascending", () => {
    expect(getOrderByFromInput({ sorting: [{ desc: false, id: "a" }] })).toEqual({ a: "asc" });
  });

  it("No array provided - default orderby", () => {
    expect(getOrderByFromInput({ sorting: [] })).toEqual({ createdAt: "desc" });
  });
});
