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
		<abbr title="AWS Lambda">λ</abbr>
	</h1>

	<h4>
		Compare
		<a href="https://neon.tech" target="_blank">Neon</a>,
		<a href="https://supabase.com" target="_blank">Supabase</a>,
		<a href="https://planetscale.com" target="_blank">PlanetScale</a>,
		<a href="https://mongodb.com" target="_blank">MongoDB</a>,
		and <a href="https://aws.amazon.com/dynamodb/" target="_blank">DynamoDB</a>
		via <a href="https://arc.codes/docs/en/reference/runtime-helpers/node.js" target="_blank">Arc</a>.
	</h4>

	<p>
		Use vanilla Node.js drivers like <code>postgres</code> and provided clients like <code>@neondatabase/serverless</code>.
		Tests account for provider "cold starts" and client connection negotiation - connect and disconnect.
	</p>

	<h2>Live Tests <small>(<code>${THIS_REGION}</code>)</small></h2>

	<p>Each test runs on a separate vanilla Node.js v18 Lambda with the ARM64 architecture.
		These timers are started <em>after</em> Lambda initialization and do not include Lambda cold start or client library loading.</p>

	<p><small>It's possible one of these ↓ iframes will exceed its timeout. Try a refresh.</small></p>

	<h3>Neon.tech <small>(<code>us-west-2</code>)</small></h3>
	<iframe src="/test/neon" height="126"></iframe>
	<h3>Supabase <small>(<code>us-east-1</code>)</small></h3>
	<iframe src="/test/supabase" height="144"></iframe>
	<h3>PlanetScale <small>(<code>us-west-2</code>)</small></h3>
	<iframe src="/test/planetscale" height="104"></iframe>
	<h3>MongoDB <small>(<code>us-east-1</code>)</small></h3>
	<iframe src="/test/mongodb" height="68"></iframe>
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

	<h2>Considerations</h2>

	<p>These tests do not...</p>

	<ul>
		<li>attempt to pool or keep-alive connections</li>
		<li>snapshot results or track variance over time</li>
		<li>test subsequent queries</li>
		<li>use a large dataset or a variety of db operations</li>
		<li>thoroughly consider resource regions</li>
	</ul>

	<p><small><a href="https://github.com/tbeseda/dbaas-lambda" target="_blank">Source code</a></small></p>

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
