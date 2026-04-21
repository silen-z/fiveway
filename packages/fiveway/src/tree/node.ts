import { type NavigationHandler } from "../handler/handler.ts";
import { defaultHandler } from "../handler/handler.ts";
import { type InspectorNode } from "../inspector.ts";
import { binarySearch } from "../lib/array.ts";
import { joinId, type NodeId } from "./id.ts";
import { type NavigationTree } from "./tree.ts";

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

export function updateNode(
	node: CreatedNavtreeNode,
	options: Omit<NodeConfig, "id" | "parent">,
): void {
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

export function toInspectorNode(node: NavtreeNode): InspectorNode {
	const children: string[] = [];
	for (const child of node.children) {
		if (child.active) {
			children.push(child.id);
		}
	}
	return {
		id: node.id,
		parent: node.parent,
		order: node.order,
		children,
	};
}
