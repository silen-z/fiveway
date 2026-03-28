import { createNavigationTree } from "@fiveway/core";
import { fivewayDevtoolsPlugin } from "@fiveway/devtools/react";
import { NavigationProvider, useActionHandler, useSyncFocus } from "@fiveway/react";
import { TanStackDevtools } from "@tanstack/react-devtools";

import "./styles.css";
import React from "react";
import ReactDOM from "react-dom/client";

import { Showcase } from "./Showcase.tsx";
// import { Items } from "./Benchmark.tsx";

const navigationTree = createNavigationTree();

Object.defineProperties(window, {
  FIVEWAY: { configurable: true, value: navigationTree },
});

function App() {
  useActionHandler(navigationTree);
  useSyncFocus(navigationTree);
  return (
    <NavigationProvider tree={navigationTree}>
      <Showcase />
    </NavigationProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <TanStackDevtools plugins={[fivewayDevtoolsPlugin()]} />
  </React.StrictMode>,
);
