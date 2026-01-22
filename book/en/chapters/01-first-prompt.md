---
title: "Chapter 1: first prompt + verification plan"
description: "How to write your first prompt as a contract and verify an agent’s output with a verification plan instead of taking it on faith."
lastmod: 2026-01-21
weight: 1
---

# Chapter 1: first prompt + verification plan

## Prologue: Parts Unlimited, 2026

Remember Bill Palmer from *The Phoenix Project*?

**2014.** Bill is VP of IT Operations at Parts Unlimited, a company on the edge of disaster. Deployments take too long and fail too often. Every incident means sleepless nights, manual log triage, and cross-team coordination through email threads and phone calls.

Bill fights fires by hand. Every day is a new crisis.

**2026.** Meet Lance Bishop.

Lance runs Phoenix Project delivery (program lead) in a company much like Parts Unlimited. Same problems: Phoenix Project is slipping, deployments keep breaking, incidents repeat, infrastructure has grown, and the team is small.

But there is one difference: Lance has AI agents—as a delivery accelerator and as a way to make quality repeatable.

Not **instead of** expertise. **On top of** expertise.

---

## A scene from "The Phoenix Project" (2014)

**Book chapters 3-4: "Why is every deployment a catastrophe?"**

Steve Masters, the CEO, calls Bill Palmer into his office. The question is simple and brutal: "Why does Phoenix Project keep slipping? Why does every deployment break?"

Bill realizes he needs data. But where does he get it?

Over the next few days, Bill and his team gather information manually:
- Wes Davis digs through Excel sheets with deployment history (mixed formats, no standard)
- Patty McKee assembles email threads with incident reports (lots of email; context gets lost)
- Bill looks for patterns in Jira tickets (noise, weak labeling, hard to filter)

**The outcome of the analysis (manual team work):**
- The deployment pipeline has many manual steps (some descriptions are stale)
- Failure rate is high (exact numbers are unclear)
- Deployment and rollback time is long and unpredictable
- Top failure reasons are qualitative ("probably DB migrations"), not backed by strict statistics

Bill shows the results to Steve. The CEO asks: "Is this accurate? Can you prove it?"

Bill answers honestly: "It’s the best we can assemble manually. Accuracy… maybe 70%."

**Core problems with the 2014 approach:**
- Time: days of manual work to analyze a limited window
- Accuracy: "roughly", because manual collection means human mistakes
- Repeatability: none (you have to re-collect every time)
- Patterns: qualitative ("DB migrations, probably"), not quantitative

---

## The same problem in 2026: how Lance solves it with AI agents

**Context:** the Parts Unlimited CEO (2026) asks the same question: "Why do deployments keep failing?"

**Lance Bishop’s approach (2026):**

Lance starts a dialogue with an agent and writes a prompt:

```
Role: you are an agent for deployment analysis.

Task: analyze the last <N> deployments from CI/CD logs.

For each deployment, extract:
- Date/time
- Status: `success`/`failed`
- Duration
- Failure step: `failed_step` if `status = failed`

Output format: JSON array + a statistics table (top failure reasons without false precision)

Guardrails:
- Work only with the specified files/artifacts; do not make network calls and do not modify data.
- Do not include secrets/PII and raw logs in the answer; use short quotes and redaction.

STOP CONDITIONS:
- If logs are unavailable, stop and report it
- If the log format is unclear, ask a question
- Do NOT invent missing data

Log location: ./ci-cd-logs/deployments/*.log
```

**Time to execute:**
- The agent generates a parser: fast
- Parsing deployments: fast
- Verification (spot checks): fast
- **Total:** noticeably faster than manual collection

**Result:**

```json
{
  "total_deployments": "<VALUE>",
  "success_rate": "<VALUE>",
  "failed_rate": "<VALUE>",
  "top_failures": [
    {"step": "database_migration", "count": "<N>", "percentage": "<VALUE>"},
    {"step": "config_validation", "count": "<N>", "percentage": "<VALUE>"},
    {"step": "service_timeout", "count": "<N>", "percentage": "<VALUE>"}
  ]
}
```

Richard (an engineer on the team) verifies the result (spot check: 3 random deployments manually) → correct.

They show it to the CEO. The CEO asks: "Is this accurate?"

Lance answers: "A verification plan is included. We spot-checked three cases and they matched. If you want more confidence, here’s a list of IDs for additional checks."

**2014 vs 2026**

