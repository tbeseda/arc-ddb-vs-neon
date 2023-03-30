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
<strong>Neon serverless: <u>${neonServerlessTime}ms</u></strong>
  SELECT * FROM things → ${serverlessResult}</code></pre>

	<pre><code><em>Arc service discovery<sup>2</sup>: ${arcDiscoveryTime}ms</em>
<strong>Dynamo via Arc: ${time3}ms</strong>
  things.get({ key: 'one' }) → ${JSON.stringify(thing1)}
<strong>Arc + Dynamo = <u>${arcDiscoveryTime + time3}ms</u></strong></code></pre>
</body>
</html>
`,
  };
});
