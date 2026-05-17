import { containerHandler, horizontalHandler, itemHandler, Nav, useNav } from "@fiveway/react";
import { useState } from "react";
import { flushSync } from "react-dom";

import css from "./Showcase.module.css";

export function ConditionalShowcase() {
	const nav = useNav("section", horizontalHandler);

	const [isOn, setOn] = useState(false);

	return (
		<div className={css.section} data-is-focused={nav.isFocused()}>
			<div style={{ display: "flex" }}>
				<nav.Context>
					<Nav
						id="toggle"
						handler={itemHandler(() => {
							flushSync(() => {
								setOn((on) => !on);
							});
							if (!isOn) {
								nav.focus("content");
							}
						})}
					>
						{(node) => (
							<button className={css.item} data-is-focused={node.isFocused()}>
								{isOn ? "hide" : "show"}
							</button>
						)}
					</Nav>

					<Nav id="content" handler={containerHandler}>
						{isOn && (
							<Nav
								id="parking"
								handler={itemHandler(() => {
									setOn(false);
									nav.focus();
								})}
							>
								{(node) => (
									<button className={css.item} data-is-focused={node.isFocused()}>
										remove
									</button>
								)}
							</Nav>
						)}
					</Nav>
				</nav.Context>
			</div>
		</div>
	);
}
