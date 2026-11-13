import type { RouteGoal } from "../routes/service";
export interface Fact {
  id: string;
  value: string;
  quote: string;
  page: number;
  validUntil: string | null;
}
export interface Example {
  id: string;
  title: string;
  description: string;
  pages: string[];
  facts: Fact[];
}
export type Decision = {
  status: "pending" | "accepted" | "corrected" | "rejected";
  value: string;
  editing: boolean;
};
export interface Review {
  exampleId: string;
  decisions: Record<string, Decision>;
}
export const examples: Example[] = [
  {
    id: "communication",
    title: "Помощь с общением",
    description: "Две рекомендации · 1 страница",
    pages: [
      "УЧЕБНЫЙ ПРИМЕР. Все сведения синтетические.\nРекомендация 1. Цель: развитие альтернативной коммуникации.\nРекомендация 2. Цель: развитие навыков общения со сверстниками.\nСрок рекомендаций не указан. Требуется обсуждение со специалистом.",
    ],
    facts: [
      {
        id: "communication-1",
        value: "Развитие альтернативной коммуникации",
        quote: "Цель: развитие альтернативной коммуникации.",
        page: 1,
        validUntil: null,
      },
      {
        id: "communication-2",
        value: "Развитие навыков общения со сверстниками",
        quote: "Цель: развитие навыков общения со сверстниками.",
        page: 1,
        validUntil: null,
      },
    ],
  },
  {
    id: "expired",
    title: "Рекомендация с истёкшим сроком",
    description: "Одна рекомендация · историческая запись",
    pages: [
      "УЧЕБНЫЙ ПРИМЕР. Все сведения синтетические.\nЦель: освоение навыков самообслуживания. Срок этой рекомендации: до 2025-06-01 включительно.\nПродление срока в данном документе отсутствует.",
    ],
    facts: [
      {
        id: "expired-1",
        value: "Освоение навыков самообслуживания",
        quote:
          "Цель: освоение навыков самообслуживания. Срок этой рекомендации: до 2025-06-01 включительно.",
        page: 1,
        validUntil: "2025-06-01",
      },
    ],
  },
  {
    id: "no-facts",
    title: "Документ без рекомендаций",
    description: "Ни одной цели для маршрута",
    pages: [
      "УЧЕБНЫЙ ПРИМЕР. Все сведения синтетические.\nИнформационное уведомление: встреча состоялась. Рекомендации, цели и сроки в этом уведомлении не указаны.",
    ],
    facts: [],
  },
];
export function prepareReview(example: Example): Review {
  return {
    exampleId: example.id,
    decisions: Object.fromEntries(
      example.facts.map((fact) => [
        fact.id,
        { status: "pending", value: fact.value, editing: false },
      ]),
    ),
  };
}
export function isHistorical(validUntil: string | null, now = new Date()) {
  return (
    !!validUntil &&
    validUntil <
      new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Almaty",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now)
  );
}
export function confirmedGoal(
  example: Example,
  fact: Fact,
  decision: Decision,
): RouteGoal | null {
  if (
    !["accepted", "corrected"].includes(decision.status) ||
    !decision.value.trim()
  )
    return null;
  if (!example.pages[fact.page - 1]?.includes(fact.quote)) return null;
  return {
    id: `fact-${fact.id}`,
    title: decision.status === "accepted" ? fact.value : decision.value.trim(),
    done: false,
    offeringIds: [],
    origin: decision.status === "corrected" ? "user_correction" : "document",
    quote: fact.quote,
    historical: isHistorical(fact.validUntil),
  };
}
