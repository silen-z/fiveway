import {
	createNavigationTree,
	itemHandler,
	spatialItemHandler,
	verticalHandler,
} from "@fiveway/core";
import { elementHandler as elementDataHandler } from "@fiveway/core/dom";
import { type ReactNode } from "react";
import { test, expect } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-react";

import { NavigationRoot } from "./context.tsx";
import { useElementHandler, useFocusSync } from "./element.ts";
import { Navnode, useNavnode } from "./node.tsx";

test("useElementHandler registers element for querying", async () => {
	const tree = createNavigationTree();

	const { getByRole } = await render(
		<NavigationRoot tree={tree}>
			<Navnode id="app" handler={verticalHandler}>
				<ElementItem id="item1" />
			</Navnode>
		</NavigationRoot>,
	);

	const button = getByRole("button", { name: "item1" });

	expect(tree.focus).toBe("#/app/item1");
	expect(elementDataHandler.query(tree, "#/app/item1")).toBe(button.element());
});

test("useElementHandler exposes spatial position from element bounds", async () => {
	const tree = createNavigationTree();

	await render(
		<NavigationRoot tree={tree}>
			<Navnode id="app" handler={verticalHandler}>
				<ElementItem id="item1" bounds={{ left: 10, top: 20, width: 100, height: 50 }} />
			</Navnode>
		</NavigationRoot>,
	);

	expect(spatialItemHandler.query(tree, "#/app/item1")).toEqual({ x: 60, y: 45 });
});

test("useFocusSync focuses registered element when navigation focus changes", async () => {
	const tree = createNavigationTree();

	const { getByRole } = await render(
		<NavigationRoot tree={tree}>
			<FocusSyncApp />
		</NavigationRoot>,
	);

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

	const { getByRole } = await render(
		<NavigationRoot tree={tree}>
			<FocusSyncApp>
				<ElementItem id="item1" />
				<PlainItem id="item2" />
			</FocusSyncApp>
		</NavigationRoot>,
	);

	const item1 = getByRole("button", { name: "item1" });

	expect(tree.focus).toBe("#/app/item1");
	await expect.element(item1).toHaveFocus();

	await userEvent.keyboard("{ArrowDown}");
	expect(tree.focus).toBe("#/app/item2");
	await expect.element(item1).not.toHaveFocus();
});

function FocusSyncApp(props: { children?: ReactNode }) {
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
	const elementHandler = useElementHandler();
	useNavnode(props.id, [elementHandler, itemHandler()]);

	const style = props.bounds
		? {
				position: "absolute" as const,
				left: props.bounds.left,
				top: props.bounds.top,
				width: props.bounds.width,
				height: props.bounds.height,
			}
		: undefined;

	return (
		<button ref={elementHandler.register} style={style}>
			{props.id}
		</button>
	);
}

function PlainItem(props: { id: string }) {
	useNavnode(props.id, itemHandler());

	return <div>{props.id}</div>;
}
