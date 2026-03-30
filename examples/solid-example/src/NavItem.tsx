import {
  itemHandler,
  type ChainedHandler,
  type NavigationHandler,
  type NodeId,
} from "@fiveway/core";
import { createElementHandler, createNavigationNode } from "@fiveway/solid";

import css from "./NavItem.module.css";

type NavItemProps = {
  navId: NodeId;
  order?: number;
  label: string;
  handler?: ChainedHandler;
};

const goBackHandler: NavigationHandler = (_, action, next) => {
  if (action.kind === "move" && action.direction === "back") {
    return "#";
  }
  return next();
};

export function NavItem(props: NavItemProps) {
  const elementHandler = createElementHandler();

  const nav = createNavigationNode({
    id: props.navId,
    order: props.order,
    handler: (props.handler ?? itemHandler()).prepend(goBackHandler).prepend(elementHandler),
  });

  return (
    <div tabIndex={0} onFocus={() => nav.focus()} ref={elementHandler.register} class={css.item}>
      {props.label}
    </div>
  );
}
