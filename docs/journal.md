# The Main Log: Raw Memories & Grit

> The unvarnished archive. Names, dates, weight gain, arguments, and the
> exact moment I learned each lesson. Treated as the source of truth for
> every other doc on this site.

## The COVID "Humble Pie" (2020 — 2021)

<p data-mode="human">I was super overconfident after a Selenium / React YouTube course. Applied for internships and failed badly. The pivot came when I realised YouTube cloning isn't engineering. I started learning hooks, API calling, and component creation from scratch — no tutorial scaffolding.</p>

<p data-mode="engineer human">First real <em>aha</em>: the News API wouldn't work in production because the browser blocked the call. I built a Node + Express middleware server to bypass it. <strong>I was very proud of myself.</strong> That tiny middleware was the first time I crossed from "follower of tutorials" to "writer of systems."</p>

## The "Automation & Intuition" Era (2022)

<p data-mode="human founder">Interview at a maps company: asked to count Google Maps listings live. I tried <code>Ctrl+F</code> in the wrong window — Browser instead of Inspector. I didn't get the count. I got the offer. The interviewer said the problem-solving logic was the point.</p>

<p data-mode="engineer">January 2022 — the FFmpeg nightmare. No web sockets on the server, and I had to track FFmpeg progress in Python / Django before any standardised wrapper existed. It was really very hard to figure out. <strong>But I delivered.</strong></p>

<p data-mode="founder human">The high-agency all-nighter: I lemmatised SEO keywords by hand in Google Sheets all night to prove a hunch the team had dismissed. 80% accuracy on the manual pass. Result: I moved to Bangalore in November 2022.</p>

## The TimelyAI / Zoca "Golden Era" (2023)

<p data-mode="human">The 16-hour grind: 45-minute commute from Hoodi to Koramangala. I loved the ride. Eventually moved to a PG five minutes from the office. PG meant just a bed to sleep — the office was where I lived.</p>

### The Christmas SQL Call

<p data-mode="engineer human">December 25, 2022. A 1.5-hour call with a senior teammate in Kolkata. His friends were shouting at him in the background to come out for the holiday. He made me write the query anyway, line by line, until I understood JOINs, window functions, and CTEs the way you understand a sentence — not the way you understand a syntax. <strong>After that day, I never went back to ask for a query.</strong></p>

### The DB Tragedy & Justice

<p data-mode="engineer human">I deleted a row. I was sad and afraid. The reply that came back was: <strong>"Innocence is allowed, ignorance is not."</strong> I built DB triggers and a log table that captured <code>OLD.*</code>, the actor, and the timestamp on every destructive operation against core tables. Zero data has been silently lost since.</p>

### Telling Leadership No

<p data-mode="founder human">I bluntly told leadership that I had more important work than the meeting they'd called. They loved it. That single moment recalibrated how I treat hierarchy: respect the title, optimise for the work.</p>

### The Growth Peak

<p data-mode="founder">Lunch at ITC Gardenia, mid-growth season. The thought I couldn't shake: <em>"Yaar, dar lag rha hai… pipeline niche na gir jau."</em> — I'm scared the pipeline drops below where we've taken it. The fear was the leading indicator that we were doing real work.</p>

### The "Lead Masking" Hack

<p data-mode="founder engineer">I experimented with masking leads for unpaid users — show enough to prove value, hide enough to demand a card. Won back a churned customer the same week. <strong>Happiest moment.</strong></p>

## The Scheduling v1 Era & The Elephant (Late 2023)

<p data-mode="engineer founder">Built Scheduling v1 from scratch. Transactions, slot integrity, AWS Secrets Manager, pre-bootup pipelines, Datadog dashboards. The whole vertical, end to end.</p>

<p data-mode="human">The physical cost: I lived on burger combos for three months. Weight rose to 100 kg. I was loving the adrenaline.</p>

<p data-mode="engineer human">The "false alarm" call: I was home for Navaratri. A late-night call came in screaming that scheduling was broken. I spent the night debugging only to find the root cause was a pending AWS payment. The system was fine. The invoice was not.</p>

<p data-mode="founder human">The conflict that defined the role: a harsh argument about product movement. The other side said the blockers were elsewhere. I said: <strong>"If it's the blocker, move it yourself."</strong> So I did.</p>

## The Thunderstorm (Jan — May 2024)

### The Legal Thunderstorm

<p data-mode="founder human">January 2024. The existing identity hit a legal and compliance dead-wall. Trademark, brand, public-facing surface — all of it suddenly couldn't go out the door. The product was alive. The name was not.</p>

