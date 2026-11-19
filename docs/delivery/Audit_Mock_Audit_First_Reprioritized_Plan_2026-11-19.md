# Audit_Mock — Audit-first reprioritized implementation plan

**Status:** Proposed project-director scope and priority reset, 19 November 2026. **Implementation:** Not started by this document. **Source baseline:** [consolidated remaining-work register (18 November)](Audit_Mock_Consolidated_Remaining_Work_2026-11-18.md) at `ab62b39941b7b90c88cf14a55e34ee3d9a39ce80`; implemented G01–G11 application and published checkpoints. This is a new **planning** document, not evidence of requirement closure or a legal opinion.

**Executive decision:** Finish **financial-statement audit workflows across Stages 1–5** and audit-specific quality, reporting and archive obligations first. Treat broad firm operations and unrelated product expansion as lower priority. **Preserve every original requirement ID and historical source disposition**; changing priority is not deleting source scope. External ERP, credential validation APIs, live confirmations, digital-signature providers and malware infrastructure are assigned to later specialist/integration teams, not silently implemented here.

## 1. The new delivery contract

- **Core product goal:** Every applicable source audit procedure has a supported *execution path*, including structured inputs, responsible practitioner, accepted evidence, conditional branches, actual performed work, professional conclusion, independent review, version history, change impact, and downstream handoff. Computable sub-procedures use controlled calculation engines; noncomputable professional judgments use structured, evidenced, attributable decisions. "Full audit coverage" does **not** mean autonomously reaching audit opinions or implementing every conceivable accounting method.
- **AS-IS is not erased:** G01 intake/terms; G02 planning/controls; G03 data/evidence; G04 procedures/sampling/journals; G05 findings/quality; G06 reporting; G07 archive/later facts; G08 form library/adoption; G09 named accounts/operations; G10 22 area cards; G11 58-minimum locator/19 profile additions.
- **Measured baseline only:** G11 recorded 137 passing tests; 239/315 criteria and 161/476 source E2E steps have bounded direct fixture evidence; nine complete reference lifecycle profiles. All 70 forms structurally roundtripped; all 22 area cards have partial engineering evidence; all 58 minimums have bounded locators/observations. Independent source acceptance remains empty and `releaseReady=false`. These are **not percentages of product completion**.
- **Immutable source scope:** Keep the 25 packages, 128 original tasks, 2,247 original obligations, 70 forms, 22 fieldwork variants, 58 automation minimums, separately pending 58 future extensions, 20 confirmed dependencies, 51 E2E lifecycles and 1,012 BPMN flow/gateway entries. Use original IDs in every new engineering task.
- **Operating principle:** Source workbook/guidebooks + E2E catalogue + BPMNs + approved professional editions + independently expected example form the source of truth *together*. Conflicts need explicit disposition. A source screenshot, figure, template label or spreadsheet formula is not automatically a correct executable rule.
- **Status codes per requirement:** IMPLEMENTED-ENGINEERING / VERIFY-SOURCE / MISSING-REQUIRED / NEEDS-PROFESSIONAL-DECISION / SUPPORTED-MANUAL / EXTERNAL-OWNER / DEFERRED-PRODUCT / ACCEPTED (latter only after attributable independent review).
- **Meaning of "non-audit okay for now":** freeze broad CRM/billing/other services, but do not postpone audit-critical assignment, permissions, evidentiary integrity, method governance, independent review or release blockers.

## 2. Priority bands and workstreams

| Rank | Stream | Scope and deliverable | Treatment |
|---|---|---|---|
| P0 | Audit scope/standards/source baseline | Appropriate edition and applicability, hard blockers, resolved source divergences, native form contracts and original-ID traceability | Start immediately; decision work parallel with implementation |
| P1 | Audit workflows | Acceptance exceptions; risk/controls, sampling, evidence, A01–A30 as applicable; testing; findings; EQR; opinions; amendments | Mandatory audit core |
| P1 | 22 substantive areas + 58 automation minima | Complete selected source procedures, approved method packs, accounting/financial transformations, end-to-end results | Mandatory audit core; human decision retained |
| P2 | Enabling workflows | Controlled Excel input/output, selected document parsing, 20 dependencies, multi-assignee staffing, configurable roles, restricted specialist documents | Build alongside audit slices that require them |
| P2 | File finalisation | Dual dating, custody, inspection, applicable retention/disposal, archives and amended reports | Complete audit core; production storage adapters can be owned separately |
| P3 | Release engineering | Cross-role UI, ERD/runtime validation, representative workload, deployment/security, independent auditors' acceptance | Needed for release, separate owners |
| HOLD | External connections | ERP/master APIs, government/credential lookups, bank/email/confirmation dispatch, external signatures, malware service | Maintain contracts/manual routes; build by designated teams later |
| HOLD | Broader offerings | General billing/CRM, separate reviews/assurance/advisory, generalized firm ERP, all 58 optional future extensions | Do not include without a separately approved scope row |

