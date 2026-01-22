---
title: "Chapter 4: Phoenix Project architecture v1"
description: "Architecture design v1: components, contracts, tradeoffs, and verifiable decisions instead of arrow slides."
lastmod: 2026-01-21
weight: 4
---

# Chapter 4: Phoenix Project architecture v1

## Prologue: from plan to design

In Chapters 1–3 you went from a first prompt to a project plan:
- Chapter 1: you got value quickly (first artifacts + verification without “days of manual work”)
- Chapter 2: you added control (guardrails, stop conditions)
- Chapter 3: you formalized Phoenix Project (spec v1, plan v1)

Now Lance Bishop starts a new conversation with the agent and thinks: “The spec and plan are ready. But **how** do we build it? Which components? Which APIs? Which tradeoffs?”

VP Engineering asks: “Show me the design. Explain why it’s done this way.”

**The difference:**
- **Plan:** work decomposition, tasks, estimates (what to do and in what order)
- **Architecture:** components, interfaces, tradeoffs (how the system is structured)

---

## A scene from "The Phoenix Project" (2014)

**Book chapters 12–13: John Pesche shows the “architecture” of Phoenix Project**

Bill Palmer goes to John Pesche, the chief architect at Parts Unlimited, to understand Phoenix Project’s architecture. John opens a PowerPoint deck: “Architecture Overview.”

**Slides with rectangles and arrows:**
- slide 3: “Frontend” → “Backend” → “Database”
- slide 7: “Integration Layer” (9 unlabeled boxes)
- slide 12: “Data Flow” (arrows everywhere)

**Bill:** “How does the frontend talk to the backend? What API?”

**John:** “Well… probably REST. Or SOAP. Ask the developers.”

**Bill:** “Why did we choose Oracle over PostgreSQL or MySQL?”

**John:** (pause) “I don’t remember. That decision was made three years ago. The architect who made it already left.”

**Bill:** “What about API contracts? Request/response formats?”

**John:** “It’s in the code. Read the implementation.”

**Bill tries to add a new feature (an external payment gateway integration):**

Week 1: reverse-engineering the architecture (reading code, trying to infer how components interact)

Week 2: discovers that “Integration Layer” is not a layer but 9 different services with unclear responsibility boundaries (some do auth, others do auth and logging and “something else”)

Week 3: tries to understand “why Oracle” (reads git history, asks long-timers). Nobody remembers the rationale.

Week 4: implements the feature and breaks a couple of other services (because boundaries are unclear)

**Erik Reid:** “This is what happens when architecture is PowerPoint arrows. No clear boundaries. No API contracts. No decision rationale. Every change is reverse-engineering.”

**Key problems with the 2014 approach:**
- **Rectangles and arrows without details:** “Frontend → Backend” (what API? REST? gRPC? SOAP?)
- **No responsibility boundaries:** components do everything (god objects)
- **No rationale:** “why Oracle?” — nobody remembers
- **No tradeoffs:** alternatives were not considered (or not documented)

---

## The same problem in 2026: architecture v1 with ADRs

**Context:** Lance designs Phoenix Project (a customer platform) for Phoenix Project v1. Instead of PowerPoint, he produces a structured architecture document with ADRs.

**Approach (2026):**

Lance uses chat mode (for example, ChatGPT/DeepSeek) to draft architecture v1:

```
Role: you are a software architect.

Context:
- Project: Phoenix Project (customer platform) — Phoenix Project v1 release
- Spec: [attach spec v1]
- Stack (example): Go, PostgreSQL, systemd, deb packages, Ansible

Task:
Design architecture v1.

Quality rules:
- Do not invent requirements. If something is not in the spec, phrase it as a question or an assumption with a label.
- Don’t “reinvent the world”: propose a minimally sufficient architecture v1 first, then explicitly mark what moves to v2.
- For every decision, provide verifiable consequences (what we gain/lose and how to measure/validate it).

Structure:
1. High-level overview (components + data flow)
2. Component details (purpose, APIs, responsibility boundaries)
3. API contracts (endpoints, request/response, errors)
4. Tradeoffs (alternatives, pros/cons, when to revisit)
5. ADRs (2–3 key decisions: context, decision, consequences)

STOP CONDITIONS:
- If the spec is unclear, ask a question
- Do NOT invent requirements that are not in the spec
```