<p data-mode="founder human">For about a week, every "let's just ship" instinct I had broke against the same sentence: <em>we cannot go public with this identity.</em> No appeal, no workaround, no clever rename of a folder. The thing we'd built our 2023 around had to be put behind glass.</p>

### The Stealth Pivot — 0 to 1 in Two Months

<p data-mode="founder engineer">We pivoted to a <strong>new entity</strong> (kept unnamed here on purpose). Not a rebrand. A 0-to-1 rebuild. Mobile app, websites, onboarding flows — all of it manually re-engineered, because anything legal-tainted couldn't be imported, copy-pasted, or even referenced. Clean room. Two months.</p>

<p data-mode="founder engineer">Every shortcut you take in a normal sprint — "just lift this util", "we already have an auth flow" — was off the table. We were typing it out again, with new names, new boundaries, new repos. The pace was insane. I remember thinking: <em>this is what 0-to-1 actually feels like, not the LinkedIn version.</em></p>

### The Node.js Foundation

<p data-mode="engineer founder">I built the new Node.js server foundation from the first commit. Folder structure, conventions, env loading, error contracts, the whole skeleton. This was the first time in a long while that <strong>Shambhav (Founder)</strong> jumped back into the codebase himself, alongside <strong>Vishal</strong>.</p>

<p data-mode="engineer founder">It changed the gravity of the work. Founders writing routes next to you means every shortcut you take is a shortcut they'll inherit. I over-invested in the bones on purpose — naming, layering, where business logic was allowed to live — because I knew Shambhav and Vishal were going to be in there at 1 AM, and I didn't want them losing time decoding my cleverness.</p>

### "README Was More Than Enough"

<p data-mode="engineer founder">My proudest DevEx moment from that period: Shambhav cloned the repo, ran through setup, started shipping. Later he told me, plainly, <strong><em>"README was more than enough."</em></strong> No DM, no "hey how do I run this", no Slack thread. He just <em>started</em>.</p>

<p data-mode="engineer founder">Underneath that line was a stack of small disciplines: pre-commit hooks that barred the obvious mistakes, a utils layer that didn't make you guess, scripts that named themselves after what they did. 10+ engineers were moving at breakneck speed and the core didn't crack. The README wasn't a document — it was a guardrail.</p>

### The Investor Demo

<p data-mode="founder human">I owned the complete onboarding backend for the investor demo. End to end — the flow a new business would touch in their first thirty seconds with the new entity. All-nighters, dry-runs, paranoia checks at 3 AM on the staging environment.</p>

<p data-mode="founder human">The demo was flawless. No fallback slides, no "let's pretend this part works" — the actual product, running. That night I understood that "investor demo" is just a polite name for <em>your code, on stage, with money in the room</em>.</p>

### The Trivandrum Friend

<p data-mode="human">A close friend moved from Trivandrum to Bangalore right in the middle of all this. Same city. I didn't see him for a month.</p>

<p data-mode="human">Not because I didn't care — because the pivot took 100% of my bandwidth and there was nothing left over. He understood. I still feel it. The gravity of a real 0-to-1 doesn't ask you politely for your time; it takes it.</p>

### The Epilogue — Gold Standard

<p data-mode="founder engineer">After two months, the new entity shut down. Further legal hurdles, deeper than the first wall. The brand didn't survive.</p>

<p data-mode="founder engineer">The engineering foundation did. The Node.js skeleton, the README discipline, the pre-commit guardrails, the onboarding backend shape — all of it became the <strong>gold standard</strong> for every project that followed at Zoca. The brand died. The bones it left behind built the next two years.</p>

### The 150GB Migration — March 2024

<p data-mode="engineer human"><strong>The high stakes:</strong> 150GB of high-value user media to move from S3 (Mumbai) to US-East-1. Real customer assets — photos a salon owner had taken of their work, the kind of files where "we lost a few" is not a sentence you ever want to say.</p>

<p data-mode="engineer human">I built a local script. 30-hour runtime end to end. It crashed twice. Both times deep into the run, both times after I'd watched the progress logs scroll past for hours. <strong>I felt sad and depressed.</strong> Not the dramatic kind — the dull kind, where you stare at the terminal and don't want to relaunch it.</p>

<p data-mode="founder human">Shambhav pulled me back up with what he calls <em>negative motivation</em> — the sharp, unsentimental kind that doesn't pat your head, just points at the work and says <em>get back in</em>. It worked. I got back in.</p>

### The "Grit" Script — caffeinate, pause, resume

