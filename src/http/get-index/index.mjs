import ws from 'ws'; // force Arc to hydrate ws for Lambda
import arc from "@architect/functions";
import { Pool } from "@neondatabase/serverless";
import postgres from "postgres";
const {
	PGUSER,
	PGPASSWORD,
	ENDPOINT_ID,
	PGHOST,
	PGDATABASE
} = process.env;

const DB_URL = `postgres://${PGUSER}:${PGPASSWORD}@${ENDPOINT_ID}.${PGHOST}/${PGDATABASE}`;

export const handler = arc.http.async(async () => {
	if (!ws) throw Error('Missing ws');
	if (!DB_URL) throw Error('Missing DB_URL');

	// wake Neon db
	let neonWakeTime = Date.now();
	try {
		const sql = postgres(DB_URL, { ssl: 'require' });
		await sql`select now()`;
		await sql.end();
	} catch (error) {
		console.log(error)
	}
	neonWakeTime = Date.now() - neonWakeTime;

	// Arc service discovery
	let arcDiscoveryTime = Date.now();
	const { things } = await arc.tables();
	arcDiscoveryTime = Date.now() - arcDiscoveryTime;

	// Neon with postgres
	let neonPgTime = Date.now();
	let pgResult
	const sql = postgres(DB_URL, { ssl: 'require' });
	try {
		const [thing] = await sql`SELECT * FROM things`;
		await sql.end();
		pgResult = JSON.stringify(thing)
	} catch (error) {
		console.log(error)
	}
	neonPgTime = Date.now() - neonPgTime;

	// Neon "Serverless" mode
	let neonServerlessTime = Date.now();
	let serverlessResult
	const pool = new Pool({ connectionString: DB_URL });
	try {
		const { rows: [thing] } = await pool.query('SELECT * FROM things');
		await pool.end();
		serverlessResult = JSON.stringify(thing)
	} catch (error) {
		console.log(error)
	}
	neonServerlessTime = Date.now() - neonServerlessTime;

	// Dynamo via Architect
	await things.put({ key: 'one', value: 'two' });
	let time3 = Date.now();
	let thing1
	try {
		thing1 = await things?.get({ key: 'one' });
	} catch (error) {
		console.log(error)
	}
	time3 = Date.now() - time3;

	return {
		html: /*html*/ `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="icon" href="https://fav.farm/🔬" />
	<title>Arc w/ Neon</title>
	<style>
		 * { margin: 0; padding: 0; box-sizing: border-box; }
		 body {
			display: flex;
			flex-direction: column;
			gap: 2rem;
			max-width: 65ch;
			font-size: 18px;
			padding: 3rem 0;
			margin: auto;
			line-height: 1.75;
			font-family: Avenir, 'Avenir Next LT Pro', Montserrat, Corbel, 'URW Gothic', source-sans-pro, sans-serif;
		}
		h1 {
			line-height: 1;
		}
		code {
			font-size: 0.95rem;
			font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
		}
	</style>
</head>
<body>
	<h1>
		<a href="https://neon.tech" target="_blank">Neon</a> Postgres on
		<abbr title="AWS Lambda">λ</abbr> with
		<a href="https://arc.codes" target="_blank">Architect</a>
	</h1>

	<p>
		Comparing Neon +
		<a href="https://www.npmjs.com/package/postgres" target="_blank">postgres</a>, Neon's
		<a href="https://github.com/neondatabase/serverless" target="_blank">@neondatabase/serverless</a> over ws, and
		<a href="https://aws.amazon.com/dynamodb/" target="_blank">DynamoDB</a> via
		Arc.
	</p>

	<pre><code><em>Neon wake (in case of cold start): ${neonWakeTime}ms</em>
<strong>Neon + postgres: <u>${neonPgTime}ms</u></strong>
   SELECT * FROM things → ${pgResult}
<strong>Neon serverless: <u>${neonServerlessTime}ms</u></strong>
   SELECT * FROM things → ${serverlessResult}</code></pre>

	<pre><code><em>Arc service discovery (cached when warm): ${arcDiscoveryTime}ms</em>
<strong>Dynamo via Arc: ${time3}ms</strong>
   things.get({ key: 'one' }) → ${JSON.stringify(thing1)}
<strong>Arc + Dynamo = <u>${arcDiscoveryTime + time3}ms</u></strong></code></pre>

	<p><small><a href="https://github.com/tbeseda/arc-ddb-vs-neon" target="_blank">Source code</a></small></p>
</body>
</html>
`,
	};
});
