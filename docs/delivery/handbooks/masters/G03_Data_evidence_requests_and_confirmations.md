# Data, evidence, requests and confirmations

Guide G03 | Version 1.0 | 16 November 2026

Code baseline: local 079f9da47a02eab681feeeda3de3dfb8cfc42848, redesign/enterprise-workspace. Source edition: October 26 original archive and registered November 11 repaired-workbook inventory, with November 16 current-file observations separately recorded. Local newer additions are not merged into GitHub main. Independent source acceptance remains open.


## Purpose and supported boundary

Create an audit-ready, reviewable population from actual original files; reconcile it to independent controls; and manage evidence/confirmation cases according to their intended use. Imported, received, accepted, sufficient and independently reviewed are different states. This guide consumes scope/planning from G00-G02 and supplies exact source versions to G04/G05.

The current A11 fixture follows the issued extract specification, accepted original CSV, independent reconciliation and handoff to analytics/sampling on one engagement. Multipart requests, replacements and local confirmation responses also work. Wider intake profiles, complete ledger/TB/master-data controls, all confirmation/evidence alternatives and external identity/delivery adapters remain open.

## Records, units and actual input schemas

| Owner | Current record contract |
| --- | --- |
| Extract request | System, reporting start/end, required fields, request/part, recipient/contact and exact accepted file version. |
| Original evidence store | Actual bytes, evidence ID/version, scope, content hash, receipt and separate auditor assessment. A filename is not original identity. |
| Population revision | Source/hash, currency, row identity/line/raw amount, parsed cents or null, accepted/quarantined/excluded state/reason; input counts/totals, bridge and independent approval. |
| Independent control | Count/amount, accepted evidence ID/version/hash, source/mapping/statements/use and exception investigation. Must not be the imported file's own total relabeled independent. |
| Request part/intended use | Required entity/period/evidence type, disposition, linked received files, acceptance/alternative decision, due date/owner and cancellation history. |
| Confirmation | Recipient/source validation, authorization/dispatch reference, response/nonresponse, differences, alternate work and conclusion. Local token delivery is a bounded adapter. |

Current normalized population CSV requires id,account,amount,entity,date,currency; optional journal,entry_type,reference. The parser supports at most 3,000 data rows and a single selected currency profile. Amount text accepts a sign, digits and up to two decimals, with safe-integer bounds; malformed or blank is null/quarantined, not zero. Exact source row and raw amount survive parsing. Population rows use integer cents internally; displayed amounts must not silently change currency scale.

Broader source methods may need debit/credit balance, opening/closing mappings, master identifiers, complete journal groups and structured FS/notes. Their exact required schema must be approved and versioned before adding an importer. Do not imply multi-currency conversion, fuzzy matching or direct ERP posting from the current CSV implementation.

## States and review handoffs

<!-- diagram: Specify extract | Receive original | Assess scope + accept | Import + quarantine | Independent reconcile | Approve usable population -->

Issue a useful extract specification before treating the export as fit for use. On receipt retain bytes and assessment. Parse rows without silently dropping bad data; classify each excluded/quarantined item with a reason and impact. Prepare a bridge from exact accounts to statement lines and reconcile independent totals. An independent reviewer approves the exact population revision. Downstream work consumes only a current usable population.

For requests, draft/canceled requests do not count as approved requirements. Partial receipt stays partial; acceptance of one file covers only its explicit matched parts/entity/period/intended use. An approved alternative needs rationale. Coverage is a monitor of the required links and assessments, not an opinion that evidence is sufficient. Replacements preserve earlier originals and invalidate current relied-upon use when needed.

## Independent examples and method boundaries

Ten imported rows must bridge to eight accepted, one quarantined and one excluded, with their respective amounts and reasons. A zero arithmetic residual does not prove the extract is complete. If independent control count is ten and the extract contains nine, sampling remains blocked even if selected account totals happen to match.

AUTO-001 source example: three approved requests for entity A/2026; one accepted matching item, one accepted wrong-period item and one rejected matching item yield covered=1, missing=1, rejected-only=1. This is a historical independently asserted specification example. It does not establish current application behavior for every request alternative. AUTO-002-008/010 method cards, exact inputs and expected examples are in G11; each remains individually dispositioned.

