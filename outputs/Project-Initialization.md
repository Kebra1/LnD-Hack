# Project Initialization — отчёт этапа

Проект «Маршрут семьи», 11 ноября 2026. Основание — существующий Architecture Design Document v1.1. Приложение создано в корне текущего workspace. До начала работ здесь были только outputs и work, package.json и Git отсутствовали. Применимых AGENTS.md в родительских папках не было. После запуска Next.js создал собственный AGENTS.md с указанием читать bundled framework docs.

## План и результат

- [x] Изучить v1.1 и проверить существующие файлы.
- [x] Создать Git на ветке main, ignore и правила окончания строк.
- [x] Настроить Next.js App Router, Node.js 24, TypeScript strict и ESLint.
- [x] Настроить Zod validation окружения и server-only границы.
- [x] Подготовить PostgreSQL/Drizzle configuration и локальный Compose.
- [x] Создать папки catalog, routes и documents с ответственностями.
- [x] Проверить dev, production build и production HTTP.
- [x] Проверить реальное соединение и транзакцию PostgreSQL через Drizzle.
- [x] Выполнить необходимые тесты и проверить воспроизводимость npm ci.

## Согласование с архитектурой

В v1.1 постоянная БД относится к Pilot. Текущее поручение явно включает Drizzle/PostgreSQL configuration, поэтому подключение подготовлено и проверено уже здесь. Демо запускается без DATABASE_URL. Для db-команд URL обязателен, в режиме pilot он также обязателен при проверке env. Доменные таблицы добавляются вместе с функциями и проверенными миграциями.

Пробный AI-вызов из расширенной задачи T01 не выполнялся в Project Initialization. Пользователь запросил первый этап и запретил переходить к последующим. Выбор AI-провайдера, ключа и pipeline остаётся задачей этапа AI. Зависимости PDF/AI пока не установлены.

## Созданные файлы

| Группа | Файлы |
|---|---|
| Пакеты и версии | package.json, package-lock.json, .npmrc, .nvmrc |
| Git | .gitignore, .gitattributes, .git с веткой main |
| Next/TypeScript/ESLint | next.config.ts, tsconfig.json, eslint.config.mjs, src/instrumentation.ts |
| App Router | src/app/layout.tsx, page.tsx, globals.css, page.module.css |
| Окружение | .env.example, src/lib/env/schema.ts, server.ts, scripts/check-environment.ts |
| PostgreSQL/Drizzle | compose.yaml, drizzle.config.ts, src/lib/db/connection.ts, client.ts, schema/index.ts, scripts/check-database.ts |
| Модули | src/features/catalog/README.md, routes/README.md, documents/README.md |
| Тесты | vitest.config.ts, tests/env.test.ts |
| Инструкции | README.md, этот отчёт |

Сгенерированы Next AGENTS.md и игнорируемые next-env.d.ts, .next, tsbuildinfo. Drizzle создал пустой drizzle/meta/_journal.json при проверке generate. SQL-миграций и доменных таблиц пока нет.

Существующий ADD v1.1 и материалы исследования сохранены. Исходники приложения не существовали, поэтому повторного создания функциональности не было. Коммиты не создавались. Git remote не настроен.

## Реализованная конфигурация

- Next.js 16.4.6, React 19.3.1, TypeScript 5.9.3, Zod 4.6.7.
- Drizzle ORM 0.45.4, Drizzle Kit 0.31.11 и node-postgres.
- Strict TypeScript, noUncheckedIndexedAccess и exactOptionalPropertyTypes.
- Env проверяется в Next config и runtime instrumentation. Сообщения ошибок содержат только имена полей, без значений секретов.
- Строки true/false разбираются явно. Значения yes/1/пустая строка отклоняются.
- Pilot требует DATABASE_URL, demo запрещает real document upload.
- Соединение с БД создаётся лениво, pool переиспользуется при dev reload. DB client и серверный env защищены server-only boundary.
- Главная страница сообщает о подготовке приложения, без обещаний доступных функций.

Создан игнорируемый .env.local со случайным локальным паролем. Секреты не включены в Git и этот отчёт. Рабочие данные семьи или mock-каталог не добавлялись.

## Пройденные проверки

| Проверка | Результат |
|---|---|
| npm ci | Успешная повторная установка из lockfile |
| npm run lint | Успешно, warnings=0 |
| npm run typecheck | Next typegen и tsc --noEmit успешно |
| npm test | 18 тестов пройдены |
| npm run build | Production build успешен |
| npm run dev | Сервер запущен, GET / вернул HTTP 200 и ожидаемый текст |
| npm start | Production server запущен, GET / вернул HTTP 200 |
| npm run env:check | Успешно, секреты не печатаются |
| npm run db:check | Настоящая PostgreSQL 17.11, SQL-запрос и Drizzle transaction успешны, timezone UTC |
| npm run db:generate | Config/schema загружаются, 0 tables, SQL не создаётся |
| npm ls --depth=0 | Все прямые зависимости разрешены |
| npm audit --omit=dev | 0 уязвимостей runtime-зависимостей |
| Git ignore | .env.local, work и исходные бинарные research-материалы исключены |

Тесты проверяют отсутствие обязательной БД у demo, обязательность у pilot/db-команд, PostgreSQL URL, безопасные ошибки, boolean flags и границы размера pool. Один тест выявил исключение URL constructor до безопасного форматирования ошибки — обработка исправлена и весь набор повторно пройден.

## Ограничения окружения и зависимостей

Docker Desktop не запустил engine из-за внутренней ошибки Docker Inference. Factory reset и изменение системных настроек не выполнялись. Поэтому Compose-конфигурация подготовлена, но запуск контейнера на этом компьютере не подтверждён.

Для реальной DB-проверки в work загружены отдельные бинарники PostgreSQL 17.11. Кластер work/postgres-data слушает только 127.0.0.1:5432 и использует scram-sha-256. Бинарники не являются зависимостью приложения. Команды его запуска/остановки записаны в README. Перед запуском Docker PostgreSQL этот проверочный сервер нужно остановить, чтобы освободить порт.

ESLint 10 создаёт несовместимые peer dependencies у вложенных Next-плагинов. В lockfile оставлен совместимый ESLint 9.39.5, помеченный npm как deprecated. Полный npm audit показывает 11 moderate замечаний dev-toolchain, включая Drizzle Kit/esbuild и typescript-eslint/minimatch. Runtime audit чистый. Принудительные major-обновления и произвольные overrides не применялись.

Проверены HTTP и HTML главной страницы, полноценная browser/E2E-проверка пользовательских сценариев относится к их реализации. AI и обработка персональных данных пока отсутствуют.

## Запуск и текущие процессы

Production-страница доступна по http://localhost:3000. Для разработки остановить запущенный production server и выполнить npm run dev. Локальная проверочная PostgreSQL также оставлена работающей.

Основные команды:

```text
npm ci
npm run env:check
npm run dev
npm run check
npm run build
npm start
npm run db:check
```

Штатный запуск БД на компьютере с исправным Docker:

```text
npm run db:up
npm run db:check
npm run db:down
```

Следующим этапом по архитектуре идёт каталог с контрактами фильтров и карточек. В рамках этого этапа он не реализовывался.
