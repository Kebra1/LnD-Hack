import { describe, expect, it } from "vitest";
import {
  confirmedGoal,
  examples,
  isHistorical,
  prepareReview,
} from "../src/features/documents/service";
import { routeReducer, type RouteGoal } from "../src/features/routes/service";
const example = examples[0]!;
const fact = example.facts[0]!;
const goal: RouteGoal = {
  id: "manual",
  title: "Моя цель",
  done: false,
  offeringIds: [],
  origin: "manual",
  quote: null,
  historical: false,
};
describe("маршрут и подтверждение", () => {
  it("pending и rejected не создают целей", () => {
    const decision = prepareReview(example).decisions[fact.id]!;
    expect(confirmedGoal(example, fact, decision)).toBeNull();
    expect(
      confirmedGoal(example, fact, { ...decision, status: "rejected" }),
    ).toBeNull();
  });
  it("исправление сохраняет цитату, пустое исправление запрещено", () => {
    const decision = {
      status: "corrected" as const,
      value: "Моя формулировка",
      editing: false,
    };
    expect(confirmedGoal(example, fact, decision)).toMatchObject({
      title: "Моя формулировка",
      quote: fact.quote,
      origin: "user_correction",
    });
    expect(
      confirmedGoal(example, fact, { ...decision, value: " " }),
    ).toBeNull();
    expect(
      confirmedGoal(
        example,
        { ...fact, quote: "Несуществующая цитата" },
        decision,
      ),
    ).toBeNull();
  });
  it("каждая учебная цитата присутствует на своей странице", () => {
    for (const item of examples)
      for (const f of item.facts)
        expect(item.pages[f.page - 1]).toContain(f.quote);
    expect(examples[2]!.facts).toHaveLength(0);
  });
  it("не дублирует цель и вариант, сохраняет выполнение при добавлении варианта", () => {
    let state = routeReducer([], { type: "add", goal });
    state = routeReducer(state, { type: "add", goal });
    state = routeReducer(state, { type: "toggle", id: goal.id });
    state = routeReducer(state, {
      type: "offering",
      id: goal.id,
      offeringId: "speech",
    });
    state = routeReducer(state, {
      type: "offering",
      id: goal.id,
      offeringId: "speech",
    });
    expect(state).toHaveLength(1);
    expect(state[0]).toMatchObject({ done: true, offeringIds: ["speech"] });
    expect(
      routeReducer(state, {
        type: "removeOffering",
        id: goal.id,
        offeringId: "speech",
      })[0]?.offeringIds,
    ).toEqual([]);
    expect(routeReducer(state, { type: "remove", id: goal.id })).toEqual([]);
  });
  it("срок включителен по Алматы и не продлевается подтверждением", () => {
    expect(isHistorical("2026-07-10", new Date("2026-07-10T18:59:59Z"))).toBe(
      false,
    );
    expect(isHistorical("2026-07-10", new Date("2026-07-10T19:00:00Z"))).toBe(
      true,
    );
    expect(isHistorical(null)).toBe(false);
    expect(
      confirmedGoal(examples[1]!, examples[1]!.facts[0]!, {
        status: "accepted",
        value: "ok",
        editing: false,
      })?.historical,
    ).toBe(true);
  });
});
