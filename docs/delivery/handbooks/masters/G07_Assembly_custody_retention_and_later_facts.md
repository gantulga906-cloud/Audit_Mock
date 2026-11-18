# Assembly, custody, retention and later facts

Guide G07 | Version 1.0 | 16 November 2026

Code baseline: local 079f9da47a02eab681feeeda3de3dfb8cfc42848, redesign/enterprise-workspace. Source edition: October 26 original archive and registered November 11 repaired-workbook inventory, with November 16 current-file observations separately recorded. Local newer additions are not merged into GitHub main. Independent source acceptance remains open.


## Purpose and supported boundary

Complete the final-file index, preserve exact issued reports/statements/work/originals, hand the sealed package to an independent custodian, permit controlled retrieval and manage later facts/amendments with lineage. Assembly, lock, custody acceptance and retention are separate responsibilities and clocks. G06 supplies exact issue; G05 supplies reviewed work. Do not put new audit conclusions into administrative assembly.

The local A27 fixture demonstrates exact assembly diagnostics/approval, lock, returned corrupt custody/reoffer, scoped retrieval and restart. A28 demonstrates issued-and-sealed later-fact no-change/reissue/reliance-notice branches. Dated-but-unsealed and dual-dating variants, full retention/disposal rules and broader custody/inspection operations remain open. Local storage is not an independent production custody service.

## Records, manifests and clocks

| Record | Content and invariant |
| --- | --- |
| Assembly M12-F02 | Exact report/statement versions, required signed papers/records, recursive references, accepted originals/hashes, note closure/history, inventory digest and policy evidence. |
| Assembly policy | Approved anchor kind/date, calendar-day allowance, policy evidence/version/hash and late reason where needed. Completion event is separately attributable. |
| Sealed archive | Immutable package bytes/hash, authorized issue identity, reviewed inventory/history and original evidence. Edit denial is a state rule, not custody acceptance. |
| Custody offer | Exact archive/manifest identity, independent verifier, readability/digest result, return reason/owner and new reoffer history. |
| Retrieval/hold/retention | Actual purpose, permitted scope, expiry/revocation, hold and applicable deadline/anchor; later amendments inherit longer restrictions. |
| Later fact/successor | Original report/archive, discovery chronology, screening revisions, discussions, approved response, affected rework and exact successor release/custody. |

Assembly checks every relied-upon record/reference and accepted original, not merely a list of filenames. A manifest ID with different bytes is a failure. Current assembly basis includes issueAt/authorizationAt/report hash/inventory digest/deadline and policy evidence. The independent assembly approval is current only if that basis still matches.

## Workflow and permissions

<!-- diagram: Issued exact package | Assemble + diagnose | Independent index approval | Lock immutable file | Independent custody verify | Controlled retrieval / successor -->

An authorized assembly preparer gathers current records and closes references/notes, then an independent approver checks the exact index and policy. Lock requires the current applicable distribution/assembly state. Custodian downloads and independently checks exact digest/readability. A corrupt offer is returned with a corrective owner; after restoration/reconciliation a new offer retains the earlier failure. Custodian acceptance does not certify audit sufficiency.

Normal team members do not gain sealed-file metadata merely by knowing the URL. Retrieval requires an actual approved scoped grant; full-file and report-only scopes differ. Expired/revoked grants deny direct download. Revoked engagement membership closes affected grants. Holds override disposition. No handbook authorizes automated deletion; disposal needs the actual approved legal/policy decision and evidence.

## Deadline arithmetic and policy decisions

The current assembly implementation accepts explicit report/issue/other anchor and 0-3650 calendar days, producing a UTC date. Synthetic example: anchor 2026-01-31 plus 30 calendar days gives 2026-03-02. That is arithmetic, not the applicable deadline. Completion after the selected deadline needs a recorded late reason/decision. An ordinary standard's example period, firm deadline, lock date and retention anchor must not be conflated.

The source conflict C07 flags an older five-year guide against a reported Mongolian ten-year workpaper minimum. Preserve the issue and require current instrument/application/anchor confirmation under D20/D21. Official legal full-text access was blocked during this documentation session; no fresh consolidated-law certification is claimed. Longer policy or hold restrictions survive successor amendments; a later package must not shorten them.

## Later-discovered facts

Record original report/archive identity and when the fact actually arose/became known. Retain initial/revised screening, management and governance discussions and actual response approval. For reissue, the approved plan names affected work/date, fresh review, authorization/signature, replacement distribution/receipt and separate custody. The predecessor remains immutable/retrievable under valid grants. No-change retains its rationale; a reliance-notice branch records actual communications/outcomes and cannot close on a failed notice.