**P1/P2 are not chronological silos.** A complete revenue audit may require a source-form fix, data-method fix, specific role permission, an exception branch and a report consequence in one slice.

## 3. Architectural guardrails — established methods, not new bespoke invention

1. **Versioned "method packs" / decision tables:** Each framework/method pack declares `framework, jurisdiction/firm, version, effective reporting periods, approved authority, scope, input schema, parameter types, calculation, output schema, exceptions, rounding/units, reviewer, tests, unsupported conditions`. Use a bounded contract catalog, not an unrestricted arbitrary-rule engine. Some packs are audit procedures, some accounting calculations, some legal blocker references.
2. **Source fidelity as contract testing:** Form source ID/cell/row -> canonical semantic field -> UI control -> persisted value -> dependent logic -> reviewed export. Separate cosmetic row numbering and presentation from operative validation/calculation. Keep source coordinates and provenance.
3. **Accounting-mapping engine:** Exact source row identity, financial-statement node, entity/period/currency/unit, allocations, controlled adjustment entries, exception reconciliation and versioned approval. Extend one-destination mappings to required split allocations and complex consolidation without silent balancing.
4. **Configurable RBAC + scoped resource grants + non-bypassable separation of duties:** Admins can create a lawyer/expert/senior capacity and toggle *allowed action types*; policies still check actual appointment, engagement, specific document, current stage, original actor, expiry and two-person controls. Audit and security events cannot be erased. Keep a curated action dictionary rather than arbitrary executable permissions.
5. **Human judgment is first-class data:** Record real actor, authority, source and edition, choices, uncertainty, rationale, attached evidence, approval, date, revision and resulting action. Don't implement an unsupported legal/accounting inference as a default.
6. **No parallel stores where existing records suffice:** Extend owning G01–G11 commands and records. Preserve old source IDs, original bytes, immutable histories, accepted reviews, authorization/issue/lock/custody lineage, idempotency and targeted staleness.
7. **Optional provider adapters do not masquerade as delivered remote effects:** local trial may represent intended command and unknown outcome; only an actual external receipt represents delivery/integration.
8. **Human-dependent confirmed references:** For some of 20 DEP-C edges, a human confirm/review is an appropriate accepted route. A sourced relationship is not an automatic hard block on unrelated draft-save.

## 4. Domain-by-domain revised decisions

### D01 Client acceptance & independence — audit-specific, bounded legal scope
- **Keep** current client enquiry, declarations, assessed threats, independent recommendation, terms and activation.
- **Mandatory:** Build a *hard-blocker register* with exact source (ISA/IESBA/local applicable law/firm policy), applicability conditions, effective period, explanatory text, required evidence, responsible reviewer, version and **block/needs-review/informational** status. Research likely categories: professional authorization/licence, prohibited independence relationships/services, invalid engagement preconditions, client/partner appointment and identified nonwaivable restrictions. Never claim a universal Mongolian legal rule without a verified text and adoption decision.
- **Human remains responsible** for fact investigation, disputed applicability and all non-deterministic judgments. Unknown/unresolved nonwaivable restrictions block *positive final acceptance*, not ordinary collection of draft data. Clear by new accepted authority evidence rather than fake override.
- **Mandatory:** Finish original A01–A03 normal/decline/conditional/continuance/withdrawal/amendment branches and exactly linked downstream activation.
- **Minimum internal integration:** controlled Excel/CSV client-master upload with documented required/optional fields, duplicate validation, preview, source provenance, corrections, reviewer acceptance and change history. **Defer** external client-master/registry API.
- **Acceptance:** no prohibited positive activation; renewal after source change; old periods unaffected; validated import and conflict reporting.
- **Crosswalk:** RW02/RW06/RW07(selected import only)/RW10/RW34/RW35.