| Metric | Bill Palmer (2014) | Lance Bishop (2026) |
|---|---|---|
| **Time** | days of manual work | quick run + verification |
| **Method** | manual collection: Excel, email, Jira | agent + verification |
| **Accuracy** | "roughly" (human error) | confirmed via spot checks |
| **Output** | qualitative ("probably migrations") | quantitative (structured breakdown) |
| **Repeatable?** | no (rebuild every time) | yes (prompt + SOP) |
| **Verifiable?** | no (trust me) | yes (verification plan) |

**What changed:**
- Speed: days of manual work → a fast run with verification
- Accuracy: higher (verification plan is mandatory)
- Repeatability: you can reuse the prompt for the next 50 deployments
- Trustworthiness: verification turns output into something you can act on

**What did not change:**
- Responsibility stays with the human: Lance makes the result verifiable (does not trust blindly)
- You still need Senior+ experience: pipeline intuition, DB migrations, what signals matter
- Trust, but verify: agents help; humans control quality

---

In this chapter you will learn how to:
- phrase your first prompt so results are verifiable
- verify an agent’s outputs (verification plan)
- get value quickly without blind trust

---

## Who you are (and why it matters)

This book is for Senior/Staff/Principal+ engineers who:
- have led teams or made architecture decisions
- have worked with production (deploys, incidents, on-call)
- know that "fast" without quality control means "redo it Friday night"

You do **not** need an explanation of CI/CD, SLOs, or code review. You already know them.

You do need to learn how to apply that experience to working with agents.

---

## Quick start: your first prompt

### Goal

Get structured data from deployment logs quickly—and **verify** it.

**Remember the prologue?** Bill Palmer spent days collecting deployment data with shaky accuracy. You will do the same job quickly, with a verifiable result.

### Your task (2026)

**Context:** the deployment pipeline breaks weekly.  
**VP Engineering asks:** "Why do deployments fail?"  
**Task:** find the top 3 failure reasons.

### Input

- deployment logs (CI/CD logs)
- any AI agent: an agent mode tool (file/command access) or chat mode

### Prompt (copy-paste ready)

```
Role: you are an agent for deployment analysis.

Context:
- We have logs for the last 10 deployments in a CI/CD format
- Deployments often fail, but the pattern is unclear

Guardrails:
- Analyze in read-only mode: do not modify files/environment and do not make network calls.
- Do not publish raw logs; redact secrets/PII and quote only relevant lines.

Task:
1) Analyze the logs and for each deployment extract:
   - Date/time
   - Status: `success`/`failed`
   - Duration
   - Failure step (if `status = failed`)
   
2) Output the result as a JSON array, sorted by date (newest first)

3) Compute statistics:
   - How many successful vs failed deployments
   - Top 3 failure reasons by `failed_step` with percentages

Output format:
- JSON deployment data
- A statistics table

STOP CONDITIONS:
- If logs are unavailable or the path is missing, stop and report it
- If the log format is unclear, ask a clarifying question
- Do NOT invent missing data

Log location: ./deployment-logs/*.log
```

**What the agent does:**

The agent does not just "think about an answer". It runs commands:
1. Reads the log files (like `cat deployment-logs/*.log`)
2. Parses data (generates and runs a Python/bash script)
3. Produces output: JSON + a table

In 2014 Bill did the same manually: opened Excel, used `grep`, wrote one-liners. The agent uses the same tools, but autonomously.

### Steps

1. Paste the prompt into the chat
2. Provide the real log path (replace `./deployment-logs/*.log`)
3. Run the agent—it will generate parsing code/scripts
4. Review the code—confirm it does not perform risky operations (writes, deletes, network calls)
5. Run the script—get JSON output
6. Verify the result (see "Verification plan" below)

### Example output

The agent parsed logs (wrote and ran a Python script) and returned:

```json
[
  {
    "date": "2026-01-15",
    "status": "failed",
    "duration": "<DURATION>",
    "failed_step": "database_migration"
  },
  {
    "date": "2026-01-14",
    "status": "success",
    "duration": "<DURATION>"
  },
  {
    "date": "2026-01-13",
    "status": "failed",
    "duration": "<DURATION>",
    "failed_step": "config_validation"
  }
]
```

**Statistics:**

| Failure step: `failed_step` | Count | Share |
|---|---:|---:|
| database_migration | 5/10 | 50% |
| config_validation | 3/10 | 30% |
| timeout | 2/10 | 20% |

### Verification plan

**Question:** how do you check the agent didn’t lie?

**Method 1: spot checks**
- Pick 2–3 deployments from the output
- Open the original logs manually
- Verify: do date, status, and `failed_step` match?
- If the sample matches, the agent is likely parsing correctly

