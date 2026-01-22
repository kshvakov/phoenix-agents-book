---
title: "Glossary"
description: "Terms, abbreviations, and artifacts used across the book: SLO/SLI, SOP, guardrails, eval datasets, and more."
lastmod: 2026-01-21
weight: 99
---

# Glossary

This glossary covers terms used **across the entire book**: in chapters and appendices.

If a term is kept in its original English form (for example, `Bus factor`, `OpenAPI`, `CI/CD`), that is intentional: it keeps the book compatible with common engineering vocabulary and with search.

---

## Abbreviations

- **ADR**: *Architecture Decision Record* — a document that captures an architecture decision, context, and rationale.
- **AI**: *Artificial Intelligence* — here: models and tools that power agents.
- **AC**: *Acceptance Criteria* — what counts as accepted and how to validate it.
- **API**: *Application Programming Interface* — the contract between services/clients.
- **Bus factor**: how many people can drop out before work stops; practically: how many people can complete a critical task without escalating to a single expert.
- **CI/CD**: *Continuous Integration / Continuous Delivery* — build/test/delivery pipeline.
- **DoD**: *Definition of Done* — verifiable "done" criteria for a task/iteration.
- **CTO**: *Chief Technology Officer*.
- **DevOps**: practices and a role between development and operations (delivery, infrastructure, automation).
- **FTE**: *Full-Time Equivalent* — capacity unit for modeling.
- **HR**: *Human Resources*.
- **IaC**: *Infrastructure as Code* — managing infrastructure via code (Terraform/Ansible, etc.).
- **KPI**: *Key Performance Indicator*.
- **MTTD**: *Mean Time To Detect* — average time to detect an incident.
- **MTTR**: *Mean Time To Resolve/Recover* — average time to recover from an incident.
- **NFR**: *Non-Functional Requirements* — performance, reliability, security, maintainability, etc.
- **GraphQL**: a query language and schema for APIs; in this book used as an API contract format.
- **OpenAPI**: a machine-readable API contract specification.
- **PII**: *Personally Identifiable Information*.
- **PR**: *Pull Request* — change proposal + review + checks -> merge.
- **RFC**: *Request for Comments* — a document/process for discussing changes (often cross-team/architectural).
- **ROI**: *Return on Investment*.
- **SRE**: *Site Reliability Engineering*.
- **SLA**: *Service Level Agreement*.
- **SLI**: *Service Level Indicator*.
- **SLO**: *Service Level Objective*.
- **TCO**: *Total Cost of Ownership*.
- **TTRC**: *Time To Root Cause*.
- **VP Engineering**: engineering leader (VP of Engineering).
- **VPN**: *Virtual Private Network*.

---

<a id="placeholder-notation"></a>
## Placeholder notation

This book often uses placeholders (stub values) in angle brackets—for example, `<WINDOW>`, `<THRESHOLD>`, `<TTRC_SECONDS>`.

**Rules:**

- **Format:** `<UPPER_SNAKE_CASE>` with no spaces (for example, `<WINDOW>`, not `< WINDOW >`).
- **Meaning:** placeholders are not "missing text" and should not be translated. They are variables you should replace with real thresholds/values.
- **Scope:** placeholders appear in templates (prompts/SOP/runbooks/AC/DoD). In production artifacts, replace them or mark them explicitly as TBD.

**Examples:**

- `<WINDOW>` — time window: `30m`, `24h`, `7d` (for example: "last `<WINDOW>`" -> "last 7d").
- `<THRESHOLD>` — threshold: `0.5%`, `200ms`, `80% CPU` (for example: "error rate > `<THRESHOLD>`" -> "error rate > 0.5%").
- `<N>` — count: `50`, `1000` (for example: "top-`<N>` incidents" -> "top-50 incidents").
- `<TTRC_SECONDS>` / `<TTRC_TARGET>` — actual/target time to root cause: `900` / `600` (seconds) or your chosen explicit format.

---

## Terms and artifacts

