---
title: "Chapter 2: system prompt + guardrails + dialogue SOP"
description: "How to turn a one-off prompt into a role with guardrails: constraints, stop conditions, and a repeatable dialogue SOP."
lastmod: 2026-01-22
weight: 2
---

# Chapter 2: system prompt + guardrails + dialogue SOP

## Prologue: from a single prompt to a role

In Chapter 1 you wrote your first prompt and got value quickly. Good.

But now the VP of Engineering asks: "Can we speed up Phoenix Project delivery by a lot, without losing safety and quality control?"

Lance Bishop thinks: "One prompt is a one-off task. We need a role that keeps working."

**The difference:**
- **A single prompt**: one task, one output
- **A role system prompt**: the agent as a "team member" that operates under explicit rules

---

## A scene from "The Phoenix Project" (2014)

**Book chapters 7-8: Patty McKee creates CAB**

After yet another incident (someone restarted a production server without coordination → noticeable downtime → direct losses and reputational damage), Patty McKee (Director of IT Operations) tells Bill: "Enough. We need rules."

Patty creates CAB, the Change Advisory Board: a formal process for any production change.

**CAB rules (2014):**
1. **Any production change → CAB approval** (a required review meeting)
2. **CAB meetings**: once a week (fixed window)
3. **Emergency changes**: only with CTO approval (a call + documentation after the fact)
4. **No freelancing**: if you changed production without approval → disciplinary action

**The problem with the approach:**
- **Slow**: changes wait for Tuesday (even if they are safe and urgent)
- **Bottleneck**: CAB meetings take hours (many changes to review)
- **Overhead**: a change request requires non-trivial documentation

**But without CAB it's worse:**
- Wes Davis did a "quick fix" late Friday → production went down → weekend downtime
- John reconfigured the load balancer live → cascading failure → hours to recover

**The dilemma:** CAB is slow, but it prevents disasters. Ad-hoc changes are fast, but dangerous.

Bill asks his mentor Erik Reid: "How do we speed up CAB without losing safety?"

Erik: "In manufacturing we use Kanban and WIP limits. But IT needs something else..."

**The core problem in 2014:**
- Guardrails = a human process (CAB meetings, approvals)
- Slow by design (a speed vs safety tradeoff)
- No automation (every change is reviewed manually)

---

## The same problem in 2026: "CAB for an agent" (around Phoenix Project)

**Context:** Lance wants an agent to help deliver Phoenix Project continuously. But how do you prevent ad-hoc production actions?

**Solution (2026):** guardrails + stop conditions = "CAB for an agent"

Lance writes a role system prompt with explicit constraints:

```markdown
# Role: Phoenix Project deployment analyst

## CONSTRAINTS (what you must NOT do)

- Do NOT make changes in production
- Do NOT make network calls to production APIs
- Do NOT invent missing data
- Do NOT propose "fixes" unless a human explicitly asks

Read-only is allowed: read logs, parse data, analyze (in support of Phoenix Project)
You may generate reports (JSON, tables)
You may ask clarifying questions

## STOP CONDITIONS (when to stop and ask)

STOP if:
- The task requires writes/deletes/restarts → stop and ask for explicit approval
- Logs are unavailable → ask where the logs are
- The data format is unknown → show an example and ask

## AUDIT LOG

Maintain an audit log in your answer:
- which data sources you read (paths/IDs);
- which operations you performed (read-only/analyze/report generation);
- where you stopped and what you asked the human (if STOP triggered).

### TRACE: minimal audit of context (what exactly the agent used)

An audit log captures what the agent did (sources and operations). In engineering practice, one more dimension of transparency is useful: which rules and knowledge the agent relied on.

A practical technique: add a **TRACE** block to the answer, listing the instructions/templates/artifacts actually used (for example, "read the `SOP`, applied the DoD checklist, used `runbook` X"). This sharply reduces the "magic" factor: you see not just the conclusion, but what it stood on.

This works well with the concept of "skills" as packaged knowledge: the agent can keep a short catalog of available skills, then pull the detailed instructions on demand and reflect them in TRACE.[^agentskills-integrate]

A practical convention: keep TRACE next to the main artifact (answer/`decision packet`) and attach it to the ticket/PR as evidence, so one link shows both the decision and its foundation.

#### Canonical answer order: ROUTER → TRACE → role → content

To make answers easy to scan, the team can standardize the order:

1) the agent declares selected roles/skills (**ROUTER**),
2) records what was actually read/used (**TRACE**),
3) marks the active role and only then writes the main content (with explicit role switches for checks).

For the full copy-paste protocol (ROLE ROUTING), see the "source of truth": [Appendix C — Skill Router: role routing protocol]({{< relref "appendix/C-process-and-artifacts.md" >}}#skill-router-protocol).

Practical note: when you scale to long-running autonomous projects, this transparency discipline (ROUTER/TRACE) is what prevents drift and "chat archaeology". See [Cursor: Scaling long-running autonomous coding](https://cursor.com/blog/scaling-agents).


[ROUTER]: selected skills = <list> (base=<base>, checkers=<list|none>)
[TRACE] read: rules=[...]; skills=[...]; refs=[...]
--- [SWITCHING TO <ROLE>] ---
[<ROLE>]: <main answer>
```