**Time to execute:**
- agent drafts architecture: fast
- Lance reviews and edits: fast
- total: a fast loop with verification

**Example output (architecture v1 excerpt):**

```markdown
## Components

### Checkout (Phoenix Project)

**Purpose:** checkout flow: validate cart, create order, initiate payment.

**Responsibility boundaries:**
- Does: validate inputs and cart
- Does: idempotency (`idempotency_key`) and checkout state transitions
- Does: initiates order creation and payment flow
- Does NOT: store payment data (that’s the PCI boundary in Payments)
- Does NOT: “do everything” for Orders/Inventory (domain boundaries matter)

**API (external, example)**
POST /checkout → 201 Created (order_id) / 4xx validation_error

## Tradeoffs

### Monolith vs microservices

**Chosen:** monolith (all components in one process)

**Alternative:** microservices (each component is a separate service)

**Why monolith:**
- Pros: faster delivery, lower latency
- Cons: harder to scale, weaker isolation

**When to revisit:** if load and org structure require independent scaling and isolation per domain

## ADR-1: PostgreSQL vs MongoDB

**Context:** choose a DB for orders/checkout state and transactional workflows in Phoenix Project v1.

**Decision:** PostgreSQL for v1.

**Consequences:**
- Pros: ACID transactions, consistency, clear migrations/schemas
- Cons: scaling requires discipline (indexes, replicas/sharding later)
- Mitigation: if load exceeds Postgres capabilities → revisit storage architecture in v2
```

**Verification:**

Lance reviews the architecture:
- boundaries are explicit (each component knows what it does and what it does not do)
- tradeoffs are documented (alternatives + when to revisit)
- ADRs explain rationale (“why PostgreSQL” is clear)

He shows it to VP Engineering. VP: “Why a monolith? Don’t we want scale?”

Lance: “ADR-1 explains it: a modular monolith for v1 (faster delivery). If we get independent teams per domain and isolation/scaling requirements, we revisit.”

**2014 vs 2026**

| Metric | John Pesche (2014) | Lance (2026) |
|---|---|---|
| Documentation | PowerPoint arrows | structured doc: components + APIs + ADRs |
| Responsibility boundaries | unclear (god objects) | explicit: what it does / does not do |
| API contracts | “read the code” | documented: request/response/errors |
| Rationale | “don’t remember why Oracle” | ADR: context, decision, consequences |
| Tradeoffs | not documented | explicit: alternatives, pros/cons |
| Reverse-engineering | slow (every change) | minimal (self-documenting architecture) |

**What changed:**
- explicit responsibility boundaries: no god objects; each component has clear scope
- ADRs: later you still know “why PostgreSQL” (no reverse-engineering)
- tradeoffs: you know when to revisit (for example, throughput > 10K/hour)
- time-to-understand: faster than Bill’s weeks of reverse-engineering

**What did not change:**
- humans still review: agents can over-engineer
- domain expertise still matters: monolith vs microservices, PostgreSQL vs MongoDB
- decisions are on humans: the agent proposes, a human chooses

---

In this chapter you will learn how to:
- design architecture v1 with an agent
- document architecture decisions (ADRs)
- validate design through tradeoffs and alternatives

---

## Quick start: architecture v1

### Goal

Design architecture v1 for Phoenix Project (Phoenix Project v1 release): components, APIs, data flow, tradeoffs.

### Scene (Phoenix Project)

**Context:** spec and plan are ready. The team is waiting for the design.  
**Stakes:** if architecture is wrong, rework costs weeks.  
**Task:** design a solution that:
- fulfills Phoenix Project v1 requirements (catalog, cart, checkout, orders, payments, integrations)
- meets NFRs: security/PCI boundary, audit events, observability, operations/rollback
- is extendable: new features in v2

### Inputs

- spec v1 (FR/NFR)
- plan v1: decomposition and risks

### Prompt for the agent (copy-paste ready)

