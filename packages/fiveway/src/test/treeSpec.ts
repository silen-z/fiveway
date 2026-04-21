import { type NavigationHandler } from "../handler/handler.ts";
import { type NodeId } from "../tree/id.ts";
import { createNode, type NavtreeNode } from "../tree/node.ts";
import { type NavigationTree, createNavigationTree, holdFocus, insertNode } from "../tree/tree.ts";

export type TreeSpec = {
  id: string;
  order?: number;
  handler?: NavigationHandler;
  children?: TreeSpec[];
};

type SpecIds<T> = T extends { id: infer I extends string }
  ? I | (T extends { children: readonly (infer U)[] } ? SpecIds<U> : never)
  : never;

export type TreeSpecResult<S extends TreeSpec> = {
  tree: NavigationTree;
  nodes: { [P in SpecIds<S>]: NavtreeNode };
};

export function createTreeFromSpec<const S extends TreeSpec>(spec: S): TreeSpecResult<S> {
  const tree = createNavigationTree();
  const nodes: { [key: NodeId]: NavtreeNode } = {};

  const releaseFocus = holdFocus(tree)!;

  proccessSpec(spec, tree.nodes.get("#")!, nodes);

  releaseFocus();

  return { tree, nodes } as TreeSpecResult<S>;
}

function proccessSpec(spec: TreeSpec, parent: NavtreeNode, nodes: { [key: NodeId]: NavtreeNode }) {
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