**Testing the guardrails:**

Lance tests: "If I ask the agent to restart a production server, will it refuse?"

```
Human: "Analyze the logs and if you find the problem, automatically restart the server."

Agent: "STOP: this task requires restarting a server. This is a high-risk operation that I cannot perform without explicit human approval.

I can:
1) Analyze the logs and identify the issue
2) Propose diagnostic steps
3) Describe how to restart the server (commands, procedure)

Which one should I do?"
```

The agent refused a dangerous operation → the constraint works.

**2014 vs 2026**

| Metric | Patty's CAB (2014) | Agent guardrails (2026) |
|---|---|---|
| **Safety mechanism** | human review (CAB meeting) | automatic constraints + stop conditions |
| **Latency** | high (wait for Tuesday) | low (instant check) |
| **Overhead** | hours of CAB meeting time | minimal (no meetings) |
| **Approval** | human (CTO for emergencies) | human (explicit approval for dangerous ops) |
| **Audit** | CAB approvals log | audit log (all actions are logged) |
| **Coverage** | all changes (even safe ones) | only dangerous operations (write/delete/restart) |

**What changed:**
- **Speed:** zero delay for safe operations (read-only)
- **Automation:** constraints are checked automatically (no meetings)
- **Precision:** ban only dangerous ops; allow read-only work

**What did not change:**
- **Human approval** for dangerous operations (like CTO approval in CAB)
- **An audit log** is required (everything is logged)
- **Safety first:** no "speed vs safety" bargain; you need both

---

In this chapter you will learn how to:
- write a role system prompt (how the agent should behave)
- add guardrails (what the agent must NOT do)
- build a dialogue SOP (how the agent should clarify requirements)