The current A28 reference is issued and sealed. Facts after report date but before issue, after issue but before sealing and dual dating need different chronology/permissions and source review. Do not pretend the existing fixture proves them or erase these requirements. A substantive amendment must not be disguised as an administrative index correction.

## Current owners and recorded evidence

scripts/pilot-assembly.mjs owns assemblyInventory/assemblyDeadline/checkAssemblyRecord; pilot-archive.mjs owns sealed packages/grants/holds; pilot-oversight.mjs owns offers and independent custody; pilot-later-facts.mjs owns chronology/response; pilot-store.mjs persists scope/revisions. UI pilot-oversight.tsx, pilot-later-facts.tsx, assembly controls and independent custodian entrance expose these. Exact command names/symbol locations/hashes are indexed at 079f9da.

Recorded tests/pilot-reporting.test.mjs and tests/pilot.test.mjs demonstrate A27/A28, exact recovery, corruption return/reoffer, expiry/revocation and successor preservation within local fixtures. No fresh live DB restore or mutation was performed for the handbooks. Production recovery/availability/support workload and external custody adapters require R22/R23 acceptance.

## Failure and preservation

Missing/corrupt original, unresolved note/reference, stale work/preparation/FS, wrong manifest/digest, unauthorized custody and incomplete applicable recipient outcomes block the named transition. Preserve prior index/offer/return, not overwrite a failed transfer as if it succeeded. A backup must be restored to a disposable target and actual report/original/archive hashes compared. An ordinary file copy of an active WAL database is not an assumed production backup procedure; use a supported snapshot mechanism and rehearse it.

## E2E matrix and build checklist

| Scenario | Independently expected proof |
| --- | --- |
| E2E-07-NORMAL | Exact issued package -> diagnosed/current index -> independent assembly approval -> lock -> custodian download/hash/readability -> scoped retrieval; distinct event dates/actors. |
| E2E-07-NEGATIVE | Missing/corrupt original, stale index, open note, wrong manifest, expired/revoked/wrong-scope grant and locked edits denied without changing package. |
| E2E-07-RETURN | Return custody with owner; corrected reoffer and acceptance retain failed offer/history and exact bytes. |
| E2E-07-CHANGE | Later fact -> chronology/discussions/approved plan -> affected rework -> exact successor release/custody; original, longer retention and holds survive. |
| E2E-07-RECOVERY | Supported backup/restore in a disposable environment retains IDs, scopes, original bytes and archive digest; actual production RPO/RTO still needs approval. |

R21.1/2/5 extends existing A27/custody/lineage evidence; R21.3 approves real retention/disposition policy; R21.4 closes A28 timing/dual-dating alternatives. R20 preserves exact issue, R22 implements approved adapters/recovery operation and R23 obtains independent acceptance. No feature is removed merely because source legal/policy input is unresolved.

<a id="source-map"></a>

## Source-map and glossary

P12, A27/A28, Stage 5 5.1, M12 and AUTO-058; full original action contracts and source conflicts. ISA 230 paragraph pointers and publication/local-edition limits are in external_research.csv. Бүрдүүлэлт: assembly. Архив: archive. Хадгалалт: retention/custody depending on context. Hold: preserved prohibition on disposition. Successor: a new controlled package linked to its immutable predecessor, not an edited original.

## Source case handoffs

These cards preserve the actual user goal and alternatives. The original detailed physical proposals, checks, fields, states and retry contracts are in action_contracts_source.csv/json. They are source design, not a claim that all AUD_* tables or endpoints exist. Requirement traceability retains each criterion and its own recorded evidence.

### P12-UC01 - Assemble the final file and resolve diagnostics

Source: SRC02 / Registers/Use_Cases.csv / P12-UC01. Owning action P12-ACT01; source primary capacity R1; screen S22. Criteria: P12-UC01-AC01, P12-UC01-AC02, P12-UC01-AC03, P12-UC01-AC04.

After report issue, the assembler reconciles the workpaper/evidence/report index to the actual usable contents.

Source progression: Collect the final exact versions, reports, communications and required review records into the approved index. -> Run or inspect missing-file, broken-link, open-note, sign-off, check-out and non-final-version diagnostics. -> Resolve administrative defects or route substantive work separately; submit the actual manifest and remaining exceptions for review.

Usable outcome: An identifiable assembled package and a transparent defect list.