<p data-mode="engineer">Round two, I rebuilt the script with grit baked in. macOS <code>caffeinate</code> wrapping the whole run so the OS couldn't sleep mid-transfer. Pause/play logic that resumed from the last successful log entry after a crash — no re-doing 18 hours of work to recover the next two.</p>

<p data-mode="engineer">A local QC pipeline ran behind the transfer: byte-level integrity check on every batch before it was marked complete. If the bytes didn't match, the batch went back into the queue. The core 150GB landed in US-East-1 with <strong>0% data loss</strong>. Out of the larger 900GB pool, the user-facing assets — the ones that actually mattered — were perfect.</p>

### The WebSocket Observability Pivot

<p data-mode="engineer founder">The GBP "3-Pack" ranking rewards profiles that stay active. Burst-uploading 50 photos at once made us look like a bot. So we re-architected: a <strong>drip-feed</strong> pipeline that staggered media uploads to keep profiles steadily alive.</p>

<p data-mode="engineer founder">Then I wired WebSockets through the Node server so users and internal teams had real-time visibility on the whole chain — <code>Upload → Resize → SQS → Lambda → GBP/Website Live</code>. No more "did it work?" support tickets. The SQS-backed Lambdas were tuned to push <strong>50+ media items live in under 30 seconds</strong>. Observability stopped being a dashboard and became a feeling: you could watch your work go live.</p>

### The Junior — Animesh

<p data-mode="human founder">I worked closely with <strong>Animesh</strong> (Junior FE) through this stretch. What I loved was that he didn't defer — he came in with fresh ideas on problem-solving, the kind a senior stops seeing because they've stopped looking.</p>

<p data-mode="human founder">I integrated his ideas into the final ship, by name and by credit. The lesson stuck: a junior who feels safe enough to push back is worth more than five who nod.</p>

### The Senior Stamp — 28L CTC

<p data-mode="founder human">After the migration and the WebSocket ship, the CEO raised me to <strong>28L CTC — 22 Fixed + 2 Variable + 4 ESOPs</strong>. The number mattered. The composition mattered more.</p>

<p data-mode="founder human">The ESOPs weren't a perk. They were the founding-ownership signal — the company telling me, in the only language a cap table speaks, that I was no longer just an employee on this build. I was on the inside of it.</p>

### The Pune Clarity Trip & The Stabilization Oath

<p data-mode="human">Early 2024. Mentors had begun leaving — one by one, the people I'd built around were stepping out the door. The legal Thunderstorm was at full pitch. The new entity was already on its way to shutdown. I was at my lowest. Not dramatic-lowest — quiet-lowest, the kind where you stop being sure why you're still in the room.</p>

<p data-mode="human">I booked a flight. Two days in Pune. Strategic, not a vacation — I needed distance from Bangalore, from the Slack threads, from the war room. Two days away from the noise and the answer arrived without me hunting for it. That personal clarity changed everything.</p>

<p data-mode="founder human">I came back and walked into the room with <strong>Robin</strong> and <strong>Ashish</strong>. No build-up, no soft opening. I told them, directly: <strong>"I am not someone who leaves when everything is breaking."</strong></p>

<p data-mode="founder">That sentence was the oath. I committed — to them and to myself — to stabilise the system and see the transition through before I let myself even <em>think</em> about an exit. The decision was made there, in that room, in early 2024. Everything in the Builder era that came after — the DevOps takeover, the documentation work, the team scaling — was downstream of that one promise. The oath came first. The work came second.</p>

### Bangalore Treks — Sustainable Hustle

<p data-mode="human">The 100kg, three-months-of-burger-combos version of me from late 2023 was behind me. I started trekking around Bangalore on weekends with the friend from Trivandrum — the same one I hadn't seen for a month during the Ghost Sprint.</p>

<p data-mode="human">Nothing extreme. Skandagiri, Savandurga, the Nandi side trails. What changed wasn't the distance. It was the realisation that the hustle didn't have to eat the body to be real. The grind became <em>sustainable</em>. That word, for the first time, started meaning something.</p>

## The Full-Stack Builder Era (Mid-2024 — Present)

### The Strategic Baton

<p data-mode="founder human">Through mid-2024, the mentors left. <strong>Vishal</strong>. <strong>Vinay</strong>. <strong>Ruddhi</strong>. Not all at once, not dramatically — but the cumulative effect was that the people who had built the original engineering culture with me were no longer in the building. I was the last of the Original Clan.</p>

<p data-mode="human">There's no clean word for that feeling, but the closest one is <em>orphaned</em>. The people who had taught me how this place thought — gone. The people who had argued with me about architecture at midnight — gone. The room got quieter. The weight on the remaining chair got heavier.</p>

