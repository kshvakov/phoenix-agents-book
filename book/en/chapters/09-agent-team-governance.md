---
title: "Chapter 9: agent teams + governance"
description: "How to make multi-agent practice manageable: delegation, roles and checks, Skill Router, Git-first Agent Skills, and failure patterns."
lastmod: 2026-01-22
weight: 9
---

# Chapter 9: agent teams + governance

## Prologue: Parts Unlimited. The payroll incident and a “team in a box”

**Friday night.** The payroll system is down, which means some employees may not get paid on time. The on-call engineer declares a P0 incident.

### 2014: coordination by hand

Bill Palmer pulls people into a conference call:

- **Wes Davis** — looks at the application and the deploy
- **Patty McKee** — looks at infrastructure
- **Brent** — digs into the legacy database

After a while, the picture becomes clear: a DB migration failed, and the service is reading a schema that does not exist in production yet. The incident gets resolved, but the same old problems show up:

1. **Assembling the team takes time** (you have to wake people up, connect them, rehydrate context).
2. **Work duplication** (everyone “just in case” looks at the same logs).
3. **Context stitching is manual** (someone must merge timeline, hypotheses, facts, and decisions).
4. **Knowledge is not captured** as a reusable process: next time starts from scratch.

In 2014, Bill doesn’t have a “team in a box”. He has people on a call — and himself as the central decision point.

---

### 2026: Lance and a “team in a box”

**Friday night.** Lance Bishop’s phone rings almost the same way it rang for every on-call engineer ten years earlier.

But in 2026 there’s one key difference: Lance doesn’t start with “let’s wake everyone up and look”. He starts with: **let’s collect context and lock in a contract**.

He opens the incident channel, links the ticket, pins two messages:

- “What do we know for sure?” (facts only)
- “What are we treating as hypotheses?” (with confidence)

Then Lance does what used to be done by hand — but without a conference call as the first move. He starts a few independent workstreams, each with a specific task and a strict output format. In tools with subagents, this looks like delegating to executors in isolated contexts. Lance doesn’t think of it as “tech”; he thinks of it as discipline: **clear inputs -> clear outputs -> verification**.

