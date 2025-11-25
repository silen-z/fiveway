import { NodeId } from "../src/tree/id.ts";
import { createNode, NavtreeNode, NodeConfig } from "../src/tree/node.ts";
import {
  type NavigationTree,
  createNavigationTree,
  holdFocus,
  insertNode,
} from "../src/tree/tree.ts";

type NodeSpec = Omit<NodeConfig, "parent"> & {
  children?: NodeSpec[];
};

export type TreeSpecResult = { tree: NavigationTree } & {
  [key: NodeId]: NavtreeNode;
};

export function createTreeFromSpec(spec: NodeSpec): TreeSpecResult {
  const tree = createNavigationTree();
  const nodes: { [key: NodeId]: NavtreeNode } = {};

  const releaseFocus = holdFocus(tree)!;

  proccessSpec(spec, tree.nodes.get("#")!, nodes);

  releaseFocus();

  return { tree, ...nodes } as TreeSpecResult;
}

function proccessSpec(spec: NodeSpec, parent: NavtreeNode, nodes: { [key: NodeId]: NavtreeNode }) {
  if (spec.id === "tree") {
    throw new Error(`invalid test node ID: ${spec.id}`);
  }

  if (spec.id in nodes) {
    throw new Error(`duplicate test node ID: ${spec.id}`);
  }

  const node = createNode({
    id: spec.id,
    order: spec.order,
    handler: spec.handler,
    parent: parent.id,
  });

  insertNode(parent.tree, node);

  nodes[spec.id] = node as NavtreeNode;

  if (spec.children == null) {
    return;
  }

  for (const child of spec.children) {
    proccessSpec(child, node as NavtreeNode, nodes);
  }
}
