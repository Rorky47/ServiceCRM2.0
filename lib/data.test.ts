import { describe, it, expect } from "vitest";
import { getSchemaName } from "./data";

describe("getSchemaName", () => {
  it("sanitizes site slugs correctly", () => {
    expect(getSchemaName("my-site")).toBe("site_my_site");
    expect(getSchemaName("My-Site")).toBe("site_my_site");
    expect(getSchemaName("my site!")).toBe("site_my_site");
    expect(getSchemaName("abc")).toBe("site_abc");
  });

  it("rejects invalid slugs (empty after sanitize)", () => {
    expect(() => getSchemaName("")).toThrow("Invalid site slug");
    expect(() => getSchemaName("_")).toThrow("Invalid site slug");
    expect(() => getSchemaName("---")).toThrow("Invalid site slug");
    expect(() => getSchemaName("!@#$%")).toThrow("Invalid site slug");
  });

  it("rejects slugs that are too long", () => {
    expect(() => getSchemaName("a".repeat(70))).toThrow("Invalid site slug");
    expect(() => getSchemaName("a".repeat(64))).toThrow("Invalid site slug");
  });

  it("accepts slugs at max length", () => {
    const slug = "a".repeat(63);
    expect(getSchemaName(slug)).toBe(`site_${slug}`);
  });
});
