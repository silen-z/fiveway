import {
	createNavigationTree,
	itemHandler,
	spatialItemHandler,
	verticalHandler,
} from "@fiveway/core";
import { elementHandler as elementDataHandler } from "@fiveway/core/dom";
import { type JSX } from "@solidjs/web";
import { test, expect } from "vitest";
import { userEvent } from "vitest/browser";

import { renderWithFocusLock } from "./_test/render.ts";
import { NavigationRoot } from "./context.tsx";
import { createElementHandler, useFocusSync } from "./element.ts";
import { Navnode, createNavnode } from "./node.tsx";

test("createElementHandler registers element for querying", async () => {
	const tree = createNavigationTree();

	const { getByRole } = renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<Navnode id="app" handler={verticalHandler}>
				<ElementItem id="item1" />
			</Navnode>
		</NavigationRoot>
	));

	const button = getByRole("button", { name: "item1" });

	expect(tree.focus).toBe("#/app/item1");
	expect(elementDataHandler.query(tree, "#/app/item1")).toBe(button);
});

test("createElementHandler exposes spatial position from element bounds", async () => {
	const tree = createNavigationTree();

	renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<Navnode id="app" handler={verticalHandler}>
				<ElementItem id="item1" bounds={{ left: 10, top: 20, width: 100, height: 50 }} />
			</Navnode>
		</NavigationRoot>
	));

	expect(spatialItemHandler.query(tree, "#/app/item1")).toEqual({ x: 60, y: 45 });
});

test("useFocusSync focuses registered element when navigation focus changes", async () => {
	const tree = createNavigationTree();

	const { getByRole } = renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<FocusSyncApp />
		</NavigationRoot>
	));

	const item1 = getByRole("button", { name: "item1" });
	const item2 = getByRole("button", { name: "item2" });

	expect(tree.focus).toBe("#/app/item1");
	await expect.element(item1).toHaveFocus();

	await userEvent.keyboard("{ArrowDown}");
	expect(tree.focus).toBe("#/app/item2");
	await expect.element(item2).toHaveFocus();
	await expect.element(item1).not.toHaveFocus();
});

test("useFocusSync blurs when focused node has no registered element", async () => {
	const tree = createNavigationTree();

	const { getByRole } = renderWithFocusLock(tree, () => (
		<NavigationRoot tree={tree}>
			<FocusSyncApp>
				<ElementItem id="item1" />
				<PlainItem id="item2" />
			</FocusSyncApp>
		</NavigationRoot>
	));

	const item1 = getByRole("button", { name: "item1" });

	expect(tree.focus).toBe("#/app/item1");
	await expect.element(item1).toHaveFocus();

	await userEvent.keyboard("{ArrowDown}");
	expect(tree.focus).toBe("#/app/item2");
	expect(document.activeElement).toBe(document.body);
	await expect.element(item1).not.toHaveFocus();
});

function FocusSyncApp(props: { children?: JSX.Element }) {
	useFocusSync();

	return (
		<Navnode id="app" handler={verticalHandler}>
			{props.children ?? (
				<>
					<ElementItem id="item1" />
					<ElementItem id="item2" />
				</>
			)}
		</Navnode>
	);
}

function ElementItem(props: {
	id: string;
	bounds?: { left: number; top: number; width: number; height: number };
}) {
	const element = createElementHandler();
	createNavnode(props.id, [element, itemHandler()]);

	const style = props.bounds
		? {
				position: "absolute" as const,
				left: `${props.bounds.left}px`,
				top: `${props.bounds.top}px`,
				width: `${props.bounds.width}px`,
				height: `${props.bounds.height}px`,
			}
		: undefined;

	return (
		<button ref={element.register} style={style}>
			{props.id}
		</button>
	);
}

function PlainItem(props: { id: string }) {
	createNavnode(props.id, itemHandler());

	return <div>{props.id}</div>;
}
