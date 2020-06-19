import { createKey, createKeys, createTree, createPath } from "./helpers";
import { SynSet } from "../types";

test("create key", () => {
	expect(createKey(["1", "2"])).toBe("1-2");
});

test.each([
	[
		["1", "2"],
		["1", "1-2"],
	],
	[
		["1", "2", "3"],
		["1", "1-2", "1-2-3"],
	],
	[
		["1", "2", "3", "4"],
		["1", "1-2", "1-2-3", "1-2-3-4"],
	],
])("createKeys(%p) === %p", (path, expected) => {
	expect(createKeys(path)).toStrictEqual(expected);
});

test.each([
	["1", ["1"]],
	["1 > 2", ["1", "2"]],
	["1 > 2 > 3 > 4", ["1", "2", "3", "4"]],
])("createPath(%p) === %p", (name, expected) => {
	expect(createPath(name)).toStrictEqual(expected);
});

const paths = [
	{ name: "1", size: 15 },
	{ name: "1 > 2", size: 2 },
	{ name: "1 > 2 > 3", size: 1 },
	{ name: "1 > 2 > 3 > 4", size: 0 },
	{ name: "2", size: 8 },
	{ name: "2 > 1", size: 3 },
	{ name: "2 > 1 > 1", size: 0 },
	{ name: "2 > 1 > 2", size: 0 },
	{ name: "2 > 1 > 3", size: 0 },
	{ name: "2 > 2", size: 2 },
	{ name: "2 > 2 > 1", size: 0 },
	{ name: "2 > 2 > 2", size: 0 },
	{ name: "2 > 3", size: 0 },
	{ name: "3", size: 1 },
	{ name: "3 > 1", size: 0 },
];

const tree: SynSet = {
	name: "1",
	size: 15,
	children: [
		{
			name: "1",
			size: 3,
			children: [
				{
					name: "2",
					size: 2,
					children: [
						{
							name: "3",
							size: 1,
							children: [
								{
									name: "4",
									size: 0,
									children: [],
								},
							],
						},
					],
				},
			],
		},
		{
			name: "2",
			size: 8,
			children: [
				{
					name: "1",
					size: 3,
					children: [
						{
							name: "1",
							size: 0,
							children: [],
						},
						{
							name: "2",
							size: 0,
							children: [],
						},
						{
							name: "3",
							size: 0,
							children: [],
						},
					],
				},
				{
					name: "2",
					size: 2,
					children: [
						{
							name: "1",
							size: 0,
							children: [],
						},
						{
							name: "2",
							size: 0,
							children: [],
						},
					],
				},
				{
					name: "3",
					size: 0,
					children: [],
				},
			],
		},
		{
			name: "3",
			size: 1,
			children: [
				{
					name: "1",
					size: 0,
					children: [],
				},
			],
		},
	],
};

test("create tree", () => {
	console.log(tree);

	expect(createTree(paths)).toEqual(tree);
});
