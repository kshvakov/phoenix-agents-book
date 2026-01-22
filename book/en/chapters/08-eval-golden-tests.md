---
title: "Chapter 8: eval dataset + golden tests"
description: "How to measure agent quality: eval datasets, golden tests, regressions, and a continuous improvement loop without “trusting the answer”."
lastmod: 2026-01-21
weight: 8
---

# Chapter 8: eval dataset + golden tests (measuring agent quality)

## Prologue: Parts Unlimited, 2014. The payroll incident

**Friday night.** Lance Bishop’s phone rings.

"The payroll system is down. We can’t run payroll. This is business-critical."

Ten years earlier, Bill Palmer faced the same thing back in 2014.

**Timeline (2014):**

- Overnight: an alert fires (payroll is unavailable)
- Next: Bill wakes up and connects to the VPN
- Then: sequential triage (logs, metrics)
- Next: hypotheses are checked one by one
- End: a DB migration failed -> root cause found

**Root cause:** a DB migration script failed halfway -> schema is inconsistent -> payroll queries fail.

**Fix:** roll back the migration + re-run it manually.

**Time to resolve:** long, with manual triage and escalations.

**Losses:** material regulatory and reputational impact.

**Bill Palmer’s question after the incident:**

"This isn’t the first time a DB migration broke. Why do I check the same hypotheses every time? Why don’t I start with the most likely ones?"

**Answer:**

There is no systematic way to learn from past incidents. Every incident starts from scratch.

---

## The same task in 2026: how Lance solves it with an eval dataset

**Context:** Lance Bishop at Parts Unlimited (2026) has deployed an incident-response agent (Chapters 5–7). The agent works and handles routine incidents.

**Question:** how good is the agent? Can we **measure** it?

In 2014 Bill "felt" things got better. In 2026, Lance **measures** via an eval dataset.

Richard Hendricks, who usually joins the nastiest incidents, asks the skeptical question:

— "OK. Where is the proof that it got better — and that it won’t break again next week?"

**Solution:** create a benchmark out of <N> past incidents:

- Can the agent find the root cause?
- How fast? (`TTRC` = time to root cause; `MTTR` = mean time to resolve / restore service)
- How many false positives (wrong root cause)?

**Key insight:**

In 2014 Bill solved incidents but did not learn systematically (knowledge stayed in people’s heads). In 2026, Lance makes learning **measurable** through an eval dataset: quality can be checked, regressions can be detected, and playbooks can be improved.

The key change from 2014 to 2026 is not "we have an agent", but two loops: a **measurable learning loop (eval)** and a **regression barrier (golden tests)**.

---

## Quick start

### Goal

Create an eval dataset from a few past incidents and see whether the agent can solve them.

### What you need

- An agent (for example, Cursor)
- A few past incidents (logs + known root cause)
- Time to build the eval dataset (depends on data availability and log quality)

