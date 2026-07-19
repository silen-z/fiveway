import { useState } from "react";

import css from "./InspectorWarning.module.css";

export function InspectorWarning() {
	const [inspectorAddress] = useState(getInspectorAddress);

	return (
		<>
			{inspectorAddress != null && (
				<div className={css.inspectorWarning}>
					This page is connected to <strong>fiveway / inspector</strong> at{" "}
					<a href={inspectorAddress} target="_blank" rel="noreferrer">
						{inspectorAddress}
					</a>
					. That means your interaction with this page is publicly visible. The inspector displays
					navigation state and can manipulate it.
				</div>
			)}
		</>
	);
}

function getInspectorAddress(): string | null {
	const script = document.querySelector<HTMLScriptElement>("script[data-inspector]");
	if (script == null) {
		return null;
	}

	try {
		return new URL(script.src).origin;
	} catch {
		return script.src || null;
	}
}
