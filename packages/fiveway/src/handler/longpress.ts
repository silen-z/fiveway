import { createDataHandler, type DataHandler } from "./metadata.ts";

export type LongPressOptions = {
	enabled?: boolean;
	threshold?: number;
};

export const longPressHandler: DataHandler<LongPressOptions> =
	createDataHandler<LongPressOptions>("longPress");