### D02 Engagement team, workload and specialists — expand now, don't make a staffing ERP
- **Keep** named accounts, grants, suitability, work history and actual effort.
- **Mandatory:** senior/authorized manager may allocate multiple preparers and reviewers per engagement and per work item, change ownership, transfer open work, designate lead/secondary staff, preserve prior authorship and clear work queues accordingly.
- **Mandatory:** multi-engagement capacity visibility, planned vs actual hours, overlap/conflict flags, budget/resource scenario variance, reassignment effects, handoff/reviewer conflicts and past-period retention. No invented utilization or audit-quality score.
- **Credential profile now:** staff credential ID, issuer/type, expiry, attachment, verification status (self-reported/file-reviewed/externally verified), evaluator. No imaginary live CFA/CPA API check.
- **Specialist route:** grant selected files or precisely defined full *engagement-selected* evidence set to an external expert, with purpose, case/engagement, read/download limits, end date, revocation, NDA/authority if applicable, and audit trail. "Full" never means indiscriminate firm-wide access or cross-client access. Specialist may submit opinion/evidence but cannot self-authorize audit opinion or independently clear own work. Account login may be conditional; secure explicit manual sharing route must still be usable where portals deferred.
- **Acceptance:** realistic three-person+team case, concurrent engagements, reassignment during review, revoked specialist, changed permissions, direct-file URL denied, independent approval retained.
- **Crosswalk:** RW08/RW09/RW13/RW31/RW33(selected identity boundaries).

### D03 Forms, source fidelity, Excel and dependencies — constrained supported form families
- **Mandatory:** specify stable **supported form archetypes**: intake/questionnaire; narrative judgment; structured checklist; financial reconciliation; schedule/repeated table; analytical/calculation; confirmation/evidence request; formal approvals; report/archive. Define types, conditional logic, repeat rows, references, supporting evidence, exact outputs.
- **Mandatory:** verify each of 70 original forms against an archetype. Maintain source->semantic->UI->data->export trace. Handle exceptions as explicit extensions to a family, not arbitrary generalized UI rules.
- **Source fact to reconcile:** currently supplied Stage 1–3 workbook binaries differ from registered versions; Stage 4–5 match. Fresh inventory shows **987** validation definitions versus **1,820** in the registered inventory *across the compared workbook set*, not "833 missing audit rules". There are **272** presentation-numbering formula cells. Stage 2 may be an image/book reproduction: read actual visible text/images and source anchors with human validation, rather than inferring completeness from machine-readable spreadsheets. Exact earlier registered Stage 2 content is not available in recorded comparison. Resolve the authoritative edition and differences; don't replace history silently.
- **Mandatory:** operative formulas/validations and required export layouts implemented only for approved source constructs. XLSX/Word output where source requirement demands; readable HTML is not always sufficient. Macro/external formula execution is not assumed.
- **Separate workstream:** 20 DEP-C cross-form references each receive individually reviewed source/target/use, applicability, decision owner, exact version, targeted staleness, prior-period handling, tests and manual override/review route where appropriate.
- **Acceptance:** accepted semantic fidelity evidence per form/family and all 20 dependencies; not merely structural roundtrip.
- **Crosswalk:** RW01–RW05/RW39.

### D04 Risk, controls and audit planning — research ISA, then finish source branches
- **Mandatory:** source-to-ISA research and approved applicability matrix for ISA 300/315/320/330, 240, 402, 610, 620 and relevant firm policies; avoid mechanically forcing document wording as risk score.
- **Mandatory:** implement and verify A04–A10/A12, entity/IT/control understanding, risks at FS/assertion levels, design vs implementation vs operating test, control deficiency, fraud inquiries, multiple risks/multiple responses, contributor/opening branches, revised strategies, materiality and scope changes, performed work and actual handoff.
- **Acceptance:** source-based normal/adverse/unknown/change/review cases with defined expected outcomes and no unsupported risk judgments.
- **Crosswalk:** RW02/RW06/RW09/RW11/RW19/RW35.

