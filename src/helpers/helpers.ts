import { Tuple, SynSet } from "../types";
import { view, lensPath, set } from "ramda";
const util = require("util");

export function createKeys(path: string[]): string[] {
	let keys: string[] = [];

	for (let i = 0; i < path.length; i++) {
		const subPath = path.slice(0, i + 1);
		keys.push(createKey(subPath));
	}

	return keys;
}

export function createKey(path: string[]): string {
	return path.join("-");
}

export function createPath(name: string, delimiter = " > "): string[] {
	return name.split(delimiter);
}

export function childExists(leaf: SynSet, name: string): boolean {
	if (!leaf.children) {
		return false;
	}

	for (let child of leaf.children!) {
		if (child.name === name) {
			return true;
		}
	}

	return false;
}

function hasItem(sub: SynSet[], name: string): boolean {
	for (let i in sub) {
		const child = sub[i];
		if (child.name === name) {
			return true;
		}
	}

	return false;
}

function getIndex(sub: SynSet[], name: string): number {
	for (let i in sub) {
		const child = sub[i];
		if (child.name === name) {
			return parseInt(i);
		}
	}

	return sub.length;
}

const emptyLeaf = (name: string, size: number) => {
	const children: any[] = [];
	return { name, size, children };
};

export function updateTree(tree: SynSet, path: string[], lens: (string | number)[], size: number): SynSet {
	for (let name of path) {
		const sub = view(lensPath(lens), tree) as SynSet[];
		const exists = hasItem(sub, name);
		const index = exists ? getIndex(sub, name) : sub.length;

		lens = [...lens, index];

		if (!exists) {
			tree = set(lensPath(lens), emptyLeaf(name, size), tree);
		}

		lens = [...lens, "children"];
	}

	return tree;
}

export function createTree(paths: Tuple[]): SynSet {
	let tree: SynSet = {} as SynSet;

	paths.sort((a, b) => {
		if (a.name < b.name) {
			return -1;
		}
		if (a.name > b.name) {
			return 1;
		}
		return 0;
	});

	for (let i in paths) {
		const { name, size } = paths[i];

		const path = createPath(name);

		if (path.length === 1) {
			tree = emptyLeaf(name, size);
		} else {
			path.shift();
			tree = { ...updateTree(tree, path, ["children"], size) };
		}
	}

	return tree;
}

function log(data: any) {
	if (process.env.NODE_ENV === "test") {
		console.log(util.inspect(data, { showHidden: false, depth: null }));
	}
}