**Method 2: edge cases**
- Verify the first and last deployment (by date)
- Verify the longest and shortest deployment (by duration)
- These cases often expose parsing errors

**Method 3: sanity checks**
- The agent says "50% database_migration"
- Count manually: in 10 deployments there should be 5 failures on `database_migration`
- Matches? Good.

**Red flags (when not to trust it):**
- The agent returns perfectly "pretty" splits like 50%/50%
- All dates look identical or unnaturally sequential (1, 2, 3, 4…)
- Failure steps don’t look real (for example, "step_1", "step_2")
- Stats do not add up (sum of percentages ≠ 100%)

### Result validation (checklist)

- JSON is valid (syntax is correct)
- Required fields exist (`date`, `status`, `duration`)
- Dates are sorted correctly (newest first)
- Spot check: 2–3 deployments match the raw logs
- Stats add up (sum of percentages = 100%)
- The agent’s code is safe (no write/delete/network operations)

### Expected outcome

**Artifact:** JSON deployment data + a statistics table

**Time:**
- Agent: fast (instead of hours manually)
- Verification: fast

**Value:**
- Fast: structured data without "days of Excel work"
- Verifiable: you know how to validate the result
- Repeatable: you can reuse the prompt for the next 10 deployments

---

## Theory: what did we just do?

### Concept 1: a prompt as a contract

You already work with contracts: API contracts, requirements, acceptance criteria.

**A prompt is a contract** between you and the agent:
- role: who the agent is (analyst, engineer, reviewer)
- context: what it knows (logs, formats, guardrails)
- task: what it must do (steps, output format)
- stop conditions: when it must stop and ask

**Why this matters:**

With humans, you can say "analyze the logs" and they infer the missing context (where logs are, what "analysis" means).

An agent does not infer that reliably. It needs an explicit contract.

In 2014 Bill Palmer rebuilt deployment data every time: days of searching Excel sheets, email chains, Jira tickets—no repeatable process. Next time, same days again. A prompt makes the process explicit: write the contract once → run it when needed → get results quickly.

**A real story:**

On the VIKI project we asked an agent to "analyze API responses and find problems." The agent replied:
- "200 OK — all good"
- "500 Internal Server Error — there’s a problem"

Not helpful. The real issue was latency: p95 was above the acceptable threshold, but the agent did not know latency counted as a problem.

**Fix:** we added an explicit criterion: "p95 latency above the threshold counts as a problem."

**Takeaway:** the agent does not "think". It executes a contract. If the contract is incomplete, results are unpredictable.

### Concept 2: trust, but verify

You have led teams. You know the principle: trust, but verify:
- give a junior a task
- review the pull request before merge

With agents, it is the same.

**Why:**

Agents fail differently than humans.

In 2014 Bill spent days collecting data and told the CEO: "Failures are high, probably migrations." The CEO asked: "Is this accurate?" Bill said: "Best we can do manually. Accuracy… 70%." Human problems: copy/paste mistakes, mixed formats, qualitative conclusions.

In 2026 the agent produces data fast. But agents have their own failure modes:
- hallucinations: inventing data
- context misses: ignoring key constraints
- logic errors: wrong conclusions
- format errors: broken JSON

A verification plan makes results actionable: spot-check 2–3 cases → confirm they match raw logs.

**Common agent failure modes:**
1. Hallucinations (invented data)
2. Context errors (missed constraints)
3. Logic errors (bad conclusions)
4. Format errors (invalid JSON)

**How to reduce risk:**
- spot-check 10–20% manually
- check edge cases (first/last, min/max)
- sanity-check statistics
- automate verification (treat outputs like code; write checks)

**Tradeoff:**

Verification costs time, but:
- without it you may act on wrong data
- with it you gain confidence for production-impacting decisions

**When you can skip verification:**
- trivial changes (rename a variable, add a comment)
- low-stakes output (a doc draft, brainstorming)

**When verification is mandatory:**
- production data (logs, metrics, configs)
- business decisions (risk analysis, cost estimates)
- security work (threat models, access control)

### Concept 3: stop conditions

You have used circuit breakers: if a service is failing, stop retrying blindly.

**Stop conditions for agents work the same way.**

The agent must know when to stop and ask a human:
- logs are unavailable → ask where they are
- format is unclear → show an example and ask how to parse
- data is insufficient → list what is needed

In 2014 Bill filled gaps by guessing ("DB migrations, probably") because he had to show something fast. In 2026 the agent can and should stop: "STOP: logs unavailable at path X. Where should I look?" Instead of hallucinating, it asks.

