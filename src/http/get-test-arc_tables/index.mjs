import arc from "@architect/functions";

export const handler = arc.http.async(async () => {
	// Arc service discovery
	let arcDiscoveryTime = Date.now();
	const { things } = await arc.tables();
	arcDiscoveryTime = Date.now() - arcDiscoveryTime;

	// Dynamo via Architect
	await things.put({ key: "one", value: "two" });
	let dynamoTime = Date.now();
	let dynamoResult;
	try {
		dynamoResult = await things?.scan({});
	} catch (error) {
		console.log(error);
	}
	dynamoTime = Date.now() - dynamoTime;

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
	<pre><code><strong>Dynamo via Arc: <u>${dynamoTime}ms</u></strong>
  await things.scan({}) → ${JSON.stringify(dynamoResult?.Items)}</code></pre>
</body>
</html>
`,
	};
});
