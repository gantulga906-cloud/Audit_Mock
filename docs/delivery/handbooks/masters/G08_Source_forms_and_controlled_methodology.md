# Source forms and controlled methodology

Guide G08 | Version 1.0 | 16 November 2026

Code baseline: local 079f9da47a02eab681feeeda3de3dfb8cfc42848, redesign/enterprise-workspace. Source edition: October 26 original archive and registered November 11 repaired-workbook inventory, with November 16 current-file observations separately recorded. Local newer additions are not merged into GitHub main. Independent source acceptance remains open.


## Why a separate support guide

Forms and controlled methodology affect every domain. This support guide owns source fidelity, builder/import/publication/adoption and readable exports; it avoids redefining the same lifecycle in eight books. All 70 substantive forms receive an individual record with exact source fields, coordinates, clauses/options, family, recorded status and remaining acceptance work in form_fidelity.json/csv. The 71st sheet is a change register, not an additional substantive form.

The pilot loads all 70 contracts and has typed answers, repeated schedules, exact-version review, per-form authoring grants, independent publication, pinned engagement use and direct adoption-loss acknowledgement. These are working features. Whole-form fidelity/acceptance, full Excel mapping/preview, effective dates/retirement and dedicated programme-level loss acknowledgement remain incomplete.

<a id="source-map"></a>

## Source freshness and interpretation

Registered November 11 inventory: 272 row-number formula cells (219 shared followers), 1,820 list validation definitions, of which 1,048 responsibility assignment and 772 other categorical. The formulas are presentation sequences, not 272 missing audit calculations. Importing a source responsibility dropdown cannot grant application access.

Fresh hashes still show externally resaved Stage 2/3 files. The recorded semantic check preserves effective list choices/rules across 2,584 covered cells; Stage 3 consolidated 1,148 definitions to 315, making the current five-book count 987. Stage 3 values/formulas/merges match its exact retained registered baseline. Stage 2's retained repair copy is older than the exact registered binary and differs at four heading-help cells 2.3А!J9:J12; an exact registered whole-content match is not established. Keep registered/current hashes separate, do not rewrite the frozen JSON as if drift never happened.

Source report codes 4.1A1/4.1A3/4.1A4 appear with normalized application IDs 4.1.A1/4.1.A3/4.1.A4; retain both exact sheet and normalized ID. A type adapter is not permission to change historic pinned digests. Current corrections: 3.1.2 r28/I narrative; 3.3.1 r37/B text identifier and F signed numeric. Planning/hour columns remain numeric.

## Authoring, publication and adoption states

<!-- diagram: Source / controlled draft | Authorized editing | Independent publication | Pinned engagement edition | Compare adoption losses | Explicit apply + renew review -->

Authors edit only granted forms; publication is separate independent authority. Publishing never updates an engagement silently. A workpaper keeps its adopted template version/digest. Adoption compares the current pinned body/answers with a target latest edition and identifies changed/removed/added definitions, incompatible cells, conditional hidden answers, evidence detachments and renewed review.

The read-only GET /api/pilot/form-adoption-preview?engagement=ID&form=ID&version=VERSION is available to permitted reviewer/partner on a current unsealed engagement. The direct form-use command requires adoptionReview from the current preview digest plus adoptionAck='reviewed' when current content would be lost. The digest binds scope, work revision, target, answers and evidence; stale acknowledgement returns 409. Compatible/first adoption retains its older API contract.

Repeated tables migrate cell by cell, retaining stable row IDs and exact compatible strings, including zero, negative values and leading-zero identifiers. Removed/type-changed/invalid-choice/inapplicable current cells clear only after reviewed adoption. The prior answer/template/signature and original evidence remain in history; detached links disappear only from the current work. The programme-approval route now shares preservation/change-summary logic, but its dedicated loss-acknowledgement interaction is still open. Do not describe direct-adoption acknowledgement as complete programme migration.

## Types, importer and exact examples

