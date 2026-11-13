"use client";
import Link from "next/link";
import { useState } from "react";
import { useDemo } from "@/ui/demo-shell";
import {
  confirmedGoal,
  examples,
  isHistorical,
  prepareReview,
  type Decision,
  type Fact,
} from "@/features/documents/service";
export default function DocumentsPage() {
  const { goals, dispatch, notify, review, setReview } = useDemo();
  const [selected, setSelected] = useState(
    review?.exampleId ?? examples[0]!.id,
  );
  const example = examples.find((item) => item.id === review?.exampleId);
  function update(id: string, change: Partial<Decision>) {
    setReview(
      (previous) =>
        previous && {
          ...previous,
          decisions: {
            ...previous.decisions,
            [id]: { ...previous.decisions[id]!, ...change },
          },
        },
    );
  }
  function confirm(fact: Fact) {
    if (!example || !review) return;
    const decision = review.decisions[fact.id]!;
    const next: Decision = {
      ...decision,
      status:
        decision.editing || decision.status === "corrected"
          ? "corrected"
          : "accepted",
      editing: false,
    };
    const goal = confirmedGoal(example, fact, next);
    if (!goal) return;
    dispatch({ type: "add", goal });
    update(fact.id, next);
    notify("Подтверждённая цель добавлена в маршрут");
  }
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">РАЗОБРАТЬСЯ И ВЫБРАТЬ СЛЕДУЮЩИЙ ШАГ</p>
        <h1>Что сказано в документе?</h1>
        <p className="lead">
          Проверьте сведения рядом с источником. Решение всегда за вами.
        </p>
      </div>
      <div className="notice">
        <b>Учебный пример · подготовленный результат (fixture)</b>
        <p>
          Живой AI не подключён: провайдер и ключ не настроены. Здесь показан
          заранее подготовленный разбор синтетического текста, без загрузки и
          обработки PDF. Не вводите реальные персональные данные.
        </p>
      </div>
      <section className="example-picker">
        <label htmlFor="example">Выберите учебный документ</label>
        <div className="input-row">
          <select
            id="example"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {examples.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} — {item.description}
              </option>
            ))}
          </select>
          <button
            className="button primary"
            onClick={() => {
              setReview(
                prepareReview(examples.find((e) => e.id === selected)!),
              );
              notify("Подготовленный учебный разбор открыт");
            }}
          >
            Показать учебный разбор
          </button>
        </div>
        <p className="quiet">
          Смена примера начинает новую проверку. Уже добавленные цели остаются в
          маршруте.
        </p>
      </section>
      {example && review ? (
        <div className="document-layout">
          <section className="source-panel">
            <p className="eyebrow">ИСХОДНЫЙ УЧЕБНЫЙ ТЕКСТ</p>
            <h2>{example.title}</h2>
            {example.pages.map((page, i) => (
              <div key={page}>
                <p className="quiet">Страница {i + 1}</p>
                <pre>{page}</pre>
              </div>
            ))}
          </section>
          <section aria-label="Результат разбора">
            <div className="results-heading">
              <h2>Сведения для проверки</h2>
              <span className="tag">Учебный результат</span>
            </div>
            {example.facts.length === 0 ? (
              <div className="empty">
                <h3>Цели не найдены</h3>
                <p>
                  В этом примере нет рекомендаций. Мы не добавляем сведения,
                  которых нет в источнике.
                </p>
                <Link className="button light" href="/ru/route">
                  Добавить цель вручную →
                </Link>
              </div>
            ) : (
              example.facts.map((fact) => {
                const decision = review.decisions[fact.id]!;
                const added = goals.some((g) => g.id === `fact-${fact.id}`);
                const historical = isHistorical(fact.validUntil);
                const decided = decision.status !== "pending";
                return (
                  <article className="fact-card" key={fact.id}>
                    <span className="tag">
                      {decision.status === "rejected"
                        ? "Отклонено"
                        : added
                          ? "В маршруте"
                          : decided
                            ? "Подтверждено"
                            : "Нужно подтверждение"}
                    </span>
                    <h3>{fact.value}</h3>
                    <p className="quiet">Источник · страница {fact.page}</p>
                    <blockquote>{fact.quote}</blockquote>
                    <p className={historical ? "notice" : "quiet"}>
                      {fact.validUntil
                        ? `Срок: ${fact.validUntil}. ${historical ? "Истёк. Запись останется исторической." : "Проверьте связь срока с этой рекомендацией."}`
                        : "Срок не указан. Его необходимо уточнить."}
                    </p>
                    {decision.editing && (
                      <label>
                        Ваша формулировка (исходная цитата сохранится)
                        <textarea
                          maxLength={200}
                          value={decision.value}
                          onChange={(e) =>
                            update(fact.id, { value: e.target.value })
                          }
                        />
                      </label>
                    )}
                    {decision.status === "corrected" && (
                      <p>
                        <b>Исправлено вами:</b> {decision.value}
                      </p>
                    )}
                    {!decided && !added ? (
                      <div className="actions">
                        <button
                          className="button primary"
                          disabled={!decision.value.trim()}
                          onClick={() => confirm(fact)}
                        >
                          {decision.editing
                            ? "Подтвердить исправление"
                            : "Подтвердить и добавить"}
                        </button>
                        <button
                          className="button light"
                          onClick={() =>
                            update(fact.id, {
                              editing: !decision.editing,
                              value: fact.value,
                            })
                          }
                        >
                          {decision.editing
                            ? "Отменить исправление"
                            : "Исправить"}
                        </button>
                        <button
                          className="text-button"
                          onClick={() =>
                            update(fact.id, {
                              status: "rejected",
                              editing: false,
                            })
                          }
                        >
                          Отклонить
                        </button>
                      </div>
                    ) : (
                      <p className="quiet">
                        {decision.status === "rejected"
                          ? "Это сведение не добавлено в маршрут."
                          : added
                            ? "Цель добавлена один раз. Посмотрите её в маршруте."
                            : "Цель была подтверждена. Вы можете вернуть её после удаления."}
                      </p>
                    )}
                    {decided && !added && decision.status !== "rejected" && (
                      <button
                        className="button light"
                        onClick={() => confirm(fact)}
                      >
                        Вернуть цель в маршрут
                      </button>
                    )}
                  </article>
                );
              })
            )}
            <Link className="button light" href="/ru/route">
              Перейти в мой маршрут →
            </Link>
          </section>
        </div>
      ) : (
        <div className="empty">
          <h2>Посмотрите, как это работает</h2>
          <p>
            Выберите пример и откройте подготовленный разбор. Никакие цели не
            добавляются автоматически.
          </p>
        </div>
      )}
    </>
  );
}