```
Role: you are a software architect helping design a system.

Context:
- Project: Phoenix Project (customer platform) — Phoenix Project v1 release
- Spec: [attach spec v1]
- Implementation: Go (backend), PostgreSQL (DB)
- Deployment: systemd, deb packages, Ansible

Task:
Design architecture v1 for the project.

Quality rules:
- Do not invent missing context (load, SLOs, constraints). If critical, ask.
- Clearly separate “v1 solution” from “options/alternatives.”
- Phrase all tradeoffs and revisit conditions as verifiable triggers (metric/threshold/event).

Architecture structure:
1. **High-level overview**
   - 5–7 components
   - data flow (how data moves between components)
   - diagram (Mermaid or ASCII art)

2. **Components (detailed)**
   - for each: purpose, responsibilities, APIs
   - boundaries (what it does / what it does not do)

3. **API contracts**
   - primary endpoints (REST/gRPC)
   - request/response formats (JSON schemas)
   - error handling (HTTP status codes, error messages)

4. **Tradeoffs**
   - alternatives (what could be done differently)
   - why chosen (pros/cons)
   - when to revisit (revisit conditions)

5. **ADRs**
   - 2–3 key decisions
   - for each: context, decision, consequences

Output format: Markdown with Mermaid diagrams.

STOP CONDITIONS:
- If the spec is unclear or contradictory, ask a question
- If context is insufficient (stack, deployment), list what is needed
- Do NOT invent requirements that are not in the spec
```

### Example output (architecture v1)

# Architecture v1: Phoenix Project (Phoenix Project v1 release)

## 1. High-level overview

### Components

```text
                 [Web Frontend]
                       |
                       v
                  [API Gateway]
                 /     |      \
                v      v       v
           [Catalog] [Cart]  [Checkout]
              |        |        |   \
              v        v        v    v
         [Data Store] [Data Store] [Orders]  [Payments (PCI boundary)]
                                     |   \            |
                                     v    v           v
                               [Data Store] [Inventory/ERP Integration]
                                     |
                                     v
                               [Audit Logger]

Additional:
- Orders  -> Audit Logger
- Payments -> Audit Logger
```

### Data flow

1. **Browse → Catalog**
   - Web → API → Catalog → Data Store
2. **Cart**
   - Web → API → Cart → Data Store
3. **Checkout → Orders**
   - Web → API → Checkout → Orders → Data Store
   - idempotency via `idempotency_key`
4. **Checkout → Payments (PCI boundary)**
   - Checkout initiates payment
   - Payments → Audit Logger (payment events, no PII)
5. **Orders → Inventory/ERP**
   - Orders calls ERP integration (reserve/commit)

## 2. Components (detailed)

### API Gateway

**Purpose:** the single entry point for all requests.

**Responsibilities:**
- request validation (format, required fields)
- authentication/authorization (API key, JWT)
- rate limiting (max 100 requests/min)
- routing to the correct component

**API:**

```go
GET /catalog?query=<q>

POST /cart/items
Request:
{
  "product_id": "uuid",
  "qty": 1
}

POST /checkout
Request:
{
  "cart_id": "uuid",
  "payment_method": "card",
  "idempotency_key": "string"
}

Response:
{
  "order_id": "uuid",
  "status": "created" | "payment_pending" | "paid" | "failed"
}
```

**Boundaries:**
- Does: validation, auth, routing
- Does NOT: contain domain logic (Catalog/Cart/Checkout/Orders/Payments)
- Does NOT: store payment data (PCI boundary)

### Catalog

**Purpose:** catalog/search/product page.

**Responsibilities:**
- search and product retrieval (minimum for UI)
- limits/guardrails (avoid dumping the entire DB)

**API (internal):**

```go
func SearchCatalog(query string, limit int) ([]Product, error)
```

**Boundaries:**
- Does: catalog
- Does NOT: cart/checkout/payments

### Cart

**Purpose:** cart state (add/remove/change quantity).

**API (internal):**

```go
func AddToCart(cartID string, productID string, qty int) error
```

**Boundaries:**
- Does: cart operations
- Does NOT: order creation (Orders)

### Checkout

**Purpose:** checkout orchestration: order/payment flow and idempotency.

**Responsibilities:**
- validate cart
- create order (via Orders)
- initiate payment (via Payments boundary)
- idempotency via `idempotency_key`

**Boundaries:**
- Does: orchestration + idempotency
- Does NOT: store PCI data (Payments boundary)

### Orders

**Purpose:** orders: create/status/history.

**API (internal):**

```go
func CreateOrder(cartID string, idempotencyKey string) (string, error)
```

### Payments (PCI boundary)

**Purpose:** payment provider integration + auditing of payment events.

