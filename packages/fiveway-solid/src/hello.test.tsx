import { test, expect } from "vitest";
import { render } from "vitest-browser-solid";

function Hello() {
	return <div>Hello, world!</div>;
}

test("hello world", async () => {
	const screen = render(() => <Hello />);
	await expect.element(screen.getByText("Hello, world!")).toBeVisible();
});
