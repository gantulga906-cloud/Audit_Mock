# System foundations and shared contracts

Guide G00 | Version 1.0 | 16 November 2026

Code baseline: local 079f9da47a02eab681feeeda3de3dfb8cfc42848, redesign/enterprise-workspace. Source edition: October 26 original archive and registered November 11 repaired-workbook inventory, with November 16 current-file observations separately recorded. Local newer additions are not merged into GitHub main. Independent source acceptance remains open.


## Purpose and system boundary

Audit_Mock is a shared audit-work prototype with versioned engagement records, native workpapers, data/evidence workflows, independent review and a reference chain through signed report receipt and custody. Its current implementation is substantial. Broader source methods, connected alternatives, production operations and independent source acceptance remain unfinished. The next work is implementation plus verification; it is not merely repeating E2E tests over finished functionality.

This guide owns common meanings. Other guides specialize them without creating another engagement, evidence identity, materiality threshold or approval. Logical ERD names from the source are target design vocabulary; current persistence is SQLite plus versioned engagement snapshots and associated original/artifact records. A diagrammed ERD table is not proof of a deployed table or connector.

## Baselines and evidence classes

| Baseline checked 16 November | Meaning |
| --- | --- |
| GitHub main: 69f0548de5f897127be671bba81cc61cfd524dfe | Older default-branch product. Its README is not the latest local capability inventory. |
| Draft PR 6: wave-0-audit-controls at 937e692c7e43e5338575aeddfd5b53c1c083fa50 | Sixteen commits ahead of main, zero behind. Earlier recorded checkpoint: 58 tests/four connected cycles. Open and unmerged. |
| Local redesign/enterprise-workspace: 079f9da47a02eab681feeeda3de3dfb8cfc42848 | Handbook code baseline. Includes workspace, report/assembly, materiality and controlled-adoption additions saved locally; no remote redesign branch found. |
| Recorded local engineering verification | 69 passing tests, no failures/skips; current clean build; six connected cycles A08/A11/A25/A26/A27/A28; 60 directly demonstrated steps and 66 criteria. |
| Independent acceptance | Empty acceptance register; releaseReady=false. No handbook mapping or PDF can close it. |

Evidence types in the registers are direct source observation, current code observation, previously recorded test, fresh documentation check, external reference, policy choice, proposed interpretation and unresolved decision. This session performs source/ref/hash checks, independent example arithmetic and document QA. It does not rerun the application suite, alter the live preview or establish production use. Ten recent turns of Assess traditional coding tradeoffs were inspected through bounded chat pages; the whole conversation was not reviewed. Its numerical progress estimates are historical, not current completion measures.

<a id="source-disposition"></a>

## Source authority and source-disposition

Use explicit approved product scope before importing another feature from an ERD or research lifecycle. Professional rules require an applicability decision for jurisdiction, entity category, framework, audit period and approved edition. Firm methodology chooses supported parameters within that context. UX recommendations describe interaction choices; code observations describe actual behavior. None of these classes silently replaces another.

The core reconciliation contains 136 feature/common items: 127 core, eight conditional and one excluded. M03-F07 Audit-owned client consolidation stays excluded. Supplied group/intercompany review under AUTO-043 stays a separate obligation. Fifty-eight automation minimums remain in the development plan; their 58 extensions remain pending. The original source called them candidate boundaries; the saved implementation plan selected the minima as core work, without activating the extensions.

The source populations are 75 cases, 315 criteria, 51 lifecycle inventories/476 steps, 70 forms, 22 variants, 20 confirmed references and 1,012 BPMN gateway/flow entries. Sixteen processes, 25 screen groups and 29 model decisions are also retained. All original 25 packages and 128 task descriptions/statuses are preserved. These populations are not a completion denominator for a single percentage.

All 2,247 verifier rows receive individual guide/disposition entries. The 1,012 BPMN rows retain unresolved stage-owner mapping: stage grouping alone cannot establish the correct actor, branch condition or mandatory feature. The nested archive was opened recursively: 158 non-directory member instances including nested ZIP containers. Source-ledger identity checks do not claim fresh semantic/visual review of every historical PDF page or every secondary attachment recorded inside an old source inventory. D27 remains open.

## Shared ownership and identifiers

| Contract | Owner and invariant |
| --- | --- |
| SC01 Scope | Server-authorized engagement identity controls reads, commands, originals, reports, archive grants and retries. Tenant/source namespaces remain explicit future deployment concerns. Display names are not keys. |
| SC02 Work and review | A stable work ID has mutable current revision and immutable prior snapshots. Reviewed means the exact reviewed revision; changed content requires renewed affected review. |
| SC03 Evidence | Evidence ID, version, scope and original SHA-256 identify the file. Receipt, accepted use and sufficiency are separate. Replacement preserves originals and reliance history. |
| SC04 Decision | Record actual actor/capacity, facts, rationale, authority and source versions. A task checkbox or successful calculation cannot approve a professional judgment. |
| SC05 Method/run | Bind definition/profile/version, exact input/mapping/parameter versions and units. Preserve outputs, row lineage, exceptions and human disposition. Changed input creates a new run. |
| SC06 Release | Authorization binds exact draft/FS/notes/required work/quality basis. Signature, issue, recipient outcomes, assembly, lock and custody are separate events. |
| SC07 External ownership | Client/staff/accounting facts have actual source owners. Pin a dated snapshot/reference; correction and publication do not mean Audit merges canonical master records. |
| SC08 Change impact | Reopen affected reliance and approvals, retain earlier work/artifacts and allow unrelated drafting. A dependency is action-specific, not numerical form order. |