**Boundaries:**
- Does: PCI boundary
- Does NOT: order business logic

### Data Store

**Purpose:** Phoenix Project v1 data storage.

**Responsibilities:**
- orders and statuses
- cart state (if not moved to a dedicated store)
- technical events for audit (no secrets)

**Schema (PostgreSQL, example):**

```sql
CREATE TABLE carts (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP
);

CREATE TABLE cart_items (
  cart_id UUID REFERENCES carts(id),
  product_id UUID NOT NULL,
  qty INTEGER NOT NULL,
  PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  cart_id UUID REFERENCES carts(id),
  status TEXT NOT NULL,
  created_at TIMESTAMP
);

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  payload JSONB NOT NULL
);
```

## 3. API contracts

### Catalog API

```
GET /catalog?query=<q>&limit=<n>
200 OK
{
  "items": [
    { "id": "uuid", "title": "string", "price": "number" }
  ]
}
```

### Cart API

```
POST /cart/items
{ "product_id": "uuid", "qty": 1 }

200 OK
{ "cart_id": "uuid", "items_count": 3 }
```

### Checkout API

```
POST /checkout
{ "cart_id": "uuid", "payment_method": "card", "idempotency_key": "string" }

201 Created
{ "order_id": "uuid", "status": "created" }

409 Conflict
{ "error": "duplicate_idempotency_key" }

422 Unprocessable Entity
{ "error": "validation_error", "details": "..." }
```

## 4. Tradeoffs

### Tradeoff 1: monolith vs microservices

**Chosen:** modular monolith for v1.

**Alternative:** microservices per domain.

**Why monolith:**
- Pros: faster development (matches plan v1), simpler deployment, fewer networking failures
- Cons: weaker isolation; scaling is coarse-grained

**When to revisit:**
- if throughput grows beyond the monolith’s capabilities or domains need independent scaling/ownership

### Tradeoff 2: synchronous vs asynchronous processing

**Chosen:** synchronous request/response for v1.

**Alternative:** asynchronous (job ID + polling).

**Why synchronous:**
- Pros: simpler API; predictable latency targets (≤ <WINDOW>)
- Cons: long requests may timeout; limited concurrency

**When to revisit:**
- if requests exceed <WINDOW> or concurrency becomes a bottleneck → move to async in v2

### Tradeoff 3: PostgreSQL vs NoSQL

**Chosen:** PostgreSQL for v1.

**Alternative:** NoSQL (for example, MongoDB for documents; Redis for cache).

**Why PostgreSQL:**
- Pros: ACID transactions, SQL queries, JSONB support
- Cons: horizontal scaling is harder than many NoSQL setups

**When to revisit:**
- if workloads/patterns exceed what Postgres can handle → revisit storage in v2
- if query latency exceeds <THRESHOLD> → add cache

## 5. ADRs

### ADR-1: monolith for v1

**Context:** choose architectural style: monolith or microservices.

**Decision:** monolith for v1.

**Consequences:**
- Pros: faster delivery; simpler deployment; lower latency
- Cons: harder to scale; weaker isolation
- Mitigation: if throughput > 10K/hour → migrate to microservices in v2

### ADR-2: read-only mode (security)

**Context:** the agent operates on production logs. Risk: it can change production.

**Decision:** read-only mode. No writes/deletes.

**Consequences:**
- Pros: safe; audit is simpler
- Cons: cannot auto-fix issues
- Mitigation: if writes are needed, require explicit human confirmation at a gate (v2)

### ADR-3: synchronous processing for v1

**Context:** choose processing model: sync vs async.

**Decision:** synchronous for v1.

**Consequences:**
- Pros: simpler API; predictable latency (≤ <WINDOW>)
- Cons: long requests may timeout; limited parallelism
- Mitigation: timeout at <WINDOW>; if > <WINDOW> return error and retry with smaller batch; move to async in v2 if needed

## Verification plan (for architecture)

How to verify the architecture is sound:

### Check 1: spec coverage

- all FRs are covered by components
- all NFRs (performance, security, reliability) are addressed in design

### Check 2: tradeoffs are documented

- each key decision has alternatives
- pros/cons are documented
- revisit conditions are explicit

### Check 3: API contracts are clear

- endpoints are documented (request/response formats)
- error handling is defined (status codes, messages)
- boundaries are explicit (what it does / does not do)

