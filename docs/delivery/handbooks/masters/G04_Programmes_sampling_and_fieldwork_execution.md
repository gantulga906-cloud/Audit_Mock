# Programmes, sampling and fieldwork execution

Guide G04 | Version 1.0 | 16 November 2026

Code baseline: local 079f9da47a02eab681feeeda3de3dfb8cfc42848, redesign/enterprise-workspace. Source edition: October 26 original archive and registered November 11 repaired-workbook inventory, with November 16 current-file observations separately recorded. Local newer additions are not merged into GitHub main. Independent source acceptance remains open.


## Purpose and current execution model

Execute approved risk-responsive procedures against current evidence/populations, retain actual work and exceptions, and deliver independently reviewed conclusions into findings/completion. A saved programme is not proof that the procedure was performed. G02 owns planned responses; G03 owns usable data; G05 owns findings/evaluation. The PILOT guide specifies the materiality-sampling interface and FG-01 delta.

The pilot has deterministic sample design/selection/testing, journal investigation and thirteen registered area execution profiles. This supports substantial commercial/assets/statutory/finance work. It does not close all 22 source variants or every automation minimum used in them. G10 gives an individual implementation/acceptance card for each variant; G11 retains all 58 minimum methods, inputs, expected source examples and limits.

## Records and current profiles

| Current form/profile | Supported source-file family |
| --- | --- |
| 3.1.16 and 3.1.5 / sales | invoices, credit notes, subsequent cash and approved prices; sales cut-off, aging/receipt and price checks. |
| 3.1.10 / purchases | receipts, supplier bills and payments; exact references and exceptions. |
| 3.1.8 / bank | bank movements and approved reconciliation adjustments; signed amounts. |
| 3.1.4 / inventory | register, movement and count files by item/location/unit. |
| 3.1.2 / assets | register roll-forward and additions evidence. This does not complete every depreciation/life/impairment method. |
| 3.1.18 and 3.1.14 / payroll and tax | Accepted named rule editions plus payroll/bank or tax/rule/filing/payment files. |
| 3.1.9 and 3.1.21 / loans and leases | Named simple-segment loan terms and fixed-payment lease schedules. |
| 3.1.20, 3.1.15 and 3.1.3 / FX, equity and investments | Exact-date rates/positions, equity authorization/movements, holdings/custody/simple cash flows. These are bounded methods, not all accounting judgments. |

An area run pins period, through date, approved population/hash, selected statement-line accounts, source evidence IDs/versions/hashes, approved programme decision, parameters/edition and assigned owner/reviewer. Every output retains contributing source rows. Exceptions have stable case identity and separate auditor disposition. Independent run approval pins the current basis; the workpaper consumes that reviewed result.

Exact current CSV schemas are in current_area_input_contracts.json/csv, generated from the inspected exported declarations in src/lib/pilot-area.ts. Parsing requires exact headers, valid dates, declared numeric/rate types and in-scope evidence. Different expected files cannot masquerade as independent sources by renaming identical bytes. A required missing/expired/ambiguous edition returns unsupported, not an assumed rate.

## Execution and review transitions

<!-- diagram: Adopted programme | Current inputs + method | Run with source lineage | Investigate exceptions | Independent run review | Workpaper conclusion -->

Current area-run prepares calculation results; area case review records evidence and actual disposition; independent approval binds the reviewed run. A calculation may succeed while exceptions remain unresolved. The assigned workpaper reviewer challenges accounting basis, completeness, relevance and professional conclusion. Numeric agreement cannot substitute for rights/control, impairment assumptions, fraud response or sufficient evidence.

Sample design is a real retained record before selection. Current deterministic-row-selection-v1 is repeatable; versioned unbiased sampling and supported ratio projection remain FG-01/R15 work. The current sample engine accepts nonnegative exception amounts, whereas native 3.3.1 accepts signed differences; HB-D02 must be resolved before signed projection integration. Keep targeted 100%-tested items separate from a representative audit sample and do not infer population assurance from targeted selection.

## Worked arithmetic and method boundaries

Synthetic asset bridge: opening cost 100 + additions 20 - disposals 5 + signed transfers -3 = closing cost 112. This checks signed taxonomy; a generic positive adjustment assumption would be wrong. A supported straight-line example with cost 120, residual 20 and life 5 gives annual charge 20 before any approved time/proration basis. That example is a specification expectation, not proof the current assets roll-forward profile implements every AUTO-028 case.

