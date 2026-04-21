import * as v from "valibot";

export type InitMessage = v.InferOutput<typeof InitMessage>;
export type InspectorMessage = v.InferOutput<typeof InspectorMessage>;
export type InspectorCommand = v.InferOutput<typeof InspectorCommand>;
export type Command = v.InferOutput<typeof Command>;

// send when devtools initializes
// used for connecting devtools to content script of its inspectedTab
export const InitMessage = v.object({
	type: v.literal("init"),
	tabId: v.number(),
});

// send from content script to devtools when a tree update happens
export const InspectorMessage = v.object({
	type: v.literal("fiveway:treeState"),
	tree: v.string(),
	focus: v.optional(v.string()),
	nodes: v.optional(
		v.array(
			v.object({
				id: v.string(),
				parent: v.nullable(v.string()),
				order: v.nullable(v.number()),
				children: v.array(v.string()),
			}),
		),
	),
	removedNodes: v.optional(v.array(v.string())),
});

// commands that can be sent to content script
export const Command = v.union([
	// request current state of the tree
	v.object({ kind: v.literal("requestCompleteSnapshot"), tree: v.string() }),

	// focus a specific node
	v.object({
		kind: v.literal("handleAction"),
		tree: v.string(),
		node: v.optional(v.string()),
		action: v.unknown(),
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