## Confirmations and external effects

The local confirmation link records a single-use response within its supported scope. It is not bank identity verification, proof of actual email delivery or a complete external confirmation process. The responsible auditor must retain validated recipient provenance, dispatch outcome, response integrity, investigation of differences/nonresponse and alternative procedures. A response that matches the ledger still needs source/control evaluation. Contradictory or missing evidence routes to a named owner, more work and an actual conclusion.

For future providers, proposed adapter inputs include command correlation, engagement/request/part, approved recipient/channel, artifact/reference and authorization. Retain provider attempt/outcome identifiers and uncertain results. Reconcile unknown outcomes before retries; do not send the same request twice merely because the application timed out. This is a proposed integration boundary under R22, not an existing provider interface.

## Current services and permissions

scripts/pilot-population.mjs owns parsing/reconciliation/approval/current population, pilot-requests.mjs owns coverage/evidenceCurrent and pilot-confirmations.mjs owns local responses. UI pilot-population.tsx and request/evidence views in pilot-workspace.tsx expose them. Command literals include population-import, population-reconcile, population-approve and confirmation-start. Exact symbol lines and typed interfaces in src/lib/pilot-population.ts are indexed at 079f9da.

Scoped original/download and request actions require real engagement authority. The preparer prepares/assesses under assignment; independent population approval cannot be self-review. Cross-engagement original reuse requires an explicit supported reference/permission, not copying an evidence ID into another request. Revocation must affect direct file routes and local response eligibility where applicable. Recorded A11 checks original bytes, missing source rows, independent controls and source replacement; it is not full A14/A18 acceptance.

## Change, failure and recovery

Replacing/reopening accepted source or altering extract/mapping/control basis makes the current population and relying analytics/samples/area work noncurrent as actually bound. Preserve earlier row lineage, source bytes and approvals. Work not relying on those versions continues. Malformed CSV, duplicate headers/IDs, wrong entity/date/currency, rejected-only evidence and unsupported format return actionable diagnostics. Never convert a failed import into a healthy empty population. Interrupted import/retry must leave one coherent revision or a recoverable prior state.

## E2E acceptance matrix

| Scenario | Expected proof |
| --- | --- |
| E2E-03-NORMAL | Issued specification -> exact accepted original -> all-row dispositions -> independently supported controls/bridge -> approved population -> same source rows in analytics/sample. Retain reviewer and revisions. |
| E2E-03-NEGATIVE | Missing/duplicate/malformed row, blank versus zero/negative, wrong scope/period/currency, same-file 'independent' control and unauthorized approval cannot create usable data. |
| E2E-03-REQUEST | Multipart partial/rejected/alternative/cancelled/replaced paths preserve intended-use coverage and outstanding owner. All receipt/assessment/coverage events remain separate. |
| E2E-03-CONFIRM | Validated recipient, actual dispatch/nonresponse/difference and alternative evidence reach independent conclusion; distinguish local tokens from external adapter evidence. |
| E2E-03-CHANGE | Replace accepted source after review, restart and retry; affected runs stale, earlier bytes/decisions retained and no duplicated external effect. |

<a id="source-map"></a>

## Incremental build checklist and source-map

R13.1-5: version new import profiles, close AUTO-002-008/010, strengthen mappings and complete A11 alternatives. R14.1-5: file handling, intended-use coverage, A14/A18 exceptions and whole-app evidence scope. R09.4: targeted source changes. R22.2: only approved external adapters. R23.1/2/4/5: independent expectations, connected evidence and source acceptance. Preserve current normalized CSV/A11 behavior as a regression.

Sources: P05/P08 process files and action contracts; A11/A14/A18; AUTO-001-010; screen/form uses and exact source rows in registers. G08 governs source-form fidelity; G11 retains every minimum method and separate future extension. 

## Glossary

Ирсэн: received. Хүлээн зөвшөөрсөн: accepted. Тулгалт: reconciliation. Иж бүрэн байдал: completeness. Quarantine: retained source row that cannot yet be used, distinct from deletion or intentional exclusion.