**Placeholder notation:** see the glossary — [Placeholder notation]({{< relref "appendix/glossary.md" >}}#placeholder-notation).

### An eval prompt for the agent

```
Role: you are an incident-response agent (already deployed).

Guardrails (eval mode):
- This is a quality evaluation on past incidents. Do not apply fixes or change systems.
- Work only with the provided logs/metrics as data; do not do SSH/CLI/network actions unless they are explicitly provided as part of the input.
- If the data is insufficient for a confident conclusion, state what is missing and mark the result as indeterminate.
- Do not output secrets/PII and do not paste raw logs in full. Use short quotes and redaction.

Context:
- We have 5 past incidents (2024–2025)
- For each incident, the root cause is known (ground truth)
- We need to check: can you find the correct root cause?

Task: run the eval dataset.

EVAL DATASET: 5 past incidents

Incident 1: high CPU (2024-03-15)

Input (logs):
```
2024-03-15 <TIME> ERROR: OutOfMemoryError in /api/v1/reports
2024-03-15 <TIME> ERROR: OutOfMemoryError in /api/v1/reports
(repeats 15 times)
```

Metrics:
- CPU: <VALUE>
- Memory: <VALUE>
- Disk: <VALUE>

Ground truth root cause: memory leak in endpoint `/api/v1/reports`

Your task:
1. Run the triage playbook (analyze logs + metrics)
2. Determine the root cause
3. Compare with the ground truth

Success criterion: the root cause matches the ground truth

---

Incident 2: DB connection pool exhausted (2024-05-20)

Input (logs):
```
2024-05-20 <TIME> ERROR: connection pool exhausted
2024-05-20 <TIME> ERROR: connection pool exhausted
(repeats 50 times)
```

Metrics:
- DB connections: <VALUE>
- Service replicas: <VALUE>
- Queries: <VALUE>

Ground truth root cause: the service was scaled (5 -> 10 replicas) but the DB pool size was not increased

Your task: determine the root cause.

Success criterion: the root cause matches the ground truth

---

Incident 3: disk full (2024-07-10)

Input (logs):
```
2024-07-10 <TIME> ERROR: cannot write to disk (no space left)
2024-07-10 <TIME> ERROR: cannot write to disk (no space left)
```

Metrics:
- Disk usage: <VALUE>
- Largest directory: /var/log (<VALUE>)
- Service: crashed (cannot write logs)

Ground truth root cause: log rotation is broken (logs accumulated)

Your task: determine the root cause.

Success criterion: the root cause matches the ground truth

---

Incident 4: payroll unavailable (2024-11-22)

Input (logs):
```
2024-11-22 <TIME> ERROR: invalid column "new_field" in table "employees"
2024-11-22 <TIME> ERROR: query failed: column does not exist
```

Metrics:
- Service: running
- DB: reachable
- Disk/CPU/Memory: OK

Ground truth root cause: the DB migration failed halfway (schema is inconsistent)

Your task: determine the root cause.

Success criterion: the root cause matches the ground truth

---

Incident 5: API timeout (2024-12-30)

Input (logs):
```
2024-12-30 <TIME> ERROR: request timeout after <WINDOW>
2024-12-30 <TIME> ERROR: request timeout after <WINDOW>
(repeats 100 times)
```

Metrics:
- API latency: <VALUE> (baseline <VALUE>)
- DB query duration: <VALUE> (baseline <VALUE>)
- External API call: OK

Ground truth root cause: slow DB query (missing index on a new column)

Your task: determine the root cause.

Success criterion: the root cause matches the ground truth

---

EVALUATION METRICS

After you evaluate all 5 incidents, compute metrics:

Accuracy:
- correct root causes / total incidents
- Target: >= 80% (4/5 or 5/5)

False positive rate:
- incidents where you found the wrong root cause / total incidents
- Target: <= 20% (1/5 or 0/5)

Average time to root cause:
- average TTRC over 5 incidents
- Target: < 5 minutes per incident

Note: TTRC (time to root cause) is not the same as MTTR (mean time to resolve).

Output format:

```json
{
  "eval_results": [
    {
      "incident_id": "INC-2024-03-15",
      "ground_truth": "memory_leak",
      "predicted_root_cause": "memory_leak",
      "correct": true,
      "ttrc_seconds": 120
    },
    ...
  ],
  "metrics": {
    "accuracy": 1.0,
    "false_positive_rate": 0.0,
    "average_ttrc_seconds": 180
  }
}
```

EXECUTION MODE:
- The agent performs triage for each incident
- The agent records the predicted root cause
- The agent compares to the ground truth
- The agent computes metrics
```

### Steps

1. **Prepare the eval dataset:** 5 past incidents (logs + metrics + ground truth)
2. **Run the eval:** the agent analyzes each incident
3. **The agent performs triage** autonomously (commands + analysis)
4. **Compare results:** predicted vs ground truth
5. **Metrics:** accuracy, false positive rate, average time to root cause

### Example result

The agent ran the eval on 5 incidents:

```json
{
  "eval_results": [
    {
      "incident_id": "INC-2024-03-15",
      "description": "High CPU load",
      "ground_truth": "memory_leak_in_reports_endpoint",
      "predicted_root_cause": "memory_leak_in_reports_endpoint",
      "correct": true,
      "ttrc_seconds": 95,
      "triage_steps": [
        "Log analysis: repeating OutOfMemoryError found",
        "Metrics check: CPU 85%, Memory 90%",
        "Hypothesis: memory leak",
        "Confirmation: endpoint /api/v1/reports"
      ]
    },
    {
      "incident_id": "INC-2024-05-20",
      "description": "DB connection pool exhausted",
      "ground_truth": "pool_size_not_scaled_with_replicas",
      "predicted_root_cause": "pool_size_not_scaled_with_replicas",
      "correct": true,
      "ttrc_seconds": 110
    },
    {
      "incident_id": "INC-2024-07-10",
      "description": "Disk full",
      "ground_truth": "log_rotation_broken",
      "predicted_root_cause": "log_rotation_broken",
      "correct": true,
      "ttrc_seconds": 80
    },
    {
      "incident_id": "INC-2024-11-22",
      "description": "Payroll system unavailable",
      "ground_truth": "db_migration_failed_halfway",
      "predicted_root_cause": "db_migration_failed_halfway",
      "correct": true,
      "ttrc_seconds": 180,
      "note": "Longer (3 minutes) because hypothesis 4 (DB migration) was checked last"
    },
    {
      "incident_id": "INC-2024-12-30",
      "description": "API timeout",
      "ground_truth": "missing_index_slow_query",
      "predicted_root_cause": "legitimate_high_load",
      "correct": false,
      "ttrc_seconds": 90,
      "note": "FALSE POSITIVE: treated as high load, but the real cause was a missing DB index"
    }
  ],
  "metrics": {
    "total_incidents": 5,
    "correct_predictions": 4,
    "false_positives": 1,
    "accuracy": 0.80,
    "false_positive_rate": 0.20,
    "average_ttrc_seconds": 111,
    "meets_accuracy_target": true,
    "meets_ttrc_target": true
  },
  "improvement_opportunities": [
    {
      "incident": "INC-2024-12-30",
      "issue": "Missed a missing DB index (treated it as high load instead)",
      "recommendation": "Add a hypothesis: check DB query duration + missing indexes"
    },
    {
      "incident": "INC-2024-11-22",
      "issue": "TTRC <TTRC_SECONDS> (longer than target <TTRC_TARGET>)",
      "recommendation": "Reorder triage hypotheses: check DB migrations earlier (high likelihood for payroll incidents)"
    }
  ]
}
```

**Results:**

- **Accuracy:** 80% (4/5 correct) — target >= 80%
- **False positive rate:** 20% (1/5 wrong) — target <= 20%
- **Average TTRC:** <TTRC_SECONDS> — target < <TTRC_TARGET>

**Improvement opportunities:**

1. **Add a hypothesis:** "check DB query duration + missing indexes" (will catch INC-2024-12-30)
2. **Reorder hypotheses:** prioritize DB migrations for payroll incidents (will reduce TTRC for INC-2024-11-22)

**Next iteration:**

- Apply improvements
- Re-run eval
- Target: accuracy 100% (5/5), average TTRC < <TTRC_TARGET>

**Time spent:**

- 2014 Bill: no eval (did not measure quality, just "felt it")
- 2026 Lance: 30 minutes to prepare the eval dataset + 10 minutes to run it -> measurable quality + concrete improvement opportunities

---

## Theory: eval datasets, golden tests, the improvement loop

### Concept 1: An eval dataset means “measure”, not “feel”

**The 2014 problem:**

After 20 incidents Bill Palmer says: "Seems better. MTTR is down... I guess."

No metrics -> no way to **prove** it got better.

**The 2026 solution: an eval dataset**

**An eval dataset is a benchmark of past incidents with a known root cause.**

**Eval dataset structure**

**An incident record**

```json
{
  "incident_id": "INC-2024-03-15",
  "timestamp": "2024-03-15T02:17:00Z",
  "service": "api-gateway",
  "alert": "High CPU > 80%",
  "logs": ["2024-03-15 <TIME> ERROR: OutOfMemoryError..."],
  "metrics": {
    "cpu": 85,
    "memory": 90,
    "disk": 60
  },
  "ground_truth": {
    "root_cause": "memory_leak_in_reports_endpoint",
    "fix": "restart deployment",
    "resolution_time_human": 1800
  }
}
```

**Eval metrics**

**Accuracy:**

```
accuracy = correct_predictions / total_incidents
```

Target: >= 80% (the agent finds the correct root cause in 80%+ cases)

**False positive rate:**

```
false_positive_rate = wrong_predictions / total_incidents
```

Target: <= 20% (the agent is wrong in <= 20% cases)

**Precision (for tasks with a “positive class”):**

```
precision = true_positives / (true_positives + false_positives)
```

**Recall:**

```
recall = true_positives / (true_positives + false_negatives)
```

**F1 score (balance between precision and recall):**

```
f1 = 2 * (precision * recall) / (precision + recall)
```

Target: F1 >= 0.85

**How to use it:**

1. **Baseline:** run eval on the current agent -> accuracy 80%
2. **Improve:** add a new hypothesis to the triage playbook
3. **Re-eval:** run eval again -> accuracy 90%
4. **Measure:** improvement = +10% (measurable)

In 2014 Bill "felt" improvement. In 2026 Lance **measures** improvement through an eval dataset.

### Concept 2: golden tests are a regression barrier

**The problem:**

Agent v1: accuracy 90% (18/20 incidents correct).

A developer changes the triage playbook (an optimization).

Agent v2: accuracy 75% (15/20 incidents correct).

**Regression:** the new version is worse than the previous one.

**How do you catch regressions?**

**Golden tests are a subset of the eval dataset that must pass without exceptions.**

Richard Hendricks frames it as a simple review rule:

— "If golden tests are red, we don’t 'debate' and we don’t merge. First we get the loop back to green."

**Definition:** golden tests are critical incidents that the agent **must** solve correctly.

**Golden test criteria:** an incident becomes a golden test if it is:

- **Business-critical:** payroll, billing, the main user journey
- **High-cost if wrong:** downtime > <THRESHOLD> loss
- **Regulatory risk:** regulatory impact (GDPR, PCI DSS)
- **Frequent:** repeats > 3 times/year

**Example golden test set:**

```json
{
  "golden_tests": [
    {
      "id": "GOLDEN-001",
      "incident": "INC-2024-11-22",
      "description": "Payroll system unavailable (DB migration failed)",
      "reason": "Business-critical + regulatory risk (payroll cannot be delayed)",
      "must_pass": true
    },
    {
      "id": "GOLDEN-002",
      "incident": "INC-2024-08-10",
      "description": "Billing system timeout (payment gateway)",
      "reason": "High cost of failure (hourly revenue loss above threshold)",
      "must_pass": true
    },
    {
      "id": "GOLDEN-003",
      "incident": "INC-2024-05-20",
      "description": "DB connection pool exhausted",
      "reason": "Frequent (happened 5 times in 2024)",
      "must_pass": true
    }
  ]
}
```

**A CI/CD gate:** before deploy, run golden tests; all must pass.

```bash
# Before deploy: run golden tests
$ python eval_agent.py --golden-only

Golden test results:
GOLDEN-001: PASS (root cause correct)
GOLDEN-002: PASS (root cause correct)
GOLDEN-003: FAIL (wrong root cause predicted)

DEPLOY BLOCKED: 1 golden test failed

# You must fix it before deploy
```

**Principle:**

The agent may regress on non-critical incidents; that can be acceptable. But it **must not** regress on golden tests. If it does, deploy must be blocked.

In 2014 Bill could not prevent regressions (no eval loop). In 2026 Lance introduces golden tests that block deploys when a regression is detected.

#### Verification agent and test runner: roles that make “quality” real

In practice, the problem is not only "no tests". Often checks exist, but:

- someone **claims** things are done ("fixed, should work"), but it’s not true;
- tests are "supposed to run", but they **don’t run** reliably, or nobody reads results.

Two useful patterns for this loop:

- **Verification agent (verifier):** an independent skeptic who checks that the claimed "done" actually works: runs relevant checks, looks for gaps and edge cases, and returns a report: what passed / what’s broken / what wasn’t checked.
- **Test runner:** a role that **proactively** runs the required tests/checks (including golden tests) when changes happen and gets the system back to green, **without rewriting test expectations** to match "whatever happened" and without breaking their original meaning.

This does not have to be separate models. It can be separate roles in your multi-agent system or a formal CI/CD step. The value is **separation of responsibility**: one role writes/changes; a verifier proves; a test runner runs and records results.

> **One example implementation (what it looks like in a tool):** many environments let you configure specialized executors for "verification", "debugging", and "running tests". For instance, see "Verification agent" and "Test runner" in [Cursor Subagents](https://cursor.com/docs/context/subagents) as one possible implementation of the concept.

Add-on: to make this loop resilient, it helps to package "verification" and "test execution" as Agent Skills (folders with `SKILL.md`): with clear "when to use", a DoD/report format, and command/script references. Then verification becomes a portable procedure instead of a one-off chat request.[^agentskills-overview]

### Concept 3: the improvement loop is systematic learning

**The 2014 problem:**

Bill resolved 20 incidents -> "it got better" -> but he **doesn’t know** what exactly to improve.

**The 2026 solution: an improvement loop**

## Improvement loop

### Step 1: run eval

Run eval on the current agent and measure metrics (example):

- Accuracy: 80% (16/20 correct)
- False positive rate: 15% (3/20 wrong)
- Average TTRC: <TTRC_SECONDS>

### Step 2: analyze failures

For each failed incident:

- Why didn’t the agent find the root cause?
- What hypothesis was missing?
- What diagnostics were skipped?

**Example:**

```json
{
  "failed_incident": "INC-2024-12-30",
  "ground_truth": "missing_index_in_db",
  "predicted": "legitimate_high_load",
  "analysis": {
    "missing_hypothesis": "Check DB query duration + missing indexes",
    "missing_diagnostics": "EXPLAIN for the query (verify index usage)",
    "root_cause": "The triage playbook does not check indexes"
  }
}
```

### Step 3: implement the fix

Add the missing hypothesis to the triage playbook:

**Example change (new hypothesis):**

- **Hypothesis 4:** missing DB index (likelihood: medium)
- **Diagnostics:**

```bash
ssh db-prod-01 'sudo -u postgres psql -c "EXPLAIN ANALYZE <slow_query>"'
```

- **Success criterion:** the query uses an index (no `Seq Scan`)
- **If `Seq Scan` is found:**
  - **Root cause:** missing index
  - **Fix:** create an index
  - **Stop:** stop triage

### Step 4: re-run eval

Run eval on the improved agent and measure metrics (example):

- Accuracy: 90% (18/20 correct) — **+10% improvement**
- False positive rate: 10% (2/20 wrong) — **-5% improvement**
- Average TTRC: <TTRC_SECONDS> — **better than baseline**

### Step 5: deploy the improved agent

If the improvement is measured, deploy to production.

### Step 6: production monitoring

Collect new incidents -> add them to the eval dataset -> go back to step 1.

**Result:** continuous improvement.

**Improvement metric:**

- 2014 Bill: no measurements (no idea what improved)
- 2026 Lance: accuracy 80% -> 90% (measurable +10%)

### Concept 4: test coverage means happy path and edge cases

**The problem:**

An eval dataset has 20 incidents, but all of them are routine (high CPU, disk full). The agent passes eval (accuracy 90%), then you deploy to production, and it **fails on an edge case** (for example, network partition or a rare DB deadlock).

**Solution: a test coverage matrix**

**Test Coverage Matrix**

**Coverage categories**

**Routine scenarios (happy path):**

- High CPU load (memory leak)
- Disk full (log rotation broken)
- DB connection pool exhausted
- API timeout due to a slow DB query

Coverage target: 80% of production incidents

**Edge cases (rare but critical):**

- Network partition / split-brain
- DB deadlock
- Cascading failure (service A -> B -> C)
- Security incident (security breach)

Coverage target: 15% of production incidents

**Unknown (never happened before):**

- New incident type
- The agent must escalate (cannot handle)

Coverage target: 5% of production incidents

**Recommended eval dataset mix:**

```json
{
  "eval_dataset": {
    "total": 20,
    "happy_path": 16,  // 80%
    "edge_cases": 3,   // 15%
    "unknown": 1       // 5%
  }
}
```

**Edge case examples:**

1. **Network partition:**
   - Symptoms: service A cannot reach service B, but both look healthy
   - Root cause: misconfigured egress/network rules (firewall)
   - The agent should: detect the network issue and escalate to the network team

2. **DB deadlock:**
   - Symptoms: query timeouts; DB CPU is normal; intermittent locks
   - Root cause: circular dependency in transactions
   - The agent should: recognize the deadlock pattern and propose retry logic for transactions

3. **Cascading failure:**
   - Symptoms: multiple services fail at the same time
   - Root cause: dependency chain (A depends on B, B depends on C, C failed)
   - The agent should: build a dependency graph and identify the root service

**Success criteria:**

- Happy path: accuracy >= 95%
- Edge cases: accuracy >= 70%
- Unknown: escalation rate = 100%

In 2014 Bill tested only happy path (routine incidents). In 2026 coverage includes edge cases, so the agent becomes more resilient.

### Concept 5: continuous eval is quality monitoring in production

**The problem:**

Staging eval: accuracy 90%.  
Production: accuracy 70% (worse).

**Why?**

Staging is not production:

- Different data distribution (staging synthetic, production real)
- Different load (staging low traffic, production high)
- Different failure modes (staging controlled, production chaotic)

**Solution: continuous eval in production**

**How it works:**

1. The agent resolves an incident in production.
2. After the incident, a human reviews the agent’s decision:
   - root cause correct? (yes/no)
   - fix appropriate? (yes/no)
   - TTRC acceptable? (yes/no)
3. The incident is added to the eval dataset:

```json
{
  "incident_id": "INC-PROD-2026-01-17",
  "timestamp": "2026-01-17T02:17:00Z",
  "agent_prediction": "memory_leak",
  "human_review": {
    "root_cause_correct": true,
    "fix_appropriate": true,
    "ttrc_seconds": 180,
    "comments": "The agent correctly identified the memory leak. The fix worked."
  },
  "added_to_eval": true
}
```

4. Re-run eval weekly (the dataset grows over time).

### Metrics dashboard

**Eval metrics in production (real-time):**

```
Agent accuracy (last 30 days): 87%
False positive rate: 8%
Average TTRC: 6.5 minutes
Escalation rate: 12%

Trend: +3% (month over month)
```

**Action triggers:**

- If accuracy < 80% for 7 days -> investigate a regression
- If false positive rate > 15% -> revisit the triage playbook
- If TTRC > 10 minutes -> optimize diagnostics

In 2014 Bill could not measure quality in production. In 2026 Lance adds continuous eval for real-time quality monitoring.

---

## Practice: building an eval dataset from 20 past incidents

### Task

Build an eval dataset of 20 incidents (2024–2025) and run eval for the agent.

### Step 1: collect incidents

**Source:** production incident logs (2024–2025).

Note: below is example/pseudocode. Do not run commands in production "as-is": adapt to your incident system and access model (read-only by default; allowlisted commands).

```bash
# Export incidents from an incident-management system
$ sudo journalctl -u incident-tracker --since="365 days ago" > incidents_2024_2025.log

# Parse incidents (extract incident_id, timestamp, logs, metrics, resolution)
$ python parse_incidents.py incidents_2024_2025.log > eval_dataset.json
```

**Eval dataset (20 incidents):**

```json
{
  "eval_dataset": [
    {
      "incident_id": "INC-2024-01-15",
      "timestamp": "2024-01-15T03:20:00Z",
      "service": "api-gateway",
      "alert": "High CPU load",
      "logs": ["ERROR: OutOfMemoryError..."],
      "metrics": {"cpu": 85, "memory": 92},
      "ground_truth": {
        "root_cause": "memory_leak_reports_endpoint",
        "fix": "restart_deployment",
        "resolution_time_human_seconds": 1800
      }
    }
    // ... 19 more incidents
  ]
}
```

### Step 2: run eval

**Eval script:**

```python
# eval_agent.py

import json
import time

def run_eval(agent, eval_dataset):
    results = []
    
    for incident in eval_dataset:
        print(f"Evaluating {incident['incident_id']}...")
        
        # Run the agent triage
        start_time = time.time()
        prediction = agent.triage(
            logs=incident['logs'],
            metrics=incident['metrics']
        )
        ttrc = time.time() - start_time
        
        # Compare with ground truth
        correct = (prediction['root_cause'] == incident['ground_truth']['root_cause'])
        
        results.append({
            'incident_id': incident['incident_id'],
            'ground_truth': incident['ground_truth']['root_cause'],
            'predicted': prediction['root_cause'],
            'correct': correct,
            'ttrc_seconds': ttrc
        })
    
    # Compute metrics
    accuracy = sum(r['correct'] for r in results) / len(results)
    avg_ttrc = sum(r['ttrc_seconds'] for r in results) / len(results)
    
    return {
        'results': results,
        'metrics': {
            'accuracy': accuracy,
            'average_ttrc_seconds': avg_ttrc
        }
    }

# Run eval
with open('eval_dataset.json') as f:
    dataset = json.load(f)['eval_dataset']

eval_results = run_eval(agent, dataset)

print(f"Accuracy: {eval_results['metrics']['accuracy']:.2%}")
print(f"Average TTRC: {eval_results['metrics']['average_ttrc_seconds']:.1f}s")
```

**Output (example):**

```
Evaluating INC-2024-01-15... OK (correct, <TTRC_SECONDS>)
Evaluating INC-2024-02-10... OK (correct, <TTRC_SECONDS>)
Evaluating INC-2024-03-15... OK (correct, <TTRC_SECONDS>)
Evaluating INC-2024-04-20... FAIL (wrong, <TTRC_SECONDS>)
...
Evaluating INC-2025-12-30... OK (correct, <TTRC_SECONDS>)

Results:
Accuracy: 90% (18/20 correct)
False positive rate: 10% (2/20 wrong)
Average TTRC: <TTRC_SECONDS>
```

### Step 3: analyze failures

**2 failed incidents:**

```json
{
  "failures": [
    {
      "incident_id": "INC-2024-04-20",
      "ground_truth": "network_partition_between_services",
      "predicted": "service_down",
      "analysis": {
        "reason": "The agent did not check network connectivity between services",
        "missing_diagnostic": "ping/curl between services",
        "fix": "Add a hypothesis: network partition"
      }
    },
    {
      "incident_id": "INC-2024-08-12",
      "ground_truth": "db_deadlock",
      "predicted": "db_slow_query",
      "analysis": {
        "reason": "The agent did not recognize the deadlock pattern in DB logs",
        "missing_diagnostic": "Parsing DB logs for 'deadlock detected'",
        "fix": "Add a regex pattern for deadlock detection"
      }
    }
  ]
}
```

### Step 4: implement fixes

**Fix 1: add a network partition hypothesis**

```diff
+### Hypothesis 5: network partition
+
+**Diagnostics:**
+```bash
+ssh service-a-01 "curl -s http://service-b/health"
+```
+
+**IF timeout:**
+  - Root cause: network partition
+  - ESCALATE to the network team
```

**Fix 2: add deadlock detection**

```diff
+# Check DB logs for the deadlock pattern
+if "deadlock detected" in db_logs:
+    root_cause = "db_deadlock"
+    fix = "restart transactions + review transaction isolation"
```

### Step 5: re-run eval

```
Accuracy: 95% (19/20 correct) — +5% improvement
Average TTRC: <TTRC_SECONDS> — improved vs baseline

Remaining failure: INC-2024-11-05 (unknown edge case)
```

### Step 6: create golden tests

**Pick 5 critical incidents as golden tests:**

```json
{
  "golden_tests": [
    "INC-2024-01-15",  // High CPU (frequent)
    "INC-2024-03-20",  // Payroll down (business-critical)
    "INC-2024-05-10",  // Billing timeout (high cost)
    "INC-2024-07-22",  // DB connection pool (frequent)
    "INC-2024-09-15"   // Disk full (frequent)
  ]
}
```

**A gate in CI/CD:**

```bash
# Before deploy
$ python eval_agent.py --golden-only

Golden test results:
All 5 golden tests PASSED

DEPLOY ALLOWED
```

**Time spent:**

- 2014 Bill: no eval setup (did not measure quality)
- 2026 Lance: 2 hours to set up eval (collect incidents, write an eval script) -> **reusable** for all future runs

---

## Common mistakes

### Mistake 1: eval only on happy path -> the agent fails on edge cases

**Scenario:**

An eval dataset of 20 incidents, all routine (high CPU, disk full).  
Agent accuracy is 95% -> deploy to production -> **fails on a network partition** (it wasn’t in eval).

**Problem:** the eval dataset is not representative (no edge cases).

**Takeaway:**

In 2014, Parts Unlimited tested Phoenix Project on staging (happy path only). Production revealed edge cases -> a series of outages.

In 2026, Lance makes this a rule: the eval dataset **must include edge cases**.

**Recommended eval dataset mix:**

- **Routine scenarios (happy path):** 80% (for example, high CPU, disk full)
- **Edge cases:** 15% (for example, network partition, deadlock, cascading failure)
- **Unknown:** 5% — the agent must escalate

**Edge case examples worth including:**

1. Network partition (2 incidents)
2. DB deadlock (1 incident)
3. Cascading failure (1 incident)

**Check:** edge-case accuracy >= 70% + escalation rate on unknown = 100%.

**How to avoid it:**

Eval dataset checklist:

- 80% happy path
- 15% edge cases
- 5% unknown (escalation)
- representative of production incident distribution

### Mistake 2: golden tests don’t get updated -> regressions slip through

**Scenario:**

Golden tests were created in 2024 (5 incidents).  
In 2025, a new critical incident type appears (for example, a host/systemd unit crash or a BGP VIP announcement issue).  
You deploy agent v2 -> **it fails on "VIP not announced / agent unavailable"** -> it wasn’t in golden tests.

**Problem:** golden tests are static, but production changes.

**Takeaway:**

In 2014, the Parts Unlimited CAB checklist was static and did not get updated for years (created in 2012). In 2014 the team started migrating to the cloud -> new failure modes appeared -> the checklist became stale.

In 2026, Lance makes a rule: golden tests **must evolve**.

## Maintaining golden tests

**Quarterly review (every 3 months):**

1. Analyze production incidents from the last 3 months
2. Identify new critical incident types
3. Add to golden tests if:
   - business-critical, or
   - high cost of failure (> <THRESHOLD>), or
   - frequent (> 3 times per quarter)

**Example:**

Q1 2025: 3 incidents "VIP not announced / host died" (critical) -> add to golden tests  
Q2 2025: 5 Redis cache invalidation issues (frequent) -> add to golden tests

**Result:** golden tests grow over time: 5 -> 7 -> 10 (represent current production).

**How to avoid it:**

Golden tests maintenance checklist:

- quarterly review is scheduled
- new critical incidents are identified
- golden tests updated: new ones added, stale ones removed
- CI/CD gate uses the updated golden tests

### Mistake 3: eval is not run before deployment -> regressions ship to production

**Scenario:**

A developer changes the triage playbook -> commits -> **deploys without eval** -> in production, accuracy drops from 90% to 75%.

**Problem:** no CI/CD gate for eval.

**Takeaway:**

In 2014, Wes Davis deployed without testing (a cowboy change) -> a production incident.

In 2026, Lance enforces: **eval is mandatory in CI/CD**.

```yaml
# .github/workflows/deploy.yml

name: Deploy Agent

on:
  push:
    branches: [main]

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      # If you have dependencies:
      # - name: Install dependencies
      #   run: pip install -r requirements.txt

      - name: Run Eval
        run: |
          python eval_agent.py --full-dataset
          
      - name: Check Metrics
        run: |
          python - <<'PY'
          import json
          with open("eval_results.json", "r", encoding="utf-8") as f:
              data = json.load(f)
          accuracy = float(data["metrics"]["accuracy"])
          threshold = 0.80
          if accuracy < threshold:
              raise SystemExit(f"Eval FAILED: accuracy {accuracy:.4f} < {threshold:.2%}")
          print(f"Eval PASSED: accuracy {accuracy:.4f} >= {threshold:.2%}")
          PY
      
      - name: Golden Tests
        run: |
          python eval_agent.py --golden-only
          # All golden tests must pass (exit 0)

  deploy:
    needs: eval  # Deploy only if eval passed
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Ansible
        run: |
          python -m pip install --upgrade pip
          pip install "ansible-core>=2.16"

      # Real deploy will need secrets/keys/known_hosts/environment.
      - name: Dry-run Deploy (required)
        run: |
          ansible-playbook -i inventories/production playbooks/agent.yml \
            --tags deploy \
            --check --diff \
            --extra-vars "agent_version=v2"

      - name: Deploy to Production
        run: |
          ansible-playbook -i inventories/production playbooks/agent.yml \
            --tags deploy \
            --extra-vars "agent_version=v2"
```

**How to avoid it:**

CI/CD gate checklist:

- eval runs automatically on every commit
- deploy is blocked if accuracy is below threshold
- golden tests must pass without exceptions
- metrics are logged to track trends

---

## Summary

[^agentskills-overview]: Open “Agent Skills” format: skills as portable knowledge packages and the progressive disclosure principle: [Agent Skills Overview](https://agentskills.io/).

### What we did

We built a systematic way to measure an agent’s quality:

1. **Eval dataset:** 20 past incidents (logs + metrics + ground truth)
2. **Metrics:** accuracy, false positive rate, average TTRC
3. **Golden tests:** 5 critical incidents that must pass (regression barrier)
4. **Improvement loop:** measure -> analyze failures -> fix -> re-measure
5. **Continuous eval:** production incidents are added to the eval dataset over time

### Artifacts

- Eval dataset template (incident record structure)
- Eval script (compute accuracy, false positive rate, TTRC)
- Golden tests definition (criteria + a CI/CD gate)
- Improvement loop process (measure -> analyze -> fix -> re-measure)
- Test coverage matrix: happy path 80%, edge cases 15%, unknown 5%

### Key principles

**In 2014:** Bill Palmer "felt" things got better. No metrics -> no proof and no systematic improvement.

**In 2026:** an eval dataset makes quality **measurable**. Accuracy 80% -> improvements -> 90% -> 95%. Every improvement is measurable.

**Key:**

- Eval dataset = benchmark (known root causes)
- Metrics = measurable quality (not "we feel it")
- Improvement loop = systematic learning (not random trial and error)

**Success metrics:**

- Bill Palmer (2014): subjective quality, no tracking, no regression protection
- With an eval dataset (2026): accuracy 90%, TTRC <TTRC_SECONDS>; improvement tracking exists; golden tests block deploy on regressions

### Chapter acceptance criteria

You’ve learned the chapter if you can:

**Level 1: Understanding**

- Explain what an eval dataset is and why it matters
- Explain the difference between accuracy and false positive rate
- List the three incident types in an eval dataset: happy path, edge cases, unknown

**Level 2: Application**

- Build an eval dataset from 5–10 past incidents
- Write an eval script (run the agent on the dataset + compute metrics)
- Define golden tests (3–5 critical incidents)

**Level 3: Reproducibility**

- Run eval successfully (metrics computed)
- Analyze failures (root cause for failures identified)
- Apply improvements and show improvement in the next eval run

**Level 4: Production integration**

- Integrate eval into CI/CD (runs before deploy)
- Golden tests block deploy when they fail
- Continuous eval in production (real incidents are added to the dataset)
- The improvement loop works (accuracy improves over time)

### Next steps

**Chapter 9:** agent teams + governance — how to scale from one agent to a team (Analyst/Triage/SRE/Orchestrator).

**Connection to Chapter 8:** eval measures one agent’s quality. But what if the task requires coordination of multiple agents? Chapter 9 shows how to organize a team.
