import { createNavigationTree, itemHandler, verticalHandler } from "@fiveway/core";
import { test, expect } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";

import { NavigationRoot } from "./context.tsx";
import { Navnode, useNavnode } from "./node.tsx";

test("basic functionality", async () => {
	const tree = createNavigationTree();

	await render(
		<NavigationRoot tree={tree}>
			<Navnode id="app" handler={verticalHandler}>
				<Item id="item1" />
				<Item id="item2" />
				<Item id="item3" />
			</Navnode>
		</NavigationRoot>,
	);
	expect(tree.focus).toBe("#/app/item1");

	await userEvent.keyboard("{ArrowDown}");
	expect(tree.focus).toBe("#/app/item2");
});

test("NavigationRoot without listener", async () => {
	const tree = createNavigationTree();

	await render(
		<NavigationRoot tree={tree} listener={null}>
			<Navnode id="app" handler={verticalHandler}>
				<Item id="item1" />
				<Item id="item2" />
			</Navnode>
		</NavigationRoot>,
	);

	expect(tree.focus).toBe("#/app/item1");
	await userEvent.keyboard("{ArrowRight}");
	expect(tree.focus).toBe("#/app/item1");
});

function Item(props: { id: string }) {
	const nav = useNavnode(props.id, itemHandler());

	return <div>{nav.id}</div>;
}
