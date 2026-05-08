# The Engineering Odyssey (2020 — 2024)

> The compressed timeline. For the unvarnished version with the names,
> the arguments, and the weight gain, see the [Main Log](#journal).

## Phase 0 — The Awakening (COVID Era)

<p data-mode="human">Transitioned from "tutorial hell" to fundamental understanding.</p>

<p data-mode="engineer">First breakthrough: built a Node.js middleware server to bypass client-side API restrictions for a News App.</p>

<p data-mode="engineer">Built a complex MERN quiz app to master data modelling end-to-end.</p>

## Phase 1 — The Internship Sprint

<p data-mode="founder engineer"><strong>The SEO Automator:</strong> finished a one-month Selenium roadmap in one week.</p>

<p data-mode="engineer"><strong>The FFmpeg Challenge (2022):</strong> engineered a progress tracker for video processing before standardised wrappers existed. No sockets, no library — Python + Django + grit.</p>

<p data-mode="engineer"><strong>The AWS / Slack Poller:</strong> built a recursive polling engine in NestJS to monitor AWS events without a cron daemon.</p>

## Phase 2 — The TimelyAI Era (Growth & Scale)

<p data-mode="engineer"><strong>Scale:</strong> refactored a 7,000-line Flask monolith into a modular, secure architecture.</p>

<p data-mode="founder"><strong>Ownership:</strong> managed the entire website vertical as an intern.</p>

<p data-mode="engineer human"><strong>The SQL Milestone:</strong> mastered complex SQL on a Christmas Day deep-dive; later implemented DB triggers and audit logs after a production mistake. See <a href="#christmas-sql">Case Study: The Christmas SQL Call</a>.</p>

<p data-mode="founder engineer"><strong>Business Impact:</strong> shipped the "Website Suggestions" feature end-to-end. The work earned a salary hike and ESOPs — the moment "founding engineer" stopped being a label and started being a stake.</p>

<p data-mode="engineer founder"><strong>Operational:</strong> an internal audit caught a silent SMS-leg drop in the lead-delivery pipeline. I owned the fix end-to-end — built a Metabase visibility dashboard, ran reconciliation queries, sent missing leads by hand for seven days while RCA continued. See <a href="#175-lead-bug">Case Study: The 175-Lead Bug</a>.</p>

## Phase 3 — The Scheduling Engine (The "Founding" Year)

<p data-mode="engineer founder"><strong>Architected Scheduling v1:</strong> a standalone server with CI/CD, Datadog monitoring, and transaction-safe slot calculations.</p>

<p data-mode="founder engineer"><strong>Pragmatic Delivery:</strong> handled complex timezone logic in the backend so the mobile-app release stayed on track.</p>

<p data-mode="engineer founder"><strong>Resilience:</strong> proved system integrity via logs during an AWS billing-related outage. The system was correct. The invoice was not.</p>

## Phase 4 — The Thunderstorm (Jan — May 2024)

### Jan — Feb 2024 · The Ghost Sprint

<p data-mode="founder human">The existing brand identity hit a legal and compliance dead-wall. Public launch under that name was off the table. Leadership made the call: a <strong>stealth pivot to a new entity</strong> (kept unnamed here on purpose) — a clean rebrand on paper, a total 0-to-1 rebuild in practice.</p>

<p data-mode="engineer founder">No imports. Legal-tainted assets stayed where they were. We manually cloned and re-engineered the mobile app, the websites, the onboarding flows — every line, two months, from scratch.</p>

<p data-mode="engineer"><strong>The Foundation:</strong> I built the new Node.js server from the ground up. It was the first time Shambhav (Founder) jumped back into the codebase alongside Vishal — two people who hadn't shipped production code in a while, plugging in next to a team that had to ship a company in 8 weeks.</p>

<p data-mode="founder engineer"><strong>The DevEx Breakthrough:</strong> the proudest moment wasn't a feature — it was onboarding. The README, the utils, the conventions were organized so tightly that Shambhav started up with zero friction. His exact words: <strong>"README was more than enough."</strong> A founder reading a doc and shipping the same day is the highest compliment a server foundation can get.</p>

<p data-mode="engineer"><strong>The Guardrails:</strong> pre-commit hooks barred the obvious mistakes — bad imports, missing types, broken contracts. 10+ engineers moved at breakneck speed without breaking the core. The hooks did the babysitting so the humans could ship.</p>

<p data-mode="founder engineer"><strong>The Investor Demo:</strong> owned the complete onboarding backend. All-nighters. The demo had to be flawless, and it was.</p>

<p data-mode="human">A close friend moved from Trivandrum to Bangalore that month. Same city. Didn't see him for 30+ days. The pivot took 100% of bandwidth — there was no surplus.</p>

<p data-mode="founder engineer"><strong>The Epilogue:</strong> the new entity shut down after 2 months. Further legal hurdles, outside engineering's reach. But the foundation I'd set — the Node.js server, the DevEx, the hooks — became the <strong>gold standard</strong> for every project that followed. The brand died; the architecture didn't. See <a href="#ghost-sprint">Case Study: The Ghost Sprint</a>.</p>

### March 2024 · The Media Migration & Senior Evolution

<p data-mode="engineer"><strong>The High Stakes:</strong> 150GB of high-value user media had to move from S3 Mumbai to US-East-1. Out of a 900GB pool, the 150GB was the irreplaceable core — generated content, GBP-attached assets, brand-defining imagery. Cross-region. No managed migration tool fit the constraints.</p>

<p data-mode="engineer"><strong>Input → Process → Data → Output:</strong> <em>Input</em> — a list of S3 keys in Mumbai. <em>Process</em> — a local script issuing concurrent transfers, logging every success, hashing every byte. <em>Data Context</em> — a persistent log file as the source of truth for "what survived the last crash." <em>Output</em> — the same 150GB, byte-perfect, in US-East-1.</p>

<p data-mode="engineer human"><strong>The Struggle:</strong> 30-hour runtimes on a local machine. The script crashed twice. I felt sad, then depressed — until Shambhav used "negative motivation" to pump me back up. Kuch logo ke liye yeh kaam karta hai. Mere liye kar gaya.</p>

<p data-mode="engineer"><strong>The "Grit" Script:</strong></p>

<ul>
<li><code>caffeinate</code> — mastered the macOS no-sleep utility so a closed lid wouldn't kill a 30-hour run.</li>
<li><strong>Pause/Resume Logic:</strong> the persistent log was the resume key. After a crash, the script picked up from the last successful entry — never re-uploaded, never skipped.</li>
<li><strong>Local QC Pipeline:</strong> a validation layer ran <em>before</em> a batch was marked complete. Byte-level integrity. No batch graduated until QC was green.</li>
</ul>

<p data-mode="engineer founder"><strong>Result:</strong> 150GB migrated with <strong>0% data loss</strong>. The full 900GB pool was reachable; the script could have walked the rest on demand. See <a href="#media-migration">Case Study: The 150GB Migration</a>.</p>

<p data-mode="engineer"><strong>The WebSocket / Observability Pivot:</strong> Google Business Profile's "3-Pack" search ranking rewards profiles that stay active. Burst-uploading 50 photos at once triggered the opposite signal. I engineered a drip-feed pipeline — batched media, paced releases, profiles stayed alive.</p>

<p data-mode="engineer"><strong>Real-Time Visibility:</strong> WebSockets into the Node server. Users and internal teams got 100% visibility on the chain — Upload → Resize → SQS → Lambda → GBP / Website Live. Every step observable, every failure attributable.</p>

<p data-mode="engineer"><strong>Performance:</strong> SQS-backed Lambdas re-architected to process <strong>50+ media items in under 30 seconds</strong>. The bottleneck moved off our infrastructure and onto the downstream APIs — exactly where it should sit.</p>

<p data-mode="founder human"><strong>Junior Collaboration:</strong> worked closely with Animesh (Junior FE) on the user-facing side. His fresh ideas on UX and problem-shape made it into the final ship. The best feedback in a code review is when the senior keeps the junior's instinct.</p>

<p data-mode="founder human"><strong>The Senior Stamp:</strong> the CEO raised me to <strong>28 LPA CTC (22 fixed + 2 variable + 4 more ESOPs)</strong>. The ESOP top-up was the signal — ownership was being doubled down on, not just compensated.</p>

<p data-mode="human"><strong>The Balance:</strong> started trekking around Bangalore on weekends with the friend from Trivandrum. The hustle finally became sustainable. You can't migrate 150GB twice in a row without learning to log off.</p>

## Phase 5 — The Full-Stack Builder Era (May 2024 — Present)

### The Strategic Baton

<p data-mode="founder human">The mentors left in sequence. Vishal, Vinay, Ruddhi — gone. The Original Clan dissolved around me, and I was the last one standing in the room. "Orphaned" is the honest word. The people who taught me how the system thinks were no longer in the building.</p>

<p data-mode="founder human">The exit door was right there. I didn't take it. The Pune trip earlier in the year had already settled the question — I told Robin and Ashish I wasn't someone who leaves when everything is breaking. The baton wasn't handed to me; it landed at my feet. I picked it up.</p>

<p data-mode="founder">Cloud, Infra, DevOps — three domains the departing seniors used to own. I inherited all of them. Not because I was ready, but because nobody else in the room had the tenure to absorb them.</p>

### Strategic Selfishness

<p data-mode="founder engineer">Vishal and Ruddhi, on the way out, hired Pravesh and Sahil specifically to unburden me. Two juniors, one explicit purpose: give Deepesh breathing room. The kind gesture had a quiet test embedded in it — what would I do with the slack?</p>

<p data-mode="founder engineer">I could have stayed in my lane. I chose to expand it instead. Strategic selfishness — I redirected every spare cycle into a deliberate pivot from "Lead Dev" to <strong>Full-Stack Builder</strong>. Owning the entire lifecycle: <strong>Develop → Deploy → Monitor → Cost Manage</strong>. Not just the code shipping out, but the cloud bill landing at the end of the month.</p>

<p data-mode="founder">The breathing room wasn't a vacation. It was a runway.</p>

### The Infrastructure Takeover

<p data-mode="engineer founder"><strong>Input:</strong> CI/CD pipelines that someone else used to babysit, AWS Lambda orchestration with 50+ functions, ECS/Fargate clusters that scaled by faith more than by plan. <strong>Process:</strong> learn each surface in production, document the failure modes, take ownership one runbook at a time. <strong>Output:</strong> a single engineer who could deploy, observe, and pay for the whole stack.</p>

<p data-mode="engineer founder"><strong>Cost Observability:</strong> the customer base was about to walk from 90 tenants to 1,500. "Make it work" stopped being the bar — "make it efficient" became the contract. I owned cloud costing as a first-class metric. Every Lambda concurrency setting, every ECS task size, every S3 lifecycle policy got audited. Scaling the customer base shouldn't scale the AWS invoice 17×.</p>

<p data-mode="engineer">The shift from Coder to Operator. Code merged is half the job; code that runs cheaply at 1,500-tenant scale is the other half.</p>

### The "Zero-Failure" Fallback Protocol

<p data-mode="engineer founder"><strong>The Challenge:</strong> migrate the mobile-app backend from a legacy Flask monolith to a clean Node.js service. Without a single user-facing error. The mobile app had no graceful failure UX for "API rewrite week."</p>

<p data-mode="engineer"><strong>The Logic:</strong> engineered a fallback in the app itself. Every request hit the new Node API first. If the Node call failed or timed out — for any reason, for any duration — the app silently re-issued the same call against the legacy Flask server. Two backends, one client, zero awareness on the user's side.</p>

<p data-mode="engineer"><strong>The Tradeoff:</strong> determinism over speed. Response times occasionally fluctuated during the cutover — a fallback round-trip costs latency. Users never hit a dead wall. The system stayed 100% deterministic across the entire migration window. Cross-reference: <a href="#flask-to-node">Case Study: The Fallback Protocol</a>.</p>

### SQL Optimization — 15m to 75s

<p data-mode="engineer"><strong>The Bottleneck:</strong> campaign analytics and funnel queries were timing out on AWS Lambda. 15 minutes plus. Lambda's hard ceiling was the only thing stopping them from running longer. 70+ internal users were waiting on dashboards that never finished loading.</p>

<p data-mode="engineer"><strong>The AI-Native Research:</strong> deep-dived with GPT-4 on indexing strategy, Common Table Expressions, complex multi-join shapes, query planner behaviour. Treated the LLM as a reading partner — not a code-generator. The goal was to internalise <em>why</em> a query was slow, not to copy-paste a fix.</p>

<p data-mode="engineer"><strong>The Impact:</strong> 15m+ → <strong>1m 15s</strong>. Resolved DB deadlocks that had been hiding behind the timeout. Stabilised the campaign pipeline for 70+ internal users — analytics that used to fail now refreshed before the coffee got cold. Cross-reference: <a href="#sql-optimization">Case Study: 15m to 75s</a>.</p>

### Social Media Content Pipeline

<p data-mode="engineer founder"><strong>The Build:</strong> co-designed the Content Creation → Posting pipeline with Pravesh. His first major surface; my chance to mentor through a real production system instead of a side-task.</p>

<p data-mode="engineer">Architected the OAuth flows for Meta — Facebook + Instagram — with token refresh, scope handling, and the failure-mode catalogue OAuth always demands. Built a <strong>generic content-calendar system</strong> on top of that surface — calendar primitives that any future channel could plug into without re-doing the auth dance.</p>

<p data-mode="founder engineer">That generic calendar powered the initial launch. Pravesh shipped the first verticals; the system held. See Blueprints for the architecture diagrams.</p>

### Human Documentation

<p data-mode="founder human">By the end of this stretch, the title on the badge had stopped mattering. What I'd actually become was <strong>Human Documentation</strong> — the engineer who knew every corner of the tech, the product, and the cloud. The tenant routing in the database. The IAM policies on the Lambdas. The reason a specific cron ran at 3:07 instead of 3:00.</p>

<p data-mode="founder human">Useful. Also dangerous. A company where one person is the documentation is a company with a single point of failure wearing a name tag.</p>

### AI-Native Handover

<p data-mode="founder engineer">The strategic move now: <strong>document everything.</strong> Architecture Decision Records, blueprints, runbooks, the portfolio you are reading. Transfer the knowledge out of one head and into a corpus that an AI agent — or the next engineer, or the engineer after that — can consume on day one.</p>

<p data-mode="founder">The thesis: <em>"My knowledge isn't a moat. The way I document my knowledge is."</em> A moat is a wall. Documentation is a road. Roads scale; walls trap.</p>

<p data-mode="founder engineer">The AI-native toolchain — Claude Code, a custom Metabase MCP, the AWS CLI woven in — is the consumer of that documentation. RCAs that used to take 2 — 3 hours now resolve in ~5 minutes when the agent has the runbooks to read. The portfolio itself is part of this system. Every section you read is a node an agent can query tomorrow without asking me a question today.</p>

<p data-mode="founder">The company becomes AI-autonomous. My knowledge stops being a bottleneck. That is the work.</p>

## Phase 6 — The Funding & Swarm Era (August 2024 onwards)

### The Real Test of the Oath

<p data-mode="founder human">Within a single window, the Original Clan walked. Vishal, Vinay, Ruddhi — gone in sequence, gone close enough together that the calendar barely had room to breathe between exits. The vacuum wasn't theoretical. The people I asked when I didn't know, the people who used to catch the falling object before it hit the floor — none of them were on Slack anymore. "Orphaned" earned its quotation marks.</p>

<p data-mode="human">The <a href="#pune-trip">Pune trip earlier in the year</a> had already settled the philosophy. The oath I'd given Robin and Ashish over that conversation — <em>"I am not someone who leaves when everything is breaking"</em> — had been a sentence at the time. A clean line spoken in a quieter month. Now the building was actively breaking and the oath had to either become a load-bearing decision or expose itself as a slogan.</p>

<p data-mode="founder">I stayed. Not as a gesture, not as loyalty theatre — as a structural choice. The exit door was right there, the market was hiring, and the rational move on a spreadsheet was to leave. The oath stopped being a sentence the day I noticed I wasn't reading the spreadsheet.</p>

### The Cynical Architect Arc

<p data-mode="engineer founder"><strong>The doctrine that crystallised here:</strong> <em>I used to be the guy who failed SQL queries and crashed migration scripts. That trauma turned me cynical.</em> Cynical in the engineering sense — not the human one. The optimist builds the happy path and writes "// TODO: handle errors" where the chaos belongs. The cynic builds the failure path first and lets the success path emerge as the absence of failure.</p>

<p data-mode="engineer">SQS recovery before the producer is written. Real-time dashboards before the deploy is announced. Deterministic fallbacks before the new endpoint is wired in. Hope is not an architecture pattern. Every system I touch from this point forward assumes a crash, a timeout, a partial write, a lost message — and recovers from each one without a human in the loop. This is the doctrine <a href="#adr-0010">ADR-0010</a> records. Not a stylistic preference — a religion built out of two years of getting burned.</p>

### The Arrow and the Shield

<p data-mode="founder">When the funding battle started, the team had to split clean. Pravesh and I became the <strong>Arrow</strong> — the attack team, head-down on the funding demo, building the thing that didn't exist yet. Durga and Sahil became the <strong>Shield</strong> — protecting the 600+ existing users, shipping the roadmap features that couldn't slip, holding the production line while the Arrow tried to bend reality.</p>

<p data-mode="founder">Naming the dynamic was half the win. Once the room had the words "Arrow" and "Shield," nobody asked who was on point for what. No daily reshuffling, no ambiguous ownership, no "I thought you were handling that." Two postures, four people, zero confusion. The org chart was a sentence.</p>

### The 11 AM to 2 PM Battle

<p data-mode="founder human">The CEO was in the US — 12 hours behind, or 12 hours ahead, depending which side of the day you measured from. He woke up at 11 AM IST. He demanded a demo by 2 PM IST. Three hours, every day, to ship the iteration he'd asked for the previous evening.</p>

<p data-mode="founder">$6M on the line. Investors watching. Three-hour feedback loops, day after day, week after week. The cadence wasn't a sprint — sprints have an end date. This was the metabolism of the company for that stretch. You stopped counting days and started counting demos.</p>

### The Streamlit Makeshift Sprint

<p data-mode="founder engineer">We built a raw, data-backed frontend in <strong>Streamlit</strong> to prove the "Revenue Opportunity" engine. Not pretty. Not productionised. Not even hosted on the real domain. <em>Makeshift was the point.</em> The investor demo needed to show that the data underneath was real — not that the pixels on top were polished.</p>

<p data-mode="engineer">Under the hood: scraped StyleSeat and Booksy for competitor catalogs in the tenant's geography. Analysed city-wide trending keywords via LLM passes — what services were spiking in this ZIP code, what wasn't being offered, what was underpriced. Audited the tenant's own service catalog for pricing gaps against the trend. The Streamlit shell was a window into a real engine. Cross-ref: <a href="#product-growth">product-growth note on the Revenue Opportunity engine</a>.</p>

### The Lambda Swarm

<p data-mode="engineer founder"><strong>The bottleneck:</strong> the background Python script that generated the insights took <strong>2 hours</strong> to run for a single tenant. Investors needed a live demo in <strong>5 minutes</strong>. A 24× speed-up wasn't an optimisation problem — it was an architecture problem.</p>

<p data-mode="engineer"><strong>The architecture:</strong> a "Swarm" of AWS Lambdas — dozens of small, parallel workers each owning a slice of the analysis (one keyword cluster, one competitor scrape, one pricing audit) — orchestrated by a hierarchy of <strong>AWS Step Functions</strong>. Map states fanning out, parallel branches converging, sub-orchestrators feeding a Master Orchestrator at the top. Distributed by design, not by accident.</p>

<p data-mode="engineer human"><strong>The dead-end:</strong> the Master Orchestrator's state-management logic broke me. Step Functions' execution context, the way state propagates across nested map states, the way errors bubble — I hit a wall I couldn't read my way out of in the time I had. Documentation was thin; Stack Overflow was thinner.</p>

<p data-mode="engineer"><strong>The unlock:</strong> turned to the newly-launched Claude. Pasted the topology, the constraints, the failing state transitions. Claude solved the state logic. The swarm shipped. <strong>2 hours → 5 minutes.</strong> The first time an LLM was a peer architect on a load-bearing system, not a research partner. Cross-link: <a href="#lambda-swarm">Case Study: The $6M Lambda Swarm</a>.</p>

### The $6M Validation

<p data-mode="founder">Funding closed. $6M. The engineering strategy — the cynical architecture, the Arrow/Shield split, the swarm itself — got market validation in the most expensive feedback loop available. The investors weren't buying a deck. They were buying a system that ran.</p>

### The Zoca Unified Migration — Zero Downtime

<p data-mode="engineer founder"><strong>The mission:</strong> move 480+ users to a new unified Service Management system — Categories, Services, Variations as a coherent three-tier model instead of the flat, drift-prone schema underneath. Live tenants. Active bookings. Revenue flowing through the tables we were rewriting.</p>

<p data-mode="engineer"><strong>The result:</strong> <strong>0 failures. 0 production downtime.</strong> The website team didn't have to change a single line of code — the migration shape preserved the read contracts the website depended on, so their deploys kept landing while their data layer got rebuilt under their feet. Cross-link: <a href="#zoca-unified-migration">Case Study: The Zoca Unified Migration</a>.</p>

### Featured Resilience — Flask-to-Node + SQL Optimisation

<p data-mode="engineer">The two case studies already in the archive — the <strong>Flask-to-Node Fallback Protocol</strong> and the <strong>SQL Optimisation 15m → 75s</strong> — graduated in this era from "interesting wins" to <em>gold standard</em>. The Fallback Protocol became the zero-downtime migration template every subsequent rewrite cribbed from. The SQL work became the high-concurrency performance proof we pointed at when the question was "can the platform hold at scale." Cross-links: <a href="#flask-to-node">Case Study 05</a>, <a href="#sql-optimization">Case Study 06</a>.</p>

### Building For AI-Autonomous Documentation

<p data-mode="founder engineer">Current focus: every doc, ADR, blueprint, and runbook in this site is being shaped to be <strong>RAG-ready</strong>. Markdown, semantic headings, stable anchors, source-cited claims, named entities, explicit cross-links. Not pretty for humans first — parseable for agents first, and accidentally clearer for humans as a side-effect.</p>

<p data-mode="founder">The thesis: a company whose knowledge sits in markdown an agent can ingest is a company that can run when its senior engineer takes a break. Human Documentation was the diagnosis; AI-autonomous documentation is the cure. The portfolio you're reading is the same corpus the on-call agent will read tomorrow morning.</p>

### The Predecessor Audit and the Emergence of Zoca

<p data-mode="founder">The legal audit of the predecessor identity and the emergence of Zoca — a battle-tested, VC-funded engineering identity. The brand on the cap-table changed. The system underneath didn't blink.</p>

## The Trajectory

<p data-mode="founder">Intern → 18 LPA Full-time → Lead → Senior Engineer (28 LPA: 22 Fixed + 2 Variable + 4 more ESOPs in successive grants) → <strong>Staff Engineer / Founding Engineer</strong>. The title is downstream of the work. Each ESOP grant is a renewed bet — not a salary line, a stake.</p>

## Next chapter

> **Status: ongoing.** The Funding & Swarm Era is the present-tense.
> The next entries land here as they happen. The structured executive
> view stays in the [Résumé](../Deepesh_Rathod_Resume.pdf).