### Check 4: review readiness

- another engineer can understand the design from the doc
- diagrams are readable (components, data flow)
- ADRs explain “why”, not just “what”

### Result verification (checklist)

- high-level overview with a diagram (components, data flow)
- component details (purpose, responsibilities, APIs, boundaries)
- API contracts (endpoints, request/response, errors)
- tradeoffs for 2–3 key decisions (alternatives, pros/cons)
- 2–3 ADRs (context, decision, consequences)

### Expected outcome

**Artifact:** architecture v1 in Markdown with diagrams

**Time:**
- agent draft: fast
- review and edits: fast

**Value:**
- design is reviewable before implementation
- tradeoffs are explicit: you know “why this way”
- v2 evolution is clearer

---

## Project plan v1: Phoenix Project (Phoenix Project v1 release)

### Purpose

Architecture answers “**how it is built**.” A project plan answers “**how we deliver it**”:
- what we do (WBS)
- what is on the critical path
- which risks can kill the release
- which quality gates we do not allow ourselves to skip

### Inputs

- spec v1 Phoenix Project (scope + NFR/DoD)
- architecture v1 (components, boundaries, ADRs)
- constraints: team, timelines, dependencies (payment provider, ERP)

### WBS (example)

| Phase | Goal | Artifacts | Notes |
|---|---|---|---|
| 0. Scope/DoD | freeze Phoenix Project v1 | updated spec v1 | what’s in v1 / what’s not |
| 1. Architecture | retire architecture risks early | architecture v1 + ADRs | domains, PCI boundary, idempotency |
| 2. Delivery baseline | make delivery repeatable | CI/CD + rollback plan + monitoring | ties to Chapters 5–7 |
| 3. Core domains | build the “end-to-end path” | Catalog + Cart + Checkout + Orders | minimal happy path |
| 4. Payments/PCI | accept payments safely | Payments boundary + audit + tests | do not postpone |
| 5. ERP/Inventory | integrate without surprises | contract + adapter + fallback | early spike required |
| 6. Release/rollout | ship without roulette | gradual rollout (Ansible `serial`) + rollback criteria | measurable signals |

### Critical path

Phoenix Project v1 most often “dies” on:
- **Payments/PCI → audit/logging → rollout/rollback**

If this is not ready, you either can’t ship or the first incident will be too expensive.

### Risk register (example)

| Risk | Likelihood | Impact | Mitigation | When to check |
|---|---|---|---|---|
| Forgotten NFRs (PCI/security) | Medium | Critical | ADR + security gate before implementing Payments | before phase 4 |
| Checkout idempotency | High | High | `idempotency_key` + state machine + retry tests | before provider integration |
| ERP/legacy unpredictability | Medium | High | early spike + contract + fallback scenarios | phase 5, week 1 |
| Rollback doesn’t work | Medium | Critical | rollback plan + gradual rollout + rollback criteria | before first rollout |
| Weak observability | High | High | define SLIs/alerts before production | before phase 6 |

### Quality gates (mapped to chapters)

- **Gate A (Spec):** spec v1 with NFR/DoD (Chapter 3) — no coding before this
- **Gate B (Architecture):** architecture + 2–3 ADRs (Chapter 4) — otherwise reverse-engineering later
- **Gate C (Delivery):** SOP “design → PR” + rollback plan (Chapter 5) — no cowboy changes
- **Gate D (Security/Infra):** security baseline + threat model (Chapter 7) — otherwise PCI/leaks

---

## Theory: architecture as a contract between components

### Concept 1: responsibility boundaries (component boundaries)

You have designed services. You know that **boundaries matter more than details**.

**A boundary is a contract: what a component does and what it does not do.**

**Why boundaries matter:**

In 2014 John Pesche showed Bill “architecture” as PowerPoint boxes. Bill asked: “How does frontend talk to backend? What API?” John: “Ask the developers.”

The problem: “Integration Layer” was not a layer but a set of services with no explicit boundaries. Some did auth, others did auth + logging + more. Bill tried to add a feature → a week of reverse-engineering → broke other services because boundaries were unclear.

In 2026 explicit boundaries prevent this:

```
Component: Checkout
Responsibilities: validate cart, orchestrate order/payment, idempotency
Not responsibilities: store PCI data (Payments boundary), manage orders (Orders), ERP integration (Inventory)
```

