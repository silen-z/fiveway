import { type FocusAction, type NavigationAction, type NavigationDirection } from "../action.ts";
import { defaultHandler, executeHandler } from "../handler/handler.ts";
import {
	type InspectorCommand,
	emitInspectorMessage,
	subscribeToInspectorCommands,
	inspectNode,
} from "../inspector.ts";
import { binarySearch } from "../lib/array.ts";
import { notifyListeners, type FocusListener } from "./events.ts";
import { type NodeId, convergingPaths, idsToRoot, isParent } from "./id.ts";
import { type CreatedNavigationNode, type NavigationNode } from "./node.ts";

/**
 * Object that holds all the navigation state. Most importantly inserted nodes and the focused node ID.
 *
 * @see {@link createNavigationTree} used to create a new `NavigationTree`
 * @see {@link insertNode}
 * @see {@link removeNode}
 */
export interface NavigationTree {
	/**
	 * ID of the currently focused node
	 */
	focus: NodeId;

	/**
	 * tree label used for identification in inspector
	 */
	label: string;

	/**
	 * Map of all nodes inserted into the tree. Use `insertNode` and `removeNode` to manage nodes.
	 * Nodes inside this map are not guaranteed to be connected.
	 */
	nodes: Map<NodeId, NavigationNode>;
	orphans: Map<NodeId, NodeId[]>;

	/**
	 * Focus listeners registered on the tree.
	 * See `registerFocusListener` for how to use focus listeners.
	 */
	listeners: Map<NodeId, FocusListener[]>;

	/**
	 * Focus lock state. Use `holdFocus` to acquire the lock.
	 */
	focusLock: "free" | "locked" | "updatePending";
}

/**
 * Options for {@link createNavigationTree}
 */
export interface NavigationTreeOptions {
	/**
	 * Label used for identification in the inspector
	 */
	label?: string;
}

/**
 * Creates a new navigation tree. Newly created trees contain only a single root node with {@link defaultHandler}.
 *
 * You can give the tree an optional `label`, used for identification in the inspector
 * in case there are multiple trees.
 *
 * @see {@link NavigationTreeOptions}
 * @see {@link NavigationTree}
 */
export function createNavigationTree(options: NavigationTreeOptions = {}): NavigationTree {
	const tree: NavigationTree = {
		focus: "#",
		label: options.label ?? randomLabel(),
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
		handler: defaultHandler,
		children: [],
	});

	if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
		subscribeToInspectorCommands(tree, (cmd) => handleInspectorCommand(tree, cmd));
	}

	return tree;
}

/**
 * Insert node created by `createNode` in the tree.
 *
 * @param tree - navigation tree
 * @param node - node to insert
 * @return A cleanup function that removes the node
 *
 * Nodes can be inserted before their parents exist. In that case they are kept in a
 * disconnected state (not participating in navigation) until their parent is inserted.
 * Similarly, upon parent removal they go back to a disconnected state and must be removed
 * explicitly.
 *
 * When a tree already contains a node with the same id, it is replaced by the new node.
 *
 * @see {@link NavigationNode}
 * @see {@link removeNode}
 */
export function insertNode(tree: NavigationTree, node: CreatedNavigationNode): () => void {
	if (node.parent === null) {
		throw new Error("trying to insert root (or node without parent)");
	}

	// if there is node with the same id replace it
	if (tree.nodes.has(node.id)) {
		removeNode(tree, node.id);
	}

	node.tree = tree;
	const insertedNode = node as NavigationNode;

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

function connectNode(tree: NavigationTree, parentNode: NavigationNode, node: NavigationNode) {
	insertChildInOrder(parentNode, node);
	node.connected = true;

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
			nodes: [inspectNode(node), inspectNode(parentNode)],
		});
	}
}

/**
 * Removes a node by id or by reference.
 *
 * @param tree - navigation tree
 * @param node - accepts either the node id or the node itself
 *
 * Instead of using this function directly, prefer using removal function returned from {@link insertNode}
 * Removing a node does not remove its children — they are put into a disconnected state
 * until they are explicitly removed or their parent is connected again.
 *
 * This function is mainly meant to be used by framework integrations.
 */
