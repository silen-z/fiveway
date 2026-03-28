import { createNavigationTree } from "@fiveway/core";
import { fivewayDevtoolsPlugin } from "@fiveway/devtools/solid";
import { createActionHandler, NavigationProvider } from "@fiveway/solid";
import { TanStackDevtools } from "@tanstack/solid-devtools";
/* @refresh reload */
import { render } from "solid-js/web";

import { Showcase } from "./Showcase.tsx";

const fiveway = createNavigationTree();

function App() {
  createActionHandler(fiveway);
  return (
    <NavigationProvider tree={fiveway}>
      <Showcase />
      <TanStackDevtools plugins={[fivewayDevtoolsPlugin()]} />
    </NavigationProvider>
  );
}

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error("Root element not found");
}
render(App, root!);
