import { type NavigationHandler } from "../handler/handler.ts";
import { defaultHandler } from "../handler/handler.ts";
import { binarySearch } from "../lib/array.ts";
import { joinId, type NodeId } from "./id.ts";
import { type NavigationTree } from "./tree.ts";

/**
 * A node stored inside a `NavigationTree`.
 */
export interface NavigationNode {
	tree: NavigationTree;
	id: NodeId;
	connected: boolean;
	parent: NodeId | null;
	order: number | null;
	handler: NavigationHandler;
	children: NodeChild[];
}

/**
 * Child reference stored on a node.
 */
export interface NodeChild {
	id: NodeId;
	order: number | null;
	active: boolean;
}

export interface NodeOptions {
	id: string;
	parent: NodeId;
	order?: number;
	handler?: NavigationHandler;
}

/**
 * Special case of {@link NavigationNode} that might not be inserted into a tree yet
 */
export type CreatedNavigationNode = Omit<NavigationNode, "tree"> & {
	tree: NavigationTree | null;
};

/**
 * Builds an unattached node description.
 *
 * The `id` is combined with `parent` via `joinId`. If `handler` is omitted,
 * `defaultHandler` is used.
 */
export function createNode(options: NodeOptions): CreatedNavigationNode {
	if (options.id.includes("/")) {
		throw new Error("local node id cannot contain slashes");
	}

	return {
		id: joinId(options.parent, options.id),
		connected: false,
		tree: null,
		parent: options.parent,
		order: options.order ?? null,
		handler: options.handler ?? defaultHandler,
		children: [],
	};
}

/**
 * Updates `handler` and/or `order` on an existing node.
 *
 * Changing `order` repositions the node among its parent’s children.
 */
export function updateNode(
	node: CreatedNavigationNode,
	options: Omit<NodeOptions, "id" | "parent">,
): void {
	if (options.handler != null) {
		node.handler = options.handler;
	}

	if (options.order != null) {
		updateNodeOrder(node, options.order);
	}
}

function updateNodeOrder(node: CreatedNavigationNode, order: number) {
	if (node.order === order || node.parent === null) {
		return;
	}

	node.order = order;

	const parentNode = node.tree?.nodes.get(node.parent);
	if (parentNode == null) {
		return;
	}

	const childIndex = parentNode.children.findIndex((i) => i.id === node.id);
	const newIndex = binarySearch(parentNode.children, (child) => order < (child.order ?? 0));

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
