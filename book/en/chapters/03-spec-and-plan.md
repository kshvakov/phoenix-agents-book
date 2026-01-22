---
title: "Chapter 3: spec v1 + plan v1"
description: "How to turn a task into a manageable project: spec v1, a work plan, a risk register, and verifiable done criteria."
lastmod: 2026-01-21
weight: 3
---

# Chapter 3: spec v1 + plan v1

## Prologue: from analysis to design

In Chapters 1–2 you learned how to get value from an agent quickly and safely.

Now the VP of Engineering says: "Good. Now turn this into a manageable Phoenix Project: what exactly are we shipping in v1, what are the risks, and how do we verify the release is actually delivered."

Lance Bishop thinks: "This is no longer a one-off task. This is a project. We need a spec."

**The difference:**
- **A single task:** "analyze the logs" → fast output
- **A project:** Phoenix Project → you need a spec, a plan, and architecture

---

## A scene from "The Phoenix Project" (2014)

**Book chapters 10-11: Erik Reid asks Bill about requirements**

Erik Reid (an ops consultant and Bill Palmer’s mentor) comes to Parts Unlimited to understand Phoenix Project. He sits down with Bill and asks simple questions.

**Erik:** "Show me the requirements for Phoenix Project."

**Bill:** "Requirements? Well… they exist. In developers’ heads. In Jira. And in email threads with the business."

**Erik:** "Do you have a formal spec?"

**Bill:** "No. We’re Agile. We don’t write specs. We have user stories."

**Erik:** "Okay. What about non-functional requirements? Performance, security, reliability?"

**Bill:** (silence) "Well… we assume the system should be fast and safe."

**Erik:** "What does ‘fast’ mean? p95 latency below a threshold? Within an SLA?"

**Bill:** "I don’t know. We never wrote it down."

**Erik:** "Risk management? What are the project risks? What are the mitigation plans?"

**Bill:** "Risks?" (nervous laugh) "We’re just hoping we get lucky."

**Erik stays silent and looks at Bill.**

**What happens when you don’t have a spec (a real story from the book):**

Months later Phoenix Project hits a crisis: the team forgot about PCI DSS compliance. That is a critical NFR—without it you cannot process card payments.

They discover it right before release.

Options:
1. Delay release by months (implement PCI DSS compliance)
2. Ship without card payments (half the functionality does not work)

They pick option 1. Release slips. The CEO is furious. The team panics.

**Erik:** "This is what happens when there’s no formal spec. Critical NFRs get ‘forgotten’. Assumptions aren’t checked. Risks aren’t mitigated."

**Core problems of the 2014 approach:**
- no formal spec: requirements live in people’s heads
- no single source of truth: knowledge is scattered across people/tickets/email
- assumptions everywhere: "we assume that…"
- NFRs get ignored: focus on features, not performance/security/reliability
- no risk management: "we hope we get lucky"

---

## The same problem in 2026: a spec v1 for Phoenix Project with an AI agent

**Context:** Lance receives the task “ship Phoenix Project.” Instead of assumptions, he formalizes requirements.

**Approach (2026):**

Lance uses chat mode (for example, ChatGPT/DeepSeek) to draft a spec v1:

```
Role: you are a business analyst helping formalize requirements.

Context:
- Company: Parts Unlimited (2026)
- Project: Phoenix Project (customer platform) — Phoenix Project v1 release
- Problem: Phoenix Project is slipping; releases and changes are unstable; risks surface too late
- Critical risk: “forgotten NFRs” (for example, PCI DSS for payments)

Task:
Create a spec v1 for Phoenix Project (Phoenix Project v1 release).

Quality rules:
- Do not invent facts/requirements. Anything not given explicitly must be phrased as a question or an assumption with a label.
- If context is insufficient, start with a **Questions to clarify** block (up to 10 items), then provide a draft spec with `TBD` markers.

Spec structure:
1. Project goal (1–2 sentences)
2. Functional requirements (FR): must/should/nice-to-have
3. Non-functional requirements (NFR): performance/reliability/security/maintainability
4. Acceptance criteria: measurable metrics

STOP CONDITIONS:
- If the business goal is unclear, ask a question
- Do NOT invent requirements that were not mentioned
```

