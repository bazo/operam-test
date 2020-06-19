import { Message } from "../types";
import { uploadToDB, clearDB } from "../app/db";

const post = (message: Message<{}>) => {
	//@ts-ignore
	postMessage(message);
};

// @ts-ignore
onmessage = async (env: MessageEvent) => {
	console.log(env.data);

	const [action, data, limit] = env.data;

	if (action === "clearDB") {
		clearDB().catch(console.log);
	}

	if (action === "upload") {
		await uploadToDB(data, limit, complete => {
			post({ type: "progress", data: complete });
		});
		post({ type: "finished" });
	}

	if (action === "download") {
		/*
		const res = await downloadData();

		console.log(res);

		//@ts-ignore
		postMessage({ type: "download", data: res });
		*/
	}
};
