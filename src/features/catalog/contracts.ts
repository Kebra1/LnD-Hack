export type Audience = "child" | "adult";
export const categories = {
  communication: "Речь и общение",
  development: "Развитие и обучение",
  psychology: "Психологическая поддержка",
  mobility: "Движение и самостоятельность",
};
export type Category = keyof typeof categories;
export interface Offering {
  id: string;
  name: string;
  kind: string;
  service: string;
  audience: Audience;
  city: string;
  category: Category;
  ages: [number, number] | null;
  languages: string[] | null;
  address: string;
  conditions: string;
  price: string;
  contact: string;
  description: string;
  source: string;
}
export interface Filters {
  query?: string;
  audience: Audience | "";
  city: string;
  age: string;
  category: string;
  language: string;
  includeUnknown: boolean;
}