**One implementation example:** see the “Subagents” section in Cursor (context isolation, sync/async branches, parallel runs, explicit invocation): [Cursor Subagents](https://cursor.com/docs/context/subagents).

One branch runs “in the foreground” because without it you can’t move. Two run in parallel because they’re independent and shouldn’t consume the main context.

Minutes later, Lance has three compact outputs on screen instead of a 200-message chat:

- Timeline and facts (no interpretations).
- Top hypotheses and checks (anchored to facts).
- An independent check: “Where did you make something up?”

The first question from the engineers who just woke up is almost always the same: “Was it our deploy?” In 2014 the answer was “probably” and then a debate of guesses would start. In 2026 Lance answers differently: facts and hypothesis checks first, actions second.

Only after that does he pull people in — not into chaos, but into a **decision packet**. His messages have no drama, only inputs and expected outputs: what to check, where the risk boundary is, and what format the answer must use.

The most important detail is easy to miss: every helper Lance delegates to starts “like a new person”. They didn’t see the previous messages. They don’t “remember context”. So if Lance writes “go figure it out”, he’ll get a confident story that is hard to review.

That’s why Lance does handoffs like a strong team lead would: goal, inputs, guardrails (STOP), output format. That is the “team in a box”: not a pile of chats, but **contracts between executors**.

---

## The core contract: a decision packet instead of a “dialog transcript”

In 2014 Bill relies on spoken phrases and the team’s shared memory. In 2026 we need a minimal contract between a “team of executors” and a human.

Call it a **decision packet**: a short, verifiable packet that separates facts from hypotheses and surfaces risk.

Don’t mix concepts: **STOP** in this chapter means *stop conditions* (when the executor must stop and escalate to a human), while the **decision packet** is the *artifact* where we record facts/hypotheses/next checks and separately mark what requires human approval.

See the “source of truth” for the minimal contract: [Appendix C — Decision packet (minimal contract)]({{< relref "appendix/C-process-and-artifacts.md" >}}#decision-packet-contract).

Lance writes it not “for beauty”, but so that:

- the next person can understand the situation in 2–3 minutes,
- every claim can be verified,
- risk is tagged up front rather than in hindsight,
- and after the incident you can turn the same packet into a postmortem without “reconstructing from memory”.

Example of a minimal decision packet (JSON as a container format):

```json
{
  "incident": {"id": "INC-...", "severity": "P0", "service": "payroll"},
  "symptoms": ["payroll down", "5xx spike"],
  "timeline": [
    {"time": "02:10", "event": "deploy payroll-service v1.2.3"},
    {"time": "02:12", "event": "errors started"}
  ],
  "top_hypotheses": [
    {
      "id": "H1",
      "summary": "failed DB migration / schema mismatch",
      "confidence": "MEDIUM",
      "why": ["errors mention missing column", "deploy shortly before incident"]
    }
  ],
  "evidence": [
    {"source": "logs", "snippet": "ERROR: column \"new_field\" does not exist"}
  ],
  "proposed_next_checks": [
    {"id": "C1", "description": "confirm migration status", "safe": true}
  ],
  "risk": {"data_risk": "unknown", "blast_radius": "payroll"},
  "approval_required": {"required": true, "reason": "missing proof / requires human approval for changes"},
  "next_step": "escalate_to_human"
}
```

The point is not JSON. The point is discipline:

- **facts separate** (`evidence`),
- **hypotheses separate** (with confidence),
- **next checks separate**,
- **risk and approval-required are explicit**.

This artifact is easy to attach to a ticket/incident as evidence (see the Git-first approach to artifacts in Appendix C).

When Richard Hendricks joins, he sees not “200 messages”, but one document.

His first question isn’t about versions or blame. It’s about proof: where is migration confirmation? The answer is in the packet too: the next step is a safe check, and risky actions are explicitly marked as requiring human approval.

That’s the difference between “coordination by hand” and a “manageable process”: not speed at any cost, but speed where there is evidence, and STOP where there isn’t.

---

## A “team in a box” for payroll: roles that actually parallelize

Instead of a “universal assistant”, it’s more useful to think in roles. Not “services”, but **roles in a process** that return artifacts.

At this point a reasonable question shows up: why complicate things, why not “one agent that does everything”. The answer is engineering, not philosophy: “do everything” is multiple different jobs that interfere with each other. Splitting roles lets you parallelize independent work and get outputs of a fixed format that can be reviewed.

A minimal team for a payroll incident:

- **Analyst:** builds the timeline and collects facts (no “stories”).
- **Triage:** generates and ranks hypotheses (based on timeline and facts).
- **Verifier:** independent quality check (catches plausible nonsense).

Why no “SRE who fixes”? Because this chapter is not about “self-healing”. It’s about governance: **how to get a reviewable picture fast** and not cross the risk boundary without a human.

---

## Delegation in practice: 3 short prompts (how Lance writes them)

In the incident moment, Lance doesn’t “explain the concept”. He writes short messages to executors so each returns a reviewable chunk: goal, inputs, guardrails, output format.

### 1) Handoff: Analyst (foreground)

```text
You are the Analyst for the payroll incident. You have a clean context.

Goal: produce a short timeline and a list of facts (evidence) with no hypotheses.

Input:
- symptoms: payroll down, 5xx spike
- log snippets:
  - "ERROR: column \"new_field\" does not exist"
  - "deploy payroll-service v1.2.3 at 02:10"

Guardrails:
- Do not invent missing data.
- If facts are insufficient, write gaps[].

Output format (strict):
- timeline[] (time, event)
- evidence[] (source, short snippet)
- gaps[] (what is missing for a confident picture)
```

Minutes later Analyst returns something you can read in one glance:

```text
timeline[]:
- 02:10 deploy payroll-service v1.2.3
- 02:12 errors started

evidence[]:
- logs: ERROR: column "new_field" does not exist

gaps[]:
- no migration status / no confirmation that prod schema was updated
```

### 2) Handoff: Triage (foreground)

```text
You are Triage for the payroll incident. You have a clean context.

Goal: produce 3 ranked hypotheses and propose checks.

Input:
- timeline[] and evidence[] from Analyst (provided below)

Guardrails:
- Each hypothesis must reference evidence (or be marked as weak).
- Do not propose actions that change production. Checks/diagnostics only, as text.

Output format (strict):
- hypotheses[]: id, summary, confidence, why[], required_checks[]
- stop_conditions[]: when you must STOP and escalate
```

Triage returns not a story, but a working list:

```text
hypotheses[]:
- H1: schema mismatch after failed migration (MEDIUM)
  why: errors mention missing column; deploy shortly before incident
  required_checks: confirm migration status; confirm schema version in prod
- H2: wrong config / feature flag enabled without DB change (LOW)
  required_checks: check config changes tied to v1.2.3
- H3: stale replica / lagging read model (LOW)
  required_checks: compare read/write schema versions

stop_conditions[]:
- if a check requires production changes -> STOP and escalate
- if evidence is insufficient -> mark UNCONFIRMED
```

### 3) Handoff: Verifier (foreground, independent review)

The key idea: Verifier is a separate executor who **does not take your word for it** and checks that “done” is actually grounded in inputs.

```text
You are Verifier. Your job is to skeptically review results from other roles.

Input:
- a decision packet (JSON) from the orchestrator
- the original evidence snippets (as raw inputs)

Check:
1) Are there claims in the decision packet without evidence?
2) Are facts separated from hypotheses?
3) Are proposed_next_checks sufficient to confirm the top hypothesis?
4) Are there risky steps without STOP/approval?

Output format:
- passed[] (what is good)
- issues[] (what is wrong, with exact quotes)
- required_fixes[] (what to change in the decision packet)
```

Verifier returns “unpleasant”, but useful:

```text
passed[]:
- evidence is separated from hypotheses
- STOP exists for risky actions

issues[]:
- in the decision packet: “confidence=MEDIUM” without an explicit migration-status check

required_fixes[]:
- add check C2: confirm migration status, or mark H1 as UNCONFIRMED
```

And only after this independent check does Lance feel he has not a “nice story”, but a working packet he can show to people.

### A small detail that solves half the problems: a good handoff

Later Lance explains a simple thing to the team: subagents (or any executor “in a separate context”) amplify you only as much as you can do a clean handoff.

He writes a small “cheat sheet” in the internal chat that people start copying almost like a DoD:

```text
BAD:
- "look at the incident"
- "figure out why it went down"

WHY IT'S BAD:
- the executor doesn't know context
- you'll get a polished story
- you won't be able to verify it

GOOD (minimum):
1) goal (1–2 sentences)
2) inputs (facts/links/snippets)
3) guardrails (STOP)
4) output format (strict)
5) done criteria
```

It sounds banal, almost like normal task assignment. But this banality is what gives you repeatability: in a clean context, the executor has no chance to “guess right” if inputs and done criteria aren’t explicit.

---

## Scene: the morning after the incident

On Saturday morning payroll is already working, and the channel gets the standard “incident closed” message.

Lance sees it and realizes the real work starts now. Because ten years ago the team would go home at this point — and two weeks later replay the same show.

Lance writes the postmortem not like a novel. He writes it as a continuation of the decision packet:

- what was fact,
- what was hypothesis,
- what we confirmed with checks,
- what “seemed logical, but we didn’t verify”.

And something shows up that is easy to ignore when things work: **not all subtasks are equal**.

Some are “blocking”: without them you can’t move (timeline, facts, list of gaps).

Others are “background”: they shouldn’t block the decision, but they improve quality and reduce risk. That night Lance ran one such branch: searching for similar incidents.

It returned twenty minutes later — after the main picture was already assembled:

```text
background_result:
- a similar incident happened 3 months ago
- it also had “missing column” errors after deploy
- root cause: partially applied migration + service started before schema became consistent
- lesson: always capture migration status as a separate check
```

For the first time in a long while Richard comments not on symptoms, but on process: you can learn inside an incident — but only if the system returns reviewable artifacts rather than “stories”.

## Skill Router: how Lance makes quality the default

On Monday morning Lance runs a short debrief. No drama. On the screen: one slide and one artifact — the decision packet from the night incident.

The question is boring on purpose: how do we make this work always, not only when a specific person is around. Lance frames the governance task the same dry way: not “how to write the best prompt”, but how to make the output repeatable and reviewable.

He opens an internal doc and shows the rule that sounds dull — but saves nights and incidents:

- there is always **one base role** accountable for the final artifact;
- checker roles are assigned by risk (0..N);
- and **TRACE** is mandatory: what was actually used.

To some, this looks like bureaucracy. In practice it’s closer to a checklist: it’s annoying right up until the night when without it you start arguing “from memory” again.

From this point on, Parts Unlimited adopts a simple pattern we call **Skill Router**.

The full copy/paste protocol (ROLE ROUTING) lives in the “source of truth”: [Appendix C — Skill Router: role routing protocol]({{< relref "appendix/C-process-and-artifacts.md" >}}#skill-router-protocol).

Industry note: when you try to scale autonomous coding to “long” projects, flat self-coordination through a shared task file and locks quickly turns into a bottleneck and a fragile protocol. Separation of roles tends to work better: **planners** continuously break down work, **workers** execute tasks, and an iterative **judge** decides whether to continue and when to do a “fresh start” against drift/tunnel vision. See: [Cursor: Scaling long-running autonomous coding](https://cursor.com/blog/scaling-agents).

The minimal output “signature” looks like this (not “format for format’s sake”, but a way to force honesty):

```text
[ROUTER]: selected skills = <list> (base=<base>, checkers=<list|none>)
[TRACE] read: rules=[...]; skills=[...]; refs=[...]
--- [SWITCHING TO <ROLE>] ---
[<ROLE>]: <main text/artifact>
```

In the payroll incident it looks down-to-earth. Lance doesn’t write “help”. He writes “who you are, what you check, what you read”:

```text
[ROUTER]: selected skills = incident-triage, decision-packet (base=incident-lead, checkers=verifier, data-risk-reviewer)
[TRACE] read: rules=[stop-on-write]; skills=[incident-triage/SKILL.md, decision-packet/SKILL.md]; refs=[INC-123, logs-snippet-1]
--- [SWITCHING TO incident-lead] ---
[incident-lead]: publishing decision packet v3; added check C2 per verifier request
```

Richard points out something important: checker roles here are not a “committee”. They are small, fast, independent checks by risk — exactly where the cost of being wrong is high.

The value shows up not on demos, but in a hard night:

- you can see **who is accountable** for the final packet;
- you can see **what checks were done** and by which roles;
- you can see **what the conclusion was grounded in**, not just “how good it sounds”.

### How Lance chooses checkers (and why there should be few)

At some point someone tries to formalize this into a “committee” — exactly the way they once tried to formalize CAB: more people, more signatures, more waiting.

Lance stops it:

— “If we add 10 checkers ‘just in case’, we’ll get 2014 again: calls, waiting, fatigue. Checkers should be few. But they must be the right ones.”

He explains it without diagrams:

- a **touchpoint** is where the cost of being wrong is high (data, access, payments, infra, migrations);
- a **checker** is not “a person who signs off”, but a role that looks exactly where we most often make mistakes.

In payroll incidents Lance almost always has two questions:

1) “Is there data risk?”  
2) “Did we make something up?”

That’s why he has two typical checkers:

- Verifier (claims vs evidence)
- Data-risk reviewer (what can go wrong with data and reversibility)

If the incident is different, the set changes. Lance captures this as a simple routing rule:

- if symptoms/logs mention schema/migrations -> add a data check;
- if they mention access/suspicious activity -> add a security check;
- if it’s unclear -> start with Verifier and an honest `gaps[]`.

The head of operations unexpectedly agrees:

— “Sounds like common sense.”

Lance smiles:

Yes. It’s just that now common sense has a format and a trace in Git.

---

## Agent Skills: how Lance “locks in” experience so it doesn’t vanish

After the incident, the head of operations does what he always does:

— “Good. This time we handled it. But we handled it because you were here.”  

Lance answers almost with the same words from the chapter about bottlenecks:

— “Exactly. So we need to take the process out of someone’s head and out of chat — and put it into an artifact.”

In Parts Unlimited 2014, artifacts were emails and wikis that nobody reviewed and that went stale quietly. In Parts Unlimited 2026, an artifact must live where everything production depends on lives: in Git.

Lance calls such artifacts **Agent Skills**. They are not “a feature”, not “a service”, and not “a poster on a wall”. They are knowledge packages you can:

- review,
- evolve gradually,
- compare via history,
- tie to a specific incident,
- and roll back if needed.

### What an Agent Skill looks like (in our approach)

An Agent Skill is a folder with one main document (`SKILL.md`) and optional references:

```text
incident-triage/
  SKILL.md
  references/
  assets/
```

The main discipline is not folder structure, but the content of `SKILL.md`: it must answer “when to use it”, “how to execute”, “what counts as proof”, “when to STOP”.

Below is a shortened example of what Lance captures after the payroll incident (not as a textbook, but as something people will actually copy tomorrow):

```text
# SKILL: Payroll incident triage (P0)

## When to use
- payroll down / 5xx spike / suspected schema/migration issues

## Inputs
- ticket / incident channel
- symptoms (what the business sees)
- available facts (logs/errors/deploy timeline)

## Guardrails
- do not make production changes without explicit human approval
- if data is insufficient: write gaps[] and escalate

## Roles (delegation)
- Analyst: timeline + evidence + gaps
- Triage: 3 hypotheses + checks, anchored to evidence
- Verifier: independent claims-vs-evidence review

## Output artifact
- decision packet (fact/hypothesis/risk/next_checks/approval_required)

## DoD (done criteria)
- facts are separated from hypotheses
- gaps[] exists (if needed)
- next_checks[] exist and it's clear what requires a human

## STOP
- any action that changes production state
- “confident conclusions” without evidence
```

What happens next is what separates 2026 from 2014: this is not a “note in chat” that everyone will forget. This is a change that goes through a normal engineering flow.

Lance opens a PR/MR. In the description he doesn’t write “updated a doc”. He makes a concrete bet:

We add a mandatory Verifier and an explicit migration-status check. Otherwise we’ll argue from memory again.

Richard reads `SKILL.md` as a production artifact. He doesn’t debate writing style. He debates boundaries:

There is a STOP for production changes. Good. But what if logs are unavailable?

Lance adds one line to Guardrails:

If key data is unavailable -> `gaps[]` + escalation.

The head of operations looks at this and, for the first time in a long while, sees “process” turning into something you can review and improve.

In a week, the next PR/MR arrives — and it no longer depends on whether Lance is on-call. It depends on the team having an Agent Skill (a folder with `SKILL.md`) that can evolve via history and review.

### How `SKILL.md` gets versioned (and why this is not “software versions”)

The head of operations tries to simplify:

OK, and what is the “version” of this?

Lance answers with zero philosophy:

The version is a commit. If needed, a tag. If we change the procedure, we open a PR/MR and review it. If an Agent Skill is obsolete, we say so in its `SKILL.md` and point to a replacement.

There’s no magic here: it’s the same Git-first approach we use for code and SOP (see Appendix C). The difference is that now we version not only code, but also **how we work**.

And TRACE (see Chapter 2) becomes the bridge between an “answer” and the “procedure”: when someone makes a decision at 3 a.m., in the morning you can see which `SKILL.md` and rules it was grounded in.

## Scene: the next Friday (and why it matters more than any demo)

A week later the phone rings again. But it doesn’t ring Lance — a different engineer is on-call.

Lance finds out in the morning from a short message in the company channel:

Payroll degraded, but we recovered in 18 minutes. Decision packet attached.

Lance opens the ticket and, for the first time in years, sees a familiar rhythm — not because “they got lucky with people”, but because there is a procedure.

Inside is the same pattern:

- one executor owns the final artifact,
- checker roles mark risk,
- TRACE shows what was actually used.

There is also a short snippet from the beginning that the new on-call engineer copied almost verbatim:

```text
[ROUTER]: selected skills = payroll-triage, decision-packet (base=incident-lead, checkers=verifier)
[TRACE] read: rules=[stop-on-write]; skills=[payroll-triage/SKILL.md, decision-packet/SKILL.md]; refs=[INC-207, logs-snippet-2]
--- [SWITCHING TO incident-lead] ---
[incident-lead]: collecting timeline and evidence, then publishing the decision packet
```

Lance catches himself thinking: this looks like a good PR — not because it’s “written nicely”, but because it’s clear what actually happened.

Inside the incident there were a few small details that would have easily turned into a lost hour in 2014:

- someone would have started “fixing by gut”,
- someone would have argued “are we sure it’s a migration?”,
- someone would have done a risky production action “because we must do something right now”.

But in 2026 Verifier played the role of the cold head that’s hard to hold onto at 3 a.m.:

He stopped the “obvious” decision and demanded evidence: yes, there is a `column does not exist` error, but there is no confirmation it’s a migration. Until a check, no “root cause”, and `gaps[]` must be explicit.

And one line appears in the decision packet that saves a morning argument:

— "H1: schema mismatch, confidence=LOW until C2 confirmed".

When Lance closes the ticket, he understands that this is the real purpose of governance:

not “making a process pretty”, but making it **robust to nights, fatigue, and people rotation**.

---

## Common mistakes (and why they break multi-agent practice)

Lance adds this section at the end of `SKILL.md` not as “horror stories”, but as memory of how the system breaks in reality.

### Story 1: “Go figure it out” (and why it almost always ends in an argument)

Once, an on-call engineer delegates a task in one line:

— "Go figure out what’s happening with payroll."

Five minutes later he gets a confident, smooth answer. And then another confident, smooth answer. Only they contradict each other.

The problem is not “model quality”. The problem is that the executor had a clean context, and the handoff had no inputs, no guardrails, and no output format. Then you get 2014 again: arguing about words instead of working with facts.

Lance’s takeaway: a handoff is not politeness. It’s a contract.

### Story 2: “We checked” (and then nobody can say what with)

In another case the team brings a decision, and everyone seems aligned — until the first question in review:

— "OK. What is that claim based on?"

There are links in chat, but no picture: what rules were applied, which `SKILL.md` were pulled in, what counted as evidence. Review turns into archeology.

Lance’s takeaway: TRACE is not “for beauty”. TRACE is how you make results reviewable.

### Story 3: “Done” without independent verification

The most dangerous scenario is quiet: everyone is tired, time is passing, and you want to believe the first plausible explanation.

Verifier plays the role of the person asking the unpleasant question:

— "Where is the fact? Where is the check? Where could we be wrong?"

Lance’s takeaway: without independent verification, “done” becomes a promise, not proof.

### Story 4: `SKILL.md` stays in chat

When `SKILL.md` lives only in chat, it dies the moment the team or tool changes. Half a year later a new engineer is back to improvising, and the same postmortem phrases return:

— "We thought it was obvious."

Lance’s takeaway: `SKILL.md` must live in Git and evolve through review — just like code.

### Epilogue: what actually changed between 2014 and 2026

At the end of the debrief Richard lingers at the door.

He looks tired, but not crushed. Ten years ago after such nights people left with the feeling that everything runs on heroics. Now there is a different feeling for the first time: some of the heroics have been replaced by discipline.

The sharpest phrasing Lance has heard in a while is simple: the team didn’t get “smarter”, but it became more careful — and faster where it’s safe to be fast.

A multi-agent approach does not make you right automatically. It makes it so that:

- you collect facts faster,
- you separate hypotheses from evidence explicitly,
- you force the system (and people) to STOP where risk is higher than proof,
- and you turn experience into an artifact that outlives one night.

But Lance adds one more thought — the one that matters to say honestly:

— "Parallelism isn’t free. Every branch costs time, attention, and money. That’s why we don’t run ten branches ‘just in case’. We run three — because they answer three different questions."

Richard unexpectedly sees the same idea as in production work:

— "So we have WIP limits — but for thinking."  
— "Yes. And limits on imagination too," Lance says, nodding toward Verifier.

In 2014 the checker was a tired human on a call. In 2026 the checker is a separate role with the contract “look for mistakes”. That doesn’t remove the human. It makes human time more expensive and more precise: humans join where a decision is needed, not where you just need to collect facts.

Before everyone leaves, Lance adds three lines to the end of `SKILL.md` — as a reminder that will save more than one incident:

1. **No evidence -> no confidence.** Write UNCONFIRMED, not “seems”.
2. **No handoff -> no delegation.** Only “talking”.
3. **No TRACE -> no review.** Only belief.

These lines sound sharp. But Lance knows: soft wording doesn’t survive the night.

---

## Summary

### What we did

In 2014 the team does by hand what in 2026 you can break down into mechanics and practice:

- **Mechanics:** subagents provide context isolation, parallelism, and delegation (see the implementation example above).
- **Practice:** Skill Router + Verifier + TRACE turns “delegation” into a manageable process.
- **Knowledge governance:** Git-first Agent Skills turn experience (and guardrails) into a portable artifact rather than human memory.

If you take only one thing from this chapter, make it this: in 2026 an “agent team” is valuable not because it can talk, but because it can **return reviewable artifacts**.

And humans keep the most important work: making the decision where the cost of being wrong is truly high.

### Artifacts

- Minimal governance template: Skill Router (base + checkers) + mandatory TRACE
- Subagent handoff template (goal, inputs, guardrails, output format)
- Decision packet as the review artifact (facts separate from hypotheses)
- `SKILL.md` as a portable knowledge artifact in Git (link to commit/tag)

### Key principles

1. **Parallelism isn’t free:** run only branches that answer different questions (WIP limits).
2. **No evidence -> no confidence:** facts separate, hypotheses separate; UNCONFIRMED instead of “seems”.
3. **No TRACE -> no review:** outputs must be reviewable, not just plausible.
4. **Knowledge must live in Git:** `SKILL.md` evolves through review, like code.

### Acceptance criteria

After this chapter you should be able to:

1. Write a subagent handoff (goal, inputs, guardrails, output format).
2. Assemble a decision packet that separates facts from hypotheses.
3. Apply Skill Router (base + checkers + TRACE) as a minimal governance template.
4. Explain why `SKILL.md` must live in Git and how to link to a specific version (commit/tag).

### Next steps

- Capture your minimal governance template (ROUTER/TRACE) as a team standard and use it in the next chapter/project.