Alternative/return path: Unavailable content is reported distinctly from a genuinely absent item. Contrary evidence cannot be deleted to make the file look complete.

Source input/check boundary: Actual approved file index and selected exact final object/file versions/hashes, completed report/communication/review scope and diagnostic exceptions. Every included object/hash/file must resolve and be authorized. Missing diagnostics are not proof of complete audit; distinguish administrative assembly from new substantive work.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-07-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P12-UC02 - Approve the assembled file and controlled amendments

Source: SRC02 / Registers/Use_Cases.csv / P12-UC02. Owning action P12-ACT02; source primary capacity R3; screen S22. Criteria: P12-UC02-AC01, P12-UC02-AC02, P12-UC02-AC03, P12-UC02-AC04.

The authorized completion approver checks the assembled file. A later necessary correction may require an authorized amendment.

Source progression: Review the actual manifest, required completion conditions and unresolved exceptions. -> Authorize locking the exact version or return specific defects; record completion/lock events and the applicable retention basis. -> For a later request, distinguish administrative change from substantive audit/report effect, authorize its exact scope and require necessary review/re-lock.

Usable outcome: A protected final file and retained amendment history.

Alternative/return path: Substantive later work follows the relevant audit/reporting response, not a generic archive-edit shortcut. The approver role is assigned firm authority; R3 title alone does not grant disposal or custody powers.

Source input/check boundary: Exact assembled manifest/diagnostics and actual lock authority; applicable retention basis; later amendment request/reason/kind/scope and impact review. Conjunctive file-authority and readiness; not report authority automatically. Administrative amendment cannot conceal new substantive evidence/report effects, and no lock shortens required retention/holds.

Current recorded case status: partial-evidence. Mapped observations: approved report preparation connects exact issue to independently completed assembly and custody (tests/pilot-reporting.test.mjs); the extended engagement preserves its original 34-register journey and scoped recoverable archive (tests/pilot.test.mjs); technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-07-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P12-UC03 - Accept custody and verify readability/integrity

Source: SRC02 / Registers/Use_Cases.csv / P12-UC03. Owning action P12-ACT03; source primary capacity SUPPORT; screen S22. Criteria: P12-UC03-AC01, P12-UC03-AC02, P12-UC03-AC03, P12-UC03-AC04, P12-UC03-AC05.

The receiving custodian needs to know that the actual assembled package arrived and remains usable.

Source progression: Inspect the offered exact manifest, content, storage location/medium and transfer permissions. -> Verify actual receipt, integrity and readability; accept custody or record discrepancies and corrective ownership. -> Perform the approved later recovery/readability checks and preserve their actual result.

Usable outcome: Acknowledged custody and evidence of usable retained content.

Alternative/return path: Sending or assigning a package does not prove receipt. A checksum can match while a proprietary file is no longer readable.

Source input/check boundary: Exact offered manifest/content, from/to custodians, location/medium/purpose, actual transfer/receipt/readability/integrity and later recovery-check evidence. Exact manifest, actual recipient authority and continued confidentiality/retention restrictions; matching hash alone does not prove readable file.

Current recorded case status: partial-evidence. Mapped observations: approved report preparation connects exact issue to independently completed assembly and custody (tests/pilot-reporting.test.mjs); technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-07-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P12-UC04 - Retrieve and release a controlled inspection package

Source: SRC02 / Registers/Use_Cases.csv / P12-UC04. Owning action P12-ACT04; source primary capacity SUPPORT; screen S22. Criteria: P12-UC04-AC01, P12-UC04-AC02, P12-UC04-AC03, P12-UC04-AC04.

An authorized practitioner or inspector requests a defined archived file subset for a legitimate purpose.

Source progression: Record/verify the request authority, purpose, scope and relevant confidentiality restrictions. -> Select the permitted read-only content/export manifest and record actual access or delivery through the supported route. -> Retain loan/return/access or delivery results and resolve missing content or scope exceptions.

Usable outcome: A traceable retrieval/disclosure within the actual authorized scope.

Alternative/return path: An inspector portal is future unless selected and demonstrated. An expired prior engagement appointment does not automatically grant current archive access.

Source input/check boundary: Actual requester authority/purpose/permitted subset, exact archived manifest/content, disclosure constraints and actual access/delivery/return facts. Current authorization is distinct from historical engagement appointment. Permission applies to search/counts/preview/file/export and metadata. Only actual selected subset is disclosed.

Current recorded case status: partial-evidence. Mapped observations: approved report preparation connects exact issue to independently completed assembly and custody (tests/pilot-reporting.test.mjs); two engagements isolate revisions, work, reports, grants and archive access (tests/pilot.test.mjs); technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-07-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P12-UC05 - Apply retention/holds and authorize actual disposition

