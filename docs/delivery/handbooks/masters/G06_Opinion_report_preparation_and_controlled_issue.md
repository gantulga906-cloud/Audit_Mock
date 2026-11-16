# Opinion, report preparation and controlled issue

Guide G06 | Version 1.0 | 16 November 2026

Code baseline: local 079f9da47a02eab681feeeda3de3dfb8cfc42848, redesign/enterprise-workspace. Source edition: October 26 original archive and registered November 11 repaired-workbook inventory, with November 16 current-file observations separately recorded. Local newer additions are not merged into GitHub main. Independent source acceptance remains open.


## Purpose and supported reference

Turn the auditor's reasoned opinion and current completion basis into the exact approved report, authorized issue, signature and controlled recipient outcomes. An authorization flag is not an opinion decision or successful delivery. G05 supplies evaluation/consultation/quality; G07 consumes issued bytes and actual distribution state for assembly/custody.

The local A26 fixture demonstrates approved qualified-report preparation, exact authorization/signature/issue and receipt handling. M10-F10 report preparation was added locally with independent approval. This supports a scope-limitation reference profile; all applicable opinions/sections/templates and jurisdiction-specific wording remain open. Remote main/PR are older; do not describe the local addition as merged/deployed.

## Records and exact report basis

| Decision/event | Pinned basis |
| --- | --- |
| Opinion and sections | Actual misstatement/evidence limitation and pervasiveness assessment, supported type, selected source/approved template and required sections. Auditor owns judgment. |
| Report preparation M10-F10 | Final FS/notes version, report date/addressee, signatory/authority, template edition, accepted authority evidence and applicable reporting-duty decisions. |
| Independent preparation approval | Exact current record/version and support. Changed preparation invalidates relying authorization. |
| Authorization | Exact report workpaper/current required work, FS/notes, quality and other completion basis, artifact HTML and SHA-256. |
| Signature and issue | Local Ed25519 signature over authorized bytes, authorized issuer and actual defined issue event/reference. |
| Recipient attempt | Exact issued artifact, reviewed contact, created/expiry, state/event history, download and separately confirmed receipt/hash. |

Report 4.1.A1-A4 selection follows actual approved opinion, not desired appearance. The source adverse-template wording conflict C09/C13 is retained: copied text and illustrations cannot determine the conclusion. A current template/edition must be approved for the engagement's framework/jurisdiction. Do not invent universal reporting language or regulatory filing requirements.

## Transitions and permissions

<!-- diagram: Reasoned opinion | Exact draft + preparation | Independent required review | Authorize + local sign | Issue exact bytes | Recipient outcomes + receipt -->

The report preparer records the actual basis, independent approver reviews the current preparation, quality review occurs where required, and the authorized partner issues the exact permitted artifact. Changing report date requires renewed current subsequent-event coverage and affected review. Changing FS/notes, opinion/template, report preparation or open quality concerns stales the exact authorization. A signature over old bytes cannot authorize new bytes.

Current strict release is enabled for records using the newer management/quality/signature/report-preparation profile. Earlier pilot records retain their legacy path; documentation must not claim all historical rows acquired every new prerequisite. Migration needs an explicit compatibility decision and tests, not flags silently backfilled as approved.

## Delivery, retry and uncertain outcomes

Current local delivery state history distinguishes pending, unknown, failed, withdrawn and received; time expiry is also exposed. Download is not receipt. Receipt requires the exact artifact hash and a recorded response after download. A pending current link, unknown attempt or existing receipt prevents creating a duplicate attempt for that recipient/issue. Reconcile an unknown outcome before retry. A justified withdrawal is retained; it does not establish successful delivery.

The newer report-preparation profile requires attempted recipient groups to reach receipt or justified withdrawal before lock. This is a bounded current policy contract, not a universal legal rule. Local token links and local Ed25519 prove local byte/signature mechanics. Production identity-backed signatures, recipient verification, real dispatch and legal effect need approved external adapters under R22.

Synthetic expected example: recipient A received exact hash H, recipient B has unknown outcome. Issue remains a single recorded event; B requires reconciliation and cannot be treated as received or silently resent. Identical issue retry retains one logical issue; a changed payload with reused command key fails. Changing report preparation after authorization makes current=false while prior authorized/issued artifacts remain history.

## Actual interfaces and evidence

scripts/pilot-report.mjs owns rendering and hashes; pilot-workflow.mjs owns report readiness/currentApproval/authorization/issue; pilot-registers.mjs owns controlled report preparation; pilot-release.mjs owns local signatures and recipient attempts. Relevant UI lives in pilot-registers.tsx, pilot-completion.tsx and partner release controls in pilot-workspace.tsx. Existing commands include delivery-start and report/sign/issue actions as indexed in code_observation_index.csv; do not create a parallel release store. Typed expectations and precise validation are in the pinned owners.

