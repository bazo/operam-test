export interface Tuple {
	id?: string;
	name: string;
	size: number;
}

export interface SynSet {
	name: string;
	size: number;
	children?: SynSet[];
}

export type Data = Tuple[];

export interface Message<T> {
	type: "progress" | "finished" | "data" | "download";
	data?: T;
}
