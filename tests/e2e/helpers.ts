import { expect, type Page } from "@playwright/test";
export async function completeProfile(
  page: Page,
  locale: "ru" | "kk" = "ru",
  age = "12",
  needs = false,
) {
  const kk = locale === "kk";
  await page
    .getByRole("spinbutton", {
      name: kk ? "Толық жасы" : "Возраст, полных лет",
      exact: true,
    })
    .fill(age);
  await page
    .getByRole("combobox", {
      name: kk ? "Сіз қайдансыз?" : "Откуда вы?",
      exact: true,
    })
    .selectOption("Алматы");
  if (needs) {
    const more = page.locator("details.more-options");
    if (!(await more.evaluate((el: HTMLDetailsElement) => el.open)))
      await more.locator("summary").click();
    await page
      .getByRole("checkbox", {
        name: kk ? "Сөйлеу және қарым-қатынас" : "Речь и общение",
        exact: true,
      })
      .check();
  }
  await page
    .getByRole("button", {
      name: kk ? "Сақтап, маман таңдау" : "Сохранить и подобрать",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: kk ? "Қолдау бүкіл отбасына қажет" : "Поддержка нужна всей семье",
      exact: true,
    }),
  ).toBeVisible();
}
