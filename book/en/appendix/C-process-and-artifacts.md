---
title: "Appendix C: development process and project artifacts"
description: "An end-to-end process map and the engineering artifacts (ADR, `runbook`, PR, DoD) that turn words into evidence."
lastmod: 2026-01-22
weight: 3
---

# Appendix C: development process and project artifacts

This document is a practical map: which artifacts you need in a healthy engineering process, **why** you need them, and **which risks** they mitigate.

This is not paperwork for paperwork’s sake. In this book, artifacts are **evidence**: observable signals that you control quality, safety, and change delivery.

---

## 1) Process map (end-to-end)

```text
Idea and stakes
    |
    v
Spec
    |
    v
Plan
    |
    v
Architecture
    |
    v
Implementation (via SOP)
    |
    v
Verification
    |
    v
Deploy and rollback
    |
    v
Operations and incidents
    |
    v
Improvements
    |
    └───────────────> back to Spec
```

**See also:** the reference full cycle in Chapter 10.

---

## 2) Artifacts by stage (what, why, owner, definition of done)

Below is the minimal sufficient set. It can be thicker, but it must not be empty.

### Where artifacts live (Git-first so it remains stable)

Process artifacts must be long-lived: survive task tracker churn, be versioned, and be reviewable.

- **Git (GitLab/GitHub)** is the source of truth for artifacts: `SOP`, prompts, `DoD`/checklists, `runbooks`, ADRs (versioning, review, history, linkage to code changes).
- **Task tracker (Kaiten/Jira)** manages work: cards/status/discussion + links to **specific versions** of artifacts in Git (commit/tag) + evidence (PR/CI/verification output).

Note: if you use Agent Skills (`SKILL.md` folders) as a portable procedure format, the same rule applies—`SKILL.md` must live in Git and go through review. It is part of a production process (instructions, templates, checks), not chat notes.

### 2.1 Idea / framing

- **Short summary (brief, no fluff)**  
  - **Why:** capture *why we do this*, who hurts, what changes.  
  - **Owner:** initiator, product/project owner, tech lead.  
  - **Done when:** a few crisp bullets for why/what/how we measure + explicit constraints.  
  - **See also:** Chapter 10 (validation), Appendix A (business case).

- **Terms and the execution contract (short, so we don’t get confused)**  
  - **AC (acceptance criteria):** what should happen (expected behavior/outcome).  
  - **DoD (definition of done):** what evidence is sufficient to call it done (a few verifiable items).  
  - **Verification plan:** how we will obtain that evidence (tests/metrics/sampling/edge cases).  
  - **STOP:** when the executor must stop and escalate (unclear context, high risk, no way to verify).  
  - **TRACE:** what the answer stands on: which rules/`SKILL.md`/artifacts were actually used. Practice: keep TRACE next to the main artifact (answer/`decision packet`) and attach it to the ticket/PR as evidence.  
  - **Why it matters:** humans can often “stretch” AC through context; automation cannot, so **DoD + verification plan + STOP is the minimal contract**.

- **AC (acceptance criteria)**  
  - **Why:** make “done” checkable (not “do it well”).  
  - **Owner:** author + reviewer (acceptance).  
  - **Done when:** criteria are measurable/verifiable; include negative scenarios and edge cases.  
  - **See also:** Chapter 3, Chapter 10.

- **DoD (definition of done)**  
  - **Why:** standardize delivery quality (code, tests, verification, rollback, observability).  
  - **Owner:** the team (process), tech lead/EM (enforcement).  
  - **Done when:** DoD is short, mandatory, and actually checked.  
  - **See also:** Chapter 5 (gates), Chapter 9 (enforcement).

### 2.2 Spec

- **Spec (FR/NFR/AC)**  
  - **Why:** define scope, tradeoffs, and success criteria before implementation.  
  - **Owner:** change author (often Senior/Staff) + stakeholders.  
  - **Done when:** FR/NFR, AC, constraints, and explicit assumptions exist.  
  - **See also:** Chapter 3, Chapter 10.

