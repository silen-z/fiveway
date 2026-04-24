import { defineHandler } from "nitro";
import { createEventStream } from "nitro/h3";

import { subscribeNotifications } from "../../server/bridge.ts";

export const GET = defineHandler((event) => {
  // @ts-expect-error - @solid/start is using its own event and exposes H3 event as nativeEvent
	const stream = createEventStream(event.nativeEvent);

	const unsubscribe = subscribeNotifications(async () => {
		await stream.push({ data: "notify" });
	});

	stream.onClosed(() => {
		unsubscribe();
	});

	void stream.push({ data: "init" });

	return stream.send();
});
