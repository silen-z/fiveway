import { type NavigationHandler } from "../handler/handler.ts";
import { defaultHandler } from "../handler/handler.ts";
import { binarySearch } from "../lib/array.ts";
import { joinId, type NodeId } from "./id.ts";
import { type NavigationTree } from "./tree.ts";

/**
 * A node stored inside a `NavigationTree`. Nodes are created using {@link createNode}
 *
 * Do not modify node properties directly. Use {@link updateNode} to update node options.
 *
 * @see {@link NodeId}
 * @see {@link NavigationHandler}
 * @see {@link NodeChild}
 */
export interface NavigationNode {
	/**
	 * ID of the node
	 */
	id: NodeId;

	/**
	 * Navigation tree that contains this node
	 */
	tree: NavigationTree;

	/**
	 * ID of the parent node. Only root node has parent with value `null`
	 */
	parent: NodeId | null;

	/**
	 * The order of the node in the parent's children list.
	 */
	order: number | null;

	/**
	 * Handler responsible for handling navigation actions dispatched to this node.
	 */
	handler: NavigationHandler;

	/**
	 * Array of references to children of this node. Not to be manipulated directly.
	 */
	children: NodeChild[];

	/**
	 * Whether the node is connected.
	 * Node is considered connected when all parent nodes up to the root are inserted in the tree.
	 */
	connected: boolean;
}

/**
 * Child reference stored inside {@link NavigationNode} `children` array.
 */
export interface NodeChild {
	/**
	 * ID of the child node
	 */
	id: NodeId;

	/**
	 * Order of the child.
	 */
	order: number | null;

	/**
	 * Without explicit order child references are kept around as tombstones.
	 * This is done to preserve order when reinserting a node without explicit order.
	 */
	active: boolean;
}

/**
 * Options for {@link createNode}
 *
 * @see {@link NodeId}
 * @see {@link defaultHandler} default handler used when no handler is specified
 * @see {@link NavigationHandler}
 */
export interface NodeOptions {
	/**
	 * local node id such as `"item1"`. Must not contain slashes.
	 */
	id: string;

	/**
	 * The id of the parent node. Must not be `null`.
	 */
	parent: NodeId;

	/**
	 * Desired order of the node in relation to other children.
	 */
	order?: number;

	/**
	 * Handler responsible for handling navigation actions dispatched to this node. Default: `defaultHandler`.
	 */
	handler?: NavigationHandler;
}

/**
 * Special case of `NavigationNode` with nullable `tree` field since it might not be inserted yet.
 *
 * @see {@link NavigationNode}
 */
export type CreatedNavigationNode = Omit<NavigationNode, "tree"> & {
	tree: NavigationTree | null;
};

/**
 * Creates a new navigation node.
 *
 * @see {@link NodeOptions}
 * @see {@link CreatedNavigationNode}
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
 * Updates node properties. Only `handler` and `order` can be updated.
 *
 * @see {@link NodeOptions}
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
