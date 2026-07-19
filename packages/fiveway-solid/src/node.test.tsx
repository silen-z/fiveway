import { createNavigationTree, itemHandler, verticalHandler } from "@fiveway/core";
import { test, expect, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { renderWithFocusLock } from "./_test/render.ts";
import { NavigationRoot } from "./context.tsx";
import { Navnode, createNavnode } from "./node.tsx";

test("Navnode.focus()", async () => {
	const tree = createNavigationTree();

	const ClickableItem = (props: { id: string }) => {
		const nav = createNavnode(props.id, itemHandler());

		return <div onClick={() => nav.focus()}>{nav()}</div>;
	};

	const { getByText } = renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<Navnode id="app" handler={verticalHandler}>
				<ClickableItem id="item1" />
				<ClickableItem id="item2" />
			</Navnode>
		</NavigationRoot>
	));

	expect(tree.focus).toBe("#/app/item1");

	await getByText("item2").click();

	expect(tree.focus).toBe("#/app/item2");
});

test("Navnode.activate()", async () => {
	const tree = createNavigationTree();

	const onActivate = vi.fn<(id: string) => void>();

	const ClickableItem = (props: { id: string }) => {
		const nav = createNavnode(
			props.id,
			itemHandler(() => onActivate(props.id)),
		);

		return <div onClick={() => nav.activate()}>{nav()}</div>;
	};

	const { getByText } = renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<Navnode id="app" handler={verticalHandler}>
				<ClickableItem id="item1" />
				<ClickableItem id="item2" />
			</Navnode>
		</NavigationRoot>
	));

	expect(tree.focus).toBe("#/app/item1");

	await getByText("item2").click();

	expect(onActivate).toHaveBeenCalledTimes(1);
	expect(onActivate).toHaveBeenCalledWith("item2");
	expect(tree.focus).toBe("#/app/item2");
});

test("Navnode.isFocused()", async () => {
	const tree = createNavigationTree();

	const FocusableItem = (props: { id: string }) => {
		const nav = createNavnode(props.id, itemHandler());

		return <div class={nav.isFocused() ? "focused" : ""}>{nav()}</div>;
	};

	const { getByText } = renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<Navnode id="app" handler={verticalHandler}>
				<FocusableItem id="item1" />
				<FocusableItem id="item2" />
			</Navnode>
		</NavigationRoot>
	));

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