## Source case handoffs

These cards preserve the actual user goal and alternatives. The original detailed physical proposals, checks, fields, states and retry contracts are in action_contracts_source.csv/json. They are source design, not a claim that all AUD_* tables or endpoints exist. Requirement traceability retains each criterion and its own recorded evidence.

### P05-UC01 - Import a supplied dataset and resolve conformance defects

Source: SRC02 / Registers/Use_Cases.csv / P05-UC01. Owning action P05-ACT01; source primary capacity R1; screen S08. Criteria: P05-UC01-AC01, P05-UC01-AC02, P05-UC01-AC03, P05-UC01-AC04, P05-UC01-AC05.

The client supplies a trial balance, ledger or transaction register. One column is missing and some dates are ambiguous.

Source progression: Select the actual entity/period, retain the supplied original and choose the approved import profile. -> Map fields and inspect required-column, datatype, key, unit/currency and scope defects. -> Correct the profile/source through a retained revision or leave identified rows quarantined; publish the accepted import result with its limitations.

Usable outcome: An identifiable raw and interpreted data version, accepted/quarantined/excluded counts and unresolved defects.

Alternative/return path: A manual structured preparation is possible with retained source and reconciliation. A native connector is a later interface decision, not a prerequisite for supplied files.

Source input/check boundary: Original supplied dataset/file/hash, entity/period/currency/grain, approved import profile and actual key/mapping/format rules; exclusion/quarantine reasons. Validate supplied entity/period, key grain, null/type/date/sign/unit/currency rules. Acceptance of rows is conformance, not audit reliability or professional approval.

