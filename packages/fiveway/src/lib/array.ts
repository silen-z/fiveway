/**
 * Removes element from an array by moving the last one in its place and truncating it
 * It's potentionaly faster becase it doesn't have to shift the rest of elements
 */
export function swapRemove(array: unknown[], idx: number): void {
	if (idx >= array.length) {
		return;
	}

	array[idx] = array[array.length - 1];
	array.length -= 1;
}

/**
 * Searches through ordered array for a element matching the predicate
 * @returns index of
 */
export function binarySearch<T>(array: T[], pred: (val: T) => boolean): number {
	let low = -1;
	let high = array.length;

	while (low + 1 < high) {
		const mid = low + ((high - low) >> 1);

		if (pred(array[mid]!)) {
			high = mid;
		} else {
			low = mid;
		}
	}

	return high;
}

if (import.meta.vitest) {
	const { expect, test } = import.meta.vitest;

	test("swapRemove", () => {
		const arr = [1, 2, 3, 4];

		swapRemove(arr, 1);

		expect(arr).toEqual([1, 4, 3]);
	});

	test("swapRemove: from start", () => {
		const arr = [1, 2, 3, 4];

		swapRemove(arr, 0);

		expect(arr).toEqual([4, 2, 3]);
	});

	test("swapRemove: from end", () => {
		const arr = [1, 2, 3, 4];

		swapRemove(arr, 3);

		expect(arr).toEqual([1, 2, 3]);
	});

	test("swapRemove: out of bounds", () => {
		const arr = [1, 2, 3, 4];

		swapRemove(arr, 10);

		expect(arr).toEqual([1, 2, 3, 4]);
	});

	test("binarySearch: search", () => {
		const arr = [1, 3, 4];

		expect(binarySearch(arr, (i) => 2 < i)).toBe(1);
		expect(binarySearch(arr, (i) => 5 < i)).toBe(3);
		expect(binarySearch(arr, (i) => 0 < i)).toBe(0);
		expect(binarySearch(arr, (i) => 3 < i)).toBe(2);
	});

	test("binarySearch: insert", () => {
		const arr = [1, 3, 4];
		const toInsert = 2;

		const index = binarySearch(arr, (i) => toInsert < i);
		arr.splice(index, 0, toInsert);

		expect(arr).toEqual([1, 2, 3, 4]);
	});
}
