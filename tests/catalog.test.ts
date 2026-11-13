import { describe, expect, it } from "vitest";
import { emptyFilters, searchOfferings } from "../src/features/catalog/service";
describe("matching-v1 учебный каталог", () => {
  it("исключает дошкольный вариант для подростка и неизвестный возраст по умолчанию", () => {
    const ids = searchOfferings({
      ...emptyFilters,
      audience: "child",
      age: "14",
    }).map((x) => x.id);
    expect(ids).toContain("steps");
    expect(ids).not.toContain("early");
    expect(ids).not.toContain("movement");
  });
  it("неизвестный язык не проходит даже с разрешением неизвестного возраста", () => {
    expect(
      searchOfferings({
        ...emptyFilters,
        age: "8",
        language: "kk",
        includeUnknown: true,
      }).map((x) => x.id),
    ).toEqual(["speech"]);
  });
  it("совместно применяет фильтры и возвращает пустую выдачу", () => {
    expect(
      searchOfferings({
        ...emptyFilters,
        city: "Астана",
        category: "psychology",
        audience: "adult",
      }),
    ).toEqual([]);
  });
  it("неизвестный возраст появляется только при разрешении", () => {
    expect(
      searchOfferings({ ...emptyFilters, age: "8", includeUnknown: true }).some(
        (x) => x.id === "movement",
      ),
    ).toBe(true);
  });
});
