import * as v from "valibot";

export const FivewayMessage = v.object({
	type: v.pipe(v.string(), v.startsWith("fiveway:")),
});

// send when devtools initializes
// used for connecting devtools to content script of its inspectedTab
export const InitMessage = v.object({
	type: v.literal("init"),
	tabId: v.number(),
});

const HandlerDescription = v.record(v.string(), v.unknown());

const Node = v.object({
	id: v.string(),
	parent: v.nullable(v.string()),
	order: v.nullable(v.number()),
	children: v.array(v.string()),
	handler: v.optional(v.array(HandlerDescription)),
});

// send from content script to devtools when a tree update happens
export const TreeStateMessage = v.object({
	type: v.literal("fiveway:treeState"),
	tree: v.string(),
	focus: v.optional(v.string()),
	nodes: v.optional(v.array(Node)),
	removedNodes: v.optional(v.array(v.string())),
});

// commands that can be sent to content script
export const Command = v.union([
	// request current state of the tree
	v.object({ kind: v.literal("requestCompleteSnapshot"), tree: v.string() }),

	// focus a specific node
	v.object({
		kind: v.literal("dispatchAction"),
		tree: v.string(),
		node: v.optional(v.string()),
		action: v.unknown(),
	}),

	// inspect handler of a specific node
	v.object({
		kind: v.literal("inspectHandler"),
		tree: v.string(),
		node: v.string(),
	}),
]);

// send when devtools wants to execute a command on the content script
// used for sending commands to content script
export const InspectorCommand = v.object({
	type: v.literal("fiveway:command"),
	tabId: v.number(),
	command: Command,
});

export const ReloadMessage = v.object({
	type: v.literal("fiveway:reload"),
});