If boundaries are explicit, it is clear what the component does, what it does not do, and who it interacts with.

**For agent work:**

Agents tend to blur boundaries. They “help” and build god objects: a Checkout that validates, creates orders, talks to the provider, writes audit logs, and also “just in case” pokes ERP.

That’s dangerous: blurred boundaries → side effects → incidents and painful debugging.

**A real story:**

On ARIADNE we asked an agent to “design Checkout.” It returned:

```go
type Checkout struct {}

func (c *Checkout) Checkout(cartID string) (string, error) {
  // 1. validate cart
  // 2. create order
  // 3. pay via provider
  // 4. write audit
  // 5. (why not) integrate with ERP
  return "", nil
}
```

Problem: Checkout does everything. Boundaries are blurred.

**Fix:** we explicitly stated boundaries in the prompt:

```
Checkout:
- Does: validate cart and enforce idempotency
- Does: create order via Orders
- Does: initiate payment via Payments (PCI boundary)
- Does NOT: store payment data
- Does NOT: perform ERP operations directly
```

The agent revised the design:

```go
type Checkout struct {
  orders   OrdersService
  payments PaymentsService
}

func (c *Checkout) Checkout(cartID, idempotencyKey string) (string, error) {
  // 1) validate cart
  // 2) orderID := c.orders.CreateOrder(...)
  // 3) c.payments.Authorize(orderID, ...)
  // 4) return orderID
  return "", nil
}
```

**Takeaway:** without explicit boundaries, agents produce god objects.

### Concept 2: tradeoffs as verifiable rationale

Every architecture decision is a tradeoff: a choice among alternatives.

**Why this matters for agent work:**

Agents often produce one “recommended” option with no alternatives, which makes the decision non-reviewable.

**A real story:**

On ASIMOV we asked an agent to “choose a DB.” It said:

```
Recommendation: PostgreSQL
Reason: ACID transactions, SQL queries, JSONB support
```

Problem: no alternatives, no tradeoffs. We don’t know why PostgreSQL is better than MongoDB.

**Fix:** we asked: “compare PostgreSQL and MongoDB; show tradeoffs.” The agent returned:

```
PostgreSQL:
- Pros: ACID, SQL analytics, JSONB
- Cons: lower throughput; harder horizontal scaling

MongoDB:
- Pros: high throughput; easier horizontal scaling
- Cons: consistency tradeoffs; harder analytics

Recommendation: PostgreSQL for v1 (need ACID + analytics).
When to revisit: if throughput > 5K/hour → reconsider MongoDB.
```

Now we know why PostgreSQL and when to revisit.

### Concept 3: ADRs as project memory

If you’ve worked with legacy systems, you know the question: “Why is it done this way? Nobody remembers.”

**ADRs (architecture decision records) are the project’s memory.**

**ADR format:**
- **Context:** the situation/constraints
- **Decision:** what we chose
- **Consequences:** what it leads to (pros/cons)

In 2014 Bill asked: “Why Oracle?” John: “I don’t remember.” Bill spent a week reverse-engineering the rationale.

In 2026 ADRs preserve the why:

```
ADR-1: PostgreSQL vs MongoDB

Context: we need a DB for orders/checkout state.
Decision: PostgreSQL for v1.
Consequences:
- Pros: ACID, SQL analytics
- Cons: lower throughput than MongoDB
- When to revisit: if throughput > 5K/hour → reconsider MongoDB
```

Later a new engineer reads the ADR and understands the rationale without reverse-engineering.

**For agent work:**

Agents help you move fast, but months later you will forget why you decided “monolith” or “sync.” ADRs are a small time investment now that saves days later.

---

## Practice: an SOP for architecture design

### Purpose

A repeatable process for designing architecture with an agent: from spec to architecture v1 with tradeoffs and ADRs.

### Inputs

- spec v1 (FR/NFR)
- plan v1 (decomposition, risks)
- stack (language, DB, deployment)

### Procedure

#### Step 1: high-level design (components + data flow)

**What to do:**
- ask the agent to split the system into 5–7 components
- for each component: purpose (1–2 sentences)
- draw a data flow (how data moves between components)

**Quality gate 1: components cover the spec**

Checklist:
- all FRs are covered
- all NFRs are addressed (performance, security, reliability)
- the number of components is reasonable (5–7, not 20)