**Why this matters:**

Without stop conditions, the agent will guess and hallucinate.

**A real story:**

On the ASIMOV project, one deployment log file was corrupted. The agent made up values:
- Date: "2026-01-01" (because "start of the year")
- Status: "success" (optimistic default)

We accepted the output and made a wrong claim: "the Jan 1 deploy succeeded."

Reality: there was no deploy on Jan 1. The file was corrupted.

**Fix:** add a stop condition: "If a log is corrupted/unreadable, stop and report it."

**Takeaway:** agents must not invent missing data. If data is missing, they must stop and ask.

---

## Practice: an SOP for your first prompt

In 2014 Bill analyzed deployments without a process: each time he rebuilt Excel sheets, email chains, Jira tickets—hours or days. Next time, same again.

In 2026 an SOP makes it repeatable: write the procedure once → fast runs thereafter. The difference is obvious in both time and repeatability.

### Purpose

A repeatable process for writing and validating a prompt for a typical task (log analysis, parsing data, generating reports).

### Inputs (artifacts)

- the task (for example: "find the top 3 deployment failure reasons")
- data source (logs, metrics, configs)
- output format (JSON, table, text)

### Procedure

#### Step 1: define the agent’s role

**What to do:**
- describe the role in one sentence: "you are an agent for deployment analysis"
- a role sets expectations: an analyst behaves differently than an implementer

**Why:**
The role helps the agent match the expected output style.

**Quality gate 1: role check**

Checklist:
- role is one sentence
- role matches the task (analysis → analyst; code → developer)

**Failure scenario:**
On the MORPHEUS project we did not specify a role. The agent acted as a generic assistant and suggested writing unit tests instead of analyzing logs.

#### Step 2: add context

**What to do:**
- describe what the agent knows: data format, guardrails, assumptions
- context reduces wrong assumptions

**Why:**
Without context, the agent will assume things that may be false.

**Quality gate 2: context check**

Checklist:
- data format is described (JSON, plain text, CSV)
- guardrails are explicit (read-only, no network calls)
- assumptions are explicit (for example, "logs are in chronological order")

**Failure scenario:**
On the VOSTOK project we did not state that logs could be unsorted. The agent assumed chronological order and returned a misordered result.

#### Step 3: write the task in steps

**What to do:**
- break the work into 3–7 steps
- each step must be concrete ("extract date", "compute stats")

**Why:**
Step-by-step tasks reduce error: the agent knows what to do at each stage.

**Quality gate 3: task check**

Checklist:
- 3–7 steps
- each step is concrete (not abstract)
- output format is explicit (JSON, table)

**Failure scenario:**
On the SEVER project we said "analyze the logs". The agent returned prose ("deployments fail due to migrations"), not structured data.

#### Step 4: add stop conditions

**What to do:**
- list situations where the agent must stop and ask
- explicit examples: "logs unavailable", "format unclear"

**Why:**
Stop conditions prevent hallucinations.

**Quality gate 4: stop conditions check**

Checklist:
- at least 2–3 stop conditions
- they cover common issues (missing data, unclear format)
- explicit prohibition on guessing: "Do NOT invent missing data"

**STOP CONDITION:**
If the task is too complex for one prompt (too many steps), stop and split it into multiple prompts.

#### Step 5: run the agent and verify the output

**What to do:**
- run the agent
- apply the verification plan (spot checks, edge cases, sanity checks)

**Why:**
Verification is mandatory. Without it, the result is not trustworthy.

**Quality gate 5: verification complete**

Checklist:
- spot checks: 2–3 cases match the original
- edge cases are checked (first/last, min/max)
- sanity checks pass (stats add up)

**Failure scenario:**
On the ZAPAD project we skipped verification. The agent parsed `duration: <DURATION>` incorrectly; we accepted it and drew the wrong performance conclusions.

### Outputs (artifacts)

- the prompt (reusable)
- the output (JSON, table)
- a verification report (what was checked, which cases passed)

### Evidence

**How to prove the SOP was followed:**
- the prompt contains role, context, task, and stop conditions
- the output passed verification (spot checks, edge cases, sanity checks)
- the artifact is repeatable: another engineer can run the prompt and get comparable output

---

## Parallel track: the evolution from 2014 to 2026

### How it looked in 2014 — Bill Palmer, without agents

**Scene from the book (chapters 3-4 of "The Phoenix Project"):**

