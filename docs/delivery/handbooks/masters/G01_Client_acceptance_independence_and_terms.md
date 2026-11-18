# Client acceptance, independence and terms

Guide G01 | Version 1.0 | 16 November 2026

Code baseline: local 079f9da47a02eab681feeeda3de3dfb8cfc42848, redesign/enterprise-workspace. Source edition: October 26 original archive and registered November 11 repaired-workbook inventory, with November 16 current-file observations separately recorded. Local newer additions are not merged into GitHub main. Independent source acceptance remains open.


## Purpose and outcome

Start with an enquiry containing known client/contact/service facts, reach a supported acceptance/continuance decision and agree exact terms before activation. Unknown information may remain outstanding during intake. The system must not fabricate a reporting period/framework to save a draft, treat a declaration as clearance or convert a commercial proposal into an accepted audit.

The shared pilot already has a client directory, dated contacts, separate two-way enquiry inbox, return/decline history, pending conversion, confirmed subsequent-period references, signed-letter approval and amendment holds. These are real working slices. A01/A02/A03 still need complete connected source alternatives and independent acceptance. Read G00 scope/ownership/identity contracts before extending them.

## Records and handoffs

| Owner | Record and boundary |
| --- | --- |
| Client/source owner | Legal name, registration, legal form, contacts and effective/source facts; dated history. Audit references confirmed facts rather than owning canonical consolidation. |
| Intake owner | Enquiry origin, known/missing facts, proposed service/period, next person, forwarded/returned/declined/converted history. Pending conversion is not active engagement. |
| Acceptance owner | Assessment evidence, actual declarations/concerns, proposed treatment, review and authorized acceptance outcome. |
| Terms owner | Exact letter revision, client agreement/signatory evidence, reporting period, confirmed client version and independent partner approval. |
| Engagement owner | Activation link and separate period identity. Prior-period evidence and sign-offs remain in their original scope. |

M03-F07 stays excluded. Group audit/supplied intercompany review remains separately scoped in G04/G05. A duplicate client name is not a merge instruction. Cross-system correction/publication must retain source key, effective/as-of facts and relied-upon snapshot.

## States, permissions and action gates

<!-- diagram: Incomplete enquiry | Forward acceptance | Return / decline / recommend | Exact agreed terms | Authorized acceptance | Active engagement -->

Save incomplete enquiries when useful. The reviewer can request more facts or return a specific issue; decline preserves its rationale/history. Conversion creates a pending engagement, after the necessary factual fields become available. Activation checks actual acceptance/independence and exact signed terms, not completion of earlier numbered forms.

The partner's current approval binds signed-letter version/evidence hash and confirmed client facts. A changed confirmation invalidates it. The signed amendment path holds substantive work/authorization until independent reassessment of scope and exact reapproval. Keep the old terms and approval; do not amend an issued/archived artifact in place.

Actual declarants supply their own declarations. Audit staff record and evaluate them; preset accounts do not make them actual named declarants. Threats, safeguards, prohibitions and unresolved facts need distinct treatments. A general 'cleared' checkbox cannot waive a prohibition. Firm tenure and partner tenure need different rule histories, entity classification and jurisdiction/edition choices; do not infer either from one current engagement.

## Current interfaces and evidence

The firm-level intake workspace owns intake commands; they are rejected in an inappropriate engagement scope. scripts/pilot-intake.mjs handles intakeAction and signed terms; scripts/pilot-server.mjs dispatches intake-refresh/activate and checks scope; pilot-workflow.mjs applies activeTermsGap. Current UI owners are pilot-intake.tsx, pilot-registers.tsx and enterprise workspace navigation. Exact command literals/symbol lines are in code_observation_index.csv; the shared command envelope is defined only in G00.

Recorded tests/pilot.test.mjs scenario 'provisional intake, subsequent-period confirmation and signed terms survive independent review' checks both directions, distinct periods, exact terms and amendment hold. The source verifier maps partial feature/case evidence and a limited A03 step; it does not certify all acceptance alternatives. Source-only rows retain their actual unverified status.