Synthetic fixed payments of 100 at two period ends and a zero rate give present value 200. A variable payment/extension/remeasurement case cannot be silently routed into the fixed-payment profile. Loan simple interest needs actual day basis/segments; missing basis is not a zero charge. FX uses the approved exact date/currency rate; no undocumented nearest-date fallback. Payroll uses basis-point rule fields and effective dates; employer contributions are separate from employee deductions.

The accounting framework decision and approved method must precede calculation. Official IFRS public IAS 2 material confirms the NRV cost categories; IAS 16 identifies recognition/measurement principles. Full current consolidated paragraphs and engagement applicability were not obtained here. Do not invent an IFRS paragraph citation or claim every capitalizable label is an asset. The original source C01-C03/C10 corrections are retained in source_conflicts.csv.

## Journal and technical investigation

AUTO-009 requires one investigation per actual journal/event with all contributing rows and trigger reasons. Net-zero debit/credit balance does not by itself mean a duplicated journal. Multiple triggers must not count the same exposure repeatedly. Investigation needs purpose/authority/accounting/support and reviewed resolution; a flagged list is not a fraud conclusion. Related parties, estimates, supplied group evidence, specialists and contradictory evidence cross to G05 as owned technical cases.

## Current implementation and evidence

Owners: scripts/pilot-sampling.mjs, pilot-journals.mjs, pilot-area.mjs, pilot-area-checks.mjs, pilot-area-statutory.mjs and pilot-area-finance.mjs; definitions/types src/lib/pilot-area.ts and pilot-population.ts; UI pilot-area.tsx and population/sampling panels. Code index provides exact symbol locations/actions and hashes at 079f9da. Existing sample commands are documented in PILOT; area/journal command literals are indexed rather than proposed new endpoints.

Recorded tests/pilot.test.mjs exercises commercial six-area results and seven statutory/finance areas, with independent payroll review and source-change reopening. This is bounded fixture evidence. Every variant remains individually unaccepted; related scenario mapping does not demonstrate its complete source procedure set. A13 remains open as a connected lifecycle even though execution primitives exist.

## Failure, revision and preservation

Wrong dates/entity/currency, duplicate IDs, missing approved sources, unsupported rules/methods or stale programme prevent a current run. Keep the failure diagnostic and prior run. Changes to source evidence, population/mapping/period, parameters, programme or assignment stale affected run approval and workpaper. Preserve original selections, test results, case dispositions and reviewed history. A resolved finding cannot be deleted by changing a sample test to pass. An unanswered exception remains outstanding.

## E2E acceptance and build order

E2E-04-NORMAL binds an approved response through source rows, run/test, actual exception, independent review and one finding into G05. E2E-04-NEGATIVE covers malformed/missing/unsupported/unauthorized/self-review cases. E2E-04-CHANGE replaces one source after sign-off and proves targeted reopening with old bytes/results intact. E2E-04-PROJECTION adds supported denominator/test-completeness/signed-error and no-double-count proof after HB-D02 is approved. Each G10 variant adds its own five named scenarios, not generic credit from another area.

R15.1-5: FG-01, selected-unit execution, journal cases, expansion and A13. R16.1-6: inspect each variant's real source procedures, complete commercial/inventory/assets/statutory/finance/technical minimums and accept separately. R17 provides judgment/specialist support. R07/R08 preserve native fields, corrected types and explicit adoption; R23 tracks independent acceptance. Existing supported methods and old method IDs remain regressions. Wider MUS/confidence or advanced methods need separate authority unless an exact minimum already requires them.

<a id="source-map"></a>

## Source-map and glossary

P07/P09, A13 and relevant A15-A18, Stage 3 3.1.1-3.1.22/3.3.1, 22 variant rows, AUTO-009/011-047 and exact G11 cards. Горим: procedure. Гүйцэтгэл: actual execution. Хугацааны зааг: cut-off. Тооллого: physical count. Exception: a supported investigation item, not automatically a misstatement. Unsupported: method cannot evaluate the input; it is not a passing zero.

## Source case handoffs

These cards preserve the actual user goal and alternatives. The original detailed physical proposals, checks, fields, states and retry contracts are in action_contracts_source.csv/json. They are source design, not a claim that all AUD_* tables or endpoints exist. Requirement traceability retains each criterion and its own recorded evidence.

### P07-UC01 - Tailor and assign an applicable audit programme

Source: SRC02 / Registers/Use_Cases.csv / P07-UC01. Owning action P07-ACT01; source primary capacity R1; screen S11. Criteria: P07-UC01-AC01, P07-UC01-AC02, P07-UC01-AC03, P07-UC01-AC04.

