import {
  type GridPos,
  containerHandler,
  createNavigationNode,
  gridItemHandler,
  type NodeId,
} from "@fiveway/solid";
import { type JSX } from "solid-js";

import css from "./ExampleBox.module.css";

type ExampleBoxProps = {
  navId: NodeId;
  gridPos: GridPos;
  label: string;
  description: string;
  children: JSX.Element;
};

export function ExampleBox(props: ExampleBoxProps) {
  const nav = createNavigationNode({
    id: props.navId,
    handler: containerHandler.prepend(gridItemHandler(props.gridPos)),
  });

  return (
    <nav.Context>
      <div class={css.box}>
        <div class={css.label}>{props.label}</div>
        <div class={css.description}>{props.description}</div>
        <div class={css.content}>{props.children}</div>
      </div>
    </nav.Context>
  );
}
