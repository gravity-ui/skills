import { describe, expect, it } from "vitest";
import { createContacts, filterAndSort } from "./data";

describe("contact filtering and sorting", () => {
  const contacts = createContacts();
  it("filters across names, emails and companies without case sensitivity", () => {
    expect(
      filterAndSort(contacts, "  СМИРНОВА  ", "all", "all", []).map(
        (c) => c.name,
      ),
    ).toEqual(["Анна Смирнова"]);
    const result = filterAndSort(contacts, "yandex.ru", "all", "all", []);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((c) => c.email.includes("yandex.ru"))).toBe(true);
  });
  it("combines search, company and status filters", () => {
    const result = filterAndSort(contacts, "Яндекс", "active", "Яндекс", []);
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((c) => c.company === "Яндекс" && c.status === "active"),
    ).toBe(true);
    expect(
      filterAndSort(contacts, "no-such-contact", "all", "all", []),
    ).toEqual([]);
  });
  it("sorts the entire dataset before pagination and does not mutate it", () => {
    const originalIds = contacts.map((c) => c.id);
    const result = filterAndSort(contacts, "", "all", "all", [
      { column: "name", order: "desc" },
    ]);
    expect(result[0].name).toBe(
      [...contacts].sort((a, b) => b.name.localeCompare(a.name, "ru"))[0].name,
    );
    expect(
      result
        .slice(0, 8)
        .every(
          (c, i, a) => !i || a[i - 1].name.localeCompare(c.name, "ru") >= 0,
        ),
    ).toBe(true);
    expect(contacts.map((c) => c.id)).toEqual(originalIds);
  });
  it("supports multiple sort columns and returns the unfiltered dataset", () => {
    const result = filterAndSort(contacts, "", "all", "all", [
      { column: "company", order: "asc" },
      { column: "created", order: "desc" },
    ]);
    expect(result).toHaveLength(128);
    expect(new Set(result.map((c) => c.id)).size).toBe(128);
    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1],
        current = result[i];
      expect(
        prev.company.localeCompare(current.company, "ru"),
      ).toBeLessThanOrEqual(0);
      if (prev.company === current.company)
        expect(
          prev.created.localeCompare(current.created),
        ).toBeGreaterThanOrEqual(0);
    }
  });
});