## Calculations, failures and change impact

There is no supported universal numeric acceptance score or automatic independence conclusion. A capacity or tenure calculation is only as reliable as the dated history and rule edition. Synthetic example: two proposed periods for the same client must retain separate IDs and decisions; replaying the same conversion command should produce one logical engagement, while a conflicting duplicate period needs an explicit resolution.

Missing registration/contact/period facts may prevent a later transition without preventing initial draft save. Ambiguous client matches stay unresolved. Wrong scope/revoked access is denied. A failed external profile save keeps its actual outcome for reconciliation before retry. Changed client confirmation or signed letter requires new dependent acceptance/terms review; unchanged prior-period evidence remains available under its original authority.

## E2E acceptance matrix

| Scenario | Independent expected outcome |
| --- | --- |
| E2E-01-NORMAL | Client- and firm-initiated enquiries, exact accepted declarations and letter, independent review, authorized pending-to-active transition; retain each subject/version/actor. |
| E2E-01-NEGATIVE | Missing fact, unresolved independence, wrong client/period/hash, unauthorized activation and self-review block the named action; draft enquiry and decline history survive. |
| E2E-01-CHANGE | Confirm a new client version or signed amendment; old approval becomes noncurrent, substantive work pauses, exact independent reassessment releases it. |
| E2E-01-RETRY | Restart/replay conversion and terms approval; no duplicate engagement or lost decline/return history. Test actual external effects only when an adapter exists. |

## Incremental build checklist

R11.1/2/3: close A01-A03 with actual alternative outcomes and attributable declarations; preserve pending intake and exact signed terms. R11.4: extend amendment timing/scope cases. R11.5 and R09.5: approve dated master boundaries and period roll-forward without reusing judgments as current decisions. R10.1/2 and R22.1: introduce named identities/authority with a tested mapping from existing histories. R23.2/4/5: record connected expected/actual proof and real source-owner decisions. Do not reopen canonical client consolidation or silently require every lifecycle B/C service.

<a id="source-map"></a>

## Source-map

Primary process families P01/P02; cases and criteria are listed individually below. Sources: grounded Editable/P01 and P02; Registers/Use_Cases.csv, Acceptance_Criteria.csv, Action_Contracts.csv and Workflow_Form_Uses.csv; Stage 1 forms and A01-A03 worksheets. Applicable references from the source standards register include ISA 210, ethics framework/independence and local tenure questions D21/D22. No full current-law verification is claimed. G00/external_research.csv identifies editions/access limits. G08 governs all native form fidelity and template adoption.

## Glossary

Үйлчлүүлэгч: client. Хүлээн авах: acceptance. Хараат бус байдал: independence. Гэрээний нөхцөл: engagement terms. Continuance: a current-period decision supported by prior relationship facts, not automatic renewal. Activation: software release of authorized work after the relevant decisions, not a professional conclusion itself.

## Source case handoffs

These cards preserve the actual user goal and alternatives. The original detailed physical proposals, checks, fields, states and retry contracts are in action_contracts_source.csv/json. They are source design, not a claim that all AUD_* tables or endpoints exist. Requirement traceability retains each criterion and its own recorded evidence.

### P01-UC01 - Record an audit enquiry from either direction

Source: SRC02 / Registers/Use_Cases.csv / P01-UC01. Owning action P01-ACT01; source primary capacity R1; screen S02. Criteria: P01-UC01-AC01, P01-UC01-AC02, P01-UC01-AC03, P01-UC01-AC04, P01-UC01-AC05.

A client asks about an audit, or the firm contacts a potential client. Initially the firm may know only the entity name, a business contact and the expected financial year.

