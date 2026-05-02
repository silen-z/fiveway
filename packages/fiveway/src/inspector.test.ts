import { expect, test } from "vite-plus/test";

import { defaultHandler, type NavigationHandler } from "./handler/handler.ts";
import { describeHandler, inspectHandler } from "./inspector.ts";
import { createNode } from "./tree/node.ts";
import { createNavigationTree, insertNode } from "./tree/tree.ts";

test("handlerInfo", () => {
	const tree = createNavigationTree();

	insertNode(
		tree,
		createNode({
			id: "test",
			parent: "#",
			handler: (_, action, next) => {
				describeHandler(action, { name: "test" });
				return next();
			},
		}),
	);

	expect(inspectHandler(tree, "#/test")).toEqual([{ name: "test" }]);
});

test("composed handler adds fallback info to link handlers", () => {
	const tree = createNavigationTree();

	const handlerWithoutInfo: NavigationHandler = (_node, _action, next) => {
		return next();
	};

	insertNode(
		tree,
		createNode({
			id: "test",
			parent: "#",
			handler: defaultHandler.compose(handlerWithoutInfo),
		}),
	);

	expect(inspectHandler(tree, "#/test")).toEqual(
		expect.arrayContaining([{ name: "handlerWithoutInfo" }]),
	);
});
