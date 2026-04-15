import { type NavigationAction, type NavigationDirection } from "../action.ts";
import { focusHandler } from "../handler/focus.ts";
import { runHandler } from "../handler/handler.ts";
import {
  type InspectorCommand,
  emitInspectorMessage,
  subscribeToInspectorCommands,
} from "../inspector.ts";
import { binarySearch } from "../lib/array.ts";
import { type NavtreeEvent, type NavtreeListener, callListeners } from "./events.ts";
import { type NodeId, convergingPaths, idsToRoot, isParent } from "./id.ts";
import { toInspectorNode, type CreatedNavtreeNode, type NavtreeNode } from "./node.ts";

export type NavigationTree = {
  label: string;
  nodes: Map<NodeId, NavtreeNode>;
  focus: NodeId;
  orphans: Map<NodeId, NodeId[]>;
  listeners: Map<NodeId, NavtreeListener[]>;
  focusLock: "free" | "locked" | "updatePending";
};

export function createNavigationTree(options: { label?: string } = {}): NavigationTree {
  const tree: NavigationTree = {
    label: options.label ?? randomLabel(),
    focus: "#",
    nodes: new Map(),
    orphans: new Map(),
    listeners: new Map(),
    focusLock: "free",
  };

  tree.nodes.set("#", {
    tree,
    id: "#",
    connected: true,
    parent: null,
    order: 0,
    handler: focusHandler(),
    children: [],
  });

  if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
    subscribeToInspectorCommands(tree, (cmd) => handleInspectorCommand(tree, cmd));
  }

  return tree;
}

export function insertNode(tree: NavigationTree, node: CreatedNavtreeNode): () => void {
  if (node.parent === null) {
    throw new Error("trying to insert root (or node without parent)");
  }

  // if there is node with the same id replace it
  if (tree.nodes.has(node.id)) {
    removeNode(tree, node.id);
  }

  node.tree = tree;
  const insertedNode = node as NavtreeNode;

  tree.nodes.set(node.id, insertedNode);

  const parentNode = tree.nodes.get(node.parent);
  if (parentNode != null && parentNode.connected) {
    connectNode(tree, parentNode, insertedNode);
  } else {
    markOrphan(tree, node.parent, node.id);
  }

  return () => {
    removeNode(tree, insertedNode);
  };
}

function connectNode(tree: NavigationTree, parentNode: NavtreeNode, node: NavtreeNode) {
  insertChildInOrder(parentNode, node);
  node.connected = true;

  const event: NavtreeEvent = {
    type: "structurechange",
    operation: "insert",
    id: node.id,
  };
  idsToRoot(node.id, (id) => {
    callListeners(tree, id, event);
  });

  if (isParent(tree.focus, node.id)) {
    updateFocus(tree);
  }

  const orphans = tree.orphans.get(node.id);
  if (orphans != null) {
    for (const orphanId of orphans) {
      connectNode(tree, node, tree.nodes.get(orphanId)!);
    }

    tree.orphans.delete(node.id);
  }

  if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
    emitInspectorMessage({
      type: "fiveway:treeState",
      tree: tree.label,
      nodes: [toInspectorNode(node), toInspectorNode(parentNode)],
    });
  }
}

export function removeNode(tree: NavigationTree, node: NodeId | NavtreeNode): void {
  const id = typeof node === "string" ? node : node.id;
  if (id === "#") {
    throw new Error("cannot remove root node");
  }

  const existingNode = tree.nodes.get(id);
  if (existingNode == null) {
    return;
  }

  // if node is not the same instance consider it removed
  if (typeof node !== "string" && node !== existingNode) {
    return;
  }

  if (existingNode.connected) {
    disconnectNode(tree, id);
  }

  tree.nodes.delete(id);
  clearOrphan(tree, existingNode.parent!, id);

  if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
    const parentNode = tree.nodes.get(existingNode.parent!);

    emitInspectorMessage({
      type: "fiveway:treeState",
      tree: tree.label,
      nodes: parentNode != null ? [toInspectorNode(parentNode)] : undefined,
      removedNodes: [id],
    });
  }

  if (isFocused(tree, existingNode.id)) {
    tree.focus = existingNode.parent ?? "#";
    updateFocus(tree);
  }
}

function disconnectNode(tree: NavigationTree, nodeId: NodeId) {
  const node = tree.nodes.get(nodeId);
  if (node == null) {
    return;
  }

  if (node.parent == null) {
    throw new Error("trying to disconnect invalid node");
  }

  // disconnect children first
  for (const child of node.children) {
    if (!child.active) {
      continue;
    }

    disconnectNode(tree, child.id);
    markOrphan(tree, node.id, child.id);
  }

  // its fine if parent is already disconnected/removed
  const parentNode = tree.nodes.get(node.parent);
  if (parentNode != null) {
    removeChildFromParent(parentNode, node);
  }

  node.connected = false;

  const event: NavtreeEvent = {
    type: "structurechange",
    operation: "removal",
    id: node.id,
  };
  idsToRoot(node.parent, (id) => {
    callListeners(tree, id, event);
  });
}