Current recorded case status: partial-evidence. Mapped observations: approved data feeds the same scoped analytics, multipart confirmation and sampled source rows (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-03-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P05-UC02 - Reconcile balances and prepare account-to-statement mappings

Source: SRC02 / Registers/Use_Cases.csv / P05-UC02. Owning action P05-ACT02; source primary capacity R1; screen S08. Criteria: P05-UC02-AC01, P05-UC02-AC02, P05-UC02-AC03, P05-UC02-AC04.

The imported trial balance must agree with source controls and the statement lines used in the audit.

Source progression: Reconcile count and signed amount controls at the actual account/period/currency grain, explaining exclusions and differences. -> Check opening-plus-movements-to-closing and ledger-to-TB differences where the necessary inputs are supplied. -> Map accounts to statement lines using the supported one-destination profile, reconcile display units/signs and submit unresolved differences for review.

Usable outcome: A reproducible reconciliation and mapping version with explicit residuals.

Alternative/return path: A repeated account header across valid detail lines is not automatically a duplicate. Split allocations, consolidation or foreign-currency bridges need a separately defined supported method.

Source input/check boundary: Exact TB/source control/FS versions, account grain, source and display sign/scale/currency, chosen one-destination mapping and explained exclusions/residuals. Check mapping scope/FS version, unmapped accounts and duplicate destination assignments under the selected one-destination profile. Reconcile totals once per source account, not once per join row.

Current recorded case status: partial-evidence. Mapped observations: approved data feeds the same scoped analytics, multipart confirmation and sampled source rows (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-03-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P05-UC03 - Review data fitness, opening balances and technical statement checks

Source: SRC02 / Registers/Use_Cases.csv / P05-UC03. Owning action P05-ACT03; source primary capacity R2; screen S08. Criteria: P05-UC03-AC01, P05-UC03-AC02, P05-UC03-AC03, P05-UC03-AC04.

The preparer has reconciled an extract. The senior must decide whether its scope and limitations are acceptable for the planned work.

Source progression: Inspect raw-to-import lineage, independent controls, residuals and coverage of the intended population. -> For an initial engagement, review opening-balance evidence and policies beyond an arithmetic tie; inspect structured statement casts, references and comparatives where selected. -> Accept the exact inputs for the stated use, return specific defects or document an evidence limitation and required additional work.

Usable outcome: A scoped data-use decision and a usable input version for the next procedure.

Alternative/return path: Prior audited closing balances do not by themselves complete ISA 510 work. Technical consistency does not establish disclosure completeness or fair presentation.

Source input/check boundary: Intended data use, exact raw/import/reconciliation/control versions, relevant opening evidence/policies and selected technical FS checks. Reviewer sees actual independent controls and exclusions. Initial-engagement opening evidence/policies cannot be reduced to O+movement=C; technical cast results do not approve FS presentation.

Current recorded case status: partial-evidence. Mapped observations: approved data feeds the same scoped analytics, multipart confirmation and sampled source rows (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-03-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P08-UC01 - Request and receive information progressively

Source: SRC02 / Registers/Use_Cases.csv / P08-UC01. Owning action P08-ACT01; source primary capacity R1; screen S13. Criteria: P08-UC01-AC01, P08-UC01-AC02, P08-UC01-AC03, P08-UC01-AC04, P08-UC01-AC05.

The team requests several schedules. The client supplies one file covering some items and promises the rest later.

Source progression: Record each requested item’s purpose, entity/period, owner/recipient and due date where agreed. -> Retain each actual received file/version, supplier, channel and received date; link the items it may fulfil. -> Accept, reject or request replacement for the stated use and keep unfulfilled parts visible.

Usable outcome: A clear requested/received/accepted/outstanding list and usable source references.

Alternative/return path: Information can arrive without a prior request. A file can fulfil several purposes only after the relevant scope/use is assessed.

Source input/check boundary: Actual requested items/purpose/entity/period, recipient/request owner and agreed dates; received exact file/supplier/channel/date and item coverage/acceptance. Check intended use/entity/period and actual coverage, not file count. Partial deliveries may fulfil only part of one item. Restricted material applies the actual confidentiality scope.

Current recorded case status: partial-evidence. Mapped observations: approved data feeds the same scoped analytics, multipart confirmation and sampled source rows (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-03-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P08-UC02 - Evaluate and annotate the evidence actually inspected

Source: SRC02 / Registers/Use_Cases.csv / P08-UC02. Owning action P08-ACT02; source primary capacity R1; screen S13. Criteria: P08-UC02-AC01, P08-UC02-AC02, P08-UC02-AC03, P08-UC02-AC04.

The preparer uses a supplied document for a procedure and finds a contradiction with another source.

Source progression: Open the exact evidence version and record relevance/reliability for its intended use. -> Add the permitted tickmark/comment or page/cell reference without obscuring the original. -> Document the contradiction, corroboration or further work and link the supported result to the procedure.

Usable outcome: Traceable evidence use and a specific unresolved issue or supported disposition.

Alternative/return path: An external call or inspection can be recorded with its actual performer/date and result. Annotations on an old file do not migrate automatically when a replacement has different pages/cells.

Source input/check boundary: Exact readable evidence version/hash, target purpose/assertion, actual auditor evaluation, page/cell anchor and corroboration/contradiction/further-work disposition. Actual content must be inspected/readable before evaluation. Correct file hash/anchor and permitted target scope are required; an annotation is not an authenticity guarantee.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-03-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P08-UC03 - Control confirmation requests and evaluate replies

Source: SRC02 / Registers/Use_Cases.csv / P08-UC03. Owning action P08-ACT03; source primary capacity R1; screen S14. Criteria: P08-UC03-AC01, P08-UC03-AC02, P08-UC03-AC03, P08-UC03-AC04.

The auditor confirms a balance with an external party. Some requests have no reply and one response differs from the client’s schedule.

Source progression: Prepare the selected request, validate the responding party/address and maintain auditor control over dispatch and the direct reply route. -> Record actual dispatch attempts and correlate actual replies, their source/reliability and differences. -> Investigate exceptions and distinguish management refusal from nonresponse; perform and document appropriate follow-up or alternatives.

Usable outcome: A request-by-request record with evaluated evidence or explicit unresolved limitations.

Alternative/return path: An external manual dispatch/receipt can be recorded; a delivery receipt is not a substantive reply. If a positive reply is necessary under the selected professional basis, alternatives do not automatically substitute for it.

Source input/check boundary: Exact subject/date/party/address basis/request content and controlled reply route, actual dispatch/reply evidence, amount/currency and refusal/nonresponse/exception evaluation. Amounts/dates/currencies must be comparable; management-supplied reply is not automatically a direct reliable response. Alternatives may be insufficient when a positive response is specifically necessary.

Current recorded case status: partial-evidence. Mapped observations: approved data feeds the same scoped analytics, multipart confirmation and sampled source rows (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-03-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P08-UC04 - Review evidence gaps and confirmation conclusions

Source: SRC02 / Registers/Use_Cases.csv / P08-UC04. Owning action P08-ACT04; source primary capacity R2; screen S13. Criteria: P08-UC04-AC01, P08-UC04-AC02, P08-UC04-AC03, P08-UC04-AC04.

The senior reviews a procedure supported by an incomplete schedule or unresolved confirmation difference.

Source progression: Inspect the evidence-use decision, source/reply reliability and the actual work performed. -> Challenge unsupported acceptance and specify additional evidence, alternative work or an unresolved limitation. -> Review the response and record the conclusion or pass the significant limitation to the partner.

Usable outcome: A supported evidence position for the relevant audit purpose.

Alternative/return path: Negative confirmation as the sole substantive procedure requires its applicable conditions; do not make it a universal default. A limitation can affect the report even where no known misstatement has been found.

Source input/check boundary: Exact evidence uses/requests/replies, actual alternatives, assigned review extent and remaining limitation. Apply conjunctive review eligibility. Check actual work/evidence and unresolved matters; completion counts or clean machine results cannot replace the stated professional review.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-03-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

## Automation handoff index

G11 contains complete minimum inputs/methods/human limits and independent specification examples; the current source verifier is a separate evidence class.

| ID | Minimum outcome |
| --- | --- |
| AUTO-001 | Show whether every approved evidence request has an accepted item for the intended entity and reporting period. |
| AUTO-002 | Determine whether an uploaded structured dataset has the required structure and belongs to the selected engagement scope. |
| AUTO-003 | Demonstrate that a structured population reached the audit workspace without unexplained loss, duplication or total-value change. |
| AUTO-004 | Identify transactions whose account, customer, supplier, employee, item or currency identifier cannot be resolved unambiguously to the supplied master data. |
| AUTO-005 | Confirm that the trial balance rolls forward correctly, balances under the declared sign convention and agrees with detailed ledger movements. |
| AUTO-006 | Trace every in-scope closing balance through an approved account mapping to the corresponding financial-statement line. |
| AUTO-007 | Identify mathematical, reference and repeated-value inconsistencies in a controlled financial-statement and notes package. |
| AUTO-008 | Show whether each current-period opening balance agrees with the corresponding prior audited closing balance after approved opening adjustments. |
| AUTO-010 | Compare current results with an auditor-approved expectation and preserve significant unexplained movements for investigation and final review. |


## Pinned code and external reference locators

All following code locators refer to the local 079f9da snapshot. File hashes and the complete symbol/action index are in code_observation_index.csv/json. The remote main/PR do not contain all of these local additions.

- scripts/pilot-population.mjs: currentExtract at line 15; csvRows at line 31; cents at line 62; parseRows at line 70; pairs at line 100. SHA-256 8bb846698d1b2ea0e6ab2efc7623cb5626e8a1b75635ca375de8defc8b5ffbbd.
- scripts/pilot-requests.mjs: evidenceCurrent at line 14; extractSpec at line 22; reopen at line 35; requestAction at line 57. SHA-256 271df366f3ca8296eae4bb7a407172d08ec7307cfe069005697d8bff35dc060d.
- scripts/pilot-confirmations.mjs: createConfirmationStore at line 12; start at line 19; pending at line 37; receive at line 49. SHA-256 0272d47f2011725bcb1c10ea66d477588fac52efc2cac721d851e1308c4f9095.

External reference pointers support the specific edition/applicability discussion, not whole-standard compliance. Fresh inspection limits, publication/effective dates and the retained original paragraph register are in external_research.csv and standards_source_edition.csv.

- [EXT11 - OWASP, Application Security Verification Standard](https://asvs.owasp.org/): 5.0.0; Overview / How to reference; File Handling chapter entry via official release index. Overview/version checked; complete ASVS assessment not conducted. Accessed 16 November 2026.