### D05 Data intake, financial mappings and accounting method infrastructure — mandatory core, bounded contracts
- **Mandatory:** published accepted import schemas for selected CSV/XLSX export families: GL, TB, FS, journals, sales, receipts, purchases, payables, payroll, asset and inventory registers; controlled preview, source required/optional fields, row counts, signed totals, unknown/zero/null, duplicates, quarantine, currency/date/unit, complete/partial population flags and independent approval. Scale/performance targets set using representative real-world *synthetic* datasets, not blanket arbitrary import.
- **Non-negotiable:** split account allocations, controlled many-to-one and one-to-many mappings, multi-entity and consolidation cases, adjustment provenance, exchange-rate policy and linked statement/note reconciliation with disjoint effects and reversals. No unapproved auto-journals or invalid balancing.
- **Mandatory:** build versioned approved accounting method catalog for applicable source procedures across D08 (inventory cost, depreciation, effective interest, FX, lease schedules, ECL/impairment, tax, revenue, consolidation and other approved cases); actual framework/effective period attached.
- **HOLD:** live external ERP/master integration; keep adapter contracts and manual import path.
- **Acceptance:** independently computed expected examples, high-volume benchmark, invalid/mixed-source cases, line-grain reconciliation, restored history, targeted stale results.
- **Crosswalk:** RW04/RW05/RW12/RW18/RW20/RW32/RW40.

### D06 Evidence, files and confirmations — core work now; live channels later
- **Mandatory:** finish A14/A18 full request/confirmation alternatives, recipient/scope checks, missing/partial/wrong-period/contradictory evidence, returned responses, difference escalation, optional alternate procedures with independent authority, completion consequences and appropriate urgency status.
- **Mandatory:** file identity/hash/readability/corruption detection, selected PDF/DOCX/XLSX/CSV/image previews or extraction with clear "unsupported" and authenticity limits, source anchors, original download, replacements and scoped confidentiality. Parsing is not proof of accuracy or malware safety.
- **Mandatory:** per-file/specific-set grants for team/expert/client where selected, with revoke/expiry/logging; never only hide UI menu. Re-read content with appropriate tools and preserve original.
- **HOLD other team:** antivirus/malware service and actual external bank/email/confirmation delivery.
- **Acceptance:** missing/corrupt/invalid/denied/changed/restarted document, scoped return, necessary positive reply, evidence-to-final-sufficiency case.
- **Crosswalk:** RW08/RW13/RW14/RW26(HOLD).

### D07 Programmes, sampling and substantive execution — all applicable audit methods
- **Keep:** current approved programmes, tailored actions, actual work/review, unbiased HMAC sample, unique units, signed test differences, bounded ratio projection, expansion and whole-journal detection.
- **Mandatory:** research and approve method support matrix under ISA 530, ISA 500, 520 and applicable firm policy; include random/nonstatistical/statistical design distinctions, stratified and monetary-unit methods *where source/approved offering requires*, sample-size decisions as approved inputs/algorithms, tested specifics vs projected residuals, negative/mixed sign, zero denominators, unavailable tests, revised designs, replacement controls and transparent non-evaluable outcomes.
- **Mandatory:** complete 3.3.1 native schedule parity, A13 journal/analytical/inventory execution, evidence links, risk reassessment, findings and independent review.
- **No automatic selection of an unsupported sample size or confidence claim.**
- **Crosswalk:** RW15/RW16/RW17/RW34/RW35.

### D08 All 22 audit areas and 58 original automation minimums — highest functional effort
- **Mandatory coverage for each original fieldwork variant P09-UC02-V01–V22:** mapped source procedure and assertion, applicable source and method, required inputs, executable calculation where promised, manual/specialist judgment path where professional, normal/exception/missing/changed/denied scenarios, G05 finding and review/export.
- **Method groups (apply appropriate framework and licensed/approved texts):**
  1. Intangibles/PPE: recognition candidate, component vs simple charge, additions/disposals, methods, impairment, revaluation, useful life, asset-register movement.
  2. Investment/financial instruments/long-term receivables: classification evidence, effective interest, amortized cost, allowances/ECL, valuation inputs and unsupported specialist decisions.
  3. Inventory/COS: physical count, movements/transfers/cut-off, FIFO and weighted average where applicable, production/overhead variants where source requires, NRV and write-down corroboration.
  4. Receivables/revenue/deferred revenue: aging, cash application, contract cut-off, returns/credit notes, pricing, IFRS 15 method families where applicable.
  5. Procurement/payables/accruals: source purchase-order/receipt/invoice/payment lines, unrecorded liabilities, duplicate exposure, period allocation and disputed items.
  6. Cash/borrowing/finance/lease/FX: bank matching, payment indicators, interest and covenant, lease liability/ROU schedules, actual supported currency rates and translation.
  7. Payroll/tax/equity: payroll categories and applicable deductions, VAT/WHT/CIT, equity movement, declarations and legal-source status; do not pretend synthetic tax rates are law.
  8. Related parties/estimates/group: identified parties, estimate matrices and supporting assumptions, component instructions, elimination and translated consolidated result, supplied valuations and unconfirmed ownership.
  9. Operating expenses/other income/OCI/finance: classification, allocations, unusual transactions, supporting documentation.
