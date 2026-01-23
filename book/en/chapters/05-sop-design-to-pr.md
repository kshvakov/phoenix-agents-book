---
title: "Chapter 5: an agent-driven SOP for \"design → PR\""
description: "A repeatable development process with an agent: from design and guardrails to PR, verification gates, and artifacts that reduce Bus factor."
lastmod: 2026-01-21
weight: 5
---

# Chapter 5: an agent-driven SOP for "design → PR"

## Prologue: Parts Unlimited, 2014. The Brent problem

In 2014, Bill Palmer ran into a problem that threatened the entire Phoenix Project.

**The problem was called \"Brent\".**

Brent was the lead engineer, the only person who understood how Parts Unlimited's legacy systems worked:
- legacy database configuration (Oracle 9i, custom schemas)
- the integration layer with external systems (SAP, Salesforce, custom APIs)
- deployment scripts in Perl (written in 2005; nobody remembers how they work)

**Symptoms:**

Any legacy-related task meant:
- "We need to change the DB timeout in production" → escalate to Brent
- "The deployment script failed on the integration step" → escalate to Brent
- "SAP API returned 500, what do we do?" → escalate to Brent

**Result:**

Brent is overloaded (in this storyline: ~60–70 hours/week). Bus factor = 1. Erik Reid, Bill Palmer's mentor, asks: "What happens if Brent gets sick? Or quits?"

Bill answers honestly: "We stop."

**Root cause:**

Brent's knowledge lives in his head. There is no documentation. No `runbooks`. No SOP. Each time he does the change differently:
- sometimes a migration script
- sometimes a manual SQL update
- sometimes a config change plus a service restart

Nobody knows why he chooses one approach over another. The outcome is reproducible (the change works), but the process is not.

---

## The same problem in 2026: how Lance solves it with an agent

**Context:** in Parts Unlimited 2026, Lance Bishop faces the same situation: there is a senior engineer (Richard Hendricks) who knows everything about the legacy database. But Richard is going on vacation for three weeks.

**Task before the vacation:** capture the development process for a typical change so the team can do it without Richard.

**Lance's solution:** create a "design → PR" SOP with an agent that can reproduce Richard's process.

**Key insight:**

In 2014, Brent made the change himself and the knowledge stayed in his head. In 2026, Richard goes through the process once with the agent and captures it as an SOP. The agent records every step, every decision, every gate.

Result: an SOP the team can run without Richard.

---

## Quick start (15-30 minutes)

### Goal

Create an SOP for a typical task: "Increase the DB connection timeout in the legacy Oracle DB."

### What you need

- An agent (for example, Cursor)
- Access to the legacy codebase (read-only at first)
- One typical task the senior engineer performs regularly

### Terms (1 minute, so we don't get confused)

- **Acceptance criteria (AC)**: what should happen (expected behavior/outcome).
- **Definition of done (DoD)**: which evidence is sufficient to call the work done (verifiable claims).
- **Verification plan**: how we will obtain that evidence (tests/metrics/sampling).
- **STOP**: stop conditions—when the agent must stop and escalate.

For humans, AC can often be "stretched" through context and conversation. That does not work with agents. So **DoD + verification plan + STOP is the minimal contract**.

### Practice: context management (don’t drown the agent)

Most of the time you do **not** need to paste half the repository into the chat. That adds noise and often makes outputs worse.

- If you know the **exact place** (file/directory/component), point the agent there.
- If you don’t, ask the agent to **find the relevant files first** (search/semantic search) and list them before changing anything.
- Avoid dumping “everything”; prefer 1–3 precise artifacts plus an explicit question: “What else do you need to read?”

