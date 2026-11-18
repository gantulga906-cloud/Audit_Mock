# G01: client acceptance, independence and terms

16 November 2026. Continues the implementation handbook G01 from published baseline `13cec39fa36912905379621a1317570bef38feb3`. This batch implements the acceptance decisions and connected alternatives, keeping the existing shared pilot and the G00 contracts.

## Delivered behavior

Standard enquiry conversion now creates a G01-controlled pending engagement. Incomplete enquiries still save with unknown period/framework, actual origin/contact, a findable reference and follow-up owner. Intended users can be recorded when known and confirmed later. A new period uses confirmed client facts; it does not copy evidence, acceptance or workpaper sign-offs. Specific context items can be returned with an owner/date, answered by that owner and independently confirmed. Prior item and confirmation history remains.

The assessment separates integrity, actual resources, firm tenure/return restrictions, partner tenure, concurrent services, predecessor matters and audit preconditions. Each records an explicit supported, unknown or adverse result, basis and evidence. Unknown/adverse work requires follow-up owner, date and action before submission. Requirements, jurisdiction/applicability explanation, edition and rule evidence remain explicit. Firm and partner checks are different records within the assessment. Source questionnaire answers retain their actual meaning: an affirmative disclosure in 1.4.1 r12 is retained as a disclosure, never scored as automatic acceptance.

Submission, independent recommendation and authorized acceptance are separate events. Positive acceptance needs a current reviewed assessment, current declarations/concern dispositions, exact agreed terms, a named actor mapped to the partner account, authority evidence, rationale and validity date. Its record includes explicit setup authorization and immutable relied-upon snapshots. Activation is a further action. Defer and decline remain possible with failed positive prerequisites. A conditional decision records its condition, permitted effect, owner and due date and keeps substantive activation on hold until a fresh supported positive decision.

Declarations identify the actual approved roster person, exact content, covered scope, signed date and native/manual method. Native statements belong to that account's own person and use the actual current date. A coordinator can register a real signed copy with an independently accepted scoped original and digest; this does not impersonate the declarant. A declarant cannot independently approve their own statement. External specialists need no portal account. A changed statement creates a new revision, preserving its earlier content and approvals. Applicable prohibitions cannot become acceptable merely by adding a safeguard. Disclosures require their own current, independently approved requirement/edition, response and evidence.

Terms now have a structured proposal: selected template, actual scope/framework, firm/client responsibilities, access, deliverable, timetable, fees, recurring-treatment decision and change justification. Firm review, recording an actual manual sending outcome, receiving the authorized written agreement and approving the exact agreed edition are separate. A signed agreement binds the current client/period, proposal revision, effective authorized signatory, authority evidence, original hash and manual verification. Reuse/reminder is a current-period assessment, not automatic renewal. The file records no regulated electronic-signature verification.

Changed relied-upon facts, source questionnaire content, declarations, relevant acceptance records, assessment evidence, substantive proposed scope or agreed terms reopen current acceptance. Substantive commands and report access remain held until the affected assessment, terms and decision are renewed. Earlier decisions, original bytes, agreed terms, source answers and unaffected periods remain. G01 evidence and history join the downstream authorization package. Successful conversion and terms-approval retries remain one logical effect across restart; wrong/revoked scope stays denied.

## Where to use it

1. In the portfolio, open **Үйлчлүүлэгч ба аудитын хүсэлт**. Save the enquiry with actual known facts; use return/decline where appropriate. Confirm the client/contact and period before conversion.
2. Maintain named people, credentials and appointments in the existing firm/staffing workspace. Standard engagements retain their existing independently approved staffing gates.
3. In the pending engagement's **Тойм**, complete the acceptance registers and declarations. Upload actual supporting files in **Нотлох баримт** and obtain a separate acceptance of the originals.
4. Use **Хүлээн авах үнэлгээ ба шийдвэр** for preparation and independent recommendation. Drafting and a recommendation do not activate the audit.
5. Prepare and independently review the terms proposal. Record actual sending separately, then use **1.4.3** to bind and approve the real written agreement and authorized client party.
6. The partner records the actual professional outcome and authority. Only a supported, current positive decision releases the separate activation control. Current-period context changes and material amendments use the same renewed review path.

Pending converted engagements created before this profile can opt in through the partner's explicit upgrade control. It preserves earlier histories and requires a fresh current assessment/decision. Existing direct-created and explicitly synthetic basic profiles retain their previous contracts; they are not silently certified as G01. There is no live-preview migration or reset.

## Source and contract coverage

