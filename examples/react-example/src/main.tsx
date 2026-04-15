import {
  createNavigationTree,
  NavigationProvider,
  useActionHandler,
  useFocusSync,
} from "@fiveway/react";
import React from "react";
import ReactDOM from "react-dom/client";

import { Showcase } from "./Showcase.tsx";

import "./styles.css";
// import { Items } from "./Benchmark.tsx";

function App() {
  const navigationTree = createNavigationTree();

  useActionHandler(navigationTree);
  useFocusSync(navigationTree);
  return (
    <NavigationProvider tree={navigationTree}>
      <Showcase />
    </NavigationProvider>
  );
}

const root = document.getElementById("root");
if (root == null) {
  throw new Error("root element not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
