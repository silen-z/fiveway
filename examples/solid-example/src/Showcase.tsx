import {
	captureHandler,
	createNavnode,
	elementHandler,
	gridHandler,
	gridItemHandler,
	initialHandler,
	useFocusSync,
	useNavigationContext,
	useOnFocusChange,
} from "@fiveway/solid";
import { activationHandler } from "@fiveway/solid";

import { ExampleBox } from "./ExampleBox.tsx";
import { InspectorWarning } from "./InspectorWarning.tsx";
import { ListExample } from "./ListExample.tsx";
import { NavItem } from "./NavItem.tsx";
import { SpatialExample } from "./SpatialExample.tsx";
import { VirtualGridExample } from "./virtual/VirtualGridExample.tsx";
import { VirtualListExample } from "./virtual/VirtualListExample.tsx";

import css from "./Showcase.module.css";

export function Showcase() {
	const { tree } = useNavigationContext();
	const nav = createNavnode("showcase", [initialHandler("start"), gridHandler]);

	useFocusSync();

	useOnFocusChange(nav, (id) => {
		if (id === null) {
			return;
		}
		const el = elementHandler.query(tree, id);
		if (el != null) {
			el.scrollIntoView({ block: "center", behavior: "smooth" });
		}
	});

	return (
		<nav.Context>
			<header class={css.pageHeader}>
				<InspectorWarning />
				<div class={css.pageTitle}>
					<h1>
						<strong>fiveway</strong> / solid
					</h1>
					<div class={css.titleLinks}>
						<a href="https://fiveway.dev">Documentation</a>
						<a href="https://github.com/silen-z/fiveway">GitHub</a>
						<a href="https://bsky.app/profile/fiveway.dev">Bluesky</a>
					</div>
				</div>
			</header>
			<div class={css.page}>
				<div class={css.infoBox}>
					<p>
						<strong>fiveway</strong> is a TypeScript library for rich web applications that want to
						support keyboard navigation and have precise control over what is focused{" "}
						<a href="https://fiveway.dev/what-is-fiveway">Get to know more</a>
					</p>

					<p>
						From now on let go of your mouse. This demo is controlled by keyboard. Arrow buttons
						work as expected, press enter to activate and backspace works as back button. Pressing
						back resets you to start.
					</p>

					<p>
						If you are curious how does the navigation tree for this page looks open the devtools by
						clicking the "fiveway" button in bottom right corner. There you can see the tree
						structure and inspect specific nodes by clicking on them.
					</p>

					<NavItem
						navId="start"
						label="Start"
						handlers={[
							gridItemHandler({ row: 0, col: 1 }),
							activationHandler(() => {
								nav.focus("vertical-list");
							}),
						]}
					/>
				</div>

				<div class={css.layout}>
					<ExampleBox
						navId="vertical-list"
						label="Directional stack: vertical"
						description="Directional stacks are the most common type of navigation container. They can be either vertical or horizontal and handle movement in respective directions. Use up/down arrow buttons to navigate this example"
						gridPos={{ row: 1, col: 1 }}
					>
						<ListExample direction="vertical" />
					</ExampleBox>

					<ExampleBox
						navId="horizontal-list"
						label="Directional stack: horizontal"
						description="Directional stacks are the most common type of navigation container. They can be either vertical or horizontal and handle movement in respective directions. Use up/down arrow buttons to navigate this example"
						gridPos={{ row: 1, col: 2 }}
					>
						<ListExample direction="horizontal" />
					</ExampleBox>

					<ExampleBox
						navId="initial-focus"
						label="Initial focus"
						description="Containers can be configured to focus specific child by default."
						gridPos={{ row: 2, col: 1 }}
					>
						<ListExample direction="horizontal" handlers={[initialHandler("item3")]} />
					</ExampleBox>

					<ExampleBox
						navId="capture-focus"
						label="Captured focus"
						description="Focus can be captured inside a container. In that case moving outside the container by arrow keys is not possible. Capture can be escaped via explicit action. In this example you can escape by pressing Back button"
						gridPos={{ row: 2, col: 2 }}
					>
						<ListExample
							direction="horizontal"
							handlers={[
								(action, { next }) => {
									if (action.kind === "move" && action.direction === "back") {
										nav.focus();
										return null;
									}
									return next();
								},
								captureHandler,
							]}
						/>
					</ExampleBox>

					<ExampleBox
						navId="virtual-list"
						label="Virtual list"
						description="This is an example of navigation node with advanced handler setup. While virtual lists are not part of fiveway they can be easily implemented by extending vertical hander with custom one."
						gridPos={{ row: 3, col: 1 }}
					>
						<VirtualListExample />
					</ExampleBox>

					<ExampleBox
						navId="virtual-grid"
						label="Virtual grid"
						description="This is an example of navigation node with advanced handler setup. While virtual grid are not part of fiveway they can be easily implemented by extending grid handler with custom one."
						gridPos={{ row: 3, col: 2 }}
					>
						<VirtualGridExample />
					</ExampleBox>

					<ExampleBox
						navId="spatial-nav"
						label="Spatial navigation"
						description="Spatial navigation works with real-time node positions. When directional move action is received closest non-overlapping node in given direction is focused."
						gridPos={{ row: 4, col: 1 }}
					>
						<SpatialExample />
					</ExampleBox>
				</div>
			</div>
		</nav.Context>
	);
}
