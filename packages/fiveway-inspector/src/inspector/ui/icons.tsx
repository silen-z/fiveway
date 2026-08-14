// TODO: investigate replacing with SVGs

import { Dynamic, type JSX } from "@solidjs/web";
import { type Component } from "solid-js";

type IconNodeChild = [tag: string, attrs: Record<string, string>, children?: IconNodeChild[]];

type IconNode = IconNodeChild[];

type IconProps = { size?: number; class?: string };

function renderNodes(nodes: IconNode) {
	const elements: JSX.Element[] = [];

	for (const [tag, attrs, children] of nodes) {
		const { key: _, ...rest } = attrs;
		elements.push(
			children != null ? (
				<Dynamic component={tag} {...rest}>
					{renderNodes(children)}
				</Dynamic>
			) : (
				<Dynamic component={tag} {...rest} />
			),
		);
	}

	return elements;
}

function createIcon(iconNode: IconNode): Component<IconProps> {
	return (props: IconProps) => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.size ?? 24}
			height={props.size ?? 24}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class={props.class}
			aria-hidden="true"
		>
			{renderNodes(iconNode)}
		</svg>
	);
}

export const ArrowDown = createIcon([
	["path", { d: "M12 5v14", key: "s699le" }],
	["path", { d: "m19 12-7 7-7-7", key: "1idqje" }],
]);

