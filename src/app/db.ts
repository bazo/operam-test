import faunadb, { query as q } from "faunadb";
import { Data } from "../types";

const db = new faunadb.Client({ secret: process.env.REACT_APP_FAUNADB_KEY! });

const COLLECTION = "synsets";
const INDEX_NAME = "all_sets";

export type ProgressCallback = (complete: number) => void;

async function makeQuery(size: number, after = undefined) {
	return db.query(
		q.Map(
			q.Paginate(q.Match(q.Index(INDEX_NAME)), {
				size,
				after,
			}),
			q.Lambda("X", q.Get(q.Var("X")))
		)
	);
}

export async function clearDB() {
	return db.query(q.Delete(q.Collection(COLLECTION)));
}

export async function getTotalCount(): Promise<number> {
	return db.query(q.Count(q.Match(q.Index(INDEX_NAME))));
}

export async function downloadData(size: number = 5000, progressCallback: ProgressCallback) {
	const totalCount = await getTotalCount();
	let after = undefined;

	let data: any[] = [];

	do {
		const res: any = await makeQuery(size, after);
		after = res.after;
		data = [...data, ...res.data.map(({ data }: { data: any }) => data)];

		const complete = (data.length * 100) / totalCount;
		progressCallback(complete);
	} while (after !== undefined);

	return data;
}

export async function uploadToDB(data: Data, limit: number, progressCallback: ProgressCallback) {
	try {
		await db.query(q.CreateCollection({ name: COLLECTION }));
	} catch (err) {
		console.log(err);
	}

	const queries = Math.ceil(data.length / limit);

	for (let i = 0; i <= queries; i++) {
		const start = i * limit;
		const tuples = data.slice(start, start + limit);

		await db.query(q.Map(tuples, q.Lambda("tuple", q.Create(q.Collection(COLLECTION), { data: q.Var("tuple") }))));

		const complete = (i * 100) / queries;
		progressCallback(complete);
	}
}
