/* @refresh reload */

import {
  createActionHandler,
  createNavigationTree,
  NavigationProvider,
  useFocusSync,
} from "@fiveway/solid";
import { render } from "solid-js/web";

import { Showcase } from "./Showcase.tsx";

import "./styles.css";

function App() {
  const navigationTree = createNavigationTree();

  createActionHandler(navigationTree);
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

render(App, root);