Current table columns support text, narrative, number, date, select, multiselect, yes/no and accepted evidence. Definitions allow 1-30 columns with the existing 100-row limit; duplicate keys, empty scalar choices, nested tables and malformed schemas fail. Accepted evidence in table cells must be current and in engagement scope and participates in linkage/adoption diagnostics.

Synthetic example: row ID row-A contains unit='INV-0007', difference='-0.50' and current accepted support. Changing only an unrelated description preserves both exact strings and row ID. Removing the difference column lists that cell as lost; applying without current acknowledgement fails. After accepted adoption the new current table lacks that cell, while the old signed table still contains '-0.50'. Replacing numeric with narrower categorical options cannot coerce unsupported values into the first choice.

The existing structured question-list importer is available. Full source-workbook mapping must still preview row/field identity, type/options/applicability, operative versus layout formulas, clauses/merged labels, duplicate IDs/unsupported rules and evidence columns. Import creates a controlled draft, not publication or engagement adoption. A parseable workbook is not proven semantic parity.

## Per-form acceptance method

For each form, compare all meaningful fields/instructions/clauses and repeated structures with its exact source edition. Verify editable versus linked/derived/fixed fields, null/zero/N/A, actual applicability and evidence. Exercise save/reload, return/resubmit/clear/review, published adoption and historic signed answers. Produce a readable export containing title/form/code/source edition, actual answers/rows, evidence references, actor/version/review and unsupported/pending decisions without leaking hidden private scope.

The form register does not mark a form complete merely because it loads. Recorded evidence is partial for 3.1.2/3.3.1, and detailed materiality evidence is separately linked. Each of the remaining families still needs its own source fidelity and acceptance. Source options cannot become legal or firm defaults without an approved owner decision.

## Owners, failures and E2E

scripts/pilot-forms.mjs owns runtime formContract/adoption/migration; src/lib/pilot-forms.ts and pilot form UI define schema/use; native renderer and builder components expose columns and loss review. tests/pilot-form-adoption.test.mjs records source type corrections, invalid schema/scope checks, current acknowledgement, row/evidence preservation and restart. The source adapter is shared by manual and newly approved programme use; frozen source definitions and old digests remain intact.

E2E-08-NORMAL publishes independently, explicitly adopts, saves/submits/reviews the actual typed form and exports it. E2E-08-NEGATIVE rejects invalid schema, self-publication, wrong evidence/scope, sealed adoption and missing/stale loss acknowledgement. E2E-08-CHANGE alters a table/choice/applicability rule, retains compatible cells/history and renews affected review. E2E-08-IMPORT tests real source mapping/diagnostics as the remaining importer is built. These are acceptance specifications; recorded direct-adoption proof is distinguished from planned importer/programme interaction proof.

## Build checklist, source-map and glossary

R07.1-5 closes all 70 individually in coherent families: acceptance/materiality/controls/assets/sampling/completion/report first, then the full register. R08.1-5 retains current grants/builder/importer and completes mapping/preview, lifecycle/release comparison and dedicated programme loss acknowledgement. R09.2/4 preserves owning values/change impacts. R23.2/5 records independent source acceptance. Build a faithful contract into the existing renderer rather than a second browser-only form engine.

Sources: repaired five workbooks, form-source-inventory.json, P04/P15, Native_Form_Cells/Native_Forms_and_Information_Requirements source registers, form-adoption-2026-11-16.md and source freshness comparisons. Хувилбар: version/edition according to context. Загвар: template. Нийтлэх: publish. Adopt: an explicit engagement decision to use a release. Compatible: value remains valid under the target definition, not merely similar visible wording.

## Source case handoffs

These cards preserve the actual user goal and alternatives. The original detailed physical proposals, checks, fields, states and retry contracts are in action_contracts_source.csv/json. They are source design, not a claim that all AUD_* tables or endpoints exist. Requirement traceability retains each criterion and its own recorded evidence.

### P04-UC01 - Draft reusable audit content with the source structure

