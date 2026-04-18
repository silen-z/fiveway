export type NavigationDirection = "up" | "down" | "left" | "right";

// This interface provides a way to extend the default actions:
//
// declare module "@fiveway/core" {
//   interface NavigationActions {
//     custom: { kind: "my-custom-action", customValue: string };
//   }
// }

export type SelectAction = {
  kind: "select";
};

export type MoveAction = {
  kind: "move";
  direction: NavigationDirection | "back";
};

export type FocusAction = {
  kind: "focus";
  direction: NavigationDirection | "initial" | null;
};

export type QueryAction = {
  kind: "query";
  key: string;
  value: unknown;
};

export interface NavigationActions {
  select: SelectAction;
  move: MoveAction;
  focus: FocusAction;
  query: QueryAction;
}

export type NavigationAction = NavigationActions[keyof NavigationActions];
