import { createDataHandler, type DataHandlerWithDefault } from "./metadata.ts";

export interface LongPressOptions {
	enabled?: boolean;
	threshold?: number;
}

export const longPressHandler: DataHandlerWithDefault<LongPressOptions> =
	createDataHandler<LongPressOptions>("longPress", { enabled: true });
