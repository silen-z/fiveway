import { type NavigationAction } from "./action.ts";
import { runHandler } from "./handler/handler.ts";
import { type NodeId } from "./tree/id.ts";
import { type NavigationTree } from "./tree/tree.ts";

export type InspectorNode = {
	id: string;
	parent: string | null;
	order: number | null;
	children: string[];
};

export type InspectorMessage = {
	type: "fiveway:treeState";
	tree: string;
	focus?: string;
	nodes?: InspectorNode[];
	removedNodes?: string[];
};

export function emitInspectorMessage(message: InspectorMessage): void {
	if (typeof window === "undefined") {
		return;
	}

	queue.push(message);

	if (scheduledFlush == null) {
		scheduledFlush = Promise.resolve()
			.then(flushQueue)
			.finally(() => {
				scheduledFlush = null;
			});
	}
}

export type InspectorCommand =
	| { kind: "handleAction"; tree: string; action: NavigationAction; node?: NodeId }
	| { kind: "requestCompleteSnapshot"; tree: string };

export function subscribeToInspectorCommands(
	tree: NavigationTree,
	callback: (command: InspectorCommand) => void,
): void {
	if (typeof window === "undefined") {
		return;
	}

	window.addEventListener("message", (event: MessageEvent) => {
		if (
			event.data.type === "fiveway:command" &&
			(event.data.command.tree === tree.label || event.data.command.tree === "*")
		) {
			callback(event.data.command);
		}
	});
}

export type HandlerInfo = Record<string, string | { toString(): string }>;

export function describeHandler(action: NavigationAction, info: HandlerInfo): void {
	if (action.kind === "query" && action.key === "core:handler-info") {
		if (!Array.isArray(action.value)) {
			action.value = [];
		}

		(action.value as HandlerInfo[]).push(info);
	}
}

export function queryHandlerInfo(tree: NavigationTree, id: NodeId): HandlerInfo[] {
	const value = [] as HandlerInfo[];
	runHandler(tree, id, {
		kind: "query",
		key: "core:handler-info",
		value,
	});

	return value;
}

const queue: InspectorMessage[] = [];
let scheduledFlush: Promise<void> | null = null;

function flushQueue(): void {
	const batched: Record<string, InspectorMessage> = {};

	for (const message of queue) {
		const current = batched[message.tree];
		if (current != null) {
			mergeMessages(current, message);
		} else {
			batched[message.tree] = message;
		}
	}

	queue.length = 0;

	for (const message of Object.values(batched)) {
		window.postMessage(message);
	}
}

function mergeMessages(current: InspectorMessage, incoming: InspectorMessage): void {
	if (incoming.focus != null) {
		current.focus = incoming.focus;
	}

	if (incoming.nodes != null) {
		current.nodes ??= [];

		for (const node of incoming.nodes) {
			const existing = current.nodes.findIndex((n) => n.id === node.id);
			if (existing !== -1) {
				current.nodes[existing] = node;
			} else {
				current.nodes.push(node);
			}
		}

		if (current.removedNodes != null) {
			const incomingNodes = incoming.nodes;
			current.removedNodes = current.removedNodes.filter(
				(id) => !incomingNodes.some((node) => node.id === id),
			);
		}
	}

	if (incoming.removedNodes != null) {
		current.removedNodes ??= [];

		for (const id of incoming.removedNodes) {
			if (!current.removedNodes.includes(id)) {
				current.removedNodes.push(id);
			}
		}

		if (current.nodes != null) {
			const removed = incoming.removedNodes ?? [];
			current.nodes = current.nodes.filter((node) => !removed.includes(node.id));
		}
	}
}
