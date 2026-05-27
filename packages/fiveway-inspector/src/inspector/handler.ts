import { type HandlerDescription } from "@fiveway/core/inspector";

export type InspectedHandler = {
	name: string;
	dataKey: string | null;
	label: string;
	options: [string, unknown][];
};

export function parseHandler(handlers: HandlerDescription[]): InspectedHandler[] {
	return handlers.map(parseOneHandler);
}

function parseOneHandler(handler: HandlerDescription): InspectedHandler {
	const name = handlerName(handler);
	const labelName = handlerName(handler, "custom");
	const useKeyAsLabel = name === "data" && typeof handler.key === "string";

	return {
		name: typeof handler.name === "string" ? handler.name : "",
		dataKey: handler.name === "data" && typeof handler.key === "string" ? handler.key : null,
		label: useKeyAsLabel
			? humanizeIdentifier(handler.key as string)
			: humanizeIdentifier(labelName),
		options: Object.entries(handler).filter(([key]) => {
			if (key === "name") {
				return false;
			}

			if (useKeyAsLabel && key === "key") {
				return false;
			}

			return true;
		}),
	};
}

function handlerName(handler: HandlerDescription, fallback = ""): string {
	const name = handler.name;
	if (typeof name === "string" && name.length > 0) {
		return name;
	}
	return fallback;
}

function humanizeIdentifier(value: string): string {
	const humanized = value
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/[-_/]+/g, " ")
		.toLowerCase();

	if (humanized.length === 0) {
		return humanized;
	}

	return humanized.charAt(0).toUpperCase() + humanized.slice(1);
}
