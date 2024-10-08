import { createGlobalId, type NodeId } from "./id.js";
import { type NavigationTree } from "./tree.js";
import type { NavigationHandler } from "./navigation.js";
import { defaultHandler } from "./handlers/default.js";
import { binarySearch } from "./array.js";

export type CreatedNavtreeNode = {
  tree: NavigationTree | null;
  id: NodeId;
  connected: boolean;
  parent: NodeId | null;
  order: number | null;
  handler: NavigationHandler;
  children: NodeChild[];
};

export type NavtreeNode = CreatedNavtreeNode & {
  tree: NavigationTree;
};

export type NodeChild = { id: NodeId; order: number | null; active: boolean };

export type NodeConfig = {
  id: string;
  parent: NodeId;
  order?: number;
  handler?: NavigationHandler;
};

export function createNode(options: NodeConfig): CreatedNavtreeNode {
  const globalId = createGlobalId(options.parent, options.id);

  return {
    id: globalId,
    connected: false,
    tree: null,
    parent: options.parent,
    order: options.order ?? null,
    handler: options.handler ?? defaultHandler,
    children: [],
  };
}

export type ContainerConfig = NodeConfig & {
  initial?: NodeId;
  rememberChildren?: boolean;
};

export function updateNode(
  node: CreatedNavtreeNode,
  options: Omit<NodeConfig, "id" | "parent">,
) {
  if (options.handler != null) {
    node.handler = options.handler;
  }

  if (options.order != null) {
    updateNodeOrder(node, options.order);
  }
}

function updateNodeOrder(node: CreatedNavtreeNode, order: number) {
  if (node.order === order || node.parent === null) {
    return;
  }

  node.order = order;

  const parentNode = node.tree?.nodes.get(node.parent);
  if (parentNode == null) {
    return;
  }

  const childIndex = parentNode.children.findIndex((i) => i.id === node.id);
  const newIndex = binarySearch(
    parentNode.children,
    (child) => order < (child.order ?? 0),
  );

  if (newIndex === -1 || newIndex === childIndex) {
    return;
  }

  let removed: NodeChild[] = [];
  if (childIndex !== -1) {
    parentNode.children[childIndex!]!.order = order;
    removed = parentNode.children.splice(childIndex, 1);
  }

  parentNode.children.splice(newIndex, 0, ...removed);
}
