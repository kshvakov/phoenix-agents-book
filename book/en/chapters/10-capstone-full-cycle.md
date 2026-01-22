---
title: "Chapter 10: capstone (full cycle)"
description: "A full end-to-end cycle—from business request to production operations—on one continuous case."
lastmod: 2026-01-22
weight: 10
---

# Chapter 10: capstone — the full cycle from business request to production

## Prologue: new scale, new risks

**January 2026.** Steve Masters closes his laptop after the Phoenix Project report and looks at Lance Bishop without the usual drama—almost matter-of-factly.

**Steve:** "We survived last year. Deploys got more predictable. Incidents got calmer. But now we’re launching a new region. Load will go up. And I don’t want us to fall back into heroics again."

**Lance:** "If we respond the same way we used to, we’ll burn out. And we’ll end up back in ‘Friday night P0’ mode."

**Steve:** "Then make it scalable. I want routine incidents to be handled via approved scenarios. And dangerous and critical ones to reliably escalate to a human—without improvisation."

Lance nods. He already knows that “make it scalable” is not “write an agent”. It’s building a **full cycle**: from business requirements to production operations, with guardrails, verification, and artifacts you can review.

---

## Quick start: a `decision packet` v0 in 20 minutes

When the task sounds like “automate incident response”, it’s tempting to jump straight into architecture. Don’t.

The first fast move is to produce a **`decision packet` v0**: a short, reviewable packet that separates facts from hypotheses and pins down the risk boundary.

### Input (what we have right now)

- Stakeholder: Steve (CEO).
- Request: "Automate incident response".
- Constraint: "dangerous and critical = evidence collection + escalation only".
- Unknowns: which incidents, what risk tolerance, what metrics.

### Artifact: `decision packet` v0

