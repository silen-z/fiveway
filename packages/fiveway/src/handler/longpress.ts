import { createDataHandler, type DataHandler } from "./metadata.ts";

export interface LongPressOptions {
	enabled?: boolean;
	threshold?: number;
}

export const longPressHandler: DataHandler<LongPressOptions> =
	createDataHandler<LongPressOptions>("longPress");
