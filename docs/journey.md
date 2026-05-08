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

## The Trajectory

<p data-mode="founder">Intern → 18 LPA Full-time → Lead → <strong>Senior Engineer at 28 LPA (22 fixed + 2 variable + 4 ESOPs)</strong>, in under three years. The ESOPs are the Founding Ownership signal — skin in the game, not just a salary line.</p>

## May 2024 — May 2026 · The Cloud Ownership & Tech Lead Era

> **Status: being written, on the go.** Long-form lands here as each chapter completes.

Headline material the long-form will cover:

- The mobile-backend migration (Python monolith → Node.js services).
- AWS Cloud Infrastructure & DevOps absorbed during a critical leadership transition.
- Stack-defining decisions: AWS ECS + Fargate over EC2; consolidating 3 servers + 50 — 60 Lambdas into 6 autoscaling services + 10 workers + 10 Lambdas.
- Zero-failure migration of all legacy users to the new architecture.
- Tenant isolation, RBAC, and database-layer audit logging — the SOC2 / HIPAA foundation.
- The AI-native engineering toolchain (Claude Code + custom Metabase MCP + AWS CLI) — RCAs cut from 2 — 3 hours to ~5 minutes.
- 90 → 1,500 customers, 1,000+ paying, $1M+ ARR.
- The Tech Lead role: Scheduling & Payments pod, RFC processes, code-review standards.
- Hiring & mentorship: 20+ technical interviews, Senior Buddy for 4+ engineers.

Until those land, the executive version lives in the [Résumé](../Deepesh_Rathod_Resume.pdf).
