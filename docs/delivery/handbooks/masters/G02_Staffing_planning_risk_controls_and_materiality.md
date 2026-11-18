# Staffing, planning, risk, controls and materiality

Guide G02 | Version 1.0 | 16 November 2026

Code baseline: local 079f9da47a02eab681feeeda3de3dfb8cfc42848, redesign/enterprise-workspace. Source edition: October 26 original archive and registered November 11 repaired-workbook inventory, with November 16 current-file observations separately recorded. Local newer additions are not merged into GitHub main. Independent source acceptance remains open.


## Purpose and supported profile

Turn accepted scope into a feasible staffed engagement and a reviewed risk-responsive plan. The plan identifies what must be learned, which assertions/risks matter, what controls reliance is supported, what procedures respond and which thresholds apply. G00 owns shared review/currentness; the PILOT guide owns the detailed materiality-sampling-findings example.

The pilot already binds staff seats to approved roster/credential/appointment facts and dated hours; checks aggregate bookings; retains reassignment/sign-offs; and links a reviewed risk/assertion to one procedure/template with nature/timing/extent, materiality and reliance. Structured candidate/selected materiality is implemented. Many-to-many risk responses, full walkthrough/control design and operating-effectiveness records, actual effort and all source planning alternatives remain incomplete.

## Records and ownership

| Record | Owner and consumers |
| --- | --- |
| Firm practitioner / appointment | Firm-authorized source facts with credential/suitability dates; technical access remains separate. Staffing consumes a reviewed version. |
| Seat / booking / work assignment | Responsible planning actor; capability, period and hours across engagements. Work owner/reviewer and unfinished requests follow reassignment; historical sign-offs retain original actor. |
| Understanding / risks | Auditor records actual entity, IT/process/control understanding, risk/assertion, likelihood/magnitude and support. A questionnaire score does not approve significance. |
| Programme decision | Approved adopt/exclude, exact risk/procedure/template, approach/nature/timing/extent and planning basis. Consumers execute only adopted current work. |
| Materiality | 1.3 structured decision with accepted support and independent review. Threshold owner is not a copied text cell. |
| Controls reliance | 2.6 reviewed reliance none/partial/full/na, basis and accepted support for reliance. A complete source risk/control matrix needs further implementation. |

## Parallel planning and transition rules

<!-- diagram: Staff + actual scope | Understanding + risk evidence | Materiality + controls basis | Tailored responses | Independent plan approval | Current fieldwork release -->

Understanding, evidence requests and draft programmes can progress in parallel where the actual rule permits. Final plan approval checks actual current prerequisites. Control design/implementation, walkthrough evidence and operating effectiveness are different assertions. Failed/deviant controls require an attributable reliance/response reassessment, not an automatically favorable rating.

Current programme approval pins the source or published template and uses explicit engagement adoption. Source numeric order does not require all planning fields to be complete before useful drafting. Excluded programmes stay out of execution. Planning changes selectively reopen dependent work and preserve earlier approved papers. New multi-risk/multi-procedure links must retain the old one-to-one path and exact approval inputs.

## Materiality contract

AUTO-046/FG-02 supports five named candidate measures, prior comparisons, chosen/overridden overall/performance/specific/trivial amounts, rationale and qualitative reporting/disclosure context. Chosen overall 18 from candidate 20 gives 60% performance 10.80, 75% specific 13.50 and 60% specific performance 8.10; explicit trivial zero survives. Reducing overall to 12 gives 7.20/9.00/5.40 and stales dependent sampling/evaluation without altering old selections. These are synthetic arithmetic inputs, not benchmark policy.

The detailed input schema, source 1.3А coordinates and override/rate/amount guards are in PILOT sections 2-5 and src/lib/pilot-materiality.ts. The compatible native source answers read the owning decision; retyping a different amount does not override it. Earlier legacy percentage-profile records remain readable. Do not downgrade a structured decision to discard its rationale/history.

## Staffing calculation and examples

