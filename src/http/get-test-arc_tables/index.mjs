import arc from "@architect/functions";

export const handler = arc.http.async(async () => {
	// Arc service discovery
	let arcDiscoveryTime = Date.now();
	const { things } = await arc.tables();
	arcDiscoveryTime = Date.now() - arcDiscoveryTime;

	// Dynamo via Architect
	await things.put({ key: "one", value: "two" });
	let time3 = Date.now();
	let thing1;
	try {
		thing1 = await things?.get({ key: "one" });
	} catch (error) {
		console.log(error);
	}
	time3 = Date.now() - time3;

	return {
		html: /*html*/ `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Arc w/ DynamoDB</title>
	<style>
		code {
			font-size: 0.95rem;
			font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
			color: #000;
		}
	</style>
</head>
<body>
	<pre><code><em>Arc service discovery<sup>3</sup>: ${arcDiscoveryTime}ms</em>
<strong>Dynamo via Arc: ${time3}ms</strong>
  things.get({ key: 'one' }) → ${JSON.stringify(thing1)}
<strong>Arc + Dynamo = <u>${arcDiscoveryTime + time3}ms</u></strong></code></pre>
</body>
</html>
`,
	};
});