- **Risk checklist (inside spec / SOP / PR)**  
  - **Why:** capture “what can go wrong” and mitigations without extra bureaucracy.  
  - **Owner:** author + reviewers.  
  - **Done when:** top risks are listed and each has a mitigation + a verification/monitoring method.  
  - **See also:** Chapter 3, Chapter 5, Chapter 7.

### 2.3 Planning

- **Work plan (decomposition)**  
  - **Why:** make the path to the outcome manageable (not “we’ll see”).  
  - **Owner:** author + team.  
  - **Done when:** phases, dependencies, critical path, and gates are defined.  
  - **See also:** Chapter 3.

### 2.3.1 Optional strengthening by risk/maturity triggers

- **Risk register (as a separate artifact)**  
  - **Why:** portfolio-level risk control when risks repeat and you need a unified view.  
  - **When:** when a risk class repeats, spans multiple teams, or the blast radius is high.  
  - **Owner:** author + reviewers; at portfolio level: tech lead/EM/practice owner.  
  - **Done when:** every risk has mitigation, triggers, and a verification/monitoring method.  
  - **See also:** Chapter 3, Chapter 7.

### 2.4 Architecture

- **Architecture document (v1)**  
  - **Why:** define components, responsibility boundaries, and contracts explicitly.  
  - **Owner:** Staff/Principal (or assigned architect).  
  - **Done when:** components/boundaries are clear; tradeoffs and review triggers exist.  
  - **See also:** Chapter 4.

- **ADR (architecture decision record)**  
  - **Why:** preserve “why we decided this” so you don’t reverse-engineer it later.  
  - **Owner:** decision author (often Staff/Principal) + reviewers.  
  - **Done when:** context → decision → consequences → review triggers.  
  - **See also:** Chapter 4.

### 2.5 Implementation and verification (via `SOP` and gates)

- **Change `SOP`**  
  - **Why:** make execution repeatable: steps, stop conditions, checks, outputs.  
  - **Owner:** change author; executor is an engineer (or automation).  
  - **Done when:** gates, verification plan, and stop conditions exist; **rollback path** is defined (usually revert → redeploy); a **rollback plan** is required when risk triggers apply.  
  - **See also:** Chapter 5.

- **Verification plan**  
  - **Why:** prove correctness (sampling + edge cases + metrics).  
  - **Owner:** author; reviewer confirms.  
  - **Done when:** checks are repeatable and yield observable results.  
  - **See also:** Chapter 5, Chapter 10.

- **Verification roles (verifier / test runner)**  
  - **Why:** make quality real: one role implements the change; another independently proves it works.  
  - **Done when:** there is a report of what passed/failed/was not checked + test run outputs (including golden tests when applicable).  
  - **See also:** Chapter 8.

- **PR + human review**  
  - **Why:** quality control and shared accountability.  
  - **Owner:** PR author; reviewer is a human.  
  - **Done when:** description, verification plan, and evidence are attached; rollback path exists (and if required by risk triggers, a detailed rollback plan is attached/tested).  
  - **See also:** Chapter 5.

### 2.6 Deploy and change safety

- **Threat model**  
  - **Why:** list threats and mitigations up front (especially for automation and infra/access changes).  
  - **Owner:** system owner + security reviewers.  
  - **Done when:** assets/threats/vectors/mitigations/checks are described.  
  - **See also:** Chapter 7.

- **Change plan / deployment plan**  
  - **Why:** safe rollout, risk minimization, observability.  
  - **Owner:** engineer/ops (DevOps/SRE) + reviewers.  
  - **Done when:** steps, gates, monitoring metrics, and rollback criteria exist.  
  - **See also:** Chapter 7.

