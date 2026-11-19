# Full audit: researched implementation design and execution plan

**Decision:** implement the complete financial-statement audit scope across Stages1–5 through bounded, reviewed capabilities. The earlier assignments are now translated into specific design choices, data contracts, implementation steps, discriminating expected cases and an end-to-end batch plan.

**As of:** 19 November2026. **Method:** requirements engineering, standards traceability, method specification and risk-based acceptance. All engineering recommendations below are **author-design inferences** from the exact source assignments, observed current code and the evidence register; they are not assertions that standards prescribe these fields or that an auditor approved them.

**Deliverable boundary:** this batch researches/specifies how to implement and validate the whole scope. It does not modify application behavior, conduct interviews, execute production operations, certify all accounting models, fabricate approvals or mark source obligations accepted. Task design completion and actual implementation/acceptance have separate states.

## 1. Read this plan and use its decisions

Use each domain card as a bounded implementation ticket: proposed decision -> ordered change -> fields -> expected cases -> exact original task/method/source links. Use method cards for deterministic logic and supported/unsupported boundaries. Use every original variant/minimum/dependency card, not just a representative sample. Execute batches B00–B14; B07–B11 are independent after B06 when actual team capacity permits.

D01/D02 completed research is carried forward intact. Settled available-workbook acceptance and the Mongolian ISA2020 compilation with integrated ISQM1/2/revised ISA220, plus local ethics basis, are not reopened. Later international editions remain separately selected profiles. Per-engagement judgments are defined product records rather than unanswered software-design questions.


**Pinned starting commit:** `9f0685793cfbf1afda3d32166b9849a5cb4180f6`. All counts below are scope/coverage counts, never product-completion percentages.

| population | count |
| --- | --- |
| Domain task cards | 60 |
| Method cards | 36 |
| Original fieldwork variants | 22 |
| Original automation minimums | 58 |
| Confirmed dependencies | 20 |
| Source form contracts | 70 |
| Existing candidate semantic fields | 1236 |
| Original implementation tasks routed | 128 |
| Original obligations routed | 2247 |

## 2. Engineering decisions and sequence

- Extend the current G01–G11 owning records/commands. Preserve original IDs, raw bytes, historical work/reviews and exact report/archive lineage. Schema changes are targeted deltas, not a replacement architecture.
- Keep separate: accounting recognition/measurement; audit procedures; deterministic calculation; professional judgment; evidence acceptance; independent review; release authority. A correct calculation does not establish a correct audit conclusion.
- Use typed unknown/zero/false/N/A states; explicit entity/period/currency/scale; integer minor units or declared decimal precision; half-away-from-zero final rounding where selected. Intermediate ratios retain precision; no unexplained balancing plugs or broad netting.
- Use all60 task designs and36 method cards. Required native automation is implemented where promised. A supported manual professional procedure records actual work and review; it does not silently replace a promised native calculator.
- Actual rate/life/framework/recognition/retention choices are versioned inputs with authority, rationale, scope and reviewer. No invented Mongolian tax rates, universal sampling size, depreciation life or numeric audit-quality score.
- External ERP/credential/dispatch/signature/scan services stay separately owned. Required v1 manual import, controlled packet exchange, actual dispatch evidence and verification routes remain concrete and usable.


### Research conclusions that change the implementation

| domain | existing | delta | evidence |
| --- | --- | --- | --- |
| D01 | Acceptance/continuance/terms and activation controls;completed D01 research | Implement exact D01 blocker/question/import handoff;retain manual legal judgments | results/D01/AS_IS_and_Engineering_Tickets.md |
| D02 | Named identities but fixed capacity seats;single owner/reviewer;actual time;completed D02 design | Many-person appointments,scenarios,credential facts,selected expert packet | results/D02/AS_IS_and_Engineering_Tickets.md |
| D03 | 70 catalogue form contracts,typed roundtrip,controlled methodology adoption,HTML exports | Semantic source reconciliation,native XLSX/DOCX,exceptional families,all20 dependencies | scripts/pilot-forms.mjs;scripts/pilot-workpaper-export.mjs |
| D04 | Risk/controls/planning/materiality and conditional contributor records | Complete actual source branches and edition-specific method/response impact | scripts/pilot-planning.mjs;scripts/pilot-materiality.mjs |
| D05 | Controlled CSV,full-source bridges,bounded methods,one primary statement destination | Controlled XLSX,split allocations,separate reference graph,versioned method extensions | scripts/pilot-data-methods.mjs |
| D06 | Purpose-specific evidence,requests,manual confirmation records and local response link | Selected content inspection,fine scoped document access/manual packet,all adverse branches | scripts/pilot-evidence.mjs;scripts/pilot-confirmations.mjs |
| D07 | Actual programme execution,unbiased reproducible selection,restricted point projection,journal candidates | Size/evaluation method contracts,unsupported-design routes,native sampling parity | scripts/pilot-execution.mjs;scripts/pilot-sampling-v2.mjs |
| D08 | 22 area-work records and58 minimum locators;bounded G10/G11 profiles | Complete each real source procedure/method/exception and independent acceptance | docs/research/g10-fieldwork-areas-2026-11-18.md;docs/research/g11-automation-methods-2026-11-18.md |
| D09 | Canonical finding/correction,partial-posting verification,eight final assessments | All branches,signed/multi-currency boundaries,disclosures and qualitative/prior effects | scripts/pilot-completion.mjs;scripts/pilot-finalisation.mjs |
| D10 | Named grants,ordinary/formal quality distinction,actual consultation and reviewer notes | Curated configurable permissions across all routes,audit-facing monitoring/remediation | scripts/pilot-identity.mjs;scripts/pilot-oversight.mjs |
| D11 | Five single-cause opinion cases;combined material causes rejected;exact local signed issue package | Professional multi-cause route,reviewed local/native wording,full recipient/amendment cases | scripts/pilot-reporting.mjs:opinionContradictions |
| D12 | Full-redating later-fact paths,assembly/custody/holds and local recovery;dual dating denied | Conditional limited-procedure/dual-date branch,real-format inspection,operating storage/disposal | scripts/pilot-later-facts.mjs;scripts/pilot-archive-controls.mjs |
| D13 | Current workspace,scoped SQLite snapshots,local named accounts and bounded rehearsals | Targeted ERD/UI changes,representative measured operating profile,whole-source acceptance | scripts/pilot-store.mjs;docs/research/g09-local-access-operations-2026-11-18.md |

The fresh source census classifies all272 actual formula expressions as previous-row-plus-one presentation sequences. This does not establish that audit arithmetic is unnecessary: the real calculation contracts come from substantive requirements, approved accounting policies and the M packs. Validation definitions, semantic fields, source cells and required audit rules are different populations. The1,236 fields listed here are existing source-catalogue candidates, not a claim to enumerate every dynamically extended runtime field.


### Shared typed run, review and handoff contract

`methodId`, `algorithmVersion`, `inputSchemaVersion` and `policyVersion` are immutable identifiers. `engagementId`, `entityId` and the reporting-period dates define scope. Each source use stores original ID, revision, hash and row/page/cell anchor. Money stores signed integer minor units plus explicit currency and scale; quantity and rates use a declared decimal/rational representation and unit. A missing value is null with a reason, not zero. Calendar dates and instants have separate types/time-zone rules. Repeated rows have durable IDs.

Each run stores typed parameters and their authority, input basis, output rows/totals, signed differences, nonadditive reference links, exception codes, unsupported conditions and completeness state. Output state distinguishes draft, incomplete, computed-with-exceptions, submitted, returned, reviewed-usable, reviewed-with-limitations and stale. A limit is retained alongside its authorized use; limited work cannot silently satisfy a prerequisite requiring a usable complete population. Examples are synthetic expected cases until actual app execution is recorded.

Preparation, submission, independent return/approval and source-change impact are separate events with actor and timestamp. Review pins the exact content/input/method/policy digest. The same idempotency key and same canonical payload returns the earlier result; changed payload is rejected. Concurrent save requires the expected current revision. Exact source changes create a successor and targeted reassessment, preserving prior outputs and reviews. A calculation creates an investigation candidate; an attributable evaluation creates or links the canonical finding. No calculator posts a correction, clears a note, chooses an opinion or issues a report.

All permissions are enforced on actual server actions and file representations. Configurable role bundles remain subject to current identity, scope, appointment, object version, state and independent-duty checks. Native exports carry actual source/method/work/review versions and limitations; generating an export creates no new audit approval.


| batch_id | title | dependencies | deliverables | owner_capacity | exit_criteria |
| --- | --- | --- | --- | --- | --- |
| B00 | Pin settled baselines and complete inventory |  | D01 resolved profile/source;working census;exact original-ID manifest;isolated baseline | Baseline/schema owner + BA | No historical workbook/adoption re-investigation;all original sets accounted for. |
| B01 | Shared semantic/typed/method contracts | B00 | Field/row identity;typed imports;method-run schema;primary allocation/reference distinction | Architect + source BA | Unknown/zero/N/A preserved;history/compatibility plan and exact expected examples. |
| B02 | Named multi-person assignment and scoped authority | B00 | Use completed D01/D02 handoffs;many assignees;credential/manual expert packet;server action dictionary | Engineer + security/source reviewer | Multiple people/two engagements;transfer/revoke/self-review cases;past authorship retained. |
| B03 | Form families and native exports | B01 | 70-form/field crosswalk;family adapters;XLSX/DOCX;all20 typed dependencies | Source-form engineer + auditor/export reviewer | Family normal/adverse and every exceptional form;source/reader observations remain separately recorded. |
| B04 | Population, mappings and method runtime deltas | B01 B02 | Controlled XLSX;full-source bridges;split primary allocation;method policy/currentness;derived inspection | Data engineer + QA | Reconciliation,missing/quarantined/scale,concurrent edit,retry,history and exports pass. |
| B05 | Planning, controls, materiality and sampling | B01 B02 B04 | Risk/assertion links;D&I/OE separation;M03;M04-M08;approved size/projection boundary | Audit-method analyst + engineer | Independent expectations and risk-failure/sampling-error paths;no unsupported confidence claim. |
| B06 | Revenue/cut-off/receivables complete slice | B03 B04 B05 | V05/V16;AUTO011-015,047-048;confirmation;finding/correction;completion;report/archive consequence | Area engineer + reviewer + QA | Both normal and material/unresolved end-to-end paths on exact originals/actors/versions. |
| B07 | Purchases,payables,prepayments,expenses | B06 | V07/V10/V11/V19;M12/M19/M31;AUTO016-019;related source procedures | Area engineer + source auditor | Complete obligations/cut-off/accrual/correction path per variant;not calculation-only. |
| B08 | Cash,inventory and cost of sales | B06 | V04/V08/V17;M13-M16;AUTO020-026;actual count/ownership and evidence | Area engineer + source auditor | Count-date/transfer/unit/NRV cases and full findings-to-completion handoff. |
| B09 | PPE,intangibles and capitalization | B06 | V01/V02;M17-M19/M25;AUTO027-030;finite/indefinite life and actual recognition work | Area engineer + source auditor | Partial-period/component/disposal/impairment boundary cases;native schedule parity. |
| B10 | Payroll,tax and equity | B06 | V14/V15/V18;M26-M29;AUTO031-035/039;effective-dated approved local parameters | Area engineer + accounting/legal parameter reviewer | Bracket/cap/period/current-deferred/distribution cases;no fictional rate adoption. |
| B11 | Finance,investments,FX,leases and group | B06 | V03/V06/V09/V12/V13/V20/V21/V22;M10/M20-M25/M30;AUTO036-043 | Finance/group analyst + engineer | Contract/EIR/lease/FX/ECL/scope/elimination cases;unmatched residuals and specialist work retained. |
| B12 | Full completion,quality and all report outcomes | B06 B07 B08 B09 B10 B11 | M31-M33;AUTO044-057;representations,other information,EQR,combined opinion causes,wording/native package | Completion/report engineer + authorized auditor | All required matters and source branches;exact artifacts and EQR timing;no blanket sign-off. |
| B13 | Later facts,dual dating,custody and inspection | B12 | M34;AUTO058;conditional restricted amendment;assembly/retention/holds;inspection/manual handoff | Archive/report engineer + custody owner | Before/after issue/lock paths;prior artifacts immutable;readable recovery and denied access. |
| B14 | Whole-scope source and operating acceptance | B03 B12 B13 | All128 tasks/2247 obligations dispositioned;70forms,22variants,58minima,20dependencies;operating profile | QA + actual independent auditors + operating owner | Required engineering/source/professional/operating gates genuinely accepted;releaseReady remains false until then. |

### Batch operating procedure and closure

For every batch: pin the input build/source/method versions; inspect the listed owning code; implement only the documented delta; run its literal expected and meaningful adverse cases; exercise actual UI/direct commands/exports and history; record independent source/practitioner acceptance separately; reconcile original IDs; publish verified authored work to the development branch. No automatic main merge or deployment. A dependency requires the earlier outputs needed by that slice; it does not require unrelated domain-wide acceptance first. B14 does require every selected batch output and applicable original item, including the remaining forms and branches.

Before sizing, the engineer breaks a card into schema, command, UI/export and verification changes using its listed fields/cases. Estimate with actual implementers after that inspection. No arbitrary sprint date, team count or staffing forecast is asserted here. If a policy fact is unavailable, implement its explicit missing-state/manual decision path and guard the affected professional action; continue unrelated work.

Engineering exit requires actual observed outcomes on the exact build. Source-semantic exit requires the actual auditor comparing source work/output. Professional exit requires actual authority for method/policy judgments. Operating exit requires measured workload/recovery/security evidence in the selected environment. Passing this document's validator proves coverage and consistency only.

## 3. Domain-by-domain implementation cards


### D01 — Client acceptance and independence

Carry forward [completed D01 results](../D01/README.md), its resolved contracts, cases and engineering handoff. No replacement or new approval claim.

#### R-D01-01 — Determine standards and entity applicability

**Proposed implementation decision:** Reuse the completed D01 research specification and its resolved decisions; engineering remains to implement its actual handoff.

**Original question:** Which framework, audit edition, ethical edition and entity classifications govern this engagement?

**Prerequisites:** None beyond the pinned baseline. **Original work groups:** RW02 RW06 RW07 RW10 RW34 RW35. **Methods:** M36.

**How to implement:**

1. 1. Inspect original A01–A03, client/terms commands, source decisions and guidebooks; distinguish engagement acceptance from contract signing and activation.
2. 2. Retrieve official standard texts and adoption instruments for the selected period; obtain entity facts needed for listed/PIE/public-sector/SME classification.
3. 3. Record international effective rule, local adoption evidence and firm policy separately. Escalate conflicts rather than selecting the newest PDF.

**Data/record contract:** Use exact D01 published field/authority/method contracts.

**Discriminating expected cases:**

- Two engagements with different periods retain different editions; unknown classification cannot silently choose a less demanding rule.

**Owning paths:** `results/D01/README.md`.

**Evidence/context:** D01-LOCAL-LAW. **Original broader standard candidates:** ISA 200, 210, 220, 230, 250; ISQM 1; applicable IESBA Code Parts 1, 3 and 4A; verified Mongolian audit/licensing law.

**Accountable capacities:** BA + audit methodology lead; independent review:Authorized practicing auditor; local legal reviewer for legal rows. Actual names remain unassigned; no signature is implied.

#### R-D01-02 — Research absolute blockers and review-only conditions

**Proposed implementation decision:** Reuse the completed D01 research specification and its resolved decisions; engineering remains to implement its actual handoff.

**Original question:** Which restrictions are nonwaivable, and which require investigation or safeguards?

**Prerequisites:** R-D01-01. **Original work groups:** RW02 RW06 RW07 RW10 RW34 RW35. **Methods:** M36.

**How to implement:**

1. 1. Extract candidate conditions from ISA 210, applicable independence sections and verified local licensing/prohibition provisions.
2. 2. For each condition write facts required, source paragraph/article, effective dates, affected action and permitted resolution authority.
3. 3. Classify block / requires professional review / informational; challenge with contrary exceptions, continuance, withdrawal and missing evidence.

**Data/record contract:** Use exact D01 published field/authority/method contracts.

**Discriminating expected cases:**

- Prohibited positive acceptance fails; unresolved evidence allows drafting but cannot support positive acceptance; changed evidence renews the decision.

**Owning paths:** `results/D01/README.md`.

**Evidence/context:** D01-LOCAL-LAW. **Original broader standard candidates:** ISA 200, 210, 220, 230, 250; ISQM 1; applicable IESBA Code Parts 1, 3 and 4A; verified Mongolian audit/licensing law.

**Accountable capacities:** BA + audit methodology lead; independent review:Authorized practicing auditor; local legal reviewer for legal rows. Actual names remain unassigned; no signature is implied.

#### R-D01-03 — Complete source acceptance and continuance branches

**Proposed implementation decision:** Reuse the completed D01 research specification and its resolved decisions; engineering remains to implement its actual handoff.

**Original question:** What exact work, evidence and decision precede acceptance, decline, amendment and withdrawal?

**Prerequisites:** R-D01-01 R-D01-02. **Original work groups:** RW02 RW06 RW07 RW10 RW34 RW35. **Methods:** M36.

**How to implement:**

1. 1. Trace every A01–A03 source step and gateway to actors, records, reason and downstream activation.
2. 2. Inspect ethical threats, predecessor communication where applicable, management responsibilities, preconditions and changes in terms.
3. 3. Design conditional acceptance only where permitted; distinguish missing information from an accepted engagement.

**Data/record contract:** Use exact D01 published field/authority/method contracts.

**Discriminating expected cases:**

- No activation before current attributable decision and terms; later change preserves original period and starts a new review.

**Owning paths:** `results/D01/README.md`.

**Evidence/context:** D01-LOCAL-LAW. **Original broader standard candidates:** ISA 200, 210, 220, 230, 250; ISQM 1; applicable IESBA Code Parts 1, 3 and 4A; verified Mongolian audit/licensing law.

**Accountable capacities:** BA + audit methodology lead; independent review:Authorized practicing auditor; local legal reviewer for legal rows. Actual names remain unassigned; no signature is implied.

#### R-D01-04 — Specify bounded client-master import

**Proposed implementation decision:** Reuse the completed D01 research specification and its resolved decisions; engineering remains to implement its actual handoff.

**Original question:** Which client facts can be safely collected through Excel/CSV now?

**Prerequisites:** R-D01-01. **Original work groups:** RW02 RW06 RW07 RW10 RW34 RW35. **Methods:** M36.

**How to implement:**

1. 1. Inventory fields actually consumed by acceptance and terms; label required/optional/conditional and source provenance.
2. 2. Define identifiers, duplicate resolution, preview, correction, reviewer acceptance, historical addresses and changes.
3. 3. Compare existing G03 import patterns before proposing new records; document external registry/API boundary.

**Data/record contract:** Use exact D01 published field/authority/method contracts.

**Discriminating expected cases:**

- Duplicate IDs, conflicting masters, wrong entity, null versus zero and partial imports produce explicit outcomes.

**Owning paths:** `results/D01/README.md`.

**Evidence/context:** D01-LOCAL-LAW. **Original broader standard candidates:** ISA 200, 210, 220, 230, 250; ISQM 1; applicable IESBA Code Parts 1, 3 and 4A; verified Mongolian audit/licensing law.

**Accountable capacities:** BA + audit methodology lead; independent review:Authorized practicing auditor; local legal reviewer for legal rows. Actual names remain unassigned; no signature is implied.

### D02 — Staffing, capacity, credentials and specialists

Carry forward [completed D02 results](../D02/README.md), its resolved contracts, cases and engineering handoff. No replacement or new approval claim.

#### R-D02-01 — Define appointments and many-person allocation

**Proposed implementation decision:** Reuse the completed D02 research specification and its resolved decisions; engineering remains to implement its actual handoff.

**Original question:** Who may allocate, transfer, prepare and review each item across engagements?

**Prerequisites:** None beyond the pinned baseline. **Original work groups:** RW08 RW09 RW13 RW31 RW33. **Methods:** M35 M36.

**How to implement:**

1. 1. Read source role/actions and G09 grants; model engagement membership separately from work-item appointments.
2. 2. Map lead/secondary preparers, reviewer, manager and partner capacities, temporary substitutions and effective dates.
3. 3. Define transfer of open work, retained authorship, outstanding notes and conflicts after reassignment.

**Data/record contract:** Use exact D02 published field/authority/method contracts.

**Discriminating expected cases:**

- Three or more people, concurrent engagements and transfer during review preserve authorship and prohibit self-approval.

**Owning paths:** `results/D02/README.md`.

**Evidence/context:** D02-SPECIALIST. **Original broader standard candidates:** ISA 220, 230, 600, 610, 620; ISQM 1; applicable IESBA independence and external-expert provisions.

**Accountable capacities:** BA + engagement staffing lead; independent review:Engagement partner/methodology reviewer; security reviewer for grants. Actual names remain unassigned; no signature is implied.

#### R-D02-02 — Research capacity and scenario variance

**Proposed implementation decision:** Reuse the completed D02 research specification and its resolved decisions; engineering remains to implement its actual handoff.

**Original question:** What does capacity mean, and what evidence supports a staffing conflict?

**Prerequisites:** R-D02-01. **Original work groups:** RW08 RW09 RW13 RW31 RW33. **Methods:** M35 M36.

**How to implement:**

1. 1. Specify available hours, working calendars, leave, time zones, planned allocation and actual hours; define period and denominator.
2. 2. Research simple capacity/variance measures against current source requirements; do not invent utilization thresholds or quality scores.
3. 3. Model mutually exclusive scenarios, shared staff, overbooking, changed budgets and unsubmitted actuals.

**Data/record contract:** Use exact D02 published field/authority/method contracts.

**Discriminating expected cases:**

- Part-time staff, holiday overlap, zero availability, missing timesheets and changed assignments give explainable results.

**Owning paths:** `results/D02/README.md`.

**Evidence/context:** D02-SPECIALIST. **Original broader standard candidates:** ISA 220, 230, 600, 610, 620; ISQM 1; applicable IESBA independence and external-expert provisions.

**Accountable capacities:** BA + engagement staffing lead; independent review:Engagement partner/methodology reviewer; security reviewer for grants. Actual names remain unassigned; no signature is implied.

#### R-D02-03 — Specify credential evidence and expiry

**Proposed implementation decision:** Reuse the completed D02 research specification and its resolved decisions; engineering remains to implement its actual handoff.

**Original question:** What can be asserted from an uploaded qualification rather than a live issuer check?

**Prerequisites:** None beyond the pinned baseline. **Original work groups:** RW08 RW09 RW13 RW31 RW33. **Methods:** M35 M36.

**How to implement:**

1. 1. Distinguish identity, credential type/issuer/ID, expiry, scope of practice and competence evidence.
2. 2. Define self-reported / file-reviewed / externally verified as different evidence states, with evaluator and date.
3. 3. Research whether specific regulated work needs current local authorization; leave external checks with designated integration owners.

**Data/record contract:** Use exact D02 published field/authority/method contracts.

**Discriminating expected cases:**

- An uploaded CFA/CPA image never becomes an externally verified credential automatically; expired authority triggers the applicable work restriction.

**Owning paths:** `results/D02/README.md`.

**Evidence/context:** D02-SPECIALIST. **Original broader standard candidates:** ISA 220, 230, 600, 610, 620; ISQM 1; applicable IESBA independence and external-expert provisions.

**Accountable capacities:** BA + engagement staffing lead; independent review:Engagement partner/methodology reviewer; security reviewer for grants. Actual names remain unassigned; no signature is implied.

#### R-D02-04 — Research specialist appointment and confidentiality

**Proposed implementation decision:** Reuse the completed D02 research specification and its resolved decisions; engineering remains to implement its actual handoff.

**Original question:** What evidence may an expert receive, and how is the expert's work evaluated?

**Prerequisites:** R-D01-01 R-D02-01. **Original work groups:** RW08 RW09 RW13 RW31 RW33. **Methods:** M35 M36.

**How to implement:**

1. 1. Compare auditor's expert, management's expert, component auditor and internal auditor under applicable standards; do not conflate their responsibilities.
2. 2. Specify competence/objectivity/authority checks, agreed scope, limitations and audit team's evaluation of adequacy.
3. 3. Define selected-file or engagement-selected-set grants, expiry/revocation/download, opinion return and secure manual handoff.

**Data/record contract:** Use exact D02 published field/authority/method contracts.

**Discriminating expected cases:**

- Lawyer can return a legal opinion for permitted files; cannot clear audit opinion or access other clients; direct URLs fail after revocation.

**Owning paths:** `results/D02/README.md`.

**Evidence/context:** D02-SPECIALIST. **Original broader standard candidates:** ISA 220, 230, 600, 610, 620; ISQM 1; applicable IESBA independence and external-expert provisions.

**Accountable capacities:** BA + engagement staffing lead; independent review:Engagement partner/methodology reviewer; security reviewer for grants. Actual names remain unassigned; no signature is implied.

### D03 — Source forms, native outputs and dependencies

#### R-D03-01 — Resolve original-source versions and visible content

**Proposed implementation decision:** Use the available five repaired workbooks as the working comparison corpus; retain registered and working hashes independently. D01 workbook acceptance is settled. A differing hash alone does not prove missing audit logic.

**Original question:** Which exact workbook/guidebook edition is authoritative for each of the 70 forms?

**Prerequisites:** None beyond the pinned baseline. **Original work groups:** RW01 RW02 RW03 RW04 RW05 RW39. **Methods:** M01 M02 M36.

**How to implement:**

1. Read every catalogue sheet and source anchor without resaving originals
2. Classify text, figures, repeated sections, numbering expressions, operative formulas and dropdowns separately
3. Publish a per-form discrepancy list with exact source cells and a proposed mapping; distinguish an unavailable image from an empty requirement
4. Bind the selected working edition to each new template release; historical releases retain their original pins

**Data/record contract:** formId, workbookHash, sheet, cell/range, object/image anchor, sourceEdition, discrepancyClass, selectedMapping, reviewState

**Discriminating expected cases:**

- Same wording with changed formatting -> presentation difference, no invented missing rule
- A missing pictured instruction -> explicit source-review item with page/image anchor
- Earlier accepted engagement retains the earlier template after a new release

**Owning paths:** `scripts/pilot-workbook.mjs`, `scripts/pilot-methodology.mjs`, `docs/research/form-source-inventory.json`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); ENG-OOXML. **Original broader standard candidates:** ISA 230 and the standard governing each form; approved financial reporting framework; source workbook/guidebook contracts.

**Accountable capacities:** BA + form/source analyst; independent review:Practicing auditor familiar with exact source; export reviewer. Actual names remain unassigned; no signature is implied.

#### R-D03-02 — Define supported form families and native semantics

**Proposed implementation decision:** Keep constrained form families and extend the canonical semantic field contract. Tailored engagement copies must preserve source lineage and independently reviewed conclusions.

**Original question:** What must a supported form preserve beyond its appearance?

**Prerequisites:** R-D03-01. **Original work groups:** RW01 RW02 RW03 RW04 RW05 RW39. **Methods:** M01 M02 M36.

**How to implement:**

1. Assign each of 70 forms a family and list source questions, fixed clauses and repeated columns
2. Specify unknown, false, zero, N/A-with-reason, conditional requiredness and row identity per field
3. Add exceptional family extensions only where the source cannot be represented
4. Instantiate a versioned engagement copy, allow additions/removals with a reason, and retain the original master and prior reviewed answers

**Data/record contract:** fieldId, sourceCell, semanticType, unit, applicabilityRule, requiredAtAction, repeatRowId, evidenceUse, conclusion, reviewAnchor

**Discriminating expected cases:**

- Zero and No survive save/export as distinct values
- Delete an applicable mandatory procedure -> impact assessment required before submission
- Reorder repeated rows -> evidence and review remain attached to stable row IDs

**Owning paths:** `scripts/pilot-forms.mjs`, `src/data/source-registers.json`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-FORMS. **Original broader standard candidates:** ISA 230 and the standard governing each form; approved financial reporting framework; source workbook/guidebook contracts.

**Accountable capacities:** BA + form/source analyst; independent review:Practicing auditor familiar with exact source; export reviewer. Actual names remain unassigned; no signature is implied.

#### R-D03-03 — Research operative spreadsheet logic and export fidelity

**Proposed implementation decision:** Deliver native XLSX and DOCX outputs through explicit family adapters. Preserve required substantive content first; validate layout separately. Existing HTML export remains a useful reference renderer.

**Original question:** Which formulas and layouts carry actual required meaning?

**Prerequisites:** R-D03-02. **Original work groups:** RW01 RW02 RW03 RW04 RW05 RW39. **Methods:** M01 M02 M36.

**How to implement:**

1. Inventory each workbook formula and classify numbering versus audit arithmetic
2. Map each supported operative expression to a named M pack; never execute arbitrary source formula text
3. Define XLSX cells/tables/formulas/print areas and DOCX paragraphs/tables/bookmarks using template copies
4. Reopen outputs in real compatible readers and compare answers, clauses, signs, units, repeated rows, evidence and signatures against the canonical selected version

**Data/record contract:** exportId, format, templateHash, workVersion, fieldMappingVersion, formulaDisposition, layoutVariance, outputHash, readerObservation

**Discriminating expected cases:**

- A 200-row schedule expands without overwriting the conclusion or signatures
- An unsupported formula displays an unresolved disposition, not a cached success
- Export of an old reviewed version reproduces its answers even after current edits

**Owning paths:** `scripts/pilot-workpaper-export.mjs`, `scripts/pilot-workbook.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); ENG-OOXML. **Original broader standard candidates:** ISA 230 and the standard governing each form; approved financial reporting framework; source workbook/guidebook contracts.

**Accountable capacities:** BA + form/source analyst; independent review:Practicing auditor familiar with exact source; export reviewer. Actual names remain unassigned; no signature is implied.

#### R-D03-04 — Research all 20 confirmed dependency edges

**Proposed implementation decision:** Implement the 20 confirmed dependencies as typed, versioned reliance links. Only the specified dependent action is guarded; independent drafting remains available.

**Original question:** What actually moves between source and target forms?

**Prerequisites:** R-D03-02. **Original work groups:** RW01 RW02 RW03 RW04 RW05 RW39. **Methods:** M01 M02 M36.

**How to implement:**

1. Use all DEP-C01-C20 cards in this pack without renumbering
2. Store the actual selected upstream version, semantic payload and downstream use
3. On upstream change enqueue targeted impact assessment, preserving earlier approvals and unrelated work
4. Recompute derived values only under an approved method; human decision/reference links require an attributable reassessment

**Data/record contract:** dependencyId, upstreamObject/version, downstreamObject/version, payloadType, actionGuard, impactState, assessor, historicalBasis

**Discriminating expected cases:**

- Materiality revision stales the relying sample/evaluation but not unrelated evidence
- A proposed sample design cannot satisfy a selected-unit dependency
- Revoked archive grant denies future retrieval without erasing historical custody

**Owning paths:** `scripts/pilot-forms.mjs`, `scripts/pilot-workflow.mjs`, `scripts/pilot-later-facts.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-DEPENDENCIES. **Original broader standard candidates:** ISA 230 and the standard governing each form; approved financial reporting framework; source workbook/guidebook contracts.

**Accountable capacities:** BA + form/source analyst; independent review:Practicing auditor familiar with exact source; export reviewer. Actual names remain unassigned; no signature is implied.

#### R-D03-05 — Verify practical form use with auditors

**Proposed implementation decision:** Use a task-based acceptance protocol for every family and every exceptional form. A form count or structural roundtrip is insufficient acceptance.

**Original question:** Can practitioners complete and review the real work through supported families?

**Prerequisites:** R-D03-03 R-D03-04. **Original work groups:** RW01 RW02 RW03 RW04 RW05 RW39. **Methods:** M01 M02 M36.

**How to implement:**

1. Prepare one normal and one adverse example per family and each exceptional extension
2. Ask the auditor to perform the actual source procedure, correct it, review it and reopen its native export
3. Record exact omission, confusing prompt or layout variance with the source cell and work version
4. Fix engineering defects; route actual method disagreements to the named methodological decision, then rerun affected cases

**Data/record contract:** observationId, formId, sourceHash, build, actor, task, expectedOutcome, observedOutcome, issue, disposition

**Discriminating expected cases:**

- Auditor can find and answer a conditional source question without coaching
- Returned work retains the initial answer and independent review note
- No participant -> protocol prepared, observed acceptance remains unperformed

