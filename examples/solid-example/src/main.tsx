/* @refresh reload */

import { createNavigationTree } from "@fiveway/core";
import { enableDevtools } from "@fiveway/devtools";
import { createActionHandler, NavigationProvider, useSyncFocus } from "@fiveway/solid";
import { render } from "solid-js/web";

import { Showcase } from "./Showcase.tsx";

import "./styles.css";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error("Root element not found");
}

const navigationTree = createNavigationTree();

enableDevtools(navigationTree);

Object.defineProperties(window, {
  FIVEWAY: { configurable: true, value: navigationTree },
});

function App() {
  createActionHandler(navigationTree);
  useSyncFocus(navigationTree);
  return (
    <NavigationProvider tree={navigationTree}>
      <Showcase />
    </NavigationProvider>
  );
}

render(App, root!);