**Situation:** Steve Masters, the CEO, calls Bill into his office: "Why does Phoenix Project keep slipping? Why does every deployment break? I need data for a board meeting very soon."

**What Bill did (manually):**
- **Day 1:** Wes Davis digs through Excel sheets (80+ deployment rows, mixed formats, incomplete data)
- Patty McKee assembles email chains with incident reports (lots of email, manual analysis)
- **Day 2:** Bill searches for patterns in Jira (150+ tickets; half missing tags)
- **Day 2 (evening):** the team consolidates everything into one table and tries to find patterns

**Time cost:** days of manual team work

**Consequences:**
- Output is imprecise: assumptions, incomplete data
- The CEO cannot make a confident decision for the board meeting
- The team is frustrated: "Excel drudgery" instead of fixing the system
- Patterns stay qualitative: "DB migrations, probably" without numbers

**Why it is so slow and expensive:**
- Root cause 1: manual data collection across sources (Excel, email, Jira)—no single source of truth
- Root cause 2: human counting errors (copy/paste mistakes, missed rows)
- Root cause 3: no repeatable process—each time is different

**Bill’s reflection:**
> "This is the best we can assemble manually in a couple of days. Accuracy is… conditional."
> "I know it isn’t ideal, but we don’t have time for ideal—we’re firefighting."
> "Steve needs data soon, and we already burned days of team time on this analysis."

**Bill’s end state (by the end of "The Phoenix Project"):**
- automated collection: deployment logs → CI/CD dashboard
- time: days → much faster (automation)
- accuracy: "roughly" → much better (automated parsing, fewer human errors)
- business: Phoenix Project ships; the business impact is tangible

**Bill’s key win:** he made fact collection repeatable through automation and process.

---

### How it looks in 2026 (Lance Bishop, with agents)

**Same problem, with agents:**

**Situation:** the CEO (2026) asks the same question: "Why do deployments keep failing? I need data for the board meeting tomorrow."

**What Lance does with an agent:**
- Lance opens a chat with the agent and writes a prompt:
  ```
  Role: an agent for deployment analysis.
  Task: analyze the last <N> deployments from CI/CD logs.
  Output: JSON + a statistics table (top failure reasons without false precision)
  STOP CONDITIONS: if logs are unavailable, stop and report it
  Location: ./ci-cd-logs/deployments/*.log
  ```
- the agent generates a parser and parses deployments
- verification plan: spot check → matches on the sample

**Time cost:** much lower than manual collection

**Consequences:**
- the output is verifiable (automation + verification plan)
- the CEO gets data fast → can decide confidently for the board meeting
- the team stays focused: less toil → more strategic work
- patterns become formalizable without made-up percentages

**Why it is faster and cheaper:**
- the agent addresses root cause 1: parses sources automatically (CI/CD logs, Jira APIs) into one pipeline
- the agent addresses root cause 2: fewer human errors (no fatigue; consistent parsing)
- the agent addresses root cause 3: the prompt is a repeatable process

**Lance’s reflection:**
> "In 2014 Bill Palmer spent days and got conditional accuracy."
> "I spent less time with an agent and got a verifiable result."
>
> "This is not magic. It is Bill’s automation (2014) plus an intelligence layer (2026):"
> - "Bill taught us to automate toil (scripts, dashboards)"
> - "Agents add intelligence (parsing messy data, pattern recognition, adaptability)"
>
> "I’m standing on Bill Palmer’s shoulders. Agents are an amplifier, not a replacement."

---

### Multiplier effect: how agents amplify Phoenix Project improvements

| Aspect | Bill 2014 (start) | Bill 2014 (end, after automation) | Lance 2026 (with agents) | Notes |
|--------|-------------------|-----------------------------------|--------------------------|-------|
| **Time** | days (manual) | faster (automation) | faster (agents + automation) | no made-up numbers |
| **Cost** | direct + opportunity cost | scripts and automation | prompt + agent | lower execution cost |
| **Accuracy** | rough (manual errors) | higher (automated parsing) | high with verification | depends on data quality and checks |
| **Repeatability** | 0% | 100% (scripts documented) | 100% (prompt documented) | repeatability remains |
| **Adaptability** | low | medium (update scripts) | high (update prompt; agent adapts) | a key advantage |

**Core idea:**

Agents do not replace what Bill achieved. They amplify it:
- Bill accelerated through automation
- Lance accelerates through agents
- agents add speed and an intelligence layer (adaptability to new formats)