Source progression: Open the permitted client search and use available identifiers to select an existing profile or request a new profile from its owning system. -> Enter the proposed service, period if known, enquiry origin and available contact information; save unresolved details as outstanding work. -> Send the available package to acceptance when it is useful for that assessment. Keep the professional decision pending.

Usable outcome: A findable enquiry with the known facts, source and next responsible person; no accepted engagement is implied.

Alternative/return path: An existing relationship can have a new proposed audit period. Missing identifiers permit an incomplete enquiry; the acceptance decision still needs its relevant facts.

Source input/check boundary: Known client name/identifiers, actual contact, enquiry origin, proposed service and any known period; owner and next work. Enquiry origin/outstanding-work fields are proposed intake inputs, not existing Core columns. Match namespace/source key as well as display name; do not require unknown period/framework on enquiry save. No AUD_IDENTIFIER_MAPPING merge is part of this action.

Current recorded case status: partial-evidence. Mapped observations: provisional intake, subsequent-period confirmation and signed terms survive independent review (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-01-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P01-UC02 - Maintain normal contacts, ownership and relationship history

Source: SRC02 / Registers/Use_Cases.csv / P01-UC02. Owning action P01-ACT02; source primary capacity R1; screen S02. Criteria: P01-UC02-AC01, P01-UC02-AC02, P01-UC02-AC03, P01-UC02-AC04.

The client supplies a replacement finance contact and an updated ownership list used in planning. The auditor needs a usable record of the information received.

Source progression: Open the client profile and the relevant contact or relationship. -> Enter the supplied name, capacity, contact details and source/date; retain the former details when they explain earlier correspondence. -> Record any audit implication in the relevant acceptance or planning work and send material changes to its owner.

Usable outcome: Current contact information and attributable ownership/group context, with earlier engagement history accessible.

Alternative/return path: One person can be both a finance contact and an authorized signatory; record the actual capacities. If verification is needed for an audit purpose, document the external call or inspection and its result. No registry connection or background verification is assumed.

Source input/check boundary: Supplied person/capacity/contact or ownership fact, source/date, effective dates and audit implication if any. A supplied contact is not a verified CEO or an independent person. Party source/domain and effective scope must match the selected engagement.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-01-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P01-UC03 - Review the context and prepare a subsequent period

Source: SRC02 / Registers/Use_Cases.csv / P01-UC03. Owning action P01-ACT03; source primary capacity R2; screen S02. Criteria: P01-UC03-AC01, P01-UC03-AC02, P01-UC03-AC03, P01-UC03-AC04.

A continuing audit starts with last year’s profile. The senior checks what is still useful and what changed before the team relies on it.

Source progression: Compare selected prior facts with the current information and proposed period. -> Confirm current facts or return specific missing or changed items to the preparer. -> Approve the reviewed context for its stated use and pass unresolved acceptance matters to P02.

Usable outcome: A current-period context with its prior origin and current confirmation, ready for the relevant next work.

Alternative/return path: An unsupported prior answer remains open. A suspected duplicate is referred to the source-data owner; Audit does not consolidate canonical client identities.

Source input/check boundary: Prior exact context, proposed current period, new support, current confirmation or missing reason. Current confirmation cannot be inferred from copying. Apply review eligibility and source dates. No duplicate consolidation command.

Current recorded case status: partial-evidence. Mapped observations: provisional intake, subsequent-period confirmation and signed terms survive independent review (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-01-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P02-UC01 - Prepare a new or continuing acceptance assessment

Source: SRC02 / Registers/Use_Cases.csv / P02-UC01. Owning action P02-ACT01; source primary capacity R1; screen S03. Criteria: P02-UC01-AC01, P02-UC01-AC02, P02-UC01-AC03, P02-UC01-AC04.

The firm is considering a new audit or another year for an existing client. The preparer assembles the actual background, audit preconditions and available people/time.

Source progression: Choose initial acceptance or continuance and identify proposed client, service and period. -> Complete the applicable source questions with evidence, explanations and outstanding matters, including reasons for a change of auditor where relevant. -> Record resource and specialist needs and submit the assessment to its assigned reviewer.

Usable outcome: An assessment that separates known facts, judgments and unresolved work.

Alternative/return path: For continuance, consider changed facts and relevant unresolved prior matters. Contacting a predecessor or obtaining external background information remains human work unless a verified integration is selected.

Source input/check boundary: Initial/continuance type, proposed scope, source question answers/explanations/evidence, integrity/resources/competence/preconditions and unresolved work. Validate actual question polarity and conditional evidence; a filled form is not a positive professional conclusion. Resources/specialists remain actual assessment evidence.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-01-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P02-UC02 - Supply and track independence declarations

Source: SRC02 / Registers/Use_Cases.csv / P02-UC02. Owning action P02-ACT02; source primary capacity R1; screen S03. Criteria: P02-UC02-AC01, P02-UC02-AC02, P02-UC02-AC03, P02-UC02-AC04.

Assigned team members and an outside specialist must provide declarations for the audit. The coordinator tracks receipt; each declarant remains responsible for their own statement.

Source progression: Select the actual people and the scope/content of the declaration. -> Receive each completed declaration or record the person’s direct response using the supported manual/native route. -> Link disclosed circumstances to the assessment and show outstanding or changed declarations.

Usable outcome: Dated declarations, actual declarants and a clear list of missing responses.

Alternative/return path: An external specialist can send a signed file for an auditor to register; a portal account is not required. A new relationship reported later creates a new declaration/reassessment event rather than replacing the earlier statement.

Source input/check boundary: Actual declarant/party and capacity, covered scope, exact declaration content, signature/qualifications and actual signed date; refresh-of reference if changed. Content must exist before CONTENT_REF; signed date and declaration scope must correspond to that content. Disclosure/prohibition flags require supported semantics, not default false.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-01-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P02-UC03 - Review independence concerns and acceptance gaps

Source: SRC02 / Registers/Use_Cases.csv / P02-UC03. Owning action P02-ACT03; source primary capacity R2; screen S03. Criteria: P02-UC03-AC01, P02-UC03-AC02, P02-UC03-AC03, P02-UC03-AC04.

A declaration discloses a relationship and the acceptance assessment has an unresolved staffing need. The senior evaluates the actual facts before recommending a decision.

Source progression: Inspect the disclosed circumstance, relevant requirement and supporting information. -> Record whether a prohibition, threat, permitted response or unresolved question applies; assign necessary follow-up. -> Review whether the response actually occurred and submit a supported recommendation to the authorized decision maker.

Usable outcome: An evaluated independence position and an acceptance package showing any remaining restrictions.

Alternative/return path: Where specialist advice is needed, retain the advice and how it was applied. An unresolved issue can support deferral or decline; a positive clearance is not required to refuse work.

Source input/check boundary: Exact disclosure and requirement version, assessed threat/prohibition, response evidence, clearance/recommendation and unresolved staffing facts. Applicable prohibitions cannot be waived by a safeguard or R3 hierarchy. Review actual actor eligibility and whether matter/assessment scope matches proposed engagement.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-01-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P02-UC04 - Decide acceptance and control progression

Source: SRC02 / Registers/Use_Cases.csv / P02-UC04. Owning action P02-ACT04; source primary capacity R3; screen S03. Criteria: P02-UC04-AC01, P02-UC04-AC02, P02-UC04-AC03, P02-UC04-AC04, P02-UC04-AC05.

The assigned director or partner receives the reviewed assessment. They must decide whether the proposed work can be accepted or continued under the firm’s actual authority rules.

Source progression: Read the assessment, independence position, terms and unresolved matters relied upon. -> Record accept/continue, pending/defer or reject with rationale and the actual authority basis; conditional acceptance requires a defined permitted condition and effect. -> Authorize engagement setup only when the applicable positive prerequisites are met; otherwise return named work or retain the refusal.

Usable outcome: A dated professional decision and a usable authorization or clear restriction.

Alternative/return path: A material later change opens reassessment of the affected decision and work. A statutory appointment that cannot be declined needs its own applicable response; the system does not assume withdrawal is always available.

Source input/check boundary: Exact assessment/recommendation/independence/terms versions, decision/reason, defined conditions, actual appointment/authority and decider capacity. Conjunctive actual decision authority plus required current package and no applicable prohibition; decline/defer must remain possible when positive prerequisites fail. No direct acceptance from form completion.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-01-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P02-UC05 - Prepare, agree and amend the engagement terms

Source: SRC02 / Registers/Use_Cases.csv / P02-UC05. Owning action P02-ACT05; source primary capacity R1; screen S03. Criteria: P02-UC05-AC01, P02-UC05-AC02, P02-UC05-AC03, P02-UC05-AC04.

The firm and client discuss the scope and responsibilities. A draft letter must become an actual agreement; later changes may require renewed professional assessment.

Source progression: Prepare the appropriate terms using the selected template and actual proposed scope/framework/responsibilities. -> Route the draft through the assigned firm review and obtain the client’s actual authorized response outside or inside the supported signing route. -> Retain the agreed version and approval evidence; for changes, record the amendment and route affected acceptance matters back for assessment.

Usable outcome: Identifiable current terms and evidence of agreement, with prior versions retained.

Alternative/return path: Continuing engagements assess whether terms need revision or reminder; do not automatically recreate an identical agreement. Sending a draft or receiving an unsigned copy remains distinct from agreement.

Source input/check boundary: Actual selected letter revision, scope/framework/responsibilities/fees/timetable, firm approval and actual authorized client agreement evidence. Firm review, sending and client agreement are distinct. Verify authorized signatory capacity and scope/content correlation; electronic-signature authenticity is not inferred from a file.

Current recorded case status: partial-evidence. Mapped observations: provisional intake, subsequent-period confirmation and signed terms survive independent review (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-01-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

## Pinned code and external reference locators

All following code locators refer to the local 079f9da snapshot. File hashes and the complete symbol/action index are in code_observation_index.csv/json. The remote main/PR do not contain all of these local additions.

- scripts/pilot-intake.mjs: currentTerms at line 28; termsGaps at line 37; activeTermsGap at line 43; canDraftTerms at line 50; termsAction at line 57. SHA-256 5e5946c7fb22cab7046861ca4e74123b8fd3165d1c3a9d677203ce8d5fb1302e.
- scripts/pilot-workflow.mjs: planningChanged at line 47; syncPlanningPapers at line 56; syncFieldwork at line 67; validMateriality at line 92; reportWorkspace at line 96. SHA-256 4a97ca99e80e34f23929733e1feba4e60c106ceca72277be643f8430786f8d23.

External reference pointers support the specific edition/applicability discussion, not whole-standard compliance. Fresh inspection limits, publication/effective dates and the retained original paragraph register are in external_research.csv and standards_source_edition.csv.

- [EXT13 - IESBA, International Code overview](https://www.ethicsboard.org/iesba-code): Current web overview; Conceptual framework and adoption sections. Overview only; specific operative Code clauses retained from original source register. Accessed 16 November 2026.
- [EXT07 - IFAC, Mongolia member-country profile](https://www.ifac.org/about-ifac/membership/profile/mongolia): Updated February 2026; Adoption: ISA, ethics and quality management. Profile only; not legal-adoption certification. Accessed 16 November 2026.
- [EXT08 - Legalinfo Mongolia, Audit Law](https://legalinfo.mn/mn/detail?lawId=11192): Current consolidated body not obtained; Source pointers arts 8.1-8.3 and 12.5. Direct official pages 403; indexed snippets obtained for tenure. No fresh full-text verification of retention. Accessed 16 November 2026.