**Time to execute:**
- the agent drafts spec v1: fast
- Lance reviews and edits: fast
- **Total:** a fast loop with verification

**Result (spec v1 excerpt):**

Note: examples below use placeholders like `<WINDOW>/<THRESHOLD>/...`. See the glossary: [Placeholder notation]({{< relref "appendix/glossary.md" >}}#placeholder-notation).

```markdown
## Non-functional requirements (NFR)

### Performance
- NFR-1: analysis latency: ≤ <WINDOW> for <N> deployments
- NFR-2: throughput: ≥ 1000 deployments/hour

### Security
- NFR-5: the agent operates in read-only mode, with no writes/deletes in production
- NFR-6: audit log: all agent actions are logged
- NFR-7: no sensitive data in agent logs (credentials, PII)

### Acceptance criteria
- AC-2: latency ≤ <WINDOW> for <N> deployments (measured by timer)
- AC-4: the agent runs in read-only mode (manual security review)
```

**Verification:**

Lance checks the spec:
- all FRs are explicit (no silent assumptions)
- NFRs are measurable (metrics and thresholds, not “fast” or “secure”)
- AC is verifiable (how we know the project succeeded)

He shows it to the VP of Engineering. VP: "Security? Audit log? PCI compliance?"

Lance: "Yes, covered. NFR-7: no sensitive data. If we need PCI DSS compliance, we add it explicitly."

**2014 vs 2026**

| Metric | Bill Palmer (2014) | Lance Bishop (2026) |
|---|---|---|
| **Formal spec** | no (requirements in heads) | yes (spec v1 documented) |
| **NFRs** | ignored (“we assume fast”) | explicit: latency ≤ <WINDOW> |
| **Acceptance criteria** | vague (“it works”) | measurable: latency, coverage, availability |
| **Risk management** | “hope we get lucky” | risk register: 5–7 risks + mitigation |
| **Time to produce a spec** | did not exist | fast: agent + review |
| **Forgotten NFRs** | yes: PCI compliance → delay | no: NFRs are explicit in the spec |

**What changed:**
- formalization: requirements live in a document, not in heads
- explicit NFRs: no “we assume secure” → “no sensitive data in logs”
- measurable AC: “it works” → “latency ≤ <WINDOW>, measured by a timer”
- risk management: “hope” → a risk register with mitigation

**What did not change:**
- human responsibility: Lance reviews the spec (agents can miss NFRs)
- domain expertise still matters: PCI compliance, p95 latency, security audit
- review is mandatory: an agent draft is not a final spec

---

In this chapter you will learn how to:
- write a spec v1 (FR/NFR/AC)
- create a plan v1: decomposition, risk register, estimates
- use an agent for decomposition and risk discovery

---

## Quick start: spec v1

### Goal

Create a spec v1 for Phoenix Project (Phoenix Project v1 release): functional requirements, non-functional requirements, and acceptance criteria.

### Scene: Phoenix Project

**Context:** the VP of Engineering wants to push Phoenix Project to launch.  
**Stakes:** if the spec is incomplete, we build the wrong thing and lose weeks.  
**Task:** formalize what we are building in spec v1.

### Inputs

- business goal: ship Phoenix Project v1 (a customer product) with acceptable quality and safety
- context from Chapters 1–2: what the agent can already do (collect evidence, formalize requirements, analyze artifacts)

### Prompt for the agent (copy-paste ready)

```
Role: you are a business analyst helping formalize requirements for a project.

Context:
- Company: Parts Unlimited (2026)
- Project: Phoenix Project (customer platform) — Phoenix Project v1 release
- Problem: Phoenix Project is slipping and risks surface too late
- Critical risk: PCI DSS for payments

Task:
Create a spec v1 for Phoenix Project (Phoenix Project v1 release).

Quality rules:
- Do not invent requirements. If information is missing, start with questions and label unknowns as `TBD`.
- Clearly separate **requirements** from **assumptions** and **risks** (do not mix them).

Spec structure:
1. **Project goal** (1–2 sentences)
2. **Functional requirements (FR)**
   - requirements list (what the system must do)
   - priorities: must/should/nice-to-have
3. **Non-functional requirements (NFR)**
   - performance: latency, throughput
   - reliability: availability, error rate
   - security: authorization, audit log, data sensitivity
   - maintainability: code quality, tests
4. **Acceptance criteria**
   - how we verify successful delivery
   - measurable metrics: numbers, not “improve”

Output format: Markdown with a clear structure.

STOP CONDITIONS:
- If the business goal is unclear, ask a question
- If context is insufficient, list what data is needed
- Do NOT invent requirements that were not mentioned
```

### Example output (spec v1)

```markdown
# Spec v1: Phoenix Project — Phoenix Project v1 release

## 1. Project goal

Ship Phoenix Project v1 (a customer product) with measurable NFRs and repeatable quality gates so the business stops losing money to delays and emergency releases.

Expected outcome: a predictable release cycle, measurable NFRs, and explicit acceptance criteria instead of heroics.

## 2. Functional requirements (FR)

### Must
- **FR-1:** catalog: browse, search, product page
- **FR-2:** cart: add/remove/update quantity
- **FR-3:** checkout: submission, validation, idempotency
- **FR-4:** payments: provider integration (PCI boundary)
- **FR-5:** orders: create/status/history

### Should
- **FR-6:** inventory/ERP integration: reserve/commit
- **FR-7:** user notifications about order status
- **FR-8:** minimal admin operations for support

### Nice-to-have
- **FR-9:** personalization/recommendations
- **FR-10:** checkout A/B tests

## 3. Non-functional requirements (NFR)

### Performance
- **NFR-1:** p95 checkout latency: ≤ <WINDOW>
- **NFR-2:** throughput: ≥ <N> checkout/min (peak)

### Reliability
- **NFR-3:** key-path availability (browse/checkout): <VALUE>, error budget ≤ <BUDGET>/<WINDOW>
- **NFR-4:** checkout error rate: ≤ <VALUE>

### Security
- **NFR-5:** PCI DSS: payments boundary is isolated; minimize data touch
- **NFR-6:** audit log for order/payment events
- **NFR-7:** no secrets/PII in logs (redaction)

### Maintainability
- **NFR-9:** code coverage: ≥ 80% (unit + integration)
- **NFR-10:** docs: README, `runbook`, SOPs for typical tasks

## 4. Acceptance criteria

### AC-1: functionality
- the agent parses 100 deployments from a test dataset
- statistics are correct (verified manually on 10 deployments)
- hypotheses are sorted by likelihood

### AC-2: performance
- latency ≤ <WINDOW> for <N> deployments (measured by timer)
- throughput ≥ 1000 deployments/hour (load test)

### AC-3: reliability
- error rate ≤ 5% (measured on 100 deployments: false positives/misses)
- availability <VALUE> (availability monitoring over a period)

### AC-4: security
- the agent runs read-only; no writes/deletes against production logs
- the audit log captures all agent actions
- agent logs contain no credentials/PII (manual review)

### AC-5: maintainability
- coverage ≥ 80% (measured by a coverage tool)
- docs are complete: README and `runbook` reviewed
```

### Result verification (checklist)

- the project goal is 1–2 sentences
- FRs are grouped into must/should/nice-to-have
- NFRs cover performance/reliability/security/maintainability
- AC are measurable: numbers, not “improve”
- the spec is reviewable: another engineer can understand what we are building

### Expected outcome

**Artifact:** a spec v1 in Markdown

**Time:**
- agent draft: fast
- review and edits: fast

**Value:**
- scope is explicit: “what we are building” is captured
- measurability: AC lets you verify delivery
- reviewability: the team can review and give feedback

---

## Theory: a spec as a contract

### Concept 1: functional vs non-functional requirements

You design systems. You know the difference between **what** (FR) and **how** (NFR).

**Functional requirements (FR):**
- what the system must do
- example: “the agent parses CI/CD logs”

**Non-functional requirements (NFR):**
- how the system must do it: performance/reliability/security
- example: “latency ≤ <WINDOW>”

**Why NFRs matter:**

In 2014 Phoenix Project slipped by months because the team forgot PCI DSS compliance—a critical NFR for processing card payments. They discovered it right before release. Erik asked Bill: “Do you have a formal spec with NFRs?” Bill: “No, we’re Agile.” Erik: “This is what happens when NFRs get ‘forgotten’.”

In 2026 explicit NFRs prevent that class of failure:
- security: PCI compliance required (if payments exist)
- performance: latency ≤ <WINDOW>
- audit: all actions are logged

If NFRs are in the spec, they’re hard to forget. If they live in heads, you forget and discover it right before release.

**For agent work:**

Agents tend to focus on FRs and ignore NFRs unless you ask explicitly.

**A real story:**

On the ZAPAD project we asked an agent to “design an API for deployment analysis.” The agent produced a neat design:
- endpoints: GET /catalog, POST /checkout, GET /orders/{id}
- request/response formats: JSON
- error handling: HTTP status codes

But it missed NFRs:
- performance: no latency target
- security: auth not mentioned
- reliability: no retry behavior

We implemented the design. Result: the API works but is slow, unauthenticated, and brittle.

**Fix:** we added NFRs explicitly: “latency ≤ <WINDOW>, API key auth, retries on transient errors.”

**Takeaway:** agents do not infer NFRs automatically. You must ask.

### Concept 2: prioritization

You have run projects. You know that not all requirements are equally important.

**Prioritization:**
- **must:** without it the project has no meaning
- **should:** valuable but can slip to v2
- **nice-to-have:** only if there is time

**Why this matters for agent work:**

Agents do not know priorities unless you state them.

**A real story:**

On the ASIMOV project we asked an agent to “decompose a project into tasks.” It returned 50 tasks, all marked “important.”

We started execution and a week later realized we were building nice-to-have features (like “Slack integration”) while must-have work (“log parsing”) wasn’t done.

**Fix:** we asked the agent to prioritize must/should/nice-to-have. It reshuffled tasks and we focused on must-haves.

**Takeaway:** without explicit prioritization, the agent treats everything as equal.

### Concept 3: acceptance criteria as definition of done

You know that without DoD a task is never “done.”

**Acceptance criteria are the project’s DoD:**
- how do we know the project is delivered successfully?
- measurable metrics: numbers, not adjectives

**Why this matters for agent work:**

Agents do not understand “improve”, “optimize”, “better.”

**A real story:**

On MORPHEUS we asked an agent to “optimize performance.” It suggested:
- “use caching”
- “add DB indexes”
- “parallelize queries”

We implemented it all. Latency dropped but still missed the target.

The VP asked: “Is it good enough?”

We couldn’t answer. There was no AC.

**Fix:** we added AC: “latency ≤ <WINDOW> for <N> deployments.” Now it is clear: if the threshold isn’t met, we keep optimizing.

**Takeaway:** acceptance criteria make success measurable.

### Concept 4: risk management

You know risks must be identified and mitigated—not “hoped away.”

In 2014 Erik asked Bill: “What are the project risks and mitigations?” Bill: “We’re hoping we get lucky.” Result: Phoenix Project slipped due to forgotten NFRs (PCI compliance) — an unmanaged risk.

In 2026 a risk register makes risks explicit:
- Risk 1: forgotten NFRs (PCI, compliance) → mitigation: explicit NFRs in the spec
- Risk 2: underestimated complexity → mitigation: add buffer (for example, 20%)
- Risk 3: unclear requirements → mitigation: stakeholder review of the spec

**For agent work:**

Agents can help discover risks if you ask explicitly (“list 5–7 risks with likelihood/impact”), but you must review mitigations—agents can propose unrealistic plans.

---

## Practice: plan v1 — work decomposition + risks

### Purpose

Create a plan v1 for the project: work breakdown, risk register, and time estimates.

### Inputs

- spec v1 (FR/NFR)
- project context (team, timeline, constraints)

### Prompt for the agent

```
Role: you are a project manager helping create a project plan.

Context:
- Project: Phoenix Project (customer platform) — Phoenix v1 release
- Spec: [attach spec v1]
- Team: 1 senior backend engineer (Richard Hendricks), 3 people total (dev/infra/QA)
- Timeline: a few weeks

Task:
Create a plan v1 for the project.

Quality rules:
- Do not invent tasks: every task must trace back to a spec item or an explicit risk/mitigation.
- If inputs are insufficient (spec/team/timeline), start with questions and mark unknowns as `TBD`.
- Explicitly mark the critical path, dependencies, and assumptions.

Plan structure:
1. **Work breakdown**
   - decompose the project into tasks (granularity: a few days per task)
   - for each task: name, description, dependencies, estimate
   - prioritize: must/should/nice-to-have

2. **Risk register**
   - list 5–7 risks
   - for each: description, likelihood (low/medium/high), impact (low/medium/high), mitigation
   - sort by criticality: likelihood × impact

3. **Time estimate**
   - critical path: which tasks block release
   - total estimate: sum of estimates
   - buffer: 20% for unknowns

Output format: Markdown with tables.

STOP CONDITIONS:
- If the spec is unclear, ask a question
- If context is insufficient (team, timeline), list what you need
- Do NOT invent tasks that are not covered by the spec
```

### How to make the plan delegatable (a handoff contract for sub-tasks)

A plan v1 is useful for humans. It becomes especially valuable when you start delegating tasks to agents/workers who operate in separate context and do not “remember” your main conversation.

Practical rule: if a task can be delegated to a specialized worker role, it must be self-contained and verifiable.

**Minimal sub-task card (what you need for stable delegation):**
- **Goal:** 1–2 sentences (what output you need).
- **Inputs:** concrete artifacts (files/links/spec excerpts/tables). Avoid vague instructions like “figure out the repo.”
- **Guardrails:** permissions (default `read_only`), bans, limits (time/cost), STOP conditions.
- **Output format:** structure (table/JSON/Markdown sections) so the next step can consume it without manual glue.
- **DoD:** how to verify the task is actually done (test, metric, checklist).

That is why a good plan v1 must include not just “what to do” but also “how to check it”—otherwise delegation becomes faith in prose.

#### When a sub-task stabilizes, package it as a “skill”

A good sign of maturity: the same sub-task repeats, has clear inputs/outputs, checks, and STOP conditions. At that point, stop copy-pasting it between chats and turn it into a portable knowledge/procedure package: a short “when to use” description, a “how to execute” procedure, plus templates and references.

In industry, this is often structured as skills: a folder with `SKILL.md` (instructions + metadata) and, optionally, `references/` (background), `assets/` (templates), and `scripts/` (repeatable checks). The key principle is progressive disclosure: show the skill catalog first, then load full details only for the chosen skill (context economy).[^agentskills-spec]

### Example output (plan v1)

```markdown
# Plan v1: Phoenix Project — Phoenix v1 release

## 1. Work breakdown

### Phase 1: foundation — week 1

| ID | Task | Description | Dependencies | Estimate | Priority |
|---|---|---|---|---|---|
| T1 | Project setup | Create repo, set up CI/CD, prepare tooling | - | 1 day | MUST |
| T2 | Log parsing | Implement CI/CD log parser | T1 | <DAYS> | MUST |
| T3 | Data extraction | Extract date, status, duration, failed_step | T2 | <DAYS> | MUST |

### Phase 2: analysis — week 2

| ID | Task | Description | Dependencies | Estimate | Priority |
|---|---|---|---|---|---|
| T4 | Compute stats | Compute success/failure ratio, top-3 reasons | T3 | <DAYS> | MUST |
| T5 | Build hypotheses | Propose multiple root-cause hypotheses | T4 | <DAYS> | MUST |
| T6 | Verification plan | Write a verification plan for outputs | T5 | 1 day | MUST |

### Phase 3: quality and safety — week 3

| ID | Task | Description | Dependencies | Estimate | Priority |
|---|---|---|---|---|---|
| T7 | Unit tests | Write unit tests: coverage ≥ <VALUE> | T2-T6 | <DAYS> | MUST |
| T8 | Integration tests | Write integration tests | T7 | <DAYS> | MUST |
| T9 | Security check | Audit log, read-only mode, no sensitive data in logs | T8 | <DAYS> | MUST |

### Phase 4: deployment and documentation — week 4

| ID | Task | Description | Dependencies | Estimate | Priority |
|---|---|---|---|---|---|
| T10 | Deploy to staging | Deploy to staging, load test | T9 | <DAYS> | MUST |
| T11 | Documentation | README, `runbook`, SOP | T10 | <DAYS> | MUST |
| T12 | Deploy to production | Deploy to production + monitoring | T11 | 1 day | MUST |

### Optional (if there is time)

| ID | Task | Description | Dependencies | Estimate | Priority |
|---|---|---|---|---|---|
| T13 | Slack integration | Slack notifications | T12 | <DAYS> | NICE_TO_HAVE |
| T14 | Grafana dashboard | Dashboard for agent metrics | T12 | <DAYS> | NICE_TO_HAVE |

## 2. Risk register

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | CI/CD logs have inconsistent formats | High | High | Support 3–5 formats: plain text, JSON, YAML; add fallback for unknown formats |
| R2 | Performance is insufficient: latency > <WINDOW> | Medium | High | Run load testing early; if latency > <WINDOW> → optimize (caching, parallel parsing) |
| R3 | The agent produces false positives (hypotheses are off) | Medium | Medium | Verification plan is mandatory; validate on historical data: accuracy ≥ 95% |
| R4 | Security violation (agent logs sensitive data) | Low | High | Security review in week 3; audit log review; no credentials/PII in logs |
| R5 | Dependencies unavailable (CI/CD system is down) | Low | Medium | Retries; degrade to cached data |
| R6 | Team capacity risk (senior engineer can’t make the timeline) | Medium | Medium | Prioritize MUST; push NICE_TO_HAVE to v2 |
| R7 | Scope creep (stakeholders add requirements mid-flight) | Medium | Low | Freeze spec v1; new requirements go to v2 |

**Criticality: likelihood × impact**
1. R1: High × High → critical
2. R2: Medium × High → critical
3. R4: Low × High → critical
4. R3: Medium × Medium → medium
5. R6: Medium × Medium → medium
6. R5: Low × Medium → low
7. R7: Medium × Low → low

## 3. Time estimate

**Critical path:** T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10 → T11 → T12

**Total estimate:**
- Phase 1: <DAYS>
- Phase 2: <DAYS>
- Phase 3: <DAYS>
- Phase 4: <DAYS>
- **Total:** <DAYS> (~<WEEKS>)

**Buffer (<PERCENT>):** <DAYS> (~<WEEK>)

**Total with buffer:** <DAYS> (~<WEEKS>)

**Verdict:** if the team is at full capacity, the timeline may be tight. Recommendation:
- push NICE_TO_HAVE (T13–T14) to v2
- add a buffer of <WEEK>, total: <WEEKS>
- or add resources (one more engineer for Phase 3)
```

### Result verification (checklist)

- decomposition exists (a few days per task)
- dependencies are explicit (which tasks depend on which)
- risk register lists 5–7 risks (likelihood/impact/mitigation)
- time estimate is realistic: total + buffer
- critical path is identified (what blocks release)

### Expected outcome

**Artifact:** plan v1 in Markdown

**Time:**
- agent draft: fast
- review and edits: fast

**Value:**
- decomposition: the project is broken into tasks
- risks are identified: mitigation plan exists
- estimation: you can plan a sprint without guesswork

---

## Common mistakes

### Mistake 1: a spec without NFRs

**Symptom:** the spec includes only FRs (what to do) but not NFRs (how to do it).

**Example:**
Spec: “The agent parses logs, computes stats, proposes hypotheses.”

But no NFRs:
- latency (how long analysis takes)
- reliability (what error rate is acceptable)
- security (read-only mode, audit log)

**Why it happens:**
Agents focus on FRs because they feel “obvious.” NFRs require explicit prompting.

**Consequence:**
You build a system that “works” but is slow/unsafe/unreliable.

**How to avoid it:**
Ask explicitly for NFRs in the prompt:

```
Create a spec with FR and NFR: performance/reliability/security/maintainability.
```

### Mistake 2: acceptance criteria without metrics

**Symptom:** AC uses “improve”, “optimize”, “better” (not measurable).

**Example:**
AC: “The agent should analyze logs faster.”

Faster by how much? 10%? 2x? Undefined.

**Why it happens:**
Without guidance, the agent produces vague language instead of measurable criteria.

**Consequence:**
You cannot tell whether the project succeeded.

**How to avoid it:**
Require measurable metrics:

```
AC must be measurable: numbers, not “improve”.
Example: “latency ≤ <WINDOW>” (not “faster”).
```

### Mistake 3: decomposition is too small or too large

**Symptom:** the plan breaks work into one-hour tasks (too fine) or multi-week tasks (too coarse).

**Example:**
Too fine:
- T1: “Create main.go” (1 hour)
- T2: “Import libraries” (<WINDOW>)

Too coarse:
- T1: “Implement the entire agent” (weeks)

**Why it happens:**
The agent doesn’t know the intended granularity unless you say it.

**Consequence:**
- too fine → tracking overhead
- too coarse → no visibility

**How to avoid it:**
Specify granularity explicitly:

```
Decompose into tasks (granularity: a few days per task).
```

---

## Summary

### What we did

- Created a spec v1 with FR, NFR, and acceptance criteria as measurable metrics
- Created a plan v1 with work breakdown, a risk register, and time estimates
- Used an agent for decomposition and risk discovery

### Artifacts

- **Spec v1:** FR/NFR + acceptance criteria
- **Plan v1:** work breakdown (tasks/dependencies/estimates) and risk register (likelihood/impact/mitigation)

### Key principles

1. **A spec as a contract:** FR (what) + NFR (how) + AC (how to verify)
2. **Prioritization:** must/should/nice-to-have (not all requirements are equal)
3. **Risk management:** identify risks early; have mitigations ready

### Acceptance criteria

You have mastered the chapter if you can:
- write a spec v1: FR + NFR + measurable acceptance criteria
- produce a plan v1: decomposition (tasks/dependencies/estimates) + risk register (likelihood/impact/mitigation)
- state task granularity explicitly (not “hours” and not “weeks”)

### Next steps

In **Chapter 4** you will learn how to:
- design architecture v1 (components, APIs, tradeoffs)
- use an agent for system design
- validate architecture through ADRs (architecture decision records)

**Hook:** you know what to build (spec) and how to break it down (plan). Next: how do you design the solution? Which components? Which tradeoffs?

---

**From requirements to a plan. You have taken the third step.**

[^agentskills-spec]: Open format “Agent Skills” specification (`SKILL.md`, `scripts/`, `references/`, `assets/`, progressive disclosure): [Agent Skills Specification](https://agentskills.io/specification).