**What agents add on top of Bill’s 2014 automation:**
1. Intelligence: agents can handle unstructured inputs (logs, email) without a rigid schema
2. Adaptability: new log format? update the prompt (fast) vs rewriting scripts (slower)
3. Natural-language interface: a prompt instead of code—usable by any engineer, not only DevOps
4. Built-in verification: verification plan is explicit, not forgotten

---

### Evolution, not revolution

**The key difference:**
- **2014:** Bill Palmer is a hero who collects data manually (heroics) → automation via scripts
- **2026:** Lance Bishop is an orchestrator who writes prompts and verifies outputs (systematic)

**Not a replacement, an amplifier:**

| What it does | Bill 2014 (automation) | Lance 2026 (agents) |
|------------|-------------------------|---------------------|
| **Toil** | scripts (structured log parsing) | agents (structured + unstructured parsing) |
| **Intelligence** | hardcoded if/else rules | pattern recognition via ML models |
| **Adaptability** | low | high |
| **Human role** | write scripts + run + verify | write prompts + verify + iterate |
| **Accountability** | human (script author) | human (prompt author + orchestrator) |
| **Speed** | much faster than manual | faster due to adaptability |
| **Quality** | depends on parser correctness | depends on verification and input quality |

**Parallels with people management:**

**Bill Palmer (2014) managed humans:**
- "Wes, collect deployment data from Excel"
- "Is this accurate? Check again"
- "Add a breakdown by time of day"
- time: days of coordination

**Lance Bishop (2026) orchestrates an agent:**
- a prompt: "analyze deployments; JSON output; stop conditions"
- verification: sample of 3 cases → 100% match
- iteration: "add a time-of-day breakdown" (update prompt, rerun)
- time: much lower

**The transferable skill:**
- writing clear tasks (brief → prompt)
- setting quality criteria (DoD → verification plan)
- reviewing outputs (review → evidence via spot checks)

Bill did it with people. Lance does it with agents.

Principles are the same. Execution is usually faster (order-of-magnitude estimate; depends on data quality and verification discipline).

---

### Comparing Bill’s path and an agent-driven path

**Bill Palmer’s transformation (2014, "The Phoenix Project"):**

**Timeline:**
- Month 0: crisis (deployments fail; Phoenix Project slips)
- Month 3: early improvements (monitoring, basic scripts)
- Month 6: major improvements (CI/CD pipeline, deployment automation)
- Month 12: success: Phoenix Project shipped; business impact is visible

**Key milestones:**
- analysis time: days → faster (automated scripts)
- deployment success rate: 40% → 85% (CI/CD + testing)
- MTTR: hours → lower (`runbooks` + coordination)

**Investment:**
- a long transformation
- 3–5 engineers full-time on automation
- substantial investment (tools, training, process change)

**Results:**
- Phoenix Project shipped on time → business impact
- market position recovered
- competitive advantage (deploy frequency: weekly → daily)

---

**An engineer’s path (2026, with agents):**

**Timeline:**
- Week 0: the same crisis (deployments fail; CEO demands data)
- Day 1: first prompt (analysis becomes fast)
- Week 2: system prompts (multiple analyses standardized)
- Month 3: AI-amplified CI/CD (agents + Bill-style automation)

**Key milestones:**
- analysis time: days → fast (agents on top of automation)
- deployment success rate: 40% → 90% (agents catch issues earlier)
- MTTR: hours → lower (agent-assisted triage; see Chapter 6)

**Investment:**
- the first prompt is fast
- time to train the team to work with agents
- overall investment: time and attention, without magic numbers

**Results:**
- the same analysis, immediately: Day 1
- Phoenix Project ships faster (agents across the cycle)
- competitive advantage: deploy frequency grows

Agent ROI should be computed in your context (see the template in Appendix A).

---

## Common mistakes

### Mistake 1: a prompt without stop conditions

**Symptom:** the agent invents missing data or hallucinates.

**Example:**
Prompt: "Analyze the last 10 deployments and find patterns."  
Result: the agent returns 10 deployments, but one is invented (a non-existent date, a "success" status with no evidence).

**Why it happens:**
Agents are optimized to "complete the task", not to "stop and ask". Without explicit stop conditions, they guess.

**Consequence:**
You accept wrong data → you make wrong decisions.

**How to avoid it:**
Always add stop conditions:
- "If logs are unavailable, stop and report it"
- "If the log format is unclear, ask a clarifying question"
- "Do NOT invent missing data"

**Wrong:**
```
Role: you are an agent for deployment analysis.
Task: analyze the last 10 deployments and find patterns.
```

