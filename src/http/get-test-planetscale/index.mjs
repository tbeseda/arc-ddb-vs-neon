import arc from "@architect/functions";
import { connect } from "@planetscale/database";
import mysql from "mysql2";

const { PS_DB_URL, PS_DB_HOST, PS_DB_USERNAME, PS_DB_PASSWORD } = process.env;

export const handler = arc.http.async(async () => {
	if (!PS_DB_URL) throw Error("Missing PS_DB_URL");

	// PlanetScale with mysql
	let psMysqlTime = Date.now();
	let mysqlResult;
	try {
		const connection = mysql.createConnection(PS_DB_URL);
		const [rows] = await connection.promise().query("SELECT * FROM things");
		connection.end();
		mysqlResult = JSON.stringify(rows[0]);
	} catch (error) {
		console.log(error);
	}
	psMysqlTime = Date.now() - psMysqlTime;

	// PlanetScale database driver
	let psDriverTime = Date.now();
	let psDriverResult;
	try {
		const config = {
			host: PS_DB_HOST,
			username: PS_DB_USERNAME,
			password: PS_DB_PASSWORD,
		};

		const conn = connect(config);
		const { rows } = await conn.execute("SELECT * FROM things");
		psDriverResult = JSON.stringify(rows);
	} catch (error) {
		console.log(error);
	}
	psDriverTime = Date.now() - psDriverTime;

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
			<pre><code><strong>PlanetScale + mysql2: <u>${psMysqlTime}ms</u></strong>
  SELECT * FROM things → ${mysqlResult}
<strong>@planetscale/database: <u>${psDriverTime}ms</u></strong>
  await conn.execute("SELECT * FROM things") → ${psDriverResult}</code></pre>
		</body>
		</html>
		`,
	};
});
