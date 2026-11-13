export interface RouteGoal {
  id: string;
  title: string;
  done: boolean;
  offeringIds: string[];
  origin: "manual" | "document" | "user_correction";
  quote: string | null;
  historical: boolean;
}
export type RouteAction =
  | { type: "add"; goal: RouteGoal }
  | { type: "toggle"; id: string }
  | { type: "remove"; id: string }
  | { type: "offering"; id: string; offeringId: string }
  | { type: "removeOffering"; id: string; offeringId: string };
export function routeReducer(
  state: RouteGoal[],
  action: RouteAction,
): RouteGoal[] {
  if (action.type === "add")
    return state.some((g) => g.id === action.goal.id)
      ? state
      : [...state, action.goal];
  if (action.type === "remove") return state.filter((g) => g.id !== action.id);
  return state.map((g) => {
    if (g.id !== action.id) return g;
    if (action.type === "toggle") return { ...g, done: !g.done };
    if (action.type === "removeOffering")
      return {
        ...g,
        offeringIds: g.offeringIds.filter((id) => id !== action.offeringId),
      };
    return g.offeringIds.includes(action.offeringId)
      ? g
      : { ...g, offeringIds: [...g.offeringIds, action.offeringId] };
  });
}