For future APIs use stable subject, record and version identifiers, not transient array positions. Keep source row identity separate from a display row number. Retain null/unknown, zero and not-applicable as distinct values. A N/A assertion needs scope/authority/rationale; blank does not mean N/A. Numeric amounts need currency/unit/period and rounding policy. Table identifiers such as INV-0007 remain text.

## States and command contract

<!-- diagram: Draft / in progress | Submitted exact revision | Independent review | Returned with issue | Correct + respond | Clear + renew review -->

Work statuses include not_started, in_progress, waiting, submitted, returned, changed and reviewed in the shared model. Views may derive changed when a relied-upon planning/run basis becomes stale. SubmittedVersion and reviewedVersion are explicit. Current review requires the content revision and dependent basis to match; a historical reviewed label is not current permission to issue.

Authenticated reads use GET /api/pilot?engagement=ID. Mutations use POST /api/pilot/action?engagement=ID with action, fields, revision and optional idempotencyKey. The server checks session, scope, resource authority, current revision and domain preconditions within a transaction. Idempotency binds actor, scope and normalized command payload. Identical retry gives one logical effect; changed payload/scope with the same key returns conflict. A stale revision returns 409: refresh and reconsider the affected facts rather than automatically replaying a changed decision.

Current physical records are indexed in scripts/pilot-store.mjs and the domain stores. Proposed canonical contracts in source Action_Contracts.csv retain exact AUD_* field references, but are not advertised as the pilot API. New adapters must reconcile stable local IDs, externally owned IDs and immutable versions; do not equate a similar column name with an implemented mapping.

## Permissions and independent responsibilities

| Capacity | Current supported boundary |
| --- | --- |
| Preparer / Бэлтгэгч | Assigned in-scope work, evidence use and submission. Cannot independently review own submitted content or authorize the report. |
| Reviewer / Ахлах хянагч | Assigned independent review, return/clearance, planning/evaluation preparation and authorized form adoption. Does not thereby gain partner issue authority. |
| Partner / Партнер | Actual authorized engagement decisions, independent approvals, issue and grant administration within current implementation. Authority still needs a professional/policy basis. |
| Quality / independent desk | Separate account and eligible scoped exact-draft quality review when required. Source ordinary R4 confirmation is not synonymous with formal EQR. |
| Custodian / independent desk | Verify offered sealed package, exact manifest/digest/readability, return with owner or accept. Custody does not approve audit conclusions. |

The source four-capacity model also describes authorized supporting work without inventing a fifth professional review level. The software currently has three preset team accounts and two separate independent entrances. Named identities, join/leave/delegation/expiry and production identity/session design remain R10/R22 work. Access rights, credential suitability, independence and assignment must each be checked; passing one does not establish the others.

<a id="dependencies"></a>

## Dependencies and version/staleness

Each DEP-C01-C20 row retains from/to/source location, target field and action-specific meaning in dependencies.csv. Do not replace it with a blanket graph gate. For example, drafting independent 1.1.1 fields can begin before acceptance; activation waits for the actual approved acceptance/terms decisions. Current 1.3 feeds sampling/evaluation; unchanged controls need not reopen merely because materiality changes.

Shared data_ownership_staleness.csv specifies producer, consumer, trigger and retained history. A stale approval remains attributable history; the current consuming action must obtain a fresh basis. Targeted invalidation must identify its cause and owner. If a new edge is only a numeric reference candidate, label it unconfirmed until its actual source/action meaning is approved. Avoid circular readiness between quality review and issue.

## Failure and recovery

Denied reads must not disclose another engagement's private metadata. Revoked membership must affect deep links and existing grants, not just menu visibility. Partial receipt or a canceled request cannot make evidence complete. Unknown external outcomes require reconciliation before retry; local idempotency alone cannot ensure a provider did not already send a message. A sealed package remains immutable; amendments create successor lineage, renewed affected work and new release/custody events.

Operational recovery uses disposable restore rehearsals and actual artifact comparisons. The recorded SQLite restore check retained exact archive bytes and scope; it is a local reference, not an agreed production RPO/RTO. Never upgrade/reset the live preview to manufacture handbook screenshots.

## Standards edition and local applicability

Fresh external checks identify IAASB's 2026 Handbook (published 30 September 2026) and IESBA's 2026 Handbook (24 September 2026). The guides' inspected clause pointers principally use the 2025 editions from the original standards register. The 2026 fraud/going-concern revisions apply internationally to periods beginning on/after 15 December 2026, subject to adoption; publication date is different. IFAC's February 2026 Mongolia profile reports ISA 2020 in application and a code aligned to IESBA 2018. D21 requires the actual approved local instruments and engagement determination.

