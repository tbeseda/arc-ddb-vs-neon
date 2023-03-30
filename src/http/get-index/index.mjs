import arc from "@architect/functions";

export const handler = arc.http.async(async () => {
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
			gap: 1.5rem;
			max-width: 65ch;
			padding: 3rem 1rem;
			margin: auto;
			font-size: 18px;
			line-height: 1.75;
			font-family: Avenir, 'Avenir Next LT Pro', Montserrat, Corbel, 'URW Gothic', source-sans-pro, sans-serif;
			color: #333;
		}
		h4 {
			line-height: 1.5;
		}
		code {
			font-size: 0.95rem;
			font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
			color: #000;
		}
		iframe {
			width: 100%;
			border: none;
			background: #eee;
		}
	</style>
</head>
<body>
	<h1>
		<a href="https://neon.tech" target="_blank">Neon</a> Postgres on
		<abbr title="AWS Lambda">λ</abbr> with
		<a href="https://arc.codes" target="_blank">Architect</a>
	</h1>

	<h4>
		Compare Neon with the official <a href="https://www.npmjs.com/package/postgres" target="_blank">postgres</a> driver,
		Neon's ws-powered <a href="https://github.com/neondatabase/serverless" target="_blank">@neondatabase/serverless</a> β library,
		and <a href="https://aws.amazon.com/dynamodb/" target="_blank">DynamoDB</a> via Arc.
	</h4>

	<h2>Live Test</h2>

	<p><small>These timers are started <em>after</em> Lambda initialization and do not include "cold start".</small></p>

	<iframe src="/test" height="215"></iframe>

	<p><small>It's possiblt this ↑ iframe will exceed its 5s timeout. Try a refresh.</small></p>

	<p><small>
		<sup>1</sup> An initial query — <code>SELECT now()</code> — is made <em>in case</em> the Neon instance is suspended.
		That connection is closed and a new one is create for the subsequent query when the db is active.
	</small></p>

	<p><small>
		<sup>2</sup> Architect's <code>#tables()</code> method is used to discover the DynamoDB table name.
		This lookup is cached between requests and will be 0ms when the Lambda is "warm".
	</small></p>

	<hr />

	<h2>Conclusion</h2>

	<p><strong>Which db should I use?</strong> Like most things in web engineering, it depends.</p>

	<p><small>(Setting aside the fundamental difference of tables+rows and documents;
		even if that's probably the most important factor.)</small></p>

	<p><mark>Neon works surprisingly well</mark> in a "cloud function" like a Lambda!
		But at ~4s, its boot time can easily timeout a 5s Lambda.
		On the other hand, if it is already active, the ~150ms query with the @neondatabase/serverless package
		(<a href="https://neon.tech/blog/quicker-serverless-postgres" target="_blank">uses WebSocket instead of TCP</a>)
		is very fast.</p>

	<p>Still, using <mark>Arc + DynamoDB is the most consistent</mark> in terms of speed.
		At its best, a query can be just a few ms! And at its worst, that initial query will be < 300ms.
		It makes sense that AWS's baked in datastore would be very reliable when you need to access data quickly.</p>

	<h2>Considerations</h2>

	<p>This test runs on a vanilla Node.js v16 Lambda with the ARM64 architecture.
		The Neon team is focused on CloudFlare Workers and Vercel Edge runtimes — which differ from this environment quite a bit.</p>

	<p>Also, this test doesn't...</p>

	<ul>
		<li>test subsequent queries</li>
		<li>use a large dataset or a variety of operators</li>
		<li>consider AWS regions</li>
		<li>use the upcoming configurable auto-suspend feature from Neon</li>
		<li>consider pricing</li>
	</ul>

	<p><small><a href="https://github.com/tbeseda/arc-ddb-vs-neon" target="_blank">Source code</a></small></p>

	<script>
		const iframe = document.querySelector("iframe");
		iframe.onload = () => {
			window.body = iframe.contentWindow.document.body
			iframe.height = iframe.contentWindow.document.body.scrollHeight + 32;
			iframe.style.background = "none";
		};
	</script>
</body>
</html>
`,
	};
});
