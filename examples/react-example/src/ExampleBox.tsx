import {
  type GridPos,
  containerHandler,
  gridItemHandler,
  type NodeId,
  useNavigationNode,
} from "@fiveway/react";
import { type ReactNode } from "react";

import css from "./ExampleBox.module.css";

type ExampleBoxProps = {
  navId: NodeId;
  gridPos: GridPos;
  label: string;
  description: string;
  children: ReactNode;
};

export function ExampleBox(props: ExampleBoxProps) {
  const nav = useNavigationNode({
    id: props.navId,
    handler: containerHandler.prepend(gridItemHandler(props.gridPos)),
  });

  return (
    <nav.Context>
      <div className={css.box}>
        <div className={css.label}>{props.label}</div>
        <div className={css.description}>{props.description}</div>
        <div className={css.content}>{props.children}</div>
      </div>
    </nav.Context>
  );
}