function updateFocus(tree: NavigationTree) {
  if (tree.focusLock !== "free") {
    tree.focusLock = "updatePending";
    return;
  }

  const focusedNode = tree.nodes.get(tree.focus);
  if (focusedNode == null || !focusedNode.connected) {
    idsToRoot(tree.focus, (id) => {
      // if we managed to focus a node we can stop searching
      if (focusNode(tree, id, { direction: "initial" })) {
        return false;
      }
    });
  } else {
    focusNode(tree, focusedNode.id, { direction: "initial" });
  }

  return;
}

export function holdFocus(tree: NavigationTree): (() => void) | null {
  if (tree.focusLock !== "free") {
    return null;
  }

  tree.focusLock = "locked";
  return () => {
    if (tree.focusLock === "free") {
      throw new Error("trying to release focus lock without holding it");
    }

    const updatePending = tree.focusLock === "updatePending";
    tree.focusLock = "free";
    if (updatePending) {
      updateFocus(tree);
    }
  };
}

export type FocusOptions = {
  direction?: NavigationDirection | "initial";
};

export function focusNode(
  tree: NavigationTree,
  targetId: NodeId,
  options: FocusOptions = {},
): boolean {
  const node = tree.nodes.get(targetId);
  if (node == null || !node.connected) {
    return false;
  }

  const resolvedId = runHandler(tree, targetId, {
    kind: "focus",
    direction: options.direction ?? null,
  });

  if (resolvedId === null) {
    return false;
  }

  if (tree.focus === resolvedId) {
    return true;
  }

  const lastFocused = tree.focus;
  tree.focus = resolvedId;

  const event: NavtreeEvent = {
    type: "focuschange",
    focused: tree.focus,
    previous: lastFocused,
  };

  convergingPaths(lastFocused, tree.focus, (id) => {
    callListeners(tree, id, event);
  });

  if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
    emitInspectorMessage({ type: "fiveway:treeState", tree: tree.label, focus: tree.focus });
  }

  return true;
}

export function handleAction(tree: NavigationTree, action: NavigationAction): void {
  const targetId = runHandler(tree, tree.focus, action);
  if (targetId !== null) {
    focusNode(tree, targetId);
  }
}

export function isFocused(tree: NavigationTree, nodeId: NodeId): boolean {
  if (tree.focus === nodeId) {
    return true;
  }

  return isParent(nodeId, tree.focus);
}

export function traverseNodes(
  tree: NavigationTree,
  nodeId: NodeId,
  depth: number | null,
  callback: (id: NodeId) => void,
): void {
  if (depth === 0) {
    return;
  }

  const node = tree.nodes.get(nodeId);
  if (node == null || !node.connected) {
    return;
  }

  for (const child of node.children) {
    if (child.active) {
      callback(child.id);
      traverseNodes(tree, child.id, depth !== null ? depth - 1 : null, callback);
    }
  }
}

function insertChildInOrder(parentNode: NavtreeNode, childNode: NavtreeNode) {
  const oldIndex = parentNode.children.findIndex((child) => child.id === childNode.id);

  if (oldIndex !== -1) {
    if (childNode.order === null) {
      // if node doesn't have explicit order use the remembered position
      parentNode.children[oldIndex]!.active = true;
      return;
    }

    // otherwise remove the tombstone so it can be inserted again at correct index
    parentNode.children.splice(oldIndex, 1);
  }

  const newIndex = binarySearch(
    parentNode.children,
    (child) => (childNode.order ?? 0) < (child.order ?? 0),
  );

  parentNode.children.splice(newIndex, 0, {
    active: true,
    id: childNode.id,
    order: childNode.order,
  });
}

function removeChildFromParent(parentNode: NavtreeNode, childNode: NavtreeNode) {
  // tombstone id of removed node in parent
  const parentChildIndex = parentNode.children.findIndex((child) => child.id === childNode.id);
  if (parentChildIndex === -1) {
    console.error("encountered broken tree");
  }

  // remember the position if its not explicitly set
  if (childNode.order === null) {
    parentNode.children[parentChildIndex]!.active = false;
  } else {
    parentNode.children.splice(parentChildIndex, 1);
  }
}

function markOrphan(tree: NavigationTree, parent: NodeId, child: NodeId) {
  if (!tree.orphans.has(parent)) {
    tree.orphans.set(parent, []);
  }

  const orphans = tree.orphans.get(parent)!;
  orphans.push(child);
}

function clearOrphan(tree: NavigationTree, parent: NodeId, child: NodeId) {
  const orphans = tree.orphans.get(parent);
  if (orphans != null) {
    const index = orphans.indexOf(child);
    if (index !== -1) {
      orphans.splice(index, 1);
    }
  }
}

function handleInspectorCommand(tree: NavigationTree, command: InspectorCommand) {
  if (command.kind === "focus") {
    focusNode(tree, command.node);
  }

  if (command.kind === "requestCompleteSnapshot") {
    const nodes = Array.from(tree.nodes.values(), toInspectorNode);

    emitInspectorMessage({
      type: "fiveway:treeState",
      tree: tree.label,
      focus: tree.focus,
      nodes,
    });
  }
}

function randomLabel(): string {
  return `${Math.random().toString(36).substring(2, 15)}`;
}
