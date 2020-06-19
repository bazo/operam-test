import { Message } from "../types";
import { uploadToDB, clearDB, downloadData } from "../app/db";

const post = (message: Message<{}>) => {
	//@ts-ignore
	postMessage(message);
};

const progressCallback = (complete: number) => {
	post({ type: "progress", data: complete });
};

// @ts-ignore
onmessage = async (env: MessageEvent) => {
	console.log(env.data);

	const [action, data, limit] = env.data;

	if (action === "clearDB") {
		clearDB().catch(console.log);
	}

	if (action === "upload") {
		await uploadToDB(data, limit, progressCallback);
		post({ type: "finished" });
	}

	if (action === "download") {
		const res = await downloadData(5000, progressCallback);

		//@ts-ignore
		postMessage({ type: "download", data: res });
	}
};