Booking arithmetic must use aligned person/date windows across engagements. Synthetic contract example: approved availability 40 hours in a defined week, bookings 24 and 20 in that same window imply 44 and an overbooking of 4. It does not establish the app's complete production scheduling behavior or a universal 40-hour policy. The recorded fixture rejects overbooking/expired credential evidence and preserves old named sign-offs through reassignment. Actual effort is not inferred from elapsed calendar time or completed tasks; R10.4 remains open.

## Interfaces, permissions and recorded evidence

Owners: scripts/pilot-staffing.mjs (seat/assignment checks), pilot-registers.mjs (planning decisions/basis), pilot-materiality.mjs; UI pilot-staffing.tsx, pilot-registers.tsx, pilot-materiality.tsx and pilot-materiality-selection.tsx. Use actual existing action literals from code_observation_index.csv rather than creating another planning store. The current command envelope is G00.

The assigned preparer prepares; the independent reviewer challenges/reviews; partner decisions use the actual authority. Specialist suitability/declared interests/deliverable and auditor supervision are retained; a specialist is not automatically a portal user or a new approver. Recorded tests cover staff suitability/capacity/reassignment, approved programme templates, selected materiality and selective reopening. A08 is connected; A04-A07/A09/A10/A12 have individual partial/unverified steps, not zero software nor completed connected proof.

## Failure and revision behavior

Denied/stale/revoked assignment blocks the affected command. Missing benchmark evidence or reliance support blocks use, while independent fields can still be drafted. Unknown control facts are not a favorable response. Revised materiality stales consuming sampling/evaluation/report decisions; unchanged actual control reliance remains reviewed. Revised risk or control evidence must reopen linked programme responses only after mapping exact dependencies. Dated suitability changes affect future work; old approved snapshots and performed-work actors remain history.

## E2E acceptance matrix

| Scenario | Expected proof |
| --- | --- |
| E2E-02-NORMAL | Accepted scope, eligible staff, actual understanding/risk, reviewed 1.3/2.6, tailored procedure and independent plan approval; fieldwork consumes exact versions. |
| E2E-02-NEGATIVE | Overbooking, expired credential, missing review/support, excluded programme, unsupported risk code and self-review are rejected at the relevant transition. |
| E2E-02-CHANGE | New risk, control deviation, materiality revision or reassignment renews affected review and retains unrelated reviewed work/old sign-offs. |
| E2E-02-MULTI | One risk with several procedures and one procedure with several risks preserve reasons/coverage; removing an edge must not lose performed work or falsely mark a risk addressed. Proposed broader proof. |

## Incremental build checklist

R07.1-5: source fidelity of 1.1.1/1.3/2.6 and planning families, repeated risk structures and exports. R08.5: explicit adoption and dedicated programme loss acknowledgement. R09.1-4: all confirmed facts/reliance edges and selective change impacts. R10.1-5: named people, authority, suitability, effort and whole-app revocation. R12.1-5: full understanding, many-to-many responses, controls/opening balances and source A04-A10/A12 handoffs. Preserve the A08 reference and current programme approval. Independent acceptance under R23 is a separate final step.

<a id="source-map"></a>

## Source-map and glossary

Sources: P03/P06/P14 process files; Stage 1/2 forms; A04-A10/A12; AUTO-046 and applicable AUTO-008/054; full form/dependency/action registers. Original source ratings/reference bands are firm-method candidates; D12/D21/D23 require actual meaning/edition/code vocabulary. Мэргэжлийн шийдэл: professional judgment. Эрсдэл: risk. Батламж мэдэгдэл: assertion. Хяналтад найдах: controls reliance. Төлөвлөгөө: plan. Capacity: actual permitted resource availability, distinct from technical account access.

## Source case handoffs

These cards preserve the actual user goal and alternatives. The original detailed physical proposals, checks, fields, states and retry contracts are in action_contracts_source.csv/json. They are source design, not a claim that all AUD_* tables or endpoints exist. Requirement traceability retains each criterion and its own recorded evidence.

### P03-UC01 - Set up the authorized engagement and current period