export const ArrowLeft = createIcon([
	["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
	["path", { d: "M19 12H5", key: "x3x0zl" }],
]);

export const ArrowRight = createIcon([
	["path", { d: "M5 12h14", key: "1ays0h" }],
	["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }],
]);

export const ArrowUp = createIcon([
	["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
	["path", { d: "M12 19V5", key: "x0mq9r" }],
]);

export const Braces = createIcon([
	[
		"path",
		{ d: "M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1", key: "ezmyqa" },
	],
	[
		"path",
		{
			d: "M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1",
			key: "e1hn23",
		},
	],
]);

export const Check = createIcon([["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);

export const ChevronDown = createIcon([["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]]);

export const ChevronRight = createIcon([["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]]);

export const ChevronsLeft = createIcon([
	["path", { d: "m11 17-5-5 5-5", key: "13zhaf" }],
	["path", { d: "m18 17-5-5 5-5", key: "h8a8et" }],
]);

export const ChevronsLeftRight = createIcon([
	["path", { d: "m9 7-5 5 5 5", key: "j5w590" }],
	["path", { d: "m15 7 5 5-5 5", key: "1bl6da" }],
]);

export const ChevronsRight = createIcon([
	["path", { d: "m6 17 5-5-5-5", key: "xnjwq" }],
	["path", { d: "m13 17 5-5-5-5", key: "17xmmf" }],
]);

export const CircleDot = createIcon([
	["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
	["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
]);

export const CornerLeftUp = createIcon([
	["path", { d: "M14 9 9 4 4 9", key: "1af5af" }],
	["path", { d: "M20 20h-7a4 4 0 0 1-4-4V4", key: "1blwi3" }],
]);

export const Focus = createIcon([
	["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }],
	["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
	["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
	["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
	["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }],
]);

export const FoldVertical = createIcon([
	["path", { d: "M12 22v-6", key: "6o8u61" }],
	["path", { d: "M12 8V2", key: "1wkif3" }],
	["path", { d: "M4 12H2", key: "rhcxmi" }],
	["path", { d: "M10 12H8", key: "s88cx1" }],
	["path", { d: "M16 12h-2", key: "10asgb" }],
	["path", { d: "M22 12h-2", key: "14jgyd" }],
	["path", { d: "m15 19-3-3-3 3", key: "e37ymu" }],
	["path", { d: "m15 5-3 3-3-3", key: "19d6lf" }],
]);

export const Gamepad2 = createIcon([
	["line", { x1: "6", x2: "10", y1: "11", y2: "11", key: "1gktln" }],
	["line", { x1: "8", x2: "8", y1: "9", y2: "13", key: "qnk9ow" }],
	["line", { x1: "15", x2: "15.01", y1: "12", y2: "12", key: "krot7o" }],
	["line", { x1: "18", x2: "18.01", y1: "10", y2: "10", key: "1lcuu1" }],
	[
		"path",
		{
			d: "M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",
			key: "mfqc10",
		},
	],
]);

export const Grid2x2X = createIcon([
	[
		"path",
		{
			d: "M12 3v17a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H3",
			key: "11za1p",
		},
	],
	["path", { d: "m16 16 5 5", key: "8tpb07" }],
	["path", { d: "m16 21 5-5", key: "193jll" }],
]);

export const LayoutGrid = createIcon([
	["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
	["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
	["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
	["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }],
]);

export const Map = createIcon([
	[
		"path",
		{
			d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",
			key: "169xi5",
		},
	],
	["path", { d: "M15 5.764v15", key: "1pn4in" }],
	["path", { d: "M9 3.236v15", key: "1uimfh" }],
]);

export const MapPin = createIcon([
	[
		"path",
		{
			d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
			key: "1r0f0z",
		},
	],
	["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }],
]);

export const MousePointerClick = createIcon([
	["path", { d: "M14 4.1 12 6", key: "ita8i4" }],
	["path", { d: "m5.1 8-2.9-.8", key: "1go3kf" }],
	["path", { d: "m6 12-1.9 2", key: "mnht97" }],
	["path", { d: "M7.2 2.2 8 5.1", key: "1cfko1" }],
	[
		"path",
		{
			d: "M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z",
			key: "s0h3yz",
		},
	],
]);

export const MoveHorizontal = createIcon([
	["path", { d: "m18 8 4 4-4 4", key: "1ak13k" }],
	["path", { d: "M2 12h20", key: "9i4pu4" }],
	["path", { d: "m6 8-4 4 4 4", key: "15zrgr" }],
]);

export const MoveVertical = createIcon([
	["path", { d: "M12 2v20", key: "t6zp3m" }],
	["path", { d: "m8 18 4 4 4-4", key: "bh5tu3" }],
	["path", { d: "m8 6 4-4 4 4", key: "ybng9g" }],
]);

export const Puzzle = createIcon([
	[
		"path",
		{
			d: "M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z",
			key: "w46dr5",
		},
	],
]);

export const Scan = createIcon([
	["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
	["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
	["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
	["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }],
]);

export const SquareDashed = createIcon([
	["path", { d: "M5 3a2 2 0 0 0-2 2", key: "y57alp" }],
	["path", { d: "M19 3a2 2 0 0 1 2 2", key: "18rm91" }],
	["path", { d: "M21 19a2 2 0 0 1-2 2", key: "1j7049" }],
	["path", { d: "M5 21a2 2 0 0 1-2-2", key: "sbafld" }],
	["path", { d: "M9 3h1", key: "1yesri" }],
	["path", { d: "M9 21h1", key: "15o7lz" }],
	["path", { d: "M14 3h1", key: "1ec4yj" }],
	["path", { d: "M14 21h1", key: "v9vybs" }],
	["path", { d: "M3 9v1", key: "1r0deq" }],
	["path", { d: "M21 9v1", key: "mxsmne" }],
	["path", { d: "M3 14v1", key: "vnatye" }],
	["path", { d: "M21 14v1", key: "169vum" }],
]);

export const Timer = createIcon([
	["line", { x1: "10", x2: "14", y1: "2", y2: "2", key: "14vaq8" }],
	["line", { x1: "12", x2: "15", y1: "14", y2: "11", key: "17fdiu" }],
	["circle", { cx: "12", cy: "14", r: "8", key: "1e1u0o" }],
]);

export const Undo2 = createIcon([
	["path", { d: "M9 14 4 9l5-5", key: "102s5s" }],
	["path", { d: "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11", key: "f3b9sd" }],
]);

export const UnfoldVertical = createIcon([
	["path", { d: "M12 22v-6", key: "6o8u61" }],
	["path", { d: "M12 8V2", key: "1wkif3" }],
	["path", { d: "M4 12H2", key: "rhcxmi" }],
	["path", { d: "M10 12H8", key: "s88cx1" }],
	["path", { d: "M16 12h-2", key: "10asgb" }],
	["path", { d: "M22 12h-2", key: "14jgyd" }],
	["path", { d: "m15 19-3 3-3-3", key: "11eu04" }],
	["path", { d: "m15 5-3-3-3 3", key: "itvq4r" }],
]);

export const X = createIcon([
	["path", { d: "M18 6 6 18", key: "1bl5f8" }],
	["path", { d: "m6 6 12 12", key: "d8bk6v" }],
]);
