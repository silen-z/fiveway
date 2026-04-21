import { expect, test } from "vite-plus/test";

import {
	describeHandler,
	queryHandlerInfo,
	createNavigationTree,
	insertNode,
	createNode,
	defaultHandler,
	type NavigationHandler,
} from "./index.ts";

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

	expect(queryHandlerInfo(tree, "#/test")).toEqual([{ name: "test" }]);
});

test("chain handler adds fallback info to link handlers", () => {
	const tree = createNavigationTree();

	const handlerWithoutInfo: NavigationHandler = (_node, _action, next) => {
		return next();
	};

	insertNode(
		tree,
		createNode({
			id: "test",
			parent: "#",
			handler: defaultHandler.prepend(handlerWithoutInfo),
		}),
	);

	expect(queryHandlerInfo(tree, "#/test")).toEqual(
		expect.arrayContaining([{ name: "handlerWithoutInfo" }]),
	);
});
