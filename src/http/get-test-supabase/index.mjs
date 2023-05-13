import arc from "@architect/functions";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_KEY, SUPABASE_URL } = process.env;

export const handler = arc.http.async(async () => {
	if (!(SUPABASE_KEY && SUPABASE_URL)) throw Error("Missing DB_URL");

	let supabaseTime = Date.now();
	let result;
	const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
	try {
		const { data, error } = await supabase.from("things").select();
		if (error) throw error;
		result = JSON.stringify(data);
	} catch (error) {
		console.log(error);
	}
	supabaseTime = Date.now() - supabaseTime;

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
	<pre><code><strong>Supabase: <u>${supabaseTime}ms</u></strong>
  supabase.from("things").select() → ${result}</code></pre>
</body>
</html>
    `,
	};
});
