export type NavigationDirection = "up" | "down" | "left" | "right";

// This interface provides a way to extend the default actions:
//
// declare module "@fiveway/core" {
//   interface NavigationActions {
//     custom: { kind: "my-custom-action", customValue: string };
//   }
// }
export interface NavigationActions {
  select: { kind: "select" };
  move: { kind: "move"; direction: NavigationDirection | "back" };
  focus: { kind: "focus"; direction: NavigationDirection | "initial" | null };
  query: { kind: "query"; key: string; value: unknown };
}

export type NavigationAction = NavigationActions[keyof NavigationActions];
