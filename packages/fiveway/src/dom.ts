import { type DataHandler, createDataHandler } from "./handler/metadata.ts";

export { type Keybinds, defaultKeybinds } from "./dom/keybinds.ts";
export { registerKeyboardListener } from "./dom/listener.ts";

/**
 * Metadata handler (query key `element`) that ties a node to a focusable DOM element
 *
 * Exposes `.query(tree, id)` to resolve the element for focus sync.
 */
export const elementHandler: DataHandler<HTMLElement> = createDataHandler("element");
