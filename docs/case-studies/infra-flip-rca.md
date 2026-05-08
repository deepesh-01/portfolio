# Case Study 12 — The 5-Minute RCA (Infra-Flip Rescue)

**Period.** Late 2025.
**Surface.** CI/CD pipeline post-Infra-Flip — the migration of the company's entire infrastructure footprint onto Terraform.
**Stakes.** New code wasn't deploying. A war room with senior infra + platform engineers couldn't identify the cause in over an hour.
**Outcome.** Five-minute Root Cause Analysis. Pipeline recovered. The lesson: *Framework Knowledge meets System Wisdom at the seams the framework can't see.*

## Context — The Infra-Flip

<p data-mode="engineer">The company had executed a massive infrastructure consolidation onto Terraform. Every IAM role, every security group, every RDS parameter, every S3 policy — pulled out of console-clicked exceptions and into version-controlled HCL. The flip itself was textbook. Compliance-readable infrastructure (see <a href="../../adr/0014">ADR-0014</a>). The kind of work an external infrastructure team is exactly built to do — pattern-fluent, tool-fluent, executed cleanly inside Terraform's own contract.</p>

<p data-mode="engineer">The post-flip world: clean Terraform on the infrastructure surface, the same NestJS / NX monorepo on the application surface. A clean separation — until the seam between them needed to communicate during a deploy.</p>

## The Failure Mode

<p data-mode="engineer">Post-flip, the CI/CD pipeline stalled. New code wouldn't deploy. The pipeline emitted errors that <em>looked</em> infrastructure-shaped — auth failures against a service the code expected to find at the old endpoint, missing environment variables that the new IaC pattern had relocated, unfamiliar ARN shapes the app's deploy hooks were not parsing correctly. Every error pointed at the infrastructure surface. None of the errors lived there.</p>

<p data-mode="engineer">The war room formed. Senior infra and senior platform engineers in the same room. They read the logs. They re-applied the Terraform. They checked IAM. The pipeline kept failing. <em>An hour passed.</em></p>

## The Investigation — What The Framework View Couldn't See

<p data-mode="engineer">The framework view said: <em>"Terraform applied cleanly; IAM policies match the spec; secrets exist in the new locations."</em> All true. The pipeline still didn't deploy. The framework view's mental model could not see the seam where the legacy NX deploy hook expected one ARN shape and the new IaC pattern produced another, <em>and that mismatch lived in a part of the deploy script that nobody had touched in eighteen months because nobody had needed to.</em></p>

<p data-mode="engineer">The fix was not in the new infrastructure. The fix was at the boundary between the new infrastructure and the application's deploy lifecycle — a handful of lines in a script most current engineers had never opened. The kind of code only the engineers who had built it in the first place still carried in their heads.</p>

## The Five Minutes

<p data-mode="engineer">Stepped in. Read the deploy script's parsing logic, against the new ARN shape the IaC was emitting. Spotted the mismatch — an old-format ARN parser meeting new-format ARN output. One line of fix. Pipeline started moving. Five minutes from when I sat down.</p>

```bash
# deploy-hook.sh — the seam between legacy NX deploy and new IaC
# Input:    ARN emitted by Terraform output (new shape)
# Process:  parse role from ARN
# Output:   role assumed for the deploy
#
# The fix was a one-character pattern change in the parser:
# -ROLE=$(echo "$ARN" | cut -d'/' -f2)         # legacy ARN shape
# +ROLE=$(echo "$ARN" | cut -d'/' -f3)         # new IaC ARN shape
```

<p data-mode="engineer">(The exact fix is illustrative; the real fix lived in deeper plumbing. The shape matters more than the line — <em>a parser written against an old contract, meeting output written against a new contract.</em> The legacy script was correct against the world it was written in; the new infrastructure was correct against the world it had been built for; the seam between them was correct in neither.)</p>

## Why The Framework View Missed It

<p data-mode="engineer">Tools like Terraform are only as good as the engineer's understanding of the ground truth. The framework view checks: <em>did the resources apply?</em> The system wisdom view asks: <em>does the application's deploy lifecycle still understand the resources after they applied?</em> Different question, different observation surface, different fix. The first question is answered by the Terraform plan output and the AWS console. The second is only answered by someone who knows which deploy script the pipeline runs in step 7 of stage 3 and what assumptions that script was written against in 2022.</p>

<p data-mode="founder">The infrastructure team did exactly the right Infra-Flip work. The mismatch was not a Terraform mistake. It was an integration seam that lived <em>outside the Terraform footprint</em> — in a small piece of legacy plumbing that the framework view had no reason to look at, because the framework view's job was the framework, not the application boundary. Diagnosing the seam required walking into a script that was not on anyone's radar because it had been silently working for eighteen months. Framework view does not produce that walk.</p>

## The Lesson — Framework Knowledge vs System Wisdom

- **Framework Knowledge** is what an external consultant brings — pattern fluency, tool fluency, the ability to execute migrations cleanly inside the framework's own contract. Indispensable for a flip of this size; the Infra-Flip itself succeeded on the back of it.
- **System Wisdom** is what a founding engineer carries — the institutional memory of *every weird seam this company has accumulated since 2020*, the kind of knowledge that does not fit in a runbook because the runbooks were written *by* the people carrying it. It is not a substitute for framework knowledge; it is the layer underneath it.
- A healthy team has both. The five-minute RCA is what happens when the team has both *and* knows which to reach for at the seam. An hour in a war room is what happens when only one of them is in the room.
- The unfixed problem the era named for itself: **how to transfer system wisdom to outsiders fast enough that the seams stop being load-bearing on individual people.** Documentation helps; it does not finish the job. The seams move faster than the docs.

<p data-mode="founder">This case study is the <strong>Monitor</strong> pillar of the Develop → Deploy → Monitor → Cost lifecycle, viewed at the seam between application and infrastructure. The Infra-Flip moved one surface forward. The five-minute RCA was the price of the seam the move had silently created. See <a href="../../adr/0016">ADR-0016</a> for the doctrine this incident named.</p>

> *"Tools are as good as the engineer's understanding of the ground truth."* — me, on the Infra-Flip seam, late 2025.