**Right:**
```
Role: you are an agent for deployment analysis.
Task: analyze the last 10 deployments and find patterns.

STOP CONDITIONS:
- If logs are unavailable, stop and report it
- If the log format is unclear, ask a question
- Do NOT invent missing data
```

### Mistake 2: skipping verification

**Symptom:** you trust the agent’s output without checking it.

**Example:**
The agent reports: "database_migration: 50%, config_validation: 30%, timeout: 20%". You take it into a VP presentation. In the meeting it turns out the agent was wrong; `config_validation` was actually 40%.

**Why it happens:**
Agents look convincing. They output tables, percentages, structured JSON. It is easy to assume "it must be correct."

**Consequence:**
- Wrong decisions (invest in fixing `database_migration` while the real issue is `config_validation`)
- Loss of trust (you become "the person who brought bad data")

**How to avoid it:**
Always apply a verification plan:
- spot check 2–3 cases manually
- check edge cases (first/last, min/max)
- sanity-check that statistics add up

In 2014 Bill told the CEO "we’re at ~70% accuracy." In 2026, with a verification plan, you can say: "Spot-checked three cases; they match the raw logs."

**Wrong:**
Use the agent’s output without verification.

**Right:**
Verify 2–3 cases manually, then use the result.

### Mistake 3: the task is too abstract

**Symptom:** the agent outputs prose instead of structured data.

**Example:**
Prompt: "Analyze the deployment logs."  
Result: "Deployments fail due to database migrations. I recommend improving the migration process."

This is not actionable: no data, no stats, not verifiable.

**Why it happens:**
The task is underspecified. The agent does not know what you want: JSON, a table, a list, or text.

**Consequence:**
You get generic words instead of concrete data.

**How to avoid it:**
Write a step-by-step task and specify the output format:
- "Extract date, status, duration"
- "Output JSON"
- "Compute top-3 failure reasons with percentages"

**Wrong:**
```
Role: you are an agent for deployment analysis.
Task: analyze deployment logs.
```

**Right:**
```
Role: you are an agent for deployment analysis.
Task:
1) Extract date/time, status, duration for each deployment
2) Output a JSON array
3) Compute top-3 failure reasons with percentages
```

---

## Business impact: what changes after the first iterations

### Time savings

**Deployment analysis (the baseline task):**
- Before: days of manual team work
- After: a fast run with verification
- Reduction: by multiples (through automation and a repeatable template)
- Value: reclaimed opportunity cost on every analysis

**Decision-making cycle:**
- Before: several days (collect data + analyze + review)
- After: fast (agent + review + CEO-ready summary)
- Reduction: by multiples (a shorter "collect → analyze → decide" loop)
- Value: faster response, competitive advantage

**Net impact:** noticeable reduction in repeated manual work.

---

### Quality improvements

**Data accuracy:**
- Before: rough (manual collection, human errors, incomplete data)
- After: higher (automated parsing + verification plan via spot checks)
- Effect: the CEO can make more confident board-level decisions

**Repeatability:**
- Before: 0% (each time from scratch; inconsistent methods; no documentation)
- After: 100% (prompt documented; SOP repeatable; any engineer can run it)
- Effect: knowledge survives attrition; the process becomes resilient

**Coverage:**
- Before: last 10 deploys (manual work limits the sample; bias)
- After: last 50 deploys (the agent does not get tired; processes the full dataset)
- Effect: higher confidence; rare patterns become visible

---

### Organizational impact

**Decision speed:**
- Before: "Let’s gather data for a couple of days, then meet" → meeting slips
- After: "Here’s data for the last 50 deployments" → decisions can be made immediately
- Example: Phoenix Project prioritization in one day instead of one week

**Team morale:**
- Before: days of "Excel drudgery"; frustration and burnout risk
- After: fast agent runs; more time for strategic engineering (architecture, optimization)
- Observation: workload becomes more sustainable (first-order benefit)

**Scalability:**
- Before: Bus factor = 1—Bill is the only one who can assemble this picture
- After: Bus factor = 2 (the prompt is documented; Wes/Patty can rerun the analysis)
- Meaning: Bill can take vacation without the analysis capability disappearing

---

### Economic model (your context)

Do not copy universal numbers. Use your model:
- baseline: how much toil and coordination goes into fact-finding
- target: what is delegated to the agent; where verification is mandatory; where STOP applies
- cost: adoption time + maintaining templates/checks
- value: reclaimed engineering time + lower risk + faster decisions

Use the template in [Appendix A]({{< relref "appendix/A-business-case.md" >}}).

