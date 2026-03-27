import { getHandlerInfo, type HandlerInfo, type NavtreeNode } from "@fiveway/core";
import * as Icon from "lucide-solid";
import { createMemo, Show, For } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useDevtoolContext } from "./context.js";

import css from "./devtools.module.css";

export function NodeDetail(props: { node: NavtreeNode; inspect: boolean }) {
  const devtools = useDevtoolContext();

  const nodeHandlers = createMemo(() => getHandlerInfo(devtools.tree, props.node.id));

  return (
    <div class={css.inspectedNode}>
      <div class={css.sidebarToolbar} data-variant="alt">
        <div style={{ display: "flex", gap: "6px", "align-items": "center" }}>
          <Dynamic component={props.inspect ? Icon.Eye : Icon.Focus} />
          {props.inspect ? "inspecting" : "focused"}
        </div>
        <Show when={devtools.state.inspectedNode}>
          <button onClick={() => devtools.dispatch({ type: "inspectNode", id: null })}>
            stop inspecting
          </button>
        </Show>
      </div>

      <div class={css.inspectedName}>
        <span>{props.node.id}</span>
      </div>
      <NodeHandlers handlers={nodeHandlers()} />
    </div>
  );
}

function NodeHandlers(props: { handlers: HandlerInfo[] }) {
  return (
    <div class={css.handlerInfo}>
      <For each={props.handlers}>
        {(handler) => {
          const name = "name" in handler ? handler.name.toString() : "<custom>";
          return (
            <div>
              <div class={css.handlerName}>{name}</div>
              <div class={css.handlerProps}>
                <For each={Object.entries(handler)}>
                  {([key, value]) => {
                    if (key === "name") {
                      return null;
                    }

                    return (
                      <span>
                        <span class={css.infoKey}>{key}: </span>
                        <span class={css.infoValue}>{value.toString()}</span>
                      </span>
                    );
                  }}
                </For>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}