Source: SRC02 / Registers/Use_Cases.csv / P12-UC05. Owning action P12-ACT05; source primary capacity SUPPORT; screen S22. Criteria: P12-UC05-AC01, P12-UC05-AC02, P12-UC05-AC03, P12-UC05-AC04.

A file may have reached its configured retention date, but the custodian must check all applicable restrictions before any disposal.

Source progression: Identify the actual legal/firm policy versions, clock anchor, longer requirements and every relevant hold. -> Retain or release each hold under its authority and determine the exact eligible scope; unknown eligibility blocks disposal. -> Obtain the required approval and separately record performed secure disposition, method/date/evidence and any remaining copies or failure.

Usable outcome: A supported retain/blocked/authorized/performed disposition record.

Alternative/return path: The verified Mongolian workpaper minimum is ten years; its clock anchor and longer restrictions require the applicable basis. Releasing one hold does not release others; AUTO-058 alone does not implement the M12 hold feature.

Source input/check boundary: Exact policy versions/applicability/clock anchor, actual file/copy scope and all holds, eligibility evidence, real approval and performed disposal method/date/evidence/residual scope. Actual applicable minimum and longer rules, defined clock anchor AND every relevant hold AND scope authority AND actual performed evidence are separate conditions. Elapsed time or one released hold cannot authorize destruction.

Current recorded case status: partial-evidence. Mapped observations: the extended engagement preserves its original 34-register journey and scoped recoverable archive (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-07-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

## Automation handoff index

G11 contains complete minimum inputs/methods/human limits and independent specification examples; the current source verifier is a separate evidence class.

| ID | Minimum outcome |
| --- | --- |
| AUTO-058 | Lock the completed engagement file against ordinary editing, calculate its retention date and preserve every authorized post-lock amendment and re-lock event. |


## Pinned code and external reference locators

All following code locators refer to the local 079f9da snapshot. File hashes and the complete symbol/action index are in code_observation_index.csv/json. The remote main/PR do not contain all of these local additions.

- scripts/pilot-assembly.mjs: assemblyInventory at line 10; assemblyDeadline at line 52; assemblyStatus at line 59; checkAssemblyRecord at line 67; assemblySnapshot at line 83. SHA-256 5426deb2f76137dd4dbf3375b70fde3aa55820ce74f9625d3684ab29393ef103.
- scripts/pilot-archive.mjs: archiveAmendmentRevision at line 21; archiveAmendmentGap at line 36; expiry at line 46; activeHolds at line 54; createArchiveStore at line 60. SHA-256 e781613e0fba4e9fdc3c68c95ab0856b629056efa38d91b2adb7d542aaeecb4c.
- scripts/pilot-later-facts.mjs: laterFactGap at line 21; checkLaterFactArchive at line 29; laterFactView at line 41; laterFactAction at line 48. SHA-256 829001fed6976cb1a3252d6f7c069c185e6a312d089d9f2556f8a216e036942d.
- scripts/pilot-oversight.mjs: qualityRef at line 14; qualityGaps at line 24; oversightTeamView at line 30; oversightTeamAction at line 34; createOversightStore at line 67. SHA-256 ccf051844caf0c683215b22a45d7f4f47fc15d55655b6ca1267f9079496d427e.

External reference pointers support the specific edition/applicability discussion, not whole-standard compliance. Fresh inspection limits, publication/effective dates and the retained original paragraph register are in external_research.csv and standards_source_edition.csv.

- [EXT03 - IAASB, Handbook Volume 1](https://ifacweb.blob.core.windows.net/publicfiles/2025-09/IAASB-2025-Handbook-Volume-1.pdf): 2025; ISA 230 paras 14-16; PDF pp168-169 (1-based). Selected assembly/retained-change text inspected. Accessed 16 November 2026.
- [EXT08 - Legalinfo Mongolia, Audit Law](https://legalinfo.mn/mn/detail?lawId=11192): Current consolidated body not obtained; Source pointers arts 8.1-8.3 and 12.5. Direct official pages 403; indexed snippets obtained for tenure. No fresh full-text verification of retention. Accessed 16 November 2026.
- [EXT12 - SQLite, Online Backup API](https://www.sqlite.org/backup.html): Official web documentation accessed 2026-11-16; Sections 1 and 3; snapshot and active backup behavior. Documentation read, no live database touched. Accessed 16 November 2026.