---

### Comparison to Phoenix Project

**Bill Palmer (2014, end state after automation):**
- investment: process change + automation tooling
- results: Phoenix Project ships; business impact becomes visible
- time-to-value: delayed (organizational changes)

**Lance Bishop (2026, with agents):**
- investment: prompt + verification setup
- results: the same task becomes faster and more repeatable; decisions become more confident
- time-to-value: fast, because it does not require heavy infrastructure change up front

**Agent multiplier on time-to-value:**
Bill spent months on organizational change to get automation in place. Lance gets incremental value immediately (first prompt).

---

### Organizational transformation has started

**After the first iterations:**

**Team understanding:**
- the team sees agents can do useful work (not a toy)
- the team sees the verification plan is non-negotiable
- the team sees a prompt is a repeatable process (any engineer can use it)

**Foundation for scaling:**
- a prompt template is established: role + context + task + format + stop conditions
- a verification template is established: spot checks + edge cases + sanity checks
- the team is trained: Wes, Patty, Bill can write new prompts

**Trust grows:**
- the CEO sees verifiable data → trusts outputs
- the board sees faster decisions → competitive advantage
- the team sees less toil → more engineering capacity

**Next wave:**
- identify 5 more recurring analysis tasks (incident patterns, configuration drift, performance bottlenecks)
- potential: more savings and freed capacity across adjacent analysis work
- plan: iterate prompts, then scale as the practice matures

---

### Agents vs alternatives

**Alternative 1: hire a data analyst**
- cost: hiring and onboarding (time and money)
- time-to-value: delayed
- risk: human error remains; the analyst can leave

**Alternative 2: buy an analytics tool**
- cost: licenses + integration + maintenance
- time-to-value: delayed
- risk: custom formats in Parts Unlimited may still need custom code

**Alternative 3: agents**
- cost: time for prompts, verification, and keeping templates current
- adoption: fast if you have data access and a clear process
- maintenance: regular updates as formats and processes change
- risks: reduced through verification

**Agent advantage (with correct guardrails and verification):**
- faster path to first value (delegate → verify → repeat)
- repeatable: the prompt is repeatable for the same inputs and rules (formats may still change over time)

---

### Compounding effect (Chapter 1 → Chapter 2 → … → Chapter 10)

The compounding effect matters more than cumulative numbers:
- processes become repeatable
- quality and security are enforced through gates, verification, and eval loops
- toil moves into delegation, freeing time for engineering decisions

**Chapter 1 is the first step toward scalable value.**

---

### Prep for the next chapter

**Do this today:**
1. Pick one recurring analysis task in your team (2+ hours manually, repeats regularly).
2. Write the first prompt using the template (role, context, task, format, stop conditions).
3. Write a verification plan (2–3 cases; compare to manual ground truth).

**Bring to Chapter 2:**
- the first prompt is written and verified → in Chapter 2 we add guardrails: what the agent must NOT do
- the verification plan works → in Chapter 2 we strengthen stop conditions
- the team saw the result → in Chapter 2 we scale the practice with a dialogue SOP

**Expected compounding effect after Chapter 2:**
- Chapter 1: faster analysis (less toil, more predictability)
- Chapter 2: safety (guardrails, lower risk)
- Together: compounding value, chapter by chapter

---

## Summary

### What we did

- Wrote a first prompt as a contract (role, context, task, stop conditions)
- Got structured data from logs fast (instead of hours manually)
- Learned to verify agent outputs (spot checks, edge cases, sanity checks)

### Artifacts

- **Prompt:** a reusable template for log analysis
- **Verification plan:** how to validate agent outputs
- **SOP:** a repeatable process to write and validate prompts

### Key principles

1. **A prompt as a contract:** explicit role, context, task, stop conditions
2. **Trust, but verify:** spot checks are mandatory
3. **Stop conditions:** the agent must know when to stop and ask

### Acceptance criteria

You have mastered the chapter if you can:

- Write a prompt using the template (role, context, step-by-step task, output format, stop conditions)
- Verify the output on 2–3 cases (including at least one edge case)
- Describe explicitly what the agent does when data is missing (it stops and asks clarifying questions)

### Next steps

In **Chapter 2** you will learn how to:
- write a role system prompt (how the agent should behave)
- add guardrails (what the agent must NOT do)
- build a dialogue SOP (how the agent should clarify requirements)

**Hook:** you can get value quickly. Next: how do you control what an agent does—and what it must not do?

---

**From a single prompt to a system in 10 chapters. You have taken the first step.**

