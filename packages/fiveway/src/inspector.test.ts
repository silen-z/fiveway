import { expect, test } from "vite-plus/test";

import { createTestTree } from "./_test/treeSpec.ts";
import { defaultHandler, type NavigationHandler } from "./handler/handler.ts";
import { describeHandler, inspectHandler } from "./inspector.ts";

test("handlerInfo", () => {
	const { tree } = createTestTree({
		id: "test",
		handler: (_, action, next) => {
			describeHandler(action, { name: "test" });
			return next();
		},
	});

	expect(inspectHandler(tree, "#/test")).toEqual([{ name: "test" }]);
});

test("composed handler adds fallback info to link handlers", () => {
	const handlerWithoutInfo: NavigationHandler = (_node, _action, next) => {
		return next();
	};

	const { tree } = createTestTree({
		id: "test",
		handler: defaultHandler.compose(handlerWithoutInfo),
	});

	expect(inspectHandler(tree, "#/test")).toEqual(
		expect.arrayContaining([{ name: "handlerWithoutInfo" }]),
	);
});