Source: SRC02 / Registers/Use_Cases.csv / P04-UC01. Owning action P04-ACT01; source primary capacity SUPPORT; screen S06. Criteria: P04-UC01-AC01, P04-UC01-AC02, P04-UC01-AC03, P04-UC01-AC04.

A methodology author updates a questionnaire, programme or report template. Questions, guidance, fixed clauses and repeating tables have different purposes.

Source progression: Locate the content family by stage/service/framework/sector and create an identifiable draft revision. -> Edit the wording, instructions, response types, repeat structure and supported applicability conditions while retaining source references. -> Compare the draft with the published version and submit it to the authorized methodology reviewer.

Usable outcome: A reviewable draft with explicit differences, effective context and no changes to live answers.

Alternative/return path: Separate industry templates may be used; no unconfirmed automatic field-hiding feature is assumed. A condition whose policy is not settled remains unresolved rather than becoming a hard blocker.

Source input/check boundary: Content family and parent release, draft wording/instructions/types/repeat conditions, source requirement edition and proposed effective scope. Validate typed response schema, unique stable item/repeat keys, actual optionality and source edition; headings are not answer fields. Publishing authority is additional to R3/R4.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-08-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P04-UC02 - Review, publish and retire a methodology release

Source: SRC02 / Registers/Use_Cases.csv / P04-UC02. Owning action P04-ACT02; source primary capacity SUPPORT; screen S06. Criteria: P04-UC02-AC01, P04-UC02-AC02, P04-UC02-AC03, P04-UC02-AC04, P04-UC02-AC05.

The authorized methodology reviewer receives the changed content and checks its professional basis and usability before publication.

Source progression: Inspect differences, source requirements, applicability and representative normal/conditional/invalid examples. -> Return specific problems or approve the exact release and its effective scope/date under the actual publishing authority. -> Publish release notes and retain superseded or retired versions for historical work.

Usable outcome: A clearly identifiable approved release or a returned draft with named issues.

Alternative/return path: Publication of an international handbook does not establish local adoption. A retired release remains identifiable in the engagements that used it.

Source input/check boundary: Exact candidate release hashes, reviewer/publisher authority, effective scope/date, validation evidence and approval/return rationale. Check professional content/examples, actual authority, effective applicability and exact content hashes. Handbook publication alone is not local adoption.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-08-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P04-UC03 - Instantiate and selectively adopt template changes

Source: SRC02 / Registers/Use_Cases.csv / P04-UC03. Owning action P04-ACT03; source primary capacity R2; screen S06. Criteria: P04-UC03-AC01, P04-UC03-AC02, P04-UC03-AC03, P04-UC03-AC04.

The senior selects the approved content for a new audit. During fieldwork a later release becomes available.

Source progression: Select the applicable approved starting version and create the working copy. -> For a later update, compare it with local tailoring, answers and review status. -> Accept applicable changes with an impact decision or defer them with a reason; retain source lineage and route affected work for reassessment.

Usable outcome: A usable engagement form/programme version with controlled adoption history.

Alternative/return path: Locally added work may have no master-template origin. Changes that affect a required professional procedure need assessment even if the team defers an optional template improvement.

Source input/check boundary: Selected published template versions, target engagement/area, local tailoring and exact later-release differences with adoption choice. Only approved applicable version is offered as approved; local tailoring and repeated row identity survive. Review extent depends on material changes, not every new catalogue publication.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-08-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P15-UC01 - Create workpapers and cross-reference actual support

Source: SRC02 / Registers/Use_Cases.csv / P15-UC01. Owning action P15-ACT01; source primary capacity R1; screen S07. Criteria: P15-UC01-AC01, P15-UC01-AC02, P15-UC01-AC03, P15-UC01-AC04.

A preparer documents an audit procedure in a native form or an externally prepared worksheet and needs it findable in the audit file.

Source progression: Create the working copy or retain the external original with reference, title, period, source and confidentiality metadata. -> Enter the actual work in the supported representation and link the relevant procedure, risks/assertions and exact evidence anchors. -> Save/submit the identifiable revision with preparation attribution and any limitations.

