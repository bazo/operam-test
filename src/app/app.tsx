import React, { useState, useEffect } from "react";
import Layout from "../components/layout";
import ProgressBar from "../components/progressBar";

// @ts-ignore
import XMLWorker from "../workers/xml.worker.ts";
// @ts-ignore
import DBWorker from "../workers/upload.worker.ts";
import { Data, Message, SynSet } from "../types";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { createTree } from "../helpers/helpers";
import { downloadData, getTotalCount } from "./db";
import Tree from "../components/tree";

const useTestData = false;
const testData = [
	{ name: "sizeFall Release", size: 8 },
	{ name: "sizeFall Release > Misc", size: 7 },
	{ name: "sizeFall Release > Misc > Aegean island", size: 0 },
	{ name: "sizeFall Release > Misc > American mistletoe", size: 1 },
	{
		name: "sizeFall Release > Misc > American mistletoe > Phoradendron serotinum",
		size: 0,
	},
	{
		name: "sizeFall Release > Misc > American mistletoe > Blahblah",
		size: 0,
	},
	{ name: "sizeFall Release > Misc > Arenaviridae", size: 0 },
	{ name: "sizeFall Release > Misc > Armagnac", size: 0 },
	{
		name: "sizeFall Release > Misc > B-complex vitamin",
		size: 1,
	},
	{
		name: "sizeFall Release > Misc > B-complex vitamin > biotin",
		size: 0,
	},
	{
		name: "sizeFall Release > Misc > B-complex vitamin > vitamin H",
		size: 0,
	},
];

const App = () => {
	const [processingXML, setProcessingXML] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const [data, setData] = useState<Data>([]);
	const [tree, setTree] = useState<SynSet>((null as unknown) as SynSet);
	const [complete, setComplete] = useState(100);
	const [progress$, setProgressStream] = useState((null as unknown) as Subject<number>);

	const xmlW = new XMLWorker();
	const dbW = new DBWorker();

	xmlW.onmessage = (e: { data: Message<Data> }) => {
		if (e.data.type === "finished") {
			setProcessingXML(false);
		}

		if (e.data.type === "data") {
			const data = e.data.data;
			setData(data!);
		}
	};

	dbW.onmessage = (e: { data: Message<any> }) => {
		if (e.data.type === "progress") {
			progress$.next(e.data.data);
		}

		if (e.data.type === "finished") {
			setUploading(false);
			setData([]);
		}

		if (e.data.type === "download") {
			setTree(createTree(e.data.data));
		}
	};

	const loadData = async (progress$: Subject<number>) => {
		setDownloading(true);
		setComplete(0);

		if (useTestData) {
			return testData;
		}

		const totalCount = await getTotalCount();
		return downloadData(totalCount, 5000, (complete: number) => {
			progress$.next(complete);
		});

		/* 
		TOO BIG :(
		let data = (localStorage.getItem("data") as unknown) as Data;

		if (data === null) {
			
			const totalCount = await getTotalCount();
			data = await downloadData(totalCount, 5000, (complete: number) => {
				progress$.next(complete);
			});

			localStorage.setItem("data", JSON.stringify(data));
			return data;
		} else {
			return JSON.parse((data as unknown) as string);
		}
		*/
	};

	useEffect(() => {
		const progress$ = new Subject<number>();
		const subscription = progress$.pipe(debounceTime(300)).subscribe(complete => {
			setComplete(complete);
		});
		setProgressStream(progress$);

		loadData(progress$).then(data => {
			setTree(createTree(data));
			setDownloading(false);
		});

		//@ts-ignore
		//dbW.postMessage("download");

		return () => {
			subscription.unsubscribe();
			xmlW.terminate();
			dbW.terminate();
		};
	}, []);

	const processXML = () => {
		xmlW.postMessage("");
		setProcessingXML(true);
	};

	const abort = () => {
		setUploading(false);
		setProcessingXML(false);
		xmlW.terminate();
		dbW.terminate();
	};

	const upload = () => {
		setUploading(true);
		setComplete(0);

		dbW.postMessage(["upload", data, 20]);
	};

	const clearDB = () => {
		dbW.postMessage(["clearDB"]);
	};

	return (
		<Layout>
			{processingXML ? (
				<button className="btn btn-danger" onClick={abort}>
					<i className="fas fa-power-off" /> Abort
				</button>
			) : (
				<button
					className="btn btn-primary"
					onClick={processXML}
					disabled={uploading || downloading || data.length !== 0}
				>
					<i className="fas fa-download" /> Process XML
				</button>
			)}
			&nbsp;
			{uploading ? (
				<button className="btn btn-danger" onClick={abort}>
					<i className="fas fa-power-off" /> Abort
				</button>
			) : (
				<button className="btn btn-primary" onClick={upload} disabled={data.length === 0}>
					<i className="fas fa-upload" /> Upload to DB
				</button>
			)}
			&nbsp;
			<button className="btn btn-danger" onClick={clearDB} disabled={uploading || downloading}>
				<i className="fas fa-power-off" /> Clear DB
			</button>
			<ProgressBar loading={processingXML || uploading || downloading} complete={complete} />
			{tree && <Tree tree={tree} />}
		</Layout>
	);
};

export default App;