- **AI agent**: an autonomous task executor built on a model/tooling that operates in a role under guardrails, produces artifacts, runs checks, and escalates under uncertainty/risk.
- **Allowlist**: a list of permitted actions/commands/operations. Everything else is denied by default.
- **Audit trail**: a record of who/what/when (commands, changes, decisions, artifacts) to support investigation and control.
- **Baseline**: a "before" reference point for metrics/quality/speed.
- **Backwards compatible**: the change does not break existing clients/contracts; rollback is possible without a domino effect.
- **Business case**: a justification document (why, effect, risks, success criteria, pilot plan).
- **CAB**: *Change Advisory Board* — classic ITIL-style change approval process.
- **Canary rollout**: gradual release to a small traffic/instance slice with measured signals before expanding.
- **Change management**: adopting changes in roles/processes/tools in a controlled way (not chaos).
- **Dry run**: execute an operation in "no-apply" mode (for example, `--check`) to validate expected effects.
- **Eval dataset**: a set of scenarios/cases used to measure agent quality (for example, incidents from history).
- **Edge case**: a rare/hard scenario where systems tend to break; the opposite of the happy path.
- **Evidence**: observable data, not promises: metrics, artifacts, audit logs, verification outputs.
- **TRACE**: a context audit block: what was actually read/used (rules, `SKILL.md`, artifact links) so you can see what conclusions stand on and reproduce the work.
- **Gate / quality gate**: a gate where an agent must stop and present artifacts/evidence for verification (by humans or automation).
- **ROUTER / Skill Router**: a routing discipline: choose one base role and 0..N checker roles based on risk/touchpoints, then record TRACE before the main output.
- **Reviewer gate**: a gate where a human must review before continuation (or before risky/irreversible steps).
- **golden tests**: a fixed set of tests/cases serving as a quality reference when agents/processes change.
- **Agent Skills**: an open format for portable procedures/knowledge packages for agents (folder with `SKILL.md`, possibly `scripts/`, `references/`, `assets/`).
- **`SKILL.md`**: the primary Agent Skill file with YAML front matter and markdown instructions.
- **Progressive disclosure**: context economy: show only skill metadata first, then load full `SKILL.md` and resources on demand.
- **Go/No-Go**: a decision to continue/stop (usually after a pilot or a gate), made against pre-set criteria.
- **Guardrails**: explicit rules for what is allowed/forbidden; permissions; bans on dangerous operations; approval requirements.
- **`read_only`**: a mode where the executor can read/collect/analyze but cannot change system state (especially production). State-changing actions require explicit approval and/or a separate execution loop.
- **Handoff**: disciplined task delegation: goal, inputs, guardrails/permissions, output format, stop conditions.
- **Happy path**: the typical success path with no errors/unusual conditions.
- **Idempotency**: repeated execution does not change the result (or changes predictably and safely).
- **Incident**: an event that degrades availability/performance or violates SLO/SLA.
- **Kanban / WIP limits**: limiting work in progress to reduce context switching and increase predictability.
- **Kill switch**: a mechanism to disable an agent/feature quickly under risk or degradation.
- **Least privilege**: grant only the permissions required, and no more.
- **Linter**: static checks for code/text errors and style.
- **Merge**: combining changes into the main branch/codebase (typically after review and checks).
- **Out-of-band approval**: approval through a separate channel/process independent of potentially compromised text context (for example, a UI confirmation).
- **p95 / p99**: percentiles; p95 is the value below which 95% of observations fall.
- **Prompt injection**: an attack/error where an agent treats external data (logs, tickets, comments) as instructions and violates rules.
- **Prompt template**: a repeatable task framing structure (context -> guardrails -> DoD -> verification plan -> expected output).
- **Redaction**: masking/removing secrets and PII from logs/artifacts.
- **Regression**: quality/metric degradation after a change.
- **Resume**: continuing an earlier worker run with its saved context/state.
- **Risk register**: a list of risks with scenarios, consequences, mitigations, and verification methods.
- **Rollback**: a planned and verifiable way to return to a stable state quickly.
- **`runbook` / `runbooks`**: an executable or semi-executable incident/operation procedure (steps + conditions + checks + escalation).
- **SOP (standard operating procedure)**: a repeatable process for a typical task (steps, stop conditions, checks, artifacts, done criteria).
- **Stop conditions**: criteria that force an agent to stop and escalate (missing data, high risk, dangerous action, ambiguity).
- **Subagent**: a specialized executor with separate context that receives a narrow task for focus/isolation (a work-organization concept, not a vendor feature requirement).
- **Threat model**: a structured description of assets, threats, attack vectors, and mitigations before production.
- **Triage**: first-pass incident work: gather facts, narrow hypotheses, decide escalation/action.
- **Verification agent (verifier)**: an independent skeptic that proves "done" is actually true; returns a report of what passed/failed/was not checked.
- **Verification / verification plan**: how to validate correctness (sampling, edge cases, metrics, before/after comparison, acceptance thresholds).
- **Versioning / semver**: versioning rules for templates/prompts/processes to track breaking changes and compatibility.
- **Test runner**: a role that proactively runs tests/checks (including golden tests) and drives the loop to green without rewriting expectations.
- **Debugger**: a role for root cause analysis: reproduce -> localize -> minimal fix/experiment -> verify with evidence.

---

## Tools and formats (in this book's context)

- **Agent**: an agent that can read/change files, run commands, collect artifacts, and drive an end-to-end task (for example, Cursor Agent).
- **Chat mode**: a dialogue interface, useful for discussion/design/research.
- **JSON / YAML**: common data/config formats used in examples (logs, configs, pipelines).