<p data-mode="founder human">The easy move would have been to follow them out. The market was hot, my résumé was loud, and "everyone's leaving" is the cleanest cover any engineer ever gets to walk under. I didn't. The Pune oath had already been spoken, and I'd told Robin and Ashish I was not someone who leaves when everything is breaking. The emotional cost of staying was real. I paid it anyway.</p>

### Strategic Selfishness

<p data-mode="founder">Vishal and Ruddhi, on their way out, did something I still think about: they hired <strong>Pravesh</strong> and <strong>Sahil</strong> as juniors specifically to unburden me. They could have just left. Instead they staffed the gap before stepping through it. That was the breathing room I inherited.</p>

<p data-mode="founder engineer">I could have used that room as comfort — push work down, take the easier load, coast on seniority. I didn't. I used it to pivot from "Lead Dev" to "Full-Stack Builder". The honest framing: <em>I chose to learn DevOps because no one else would.</em> Not because it was the noble choice — because it was the move that compounded. When breathing room appears, you don't spend it. You invest it. You expand your capability radius while you have the slack to do it. That kind of selfishness is the productive kind.</p>

### The Infrastructure Takeover

<p data-mode="engineer founder">I absorbed the cloud, end to end. CI/CD pipelines — owned. AWS Lambda orchestration — owned. ECS/Fargate management — owned. The handoffs from the departed mentors weren't ceremonial; I was now the one paged when a deployment broke at 2 AM, the one approving infra PRs, the one writing the runbooks.</p>

<p data-mode="engineer founder">The lifecycle of my work expanded: <strong>Develop → Deploy → Monitor → Cost Manage</strong>. The last one is the one most engineers skip. I didn't. Cost observability became real ownership — dashboards on per-tenant cloud spend, alerts on Lambda cost spikes, tuning ECS task sizes against actual utilisation. Scaling from 90 tenants to 1,500 tenants isn't an engineering achievement if the unit economics quietly collapse underneath it. I made sure they didn't.</p>

### From Coder to Human Documentation

<p data-mode="founder">Somewhere in this stretch, the inflection point hit. <em>I stopped being the engineer who could write the system. I became the engineer who knew the system.</em></p>

<p data-mode="founder">Every corner. Every tenant edge case in the product. Every Lambda's cold-start behaviour. Every deploy quirk. Every cost line. Every decision that had been made and the reason behind it. People stopped asking "where is this documented?" and started asking <em>me</em>. That's flattering for about a week and terrifying after that. A company whose memory lives in one engineer's head is a company with a single point of failure wearing a lanyard.</p>

### The AI-Native Handover Doctrine

<p data-mode="founder engineer">So I made an explicit decision: document everything. Not for humans this time — for agents. The company should be able to run without me by being readable to AI. Architecture docs, runbooks, decision logs, tenant-onboarding playbooks, cost models, the lot. The portfolio you're reading right now is part of that work — the public-facing slice of a much larger internal corpus.</p>

<p data-mode="founder engineer">The reasoning was simple: <em>my knowledge sitting in my head is a bottleneck for the company. My knowledge written down so an AI agent can read and act on it is a moat for the company. Same knowledge, very different leverage.</em> The Human Documentation phase was the input. The AI-native handover is the output. One engineer, one keyboard, but the artefacts now compound without me sitting in the chair.</p>

### Treks as Default, Not Exception

<p data-mode="human">The Bangalore-treks habit from late 2023 stopped being a weekend luxury and became weekly load-bearing. Skandagiri, Savandurga, the Nandi trails — on rotation. Not as recovery from the grind. As the rhythm of the grind itself.</p>

<p data-mode="human">The team grew to 80 people. The work got heavier, not lighter. Leadership through balance was no longer a phrase I'd read somewhere — it was the only mode that scaled. The 100kg, burger-combo, adrenaline-era version of me would not have lasted six months at this size. He would have burned the body out and called it dedication. The trekking version is still here, two years later, still leading, still building. That's the proof.</p>

## What This Log Is For

This is the <em>uncompressed</em> file. Every other document on this site
— the manifesto, the blueprints, the case studies, the journey — is a
lossy decoder of these entries.

If you want to know what kind of engineer I am, read the manifesto.
If you want to know <em>why</em> I am that kind of engineer, read this.

---

## Next chapter — drafting on the go

> **Status: ongoing.** The Builder era is current. New entries land here as they happen, without a schedule. The structured executive view stays in the [Résumé](../Deepesh_Rathod_Resume.pdf).
