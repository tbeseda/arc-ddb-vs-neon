import arc from "@architect/functions";
import postgres from "postgres";
// import { createClient } from "@supabase/supabase-js";

const { SB_DB_URL, SB_KEY, SB_URL } = process.env;

export const handler = arc.http.async(async () => {
	if (!(SB_DB_URL && SB_KEY && SB_URL)) throw Error("Missing SB_DB_URL");

	// Supabase with postgres
	let supabasePgTime = Date.now();
	let supabasePgResult;
	const sql = postgres(SB_DB_URL);
	try {
		const [thing] = await sql`SELECT * FROM things`;
		await sql.end();
		supabasePgResult = JSON.stringify(thing);
	} catch (error) {
		console.log(error);
	}
	supabasePgTime = Date.now() - supabasePgTime;

	// Supabase via REST
	let supabaseRestTime = Date.now();
	let supabaseRestResult;
	try {
		const response = await fetch(`${SB_URL}/rest/v1/things?select=*`, {
			headers: { apikey: SB_KEY },
		});
		const data = await response.json();
		supabaseRestResult = JSON.stringify(data);
	} catch (error) {
		console.log(error);
	}
	supabaseRestTime = Date.now() - supabaseRestTime;

	// let supabaseJsTime = Date.now();
	// let supabaseJsResult;
	// const supabase = createClient(SB_URL, SB_KEY);
	// try {
	// 	const { data, error } = await supabase.from("things").select();
	// 	if (error) throw error;
	// 	supabaseJsResult = JSON.stringify(data);
	// } catch (error) {
	// 	console.log(error);
	// }
	// supabaseJsTime = Date.now() - supabaseJsTime;

	return {
		html: /*html*/ `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Arc w/ Supabase</title>
	<style>
		code {
			font-size: 0.95rem;
			font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
			color: #000;
		}
	</style>
</head>
<body>
	<pre><code><strong>Supabase + postgres: <u>${supabasePgTime}ms</u></strong>
  SELECT * FROM things → ${supabasePgResult}
<strong>Supabase via REST: <u>${supabaseRestTime}ms</u></strong>
  fetch("\${SUPABASE_URL}/rest/v1/things?select=*") → ${supabaseRestResult}
<strike>@supabase/supabase-js: <u>\${supabaseJsTime}ms</u></strike> <em>skipped<sup>2</sup></em>
  supabase.from("things").select() → \${supabaseJsResult}</code></pre>
</body>
</html>
		`,
	};
});