- **All 58 original AUTO-001–058 minima** require own test/decision register. Do not assume 19 G11 method profiles fully close their minima. Separately keep 58 AUTO-FUTURE proposals pending and selectively approve only those that fill a core audit requirement or produce clear additional value.
- **Deliverable:** signed source-method/variant matrix with explicit supported coverage; no invented automatic recognition/fair-value/fraud judgment.
- **Crosswalk:** RW17–RW21/RW34/RW36/RW37(only audit-critical overlap).

### D09 Findings and audit completion — finish exact branches
- **Keep:** actual matter/finding, signed exposure, distinct management agreement/verified correction, partial posting, anti-duplicate projection, eight final assessments.
- **Mandatory:** complete A19–A24/A30 correction failures, revised/prior-period/qualitative effects, multiple currencies under approved rate/basis, missing representation, notes and other-info differences, changed reporting date, legal/going-concern/subsequent-event updates and consequences.
- **Auditor certifies disclosures and sufficiency.** The software supplies evidence-based applicability checklist, unresolved exception flags, reviewer decision and source/version record; do not build a universal "supermind" making professional conclusions.
- **Acceptance:** monetary and nonmonetary, zero/unknown, partially corrected, conflicting currencies, report effects, all persisted.
- **Crosswalk:** RW21–RW23/RW34/RW35.

### D10 Roles, review and quality — configurable controls, fixed duties
- **Build generic roles/settings** from a *fixed, comprehensible permission vocabulary*: create "lawyer", "valuation specialist", "senior auditor", etc.; select view/upload/comment/prepare/review/assign/access class; grant person+engagement+document scopes, dates and reasons; assign several staff to work.
- **Non-togglable invariants:** cannot approve own authored work, bypass required professional EQR/quality, bypass legal blockers, impersonate an actor, change signed history or get cross-client access. Grant administrator/policy changes require elevated authorization and append-only change log; privileged role changes cannot retroactively approve an old report.
- **Audit-critical:** full consultation/disagreement, review-note anchors, reviewer replacement/refusal, ordinary review versus EQR, late/stale quality, assignment changes; required professional judgments remain human.
- **Acceptance:** custom lawyer role reads granted documents, records legal opinion, cannot approve final opinion; revocation blocks all direct access; old work persists; self-review denied.
- **Crosswalk:** RW08/RW09/RW24/RW31/RW33(selected role boundary).

### D11 Report opinions and report release — opinion logic mandatory, signing provider deferred
- **Mandatory:** support all applicable source opinion branches under ISA 700/705/706/701/570 and required specialized forms; particularly multiple simultaneous known errors/evidence limitations and complex combinations; separate the actual auditor decision from structural opinion compatibility.
- **Template wording:** senior/authorized professional selects and approves report instance, with exact source/jurisdiction/edition and review. Software doesn't silently author legally final prose.
- **Keep** exact statements/notes/report hashes, local signing/receipt and report-date/source impact. **HOLD** real external signature and dispatch provider.
- **Acceptance:** approved known vs possible effects, materiality/pervasiveness, modified-opinion combinations, wording, EQR preconditions, stale/reissued reports and authorized local handoff.
- **Crosswalk:** RW23–RW27/RW35.

### D12 Later facts, assembly, retention, custody and inspection — keep full original audit scope
- **Mandatory:** dual dating and limited-procedure alternatives after authorized professional method decision; full redating remains supported.
- **Mandatory:** source-backed retention policy and holds, inherited deadlines, actual assembly/custody/retrieval/inspector receipts and amended successors, corruption/readability, recovery/rollback and adversarial retroactive modification cases.
- **Real storage/disposal:** design the authoritative retention/disposal contract and test selected actual storage/replicas/backups with operating owner; never implement silent expiry deletion. Where storage/provider infrastructure belongs to other team, do not mark it completed until real evidence is available.
- **Postarchive recommendation-follow-up:** separately authorized service if chosen; do not compromise sealed FS-audit file.
- **Acceptance:** all relevant A27/A28 cases, real holds, scope grants, date/copy lineage, denied backdating, approved removal effects and residual-copy reconciliation.
- **Crosswalk:** RW27–RW30/RW32/RW33.