Failure mode:
On VOSTOK, the agent produced 20 “components” (basically one per method). Over-engineering. We simplified to 6.

**STOP CONDITION:**
If the agent creates > 10 components, stop and simplify. That is over-engineering.

#### Step 2: component details (responsibilities, APIs, boundaries)

**What to do:**
- for each component: responsibilities (what it does)
- if the component exposes an API: endpoints, request/response
- state boundaries explicitly: “does” / “does not”

**Quality gate 2: boundaries are explicit**

Checklist:
- each component has explicit boundaries
- there is no overlap (two components don’t do the same thing)
- API contracts are documented where applicable

Failure mode:
On SEVER, two components (Parser and Analyzer) both computed statistics. Overlap → duplication. We separated responsibilities.

#### Step 3: tradeoffs (alternatives + pros/cons)

**What to do:**
- identify 2–3 key architecture decisions
- for each: alternatives, pros/cons, revisit conditions

**Quality gate 3: tradeoffs are documented**

Checklist:
- each decision has at least one alternative
- pros/cons are documented
- revisit conditions are explicit (“when throughput > X”)

Failure mode:
On ZAPAD we chose PostgreSQL without documenting tradeoffs. Later throughput grew and Postgres didn’t keep up; migration to MongoDB cost weeks.

**STOP CONDITION:**
If the agent does not propose alternatives, stop and ask: “show alternatives and compare them.”

#### Step 4: ADRs

**What to do:**
- create ADRs for 2–3 key decisions
- format: context, decision, consequences (pros/cons/mitigation)

**Quality gate 4: ADRs explain the why**

Checklist:
- each ADR has context, decision, consequences
- consequences include pros/cons and mitigations
- revisit triggers are measurable

---

## Common mistakes

### Mistake 1: “architecture” without boundaries

**Symptom:** component names exist, but “who owns what” is unclear. Components overlap, do too much, or become god objects.

**Consequence:** every change requires reverse-engineering; bugs spill across domains.

**How to avoid it:** write explicit “does / does not” boundaries for every component.

### Mistake 2: decisions without alternatives

**Symptom:** “We chose X” without presenting at least one alternative.

**Consequence:** the decision is not reviewable. The team can’t validate tradeoffs.

**How to avoid it:** demand alternatives and a pros/cons comparison.

### Mistake 3: ADRs without consequences

**Symptom:** ADR includes context and decision but no consequences.

Example:

```
ADR-1: Monolith for v1

Context: choose an architecture style.
Decision: monolith.
```

No consequences means: no pros/cons, no mitigation, no revisit triggers.

**How to avoid it:** require full ADR format: context + decision + consequences.

---

## Role evolution: how the team changed after Case 1

**Case 1 (Chapters 1–4): deployment chaos → analysis + spec + architecture**

### Before/after: Lance (Senior → Senior+, toward Staff)

**Before Case 1 (start of Chapter 1):**
- **Time allocation:** ~60% execution (coding, debugging, manual work) + ~40% strategy (design, architecture thinking)
- **Key activities:** writing code, fixing bugs, manual releases, firefighting
- **Coordination:** meetings, email chains, Slack threads (implicit expectations)
- **Decision scope:** tactics (code, tech choices); strategy mostly through a manager
- **Output:** individual contributor output for their team

**After Case 1 (end of Chapter 4, architecture v1 exists):**
- **Time allocation:** ~50% execution (reviewing agent output, verification) + ~50% strategy (prompt design, architecture, verification design)
- **Key activities:** prompt writing, verification plans, agent-oriented architecture, SOP design
- **Coordination:** prompts (explicit contracts), gates (automatic checks), stop conditions (escalation criteria)
- **Decision scope:** tactics + strategy (architecture decisions, risk mitigation)
- **Output:** repeatable processes (prompts, verification plans, architecture docs) with team-level impact

**Skills gained (Case 1):**
- prompt engineering: role/context/task/output/stop conditions
- verification design: build DoD that can be checked (sampling, edge cases, sanity checks)
- guardrails: what the agent must not do (security constraints)
- architecture for agent-in-the-system: boundaries, tradeoffs, ADRs
- first orchestration: gates instead of meetings

