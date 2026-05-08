# Case Study 04 — The 150GB Migration

**Period.** March 2024.
**Surface.** Cross-region S3 migration — Mumbai (ap-south-1) → US-East-1.
**Volume.** 150GB of core user media out of a ~900GB pool.
**Outcome.** 0% data loss. Two crashes survived. ~30 hours of grit per run.

## Context

<p data-mode="founder">Most of our customers were US-based. The media bucket was in Mumbai because the company had been built there. Every image fetch was paying a transcontinental round-trip, and every Lambda in the resize pipeline was paying it twice. The fix was obvious — move the media to the region the users actually lived in. Doing the move without losing a byte was the part nobody wanted to own.</p>

<p data-mode="engineer">The shortlist was AWS DMS, S3 Batch Operations, or a hand-rolled migrator running off a laptop. DMS was overkill for an object-store-to-object-store copy and would have cost real money for a one-shot job. Batch Operations could do the copy but gave us a thin seam for byte-level QC and almost no seam for resume-after-crash with the manifest shape we already had. A local migrator was the smallest tool that could do the job — provided I was willing to babysit it for a day and a half at a time.</p>

<p data-mode="human">I was willing.</p>

## The Approach — A Resilient Local Migrator

The architecture, in four bullets:

- **Manifest first.** Build a local manifest of every object key in the source bucket. This is the unit of work — not files-on-disk, not pages-of-S3-listings, just a flat list of keys with their source-side ETags.
- **Compare before copy.** For each key, hash-check the source against whatever the destination already holds. Skip if equal. Copy if missing or different.
- **Append-only progress log.** Every successful key gets a line in `progress.log` — key, byte count, destination ETag, timestamp. The log is the source of truth for "what's done."
- **Resume from the log, not from memory.** On startup, read the log, build a `Set` of completed keys, and skip them. Crashes become resumes. No state lives in the process.

`ECONNRESET` on a long-haul cross-region copy is not an exception — it is weather. The retry policy was correspondingly boring: catch, sleep 5 seconds, retry the same key. If it fails three times in a row, surface it to a `failed.log` and keep going. Nothing about a single flaky key should be allowed to stall the run.

```js
// migrate.js — the resume-from-log core loop (stripped)
//
// Input:   manifest.json  — every source key + source ETag
//          progress.log   — append-only record of completed keys
// Process: skip completed keys; copy + hash-verify the rest;
//          on ECONNRESET sleep 5s and retry; log failures, keep going
// Output:  destination bucket in parity with the manifest;
//          progress.log durable across crashes

const done = new Set(
  fs.readFileSync('progress.log', 'utf8')
    .split('\n').filter(Boolean)
    .map(line => JSON.parse(line).key)
);

for (const { key, srcEtag } of manifest) {
  if (done.has(key)) continue;            // resume — already shipped

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const bytes = await copyObject(SRC, DST, key);
      const dstEtag = await headEtag(DST, key);
      assertEqual(srcEtag, dstEtag);      // QC — byte-perfect or bust

      fs.appendFileSync('progress.log',
        JSON.stringify({ key, bytes, dstEtag, at: Date.now() }) + '\n');
      break;
    } catch (e) {
      if (e.code === 'ECONNRESET' && attempt < 3) {
        await sleep(5000);                // weather, not exception
        continue;
      }
      fs.appendFileSync('failed.log', JSON.stringify({ key, err: String(e) }) + '\n');
      break;                              // do not stall the run
    }
  }
}
```

## The "Grit" Hack — `caffeinate`

<p data-mode="engineer">The first run died after ten hours with no error. The migrator hadn't crashed. The laptop had gone to sleep. macOS will happily suspend a `node` process mid-S3-copy and leave the open sockets to rot. None of the resilience in the script matters if the OS kills the process under it.</p>

<p data-mode="founder">The fix is one line. `caffeinate` is a macOS utility that prevents idle sleep, display sleep, disk sleep, and system sleep for the duration of a child process. It is the kind of tiny detail that decides whether a system ships or stalls.</p>

```bash
# Run the migrator without macOS sleeping it out from under us
caffeinate -dimsu node migrate.js
```

<p data-mode="human">Without `caffeinate`, the architecture is wishful. With it, the architecture is real. Same code; different verdict.</p>

## The Two Crashes

<p data-mode="human">The first crash came around hour 22 of run two. The second came around hour 14 of run three. I felt sad and depressed. Not in a poetic way — in the literal way where you stare at a terminal you've been staring at for a day and a half and the terminal has nothing kind to say back.</p>

<p data-mode="founder">The Founder called the same evening as the second crash. The mode he used I will only describe as <em>negative motivation</em> — the kind of pep talk that does not pretend the situation is fine. He did not tell me it would be okay. He told me, in the bluntest possible terms, that the only thing standing between this migration and done was me, that the design was right, that the resume logic existed for exactly this moment, and that the next chunk was waiting. It was not gentle. It was the right shape of un-gentle.</p>

<p data-mode="engineer">The recovery itself was anticlimactic — which was the entire point. `caffeinate -dimsu node migrate.js` again; the script read `progress.log`, built the `done` set, skipped the 80% already shipped, and picked up at the next un-logged key. The crashes were, in the end, a vindication of the pause/resume design. The architecture had budgeted for failure; the failure arrived; the budget held.</p>

## The QC Layer

<p data-mode="engineer">A byte-perfect integrity check ran before any key was appended to <code>progress.log</code>. Source ETag against destination ETag, after the copy completed, before the line was written. If the check failed, the key did not get marked done — it got retried, and if it kept failing, it landed in <code>failed.log</code> for triage. "Complete" was never allowed to be a wishful state. "Complete" meant the bytes on the other side hashed to what the bytes on this side hashed to.</p>

<p data-mode="founder">This is the same instinct as the reconciliation layer in the <a href="./175-lead-bug.md">175-Lead Bug</a> case — logs over excuses, divergence as the unit of truth. A migration that <em>looks</em> done from process exit codes is not done. A migration that has a hash-equal destination for every line in the manifest is done. Those are different definitions, and only one of them survives an audit.</p>

## The Lesson

<p data-mode="founder">Long-running local migrators need three things, and they need all three or none of them work:</p>

- **OS-level cooperation** — `caffeinate` or its equivalent, because no application-layer resilience survives an OS that decides to nap.
- **Idempotent resume from durable logs** — the process holds no state worth recovering; the log does. Restarts are first-class, not a panic mode.
- **A QC layer that defines complete in bytes, not in exits** — process zero exit codes are evidence of nothing. Hash equality is evidence of done.

<p data-mode="engineer">"0% data loss" is not a result you celebrate at the end. It is a design output you commit to at the start. The migrator either was going to ship every byte or it was going to ship none of them; there was no acceptable middle. Every architectural choice — the manifest, the append-only log, the hash check before the log line, the retry-and-keep-going on flaky keys — falls out of that one commitment.</p>

<p data-mode="human">The migration's success unblocked the next surface — the WebSocket-backed observability layer and the GBP drip-feed pipeline that needed the destination bucket to be in-region before any of it made sense. A junior frontend engineer shipped a chunk of the upload-progress UI off the back of that work. The migration was the chokepoint; everything downstream was waiting for it to clear. It cleared.</p>

> *"Sad and depressed."* — me, after the second crash.
> *"That's not a problem. That's the next chunk."* — the Founder, the same evening. *(paraphrased — the verbatim is lost; the shape is exact.)*