Source: SRC02 / Registers/Use_Cases.csv / P03-UC01. Owning action P03-ACT01; source primary capacity R1; screen S04. Criteria: P03-UC01-AC01, P03-UC01-AC02, P03-UC01-AC03, P03-UC01-AC04.

Acceptance is complete and the team needs a work file for the agreed audit period.

Source progression: Select the actual acceptance authorization and current agreed terms. -> Enter the engagement profile, reporting/auditing framework, period, currency, locations/components and expected deliverables that are known and required at activation. -> Save the engagement and its dates/milestones; send the planning work to the assigned team.

Usable outcome: A current-period audit workspace linked to its authorization.

Alternative/return path: An incomplete proposal remains intake/acceptance work rather than an active audit. A planned reporting date may change; preserve the reason and assess dependent work.

Source input/check boundary: Valid setup authorization and agreed terms; known required engagement profile, period, firm/client source keys, framework/standard/currency/methodology and lead partner. Check period order, source identity and methodology validity; no unknown placeholders. Check duplicate engagement code/period and current authorization at commit.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-02-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P03-UC02 - Assign preparers, reviewers and specialist work

Source: SRC02 / Registers/Use_Cases.csv / P03-UC02. Owning action P03-ACT02; source primary capacity R2; screen S05. Criteria: P03-UC02-AC01, P03-UC02-AC02, P03-UC02-AC03, P03-UC02-AC04, P03-UC02-AC05.

The senior distributes audit areas and agrees who prepares and reviews each relevant unit of work. Some work needs a specialist.

Source progression: Inspect work scope, competence/availability and the required review level. -> Assign a named person in the actual capacity with due date, priority and planned effort; define the specialist’s bounded contribution. -> Show the assignment to its owner and record reassignment/coverage when someone becomes unavailable.

Usable outcome: Work with a responsible person and an appropriate, explicit review route.

Alternative/return path: A senior may prepare complex work; preparation attribution must show that capacity. Ending an assignment preserves previous authorship and review history and identifies outstanding work for reassignment.

Source input/check boundary: Work exact ID, named person/source, actual responsibility/capacity, competence/availability basis, dates/hours/appointment and specialist scope where relevant. Assignment scope, competence and any applicable independent eligibility must all pass. No four mandatory signatures, no technical permissions from ROLE_CODE alone.

