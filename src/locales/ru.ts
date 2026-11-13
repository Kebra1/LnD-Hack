// Add a kk dictionary with these keys and enable it in the locale layout after translation.
export const ru = {
  home: "Главная",
  catalog: "Каталог помощи",
  route: "Мой маршрут",
  documents: "Разбор документа",
};
export type Messages = { [K in keyof typeof ru]: string };