| Source case | Implemented reference |
| --- | --- |
| P01-UC01 | Both enquiry origins, unknown facts, draft reference/storage boundary and next owner |
| P01-UC02 | Dated sourced contacts/ownership, retained earlier context; data entry does not grant access or clear independence |
| P01-UC03 | New-period facts, exact confirmation, specific returned item and independent response review |
| P02-UC01 | Actual source question polarity, separate explicit assessment results and assigned outstanding work |
| P02-UC02 | Own-person native declarations or actual signed originals; scope/date/content/person preserved |
| P02-UC03 | Requirement/edition, uncertainty, prohibition and evidenced threat response; retained return history |
| P02-UC04 | Independent current recommendation, named authorized decision, negative/conditional outcomes, setup gate and preserved history |
| P02-UC05 | Proposal/review/sending/agreement separation, actual responsibilities/party, exact terms and material amendment |

Owning additions: `scripts/pilot-acceptance.mjs`, `src/lib/pilot-acceptance.ts`, `src/components/pilot-acceptance.tsx`. Existing intake, registers, workflow and overview own the integration. The source-linked tests and explicit expected/actual diagnostics cover connected A01, A02 and A03 reference profiles. The legal/tenure steps record human assessments of supplied dated test policy evidence; they do not claim an automated current-law determination.

## Verification and preservation

`tests/pilot-acceptance.test.mjs` executes three persisted scenarios: initial acceptance and changed independence through restart/retry; unknown/adverse/prohibited/conditional/refused outcomes and actual source question polarity; and continuance/current-client/signed-amendment changes with an untouched prior period. It uses the normal standard-conversion staffing and declaration gates, named fictional roster records, actual original bytes and independent accounts.

Run `npm run verify:foundations -- --build` from a clean isolated checkout to execute the complete source-linked suite, G00 shared-contract checks, frozen source populations/hashes and current production build. `AUDIT_G01_EVIDENCE_DIR` optionally retains the small non-secret connected proof. `AUDIT_G01_FIXTURE_DIR` optionally exports a disposable browser seed; the seed database and credentials stay outside published deliverables. Run `npm run verify:acceptance-ui -- <g01-fixture.json> <output>` against the isolated build for actual intake, decision/activation and changed-scope preparation/review controls.

The original source/manifest/BPMN files, all 2,247 registered obligations, 25 original packages and 128 tasks retain their identities and scope. The 70 forms, 22 variants, 58 minimum automations, 58 pending extensions and 20 dependencies are not reduced. Existing materiality, data, sampling, area work, reporting, quality and custody remain regression coverage. Source acceptance remains a separate attributable decision; this batch does not edit `pilot-release-acceptance.json` or claim production release.

## External research and continuing decisions

[ISA 210, 2025 IAASB Handbook, paragraphs 6–10 and 13–17](https://ifacweb.blob.core.windows.net/publicfiles/2025-09/IAASB-2025-Handbook-Volume-1.pdf) supports distinct audit preconditions, responsibilities, written agreement, recurring reassessment and justified changes. The implementation records those judgments and evidence rather than choosing them for the auditor. [IESBA's Code overview](https://www.ethicsboard.org/iesba-code) supports identifying/evaluating threats and appropriate responses. Specific applicable prohibitions remain explicit and cannot be waived by generic safeguards.

The official [Mongolian Audit Law page](https://legalinfo.mn/mn/detail?lawId=11192) again returned HTTP 403 during this task. No fresh consolidated-law verification or local-edition approval is claimed. D21/D22, approved dated firm/partner histories, jurisdiction/entity applicability, statutory-appointment responses and automatic policy engines retain accountable professional/methodology ownership. The software records manual checks and can hold/defer/refuse; it does not invent a universal tenure rule or execute legal withdrawal.

Global named-user authentication/lifecycle, external master-data publication/reconciliation, regulated signing/delivery adapters, optional specialist sharing and independent professional/source acceptance remain in their owning R09/R10/R22/R23 packages. All native source-form fidelity and methodology release obligations remain G08. The conditional sharing criterion P02-UC02-AC04 and interface-specific P01-UC01-AC04 are not granted blanket source acceptance by backend scenarios; browser observations and adapter limits remain separately recorded. G02 owns the next staffing/planning/risk/materiality domain batch; it is not started as part of G01.

## Published checkpoint

Application commit `cdb0f11b66be53f372d8a100b5548c0a27539956` has the exact Git tree of verified local `26df94b5a1af961b10490009cb7f2ab41ac038d3`. All 74 tests, clean production build, eight shared-foundation checks and five browser checks passed. The verifier records nine connected reference cycles, 88 source steps and 96 criteria. [Checkpoint, original-byte evidence and remaining boundaries](../checkpoints/G01/README.md) are published alongside the code. Independent acceptance remains separate.
