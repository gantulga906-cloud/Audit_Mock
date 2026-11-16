# Veritech Audit workspace

**G01 acceptance, independence and terms, 16 November 2026.** Standard intake now separates supported assessment, named declarations, independent recommendation, exact written agreement, partner decision and activation. Unknown/prohibited/refused outcomes remain explicit, and relevant changes reopen only current reliance while preserving history. [Behavior and source mapping](docs/research/g01-acceptance-2026-11-16.md) · [Published checkpoint and verification](docs/checkpoints/G01/README.md).

**GitHub publication, 16 November 2026.** The development branch now includes the complete local application through G00. [Published plans, implementation handbooks, evidence and history](docs/delivery/README.md) accompany the code. Completed, verified batches are published to this branch as development continues; merging into main and deployment remain separate steps.

**G00 shared foundations, 16 November 2026.** Shared commands reject malformed input before mutation. A connected two-engagement scenario verifies exact review, preserved original bytes and approvals, targeted change impact, revoked access and restart/retry. `npm run verify:foundations -- --build` checks all eight shared contracts against fresh tests, frozen source scope and a clean build. [Checkpoint scope, reproduction and continuing work](docs/research/g00-foundations-2026-11-16.md).

**Controlled form adoption, 16 November 2026.** Preview edition changes and incompatible answers before adoption. Compatible repeated-row cells survive; incompatible direct updates require acknowledgement of the current preview. The builder now persists actual table columns and accepted evidence inside rows. Source schedules retain narrative asset results and text sample identifiers. [Behavior, compatibility and remaining F2/R08 work](docs/research/form-adoption-2026-11-16.md).

**Materiality and form fidelity, 11 November 2026.** Workpaper 1.3 now separates benchmark candidates from selected/overridden overall, performance, specific and clearly trivial thresholds. Calculations use the selected overall amount, preserve zero and retain prior signed decisions. A read-only source inventory records all 70 forms, 272 row-number formulas and 1,820 validation definitions. [Behavior, source coordinates, compatibility and remaining F2 work](docs/research/materiality-and-form-fidelity-2026-11-11.md).

A Mongolian-language audit workspace built with Next.js, React, TypeScript, Tailwind and Lucide. The current interface uses the local shared SQLite service for engagement, evidence, preparation, review and completion records.

**Enterprise workspace, 11 November 2026.** The redesigned interface is available at `/` and `/pilot`: persistent engagement context, personal queues, workpaper tables, full-page editing, optional source preview, review, data, planning and completion destinations. A neutral/indigo theme supports light, dark and compact modes. Save, submit, respond, clear and review remain separate actions. [Implementation, compatibility and remaining work](docs/research/redesign-2026-11-11.md).

The earlier browser-local prototype is retained at `/legacy` with its existing storage keys. Its data is not automatically imported into the shared service. The v3–v5 notes and **Earlier browser-local prototype** section below describe that historical surface.

**Functional continuation, 11 November 2026.** Missing/revoked engagement links recover safely, and returned-work filters survive paper navigation. Completion supports independently approved report preparation, failed/uncertain recipient attempts and reconciled retries. Final file supports policy-configured assembly, independent approval and custody return/correction/reoffer. Existing pilot paths and source scope remain. [Behavior, action locations, verification and remaining work](docs/research/functional-continuation-2026-11-11.md).

**Local shared pilot.** Run `npm run build` and `npm start`, then open the URL printed in the terminal. Set up role credentials with the one-time code. SQLite stores separate engagements, from acceptance and programme selection through evidence, review, authorization and archive. Use the engagement selector or **Үйлчлүүлэгчид** to switch engagements or add another. The partner controls engagement membership for the pilot reviewer and preparer. [Pilot walkthrough](docs/research/implementation-pilot.md) · [Development and migration notes](docs/research/development-progress.md)

**New in v5.** In **Үйлчлүүлэгчид**, register a client and open a fresh engagement with real reporting dates and an assigned demo team. Once the partner activates it, track evidence requests and tailor the procedures in a programme workpaper. See [v5 walkthrough and scope](docs/research/implementation-v5.md).

**New in v4:** open **Миний ажил → Ажлын баримтууд** for the full-page editor. Open **Үйлчлүүлэгчид** for the company record, evidence library, Form Builder, and contextual data checks. See [v4 scope and verification](docs/research/implementation-v4.md).

**New in v3:** open **Урсгал нээх** on the home page to start the fixed-asset additions scenario at Оргил Технологи. See the [walkthrough and verification notes](docs/research/implementation-v3.md). v3 uses a separate browser storage key so the earlier v2 demo data is retained.

## Run

Use Node.js 22.18+ for the pilot and tests. The lockfile uses pnpm. npm is also supported.

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

The build creates a static `out/` export. `npm start` serves the shared workspace and API on port 3000. `npm run pilot` serves the same product on port 3004. Set `AUDIT_PILOT_DB` to use a separate SQLite database. `node scripts/serve.mjs --legacy` serves the earlier browser-local prototype without starting the shared API. `pnpm dev` is useful for frontend work; the standalone pilot server supplies the shared API.

