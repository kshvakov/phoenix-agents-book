---
title: "Appendix A: business case template for adopting AI agents"
description: "A business case template without false precision: variables, risks, mitigations, and go/no-go criteria for adopting AI agents."
lastmod: 2026-01-21
weight: 1
---

# Appendix A: business case template for adopting AI agents

**Target audience:** CTOs, VPs of Engineering, engineering managers, business stakeholders  
**Goal:** help justify adopting AI agents without false precision—through variables, risks, and verifiable success criteria  
**Date:** 2026-01-17

---

## Executive summary (template)

**Proposal:** adopt AI agents to automate repeatable engineering tasks and accelerate feedback loops (analysis, first-pass triage, change drafts, documentation, checklist-based verification).

**Why now:** growing load and complexity make manual work increasingly expensive; risk is rising too (security, quality, incidents). Without process discipline, speed turns into debt.

**How we reduce risk:** guardrails, stop conditions, verification plans, least privilege, audit trail, eval datasets, and golden tests.

**How we decide:** run a pilot, measure against pre-agreed criteria, and make a go/no-go call (continue/stop).

---

## 1. Problem: the cost of inaction (status quo) without numbers

### 1.1 What happens without agents

Typical symptoms in an engineering organization where "speed" is sustained by manual work:
- a meaningful share of time goes to toil (data gathering, digging through logs, manual triage, coordination, repeatable changes)
- key knowledge lives in people’s heads (low Bus factor); the team is blocked on experts
- incidents consume focus and turn the roadmap into an illusion
- quality fluctuates because some issues are caught too late

### 1.2 Why it is expensive

It is expensive through three channels:
- **direct cost:** paid engineer time goes to mechanical work
- **opportunity cost:** strategic initiatives stall because the team has no deep-work window
- **risk cost:** change failures, incidents, security mistakes, and regulatory outcomes

---

## 2. Solution: AI agents as a "discipline accelerator"

### 2.1 What exactly we are adopting (scope/boundaries)

AI agents are not a "magic engineer." In a correct framing, they are:
- an execution tool for repeatable SOP steps
- an amplifier for analysis and decision preparation (drafts, hypotheses, alternatives)
- a standardization mechanism (templates, checklists, quality gates) that reduces execution variance

### 2.2 What we are not doing

- we do not grant broad production permissions by default
- we do not replace engineering judgment with "the model said so"
- we do not scale without quality and safety loops

---

## 3. Effect model (template, without numbers)

Instead of a single ROI number, use variables. That makes the model portable across teams and domains.

### 3.1 Variables (plug in your values)

**Team and time:**
- `<TEAM_SIZE>` — team size
- `<COST_PER_ENGINEER_HOUR>` — internal cost per engineer hour (or a rate for modeling)
- `<ROUTINE_SHARE>` — current share of routine work (estimate via time tracking / survey / sampling)

**Incidents and operations:**
- `<INCIDENTS_PER_PERIOD>` — incidents per period
- `<DOWNTIME_COST_MODEL>` — how the business models downtime/degradation cost (not necessarily money/hour; could be SLA penalties, churn, funnel loss)
- `<MTTR_BASELINE>` — baseline mean time to recovery

**Quality and security:**
- `<CHANGE_FAILURE_RATE_BASELINE>` — baseline change failure rate
- `<SECURITY_RISK_MODEL>` — risk model (expected impact × probability) or a list of critical scenarios

**Adoption:**
- `<ADOPTION_TARGET>` — expected adoption level
- `<TRAINING_INVESTMENT>` — time to train and set up
- `<MAINTENANCE_BUDGET>` — time to maintain templates, eval sets, and guardrails

### 3.2 Effect hypotheses (what should change)

Write these as hypotheses you can confirm or refute:
- routine share decreases materially because repeatable steps are delegated
- feedback loops improve (facts/diagnostics/drafts appear faster)
- quality improves via gates, verification, and lower execution variance
- operational resilience improves: fewer fires, better escalation, less expert dependency

### 3.3 How to evaluate impact (without promises)

Use a simple framing:
- **Value** = reclaimed engineering time + reduced risk cost + accelerated strategic initiatives
- **Cost** = adoption time + maintenance + cost of mistakes/regressions along the way + infra/licenses (if applicable)

---

## 4. Risk register (template)

For each risk, capture: scenario → consequences → mitigations → how we verify.

### Risk: the agent proposes or applies a wrong fix

- **Scenario:** the agent proposes or performs an incorrect fix
- **Mitigations:** human review, allowlist, conservative escalation on uncertainty, dry run (`--check`) + canary/gradual rollout (`serial`) + rollback path/plan, kill switch
- **Verification:** training scenarios + golden tests

### Risk: prompt injection via logs / input data

- **Scenario:** logs/tickets contain instructions that the agent treats as commands
- **Mitigations:** sanitization, strict guardrails, ban dangerous commands, out-of-band approval
- **Verification:** staged injection tests in a sandbox

### Risk: secrets/PII leakage

- **Scenario:** the agent includes secrets or PII in reports/comments
- **Mitigations:** redaction, secret scanning, ban raw-log publishing, safe channels
- **Verification:** test data + output checks

---

## 5. Pilot plan (go/no-go)

### 5.1 Pilot format

- pick a constrained scope: one workflow / one team / one incident class
- define artifacts up front: prompt templates, SOPs, quality gates, verification plan, threat model—minimal sufficient set
- define permissions: default to `read_only`; writes only for approved scenarios with explicit approval

### 5.2 Success criteria (no numbers, but verifiable)

- **Adoption:** the team uses the practice repeatedly (not “tried once”)
- **Quality:** errors/regressions are caught earlier than production
- **Safety:** no incidents caused by ad-hoc agent actions; actions are auditable
- **Productivity:** routine load decreases enough to free strategic capacity

### 5.3 Decision log

At the end of the pilot, record:
- what worked
- where the agent failed and why
- which guardrails/templates are needed before scaling

---

## 6. ROI dashboard (no numbers, but with fields)

```markdown
## AI Agents dashboard — [Period]

### Adoption
- Who uses the practice and for which workflows
- Where resistance shows up and why

### Quality
- Which agent errors repeat
- Which gates/verification catch them earlier

### Security
- Any attempts at dangerous actions
- How stop conditions and approval flows behaved

### Productivity
- Which toil categories moved into delegation
- Where strategic capacity appeared

### Business narrative
- Which risk was reduced
- Which initiatives accelerated
```

---

## 7. Stakeholder communication (template)

### For the CEO / the board
- we are not "adopting a toy"; we are building execution discipline at scale
- risk is covered by guardrails and quality loops
- the decision is made by pilot evidence

### For the CTO / VP Engineering
- impact shows up in predictability and lower execution variance
- governance and a security baseline are part of the project, not “later”

### For engineers
- agents remove toil, but responsibility stays with humans
- trust, but verify is the default rule

