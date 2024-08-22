import { describe, expect, test } from "vitest";
import { insertNode, createNavigationTree } from "./tree.js";
import { createNode } from "./node.js";
import { NodeId } from "./id.js";
import { NavigationHandler, runHandler } from "./handler.js";
import { chainedHandler } from "./handlers/chain.js";

describe("handlers", () => {
  test("chainHandlers", () => {
    const logs: string[] = [];

    const logHandler =
      (msg: string, pass?: NodeId): NavigationHandler =>
      (n, a, next) => {
        if (a.kind === "select") {
          logs.push(n.id + ":" + msg);
          if (pass) {
            return next(pass);
          }
        }
        return next();
      };

    const testTree = createNavigationTree();

    insertNode(
      testTree,
      createNode({
        id: "node1",
        parent: "#",
        handler: chainedHandler(logHandler("4")).prepend(logHandler("3")),
      })
    );

    const testNode2 = insertNode(
      testTree,
      createNode({
        id: "node2",
        parent: "#",
        handler: chainedHandler(logHandler("2", "#/node1")).prepend(
          logHandler("1")
        ),
      })
    );

    const result = runHandler(testTree, testNode2.id, {
      kind: "select",
    });

    expect(result).toBeNull();
    expect(logs).toEqual(["#/node2:1", "#/node2:2", "#/node1:3", "#/node1:4"]);
  });
});
