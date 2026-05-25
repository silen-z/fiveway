import { type NavigationAction } from "../action.ts";
import { createDataHandler, type DataHandlerWithDefault } from "./metadata.ts";

/**
 * Options for {@link longPressHandler}.
 */
export interface LongPressOptions {
	/**
	 * Whether to enable long press. Default: `true`.
	 */
	enabled?: boolean | ((e: NavigationAction) => boolean);

	/**
	 * The threshold in milliseconds to consider keydown a long press. Default: `500`.
	 */
	threshold?: number;
}

/**
 * Navigation handler factory that creates a handler that enables long presd action variants for a node.
 *
 * @see {@link LongPressOptions} for options.
 */
export const longPressHandler: DataHandlerWithDefault<LongPressOptions> =
	createDataHandler<LongPressOptions>("longPress", { enabled: true });