**Senior+ marker:**
- execution time reduced (agents take analysis); strategy share increased
- repeatable artifacts were created (prompts, verification plans, architecture doc)
- data accuracy improved (verification plans)
- bus factor improves slightly because processes are written down

### Before/after: Richard Hendricks / expert (bottleneck → Expert+, start of delegation)

**Before Case 1:**
- heavy load (frequent firefighting and on-call)
- routine dominates (manual releases, incident triage, data analysis)
- **Bus factor:** 1 (knowledge in Richard’s head; the team blocks frequently)
- critical path: any release/incident needs Richard

**After Case 1 (architecture v1 + agents for analysis):**
- delegation starts, some analysis is offloaded
- routine drops slightly; strategy increases slightly
- bus factor is still low, but documentation and repeatable processes begin

### Before/after: the team (outcomes and early scalability)

**Before Case 1:**
- coordination overhead is high (meetings, waiting for experts)
- knowledge sharing is informal and not captured
- scaling is linear (more work → more people)
- release frequency is low and failure rate is high

**After Case 1:**
- throughput increases without headcount growth (analysis is delegated)
- coordination overhead decreases a bit (prompts replace some meetings)
- documentation exists (prompts, verification plans, architecture v1)
- the foundation for non-linear scaling is laid (processes are reproducible)

### Difficulties we ran into (Case 1)

**Challenge 1: “Will agents replace me?”**
- team skepticism: “a toy”, “I can do it faster manually”
- resolved by showing quick, verifiable wins (Chapter 1)
- result: resistance → interest → adoption

**Challenge 2: we initially skipped verification**
- early output without verification → a public artifact with ~15% errors (painful)
- fixed by making verification plans mandatory (Chapter 1) and using gates (Chapter 2)

**Challenge 3: prompts without stop conditions**
- the agent invented missing data
- fixed by explicit stop conditions (Chapter 2): ask questions / escalate on uncertainty

### The next wave (Case 2 begins)

**Readiness for Case 2 (Brent/Richard bottleneck):**
- the foundation exists: prompts work, verification is trusted, architecture v1 exists
- multiple engineers can write prompts and verification plans
- processes are reproducible
- next: systematic knowledge capture (implicit knowledge → SOP)

**Expected after Case 2 (Chapters 5–7):**
- Lance: Senior+ → Staff- (SOPs, knowledge capture, org templates)
- Richard: Expert+ → Principal- (bus factor rises through SOP-driven delegation)
- team speed and bus factor improve materially

### Cumulative metrics (end of Case 1)

**Operational:**
- analysis time: days → fast
- data accuracy: ~70–80% → 95%+
- release success rate improves (earlier detection via analysis + verification)

**Organizational:**
- bus factor: 1 → ~1.5 (still low, but documentation begins)
- coordination overhead drops slightly
- strategic capacity increases for key individuals

**Financial:**
- cumulative effect: automation + repeatability (Chapter 1)
- investment: time spent on prompts, verification, and architecture (Chapters 1–4)
- ROI: calculate for your context (see Appendix A template)

---

## Summary

### What we did

- Designed architecture v1 with an agent (components, APIs, data flow)
- Documented tradeoffs (alternatives, pros/cons, revisit conditions)
- Created ADRs for key decisions (context, decision, consequences)

### Artifacts

- **Architecture v1:** 5–7 components with explicit responsibility boundaries, API contracts, diagrams
- **Tradeoffs:** 2–3 key decisions with alternatives and pros/cons
- **ADRs:** 2–3 architecture decision records

### Key principles

1. **Boundaries as a contract:** each component has explicit boundaries (does / does not)
2. **Tradeoffs as verifiable rationale:** every decision is a choice among alternatives
3. **ADRs as memory:** document “why”, not just “what”

### Acceptance criteria

You’ve mastered the chapter if you can:
- describe architecture v1 as components with boundaries and contracts
- capture 2–3 key tradeoffs (alternatives + revisit conditions)
- write an ADR (context → decision → consequences)

### Next steps

In **Chapter 5** (Case 2: the Brent bottleneck) you will learn how to:
- create an SOP “design → PR” (how to make changes with an agent)
- use quality gates at each step
- review code produced by an agent

**Hook:** you have the design. Now: how do you implement it with an agent while controlling quality at every step (design → implementation → testing → PR)?

---

**From plan to architecture. Case 1 is complete. 40% of the book is done.**