tests/pilot-reporting.test.mjs records the local A26/A27 persisted reference, wrong template, unauthorized approver, stale preparation, signature requirement, idempotent issue and ambiguous delivery checks. The recorded six-cycle report does not close every opinion or external adapter. Source exact IDs and observed steps remain individually visible.

## Failure and preserved history

Wrong template/opinion/period, missing current statements/disclosures, old report-date coverage, unresolved quality/consultation, unaccepted authority support and unauthorized/self approval block the named action. Hash mismatch/corrupted stored report must fail before issue/download. Never regenerate the already authorized artifact from a changed template and assume it is the same document. Preserve prior authorizations, signatures, attempts and issued bytes. Substantive changes after issue use G07 successor rules.

## E2E matrix and remaining work

| Scenario | Expected outcome |
| --- | --- |
| E2E-06-NORMAL | Supported opinion -> exact approved preparation/draft/FS/quality -> authorization -> signature -> issue -> exact recipient download/receipt; pin hashes across events. |
| E2E-06-NEGATIVE | Wrong/stale template, missing FS/authority, self/unauthorized approval, unresolved quality, unsigned issue and hash mismatch are denied. |
| E2E-06-CHANGE | Change date/FS/preparation/required work; renew affected review and authorization; earlier bytes/signatures remain intact. |
| E2E-06-RETRY | Identical command one issue; changed-payload key conflict; failed/unknown/withdrawn recipient outcomes retained; uncertain dispatch reconciled before retry. |

R20.1-5 and R18/R19: complete all applicable opinion/sections and reporting-duty paths, extend A26 beyond its demonstrated profile, finish dispatch failure handling and stale-package tests, and accept AUTO-057's declared boundary. R22.2 owns mandated real signing/delivery. R23.4/5 owns connected proof and independent source decisions. Preserve working A26 and G07 assembly/custody integration. Do not demand another UI redesign before these capabilities can be added.

<a id="source-map"></a>

## Source-map and glossary

P10-UC06/07/08; A26-P1-W1 through A26-P3-W3; M10-F09/F10/F14; AUTO-056/057; source report templates and action contracts. Full criteria/forms are in traceability and G08. Санал дүгнэлт: audit opinion. Зөвшөөрөл: authorization/approval according to record. Гаргалт: issue. Хүргэлт: distribution/delivery. Хүлээн авалт: receipt, a separate actual outcome. Signed: exact-byte local proof within the stated mechanism, not automatically legal identity verification.

## Source case handoffs

These cards preserve the actual user goal and alternatives. The original detailed physical proposals, checks, fields, states and retry contracts are in action_contracts_source.csv/json. They are source design, not a claim that all AUD_* tables or endpoints exist. Requirement traceability retains each criterion and its own recorded evidence.

### P10-UC06 - Decide evidence sufficiency, opinion and report sections

Source: SRC02 / Registers/Use_Cases.csv / P10-UC06. Owning action P10-ACT06; source primary capacity R3; screen S18. Criteria: P10-UC06-AC01, P10-UC06-AC02, P10-UC06-AC03, P10-UC06-AC04.

The partner considers final findings, evidence limitations and statements before deciding the opinion and any additional sections.

Source progression: Review significant judgments, uncorrected effects, contradictory evidence, scope limitations and consultations. -> Decide evidence sufficiency separately from known misstatement; document materiality/pervasiveness and the supported opinion. -> Decide applicable KAM/going-concern/emphasis/other-matter or other sections and approve the exact basis/wording for the draft.

Usable outcome: A human opinion and section decision linked to its supporting conclusions.

Alternative/return path: An uncertainty or unresolved evidence gap is not equivalent to no known misstatement. A finding is not automatically a KAM, and emphasis is not a substitute for an opinion modification.

Source input/check boundary: Exact reviewed completion population, limitations/uncorrected effects/contrary evidence/consultations, applicable reporting requirements and human sufficiency/materiality/pervasiveness decisions. Actual partner/reporting authority, current support and resolved required differences must all hold. Separate known misstatement from inability to obtain evidence; neither score nor template chooses opinion.