Usable outcome: A usable indexed workpaper and navigable basis for review.

Alternative/return path: An external file does not automatically produce native cell answers. An unsupported preview format remains downloadable/readable through its actual supported route, with preview limitation explicit.

Source input/check boundary: Actual reference/title/type/period, selected native template or external exact original, source/confidentiality, actual work and evidence/risk/procedure anchors. Check native schema/types/value states and actual source/period/scope. Keep missing/unknown/N/A/false/zero distinct; unsupported previews remain explicit.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-08-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P15-UC02 - Save revisions and resolve concurrent changes

Source: SRC02 / Registers/Use_Cases.csv / P15-UC02. Owning action P15-ACT02; source primary capacity R1; screen S07. Criteria: P15-UC02-AC01, P15-UC02-AC02, P15-UC02-AC03, P15-UC02-AC04.

Two authorized users work from the same revision. One has already saved changes when the other attempts to save.

Source progression: Save against the revision originally opened and inspect the returned current-version conflict. -> Compare both contributors’ changes and resolve them deliberately, preserving recoverable prior work. -> Save a new current revision and assess any effect on already submitted/reviewed content.

Usable outcome: An explicit current revision with no silent lost work.

Alternative/return path: Draft retention need not mean storing every keystroke. Replaced external evidence follows exact version/history and impact controls.

Source input/check boundary: Opened exact object/version/hash and attempted edited content, current conflicting revision, actual contributor/capacity and deliberate merged/revised save. Expected version/hash and lock/current state are rechecked at commit; actor must have actual write authority. No last-write-wins or implicit auto-merge of professional judgments.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-08-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P15-UC03 - Check completeness, search and export a readable file subset

Source: SRC02 / Registers/Use_Cases.csv / P15-UC03. Owning action P15-ACT03; source primary capacity R2; screen S07. Criteria: P15-UC03-AC01, P15-UC03-AC02, P15-UC03-AC03, P15-UC03-AC04.

The reviewer needs to locate work, inspect broken/stale references and provide an authorized readable package for a defined purpose.

Source progression: Search/filter permitted references and inspect the underlying current/historical versions in context. -> Resolve or assign missing work, stale schedule links, unavailable files and unresolved check-outs. -> Preview the selected export manifest and produce the permitted indexed package with usable cross-reference listings and disclosed restrictions.

Usable outcome: Findable work and a usable authorized package, not a claimed professional clearance.

Alternative/return path: A restricted/unavailable reference is listed appropriately rather than silently included or omitted. A refreshed trial balance does not silently update signed workpapers.

Source input/check boundary: Permitted search/reference criteria, exact current/historical work and stale/missing checks; defined export purpose/recipient/scope and selected exact manifest. Scope applies to search, snippets, links, payloads and export. Check actual selected versions and readability; operational completeness cannot sign off professional work.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-08-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

## Pinned code and external reference locators

All following code locators refer to the local 079f9da snapshot. File hashes and the complete symbol/action index are in code_observation_index.csv/json. The remote main/PR do not contain all of these local additions.

- scripts/pilot-forms.mjs: sourceTemplate at line 30; libraryView at line 45; libraryTemplate at line 55; smallText at line 63; options at line 64. SHA-256 e079ccd1c2709205246d3dc3b10aeda7de458c24c76b92a5c4b63a3ba6f44c53.
- tests/pilot-form-adoption.test.mjs: start at line 12; fixture at line 17. SHA-256 1cb96bbb1243f7534cebf1affa0e60c1b24544ec21a4b1d37514b61685312384.

External reference pointers support the specific edition/applicability discussion, not whole-standard compliance. Fresh inspection limits, publication/effective dates and the retained original paragraph register are in external_research.csv and standards_source_edition.csv.

- [EXT07 - IFAC, Mongolia member-country profile](https://www.ifac.org/about-ifac/membership/profile/mongolia): Updated February 2026; Adoption: ISA, ethics and quality management. Profile only; not legal-adoption certification. Accessed 16 November 2026.