The planning approach requires work on a significant audit area. The preparer starts from the approved programme and tailors it to the actual risks.

Source progression: Select the approved programme version and relevant audit area. -> Keep applicable procedures, add needed work and explain any permitted removal/N/A; retain risk/assertion links and planned nature/timing/extent. -> Assign or request the appropriate owner and review route and submit material tailoring for review.

Usable outcome: A current programme whose procedures address the actual area and risks.

Alternative/return path: A source programme can include conditional procedures and examples; their presence does not make every step mandatory for every client. New evidence may require additions and a retained explanation.

Source input/check boundary: Approved exact programme/area, risk/assertion context, proposed applicability/tailoring and named work owner/review route. Check actual area/risk/assertions, permitted omissions and programme/procedure snapshot. Template REQUIRED_FLAG is interpreted under the actual methodology, not every possible audit.

Current recorded case status: partial-evidence. Mapped observations: adoption preview preserves compatible table cells and pins explicit review of incompatible answers (tests/pilot-form-adoption.test.mjs); typed workpapers and one-form grants preserve published and reviewed versions (tests/pilot.test.mjs); the extended engagement preserves its original 34-register journey and scoped recoverable archive (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-04-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P07-UC02 - Prepare a population and propose the sample design

Source: SRC02 / Registers/Use_Cases.csv / P07-UC02. Owning action P07-ACT02; source primary capacity R1; screen S12. Criteria: P07-UC02-AC01, P07-UC02-AC02, P07-UC02-AC03, P07-UC02-AC04.

The team needs tests of details from a supplied transaction population. High-value or specifically selected items may need separate treatment from the residual sample.

Source progression: Identify the audit objective, population/unit, period and reconciled source version. -> Separate full-tested, excluded and residual groups without overlapping counts/amounts; explain the basis. -> Propose the supported selection method and sample size with the actual risk/error assumptions and submit the design before selection.

Usable outcome: An identifiable design and eligible population for review.

Alternative/return path: Targeted specific-item testing is not generalized to the untested remainder. Unsupported statistical, monetary-unit or stratified methods remain manual/external or future methods until separately specified.

Source input/check boundary: Audit objective/unit, exact reconciled source population, scope/exclusions/full-test/residual groups, eligible method/size/risk/error assumptions and rationale. Method/unit/objective must fit data and source uniqueness. Full test/specific selection/residual sample cannot double count. Unknown population size/error assumptions remain explicit.

Current recorded case status: partial-evidence. Mapped observations: selected materiality overrides bind source rows and reopen sampling and evaluation without losing signed history (tests/pilot-materiality.test.mjs); approved materiality and its revision govern the same sample and misstatement evaluation (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-04-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P07-UC03 - Review design, select units and evaluate sample results

Source: SRC02 / Registers/Use_Cases.csv / P07-UC03. Owning action P07-ACT03; source primary capacity R2; screen S12. Criteria: P07-UC03-AC01, P07-UC03-AC02, P07-UC03-AC03, P07-UC03-AC04, P07-UC03-AC05.

The senior reviews the proposed sample, the selected items and the errors recorded after testing.

Source progression: Review the objective/population/method/size rationale and approve or return the exact design. -> Run or oversee the supported selection, retaining stable ordered IDs, algorithm/version and seed; review actual tested/unavailable/alternative outcomes. -> Investigate errors and project only under the approved eligible method; assess sampling risk, qualitative patterns and the need for further work.

Usable outcome: A reproducible selection and a supported result evaluation with remaining limitations.

Alternative/return path: Changing a source population creates a separate selection; it does not rewrite tested units. A systematic error pattern may require changed work rather than blind projection.

Source input/check boundary: Exact design/population, authorized design decision, stable ordered eligible source keys, algorithm/version/seed, actual test results and approved projection/evaluation assumptions. Selected source keys must be unique at declared unit; approved method and exact residual population govern projection. Specific items do not generalize; nonstatistical sampling is not automatically exempt from projection.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-04-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P09-UC01 - Perform tests of controls and reconsider reliance

Source: SRC02 / Registers/Use_Cases.csv / P09-UC01. Owning action P09-ACT01; source primary capacity R1; screen S15. Criteria: P09-UC01-AC01, P09-UC01-AC02, P09-UC01-AC03, P09-UC01-AC04.

The plan relies on a control, or substantive procedures alone cannot provide sufficient evidence. The auditor tests actual control instances and records deviations.

Source progression: Identify the exact control/objective, period, intended reliance and selected instances. -> Record the work performed, evidence and actual outcome for each instance, including unavailable items and alternatives. -> Investigate deviations and prepare a conclusion on operating effectiveness and the effect on the planned audit response.

Usable outcome: A result distinguishing control design, implementation and operating effectiveness.

Alternative/return path: A walkthrough supports relevant design/implementation understanding but does not by itself prove period-long operation. Failure may require changed reliance and more substantive work rather than merely marking the test complete.

Source input/check boundary: Exact control/objective, intended period/reliance, selected instances, actual operation/evidence and deviation investigation. Selected instances must cover the relevant control frequency/period under the supported method. Do not overwrite DESIGN_RESULT_CODE or IMPLEMENTATION_RESULT_CODE with operating-effectiveness results.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-04-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P09-UC02 - Perform tests of details on the selected audit area

Source: SRC02 / Registers/Use_Cases.csv / P09-UC02. Owning action P09-ACT02; source primary capacity R1; screen S15. Criteria: P09-UC02-AC01, P09-UC02-AC02, P09-UC02-AC03, P09-UC02-AC04, P09-UC02-AC05.

A preparer tests selected balances or transactions from a source-supported asset, revenue, purchase, payroll or other programme.

Source progression: Open the applicable procedure, assertion and exact population/selection version. -> Inspect the selected support and record actual work, recorded/expected values where relevant, result, exceptions and limitations. -> Link confirmed consequences to the relevant matter and submit the area work with a supported conclusion.

Usable outcome: A reviewer can see what was tested, why, with what evidence and result.

Alternative/return path: A source programme’s example count or amount is not a universal sample-size rule. Specific-item work remains limited to selected items unless a valid wider inference basis exists.

Source input/check boundary: Applicable area/procedure/assertions, exact population/selection and selected support; actual work, expected/recorded/audited values and exceptions. Do not infer no misstatement from a received file. Criteria, amount sign/currency, source-unit identity and exact support must agree. Unperformed items cannot be marked clear.

Current recorded case status: partial-evidence. Mapped observations: commercial fieldwork reconciles revenue, receipts, purchases and bank evidence with independent case review (tests/pilot.test.mjs); approved payroll, tax and financing editions calculate exact outputs and reject unsupported inputs (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-04-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P09-UC03 - Perform a substantive analytical procedure

Source: SRC02 / Registers/Use_Cases.csv / P09-UC03. Owning action P09-ACT03; source primary capacity R1; screen S15. Criteria: P09-UC03-AC01, P09-UC03-AC02, P09-UC03-AC03, P09-UC03-AC04.

The auditor plans to use a relationship or expectation as substantive evidence for an area. A simple prior-year comparison alone is not enough.

Source progression: Record the procedure’s suitability, reliable data, auditor-approved expectation, precision and investigation boundary. -> Run the supported calculation and investigate the actual difference using corroborating work. -> Record the supported conclusion and residual unexplained differences or additional procedures.

Usable outcome: A substantive analytical result with an explicit evidence basis.

Alternative/return path: Missing drivers or incomparable periods make the chosen model unusable or limited. The auditor can decide a different procedure is needed rather than forcing a clean analytic.

Source input/check boundary: Selected analytical objective, exact comparable data, reliable-data basis, human expectation, precision, investigation threshold and corroboration. Check suitability, data reliability, sufficiently precise expectation and approved investigation boundary before interpreting output. Null/unit/currency/denominator defects must not produce a favorable pass.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-04-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P09-UC04 - Investigate journal-entry and management-override selections

Source: SRC02 / Registers/Use_Cases.csv / P09-UC04. Owning action P09-ACT04; source primary capacity R1; screen S15. Criteria: P09-UC04-AC01, P09-UC04-AC02, P09-UC04-AC03, P09-UC04-AC04.

Approved filters or auditor selection identify unusual journal entries. The preparer investigates them instead of treating a flag as fraud.

Source progression: Confirm the selected ledger population and criteria, including any entries or adjustments outside the ordinary ledger where relevant. -> Inspect complete selected journals, their supporting documents, purpose, authorization and accounting treatment. -> Document the human result and any risk, misstatement or further-work consequence, preserving contrary evidence.

Usable outcome: An investigated journal case linked to actual source lines and audit results.

Alternative/return path: Unavailable user/time fields prevent the corresponding filter; they are not invented. No detected exceptions from a bounded filter does not establish absence of override or fraud.

Source input/check boundary: Exact complete selected ledger/journal population, selection criteria/entire journal identity and actual supporting purpose/authority/accounting work. Verify journal key/line grain, complete selected journal and coverage of relevant nonordinary entries/adjustments. Do not let filters silently exclude applicable override work.

Current recorded case status: partial-evidence. Mapped observations: approved data feeds the same scoped analytics, multipart confirmation and sampled source rows (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-04-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P09-UC05 - Record inventory attendance and reconcile the observed count

Source: SRC02 / Registers/Use_Cases.csv / P09-UC05. Owning action P09-ACT05; source primary capacity R1; screen S15. Criteria: P09-UC05-AC01, P09-UC05-AC02, P09-UC05-AC03, P09-UC05-AC04.

The auditor attends a material inventory count and performs test counts. The register and physical count differ on some items.

Source progression: Record the location/date, observed instructions and procedures, inspection and selected test counts in both relevant directions. -> Reconcile selected count records to the final inventory records and investigate differences, including intervening movements if dates differ. -> Document the conclusion, unobserved scope and any necessary alternatives or report-impact matter.

Usable outcome: Actual attendance/count evidence with a justified conclusion and limitations.

Alternative/return path: Where attendance is impracticable or unexpectedly prevented, record the applicable alternative work and its adequacy. Material third-party inventory requires the appropriate confirmation/inspection work in the circumstances.

Source input/check boundary: Actual location/count date/attendance, instructions and observation, both-direction selected count units, final records and intervening movement support. Count quantities/units/item/location/date and direction must be comparable. Reconciliation alone cannot fabricate physical attendance or cover inaccessible stock.

Current recorded case status: partial-evidence. Mapped observations: commercial fieldwork reconciles revenue, receipts, purchases and bank evidence with independent case review (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-04-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P09-UC06 - Evaluate an accounting estimate and its assumptions

Source: SRC02 / Registers/Use_Cases.csv / P09-UC06. Owning action P09-ACT06; source primary capacity R1; screen S15. Criteria: P09-UC06-AC01, P09-UC06-AC02, P09-UC06-AC03, P09-UC06-AC04.

Management supplies an allowance, impairment or other estimate. Recalculation can check arithmetic, but the method, assumptions, data and disclosures need professional work.

Source progression: Record the estimate, uncertainty, method/model, significant assumptions, data and relevant risk assessment. -> Perform the selected supported approach: subsequent outcomes, testing management’s process, or an auditor point/range; evaluate contrary evidence and bias indicators. -> Document the reasonableness/misstatement conclusion, disclosures, specialist contribution where relevant and required review.

Usable outcome: An estimate conclusion supported by actual challenge and evidence.

Alternative/return path: A prior estimate/outcome difference is reviewed without inappropriate hindsight. Unsupported complex models remain explicit manual/specialist work rather than a claimed automated calculation.

Source input/check boundary: Exact estimate/FS item, method/model/data/significant assumptions, uncertainty/risk, selected audit approach and contrary evidence/bias indicators. FS scope, method/data/as-of assumptions and currency must agree. Numeric sensitivity/model output does not establish reasonableness, absence of bias or compliant disclosure.

Current recorded case status: partial-evidence. Mapped observations: technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-04-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P09-UC07 - Perform subsequent-event work through the relevant date

Source: SRC02 / Registers/Use_Cases.csv / P09-UC07. Owning action P09-ACT07; source primary capacity R1; screen S15. Criteria: P09-UC07-AC01, P09-UC07-AC02, P09-UC07-AC03, P09-UC07-AC04.

Before reporting, the preparer updates inquiries, minutes and other selected reviews for events after the financial-statement date.

Source progression: Record the applicable source-review/inquiry list and the actual coverage end, performer and evidence. -> Register identified events with occurrence/discovery dates, facts and proposed accounting/disclosure treatment. -> Update the work when the intended report date changes and submit unresolved event matters for review.

Usable outcome: Documented coverage and proposed dispositions for identified events, submitted for review.

Alternative/return path: Later-discovered facts before or after third-party issuance follow the separate applicable response in P10. Transaction screening supports this work but cannot establish that every event has been identified.

Source input/check boundary: Actual inquiry/source-review list and coverage end, performer/evidence, identified event occurrence/discovery, accounting/disclosure evaluation and intended report date. Report date is not automatically the performed coverage date. Check relevant statements/authorization/report chronology and actual new-source work.

Current recorded case status: partial-evidence. Mapped observations: technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-04-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P09-UC08 - Assess going concern and challenge management’s plans

Source: SRC02 / Registers/Use_Cases.csv / P09-UC08. Owning action P09-ACT08; source primary capacity R1; screen S15. Criteria: P09-UC08-AC01, P09-UC08-AC02, P09-UC08-AC03, P09-UC08-AC04.

Indicators raise a question about the client’s ability to continue operating. Management provides an assessment and mitigating plans.

Source progression: Record the assessment, exact horizon/date basis, identified conditions and supplied forecasts/plans. -> Evaluate relevant data, assumptions, feasibility and supporting evidence; document contrary evidence and further work. -> Prepare the conclusion on basis/uncertainty/disclosures and pass the reporting implications for partner decision.

Usable outcome: A supported going-concern assessment, separate from financial indicators.

Alternative/return path: The applicable edition determines the horizon; do not import a future approval-date rule into an earlier engagement. Management refusal to make/extend an assessment requires an explicit audit/report implication.

Source input/check boundary: Actual management assessment and horizon/basis, conditions/forecasts/plans, reliable inputs, auditor challenges and disclosure/reporting implications. Check applicable edition/horizon and management information received. Negative ratios do not automatically establish a material uncertainty; optimism alone does not resolve one.

Current recorded case status: unverified. No direct case-closing fixture is recorded; related implementation may exist. Whole-case independent acceptance remains open. Follow E2E-04-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P09-UC09 - Evaluate legal matters, minutes and related-party work

Source: SRC02 / Registers/Use_Cases.csv / P09-UC09. Owning action P09-ACT09; source primary capacity R1; screen S15. Criteria: P09-UC09-AC01, P09-UC09-AC02, P09-UC09-AC03, P09-UC09-AC04.

Minutes, inquiries or confirmation information identify a legal claim or a transaction with a possible related party. The preparer documents the matter and responsive work.

Source progression: Register the actual matter/relationship/transaction and its source, including unknown exposure where applicable. -> Perform the selected inquiry, inspection, direct counsel communication or transaction testing and record reliability and missing evidence. -> Evaluate the accounting/disclosure implications with appropriate review and communicate newly relevant information to the team.

Usable outcome: Separate supported matters and decisions that can feed final evaluation.

Alternative/return path: A shared bank/registration identifier is a candidate link, not proof of control or fraud. Counsel refusal/prohibition and management refusal need their actual alternative-work and reporting assessment.

Source input/check boundary: Actual separate legal/related-party/minute matter and source, relevant parties/transactions, unknown exposure where appropriate and actual inquiries/inspection/counsel/testing. Classify actual matter and use appropriate professional treatment. A related party/contact change is not an automatic fraud investigation or registry lookup.

Current recorded case status: partial-evidence. Mapped observations: technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-04-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P09-UC10 - Evaluate conditional group/component work

Source: SRC02 / Registers/Use_Cases.csv / P09-UC10. Owning action P09-ACT10; source primary capacity R2; screen S15. Criteria: P09-UC10-AC01, P09-UC10-AC02, P09-UC10-AC03, P09-UC10-AC04.

Where the engagement is a group audit, the responsible auditor needs clear work instructions and an evaluation of the actual component work.

Source progression: Identify the component boundary, relevant risks, instructions, materiality/communication basis and responsible contributor. -> Obtain and review the requested work and communications, evaluate ethics/competence and the necessary involvement under the applicable edition. -> Request additional work or record the limitation and its effect on the group conclusion.

Usable outcome: Usable component work with retained group-auditor responsibility.

Alternative/return path: A component need not be a separate legal client. Under ISA 600 (Revised), a component auditor is part of the engagement team; this does not grant unrestricted platform access. An external non-accounting expert is a different arrangement.

Source input/check boundary: Applicable group/component boundary, exact instructions/financial information/risk/materiality, actual contributor work/communications and group involvement/adequacy evaluation. Group scope applies only where actual mandate/data require it; component boundary and access are explicit. Verify applicable ISA600 edition and competence/ethics/involvement separately.

Current recorded case status: partial-evidence. Mapped observations: technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-04-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

### P09-UC11 - Review the area conclusion and direct additional work

Source: SRC02 / Registers/Use_Cases.csv / P09-UC11. Owning action P09-ACT11; source primary capacity R2; screen S15. Criteria: P09-UC11-AC01, P09-UC11-AC02, P09-UC11-AC03, P09-UC11-AC04.

The preparer submits an area with completed tests, an unavailable selected item and a proposed conclusion.

Source progression: Read the objective, risk/assertion coverage, actual results, evidence and exceptions. -> Return unsupported conclusions or specify appropriate further work; inspect the revised response. -> Record the reviewed extent and remaining limitations for completion/partner review.

Usable outcome: A transparent area handoff with supported conclusions and named outstanding matters.

Alternative/return path: A procedure can be performed with exceptions, but this does not mean its area conclusion is cleared. A significant unresolved limitation goes to the partner’s evidence/opinion decision.

Source input/check boundary: Exact area/procedure/selection/results/evidence/conclusion and actual assigned review extent. Apply conjunctive review eligibility. Check actual work/evidence and unresolved matters; completion counts or clean machine results cannot replace the stated professional review.

Current recorded case status: partial-evidence. Mapped observations: commercial fieldwork reconciles revenue, receipts, purchases and bank evidence with independent case review (tests/pilot.test.mjs); approved payroll, tax and financing editions calculate exact outputs and reject unsupported inputs (tests/pilot.test.mjs). Whole-case independent acceptance remains open. Follow E2E-04-NORMAL/NEGATIVE/CHANGE and the exact criteria; record unsupported/missing behavior instead of granting blanket credit.

## Automation handoff index

G11 contains complete minimum inputs/methods/human limits and independent specification examples; the current source verifier is a separate evidence class.

| ID | Minimum outcome |
| --- | --- |
| AUTO-009 | Run a small set of explainable risk filters over a complete journal population and investigate the resulting entries in one case list. |
| AUTO-011 | Establish that the uploaded sales register agrees with ledger revenue and does not contain missing identifiers or exact duplicate invoices. |
| AUTO-012 | Identify sales whose invoice, delivery or posting dates indicate possible recording in the wrong period and credits linked to year-end sales. |
| AUTO-013 | Recalculate invoice aging at the reporting date and show which balances are supported by explicitly referenced subsequent receipts. |
| AUTO-014 | Identify invoice lines whose recorded amount, price or discount differs from approved commercial terms supplied for testing. |
| AUTO-015 | Recalculate a straight-line time-based revenue schedule from approved contract dates and compare it with recorded period revenue. |
| AUTO-016 | Reconcile the purchase register to ledger expense or payable movements and identify exact duplicate supplier invoices or payments. |
| AUTO-017 | Surface counterparties that share exact or normalized identifiers and show the transactions exposed to those relationships. |
| AUTO-018 | Show whether each selected purchase can be traced through purchase order, receipt, invoice and payment records using stable source identifiers. |
| AUTO-019 | Identify pre-period receipts or services and post-period invoices or payments that may indicate an omitted or late-recorded year-end liability. |
| AUTO-020 | Match structured bank-statement lines to cash-ledger entries and recalculate the arithmetic of a supplied period-end bank reconciliation. |
| AUTO-021 | Identify large, round or period-end cash transactions and exact inter-account transfer pairs for targeted audit investigation. |
| AUTO-022 | Confirm that inventory quantities and values roll forward by item and that the closing register agrees with the corresponding ledger balance. |
| AUTO-023 | Compare signed count quantities with the inventory register and show every unresolved difference for the counted items and locations. |
| AUTO-024 | Identify receipts, dispatches and internal transfers around year-end whose logistics and accounting dates are inconsistent with the selected cut-off rules. |
| AUTO-025 | Recalculate inventory issue cost and closing value under a supported periodic weighted-average method and compare them with recorded inventory and cost of sales. |
| AUTO-026 | Identify slow or non-moving items and items whose recorded cost exceeds an auditor-supplied net realizable value input. |
| AUTO-027 | Recalculate cost and accumulated depreciation or amortization roll-forwards and reconcile closing register balances with the ledger by asset class. |
| AUTO-028 | Recalculate straight-line depreciation or finite-life amortization for each asset and compare the expected period charge and closing accumulation with recorded amounts. |
| AUTO-029 | Flag asset-register conditions that conflict with recorded status or approved useful-life and rate ranges. |
| AUTO-030 | Select tangible or intangible additions and expense transactions whose amount or supplied category conflicts with the approved capitalization policy. |
| AUTO-031 | Reconcile payroll totals with ledger and bank disbursements and identify invalid or exact duplicate employee-payment records. |
| AUTO-032 | Recalculate standard employee gross-to-net pay using an auditor-approved effective tax and social-insurance parameter set. |
| AUTO-033 | Identify employee-level pay changes and off-cycle payments that exceed auditor-approved amount, percentage or timing criteria. |
| AUTO-034 | Reconcile uploaded VAT or withholding registers to ledger liabilities and filed returns and recalculate structured tax amounts using approved rates. |
| AUTO-035 | Reperform the arithmetic of approved current and deferred tax schedules and reconcile their recorded amounts to ledger, return and payment evidence. |
| AUTO-036 | Reconcile each borrowing facility's principal movement, recalculate contractual interest and show headroom under an auditor-approved covenant formula. |
| AUTO-037 | Recalculate a fixed-payment lease liability and straight-line right-of-use asset schedule and compare both with recorded ledger balances. |
| AUTO-038 | Recalculate recorded functional-currency amounts using an approved exchange-rate table and retranslate closing monetary balances at the approved period-end rate. |
| AUTO-039 | Reconcile the movement in each equity component and show whether contributions, share changes and dividends have linked authorization evidence. |
| AUTO-040 | Roll investment units and cost, reconcile positions and income with custodian and ledger records, and test simple yield inputs without concluding fair value. |
| AUTO-041 | Match the declared related-party register to transaction counterparties and reconcile known related-party balances and transactions with draft disclosures. |
| AUTO-042 | Recalculate a selected structured estimate schedule and identify differences or assumption changes that require auditor evaluation. |
| AUTO-043 | Reconcile approved component trial balances to consolidation inputs, sum mapped balances and identify unmatched exact intercompany balances and elimination residuals. |
| AUTO-047 | Draw a reproducible simple random sample from a reconciled population and evaluate recorded monetary errors under one approved projection method. |


## Pinned code and external reference locators

All following code locators refer to the local 079f9da snapshot. File hashes and the complete symbol/action index are in code_observation_index.csv/json. The remote main/PR do not contain all of these local additions.

- scripts/pilot-sampling.mjs: inputs at line 14; samplingView at line 41; samplingGap at line 48; syncSamplePapers at line 60; samplingAction at line 73. SHA-256 ac5433ff040d27517919898f20dd05258e14a1c67067eadb9bc1f1ed12b5d64a.
- scripts/pilot-journals.mjs: basis at line 14; journalGap at line 33; syncJournalPapers at line 40; selectJournals at line 53; journalAction at line 77. SHA-256 8f4b8a5fd279fb23222e56886f9cfdfb8e92dc779e8791fa737bcd764e91731b.
- scripts/pilot-area.mjs: liveEvidence at line 22; current at line 26; resolved at line 33; areaGap at line 38; syncAreaPapers at line 45. SHA-256 d3a4cdfa6625bd0fca58b085e58891eb4f80ce48a3528dae1673fd2ffa4dede1.
- scripts/pilot-area-checks.mjs: grouped at line 23; parseAreaFile at line 32; caseBook at line 73; add at line 75; qualified at line 92. SHA-256 45011285458d8f4a8e447deddf9175159ec79e28d9e82cebe582800d0f53084f.
- scripts/pilot-area-statutory.mjs: selectEdition at line 13; ruleAt at line 19; referenceGroups at line 25; flagUnmatched at line 30; payrollAnalytics at line 36. SHA-256 6db65427f6677e6582b6c783f5f59bc9a09a838c49ad97c10860c950b66ba9b1.
- scripts/pilot-area-finance.mjs: versioned at line 18; ledgerGroups at line 24; extras at line 31; caseFor at line 36; checkedPv at line 42. SHA-256 bfcf57b2e0004872ec5016564b8c45fbc67db32c8d9eaad088842e00b3d7c8f4.

External reference pointers support the specific edition/applicability discussion, not whole-standard compliance. Fresh inspection limits, publication/effective dates and the retained original paragraph register are in external_research.csv and standards_source_edition.csv.

- [EXT02 - IAASB, Handbook Volume 1](https://ifacweb.blob.core.windows.net/publicfiles/2025-09/IAASB-2025-Handbook-Volume-1.pdf): 2025; ISA 530 paras 6-15; PDF p416 (1-based). Selected text inspected; sample ratio method is proposed, not a prescribed ISA formula. Accessed 16 November 2026.
- [EXT09 - IFRS Foundation / IASB, IAS 2 Inventories](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/): Public About/history page; About; NRV description; not licensed paragraph text. Public overview only; no inaccessible clause quoted. Accessed 16 November 2026.
- [EXT10 - IFRS Foundation / IASB, IAS 16 Property, Plant and Equipment](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/): Public About/history page; About: recognition and cost principles. Public overview; no full standard paragraph claim. Accessed 16 November 2026.

Detailed typed wire schemas for all 35 declared area input kinds are in current_area_typed_schemas.csv/json. Each field keeps its date/text/decimal/integer/basis-point representation and declared units; parser sign/enum guards remain authoritative in the pinned code.
