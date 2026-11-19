# D01 resolved research and implementation choices

**As of:** 19 November 2026. **State:** D01 research/specification ready for implementation under the bounded manual-review design below. Application implementation and runtime acceptance are separate, unfinished work. No external professional approval is claimed.

This document resolves the earlier ten-question backlog. It uses the user's standing decisions: research genuine prohibitions; leave professional judgments to auditors; accept simple spreadsheet capture; use manual credentials/evidence without live external APIs. The method is decision modelling with requirements traceability.

## 1. Standards basis: a specific profile, not the newest PDF

The primary [2023 MonICPA resolution 23/14](https://legalinfo.mn/mn/detail?lawId=16960119148811) approves a revised code and revokes the 2016 code. Its [registered annex](https://legalinfo.mn/mn/detail?lawId=16960119178441&showType=1), articles 3.1 and 4.1-4.2, identifies the 2018 international code and the standards committee's 2021 resolution 11; article 27.1 addresses audit/review independence. The institute's matching published PDF was read for relevant D01 sections 2-7, 16-19 and 27.

**Resolved ethical profile:** local 2023 code plus its identified 2018 international reference, subject to actual scope and any documented firm additions. Retain 2026 international material as a comparison/update candidate. The English-precedence clause concerns that ethical translation, not Mongolian statutory law.

**Resolved audit profile:** use the Mongolian ISA 2020 compilation with its integrated ISQM 1, ISQM 2, ISA 220 (Revised) and related conforming amendments. In its [15 June 2023 publication notice](https://www.monicpa.mn/c/576093?content=3856683), MonICPA confirms early-2023 committee approval of the translation and explains that the compilation includes those updates while removing superseded material. The [IFAC jurisdiction profile](https://www.ifac.org/about-ifac/membership/profile/mongolia), updated February 2026 and retrieved 19 November 2026, corroborates ISA 2020 as the local baseline. Record included component versions explicitly. This closes the standards-basis issue.

Use the direct MonICPA confirmation and IFAC assessment as the documented project basis; obtaining separate ministerial instruments is not a prerequisite or open D01 research task. The firm's methodology owner records any additional applicable requirements once; engagements reference the profile. A later profile change creates a new version and does not rewrite historical engagements. Newer international publications are comparison material unless an additional requirement is explicitly identified.

The [baseline decision record](Baseline_Decision.json) records the authority and closure. The plan does not repeat the unverified generalized claim about international-firm practice. ISA 315 (Revised 2019) was issued in 2019, so it is not an example of a standard issued after 2020.

Store: profile ID/version; jurisdiction; source title/edition; paragraph identifiers; source evidence/reference; effective scope/dates if established; evidence status; firm additions; responsible methodology person; confirmation date. The auditor confirms the applicable profile before positive acceptance.

## 2. Firm tenure and calendar methods

**V1 decision:** retain structured history and a manual, reasoned statutory conclusion. Do not promise an automatic legal tenure calculator.

Inputs: client/category evidence, service type, financial-period dates, actual service dates, prior firm identity, interruption/replacement date and basis, category changes and source version. Keep firm tenure separate from partner/person history.

The checklist covers article 8.1, the specific 8.3 exception and the 8.2 return condition. Ordinary fifth/sixth consecutive annual cases are explicit. Partial periods, changed category, interruption and exact cooling-boundary cases require a dated auditor conclusion; the application validates completeness and preserves the evidence rather than inventing a counting convention. A confirmed applicable prohibition holds the affected positive action. No approval can waive it.

This is a completed manual method specification. Automatic calendar interpretation is excluded from v1, not an unanswered implementation question. See [Tenure_Method_Cases.csv](Tenure_Method_Cases.csv).

## 3. Local independence restrictions

The referenced [Company Law article 99](https://legalinfo.mn/mn/detail?lawId=310) and [conflict-of-interest definitions 3.1.8-3.1.9](https://legalinfo.mn/mn/detail?lawId=397) were read from the primary pages. The former contains several kinds of control, group, family, ownership and employment relationships; it is not just common ownership. The latter definitions cover non-cash as well as cash benefits.

**V1 decision:** a bounded manual checklist with specific source articles and actual facts. Capture party, relationship/service, relevant dates/year, evidence and result: clear / prohibited / professional_review / unresolved. A generic Yes/No never determines legal status.

For article 7.2.4, retain fee due dates, balances/disputes and the auditor's statutory conclusion. For 7.2.6, retain the actual investment, subject, share-capital basis and contract-relative dates. For 9.5, retain service provider, recipient, actual work and audited financial year. Do not invent a statutory definition or threshold treatment where interpretation is needed. Escalation is case-specific; no mandatory legal-consultant approval for every ordinary engagement.

The software enforces a recorded applicable prohibition; it does not claim to independently discover all legal prohibitions.

## 4. Manual eligibility evidence

**V1 decision:** manual registration and document review, with the existing responsible auditor/partner approving the evidence.

Record firm/legal name and permit identifier; issuer; scope; issue/expiry dates shown on source; status/source check date; evidence file/reference; reviewer/person/date; conclusion and exceptions. Capture a firm attestation for relevant Audit Law 19 eligibility, including client-category requirements. This is not a new staff scheduling or credential-validation engine.

Check at initial firm setup, applicable renewal/change and each engagement acceptance by confirming that the referenced evidence remains current. Known expiry, suspension/revocation or changed facts requires renewed evidence. File uploaded, manually reviewed and legally eligible are separate states; do not label upload alone as registry verification. No API dependency.

## 5. Agreement verification

**V1 decision:** retain the existing exact-version agreement workflow and add this checklist:
- Correct parties, reporting period, service/scope, responsibilities, timing, fee, delivery and termination terms.
- Authorized signer identity and dated authority evidence for both parties.
- Paper: evidence of applicable signatures and stamps/seals under article 13.1.
- Electronic: retained electronic-signature evidence and a manual verification conclusion about the actual agreement.
- Agreement effective date and exact version/hash; reviewer and conclusion.
- Any exception or uncertainty records the issue and resolution.

An email acknowledgment or typed name is not automatically equivalent to the statutory signing requirement. No signing-provider API is required. The auditor can attach actual evidence and document manual verification; the application must describe the method accurately.

## 6. Special appointments, withdrawal and assurance changes

**V1 decision:** manual consultation/disposition record with controlled progression.

For a claimed compulsory appointment, record the exact instrument compelling this auditor and the specific ISA 210 exception analysis. A client's obligation to obtain an audit is insufficient. No generic override of independence rules.

Withdrawal_review records: trigger and date; prior decision/work affected; responsible partner; advice/evidence; whether withdrawal is legally available; required communications and responsible person; decided disposition/date; evidence of communications or justified not-required conclusion. No automatic notices or destruction of records.

A lower-assurance request records circumstances and the auditor's conclusion on reasonable justification, relevant statutory constraints and revised agreement. Unjustified requests cannot authorize a change. These are existing engagement decisions to support, not a new legal-services offering.

## 7. Source baseline and question meanings

**Selected working baseline for D01:** inspected repaired Stage 1 SHA-256 `5fde7db15e766cdb616cb816d25a8fe6a6d5718f9975d4c0f885c344b079602c`, with deployed original field IDs retained and explicit mappings in [Question_Answer_Contract.csv](Question_Answer_Contract.csv).

[Workbook comparison](Workbook_Comparison.json) covers eight relevant sheets. The same resolved cells/formulas and validation definitions appear in two independently retained local derivatives. Comparison with the deployed register finds 141 of 147 field labels matching after whitespace normalization; six are instruction/table-label mappings, documented individually. The 135-field answer contract excludes the staffing appointment form, which was inspected as context only.

**User-confirmed source decision:** the user confirms that the older workbook versions have no differences and instructs using the available copy. Use the inspected workbook above as the D01 reference. This closes the historical-version question; no recovery or further equivalence investigation is required. Preserve earlier comparison observations and hashes as history, without representing user confirmation as a newly performed bytewise test.

**Answer decisions:** retain original wording/response; store normalized meaning separately. Group sibling checkbox options into one categorical answer without losing aliases. A completed check, an absence assertion, an adverse fact and a conclusion have different meanings. No default scoring.

The CSV's original_label_json column is a JSON string so original line breaks and whitespace survive exactly; decode it before display. The validator compares the decoded text and original field/cell keys against the deployed source register.

The five-year employment assertion remains a source fact/qualified declaration. The default product does not turn it into a universal prohibition. A firm may add a stricter documented policy, distinctly identified. The truncated employment-row instruction becomes a proper dated employment disclosure label; preserve its original key.

## 8. Coverage, legacy records and material changes

**V1 decision:** all newly created and subsequent-period supported financial-statement audit engagements use D01. A legacy engagement with no profile is explicitly legacy_unassessed; absence is never displayed as independence clearance.

Preserve existing records. On the next positive activation/continuance or material scope change, require a current D01 assessment. Issued/sealed files remain historical; later facts use linked records. Do not retroactively fabricate acceptance.

Material changes: entity/ownership/control, framework/category, period/service, participating person/relationship, relevant non-audit services/fees, permit status, terms, evidence withdrawal and applicable rule/profile. These require an impact review and renewal of affected clearance.

Cosmetic changes: formatting or an unrelated contact detail with no authority/identity impact. Preserve history; do not add a new rule requiring full substantive reassessment. Existing conservative invalidation remains until T10 demonstrates safe dependency separation. Contact/signatory authority changes are material to terms.

## 9. Import choices

**V1 decision:** CLIENTS with four required text fields; optional CONTACTS; selected batch metadata; reviewed preview; all-or-nothing transaction; exact replay returns prior receipt; concurrency conflict requires re-preview. Retain current global registration uniqueness.

Use the documented proposed limits: 10 MiB file, 10,000 populated rows, 100 columns, 100 MiB decompressed workbook. Make them configurable operational limits; they are not standards or a reason to wait for a business decision before implementing the bounded importer.

Use existing reviewer/partner authority, with reviewer distinct from uploader. No additional access-design project. No automatic legal classification, credential checking, acceptance import or master-history overwrite. See [import specification](Client_Import_Specification.md).

## 10. What completion means

The ten earlier items are now either research findings, explicit design decisions, or defined engagement checks. They are not ten questions awaiting the user.

Remaining product work is the identified implementation backlog and actual scenario execution. Before release, the responsible auditor verifies the configured methodology package and representative behavior. This pack does not invent that sign-off.

**Both former baseline issues are closed:** current workbook authorized by the user; Mongolian ISA 2020 compilation, including ISQM 1/2, revised ISA 220 and related amendments, confirmed by MonICPA and corroborated by IFAC. Earlier source-retrieval observations remain historical notes, not open problems, approval demands or implementation blockers. Actual engagement facts, auditor judgments and release verification remain normal implementation/use requirements.