### D13 UI, ERD, release validation — keep existing UX and runtime
- **Keep** current shared enterprise workspace, audit process desks, G00 protected records and G09 named local identities; no wholesale redesign or replatform.
- **Mandatory:** source-action coverage in current UI, full role-specific workpaper usability, conditional/long tables, keyboard/focus/readability and affected legacy capabilities.
- **Mandatory:** exact conceptual ERD to runtime/command mapping, split allocations, many assignees, reviewer conflicts, immutable history, source IDs and concurrency. No schema rewrite without demonstrated functional or integrity need.
- **Mandatory for release:** representative data-volume/concurrent usage tests, restore/recover/restart, secure production passwords/MFA/TLS as selected, owner-supported deployment/monitoring, independent source and operational acceptance against exact release commit.
- **Crosswalk:** RW31–RW36/RW39/RW40.

## 5. Audit-first implementation waves — concrete outputs and gates

**W0 — Baseline, scope and hard-blocker research (foundation, short and parallelizable).**
- Deliver: signed applicability/edition matrix for ISA/IFRS/accounting policies by period; source-variant register with Stage 2 image/edition issue; source procedure->capability->method/test map; hard-blocker catalogue with verified/needs-professional-confirmation states; separate HOLD owner queue; exact core/conditional offering disposition.
- Gate: no pretending source conflicts or unknown local law are resolved. Audit method implementers may proceed with separately approved, versioned examples.

**W1 — Native forms + data-contract foundation.**
- Deliver: form-family schema, per-form semantic crosswalk and export plan; controlled Excel/CSV ingestion profiles; required import/field contracts; 20 DEP-C reviewed separately; all required controlled account allocation structures and statement/ledger reconciliation.
- Gate: actual original/approved data, unknowns, row totals, split allocation, currency/unit and change impact; full relevant structural and semantic acceptance, not 70 green roundtrips alone.

**W2 — Audit plan, risk, controls and sampling.**
- Deliver: complete A01–A12 applicable paths with risk/response/controls and approved independence/materiality; method catalogue for sample selection, eligible groups, tested-unit differences, supported projection, analytics, journal investigations and source form 3.3.1.
- Gate: new/continuing client, adverse independence, control failure, revised materiality, sample method incompatibility, exception and changed evidence all flow correctly.

**W3 — Evidence and all 22 fieldwork areas, developed as vertical slices.**
- Deliver: A13–A18 branch packs; every variant V01–V22, automated method where promised, manual judgment where necessary; all 58 minimums individually reconciled; original workbook/guide and IAS/IFRS policy references attached.
- Recommended implementation groups in parallel: revenue/receivables/cash; procurement/payables/inventory; assets/lease/borrowings/FX; payroll/tax/equity/other; estimates/related parties/groups.
- Gate per variant: source procedure, input, normal, exception, unsupported, missing, denied/self-review, new source and G05 handoff. No "generic manual record" masquerading as automatic procedure.

**W4 — Findings, completion and quality.**
- Deliver: complete A19–A25/A30 source cases, verified corrections, signed and unknown exposures, multi-currency approved methods, disclosures and other-info checklist with **auditor** conclusion, consultation, complex group/legal/going-concern and EQR.
- Gate: all findings and limitations reach current review/report consequences; professional and reviewer identities distinct.

**W5 — Opinions, issuance, later facts and file controls.**
- Deliver: complete A26–A28, multiple-cause opinions, source-bound wording approved by senior, full redating + approved dual dating, archive custody, retention, holds, inspection/recovery; separate provider-dependent tasks.
- Gate: no opinion without supported current completion/quality; no old signature on changed report; no phantom remote delivery; no archive overwrite or unauthorized deletion.