For one example implementation of these ideas (including branch/diff-oriented context), see [Cursor: Best practices for coding with agents](https://cursor.com/blog/agent-best-practices).

### Practice: if it’s going sideways, go back to the plan (don’t patch via chat)

If the agent is building the wrong thing (wrong scope, missed constraints or DoD, wrong priorities), it is often faster to:

- revert the changes,
- tighten the plan (inputs, guardrails, done criteria, verification),
- rerun the loop with the updated plan.

This reduces drift and “chat archaeology.” See “Starting over from a plan” in [Cursor: Best practices for coding with agents](https://cursor.com/blog/agent-best-practices).

### Practice: a TDD loop as a hard iteration target

When you can test the behavior, a short TDD loop gives the agent a concrete target:

- write/update tests (or golden tests) for the expected behavior,
- run them and **confirm they’re failing** (so the check is real),
- implement the minimal fix until the suite is green,
- attach evidence (PR + CI outputs) as proof.

This fits naturally into our Gates 2–3 (implementation → testing).

### Mini-guide: how to describe worker roles (specialized agents)

When a task is long and heterogeneous (design → implementation → tests → PR), a single general-purpose agent tends to blur. It is more practical to work through multiple narrow worker roles, where each produces an output in a fixed format.

In this SOP, that usually means "one worker per gate": a role for design review, another for test runs, another for independent verification.

**Worker role template (vendor-neutral):**

- **When to use:** explicit triggers ("tests failed", "security check required", "need a test plan").
- **One responsibility:** exactly one goal ("produce a test plan", "assess data risk", "find the root cause of failing tests").
- **Inputs:** which artifacts are required (diff/PR, CI logs, links to metrics, file list).
- **Output:** a strict schema (for example: `findings[]`, `evidence[]`, `proposed_fix`, `verification_steps`, `stop_reason`).
- **Constraints:** read-only by default; dangerous actions only via STOP + approval.
- **Verification:** what counts as done (tests are green, linter has no new errors, reproduction is confirmed/refuted).

Anti-pattern: dozens of "general assistants" with vague descriptions. If a role does not differ by inputs/outputs and success criteria, it is not a role—it is noise.

### Rollback: baseline vs expanded

**You always need a baseline rollback path**: you should know how to undo the change if it turns out to be wrong. In most cases it is the standard scheme **revert → redeploy**.

A separate, detailed rollback plan (time estimate, verification steps, ideally tested on staging) is needed when risk triggers are present, for example if the change touches:
- production data and migrations/irreversible operations
- availability/payments/critical user flows
- security and access controls
- deployment infrastructure/configs where mistakes = downtime

### SOP prompt for the agent

```
Role: you are an agent that documents a development process for a change.

Context:
  - A senior engineer (Richard Hendricks) is making a change: "increase DB connection timeout from 30s → 60s"
  - I need to capture the process so the team can reproduce it

Safety guardrails:
- Do not run high-risk/state-changing commands in production. If a step can change state (deploy, restart, migrations, delete), STOP and request approval.
- The SOP must not include secrets/PII or raw logs: use redaction and links to artifacts/commits.

Task:
1) Design review (gate 1): Richard, which components are affected?
2) For each component: files, parameters, dependencies
3) Risks: what can go wrong?
4) Test plan: how do we verify the change works?
5) Rollback: what is the baseline rollback path (usually revert → redeploy), and do we need a separate rollback plan based on risk triggers?

SOP format:

## Change: [name]

### Gate 1: design review

**Scope (what changes):**
- Component X: file Y, parameter Z
- Component A: file B, parameter C

**Dependencies (what depends on this):**
- Service 1 (may fail if timeout < X)
- Integration 2 (may time out if > Y)

**Risks:**
- Risk 1: [description] → [likelihood] → [impact] → [mitigation]

**STOP CONDITIONS:**
- If dependencies are unclear → stop and ask Richard Hendricks
- If there is an active incident → postpone the change

### Gate 2: implementation

**Files to change:**
- `config/db.yml`: `connection_timeout: 30 → 60`
- `services/legacy/db_client.go`: update default value

**Verification steps:**
- Build: `make build` (must succeed)
- Linter: `make lint` (no new warnings)
- Unit tests: `make test-unit` (all green)

**STOP CONDITIONS:**
- If build fails → fix, repeat gate 2
- If tests are red → investigate, fix, repeat

### Gate 3: testing

**Integration tests:**
- Test 1: DB connection succeeds with the new timeout
- Test 2: query runtime < 60s does not fail
- Test 3: query runtime > 60s fails with a timeout error

**Manual check:**
- Deploy to staging
- Run smoke tests: [list of commands]
- Check logs: no errors

**STOP CONDITIONS:**
- If integration tests fail → find the root cause
- If staging deploy fails → rollback, investigate

### Gate 4: PR + review

**PR checklist:**
- gate 1 passed (design review)
- gate 2 verified (implementation)
- gate 3 passed (tests)
- baseline rollback path is defined (usually revert → redeploy); a separate rollback plan exists if needed by risk triggers
- migration plan (if needed)

**Review focus:**
- Risk mitigation: is it sufficient?
- Test coverage: are edge cases covered?
- Rollback: if a tested rollback is required, is it tested?

**DoD:**
- PR approved by 2 reviewers
- CI/CD is green
- Staging deploy succeeded

EXECUTION MODE:
- The agent asks Richard Hendricks questions at each gate
- The agent captures answers in the SOP
- The agent generates checklists for the team
```

### Steps

1. **Paste the prompt** into the chat
2. **Walk through the process** with the senior engineer (Richard answers the agent's questions)
3. **Have the agent run checks** (build, linter, tests) in a safe environment (local/staging) and avoid dangerous operations
4. **Have the agent generate the SOP** based on the answers and verification results
5. **Validate the outcome:** the next engineer uses the SOP for a similar task

### How to discuss and maintain an SOP (so it does not rot)

- **The SOP lives in Git next to the code** and changes like code: via MR/PR, review, and history.
- **The task tracker is for coordination:** in the ticket, discuss nuances, track status, and link to:
  - the MR/PR that changes the SOP
  - the exact SOP version (commit/tag) the agent used
- **An owner is required:** each SOP must have an explicit owner role/person (domain/platform owner). Without an owner, SOPs quickly become a link cemetery.
- **Periodic review:** quarterly (or after major system changes) the owner walks the SOP and updates stale steps/checks.

#### SOP as a portable "competence package" (a skill)

When an SOP stops being "one page for one task" and starts living for years, it is often useful to store it not only as text, but as a structured package:

- `SKILL.md`: a short "when to apply" + the core procedure
- `assets/`: checklist templates, PR description templates, artifact formats
- `references/`: policies, edge cases, examples, and the "why"
- `scripts/`: repeatable checks (linters, format validation, report generation)—only with sandbox/allowlists/audit (see Chapter 7)

This makes knowledge portable across teams and tools: the package is versioned, reviewed, and reused without chat copy-paste. The term "skill" here is used as an open-format knowledge package, not as a feature of a specific vendor.[^agentskills-overview]

### Example outcome

The agent wrote and ran a series of commands to verify scope:

```bash
# The agent searched for all mentions of connection_timeout
grep -r "connection_timeout" ./config ./services
# Result: 3 files are affected

# The agent analyzed dependencies
go list -m -json all | jq '.Path' | grep legacy
# Result: 5 dependencies found

# The agent ran tests
make test-unit
# Result: 120 tests passed, 0 failed
```

**SOP (generated by the agent):**

```markdown
## Change: increase DB connection timeout (30s → 60s)

### Gate 1: design review

**Scope:**
- `config/db.yml`: `connection_timeout: 30 → 60`
- `services/legacy/db_client.go`: update the default constant
- `services/api/handlers/query.go`: update timeout validation (reject requests > 60s)

**Dependencies (verified by the agent):**
- `user-service` (uses `db_client`, does not depend on timeout)
- `report-service` (uses `db_client`, queries < 10s, safe)
- `analytics-service` (uses `db_client`, queries ~45s, must be checked)

**Risks:**
- **Risk 1:** analytics queries may hit timeouts (likelihood: MEDIUM, impact: HIGH)
  - **Mitigation:** test analytics queries on staging; if > 60s → consider 90s
- **Risk 2:** dependent services may assume timeout < 60s (likelihood: LOW, impact: MEDIUM)
  - **Mitigation:** run integration tests; if they fail → investigate

**STOP CONDITIONS:**
- Dependencies were checked by the agent (5 found; 3 safe; 1 needs verification)
- ⚠︎ `analytics-service` requires a manual check → STOP and test on staging

### Gate 2: implementation

**Changed files:**
```diff
# config/db.yml
-connection_timeout: 30
+connection_timeout: 60

# services/legacy/db_client.go
-const DefaultTimeout = 30 * time.Second
+const DefaultTimeout = 60 * time.Second

# services/api/handlers/query.go
-if queryTimeout > 30 {
+if queryTimeout > 60 {
```

**Verification (performed by the agent):**
- Build: `make build` (passed, 2m 15s)
- Linter: `make lint` (no new warnings)
- Unit tests: `make test-unit` (120 passed, 0 failed)

### Gate 3: testing

**Integration tests (performed by the agent on staging):**
- Test 1: DB connection succeeds (timeout = 60s)
- Test 2: query runtime 45s → success
- ⚠︎ Test 3: analytics query 55s → success (was borderline at 30s timeout)

**Manual verification (required for analytics):**
- Deploy to staging (Ansible: dry-run required) → approval → apply:
  - `ansible-playbook -i inventories/staging playbooks/db-config.yml --check --diff`
  - `ansible-playbook -i inventories/staging playbooks/db-config.yml --diff`
- Run analytics smoke test: `./scripts/analytics-smoke.sh`
- Check logs: `ssh staging-analytics-01 "sudo journalctl -u analytics-service --since '15 min ago' | grep timeout"`

**Result:**
- Analytics queries now pass (55s; 5s buffer remains)
- No errors in logs

### Gate 4: PR

**PR checklist:**
- Gate 1 passed (dependencies checked; analytics risk mitigated)
- Gate 2 passed (build + tests green)
- Gate 3 passed (staging deploy succeeded)
- Rollback path: revert config change and redeploy (< 5 min)

**DONE:** PR #142 merged and deployed to production
```

**Time to execute:**
- In 2014, Brent did this manually: 4-6 hours (design in his head, implementation, manual testing)
- In 2026, agent + Richard + SOP: 45 minutes (15 minutes of design with the agent, 20 minutes of implementation/tests with the agent, 10 minutes to review the result)

**The key difference:** the team now has an SOP. The next engineer can use it to do a similar change in ~30 minutes without Richard Hendricks.

---

## Theory: why SOPs and gates are critical for agents

### Concept 1: a gate as a decision point

**The problem in 2014:**

Brent typically worked like this:
1. Read the task
2. Think (5-10 minutes)
3. Write code
4. Test
5. Deploy

Step 2 ("think") is a black box. Nobody knows:
- which alternatives he considered
- which risks he accounted for
- why he picked this solution

Result: the team cannot reproduce the process.

**The 2026 solution:**

A gate is a deliberate stop where the agent forces an explicit decision.

```
Gate 1: design review

1. The agent analyzes scope (runs grep, checks dependencies)
2. The agent produces a list of components + risks
3. The gate: the agent stops and asks: "Here's what I found. Do you confirm the scope? Are these risks acceptable?"
4. The human answers "yes" or "no, you missed component X"
5. The agent records the decision in the SOP
```

**Why this matters:**
- transparency: decision-making becomes explicit
- repeatability: the next engineer sees the "why"
- safety: a human controls critical points

In 2014 Brent made the decision in his head. In 2026 the agent captures every decision at a gate and makes the process reproducible.

### Concept 2: why Gate 1 (design review) comes before code

**A typical junior mistake:**

Task: "Increase DB timeout from 30s → 60s"

The junior sees:
```yaml
# config/db.yml
connection_timeout: 30
```

They think: "Easy. I'll change it to 60 and we're done."

They change → commit → PR → merge → deploy → production incident.

**What went wrong:**

They missed:
- `services/api/handlers/query.go` has a hardcoded check `if timeout > 30 { reject }`
- `analytics-service` runs ~55s queries that were already borderline at 30s
- integration tests do not cover queries > 30s

Result: an incomplete change and an incident.

**How Gate 1 prevents it:**

```
Gate 1: design review

The agent runs:
1. grep -r "connection_timeout" (finds 3 files, not 1)
2. go list -m -json all (finds 5 dependencies)
3. Builds a dependency picture: who uses `db_client`?
4. STOP: the agent asks: "I found 3 files and 5 dependencies. Should all of them change?"

The human reviews → notices `query.go` also needs changes → expands scope
```

In 2014, Brent did this in five minutes (experience). A junior usually cannot.

In 2026, the agent executes the same steps (grep, dependency analysis) and captures the output for review.

### Concept 3: Gate 2 (implementation) checks boundaries and error-handling discipline

**The problem in 2014:**

Brent writes code. It works. But:
- error handling is inconsistent (`return err` here, `panic` there, `log.Fatal` elsewhere)
- responsibility boundaries are unclear: where does `db_client` responsibility end?

Result: the next engineer does not know where to place new logic.

**The 2026 solution: Gate 2 includes boundary checks**

```
Gate 2: implementation

The agent verifies:
1. Boundaries: are changes inside one component, or do they cross boundaries?
2. Error handling: does it match project conventions?
3. Dependencies: did we introduce new dependencies?
4. Tests: are changes covered?

STOP CONDITIONS:
- If changes cross responsibility boundaries → escalate to an architect/owner
- If new dependencies appear → check license and security
- If there are no tests → write tests or justify why not
```

**Example:**

```go
// services/legacy/db_client.go (Gate 2: boundary check)

// GOOD: change internal implementation
func (c *Client) Connect() error {
    c.timeout = 60 * time.Second // was 30
    return c.connect()
}

// BAD: change external API
func (c *Client) Connect(timeout time.Duration) error {
    // This changes the signature → breaking change → needs a migration plan
}
```

The agent asks: "Is this an internal change, or a breaking change?" → STOP → confirm with a human.

In 2014 Brent knew boundaries intuitively. In 2026 the agent makes boundary checks explicit and auditable.

### Concept 4: Gate 3 is about coverage, not "tests passed"

**The problem in 2014:**

Brent tests on staging:
- starts the service
- makes 2-3 manual requests
- glances at logs: "seems fine"
- deploys to production

**Risk:** edge cases are not tested.

**The 2026 solution: Gate 3 requires explicit test coverage**

**Example gate 3 artifact (test matrix):**

**Gate 3: testing**

**Test matrix:**
| Scenario | Input | Expected result | Actual | Status |
|----------|------:|-----------------|--------|--------|
| Normal request | 10s | success | success | ✓ |
| Slow request | 45s | success | success | ✓ |
| Timeout request | 65s | timeout error | timeout error | ✓ |
| Edge case | 59.9s | success | success | ✓ |

**Coverage:**
- happy path: ✓
- edge cases: ✓
- error handling: ✓
- rollback: ⚠︎ if a tested rollback is required and it is not tested → STOP and test rollback first

In 2014, testing was "by feel". In 2026, the agent generates an explicit test matrix from scope and runs it systematically.

### Concept 5: stop conditions at every gate

Agents do not know when information is "enough". A stop condition is an explicit escalation rule.

**Gate 1 stop conditions:**
- if dependencies are unclear → STOP and ask an owner/architect
- if there is an active incident → STOP and postpone (do not change during an incident)
- if impact is high and mitigation is unclear → STOP and escalate

**Gate 2 stop conditions:**
- if build fails → STOP and fix
- if tests are red → STOP and investigate
- if new dependencies appear without approval → STOP and request approval

**Gate 3 stop conditions:**
- if integration tests fail → STOP and find the root cause
- if staging deploy fails → STOP, rollback, investigate
- if a tested rollback is required (by risk triggers) but it was not tested → STOP and test rollback on staging first

**Principle:**

The agent must not guess in ambiguous situations. Stop conditions are a clean escalation path to a human.

---

## Practice: a full SOP for a typical change

### Task (a real example)

**Business requirement:** "Customers complain that reports take more than 2 minutes. Increase the timeout."

**Technical scope:** increase the timeout in `report-service` from 120s → 300s.

### SOP prompt for the agent

```
Role: you are an agent that implements a change by following an SOP.

Context:
- Change: increase report generation timeout (120s → 300s)
- Service: report-service
- Stack: Go, PostgreSQL, systemd, deb packages, Ansible

Safety guardrails:
- Any action that changes production state (deploy, restart, migrations, config changes) must follow the approved process and requires explicit approval.
- Default to read-only: analysis/search/artifact collection. If a step needs access or commands, explain the risk first and request approval.
- Do not include secrets/PII in outputs and artifacts; use redaction and links.

Task: go through Gate 1 → Gate 2 → Gate 3 → Gate 4.

## Gate 1: design review

**Step 1:** find all places where the timeout is mentioned
- Run: `grep -r "report.*timeout" ./services/report ./config`
- Record: file list + matching lines

**Step 2:** find dependencies (who calls report-service?)
- Run: `go list -m -json all | jq '.Path' | grep report`
- Run: `ansible-inventory -i inventories/production --graph | grep -i report`
- Record: dependency list

**Step 3:** build a risk matrix
- Risk 1: timeout increase → higher resource consumption (DB connections held longer)
- Risk 2: downstream services may time out if they expect < 300s
- Risk 3: users may think the service is "hung" (UX)

**STOP CONDITIONS:**
- If dependencies > 5 → escalate to an architect (wider impact analysis needed)
- If DB connection pool size < expected concurrent reports → STOP (risk of pool exhaustion)

## Gate 2: implementation

**Files to change (based on Gate 1):**

1. `config/report-service.yml`:
```yaml
report:
  generation_timeout: 300s  # was 120s
```

2. `services/report/handler.go`:
```go
const ReportTimeout = 300 * time.Second  // was 120
```

3. `services/api/client/report_client.go` (downstream):
```go
client := &http.Client{
    Timeout: 350 * time.Second,  // was 150s; leave headroom for 300s
}
```

**Verification steps:**
- Build: `make build`
- Linter: `make lint`
- Unit tests: `make test-unit`
- Check DB connection pool: do we have enough connections for longer hold time?

**STOP CONDITIONS:**
- If build fails → fix, re-run
- If tests are red → investigate
- If DB pool size < (concurrent_reports * avg_duration / timeout) → STOP, increase pool size first

## Gate 3: testing

**Test matrix:**

| Scenario | Duration | Expected | Actual | Status |
|----------|----------|----------|--------|--------|
| Small report | 10s | success | ? | pending |
| Medium report | 120s | success | ? | pending |
| Large report | 250s | success | ? | pending |
| Timeout | 310s | timeout err | ? | pending |

**Integration tests:**
- Deploy to staging
- Run smoke tests: `./scripts/report-smoke.sh`
- Monitor DB connections: `ssh db-staging-01 "sudo -u postgres psql -c \"SELECT count(*) FROM pg_stat_activity WHERE application_name='report-service'\""`
- Check logs: no errors

**STOP CONDITIONS:**
- If any test fails → find the root cause
- If DB connections > pool_size * 0.8 → STOP (pool exhaustion risk)
- If downstream timeout < 300s → STOP; fix downstream first

## Gate 4: PR

**PR checklist:**
- Gate 1: scope + dependencies + risks are documented
- Gate 2: implementation + tests are done
- Gate 3: integration tests + staging deploy succeeded
- Rollback plan: revert config and redeploy (< 10 min)
- Monitoring: add alert `report_duration > 280s` (warning before timeout)

**Review focus:**
- DB connection pool size: is it sufficient?
- Downstream services: are they updated?
- UX: do users know a report may take up to 5 minutes?

**DoD:**
- PR approved by 2 reviewers
- CI/CD is green
- Staging deploy has been healthy for > 24 hours (no issues)

EXECUTION MODE:
- At each gate, stop and show the results
- The human confirms: "continue" or "fix X"
- Record all decisions in the SOP
```

### Execution output

The agent executes Gate 1 (commands run autonomously):

```bash
# grep
$ grep -r "report.*timeout" ./services/report ./config
config/report-service.yml:  generation_timeout: 120s
services/report/handler.go:const ReportTimeout = 120 * time.Second
services/api/client/report_client.go:Timeout: 150 * time.Second

# dependency analysis
$ go list -m -json all | jq -r '.Path' | grep report
github.com/company/report-service
github.com/company/api-gateway (uses report-client)
github.com/company/dashboard-service (uses report-client)

# DB connection pool checks
$ ssh db-staging-01 "sudo -u postgres psql -c \"SHOW max_connections;\""
max_connections = 100

$ ssh db-staging-01 "sudo -u postgres psql -c \"SELECT count(*) FROM pg_stat_activity WHERE application_name='report-service';\""
count = 12

# Agent math: max concurrent reports = 100 / (250s avg / 300s timeout) ≈ 120
# Current usage: 12; headroom: 108 → SAFE
```

**Gate 1 result:**

```markdown
## Gate 1: design review — PASSED

**Scope:**
- `config/report-service.yml`: timeout 120s → 300s
- `services/report/handler.go`: const 120s → 300s
- `services/api/client/report_client.go`: client timeout 150s → 350s (headroom)

**Dependencies:**
- api-gateway (uses report-client; timeout increased to 350s)
- dashboard-service (uses report-client; timeout increased to 350s)

**Risks:**
- Risk 1: DB connection pool exhaustion (likelihood: LOW, impact: HIGH)
  - Mitigation: checked; current usage 12/100; headroom 88
- Risk 2: downstream service timeouts (likelihood: MEDIUM, impact: HIGH)
  - Mitigation: increased client timeouts (350s > 300s)
- Risk 3: UX (users think the service is hung) (likelihood: MEDIUM, impact: MEDIUM)
  - Mitigation: add a progress indicator in the UI (separate task)

**Decision:** proceed to Gate 2
```

The agent executes Gate 2:

```bash
# changes applied
$ git diff config/report-service.yml
-  generation_timeout: 120s
+  generation_timeout: 300s

# build
$ make build
Building report-service... OK (1m 23s)

# tests
$ make test-unit
Running 87 tests... OK (0m 45s)
```

**Gate 2 result: PASSED**

The agent executes Gate 3:

```bash
# staging deploy (dry-run first)
$ ansible-playbook -i inventories/staging playbooks/report-service.yml --tags deploy --check --diff --extra-vars "report_service_version=<NEW_VERSION>"

# Decision packet + approval gate (even for staging, to keep the pattern intact when moving to production):
# - dry-run showed expected changes
# - request approval from the environment/release owner
# - STOP without approval
#
# Apply (after approval):
$ ansible-playbook -i inventories/staging playbooks/report-service.yml --tags deploy --diff --extra-vars "report_service_version=<NEW_VERSION>"
Deploy report-service: OK

# smoke tests
$ ./scripts/report-smoke.sh
Test 1 (small report, 10s):  PASS
Test 2 (medium report, 120s):  PASS
Test 3 (large report, 250s):  PASS
Test 4 (timeout, 310s):  PASS (timeout error as expected)

# DB connections during the test run
$ ssh db-staging-01 "sudo -u postgres psql -c \"SELECT max(c) FROM (SELECT count(*) AS c FROM pg_stat_activity WHERE application_name='report-service' GROUP BY datname) AS counts;\""
max = 18 (peak on test 3; safe headroom)
```

**Gate 3 result: PASSED**

**Gate 4: PR created (#245)**

```markdown
## PR #245: increase report generation timeout (120s → 300s)

### Summary
Users reported slow report generation (> 2 min). Increased the timeout to 300s.

### Gate 1: design review
- Scope: 3 files changed
- Dependencies: 2 downstream services updated
- Risks: DB connection pool checked (sufficient headroom)

### Gate 2: implementation
- Build: passed
- Tests: 87/87 passed
- Linter: no new warnings

### Gate 3: testing
- Staging deploy: successful
- Smoke tests: 4/4 passed
- DB connections: peak 18/100 (safe)

### Rollback plan
Dry-run (required) → approval → apply:

`ansible-playbook -i inventories/production playbooks/report-service.yml --tags rollback --check --diff --extra-vars "report_service_version=<PREV_VERSION>"`

`ansible-playbook -i inventories/production playbooks/report-service.yml --tags rollback --diff --extra-vars "report_service_version=<PREV_VERSION>"`

ETA: < 5 min

### Monitoring
Added alert: `report_duration > 280s` (warning before timeout)

**Reviewers:** @bob @kevin @stuart
```

---

## Common mistakes

### Mistake 1: skipping Gate 1 (design review)

**Scenario:**

A junior engineer: "This is simple. Increase the timeout. Why waste time on design review? I'll go straight to code."

```diff
# config/report-service.yml
-  generation_timeout: 120s
+  generation_timeout: 300s
```

Commit → PR → merge → deploy → production incident.

**What went wrong:**

They missed:
- `services/api/client/report_client.go` has a hardcoded timeout of 150s (less than the new 300s)
- the DB connection pool was not sized for longer-held connections
- downstream services had timeouts < 300s

Result: downstream timeouts → cascading failure → two hours of downtime.

**Takeaway:**

In 2014, Brent saw a similar incident: someone (not Brent) changed a DB timeout without design review → production failure. After that, Brent started doing design review for every change, but the process still lived in his head.

In 2026, Gate 1 makes design review mandatory and structured: the agent helps with grep, dependency analysis, and a first-pass risk assessment—the same steps Brent did manually. In a typical case it is tens of minutes instead of an hour+ (order of magnitude depends on the codebase and artifact quality).

**How to avoid it:**

An SOP with Gate 1 makes design review repeatable:
- the agent analyzes scope (grep, AST parsing)
- the agent checks dependencies (go list, inventories/deploy configs)
- the agent computes risk signals (pool sizing, timeout chains)
- the human reviews and approves/rejects

**Stop condition:** if an engineer skips Gate 1, CI/CD should reject the PR: "Design review required (checklist not filled)".

### Mistake 2: Gate 2 without local verification

**Scenario:**

Richard wrote the code but did not run build/tests locally:

```go
// services/report/handler.go
const ReportTimeout = 300 * time.Second
```

Push → CI/CD → build fails → "Oops, a typo."

**The problem:**

The feedback loop is slow:
- local build: ~1 min
- CI/CD build: 5-10 min (queue + setup)

Result: ten minutes wasted on something that could have been caught in one.

**Takeaway:**

In 2014, Parts Unlimited CI/CD could take 30-60 minutes (legacy Jenkins). Engineers pushed code "blind" → slow feedback → frustration.

In 2026, the agent runs build/tests locally before pushing:

```bash
# agent runs before commit/push
$ make build && make lint && make test-unit
Building... OK
Linting... OK
Testing... OK

# only then push
$ git push
```

**How to avoid it:**

Gate 2 includes local verification:
- build locally
- run tests locally
- only push if green

**Stop condition:** if build/tests fail, fix locally and re-run Gate 2.

### Mistake 3: Gate 3 without staging deploy

**Scenario:**

Lance: "Richard, tests passed locally. Can we go to production?"

**Risk:**

Local != production:
- DB versions differ
- systemd/resource limits differ (CPU/memory limits, ulimit, unit overrides)
- network latency differs

Result: works locally, fails in production.

**Takeaway:**

In 2014, Parts Unlimited deployed straight to production (no staging). Result: every other deploy failed.

After the 10th incident, Bill Palmer created a staging environment: "Everything goes through staging first."

In 2026, Gate 3 makes staging deploy mandatory:

```
Gate 3: testing

1. Local tests
2. Deploy to staging
3. Run smoke tests on staging
4. Monitor staging for 24 hours
5. Only after 24h → approve production deploy

STOP CONDITION: if staging deploy fails → investigate, fix, repeat Gate 3
```

**How to avoid it:**

The SOP requires an explicit staging check:
- deploy to staging
- run smoke tests
- monitor staging for 24 hours
- only then approve production

### Mistake 4: no rollback path (and no rule for when a full rollback plan is required)

**Scenario:**

Production deploy → service crashes → "How do we roll back?"

Panic. Thirty minutes of searching. Downtime grows.

**Takeaway:**

In 2014, Parts Unlimited had the payroll incident: deploy failed, rollback took four hours (nobody knew how).

After that, Patty McKee introduced a rule: "Every change must have a rollback path before deploy."

In 2026, Gate 4 makes this part of the contract:

```
Gate 4: PR

**Rollback path (minimum, always):**
- revert → redeploy (per your deployment standard)

**Rollback plan (detailed, when required by risk triggers):**
- commands/steps
- time estimate
- verification (for example, smoke tests after rollback)
- if possible: test on staging (forward → rollback → verify)

STOP CONDITION: if risk triggers require a tested rollback but rollback was not tested → STOP and test rollback on staging first
```

**How to avoid it:**

The SOP makes rollback part of the process:
- baseline rollback path is always defined (so you do not invent it mid-incident)
- for risky changes, the agent prepares a detailed plan and, when possible, tests rollback on staging
- only then can you honestly say "ready for deployment"

---

## Parallel track: the evolution from 2014 to 2026

### How it looked in 2014 (Bill Palmer and the Brent problem)

**Scene from the book (chapters 7-12 of "The Phoenix Project"):**

**Situation:** Brent is the only person at Parts Unlimited who understands the legacy systems. Any critical change bottlenecks on him. The team waits. Projects slip. Bill tries to solve "the Brent problem."

**The Brent problem (early in the book):**
- **Load:** 70+ hours/week (in this storyline; an order-of-magnitude example)
- **Bus factor:** 1 (if Brent is out → the company stops)
- **Knowledge:** in Brent's head; undocumented
- **Team blocked:** 15-20 times/week the team waits on Brent for critical changes
- **Brent's work:** ~80% "boring changes" (config updates, deploys), ~20% strategic work

**What Bill tried (manually):**

**Attempt 1 (failed):** "Brent, write documentation"
- Time: two weeks of documentation effort
- Result: 50 pages nobody uses (stale in a month)
- Outcome: Bus factor stays 1

**Attempt 2 (partially successful):** delegation + mentoring
- Time: ~6 months of pairing and mentoring
- Result: 2-3 engineers can do basic changes (Bus factor 1 → 3)
- But: Brent still works 50+ hours/week; only simple tasks are delegated

**Attempt 3 (long-term success by the end of the book):** documentation + automation + process
- Time: 12-18 months of transformation
- Actions:
  - document processes (`runbooks`, checklists)
  - automate routine work (deploy/config scripts)
  - onboard through a structured process
- Result (end of the book, illustrative numbers):
  - Brent: 70 hours/week → 40 hours/week (-30)
  - Bus factor: 1 → 3
  - Routine share: 80% → 50%
  - Team blocked: 15-20/week → 5/week

The important point is not the exact numbers. It is the organizational reality: "months of transformation" are not a linear formula. They are cycles of training, feedback, keeping documentation alive, and changing habits.

### How it looks in 2026 (Lance Bishop and knowledge capture with agents)

**The same problem (Richard Hendricks is "our Brent"):**

Richard is the legacy DB expert. The team is blocked on DB changes. Bus factor = 1.

**Lance's 2026 approach:** "pair with an agent to capture the process"

**Week 1: the first SOP with an agent**

What happens:
1. Richard performs a typical change (DB timeout) with the agent acting as an apprentice
2. The agent asks questions in real time:
   - "Why do you check the connection pool size before changing a timeout?"
   - "What risks are you mitigating with alerts and metrics?"
   - "What is the rollback path if this goes wrong?"
3. The agent generates an SOP with gates based on the answers
4. Richard reviews the SOP (15 minutes) and adds edge cases

Time: ~4 hours (Richard does the change and answers questions)

Result:
- SOP is ready (not 50 pages of free-form text, but an executable procedure with gates)
- SOP is runnable: the agent can execute checks
- stop conditions define when to stop and ask Richard

**Weeks 2-4: scale up SOPs**
- Week 2: three more SOPs (config update, deploy, rollback)
- Week 3: a junior engineer uses the SOP + agent for a simple change; Richard only reviews
- Week 4: two more engineers are trained to work via SOP + agent

**Months 2-3: Bus factor grows**
- Month 2: the team does most typical changes without Richard
- Month 3: Bus factor reaches 5+ (as an example target; real numbers depend on domain complexity and SOP discipline)

**Why it tends to be faster and cheaper:**
- SOPs are captured during execution (not "we'll document later")
- tacit knowledge becomes explicit via the agent's questions
- SOP maintenance cost is lower: when formats change, you update the SOP pattern, not rewrite documentation from scratch

---

### Evolution, not revolution

**The key difference:**
- **2014:** Bill used documentation + mentoring (slow, manual, goes stale)
- **2026:** Lance uses documentation + mentoring + agents (faster, easier to keep current)

**Not a replacement, an amplifier:**

| What it is | Bill 2014 (documentation approach) | Lance 2026 (agents for knowledge capture) |
|------------|------------------------------------|-------------------------------------------|
| **Knowledge capture** | Brent writes docs (weeks) | Richard does the change + agent captures it (hours) |
| **Format** | free-form text | structured SOP with gates |
| **Training** | months of pairing | self-serve SOP + agent |
| **Maintenance** | rewrite when stale | update the pattern/SOP incrementally |
| **Execution** | humans follow docs | agent can execute checks per SOP |
| **Control** | expert review | gates + stop conditions + human approval |

---

## Business impact: what changes after a month (knowledge capture)

### Time saved

The most reliable signal is not a spreadsheet. It is a shift in the day-to-day:
- SOPs are created faster because knowledge is captured while work happens
- training becomes self-service (SOP + agent) instead of months of pairing
- routine changes move to repeatable procedures with gates, reducing expert load

### Quality improvements

**Knowledge retention:**
- Before: knowledge sits with Richard; a vacation blocks the team (Bus factor = 1)
- After: knowledge is in SOPs; any engineer can run it with an agent

**Success rate of changes:**
- Before: "roughly" (human errors: skipped steps, "forgot to check X")
- After: measurably higher due to repeatability and explicit verification (measure in your context)

**SOP maintenance:**
- Before: documents rot quickly
- After: SOP updates track system changes; updates are smaller and cheaper

### Organizational impact

**Expert load (Richard):**
- Before: 65 hours/week, mostly routine and interruptions
- After: closer to a sustainable schedule; more time for strategic work (verify with real measurement)

**Team blocked on the expert:**
- Before: frequent escalations
- After: escalations become exceptions (edge cases)

### Economic model (for your context)

Do not copy numbers from a book. Use your own model:
- Baseline: where time is lost (waiting, manual coordination, repeated steps)
- Target: what is delegated to an agent; where approval/STOP applies
- Cost: SOP creation + maintaining templates/checks
- Value: less expert dependency + fewer blocks + fewer failed changes

Use the template in [Appendix A]({{< relref "appendix/A-business-case.md" >}}).

---

## Cumulative progress (Chapters 1 → 5)

The important thing is the compounding effect:
- processes become repeatable
- dependency on experts decreases via SOPs and gates
- routine work is delegated, freeing time for engineering decisions

---

## Alternatives for the Brent problem (and why SOP + agents is attractive)

**Alternative 1: hire two more senior engineers**
- Cost: hiring and onboarding
- Time-to-value: slow ramp
- Risk: knowledge still sits in heads; bus factor improves but does not disappear

**Alternative 2: a big documentation project (Bill's 2014 approach)**
- Cost: high expert time + organizational discipline
- Loop: long cycles
- Maintenance: docs rot; needs constant attention

**Alternative 3: SOP + agents (chosen)**
- Cost: time to produce and maintain SOPs
- Time-to-value: shorter because you delegate repeatable steps
- Risk: reduced through gates + stop conditions + approval

---

## What to do right now

1. Identify one expert bottleneck in your team (Bus factor = 1).
2. Pick one routine change process the expert runs regularly (4-6 hours each time).
3. Have the expert do the change once with an agent capturing the process into an SOP.
4. Train 1-2 engineers to run that SOP with the agent and validate outcomes.

---

## Summary

### What we did

Built a "design → PR" SOP with four gates:

1. **Gate 1 (design review):** scope + dependencies + risks
2. **Gate 2 (implementation):** code + local verification (build/tests)
3. **Gate 3 (testing):** staging deploy + smoke tests + monitoring
4. **Gate 4 (PR):** review + rollback (baseline path; detailed plan by risk triggers) + definition of done

### Artifacts

- A copy-paste "design → PR" SOP with four gates
- An agent prompt to generate an SOP from a senior engineer's process
- A worked example (report timeout change) showing the gates end-to-end
- Checklists for each gate (stop conditions + done criteria)

### Key principles

In 2014, Brent held the process in his head (Bus factor = 1). In 2026, the SOP captures the process and the agent can execute the same checks (grep, build, test) that Brent used to do manually.

### Acceptance criteria

You have mastered the chapter if you can:

**Level 1: understand**
- explain what a gate is and why it exists
- explain the difference between "Brent in his head" (2014) and "SOP + agent" (2026)
- list the four gates and their purpose

**Level 2: apply**
- create an SOP for a typical change in your project
- define stop conditions for each gate
- write an agent prompt for Gate 1 (design review)

**Level 3: repeatability**
- use the SOP for a real change with an agent
- have the agent pass all four gates
- ensure the change is reviewable and testable; rollback path is defined, and where risk triggers require it, rollback is tested

**Level 4: scale**
- the SOP is used by the team (not only by you)
- bus factor increases (a junior can execute the change without a senior in the loop)
- time-to-change drops meaningfully (measure in your environment)

### Next steps

**Chapter 6:** operations and incidents—teach the agent to act as a first line for routine incidents (`runbooks` + SLI/SLO + triage playbooks).

Connection to Chapter 5: an SOP helps you ship a change. But what happens after deployment? Chapter 6 covers how to create `runbooks` an agent can follow for operations.

---

[^agentskills-overview]: Open "Agent Skills" format: what skills are and how progressive disclosure works. See [Agent Skills Overview](https://agentskills.io/).

