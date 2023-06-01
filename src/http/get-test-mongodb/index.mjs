import arc from "@architect/functions";
import { MongoClient, ServerApiVersion } from "mongodb";

const { MONGO_DB_URL } = process.env;

export const handler = arc.http.async(async () => {
	if (!MONGO_DB_URL) throw Error("Missing MONGO_DB_URL");

	// MongoDB
	let mongoTime = Date.now();
	let mongoResult;
	try {
		const client = new MongoClient(MONGO_DB_URL, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			},
		});
		await client.connect();
		const result = await client
			.db("mongodb")
			.collection("things")
			.find()
			.toArray();
		await client.close();
		const [{ _id, ...resultWithoutId }] = result;
		mongoResult = JSON.stringify(resultWithoutId);
	} catch (error) {
		console.log(error);
	}
	mongoTime = Date.now() - mongoTime;

	return {
		html: /*html*/ `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<title>Arc w/ Neon</title>
			<style>
				code {
					font-size: 0.95rem;
					font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
					color: #000;
				}
			</style>
		</head>
		<body>
			<pre><code><strong>MongoDB: <u>${mongoTime}ms</u></strong>
  await db.collection("things").find().toArray() → ${mongoResult}</code></pre>
		</body>
		</html>
		`,
	};
});