Current recorded case status: partial-evidence. Mapped observations: approved roster capacity and reassignment preserve historical staff sign-offs (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-02-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P03-UC03 - Review timetable, effort and resource changes

Source: SRC02 / Registers/Use_Cases.csv / P03-UC03. Owning action P03-ACT03; source primary capacity R3; screen S05. Criteria: P03-UC03-AC01, P03-UC03-AC02, P03-UC03-AC03, P03-UC03-AC04.

The team identifies a staffing clash or additional work that changes the budget and reporting timetable. The partner/director considers its effect on delivery and audit quality.

Source progression: Compare planned role hours, actual recorded effort and remaining work at the stated period/grain. -> Decide the needed resource, scope or timetable change and obtain any relevant agreement/reassessment. -> Approve the revised plan within assigned authority and pass affected work to its owner.

Usable outcome: A reasoned revised resource/timetable baseline with actual effort preserved.

Alternative/return path: Actual effort may exceed budget and must remain recorded. Suspension or withdrawal needs its separate professional/legal basis and communications.

Source input/check boundary: Exact budget baseline, work/person/role hours, actual time interval, proposed resource/timetable change and actual approval basis. Define planned/actual population, interval, currency/cost rates and rounding; budget pressure cannot bypass required work. Firm/portfolio view requires actual broader scope.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-02-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P03-UC04 - Create the next period from selected prior structure

Source: SRC02 / Registers/Use_Cases.csv / P03-UC04. Owning action P03-ACT04; source primary capacity R1; screen S05. Criteria: P03-UC04-AC01, P03-UC04-AC02, P03-UC04-AC03, P03-UC04-AC04.

A continuing client’s next audit uses selected prior structure to avoid retyping stable information.

Source progression: Select the prior engagement and the structure/context to copy. -> Create a separate proposed current-period package, retaining origin references and marking facts for confirmation. -> Update changed facts and route current acceptance, planning and assignments through their normal work.

Usable outcome: A separate period with useful lineage and its own current decisions.

Alternative/return path: Prior unresolved matters are visible for consideration, not automatically resolved. Evidence can be referenced historically without being represented as current-period audit work.

Source input/check boundary: Selected prior exact engagement/context/structure, proposed new period and copy choices with origin/current-confirmation state. Copy structure/facts only at explicitly selected scope. Prior evidence may be referenced historically without new current-period sufficiency.

Current recorded case status: partial-evidence. Mapped observations: provisional intake, subsequent-period confirmation and signed terms survive independent review (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-02-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P06-UC01 - Document understanding, inquiries and relevant controls

Source: SRC02 / Registers/Use_Cases.csv / P06-UC01. Owning action P06-ACT01; source primary capacity R1; screen S09. Criteria: P06-UC01-AC01, P06-UC01-AC02, P06-UC01-AC03, P06-UC01-AC04.

The preparer discusses the business and financial reporting with client personnel, follows relevant transactions and records what was actually learned.

Source progression: Record the business/framework context and the actual respondent, inquiry date, source and remaining questions. -> Describe relevant cycles, systems and control design; record implementation observations and walkthrough evidence separately. -> Document the team’s planning discussion and relevant client/governance communications as distinct occurrences.

Usable outcome: Current understanding that a reviewer can follow to its sources and audit implications.

Alternative/return path: An interview, visit or external search can occur outside the software and be documented afterward. Prior understanding can be reused only after current relevance is considered.

Source input/check boundary: Respondent/capacity, inquiry date and source; current business/framework/cycle/system facts, control design/implementation work and separate team/client communications. Supplier, respondent and auditor author remain distinct. Inquiry alone must not be relabelled observed implementation. Questions use actual source polarity and applicability.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-02-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P06-UC02 - Assess fraud and other risks and plan responses

Source: SRC02 / Registers/Use_Cases.csv / P06-UC02. Owning action P06-ACT02; source primary capacity R1; screen S09. Criteria: P06-UC02-AC01, P06-UC02-AC02, P06-UC02-AC03, P06-UC02-AC04.

The team identifies a revenue concern and relevant controls while assessing risks. It must explain the judgment and the planned response.

Source progression: Record the risk source, financial-statement/assertion context, inherent/control considerations and significance rationale. -> Link appropriate controls, areas and assertions; assess fraud presumptions and their applicable documented treatment. -> Specify overall and assertion-level responses, including procedures or staffing/supervision arrangements as appropriate, and planned nature/timing/extent.

Usable outcome: A risk register and response strategy whose relevance can be reviewed.

Alternative/return path: A questionnaire score is an indicator under a selected method, not an ISA significant-risk conclusion. A new finding can revise an existing risk, add a risk or change the response without erasing the prior assessment.

Source input/check boundary: Exact source risk facts, statement/assertion/area, inherent likelihood/magnitude, control considerations, fraud presumption treatment and proposed responses. No fixed questionnaire band automatically sets significant risk. Missing relevant assertion/response and planned control reliance without appropriate testing remain review gaps.

Current recorded case status: partial-evidence. Mapped observations: the extended engagement preserves its original 34-register journey and scoped recoverable archive (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-02-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P06-UC03 - Prepare analytics and materiality with a reasoned basis

Source: SRC02 / Registers/Use_Cases.csv / P06-UC03. Owning action P06-ACT03; source primary capacity R1; screen S10. Criteria: P06-UC03-AC01, P06-UC03-AC02, P06-UC03-AC03, P06-UC03-AC04.

The preparer compares current and prior financial information and proposes materiality using an appropriate benchmark.

Source progression: Identify comparable data, expectations and unusual relationships; record investigated explanations and supporting work. -> Enter candidate benchmark sources, selected amounts/fractions and qualitative rationale for overall/specific/performance/clearly-trivial thresholds. -> Submit the selected determination with calculated values separately identifiable from human adjustments and record the impact of later changes.

Usable outcome: A reviewable analytics and materiality basis with explicit parameters and limitations.

Alternative/return path: A zero, negative or unrepresentative benchmark requires a method decision; no automatic absolute-value conversion is assumed. Clearly trivial does not mean all uncorrected amounts below a fixed percentage can be ignored.

Source input/check boundary: Comparable exact input data and expectation; selected materiality type/scope/benchmark/amount/fraction, calculated candidate, human selected amount and rationale. Check benchmark comparability, units/currency/fraction representation and scope. Performance materiality/clearly trivial are distinct concepts; a lower materiality is not an automatic universal work reset.

Current recorded case status: partial-evidence. Mapped observations: selected materiality overrides bind source rows and reopen sampling and evaluation without losing signed history (tests/pilot-materiality.test.mjs); approved materiality and its revision govern the same sample and misstatement evaluation (tests/pilot.test.mjs); the extended engagement preserves its original 34-register journey and scoped recoverable archive (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-02-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P06-UC04 - Define and evaluate a specialist or other contribution

Source: SRC02 / Registers/Use_Cases.csv / P06-UC04. Owning action P06-ACT04; source primary capacity R2; screen S09. Criteria: P06-UC04-AC01, P06-UC04-AC02, P06-UC04-AC03, P06-UC04-AC04.

The team needs valuation, IT or other specialist assistance for a particular audit matter. The senior coordinates the contribution and evaluates the actual work received.

Source progression: Identify whether the contributor is an auditor expert, accounting/auditing specialist, management expert, internal auditor or component auditor and select the applicable professional treatment. -> For an auditor-appointed expert, agree scope, responsibilities, competence/objectivity basis, expected output, timing and permitted material. For a management expert, inspect the entity-commissioned scope and evaluate competence, capability, objectivity and work relevant to the audit. Register the actual delivered version. -> Evaluate the relevant work, methods/assumptions/data and findings, request additional work where inadequate, and document the responsible auditor’s use.

Usable outcome: A bounded contribution with an explicit auditor evaluation and retained responsibility.

Alternative/return path: The specialist may send a file for controlled manual receipt; no invitation email or portal is assumed. Group/component work is conditional on a group audit and its applicable edition; it is not treated as the same arrangement as an external non-accounting expert. Using internal-audit work and obtaining direct assistance are separate decisions; direct assistance requires its applicable legal, objectivity, competence and direction/supervision/review conditions. The auditor does not appoint or contract every management expert. Management’s expert: evaluate the relevant competence/capability/objectivity, understand the work and evaluate its appropriateness as evidence; do not automatically create an auditor-appointed expert assignment. Internal-audit function work: evaluate the relevant function and actual body of work before using it; a report received is not automatic reliance. Direct assistance by internal auditors: first establish that the jurisdiction permits it, then address the applicable individual eligibility, work limits, written agreements and external-auditor direction/supervision/review. No universal direct-assistance permission is presumed.

Source input/check boundary: Contributor kind and actual party, bounded instructions/material, competence/objectivity basis, exact deliverables and auditor evaluation of methods/data/findings. Contributor party/material scope, applicable ethics/objectivity/competence and permitted use must all match. Expert/component/internal-audit classifications cannot share one generic legal treatment.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-02-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P06-UC05 - Challenge planning support and return specific gaps

Source: SRC02 / Registers/Use_Cases.csv / P06-UC05. Owning action P06-ACT05; source primary capacity R2; screen S09. Criteria: P06-UC05-AC01, P06-UC05-AC02, P06-UC05-AC03, P06-UC05-AC04.

The senior reviews the prepared planning package, including a risk with a generic response and a materiality benchmark needing explanation.

Source progression: Inspect the exact plan, supporting understanding, materiality and risk-response coverage. -> Raise focused review notes for unsupported judgments, missing responses or inconsistent scope and assign the preparer’s response. -> Evaluate revised work and clear or return the notes; record the extent of the planning review.

Usable outcome: A reviewed planning package or specific unresolved work for the partner.

Alternative/return path: A management explanation needs appropriate supporting work. Routine correction does not require restarting unrelated approved planning.

Source input/check boundary: Exact planning package, assigned review extent, risks/controls/responses/materiality and preparer response. Apply conjunctive review eligibility. Check actual work/evidence and unresolved matters; completion counts or clean machine results cannot replace the stated professional review.

Current recorded case status: partial-evidence. Mapped observations: selected materiality overrides bind source rows and reopen sampling and evaluation without losing signed history (tests/pilot-materiality.test.mjs); approved materiality and its revision govern the same sample and misstatement evaluation (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-02-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P06-UC06 - Approve the strategy and respond to new information

Source: SRC02 / Registers/Use_Cases.csv / P06-UC06. Owning action P06-ACT06; source primary capacity R3; screen S09. Criteria: P06-UC06-AC01, P06-UC06-AC02, P06-UC06-AC03, P06-UC06-AC04.

The partner considers significant risks, resource decisions and the proposed approach. Later audit evidence changes a material assumption.

Source progression: Review significant judgments and whether the overall strategy and planned work are appropriate. -> Approve the exact planning baseline or return specified concerns; communicate necessary scope/timing matters to the appropriate parties. -> On new information, assess affected risk/materiality/response judgments and authorize targeted replanning and renewed review.

Usable outcome: A current approved strategy and a clear revised-work instruction when facts change.

Alternative/return path: Approval does not require all fieldwork to be finished. Required EQR can consider selected planning judgments during the audit without becoming the plan’s operational approver.

Source input/check boundary: Exact planning baseline/significant judgments, actual partner authority, approved strategy and later changed information with targeted effect. Actual significant judgments, eligible partner authority and current scope must agree. An unchanged-impact decision requires a reason; not all changes invalidate all work.

Current recorded case status: partial-evidence. Mapped observations: approved materiality and its revision govern the same sample and misstatement evaluation (tests/pilot.test.mjs); the extended engagement preserves its original 34-register journey and scoped recoverable archive (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-02-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P14-UC01 - Maintain firm, units and practitioner status

Source: SRC02 / Registers/Use_Cases.csv / P14-UC01. Owning action P14-ACT01; source primary capacity SUPPORT; screen S24. Criteria: P14-UC01-AC01, P14-UC01-AC02, P14-UC01-AC03, P14-UC01-AC04.

An authorized firm administrator updates an operating contact, team/unit or practitioner’s active/external status.

Source progression: Open the owning firm/person record and inspect its actual source and effective information. -> Record the supported correction, appointment/status or departure in the owning system/approved publication route. -> Show current business information to authorized staffing users and retain previous attribution.

Usable outcome: A current roster/organization view with traceable changes.

Alternative/return path: An external practitioner can be listed without becoming an employee. Audit Core consumes published HR/organization data; the actual write/publication interface is a design dependency.

Source input/check boundary: Actual firm/unit/person/status correction, source/effective date and administrator authority; departing/external practitioner status separate from employee identity/access. Actual firm/HR administration authority, source ownership and effective scope are required; external person need not have employee row. Departure does not delete old work or automatically transfer signatures.

Current recorded case status: partial-evidence. Mapped observations: approved roster capacity and reassignment preserve historical staff sign-offs (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-02-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P14-UC02 - Record competence and review staffing suitability

Source: SRC02 / Registers/Use_Cases.csv / P14-UC02. Owning action P14-ACT02; source primary capacity SUPPORT; screen S24. Criteria: P14-UC02-AC01, P14-UC02-AC02, P14-UC02-AC03, P14-UC02-AC04.

The staffing owner needs to assess whether available people have appropriate qualifications, skills and sector/specialist experience for the proposed work.

Source progression: Record the actual credential/experience evidence and relevant validity or verification facts. -> Compare the proposed work’s competence needs with that evidence and record gaps/suitability. -> Pass the supported staffing information to the responsible acceptance/engagement leader.

Usable outcome: An explicit human suitability basis rather than an automatic staffing score.

Alternative/return path: A degree does not acquire a fabricated annual expiry. Learning attendance can be recorded where supported but does not by itself prove competence.

Source input/check boundary: Actual credential issuer/evidence/validity and experience, defined work competence needs and supported suitability/gaps; authorized staffing audience. Verify relevant issuer/qualification facts and actual applicable validity; no fabricated expiry for degrees. Training attendance or calendar availability alone is not competence.

Current recorded case status: partial-evidence. Mapped observations: approved roster capacity and reassignment preserve historical staff sign-offs (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-02-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P14-UC03 - Inspect workload and resolve portfolio capacity gaps

Source: SRC02 / Registers/Use_Cases.csv / P14-UC03. Owning action P14-ACT03; source primary capacity R3; screen S24. Criteria: P14-UC03-AC01, P14-UC03-AC02, P14-UC03-AC03, P14-UC03-AC04.

An authorized firm leader sees overlapping commitments across permitted engagements and needs to allocate sufficient people/time.

Source progression: Inspect planned availability, assigned work/hours, milestone timing and the defined dashboard denominator/freshness. -> Investigate the actual gaps with engagement owners and agree reassignment or additional resources. -> Record the revised commitments and notify the affected owners through the supported internal workflow.

Usable outcome: A human capacity decision reflected in the relevant assignments.

Alternative/return path: This requires the actual firm/portfolio authorization, not simply an R3 label on one engagement. Predictive scheduling or external calendar synchronization remains future.

Source input/check boundary: Actual permitted firm/portfolio scope, defined time interval and planned/actual denominators, availability source/as-of, overlaps and actual resource decisions. Firm/portfolio permission is separate from R3 on one audit. Define denominator/interval and avoid line/header or planned/actual double counting. Utilization is not audit quality.

Current recorded case status: partial-evidence. Mapped observations: approved roster capacity and reassignment preserve historical staff sign-offs (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-02-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

## Automation handoff index

G11 contains complete minimum inputs/methods/human limits and independent specification examples; the current source verifier is a separate evidence class.

| ID | Minimum outcome |
| --- | --- |
| AUTO-046 | Calculate and preserve approved overall, performance and clearly-trivial materiality amounts from auditor-selected benchmarks and percentages. |


## Pinned code and external reference locators

All following code locators refer to the local 079f9da snapshot. File hashes and the complete symbol/action index are in code_observation_index.csv/json. The remote main/PR do not contain all of these local additions.

- scripts/pilot-staffing.mjs: knownCredential at line 14; committedRows at line 19; checkStaffing at line 26; approvedStaffing at line 73; seatFor at line 83. SHA-256 0dbe2e2a5960f6f12d6104df27e5010527dc9a67ef7f4506f4fbdbcc78ebf790.
- scripts/pilot-materiality.mjs: materialityBasis at line 16; materialityEvidenceCurrent at line 30; syncMateriality at line 35; materialityValues at line 48; materialityGap at line 58. SHA-256 07edce9e7d1751ba6398165bcc539ea74d6efddf9faee0196d74e97c27142f77.
- scripts/pilot-registers.mjs: stale at line 23; formContract at line 49; ruleMatches at line 72; programmeView at line 78; programmeTemplates at line 83. SHA-256 737658acdf0e5a93f6800f4ff9cc686ce5abe86d9732875ed177a8bc8fe4036a.

External reference pointers support the specific edition/applicability discussion, not whole-standard compliance. Fresh inspection limits, publication/effective dates and the retained original paragraph register are in external_research.csv and standards_source_edition.csv.

- [EXT01 - IAASB, Handbook Volume 1](https://ifacweb.blob.core.windows.net/publicfiles/2025-09/IAASB-2025-Handbook-Volume-1.pdf): 2025; ISA 320 paras 9-14; PDF pp329-330 (1-based). Selected text inspected, not the full 1046-page volume. Accessed 16 November 2026.
- [EXT07 - IFAC, Mongolia member-country profile](https://www.ifac.org/about-ifac/membership/profile/mongolia): Updated February 2026; Adoption: ISA, ethics and quality management. Profile only; not legal-adoption certification. Accessed 16 November 2026.