After building, `npm run verify:workspace` checks navigation, draft protection, the preparation/review cycle, evidence preview and controlled questionnaire saving through headless Chrome with synthetic records. It creates a fresh database and browser profile under `.audit-pilot/workspace-ui`. Set `AUDIT_CHROME_PATH` if Chrome is installed elsewhere. This complements `npm test`; it does not certify all source requirements.

Record `/build-info.json` for each acceptance run. It identifies the built UI, Git revision, working-tree state, and source manifest. The local server also sends the build ID with pilot API responses.

In the shared pilot portfolio, open **Маягтын сан ба бүтэц** to draft or approve a template. A partner can grant authoring on a specific form. In an engagement, use **Эх маягт ба баталсан хувилбар холбох** to pin a source or published version and work on its typed fields. A published revision takes effect in an engagement after explicit adoption. Excel import reads a question-list worksheet with a `Question` column and optional `Type`, `Choices`, `Section` and `Required` columns.

In an extended engagement, review **1.3** and the relevant **2.6** reliance basis, then open **Аудитын бүртгэл ба шийдвэр → Төлөвлөлт ба эрсдэл → M07-F01**. Choose the applicable methodology rule and reviewed risk, then select the approach, template version and procedure. A partner approves the decision. The workpaper shows the approved planning basis alongside the fields for actual execution. An exclusion stays out of fieldwork, and a changed planning input reopens the dependent work.

In an active pilot engagement, open **Эх олонлог ба санхүүгийн тайлангийн тулгалт** to upload a UTF-8 CSV with columns `id,account,amount,entity,date,currency`. Use the engagement registration number and ISO dates. Attach and independently accept a separate control report, then reconcile the in-scope count, signed total and account-to-statement lines. A different reviewer approves the exact revision. Optional `journal,entry_type` columns enable journal testing. Under an applicable workpaper, use the approved population for sample design and journal investigation. The request desk creates multi-part requests and one-time local confirmation links.

Sales, receivables, purchases, bank, inventory and fixed-assets workpapers also run area checks. Use an optional `reference` column in the approved ledger for exact document matching and attach the area exports as accepted supporting evidence. The workpaper lists each required CSV schema. Select the mapped statement line, run the checks and document each exception before independent review.

Payroll, tax, loans, leases, FX, equity and investment workpapers also ask for a named edition from accepted rule or methodology evidence. Enter basis-point rates and the supplied methods in the listed schemas, and choose separate ledger lines where the workpaper asks for them. The fixture uses synthetic rates. The server blocks missing or unsupported methods and keeps the selected edition with the reviewed result.

The local setup can also create distinct **Quality** and **Custodian** credentials. The engagement team records its quality policy, sends back exact-version responses, and offers locked packages to custody. For the controlled completion route, attach independently accepted management authorization, link the signed representations, authorize the exact report, sign it locally and record the recipient's acknowledgment through the sandbox link. The custodian verifies and accepts the exact downloaded manifest.

Run `npm run verify:release -- --build` to capture executed tests, source links, build identity and open release requirements in `.audit-pilot/source-verification.json`. Add `--strict` to require independently accepted source contracts and a passing connected journey for each applicable lifecycle.

Open **Үйлчлүүлэгч ба аудитын хүсэлт** in the portfolio to record an enquiry, search clients or maintain contact history. The reviewer converts a forwarded enquiry after confirming the current client profile, contact and reporting period. The partner approves the signed engagement letter revision before activating a converted engagement.

Open **Фирмийн мэргэжилтэн ба боломжит цаг** for roster and workload. The firm registers record the practitioner, credential and appointment. The engagement's **Багийн томилгоо ба нөөц** panel shows the approved staffing and its scope. For managed engagements, workpaper schedules and tasks use current approved appointments and retain earlier sign-off attribution.

## Earlier browser-local prototype

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
- [Development progress](docs/research/development-progress.md): work packages and source-linked regression evidence.
- [Current coverage](docs/research/current-coverage.json):1,269 separate current source dispositions. The baseline ledger remains frozen to581b70c.

The populations reconcile136 feature/common-scope items,75 cases,315 criteria,58 automation minimums plus58 extensions,22 area variants,476 E2E steps,70 forms,25 screen groups,29 decisions and five BPMNs. Mapping a requirement is different from completing it. Conditional services, excluded inferences and unresolved decisions retain their scope.

## Boundaries

This is a local prototype with fictional data and simulated identities/scopes. Client checks demonstrate rules; they are not production access enforcement, professional signatures or compliance certification. The metric reference day is6November2026. Calendar dates are date-only; recurrence, timed timezone behavior and Google/Outlook synchronization remain future work.

Original ZIPs/workbooks were read unchanged and are not redistributed. Derived form/requirement content is published under the owner's authorization. Public vendor documentation supports the research; commercial tenant usability tests, unobserved screenshots and efficiency percentages are not invented.

Actual local files are capped at500KB per file; browser storage limits apply. This prototype is not a secure custody/retention or backup service. Settings exports and resets the v2 demo. The original v1 source and [first-version notes](docs/first-prototype.md) remain for reference; the old browser storage key is not overwritten.