**W6 — Cross-domain E2E and independent source acceptance.**
- Deliver: source-by-source exact 51-lifecycle dispositions (mandatory A-series as applicable; B audit-facing obligations; C separate), all 1,012 BPMN entries reviewed for owning action/branch, all 2,247 obligations linked to evidence and decision; actual auditor usability sessions.
- Gate: executable supported full-source journeys and independent owner/reviewer acceptance for required audit scope; unresolved required gaps block release. Optional scenarios have justified applicability/scope decisions, not fake closed statuses.

**W7 — Production hardening and integration-team handoff.**
- Deliver: account/permission migration, realistic workload/security/recovery goals, deployment, operational runbook and release evidence; external provider contracts and stub/manual boundary handed to designated teams.
- Gate: selected deployment profile meets its approved operating targets. No claim of finished external integrations unless provider effects are actually verified.

### Parallel team ownership (roles, not fabricated named staff)

| Owner | Work | Independence/control |
|---|---|---|
| Audit product/methodology lead | Scope, procedure meaning, priority, approved method coverage, conflicts | Cannot substitute own engineering check for professional acceptance |
| Practicing auditor/source reviewer | Audit-method approval, real source scenarios, signed interpretations, audit-user acceptance | Must be distinct from developer and as required from work author |
| BA/domain analyst | Form/flow/process mapping, requirements, user narratives, crosswalks, exception cases | All decisions grounded to exact source IDs |
| Domain engineer | Extend existing commands/data models, calculations, role/config UI, tests | Cannot invent law/rates/professional acceptance |
| QA/test engineer | Independent expected examples, failed/denied/change/restart and E2E proof | Evidence matches exact build and source versions |
| Integration/security/operations team | ERP, signing, external channels, file scanning, production access and storage | Separate explicit provider/operational acceptance |

## 6. Requirements mapping (preserve old RW IDs)

| New handling | Original work-group IDs |
|---|---|
| Core source and methodology decisions | RW01 RW02 RW03 RW04 RW05 RW06 RW39 |
| Core audit intake/planning | RW10 RW11 |
| Core data, evidence and execution | RW12 RW13 RW14 RW15 RW16 RW17 RW18 RW19 RW20 RW21 |
| Core completion, opinion, archive | RW22 RW23 RW24 RW25 RW27 RW28 RW29 |
| Enabling team/role/security | RW08 RW09 RW31 RW33(selected) |
| Core traceability and audit acceptance | RW34 RW35 RW36 RW40 |
| Operational release | RW32 RW33 |
| HOLD integration team | RW07(external portion) RW26 |
| Conditional product decision | RW30(postarchive service) RW37 RW38 |

Every RW01–RW40 remains linked. When dividing a mixed work group, preserve each original task and attach new disposition per *subrequirement*. **Do not mass-defer an audit-critical child simply because another child is external or product-optional.**

## 7. Definition of done for each actual audit capability

A slice is finished only if:
1. Original **source ID + exact edition/locator + period/framework applicability** and requirement interpretation are recorded.
2. AS-IS command, observed behavior, unsupported boundary and intended TO-BE behavior are stated.
3. Authored source -> correct input contract -> actual action -> result -> conclusion/next work -> reviewer -> downstream dependent action can run using persisted records.
4. Quantitative rules have **independently computed** expected cases; legal/rule/questionnaire cases have signed applicability/professional interpretations. Zero, null, negative, wrong sign, multi-currency, missing, duplicate and stale-source conditions receive explicit treatment as applicable.
5. Tests prove normal, meaningful exception, unsupported/missing, unauthorized/self-review, changed source, historical preservation and restart/retry. No self-approval, double exposure or phantom evidence.
6. A form visually/semantically expresses each applicable source field and can export the required supported output; unsupported legacy format is tracked with accepted variance.
7. Appropriate independent practicing-auditor/source acceptance is attached to the **exact build/test/source**. QA passing is not professional adoption.
8. Original IDs and unaffected previous work remain intact. Required source gaps cannot be closed by "form exists", "manual explanation exists", "automated method shares a name" or "137 tests passed".

## 8. Source-version and research watchlist — verified as of 19 November 2026