- **Rollback (path vs plan)**  
  - **Why:** return to a stable state quickly when things degrade.  
  - **Owner:** change author.  
  - **Done when:**  
    - **rollback path exists always** (usually revert → redeploy per your standard)  
    - a detailed **rollback plan** (steps, ETA, verification) and ideally a staged rollback test exist **when risk triggers apply** (data/migrations/security/payments/availability/irreversible ops)  
  - **See also:** Chapter 5, Chapter 7.

### 2.7 Operations and incidents

- **Incident `runbook`**  
  - **Why:** repeatable response: steps, windows, checks, escalation.  
  - **Owner:** SRE/on-call team; executor is an engineer (or automation).  
  - **Done when:** triage steps, fix steps, verification, and post-actions are defined.  
  - **See also:** Chapter 6.

- **Debugger as an RCA role**  
  - **Why:** separate root-cause work from risky actions; produce a verifiable `decision packet`.  
  - **See also:** Chapter 6, Chapter 9.

- **Incident report**  
  - **Why:** capture facts, root cause, actions, and improvements; do not lose knowledge.  
  - **Owner:** service team + SRE.  
  - **Done when:** timeline, root cause, fix, follow-ups, and verification of follow-ups exist.  
  - **See also:** Chapter 6.

### 2.8 Measurable quality

- **Eval dataset + golden tests**  
  - **Why:** measure quality and catch regressions before production.  
  - **Owner:** practice/system owner.  
  - **Done when:** eval set is representative; golden tests are stable and run regularly.  
  - **See also:** Chapter 8.

### 2.9 Practice governance (so it works by default)

- **Baseline + quality gates**  
  - **Why:** make quality and safety mandatory, not optional.  
  - **Owner:** practice/platform owner (often Staff/Principal) + leadership.  
  - **Done when:** mandatory-gate rules exist and enforcement exists (for example, through CI/CD).  
  - **See also:** Chapter 9.

---

## 3) Minimal templates (minimal sufficient)

### 3.1 DoD (minimal)

```markdown
## DoD (definition of done)

- [ ] Acceptance criteria (AC) are met and verified
- [ ] Verification plan is executed: sampling + edge cases
- [ ] No new linter warnings
- [ ] Rollback path is defined (usually revert → redeploy); rollback plan and rollback test exist when required by risk triggers
- [ ] `runbook` is updated (if the change affects operations)
- [ ] Risks/tradeoffs are documented (and decisions are captured when needed)
```

### 3.2 ADR (minimal)

```markdown
# ADR: <short decision title>

## Context
- <what is happening, constraints, key signals/facts>

## Decision
- <what we chose and why>

## Consequences
- <what got easier/harder, what debt/risks appear>

## When to revisit
- <triggers: load growth, new requirements, incidents, SLOs, etc.>
```

---

<a id="decision-packet-contract"></a>
### 3.3 Decision packet (minimal contract)

A `decision packet` makes a decision **verifiable**: it separates facts from hypotheses, captures risk, and clearly shows what requires human approval.

**Minimal fields (meaning matters more than field names):**
- `summary`: 1–3 sentences: what happened / what we do next.
- `timeline[]`: key events with timestamps.
- `hypotheses[]`: hypotheses with confidence + why (which facts support them).
- `evidence[]`: evidence (logs/metrics/dashboard links/PRs)—no “seems like”.
- `next_checks[]`: next safe checks (safe by default).
- `risk`: what can go wrong (data/security/blast radius) and why it matters.
- `rollback`: how we stop degradation or roll back (if applicable).
- `verification`: how we will validate improvement (metrics/tests/sampling).
- `requires_approval`: what requires human approval and why.
- `unknowns[]`: what we do not know (and what we need to know it).

**Example (JSON):**

