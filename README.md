# Veritech Audit workspace

A Mongolian-language, browser-local frontend prototype for connected audit work. Next.js, React, TypeScript, Tailwind and Lucide. Three fictional engagements and four people demonstrate different preparation, review, partner and quality responsibilities.

**New in v4:** open **Миний ажил → Ажлын баримтууд** for the full-page editor. Open **Үйлчлүүлэгчид** for the company record, evidence library, Form Builder, and contextual data checks. See [v4 scope and verification](docs/research/implementation-v4.md).

**New in v3:** open **Урсгал нээх** on the home page to start the fixed-asset additions scenario at Оргил Технологи. See the [walkthrough and verification notes](docs/research/implementation-v3.md). v3 uses a separate browser storage key so the earlier v2 demo data is retained.

## Run

Node.js20.9+ is required. The lockfile uses pnpm. npm is also supported.

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000.

```sh
npm run typecheck
npm test
npm run build
npm start
```

The build creates a static `out/` export. `npm start` serves it locally. No database, production identity or external service is required for the prototype.

## Explore

- **Senior delivery:** start as Т. Тэмүүлэн. Inspect the review queue, rolling Gantt, stage/status matrix, dependency references, assignments and scoped workload. Open a workpaper in its inspector without leaving the list. Change its due date and see the same deadline in the calendar.
- **Calendars/tasks:** all four personas have personal planning and task destinations, with different menus and engagement scopes. Week/month/agenda views combine authoritative work deadlines, manual tasks and planned event windows. A task checkbox cannot approve audit work.
- **Prepare/review:** switch to Б. Номин, open3.1.2, change a result/conclusion, save and submit. Switch to Т. Тэмүүлэн, write a note and return. The preparer responds and resubmits; the reviewer separately clears the note and reviews the exact revision. A permitted owning workspace survives a role switch.
- **Native forms:** all70 source contracts open, with typed choices, fixed letter/report clauses, programme results/assertions/hours, repeated rows, strategy anchors and source coordinates. These are derived product contracts, not exact Excel parity.
- **Non-sequential work:**1.1.1 uses acceptance/independence outcomes from their owning decisions. Drafting is possible while a decision is pending. Sampling links to materiality; form numbers do not define execution order.
- **Requests/evidence:** partial receipt is separate from auditor acceptance. Register a small actual file locally or inspect the explicitly fictional specimen. Replacement creates a separate version record; old evidence links remain.
- **Data/automation:** import the example CSV, inspect accepted/quarantined/excluded rows and run reconciliation. Seven bounded demo methods use the actual browser state: AUTO-003,028,046,047,048,056,058. The other51 source cards are visibly unavailable as engines. Failed attempts, parameters and stale results stay in history.
- **Sampling:** propose size/seed, review the exact population/design and perform a reproducible selection. A replaced dataset invalidates design review; earlier selections remain.
- **Reporting/archive:** agreed/unposted adjustments remain outstanding. Exact report/statement authorization, issue, recipient attempts, file lock and custody are distinct. The same issue is idempotent; release versions are retained. A hold prevents disposal, not legitimate custody.
- **Controlled configuration:** the senior has a one-form author assignment; the partner has a separate publisher assignment. Publication changes no engagement until explicit adoption. Existing answers remain.

## Research and traceability

The supplied61-page brief informed this iteration. Audit products are the primary design benchmark; cross-industry patterns supplement them.

- [Audit products](docs/research/audit-products.md): ten product families, journeys, interface references and16 audit-derived pattern cards.
- [External software](docs/research/external-products.md): eight products and20 further pattern cards.
- [Design specification](docs/research/design-spec.md): nine flows,16 processes, role menus, metrics, dependencies, configuration costs, wireframes, priorities and scenarios.
- [Source review](docs/research/source-review.md): originals, editions, worksheet/field evidence and review limits.
- [Implementation/verification](docs/research/implementation.md): actual depth and remaining work.
- [Current coverage](docs/research/current-coverage.json):1,269 separate current source dispositions. The baseline ledger remains frozen to581b70c.

The populations reconcile136 feature/common-scope items,75 cases,315 criteria,58 automation minimums plus58 extensions,22 area variants,476 E2E steps,70 forms,25 screen groups,29 decisions and five BPMNs. Mapping a requirement is different from completing it. Conditional services, excluded inferences and unresolved decisions retain their scope.

## Boundaries

This is a local prototype with fictional data and simulated identities/scopes. Client checks demonstrate rules; they are not production access enforcement, professional signatures or compliance certification. The metric reference day is6November2026. Calendar dates are date-only; recurrence, timed timezone behavior and Google/Outlook synchronization remain future work.

Original ZIPs/workbooks were read unchanged and are not redistributed. Derived form/requirement content is published under the owner's authorization. Public vendor documentation supports the research; commercial tenant usability tests, unobserved screenshots and efficiency percentages are not invented.

Actual local files are capped at500KB per file; browser storage limits apply. This prototype is not a secure custody/retention or backup service. Settings exports and resets the v2 demo. The original v1 source and [first-version notes](docs/first-prototype.md) remain for reference; the old browser storage key is not overwritten.
