import { describe, it, expect } from "vitest";
import {
  needsGuidance,
  profileCity,
  recommendOfferings,
  validProfile,
  type ChildProfile,
} from "../src/features/children/service";
import {
  bookingReducer,
  prepareBooking,
  searchNannies,
  type BookingDraft,
  type BookingState,
} from "../src/features/nannies/service";
import {
  demoAuthor,
  forumReducer,
  initialPosts,
  searchPosts,
  type Post,
} from "../src/features/community/service";
const profile: ChildProfile = {
  parentName: "",
  alias: "Пример",
  age: 12,
  city: "Алматы",
  language: "kk",
  needs: ["communication"],
  diagnosis: "",
  documentsStatus: "",
  documents: [],
  documentFiles: [],
  revision: 1,
};
const now = Date.parse("2026-11-13T00:00:00Z");
const draft: BookingDraft = {
  id: "b1",
  nannyId: "nanny-a",
  mode: "hourly",
  startDate: "2026-11-14",
  startTime: "09:00",
  hours: 2,
  months: 1,
  weeklyHours: 40,
};
describe("анкета: город и справки", () => {
  it("другой город не фильтрует каталог, а подсказки только без справок", () => {
    expect(profileCity({ city: "Шымкент" })).toBe("");
    expect(profileCity({ city: "Астана" })).toBe("Астана");
    expect(needsGuidance({ documentsStatus: "none" })).toBe(true);
    expect(needsGuidance({ documentsStatus: "unsure" })).toBe(true);
    expect(needsGuidance({ documentsStatus: "have" })).toBe(false);
    expect(needsGuidance({ documentsStatus: "" })).toBe(false);
    expect(
      recommendOfferings({ ...profile, city: "Шымкент", language: "" }).length,
    ).toBeGreaterThan(0);
  });
});
describe("профиль и рекомендации", () => {
  it("все выбранные условия учитываются, unknown не считается подтвержденным", () => {
    expect(recommendOfferings(profile).map((o) => o.id)).toEqual(["speech"]);
    expect(recommendOfferings({ ...profile, city: "Астана" })).toEqual([]);
  });
  it("неполный профиль допустим, дробный и отрицательный возраст нет", () => {
    expect(
      validProfile({
        ...profile,
        age: null,
        needs: [],
        city: "",
        language: "",
      }),
    ).toBe(true);
    expect(validProfile({ ...profile, city: "Шымкент" })).toBe(true);
    expect(validProfile({ ...profile, city: "Неизвестный" })).toBe(false);
    expect(
      validProfile({
        ...profile,
        documentFiles: [{ name: "a.pdf", size: 11 * 1024 * 1024 }],
      }),
    ).toBe(false);
    expect(
      validProfile({
        ...profile,
        documentFiles: Array.from({ length: 6 }, (_, i) => ({
          name: `f${i}.pdf`,
          size: 1,
        })),
      }),
    ).toBe(false);
    expect(validProfile({ ...profile, diagnosis: "x".repeat(121) })).toBe(
      false,
    );
    expect(
      validProfile({ ...profile, documentsStatus: "nope" as never }),
    ).toBe(false);
    expect(validProfile({ ...profile, age: 1.5 })).toBe(false);
    expect(validProfile({ ...profile, age: -1 })).toBe(false);
  });
  it("поиск нянь применяет формат, бюджет, язык и возраст", () => {
    expect(
      searchNannies({
        query: "",
        city: "Алматы",
        mode: "hourly",
        language: "kk",
        maxHourly: "2100",
        profile,
      }).map((n) => n.id),
    ).toEqual(["nanny-d"]);
  });
});
describe("демо-бронирование", () => {
  it("рассчитывает часы и не дублирует id", () => {
    let state = bookingReducer(
      { items: [], error: null },
      { type: "reserve", draft, profile, now },
    );
    state = bookingReducer(state, { type: "reserve", draft, profile, now });
    expect(state.items).toHaveLength(1);
    expect(state.items[0]?.estimated).toBe(5000);
  });
  it("пересечение запрещено, соседний интервал разрешен, отмена освобождает", () => {
    const first = bookingReducer(
      { items: [], error: null },
      { type: "reserve", draft, profile, now },
    );
    expect(
      prepareBooking(
        { ...draft, id: "b2", startTime: "10:00" },
        profile,
        first.items,
        now,
      ),
    ).toBe("bookingConflict");
    expect(
      typeof prepareBooking(
        { ...draft, id: "b3", startTime: "11:00" },
        profile,
        first.items,
        now,
      ),
    ).toBe("object");
    const cancelled = bookingReducer(first, { type: "cancel", id: "b1" });
    expect(
      typeof prepareBooking(
        { ...draft, id: "b4" },
        profile,
        cancelled.items,
        now,
      ),
    ).toBe("object");
  });
  it("прошлое, неверная дата, возраст и формат отклоняются", () => {
    expect(
      prepareBooking({ ...draft, startDate: "2026-11-12" }, profile, [], now),
    ).toBe("bookingInvalid");
    expect(
      prepareBooking({ ...draft, startDate: "2026-02-30" }, profile, [], now),
    ).toBe("bookingInvalid");
    expect(prepareBooking(draft, { ...profile, age: null }, [], now)).toBe(
      "bookingAge",
    );
    expect(
      prepareBooking(
        { ...draft, nannyId: "nanny-c", mode: "hourly" },
        { ...profile, age: 3 },
        [],
        now,
      ),
    ).toBe("bookingUnsupported");
  });
  it("месяц ограничен календарём, постоянная бронь блокирует будущий период", () => {
    const monthly = prepareBooking(
      { ...draft, mode: "monthly", startDate: "2027-01-31" },
      profile,
      [],
      now,
    );
    expect(typeof monthly).toBe("object");
    if (typeof monthly !== "string")
      expect(new Date(monthly.end!).toISOString()).toBe(
        "2027-02-27T19:00:00.000Z",
      );
    let state: BookingState = bookingReducer(
      { items: [], error: null },
      { type: "reserve", draft: { ...draft, mode: "permanent" }, profile, now },
    );
    expect(state.items[0]?.end).toBeNull();
    state = bookingReducer(state, {
      type: "reserve",
      draft: { ...draft, id: "later", startDate: "2027-05-01" },
      profile,
      now,
    });
    expect(state.error?.code).toBe("bookingConflict");
  });
});
describe("учебный форум", () => {
  const post: Post = {
    id: "mine",
    authorId: demoAuthor,
    title: "Моя тема",
    body: "Хочу обсудить расписание",
    locale: "ru",
    topic: "care",
    createdAt: now,
    comments: [],
    reported: false,
  };
  it("чужие темы не меняются и не удаляются", () => {
    expect(
      forumReducer(initialPosts, {
        type: "delete",
        id: initialPosts[0]!.id,
        actorId: demoAuthor,
      }),
    ).toHaveLength(initialPosts.length);
    expect(
      forumReducer(initialPosts, {
        type: "edit",
        id: initialPosts[0]!.id,
        actorId: demoAuthor,
        title: "x",
        body: "x",
        topic: "support",
      })[0]?.title,
    ).toBe(initialPosts[0]!.title);
  });
  it("публикация/правка/комментарий и поиск работают без дублей", () => {
    let state = forumReducer([], { type: "create", post });
    state = forumReducer(state, { type: "create", post });
    expect(state).toHaveLength(1);
    state = forumReducer(state, {
      type: "edit",
      id: "mine",
      actorId: demoAuthor,
      title: "Расписание няни",
      body: "Обсудим график",
      topic: "care",
    });
    state = forumReducer(state, {
      type: "comment",
      postId: "mine",
      comment: {
        id: "c",
        authorId: demoAuthor,
        body: "Нужен гибкий режим",
        locale: "ru",
        createdAt: now,
      },
    });
    expect(searchPosts(state, "гибкий режим", "care", "recent")).toHaveLength(
      1,
    );
    expect(
      forumReducer(state, {
        type: "deleteComment",
        postId: "mine",
        commentId: "c",
        actorId: "other",
      })[0]?.comments,
    ).toHaveLength(1);
    expect(
      forumReducer(state, { type: "delete", id: "mine", actorId: demoAuthor }),
    ).toEqual([]);
  });
  it("пустые сообщения не публикуются, казахский поиск находит учебные темы", () => {
    expect(
      forumReducer([], { type: "create", post: { ...post, body: " " } }),
    ).toEqual([]);
    expect(searchPosts(initialPosts, "кітап", "", "recent")).toHaveLength(1);
  });
});