- **IAASB 2026 Handbook** released; includes ISA 240 (Revised) and ISA 570 (Revised 2024), effective for audits of financial statements for periods beginning **on or after 15 December 2026** internationally. Adoption/effective rule in Mongolia must be separately approved. Keep both pre-/post-effective method editions rather than replacing all earlier engagements.
- **IFRS 18** replaces IAS 1 and is effective for annual reporting periods beginning **on or after 1 January 2027**, early application permitted. Include FS presentation/disclosure source-version impact in D03/D05/D09.
- **ISA 330/500/520 proposals (Aug 2026)** are *exposure drafts*, not assumed effective binding rules. Track until final issuance/adoption, but do not code them as enacted standards.
- **Role configuration:** OWASP advocates default-deny and object-level checks; NIST recognizes static/dynamic separation of duty. Flexible "lawyer" role is supported as restricted permissions, not an unrestricted universal action toggle.
- **Accounting methods:** IAS 2 official overview supports FIFO or weighted-average cost models where appropriate; IFRS 9 covers ECL, IFRS 15 revenue and IFRS 16 leases. Adopt exact current edition and independently check each approved method, not unsourced illustrative formulas.

Official source URLs (public reference; they do not themselves certify local adoption):
- IAASB 2026 Handbook: https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance
- ISA 240 revised: https://www.iaasb.org/publications/isa-240-revised-auditor-s-responsibilities-relating-fraud-audit-financial-statements
- ISA 570 revised: https://www.iaasb.org/publications/isa-570-revised-2024-going-concern
- IAASB ISA 330/500/520 exposure draft: https://www.iaasb.org/publications/proposed-revisions-audit-evidence-risk-response-isa-330-isa-500-isa-520
- IFRS 18: https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/
- IAS 2: https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/
- IFRS 9: https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/
- IFRS 15: https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/
- IFRS 16: https://www.ifrs.org/issued-standards/list-of-standards/ifrs-16-leases/
- OWASP Authorization: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- NIST Separation of Duty: https://csrc.nist.gov/glossary/term/separation_of_duty

## 9. Specific next engineering task pack (start here)

1. **Research/BA:** Build canonical original-source procedure inventory and applicability/source-edition decision sheet, starting A01–A03, A06–A08, A11–A13, A19–A20 and A26. Identify open source clashes; validate Stage 2 pictured/book content manually rather than inventing a source workbook.
2. **Forms engineer + BA:** Create form-family contracts and source-to-runtime fidelity checklist, select one representative form of each family and close its accepted full journey before generalizing.
3. **Accounting/data engineer:** Specify controlled source import family; implement/test split allocations and linked statements on a realistic synthetic GL/TB dataset, with change and independent-review behavior.
4. **Audit domain engineer:** Finish one **revenue/cut-off** complete vertical slice from approved risk -> source population -> exact approved method -> tested-unit work -> findings -> current completion -> report consequence. Reuse G11 sales/aging/related methods instead of duplicating.
5. **Team/permissions engineer:** Draft action dictionary and SoD invariants; implement multiple assignees, authorized senior reassignments and scoped lawyer/specialist example; independently validate revocation.
6. **QA + auditor:** Sign off each representative slice against the exact source, actual UI and engine before batch replication; start reconciliation of 20 DEP-C links alongside slices.

**No unsourced percentage-complete, timeline, budget or assignment is proposed.** The next detailed sprint tickets should be sized only after this first source/method/scenario triage.

## 10. Remaining decisions needing authorized confirmation, not fabricated engineering answers

- Which Mongolian legal sources/editions constitute **nonwaivable blockers** for which entities/periods? Unknown is not accepted as an unconditional positive.
- Which audited reporting frameworks must first be covered (e.g., full IFRS, other accepted entity types), and which specialized statutory/tax method packs are actually required?
- Which sampling/statistical methods must be native in first scope and what constitutes an accepted manual/specialist alternative?
- Which exact Excel/Word outputs, print layouts and file families are mandatory versus accepted controlled exports?
- Which confidential specialists may receive whole-engagement-selected documents and who authorizes the scope?
- Which production hosting/storage/signature/delivery providers and actual retention/disposal operations will designated teams ultimately use?
- Which B-series audit-facing firm quality requirements are needed for defensible audit operations; which wider B-series/C-series offerings are deferred?

**Change-control rule:** These are *decision records*, not grounds to block all independent audit-core implementation. Scope for a work slice can proceed under a signed, explicit method/edition assumption until an affected blocker is resolved.

---

**Provenance and release note:** This is a priority reset over a recorded G11 engineering baseline. It does not change code, running data, source workbooks, original requirement status, legal authority, professional approval or `releaseReady`. The original consolidated register remains authoritative as a historical as-is/gap inventory; this document is the proposed new **execution order and design policy**.