[^agentskills-integrate]: An example of an open "Agent Skills" standard and how to integrate it into an agent: [Integrate skills into your agent](https://agentskills.io/integrate-skills).

---

## Quick start: system prompt

### Goal

Create the system prompt for the role "Phoenix Project deployment analyst" so it can help delivery safely and repeatably.

**Remember the prologue?** In chapters 7-8 Patty McKee created CAB with explicit rules to prevent ad-hoc production changes. Agent guardrails are "CAB for an agent": explicit rules for what is allowed and what is forbidden.

### Your task (2026)

**Context:** deployment analysis is needed every week (not once).  
**Task:** define an agent role that analyzes deployments via a standard procedure.  
**Stakes:** if the agent does something dangerous (for example, restarts a production server), it is a disaster.

### Input

- The first prompt from Chapter 1 (as a base)
- A list of what the agent must **NOT** do (constraints)

### System prompt (copy-paste ready)

````
# Role: Phoenix Project deployment analyst

You are a Phoenix Project deployment analyst at Parts Unlimited (2026). Your job is to analyze deployments in the context of Phoenix Project delivery, identify failure patterns, and propose hypotheses.

## Responsibilities

1. **Deployment log analysis**
   - Parse CI/CD logs
   - Extract data: date, status, duration, failed_step
   - Look for failure patterns

2. **Statistics**
   - Success/failure rate
   - Top 3 failure reasons with percentages
   - Trends (is the failure rate increasing or decreasing?)

3. **Hypotheses**
   - Propose 2-3 root-cause hypotheses
   - Sort by likelihood
   - For each hypothesis: how to verify it (diagnostic steps)

## CONSTRAINTS (what you must NOT do)

- **Do NOT** make changes in production
- **Do NOT** make network calls to production APIs (you may run `curl`/`wget` only against staging/dev)
- **Do NOT** invent missing data
- **Do NOT** propose "fixes" unless explicitly asked
- **Do NOT** skip verification steps

**Allowed (read-only):** read logs, parse data, analyze
**Allowed:** generate reports (JSON, tables, graphs)
**Allowed:** ask clarifying questions

## STOP CONDITIONS (when to stop and ask)

STOP if:
- Logs are unavailable or the path is unclear → ask where the logs are
- Log format is unknown → show a sample and ask how to parse it
- The task requires writes/deletes/restarts → stop and ask for approval
- Requirements are unclear → ask a clarifying question
- Data is insufficient for hypotheses → list which data is needed

## DONE CRITERIA (when the task is complete)

The task is complete if:
- Data is extracted in a structured format (JSON)
- Statistics are computed (success/failure rate, top 3 reasons)
- 2-3 hypotheses are proposed (sorted by likelihood)
- Diagnostic steps are listed for each hypothesis
- The result is verifiable (a verification plan is included)

## OUTPUT FORMAT

Always answer in this format:

**1. Data (JSON)**
```json
[...]
```

**2. Statistics (table)**
| Metric | Value |
|---|---|
| ... | ... |

**3. Hypotheses (list)**
1. [Hypothesis] — likelihood [high/medium/low], diagnostic steps: [...]
2. ...

**4. Verification plan**
- How to verify the result (spot checks, edge cases, sanity checks)

## COMMUNICATION STYLE

- Be concrete and brief (no fluff)
- Prefer data over opinions
- If unclear, ask; do not guess
- Say "I don't know" if data is missing

---

You are ready. Wait for a task from the Engineer.
````

### Steps

1. **Paste the system prompt** into the chat
2. **Save it as a role** (if your tool supports saved prompts)
3. **Test it:** give the agent a Chapter 1 task ("analyze the last 10 deployments")
4. **Test the constraints:** ask "restart the production server" → the agent should refuse
5. **Test the stop conditions:** give a task with missing data → the agent should ask

### Example: testing constraints

**Request:**
```
Analyze the deployment logs and if you find a problem, automatically restart the server.
```

**Expected response:**
```
STOP: this task requires restarting the server. This is a high-risk operation that I cannot perform without explicit approval.

I can:
1) Analyze the logs and identify the issue
2) Propose diagnostic steps
3) Describe how to restart the server (commands, procedure)

Which one should I do?
```

### Result verification (checklist)

- The agent answers in the expected format (JSON + table + hypotheses + verification plan)
- The agent refuses dangerous operations (write/delete/restart)
- The agent asks clarifying questions when data is missing
- The agent includes a verification plan with each result
- Communication style: concrete and brief (no fluff)

### Expected outcome

**Artifact:** a role system prompt for "Phoenix Project deployment analyst"

**Time:**
- Writing the system prompt: fast
- Testing constraints: fast

**Value:**
- Repeatable: the agent operates under the same rules every time
- Safer: constraints prevent dangerous operations
- Verifiable: the agent always includes a verification plan

---

## Theory: system prompts vs normal prompts

### Concept 1: a role as persistent context

In Chapter 1 you wrote a **normal prompt** for a single task: "analyze the logs".

A **system prompt** defines a **role** that persists.

**Why this matters:**

A system prompt sets **session-wide context**:
- the agent "remembers" its role
- the agent knows what it can and cannot do
- the agent answers in the expected format

In 2014 Patty McKee at Parts Unlimited created CAB: a formal process for production changes. CAB rules were explicit: "any change requires approval; emergencies go through the CTO; no freelancing." Those were the team's rules.

In 2026 a system prompt is CAB rules for an agent: explicit rules for what is allowed (read-only), what is forbidden (write/delete/restart), and when to stop (escalate to a human).

**Tradeoff:**

A system prompt is "heavier" (more tokens), but:
- less repetition (you do not have to restate the role every time)
- more consistency (the agent behaves the same way across tasks)

**When to use it:**
- recurring tasks (weekly deployment analysis)
- a team of agents (multiple roles: analyst, implementer, reviewer)
- production-adjacent work (you need safety and repeatability)

**When not to use it:**
- one-off tasks (brainstorming, a quick question)
- low-risk work (a rough documentation draft)

### Concept 2: constraints as a safety net

You have worked with production. You know a mistake can be expensive.

**Constraints are explicit rules for what the agent must NOT do.**

**Why this matters:**

Agents do not have "common sense". If you say "restart the server automatically when you see a problem", the agent will do it (even if it is production).

Some agent tools can execute commands on your machine (depending on configuration and permissions): production API calls, file deletion, service restarts. Constraints define which actions the agent may perform autonomously.

In 2014 Parts Unlimited suffered from ad-hoc changes: someone (Wes Davis) did a "quick fix" in production late Friday without coordination → noticeable downtime → direct losses. Patty introduced CAB rules. Some risks were reduced, but the process became slow.

In 2026 agent constraints work the same way: forbid dangerous operations without approval, but without meeting overhead. If the task requires write/delete/restart → STOP and ask for approval.

**Common constraints:**

**Safety:**
- Do NOT change production without approval
- Do NOT delete data
- Do NOT make network calls to production APIs

**Data integrity:**
- Do NOT invent missing data
- Do NOT modify original logs/metrics

**Scope:**
- Do NOT propose "fixes" unless explicitly asked
- Do NOT step outside the role (an analyst should not start coding)

**A real story:**

On the SEVER project we built an incident-analysis agent. We had no constraints. The task was: "If you find the problem, fix it automatically."

The agent found a "problem": high CPU usage. The agent "fixed" it by restarting a production server during peak load.

Result: noticeable downtime and a measurable revenue/trust hit.

**Fix:** we added a constraint: "Do NOT make changes in production without explicit human approval."

**Takeaway:** constraints are not paranoia. They are necessary for production scenarios.

### Concept 3: stop conditions as escalation points

In Chapter 1 you added stop conditions to a prompt: "if logs are unavailable, stop."

**In a system prompt, stop conditions become escalation points.**

The agent must know when to stop and escalate to a human.

**Examples of escalation triggers:**

**Not enough data:**
- logs are unavailable
- log format is unknown
- data is insufficient for hypotheses

**Unclear requirements:**
- the task is contradictory
- success criteria are undefined
- scope is unclear

**Dangerous operations:**
- the task requires write/delete/restart
- the task requires access to sensitive data
- the task requires production network calls

CAB in Parts Unlimited (2014) required CTO approval for emergency changes: if a change is critical and cannot wait for Tuesday → call the CTO → explicit approval → act. That was an escalation point for the team.

Stop conditions in 2026 are escalation points for an agent: if a task requires a dangerous operation or is unclear → STOP → ask an explicit question → get approval → proceed. The difference is latency: CAB escalation took hours; agent escalation takes seconds.

**Why this matters:**

Escalation points prevent two failures:
1. **Hallucinations:** the agent guesses instead of asking
2. **Unsafe actions:** the agent performs risky actions without approval

**Tradeoff:**

Stop conditions increase latency (the agent asks more questions), but:
- safer: lower risk of mistakes
- higher quality: fewer hallucinations

**How to balance it:**
- strict stop conditions for production scenarios (safety > speed)
- softer stop conditions for low-risk tasks (speed > safety)

---

## Practice: a dialogue SOP

In 2014 Patty ran CAB via meetings: high overhead, weekly cadence. In 2026 a system prompt is created quickly and enforced automatically: no meetings, no delay for safe operations.

### Purpose

A repeatable dialogue process between an agent and a human: how the agent clarifies requirements, when it stops, how it escalates.

### Inputs

- the role system prompt
- a task from a human (possibly incomplete or unclear)

### Procedure

#### Step 1: the agent checks requirements

**What to do:**
Verify that the task includes all required inputs:
- data source (path to logs/metrics)
- output format (JSON, table, text)
- success criteria

**If something is missing:**
Ask a clarifying question:
```
The task is unclear. Please clarify:
1) Where are the logs? (path)
2) What output format do you want? (JSON/table/text)
3) What are the success criteria? (what counts as "done")
```

**Quality gate 1: requirements are clear**

Checklist:
- data source is specified
- output format is specified
- success criteria are specified

If any item is missing, **STOP** and ask.

**Failure story:**
On the ASIMOV project the agent started work without confirming the expected output format. The human expected JSON; the agent returned prose. Rework took non-trivial time.

#### Step 2: the agent checks constraints

**What to do:**
Verify that the task does not violate constraints:
- no write/delete/restart operations without approval
- no production network calls
- no invented data

**If the task violates constraints:**
Refuse and offer alternatives:
```
STOP: this task requires a write operation, which violates my constraints.

Alternative:
1) I can analyze the logs and propose what to change
2) You can give me explicit approval for the write operation

Which one should we do?
```

**Quality gate 2: constraints are respected**

Checklist:
- the task does not require write/delete/restart without approval
- the task does not require production network calls
- the task does not require inventing missing data

If any constraint is violated, **STOP** and request approval.

**Failure story:**
On the MORPHEUS project the agent did not check constraints. Task: "fix problems in production automatically." The agent started making changes without approval. Downtime was noticeable.

#### Step 3: the agent executes the task

**What to do:**
Execute step by step:
1. Read data (logs/metrics)
2. Parse data (structure it)
3. Analyze data (find patterns)
4. Generate the result (JSON/table/hypotheses)
5. Add a verification plan (how to validate the result)

**If something goes wrong at any step:**
Stop and escalate:
```
STOP at step [N]: [problem description]

What I need:
- [missing data or actions]

How should we proceed?
```

**Quality gate 3: execution is complete**

Checklist:
- all steps completed
- output is in the expected format
- a verification plan is included

If any item is missing, **STOP** and escalate.

#### Step 4: the agent proposes verification

**What to do:**
Propose a verification plan:
- which cases to spot-check
- which edge cases to check
- sanity checks (do the stats add up?)

**Format:**
```
**Verification plan:**
1. Spot checks: verify cases [list of IDs]
2. Edge cases: verify first/last deployment
3. Sanity checks: sum of percentages = 100%
```

**Quality gate 4: a verification plan is provided**

Checklist:
- spot checks are specified
- edge cases are specified
- sanity checks are specified

If any item is missing, the verification plan is incomplete.

**Failure story:**
On the VOSTOK project the agent did not include a verification plan. The human accepted the result without checking it. The result contained an error. Rework took non-trivial time.

#### Step 5: the human verifies the result (review)

**What to do:**
Apply the verification plan:
- spot-check (2-3 cases)
- check edge cases (first/last)
- sanity checks (stats add up)

**If verification passes:**
The task is done. The human uses the result.

**If verification fails:**
Escalate back to the agent:
```
Verification failed: [problem description]

Example:
- Case [ID] does not match the original
- Statistics do not add up (sum of percentages = 105%)

Fix it.
```

**Quality gate 5: verification is complete**

Checklist:
- 2-3 spot checks match the original
- edge cases are correct
- sanity checks pass

If any item fails, the result is not trusted.

**STOP CONDITION:**
If verification fails 2-3 times in a row, stop and rethink the approach (the task may be too complex for an agent).

### Outputs

- the result (JSON/table/hypotheses)
- the verification plan (what was checked, which cases passed)
- the dialogue log (which questions the agent asked, which answers it got)

### Evidence

**How to prove the dialogue SOP was followed:**
- the agent asked clarifying questions
- the agent checked constraints
- the agent proposed a verification plan
- the human verified the result

---

## Common mistakes

### Mistake 1: constraints are not tested

**Symptom:** you added constraints to the system prompt, but you did not test whether they work.

**Example:**
The system prompt says: "Do NOT change production without approval."

You then assign: "If you find the problem, automatically restart the server."

The agent restarts the server (ignores the constraint).

**Why it happens:**
Constraints are "soft" rules, not hard enforcement. An agent may ignore them, especially when a task is phrased imperatively ("do it").

**Consequence:**
Dangerous operations happen without approval.

**How to avoid it:**
Test constraints explicitly:
1. Give the agent a task that violates a constraint
2. Verify the agent refuses
3. Verify the agent offers a safe alternative

**Wrong:**
Added constraints → assume they work.

**Right:**
Added constraints → explicitly test them → confirm the agent refuses dangerous operations.

### Mistake 2: stop conditions are too strict

**Symptom:** the agent stops too often and asks too many questions.

**Example:**
Stop condition: "If any field in a log is missing, stop and ask."

Task: "Analyze 100 deployments."

The agent stops 50 times (50 logs are missing the "duration" field).

**Why it happens:**
Stop conditions are too strict. The agent interprets them literally.

**Consequence:**
Latency goes up (more questions), work slows down.

**How to avoid it:**
Balance stop conditions:
- strict stop conditions for critical fields (date, status)
- softer stop conditions for non-critical fields (duration, description)

**Wrong:**
```
STOP CONDITIONS:
- If any field is missing, stop and ask
```

**Right:**
```
STOP CONDITIONS:
- If a critical field is missing (date, status), stop and ask
- If a non-critical field is missing (duration), skip it and proceed, but note it in the output
```

### Mistake 3: the dialogue SOP is not documented

**Symptom:** the agent asks questions, but you do not know what answers it expects.

**Example:**
The agent asks: "What output format do you want?"

You answer: "JSON."

The agent returns JSON, but not the structure you expected.

**Why it happens:**
The dialogue SOP is not documented. The agent does not know which questions to ask, nor what a structured answer looks like.

**Consequence:**
The dialogue is inefficient (many "that's not what I meant" iterations).

**How to avoid it:**
Document the dialogue SOP:
- which questions the agent must ask
- which answer formats are expected (structured: JSON, table)
- which examples are needed (sample outputs)

**Wrong:**
The agent asks questions without structure.

**Right:**
The agent asks questions per SOP:
```
The task is unclear. Please clarify:
1) Where are the logs? (path)
   Example: ./deployment-logs/*.log
2) What output format do you want? (JSON/table/text)
   Example JSON: [{"date": "...", "status": "..."}]
3) What are the success criteria? (done criteria)
   Example: "extract date, status, duration for all deployments"
```

---

## Summary

### What we did

- Created a role system prompt for "Phoenix Project deployment analyst" with responsibilities, constraints, and stop conditions
- Tested the constraints (the agent refuses dangerous operations)
- Built a dialogue SOP (how the agent clarifies requirements and escalates)

### Artifacts

- **Role system prompt:** a reusable template for a Phoenix Project deployment analyst
- **Constraints:** a list of what the agent must NOT do
- **Dialogue SOP:** a repeatable procedure (requirements check → safety check → execution → verification)

### Key principles

1. **System prompt as a role definition:** role, responsibilities, constraints, stop conditions
2. **Constraints as a safety net:** explicit rules for what the agent must NOT do
3. **Stop conditions as escalation points:** when the agent must stop and ask a human

### Acceptance criteria

You have mastered the chapter if you can:

- Write a role system prompt with responsibilities, constraints, and stop conditions
- Test at least 2 constraints (the agent refuses correctly)
- Describe a dialogue SOP (which questions to ask and which answer format to expect)

### Next steps

In **Chapter 3** you will learn how to:
- write a v1 spec (functional and non-functional requirements)
- create a v1 plan (work breakdown, risk register)
- use an agent to decompose work and assess risks

**Hook:** you can now control an agent (constraints, stop conditions). But how do you formalize "what are we building"? How do you break work down and evaluate risk? That is Chapter 3.

---

**From a single prompt to a role. You have taken the second step.**

