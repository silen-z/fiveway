import { type NavigationAction } from "./action.ts";
import { runHandler } from "./handler/handler.ts";
import { type NodeId } from "./tree/id.ts";
import { type NavigationTree } from "./tree/tree.ts";

export type InspectorNode = {
	id: string;
	parent: string | null;
	order: number | null;
	children: string[];
	handler?: HandlerDescription[];
};

export type InspectorMessage = {
	type: "fiveway:treeState";
	tree: string;
	focus?: string;
	nodes?: InspectorNode[];
	removedNodes?: string[];
	complete?: true;
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
	| { kind: "dispatchAction"; tree: string; action: NavigationAction; node?: NodeId }
	| { kind: "requestCompleteSnapshot"; tree: string }
	| { kind: "inspectHandler"; tree: string; node: NodeId };

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

export type HandlerDescription = Record<string, unknown>;

export const INSPECT_HANLDER = "inspectHandler";

export function inspectHandler(tree: NavigationTree, id: NodeId): HandlerDescription[] {
	const value = [] as HandlerDescription[];
	runHandler(tree, id, {
		kind: "query",
		key: INSPECT_HANLDER,
		value,
	});

	return value;
}

export function describeHandler(action: NavigationAction, info: HandlerDescription): void {
	if (action.kind === "query" && action.key === INSPECT_HANLDER) {
		if (!Array.isArray(action.value)) {
			action.value = [];
		}

		(action.value as HandlerDescription[]).push(info);
	}
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
