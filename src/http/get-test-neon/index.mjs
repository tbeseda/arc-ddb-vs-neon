import ws from "ws"; // force Arc to hydrate ws for Lambda
import arc from "@architect/functions";
import { neonConfig, Pool } from "@neondatabase/serverless";
import postgres from "postgres";

const { NEON_DB_URL } = process.env;

neonConfig.webSocketConstructor = ws;

export const handler = arc.http.async(async () => {
	if (!NEON_DB_URL) throw Error("Missing NEON_DB_URL");

	// wake Neon db
	let neonWakeTime = Date.now();
	try {
		const sql = postgres(NEON_DB_URL, { ssl: "require" });
		await sql`select now()`;
		await sql.end();
	} catch (error) {
		console.log(error);
	}
	neonWakeTime = Date.now() - neonWakeTime;

	// Neon with postgres
	let neonPgTime = Date.now();
	let pgResult;
	const sql = postgres(NEON_DB_URL, { ssl: "require" });
	try {
		const [thing] = await sql`SELECT * FROM things`;
		await sql.end();
		pgResult = JSON.stringify(thing);
	} catch (error) {
		console.log(error);
	}
	neonPgTime = Date.now() - neonPgTime;

	// Neon "Serverless" mode
	let neonServerlessTime = Date.now();
	let serverlessResult;
	const pool = new Pool({ connectionString: NEON_DB_URL });
	try {
		const {
			rows: [thing],
		} = await pool.query("SELECT * FROM things");
		await pool.end();
		serverlessResult = JSON.stringify(thing);
	} catch (error) {
		console.log(error);
	}
	neonServerlessTime = Date.now() - neonServerlessTime;

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
	<pre><code><em>Neon wake<sup>1</sup>: ${neonWakeTime}ms</em>
<strong>Neon + postgres: <u>${neonPgTime}ms</u></strong>
  SELECT * FROM things → ${pgResult}
<strong>@neondatabase/serverless: <u>${neonServerlessTime}ms</u></strong>
  await pool.query("SELECT * FROM things") → ${serverlessResult}</code></pre>
</body>
</html>
`,
	};
});
