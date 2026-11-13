import type { Filters, Offering } from "./contracts";
import { matchesSearch } from "@/lib/search";
import { localizeOffering } from "./translations";

export const offerings: Offering[] = [
  {
    id: "speech-group",
    name: "Айгерим Т. · логопед",
    kind: "Специалист",
    service: "Практика общения в небольшой группе",
    audience: "child",
    city: "Алматы",
    category: "communication",
    ages: [6, 16],
    languages: ["ru"],
    address: "Учебный кабинет, ул. Примерная, 18",
    conditions:
      "Учебный формат: до 4 участников, 50 минут. До выбора уточнить подходящий возраст, состав группы и доступность входа.",
    price: "Учебная стоимость: 5 000 ₸",
    contact: "group@example.invalid",
    description:
      "Вымышленный пример группового формата для сравнения с индивидуальными занятиями.",
    source:
      "Синтетическая карточка demo-catalog-v2 / speech-group. Не является проверенным предложением.",
  },
  {
    id: "speech-family",
    name: "Центр «Диалог»",
    kind: "Центр",
    service: "Индивидуальное знакомство со специалистом",
    audience: "child",
    city: "Алматы",
    category: "communication",
    ages: [4, 17],
    languages: ["ru"],
    address: "Учебный филиал, ул. Примерная, 30",
    conditions:
      "Первая беседа, 30 минут. Участие родителя по согласованию. Свободное время и язык нужно уточнить перед обращением.",
    price: "Цена неизвестна",
    contact: "dialog@example.invalid",
    description:
      "Вымышленная карточка центра с неизвестной стоимостью: её нельзя считать бесплатной.",
    source:
      "Синтетическая карточка demo-catalog-v2 / speech-family. Не является проверенным предложением.",
  },
  {
    id: "speech",
    name: "Алия С. · логопед",
    kind: "Специалист",
    service: "Развитие речи и альтернативной коммуникации",
    audience: "child",
    city: "Алматы",
    category: "communication",
    ages: [3, 17],
    languages: ["ru", "kk"],
    address: "Учебный кабинет, ул. Примерная, 12",
    conditions:
      "Индивидуально, 45 минут. Предварительная беседа с родителем. Запись и доступность нужно уточнить.",
    price: "Учебная стоимость: 8 000 ₸",
    contact: "speech@example.invalid",
    description:
      "Знакомство со способами общения, подбор упражнений и обсуждение повседневных ситуаций семьи.",
    source:
      "Синтетическая карточка demo-catalog-v1 / speech. Не является проверенным предложением.",
  },
  {
    id: "steps",
    name: "Центр «Небольшие шаги»",
    kind: "Центр",
    service: "Группа общения и социальных навыков",
    audience: "child",
    city: "Алматы",
    category: "development",
    ages: [7, 17],
    languages: ["ru"],
    address: "Учебный филиал, ул. Примерная, 24",
    conditions:
      "Группа до 6 участников, 60 минут. Перед первым визитом — знакомство. Доступность входа неизвестна.",
    price: "Учебная стоимость: 6 000 ₸",
    contact: "steps@example.invalid",
    description:
      "Учебный пример занятий для школьников: совместные задачи, общение и освоение новых ситуаций.",
    source:
      "Синтетическая карточка demo-catalog-v1 / steps. Не является проверенным предложением.",
  },
  {
    id: "early",
    name: "Центр «Начало»",
    kind: "Центр",
    service: "Игровые занятия для дошкольников",
    audience: "child",
    city: "Астана",
    category: "development",
    ages: [2, 6],
    languages: ["ru", "kk"],
    address: "Учебное пространство, ул. Образцовая, 8",
    conditions:
      "Занятия с участием родителя. Условия первичной встречи нужно уточнить.",
    price: "Цена неизвестна",
    contact: "early@example.invalid",
    description:
      "Пример предложения с чёткой возрастной границей для проверки подбора.",
    source:
      "Синтетическая карточка demo-catalog-v1 / early. Не является проверенным предложением.",
  },
  {
    id: "balance",
    name: "Дана К. · психолог",
    kind: "Специалист",
    service: "Поддержка родителя и забота о себе",
    audience: "adult",
    city: "Алматы",
    category: "psychology",
    ages: [18, 99],
    languages: ["ru", "kk"],
    address: "Учебный кабинет, ул. Спокойная, 5",
    conditions:
      "Индивидуальная встреча, 50 минут. Можно обсудить усталость, тревогу и поиск поддержки.",
    price: "Учебная стоимость: 10 000 ₸",
    contact: "balance@example.invalid",
    description:
      "Пример пространства, в котором внимание уделяется потребностям самого родителя.",
    source:
      "Синтетическая карточка demo-catalog-v1 / balance. Не является проверенным предложением.",
  },
  {
    id: "movement",
    name: "Центр «Опора»",
    kind: "Центр",
    service: "Навыки повседневной самостоятельности",
    audience: "child",
    city: "Алматы",
    category: "mobility",
    ages: null,
    languages: null,
    address: "Учебный филиал, ул. Примерная, 36",
    conditions:
      "Возраст, язык, стоимость и доступность необходимо уточнить. Данные не подтверждены.",
    price: "Цена неизвестна",
    contact: "support@example.invalid",
    description:
      "Пример неполной карточки: неизвестные условия не считаются подходящими автоматически.",
    source:
      "Синтетическая карточка demo-catalog-v1 / movement. Не является проверенным предложением.",
  },
];
export const emptyFilters: Filters = {
  audience: "",
  city: "",
  age: "",
  category: "",
  language: "",
  includeUnknown: false,
};
export function searchOfferings(filters: Filters) {
  return offerings
    .filter((item) => {
      if (filters.query) {
        const translated = localizeOffering(item, "kk");
        if (
          !matchesSearch(
            `${item.name} ${item.service} ${item.description} ${item.city} ${translated.name} ${translated.service} ${translated.description}`,
            filters.query,
          )
        )
          return false;
      }
      if (filters.audience && item.audience !== filters.audience) return false;
      if (filters.city && item.city !== filters.city) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.language && !item.languages?.includes(filters.language))
        return false;
      if (filters.age !== "") {
        const age = Number(filters.age);
        if (!Number.isInteger(age) || age < 0 || age > 99) return false;
        if (!item.ages) return filters.includeUnknown;
        if (age < item.ages[0] || age > item.ages[1]) return false;
      }
      return true;
    })
    .sort(
      (a, b) => Number(!a.ages) - Number(!b.ages) || a.id.localeCompare(b.id),
    );
}
