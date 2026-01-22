---
title: "README (do not publish)"
lastmod: 2026-01-21
sitemap:
  disable: true
build:
  render: never
  list: never
---

# Autonomous Agents: transforming engineering and business

In the style of *The Phoenix Project*: from chaos to effectiveness with AI agents.

**Target audience:**
- **Primary:** Senior/Staff/Principal+ engineers with production experience
- **Secondary:** engineering leaders (EM/VP Engineering), CTOs
- **Tertiary:** product and delivery managers, business stakeholders

**This is not a prompt-writing primer.** This is a book about transforming engineering culture with autonomous agents, where technical artifacts (prompts, `SOP`, gates) exist to produce measurable business outcomes.

> **Status:** work in progress. Chapters 1–10 are under active development; the structure has stabilized.

---

## Transformation: before-and-after signals

This book is about what changes when autonomous agents become part of engineering work: less manual toil, fewer "dark actions", more repeatability and predictability.

**Core message:** agents do not replace engineers. They amplify them by freeing capacity for strategic work: architecture, planning, mentoring.

---

## How to read this book

**Fast start for engineers:**
1. Start with [Chapter 1](chapters/01-first-prompt.md) and write your first prompt and verification plan.
2. In each chapter, go through "Quick start" for immediate practical value.
3. Return to the full chapter as you need deeper context.

**For managers and business:**
- Start with the short summary at the beginning of each chapter.
- Use [Appendix A: business case](appendix/A-business-case.md) as a template for justification.
- Use [Appendix B: organizational transformation](appendix/B-organizational-transformation.md) as a change-management playbook.

---

## Who this book is for

### For Senior+ engineers (primary audience)

You have led teams. You have made architecture decisions. You know how things fail in production.

**This book will help you:**
- Apply your people-management instincts to organizing autonomous agents
- Write prompts that hold up in production (not toy examples)
- Build security-sensitive systems with agents (guardrails, gates, verification)
- Scale an agent practice from one engineer to an entire company

**What you get:**
- Repeatable `SOP`s for working with agents (from spec to production)
- A prompt library for DevOps/Backend/SRE work
- A system of quality gates to verify agent outputs
- A path from Senior to an AI-amplified Principal

**Success metric:** you end up with a repeatable process that can take an agent to production safely.

### For engineering managers and VPs (secondary audience)

You run engineering teams. You own delivery, quality, and scalability.

**This book will help you:**
- Evaluate impact without hype—through observable practice and measurable signals
- Roll out agents without team resistance
- Measure agent effectiveness (not "by feel")
- Scale safely (practice governance + baseline security + quality gates)

**What you get:**
- A business-case template (TCO, risks, success criteria)
- A rollout process (how to adopt without resistance)
- A metrics dashboard outline (what to measure)
- An organizational transformation playbook

**Success metric:** the team measurably sheds toil, and you can see it in delivery and quality signals.

### For CTOs and business stakeholders (tertiary audience)

You make strategic calls. You care about competitiveness.

**This book shows:**
- Real transformation cases (fintech, enterprise, healthcare, public sector)
- Typical shifts in productivity, quality, and delivery speed
- Risks and mitigations (security, quality, organizational resistance)
- A scaling strategy (from pilot to company-wide adoption)

**What you get:**
- A short summary for each chapter
- Transformation metrics you can take to a board deck
- A risk assessment frame
- A strategic roadmap for AI-amplified engineering

---

## The book’s approach

### A transformation story, not a technical manual

The book is written as a transformation story of Parts Unlimited (from *The Phoenix Project*) through the lens of 2026, where Bill Palmer has AI agents.

**Three transformation arcs:**
1. **Deployment chaos** → from manual chaos to repeatable analysis and a controlled delivery process
2. **The Brent bottleneck** → from "knowledge in one person’s head" to SOPs and delegation
3. **The payroll incident** → from panic and manual triage to systematic response with checks and escalation

**Each chapter:**
- starts with a scene from *The Phoenix Project* (2014)
- shows how the same problem is handled with agents (2026)
- shows what signals and artifacts prove progress (evidence, artifacts, processes)
- provides reusable artifacts (prompts, `SOP`, gates)

### Tool-agnostic by design

The book is not tied to one vendor. The principles apply across agent shells and chat mode (for example: Cursor, ChatGPT, DeepSeek).

But we do distinguish roles a tool can play:
- **Agent** (for example, Cursor Agent): autonomous end-to-end work with repo/file/command access
- **Chat mode** (for example, ChatGPT/DeepSeek in a dialogue interface): discussion, design, research
- **Review tools**: code review automation

The same vendor can be both "chat" and "agent" depending on the interface and available permissions (for example, Claude Code vs Claude Desktop).

### Trust, but verify

Agents are powerful, but **humans remain responsible**.

You will learn how to:
- phrase tasks so results are verifiable
- use gates and stop conditions to control quality
- validate outputs via evidence and artifacts

### Autonomy is the lever

The main value of agents is autonomy (not autocomplete).

We focus on end-to-end workflows:
- design → code → tests → fixes → self-checks
- business requirement → spec → plan → architecture → implementation → production

Result: less toil, faster feedback, higher predictability and repeatability.

---

## Structure: 3 arcs, 10 chapters

**Through-line:** *The Phoenix Project* for Parts Unlimited (2026).

### Arc 1: deployment chaos (chapters 1–4)
- [Chapter 1: first prompt](chapters/01-first-prompt.md) — from a problem to a working prompt (quick start)
- [Chapter 2: system prompt and guardrails](chapters/02-system-prompt-guardrails.md) — safety and repeatability
- [Chapter 3: from business requirement to a spec](chapters/03-spec-and-plan.md) — a v1 spec and a v1 plan
- [Chapter 4: architecture design](chapters/04-architecture-v1.md) — from requirements to a design

### Arc 2: the Brent bottleneck (chapters 5–7)
- [Chapter 5: `SOP` “design → PR”](chapters/05-sop-design-to-pr.md) — development from design to PR with gates
- [Chapter 6: operations and incidents](chapters/06-operations-incidents.md) — `runbook`, SLI/SLO, triage
- [Chapter 7: security and infrastructure](chapters/07-security-infrastructure.md) — baseline security, IaC

### Arc 3: the payroll incident (chapters 8–10)
- [Chapter 8: eval dataset and golden tests](chapters/08-eval-golden-tests.md) — measuring agent quality
- [Chapter 9: agent teams and practice governance](chapters/09-agent-team-governance.md) — scaling the practice
- [Chapter 10: capstone](chapters/10-capstone-full-cycle.md) — a full cycle from business requirement to production

**From a simple 10-line prompt to a production system (2000+ lines) in 10 chapters.**

---

## Repository structure

```text
book/
├── ru/                       # Russian (source of truth)
├── en/                       # English translation (work in progress)
└── ...
```

---

## License

See [`LICENSE`](../../LICENSE).

## License

See [`LICENSE`](../../LICENSE).