```json
{
  "summary": "INC-...: payroll degraded after deploy. Hypothesis: migration/schema. Next: safe checks, then escalation.",
  "timeline": [
    {"time": "02:10", "event": "deploy payroll-service v1.2.3"},
    {"time": "02:12", "event": "5xx spike started"}
  ],
  "hypotheses": [
    {
      "id": "H1",
      "summary": "failed DB migration / schema mismatch",
      "confidence": "MEDIUM",
      "why": ["errors mention missing column", "deploy shortly before incident"]
    }
  ],
  "evidence": [
    {"source": "logs", "snippet": "ERROR: column \"new_field\" does not exist"},
    {"source": "dashboard", "link": "<URL>"}
  ],
  "next_checks": [
    {"id": "C1", "description": "confirm migration status", "safe": true}
  ],
  "risk": {"data_risk": "unknown", "blast_radius": "payroll"},
  "rollback": {"plan": "revert deploy (approval required)"},
  "verification": {"success_criteria": ["5xx back to baseline", "latency p95 < <WINDOW>"]},
  "requires_approval": {"required": true, "reason": "prod change / insufficient evidence"},
  "unknowns": ["migration status", "rollback readiness"]
}
```

---

<a id="skill-router-protocol"></a>
### 3.4 Skill Router: role routing protocol (copy-paste)

This protocol is working discipline for an agent. Before any answer, the agent must select exactly one base role and 0..N checker roles (based on risks/touchpoints), then explicitly record TRACE (what was actually read/used).

```text
ROLE ROUTING (MANDATORY)

Before ANY answer you MUST:
1) Run Skill Router and select roles:
   - base role: exactly 1 main role
   - checker roles: 0..N validating roles (based on risks/touchpoints)
2) Immediately print markers (Markdown):
   - **[ROUTER]:** selected skills = <list> (base=<base>, checkers=<list|none>)
   - **[TRACE]** read: rules=[...]; skills=[...]; refs=[...]
     TRACE rules:
     - list only actually read files (rules/skills/references)
     - use workspace-relative paths for readability
     - if there are many files: first N + “+X more”
3) Then write the answer using role markers only:
   - **[<ROLE>]:** ...
   - **--- [SWITCHING TO <ROLE>] ---**
   - **--- [RETURNING TO <ROLE>] ---**

IF THE ROLE IS NOT DEFINED
A role is “not defined” when:
- no skill from the catalog matches the task/expected behavior
- or the user explicitly requests behavior/style not covered by available skills/project roles

Then you MUST:
- NOT perform the task
- ask the user to provide a Role Spec (template below)
- after receiving Role Spec, treat it as a “project role” and route to it alongside skills

PROJECT ROLES (sticky, per-project)
If this system prompt (or the conversation) contains Role Specs, treat them as available project roles and use them for routing.

ROLE SPEC TEMPLATE (user must provide)
ROLE: <RoleName>
WhoIAm: <1-2 lines>
Goal: <what outcome I’m optimizing for>
Tone: <how I should sound>
Format: <structure / artifacts>
Constraints: <taboos / what not to do>
QualityBar: <how to evaluate the output>
```

---

### 3.5 Scaling long-running autonomy: planners / workers / judge (pattern)

If one agent “drowns” in a large project, the natural move is parallelism. In practice, flat self-coordination via one shared task list often degrades into bottlenecks and fragility. A more stable pattern is role separation:

- **Planners:** continuously explore the system and cut work into tasks.
- **Workers:** take narrow tasks and deliver outcomes without trying to hold the whole picture.
- **Judge:** decides whether to continue the iteration and when to do a fresh start to control drift/tunnel vision.

Reference: [Cursor: Scaling long-running autonomous coding](https://cursor.com/blog/scaling-agents).

## 4) Common mistakes (anti-patterns)

- no DoD: “done” becomes opinion; quality fluctuates.
- no ADR: later you reconstruct decisions via archaeology.
- no rollback path (and no rule for when a full plan is required): any failure becomes a high-MTTR incident.
- no `runbook`: heroics, not repeatable response.
- no eval/regression set before deploying changes: regressions ship to production.