export function removeNode(tree: NavigationTree, node: NodeId | NavigationNode): void {
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
			nodes: parentNode != null ? [inspectNode(parentNode)] : undefined,
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

/**
 * Function that releases the focus lock aquired by {@link holdFocus}.
 */
export type ReleaseFocusLock = () => void;

/**
 * Temporarily locks focus from changing while the tree structure changes to allow
 * inserting multiple nodes at once to resolve initial focus correctly.
 *
 * @param tree - navigation tree to hold the focus on
 * @return A function that releases the lock. If a lock is already held, returns `null`.
 *
 * Calling the release function may apply a pending focus update.
 *
 * Used by framework integrations to make initial focus work in frameworks that run
 * effects top-down.
 */
export function holdFocus(tree: NavigationTree): ReleaseFocusLock | null {
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

/**
 * Options for {@link focusNode}
 *
 * @see {@link FocusAction} dispatched by this function
 * @see {@link NavigationDirection}
 */
export interface FocusNodeOptions {
	/**
	 * Direction of focus used in `FocusAction` dispatched by this function. Default: `null`.
	 */
	direction?: NavigationDirection | "initial";
}

/**
 * Attempts to focus `targetId`.
 *
 * @param tree - navigation tree
 * @param targetId - ID of the node to focus
 * @param options - Options for the focus operation
 * @return `true` if focus ends up on the target node.
 *
 * Calling `focusNode` dispatches a {@link FocusAction}, so focus is resolved via handlers.
 * For example if a container contains children, calling `focusNode(tree, "#/container")`
 * will typically focus a descendant like `#/container/item1`.
 *
 * @see {@link FocusNodeOptions}
 */
export function focusNode(
	tree: NavigationTree,
	targetId: NodeId,
	options: FocusNodeOptions = {},
): boolean {
	const node = tree.nodes.get(targetId);
	if (node == null || !node.connected) {
		return false;
	}

	const focusAction: FocusAction = {
		kind: "focus",
		direction: options.direction ?? null,
	};

	const resolvedId = executeHandler(tree, targetId, focusAction);

	if (resolvedId === null) {
		return false;
	}

	if (tree.focus === resolvedId) {
		return true;
	}

	const lastFocused = tree.focus;
	tree.focus = resolvedId;

	convergingPaths(lastFocused, tree.focus, (id) => {
		notifyListeners(tree, id);
	});

	if (import.meta.env.FIVEWAY_INSPECTOR ?? import.meta.env.DEV) {
		emitInspectorMessage({ type: "fiveway:treeState", tree: tree.label, focus: tree.focus });
	}

	return true;
}

/**
 * Dispatches {@link NavigationAction} to focused or specified node handler.
 * If handler returns an ID, focus is updated to that ID.
 *
 * @param tree - navigation tree
 * @param action - navigation action to dispatch
 * @param node - ID to dispatch the action on. If not specified, the focused node is used.
 */
export function dispatchAction(
	tree: NavigationTree,
	action: NavigationAction,
	node?: NodeId,
): void {
	const targetId = executeHandler(tree, node ?? tree.focus, action);
	if (targetId !== null) {
		focusNode(tree, targetId);
	}
}

/**
 * Checks whether `nodeId` is focused. A node is also considered focused when its descendant is focused.
 *
 * @param focused - tree or id of a focused node
 * @param nodeId - id being checked for focus
 * @return `true` if the node or its descendant is focused
 *
 * To be efficient and flexible this function produces results just by checking the path of node IDs without traversing the tree itself.
 * That means it won't error when given node ID doesn't exist in the tree.
 */
export function isFocused(focused: NavigationTree | NodeId, nodeId: NodeId): boolean {
	const focusedId = typeof focused === "string" ? focused : focused.focus;

	return focusedId === nodeId || isParent(nodeId, focusedId);
}

/**
 * Traverses nodes under given node up to specified depth and calls a callback for each of them.
 *
 * @param tree - navigation tree
 * @param nodeId - ID of the node to traverse
 * @param depth - The depth up to which nodes are traversed. `null` means no limit.
 * @param callback - callback called for each node with nodes' ID as its only argument
 */
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

function insertChildInOrder(parentNode: NavigationNode, childNode: NavigationNode) {
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

function removeChildFromParent(parentNode: NavigationNode, childNode: NavigationNode) {
	// tombstone id of removed node in parent
	let parentChildIndex = parentNode.children.findIndex((child) => child.id === childNode.id);
	if (parentChildIndex === -1) {
		console.error("encountered broken tree");
		return;
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
	if (command.kind === "dispatchAction") {
		dispatchAction(tree, command.action, command.node);
	}

	if (command.kind === "inspectHandler") {
		const node = tree.nodes.get(command.node);
		if (node == null || !node.connected) {
			return;
		}

		emitInspectorMessage({
			type: "fiveway:treeState",
			tree: tree.label,
			nodes: [inspectNode(node, true)],
		});
	}

	if (command.kind === "requestCompleteSnapshot") {
		const nodes = Array.from(tree.nodes.values(), (node) => inspectNode(node, false));

		emitInspectorMessage({
			type: "fiveway:treeState",
			tree: tree.label,
			focus: tree.focus,
			nodes,
			complete: true,
		});
	}
}

function randomLabel(): string {
	return `${Math.random().toString(36).substring(2, 15)}`;
}