Current recorded case status: partial-evidence. Mapped observations: the extended engagement preserves its original 34-register journey and scoped recoverable archive (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-06-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P10-UC07 - Prepare and review the exact report and communications

Source: SRC02 / Registers/Use_Cases.csv / P10-UC07. Owning action P10-ACT07; source primary capacity R1; screen S18. Criteria: P10-UC07-AC01, P10-UC07-AC02, P10-UC07-AC03, P10-UC07-AC04, P10-UC07-AC05.

The report preparer uses the approved decision and template, and prepares required governance/control-deficiency communications.

Source progression: Populate the selected report template with actual approved conclusions and exact statement references. -> Review generated wording and sections, resolve structured inconsistencies and submit the draft for assigned technical/partner review. -> Prepare communications for appropriate recipients/capacities and retain actual written delivery or oral content/date where used.

Usable outcome: A controlled draft report and attributable communications.

Alternative/return path: Management’s failure to respond is not agreement and does not automatically delay every required communication. Client control recommendations do not establish that remediation occurred.

Source input/check boundary: Exact selected report template and approved opinion/section/FS references, actual reviewed wording and recipient-specific communications/content/date. Generated text must match approved sections and exact FS references; assess actual applicability, recipient/confidentiality and version. A communication does not clear the underlying issue automatically.

Current recorded case status: partial-evidence. Mapped observations: technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-06-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P10-UC08 - Authorize the report package and record actual issue

Source: SRC02 / Registers/Use_Cases.csv / P10-UC08. Owning action P10-ACT08; source primary capacity R3; screen S18. Criteria: P10-UC08-AC01, P10-UC08-AC02, P10-UC08-AC03, P10-UC08-AC04.

The final report and complete statements are ready. The authorized issuer must confirm current prerequisites before dating/signing/issuing the exact package.

Source progression: Inspect the exact report/statement pair, management authorization, subsequent-event coverage, representations, required reviews and EQR where applicable. -> Record the authorized date/content and actual signing evidence through the supported route. -> Record actual issue and permitted recipient distribution attempts, keeping receipt/failure facts separate.

Usable outcome: An identifiable authorized/issued package with recipient-specific history.

Alternative/return path: A failed delivery can be retried for the same approved content after reconciling any ambiguous prior effect. A changed report or statement package needs a new approval/impact decision.

Source input/check boundary: Exact report/hash plus full authorized statements/version/hash, current professional reviews/representations/subsequent-event coverage, formal EQR requirement/result, actual signer/authorizer and permitted recipients. Conjunctive report-authority plus exact ready package, actual date basis, applicable independent/EQR completion and resolved required concerns; R3 seniority or R4 confirmation alone cannot release. Check allowed recipients at dispatch.

Current recorded case status: partial-evidence. Mapped observations: approved report preparation connects exact issue to independently completed assembly and custody (tests/pilot-reporting.test.mjs); technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-06-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

## Automation handoff index

G11 contains complete minimum inputs/methods/human limits and independent specification examples; the current source verifier is a separate evidence class.

| ID | Minimum outcome |
| --- | --- |
| AUTO-056 | Bind the proposed auditor's report to exact approved financial-statement and audit-conclusion versions and expose structured contradictions for partner resolution. |
| AUTO-057 | Issue only the exact auditor's-report version approved by an authorized partner and preserve an immutable record of what was issued, when and to whom. |


## Pinned code and external reference locators

All following code locators refer to the local 079f9da snapshot. File hashes and the complete symbol/action index are in code_observation_index.csv/json. The remote main/PR do not contain all of these local additions.

- scripts/pilot-report.mjs: renderReport at line 10. SHA-256 adc52619dc35c9e763985cefbd67c3a0761ed19fcd8967dc2482a092cb8fc5a7.
- scripts/pilot-release.mjs: distributionGaps at line 11; signatureMatches at line 16; currentSignature at line 22; signReport at line 27; createReleaseStore at line 41. SHA-256 096f28eaf61bf55007240e5678436afb71f3bb81fb90cb32346be57dfb4703b3.
- scripts/pilot-workflow.mjs: planningChanged at line 47; syncPlanningPapers at line 56; syncFieldwork at line 67; validMateriality at line 92; reportWorkspace at line 96. SHA-256 4a97ca99e80e34f23929733e1feba4e60c106ceca72277be643f8430786f8d23.

External reference pointers support the specific edition/applicability discussion, not whole-standard compliance. Fresh inspection limits, publication/effective dates and the retained original paragraph register are in external_research.csv and standards_source_edition.csv.

- [EXT04 - IAASB, Current Handbook publication](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance): 2026; Publication metadata and future-effective standards list. Publication metadata checked; 2026 full clause comparison not performed. Accessed 16 November 2026.
- [EXT05 - IAASB, Embedding Professional Skepticism](https://www.iaasb.org/focus-areas/embedding-professional-skepticism): Web status 2026-11-16; ISA 240 and ISA 570 status sections. Official status summary, not full revised clause inspection. Accessed 16 November 2026.