**Owning paths:** `src/components/enterprise-workspace.tsx`, `scripts/pilot-workpaper-export.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ENG-WCAG](https://www.w3.org/TR/WCAG22/). **Original broader standard candidates:** ISA 230 and the standard governing each form; approved financial reporting framework; source workbook/guidebook contracts.

**Accountable capacities:** BA + form/source analyst; independent review:Practicing auditor familiar with exact source; export reviewer. Actual names remain unassigned; no signature is implied.

### D04 — Risk, controls, planning and materiality

#### R-D04-01 — Research risk taxonomy and assertion coverage

**Proposed implementation decision:** Represent financial-statement-level and assertion-level risks separately; fraud is a risk dimension that can affect several procedures. Avoid a universal numeric risk score.

**Original question:** What distinctions are required between entity risks, FS risks, assertion risks and fraud risks?

**Prerequisites:** R-D01-01. **Original work groups:** RW02 RW06 RW09 RW11 RW19 RW35. **Methods:** M03 M07 M36.

**How to implement:**

1. Capture entity/business/IT/service-organization understanding and actual risk-assessment work
2. Link significant classes, balances and disclosures to assertions and identified risks
3. Record inherent/control assessment, significance rationale, fraud/override and professional judgments under the selected edition
4. Maintain many-to-many risk-response-procedure links and reassess only affected work when facts change

**Data/record contract:** riskId, level, account/disclosure, assertion, inherentFactors, controlAssessment, significantRisk, fraudDimension, rationale, responseIds

**Discriminating expected cases:**

- Fraud risk links to journal tests and revenue procedures simultaneously
- New IT dependency generates specific work rather than an automatic high-risk score
- An assertion with no response remains a visible planning gap

**Owning paths:** `scripts/pilot-planning.mjs`, `scripts/pilot-registers.mjs`.

**Evidence/context:** [AUD-315](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-240](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-330](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 200, 240, 250, 260, 265, 300, 315, 320, 330, 402, 510, 600, 610, 620; relevant IESBA/firm policies.

**Accountable capacities:** Audit methodology analyst + BA; independent review:Authorized practicing audit planning/review lead. Actual names remain unassigned; no signature is implied.

#### R-D04-02 — Separate control design, implementation and operating effectiveness

**Proposed implementation decision:** Keep design evaluation, implementation and operating effectiveness as separate records. Reliance is a reviewed conclusion over actual period evidence.

**Original question:** Which work justifies reliance, and what happens when it fails?

**Prerequisites:** R-D04-01. **Original work groups:** RW02 RW06 RW09 RW11 RW19 RW35. **Methods:** M03 M07 M36.

**How to implement:**

1. Identify each control objective, owner, frequency, relevant IT dependencies and design
2. Record implementation evidence and walkthrough without treating these as operating tests
3. Plan period-specific instances, record deviations and assess operating effectiveness
4. Reconsider reliance, substantive work and deficiency communications when a deviation or dependency changes

**Data/record contract:** controlId, riskIds, objective, designResult, implementationResult, testPeriod, instances, deviations, relianceDecision, responseRevision

**Discriminating expected cases:**

- Good walkthrough plus no operating tests -> operating effectiveness unknown
- Failed control -> reassessment queued; original approval preserved
- One control supports several assertions without duplicating tested instances

**Owning paths:** `scripts/pilot-planning.mjs`, `scripts/pilot-execution.mjs`.

**Evidence/context:** [AUD-315](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-330](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-265](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 200, 240, 250, 260, 265, 300, 315, 320, 330, 402, 510, 600, 610, 620; relevant IESBA/firm policies.

**Accountable capacities:** Audit methodology analyst + BA; independent review:Authorized practicing audit planning/review lead. Actual names remain unassigned; no signature is implied.

#### R-D04-03 — Research materiality policy and calculations

**Proposed implementation decision:** M03 computes selected values; benchmark, normalization, performance percentage and clearly trivial threshold remain documented auditor/firm choices.

**Original question:** Which benchmarks, normalizations and percentages are firm judgments?

**Prerequisites:** R-D01-01. **Original work groups:** RW02 RW06 RW09 RW11 RW19 RW35. **Methods:** M03 M07 M36.

**How to implement:**

1. Select benchmark source and normalize only with explicit adjustment evidence
2. Record overall, specific, performance and clearly trivial amounts with distinct purpose
3. Calculate in explicit currency/scale and retain percentage basis, precision and rationale
4. Revise on new facts and reassess affected samples, procedures and aggregated findings

**Data/record contract:** benchmarkSource, benchmarkAmount, normalization, overallAmount, specificLevels, performanceAmount, trivialAmount, policyVersion, rationale

**Discriminating expected cases:**

- Benchmark 1000000 CU x 5% -> 50000 CU; 60% of that -> 30000 CU, illustrative policy only
- Explicit zero trivial threshold remains zero
- Negative profit needs a reasoned benchmark choice, not silent absolute value

**Owning paths:** `scripts/pilot-materiality.mjs`, `scripts/pilot-planning.mjs`.

**Evidence/context:** [AUD-320](https://standards.auasb.gov.au/node/859); [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 200, 240, 250, 260, 265, 300, 315, 320, 330, 402, 510, 600, 610, 620; relevant IESBA/firm policies.

**Accountable capacities:** Audit methodology analyst + BA; independent review:Authorized practicing audit planning/review lead. Actual names remain unassigned; no signature is implied.

#### R-D04-04 — Complete planning and opening/component branches

**Proposed implementation decision:** Planning is iterative. Initial audits, components, changed scope and reliance on others require their own conditional work and responsibilities.

**Original question:** What source work changes for a first audit, component or revised scope?

**Prerequisites:** R-D04-01 R-D04-02 R-D04-03. **Original work groups:** RW02 RW06 RW09 RW11 RW19 RW35. **Methods:** M03 M07 M36.

**How to implement:**

1. Preserve current strategy, plan, team discussion and governance communications
2. For first audits capture prior opinion, opening balances, accounting-policy consistency and alternative work
3. For groups distinguish component scope/materiality/instructions/communication and group review under the chosen ISA600 edition
4. Version changed scope and resources; propagate actual consequences to programmes and reviewers

**Data/record contract:** strategyVersion, initialAudit, openingBalanceWork, componentScope, instructions, materialityBasis, changeReason, governanceCommunication

**Discriminating expected cases:**

- Opening balance arithmetic agrees but audit evidence is unavailable -> limitation remains
- Component report received -> group review still required
- Scope expands after planning -> new procedures/assignments, historical plan retained

**Owning paths:** `scripts/pilot-planning.mjs`, `scripts/pilot-registers.mjs`.

**Evidence/context:** [AUD-300](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-510](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-600](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 200, 240, 250, 260, 265, 300, 315, 320, 330, 402, 510, 600, 610, 620; relevant IESBA/firm policies.

**Accountable capacities:** Audit methodology analyst + BA; independent review:Authorized practicing audit planning/review lead. Actual names remain unassigned; no signature is implied.

### D05 — Data, mappings and method infrastructure

#### R-D05-01 — Research actual input families and completeness evidence

**Proposed implementation decision:** Extend the existing controlled CSV import to a bounded XLSX adapter; retain raw originals, typed rows, certified totals and all excluded/quarantined rows.

**Original question:** Which exports and control totals are necessary for audit reliance?

**Prerequisites:** None beyond the pinned baseline. **Original work groups:** RW04 RW05 RW12 RW18 RW20 RW32 RW40. **Methods:** M01 M02 M22 M30.

**How to implement:**

1. Define source families and stable grains before mapping columns
2. Preview explicit dates, decimal separators, debit/credit sign, units and currency; never infer ambiguous inputs
3. Reconcile original count and per-currency totals to disjoint accepted/quarantined/excluded cohorts and independent control evidence
4. Approve exact usable populations; changes create successor revisions and targeted stale uses

**Data/record contract:** sourceId/hash, sourceRow, sourceBusinessKey, family, entity, period, currency, scale, rawValue, typedValue, disposition, controlEvidence

**Discriminating expected cases:**

- Balanced subset with omitted row -> count bridge fails
- Blank amount remains unknown while genuine zero remains usable
- Duplicate payment candidate retained and investigated rather than silently deleted

**Owning paths:** `scripts/pilot-intake.mjs`, `scripts/pilot-population.mjs`, `scripts/pilot-data-methods.mjs`.

**Evidence/context:** [AUD-500](https://standards.auasb.gov.au/node/1012); ENG-OOXML. **Original broader standard candidates:** ISA 230, 500, 510, 520; applicable IFRS/IAS or IFRS for SMEs; IAS 8 and IAS 21; IAS 1/IFRS 18 as applicable.

**Accountable capacities:** Data/accounting analyst + domain engineer; independent review:Independent accounting/audit method reviewer + QA. Actual names remain unassigned; no signature is implied.

#### R-D05-02 — Specify allocations and statement bridges

**Proposed implementation decision:** Add split allocation at a declared source grain; distinguish additive primary destinations from repeated presentation references and note disclosures.

**Original question:** How can one source amount map to multiple statement/note destinations without duplication?

**Prerequisites:** R-D05-01. **Original work groups:** RW04 RW05 RW12 RW18 RW20 RW32 RW40. **Methods:** M01 M02 M22 M30.

**How to implement:**

1. Map source balances to one or more primary destinations with exact coefficients or amounts
2. Require allocated primary amounts to reconcile to each source amount; keep residuals explicit
3. Model adjustments, reversals and comparative restatements as independently approved signed journals
4. Generate TB-to-statements-to-notes bridges without counting note references as additional financial effects

**Data/record contract:** allocationSet/version, sourceRow, primaryDestination, amount/coefficient, presentationReference, adjustmentId, residual, signConvention

**Discriminating expected cases:**

- 100 CU split 60/40 plus a note showing 100 -> primary total 100 CU
- Two 60 CU allocations -> residual -20 CU and approval blocked
- Same adjustment referenced twice posts once by immutable journal identity

**Owning paths:** `scripts/pilot-data-methods.mjs`, `scripts/pilot-completion.mjs`.

**Evidence/context:** [AUD-500](https://standards.auasb.gov.au/node/1012); [ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0); DESIGN-ALLOCATION. **Original broader standard candidates:** ISA 230, 500, 510, 520; applicable IFRS/IAS or IFRS for SMEs; IAS 8 and IAS 21; IAS 1/IFRS 18 as applicable.

**Accountable capacities:** Data/accounting analyst + domain engineer; independent review:Independent accounting/audit method reviewer + QA. Actual names remain unassigned; no signature is implied.

#### R-D05-03 — Research accounting method infrastructure

**Proposed implementation decision:** Build a small versioned method registry around current owning calculations. No arbitrary scripting engine or universal accounting engine is required.

**Original question:** What must be common across methods without embedding a universal accounting engine?

**Prerequisites:** R-D01-01 R-D05-01. **Original work groups:** RW04 RW05 RW12 RW18 RW20 RW32 RW40. **Methods:** M01 M02 M22 M30.

**How to implement:**

1. Create M01-M36 contracts with allowed input schema, scope and required policy facts
2. Bind each run to exact source hashes, entity/period/currency and approved parameter versions
3. Separate deterministic arithmetic from recognition/classification/rate/life judgments
4. Persist outputs, row exceptions, unsupported reasons, independent expected cases and current review; migrations preserve old methods

**Data/record contract:** methodId/version, frameworkProfile, inputSchemaVersion, parameters, authority, algorithmVersion, rounding, inputHashes, outputs, exceptions, reviewer

**Discriminating expected cases:**

- Same method/input/policy -> exact retry retains output identity
- Changed discount rate -> new run and affected review
- Unsupported modification returns a defined manual-work route, never a standard-compliant label

**Owning paths:** `scripts/pilot-data-methods.mjs`, `scripts/pilot-automation-checks.mjs`, `scripts/pilot-area-checks.mjs`.

**Evidence/context:** [AUD-500](https://standards.auasb.gov.au/node/1012); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-METHODS. **Original broader standard candidates:** ISA 230, 500, 510, 520; applicable IFRS/IAS or IFRS for SMEs; IAS 8 and IAS 21; IAS 1/IFRS 18 as applicable.

**Accountable capacities:** Data/accounting analyst + domain engineer; independent review:Independent accounting/audit method reviewer + QA. Actual names remain unassigned; no signature is implied.

#### R-D05-04 — Research multi-entity, currency and consolidation boundaries

**Proposed implementation decision:** Keep legal entity, consolidation scope, transaction/functional/presentation currencies and reporting period explicit before any aggregation.

**Original question:** What must be separated before amounts can be compared or aggregated?

**Prerequisites:** R-D05-02 R-D05-03. **Original work groups:** RW04 RW05 RW12 RW18 RW20 RW32 RW40. **Methods:** M01 M02 M22 M30.

**How to implement:**

1. Pin control/scope conclusions and component period/policy alignment
2. Translate or remeasure only through M22 with a declared rate source/date/convention
3. Use M30 for separately approved eliminations and unmatched reciprocal balances
4. Reconcile pre-elimination, adjustment, elimination and final statements without deleting components or creating plugs

**Data/record contract:** entityId, groupId, scopeDecision, periodAlignment, currencyRole, rateTable, translationRun, eliminationJournal, unmatchedReciprocal

**Discriminating expected cases:**

- 100 USD and 100 MNT cannot sum as 200 CU
- Reciprocal 100/95 CU yields 5 CU unresolved difference
- Sub acquired during year -> relevant results date boundary is explicit

**Owning paths:** `scripts/pilot-area-finance.mjs`, `scripts/pilot-automation-checks.mjs`.

**Evidence/context:** [ACC-IFRS10](https://www.endorsement-board.uk/documents/2158/IFRS_10_-_Consolidated_Financial_Statements.pdf); [ACC-IAS21](https://www.endorsement-board.uk/documents/2167/IAS_21_-_The_Effects_of_Changes_in_Foreign_Exchange_Rates.pdf); [AUD-600](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 230, 500, 510, 520; applicable IFRS/IAS or IFRS for SMEs; IAS 8 and IAS 21; IAS 1/IFRS 18 as applicable.

**Accountable capacities:** Data/accounting analyst + domain engineer; independent review:Independent accounting/audit method reviewer + QA. Actual names remain unassigned; no signature is implied.

#### R-D05-05 — Set representative data and operational targets

**Proposed implementation decision:** Use current bounded limits as the safe prototype profile; establish larger operational limits from a measured workload rather than invented production capacity.

**Original question:** What real workloads must selected profiles support?

**Prerequisites:** R-D05-01. **Original work groups:** RW04 RW05 RW12 RW18 RW20 RW32 RW40. **Methods:** M01 M02 M22 M30.

**How to implement:**

1. Record current file/row/relationship caps and explicit rejection behavior
2. Construct small, normal and boundary synthetic datasets including wide schedules and many evidence links
3. Measure import, validation, review, concurrent edit and export separately on declared hardware
4. Propose a larger operating profile only with measured resource use and an accountable owner; keep staging/rollback/recovery tests separate

**Data/record contract:** workloadProfile, rows, columns, fileBytes, users, read/writeMix, hardware, latencyDistribution, memory, failureOutcome

**Discriminating expected cases:**

- 3001 rows under the existing 3000-row cap -> explicit unsupported limit
- Interrupted import leaves no approved partial population
- Concurrent reviewers cannot approve different stale revisions

**Owning paths:** `scripts/pilot-data-methods.mjs`, `scripts/pilot-operations.mjs`, `scripts/pilot-operations-rehearsal.mjs`.

**Evidence/context:** ENG-NFR; [ENG-SQLITE](https://www.sqlite.org/backup.html). **Original broader standard candidates:** ISA 230, 500, 510, 520; applicable IFRS/IAS or IFRS for SMEs; IAS 8 and IAS 21; IAS 1/IFRS 18 as applicable.

**Accountable capacities:** Data/accounting analyst + domain engineer; independent review:Independent accounting/audit method reviewer + QA. Actual names remain unassigned; no signature is implied.

### D06 — Evidence, documents, confirmations and sharing

#### R-D06-01 — Research evidence acceptance and contradictions

**Proposed implementation decision:** Evidence sufficiency is a reviewed auditor judgment over specific uses. Receipt, acceptance, request coverage and intended-use evaluation are separate states.

**Original question:** What supports intended use, and what remains an auditor sufficiency decision?

**Prerequisites:** None beyond the pinned baseline. **Original work groups:** RW08 RW13 RW14 RW26. **Methods:** M01 M09 M13 M36.

**How to implement:**

1. Record request scope and actual original/supplier/channel/time
2. Evaluate relevance, reliability, scope, readability and document anchors per procedure/assertion
3. Preserve contradictory information with follow-up, not a hidden rejected attachment
4. Replacing a source stales each relying use selectively and reaches final sufficiency assessment

**Data/record contract:** evidenceId/version/hash, requestItem, useId, assertion, purpose, page/cell, relevance, reliability, contradiction, conclusion, nextOwner

**Discriminating expected cases:**

- Accepted wrong-period evidence does not fulfill this request
- Same original supports two uses; changing one does not erase the other
- All requests covered but one material contradiction unresolved -> no automatic sufficiency

**Owning paths:** `scripts/pilot-evidence.mjs`, `scripts/pilot-requests.mjs`, `scripts/pilot-finalisation.mjs`.

**Evidence/context:** [AUD-500](https://standards.auasb.gov.au/node/1012). **Original broader standard candidates:** ISA 230, 500, 501, 505, 580, 620; applicable confidentiality and professional ethics; OWASP authorization/file handling guidance.

**Accountable capacities:** Audit evidence analyst + file/security engineer; independent review:Practicing auditor; security reviewer for object access. Actual names remain unassigned; no signature is implied.

#### R-D06-02 — Research confirmation control and alternatives

**Proposed implementation decision:** Retain auditor control of confirmation design, addressee and replies. Secure manual dispatch/receipt is sufficient for v1 when its actual evidence is recorded.

**Original question:** Who controls selection, sending, replies and nonresponses?

**Prerequisites:** R-D06-01. **Original work groups:** RW08 RW13 RW14 RW26. **Methods:** M01 M09 M13 M36.

**How to implement:**

1. Specify subject, assertion, balance/date/currency and independently checked respondent details
2. Prepare/approve actual request and record dispatch separately from draft/local link
3. Evaluate reply reliability, differences, nonresponse and management refusal
4. Document alternative work and evidence/report consequences; required positive reply cannot be silently substituted

**Data/record contract:** confirmationId, respondent, addressBasis, replyRoute, requestHash, dispatchEvidence, responseHash, difference, refusal/nonresponse, alternativeWork

**Discriminating expected cases:**

- Management-forwarded PDF is received but reliability needs evaluation
- No reply -> actual alternatives, no zero difference
- Required positive response absent -> unresolved limitation and next owner

**Owning paths:** `scripts/pilot-confirmations.mjs`, `scripts/pilot-evidence.mjs`.

**Evidence/context:** [AUD-505](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 230, 500, 501, 505, 580, 620; applicable confidentiality and professional ethics; OWASP authorization/file handling guidance.

**Accountable capacities:** Audit evidence analyst + file/security engineer; independent review:Practicing auditor; security reviewer for object access. Actual names remain unassigned; no signature is implied.

#### R-D06-03 — Research file intake and extraction limits

**Proposed implementation decision:** Support selected PDF/XLSX/DOCX content inspection as derived views of retained originals; extraction never changes the evidence or proves authenticity.

**Original question:** Which selected file formats can be safely read and reviewed?

**Prerequisites:** R-D03-01. **Original work groups:** RW08 RW13 RW14 RW26. **Methods:** M01 M09 M13 M36.

**How to implement:**

1. Validate extension, signature, size and archive expansion before parsing in an isolated bounded worker
2. Preserve original bytes and derive text/table/image previews with exact page/cell anchors
3. Mark OCR/extraction uncertainty; reviewer compares substantive values with the original
4. Quarantine unsupported/password-protected/malformed content; route manual inspection and record actual result

**Data/record contract:** originalHash, parser/version, format, extractionId, anchor, extractedValue, confidence/uncertainty, reviewerCorrection, quarantineReason

**Discriminating expected cases:**

- Scanned invoice with OCR 8/3 ambiguity -> manual comparison required
- ZIP expansion bomb -> rejected before parsing
- Corrected derived text preserves original and earlier extraction

**Owning paths:** `scripts/pilot-workbook.mjs`, `scripts/pilot-evidence.mjs`, `scripts/pilot-intake.mjs`.

**Evidence/context:** [ENG-UPLOAD](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html); ENG-OOXML; [AUD-500](https://standards.auasb.gov.au/node/1012). **Original broader standard candidates:** ISA 230, 500, 501, 505, 580, 620; applicable confidentiality and professional ethics; OWASP authorization/file handling guidance.

**Accountable capacities:** Audit evidence analyst + file/security engineer; independent review:Practicing auditor; security reviewer for object access. Actual names remain unassigned; no signature is implied.

#### R-D06-04 — Research scoped sharing and revocation

**Proposed implementation decision:** Use the D02 selected-document sharing contract for every representation: metadata, preview, originals, range downloads, bundles and returned work.

**Original question:** What permissions apply to a file and all its representations?

**Prerequisites:** R-D02-04 R-D06-03. **Original work groups:** RW08 RW13 RW14 RW26. **Methods:** M01 M09 M13 M36.

**How to implement:**

1. Create named recipient/purpose/object-version/action/expiry grants backed by actual authority
2. Enforce server-side scope on every route and prevent names/counts leaking outside the allowed set
3. Record manual packet manifest, dispatch, acknowledgment, return and revocation separately
4. Apply immediate future-access revocation; record that previously downloaded copies cannot be technically recalled

**Data/record contract:** grantId, recipient, engagement, exactObjectVersions, action, purpose, authority, expiresAt, revokedAt, packetHash, acknowledgment

**Discriminating expected cases:**

- Grant for file A denies file B and whole-engagement bundle
- Revoked user direct URL fails after revocation
- Returned specialist report remains unaccepted until audit team evaluates it

**Owning paths:** `scripts/pilot-evidence.mjs`, `scripts/pilot-server.mjs`, `scripts/pilot-oversight.mjs`.

**Evidence/context:** [ENG-AUTH](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html); [AUD-500](https://standards.auasb.gov.au/node/1012); D02-SPECIALIST. **Original broader standard candidates:** ISA 230, 500, 501, 505, 580, 620; applicable confidentiality and professional ethics; OWASP authorization/file handling guidance.

**Accountable capacities:** Audit evidence analyst + file/security engineer; independent review:Practicing auditor; security reviewer for object access. Actual names remain unassigned; no signature is implied.

### D07 — Programmes, sampling, analytics and journals

#### R-D07-01 — Research method support and sampling purpose

**Proposed implementation decision:** Choose a method per audit objective: full examination, specific items, statistical sampling or nonstatistical sampling. Targeted items alone do not support residual-population projection.

**Original question:** Which sampling designs are required by the approved source/offering?

**Prerequisites:** R-D04-03 R-D05-01. **Original work groups:** RW15 RW16 RW17 RW34 RW35. **Methods:** M04 M05 M06 M07 M08 M14 M33.

**How to implement:**

1. Pin reconciled population, assertion, unit and deviation/misstatement definition
2. Partition specifically tested, excluded-with-reason and residual units without overlap
3. Select the approved size/design/evaluation route and document assumptions
4. Keep controls attributes, monetary variables and MUS as separate method profiles with distinct inference

**Data/record contract:** designId, purpose, unit, frameHash, strata, specificIds, exclusions, residualIds, tolerableError/deviation, expectedError, riskBasis

**Discriminating expected cases:**

- Top ten largest invoices -> specific selection, no random-residual confidence claim
- Zero/negative book units cannot silently enter positive-unit ratio projection
- Control deviation is not a monetary error

**Owning paths:** `scripts/pilot-sampling-v2.mjs`, `scripts/pilot-execution.mjs`.

**Evidence/context:** [AUD-530](https://standards.auasb.gov.au/node/728); [AUD-500](https://standards.auasb.gov.au/node/1012); [STAT-BINOM](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binom.html). **Original broader standard candidates:** ISA 230, 240, 330, 500, 501, 520, 530; applicable approved firm sampling methodology.

**Accountable capacities:** Audit sampling/methodology analyst + domain engineer; independent review:Independent qualified method reviewer + QA computation owner. Actual names remain unassigned; no signature is implied.

#### R-D07-02 — Research sample size and selection implementation

**Proposed implementation decision:** Retain the unbiased reproducible random selector. Add explicit size-method records; begin with approved professional sizes and a bounded exact attribute-size helper, not an unvalidated universal MUS engine.

**Original question:** What assumptions justify size, confidence and selection probabilities?

**Prerequisites:** R-D07-01. **Original work groups:** RW15 RW16 RW17 RW34 RW35. **Methods:** M04 M05 M06 M07 M08 M14 M33.

**How to implement:**

1. Keep ordered eligible IDs, frame hash, entropy, seed and selector version
2. For zero-acceptance attribute plans calculate the smallest n satisfying the declared binomial or finite-population hypergeometric bound
3. Record tolerable deviation, expected deviation rationale, sampling risk, population assumptions and independent size approval
4. For substantive/MUS sizes accept an evidenced external/manual calculation until its exact matching evaluation method has its own verified profile

**Data/record contract:** sizeMethod, populationN, tolerableRate, acceptanceCount, alpha, n, finiteModel, externalSizeEvidence, selectorVersion, entropy, seed

**Discriminating expected cases:**

- Illustrative binomial alpha .05, tolerable deviation .05, zero acceptance -> n=59
- n greater than population -> full examination or a reviewed finite model
- Rerun with identical frame and selector facts reproduces selection

**Owning paths:** `scripts/pilot-sampling-v2.mjs`, `scripts/pilot-sampling.mjs`.

**Evidence/context:** [AUD-530](https://standards.auasb.gov.au/node/728); [STAT-BINOM](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binom.html); [STAT-HYPERGEOM](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.hypergeom.html); [VENDOR-MUS](https://help.highbond.com/helpdocs/analytics/15/en-us/Content/analytics/data_preparation/sampling_data/calculating_sample_size_for_a_monetary_unit_sample.htm). **Original broader standard candidates:** ISA 230, 240, 330, 500, 501, 520, 530; applicable approved firm sampling methodology.

**Accountable capacities:** Audit sampling/methodology analyst + domain engineer; independent review:Independent qualified method reviewer + QA computation owner. Actual names remain unassigned; no signature is implied.

#### R-D07-03 — Research projection and evaluation

**Proposed implementation decision:** Keep tested factual errors, inclusive projection and incremental residual projection separate. Sampling-risk evaluation is additional work and cannot be inferred from a point estimate.

**Original question:** How do tested specifics, sampled errors and projected residuals reach findings once?

**Prerequisites:** R-D07-02. **Original work groups:** RW15 RW16 RW17 RW34 RW35. **Methods:** M04 M05 M06 M07 M08 M14 M33.

**How to implement:**

1. Require actual tests or justified alternate procedures for every selected unit
2. Use only the approved matching evaluation method and reconcile strata, factual errors and incremental projection
3. Treat anomalies only with demonstrated evidence and retained additional work
4. Record risk allowance/evaluation, need to extend or change procedures, and reviewed findings handoff

**Data/record contract:** testedUnit, bookAmount, auditedAmount, signedError, projectionProfile, residualPopulation, inclusiveProjection, incrementalProjection, riskEvaluation

**Discriminating expected cases:**

- Population1000/sample200/error10 CU -> point projection50; additional40 plus factual10
- Separate fully tested error10 -> total60 CU without duplicate sample error
- Mixed-direction errors outside existing profile -> explicit unsupported, approved alternative required

**Owning paths:** `scripts/pilot-sampling-v2.mjs`, `scripts/pilot-completion.mjs`.

**Evidence/context:** [AUD-530](https://standards.auasb.gov.au/node/728); [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-PROJECTION. **Original broader standard candidates:** ISA 230, 240, 330, 500, 501, 520, 530; applicable approved firm sampling methodology.

**Accountable capacities:** Audit sampling/methodology analyst + domain engineer; independent review:Independent qualified method reviewer + QA computation owner. Actual names remain unassigned; no signature is implied.

#### R-D07-04 — Research substantive analytics and journal investigation

**Proposed implementation decision:** Separate preliminary/final analytics from substantive analytical procedures. Journal rules generate investigation candidates and never automatic fraud conclusions.

**Original question:** What can a rule flag, and what requires investigation?

**Prerequisites:** R-D04-01 R-D05-01. **Original work groups:** RW15 RW16 RW17 RW34 RW35. **Methods:** M04 M05 M06 M07 M08 M14 M33.

**How to implement:**

1. Freeze substantive expectation, reliable data basis, precision and threshold before comparison
2. Calculate comparable periods/ratios with explicit zero/missing denominator handling
3. Investigate differences with corroborating evidence and actual follow-up
4. Run explainable journal filters over a reconciled complete population, retain rule versions and deduplicate cases/exposure

**Data/record contract:** analyticPurpose, expectationBasis, expectation, precision, threshold, actual, difference, corroboration, journalRule/version, candidateUnit, disposition

**Discriminating expected cases:**

- Plausible management explanation without corroboration cannot close substantive deviation
- One journal triggering three rules is one investigation with three reasons
- Denominator zero -> not evaluable, never zero growth

**Owning paths:** `scripts/pilot-journals.mjs`, `scripts/pilot-execution.mjs`, `scripts/pilot-data-methods.mjs`.

**Evidence/context:** [AUD-520](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-240](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-500](https://standards.auasb.gov.au/node/1012). **Original broader standard candidates:** ISA 230, 240, 330, 500, 501, 520, 530; applicable approved firm sampling methodology.

**Accountable capacities:** Audit sampling/methodology analyst + domain engineer; independent review:Independent qualified method reviewer + QA computation owner. Actual names remain unassigned; no signature is implied.

#### R-D07-05 — Complete programme execution and native schedule parity

**Proposed implementation decision:** Make each programme step executable and attributable, with distinct scope approval, actual performance, reviewer challenge, conclusion and native export.

**Original question:** Can planned work become actual attributable, reviewable audit work?

**Prerequisites:** R-D03-02 R-D07-03 R-D07-04. **Original work groups:** RW15 RW16 RW17 RW34 RW35. **Methods:** M04 M05 M06 M07 M08 M14 M33.

**How to implement:**

1. Instantiate the source programme and every applicable procedure with reasoned tailoring
2. Record work performed, units/evidence/results and unsupported or unavailable work
3. Submit exact versions, allow reviewer return and preparer response, and clear actual notes independently
4. Carry limitations/findings into D09 and test native sampling schedules against the form contract

**Data/record contract:** programme/version, sourceProcedureKey, applicability, assignedActors, performedAt, workNarrative, results, evidence, reviewNotes, conclusion

**Discriminating expected cases:**

- Approved programme but no actual work -> incomplete
- Missing selected support cannot be replaced by an unrecorded new sample
- Reviewer returns one procedure; unrelated approved procedures remain identifiable

**Owning paths:** `scripts/pilot-execution.mjs`, `scripts/pilot-workflow.mjs`, `scripts/pilot-workpaper-export.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-330](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-530](https://standards.auasb.gov.au/node/728). **Original broader standard candidates:** ISA 230, 240, 330, 500, 501, 520, 530; applicable approved firm sampling methodology.

**Accountable capacities:** Audit sampling/methodology analyst + domain engineer; independent review:Independent qualified method reviewer + QA computation owner. Actual names remain unassigned; no signature is implied.

### D08 — All fieldwork areas and automation minimums

#### R-D08-01 — Reconcile all 22 source fieldwork variants

**Proposed implementation decision:** Use the 22 original variants as coverage units, each with the exact source programme, assertions, records and conditional work. A generic area card is only a container.

**Original question:** What exact procedures, assertions and exceptions belong to each original variant?

**Prerequisites:** R-D03-01 R-D05-03. **Original work groups:** RW17 RW18 RW19 RW20 RW21 RW34 RW36 RW37. **Methods:** M09 M10 M11 M12 M13 M14 M15 M16 M17 M18 M19 M20 M21 M22 M23 M24 M25 M26 M27 M28 M29 M30 M31 M32 M33 M34 M36.

**How to implement:**

1. Read all variant rows, source locators and current G10 area-work contracts
2. For each source procedure specify test purpose, evidence, actual work, judgment, exception and review
3. Attach the relevant M packs and preserve manual/specialist procedures with actual work records
4. Trace each output to finding, area conclusion, completion and report impact

**Data/record contract:** variantId, sourceProcedureKey, assertion, inputUse, actualWork, methodRun, judgment, matter, reviewer, downstreamUse

**Discriminating expected cases:**

- All22 cards present but one programme step missing -> coverage gap remains
- Manual rights inspection supported with evidence is valid actual work
- Generic narrative cannot claim automated costing

**Owning paths:** `scripts/pilot-area-cards.mjs`, `scripts/pilot-execution.mjs`, `src/data/source-registers.json`.

**Evidence/context:** [AUD-330](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-500](https://standards.auasb.gov.au/node/1012); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-AREAS. **Original broader standard candidates:** Applicable ISA 240, 330, 500, 501, 505, 510, 520, 530, 540, 550, 560, 570, 600, 620; area-specific IFRS/IAS or selected SME sections.

**Accountable capacities:** Area BA + accounting/audit specialist; independent review:Independent practicing auditor for area; separate numerical checker. Actual names remain unassigned; no signature is implied.

#### R-D08-02 — Reconcile each of the 58 automation minima

**Proposed implementation decision:** Reconcile each of the 58 original minimums against its actual owning workflow; preserve all future extensions separately.

**Original question:** Which exact minimum is implemented, missing or only partially evidenced?

**Prerequisites:** R-D05-03. **Original work groups:** RW17 RW18 RW19 RW20 RW21 RW34 RW36 RW37. **Methods:** M09 M10 M11 M12 M13 M14 M15 M16 M17 M18 M19 M20 M21 M22 M23 M24 M25 M26 M27 M28 M29 M30 M31 M32 M33 M34 M36.

**How to implement:**

1. Use the exact original minimum, inputs, human responsibility and boundary
2. Inspect current G11 locator and actual code/profile for the selected minimum
3. Implement the specific missing logic or state/permission/export delta specified in the automation cards
4. Execute its normal, adverse, missing/unsupported, denied and source-change cases and retain actual results

**Data/record contract:** automationId, minimumHash, owningCommand, supportedProfile, methodId, exactSourceIds, expectedCase, observedCase, limitation

**Discriminating expected cases:**

- Matching menu label without computation does not fulfill a minimum
- Existing bounded computation is retained and tested rather than declared absent
- Optional future OCR suggestion is not promoted into mandatory v1 scope

**Owning paths:** `scripts/pilot-automation-checks.mjs`, `scripts/pilot-data-methods.mjs`, `scripts/pilot-area-cards.mjs`.

**Evidence/context:** [AUD-500](https://standards.auasb.gov.au/node/1012); DESIGN-AUTOMATIONS. **Original broader standard candidates:** Applicable ISA 240, 330, 500, 501, 505, 510, 520, 530, 540, 550, 560, 570, 600, 620; area-specific IFRS/IAS or selected SME sections.

**Accountable capacities:** Area BA + accounting/audit specialist; independent review:Independent practicing auditor for area; separate numerical checker. Actual names remain unassigned; no signature is implied.

#### R-D08-03 — Research accounting and audit methods per area

**Proposed implementation decision:** Adopt bounded method profiles for required native arithmetic and a complete evidenced human route for recognition, classification and complex transactions. Unsupported automation remains a visible requirement gap until implemented or explicitly dispositioned.

**Original question:** Which recognition, measurement, recalculation and audit procedures must be supported?

**Prerequisites:** R-D08-01 R-D08-02 R-D01-01. **Original work groups:** RW17 RW18 RW19 RW20 RW21 RW34 RW36 RW37. **Methods:** M09 M10 M11 M12 M13 M14 M15 M16 M17 M18 M19 M20 M21 M22 M23 M24 M25 M26 M27 M28 M29 M30 M31 M32 M33 M34 M36.

**How to implement:**

1. Use all M09-M34 cards and applicable framework profile
2. Match each source procedure to a deterministic subcalculation and a separately attributable professional decision
3. Define additional method profiles only for demonstrated source needs; attach policy/assumptions and independent examples
4. For complex cases capture external schedule, actual auditor reperformance/evaluation and limitation without claiming native computation

**Data/record contract:** framework, method/version, transactionClass, assumptions, calculation, professionalDecision, specialistSchedule, review, unsupportedReason

**Discriminating expected cases:**

- Straight-line allocation cannot establish IFRS15 performance recognition
- Approved ECL rates calculate allowance but do not validate model adequacy
- IFRS for SMEs case cannot silently call full-IFRS lease/ECL rules

**Owning paths:** `scripts/pilot-area-checks.mjs`, `scripts/pilot-area-finance.mjs`, `scripts/pilot-area-statutory.mjs`.

**Evidence/context:** [ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); [ACC-IFRS15](https://standards.aasb.gov.au/sites/default/files/2026-11/AASB15_12-14_COMPdec22_07-26.pdf); [ACC-IFRS16](https://www.endorsement-board.uk/documents/2148/IFRS_16_-_Leases.pdf); [ACC-IAS2](https://www.endorsement-board.uk/documents/2184/IAS_2_-_Inventories.pdf); [ACC-IAS16](https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ias-16-property-plant-and-equipment.pdf?bypass=on); [ACC-IAS36](https://standards.aasb.gov.au/aasb-136-jan-2026). **Original broader standard candidates:** Applicable ISA 240, 330, 500, 501, 505, 510, 520, 530, 540, 550, 560, 570, 600, 620; area-specific IFRS/IAS or selected SME sections.

**Accountable capacities:** Area BA + accounting/audit specialist; independent review:Independent practicing auditor for area; separate numerical checker. Actual names remain unassigned; no signature is implied.

#### R-D08-04 — Design complete vertical fieldwork slices

**Proposed implementation decision:** Build a full revenue/cut-off/receivables slice first as a verification pattern; then implement every remaining variant in the sequenced batches, including its completion/report consequence.

**Original question:** What is the smallest complete source-supported result for each area?

**Prerequisites:** R-D08-03 R-D07-05. **Original work groups:** RW17 RW18 RW19 RW20 RW21 RW34 RW36 RW37. **Methods:** M09 M10 M11 M12 M13 M14 M15 M16 M17 M18 M19 M20 M21 M22 M23 M24 M25 M26 M27 M28 M29 M30 M31 M32 M33 M34 M36.

**How to implement:**

1. Start from accepted client, actual team, current plan/materiality and reconciled source data
2. Execute source procedures, native calculations, manual judgments, exceptions and independent review
3. Create or link canonical findings, verify corrections and complete affected final assessments
4. Rehearse an unmodified path and a material/unresolved path through exact report package and archive

**Data/record contract:** sliceId, variantIds, procedureIds, methodRuns, findings, finalAssessment, opinionDecision, issuedPackage, archiveManifest

**Discriminating expected cases:**

- Revenue before delivery -> cut-off matter reaches reviewed finding
- Same issue identified in confirmation and sample links one canonical error
- Unresolved material issue remains visible at report decision

**Owning paths:** `scripts/pilot-execution.mjs`, `scripts/pilot-completion.mjs`, `scripts/pilot-reporting.mjs`.

**Evidence/context:** DESIGN-SLICES; [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-700](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** Applicable ISA 240, 330, 500, 501, 505, 510, 520, 530, 540, 550, 560, 570, 600, 620; area-specific IFRS/IAS or selected SME sections.

**Accountable capacities:** Area BA + accounting/audit specialist; independent review:Independent practicing auditor for area; separate numerical checker. Actual names remain unassigned; no signature is implied.

#### R-D08-05 — Plan independent fieldwork acceptance

**Proposed implementation decision:** Use one evidence ledger per original variant/minimum with independently expected outcomes and actual observation. Completeness is item-level, not an average score.

**Original question:** What evidence permits a source reviewer to accept an area and its automations?

**Prerequisites:** R-D08-04. **Original work groups:** RW17 RW18 RW19 RW20 RW21 RW34 RW36 RW37. **Methods:** M09 M10 M11 M12 M13 M14 M15 M16 M17 M18 M19 M20 M21 M22 M23 M24 M25 M26 M27 M28 M29 M30 M31 M32 M33 M34 M36.

**How to implement:**

1. Run the five scenario classes for every original variant and the minimum-specific cases
2. Include native export, denied access, changed-source impact, restart and actual downstream use
3. Distinguish engineering success, source-semantic acceptance and professional method approval
4. Record exact build, source/method versions, actual reviewer and remaining limitations; only attributable acceptance changes accepted status

**Data/record contract:** originalId, scenarioId, expected, observed, build, source/methodHash, actor, reviewer, evidencePath, acceptanceClass

**Discriminating expected cases:**

- One failed required branch prevents that item acceptance even when most cases pass
- Unassigned reviewer is pending acceptance, not signed
- Reused engineering fixture is not independent professional acceptance

**Owning paths:** `scripts/pilot-source-evidence.mjs`, `scripts/pilot-release.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-ACCEPTANCE. **Original broader standard candidates:** Applicable ISA 240, 330, 500, 501, 505, 510, 520, 530, 540, 550, 560, 570, 600, 620; area-specific IFRS/IAS or selected SME sections.

**Accountable capacities:** Area BA + accounting/audit specialist; independent review:Independent practicing auditor for area; separate numerical checker. Actual names remain unassigned; no signature is implied.

### D09 — Findings, corrections and audit completion

#### R-D09-01 — Research misstatement classification and aggregation

**Proposed implementation decision:** Use a canonical issue and signed financial-effect lines. Separate factual, judgmental, projected, qualitative, control and evidence-limitation effects.

**Original question:** How should signed errors, exposure, projection, omissions and prior-period effects coexist?

**Prerequisites:** R-D07-03 R-D05-04. **Original work groups:** RW21 RW22 RW23 RW34 RW35. **Methods:** M22 M24 M25 M28 M31 M32 M33 M34.

**How to implement:**

1. Classify actual exception before creating a monetary misstatement
2. Keep economic issue identity and affected assertion/account/period/currency
3. Link sampled factual and incremental projected amounts without double counting; retain gross positive/negative exposure and justified net presentations
4. Evaluate individual, aggregate, prior-period and qualitative effects against current thresholds

**Data/record contract:** issueId, originUnit, effectType, signedLines, currency, period, projectionLink, factualAmount, incrementalProjection, qualitativeEffect

**Discriminating expected cases:**

- +100 and -80 CU show gross180/net20 with context, no automatic cancellation
- Unknown disclosure effect remains unknown
- Same exception from two procedures links one issue

**Owning paths:** `scripts/pilot-completion.mjs`, `scripts/pilot-finalisation.mjs`.

**Evidence/context:** [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-530](https://standards.auasb.gov.au/node/728); DESIGN-PROJECTION. **Original broader standard candidates:** ISA 230, 250, 260, 265, 450, 501, 540, 550, 560, 570, 580, 600, 620, 720; applicable IAS 8, 10, 12, 24, 36, 37 and disclosure requirements.

**Accountable capacities:** Completion/methodology analyst; independent review:Authorized engagement completion/review lead. Actual names remain unassigned; no signature is implied.

#### R-D09-02 — Research correction verification and unresolved effects

**Proposed implementation decision:** Correction status requires evidence of actual posting or changed disclosure, followed by independent verification. Agreement alone is insufficient.

**Original question:** What demonstrates an agreed adjustment actually reached the books?

**Prerequisites:** R-D09-01. **Original work groups:** RW21 RW22 RW23 RW34 RW35. **Methods:** M22 M24 M25 M28 M31 M32 M33 M34.

**How to implement:**

1. Record proposal, management response and approved journal/disclosure change separately
2. Match each financial-effect line to compatible final-ledger rows and prevent reuse
3. Reconcile full, partial, rejected and reversed corrections against final statements
4. Preserve remaining uncorrected effects and re-review after source changes

**Data/record contract:** correctionId, issueId, proposedLines, agreedAmount, postingSourceRows, verification, correctedAmount, residual, disclosureVersion

**Discriminating expected cases:**

- 100 CU error, management agrees100, posted60 ->40 CU remains
- Balanced journal in wrong account does not correct the issue
- Disclosure wording changed but wrong note version -> verification fails

**Owning paths:** `scripts/pilot-completion.mjs`, `scripts/pilot-finalisation.mjs`.

**Evidence/context:** [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0). **Original broader standard candidates:** ISA 230, 250, 260, 265, 450, 501, 540, 550, 560, 570, 580, 600, 620, 720; applicable IAS 8, 10, 12, 24, 36, 37 and disclosure requirements.

**Accountable capacities:** Completion/methodology analyst; independent review:Authorized engagement completion/review lead. Actual names remain unassigned; no signature is implied.

#### R-D09-03 — Research legal, estimates, going-concern and subsequent-event completion

**Proposed implementation decision:** Maintain separate legal/estimates/going-concern/subsequent-event assessments tied to actual final statements and relevant dates. Numeric indicators support, but never replace, conclusions.

**Original question:** What evidence and dates must the auditor evaluate before reporting?

**Prerequisites:** R-D01-01 R-D09-01. **Original work groups:** RW21 RW22 RW23 RW34 RW35. **Methods:** M22 M24 M25 M28 M31 M32 M33 M34.

**How to implement:**

1. Evaluate legal enquiries and recognition/disclosure facts through M31
2. Reperform selected estimates and challenge methods, assumptions, data and bias
3. Evaluate management going-concern assessment, horizon, mitigations, uncertainty and disclosures under the selected ISA570 edition
4. Perform subsequent-event enquiries/reviews through intended report date and classify accounting/report consequences

**Data/record contract:** assessmentType, finalStatementVersion, reportDate, horizon, evidence, assumptionChallenge, uncertainty, disclosure, conclusion, nextWork

**Discriminating expected cases:**

- Positive runway with uncommitted refinancing -> uncertainty still evaluated
- Later cash receipt may inform year-end recoverability without automatic revenue recognition
- Lawyer response does not itself select IAS37 accounting

**Owning paths:** `scripts/pilot-finalisation.mjs`, `scripts/pilot-execution.mjs`.

**Evidence/context:** [AUD-501](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-560](https://standards.auasb.gov.au/node/634); [AUD-570](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ACC-IAS37](https://standards.aasb.gov.au/aasb-137-jan-2026-0). **Original broader standard candidates:** ISA 230, 250, 260, 265, 450, 501, 540, 550, 560, 570, 580, 600, 620, 720; applicable IAS 8, 10, 12, 24, 36, 37 and disclosure requirements.

**Accountable capacities:** Completion/methodology analyst; independent review:Authorized engagement completion/review lead. Actual names remain unassigned; no signature is implied.

#### R-D09-04 — Research disclosure and other-information coverage

**Proposed implementation decision:** Use versioned disclosure applicability by selected framework/entity/period; keep other-information work distinct from audited statements.

**Original question:** How is an applicable disclosure checked without asserting universal completeness?

**Prerequisites:** R-D03-03 R-D09-03. **Original work groups:** RW21 RW22 RW23 RW34 RW35. **Methods:** M22 M24 M25 M28 M31 M32 M33 M34.

**How to implement:**

1. Build applicable disclosure rows from the selected standards/policy, not a universal yes/no checklist
2. Link each requirement to exact note/paragraph and supporting work or justified N/A
3. Reconcile missing, incomplete, contradictory and stale notes to matters and report consequences
4. Record actual annual-report other information obtained/read or expected later, inconsistencies, communications and subsequent handling

**Data/record contract:** disclosureRequirementId, frameworkVersion, applicability, noteAnchor, evidence, review, otherInformationVersion, obtainedAt, inconsistency

**Discriminating expected cases:**

- Checklist all checked but missing required note -> no completion
- Expected-later annual report remains unperformed read with actual follow-up owner
- Changed notes require affected disclosure review

**Owning paths:** `scripts/pilot-finalisation.mjs`, `scripts/pilot-registers.mjs`.

**Evidence/context:** [AUD-700](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-720](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0). **Original broader standard candidates:** ISA 230, 250, 260, 265, 450, 501, 540, 550, 560, 570, 580, 600, 620, 720; applicable IAS 8, 10, 12, 24, 36, 37 and disclosure requirements.

**Accountable capacities:** Completion/methodology analyst; independent review:Authorized engagement completion/review lead. Actual names remain unassigned; no signature is implied.

#### R-D09-05 — Research completion-to-report handoff

**Proposed implementation decision:** Produce a current completion package with explicit outstanding matters and professional consequences. No generic green status can clear a mandatory unresolved item.

**Original question:** Which unresolved matters affect authorization, opinion or additional work?

**Prerequisites:** R-D09-02 R-D09-04. **Original work groups:** RW21 RW22 RW23 RW34 RW35. **Methods:** M22 M24 M25 M28 M31 M32 M33 M34.

**How to implement:**

1. Bind final analytics, findings, corrections, representations, communications and eight final assessments to exact versions
2. Require current reviews and actual representation evidence near the report date
3. Document overall evidence sufficiency and individual/aggregate/qualitative judgments
4. Hand limitations and conclusions to D11, separating blockers on issue from legitimate modified-opinion outcomes

**Data/record contract:** completionVersion, finalFS/notes, assessments, representations, evaluation, unresolvedMatters, qualityState, reportConsequences

**Discriminating expected cases:**

- Unsigned representation template cannot satisfy obtained representations
- Evidence limitation can require disclaimer, not an invented clean completion
- Report-date change reopens date-dependent work selectively

**Owning paths:** `scripts/pilot-finalisation.mjs`, `scripts/pilot-reporting.mjs`.

**Evidence/context:** [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-580](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-700](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-260](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 230, 250, 260, 265, 450, 501, 540, 550, 560, 570, 580, 600, 620, 720; applicable IAS 8, 10, 12, 24, 36, 37 and disclosure requirements.

**Accountable capacities:** Completion/methodology analyst; independent review:Authorized engagement completion/review lead. Actual names remain unassigned; no signature is implied.

### D10 — Permissions, review, consultation and quality

#### R-D10-01 — Research permission vocabulary and immutable duties

**Proposed implementation decision:** Use configurable action permissions combined with engagement/object scope and non-bypassable actor/version duties. Existing D02 named-person assignments remain the authority base.

**Original question:** Which configurable actions are safe, and which controls must not be switchable?

**Prerequisites:** R-D02-01. **Original work groups:** RW08 RW09 RW24 RW31 RW33. **Methods:** M36.

**How to implement:**

1. Define a curated action dictionary for read/create/edit/submit/review/approve/issue/lock/share/dispose
2. Allow administrator role bundles and dated scoped grants without executable custom policies
3. Enforce current identity, appointment, object scope, stage, prior authorship and exact-version requirements server-side
4. Preserve privileged configuration history and deny self-approval where independent review is required

**Data/record contract:** actionId, roleBundle, subject, engagement/objectScope, appointment, effectiveDates, actorHistory, independentDuty, policyVersion

**Discriminating expected cases:**

- Administrator grants review action to preparer -> own-work approval still denied
- UI-hidden file remains inaccessible by direct URL
- Role change does not rewrite historical reviewer identity

**Owning paths:** `scripts/pilot-identity.mjs`, `scripts/pilot-server.mjs`, `scripts/pilot-workflow.mjs`.

**Evidence/context:** [ENG-AUTH](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html); [AUD-220R](https://www.irba.co.za/upload/IAASB-International-Standard-Auditing-220-Revised.pdf); D02-SPECIALIST. **Original broader standard candidates:** ISA 220, 230, 260, 265; ISQM 1 and ISQM 2; applicable IESBA Code; OWASP authorization; NIST separation of duty.

**Accountable capacities:** Quality methodology lead + security/BA; independent review:Authorized quality reviewer distinct from author; security reviewer. Actual names remain unassigned; no signature is implied.

#### R-D10-02 — Research ordinary review, consultation and disagreements

**Proposed implementation decision:** Separate preparer response, reviewer clearance, consultation advice, applied resolution and difference-of-opinion resolution.

**Original question:** What work must be performed and documented before a matter is resolved?

**Prerequisites:** R-D10-01. **Original work groups:** RW08 RW09 RW24 RW31 RW33. **Methods:** M36.

**How to implement:**

1. Anchor each note to exact work/evidence version and actual reviewer
2. Return for specific work, record preparer response and independent clearance
3. Consult using facts, scope, adviser competence, actual advice and application evidence
4. Resolve disagreements through designated authority and retain unresolved report-date guards

**Data/record contract:** noteId, workVersion, noteAuthor, responseVersion, clearanceActor, consultationId, advice, appliedWork, disagreement, resolutionAuthority

**Discriminating expected cases:**

- Preparer answers note -> note remains open until authorized clearance
- Advice obtained but not applied -> consultation unresolved
- Reviewer reassignment preserves earlier challenge and response

**Owning paths:** `scripts/pilot-oversight.mjs`, `scripts/pilot-finalisation.mjs`, `scripts/pilot-workflow.mjs`.

**Evidence/context:** [AUD-220R](https://www.irba.co.za/upload/IAASB-International-Standard-Auditing-220-Revised.pdf); [QM-1](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 220, 230, 260, 265; ISQM 1 and ISQM 2; applicable IESBA Code; OWASP authorization; NIST separation of duty.

**Accountable capacities:** Quality methodology lead + security/BA; independent review:Authorized quality reviewer distinct from author; security reviewer. Actual names remain unassigned; no signature is implied.

#### R-D10-03 — Research EQR applicability, eligibility and timing

**Proposed implementation decision:** Formal EQR is conditional and distinct from ordinary final review. Its eligible reviewer evaluates significant judgments and completes the review on or before report date.

**Original question:** When is EQR required, and what makes it independent and complete?

**Prerequisites:** R-D01-01 R-D10-02. **Original work groups:** RW08 RW09 RW24 RW31 RW33. **Methods:** M36.

**How to implement:**

1. Determine requirement from applicable law, firm quality policy and relevant engagement category
2. Evaluate reviewer/assistants competence, time, authority, ethics, team separation and former-partner cooling-off
3. Capture significant judgments, selected documentation/discussions, concerns and their actual resolution
4. Record reviewer completion notice and guard report dating/issue until required EQR is complete; retain separate ordinary review

**Data/record contract:** eqrRequired, basis, reviewerEligibility, formerPartnerDates, significantJudgments, reviewWork, concerns, completionNotice, completionAt

**Discriminating expected cases:**

- Ordinary R4 confirmation does not satisfy formal EQR
- Required EQR completed after report date -> invalid dating sequence
- New unresolved EQR concern invalidates earlier readiness

**Owning paths:** `scripts/pilot-oversight.mjs`, `scripts/pilot-reporting.mjs`.

**Evidence/context:** [QM-2](https://www.ifac.org/system/files/publications/files/IAASB-Quality-Management-ISQM-2-Engagement-Quality-Reviews.pdf); [QM-1](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-220R](https://www.irba.co.za/upload/IAASB-International-Standard-Auditing-220-Revised.pdf). **Original broader standard candidates:** ISA 220, 230, 260, 265; ISQM 1 and ISQM 2; applicable IESBA Code; OWASP authorization; NIST separation of duty.

**Accountable capacities:** Quality methodology lead + security/BA; independent review:Authorized quality reviewer distinct from author; security reviewer. Actual names remain unassigned; no signature is implied.

#### R-D10-04 — Research audit-facing firm quality minimums

**Proposed implementation decision:** Retain audit-facing firm quality controls while deferring general CRM/billing/HR. A quality system includes monitoring and remediation beyond one engagement sign-off.

**Original question:** Which B-series obligations are needed for the selected audit practice?

**Prerequisites:** R-D10-03. **Original work groups:** RW08 RW09 RW24 RW31 RW33. **Methods:** M36.

**How to implement:**

1. Map B-series source obligations individually to audit necessity versus broader operations
2. Provide independence confirmations, methodology resources, consultation, complaints/breaches and engagement inspection records
3. Record quality-risk response, identified deficiency, root cause, remediation owner and effectiveness follow-up
4. Keep conditional other-service mandates separate from statutory audit records and permissions

**Data/record contract:** qualityObjective/risk, response, independenceConfirmation, complaint, inspectionFinding, rootCause, remediation, effectiveness, serviceMandate

**Discriminating expected cases:**

- Billing deferred does not defer independence confirmation
- Closed remediation task without effectiveness evidence -> monitoring incomplete
- Advisory follow-up cannot silently edit an issued audit file

**Owning paths:** `scripts/pilot-registers.mjs`, `scripts/pilot-finalisation.mjs`.

**Evidence/context:** [QM-1](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-SCOPE. **Original broader standard candidates:** ISA 220, 230, 260, 265; ISQM 1 and ISQM 2; applicable IESBA Code; OWASP authorization; NIST separation of duty.

**Accountable capacities:** Quality methodology lead + security/BA; independent review:Authorized quality reviewer distinct from author; security reviewer. Actual names remain unassigned; no signature is implied.

#### R-D10-05 — Threat-model authorization and history

**Proposed implementation decision:** Threat-model actual authorization boundaries and history rather than treating role labels as security proof.

**Original question:** Can configuration changes or direct requests bypass the approved controls?

**Prerequisites:** R-D10-01 R-D06-04. **Original work groups:** RW08 RW09 RW24 RW31 RW33. **Methods:** M36.

**How to implement:**

1. Inventory every server route, object family, metadata view, export and external-like token
2. Build actor x action x object/state test matrix including direct requests
3. Test cross-client, guessed IDs, replay, stale revisions, grant expiry, suspension, role changes and history integrity
4. Fix centrally in existing guards, then rerun affected routes and preserve evidence without credentials

**Data/record contract:** route, action, actorContext, objectScope, state, expectedDecision, directRequestResult, replayKey, historyEvidence

**Discriminating expected cases:**

- Revoked user cannot retrieve cached bundle route
- Same idempotency key with changed payload rejected
- Partner capacity cannot delete historical audit events

**Owning paths:** `scripts/pilot-server.mjs`, `scripts/pilot-identity.mjs`, `scripts/pilot-store.mjs`.

**Evidence/context:** [ENG-AUTH](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html); [ENG-UPLOAD](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html); ENG-NFR. **Original broader standard candidates:** ISA 220, 230, 260, 265; ISQM 1 and ISQM 2; applicable IESBA Code; OWASP authorization; NIST separation of duty.

**Accountable capacities:** Quality methodology lead + security/BA; independent review:Authorized quality reviewer distinct from author; security reviewer. Actual names remain unassigned; no signature is implied.

### D11 — Opinion, wording, authorization and issuance

#### R-D11-01 — Research opinion and report-structure decisions

**Proposed implementation decision:** Use a supported single-cause opinion matrix plus an explicit professional multi-cause route. The software validates completeness/contradiction; auditor determines materiality and pervasiveness.

**Original question:** Which report outcomes follow each source situation and combination?

**Prerequisites:** R-D09-05 R-D10-03. **Original work groups:** RW23 RW24 RW25 RW26 RW27 RW35. **Methods:** M33 M34 M36.

**How to implement:**

1. Record sufficient evidence versus limitation, known misstatement and possible effects separately
2. Apply the standard matrix for supported cases; preserve grounds and final-evaluation links
3. For combined causes document each cause, interaction, professional opinion and consultations instead of rejecting the whole engagement forever
4. Record KAM, going-concern, emphasis, other-matter and other-information choices independently; sections cannot cure an inappropriate opinion

**Data/record contract:** opinionDecision, evidenceAdequacy, knownEffects, possibleEffects, materialityJudgments, pervasivenessJudgments, combinedCauseMemo, sectionDecisions

**Discriminating expected cases:**

- Material nonpervasive known effect -> qualified candidate for auditor approval
- Material pervasive known effect -> adverse candidate
- Combined material known error and limitation -> specialist/professional determination with rationale, no automatic precedence rule

**Owning paths:** `scripts/pilot-reporting.mjs`, `scripts/pilot-registers.mjs`.

**Evidence/context:** [AUD-705](https://standards.auasb.gov.au/asa-705-apr-2022); [AUD-700](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-701](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-706](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 700, 701, 705, 706, 710, 720, 570, 560, 220; ISA 800/805/810 only if selected source offerings require; applicable local report law.

**Accountable capacities:** Audit reporting/methodology lead; independent review:Authorized reporting practitioner; local reviewer for statutory wording. Actual names remain unassigned; no signature is implied.

#### R-D11-02 — Research exact report wording and applicability

**Proposed implementation decision:** Use versioned reviewed report templates and exact engagement instances. Correct the identified adverse-template conflict through a controlled successor, preserving the source.

**Original question:** Which template edition and local wording may be used for the selected report?

**Prerequisites:** R-D11-01 R-D01-01. **Original work groups:** RW23 RW24 RW25 RW26 RW27 RW35. **Methods:** M33 M34 M36.

**How to implement:**

1. Select framework, jurisdiction, entity category, audit edition and report language
2. Map mandatory report components and conditional sections to exact supporting decisions
3. Review title/addressee/opinion/basis/responsibilities/date/signature/duties as an instance
4. Produce DOCX/PDF or the agreed native output from exact approved content; retain approved wording variance and original source reference

**Data/record contract:** templateRelease, applicabilityProfile, sectionIds, wording, reviewer, reportDate, signatureIdentity, localDuties, outputHash

**Discriminating expected cases:**

- Adverse label with unmodified opinion wording -> contradiction requiring correction
- Changing one approved sentence creates a new reviewable version
- KAM omitted/included with actual applicability rationale

**Owning paths:** `scripts/pilot-reporting.mjs`, `scripts/pilot-report.mjs`, `scripts/pilot-workpaper-export.mjs`.

**Evidence/context:** [AUD-700](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-705](https://standards.auasb.gov.au/asa-705-apr-2022); [AUD-701](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-706](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 700, 701, 705, 706, 710, 720, 570, 560, 220; ISA 800/805/810 only if selected source offerings require; applicable local report law.

**Accountable capacities:** Audit reporting/methodology lead; independent review:Authorized reporting practitioner; local reviewer for statutory wording. Actual names remain unassigned; no signature is implied.

#### R-D11-03 — Research authorization and issuance evidence

**Proposed implementation decision:** Authorize and issue exact bytes bound to approved statements, notes and conclusions. Signing, issue, dispatch and receipt are separate events.

**Original question:** What exact state and bytes may be signed and released?

**Prerequisites:** R-D11-02 R-D10-05. **Original work groups:** RW23 RW24 RW25 RW26 RW27 RW35. **Methods:** M33 M34 M36.

**How to implement:**

1. Freeze approved report/FS/notes package and verify all hashes/current reviews
2. Authorize exact package with actual eligible partner and required quality completion
3. Record actual signing and issue; provider adapters only if selected, otherwise supported manual evidence
4. Record recipients, each dispatch attempt/result and acknowledgment; reconcile unknown external effects before retry

**Data/record contract:** authorizationId, reportHash, fsHash, notesHash, conclusionVersions, signerAuthority, signatureEvidence, issueAt, recipientAttempt, receipt

**Discriminating expected cases:**

- Changed report after signature -> old signature unusable
- Local link creation -> pending delivery, not receipt
- One recipient acknowledged while another missing -> distribution incomplete

**Owning paths:** `scripts/pilot-reporting.mjs`, `scripts/pilot-release.mjs`, `scripts/pilot-external-effects.mjs`.

**Evidence/context:** [AUD-700](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [QM-2](https://www.ifac.org/system/files/publications/files/IAASB-Quality-Management-ISQM-2-Engagement-Quality-Reviews.pdf); [ENG-AUTH](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). **Original broader standard candidates:** ISA 700, 701, 705, 706, 710, 720, 570, 560, 220; ISA 800/805/810 only if selected source offerings require; applicable local report law.

**Accountable capacities:** Audit reporting/methodology lead; independent review:Authorized reporting practitioner; local reviewer for statutory wording. Actual names remain unassigned; no signature is implied.

#### R-D11-04 — Research amended/reissued reporting interactions

**Proposed implementation decision:** Amended reporting creates a successor package with its own procedures, authority, date and communications; the prior issued report remains immutable.

**Original question:** When are new wording, date, procedures or communications required?

**Prerequisites:** R-D11-03 R-D12-01. **Original work groups:** RW23 RW24 RW25 RW26 RW27 RW35. **Methods:** M33 M34 M36.

**How to implement:**

1. Use the D12 later-fact classification and management amendment decision
2. Choose full redating or the permitted limited-procedure/dual-date route with actual legal/professional basis
3. Reperform affected procedures, update completion and independently approve successor wording
4. Issue new exact package and record prior-recipient communication/prevention-of-reliance effects

**Data/record contract:** predecessorIssue, laterFactId, amendmentScope, datingDecision, proceduresThrough, amendedFSApproval, successorReport, communications

**Discriminating expected cases:**

- New report cannot predate approval of amended statements
- Old report retained while new report clearly supersedes it
- Failed notice remains unresolved; no pretend prevention of reliance

**Owning paths:** `scripts/pilot-later-facts.mjs`, `scripts/pilot-reporting.mjs`.

**Evidence/context:** [AUD-560](https://standards.auasb.gov.au/node/634); [AUD-700](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-705](https://standards.auasb.gov.au/asa-705-apr-2022). **Original broader standard candidates:** ISA 700, 701, 705, 706, 710, 720, 570, 560, 220; ISA 800/805/810 only if selected source offerings require; applicable local report law.

**Accountable capacities:** Audit reporting/methodology lead; independent review:Authorized reporting practitioner; local reviewer for statutory wording. Actual names remain unassigned; no signature is implied.

### D12 — Later facts, assembly, custody and retention

#### R-D12-01 — Research later-fact dates and permitted alternatives

**Proposed implementation decision:** Use three separate dates for event occurrence, discovery and reporting stage. Dual dating is conditional, not a general alternative button.

**Original question:** Which response is required at each report/issue/assembly stage?

**Prerequisites:** R-D01-01. **Original work groups:** RW27 RW28 RW29 RW30 RW32 RW33. **Methods:** M34 M36.

**How to implement:**

1. Record original financial period, report date, issue date and discovery evidence
2. Before report date perform required subsequent-event work; after date evaluate facts that could have changed the report
3. Discuss with management/governance, determine need for amendment and response
4. Permit limited extended procedures/dual dating only where applicable law/framework permits restricted amendment; otherwise extend work to a new full date

**Data/record contract:** eventOccurredAt, discoveredAt, reportingDate, originalReportDate, issuedAt, amendmentNeed, legalPermission, limitedProcedures, datingChoice

**Discriminating expected cases:**

- Fact discovered after archive still creates an evaluated later-fact case
- Limited amendment without permission -> dual-date route denied
- Later event with no year-end accounting change may still require disclosure

**Owning paths:** `scripts/pilot-later-facts.mjs`, `scripts/pilot-archive-controls.mjs`.

**Evidence/context:** [AUD-560](https://standards.auasb.gov.au/node/634); [ACC-IAS10](https://standards.aasb.gov.au/aasb-110-mar-2020). **Original broader standard candidates:** ISA 230, 560, 220; ISQM 1; verified Mongolian documentation/retention/inspection law and operating contracts.

**Accountable capacities:** Audit documentation analyst + operating owner; independent review:Authorized documentation/quality reviewer; legal reviewer for local rules. Actual names remain unassigned; no signature is implied.

#### R-D12-02 — Research final assembly and post-assembly amendments

**Proposed implementation decision:** Final assembly is administrative; subsequent new audit work requires a substantive amendment with actual reasons and dates.

**Original question:** Which administrative actions are permitted after report date?

**Prerequisites:** R-D12-01. **Original work groups:** RW27 RW28 RW29 RW30 RW32 RW33. **Methods:** M34 M36.

**How to implement:**

1. Reconcile exact issued package, completed work and resolved notes to a manifest
2. Calculate policy-based assembly deadline independently from retention date
3. Allow indexing/cross-referencing/administrative copies with preserved history, never backdated audit work
4. Lock the assembled file; any later change records who/when/why, work, conclusion and review in an appropriate successor

**Data/record contract:** assemblyPolicy, anchorDate, deadline, manifest, administrativeChange, substantiveChange, reason, actor, reviewedAt, lockVersion

**Discriminating expected cases:**

- Missing audit test cannot be created as administrative assembly
- Typo in index creates narrow recorded successor
- Lock preserves original work and prior issue bytes

**Owning paths:** `scripts/pilot-assembly.mjs`, `scripts/pilot-archive.mjs`, `scripts/pilot-archive-controls.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-560](https://standards.auasb.gov.au/node/634). **Original broader standard candidates:** ISA 230, 560, 220; ISQM 1; verified Mongolian documentation/retention/inspection law and operating contracts.

**Accountable capacities:** Audit documentation analyst + operating owner; independent review:Authorized documentation/quality reviewer; legal reviewer for local rules. Actual names remain unassigned; no signature is implied.

#### R-D12-03 — Research retention, holds and disposal authority

**Proposed implementation decision:** Retention eligibility, legal holds, disposal authority and actual disposal are distinct. Keep files when applicability is unresolved; no automatic deletion.

**Original question:** What policy applies to which file and copies, and what suspends deletion?

**Prerequisites:** R-D12-02. **Original work groups:** RW27 RW28 RW29 RW30 RW32 RW33. **Methods:** M34 M36.

**How to implement:**

1. Record applicable local/professional/firm policy scope, period and exact anchor with evidence
2. Calculate each applicable deadline and retain the longest binding one plus active holds
3. Require independent authorization and per-copy disposition manifest before any removal
4. Record actual removal/retained residuals/backups and verification; never label a local deletion secure erasure

**Data/record contract:** retentionPolicy/version, legalSource, anchor, period, deadline, holds, dispositionAuthority, copies, actualRemoval, residuals

**Discriminating expected cases:**

- Two holds; release one -> deletion still denied
- New shorter policy cannot silently shorten an inherited binding deadline
- Unknown local retention anchor -> retain and request policy determination within the workflow

**Owning paths:** `scripts/pilot-archive-controls.mjs`, `scripts/pilot-archive.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); D01-LOCAL-LAW; ENG-RETENTION. **Original broader standard candidates:** ISA 230, 560, 220; ISQM 1; verified Mongolian documentation/retention/inspection law and operating contracts.

**Accountable capacities:** Audit documentation analyst + operating owner; independent review:Authorized documentation/quality reviewer; legal reviewer for local rules. Actual names remain unassigned; no signature is implied.

#### R-D12-04 — Research custody, retrieval, inspection and recovery

**Proposed implementation decision:** Custody acceptance requires actual completeness/readability inspection and authorized retrieval. Backup success and hash equality do not by themselves prove usable recovery.

**Original question:** Can the selected storage actually preserve and recover a reviewable audit file?

**Prerequisites:** R-D12-03 R-D06-04. **Original work groups:** RW27 RW28 RW29 RW30 RW32 RW33. **Methods:** M34 M36.

**How to implement:**

1. Offer exact package to the authorized custodian with scope and restrictions
2. Inspect each Office/PDF/original in a compatible reader and record actual acknowledgment
3. Support limited inspector requests, approval, dispatch/receipt, return, revocation and disclosure log
4. Rehearse isolated restore and scoped retrieval; preserve holds, identities, grants and exact originals

**Data/record contract:** custodyOffer, manifestHash, inspector, formatReader, perItemReadability, acceptedAt, retrievalGrant, dispatchReceipt, recoveryObservation

**Discriminating expected cases:**

- All hashes match but Office file fails to open -> custody discrepancy
- Report-only grant hides unrelated original names/counts
- Restore preserves revoked status and does not resurrect access

**Owning paths:** `scripts/pilot-oversight.mjs`, `scripts/pilot-recovery.mjs`, `scripts/pilot-archive-controls.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ENG-SQLITE](https://www.sqlite.org/backup.html); [ENG-AUTH](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). **Original broader standard candidates:** ISA 230, 560, 220; ISQM 1; verified Mongolian documentation/retention/inspection law and operating contracts.

**Accountable capacities:** Audit documentation analyst + operating owner; independent review:Authorized documentation/quality reviewer; legal reviewer for local rules. Actual names remain unassigned; no signature is implied.

#### R-D12-05 — Research postarchive service boundaries

**Proposed implementation decision:** Postarchive recommendations/advisory work require a separate mandate and workspace; statutory later-fact duties remain linked to the original audit.

**Original question:** Which later recommendations are a separate offering?

**Prerequisites:** R-D12-01. **Original work groups:** RW27 RW28 RW29 RW30 RW32 RW33. **Methods:** M34 M36.

**How to implement:**

1. Classify a new request as audit later fact, inspection/retrieval or separate service
2. Create actual authority, scope, dates and permitted source references for an optional service
3. Record management implementation claim separately from independent effectiveness verification
4. Return audit-relevant new facts through D12-01 without rewriting the sealed file or reusing audit approval as service authority

**Data/record contract:** requestClass, serviceMandate, authorizedDates, sourceAuditReference, recommendation, implementationClaim, retest, laterFactLink

**Discriminating expected cases:**

- Expired service mandate denies new service work
- Failed retest remains failed despite management completion claim
- Separate advisory edit cannot alter archived statutory findings

**Owning paths:** `scripts/pilot-finalisation.mjs`, `scripts/pilot-later-facts.mjs`.

**Evidence/context:** DESIGN-SCOPE; [AUD-560](https://standards.auasb.gov.au/node/634); [QM-1](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 230, 560, 220; ISQM 1; verified Mongolian documentation/retention/inspection law and operating contracts.

**Accountable capacities:** Audit documentation analyst + operating owner; independent review:Authorized documentation/quality reviewer; legal reviewer for local rules. Actual names remain unassigned; no signature is implied.

### D13 — UI, ERD, operating tests and release

#### R-D13-01 — Research task-based auditor usability

**Proposed implementation decision:** Retain the existing workspace and improve only demonstrated task barriers. Verify complete role-specific tasks and selected accessibility criteria.

**Original question:** Which current work surfaces fail real source execution?

**Prerequisites:** R-D03-05. **Original work groups:** RW31 RW32 RW33 RW34 RW35 RW36 RW39 RW40. **Methods:** M01 M02 M35 M36.

**How to implement:**

1. Use source tasks for preparer, senior, reviewer, partner, specialist and custodian
2. Exercise long schedules, conditional prompts, queue handoffs, errors and native outputs
3. Check keyboard operation, focus visibility, labels, error association, status messages and zoom/reflow
4. Fix concrete blockers and record expected/observed completion without inventing a WCAG certification

**Data/record contract:** role, task, sourceForm, screen, keyboardPath, taskOutcome, issue, criterion, build, observation

**Discriminating expected cases:**

- 200-row schedule remains editable and exportable
- Review return shows exact next action/owner
- Color alone cannot distinguish required/error states

**Owning paths:** `src/components/enterprise-workspace.tsx`, `src/components/delivery-planning.tsx`.

**Evidence/context:** [ENG-WCAG](https://www.w3.org/TR/WCAG22/); DESIGN-ACCEPTANCE. **Original broader standard candidates:** ISA 230 and applicable audit/source acceptance requirements; selected WCAG 2.2 criteria; OWASP authorization; current runtime/vendor documentation; operating policy.

**Accountable capacities:** BA + QA/architect/operating owner by task; independent review:Independent auditor/source reviewer and accountable release/operations owners. Actual names remain unassigned; no signature is implied.

#### R-D13-02 — Research conceptual ERD to runtime contracts

**Proposed implementation decision:** Produce targeted ERD/runtime deltas for assignments, allocations, method runs and versioned reliance; preserve the current owning stores and history.

**Original question:** Which required cardinalities or invariants are actually missing?

**Prerequisites:** R-D05-02 R-D02-01 R-D10-01. **Original work groups:** RW31 RW32 RW33 RW34 RW35 RW36 RW39 RW40. **Methods:** M01 M02 M35 M36.

**How to implement:**

1. Map conceptual objects to actual tables/snapshots/commands and source IDs
2. Specify cardinalities, uniqueness, same-engagement/entity/period constraints and immutable version identity
3. Add only required records/fields/indexes and explicit legacy adapters
4. Rehearse migration on a copy, compare counts/hashes/actors and rollback; concurrent edits use expected revisions

**Data/record contract:** conceptId, runtimeOwner, key, scope, cardinality, constraint, migration, legacyMapping, rollback, evidence

**Discriminating expected cases:**

- Many assignees do not duplicate a workpaper
- Split allocation cannot exceed source effect silently
- Migration preserves historical signers and original hashes

**Owning paths:** `scripts/pilot-store.mjs`, `scripts/pilot-registers.mjs`, `scripts/pilot-workflow.mjs`.

**Evidence/context:** [ENG-SQLITE](https://www.sqlite.org/backup.html); DESIGN-METHODS; DESIGN-ALLOCATION. **Original broader standard candidates:** ISA 230 and applicable audit/source acceptance requirements; selected WCAG 2.2 criteria; OWASP authorization; current runtime/vendor documentation; operating policy.

**Accountable capacities:** BA + QA/architect/operating owner by task; independent review:Independent auditor/source reviewer and accountable release/operations owners. Actual names remain unassigned; no signature is implied.

#### R-D13-03 — Research measurable nonfunctional requirements

**Proposed implementation decision:** Define an explicit deployment profile before production tests; use measured targets and real storage/security owners. Prototype limits are documented facts, not production requirements.

**Original question:** What must the selected deployment handle and recover?

**Prerequisites:** R-D05-05 R-D12-04. **Original work groups:** RW31 RW32 RW33 RW34 RW35 RW36 RW39 RW40. **Methods:** M01 M02 M35 M36.

**How to implement:**

1. Select user/concurrency/import/export/write workloads, security boundary and recovery needs
2. Set owner-approved latency/error/storage/RPO/RTO criteria after baseline measurement
3. Run representative load, write contention, partial failure, recovery and denied-access scenarios on isolated systems
4. Record pass/fail with environment, sample size and percentiles; unresolved target/adapter blocks only the affected release claim

**Data/record contract:** deploymentProfile, owner, workload, hardware, p50/p95/p99, errorRateBase, RPO, RTO, backupScope, securityControls, measuredResult

**Discriminating expected cases:**

- Fast read-only demo cannot prove write contention
- Restore without originals -> recovery failed
- Local weak-password profile cannot be relabeled production-ready

**Owning paths:** `scripts/pilot-operations-rehearsal.mjs`, `scripts/pilot-operations.mjs`, `scripts/pilot-recovery.mjs`.

**Evidence/context:** ENG-NFR; [ENG-SQLITE](https://www.sqlite.org/backup.html); [ENG-AUTH](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). **Original broader standard candidates:** ISA 230 and applicable audit/source acceptance requirements; selected WCAG 2.2 criteria; OWASP authorization; current runtime/vendor documentation; operating policy.

**Accountable capacities:** BA + QA/architect/operating owner by task; independent review:Independent auditor/source reviewer and accountable release/operations owners. Actual names remain unassigned; no signature is implied.

#### R-D13-04 — Research source coverage and independent acceptance

**Proposed implementation decision:** Reconcile every original obligation and branch to a concrete result/status. Coverage links, executed fixtures and independent acceptance are separate dimensions.

**Original question:** How are all original obligations dispositioned without gaming counts?

**Prerequisites:** R-D08-05 R-D10-04 R-D11-03. **Original work groups:** RW31 RW32 RW33 RW34 RW35 RW36 RW39 RW40. **Methods:** M01 M02 M35 M36.

**How to implement:**

1. Preserve all original package/task/criterion/form/variant/AUTO/DEP/lifecycle/BPMN IDs
2. Map each to current engineering evidence and the new planned change/expected case
3. Classify supported manual, native automation, external owner, product deferral and genuine gap with rationale
4. Run exact-set and orphan checks; obtain attributable source/professional acceptance per required item, never aggregate away a failed branch

**Data/record contract:** originalId, requirementType, sourceLocator, owningTicket, expectedCase, actualEvidence, evidenceClass, limitation, acceptance

**Discriminating expected cases:**

- A branch with no owner/case is an orphan even when its parent is covered
- Two partial lifecycles do not become one complete lifecycle
- Deferred external API retains its contract/manual route and source disposition

**Owning paths:** `scripts/pilot-source-evidence.mjs`, `scripts/pilot-release.mjs`, `src/data/source-registers.json`.

**Evidence/context:** DESIGN-ACCEPTANCE; [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 230 and applicable audit/source acceptance requirements; selected WCAG 2.2 criteria; OWASP authorization; current runtime/vendor documentation; operating policy.

**Accountable capacities:** BA + QA/architect/operating owner by task; independent review:Independent auditor/source reviewer and accountable release/operations owners. Actual names remain unassigned; no signature is implied.

#### R-D13-05 — Research operational handoff and release blockers

**Proposed implementation decision:** Release only the selected full-audit scope after engineering, professional and operational evidence is complete. Planning completion never toggles releaseReady.

**Original question:** What concrete evidence permits release of the selected audit product scope?

**Prerequisites:** R-D13-01 R-D13-02 R-D13-03 R-D13-04. **Original work groups:** RW31 RW32 RW33 RW34 RW35 RW36 RW39 RW40. **Methods:** M01 M02 M35 M36.

**How to implement:**

1. Use the complete dependency-based batch plan in this pack
2. Assign actual people and size bounded tickets after inspecting the specified delta; no fictional dates/capacity
3. Resolve required native-method/form branches, independent source acceptance and chosen operating profile
4. Prepare release decision with known limitations, rollback/recovery evidence and accountable owners; publish authored development batches to the development branch only

**Data/record contract:** releaseCandidate, scopeManifest, source/methodVersions, engineeringEvidence, practitionerAcceptance, operationalEvidence, unresolvedBlockers, rollback

**Discriminating expected cases:**

- All structural plan checks pass but no practitioner acceptance -> release remains false
- External service not selected -> no fake deployment dependency
- Published branch is not a main merge or deployment

**Owning paths:** `scripts/pilot-release.mjs`, `scripts/verify-release.mjs`.

**Evidence/context:** DESIGN-ACCEPTANCE; ENG-NFR; [QM-1](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 230 and applicable audit/source acceptance requirements; selected WCAG 2.2 criteria; OWASP authorization; current runtime/vendor documentation; operating policy.

**Accountable capacities:** BA + QA/architect/operating owner by task; independent review:Independent auditor/source reviewer and accountable release/operations owners. Actual names remain unassigned; no signature is implied.

## 4. All36 calculation and decision methods

Each card specifies a proposed bounded profile, input/algorithm, retained human judgment, exceptions and an independently understandable fictional example. It does not approve a universal accounting method. Actual expected fixtures must expand to every supported branch before release.

### M01 — Population integrity, control totals and reconciliations

**Profile:** Typed source reconciliation v1. **Original automation links:** AUTO-001 AUTO-002 AUTO-003 AUTO-004 AUTO-005 AUTO-008 AUTO-011 AUTO-016 AUTO-022 AUTO-031.

**Inputs:** Exact original rows; independent count/control evidence; entity/period/currency/scale; accepted/quarantined/excluded dispositions.

**Algorithm/steps:**

1. Preserve raw rows and source keys before conversion
2. Parse explicit amount/date/sign schemas and reject ambiguous values
3. Reconcile source count = accepted + quarantined + excluded, and per-currency signed totals including unresolved quantities
4. Reconcile TB opening + debits - credits = closing and GL debit/credit movements independently; certify completeness only to the evidenced extract boundary

**Human judgment:** Source completeness, appropriate exclusions, tolerances and intended use require actual auditor approval.

**Exceptions to test:**

- Balanced incomplete extract
- Duplicate business keys
- Unknown amount cannot enter complete total
- Mixed currencies or incompatible scales

**Independent example:** Rows 100,-20,0 CU total80 CU across3 rows. Certified4 rows/80 CU still fails count even though amounts agree.

**Evidence/context:** [AUD-500](https://standards.auasb.gov.au/node/1012); DESIGN-INTEGRITY.

### M02 — Allocations, adjustments and financial statement bridges

**Profile:** Primary allocation and statement bridge v1. **Original automation links:** AUTO-006 AUTO-007 AUTO-043 AUTO-056.

**Inputs:** Reviewed source balances; primary allocations; separate note references; signed adjustments; statement node definitions.

**Algorithm/steps:**

1. Allocate each source amount to primary destinations using exact amounts or rational coefficients
2. Require primary allocated total to equal source; report residual rather than plug
3. Apply each approved journal once by immutable identity and period
4. Resolve acyclic statement sums; repeated note references display values without increasing primary financial totals

**Human judgment:** Accounting classification, comparative restatement, current/noncurrent and cash-flow presentation are reviewed elections.

**Exceptions to test:**

- Over-allocation
- Cyclic statement reference
- Missing source
- Duplicate journal identity
- Unapproved offsetting

**Independent example:** 100 CU ->60 current/40 noncurrent; note100 is a presentation reference. Primary total100, not200 CU.

**Evidence/context:** [ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0); DESIGN-ALLOCATION.

### M03 — Materiality and clearly trivial thresholds

**Profile:** Selected materiality policy arithmetic v1. **Original automation links:** AUTO-046.

**Inputs:** Benchmark source/value; explicit percentage or amount; specific levels; performance/trivial values; currency/scale; rationale.

**Algorithm/steps:**

1. Use an approved normalized benchmark; never take absolute profit silently
2. Calculate selected benchmark x rate with explicit final rounding
3. Keep specific materiality, performance materiality and clearly trivial distinct
4. Version revisions and identify affected samples, evaluation and reporting uses

**Human judgment:** Benchmark/normalization/percentages and qualitative materiality are professional judgments, not ISA-prescribed constants.

**Exceptions to test:**

- Negative/zero benchmark
- Blank versus zero trivial
- Rounding boundary
- Revised benchmark

**Independent example:** Illustrative1000000 CU x5%=50000 CU overall;60% of overall=30000 CU performance; explicitly selected trivial0 remains0 CU.

**Evidence/context:** [AUD-320](https://standards.auasb.gov.au/node/859); [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M04 — Sampling frame and reproducible selection

**Profile:** Reproducible simple random selection without replacement. **Original automation links:** AUTO-047.

**Inputs:** Stable ordered unique eligible IDs; frame hash; n; entropy/seed; exact existing selector version; specific/excluded strata.

**Algorithm/steps:**

1. Keep current HMAC/rejection/partial-Fisher-Yates implementation and its inputs
2. Partition specific, residual and excluded units disjointly
3. Draw n unique residual units without replacement; retain exact order and input basis
4. Extensions retain earlier selected prefix and tested-unit lineage under the same frame; changed frame requires new design

**Human judgment:** Audit objective, unit and design appropriateness require review. Reproducibility is not assurance.

**Exceptions to test:**

- Duplicate unit IDs
- n>N
- Changed frame
- Missing selected support
- Targeted-only items

**Independent example:** Residual IDs A,B,C; n=3 -> all three exactly once. n=4 is invalid. Same pinned selector inputs reproduce its actual order.

**Evidence/context:** [AUD-530](https://standards.auasb.gov.au/node/728); DESIGN-SELECTION.

### M05 — Audit sample-size determination

**Profile:** Bounded attribute size helper + evidenced substantive-size route. **Original automation links:** AUTO-047.

**Inputs:** N where finite; tolerable deviation p; sampling risk alpha; acceptance count c; expected-deviation rationale; statistical design.

**Algorithm/steps:**

1. For binomial zero-acceptance c=0 use smallest integer n with (1-p)^n<=alpha
2. For general c use smallest n with cumulative Binomial(n,p) at c<=alpha; expected deviation informs the approved acceptance design, not a hidden formula
3. For finite simple random sampling use exact hypergeometric cumulative probability at the declared minimally unacceptable defect count; record threshold rounding
4. Substantive/MUS sizes require a separately evidenced matching design/evaluation method; do not apply attribute formulas to money

**Human judgment:** Selected risk, tolerable deviation, acceptance plan and adequacy are professional methodology decisions; this helper is a proposed bounded design.

**Exceptions to test:**

- p/alpha outside(0,1)
- n above population
- Expected deviations incompatible with zero-acceptance plan
- Monetary projection requested from attribute plan

**Independent example:** Fictional binomial alpha=.05,p=.05,c=0 gives n=59; .95^58>.05 and .95^59<=.05.

**Evidence/context:** [AUD-530](https://standards.auasb.gov.au/node/728); [STAT-BINOM](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binom.html); [STAT-HYPERGEOM](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.hypergeom.html); [VENDOR-MUS](https://help.highbond.com/helpdocs/analytics/15/en-us/Content/analytics/data_preparation/sampling_data/calculating_sample_size_for_a_monetary_unit_sample.htm).

### M06 — Projection, sampling evaluation and risk allowance

**Profile:** Point projection with explicit risk-evaluation boundary. **Original automation links:** AUTO-047 AUTO-048.

**Inputs:** Current reconciled residual frame; tested book/audited amounts; selected projection profile; separately tested specifics; strata.

**Algorithm/steps:**

1. Require actual evaluated work on every selected item
2. Under existing positive-book same-direction ratio profile compute inclusive residual estimate = residualBook x sampledSignedError / sampleBook
3. Incremental projection = inclusive estimate - sampled factual errors; retain factual errors separately
4. Sum disjoint strata/specific effects once; record sampling-risk evaluation and additional work independently; no invented confidence bound

**Human judgment:** Projection method, anomaly classification, sampling-risk allowance and acceptable audit basis require methodology review.

**Exceptions to test:**

- Mixed-sign errors outside current profile
- Zero sample-book denominator
- Untested item
- Anomaly without evidence
- Population replacement

**Independent example:** 1000 CU residual,200 sampled,10 error ->50 inclusive,40 incremental+10 factual. Separate specific error10 ->60 CU total.

**Evidence/context:** [AUD-530](https://standards.auasb.gov.au/node/728); [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-PROJECTION.

### M07 — Analytical expectations, ratios, trends and tolerances

**Profile:** Purpose-specific analytical calculations. **Original automation links:** AUTO-010 AUTO-033 AUTO-044.

**Inputs:** Comparable period/unit inputs; approved expectation; precision; absolute/relative threshold; denominator definition; reliable-data evidence.

**Algorithm/steps:**

1. Separate risk-assessment, substantive and final analytical purposes
2. Calculate actual-expected difference and ratio under explicit sign/denominator definitions
3. Freeze substantive expectation/precision/threshold before observed comparison
4. Generate distinct investigation cases with actual explanation and corroboration; preserve historical explanations on refresh

**Human judgment:** Suitability, reliable data, sufficiently precise expectation, threshold and interpretation remain auditor decisions.

**Exceptions to test:**

- Zero denominator
- Incomparable periods
- Negative base percentage
- Missing corroboration
- Expectation chosen after seeing actual

**Independent example:** Expected100 CU,actual120 ->difference20 CU and20% using expected100 as denominator. Expected0 ->relative difference not evaluable.

**Evidence/context:** [AUD-520](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-500](https://standards.auasb.gov.au/node/1012).

### M08 — Journal-entry and anomaly rules

**Profile:** Explainable journal candidate rules. **Original automation links:** AUTO-009 AUTO-021.

**Inputs:** Complete reconciled journal lines; journal/line IDs; posting date/time; preparer/approver; accounts; signed amounts; approved rule parameters.

**Algorithm/steps:**

1. Validate population and journal balancing before filtering
2. Apply explicit rules such as period-end, round amount, unusual account pair, preparer/approver conflict or missing approval using only supplied facts
3. Consolidate reasons by journal/line economic unit without multiplying exposure
4. Record selection rationale, actual test/evidence, conclusion and finding link; preserve completeness limitation

**Human judgment:** Fraud risk, rule thresholds, unusualness and final conclusions require human inquiry/investigation.

**Exceptions to test:**

- No timestamp
- System user different from human author
- Same journal triggers several rules
- Partial journal extract

**Independent example:** One500 CU journal flagged by3 rules ->one candidate,3 reasons,500 CU exposure; no fraud verdict.

**Evidence/context:** [AUD-240](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-500](https://standards.auasb.gov.au/node/1012).

### M09 — Receivables aging and subsequent-cash application

**Profile:** As-of aging and explicit receipt allocation. **Original automation links:** AUTO-013.

**Inputs:** Invoice/credit/receipt identities; due date or explicitly selected invoice-date basis; report date; signed open amount; referenced cash allocations.

**Algorithm/steps:**

1. Reconstruct open balance at reporting date, retaining later receipts separately
2. Compute age from selected date basis and assign one mutually exclusive bucket
3. Allocate each subsequent receipt to explicit invoice IDs without exceeding receipt/open balance; retain unapplied cash/FX
4. Reconcile aging totals to receivable population and evaluate corroboration and recoverability separately

**Human judgment:** Due-date basis, disputed credit allocation, confirmation alternatives and collectability are auditor decisions.

**Exceptions to test:**

- Missing due date
- Credit balances
- Partial or duplicate receipt allocation
- Receipt after evaluation cutoff
- Wrong currency

**Independent example:** Invoice100 CU; explicit subsequent receipt40 ->supported receipt40,remaining60 CU. Receipt is not subtracted from the year-end book balance.

**Evidence/context:** [AUD-505](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); DESIGN-AGING.

### M10 — Revenue and deferred-revenue schedules

**Profile:** Approved time-based revenue schedule and separate recognition record. **Original automation links:** AUTO-015.

**Inputs:** Contract/obligations; approved transaction price and allocation; performance evidence; start/end; period; time/progress convention; recorded revenue.

**Algorithm/steps:**

1. Record contract/performance-obligation, price/allocation and over-time versus point-in-time judgments first
2. For uniform time-based supported obligations calculate overlap using explicitly full-month or actual-day convention
3. Reconcile opening contract liability + applicable receipts/billings - earned release to closing using declared balance signs
4. Nonuniform progress/modifications/variable price use an explicitly supported separate method or actual external schedule review

**Human judgment:** A schedule is arithmetic support; enforceable contract, control transfer, progress, principal/agent and constraint judgments remain recorded professional work.

**Exceptions to test:**

- Nonuniform performance
- Contract modification
- Inclusive-day versus month mismatch
- Nonrefundable receipt before recognition criteria

**Independent example:** Approved uniform1200 CU/12 full months;3 completed months ->300 CU. Receipt1200 does not alone establish1200 CU revenue.

**Evidence/context:** [ACC-IFRS15](https://standards.aasb.gov.au/sites/default/files/2026-11/AASB15_12-14_COMPdec22_07-26.pdf); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M11 — Revenue cut-off, prices, discounts and credit notes

**Profile:** Commercial price/cut-off comparisons. **Original automation links:** AUTO-012 AUTO-014.

**Inputs:** Invoice lines; quantity/unit; approved dated price/discount/tax terms; delivery/control evidence; posting/invoice/credit dates; reporting cutoff.

**Algorithm/steps:**

1. Compute expected net line value under explicit sequential/combined discount policy
2. Compare commercial arithmetic with recorded amount separately from revenue recognition
3. Flag mismatched operational/accounting dates under the approved transaction/control rule
4. Link later credits to exact invoices and evaluate whether they corroborate year-end conditions

**Human judgment:** Delivery terms/control transfer, contract enforceability and adjustment versus subsequent event require actual evaluation.

**Exceptions to test:**

- Invoice date alone
- Partial delivery
- Price currency mismatch
- Discount tax-base order
- Unlinked credit

**Independent example:** 10 units x20 CU with10% approved discount ->180 CU before declared tax. Dec31 invoice/Jan2 control transfer ->cut-off candidate, not automatic misstatement.

**Evidence/context:** [ACC-IFRS15](https://standards.aasb.gov.au/sites/default/files/2026-11/AASB15_12-14_COMPdec22_07-26.pdf); [ACC-IAS10](https://standards.aasb.gov.au/aasb-110-mar-2020); DESIGN-COMMERCIAL.

### M12 — Procure-to-pay matching, accruals and unrecorded liabilities

**Profile:** Line-grain P2P matching/accrual/search. **Original automation links:** AUTO-016 AUTO-017 AUTO-018 AUTO-019.

**Inputs:** PO/receipt/invoice/payment line identities; quantities; supplier/master IDs; service period; posting/payment dates; amount/currency; policy.

**Algorithm/steps:**

1. Match explicit stable document-line keys with one-to-many quantities/payments without header multiplication
2. Reconcile purchase/payable movements and detect exact duplicates/shared normalized identity candidates
3. Compute eligible service-period accrual/prepayment under approved allocation; retain unsettled balances
4. Search post-period documents/payments for pre-period obligations and record actual investigation

**Human judgment:** Receipt/service obligation, appropriate matching tolerance, shared-identity relationship and completeness are human decisions.

**Exceptions to test:**

- One invoice paid twice versus partial payments
- PO absent but valid expense
- Unmatched service period
- Accrual reversal double count

**Independent example:** Invoice100 CU paid60+40 ->settled100 once. Two invoice lines matching one PO header must not each replicate header100.

**Evidence/context:** [AUD-500](https://standards.auasb.gov.au/node/1012); [ACC-IAS37](https://standards.aasb.gov.au/aasb-137-jan-2026-0); DESIGN-P2P.

### M13 — Bank reconciliation and cash movements

**Profile:** Signed bank reconciliation and explicit matching. **Original automation links:** AUTO-020 AUTO-021.

**Inputs:** Independent bank statement; cash GL; exact account/currency/date; bank-reconciliation items with signs/status; transfers; confirmations.

**Algorithm/steps:**

1. Match explicit references or approved exact keys; retain ambiguous one-to-many matches
2. Recalculate adjusted bank and adjusted book sides with declared sign conventions
3. Trace reconciling items to later clearing and investigate stale/unusual items
4. Pair inter-account transfers only on supported references; a paired event has two cash legs but one investigation exposure

**Human judgment:** Bank authenticity, account rights/restrictions, completeness and clearing evidence require evaluation.

**Exceptions to test:**

- Offsetting unexplained items
- FX mismatch
- Duplicate bank line
- Old outstanding cheque
- Transfer across reporting cutoff

**Independent example:** Bank100 CU +deposit in transit20 -outstanding cheque5 =adjusted115 CU; book115 ->residual0, yet reconciling evidence still required.

**Evidence/context:** [AUD-505](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-500](https://standards.auasb.gov.au/node/1012); DESIGN-BANK.

### M14 — Inventory movement, count and cut-off

**Profile:** Inventory quantity/count/cut-off bridge. **Original automation links:** AUTO-022 AUTO-023 AUTO-024.

**Inputs:** Item/location/unit; opening quantity; dated receipts/issues/transfers; signed count; count date/report date; ownership evidence.

**Algorithm/steps:**

1. Reconcile quantity opening +in -out =closing by item/location/unit
2. Compare actual signed count with register and record both-direction test evidence
3. Roll counts forward/back with actual intervening movements
4. Link transfers at both locations and investigate timing/ownership/cut-off rather than treating internal movement as purchase/sale

**Human judgment:** Attendance, count instructions, ownership, consignment and reliability remain actual audit work.

**Exceptions to test:**

- Incompatible units
- Unobserved locations
- Negative stock
- Missing transfer leg
- Count date differs from report date

**Independent example:** Opening10+receipts5-issues8=closing7 units;count6 ->register overstatement1 unit before valuation.

**Evidence/context:** [AUD-501](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ACC-IAS2](https://www.endorsement-board.uk/documents/2184/IAS_2_-_Inventories.pdf); DESIGN-INVENTORY.

### M15 — Inventory cost and cost of sales

**Profile:** Periodic weighted-average costing v1; separate additional profiles. **Original automation links:** AUTO-025.

**Inputs:** Opening quantity/value; approved eligible receipt/conversion cost; issues/closing quantities; cost method; recorded COS/closing value.

**Algorithm/steps:**

1. Reconcile quantities before costing
2. Supported periodic weighted average =eligible cost available /units available; retain rational unit cost until declared issue-total rounding
3. Compute issue cost then residual closing value so total eligible cost reconciles exactly
4. Specific identification/FIFO/moving average/production overhead need their own profile when required; no silent conversion of all clients to weighted average

**Human judgment:** Permitted cost formula, eligible cost, normal capacity, abnormal waste and policy consistency require reviewed basis.

**Exceptions to test:**

- No units with nonzero cost
- Negative quantities
- Unsupported fractional units
- Production overhead unsupported
- Method change

**Independent example:** 10 units/100 CU +10/140 ->20 units/240,average12. Issues15 ->180 CU;closing5 ->60 CU.

**Evidence/context:** [ACC-IAS2](https://www.endorsement-board.uk/documents/2184/IAS_2_-_Inventories.pdf); DESIGN-INVENTORY.

### M16 — Inventory NRV and obsolescence indicators

**Profile:** NRV input comparison and movement indicators. **Original automation links:** AUTO-026.

**Inputs:** Item cost/quantity; approved selling price; completion cost; necessary selling cost; observable evidence date; movement/age thresholds.

**Algorithm/steps:**

1. Calculate approved NRV per unit =selling price -completion cost -necessary selling cost
2. Compare at supported item or justified grouping level; do not offset unrelated item gains and losses
3. Calculate proposed write-down =max(0,cost-NRV) xquantity under supported nonnegative scope
4. Flag slow/nonmoving items independently; review reversals subject to original write-down limit and current evidence

**Human judgment:** Estimated selling price/costs, grouping, obsolescence and reversals require professional evidence; turnover alone is not NRV.

**Exceptions to test:**

- Missing completion cost
- Negative NRV requiring separate obligation analysis
- Post-period price changes
- Unrelated item netting

**Independent example:** Cost12 CU,price11,completion1,selling1 ->NRV9;5 units ->write-down15 CU.

**Evidence/context:** [ACC-IAS2](https://www.endorsement-board.uk/documents/2184/IAS_2_-_Inventories.pdf); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M17 — Asset roll-forward, disposals and revaluation movements

**Profile:** Dual asset roll-forwards. **Original automation links:** AUTO-027 AUTO-029.

**Inputs:** Asset/component identity; cost and accumulated charge openings; additions/disposals/transfers/revaluation; impairment; ledger.

**Algorithm/steps:**

1. Reconcile gross cost and accumulated depreciation/amortization separately
2. Preserve disposal of original cost and related accumulated charge, not net carrying value only
3. Compute carrying amount after separately recorded impairment/revaluation effects
4. Reconcile movements/classes to ledger and evidence; retain actual disposal consideration and gain/loss support

**Human judgment:** Recognition, revaluation class policy, derecognition date and classification remain human decisions.

**Exceptions to test:**

- Disposed cost without accumulated removal
- Asset transferred twice
- Revaluation across only selected class items
- Negative remaining basis

**Independent example:** Cost1000+add200-dispose100=1100;accum300+charge100-remove30=370 ->carrying730 CU before impairment.

**Evidence/context:** [ACC-IAS16](https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ias-16-property-plant-and-equipment.pdf?bypass=on); [ACC-IAS38](https://standards.aasb.gov.au/aasb-138-dec-2022-0).

### M18 — Depreciation and amortization

**Profile:** Straight-line time-apportioned charge v1. **Original automation links:** AUTO-028 AUTO-029.

**Inputs:** Cost/component; residual; useful life; available-for-use/disposal dates; reporting window; prior accumulated charge; actual days/month convention.

**Algorithm/steps:**

1. Annual base =(cost-residual)/usefulLife for supported cost model
2. Apply approved actual eligible period convention; distinguish available-for-use from purchase/payment date
3. Cap charge to remaining depreciable carrying basis and retain over-depreciation as a separate exception
4. Finite-life amortization uses its own life/support; indefinite-life intangible is not mechanically amortized; estimate changes are prospective under reviewed basis

**Human judgment:** Useful life, residual, consumption method, componentization, ready date and estimate revisions require actual review.

**Exceptions to test:**

- Zero life
- Residual above cost
- Partial reporting year beyond profile
- Indefinite life
- Fully depreciated but still used

**Independent example:** Cost1000,residual100,life3 years ->annual300 CU. Approved half-year convention ->150 CU;remaining basis100 caps charge100.

**Evidence/context:** [ACC-IAS16](https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ias-16-property-plant-and-equipment.pdf?bypass=on); [ACC-IAS38](https://standards.aasb.gov.au/aasb-138-dec-2022-0); DESIGN-DEPRECIATION.

### M19 — Capitalization, repairs and borrowing-cost support

**Profile:** Capitalization screening and borrowing-cost support. **Original automation links:** AUTO-030.

**Inputs:** Approved capitalization policy; transaction/category/date; asset/service evidence; qualifying-asset decision; borrowing costs and suspension intervals.

**Algorithm/steps:**

1. Compare additions/repairs with explicit policy categories and thresholds as candidates only
2. Distinguish direct costs from routine servicing and unsupported internal-development costs
3. For a supported borrowing-cost schedule calculate eligible costs over actual qualifying active intervals, respecting available incurred costs
4. Suspend/stop per reviewed qualifying-asset facts; route complex financing or development to reviewed specialist schedules

**Human judgment:** Recognition criteria cannot be replaced by a monetary threshold; qualifying development and asset-ready dates require evidence.

**Exceptions to test:**

- Small capital item
- Large routine repair
- Suspended project
- Training/startup costs
- Internal development criteria missing

**Independent example:** 100000 CU qualifying expenditure xapproved6% x6/12 active year=3000 CU subject to applicable borrowing-cost cap and policy facts.

**Evidence/context:** [ACC-IAS16](https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ias-16-property-plant-and-equipment.pdf?bypass=on); [ACC-IAS38](https://standards.aasb.gov.au/aasb-138-dec-2022-0); [ACC-IAS23](https://standards.aasb.gov.au/aasb-123-mar-2020).

### M20 — Effective interest, borrowings and covenants

**Profile:** Contractual interest + bounded effective-interest support. **Original automation links:** AUTO-036 AUTO-040.

**Inputs:** Facility contract; principal movements; coupon/day count; approved EIR/cash flows; fees; currency; covenant definitions/date.

**Algorithm/steps:**

1. Reconcile principal separately from interest and fees
2. Contractual interest uses actual agreed balance/rate/day-count segments
3. For supported regular cash flows compute amortized-cost roll-forward opening+EIR interest-cash paid; solve EIR only with a bracketed unique-root contract and residual validation
4. Compute covenant headroom from exact signed definitions and test date; modifications/credit impairment/complex instruments route to separate approved profiles

**Human judgment:** Classification, EIR inputs, modification/derecognition and covenant rights/waivers remain reviewed judgments.

**Exceptions to test:**

- Multiple/no IRR roots
- Missing fee
- Rate reset
- Wrong day count
- Covenant waiver after reporting date

**Independent example:** Principal1000 CU x12% x30/360=10 CU contractual interest. Opening AC950 x10% EIR -coupon80 ->closing965 CU.

**Evidence/context:** [ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-INTEREST.

### M21 — Lease liability and right-of-use schedules

**Profile:** Fixed-payment lessee schedule v1. **Original automation links:** AUTO-037.

**Inputs:** Actual lease identification/term; dated fixed payments; approved discount rate; commencement; prepayments/incentives/direct/restoration costs; ROU life.

**Algorithm/steps:**

1. Determine payment timing and exclude payments already paid at initial measurement
2. Liability =sum unpaid payments/(1+periodic rate)^period; preserve rate compounding convention
3. Roll liability by interest and actual payments; ROU opening includes applicable cost adjustments separately
4. Apply approved ROU depreciation period and retain impairment/reassessment/modification as separate supported method or reviewed work

**Human judgment:** Lease definition, exemptions, options, rate, life and modifications require professional conclusions.

**Exceptions to test:**

- Advance payments
- Zero rate
- Monthly annual-rate conversion
- Indexation/modification
- Ownership transfer/life exception

**Independent example:** Two year-end110 CU payments at10% annual ->initial190.91 CU. Year1 interest19.09/payment110 ->liability100.00 CU with declared rounding.

**Evidence/context:** [ACC-IFRS16](https://www.endorsement-board.uk/documents/2148/IFRS_16_-_Leases.pdf); [ACC-IAS16](https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ias-16-property-plant-and-equipment.pdf?bypass=on).

### M22 — Foreign-currency measurement and translation

**Profile:** Rate-role-specific FX calculation. **Original automation links:** AUTO-038 AUTO-043 AUTO-048.

**Inputs:** Transaction/functional/presentation currency; monetary classification; dated rate with direction; foreign amount; carrying amount; framework.

**Algorithm/steps:**

1. Normalize explicit rate direction to functional units per foreign unit
2. Initial transaction amount =foreign amount xselected applicable transaction rate
3. Retranslate monetary closing balances at approved closing rate and compare carrying amount
4. Keep historical nonmonetary, fair-value-date, advance-consideration and foreign-operation translation profiles separate; no blanket closing-rate conversion

**Human judgment:** Functional currency, monetary nature, rate accessibility and P&L/OCI classification require review.

**Exceptions to test:**

- Inverted rate
- Missing rate date
- Nonexchangeability
- Mixed functional currency
- Historical-cost asset at closing rate

**Independent example:** 100 foreign units at3 CU/foreign=300 CU initial;closing monetary rate3.2 ->320 CU,20 CU remeasurement difference before classification.

**Evidence/context:** [ACC-IAS21](https://www.endorsement-board.uk/documents/2167/IAS_21_-_The_Effects_of_Changes_in_Foreign_Exchange_Rates.pdf); DESIGN-FX.

### M23 — Investment income and fair-value input review

**Profile:** Holdings/income bridge and valuation-input evaluation. **Original automation links:** AUTO-040.

**Inputs:** Instrument/units; opening/trades; custodian evidence; prices/date/market/currency; income rights; approved classification and valuation method.

**Algorithm/steps:**

1. Reconcile units/cost/transactions to custodian and GL without substituting custodian completeness for all holdings
2. Recalculate contractual dividend/coupon/simple yield inputs with exact dates and denominator
3. Compare supplied valuation inputs to their source/date and trace calculation
4. Complex fair-value models/classification/market assessment remain reviewed specialist work; quoted input is not an automatic fair-value conclusion

**Human judgment:** Rights, classification, market activity, valuation technique and observable-input appropriateness require evaluation.

**Exceptions to test:**

- Stale quote
- Restricted holding
- Dividend after ex-date without rights
- Corporate action
- Derivative model absent

**Independent example:** 10 units xapproved50 CU=500 CU quoted-value calculation. Dividend2 CU per eligible unit ->20 CU; rights and valuation date still evaluated.

**Evidence/context:** [ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); [ACC-IFRS13](https://standards.aasb.gov.au/aasb-13-dec-2022); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M24 — Expected credit losses and allowances

**Profile:** Approved provision-matrix calculation + separately reviewed ECL models. **Original automation links:** AUTO-013 AUTO-040 AUTO-042.

**Inputs:** Eligible exposure/aging/segments; disjoint specific assessments; approved rates/scenarios/discounting; actual forward-looking support.

**Algorithm/steps:**

1. Choose applicable general versus simplified impairment approach explicitly
2. For supported matrix calculate sum exposure xapproved lifetime loss rate, removing exposures separately assessed from collective double counting
3. For provided cash-flow/scenario model calculate probability-weighted discounted cash shortfalls with probability/unit/horizon checks
4. Reconcile allowance movements; review staging/SICR/default/forward-looking assumptions and model adequacy separately; twelve-month ECL is not twelve months of contractual shortfalls

**Human judgment:** Scope, segmentation, rates, forecast adjustments, staging, collateral and model appropriateness require independent professional evaluation.

**Exceptions to test:**

- Overlapping specific/collective exposure
- Probabilities not summing1
- Rate outside0..1
- Modified/credit-impaired asset
- No forward-looking basis

**Independent example:** Eligible exposures1000 CU at2% plus500 at10% ->allowance70 CU; separately assessed exposure must not also sit in either bucket.

**Evidence/context:** [ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M25 — Nonfinancial asset impairment

**Profile:** Recoverable-amount comparison + controlled valuation support. **Original automation links:** AUTO-042.

**Inputs:** Correct asset/CGU scope; carrying amount; supported VIU and FVLCD; forecasts/rate; goodwill allocations; prior impairment.

**Algorithm/steps:**

1. Separate IAS36 scope from inventory NRV and financial-asset ECL
2. For supported input comparison recoverable=max(VIU,FVLCD); loss=max(0,carrying-recoverable)
3. For a supported discounted model pin dates, pre-tax compatible cash flows/rate and terminal assumptions; require denominator/rate consistency and sensitivity
4. Allocate/reverse only under an explicit approved asset/CGU/goodwill profile; keep impairment facts and subsequent depreciation link

**Human judgment:** CGU identification, forecast plausibility, discount/terminal assumptions, recognition and reversal limits require professional work.

**Exceptions to test:**

- Goodwill reversal
- Scope includes IFRS9 asset
- Growth>=discount rate in perpetuity model
- Unsupported CGU allocation

**Independent example:** Carrying100 CU,VIU80,FVLCD90 ->recoverable90,loss10 CU. This comparison does not independently validate either valuation.

**Evidence/context:** [ACC-IAS36](https://standards.aasb.gov.au/aasb-136-jan-2026); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M26 — Payroll, benefits and gross-to-net

**Profile:** Effective-dated payroll rule-set recalculation. **Original automation links:** AUTO-031 AUTO-032 AUTO-033.

**Inputs:** Employee/run/payment identity; employment/earnings data; approved dated tax/social-insurance brackets/caps/reliefs; benefits obligations.

**Algorithm/steps:**

1. Reconcile authorized roster, gross payroll, deductions, bank payments and GL by run
2. Calculate each earnings/deduction component under explicit dated basis/brackets/caps; separate employee from employer costs
3. Reconcile gross-deductions=net and employer liabilities separately
4. Review leave/bonus/accrual obligations; actuarial defined-benefit work remains separately evidenced; rates are never inferred from this example

**Human judgment:** Employment validity, benefit classification, taxable base, relief and local legal parameters require authority and actual review.

**Exceptions to test:**

- Midperiod hire/leaver
- Threshold/cap crossing
- Duplicate employee bank account
- Retroactive correction
- Defined-benefit obligation

**Independent example:** Fictional gross1000 CU,approved deductions100+50 ->net850 CU. Employer contribution is not subtracted again from employee net.

**Evidence/context:** [ACC-IAS19](https://standards.aasb.gov.au/aasb-119-dec-2022); DESIGN-TAX-PARAMETERS.

### M27 — VAT and withholding reconciliation

**Profile:** Dated VAT/withholding arithmetic and reconciliation. **Original automation links:** AUTO-034.

**Inputs:** Transaction/register/return/GL IDs; approved tax regime/rate/base; inclusion convention; deductible status; period; payments/credits.

**Algorithm/steps:**

1. Calculate tax-exclusive base xrate or tax-inclusive gross xrate/(1+rate) explicitly
2. Apply dated eligibility/rounding/exemption rules and retain unsupported legal classifications
3. Reconcile registers to filed return, GL liability and payments with identified timing adjustments
4. Separate VAT from withholding, reversals and recoverability; discrepancies become investigation cases

**Human judgment:** Applicable rate, taxable event, deduction/exemption and filing obligations are legal/accounting decisions with actual dated authority.

**Exceptions to test:**

- Wrong effective rate
- Exempt versus zero-rated
- Inclusive/exclusive mismatch
- Credit-note period
- Unverified local law

**Independent example:** Fictional10%:gross110 CU ->base100,tax10. This is an arithmetic fixture, not a Mongolian VAT-rate claim.

**Evidence/context:** DESIGN-TAX-PARAMETERS; [AUD-500](https://standards.auasb.gov.au/node/1012).

### M28 — Current and deferred income tax

**Profile:** Approved current/deferred tax schedule arithmetic. **Original automation links:** AUTO-035.

**Inputs:** Accounting profit; approved permanent/timing adjustments; tax base/carrying values; enacted/substantively enacted rates; recognition evidence; return/GL.

**Algorithm/steps:**

1. Bridge accounting to taxable profit with each adjustment identified and approved
2. Calculate current tax/credits under selected law pack and reconcile return/payments
3. Calculate temporary differences and schedule reversals/rates; keep asset/liability sign/classification explicit
4. Recognize DTA only under reviewed criteria and retain exceptions/offset/uncertainty/PillarTwo decisions in separate supported records

**Human judgment:** Tax law, temporary versus permanent differences, recognition, rate on recovery/settlement and offsetting require actual review.

**Exceptions to test:**

- DTA without probable support
- Initial-recognition/goodwill exception
- Uncertain tax treatment
- Rate change
- Unsupported PillarTwo case

**Independent example:** Fictional taxable temporary difference200 CU x20% ->DTL40 CU if applicable. Permanent difference does not create deferred tax.

**Evidence/context:** [ACC-IAS12](https://standards.aasb.gov.au/aasb-112-sep-2023); DESIGN-TAX-PARAMETERS.

### M29 — Equity, reserves and dividends

**Profile:** Equity-class roll-forward and authorization linkage. **Original automation links:** AUTO-039.

**Inputs:** Share/class/holder; opening capital/reserves/retained earnings; approved issues/buybacks/dividends/transfers; legal evidence; GL.

**Algorithm/steps:**

1. Reconcile each equity component separately with signed movements
2. Recalculate shares xnominal/premium under actual instrument terms
3. Link each capital/distribution action to actual resolution/rights and posting evidence
4. Keep retained earnings/OCI transfers and subsequent-declared dividends distinct from reporting-date liabilities

**Human judgment:** Liability-versus-equity classification, lawful distribution, treasury shares and authorization require professional/legal work.

**Exceptions to test:**

- Declared after period end
- Preference share liability features
- Unapproved dividend
- OCI recycled twice

**Independent example:** Retained earnings500 CU +profit100 -approved dividend40 +approved transfer10 =570 CU; other component carries opposite transfer10.

**Evidence/context:** [ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0); [ACC-IAS10](https://standards.aasb.gov.au/aasb-110-mar-2020); DESIGN-EQUITY.

### M30 — Consolidation and intercompany eliminations

**Profile:** Component aggregation and explicit eliminations v1. **Original automation links:** AUTO-043.

**Inputs:** Approved group/control scope; mapped aligned component TBs; currencies/translation; ownership facts; signed elimination journals; reciprocal balances.

**Algorithm/steps:**

1. Retain each component original/mapping/translation independently
2. Aggregate only compatible mapped amounts
3. Apply approved balanced elimination journals once and reconcile unmatched reciprocal balances separately
4. Keep acquisition/NCI/goodwill/unrealized-profit/equity-method work as separately approved schedules rather than plug differences

**Human judgment:** Control, acquisition date, ownership, consolidation policy, impairment and elimination basis require actual review.

**Exceptions to test:**

- 100/95 reciprocal mismatch
- Currency mismatch
- Missing component
- NCI method absent
- Journal copied twice

**Independent example:** A receivable100 CU/B payable95 CU ->5 CU mismatch. Do not automatically erase100 on both sides or create a5 CU plug.

**Evidence/context:** [ACC-IFRS10](https://www.endorsement-board.uk/documents/2158/IFRS_10_-_Consolidated_Financial_Statements.pdf); [ACC-IAS21](https://www.endorsement-board.uk/documents/2167/IAS_21_-_The_Effects_of_Changes_in_Foreign_Exchange_Rates.pdf); [AUD-600](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M31 — Provisions, commitments and contingencies

**Profile:** Provision/contingency register and structured estimate support. **Original automation links:** AUTO-049.

**Inputs:** Matter/obligation; event; legal/constructive basis; probability assessment; estimate/range; timing; discount/reimbursement; legal evidence.

**Algorithm/steps:**

1. Capture obligation and recognition/disclosure assessment separately from numerical estimate
2. For approved large-population expected-value schedule sum probability xoutcome; a single obligation may require a different best estimate
3. Discount when applicable using compatible timing/rate and separate reimbursement asset basis
4. Reconcile opening+new+unwind-used-reversed=closing; unknown exposure remains unknown

**Human judgment:** Present obligation, probability, reliable estimate, best estimate and disclosure are professional/legal conclusions; probability alone is insufficient.

**Exceptions to test:**

- Uncertain obligation
- Onerous contract
- Reimbursement not virtually certain
- Unknown amount
- Range not a probability distribution

**Independent example:** Approved outcomes0 CU at75%,100 CU at25% ->expected value25 CU for a suitable population model; not automatic recognition of a single lawsuit.

**Evidence/context:** [ACC-IAS37](https://standards.aasb.gov.au/aasb-137-jan-2026-0); [AUD-501](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M32 — Going-concern indicators and forecast scenarios

**Profile:** Explicit forecast/liquidity/covenant indicators. **Original automation links:** AUTO-044 AUTO-050.

**Inputs:** Unrestricted cash; dated inflows/outflows; committed facilities/restrictions; maturities; covenant definitions; forecast horizon; approved scenarios.

**Algorithm/steps:**

1. Project dated cash closing =opening+inflows-outflows by scenario
2. Distinguish committed available facilities from hoped-for refinancing
3. Calculate selected ratios/headroom with defined denominators and identify earliest shortfall within supplied horizon
4. Evaluate management assessment and mitigations, sensitivity, material uncertainty, basis and disclosures independently

**Human judgment:** Going-concern basis and material uncertainty are audit/accounting judgments; indicator success cannot make a going-concern opinion.

**Exceptions to test:**

- Restricted cash
- Uncommitted funding
- Short forecast
- Zero burn/denominator
- Covenant failure accelerates debt

**Independent example:** Cash90 CU,net burn30 CU/month and no financing ->illustrative3-month simple runway; dated forecast still governs actual shortfall.

**Evidence/context:** [AUD-570](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-FORECAST.

### M33 — Signed misstatements, correction and exposure aggregation

**Profile:** Canonical signed error/correction evaluation. **Original automation links:** AUTO-048.

**Inputs:** Canonical issue; signed effect lines/account/assertion; currency/period; factual/projected/qualitative class; verified corrections; current materiality.

**Algorithm/steps:**

1. Deduplicate origins by actual economic issue with explicit links, not fuzzy text
2. Maintain signed balances and separate absolute exposure; do not net unrelated errors automatically
3. Calculate verified residual =original effect -verified compatible correction, with projection lineage
4. Evaluate individual/aggregate/prior-period/qualitative effects and current thresholds; disclosure/unknown effects retain narrative decisions

**Human judgment:** Misstatement classification, permissible offset, qualitative materiality and final evaluation require auditor judgment.

**Exceptions to test:**

- Duplicate origins
- Different currencies
- Agreed but unposted correction
- Reversed posting
- Unknown effect coerced to zero

**Independent example:** 100 CU confirmed error,60 CU verified posting ->40 CU outstanding. Gross+100/-80 ->180 gross/20 signed net, neither alone determines materiality.

**Evidence/context:** [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-PROJECTION.

### M34 — Dates, temporal states and retention clocks

**Profile:** Policy-based dates, limited amendment and retention clocks. **Original automation links:** AUTO-045 AUTO-051 AUTO-057 AUTO-058.

**Inputs:** Reporting/report/issue/discovery/assembly dates; jurisdiction/profile; selected policy anchor/period; holds; predecessor/successor.

**Algorithm/steps:**

1. Keep occurrence, discovery, approval, signing, issue and assembly dates distinct
2. For date-limited audit work compare actual coverage-through with required report date
3. Add reviewed calendar durations using explicit leap-day/month-end/timezone policy; calculate longest binding retention deadline and active holds
4. Route later facts by actual chronology; conditional dual dating binds restricted note/procedures and does not reset unrelated work automatically

**Human judgment:** Legal permission for restricted amendment, policy anchor/retention and prevention-of-reliance actions need actual authority.

**Exceptions to test:**

- Leap-day anniversary
- Issue precedes approval
- Multiple holds
- Undated policy
- Backdated procedure

**Independent example:** Fictional policy anchor2026-11-19 plus10 calendar years ->2036-11-19; active hold still denies disposal. This is not a selected statutory deadline.

**Evidence/context:** [AUD-560](https://standards.auasb.gov.au/node/634); [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); D01-LOCAL-LAW.

### M35 — Capacity, budgets and staffing scenario variance

**Profile:** Use completed D02 M35-v1 capacity specification. **Original automation links:** Source workflow/rule support.

**Inputs:** Actual per-person calendar/absence; dated daily allocations; mutually exclusive scenarios; budgets; timesheet completeness.

**Algorithm/steps:**

1. Reuse D02 Capacity_Method_M35.md and independent fixtures without redefining their denominator
2. Available hours exclude actual working-calendar absences; allocation is period/scope-specific
3. Compare baseline/alternative scenarios separately and commit one current alternative atomically
4. Keep missing actuals provisional and preserve prior actual time/authorship on reassignment

**Human judgment:** Working calendar, feasible allocations, suitability and staffing decisions are actual firm judgments; no quality/utilization target is invented.

**Exceptions to test:**

- Zero availability
- Overlapping leave
- Unsubmitted actuals
- Two alternatives added together
- Stale scenario commit

**Independent example:** Available32 hours,allocated40 ->8-hour overbooking and125% allocation/availability; not an audit-quality score. Detailed approved-design examples remain in D02.

**Evidence/context:** D02-M35; [AUD-220R](https://www.irba.co.za/upload/IAASB-International-Standard-Auditing-220-Revised.pdf).

### M36 — Coverage, decision tables, review and authorization rules

**Profile:** Versioned decision/coverage/authority tables. **Original automation links:** AUTO-001 AUTO-007 AUTO-041 AUTO-052 AUTO-053 AUTO-054 AUTO-055 AUTO-056 AUTO-057 AUTO-058.

**Inputs:** Actual actor/appointment/grants; exact object state/version; applicability; source evidence; explicit true/false/unknown/N/A; prior actor history.

**Algorithm/steps:**

1. Evaluate curated decision tables under the selected policy/version
2. Preserve unknown and justified N/A; do not treat blank as false or favorable
3. Distinguish allowed draft actions, positive professional decisions, independent review and irreversible release/disposal guards
4. Retain decision inputs/reason/actor/version; changes invalidate affected reliance and direct routes enforce the same controls

**Human judgment:** Professional judgments remain attributable decisions. Configurable roles cannot waive a nonwaivable rule or required independent review.

**Exceptions to test:**

- Unknown applicability
- Self-review
- Expired grant
- Stale revision
- Exact retry versus changed payload
- Cross-engagement object

**Independent example:** Required current work8 items;7 reviewed and1 justified N/A ->7/7 applicable reviewed, with N/A shown; this is coverage, not quality or assurance.

**Evidence/context:** [ENG-AUTH](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html); [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); D02-SPECIALIST; DESIGN-DECISIONS.

## 5. All22 original fieldwork variants

Each variant keeps its exact source identity/locator/input scenario. Procedure tailoring must disposition every actual pinned source step. Run its existing NORMAL/EXCEPTION/MISSING/UNAUTH/CHANGE IDs, plus native export/history/downstream handoff. No invented source procedure IDs are added.

### P09-UC02-V01 — Intangible assets

**Original source anchors:** `[{"source":"F00788","locator":"3.1.1А!C10:C22","form_id":"FORM-028","title":"Audit program — intangible assets"}]`

**Original scenario:** A newly recorded software/license cost needs support and the year's amortization is being tested.

**Original required inputs:** ["Intangible register and movement list","license/development contracts","costs","approved useful-life/method basis"]

**Actual work sequence:**

1. Inspect contract/legal rights and distinguish purchased from internal development
2. Reconcile costs and available-for-use date
3. Reperform approved finite-life amortization or actual indefinite-life impairment work

**Methods:** M18 M19 M25. **Judgments:** Recognition criteria, finite/indefinite life, development phase and impairment.

**Discriminating matter/example:** Unsupported development cost remains a recognition matter, not just amortization difference.

**Original exceptions retained:** Unapproved development cost; missing rights; indefinite life; later impairment evidence.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IAS38](https://standards.aasb.gov.au/aasb-138-dec-2022-0); [ACC-IAS36](https://standards.aasb.gov.au/aasb-136-jan-2026).

### P09-UC02-V02 — Property, plant and equipment

**Original source anchors:** `[{"source":"F00788","locator":"3.1.2А!C10:C27","form_id":"FORM-029","title":"Audit program — property, plant and equipment"}]`

**Original scenario:** The asset register contains an addition, a disposal and changed depreciation for selected items.

**Original required inputs:** ["Asset register","addition/disposal records","physical inspection record","cost and depreciation assumptions"]

**Actual work sequence:**

1. Trace additions/disposals to evidence and inspect existence/rights
2. Reconcile gross cost, accumulated charges and impairment/revaluation
3. Reperform component/time-based charges and actual disposal gain/loss

**Methods:** M17 M18 M19 M25. **Judgments:** Asset recognition, useful life, residual, revaluation class and ready date.

**Discriminating matter/example:** Cost100/accum30 disposed for80 CU ->carrying70/gain10;all evidence and timing still reviewed.

**Original exceptions retained:** Partial disposal; midyear available-for-use date; revised life; unjustified capitalization.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IAS16](https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ias-16-property-plant-and-equipment.pdf?bypass=on); [ACC-IAS36](https://standards.aasb.gov.au/aasb-136-jan-2026).

### P09-UC02-V03 — Investments

**Original source anchors:** `[{"source":"F00788","locator":"3.1.3А!C10:C24","form_id":"FORM-030","title":"Audit program — investments"}]`

**Original scenario:** An investment movement or changed ownership arrangement requires classification, valuation and disclosure work.

**Original required inputs:** ["Investment register","contracts and ownership/decision rights","investee/custodian information","selected valuation inputs"]

**Actual work sequence:**

1. Reconcile positions/trades/custodian/GL
2. Inspect instrument rights, classification and income
3. Evaluate quoted/model inputs and reperform supported schedules

**Methods:** M20 M23 M24. **Judgments:** Classification, valuation technique/market, impairment and ownership.

**Discriminating matter/example:** Correct500 CU price multiplication with stale input remains unresolved valuation.

**Original exceptions retained:** Stale price; wrong instrument classification; missing rights; unapproved valuation model.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); [ACC-IFRS13](https://standards.aasb.gov.au/aasb-13-dec-2022).

### P09-UC02-V04 — Inventory values and movements

**Original source anchors:** `[{"source":"F00788","locator":"3.1.4А!C10:C25","form_id":"FORM-031","title":"Audit program — inventories"}]`

**Original scenario:** Inventory movement/cost records disagree with the recorded value, or slow/damaged items need evaluation.

**Original required inputs:** ["Item/location movement records","count link","cost method","sales/condition evidence","period boundaries"]

**Actual work sequence:**

1. Attend/evaluate actual inventory count and both-direction tests
2. Reconcile quantity/location/unit and intervening movements
3. Reperform supported cost and item-level NRV with evidence

**Methods:** M14 M15 M16. **Judgments:** Ownership, consignment, eligible cost, method and estimate assumptions.

**Discriminating matter/example:** Quantity difference remains even when ledger total agrees;NRV candidate flows to actual evaluated issue.

**Original exceptions retained:** Count on another date; consignment; transfer in transit; negative stock; obsolete stock.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IAS2](https://www.endorsement-board.uk/documents/2184/IAS_2_-_Inventories.pdf); [AUD-501](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### P09-UC02-V05 — Trade receivables

**Original source anchors:** `[{"source":"F00788","locator":"3.1.5А!C10:C23","form_id":"FORM-032","title":"Audit program — receivables"}]`

**Original scenario:** Selected customer balances need evidence of existence, timing and recoverability.

**Original required inputs:** ["Receivable/sales detail","contracts, invoices and delivery records","subsequent cash","aging/allowance support"]

**Actual work sequence:**

1. Reconcile sales/receivable aging to GL
2. Control confirmations or perform actual approved alternatives
3. Allocate subsequent receipts and evaluate ECL/credits/cut-off

**Methods:** M09 M11 M24. **Judgments:** Rights, response reliability, recoverability and loss assumptions.

**Discriminating matter/example:** Receipt40 against100 CU supports40 after period;does not automatically reduce year-end receivable.

**Original exceptions retained:** Credit balances; partial receipts; disputed invoice; necessary confirmation missing; changed forecast.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); [AUD-505](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### P09-UC02-V06 — Other long-term receivables

**Original source anchors:** `[{"source":"F00788","locator":"3.1.6А!C11:C18","form_id":"FORM-033","title":"Audit program — other long-term receivables"}]`

**Original scenario:** A long-dated balance includes principal and interest that need support and appropriate classification.

**Original required inputs:** ["Receivable agreement","repayment/interest terms","balance/movement detail","support and security where relevant"]

**Actual work sequence:**

1. Inspect long-term contract/right and payment terms
2. Reconcile principal/cash/FX/interest
3. Evaluate approved amortized cost and loss schedule

**Methods:** M20 M22 M24. **Judgments:** SPPI/business model or relevant classification, effective rate, modification and impairment.

**Discriminating matter/example:** Coupon interest agreement does not prove EIR or impairment completeness.

**Original exceptions retained:** Below-market/modified contract; irregular dates; missing discount basis; foreign currency.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); [ACC-IAS21](https://www.endorsement-board.uk/documents/2167/IAS_21_-_The_Effects_of_Changes_in_Foreign_Exchange_Rates.pdf).

### P09-UC02-V07 — Other receivables and prepayments

**Original source anchors:** `[{"source":"F00788","locator":"3.1.7А!C11:C17","form_id":"FORM-034","title":"Audit program — other receivables and prepayments"}]`

**Original scenario:** A prepayment remains open after goods/services should have been received.

**Original required inputs:** ["Advance/prepayment detail","contracts/invoices","payment and settlement evidence","covered service period"]

**Actual work sequence:**

1. Inspect counterparty rights and service/settlement terms
2. Reconcile paid/open balances and cut-off
3. Allocate prepaid service and evaluate recoverability

**Methods:** M09 M12 M22 M24. **Judgments:** Prepayment versus financial receivable, recognition period and disputes.

**Discriminating matter/example:** 120 CU over12 approveduniformmonths with3 consumed ->expense30/prepayment90 CU.

**Original exceptions retained:** Refundable deposit versus service prepayment; expired coverage; credit balance; wrong period.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); DESIGN-P2P.

### P09-UC02-V08 — Cash and cash equivalents

**Original source anchors:** `[{"source":"F00788","locator":"3.1.8А!C10:C23","form_id":"FORM-035","title":"Audit program — cash and cash equivalents"}]`

**Original scenario:** A bank/cash balance differs from a reconciliation or needs rights/restriction evidence.

**Original required inputs:** ["Bank/cash listing","statements","reconciliation","relevant agreements","count/confirmation work when selected"]

**Actual work sequence:**

1. Inspect bank/custodian evidence and restrictions
2. Reconcile bank/GL/reconciling items and transfers
3. Evaluate confirmation replies, cut-off and FX

**Methods:** M13 M22 M23. **Judgments:** Rights, completeness, cash-equivalent classification and restricted availability.

**Discriminating matter/example:** Bank reconciliation residual0 cannot establish authenticity or completeness.

**Original exceptions retained:** Restricted cash; omitted account; in-transit transfer; third-party funds; missing authentic bank record.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [AUD-505](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ACC-IAS21](https://www.endorsement-board.uk/documents/2167/IAS_21_-_The_Effects_of_Changes_in_Foreign_Exchange_Rates.pdf).

### P09-UC02-V09 — Borrowings

**Original source anchors:** `[{"source":"F00788","locator":"3.1.9А!C12:C24","form_id":"FORM-036","title":"Audit program — borrowings"}]`

**Original scenario:** The recorded loan balance and interest must be tested against the actual agreement and movements.

**Original required inputs:** ["Loan agreements","drawdowns/repayments","lender records","rate/day-count terms","collateral/covenant information"]

**Actual work sequence:**

1. Inspect lending contract/confirmation and security
2. Reconcile principal, payments, interest and FX
3. Evaluate covenant compliance and current/noncurrent classification

**Methods:** M20 M22. **Judgments:** Terms, waivers/refinancing dates, EIR and disclosure.

**Discriminating matter/example:** Late waiver cannot silently change reporting-date classification;actual applicable presentation rule governs.

**Original exceptions retained:** Unrecorded borrowing; modification; fee; breach/waiver timing; foreign currency.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); [ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0).

### P09-UC02-V10 — Purchases and trade payables

**Original source anchors:** `[{"source":"F00788","locator":"3.1.10А!C12:C20","form_id":"FORM-037","title":"Audit program — purchases and payables"}]`

**Original scenario:** An invoice, goods receipt and payment do not align, or a later payment may relate to an unrecorded liability.

**Original required inputs:** ["Supplier balances","purchase orders/invoices/receipts","payments","contracts","post-period items"]

**Actual work sequence:**

1. Reconcile supplier register to GL and statements
2. Match selected PO/receipt/invoice/payment lines
3. Search later invoices/payments for unrecorded pre-period liabilities

**Methods:** M12 M22. **Judgments:** Obligation, cut-off, completeness and disputed balances.

**Discriminating matter/example:** Pre-period service/post-period invoice becomes investigated accrual candidate.

**Original exceptions retained:** Unbilled receipt; duplicate indicator; partial delivery; credit note; postperiod payment.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** DESIGN-P2P; [AUD-500](https://standards.auasb.gov.au/node/1012).

### P09-UC02-V11 — Other payables and accruals

**Original source anchors:** `[{"source":"F00788","locator":"3.1.11А!C11:C16","form_id":"FORM-038","title":"Audit program — other payables and accruals"}]`

**Original scenario:** A period-end liability relies on an estimate or a service not yet invoiced.

**Original required inputs:** ["Accrual/other-payable detail","agreements","service evidence","calculation basis","subsequent invoices/payments"]

**Actual work sequence:**

1. Inspect service/benefit/legal obligation and source calculation
2. Reconcile opening/accrual/settlement/reversal
3. Reperform actual period accrual or separately reviewed provision

**Methods:** M12 M26 M31. **Judgments:** Trade accrual versus provision, uncertainty, reversal and estimate basis.

**Discriminating matter/example:** Accrual reversal and actual invoice must not double count expense.

**Original exceptions retained:** Unsupported accrual estimate; reversal without settlement; contingent obligation; duplicate provision.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IAS37](https://standards.aasb.gov.au/aasb-137-jan-2026-0); [ACC-IAS19](https://standards.aasb.gov.au/aasb-119-dec-2022).

### P09-UC02-V12 — Deferred income

**Original source anchors:** `[{"source":"F00788","locator":"3.1.12А!C12:C17","form_id":"FORM-039","title":"Audit program — deferred income"}]`

**Original scenario:** Cash has been received but part of the promised goods/services may remain unperformed.

**Original required inputs:** ["Customer contracts","receipt/invoice detail","delivery/service evidence","deferred-income roll-forward"]

**Actual work sequence:**

1. Read customer/grant agreement and receipt conditions
2. Distinguish contract liability from other deferred/grant obligations
3. Reconcile receipts, approved performance releases and closing balance

**Methods:** M10. **Judgments:** Applicable standard, enforceability, obligations, conditions and timing.

**Discriminating matter/example:** Uniform-time calculator is used only after approved classification/recognition, not for every deferred receipt.

**Original exceptions retained:** Advance cash; refund; modification; unfulfilled obligation; grant misclassified as customer revenue.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IFRS15](https://standards.aasb.gov.au/sites/default/files/2026-11/AASB15_12-14_COMPdec22_07-26.pdf); [ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0).

### P09-UC02-V13 — Intercompany transactions

**Original source anchors:** `[{"source":"F00788","locator":"3.1.13А!C10:C16","form_id":"FORM-040","title":"Audit program — intercompany transactions"}]`

**Original scenario:** Two related entities report different reciprocal balances or a material transaction needs support.

**Original required inputs:** ["Declared related parties","intercompany agreements","reciprocal balance/transaction records","settlement and relevant group data"]

**Actual work sequence:**

1. Identify legal entities and actual relationships
2. Reconcile reciprocal transactions/balances and currency/period differences
3. Review approved elimination and related-party disclosures

**Methods:** M22 M30 M36. **Judgments:** Control, related-party status, group boundary and unrealized-profit treatment.

**Discriminating matter/example:** 100/95 CU reciprocal residual5 remains investigated;no balancing plug.

**Original exceptions retained:** Unconfirmed relationship; different periods/currencies; unrealized profit; unmatched balance.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IFRS10](https://www.endorsement-board.uk/documents/2158/IFRS_10_-_Consolidated_Financial_Statements.pdf); [ACC-IAS21](https://www.endorsement-board.uk/documents/2167/IAS_21_-_The_Effects_of_Changes_in_Foreign_Exchange_Rates.pdf).

### P09-UC02-V14 — Tax balances and expense

**Original source anchors:** `[{"source":"F00788","locator":"3.1.14А!C10:C17","form_id":"FORM-041","title":"Audit program — taxation"}]`

**Original scenario:** Tax return figures and the ledger differ, or a recalculation needs the correct period's rules.

**Original required inputs:** ["Returns","tax-ledger detail","taxable bases/adjustments","applicable approved rate/rule version","payments"]

**Actual work sequence:**

1. Retrieve actual dated tax-rule evidence and approved parameter pack
2. Reconcile registers/returns/payments/GL
3. Reperform applicable VAT/withholding/current/deferred schedules

**Methods:** M27 M28. **Judgments:** Tax scope, exemptions, rates, recoverability, temporary differences and uncertainty.

**Discriminating matter/example:** Fictional examples validate arithmetic only;no local rate is inferred.

**Original exceptions retained:** Threshold/rate change; exempt transaction; tax loss; uncertain position; temporary difference.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IAS12](https://standards.aasb.gov.au/aasb-112-sep-2023); DESIGN-TAX-PARAMETERS.

### P09-UC02-V15 — Capital, reserves and dividends

**Original source anchors:** `[{"source":"F00788","locator":"3.1.15А!C10:C16","form_id":"FORM-042","title":"Audit program — share capital, reserves and dividends"}]`

**Original scenario:** A share movement or dividend affects the equity roll-forward and disclosures.

**Original required inputs:** ["Equity register/ledger","shareholder and issue records","resolutions","dividend/tax support","applicable disclosure basis"]

**Actual work sequence:**

1. Inspect instruments, ownership and actual resolutions
2. Reconcile capital, reserves, retained earnings and dividends
3. Trace authorization, posting and disclosure

**Methods:** M29. **Judgments:** Equity/liability classification, distribution rights and timing.

**Discriminating matter/example:** Share instrument label alone cannot determine equity classification.

**Original exceptions retained:** Proposed versus declared dividend; liability-like instrument; unapproved movement; treasury shares.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0); [ACC-IAS10](https://standards.aasb.gov.au/aasb-110-mar-2020).

### P09-UC02-V16 — Revenue

**Original source anchors:** `[{"source":"F00788","locator":"3.1.16А!C10:C23","form_id":"FORM-043","title":"Audit program — revenue"}]`

**Original scenario:** A selected sale near year-end has delivery/service facts that differ from invoice or posting dates.

**Original required inputs:** ["Sales detail","contract/pricing terms","invoices","delivery/service acceptance","returns and subsequent cash"]

**Actual work sequence:**

1. Reconcile sales/GL and source document completeness
2. Inspect contract obligations, operational control transfer and credits
3. Reperform approved price/discount/time/progress schedule and test cut-off

**Methods:** M10 M11. **Judgments:** Contract, variable consideration, principal/agent, performance and collectability.

**Discriminating matter/example:** Dec31 invoice/Jan2 control transfer must be evaluated against actual terms.

**Original exceptions retained:** Backdated invoice; returns; over-time progress; variable consideration; multiple obligations.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IFRS15](https://standards.aasb.gov.au/sites/default/files/2026-11/AASB15_12-14_COMPdec22_07-26.pdf); [AUD-240](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### P09-UC02-V17 — Cost of sales

**Original source anchors:** `[{"source":"F00788","locator":"3.1.17А!C10:C25","form_id":"FORM-044","title":"Audit program — cost of sales"}]`

**Original scenario:** Recorded cost of sales is inconsistent with relevant inventory movements or selected source costs.

**Original required inputs:** ["Inventory/cost-of-sales records","cost-method basis","selected receipts/issues","related sales and stock support"]

**Actual work sequence:**

1. Reconcile opening inventory, purchases/conversion and closing inventory
2. Reperform supported costing and cost allocation
3. Trace abnormal waste/write-downs and classify income-statement effects

**Methods:** M14 M15 M16. **Judgments:** Cost eligibility, overhead capacity, costing consistency and NRV.

**Discriminating matter/example:** Availablecost240/closing60 ->issues180 CU, with separate relevant adjustments.

**Original exceptions retained:** Overhead under/over-allocation; sales return; inventory write-down; negative stock; timing mismatch.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IAS2](https://www.endorsement-board.uk/documents/2184/IAS_2_-_Inventories.pdf); DESIGN-INVENTORY.

### P09-UC02-V18 — Payroll and employee benefits

**Original source anchors:** `[{"source":"F00788","locator":"3.1.18А!C10:C20","form_id":"FORM-045","title":"Audit program — payroll and employee benefits"}]`

**Original scenario:** Selected payroll amounts differ from contracts, attendance, deductions or actual payment.

**Original required inputs:** ["Payroll register","employee/contract data","attendance","bank payment","applicable deduction/tax rule version","benefit support"]

**Actual work sequence:**

1. Reconcile authorized employees and payroll runs to bank/GL
2. Reperform approved gross-to-net parameters and actual deductions
3. Evaluate leave/bonus/benefit accruals and unusual changes

**Methods:** M26 M07. **Judgments:** Employment validity, law parameters, benefit obligations and actuarial scope.

**Discriminating matter/example:** Employer contributions stay distinct from employee deductions;unknown legal inputs cannot become defaults.

**Original exceptions retained:** Leaver paid; split payroll; off-cycle payment; cap/bracket boundary; benefit obligation.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IAS19](https://standards.aasb.gov.au/aasb-119-dec-2022); DESIGN-TAX-PARAMETERS.

### P09-UC02-V19 — Selling and operating expenses

**Original source anchors:** `[{"source":"F00788","locator":"3.1.19А!C11:C16","form_id":"FORM-046","title":"Audit procedures — selling and operating expenses"}]`

**Original scenario:** A selected expense may belong to another period or lack support for its nature.

**Original required inputs:** ["Expense ledger","contracts/invoices","payment and service/delivery evidence","period/cost-center basis"]

**Actual work sequence:**

1. Trace services/contracts/invoices and later settlement
2. Test cut-off, accruals, prepaid allocations and capitalization candidates
3. Reconcile analytical expectations with actual corroboration

**Methods:** M07 M12 M19. **Judgments:** Expense classification, service receipt, related parties and capitalization.

**Discriminating matter/example:** Large repair is not automatically capital asset;prepayment release requires actual period basis.

**Original exceptions retained:** Multi-period service; personal expense indicator; capitalization candidate; missing receipt.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** DESIGN-P2P; [ACC-IAS16](https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ias-16-property-plant-and-equipment.pdf?bypass=on); [AUD-520](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### P09-UC02-V20 — Other income-statement or comprehensive-income items

**Original source anchors:** `[{"source":"F00788","locator":"3.1.20А!C11:C15","form_id":"FORM-047","title":"Audit procedures — other income-statement items"}]`

**Original scenario:** A revaluation or foreign-exchange-related item needs support for its nature and presentation.

**Original required inputs:** ["Relevant transactions/ledger","valuation or FX support","classification/presentation basis","related asset/liability evidence"]

**Actual work sequence:**

1. Identify each underlying unusual/other transaction and applicable standard
2. Reconcile disposal/FX/valuation/reserve effects with originating schedules
3. Test presentation, recycling and disclosures without duplicate effects

**Methods:** M02 M22 M23 M29. **Judgments:** Substance, P&L/OCI classification and recycling.

**Discriminating matter/example:** OCI reserve transfer cannot also be added as new group profit.

**Original exceptions retained:** FX translation reserve; fair-value change; inappropriate recycling; duplicated presentation.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0); [ACC-IAS21](https://www.endorsement-board.uk/documents/2167/IAS_21_-_The_Effects_of_Changes_in_Foreign_Exchange_Rates.pdf); [ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0).

### P09-UC02-V21 — Finance costs

**Original source anchors:** `[{"source":"F00788","locator":"3.1.21А!C11:C16","form_id":"FORM-048","title":"Audit program — finance costs"}]`

**Original scenario:** Interest/fees or a financing-related cost needs recalculation and classification.

**Original required inputs:** ["Loan/bond/lease terms","rate/period/day-count inputs","fee schedules","payments","capitalized-cost support"]

**Actual work sequence:**

1. Inspect loan/bond/lease terms, fee schedules and actual payment dates
2. Separately reperform coupon/accrual, EIR, lease interest and FX components
3. Trace qualifying-asset capitalization and residual finance-expense presentation

**Methods:** M20 M21 M22 M19. **Judgments:** Contractual versus effective interest, lease liability, borrowing-cost capitalization and FX classification.

**Discriminating matter/example:** 1000 CU x12%x30/360 gives10 CU contractual interest;it cannot also be counted as new EIR fee amortization without a reconciled bridge.

**Original exceptions retained:** Accrued fee; modification; qualifying asset; FX effect; wrong expense classification.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); [ACC-IFRS16](https://www.endorsement-board.uk/documents/2148/IFRS_16_-_Leases.pdf); [ACC-IAS23](https://standards.aasb.gov.au/aasb-123-mar-2020); [ACC-IAS21](https://www.endorsement-board.uk/documents/2167/IAS_21_-_The_Effects_of_Changes_in_Foreign_Exchange_Rates.pdf).

### P09-UC02-V22 — Other income and expenses

**Original source anchors:** `[{"source":"F00788","locator":"3.1.22А!C11:C15","form_id":"FORM-049","title":"Audit program — other income and expenses"}]`

**Original scenario:** A one-off grant, penalty, fee or other transaction needs an appropriate accounting basis.

**Original required inputs:** ["Underlying agreement/notice","transaction detail","receipts/payments","relevant conditions and period"]

**Actual work sequence:**

1. Decompose each grant, penalty, compensation, disposal or one-off transaction
2. Inspect actual agreement/notice, receipts/payments, conditions and relevant period
3. Select the transaction-specific accounting basis and reperform its schedule/presentation

**Methods:** M02 M07 M12 M23 M31. **Judgments:** There is no universal other-income recognition rule;grant conditions, netting and unusual-item classification require actual evaluation.

**Discriminating matter/example:** Disposal proceeds80/carrying70 CU yield gain10 only after derecognition/rights/timing evidence;grant receipt alone does not prove earned income.

**Original exceptions retained:** Disposal gain; grant; compensation; unusual one-off item; unsupported net presentation.

**Handoff:** actual work -> independent review -> canonical issue/correction -> final assessment -> opinion/report consequence. **Evidence/context:** [AUD-500](https://standards.auasb.gov.au/node/1012); [ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0); [ACC-IAS37](https://standards.aasb.gov.au/aasb-137-jan-2026-0); DESIGN-AREAS.

## 6. All58 original automation minimums

The original minimum, human responsibility and boundary are retained verbatim from the user project register. Authored implementation detail and expected cases follow each. Every card also needs a missing/unsupported, denied-role and changed-source case; these supplement rather than replace its actual original obligation. Pending future extensions remain separate.

### AUTO-001 — Evidence coverage monitoring

**Original minimum:** Show whether every approved evidence request has an accepted item for the intended entity and reporting period.

**Original inputs:** Required: request identifier, evidence type, entity, reporting period, linked evidence identifier and acceptance status. Optional: alternative-evidence rationale.

**Original human responsibility:** Define the required evidence, accept or reject submitted items, assess sufficiency and approve any alternative source.

**Original boundary:** The baseline does not inspect document contents, combine partial date intervals or conclude that accepted evidence is sufficient and appropriate.

**Proposed implementation/delta:** Use actual approved request-item entity/period/type/purpose and independently accepted alternatives; retain partial interval boundary.

**Expected distinguishing case:** One accepted2025 file against a2026 request ->missing for2026, not covered.

**Methods:** M01 M36. **Owning guide:** G03. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-001]`. **Original source:** F00010 p.2, card 1; F00011 matching card 1; F00009/F00012 catalogue entry 1.

### AUTO-002 — Dataset conformance and scope validation

**Original minimum:** Determine whether an uploaded structured dataset has the required structure and belongs to the selected engagement scope.

**Original inputs:** Required: source dataset, approved import profile, column mapping, engagement entity and reporting dates. Optional: currency, sign and evidence-role rules.

**Original human responsibility:** Select or approve the import profile, map source columns, confirm entity and period, and resolve or accept data defects.

**Original boundary:** The baseline does not prove source completeness, reconcile control totals, infer ambiguous formats or validate whether transactions are economically valid.

**Proposed implementation/delta:** Retain original/raw row, explicit mapping/date/sign/unit schema and row-specific defects; add controlled XLSX reader using the same typed contract.

**Expected distinguishing case:** Ambiguous03/04/2026 without selected date format ->quarantined, never guessed.

**Methods:** M01. **Owning guide:** G03. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-002]`. **Original source:** F00010 p.2, card 2; F00011 matching card 2; F00009/F00012 catalogue entry 2.

### AUTO-003 — Population integrity and import reconciliation

**Original minimum:** Demonstrate that a structured population reached the audit workspace without unexplained loss, duplication or total-value change.

**Original inputs:** Required: imported rows, source record count, available independent control totals and declared unique key. Optional: documented exclusion reasons.

**Original human responsibility:** Obtain or certify source controls, define the business key, explain exclusions and decide whether unresolved differences limit reliance.

**Original boundary:** The baseline covers one source-to-import stage. It does not reconstruct complex joins, prove controls generated by the same file are independent or perform fuzzy duplicate detection.

**Proposed implementation/delta:** Reconcile full-source count and signed amount with disjoint row dispositions and independent control evidence.

**Expected distinguishing case:** Certified4 rows/80 CU versus3 rows/80 CU ->count residual1, no usable-completeness approval.

**Methods:** M01. **Owning guide:** G03. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-003]`. **Original source:** F00010 p.3, card 3; F00011 matching card 3; F00009/F00012 catalogue entry 3.

### AUTO-004 — Master-data and identifier consistency

**Original minimum:** Identify transactions whose account, customer, supplier, employee, item or currency identifier cannot be resolved unambiguously to the supplied master data.

**Original inputs:** Required: transaction identifier, master identifier and authoritative master table. Required for historical matching: transaction date and master validity dates.

**Original human responsibility:** Select the authoritative master, approve aliases or crosswalks, investigate ambiguous records and determine the audit effect of weak master data.

**Original boundary:** The baseline does not infer identity from free-text names, consult external registries or automatically choose among conflicting master records.

**Proposed implementation/delta:** Join exact dated master identity with ambiguity detection and optional approved alias crosswalk.

**Expected distinguishing case:** Two simultaneously valid supplier masters ->ambiguous; amount counted once, no duplicated join total.

**Methods:** M01. **Owning guide:** G03. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-004]`. **Original source:** F00010 p.3, card 4; F00011 matching card 4; F00009/F00012 catalogue entry 4.

### AUTO-005 — Ledger and trial-balance integrity

**Original minimum:** Confirm that the trial balance rolls forward correctly, balances under the declared sign convention and agrees with detailed ledger movements.

**Original inputs:** Required: trial-balance account, opening, debit, credit and closing fields; detailed ledger account, posting date and debit-credit amounts when ledger reconciliation is run.

**Original human responsibility:** Map fields, confirm the sign convention, period and population completeness, set rounding tolerance and investigate differences.

**Original boundary:** The baseline does not translate currencies, infer opening-only journals, handle consolidation adjustments or claim that a selected-account extract represents a complete ledger.

**Proposed implementation/delta:** Compare TB roll-forward and detailed GL debit/credit at declared account grain and complete/selected scope.

**Expected distinguishing case:** Opening100,debit20,credit10,recorded closing111 CU ->expected110, expected-minus-recorded=-1 CU.

**Methods:** M01. **Owning guide:** G03. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-005]`. **Original source:** F00010 p.4, card 5; F00011 matching card 5; F00009/F00012 catalogue entry 5.

### AUTO-006 — Account mapping and financial-statement bridge

**Original minimum:** Trace every in-scope closing balance through an approved account mapping to the corresponding financial-statement line.

**Original inputs:** Required: final trial balance, account-to-line mapping, presentation sign, financial-statement line values and displayed unit.

**Original human responsibility:** Own and approve the mapping, resolve unusual signs and determine whether non-ledger schedules or adjustments are appropriate.

**Original boundary:** The baseline does not support split allocations, effective-dated mapping changes, non-ledger schedules or automatically extract figures from unstructured statements.

**Proposed implementation/delta:** Preserve original one-primary-destination minimum; add separately versioned split-allocation profile without overwriting its historical boundary.

**Expected distinguishing case:** Source100 split60/40 plus repeated note100 ->primary100; two60 allocations ->20 CU excess exception.

**Methods:** M02. **Owning guide:** G03. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-006]`. **Original source:** F00010 p.4, card 6; F00011 matching card 6; F00009/F00012 catalogue entry 6.

### AUTO-007 — Financial-statement technical and comparative review

**Original minimum:** Identify mathematical, reference and repeated-value inconsistencies in a controlled financial-statement and notes package.

**Original inputs:** Required: one controlled statement version containing structured nodes, amounts, periods, units, formulas and exact references. Optional: approved rounding schedule.

**Original human responsibility:** Provide or approve the statement structure, formulas, repeated-value links and comparative basis, then resolve presentation and disclosure implications.

**Original boundary:** The baseline does not infer equivalent disclosures from similar wording, determine disclosure completeness or assess whether accounting classifications are substantively correct.

**Proposed implementation/delta:** Cast declared acyclic statements and exact notes/repeated-value references under declared sign/scale.

**Expected distinguishing case:** Statement expected300/recorded299 CU ->difference+1; missing reference remains missing, not zero.

**Methods:** M02 M36. **Owning guide:** G03. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-007]`. **Original source:** F00010 p.5, card 7; F00011 matching card 7; F00009/F00012 catalogue entry 7.

### AUTO-008 — Opening-balance reconciliation

**Original minimum:** Show whether each current-period opening balance agrees with the corresponding prior audited closing balance after approved opening adjustments.

**Original inputs:** Required: prior audited closing trial balance, current opening trial balance, common account identifier or approved crosswalk, entity and currency.

**Original human responsibility:** Select the authoritative prior audited balance, approve account crosswalks and opening adjustments, and determine follow-up for unresolved differences.

**Original boundary:** The baseline does not evaluate comparative disclosures, automatically carry forward prior findings or resolve foreign-currency and business-combination adjustments.

**Proposed implementation/delta:** Compare approved prior closing to current opening with explicit crosswalk and approved adjustments.

**Expected distinguishing case:** Prior100+approved opening adjustment5/current opening104 CU ->unexplained1 CU; prior audited evidence still evaluated.

**Methods:** M01. **Owning guide:** G03. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-008]`. **Original source:** F00010 p.5, card 8; F00011 matching card 8; F00009/F00012 catalogue entry 8.

### AUTO-009 — Journal-entry analysis workspace

**Original minimum:** Run a small set of explainable risk filters over a complete journal population and investigate the resulting entries in one case list.

**Original inputs:** Required: journal and line identifiers, entity, effective date, account, debit-credit or signed functional amount, reporting dates and selected rule parameters.

**Original human responsibility:** Confirm population completeness, select applicable filters and thresholds, investigate supporting evidence and conclude whether each case is legitimate or misstated.

**Original boundary:** The baseline excludes near-duplicate text matching, journal-number sequences, user rarity, sensitive account combinations, segregation conflicts and rapid reversal analysis.

**Proposed implementation/delta:** Reconcile complete journal population; retain candidate rule/reason/evidence and actual investigation.

**Expected distinguishing case:** One journal hits round-amount and late-posting rules ->one case with two reasons, no fraud assertion.

**Methods:** M08. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-009]`. **Original source:** F00010 p.6, card 9; F00011 matching card 9; F00009/F00012 catalogue entry 9.

### AUTO-010 — Analytical review workspace

**Original minimum:** Compare current results with an auditor-approved expectation and preserve significant unexplained movements for investigation and final review.

**Original inputs:** Required: account or statement-line values for comparable periods, approved analytical relationships and investigation thresholds. Optional: budgets and non-financial drivers.

**Original human responsibility:** Choose relevant relationships, establish expectations and thresholds, evaluate management explanations and make the planning or final analytical conclusion.

**Original boundary:** The baseline does not generate expectations automatically, model seasonality, forecast balances or decide whether an explanation is audit evidence.

**Proposed implementation/delta:** Use approved comparable expectation/ratio and explicit zero-denominator outcome; distinguish preliminary/final from substantive work.

**Expected distinguishing case:** Actual120/expected100 CU ->20 CU/20%; missing corroboration leaves substantive deviation unresolved.

**Methods:** M07. **Owning guide:** G03. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-010]`. **Original source:** F00010 p.6, card 10; F00011 matching card 10; F00009/F00012 catalogue entry 10.

### AUTO-011 — Sales-population integrity and reconciliation

**Original minimum:** Establish that the uploaded sales register agrees with ledger revenue and does not contain missing identifiers or exact duplicate invoices.

**Original inputs:** Required: invoice and line identifiers, posting date, revenue account, signed amount, customer and ledger or trial-balance revenue totals.

**Original human responsibility:** Confirm the sales population and account mapping, define the invoice business key, explain differences and determine whether exceptions require substantive testing.

**Original boundary:** The baseline does not test invoice sequence completeness, fuzzy economic duplicates, zero or negative commercial validity, cut-off or revenue recognition.

**Proposed implementation/delta:** Reconcile sales register to mapped ledger revenue and inspect stable IDs/exact duplicate payloads.

**Expected distinguishing case:** Sales100+100 CU same invoice ID ->duplicate candidate retained; removing one without disposition forbidden.

**Methods:** M01. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-011]`. **Original source:** F00010 p.7, card 11; F00011 matching card 11; F00009/F00012 catalogue entry 11.

### AUTO-012 — Revenue cut-off and credit-note review

**Original minimum:** Identify sales whose invoice, delivery or posting dates indicate possible recording in the wrong period and credits linked to year-end sales.

**Original inputs:** Required: invoice identifier, invoice date, posting date, delivery or acceptance date when relevant, amount and reporting date. Credit review also requires original-invoice reference.

**Original human responsibility:** Define the relevant performance evidence and window, investigate the transaction and determine the correct recognition period and any misstatement.

**Original boundary:** The baseline does not interpret contract terms, infer delivery from unstructured documents, fuzzy-match unreferenced credits or conclude when control transferred.

**Proposed implementation/delta:** Compare invoice/delivery/control/posting dates and exact subsequent credit links under selected cut-off window.

**Expected distinguishing case:** Dec31 invoice/Jan2 transfer of control ->candidate needing evaluation; invoice date alone cannot force recognition.

**Methods:** M11. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-012]`. **Original source:** F00010 p.7, card 12; F00011 matching card 12; F00009/F00012 catalogue entry 12.

### AUTO-013 — Receivables aging and subsequent-cash matching

**Original minimum:** Recalculate invoice aging at the reporting date and show which balances are supported by explicitly referenced subsequent receipts.

**Original inputs:** Required: invoice identifier, customer, invoice and due dates, open amount, reporting date, receipt date, receipt amount and invoice reference.

**Original human responsibility:** Approve aging buckets and the cash cut-off date, investigate unmatched items and evaluate whether subsequent collection supports recoverability.

**Original boundary:** The baseline does not allocate unreferenced cash, estimate credit losses, evaluate disputes or treat receipt after year-end as conclusive evidence of valuation.

**Proposed implementation/delta:** Age at reporting date and allocate referenced subsequent receipts once; keep allowance model separate.

**Expected distinguishing case:** Invoice100 CU/subsequent receipt40 ->year-end book100,subsequent support40,unsettled60 CU.

**Methods:** M09 M24. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-013]`. **Original source:** F00010 p.8, card 13; F00011 matching card 13; F00009/F00012 catalogue entry 13.

### AUTO-014 — Sales pricing and discount compliance

**Original minimum:** Identify invoice lines whose recorded amount, price or discount differs from approved commercial terms supplied for testing.

**Original inputs:** Required: invoice and line identifiers, quantity, unit price, discount, recorded line amount and approved price or discount reference.

**Original human responsibility:** Select the authoritative price and discount terms, approve any exceptions, inspect commercial evidence and decide whether a variance is a misstatement or valid arrangement.

**Original boundary:** The baseline does not extract terms from contracts, calculate complex rebates, optimize pricing or determine whether non-standard terms are commercially appropriate.

**Proposed implementation/delta:** Calculate line amount under dated approved price/discount and tax-base order.

**Expected distinguishing case:** 10x20 CU less10% ->180 CU before tax; recorded190 ->expected-minus-recorded=-10 CU.

**Methods:** M11. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-014]`. **Original source:** F00010 p.8, card 14; F00011 matching card 14; F00009/F00012 catalogue entry 14.

### AUTO-015 — Revenue-recognition schedule recalculation

**Original minimum:** Recalculate a straight-line time-based revenue schedule from approved contract dates and compare it with recorded period revenue.

**Original inputs:** Required: contract identifier, approved transaction amount, service start and end dates, reporting period, recorded recognized amount and selected allocation convention.

**Original human responsibility:** Confirm that the supported method applies, approve contract dates, amount and allocation convention, and make all recognition and contract-accounting judgments.

**Original boundary:** The baseline excludes performance-obligation identification, standalone selling-price allocation, milestone evidence, variable consideration and contract modifications.

**Proposed implementation/delta:** Retain uniform approved time-based contract schedule with exact full-month/day convention and separate recognition judgment.

**Expected distinguishing case:** 1200 CU/12 approved uniform months,3 earned ->300 CU; partial month under full-month-only profile ->unsupported.

**Methods:** M10. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-015]`. **Original source:** F00010 p.9, card 15; F00011 matching card 15; F00009/F00012 catalogue entry 15.

### AUTO-016 — Purchases and payments population review

**Original minimum:** Reconcile the purchase register to ledger expense or payable movements and identify exact duplicate supplier invoices or payments.

**Original inputs:** Required: supplier, invoice identifier and date, payment identifier and date, account, signed amount and ledger or trial-balance control totals.

**Original human responsibility:** Confirm population completeness and mappings, define duplicate keys, investigate supporting documents and determine whether repeated items are legitimate or misstated.

**Original boundary:** The baseline does not perform fuzzy matching, detect split or redirected payments, reconcile the full document chain or infer fraud from duplicate indicators.

**Proposed implementation/delta:** Reconcile purchase/payment registers and exact supplier-invoice/payment duplicate candidates at correct grain.

**Expected distinguishing case:** 100 CU invoice with60+40 partial payments ->not duplicate100 CU payments and no200 CU exposure.

**Methods:** M01 M12. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-016]`. **Original source:** F00010 p.9, card 16; F00011 matching card 16; F00009/F00012 catalogue entry 16.

### AUTO-017 — Supplier and payee identity-risk analysis

**Original minimum:** Surface counterparties that share exact or normalized identifiers and show the transactions exposed to those relationships.

**Original inputs:** Required: supplier identifier, legal name and at least one reliable registration number or bank account. Optional: address, contact data and payment history.

**Original human responsibility:** Confirm authoritative identifiers, investigate ownership and commercial relationships, approve legitimate shared accounts and determine the audit response.

**Original boundary:** The baseline does not establish beneficial ownership, search external registries, infer relationships from unrestricted text or make a fraud or related-party conclusion.

**Proposed implementation/delta:** Apply exact or explicitly trim/uppercase identity normalization, preserving significant punctuation; report candidates only.

**Expected distinguishing case:** One transaction300 CU belongs to two shared-attribute clusters ->exposure300 once; relationship unconfirmed.

**Methods:** M12. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-017]`. **Original source:** F00010 p.10, card 17; F00011 matching card 17; F00009/F00012 catalogue entry 17.

### AUTO-018 — Procure-to-pay document matching

**Original minimum:** Show whether each selected purchase can be traced through purchase order, receipt, invoice and payment records using stable source identifiers.

**Original inputs:** Required: structured order, receipt, invoice and payment records with stable document and line identifiers, quantities, amounts and currencies.

**Original human responsibility:** Confirm source-system relationships and tolerances, investigate missing or inconsistent documents and decide whether exceptions indicate error or control failure.

**Original boundary:** The baseline requires structured records and exact identifiers. It does not read scanned documents, infer links from descriptions or support undocumented many-to-many transformations.

**Proposed implementation/delta:** Use stable line keys across PO, receipt, invoice and payment; retain partial quantities/payments and missing-chain states.

**Expected distinguishing case:** PO10 units,receipts6+4 ->10 received; invoice header amount not multiplied across both receipts.

**Methods:** M12. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-018]`. **Original source:** F00010 p.10, card 18; F00011 matching card 18; F00009/F00012 catalogue entry 18.

### AUTO-019 — Payables cut-off and unrecorded-liability review

**Original minimum:** Identify pre-period receipts or services and post-period invoices or payments that may indicate an omitted or late-recorded year-end liability.

**Original inputs:** Required: supplier, receipt or service date, invoice date, posting date, payment date, document references, amounts and year-end payable or accrual records.

**Original human responsibility:** Define the look-back and look-forward windows, evaluate when the obligation arose, inspect evidence and conclude whether a liability or cut-off misstatement exists.

**Original boundary:** The baseline does not infer obligations from unstructured contracts, fuzzy-match unsupported records, calculate accrual estimates or conclude that unmatched payments prove omission.

**Proposed implementation/delta:** Search pre-period receipt/service and later invoice/payment links with dated window and actual obligation assessment.

**Expected distinguishing case:** Service deliveredDec29/invoiceJan4/paymentJan10 ->year-end liability candidate, not automatic posting.

**Methods:** M12. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-019]`. **Original source:** F00010 p.11, card 19; F00011 matching card 19; F00009/F00012 catalogue entry 19.

### AUTO-020 — Bank matching and reconciliation

**Original minimum:** Match structured bank-statement lines to cash-ledger entries and recalculate the arithmetic of a supplied period-end bank reconciliation.

**Original inputs:** Required: bank account, statement date, transaction date, amount, currency and reference; ledger cash entries; and the supplied reconciliation balance and items.

**Original human responsibility:** Confirm bank-account scope and matching window, approve matches, investigate stale or unsupported reconciling items and assess the reliability of the reconciliation.

**Original boundary:** The baseline does not connect directly to banks, perform complex many-to-many matching, recalculate foreign exchange or infer missing fees and interest automatically.

**Proposed implementation/delta:** Match bank/GL under supported exact keys and independently recompute both reconciliation sides.

**Expected distinguishing case:** Bank100+transit20-cheque5=115 CU;book115 ->arithmetic reconciles; missing cheque support still open.

**Methods:** M13. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-020]`. **Original source:** F00010 p.11, card 20; F00011 matching card 20; F00009/F00012 catalogue entry 20.

### AUTO-021 — Cash movement and payment-risk analytics

**Original minimum:** Identify large, round or period-end cash transactions and exact inter-account transfer pairs for targeted audit investigation.

**Original inputs:** Required: cash transaction identifier, account, date, amount, currency, reference and reporting date. Transfer matching also requires known internal bank accounts.

**Original human responsibility:** Set justified thresholds, confirm the population and company accounts, investigate authorization and business purpose, and conclude whether each case is valid.

**Original boundary:** The baseline does not model normal behavior, verify approval limits, perform fuzzy payment matching or determine whether unusual timing indicates fraud.

**Proposed implementation/delta:** Run explicit amount/round/timing rules and supported exact reciprocal transfers with canonical event identities.

**Expected distinguishing case:** Transfer100 CU has out/in legs; candidate event count1 and gross event exposure100, not200 CU.

**Methods:** M08 M13. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-021]`. **Original source:** F00010 p.12, card 21; F00011 matching card 21; F00009/F00012 catalogue entry 21.

### AUTO-022 — Inventory register and movement integrity

**Original minimum:** Confirm that inventory quantities and values roll forward by item and that the closing register agrees with the corresponding ledger balance.

**Original inputs:** Required: item and movement identifiers, date, movement type, quantity, unit, recorded value, opening and closing quantities, location where used, and mapped ledger balance.

**Original human responsibility:** Confirm the inventory scope, movement types, units and account mapping, explain adjustments and determine whether identified cases require further testing.

**Original boundary:** The baseline does not recalculate unit cost, convert incompatible units, infer undocumented movement types or evaluate the business purpose of adjustments.

**Proposed implementation/delta:** Reconcile quantity/value movements by item/location/unit and mapped ledger control.

**Expected distinguishing case:** 10+5-8=7 units;recorded8 ->quantity residual1, no costing success can hide it.

**Methods:** M01 M14. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-022]`. **Original source:** F00010 p.12, card 22; F00011 matching card 22; F00009/F00012 catalogue entry 22.

### AUTO-023 — Inventory-count reconciliation

**Original minimum:** Compare signed count quantities with the inventory register and show every unresolved difference for the counted items and locations.

**Original inputs:** Required: controlled count sheet, count date, item, location, counted quantity, book quantity and unit. Optional: recount and approved adjustment references.

**Original human responsibility:** Establish the count scope, assess observation evidence and count-sheet reliability, approve mappings or adjustments and conclude on existence and condition.

**Original boundary:** The baseline does not prove that the physical count was properly performed, assess inventory condition, extrapolate omitted locations or replace auditor observation.

**Proposed implementation/delta:** Compare actual signed count and register by exact counted scope; retain unobserved items separately.

**Expected distinguishing case:** Register7/count6 units ->difference1;uncounted warehouse remains unobserved, not zero-difference.

**Methods:** M14. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-023]`. **Original source:** F00010 p.13, card 23; F00011 matching card 23; F00009/F00012 catalogue entry 23.

### AUTO-024 — Inventory cut-off and transfer consistency

**Original minimum:** Identify receipts, dispatches and internal transfers around year-end whose logistics and accounting dates are inconsistent with the selected cut-off rules.

**Original inputs:** Required: movement or transfer identifier, item, location, quantity, logistics date, posting date, transaction type and reporting date.

**Original human responsibility:** Select the relevant logistics date and window, investigate terms and source evidence, and determine the correct inventory and related purchase or sales period.

**Original boundary:** The baseline does not interpret shipping terms, infer event dates from documents, convert incompatible units or conclude that a timing difference is a misstatement.

**Proposed implementation/delta:** Compare logistics/accounting dates and both legs of item/location transfers.

**Expected distinguishing case:** DispatchDec31/receiptJan2 ->in-transit/cut-off investigation; not a group purchase/sale by default.

**Methods:** M14. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-024]`. **Original source:** F00010 p.13, card 24; F00011 matching card 24; F00009/F00012 catalogue entry 24.

### AUTO-025 — Inventory costing and cost-of-sales recalculation

**Original minimum:** Recalculate inventory issue cost and closing value under a supported periodic weighted-average method and compare them with recorded inventory and cost of sales.

**Original inputs:** Required: opening quantity and cost, purchase quantities and costs, issue and closing quantities, reporting period, recorded inventory value and recorded cost of sales.

**Original human responsibility:** Confirm that the supported method matches the entity's approved policy, map movement types and investigate all cost and ledger variances.

**Original boundary:** The baseline does not support FIFO, moving average, standard cost, overhead absorption, joint products, write-downs or changes in costing method.

**Proposed implementation/delta:** Retain periodic weighted-average supported algorithm and separately compare issue cost and closing value.

**Expected distinguishing case:** 10units/100 CU +10/140;issue15 ->COS180,closing5units/60 CU.

**Methods:** M15. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-025]`. **Original source:** F00010 p.14, card 25; F00011 matching card 25; F00009/F00012 catalogue entry 25.

### AUTO-026 — Inventory obsolescence and NRV indicators

**Original minimum:** Identify slow or non-moving items and items whose recorded cost exceeds an auditor-supplied net realizable value input.

**Original inputs:** Required: item, quantity, cost, last qualifying movement date and reporting date. NRV comparison additionally requires approved selling-price and completion or disposal-cost inputs.

**Original human responsibility:** Define qualifying movements and thresholds, validate selling and disposal-cost evidence, challenge assumptions and make the write-down and valuation conclusion.

**Original boundary:** The baseline does not forecast future sales, infer obsolete condition, derive market prices or calculate a final write-down without approved valuation inputs.

**Proposed implementation/delta:** Compute movement indicators and cost-versus-supplied-NRV; keep selling/completion costs and estimate review explicit.

**Expected distinguishing case:** Cost12,price11,completion1,selling1 CU ->NRV9 and3 CU/unit write-down candidate.

**Methods:** M16. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-026]`. **Original source:** F00010 p.14, card 26; F00011 matching card 26; F00009/F00012 catalogue entry 26.

### AUTO-027 — Asset-register roll-forward and ledger reconciliation

**Original minimum:** Recalculate cost and accumulated depreciation or amortization roll-forwards and reconcile closing register balances with the ledger by asset class.

**Original inputs:** Required: asset identifier and class, opening cost and accumulated charge, additions, disposals, transfers, current charge, closing values and mapped ledger balances.

**Original human responsibility:** Confirm movement classifications and account mappings, approve legitimate adjustments and determine whether register or ledger differences affect the audit.

**Original boundary:** The baseline does not test depreciation methods, physical existence, impairment, revaluation, component accounting or whether additions meet capitalization criteria.

**Proposed implementation/delta:** Reconcile gross cost and accumulated charges separately, with disposal/transfer/revaluation evidence.

**Expected distinguishing case:** Cost1100/accum370 CU ->carrying730 before impairment; net-only input cannot prove both roll-forwards.

**Methods:** M17. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-027]`. **Original source:** F00010 p.15, card 27; F00011 matching card 27; F00009/F00012 catalogue entry 27.

### AUTO-028 — Depreciation and amortization recalculation

**Original minimum:** Recalculate straight-line depreciation or finite-life amortization for each asset and compare the expected period charge and closing accumulation with recorded amounts.

**Original inputs:** Required: asset identifier, class, cost, residual value, useful life or rate, in-service and disposal dates, recorded period charge and reporting dates.

**Original human responsibility:** Confirm the accounting method, useful life, residual value, in-service date and treatment of unusual assets, then evaluate whether variances are misstatements.

**Original boundary:** The baseline supports straight-line finite-life schedules only. It excludes declining-balance, units-of-production, components, revaluation, impairment and indefinite-life assessment.

**Proposed implementation/delta:** Use actual available-for-use/disposal overlap, life/residual and remaining-base cap under supported convention.

**Expected distinguishing case:** Annual300 CU,approvedhalf-year ->150;remaining100 ->charge capped100 CU with explicit basis.

**Methods:** M18. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-028]`. **Original source:** F00010 p.15, card 28; F00011 matching card 28; F00009/F00012 catalogue entry 28.

### AUTO-029 — Asset lifecycle and useful-life analysis

**Original minimum:** Flag asset-register conditions that conflict with recorded status or approved useful-life and rate ranges.

**Original inputs:** Required: asset identifier, class, status, acquisition and disposal dates, cost, accumulated charge, carrying amount and approved life or rate range.

**Original human responsibility:** Maintain the asset-class policy ranges, investigate continued use and disposal evidence, inspect physical existence where required and decide whether estimates or records need revision.

**Original boundary:** The baseline does not verify physical existence, predict remaining life, classify assets from descriptions or automatically revise useful lives and depreciation.

**Proposed implementation/delta:** Compare status/life/rate ranges and evidence, preserving used-but-fully-depreciated assets.

**Expected distinguishing case:** Disposed asset with continuing charge ->exception;fully depreciated asset still used ->review candidate, no automatic write-off.

**Methods:** M17 M18. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-029]`. **Original source:** F00010 p.16, card 29; F00011 matching card 29; F00009/F00012 catalogue entry 29.

### AUTO-030 — Capitalization and repairs screening

**Original minimum:** Select tangible or intangible additions and expense transactions whose amount or supplied category conflicts with the approved capitalization policy.

**Original inputs:** Required: transaction identifier, date, amount, recorded account, asset or expense category, project code where used and approved policy threshold.

**Original human responsibility:** Approve the relevant policy and threshold, inspect the nature and future benefits of expenditure, and make the capitalization or expense conclusion.

**Original boundary:** The baseline does not interpret invoice descriptions, assess asset recognition criteria, combine related costs across transactions or conclude whether expenditure creates future economic benefits.

**Proposed implementation/delta:** Screen actual additions/expense categories against approved capitalization policy; recognition remains reviewed.

**Expected distinguishing case:** Repair above monetary threshold ->candidate, not automatically capitalized;small qualifying component not automatically expense.

**Methods:** M19. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-030]`. **Original source:** F00010 p.16, card 30; F00011 matching card 30; F00009/F00012 catalogue entry 30.

### AUTO-031 — Payroll population and disbursement integrity

**Original minimum:** Reconcile payroll totals with ledger and bank disbursements and identify invalid or exact duplicate employee-payment records.

**Original inputs:** Required: employee and payroll-period identifiers, employment status, gross pay, deductions, net pay, mapped accounts and bank payment reference and amount.

**Original human responsibility:** Confirm payroll scope and mappings, validate employee status, investigate unmatched or shared payment details and determine the audit response.

**Original boundary:** The baseline does not recalculate statutory deductions, establish employee existence, perform fuzzy payee matching or reconcile every regulatory return.

**Proposed implementation/delta:** Reconcile roster/payroll/ledger/bank at employee/run/payment identity and retain exact duplicates/invalid records.

**Expected distinguishing case:** Same employee bank account used twice is a candidate; legitimate two runs remain distinct payments.

**Methods:** M01 M26. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-031]`. **Original source:** F00010 p.17, card 31; F00011 matching card 31; F00009/F00012 catalogue entry 31.

### AUTO-032 — Gross-to-net and payroll statutory recalculation

**Original minimum:** Recalculate standard employee gross-to-net pay using an auditor-approved effective tax and social-insurance parameter set.

**Original inputs:** Required: employee, pay period, structured earnings and deductions, taxable and contribution bases, recorded outputs, and approved effective-dated statutory parameters.

**Original human responsibility:** Approve the legally applicable parameter set and employee classification, resolve special cases and make legal or compliance judgments.

**Original boundary:** The baseline does not source legal rates automatically or cover every benefit, exemption, foreign employee, retroactive payment or industry-specific payroll arrangement.

**Proposed implementation/delta:** Calculate gross-to-net using an approved effective-dated rule set including caps/brackets/basis and employer distinction.

**Expected distinguishing case:** Fictional gross1000-deductions150 ->net850 CU; employer100 does not reduce net again.

**Methods:** M26. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-032]`. **Original source:** F00010 p.17, card 32; F00011 matching card 32; F00009/F00012 catalogue entry 32.

### AUTO-033 — Payroll variance and off-cycle analytics

**Original minimum:** Identify employee-level pay changes and off-cycle payments that exceed auditor-approved amount, percentage or timing criteria.

**Original inputs:** Required: employee, payroll period, payment date, gross and net pay, selected components, employment status and approved normal payroll calendar.

**Original human responsibility:** Define comparable periods and justified thresholds, account for hires, terminations and promotions, inspect authorization and determine whether changes are valid.

**Original boundary:** The baseline does not learn expected behavior, evaluate peer groups, classify narrative explanations or conclude that unusual pay indicates fraud or error.

**Proposed implementation/delta:** Compute employee-level comparable variance/off-cycle rules with explicit base/window and investigation.

**Expected distinguishing case:** Previouspay0/current100 CU ->absolute100,percentage undefined;not infinite or zero change.

**Methods:** M07 M26. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-033]`. **Original source:** F00010 p.18, card 33; F00011 matching card 33; F00009/F00012 catalogue entry 33.

### AUTO-034 — VAT and withholding-tax reconciliation

**Original minimum:** Reconcile uploaded VAT or withholding registers to ledger liabilities and filed returns and recalculate structured tax amounts using approved rates.

**Original inputs:** Required: tax period, transaction or register identifier, taxable base, category, recorded tax, approved rate, mapped ledger balance and filed-return totals.

**Original human responsibility:** Determine the applicable tax treatment, approve categories and rates, assess exemptions and resolve filing or payment consequences with tax specialists where needed.

**Original boundary:** The baseline does not make legal tax classifications, obtain authority data automatically, prepare filings or cover unsupported exemptions and special regimes.

**Proposed implementation/delta:** Use dated approved VAT/withholding base/rate rules and register/return/GL/payment bridges.

**Expected distinguishing case:** Fictional10% inclusive110 CU ->tax10;tax-exclusive110 ->tax11;conventions cannot be mixed.

**Methods:** M27. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-034]`. **Original source:** F00010 p.18, card 34; F00011 matching card 34; F00009/F00012 catalogue entry 34.

### AUTO-035 — Corporate-income-tax reconciliation

**Original minimum:** Reperform the arithmetic of approved current and deferred tax schedules and reconcile their recorded amounts to ledger, return and payment evidence.

**Original inputs:** Required: accounting profit, approved tax adjustments, temporary-difference schedule, approved rates, ledger balances, filed-return amount and relevant payments.

**Original human responsibility:** Classify tax adjustments and temporary differences, approve rates and recognition decisions, interpret law and conclude on uncertain or recoverable tax positions.

**Original boundary:** The baseline does not interpret tax law, determine recognition of deferred-tax assets, model uncertain tax positions or prepare the corporate tax return.

**Proposed implementation/delta:** Reperform approved current/deferred schedule arithmetic and reconcile tax return, GL and evidence.

**Expected distinguishing case:** Fictional temporarydifference200 CU x20% ->40 CU subject to recognition;permanentdifference200 creates no DTL.

**Methods:** M28. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-035]`. **Original source:** F00010 p.19, card 35; F00011 matching card 35; F00009/F00012 catalogue entry 35.

### AUTO-036 — Borrowings, interest and covenant review

**Original minimum:** Reconcile each borrowing facility's principal movement, recalculate contractual interest and show headroom under an auditor-approved covenant formula.

**Original inputs:** Required: facility identifier, opening principal, drawdowns, repayments, closing balance, contractual rate and dates, ledger or lender balance, and approved covenant formula inputs.

**Original human responsibility:** Confirm contractual terms, effective dates and covenant definitions, assess waivers and rights, and make current or non-current classification and breach conclusions.

**Original boundary:** The baseline does not calculate effective interest, account for fees or modifications, interpret covenant contracts or determine balance-sheet classification automatically.

**Proposed implementation/delta:** Reconcile principal and actual cash movements; apply contractual rate/day-count and exact covenant definitions.

**Expected distinguishing case:** 1000 CU x12%x30/360 ->10 CU interest;switch toactual/365 changes expected amount and run version.

**Methods:** M20. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-036]`. **Original source:** F00010 p.19, card 36; F00011 matching card 36; F00009/F00012 catalogue entry 36.

### AUTO-037 — Lease-accounting recalculation

**Original minimum:** Recalculate a fixed-payment lease liability and straight-line right-of-use asset schedule and compare both with recorded ledger balances.

**Original inputs:** Required: lease identifier, commencement and end dates, fixed payment schedule, approved discount rate, initial right-of-use adjustments and recorded ledger balances.

**Original human responsibility:** Confirm lease completeness, scope, term, discount rate and accounting elections, evaluate classification and modifications, and conclude on any misstatement.

**Original boundary:** The baseline excludes variable or index-linked payments, modifications, reassessments, exemptions, foreign currency, restoration obligations and complex tax effects.

**Proposed implementation/delta:** Discount unpaid fixed payments with correct timing/rate convention; keep ROU cost additions and life separate.

**Expected distinguishing case:** Two annualarrears110 CU at10% ->PV190.91,year1interest19.09,closing100 CU;advance payment needs different schedule.

**Methods:** M21. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-037]`. **Original source:** F00010 p.20, card 37; F00011 matching card 37; F00009/F00012 catalogue entry 37.

### AUTO-038 — Foreign-currency recalculation and retranslation

**Original minimum:** Recalculate recorded functional-currency amounts using an approved exchange-rate table and retranslate closing monetary balances at the approved period-end rate.

**Original inputs:** Required: transaction or balance identifier, foreign amount and currency, functional amount, transaction date, reporting date, monetary-item status and approved rate table.

**Original human responsibility:** Approve the rate source, determine whether average or historical rates are appropriate, identify monetary items and evaluate the accounting treatment of differences.

**Original boundary:** The baseline does not retrieve rates automatically, select accounting rates, handle hedging, translate foreign operations or determine presentation of exchange differences.

**Proposed implementation/delta:** Apply rate direction/date and monetary classification; preserve transaction and retranslation differences.

**Expected distinguishing case:** 100 foreignunits at3/3.2 CU ->300/320 and20 CU change;historical nonmonetary asset cannot be blanket retranslated.

**Methods:** M22. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-038]`. **Original source:** F00010 p.20, card 38; F00011 matching card 38; F00009/F00012 catalogue entry 38.

### AUTO-039 — Equity roll-forward and authorization review

**Original minimum:** Reconcile the movement in each equity component and show whether contributions, share changes and dividends have linked authorization evidence.

**Original inputs:** Required: equity component, opening balance, movement type and amount, profit linkage, closing ledger balance and authorization reference for share or dividend actions.

**Original human responsibility:** Classify equity movements, assess the legal validity and timing of authorizations, approve evidence and determine presentation and disclosure consequences.

**Original boundary:** The baseline does not interpret company law, validate legal ownership, account for complex equity instruments or determine whether a dividend was legally distributable.

**Proposed implementation/delta:** Reconcile each equity component and actual authorizations; keep subsequent dividend timing and instrument classification.

**Expected distinguishing case:** Retained500+profit100-dividend40+transfer10=570 CU;opposite transfer appears once in reserve.

**Methods:** M29. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-039]`. **Original source:** F00010 p.21, card 39; F00011 matching card 39; F00009/F00012 catalogue entry 39.

### AUTO-040 — Investment holdings, income and valuation-input review

**Original minimum:** Roll investment units and cost, reconcile positions and income with custodian and ledger records, and test simple yield inputs without concluding fair value.

**Original inputs:** Required: instrument identifier, opening holdings and cost, purchases, disposals, closing position, income, custodian statement and mapped ledger balances. Yield testing requires approved cash flows and rate.

**Original human responsibility:** Confirm instrument classification and authoritative evidence, assess valuation techniques and assumptions, investigate differences and make recognition and fair-value conclusions.

**Original boundary:** The baseline excludes market-data retrieval, complex valuation models, expected credit loss, hierarchy classification and any automatic fair-value conclusion.

**Proposed implementation/delta:** Roll units/cost/income to custodian and GL; test supplied simple yield/price inputs without asserting fair value.

**Expected distinguishing case:** 10 units x50 CU ->500 value input;stale quote remains a valuation concern despite correct multiplication.

**Methods:** M20 M23 M24. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-040]`. **Original source:** F00010 p.21, card 40; F00011 matching card 40; F00009/F00012 catalogue entry 40.

### AUTO-041 — Connected-party and related-party review

**Original minimum:** Match the declared related-party register to transaction counterparties and reconcile known related-party balances and transactions with draft disclosures.

**Original inputs:** Required: approved related-party register, counterparty masters, registration or bank identifiers, transaction and balance populations, and structured disclosure totals.

**Original human responsibility:** Assess relationship completeness, substance and terms, investigate candidates, approve party mappings and conclude on accounting and disclosure adequacy.

**Original boundary:** The baseline does not establish beneficial ownership, search external networks, interpret unusual commercial terms or conclude that a common identifier proves a relationship.

**Proposed implementation/delta:** Match declared related-party identities/transactions/balances to exact disclosure version; shared identifiers stay unconfirmed candidates.

**Expected distinguishing case:** Declaredparty transaction100 CU disclosed90 ->10 CU discrepancy;unconfirmed shared bank account not automatically related party.

**Methods:** M36. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-041]`. **Original source:** F00010 p.22, card 41; F00011 matching card 41; F00009/F00012 catalogue entry 41.

### AUTO-042 — Estimate, allowance and impairment review

**Original minimum:** Recalculate a selected structured estimate schedule and identify differences or assumption changes that require auditor evaluation.

**Original inputs:** Required: estimate identifier, opening and movement schedule, closing ledger balance, method selection and approved assumptions. Aging profiles also require exposure buckets and rates.

**Original human responsibility:** Select an appropriate method, assess data and assumptions, challenge bias and overlays, obtain specialist input where needed and make the recognition or impairment conclusion.

**Original boundary:** The baseline does not validate model design, generate assumptions, forecast economic variables, calculate unsupported complex ECL models or conclude impairment automatically.

**Proposed implementation/delta:** Reperform selected structured estimate using disjoint exposures/approved assumptions and retain model-evaluation work.

**Expected distinguishing case:** 1000 CU x2% +500 x10%=70 CU;an individually assessed balance cannot also be included collectively.

**Methods:** M24 M25. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-042]`. **Original source:** F00010 p.22, card 42; F00011 matching card 42; F00009/F00012 catalogue entry 42.

### AUTO-043 — Consolidation and intercompany review

**Original minimum:** Reconcile approved component trial balances to consolidation inputs, sum mapped balances and identify unmatched exact intercompany balances and elimination residuals.

**Original inputs:** Required: approved component trial balances, consolidation inputs, entity and counterparty identifiers, mapping, intercompany balances, supplied eliminations and recorded consolidated totals.

**Original human responsibility:** Confirm group scope, mappings, ownership and currency treatment, investigate unmatched items and approve consolidation and elimination judgments.

**Original boundary:** The baseline excludes foreign-operation translation, complex ownership changes, intercompany transaction matching, tax effects and automatic creation of elimination journals.

**Proposed implementation/delta:** Reconcile component TB inputs/mappings, sum compatible balances and compare exact reciprocals/approved elimination residuals.

**Expected distinguishing case:** Receivable100/payable95 CU ->5 unmatched;no generated5 CU plug or inferred elimination.

**Methods:** M02 M22 M30. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-043]`. **Original source:** F00010 p.23, card 43; F00011 matching card 43; F00009/F00012 catalogue entry 43.

### AUTO-044 — Going-concern financial indicators

**Original minimum:** Calculate a controlled set of liquidity, maturity, covenant-headroom and cash-runway indicators for use in the auditor's going-concern assessment.

**Original inputs:** Required: reporting-date cash, current assets and liabilities, debt maturities, approved facilities, covenant results and management cash-flow forecast.

**Original human responsibility:** Select appropriate indicators and forecast period, test source assumptions and mitigating actions, assess feasibility and make the going-concern and reporting conclusions.

**Original boundary:** The baseline does not validate management's forecast, estimate financing availability, model unrestricted scenarios or determine material uncertainty or report wording.

**Proposed implementation/delta:** Calculate approved liquidity/maturity/covenant/runway indicators with restrictions, denominators and horizon.

**Expected distinguishing case:** Cash90 CU/burn30 permonth ->simple3 months;uncommitted facility remains excluded from committed liquidity.

**Methods:** M07 M32. **Owning guide:** G05. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-044]`. **Original source:** F00010 p.23, card 44; F00011 matching card 44; F00009/F00012 catalogue entry 44.

### AUTO-045 — Subsequent-event transaction review

**Original minimum:** Identify material post-period transactions and exact links to year-end balances so the auditor can investigate possible subsequent events once.

**Original inputs:** Required: reporting date, review end date, post-period transaction identifier, type, date, amount, counterparty and year-end source reference where available.

**Original human responsibility:** Define the review window and thresholds, investigate the underlying event and conditions, and decide adjusting, non-adjusting, disclosure and reporting treatment.

**Original boundary:** The baseline does not search news or legal sources, infer event meaning from narrative documents or make the adjusting versus non-adjusting conclusion.

**Proposed implementation/delta:** Identify material post-period transactions and exact year-end links once under explicit investigation cutoff.

**Expected distinguishing case:** One receipt linked to two duplicated rules remains one transaction candidate;no auto-adjusting-event conclusion.

**Methods:** M34. **Owning guide:** G05. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-045]`. **Original source:** F00010 p.24, card 45; F00011 matching card 45; F00009/F00012 catalogue entry 45.

### AUTO-046 — Materiality management

**Original minimum:** Calculate and preserve approved overall, performance and clearly-trivial materiality amounts from auditor-selected benchmarks and percentages.

**Original inputs:** Required: benchmark type and amount, overall and performance percentages, clearly-trivial basis, reporting period, rationale and required approval.

**Original human responsibility:** Select and justify the benchmark and percentages, approve overrides, consider qualitative materiality and decide which audit work must change after revision.

**Original boundary:** The baseline does not select benchmarks, prescribe firm methodology, evaluate qualitative materiality or automatically redesign sampling and audit procedures.

**Proposed implementation/delta:** Use M03 exact selected benchmark/percentages with source/policy/version and change impact.

**Expected distinguishing case:** 1000000x5%=50000 CU;explicit trivial0 retained;threshold revision stales affected evaluation.

**Methods:** M03. **Owning guide:** G02. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-046]`. **Original source:** F00010 p.24, card 46; F00011 matching card 46; F00009/F00012 catalogue entry 46.

### AUTO-047 — Audit sampling workspace

**Original minimum:** Draw a reproducible simple random sample from a reconciled population and evaluate recorded monetary errors under one approved projection method.

**Original inputs:** Required: reconciled population with stable item identifiers and amounts, eligibility rules, approved sample size, random seed and tested error for selected items.

**Original human responsibility:** Define the population and sampling unit, determine whether the method and sample size are appropriate, perform audit testing and evaluate qualitative and sampling risk.

**Original boundary:** The baseline does not calculate statistical confidence, select an audit methodology, support monetary-unit or stratified sampling, or replace auditor evaluation of results.

**Proposed implementation/delta:** Preserve actual reproducible random draw and matching approved projection; separate size/risk evaluation and unsupported designs.

**Expected distinguishing case:** Residual1000/sample200/error10 ->50 inclusive,10 factual+40 incremental;selection alone creates no test result.

**Methods:** M04 M05 M06. **Owning guide:** G04. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-047]`. **Original source:** F00010 p.25, card 47; F00011 matching card 47; F00009/F00012 catalogue entry 47.

### AUTO-048 — Misstatement management and evaluation

**Original minimum:** Maintain one controlled record for each confirmed misstatement, track correction status and aggregate recorded effects against approved materiality.

**Original inputs:** Required: source case, affected account and statement line, amount, period, classification, correction status and active materiality version.

**Original human responsibility:** Confirm whether an exception is a misstatement, determine measurement and classification, verify management's correction and make quantitative and qualitative aggregate conclusions.

**Original boundary:** The baseline does not infer misstatements from exceptions, verify final-ledger posting automatically, determine qualitative materiality or select an audit opinion.

**Proposed implementation/delta:** Use one canonical issue with signed effects, actual correction verification and current threshold evaluation.

**Expected distinguishing case:** Error100/agreed100/verified60 ->40 CU uncorrected;repeat origin link creates no second100.

**Methods:** M06 M22 M33. **Owning guide:** G05. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-048]`. **Original source:** F00010 p.25, card 48; F00011 matching card 48; F00009/F00012 catalogue entry 48.

### AUTO-049 — Legal matters, commitments and contingencies

**Original minimum:** Maintain a complete, reviewed register of identified legal matters, commitments and contingencies with supporting evidence and accounting or disclosure disposition.

**Original inputs:** Required: matter identifier, type, status, relevant dates, management assessment, linked evidence, proposed accounting or disclosure treatment and reviewer assignment.

**Original human responsibility:** Identify matters, assess completeness and legal evidence, obtain specialist or counsel input, evaluate recognition and disclosure, and make the audit conclusion.

**Original boundary:** The baseline does not discover undeclared matters, interpret legal outcomes, estimate provisions or determine recognition and disclosure automatically.

**Proposed implementation/delta:** Register identified legal/commitment/contingency matters with actual source review and accounting/disclosure outcome.

**Expected distinguishing case:** Unquantifiedlawsuit ->unknown exposure plus assessment, not0 CU and clean completion.

**Methods:** M31. **Owning guide:** G05. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-049]`. **Original source:** F00010 p.26, card 49; F00011 matching card 49; F00009/F00012 catalogue entry 49.

### AUTO-050 — Going-concern evidence and conclusion

**Original minimum:** Provide a controlled workflow linking identified going-concern conditions, management's assessment, supporting evidence, mitigating actions and the auditor's reviewed conclusion.

**Original inputs:** Required: management assessment, identified conditions, forecast evidence, mitigating actions, auditor evaluation, disclosure decision, reporting decision and assigned approvals.

**Original human responsibility:** Challenge forecasts and mitigating actions, assess evidence and material uncertainty, determine disclosure adequacy and select the appropriate audit-report treatment.

**Original boundary:** The baseline does not validate forecasts, prove financing feasibility, choose the going-concern conclusion or generate the audit opinion and wording.

**Proposed implementation/delta:** Link conditions, actual management assessment, evidence, mitigations, uncertainty and reviewed auditor conclusion.

**Expected distinguishing case:** Positive numeric forecast with uncommitted funding still needs mitigating-plan evidence and uncertainty assessment.

**Methods:** M32. **Owning guide:** G05. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-050]`. **Original source:** F00010 p.26, card 50; F00011 matching card 50; F00009/F00012 catalogue entry 50.

### AUTO-051 — Subsequent-event inquiry and completion

**Original minimum:** Document that required subsequent-event inquiries and source reviews were completed through the intended auditor's-report date and every identified event was resolved.

**Original inputs:** Required: reporting and intended report dates, applicable inquiry or source-review list, completion evidence, identified event details, treatment decision and reviewer assignment.

**Original human responsibility:** Perform inquiries and document review, identify relevant events, evaluate conditions at the reporting date and conclude on adjustment, disclosure and report implications.

**Original boundary:** The baseline does not search transactions or external news, decide event treatment automatically or prove that inquiry procedures identified every possible event.

**Proposed implementation/delta:** Record performed enquiries/source reviews through intended report date and every event disposition.

**Expected distinguishing case:** Report date movesNov20toNov25 ->affected enquiry/representation coverage reassessed throughNov25.

**Methods:** M34. **Owning guide:** G05. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-051]`. **Original source:** F00010 p.27, card 51; F00011 matching card 51; F00009/F00012 catalogue entry 51.

### AUTO-052 — Disclosure applicability and completion

**Original minimum:** Show that each auditor-selected applicable disclosure requirement is linked to a completed note and supporting evidence or to an approved non-applicability rationale.

**Original inputs:** Required: controlled disclosure checklist version, entity and reporting-framework context, applicability decision, exact note reference, evidence link and required review.

**Original human responsibility:** Determine applicability and adequacy, interpret the reporting framework, prepare or audit the disclosure and approve justified non-applicability conclusions.

**Original boundary:** The baseline does not infer applicability from transactions, read narrative notes for semantic compliance or conclude that a completed checklist proves fair presentation.

**Proposed implementation/delta:** Link selected applicable disclosure requirement to exact note/evidence or reviewed N/A reason.

**Expected distinguishing case:** Selectedrequirement without note anchor cannot complete;N/A without reason remains unresolved.

**Methods:** M36. **Owning guide:** G05. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-052]`. **Original source:** F00010 p.27, card 52; F00011 matching card 52; F00009/F00012 catalogue entry 52.

### AUTO-053 — Audit-area completion and conclusion

**Original minimum:** Prevent an audit area from being completed until applicable procedures, evidence, exceptions and required reviews are resolved or formally approved as not performed.

**Original inputs:** Required: area scope, applicable procedure list, procedure statuses, evidence and exception links, required roles, sign-offs and auditor conclusion.

**Original human responsibility:** Determine procedure applicability and sufficiency, evaluate evidence and exceptions, resolve blockers and own the professional conclusion for the audit area.

**Original boundary:** The baseline does not determine whether evidence is sufficient, choose the conclusion, infer an audit opinion or automatically waive incomplete procedures.

**Proposed implementation/delta:** Guard applicable procedures/evidence/exceptions/reviews and separately justified nonperformance.

**Expected distinguishing case:** Ninecomplete/one required unperformed ->area incomplete;generic reviewer tick cannot bypass it.

**Methods:** M36. **Owning guide:** G05. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-053]`. **Original source:** F00010 p.28, card 53; F00011 matching card 53; F00009/F00012 catalogue entry 53.

### AUTO-054 — Risk-response linkage and change-impact control

**Original minimum:** Maintain traceable links from assessed risks through audit responses, procedures, evidence and conclusions and identify work affected by approved changes.

**Original inputs:** Required: stable risk, response, procedure, evidence and conclusion identifiers; status and approval; and recorded change events.

**Original human responsibility:** Assess risks, design and approve responses, decide the actual impact of changes and reperform or reapprove work where necessary.

**Original boundary:** The baseline does not assess risks automatically, redesign audit procedures, infer every indirect dependency or decide that prior evidence remains sufficient after change.

**Proposed implementation/delta:** Trace many-to-many risks/responses/procedures/evidence/conclusions and target changed-source impact.

**Expected distinguishing case:** One risk changes ->only relying responses/work staled;unrelated materiality/evidence retained current.

**Methods:** M36. **Owning guide:** G05. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-054]`. **Original source:** F00010 p.28, card 54; F00011 matching card 54; F00009/F00012 catalogue entry 54.

### AUTO-055 — Exception, review-note and sign-off closure

**Original minimum:** Provide one controlled queue for unresolved exceptions, review notes and required sign-offs and prevent engagement completion while mandatory items remain open.

**Original inputs:** Required: source work item, exception or note, owner, required approver roles, status, resolution evidence and completion-gate configuration.

**Original human responsibility:** Investigate and resolve exceptions, clear review notes, provide required evidence and exercise the authority to approve, reject or reopen work.

**Original boundary:** The baseline does not resolve findings automatically, determine evidence sufficiency, infer role conflicts beyond configured rules or substitute closure status for audit judgment.

**Proposed implementation/delta:** Build one scoped queue from real exceptions, notes and required reviews without introducing a second sign-off store.

**Expected distinguishing case:** Preparerresponse saved ->note remains open until authorized independent clearance.

**Methods:** M36. **Owning guide:** G05. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-055]`. **Original source:** F00010 p.29, card 55; F00011 matching card 55; F00009/F00012 catalogue entry 55.

### AUTO-056 — Final statements, conclusions and report consistency

**Original minimum:** Bind the proposed auditor's report to exact approved financial-statement and audit-conclusion versions and expose structured contradictions for partner resolution.

**Original inputs:** Required: exact financial-statement version, approved area and engagement conclusions, structured report decisions, report draft version and required technical or partner review.

**Original human responsibility:** Evaluate the audit evidence, select the opinion and report sections, determine legally and methodologically appropriate wording and approve the final report.

**Original boundary:** The baseline does not select an opinion, draft unrestricted report wording, perform semantic legal review or conclude that structural consistency establishes reporting appropriateness.

**Proposed implementation/delta:** Bind opinion/report to exact final statement/notes/conclusion versions and expose contradictions.

**Expected distinguishing case:** Approvedreport refers toFSv3 whilecurrentapprovedFSv4 ->not ready;new version requires affected review.

**Methods:** M02 M36. **Owning guide:** G06. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-056]`. **Original source:** F00010 p.29, card 56; F00011 matching card 56; F00009/F00012 catalogue entry 56.

### AUTO-057 — Report approval, issuance and distribution

**Original minimum:** Issue only the exact auditor's-report version approved by an authorized partner and preserve an immutable record of what was issued, when and to whom.

**Original inputs:** Required: final report and statement versions, authorized partner identity and approval, intended issue date, approved recipient list and engagement issuance status.

**Original human responsibility:** Confirm authorization to issue, approve the final report and recipients, comply with legal delivery requirements and authorize any withdrawal or replacement.

**Original boundary:** The baseline does not provide regulated electronic signatures, file directly with authorities, prove external receipt or determine whether legal issuance conditions have been satisfied.

**Proposed implementation/delta:** Authorize exact report bytes, separate actual signing/issue/distribution/receipt and reconcile unknown effects.

**Expected distinguishing case:** ApprovedrecipientA received;Bnotattempted ->B remainsoutstanding;local URL isnotreceipt.

**Methods:** M34 M36. **Owning guide:** G06. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-057]`. **Original source:** F00010 p.30, card 57; F00011 matching card 57; F00009/F00012 catalogue entry 57.

### AUTO-058 — Engagement-file lock, retention and amendments

**Original minimum:** Lock the completed engagement file against ordinary editing, calculate its retention date and preserve every authorized post-lock amendment and re-lock event.

**Original inputs:** Required: engagement file index and versions, completion-gate status, authorized locking role, retention-policy version and any amendment request and approval.

**Original human responsibility:** Confirm completion, approve lock or reopening, select the applicable retention rule, assess affected audit work and authorize lawful amendment or disposal.

**Original boundary:** The baseline does not provide write-once storage, manage legal holds, determine jurisdictional retention law or automate defensible disposal across external repositories.

**Proposed implementation/delta:** Lock completed file, calculate reviewed retention policy/holds and retain administrative/substantive successors.

**Expected distinguishing case:** Expiry reached with oneactivehold ->disposaldenied;postlockedit creates retained authorized successor.

**Methods:** M34 M36. **Owning guide:** G07. **Existing evidence locator:** `docs/checkpoints/G11/G11_Method_Reconciliation.json -> rows[id=AUTO-058]`. **Original source:** F00010 p.30, card 58; F00011 matching card 58; F00009/F00012 catalogue entry 58.

## 7. All20 confirmed cross-form dependencies

The upstream and downstream original form IDs/field remain unchanged. The action guard never blocks unrelated draft collection. Each link retains exact upstream/downstream versions, typed payload, currentness/impact assessment and actual actor.

| id | from | to | targetField | payload | guarded_action | change_impact |
| --- | --- | --- | --- | --- | --- | --- |
| DEP-C01 | 1.4.1 | 1.1.1 | r16 | Current new-client acceptance outcome and exact approved decision/version | Positive decision-dependent scope conclusion | Changed acceptance/withdrawal reopens relying scope conclusion |
| DEP-C02 | 1.4.2 | 1.1.1 | r16 | Current-period continuance outcome, unresolved conditions and decision/version | Positive continuance-dependent conclusion | Prior-year approval is never silently reused |
| DEP-C03 | 1.4.3 | 1.1.1 | r17 | Exact agreed engagement-letter scope/additional-services terms/version | Conclusion that terms are actually agreed | Amended terms require affected scope/plan reassessment |
| DEP-C04 | 1.4.5 | 1.1.1 | r18 | Independence declaration/threat assessment/current outcome | Positive independence-dependent acceptance conclusion | Unresolved threat remains unknown/review, not satisfactory Yes |
| DEP-C05 | 1.1.1 | 2.8 |  | Accepted scope, period, terms and restrictions | Approval of affected overall plan | Changed agreed scope produces targeted plan/programme impact |
| DEP-C06 | 1.3 | 3.3.1 | r24 | Selected performance materiality amount/currency/version and specific limits | Approval/use of dependent sample design | Changed threshold stales relying design/evaluation, not past selections |
| DEP-C07 | 2.6 | 3.3.1 | r28 | Planned reliance, tested-control basis and current outcome | Approval of reliance-dependent sample assumptions | Failed/new control work requires revisiting reliance/size/procedures |
| DEP-C08 | 2.6 | 2.7.1 |  | Assertion-specific assessed risk and selected response intent | Approval of affected balance-sheet response | Risk change reopens only affected response decision |
| DEP-C09 | 2.7.1 | 3.1.2 |  | Applicable PPE response, assertion and actual selected work scope | Approval/execution of tailored PPE programme | Programme scope changes retain prior performed work and require impact review |
| DEP-C10 | 3.3.1 | 3.1.2 |  | Actual selected PPE unit IDs, frame/selection version and tests | Conclusion that planned sampled detail tests were performed | Design-only/untested/missing selected item cannot satisfy actual work |
| DEP-C11 | 3.3.2 | 3.1.8 |  | Evaluated bank reply or actual approved alternative work plus limitations | Cash-area confirmation/evidence conclusion | Attachment receipt alone cannot fulfill evaluated independent response |
| DEP-C12 | 3.1.2 | 4.1.1 |  | Observed PPE exception, actual measured values/evidence and evaluation | Creation/classification of confirmed misstatement | Not every exception is a monetary error;link canonical issue once |
| DEP-C13 | 4.1.1 | 4.1.3 |  | Current corrected/uncorrected signed evaluation and compatible final balances | Final analytics and overall evaluation | Agreement-only correction remains outstanding;reversed posting renews evaluation |
| DEP-C14 | 1.3 | 4.1.1 |  | Current selected materiality/trivial/specific thresholds and qualitative basis | Current aggregate misstatement evaluation | Revision triggers affected renewed judgment, never retroactive number rewrite |
| DEP-C15 | 4.1.1 | 4.1.A1 |  | Reviewed final findings/sufficiency/qualitative effects | Authorized proposed opinion and correct report form | Unmodified4.1.A1 only if appropriate;modified path retained |
| DEP-C16 | 4.5 | 4.4 |  | Actual obtained/evaluated representation original, signatory/date/scope | Relevant completion conclusion | Unsigned draft is not obtained representation;report-date move reassesses coverage |
| DEP-C17 | 4.6 | 4.4 |  | Actual assigned quality confirmation and separately applicable formal EQR | Relevant completion/readiness action | Generic4.6/R4 is not formal EQR and cannot waive timing/eligibility |
| DEP-C18 | 4.4 | 5.1 |  | Actually issued report/completed work/current reviews | Administrative assembly/controlled lock | Assembly cannot invent missing procedures or backdate conclusions |
| DEP-C19 | 4.1.A1 | 5.1 |  | Exact issued report plus complete approved statements/notes hashes | Archive manifest/custody offer | Offer/download/hash/readability/accepted custody remain separate |
| DEP-C20 | 5.1 | 5.1 | r28 | Actual current custodian/retrieval authority and scoped access history | Future retrieval/disclosure | Expired/revoked authority denies future access;old receipt retained |

## 8. All70 form/source contracts and native-output approach

The census rereads actual available working XLSX bytes and all nonempty source cells in the70 catalogue form sheets. It checks field anchors and inventories formulas, validations, merges and embedded image counts. It does **not** visually inspect every picture, recalculate Excel, establish historical byte equivalence, or professionally validate all candidate field meanings. The implementation/reviewer procedure for these is fully specified in D03.

| file | sha256 | form_count | formula_count | validation_definitions | source_unchanged |
| --- | --- | --- | --- | --- | --- |
| Audit_Stage_1_Repaired.xlsx | 5fde7db15e766cdb616cb816d25a8fe6a6d5718f9975d4c0f885c344b079602c | 11 | 9 | 349 | True |
| Audit_Stage_2_Repaired.xlsx | 9650b116e38f00c2a79f6fa28f1f4a4f695d5847279e99e5b52103a47e8d8d7e | 16 | 5 | 692 | True |
| Audit_Stage_3_Repaired.xlsx | 9cfe6c74f2659031f46243697308d809765f72175c49531363a73794ee64a2da | 31 | 233 | 1148 | True |
| Audit_Stage_4_Repaired.xlsx | 74676a901fc671e4e188d04dc7950937f2f9cd8d7cd2e4073e3b902148b7a2a7 | 11 | 25 | 362 | True |
| Audit_Stage_5_Repaired.xlsx | f812eb3d7e3f38e068389c3b5cfef1721611d6b04df85c3b92b66622e2513293 | 1 | 0 | 33 | True |

| form_id | stage | family | catalogue_fields | formula_cells | validation_definitions | embedded_images | native_export |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1.1.1 | 1 | questionnaire | 13 | 0 | 23 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 1.1.2 | 1 | questionnaire | 9 | 0 | 14 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 1.3 | 1 | calculation | 14 | 0 | 15 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 1.4.1 | 1 | questionnaire | 26 | 0 | 53 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 1.4.2 | 1 | questionnaire | 47 | 0 | 84 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 1.4.3 | 1 | document | 16 | 0 | 32 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 1.4.4 | 1 | questionnaire | 12 | 0 | 24 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 1.4.5 | 1 | questionnaire | 13 | 0 | 27 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 1.4.6 | 1 | questionnaire | 1 | 0 | 21 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 1.4.7 | 1 | questionnaire | 19 | 0 | 25 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 1.5 | 1 | questionnaire | 11 | 9 | 31 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.1.1 | 2 | questionnaire | 44 | 0 | 72 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.1.2 | 2 | questionnaire | 16 | 0 | 20 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.1.3 | 2 | questionnaire | 32 | 0 | 62 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.1.4 | 2 | questionnaire | 8 | 0 | 33 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.1.5 | 2 | questionnaire | 52 | 5 | 110 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.2.1 | 2 | questionnaire | 17 | 0 | 34 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.2.2 | 2 | questionnaire | 19 | 0 | 36 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.3 | 2 | questionnaire | 33 | 0 | 34 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.4 | 2 | questionnaire | 7 | 0 | 9 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.5 | 2 | questionnaire | 10 | 0 | 28 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.6 | 2 | questionnaire | 15 | 0 | 20 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.7.1 | 2 | strategy | 17 | 0 | 35 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.7.2 | 2 | strategy | 17 | 0 | 35 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.8 | 2 | questionnaire | 77 | 0 | 68 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.9 | 2 | questionnaire | 29 | 0 | 50 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 2.10 | 2 | questionnaire | 18 | 0 | 46 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.1 | 3 | programme | 15 | 12 | 30 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.2 | 3 | programme | 20 | 9 | 40 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.3 | 3 | programme | 14 | 2 | 27 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.4 | 3 | programme | 18 | 9 | 38 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.5 | 3 | programme | 16 | 9 | 36 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.6 | 3 | programme | 13 | 9 | 33 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.7 | 3 | programme | 10 | 9 | 30 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.8 | 3 | programme | 16 | 9 | 36 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.9 | 3 | programme | 17 | 9 | 37 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.10 | 3 | programme | 13 | 9 | 33 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.11 | 3 | programme | 10 | 9 | 30 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.12 | 3 | programme | 10 | 9 | 30 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.13 | 3 | programme | 9 | 9 | 29 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.14 | 3 | programme | 10 | 9 | 30 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.15 | 3 | programme | 9 | 9 | 29 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.16 | 3 | programme | 16 | 9 | 36 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.17 | 3 | programme | 18 | 9 | 38 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.18 | 3 | programme | 13 | 9 | 33 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.19 | 3 | programme | 9 | 9 | 29 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.20 | 3 | programme | 8 | 9 | 28 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.21 | 3 | programme | 10 | 9 | 30 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.22 | 3 | programme | 8 | 9 | 28 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.1.23 | 3 | programme | 23 | 0 | 57 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.2.1 | 3 | questionnaire | 16 | 3 | 32 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.2.2 | 3 | questionnaire | 27 | 10 | 55 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.2.3 | 3 | questionnaire | 15 | 6 | 29 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.2.4 | 3 | questionnaire | 25 | 1 | 50 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.2.5 | 3 | document | 19 | 0 | 24 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.2.6 | 3 | register | 1 | 19 | 21 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.3.1 | 3 | sampling | 32 | 0 | 90 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 3.3.2 | 3 | register | 23 | 0 | 80 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 4.1.A1 | 4 | document | 6 | 0 | 17 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 4.1.A2 | 4 | document | 9 | 0 | 21 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 4.1.A3 | 4 | document | 9 | 0 | 20 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 4.1.A4 | 4 | document | 7 | 0 | 15 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 4.1.1 | 4 | register | 1 | 19 | 44 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 4.1.2 | 4 | register | 8 | 6 | 28 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 4.1.3 | 4 | questionnaire | 31 | 0 | 40 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 4.3.1 | 4 | questionnaire | 24 | 0 | 61 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 4.4 | 4 | questionnaire | 11 | 0 | 23 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 4.5 | 4 | document | 28 | 0 | 36 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 4.6 | 4 | questionnaire | 31 | 0 | 57 | 0 | XLSX form output; DOCX where narrative/report contract requires |
| 5.1 | 5 | questionnaire | 16 | 0 | 33 | 0 | XLSX form output; DOCX where narrative/report contract requires |

### Form-family execution contract

Questionnaire/checklist: source question polarity, permitted answers, conditional follow-ups, evidence, conclusion and responsible review. Narrative: full instruction/clauses, long text, actual evidence and conclusion. Repeated register/schedule: stable row identity, typed columns, units, provenance and totals. Calculation/reconciliation: exact approved M pack, explicit unknown/zero, original inputs and exception bridge. Programme: tailored scope, every procedure disposition, performed work, findings and current independent review. Request/confirmation/representation: drafted, issued, received, evaluated and reviewed are distinct. Approval/report/archive: exact version/package, authority, real event dates and retained predecessor/successor.

For XLSX output, fill a controlled copy of the source/family template from canonical selected records, expand repeat blocks deliberately, rebuild references/print regions and include real provenance/reviews without fabricating signatures. For DOCX output, use mapped paragraphs/tables/bookmarks and exact approved report/letter wording. Keep formula dispositions explicit. Compare semantic values/clauses/evidence/review with the canonical view, then reopen in compatible readers for layout/print/readability observation. HTML roundtrip success is not native parity.

## 9. Exact original-scope routing and acceptance


All128 original implementation tasks and2247 original obligations have preserved IDs in [Original_128_Task_Routing.csv](Original_128_Task_Routing.csv) and [Original_2247_Obligation_Routing.csv](Original_2247_Obligation_Routing.csv). Navigation routing follows the previously assigned owning guide; it does not claim a new per-criterion semantic audit. The actual implementation must link each changed criterion/branch to its specific current ticket and executed case before acceptance. Original source-row hashes/statuses remain retained.


For every selected original item: preserve source locator/hash -> actual interpretation/method decision -> owning record/command -> expected case -> executed result -> native export/downstream consequence -> attributable independent acceptance. Treat missing evidence, unsupported method, conditional N/A, external owner and deferred product scope as distinct dispositions. Do not claim a whole lifecycle from disconnected partial tests. No original future extension is silently promoted or removed.

### Cross-domain rehearsal cases

1. New client + current manual independence evidence +3-person team -> approved scope/plan -> complete reconciled revenue population -> cut-off/receivable work ->40 CU verified partial correction of100 CU issue ->60 CU uncorrected -> reviewed qualitative/materiality/opinion decision -> exact issue/recipient/archive.
2. Control deviation after initial reliance -> revised risk response -> affected sample/procedures -> new actual tests -> revised findings/evaluation; unrelated accepted evidence remains current.
3. One material known misstatement plus separate evidence limitation -> separate cause records, professional multi-cause analysis, actual consultation/wording review; no hard-coded adverse-versus-disclaimer precedence.
4. Later fact before issue, after issue before assembly, and after lock -> real discovery/management response -> full-redate or conditionally permitted limited-amendment path -> exact successor issue and prior-recipient communication; old package retained.
5. Specialist selected packet -> actual secure manual sharing -> actual opinion return -> audit-team evaluation; revoke access and test all file representations without claiming recall of downloaded copies.
6. Source/policy change after calculation review -> only affected run/work/evaluation/report reliance becomes stale; exact retry creates no duplicate issue or financial effect; prior reviewed output remains reproducible.
7. Restore to a new isolated environment -> exact originals/reports/actors/grants/holds restored -> actual compatible-reader inspection and scoped retrieval -> revoked user remains denied.

## 10. Decisions, evidence gaps and actual review work


| item | treatment | blocks |
| --- | --- | --- |
| Settled workbook/local audit/ethics baseline | CARRY CLOSED D01/D02 decisions;no new permission/recovery loop | No new blocker |
| Source pictures/merged-label meaning across remaining forms | Use exact70-form census/field anchors;D03 per-family/source observation and explicit discrepancy resolution | Only affected semantic acceptance;not unrelated design/implementation |
| Specialist valuation/transaction methods beyond bounded native profiles | Primary comparative IFRS13/IAS1/IAS10 text retrieved;each actual complex model or transaction has an explicit supported external-work/evaluation route and method-adoption evidence | Only unsupported native-model/compliance claim;not the already specified workflow or supported arithmetic |
| Local tax/social-insurance/retention and dual-date permission facts | Effective-dated reviewed rule/policy inputs with sources and human decision;no universal legal engine | Affected actual calculation/professional/disposal action when required facts absent |
| Firm benchmarks/lives/rates/sampling choices | Use versioned decision records and independently verified method fixtures;ordinary engagement judgments remain supported records | Affected method adoption/reliance,not the whole project |
| Actual auditor interviews and independent acceptance | Complete protocols/cases are supplied;actual names/observations/signatures cannot be invented | Professional/source acceptance and release |
| Selected production workload/storage/security/RPO/RTO | Retain current bounded prototype;measure B14 against actual owner-approved deployment profile | Production readiness only |
| Optional external providers/broader firm ERP/future extensions | HOLD with explicit owner/contract/manual route;separate scope decision before expansion | No automatic blocker on authorized core manual routes |

These are specific evidence/adoption/implementation boundaries, not unassigned “research later” buckets. All listed domain/method/item designs are supplied in this pack. Legal/professional decisions are made by their actual authorities during adoption/use; this document cannot fabricate those decisions. The full fieldwork scope still requires all22 variants and58 minimums, not only the first revenue slice.

## 11. Evidence sources and research limits

The source register separates newly retrieved primary/comparative passages, previously completed verified project research, observed local code/source bytes, author-design inferences and genuine access gaps. Australian/UK adopted texts provide readable comparative accounting/audit requirements; their local additions and effective dates are not imported as Mongolian law. UKEB AI-converted HTML warns it is unverified: original PDFs were used where retrieved; failed originals remain an access limitation. Issuer2021 IFRS PDF routes redirected to subscription pages; no paywall text is invented.


| id | title | url_or_path | inspection_extent | status | limitation |
| --- | --- | --- | --- | --- | --- |
| AUD-230 | ISA230: audit documentation | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Documentation/currentness/assembly requirements; project G07/G08 source and implementation records; comparative ASA230 requirements7-16/A21-A24. | PRIMARY-AND-CARRIED | Current project source records are reused; hashes and independent review are proposed product controls, not verbatim ISA mandates. |
| AUD-315 | ISA315 Revised2019 | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | 2020 handbook included revised2019 text: objective/definitions and iterative risk assessment; earlier recorded paragraph13-38 review in project standards notes. | PRIMARY-AND-CARRIED | The accepted local compilation remains selected; do not silently substitute later international editions. |
| AUD-240 | ISA240 fraud | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Relevant journal/fraud risk requirements and recorded G04 implementation research; exact paragraph numbering is edition-specific. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-330 | ISA330 responses | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Existing verified standards notes: requirements5-30; current planning/execution implementation inspected. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-265 | ISA265 control deficiencies | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Candidate governing source for communication work; design is based on existing planning/source obligations; full chosen-edition application review remains adoption work. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-300 | ISA300 planning | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Existing source notes record requirements1-13; actual strategy/change records reviewed. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-510 | ISA510 opening balances | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Existing source notes record requirements1-13; current opening-data and planning boundaries reviewed. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-600 | ISA600 group audits | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | D02 full applicable paragraphs9,11,19-20,40-45,50 and related application are reused; do not substitute ISA600Revised2022. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-450 | ISA450 misstatements | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Original2020 handbook4-15 and current canonical correction/evaluation controls read. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-501 | ISA501 selected items | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | D02 legal-enquiry requirements9-12 carried; inventory/technical procedures use original source cards and G04; exact applicable full procedure remains method adoption evidence. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-540 | ISA540 estimates | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Source work and current G04/G10/G11 estimate-model boundary reviewed; candidate full chosen-edition clauses remain method-specific adoption evidence. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-570 | ISA570 going concern | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Existing source work and G05/G06/G11 horizon/uncertainty boundaries reviewed; local baseline maintained; revised2024 later international version is separate. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-580 | ISA580 representations | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Current G05/G06 source work distinguishes requested/prepared/obtained/evaluated representations; chosen-edition paragraph review required in firm adoption. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-260 | ISA260 governance communications | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Current G02/G05 source and implementation records; full exact-edition communication requirements remain policy adoption evidence. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-700 | ISA700 report structure/dating | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Original2020 handbook10-19,21-49 selected passages, especially49; current opinion/wording/issue code inspected. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-701 | ISA701 key audit matters | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Current G06 section contract and source obligations; full applicable engagement-specific KAM review remains professional method adoption. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-706 | ISA706 emphasis/other matter | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Current G06 sections and ASA560 restricted-amendment comparison; full wording/applicability remains reviewed template adoption. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-720 | ISA720 other information | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Current G05/G06 actual/expected-later other-information contracts; full applicable template clauses remain adoption evidence. | PRIMARY-OR-CARRIED-AS-STATED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-320 | ISA320/ASA320 materiality | https://standards.auasb.gov.au/node/859 | Requirements10-14; original2020 ISA3209-14 read; no mandatory benchmark percentages. | PRIMARY-COMPARATIVE | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-500 | ISA500/ASA500 evidence | https://standards.auasb.gov.au/node/1012 | Full requirements6-11 and original handbook/source notes; relevance/reliability, entity-data accuracy/completeness and contradictions. | PRIMARY-COMPARATIVE | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-505 | ISA505 confirmations | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Requirements7-16 from recorded G03 and earlier verified research; D02 management-expert distinction preserved. | CARRIED-VERIFIED-RESEARCH | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-520 | ISA520 analytics | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | Earlier recorded requirements1-7 and selected application; actual G03/G04 source/implementation distinctions inspected. | CARRIED-VERIFIED-RESEARCH | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-530 | ISA530 and comparative ASA530 | https://standards.auasb.gov.au/node/728 | Requirements6-15 and application/appendices from node729; original2020 definitions5 and selected requirements read. | PRIMARY-COMPARATIVE | Australian additions/effective dates are not Mongolian law; method choices are proposed engineering policy, not prescribed sample formulas. |
| AUD-560 | ISA560 and comparative ASA560 | https://standards.auasb.gov.au/node/634 | Requirements6-17 including12 limited amendment/dual-date condition read; original applicable ISA remains baseline. | PRIMARY-COMPARATIVE | Australian Aus12.1 prohibition is excluded from Mongolian design; actual local permission must be evidenced. |
| AUD-705 | ISA705 and comparative ASA705 | https://standards.auasb.gov.au/asa-705-apr-2022 | Definitions5 and requirements6-15, qualified/adverse/disclaimer and rare interacting uncertainties read. | PRIMARY-COMPARATIVE | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| AUD-220R | ISA220 Revised original | https://www.irba.co.za/upload/IAASB-International-Standard-Auditing-220-Revised.pdf | D02 verified resources/review/consultation/EQR requirements carried; accepted local integrated quality update. | CARRIED-COMPLETED-D02 | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| QM-1 | ISQM1 integrated local quality baseline | https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf | D02 verified28-32 resources and earlier project34 responses/monitoring context; source B-series audit-facing requirements. | CARRIED-VERIFIED-RESEARCH | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| QM-2 | ISQM2 original final pronouncement | https://www.ifac.org/system/files/publications/files/IAASB-Quality-Management-ISQM-2-Engagement-Quality-Reviews.pdf | Eligibility17-23 and performance24-27 read; D02 appointment/assistants; completion on/before report date. | PRIMARY-TARGETED | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| ACC-IAS2 | IAS2 original PDF on UK regulator | https://www.endorsement-board.uk/documents/2184/IAS_2_-_Inventories.pdf | Cost scope/formulas23-27, NRV28-34 and source cost/quantity contracts; original PDF used rather than unverified AI HTML. | PRIMARY-REGULATOR-TEXT | UK adopted text is comparative, not evidence of Mongolian adoption; actual framework/period selected separately. |
| ACC-IAS16 | IAS16 issuer2022 text | https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ias-16-property-plant-and-equipment.pdf?bypass=on | Recognition/cost, revaluation35-43, depreciation43-62 and deregognition67-72 selected passages. | PRIMARY-TARGETED | 2022 text is not presented as all amendments effective in2026; current official overview/selected profile differences remain recorded. |
| ACC-IFRS16 | IFRS16 original PDF on UK regulator | https://www.endorsement-board.uk/documents/2148/IFRS_16_-_Leases.pdf | Definition/term9-21, cost/liability22-28, subsequent measurement29-46 selected supported schedule passages. | PRIMARY-REGULATOR-TEXT | UK applicability is excluded; exemptions, options, rate and modifications remain approved inputs/scope. |
| ACC-IAS21 | IAS21 original PDF on UK regulator | https://www.endorsement-board.uk/documents/2167/IAS_21_-_The_Effects_of_Changes_in_Foreign_Exchange_Rates.pdf | Transaction/functional/presentation roles and selected rates21-23/28/39; original PDF compared with source FX contract. | PRIMARY-REGULATOR-TEXT | Rate tables are actual engagement inputs; no live FX rate or automatic local adoption asserted. |
| ACC-IFRS10 | IFRS10 original PDF on UK regulator | https://www.endorsement-board.uk/documents/2158/IFRS_10_-_Consolidated_Financial_Statements.pdf | Control/scope and consolidation procedureB86-B93 source path; bounded aggregation/elimination design. | PRIMARY-REGULATOR-TEXT | No UK-specific legal duties adopted; acquisition/NCI/equity-method complexity is explicitly scoped. |
| ACC-IFRS15 | IFRS15 in AASB15 official compilation | https://standards.aasb.gov.au/sites/default/files/2026-11/AASB15_12-14_COMPdec22_07-26.pdf | Comparison with IFRS15; contract9, modification18-21, obligations22-30, satisfaction31-45, allocation73-86 selected passages. | PRIMARY-COMPARATIVE | Exclude Aus/not-for-profit/Tier2 text; not evidence of Mongolian adoption. Proposed time schedule is bounded arithmetic, not universal recognition. |
| ACC-IFRS9 | IFRS9 in AASB9 official compilation | https://standards.aasb.gov.au/aasb-9-feb-2025-0 | EIR5.4.1-4; impairment5.5.1-20, simplified5.5.15 and measurement5.5.17 read. | PRIMARY-COMPARATIVE | Exclude Aus/Tier2 provisions and local effective-date substitution; no blanket ECL certification. |
| ACC-IAS36 | IAS36 in AASB136 official compilation | https://standards.aasb.gov.au/aasb-136-jan-2026 | Scope2, definitions6, impairment indicators9-10, recoverable measurement18 and asset/CGU/reversal boundary read. | PRIMARY-COMPARATIVE | Exclude Australian NFP additions. Input comparison does not validate valuation assumptions. |
| ACC-IAS38 | IAS38 in AASB138 official compilation | https://standards.aasb.gov.au/aasb-138-dec-2022-0 | Recognition18-24, development52-67 and finite/indefinite life88-108 selected passages. | PRIMARY-COMPARATIVE | Exclude Aus/Tier2 requirements; exact framework/period remains explicit. |
| ACC-IAS37 | IAS37 in AASB137 official compilation | https://standards.aasb.gov.au/aasb-137-jan-2026-0 | Recognition14, best estimate36-40, present value45-47, reimbursements53-59 and obligations scope read. | PRIMARY-COMPARATIVE | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| ACC-IAS19 | IAS19 in AASB119 official compilation | https://standards.aasb.gov.au/aasb-119-dec-2022 | Short-term benefits11 and obligation distinction; source payroll/benefit limits reviewed. | PRIMARY-COMPARATIVE | Local tax/social-insurance rates are not established by IAS19; actuarial methods remain separate. |
| ACC-IAS23 | IAS23 in AASB123 official compilation | https://standards.aasb.gov.au/aasb-123-mar-2020 | Qualifying cost/commencement17, suspension20-21 and cessation22-25 selected passages. | PRIMARY-COMPARATIVE | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| ACC-IAS12 | IAS12 in AASB112 official compilation | https://standards.aasb.gov.au/aasb-112-sep-2023 | Tax-base/temporary-difference recognition and measurement46-51A read; DTA/uncertainty exceptions retained in scope. | PRIMARY-COMPARATIVE | No Mongolian tax rate/cap or tax-law conclusion is certified. Australian-specific provisions excluded. |
| ACC-IFRS13 | IFRS13 in AASB13 official compilation | https://standards.aasb.gov.au/aasb-13-dec-2022 | Measurement9/24, valuation techniques61-67, input hierarchy72-90 including76-80 read; issuer overview cross-checked. | PRIMARY-COMPARATIVE | UK original PDF retrieval failed; Australian primary comparative text supplies the research route. Full-model validation and market/input judgments remain separate from quoted-input arithmetic; exclude Aus additions. |
| ACC-IAS10 | IAS10 in AASB110 official compilation | https://standards.aasb.gov.au/aasb-110-mar-2020 | Definitions3; adjusting/nonadjusting8-11, dividends12-13, going concern14-16 and disclosure17-22; paired with ISA560 chronology. | PRIMARY-COMPARATIVE | Accounting adjustment/disclosure and auditor later-fact procedures have distinct scopes/dates; no automatic event classifier is proposed; exclude Aus additions. |
| ACC-PRESENTATION | IAS1 in AASB101; separate IFRS18 profile | https://standards.aasb.gov.au/aasb-101-dec-2022-0 | Comparative presentation29-35/38-46; currency/rounding49-53; current/noncurrent69-76 and covenant amendments; earlier IFRS18 issuer effective-date context carried. | PRIMARY-COMPARATIVE | This is not a universally applicable disclosure library. Select framework/version, exclude Aus additions and do not automatically apply future IFRS18. |
| ENG-AUTH | OWASP Authorization Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html | Least privilege, deny by default, every request/static resources, lookup IDs, logging and tests read. | PRIMARY-TECHNICAL | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| ENG-UPLOAD | OWASP File Upload Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html | G03 existing verified guidance carried; type/size/expansion/isolation/permission design. | CARRIED-TECHNICAL | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| ENG-WCAG | W3C WCAG2.2 | https://www.w3.org/TR/WCAG22/ | Selected task criteria2.1.1,2.4.7,2.4.11,3.3.1,3.3.2,4.1.3; no conformance claim. | PRIMARY-TECHNICAL | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| ENG-SQLITE | SQLite Online Backup API | https://www.sqlite.org/backup.html | Current project actual backup/recovery utility and documented API basis; official source route carried. | CARRIED-TECHNICAL | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| ENG-OOXML | Existing bounded OOXML reader and native-format design | scripts/pilot-workbook.mjs | Actual parser source and G08 source comparison read; all five workbook bytes scanned read-only in this batch. | OBSERVED-CODE-AND-SOURCES | Reader support is not a full Excel formula engine or visual fidelity proof; native export adapters are proposed work. |
| STAT-BINOM | SciPy binomial distribution definition | https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binom.html | Distribution/CDF documentation; independent elementary binomial fixture calculation executed. | PRIMARY-TECHNICAL | Probability model only, not audit-method approval or mandatory sample size. |
| STAT-HYPERGEOM | SciPy hypergeometric distribution definition | https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.hypergeom.html | Without-replacement population/defect/draw definitions and PMF/CDF. | PRIMARY-TECHNICAL | Finite-model defect threshold and acceptable risk require explicit methodology choice. |
| VENDOR-MUS | Diligent sample-size documentation | https://help.highbond.com/helpdocs/analytics/15/en-us/Content/analytics/data_preparation/sampling_data/calculating_sample_size_for_a_monetary_unit_sample.htm | Input/size/evaluation dependency and professional-input limitations read. | PRIMARY-VENDOR-METHOD-DOCUMENTATION | Workflow precedent only; vendor examples are not an independent mathematical validation or audit assurance proof. |
| D01-LOCAL-LAW | Completed D01 local-baseline/source findings | ../D01/Applicability_and_Standards.md | D01 Baseline_Decision.json, primary-law/ethics Sources.csv and settled local baseline reused. | CARRIED-COMPLETED-D01 | Do not reopen settled workbook/adoption issues. Retention/tax engagement facts require their own policy inputs. |
| D02-M35 | Completed D02 capacity method | ../D02/Capacity_Method_M35.md | Completed method, schema, literal fixtures/reference and independent checker carried. | CARRIED-COMPLETED-D02 | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| D02-SPECIALIST | Completed D02 assignment/specialist authority contracts | ../D02/Assignment_and_Authority_Contract.md | Assignment, credential/specialist/manual-packet/scoped-sharing contracts carried. | CARRIED-COMPLETED-D02 | Selected clauses inform the proposed design; this is not whole-standard compliance or a substitute for engagement applicability. |
| DESIGN-ACCEPTANCE | Authored design: acceptance | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-AGING | Authored design: aging | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-ALLOCATION | Authored design: allocation | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-AREAS | Authored design: areas | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-AUTOMATIONS | Authored design: automations | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-BANK | Authored design: bank | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-COMMERCIAL | Authored design: commercial | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-DECISIONS | Authored design: decisions | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-DEPENDENCIES | Authored design: dependencies | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-DEPRECIATION | Authored design: depreciation | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-EQUITY | Authored design: equity | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-FORECAST | Authored design: forecast | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-FORMS | Authored design: forms | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-FX | Authored design: fx | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-INTEGRITY | Authored design: integrity | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-INTEREST | Authored design: interest | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-INVENTORY | Authored design: inventory | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-METHODS | Authored design: methods | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-P2P | Authored design: p2p | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-PROJECTION | Authored design: projection | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-SCOPE | Authored design: scope | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-SELECTION | Authored design: selection | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-SLICES | Authored design: slices | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| DESIGN-TAX-PARAMETERS | Authored design: tax-parameters | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| ENG-NFR | Authored design: nfr | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |
| ENG-RETENTION | Authored design: retention | FULL_RESEARCH_AND_EXECUTION_PLAN.md | Original proposed product/engineering convention; independently distinguish from external standards. | AUTHOR-DESIGN-INFERENCE | Requires implementation validation and appropriate actual product/professional acceptance; not an external factual rule. |

## 12. Verification performed on this plan

The supplied validator checks exact ID sets/cardinalities, unique original routing keys, all referenced method/source/code paths, task and batch dependency acyclicity, complete domain coverage, retained original automation text/dependency endpoints, no unlisted domain card, all70 working source sheets and unchanged source hashes. A separate elementary checker calculates the25 fictional expected-value cases in Independent_Numerical_Checks.json. These checks support plan consistency and arithmetic examples only; application runtime, whole-model statistical validation, actual source-user observation and professional/production approval are not claimed.

The complete CSV registers can be filtered without reading the entire narrative. Start engineering from B00–B05, verify the complete B06 slice, then finish B07–B14 without dropping the remaining areas or after-report branches.
