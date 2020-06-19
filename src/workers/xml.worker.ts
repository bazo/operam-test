import * as txml from "txml";
import { createKeys, createKey } from "../helpers/helpers";
import { Tuple, Message } from "../types";

interface Counts {
	[x: string]: number;
}

const post = (message: Message<Tuple[]>) => {
	//@ts-ignore
	postMessage(message);
};

// @ts-ignore
onmessage = async (env: MessageEvent) => {
	const xml = await downloadXML();
	const inode = txml.xml(xml);

	const children = inode[0].children as txml.INode[];

	const set = children[1];

	let data: any[] = [];
	let counts: Counts = {};
	let idPath: string[] = [];
	parseSet(set, data, counts, 0, "", idPath);

	const items = data.map(({ path: name, idPath, id }) => {
		const key = createKey(idPath);
		const size = counts[key];

		return {
			id,
			name,
			size,
		};
	});

	post({ type: "finished" });
	post({ type: "data", data: items });
};

async function downloadXML(): Promise<string> {
	const url = "/structure_released.xml";

	const res = await fetch(url);
	const xml = await res.text();

	return xml;
}

function parseSet(set: txml.INode, data: any[], counts: Counts, level: number, path: string, idPath: string[]) {
	const keys = createKeys(idPath);

	//if ((set.children as txml.INode[]).length === 0) {
	keys.forEach(key => {
		if (!counts.hasOwnProperty(key)) {
			counts[key] = 0;
		}

		const currentCount = counts[key];

		counts[key] = currentCount + 1;
	});
	//}

	idPath = [...idPath, set.attributes["wnid"] as string];

	const key = createKey(idPath);
	counts[key] = 0;

	path = `${path ? `${path} > ` : ""}${set.attributes["words"]}`;
	data.push({ path, idPath, id: set.attributes["wnid"] as string });

	for (let child of set.children) {
		parseSet(child as txml.INode, data, counts, level + 1, path, idPath);
	}
}