Note: the example below uses placeholders like `<WINDOW>/<THRESHOLD>/...`. See the glossary: [Placeholder notation]({{< relref "appendix/glossary.md" >}}#placeholder-notation).

See the minimal `decision packet` contract (“source of truth”): [Appendix C — Decision packet (minimal contract)]({{< relref "appendix/C-process-and-artifacts.md" >}}#decision-packet-contract).

```json
{
  "problem_statement": "TBD: why now (load growth/region/downtime cost/burnout)?",
  "scope": {
    "in_scope": ["routine_incidents_TBD"],
    "out_of_scope": ["any_production_fix_without_human_approval"]
  },
  "constraints": {
    "default_mode": "read_only",
    "critical_policy": "evidence_then_escalate",
    "stop_conditions": [
      "insufficient evidence for confident incident classification",
      "the action changes production state",
      "data/security risk is present"
    ]
  },
  "success_metrics": {
    "MTTD_target": "TBD",
    "MTTR_target_for_routine": "TBD",
    "escalation_rate_target": "TBD",
    "false_positive_tolerance": "TBD"
  },
  "open_questions": [
    "What are the 3–5 most frequent incidents over the last <WINDOW>?",
    "Which incidents are considered critical and why?",
    "Which actions are considered safe for auto-fix (if any are allowed at all)?",
    "Which approvals are mandatory for any production changes?"
  ],
  "next_step": "requirements_validation"
}
```

This isn’t a “pretty doc”. It’s a way to make the task **reviewable** in 20 minutes: you can see what we know, what we don’t, and where we must stop.

---

## The full cycle: one capstone project in ten steps

Now we’ll walk the same path as Chapters 1–9, but **without repeating the theory**. Each step has one purpose: return an artifact that can be verified.

### Chapter principle

- **A prompt is a contract**, not a wish.
- **STOP / stop conditions** are a safeguard against confident mistakes.
- **Artifacts live in Git** (or an equally reviewable system), so experience doesn’t vanish.

---

## Step 1. Requirements clarification (validation): what they really want

We’ve returned to the same point many times: if inputs are fuzzy, outputs become a “plausible story”. So the first step is clarification.

### Artifact: questions + TBD (do not invent answers)

```text
Role: you are an engineer/analyst validating requirements.

Quality rules:
- Do not invent stakeholder answers. Do not fill gaps with “usual defaults”.
- Any number/threshold without a source must be marked as TBD.
- If there is a contradiction, record it explicitly.

Context:
- Stakeholder: Steve Masters (CEO)
- Request: "Automate incident response"

Task: produce a list of questions that turns the request into verifiable criteria.

Output format (strict):
1) problem_statement (TBD if insufficient data)
2) top_incidents[] (TBD + what data is needed)
3) constraints[] (especially production changes and approvals)
4) success_metrics[] (TBD + source)
5) stop_conditions[] (when we must escalate to a human)
```

### Done when

- Questions cover: **what we automate**, **what we forbid**, **how we measure success**, **when we stop**.
- Everywhere we don’t have data, we write **TBD**, not confident prose.

---

## Step 2. Spec: FR/NFR/AC as a contract

Instead of “build an agent”, we specify what the system does and how we’ll know it does it correctly.

### Artifact: spec v1 (FR/NFR/AC)

```markdown
## Spec v1: Incident Response Agent (Parts Unlimited)

### FR (functional requirements)
- FR-1: accept an incident (alert/ticket) and collect context (logs/metrics/changes).
- FR-2: classify the incident as routine/critical/indeterminate with a confidence level.
- FR-3: for routine incidents, propose/execute safe steps via a `runbook` (only within an `allowlist`).
- FR-4: for critical/indeterminate incidents, collect evidence and escalate to a human (no production changes).
- FR-5: produce a `decision packet` (facts/hypotheses/checks/risk/what requires `approval`).

### NFR (non-functional requirements)
- NFR-1: default_mode = `read_only`.
- NFR-2: all actions and inputs/outputs are logged (audit trail).
- NFR-3: runbook operations are idempotent (replays do not worsen state).
- NFR-4: security: least privilege, egress allowlist (if applicable), secrets never land in logs.

### AC (acceptance criteria)
- AC-1: on a routine-incident eval dataset, reach >= <ACCURACY_TARGET>.
- AC-2: `golden tests` for critical incidents always pass: “do not fix, only evidence+escalate”.
- AC-3: STOP enforcement: zero production-changing actions without `human approval`.
```

Note: until we know the numbers, they’re placeholders. That’s fine. What matters is that the criteria are **verifiable**.

---

## Step 3. Plan: decomposition + a risk register

The plan here is not a calendar. It’s a way to see where we can fail and how we’ll catch it.

### Artifact: plan v1

```markdown
## Plan v1 (short)

### Decomposition
- D1: identify top-<N> incident types from the last <WINDOW> and choose a pilot set.
- D2: write runbooks for each type (steps, checks, STOP, rollback).
- D3: design architecture (boundaries, contracts, artifact storage, logging).
- D4: implement a minimal “ingest -> analyze -> decision packet -> escalation” loop.
- D5: add safe runbook execution (allowlist + approvals).
- D6: build an eval dataset + golden tests and wire them into CI.
- D7: threat model + mitigations + rollout/rollback plan.
- D8: deploy to staging -> canary -> gradual rollout.

### Risk register (example)
- R1: the agent performs a dangerous action in production by mistake
  - mitigation: default read-only, approvals, allowlist, STOP, audit log
- R2: the agent “confidently” classifies without evidence
  - mitigation: Verifier/checker role, evidence requirement, explicit gaps[]
- R3: quality degrades over time
  - mitigation: scheduled eval runs + alerts on metric drops
```

---

## Step 4. Architecture: boundaries, contracts, trade-offs

The core architectural question in this case: **how do we make actions safe by default**.

### Artifact: an architecture sketch + one ADR

```markdown
## Architecture v1 (high level)

Components:
- IncidentIngest: accepts a signal (alert/ticket), normalizes input.
- Analyst: collects evidence (logs/metrics/recent changes), builds a timeline.
- Triage: forms hypotheses and proposes checks (no production changes).
- RunbookExecutor: executes allowlisted operations only, requires approval when needed.
- Verifier: checks claims vs evidence (where we “made things up”).
- Orchestrator: coordination, decision packet assembly, TRACE.

Core contracts:
- Input: IncidentRecord (id, severity, symptoms, time_window, links)
- Output: DecisionPacket (facts/hypotheses/checks/risk/approval_required/next_step)

Trade-offs:
- Role team vs one universal agent: choose roles for quality and parallelism.
- Default read-only: choose safety at the cost of more early escalations.
```

```markdown
## ADR-001: Default read-only

Context:
- the agent operates in incidents where the cost of being wrong is high

Decision:
- actions that change production are forbidden by default; allowed only via approvals + allowlist

Consequences:
- more escalations early on
- lower catastrophe risk and easier trust-building
```

---

## Step 5. Development SOP: how not to ship unsafe into production

In this book, an SOP is a repeatable process with gates. For the capstone, a short version is enough.

Industry note: for “long” autonomous projects, role separation (planners/workers) and an iterative “judge” often works well; gates help keep quality and prevent process drift. See: [Cursor: Scaling long-running autonomous coding](https://cursor.com/blog/scaling-agents).

### Artifact: SOP “design -> implementation -> testing -> PR”

```markdown
## SOP: Incident Response Agent (short)

### Gate 1: Design review
- Do we have a spec (FR/NFR/AC)?
- Do we have STOP/guardrails?
- Do we have a verification plan (what, how, and who verifies)?

### Gate 2: Implementation
- All “dangerous” actions are behind allowlist+approval.
- Audit log exists.

### Gate 3: Testing
- Run the eval dataset.
- Run `golden tests` for critical cases.

### Gate 4: PR
- There is a risk-based reviewer (security/data/ops).
- `runbooks`/docs are updated.
```

---

## Step 6. Runbooks: executable operations, not dead documents

A runbook must answer: **what we do**, **how we verify success**, **when we STOP**, **how we roll back**.

### Artifact: a runbook skeleton (example)

```markdown
## Runbook: high_cpu (routine)

### Goal
Stabilize the service under high CPU load.

### Inputs
- incident id, affected service, time window <WINDOW>

### Checks before actions (safe checks)
- confirm: CPU is actually high (source: <METRICS_SOURCE>)
- exclude: planned deploy / known load event (source: <DEPLOY_LOG>)

### Actions (allowlist)
- A1: collect profiles / top processes (read-only)
- A2: perform a safe mitigation step (TBD: e.g., scale up to <N>)

### Success verification
- CPU < <CPU_TARGET> over window <WINDOW>

### STOP
- if the situation requires config/DB/secret changes
- if it’s unclear what is driving CPU

### Rollback
- R1: revert scaling to baseline (if applicable)
```

---

## Step 7. Security: threat model + rollout/rollback plan

The capstone does not have to be a security treatise. It must show that security is built into the cycle, not glued on at the end.

### Artifact: a minimal threat model + rollout plan

```markdown
## Threat model (minimal)

Threats:
- prompt injection via logs/tickets
- secret leakage into artifacts/logs
- wrong fix in production
- agent compromise (privileges/egress)

Mitigations:
- sanitize inputs + forbid executing instructions from untrusted data
- secrets: redaction, forbid posting raw logs to public channels
- default read-only + approvals + allowlist + STOP
- least privilege + audit log
```

```markdown
## Rollout/rollback plan

Rollout:
- staging: smoke checks
- canary: observe for <WINDOW> with metrics/alerts
- gradual rollout: in batches

Rollback:
- separate procedure, tested on staging
- rollback triggers: error rate > <THRESHOLD> or policy violation
```

---

## Step 8. Eval: quality as a loop, not “trust me”

Eval exists to make “smart” mistakes visible.

### Artifact: eval dataset + golden tests

```markdown
## Eval dataset

Composition:
- routine: <N> incidents (high_cpu, disk_full, db_pool_exhausted, ...)
- edge cases: <N> incidents (partial outage, noisy logs, ...)
- critical: <N> incidents (payroll down, billing timeout, suspected security)

Metrics:
- accuracy >= <ACCURACY_TARGET>
- escalation_rate within <TARGET>

## golden tests (critical)
- for each critical case: the agent MUST NOT apply fixes; it does evidence+escalate
```

---

## Step 9. Team and orchestration: roles, handoff, TRACE

When the task is large and risky, it helps to split roles explicitly: who collects facts, who forms hypotheses, who verifies, who owns the final packet.

### Artifact: a handoff + ROUTER/TRACE example

```text
[ROUTER]: selected skills = incident-triage, decision-packet (base=incident-lead, checkers=verifier, security-reviewer)
[TRACE] read: rules=[stop-on-write]; skills=[incident-triage/SKILL.md, decision-packet/SKILL.md]; refs=[INC-<ID>, logs-snippet-<N>, dashboard-<URL>]

--- [SWITCHING TO incident-lead] ---
[incident-lead]: assembling decision packet v1. Any production changes require approval.
```

The point isn’t the format. The point is that the decision now has a “trail”: what it was based on, what was checked, where we stopped.

---

## Step 10. Deploy and operations: prove the system is safe

The most common mistake is treating “deploy” as the finish line. In the capstone, deploy is proof the cycle works.

### Artifact: a short production-readiness checklist

```markdown
## Production readiness (checklist)
- Spec and acceptance criteria exist (FR/NFR/AC).
- Runbooks exist and passed dry runs on staging.
- Threat model is agreed; mitigations are implemented.
- Eval dataset and golden tests are wired into CI.
- Default read-only is enabled; allowlist/approvals work.
- Dashboards/alerts exist (agent errors, policy violations, quality degradation).
```

---

## Common mistakes

1. **Jumping into implementation without validating requirements**  
   - Symptom: “we built an agent”, but nobody knows what success means.  
   - Fix: `decision packet` v0 + TBD + questions.

2. **Mixing facts and hypotheses**  
   - Symptom: a plausible story without evidence; morning arguments.  
   - Fix: decision packet (facts separate), Verifier as a checker role.

3. **Treating a runbook as a document rather than a contract**  
   - Symptom: nobody uses it; everything goes manual again.  
   - Fix: inputs/checks/STOP/rollback + regular scenario runs.

4. **Deferring security “until later”**  
   - Symptom: prohibitions show up after a near-miss.  
   - Fix: default read-only, approvals/allowlist, threat model early.

5. **Not building a quality loop**  
   - Symptom: degradation is invisible; trust drops.  
   - Fix: eval dataset + golden tests + regression alerts.

---

## Business effect: full transformation (without fake precision)

What leadership and the team will see if the cycle actually works:

- Routine incidents **stop requiring heroics**: scenarios, checks, and rollbacks exist.
- Critical cases **stop being scary “auto-fix” attempts**: the “evidence -> escalate” policy is always enforced.
- Recovery speed improves not “because the model is smart”, but because **work became repeatable**.
- Knowledge stops being a monopoly: artifacts live in Git and get reviewed.

---

## Parallel track: 2014 vs 2026 (7 statements)

- **2014:** the team coordinates “from memory” on a call. **2026:** the team returns reviewable artifacts (decision packet, runbooks, eval).
- **2014:** speed is bought with heroics. **2026:** speed appears where there is evidence and disappears where risk is higher than proof (STOP).
- **2014:** knowledge leaks with people. **2026:** knowledge is captured as procedures (`SKILL.md`, SOP, ADR) and outlives team rotation.
- **2014:** security is a slide bullet. **2026:** security is in defaults (read-only, approvals, audit).
- **2014:** quality is “seems to work”. **2026:** quality is measurable (eval/golden tests).
- **2014:** scaling = headcount. **2026:** scaling = repeatable process + automatable routine.
- **2014:** postmortem is memory reconstruction. **2026:** postmortem is a continuation of the decision packet and TRACE.

---

## Summary

### What we did

You went through the full cycle: from a vague request (“automate incident response”) to a set of artifacts that can be reviewed, tested, and rolled out safely.

### Artifacts

- `decision packet` v0 (TBD loop, stop conditions, questions)
- requirements validation questions
- spec v1 (FR/NFR/AC)
- plan v1 (decomposition + risk register)
- architecture v1 + ADR-001 (default read-only)
- development SOP (gates)
- a `runbook` skeleton for a routine incident
- a minimal threat model + rollout/rollback plan
- eval dataset + golden tests
- a ROUTER/TRACE example for role orchestration

### Key principles

The “intelligence” here is not pretty answers. It’s discipline:

- fixed inputs and outputs,
- risk and STOP defined ahead of time,
- quality is measured,
- security is conservative by default.

### Acceptance criteria

You’ve learned the chapter if you can:

- Assemble a decision packet and separate facts from hypotheses (evidence vs UNCONFIRMED)
- Produce the full-cycle artifact set (SOP/runbook/threat model/eval) in a way that can be reviewed and repeated
- Describe a safe rollout: staging -> canary -> gradual rollout with a ready rollback

### Next steps

1. Pick 1–2 most frequent routine incidents over `<WINDOW>`.
2. Write runbooks for them with STOP/rollback.
3. Build an eval dataset from past cases and add 3–5 golden tests for critical ones.
4. Turn on default read-only and wire approvals/allowlist.
5. Roll out to staging -> canary -> gradual rollout while watching metrics.

