import { expect, test } from "vitest";

import { createTestTree } from "../_test/treeSpec.ts";
import { createNode } from "./node.ts";
import { createNavigationTree, focusNode, insertNode, removeNode, traverseNodes } from "./tree.ts";

test("insertNode", () => {
	const tree = createNavigationTree();
	const node = createNode({
		id: "node",
		parent: "#",
	});

	insertNode(tree, node);

	expect(tree.nodes.get("#/node")).toBeDefined();
	expect(tree.nodes.get("#/node")?.connected).toBe(true);
});

test("insertNode: allow inserting nodes in any order", () => {
	const tree = createNavigationTree();

	const level1 = createNode({
		id: "level1",
		parent: "#",
	});

	const level2 = createNode({
		id: "level2",
		parent: level1.id,
	});
	const level3 = createNode({
		id: "level3",
		parent: level2.id,
	});

	insertNode(tree, level3);
	insertNode(tree, level1);
	insertNode(tree, level2);

	expect(level1.connected).toBe(true);
	expect(level2.connected).toBe(true);
	expect(level3.connected).toBe(true);
	expect(tree.orphans.size).toBe(0);
});

test("insertNode: throw on insert root", () => {
	const tree = createNavigationTree();
	const root = tree.nodes.get("#");

	expect(root).toBeDefined();
	expect(() => insertNode(tree, root!)).toThrow(Error);
});

test("insertNode: remember children position", () => {
	const tree = createNavigationTree();
	const root = tree.nodes.get("#")!;

	const node1 = createNode({
		id: "node1",
		parent: "#",
	});

	const node2 = createNode({
		id: "node2",
		parent: "#",
	});

	const node3 = createNode({
		id: "node3",
		parent: "#",
	});

	insertNode(tree, node1);
	insertNode(tree, node2);
	insertNode(tree, node3);

	expect(root.children).toEqual([
		{ id: node1.id, active: true, order: null },
		{ id: node2.id, active: true, order: null },
		{ id: node3.id, active: true, order: null },
	]);

	removeNode(tree, node2.id);

	expect(root.children).toEqual([
		{ id: node1.id, active: true, order: null },
		{ id: node2.id, active: false, order: null },
		{ id: node3.id, active: true, order: null },
	]);

	insertNode(tree, node2);

	expect(root.children).toEqual([
		{ id: node1.id, active: true, order: null },
		{ id: node2.id, active: true, order: null },
		{ id: node3.id, active: true, order: null },
	]);
});

test("removeNode", () => {
	const tree = createNavigationTree();

	const container = createNode({
		id: "container",
		parent: "#",
	});

	const item = createNode({
		id: "item",
		parent: container.id,
	});

	insertNode(tree, container);
	insertNode(tree, item);

	expect(tree.nodes.get(item.id)).toBeDefined();
	expect(tree.nodes.get(item.id)?.connected).toBe(true);

	removeNode(tree, container.id);

	expect(tree.nodes.get(container.id)).toBeUndefined();
	expect(tree.nodes.get(item.id)?.connected).toBe(false);

	expect(() => removeNode(tree, container.id)).not.toThrow();

	removeNode(tree, item.id);
});

test("removeNode: remembered children", () => {
	const tree = createNavigationTree();
	const root = tree.nodes.get("#")!;

	const orderedItem = createNode({
		id: "orderedItem",
		parent: "#",
		order: 1,
	});

	const unorderedItem = createNode({
		id: "unorderedItem",
		parent: "#",
	});

	insertNode(tree, orderedItem);
	insertNode(tree, unorderedItem);

	expect(root.children).toEqual([
		{ id: unorderedItem.id, active: true, order: null },
		{ id: orderedItem.id, active: true, order: 1 },
	]);

	removeNode(tree, orderedItem.id);
	removeNode(tree, unorderedItem.id);

	expect(root.children).toEqual([{ id: unorderedItem.id, active: false, order: null }]);
});

test("focusNode", async () => {
	const { tree, nodes } = createTestTree({
		id: "root",
		children: [{ id: "node1" }, { id: "node2" }],
	});

	expect(tree.focus).toBe(nodes.node1.id);

	focusNode(tree, nodes.node2.id);

	expect(tree.focus).toBe(nodes.node2.id);

	const success = focusNode(tree, "#/non-existent");
	expect(success).toBe(false);
	expect(tree.focus).toBe(nodes.node2.id);
});

test("traverseNodes", () => {
	const { tree, nodes } = createTestTree({
		id: "app",
		children: [
			{ id: "container1", children: [{ id: "item1" }, { id: "item2" }] },
			{ id: "container2", children: [{ id: "item3" }, { id: "item4" }] },
		],
	});

	const result: string[] = [];
	traverseNodes(tree, "#/app", null, (id) => {
		result.push(id);
	});

	expect(result).toContain(nodes.container1.id);
	expect(result).toContain(nodes.container2.id);
	expect(result).toContain(nodes.item1.id);
	expect(result).toContain(nodes.item2.id);
	expect(result).toContain(nodes.item3.id);
	expect(result).toContain(nodes.item4.id);

	const shallowResult: string[] = [];
	traverseNodes(tree, "#/app", 1, (id) => {
		shallowResult.push(id);
	});

	expect(shallowResult).toContain(nodes.container1.id);
	expect(shallowResult).toContain(nodes.container2.id);
});
