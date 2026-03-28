import { getHandlerInfo, type HandlerInfo, type NavtreeNode } from "@fiveway/core";
import * as Icon from "lucide-solid";
import { createMemo, Show, For } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useDevtoolContext } from "./context.js";

export function NodeDetail(props: { node: NavtreeNode; inspect: boolean }) {
  const devtools = useDevtoolContext();

  const nodeHandlers = createMemo(() => getHandlerInfo(devtools.tree, props.node.id));

  return (
    <div class="inspectedNode">
      <div class="sidebarToolbar" data-variant="alt">
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

      <div class="inspectedName">
        <span>{props.node.id}</span>
      </div>
      <NodeHandlers handlers={nodeHandlers()} />
    </div>
  );
}

function NodeHandlers(props: { handlers: HandlerInfo[] }) {
  return (
    <div class="handlerInfo">
      <For each={props.handlers}>
        {(handler) => {
          const name = "name" in handler ? handler.name.toString() : "<custom>";
          return (
            <div>
              <div class="handlerName">{name}</div>
              <div class="handlerProps">
                <For each={Object.entries(handler)}>
                  {([key, value]) => {
                    if (key === "name") {
                      return null;
                    }

                    return (
                      <span>
                        <span class="infoKey">{key}: </span>
                        <span class="infoValue">{value.toString()}</span>
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