Use external_research.csv for exact links, editions, dates, locators and access limits. Official legal pages returned 403 on direct access during this task; indexed official snippets and the older source analysis do not establish a freshly checked complete consolidated law. The source ten-year workpaper-retention finding is preserved as a policy/legal review item; the release configuration must confirm its current application and anchor. Do not substitute a generic five-year period or auto-delete.

## E2E acceptance and build checklist

E2E-00-NORMAL establishes two persisted engagements, actual authorized actors, independent review and exact original/version bindings. E2E-00-NEGATIVE denies wrong/revoked scope, self-review and stale writes. E2E-00-CHANGE revises a depended-upon fact and proves selective reopening and untouched history. All must record actual results and preserved bytes; these are scenario specifications, not newly executed tests.

R00/R09/R10/R22/R23 run alongside domain work: pin the accessible code/source edition; approve ownership and identity contracts; close each confirmed reference; extend the owning command/store; prove connected behavior; record independent source decisions separately. Keep design obligations visible but park renewed broad redesign. G09 owns final operations/release gates.

<a id="source-map"></a>

## Source-map and glossary

Primary sources: grounded Editable/01_Agreed_Facts_and_Boundaries.md, 02_Roles_and_Review_Model.md, 03_Shared_Data_and_Action_Contracts.md; all source registers; the physical DBML; original November 11 plan and November 16 implementation evidence. Owning inspected code: scripts/pilot-server.mjs, pilot-store.mjs, pilot-workflow.mjs, src/lib/workspace.ts and domain modules. Exact symbols/lines/hashes: code_observation_index.csv at 079f9da.

Гэрээт ажил: engagement. Ажлын баримт: workpaper. Нотлох баримт: evidence. Хяналт: review, whose exact meaning depends on assigned responsibility. Version: immutable content identity for reliance. Current: relied-upon inputs still match. Accepted: an actual separate decision, never inferred from a source map. Guide section slugs use the Markdown heading text; per-row maps use source-map unless a more specific anchor is named.

## Pinned code and external reference locators

All following code locators refer to the local 079f9da snapshot. File hashes and the complete symbol/action index are in code_observation_index.csv/json. The remote main/PR do not contain all of these local additions.

- scripts/pilot-server.mjs: json at line 26; readJson at line 31; createPilot at line 49; resolveScope at line 107; view at line 116. SHA-256 19ec77c46c8c3df4ac0d3bcc9ab57231f1c5856a6810864882b00f2c1c64f955.
- scripts/pilot-store.mjs: createPilotStore at line 17; transaction at line 18; insert at line 34; portfolio at line 78; load at line 85. SHA-256 32f415ba8b70493f0dba54529a382a60b5475d59637eb6ddb9262dbcb50c0797.
- scripts/pilot-workflow.mjs: planningChanged at line 47; syncPlanningPapers at line 56; syncFieldwork at line 67; validMateriality at line 92; reportWorkspace at line 96. SHA-256 4a97ca99e80e34f23929733e1feba4e60c106ceca72277be643f8430786f8d23.

External reference pointers support the specific edition/applicability discussion, not whole-standard compliance. Fresh inspection limits, publication/effective dates and the retained original paragraph register are in external_research.csv and standards_source_edition.csv.

- [EXT04 - IAASB, Current Handbook publication](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance): 2026; Publication metadata and future-effective standards list. Publication metadata checked; 2026 full clause comparison not performed. Accessed 16 November 2026.
- [EXT06 - IESBA, Current Handbook publication](https://www.ethicsboard.org/publications/2026-handbook-international-code-ethics-professional-accountants): 2026; Volume 1 external-expert/sustainability effective-date bullets. Publication/effective-date summary; not full Code text comparison. Accessed 16 November 2026.
- [EXT07 - IFAC, Mongolia member-country profile](https://www.ifac.org/about-ifac/membership/profile/mongolia): Updated February 2026; Adoption: ISA, ethics and quality management. Profile only; not legal-adoption certification. Accessed 16 November 2026.
- [EXT08 - Legalinfo Mongolia, Audit Law](https://legalinfo.mn/mn/detail?lawId=11192): Current consolidated body not obtained; Source pointers arts 8.1-8.3 and 12.5. Direct official pages 403; indexed snippets obtained for tenure. No fresh full-text verification of retention. Accessed 16 November 2026.

Core-facing interfaces needed by approved audit functions remain core even where the complete wider B/C process or separate service needs a mandate. Do not use a broader-stream scope decision to defer an already approved audit-facing contract.

The source_alias_crosswalk resolves all 14 referenced historical F-identities to their exact original paths and hashes; all 14 files are still present and match those hashes. Six also match current archive member bytes. This is identity evidence, not a newly repeated whole-source semantic review. Repaired workbooks and renamed archive editions retain separate identities.
