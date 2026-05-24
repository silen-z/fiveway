import { createNavigationTree, itemHandler, verticalHandler } from "@fiveway/core";
import { userEvent } from "vite-plus/test/browser";
import { test, expect, vi } from "vitest";
import { render } from "vitest-browser-react";

import { NavigationRoot } from "./context.tsx";
import { Navnode, useNavnode } from "./node.tsx";

test("Navnode.focus()", async () => {
	const tree = createNavigationTree();

	const ClickableItem = (props: { id: string }) => {
		const nav = useNavnode(props.id, itemHandler());

		return <div onClick={() => nav.focus()}>{nav.id}</div>;
	};

	const { getByText } = await render(
		<NavigationRoot tree={tree}>
			<Navnode id="app" handler={verticalHandler}>
				<ClickableItem id="item1" />
				<ClickableItem id="item2" />
			</Navnode>
		</NavigationRoot>,
	);

	expect(tree.focus).toBe("#/app/item1");

	await getByText("item2").click();

	expect(tree.focus).toBe("#/app/item2");
});

test("Navnode.activate()", async () => {
	const tree = createNavigationTree();

	const onActivate = vi.fn<(id: string) => void>();

	const ClickableItem = (props: { id: string }) => {
		const nav = useNavnode(
			props.id,
			itemHandler(() => onActivate(props.id)),
		);

		return <div onClick={() => nav.activate()}>{nav.id}</div>;
	};

	const { getByText } = await render(
		<NavigationRoot tree={tree}>
			<Navnode id="app" handler={verticalHandler}>
				<ClickableItem id="item1" />
				<ClickableItem id="item2" />
			</Navnode>
		</NavigationRoot>,
	);

	expect(tree.focus).toBe("#/app/item1");

	await getByText("item2").click();

	expect(onActivate).toHaveBeenCalledTimes(1);
	expect(onActivate).toHaveBeenCalledWith("item2");
	expect(tree.focus).toBe("#/app/item2");
});

test("Navnode.isFocused()", async () => {
	const tree = createNavigationTree();

	const FocusableItem = (props: { id: string }) => {
		const nav = useNavnode(props.id, itemHandler());

		return <div className={nav.isFocused() ? "focused" : ""}>{nav.id}</div>;
	};

	const { getByText } = await render(
		<NavigationRoot tree={tree}>
			<Navnode id="app" handler={verticalHandler}>
				<FocusableItem id="item1" />
				<FocusableItem id="item2" />
			</Navnode>
		</NavigationRoot>,
	);

	const item1 = getByText("item1");
	const item2 = getByText("item2");

	expect(tree.focus).toBe("#/app/item1");
	await expect.element(item1).toHaveClass("focused");
	await expect.element(item2).not.toHaveClass("focused");

	await userEvent.keyboard("{ArrowDown}");
	expect(tree.focus).toBe("#/app/item2");
	await expect.element(item1).not.toHaveClass("focused");
	await expect.element(item2).toHaveClass("focused");
});
