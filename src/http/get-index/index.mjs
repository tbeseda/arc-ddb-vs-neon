import arc from "@architect/functions";

const { THIS_REGION } = process.env;

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
			gap: 1rem;
			max-width: 78ch;
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
		p:has(> small) {
			line-height: 1.25;
		}
	</style>
</head>
<body>
	<h1>
		Database Providers on
		<abbr title="AWS Lambda">λ</abbr> with
		<a href="https://arc.codes" target="_blank">Architect</a>
	</h1>

	<h4>
		Compare
		<a href="https://neon.tech" target="_blank">Neon</a>,
		<a href="https://supabase.com" target="_blank">Supabase</a>,
		and <a href="https://planetscale.com" target="_blank">PlanetScale</a>
		with <a href="https://aws.amazon.com/dynamodb/" target="_blank">DynamoDB</a>
		via Arc.
	</h4>

	<p>
		Use vanilla Node.js drivers like <code>postgres</code> and provided clients like <code>@neondatabase/serverless</code>.
		Tests account for "cold starts", wake time, and client connection negotiation.
	</p>

	<h2>Live Tests <small>(in <code>${THIS_REGION}</code>)</small></h2>

	<p><small>These timers are started <em>after</em> Lambda initialization and do not include Lambda cold start or client library loading (AWS's DynamoDB client is notoriously slow to load).</small></p>

	<p><small>It's possible one of these ↓ iframes will exceed its timeout. Try a refresh.</small></p>

	<h3>Neon.tech <small>(<code>us-west-2</code>)</small></h3>
	<iframe src="/test/neon" height="126"></iframe>
	<h3>Supabase <small>(<code>us-east-1</code>)</small></h3>
	<iframe src="/test/supabase" height="144"></iframe>
	<h3>PlanetScale <small>(<code>us-west-2</code>)</small></h3>
	<iframe src="/test/planetscale" height="104"></iframe>
	<h3>DynamoDB + @architect/functions <small>(<code>${THIS_REGION}</code>)</small></h3>
	<iframe src="/test/arc-tables" height="68"></iframe>

	<p><small>
		<sup>1</sup> An initial query — <code>SELECT now()</code> — is made <em>in case</em> the Neon instance is suspended.
		That connection is closed and a new one is create for the subsequent query when the db is active.
	</small></p>

	<p><small>
		<sup>2</sup> The <code>@supabase/supabase-js</code> package requires node-gyp to install.
		Since these Lambdas are built and deployed dynamically, this package cannot be built without further configuration of the build environment (another Lambda).
		Its speed is likely comparable to the REST query.
	</small></p>

	<hr />

	<h2>Conclusion</h2>

	<p><strong>Which db should I use?</strong> Like most things in web engineering, it depends.</p>

	<p><strong>First</strong>, set aside the fundamental difference of tables+rows and documents.
		Yes, that's a key factor when choosing a database, but this is a demonstration of speed.
	</p>

	<p><mark>Third party providers work surprisingly well</mark> in a "cloud function" like a Lambda!</p>

	<p>However, Neon's ~4s boot time is likely a deal-breaker for user-facing services.
		It's not only a bad user experience but it can easily timeout a 5s Lambda.
		Of course, if it is already active, the ~150ms query with the @neondatabase/serverless package
		(<a href="https://neon.tech/blog/quicker-serverless-postgres" target="_blank">uses WebSocket instead of TCP</a>)
		is quite fast.</p>

	<p>Supabase's REST API is also quite fast. Within regional differences between these Lambdas and their providers.</p>

	<p>PlanetScale's custom driver <code>@planetscale/database</code> is faster than the native MySQL Node.js driver.
		It's very competitive with Supabase REST and <code>@neondatabase/serverless</code>.</p>

	<p>Interestingly, using the native <code>postgres</code> and <code>mysql2</code> drivers can be both much slower and much faster than the provider clients.
		It is likely dependent on AWS region (both where this Lambda lives and where the database lives).
		With proper pooling configuration (not featured here as it's not a simple task), queries are likely to be more consistent.</p>

	<p><mark>DynamoDB via Architect is the most performant</mark> and consistent in terms of speed.
		At its best, a query can be just a few ms!
		(This does not account for loading the DynamoDB client into memory, which can be +-300ms, but is cached in "warm" Lambdas.)
		It makes sense that AWS's baked in datastore would be very reliable when you need to access data quickly.
		It does not make sense that their client be the slowest to load of the bunch.</p>

	<h2>Considerations</h2>

	<p>This test runs on a vanilla Node.js v18 Lambda with the ARM64 architecture.
		The Neon team is focused on CloudFlare Workers and Vercel Edge runtimes — which differ from this environment quite a bit.</p>

	<p>Also, this test doesn't...</p>

	<ul>
		<li>snapshot results or track variance</li>
		<li>test subsequent queries</li>
		<li>use a large dataset or a variety of db operations</li>
		<li>thoroughly test congruent AWS/db provider regions</li>
		<li>take into account pricing (examples are in service free tiers)</li>
	</ul>

	<p><small><a href="https://github.com/tbeseda/arc-ddb-vs-neon" target="_blank">Source code</a></small></p>

	<script>
		const iframes = document.querySelectorAll("iframe");
		for (const iframe of iframes) {
			iframe.onload = () => {
				window.body = iframe.contentWindow.document.body
				iframe.height = iframe.contentWindow.document.body.scrollHeight + 32;
				iframe.style.background = "none";
			};
		};
	</script>
</body>
</html>
`,
	};
});
