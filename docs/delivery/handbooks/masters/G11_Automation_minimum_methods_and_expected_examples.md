# Automation minimum methods and expected examples

Guide G11 | Version 1.0 | 16 November 2026

Code baseline: local 079f9da47a02eab681feeeda3de3dfb8cfc42848, redesign/enterprise-workspace. Source edition: October 26 original archive and registered November 11 repaired-workbook inventory, with November 16 current-file observations separately recorded. Local newer additions are not merged into GitHub main. Independent source acceptance remains open.

## How to use the minimum-method cards

The 58 source minimums were retained in the development plan. Their 58 later extensions remain pending scope. This annex retains minimum purpose, input schema/units as declared, proposed source algorithm, output, human responsibility, unsupported boundary and an independently asserted original specification example. It does not relabel those examples as current app tests. Current recorded status/observations are a separate field; neither partial mappings nor similar method names prove whole-card implementation.

Shared execution: choose the accepted source/version and approved method/profile; validate entity/period/units, distinguish null from zero and quarantine unsupported rows; retain definition/run/input/mapping/parameter versions and lineage; record source-linked results, exceptions and actual human disposition; independently review; rerun as a new version after changed inputs. Keep prior outputs/reviews and external-effect attempts. The same underlying event contributes exposure once even when multiple rules flag it. G00 owns the common contract, and the named domain guide owns its real workflow.

<a id="source-map"></a>

## Source-map

Grounded Editable/04_Automation_Methods.md, Registers/Automation_Coverage.csv and Automation_Verified_Examples.csv; source F00010 English baseline/F00011 Mongolian matching cards and F00009/F00012 wider catalogues, with exact per-card pages below. Examples are the historical source author's independent specification assertions, not fresh application executions. Original later-extension wording remains in automation_methods.csv/json and requirement_traceability; none is silently promoted to core.

## AUTO-001 - Evidence coverage monitoring

Source: F00010 p.2, card 1; F00011 matching card 1; F00009/F00012 catalogue entry 1. Workflow owner G03; cases P08-UC01, P08-UC04.

Minimum outcome: Show whether every approved evidence request has an accepted item for the intended entity and reporting period.

Inputs/schema: Required: request identifier, evidence type, entity, reporting period, linked evidence identifier and acceptance status. Optional: alternative-evidence rationale.

Proposed source method: 1. For each approved request r, join only explicit in-scope evidence links. A link must match entity/period and approved intended use. 2. Classify covered, missing, rejected-only or approved alternative. Current minimum does not union partial coverage intervals. 3. Retain contributing request/evidence/alternative IDs and unresolved counts 4.  coverage is not an evidence-sufficiency opinion.

Output: A coverage register with received, missing, rejected-only and alternative-evidence items, plus unresolved counts.

Human decision/review: Define the required evidence, accept or reject submitted items, assess sufficiency and approve any alternative source.

Unsupported/limit: The baseline does not inspect document contents, combine partial date intervals or conclude that accepted evidence is sufficient and appropriate.

Independent specification example EX-001: Q1-Q3 approved for A/2026. E1 accepted/Q1/A/2026; E2 accepted/Q2/A/2025; E3 rejected/Q3/A/2026.

Method: Explicit request links; require exact entity/period and accepted status.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"covered": 1, "missing": 1, "rejected_only": 1} | {"covered": 1, "missing": 1, "rejected_only": 1}; PASS - independent example assertion |
| Limit / edge case | Accepted receipt does not establish evidence sufficiency. Wrong-period E2 cannot cover Q2. |

Current recorded status: partial-evidence. Bounded application observation: approved data feeds the same scoped analytics, multipart confirmation and sampled source rows (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R14 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-002 - Dataset conformance and scope validation

Source: F00010 p.2, card 2; F00011 matching card 2; F00009/F00012 catalogue entry 2. Workflow owner G03; cases P05-UC01, P05-UC02, P05-UC03.

Minimum outcome: Determine whether an uploaded structured dataset has the required structure and belongs to the selected engagement scope.

Inputs/schema: Required: source dataset, approved import profile, column mapping, engagement entity and reporting dates. Optional: currency, sign and evidence-role rules.

Proposed source method: 1. Validate mapped required columns, declared datatypes/null rules/allowed values, including finite numeric values for monetary quantities without changing invalid values to zero. 2. Compare declared entity/row dates with selected engagement and evidence role. Classify out-of-scope rows explicitly. 3. Keep accepted/quarantined rows with original row IDs. Schema validity does not prove source completeness or economic validity.

Output: A field-level defect register, accepted and quarantined row counts, and a visible scope exception list.

Human decision/review: Select or approve the import profile, map source columns, confirm entity and period, and resolve or accept data defects.

Unsupported/limit: The baseline does not prove source completeness, reconcile control totals, infer ambiguous formats or validate whether transactions are economically valid.

Independent specification example EX-002: r1:A,100; r2:B,20; r3:A,bad; r4:A,NaN; r5:A,Infinity. Profile: entity A; required finite decimal amount.

Method: Validate entity and finite numeric type without coercing invalid text to zero.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"accepted": 1, "quarantined": 4} | {"accepted": 1, "quarantined": 4}; PASS - independent example assertion |
| Limit / edge case | Valid structure does not prove completeness or economic validity. Invalid numeric text remains a defect. |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R13 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-003 - Population integrity and import reconciliation

Source: F00010 p.3, card 3; F00011 matching card 3; F00009/F00012 catalogue entry 3. Workflow owner G03; cases P05-UC01, P05-UC02, P05-UC03.

Minimum outcome: Demonstrate that a structured population reached the audit workspace without unexplained loss, duplication or total-value change.

Inputs/schema: Required: imported rows, source record count, available independent control totals and declared unique key. Optional: documented exclusion reasons.

Proposed source method: 1. count_residual = certified_source_count - accepted_count - quarantined_count - documented_excluded_count, under a disjoint bridge. 2. amount_residual = certified_source_total - bridged_total, separately by entity/currency and debit/credit where relevant. 3. Group missing/repeated declared keys and exact duplicate row payloads 4.  preserve rows rather than deleting suspected duplicates.

Output: A source-to-import bridge, unexplained residuals, missing-key cases and exact duplicate groups with affected values.

Human decision/review: Obtain or certify source controls, define the business key, explain exclusions and decide whether unresolved differences limit reliance.

Unsupported/limit: The baseline covers one source-to-import stage. It does not reconstruct complex joins, prove controls generated by the same file are independent or perform fuzzy duplicate detection.

Independent specification example EX-003: Source count10/amount1000; accepted8/800; quarantine1/100; approved excluded1/100.

Method: Source - accepted - quarantine - excluded, independently for count and amount.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"count_residual": 0, "amount_residual": 0} | {"count_residual": 0, "amount_residual": 0}; PASS - independent example assertion |
| Limit / edge case | A balanced import can still originate from an incomplete source extract.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R13 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-004 - Master-data and identifier consistency

Source: F00010 p.3, card 4; F00011 matching card 4; F00009/F00012 catalogue entry 4. Workflow owner G03; cases P05-UC01, P05-UC02, P05-UC03.

Minimum outcome: Identify transactions whose account, customer, supplier, employee, item or currency identifier cannot be resolved unambiguously to the supplied master data.

Inputs/schema: Required: transaction identifier, master identifier and authoritative master table. Required for historical matching: transaction date and master validity dates.

Proposed source method: 1. Left-match each transaction ID to the approved master and optional effective-date interval. 2. Classify match_count = 0 as unmatched and match_count > 1 as ambiguous. Retain inactive historical master rows valid on transaction date. 3. Aggregate affected counts and gross exposure by master family. Do not choose by similar names or current active status alone.

Output: An unmatched and ambiguous transaction list with candidate master records and affected exposure.

Human decision/review: Select the authoritative master, approve aliases or crosswalks, investigate ambiguous records and determine the audit effect of weak master data.

Unsupported/limit: The baseline does not infer identity from free-text names, consult external registries or automatically choose among conflicting master records.

Independent specification example EX-004: Transaction master keys A,B,C. Master keys A,B,B.

Method: Count exact matches per source key before joining.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"unique": 1, "ambiguous": 1, "unmatched": 1} | {"unique": 1, "ambiguous": 1, "unmatched": 1}; PASS - independent example assertion |
| Limit / edge case | Ambiguous B is not joined twice or silently resolved by name.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R13 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-005 - Ledger and trial-balance integrity

Source: F00010 p.4, card 5; F00011 matching card 5; F00009/F00012 catalogue entry 5. Workflow owner G03; cases P05-UC01, P05-UC02, P05-UC03.

Minimum outcome: Confirm that the trial balance rolls forward correctly, balances under the declared sign convention and agrees with detailed ledger movements.

Inputs/schema: Required: trial-balance account, opening, debit, credit and closing fields; detailed ledger account, posting date and debit-credit amounts when ledger reconciliation is run.

Proposed source method: 1. Under debit-positive convention, calculated_closing = opening + debits - credits 2.  compare recorded closing using approved tolerance. 3. Aggregate in-period ledger debit and credit separately and compare with trial-balance movements, retaining unmatched accounts. 4. Check declared complete-ledger balance and account residuals 5.  a selected-account extract cannot substantiate whole-ledger balance.

Output: Entity and account-level debit, credit, opening, closing and roll-forward residuals with ledger-row links.

Human decision/review: Map fields, confirm the sign convention, period and population completeness, set rounding tolerance and investigate differences.

Unsupported/limit: The baseline does not translate currencies, infer opening-only journals, handle consolidation adjustments or claim that a selected-account extract represents a complete ledger.

Independent specification example EX-005: Opening100; debit30; credit20; recorded closing111. Debit-positive convention.

Method: Expected closing = opening + debit - credit; difference = expected - recorded.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"expected": 110, "difference": -1} | {"expected": 110, "difference": -1}; PASS - independent example assertion |
| Limit / edge case | Sign convention and grain must be selected; a residual is not automatically an error.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R13 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-006 - Account mapping and financial-statement bridge

Source: F00010 p.4, card 6; F00011 matching card 6; F00009/F00012 catalogue entry 6. Workflow owner G03; cases P05-UC01, P05-UC02, P05-UC03.

Minimum outcome: Trace every in-scope closing balance through an approved account mapping to the corresponding financial-statement line.

Inputs/schema: Required: final trial balance, account-to-line mapping, presentation sign, financial-statement line values and displayed unit.

Proposed source method: 1. Require exactly one approved primary statement destination for each in-scope account under the current minimum. 2. expected_line = sum(account_closing * presentation_sign) after conversion into the same display unit/currency. 3. line_residual = expected_line - recorded_statement_line. Keep unmapped/multi-mapped accounts 4.  split allocations are an extension, not this minimum.

Output: A mapping exception list and line-by-line trial-balance-to-financial-statements bridge.

Human decision/review: Own and approve the mapping, resolve unusual signs and determine whether non-ledger schedules or adjustments are appropriate.

Unsupported/limit: The baseline does not support split allocations, effective-dated mapping changes, non-ledger schedules or automatically extract figures from unstructured statements.

Independent specification example EX-006: Mapped balances100 and50; reported FS element149; same currency/period.

Method: Sum included mapped balances once; compare to reported element.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"mapped": 150, "difference": 1} | {"mapped": 150, "difference": 1}; PASS - independent example assertion |
| Limit / edge case | Split mappings need explicit weights/rules; no unapproved double counting.  |

Current recorded status: partial-evidence. Bounded application observation: approved data feeds the same scoped analytics, multipart confirmation and sampled source rows (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R13 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-007 - Financial-statement technical and comparative review

Source: F00010 p.5, card 7; F00011 matching card 7; F00009/F00012 catalogue entry 7. Workflow owner G03; cases P05-UC01, P05-UC02, P05-UC03.

Minimum outcome: Identify mathematical, reference and repeated-value inconsistencies in a controlled financial-statement and notes package.

Inputs/schema: Required: one controlled statement version containing structured nodes, amounts, periods, units, formulas and exact references. Optional: approved rounding schedule.

Proposed source method: 1. For each declared total node, calculate sum(signed_operand_amounts) using the selected statement version and rounding profile. 2. Check declared note references resolve and repeated-value links agree after approved sign/unit conversion. 3. Compare explicitly tagged comparative nodes under the selected comparative basis 4.  semantic disclosure completeness remains auditor work.

Output: A cross-footing, cross-reference, repeated-value and comparative exception report linked to statement nodes.

Human decision/review: Provide or approve the statement structure, formulas, repeated-value links and comparative basis, then resolve presentation and disclosure implications.

Unsupported/limit: The baseline does not infer equivalent disclosures from similar wording, determine disclosure completeness or assess whether accounting classifications are substantively correct.

Independent specification example EX-007: Statement components100,200; displayed total299. One required note reference absent.

Method: Recompute total separately from declared reference-presence check.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"expected_total": 300, "total_difference": 1, "missing_references": 1} | {"expected_total": 300, "total_difference": 1, "missing_references": 1}; PASS - independent example assertion |
| Limit / edge case | Presence and arithmetic do not prove disclosure compliance.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R13 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-008 - Opening-balance reconciliation

Source: F00010 p.5, card 8; F00011 matching card 8; F00009/F00012 catalogue entry 8. Workflow owner G03; cases P05-UC01, P05-UC02, P05-UC03.

Minimum outcome: Show whether each current-period opening balance agrees with the corresponding prior audited closing balance after approved opening adjustments.

Inputs/schema: Required: prior audited closing trial balance, current opening trial balance, common account identifier or approved crosswalk, entity and currency.

Proposed source method: 1. Exact-match prior audited closing and current opening accounts through an approved crosswalk. 2. opening_residual = current_opening - prior_closing - linked_approved_opening_adjustments, in common units/currency. 3. Retain unmatched accounts and unexplained residuals. Complex foreign-currency/business-combination adjustments need a separate supported bridge.

Output: An opening-balance bridge containing matched balances, approved adjustments, unmatched accounts and unexplained residuals.

Human decision/review: Select the authoritative prior audited balance, approve account crosswalks and opening adjustments, and determine follow-up for unresolved differences.

Unsupported/limit: The baseline does not evaluate comparative disclosures, automatically carry forward prior findings or resolve foreign-currency and business-combination adjustments.

Independent specification example EX-008: Prior closing100; approved opening adjustment10; current opening111.

Method: Current opening - prior closing - approved opening adjustment.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"unexplained": 1} | {"unexplained": 1}; PASS - independent example assertion |
| Limit / edge case | A posted difference is not automatically a prior-period misstatement.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R13 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-009 - Journal-entry analysis workspace

Source: F00010 p.6, card 9; F00011 matching card 9; F00009/F00012 catalogue entry 9. Workflow owner G04; cases P09-UC04, P09-UC11.

Minimum outcome: Run a small set of explainable risk filters over a complete journal population and investigate the resulting entries in one case list.

Inputs/schema: Required: journal and line identifiers, entity, effective date, account, debit-credit or signed functional amount, reporting dates and selected rule parameters.

Proposed source method: 1. Build an exact whole-journal fingerprint from canonical line content preserving line multiplicities 2.  flag duplicate fingerprints, not net-zero amounts. 3. Evaluate effective-date scope/close-date, approved round-unit and threshold predicates 4.  invalid dates/units are not evaluated. 5. Create one investigation case per journal with all triggers and contributing rows. Retain gross debit/credit exposure without multiplying it by trigger count.

Output: A deduplicated journal investigation queue with trigger reasons, affected lines, amounts and auditor disposition.

Human decision/review: Confirm population completeness, select applicable filters and thresholds, investigate supporting evidence and conclude whether each case is legitimate or misstated.

Unsupported/limit: The baseline excludes near-duplicate text matching, journal-number sequences, user rarity, sensitive account combinations, segregation conflicts and rapid reversal analysis.

Independent specification example EX-009: J1/J2 each lines A+10,B-10; J3 lines A+10,B-5,B-5. Exact whole-journal multiset profile.

Method: Group identical full line multisets; preserve line multiplicity.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"clusters": 1, "journals": 2} | {"clusters": 1, "journals": 2}; PASS - independent example assertion |
| Limit / edge case | Candidate duplication is not proof of fraudulent or duplicate economic posting. J3 does not match merely because net balances coincide. |

Current recorded status: partial-evidence. Bounded application observation: approved data feeds the same scoped analytics, multipart confirmation and sampled source rows (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R15 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-010 - Analytical review workspace

Source: F00010 p.6, card 10; F00011 matching card 10; F00009/F00012 catalogue entry 10. Workflow owner G03; cases P06-UC03, P06-UC05.

Minimum outcome: Compare current results with an auditor-approved expectation and preserve significant unexplained movements for investigation and final review.

Inputs/schema: Required: account or statement-line values for comparable periods, approved analytical relationships and investigation thresholds. Optional: budgets and non-financial drivers.

Proposed source method: 1. absolute_change = current - comparable_prior 2.  percentage_change = (current - comparable_prior) / abs(comparable_prior) only when the selected convention permits and prior is nonzero. 3. Evaluate each approved ratio numerator/denominator and absolute/percentage investigation predicate in compatible periods/units. 4. Retain explanation, supporting versions and disposition on refresh 5.  flag staleness when operands change. No automatic expectation or seasonality model.

Output: A movement and ratio table with flagged relationships, explanations, evidence links and unresolved cases.

Human decision/review: Choose relevant relationships, establish expectations and thresholds, evaluate management explanations and make the planning or final analytical conclusion.

Unsupported/limit: The baseline does not generate expectations automatically, model seasonality, forecast balances or decide whether an explanation is audit evidence.

Independent specification example EX-010: Current120; comparable prior100; percentage denominator abs(prior).

Method: Delta=current-prior; percent=delta/abs(prior)*100.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"delta": 20, "percent": 20} | {"delta": 20, "percent": 20}; PASS - independent example assertion |
| Limit / edge case | An unexpected movement requires auditor investigation. Prior zero => percentage not evaluable, not zero or infinity. |

Current recorded status: partial-evidence. Bounded application observation: approved data feeds the same scoped analytics, multipart confirmation and sampled source rows (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R13 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-011 - Sales-population integrity and reconciliation

Source: F00010 p.7, card 11; F00011 matching card 11; F00009/F00012 catalogue entry 11. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Establish that the uploaded sales register agrees with ledger revenue and does not contain missing identifiers or exact duplicate invoices.

Inputs/schema: Required: invoice and line identifiers, posting date, revenue account, signed amount, customer and ledger or trial-balance revenue totals.

Proposed source method: 1. Aggregate in-period sales by approved revenue-account mapping and compare with ledger/TB movements. 2. Flag missing keys, repeated declared keys at the declared invoice/line grain, and exact duplicate records without deleting them. 3. Retain register-to-ledger residuals and original sales rows. Repeated header ID across valid lines is not automatically a duplicate invoice.

Output: A sales-to-ledger bridge and invoice-population exception list with affected revenue amounts.

Human decision/review: Confirm the sales population and account mapping, define the invoice business key, explain differences and determine whether exceptions require substantive testing.

Unsupported/limit: The baseline does not test invoice sequence completeness, fuzzy economic duplicates, zero or negative commercial validity, cut-off or revenue recognition.

Independent specification example EX-011: Distinct invoice lines100,200; repeated header is not a second line; ledger revenue310.

Method: Sum uniquely identified eligible lines and compare with the ledger.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"source": 300, "difference": -10} | {"source": 300, "difference": -10}; PASS - independent example assertion |
| Limit / edge case | Revenue recognition and source completeness remain audit work.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-012 - Revenue cut-off and credit-note review

Source: F00010 p.7, card 12; F00011 matching card 12; F00009/F00012 catalogue entry 12. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Identify sales whose invoice, delivery or posting dates indicate possible recording in the wrong period and credits linked to year-end sales.

Inputs/schema: Required: invoice identifier, invoice date, posting date, delivery or acceptance date when relevant, amount and reporting date. Credit review also requires original-invoice reference.

Proposed source method: 1. Select approved period-end windows and compare supplied invoice, delivery/acceptance and posting dates with reporting boundary. 2. Exact-link post-period credits to pre-period invoices through original references 3.  unmatched credits remain unmatched. 4. One case per supported economic-event identity retains all timing/credit reasons. A date difference does not itself determine transfer of control.

Output: A cut-off and linked-credit case list showing dates, amounts, source links and unresolved status.

Human decision/review: Define the relevant performance evidence and window, investigate the transaction and determine the correct recognition period and any misstatement.

Unsupported/limit: The baseline does not interpret contract terms, infer delivery from unstructured documents, fuzzy-match unreferenced credits or conclude when control transferred.

Independent specification example EX-012: Invoice/posting2026-12-31; documented delivery2027-01-02; year end2026-12-31.

Method: Flag selected timing dates on opposite sides of the boundary.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"timing_candidates": 1} | {"timing_candidates": 1}; PASS - independent example assertion |
| Limit / edge case | The date conflict does not decide when control transferred or revenue is recognized.  |

Current recorded status: partial-evidence. Bounded application observation: commercial fieldwork reconciles revenue, receipts, purchases and bank evidence with independent case review (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-013 - Receivables aging and subsequent-cash matching

Source: F00010 p.8, card 13; F00011 matching card 13; F00009/F00012 catalogue entry 13. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Recalculate invoice aging at the reporting date and show which balances are supported by explicitly referenced subsequent receipts.

Inputs/schema: Required: invoice identifier, customer, invoice and due dates, open amount, reporting date, receipt date, receipt amount and invoice reference.

Proposed source method: 1. Calculate signed days relative to due date under the selected calendar; days overdue = max(signed days,0), with not-yet-due kept separately. Use invoice age only as a separately labelled basis; bucket boundaries are explicit and nonoverlapping. 2.  use invoice age only in a separately labelled basis. Bucket boundaries must be explicit/nonoverlapping. 3. Exact-reference subsequent receipts to invoices 4.  allocation <= remaining_invoice_open_amount and <= remaining_receipt_amount, with recorded allocation order. 5. Show unmatched/ambiguous receipts and over-allocation separately. Later cash does not conclusively prove the whole valuation assertion.

Output: A recomputed aging schedule and invoice-to-cash allocation with unmatched and partially collected balances.

Human decision/review: Approve aging buckets and the cash cut-off date, investigate unmatched items and evaluate whether subsequent collection supports recoverability.

Unsupported/limit: The baseline does not allocate unreferenced cash, estimate credit losses, evaluate disputes or treat receipt after year-end as conclusive evidence of valuation.

Independent specification example EX-013: As-of2026-12-31; due2026-12-01; invoice100; explicitly allocated receipt40.

Method: Days overdue=max(0,asof-due); residual=invoice-allocated receipt.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"days_overdue": 30, "residual": 60} | {"days_overdue": 30, "residual": 60}; PASS - independent example assertion |
| Limit / edge case | Use approved receipt allocation; ageing alone does not measure impairment.  |

Current recorded status: partial-evidence. Bounded application observation: commercial fieldwork reconciles revenue, receipts, purchases and bank evidence with independent case review (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-014 - Sales pricing and discount compliance

Source: F00010 p.8, card 14; F00011 matching card 14; F00009/F00012 catalogue entry 14. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Identify invoice lines whose recorded amount, price or discount differs from approved commercial terms supplied for testing.

Inputs/schema: Required: invoice and line identifiers, quantity, unit price, discount, recorded line amount and approved price or discount reference.

Proposed source method: 1. expected_line = quantity * unit_price - structured_discount + structured_tax under the declared net/gross convention 2.  round at the selected stage. 3. Compare price and discount with the applicable approved list/limit and validity scope. 4. Keep arithmetic variance and authorisation variance separate. Unsupported compound rebates or contract interpretation is not computed.

Output: A line-level price, discount and arithmetic variance report with affected sales amounts.

Human decision/review: Select the authoritative price and discount terms, approve any exceptions, inspect commercial evidence and decide whether a variance is a misstatement or valid arrangement.

Unsupported/limit: The baseline does not extract terms from contracts, calculate complex rebates, optimize pricing or determine whether non-standard terms are commercially appropriate.

Independent specification example EX-014: Quantity10; unit price20; total line discount20; tax0; recorded invoice181.

Method: Expected=quantity*price-discount+tax.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"expected": 180, "difference": -1} | {"expected": 180, "difference": -1}; PASS - independent example assertion |
| Limit / edge case | Contract price, recognition and correct tax treatment are separately supported.  |

Current recorded status: partial-evidence. Bounded application observation: commercial fieldwork reconciles revenue, receipts, purchases and bank evidence with independent case review (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-015 - Revenue-recognition schedule recalculation

Source: F00010 p.9, card 15; F00011 matching card 15; F00009/F00012 catalogue entry 15. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Recalculate a straight-line time-based revenue schedule from approved contract dates and compare it with recorded period revenue.

Inputs/schema: Required: contract identifier, approved transaction amount, service start and end dates, reporting period, recorded recognized amount and selected allocation convention.

Proposed source method: 1. Validate service range and choose one explicit inclusive/exclusive day or month convention 2.  duration must be positive. 3. expected_period_revenue = approved_transaction_amount * overlap_service_units / total_service_units, subject to the selected simple allocation basis. 4. Compare current recognised/deferred amounts and retain residuals 5.  obligation identification, variable consideration and modifications stay outside the minimum.

Output: An expected recognition schedule, recorded values and period or closing-balance variances by contract.

Human decision/review: Confirm that the supported method applies, approve contract dates, amount and allocation convention, and make all recognition and contract-accounting judgments.

Unsupported/limit: The baseline excludes performance-obligation identification, standalone selling-price allocation, milestone evidence, variable consideration and contract modifications.

Independent specification example EX-015: Approved service transaction price1200 for12 equal monthly periods;3 periods in scope; recorded revenue310.

Method: Approved equal-month basis:1200*3/12.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"expected": 300, "difference": -10} | {"expected": 300.0, "difference": -10.0}; PASS - independent example assertion |
| Limit / edge case | Equal-month revenue allocation is an explicit supported example policy, not a performance-obligation or recognition decision.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-016 - Purchases and payments population review

Source: F00010 p.9, card 16; F00011 matching card 16; F00009/F00012 catalogue entry 16. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Reconcile the purchase register to ledger expense or payable movements and identify exact duplicate supplier invoices or payments.

Inputs/schema: Required: supplier, invoice identifier and date, payment identifier and date, account, signed amount and ledger or trial-balance control totals.

Proposed source method: 1. Aggregate purchases under approved account/period mapping and compare with ledger/TB controls. 2. Group exact invoice duplicates at the approved invoice business key and payment duplicates at the approved payment key. 3. Retain separate reconciliation/invoice/payment cases and source rows 4.  a duplicate indicator is not proof of fraud.

Output: A purchase-to-ledger bridge and exact duplicate invoice or payment groups with gross affected values.

Human decision/review: Confirm population completeness and mappings, define duplicate keys, investigate supporting documents and determine whether repeated items are legitimate or misstated.

Unsupported/limit: The baseline does not perform fuzzy matching, detect split or redirected payments, reconcile the full document chain or infer fraud from duplicate indicators.

Independent specification example EX-016: Rowsr1/r2 same supplierS,invoiceI1,currencyU,amount100; no other duplicate groups.

Method: Exact approved business key groups retained as candidates.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"clusters": 1, "source_rows": 2, "candidate_exposure": 200} | {"clusters": 1, "source_rows": 2, "candidate_exposure": 200}; PASS - independent example assertion |
| Limit / edge case | Do not delete one row or assume both are payable without inspection.  |

Current recorded status: partial-evidence. Bounded application observation: commercial fieldwork reconciles revenue, receipts, purchases and bank evidence with independent case review (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-017 - Supplier and payee identity-risk analysis

Source: F00010 p.10, card 17; F00011 matching card 17; F00009/F00012 catalogue entry 17. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Surface counterparties that share exact or normalized identifiers and show the transactions exposed to those relationships.

Inputs/schema: Required: supplier identifier, legal name and at least one reliable registration number or bank account. Optional: address, contact data and payment history.

Proposed source method: 1. Normalise only under an approved profile, preserving raw values 2.  do not remove identity-significant characters without a stated rule. 3. Group exact registration/account matches separately from normalised-name candidates, with rule and matching basis. 4. Link clusters to count/exposure without multiplying the same transaction by each cluster edge. Shared identity attributes do not prove beneficial ownership or fraud.

Output: An explainable supplier or payee cluster list with matched fields and transaction exposure.

Human decision/review: Confirm authoritative identifiers, investigate ownership and commercial relationships, approve legitimate shared accounts and determine the audit response.

Unsupported/limit: The baseline does not establish beneficial ownership, search external registries, infer relationships from unrestricted text or make a fraud or related-party conclusion.

Independent specification example EX-017: SupplierS1/S2 share exact normalized bank accountB001; selected payments100/200.

Method: Group supplied matching accounts; sum source payments once.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"account_clusters": 1, "parties": 2, "exposure": 300} | {"account_clusters": 1, "parties": 2, "exposure": 300}; PASS - independent example assertion |
| Limit / edge case | Shared account is an indicator; beneficial ownership or fraud is not inferred.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-018 - Procure-to-pay document matching

Source: F00010 p.10, card 18; F00011 matching card 18; F00009/F00012 catalogue entry 18. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Show whether each selected purchase can be traced through purchase order, receipt, invoice and payment records using stable source identifiers.

Inputs/schema: Required: structured order, receipt, invoice and payment records with stable document and line identifiers, quantities, amounts and currencies.

Proposed source method: 1. Join order-receipt-invoice-payment using approved exact document/line keys and declared grain. 2. Compare matched quantity/amount with tolerances after validating units/currency 3.  expose missing links at each stage. 4. Retain valid one-to-many lines and partial quantities. Do not flatten header joins that multiply amounts 5.  unsupported many-to-many transformations remain unresolved.

Output: A document-chain status table with missing links, quantity differences and amount variances.

Human decision/review: Confirm source-system relationships and tolerances, investigate missing or inconsistent documents and decide whether exceptions indicate error or control failure.

Unsupported/limit: The baseline requires structured records and exact identifiers. It does not read scanned documents, infer links from descriptions or support undocumented many-to-many transformations.

Independent specification example EX-018: One matched line: PO quantity10; goods receipt8; invoice10.

Method: Compare quantities at the documented matching line/unit grain.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"invoice_minus_receipt": 2} | {"invoice_minus_receipt": 2}; PASS - independent example assertion |
| Limit / edge case | Header/line joins cannot multiply amounts; tolerances require approval.  |

Current recorded status: partial-evidence. Bounded application observation: commercial fieldwork reconciles revenue, receipts, purchases and bank evidence with independent case review (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-019 - Payables cut-off and unrecorded-liability review

Source: F00010 p.11, card 19; F00011 matching card 19; F00009/F00012 catalogue entry 19. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Identify pre-period receipts or services and post-period invoices or payments that may indicate an omitted or late-recorded year-end liability.

Inputs/schema: Required: supplier, receipt or service date, invoice date, posting date, payment date, document references, amounts and year-end payable or accrual records.

Proposed source method: 1. Select approved receipt/service/invoice/posting/payment windows around period end. 2. Exact-match later invoices/payments to pre-period receipts/services and recorded year-end payables/accruals. 3. Unmatched chains become candidate cases with dates and gross exposure 4.  they are not automatic omitted liabilities or accrual estimates.

Output: A linked cut-off case list and candidate unrecorded-liability population with source records.

Human decision/review: Define the look-back and look-forward windows, evaluate when the obligation arose, inspect evidence and conclude whether a liability or cut-off misstatement exists.

Unsupported/limit: The baseline does not infer obligations from unstructured contracts, fuzzy-match unsupported records, calculate accrual estimates or conclude that unmatched payments prove omission.

Independent specification example EX-019: Documented service2026-12-20; invoice2027-01-10; payment2027-01-20; no linked year-end liability.

Method: Selected subsequent payment links to pre-year-end service with no matching recorded liability.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"candidates": 1} | {"candidates": 1}; PASS - independent example assertion |
| Limit / edge case | A candidate requires inspection; no automated omitted-liability conclusion.  |

Current recorded status: partial-evidence. Bounded application observation: commercial fieldwork reconciles revenue, receipts, purchases and bank evidence with independent case review (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-020 - Bank matching and reconciliation

Source: F00010 p.11, card 20; F00011 matching card 20; F00009/F00012 catalogue entry 20. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Match structured bank-statement lines to cash-ledger entries and recalculate the arithmetic of a supplied period-end bank reconciliation.

Inputs/schema: Required: bank account, statement date, transaction date, amount, currency and reference; ledger cash entries; and the supplied reconciliation balance and items.

Proposed source method: 1. First match exact references 2.  then consider one-to-one amount/currency/date-window matches only when unique under the approved profile. 3. Retain ambiguous and unmatched bank/ledger rows 4.  no silent netting or inferred fee/interest entry. 5. Apply signed documented reconciling items to the selected book/bank basis and compute residual. Many-to-many matching and foreign exchange require supported extensions.

Output: Matched and unmatched transaction tables plus a recalculated bank-reconciliation residual.

Human decision/review: Confirm bank-account scope and matching window, approve matches, investigate stale or unsupported reconciling items and assess the reliability of the reconciliation.

Unsupported/limit: The baseline does not connect directly to banks, perform complex many-to-many matching, recalculate foreign exchange or infer missing fees and interest automatically.

Independent specification example EX-020: Book bank90; documented reconciling addition10; statement100; unique reference match.

Method: Adjusted book=90+10; residual=adjusted book-statement.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"adjusted": 100, "residual": 0} | {"adjusted": 100, "residual": 0}; PASS - independent example assertion |
| Limit / edge case | A zero residual does not validate the nature or age of reconciling items.  |

Current recorded status: partial-evidence. Bounded application observation: commercial fieldwork reconciles revenue, receipts, purchases and bank evidence with independent case review (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-021 - Cash movement and payment-risk analytics

Source: F00010 p.12, card 21; F00011 matching card 21; F00009/F00012 catalogue entry 21. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Identify large, round or period-end cash transactions and exact inter-account transfer pairs for targeted audit investigation.

Inputs/schema: Required: cash transaction identifier, account, date, amount, currency, reference and reporting date. Transfer matching also requires known internal bank accounts.

Proposed source method: 1. Apply approved absolute amount, round-unit and period-end window predicates to cash rows. 2. Pair equal/opposite transfers only across known company bank accounts in compatible currency/date windows and with unambiguous eligibility. 3. Consolidate triggers into one source transaction/event case. Unusual cash patterns are investigation candidates, not fraud conclusions.

Output: A cash-risk case list with trigger reasons, paired transfers, unpaired legs and affected amounts.

Human decision/review: Set justified thresholds, confirm the population and company accounts, investigate authorization and business purpose, and conclude whether each case is valid.

Unsupported/limit: The baseline does not model normal behavior, verify approval limits, perform fuzzy payment matching or determine whether unusual timing indicates fraud.

Independent specification example EX-021: Cash event1030; example threshold1000; example round unit10.

Method: Record each triggered rule, then deduplicate candidate event exposure.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"triggers": 2, "cases": 1, "exposure": 1030} | {"triggers": 2, "cases": 1, "exposure": 1030}; PASS - independent example assertion |
| Limit / edge case | Thresholds are fictitious test inputs; no money-laundering/fraud conclusion.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-022 - Inventory register and movement integrity

Source: F00010 p.12, card 22; F00011 matching card 22; F00009/F00012 catalogue entry 22. Workflow owner G04; cases P05-UC01, P05-UC02, P09-UC02, P09-UC11.

Minimum outcome: Confirm that inventory quantities and values roll forward by item and that the closing register agrees with the corresponding ledger balance.

Inputs/schema: Required: item and movement identifiers, date, movement type, quantity, unit, recorded value, opening and closing quantities, location where used, and mapped ledger balance.

Proposed source method: 1. expected_closing_quantity = opening + receipts - issues + signed_documented_adjustments under the approved movement taxonomy. 2. Reconcile recorded closing value and movements to mapped ledger accounts without claiming cost recalculation. 3. Flag negative stock, missing movement IDs and exact duplicates while retaining affected rows 4.  incompatible units/unknown movement types are not silently normalised.

Output: An item-level quantity roll-forward, register-to-ledger bridge and negative or duplicate movement case list.

Human decision/review: Confirm the inventory scope, movement types, units and account mapping, explain adjustments and determine whether identified cases require further testing.

Unsupported/limit: The baseline does not recalculate unit cost, convert incompatible units, infer undocumented movement types or evaluate the business purpose of adjustments.

Independent specification example EX-022: Opening units10; receipts5; issues4; signed adjustment-1; recorded closing9.

Method: Expected=opening+receipts-issues+adjustment.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"expected": 10, "difference": 1} | {"expected": 10, "difference": 1}; PASS - independent example assertion |
| Limit / edge case | Quantities require common item/location/unit and reconciled source coverage.  |

Current recorded status: partial-evidence. Bounded application observation: commercial fieldwork reconciles revenue, receipts, purchases and bank evidence with independent case review (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-023 - Inventory-count reconciliation

Source: F00010 p.13, card 23; F00011 matching card 23; F00009/F00012 catalogue entry 23. Workflow owner G04; cases P09-UC05, P09-UC02, P09-UC11.

Minimum outcome: Compare signed count quantities with the inventory register and show every unresolved difference for the counted items and locations.

Inputs/schema: Required: controlled count sheet, count date, item, location, counted quantity, book quantity and unit. Optional: recount and approved adjustment references.

Proposed source method: 1. Exact-match controlled count rows to approved item/location register grain, keeping unmatched and duplicate/ambiguous matches. 2. quantity_difference = counted_quantity - book_quantity at the same count-date basis/unit. 3. Show approved adjustment/recount support separately, plus uncounted selected units and unresolved differences. The calculation does not prove proper observation or physical coverage.

Output: A count coverage table and item-location reconciliation showing initial difference, adjustment and unresolved quantity.

Human decision/review: Establish the count scope, assess observation evidence and count-sheet reliability, approve mappings or adjustments and conclude on existence and condition.

Unsupported/limit: The baseline does not prove that the physical count was properly performed, assess inventory condition, extrapolate omitted locations or replace auditor observation.

Independent specification example EX-023: Book quantity10; verified test count12; same item/location/unit.

Method: Count difference=count-book.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"difference": 2} | {"difference": 2}; PASS - independent example assertion |
| Limit / edge case | One test count is not a population extrapolation or ownership conclusion.  |

Current recorded status: partial-evidence. Bounded application observation: commercial fieldwork reconciles revenue, receipts, purchases and bank evidence with independent case review (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-024 - Inventory cut-off and transfer consistency

Source: F00010 p.13, card 24; F00011 matching card 24; F00009/F00012 catalogue entry 24. Workflow owner G04; cases P09-UC05, P09-UC02, P09-UC11.

Minimum outcome: Identify receipts, dispatches and internal transfers around year-end whose logistics and accounting dates are inconsistent with the selected cut-off rules.

Inputs/schema: Required: movement or transfer identifier, item, location, quantity, logistics date, posting date, transaction type and reporting date.

Proposed source method: 1. Compare supplied receipt/dispatch dates to inventory/purchase/sales/ledger posting dates in the approved cutoff window. 2. Pair transfer legs by exact transfer ID/item and declared unit, preserving source/destination roles 3.  quantity residual = incoming - outgoing on a common basis. 4. Consolidate timing/unmatched-leg reasons for each event without judging shipping terms or recognition automatically.

Output: A period-end cut-off case list and paired or unmatched internal-transfer report.

Human decision/review: Select the relevant logistics date and window, investigate terms and source evidence, and determine the correct inventory and related purchase or sales period.

Unsupported/limit: The baseline does not interpret shipping terms, infer event dates from documents, convert incompatible units or conclude that a timing difference is a misstatement.

Independent specification example EX-024: Matched transfer out10/in9. Logistics2026-12-31; posting2027-01-02.

Method: Retain quantity residual and timing reason on the same transfer event.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"quantity_residual": -1, "timing_reasons": 1, "events": 1} | {"quantity_residual": -1, "timing_reasons": 1, "events": 1}; PASS - independent example assertion |
| Limit / edge case | Timing indicators need evidence of actual receipt/control and reconciliation.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-025 - Inventory costing and cost-of-sales recalculation

Source: F00010 p.14, card 25; F00011 matching card 25; F00009/F00012 catalogue entry 25. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Recalculate inventory issue cost and closing value under a supported periodic weighted-average method and compare them with recorded inventory and cost of sales.

Inputs/schema: Required: opening quantity and cost, purchase quantities and costs, issue and closing quantities, reporting period, recorded inventory value and recorded cost of sales.

Proposed source method: 1. For the periodic weighted-average minimum, available_quantity = opening_quantity + sum(purchase_quantity) 2.  available_cost = opening_cost + sum(purchase_cost). Reject invalid/negative inputs or nonpositive denominator under this profile. 3. weighted_average_cost = available_cost / available_quantity 4.  expected_issue_cost = issue_quantity * weighted_average_cost 5.  expected_closing_value = closing_quantity * weighted_average_cost. 6. Compare recorded inventory/COS and quantity bridge, with approved rounding. FIFO, moving average, overhead and write-down models remain separate extensions.

Output: An expected unit-cost schedule, expected inventory and cost of sales, recorded amounts and variances.

Human decision/review: Confirm that the supported method matches the entity's approved policy, map movement types and investigate all cost and ledger variances.

Unsupported/limit: The baseline does not support FIFO, moving average, standard cost, overhead absorption, joint products, write-downs or changes in costing method.

Independent specification example EX-025: Approved periodic weighted average: opening10units/cost100; purchase10/cost200; issue8.

Method: (100+200)/(10+10)=15; issue8*15; closing12*15.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"unit_cost": "15", "issue_cost": "120", "closing_value": "180"} | {"unit_cost": "15", "issue_cost": "120", "closing_value": "180"}; PASS - independent example assertion |
| Limit / edge case | Other cost flows require another approved supported method.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-026 - Inventory obsolescence and NRV indicators

Source: F00010 p.14, card 26; F00011 matching card 26; F00009/F00012 catalogue entry 26. Workflow owner G04; cases P09-UC02, P09-UC06, P09-UC11.

Minimum outcome: Identify slow or non-moving items and items whose recorded cost exceeds an auditor-supplied net realizable value input.

Inputs/schema: Required: item, quantity, cost, last qualifying movement date and reporting date. NRV comparison additionally requires approved selling-price and completion or disposal-cost inputs.

Proposed source method: 1. Use approved item-level cost, quantities, supported estimated selling price, completion costs and costs necessary to make the sale. 2. NRV per unit = estimated selling price - completion costs - costs necessary to make the sale. Proposed shortfall = quantity * max(cost per unit - NRV per unit,0), with approved grouping/cost basis. 3. Keep age/turnover/condition indicators distinct from the supported write-down calculation. A generic disposal-cost label is insufficient.

Output: A slow or no-movement list and potential cost-over-NRV cases with calculated exposure.

Human decision/review: Define qualifying movements and thresholds, validate selling and disposal-cost evidence, challenge assumptions and make the write-down and valuation conclusion.

Unsupported/limit: The baseline does not forecast future sales, infer obsolete condition, derive market prices or calculate a final write-down without approved valuation inputs.

Independent specification example EX-026: 3units; unit cost10; selling price9; completion1; necessary selling costs1; age400days, test age limit365.

Method: NRV/unit=9-1-1=7; shortfall=3*max(10-7,0); age indicator independent.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"nrv_unit": 7, "shortfall": 9, "age_indicator": true} | {"nrv_unit": 7, "shortfall": 9, "age_indicator": true}; PASS - independent example assertion |
| Limit / edge case | Necessary selling costs are not a blanket disposal-cost deduction; age does not decide write-down.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-027 - Asset-register roll-forward and ledger reconciliation

Source: F00010 p.15, card 27; F00011 matching card 27; F00009/F00012 catalogue entry 27. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Recalculate cost and accumulated depreciation or amortization roll-forwards and reconcile closing register balances with the ledger by asset class.

Inputs/schema: Required: asset identifier and class, opening cost and accumulated charge, additions, disposals, transfers, current charge, closing values and mapped ledger balances.

Proposed source method: 1. expected_closing_cost = opening_cost + additions - disposals + signed_transfers + other_identified_movements. 2. expected_closing_accumulated = opening_accumulated + current_charge - accumulated_on_disposals + signed_adjustments. 3. Reconcile register/ledger closings and retain per-asset/class residuals. Existence, recognition and impairment are separate judgments/checks.

Output: Asset-class cost and accumulated-charge bridges with ledger residuals and contributing asset records.

Human decision/review: Confirm movement classifications and account mappings, approve legitimate adjustments and determine whether register or ledger differences affect the audit.

Unsupported/limit: The baseline does not test depreciation methods, physical existence, impairment, revaluation, component accounting or whether additions meet capitalization criteria.

Independent specification example EX-027: Gross opening100/additions20/disposals10/recorded111; accumulated opening30/charge10/disposals5.

Method: Gross=100+20-10; accumulated=30+10-5.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"expected_gross": 110, "gross_difference": -1, "expected_accumulated": 35} | {"expected_gross": 110, "gross_difference": -1, "expected_accumulated": 35}; PASS - independent example assertion |
| Limit / edge case | Existence, capitalization and disposal support remain separate procedures.  |

Current recorded status: partial-evidence. Bounded application observation: commercial fieldwork reconciles revenue, receipts, purchases and bank evidence with independent case review (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-028 - Depreciation and amortization recalculation

Source: F00010 p.15, card 28; F00011 matching card 28; F00009/F00012 catalogue entry 28. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Recalculate straight-line depreciation or finite-life amortization for each asset and compare the expected period charge and closing accumulation with recorded amounts.

Inputs/schema: Required: asset identifier, class, cost, residual value, useful life or rate, in-service and disposal dates, recorded period charge and reporting dates.

Proposed source method: 1. Validate finite compatible inputs, positive useful life, nonnegative depreciable base/opening accumulated amount and actual eligible service overlap. Existing accumulated depreciation above the base is an explicit unsupported/anomaly result, not a negative current charge. 2. For the selected straight-line profile: annual charge = (cost - residual value) / approved useful life; proposed charge = min(annual charge * declared eligible fraction, remaining nonnegative depreciable base). Day/month/fraction conventions and rounding are explicit. 3. Compare asset/class/account results. Missing assumptions, zero life or unsupported variants remain not evaluable. Do not automatically reverse excess prior depreciation or infer useful life/impairment.

Output: An asset-level expected charge, closing accumulated amount and recorded variance, summarized by class.

Human decision/review: Confirm the accounting method, useful life, residual value, in-service date and treatment of unusual assets, then evaluate whether variances are misstatements.

Unsupported/limit: The baseline supports straight-line finite-life schedules only. It excludes declining-balance, units-of-production, components, revaluation, impairment and indefinite-life assessment.

Independent specification example EX-028: Cost1200; residual200; useful life4years; half-year basis; opening accumulated950.

Method: Depreciable base1000; annual250; half125; cap at remaining base50.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"annual": "250", "charge": "50"} | {"annual": "250", "charge": "50"}; PASS - independent example assertion |
| Limit / edge case | Useful life, residual, in-service date and convention are supplied approved assumptions. Existing accumulated depreciation above the base is an explicit exception, not a negative new charge.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-029 - Asset lifecycle and useful-life analysis

Source: F00010 p.16, card 29; F00011 matching card 29; F00009/F00012 catalogue entry 29. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Flag asset-register conditions that conflict with recorded status or approved useful-life and rate ranges.

Inputs/schema: Required: asset identifier, class, status, acquisition and disposal dates, cost, accumulated charge, carrying amount and approved life or rate range.

Proposed source method: 1. Flag active/fully-charged and disposed/nonzero-carrying cases under approved tolerances and statuses. 2. Compare supplied life/rate to the class-specific approved range with explicit inclusivity at boundaries. 3. Retain unmatched register/ledger asset candidates and source status/dates. Do not infer physical existence or remaining useful life.

Output: A lifecycle and policy-range review list with trigger reason and carrying-value exposure.

Human decision/review: Maintain the asset-class policy ranges, investigate continued use and disposal evidence, inspect physical existence where required and decide whether estimates or records need revision.

Unsupported/limit: The baseline does not verify physical existence, predict remaining life, classify assets from descriptions or automatically revise useful lives and depreciation.

Independent specification example EX-029: AssetA disposed but carrying10; assetB active with cost100/accumulated100.

Method: Apply distinct disposed-with-balance and fully-depreciated-active indicators.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"disposed_balance_candidates": 1, "fully_depreciated_active": 1} | {"disposed_balance_candidates": 1, "fully_depreciated_active": 1}; PASS - independent example assertion |
| Limit / edge case | Continued use does not itself require a depreciation reversal or replacement.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-030 - Capitalization and repairs screening

Source: F00010 p.16, card 30; F00011 matching card 30; F00009/F00012 catalogue entry 30. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Select tangible or intangible additions and expense transactions whose amount or supplied category conflicts with the approved capitalization policy.

Inputs/schema: Required: transaction identifier, date, amount, recorded account, asset or expense category, project code where used and approved policy threshold.

Proposed source method: 1. Compare structured asset additions with the approved category threshold and valid policy version. 2. Compare selected repair/project expense categories with the same scoped policy predicates 3.  no narrative classification or cost aggregation is inferred. 4. Return each threshold/category reason with original amount. Candidate screening does not establish asset-recognition criteria.

Output: A capex-versus-expense screening list with current treatment, rule triggered and gross exposure.

Human decision/review: Approve the relevant policy and threshold, inspect the nature and future benefits of expenditure, and make the capitalization or expense conclusion.

Unsupported/limit: The baseline does not interpret invoice descriptions, assess asset recognition criteria, combine related costs across transactions or conclude whether expenditure creates future economic benefits.

Independent specification example EX-030: Illustrative screening threshold1000: capitalized900; selected expense category item1200.

Method: Screen policy-threshold mismatches in each direction.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"candidates": 2} | {"candidates": 2}; PASS - independent example assertion |
| Limit / edge case | Threshold screening cannot replace recognition criteria or approved capitalization policy.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-031 - Payroll population and disbursement integrity

Source: F00010 p.17, card 31; F00011 matching card 31; F00009/F00012 catalogue entry 31. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Reconcile payroll totals with ledger and bank disbursements and identify invalid or exact duplicate employee-payment records.

Inputs/schema: Required: employee and payroll-period identifiers, employment status, gross pay, deductions, net pay, mapped accounts and bank payment reference and amount.

Proposed source method: 1. expected_net = gross_pay - employee_deductions + approved_net_adjustments under the supplied payroll bridge 2.  reconcile mapped expense/liability/net totals. 3. Exact-match net payment by employee/payroll reference, compatible amount/currency and declared payment grain. 4. Flag missing/repeated IDs, inactive-employee payments and exact duplicates without concluding employee existence or payroll fraud.

Output: A payroll-to-ledger and payroll-to-bank bridge plus employee and payment-integrity cases.

Human decision/review: Confirm payroll scope and mappings, validate employee status, investigate unmatched or shared payment details and determine the audit response.

Unsupported/limit: The baseline does not recalculate statutory deductions, establish employee existence, perform fuzzy payee matching or reconcile every regulatory return.

Independent specification example EX-031: Payroll gross100; deductions20; cash paid79.

Method: Expected net=gross-deductions; difference=expected net-paid.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"expected_net": 80, "payment_difference": 1} | {"expected_net": 80, "payment_difference": 1}; PASS - independent example assertion |
| Limit / edge case | A mismatch does not identify the correct wage, entitlement or legal deduction.  |

Current recorded status: partial-evidence. Bounded application observation: approved payroll, tax and financing editions calculate exact outputs and reject unsupported inputs (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-032 - Gross-to-net and payroll statutory recalculation

Source: F00010 p.17, card 32; F00011 matching card 32; F00009/F00012 catalogue entry 32. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Recalculate standard employee gross-to-net pay using an auditor-approved effective tax and social-insurance parameter set.

Inputs/schema: Required: employee, pay period, structured earnings and deductions, taxable and contribution bases, recorded outputs, and approved effective-dated statutory parameters.

Proposed source method: 1. Use only approved effective-dated rates, bands, caps, bases and employee categories 2.  apply the supported declared parameter-pack formulas. 3. expected_net = structured_gross - employee_contributions - withholding - other_deductions + permitted_net_adjustments 4.  employer contribution is not an employee deduction. 5. Compare component/aggregate outputs 6.  unsupported category, exemption, retroactive treatment or incomplete pack is not evaluable. No live legal rate is invented.

Output: Employee-level expected tax, social insurance and net pay with aggregate liability variances.

Human decision/review: Approve the legally applicable parameter set and employee classification, resolve special cases and make legal or compliance judgments.

Unsupported/limit: The baseline does not source legal rates automatically or cover every benefit, exemption, foreign employee, retroactive payment or industry-specific payroll arrangement.

Independent specification example EX-032: FICTITIOUS rate pack: gross1000; employee contribution10%; withholding base=gross-employee contribution, rate5%; employer20%.

Method: Employee100; withholding900*5%=45; net855; employer200 separately.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"net": "855", "employer_contribution": "200"} | {"net": "855", "employer_contribution": "200"}; PASS - independent example assertion |
| Limit / edge case | These are test parameters, not Mongolian statutory rates. Employer cost is not deducted from employee net.  |

Current recorded status: partial-evidence. Bounded application observation: approved payroll, tax and financing editions calculate exact outputs and reject unsupported inputs (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-033 - Payroll variance and off-cycle analytics

Source: F00010 p.18, card 33; F00011 matching card 33; F00009/F00012 catalogue entry 33. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Identify employee-level pay changes and off-cycle payments that exceed auditor-approved amount, percentage or timing criteria.

Inputs/schema: Required: employee, payroll period, payment date, gross and net pay, selected components, employment status and approved normal payroll calendar.

Proposed source method: 1. Compare with immediately preceding comparable period after validating employment/component/period basis. 2. delta = current - prior 3.  percentage_delta = delta / abs(prior) only for supported nonzero prior. Apply explicit absolute/percentage predicates. 4. Flag off-calendar payments and combine triggers per employee-period 5.  retain missing/noncomparable history instead of a fabricated variance.

Output: A payroll change and timing case list showing current, comparative, variance and trigger reason.

Human decision/review: Define comparable periods and justified thresholds, account for hires, terminations and promotions, inspect authorization and determine whether changes are valid.

Unsupported/limit: The baseline does not learn expected behavior, evaluate peer groups, classify narrative explanations or conclude that unusual pay indicates fraud or error.

Independent specification example EX-033: Comparable payroll100 to120; actual payment2027-01-15 vs approved normal2027-01-25.

Method: Movement+20/+20%; off-cycle timing; one event can retain two reasons.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"delta": 20, "percent": 20, "triggers": 2, "cases": 1} | {"delta": 20, "percent": 20.0, "triggers": 2, "cases": 1}; PASS - independent example assertion |
| Limit / edge case | Off-cycle payment or change does not by itself prove a ghost employee or invalid payroll.  |

Current recorded status: partial-evidence. Bounded application observation: approved payroll, tax and financing editions calculate exact outputs and reject unsupported inputs (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-034 - VAT and withholding-tax reconciliation

Source: F00010 p.18, card 34; F00011 matching card 34; F00009/F00012 catalogue entry 34. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Reconcile uploaded VAT or withholding registers to ledger liabilities and filed returns and recalculate structured tax amounts using approved rates.

Inputs/schema: Required: tax period, transaction or register identifier, taxable base, category, recorded tax, approved rate, mapped ledger balance and filed-return totals.

Proposed source method: 1. Aggregate structured tax records by tax period/category/rate 2.  reconcile ledger and filed-return totals in common units. 3. expected_tax = approved_taxable_base * approved_rate under supported effective rules/rounding 4.  compare recorded tax separately. 5. Retain missing period, rate and unmatched-total cases. Classification, exemptions, special regimes and filing remain outside unsupported scope.

Output: A register-to-ledger-to-return bridge with period, category, rate and amount variances.

Human decision/review: Determine the applicable tax treatment, approve categories and rates, assess exemptions and resolve filing or payment consequences with tax specialists where needed.

Unsupported/limit: The baseline does not make legal tax classifications, obtain authority data automatically, prepare filings or cover unsupported exemptions and special regimes.

Independent specification example EX-034: FICTITIOUS tax pack: eligible base100*10%; recorded liability11; return11.

Method: Expected tax10; expected-recorded=-1; ledger-return=0.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"expected": 10, "calculation_difference": -1, "return_tie": 0} | {"expected": 10.0, "calculation_difference": -1.0, "return_tie": 0}; PASS - independent example assertion |
| Limit / edge case | Approved law/date/rate/base is required in production; return agreement does not validate calculation.  |

Current recorded status: partial-evidence. Bounded application observation: approved payroll, tax and financing editions calculate exact outputs and reject unsupported inputs (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-035 - Corporate-income-tax reconciliation

Source: F00010 p.19, card 35; F00011 matching card 35; F00009/F00012 catalogue entry 35. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Reperform the arithmetic of approved current and deferred tax schedules and reconcile their recorded amounts to ledger, return and payment evidence.

Inputs/schema: Required: accounting profit, approved tax adjustments, temporary-difference schedule, approved rates, ledger balances, filed-return amount and relevant payments.

Proposed source method: 1. taxable_profit = accounting_profit + signed_approved_tax_adjustments 2.  current_tax = supported_tax_base * approved_rate, with approved loss/offset treatment. 3. deferred_tax_candidate = sum(signed_temporary_difference * applicable_rate) under supplied categories and recognition decisions. 4. Reconcile current/deferred balances, return and payment bridge. No deferred-asset recognition or uncertain-tax judgment is automated.

Output: A current-tax bridge, deferred-tax schedule and ledger, return or payment variances with unresolved judgment items.

Human decision/review: Classify tax adjustments and temporary differences, approve rates and recognition decisions, interpret law and conclude on uncertain or recoverable tax positions.

Unsupported/limit: The baseline does not interpret tax law, determine recognition of deferred-tax assets, model uncertain tax positions or prepare the corporate tax return.

Independent specification example EX-035: FICTITIOUS tax pack: accounting profit1000; approved adjustment+100;10%; supplied recognized temporary difference200*10%; ledger115/22.

Method: Taxable1100,current110; deferred20; compare current/deferred separately.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"current": 110, "deferred": 20, "current_difference": -5, "deferred_difference": -2} | {"current": 110.0, "deferred": 20.0, "current_difference": -5.0, "deferred_difference": -2.0}; PASS - independent example assertion |
| Limit / edge case | Recognition, recoverability and tax interpretation remain professional judgments.  |

Current recorded status: partial-evidence. Bounded application observation: approved payroll, tax and financing editions calculate exact outputs and reject unsupported inputs (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-036 - Borrowings, interest and covenant review

Source: F00010 p.19, card 36; F00011 matching card 36; F00009/F00012 catalogue entry 36. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Reconcile each borrowing facility's principal movement, recalculate contractual interest and show headroom under an auditor-approved covenant formula.

Inputs/schema: Required: facility identifier, opening principal, drawdowns, repayments, closing balance, contractual rate and dates, ledger or lender balance, and approved covenant formula inputs.

Proposed source method: 1. expected_principal = opening + drawdowns - repayments + other_identified_movements 2.  compare ledger/lender balances. 3. simple_interest = sum(eligible_principal_segment * approved_rate * declared_day_fraction), using actual principal-change segments. 4. Evaluate approved covenant expression 5.  headroom = limit - metric for maximum limits and metric - limit for minimum limits. Missing definition/waiver terms stay unresolved.

Output: A facility roll-forward, interest variance and covenant-headroom schedule with unresolved classification matters.

Human decision/review: Confirm contractual terms, effective dates and covenant definitions, assess waivers and rights, and make current or non-current classification and breach conclusions.

Unsupported/limit: The baseline does not calculate effective interest, account for fees or modifications, interpret covenant contracts or determine balance-sheet classification automatically.

Independent specification example EX-036: Loan opening100/draw20/repay10/closing111; simple interest100 at12%15/360 then120 at12%15/360; maximum covenant3,metric2.5.

Method: Closing110/difference-1; sum dated simple interest segments; upper-bound headroom=3-2.5.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"closing": 110, "difference": -1, "interest": "1.1", "headroom": "0.5"} | {"closing": 110, "difference": -1, "interest": "1.1", "headroom": "0.5"}; PASS - independent example assertion |
| Limit / edge case | Day-count/contract terms and covenant definition must be supplied; headroom does not imply legal compliance.  |

Current recorded status: partial-evidence. Bounded application observation: approved payroll, tax and financing editions calculate exact outputs and reject unsupported inputs (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-037 - Lease-accounting recalculation

Source: F00010 p.20, card 37; F00011 matching card 37; F00009/F00012 catalogue entry 37. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Recalculate a fixed-payment lease liability and straight-line right-of-use asset schedule and compare both with recorded ledger balances.

Inputs/schema: Required: lease identifier, commencement and end dates, fixed payment schedule, approved discount rate, initial right-of-use adjustments and recorded ledger balances.

Proposed source method: 1. initial_liability = sum(fixed_payment_t / (1 + compatible_period_rate)^t), with declared payment timing/day fractions. 2. liability_close = liability_open + period_interest - period_payments 3.  initial_ROU = initial_liability + supplied_initial_adjustments. 4. Apply approved straight-line ROU life/timing and reconcile balances/expense. Modifications, variable/index payments and other excluded variants are not silently approximated. 5. The selected timing/period-rate convention must be compatible. Zero rate reduces PV to the sum of eligible payments; an invalid denominator is not evaluated. The one-period example excludes initial adjustments and all complex variants.

Output: A lease liability and right-of-use schedule with interest, depreciation, closing balances and ledger variances.

Human decision/review: Confirm lease completeness, scope, term, discount rate and accounting elections, evaluate classification and modifications, and conclude on any misstatement.

Unsupported/limit: The baseline excludes variable or index-linked payments, modifications, reassessments, exemptions, foreign currency, restoration obligations and complex tax effects.

Independent specification example EX-037: Approved one-period lease profile: end payment110,discount10%; initial liability/ROU100; one period depreciation100.

Method: PV110/1.1=100; interest10; liability100+10-110=0.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"pv": "100", "closing_liability": "0", "depreciation": "100", "zero_rate_pv": "110"} | {"pv": "100", "closing_liability": "0", "depreciation": "100", "zero_rate_pv": "110"}; PASS - independent example assertion |
| Limit / edge case | This bounded profile excludes modification, indexation and complex lease recognition. Zero discount rate sums undiscounted payments. |

Current recorded status: partial-evidence. Bounded application observation: approved payroll, tax and financing editions calculate exact outputs and reject unsupported inputs (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-038 - Foreign-currency recalculation and retranslation

Source: F00010 p.20, card 38; F00011 matching card 38; F00009/F00012 catalogue entry 38. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Recalculate recorded functional-currency amounts using an approved exchange-rate table and retranslate closing monetary balances at the approved period-end rate.

Inputs/schema: Required: transaction or balance identifier, foreign amount and currency, functional amount, transaction date, reporting date, monetary-item status and approved rate table.

Proposed source method: 1. expected_functional = foreign_amount * approved_functional_per_foreign_rate at the applicable transaction date 2.  validate direction. 3. For approved monetary items only, expected_close = foreign_balance * approved_closing_rate 4.  residual uses the same currency/unit. 5. Report missing/ambiguous rate and amount differences. Do not fetch/substitute rates or infer monetary status and presentation treatment.

Output: Transaction-rate and closing-retranslation variances, missing-rate cases and calculated foreign-exchange difference.

Human decision/review: Approve the rate source, determine whether average or historical rates are appropriate, identify monetary items and evaluate the accounting treatment of differences.

Unsupported/limit: The baseline does not retrieve rates automatically, select accounting rates, handle hedging, translate foreign operations or determine presentation of exchange differences.

Independent specification example EX-038: Foreign amount100; approved transaction rate2 functional units/foreign unit; ledger199; closing rate2.2.

Method: Functional=100*2=200; difference1; closing remeasurement base100*2.2=220.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"transaction_value": 200, "difference": 1, "closing_value": 220} | {"transaction_value": 200, "difference": 1, "closing_value": 220}; PASS - independent example assertion |
| Limit / edge case | Select quote direction/date/source; no automatic gain/loss-accounting decision.  |

Current recorded status: partial-evidence. Bounded application observation: approved payroll, tax and financing editions calculate exact outputs and reject unsupported inputs (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-039 - Equity roll-forward and authorization review

Source: F00010 p.21, card 39; F00011 matching card 39; F00009/F00012 catalogue entry 39. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Reconcile the movement in each equity component and show whether contributions, share changes and dividends have linked authorization evidence.

Inputs/schema: Required: equity component, opening balance, movement type and amount, profit linkage, closing ledger balance and authorization reference for share or dividend actions.

Proposed source method: 1. expected_close = opening + profit + contributions - distributions + signed_transfers + other_identified_movements. 2. Reconcile component closings to ledger and selected financial-statement version, retaining source movement references. 3. Check structured share/dividend actions link to supplied resolutions/register/payment support 4.  legal ownership/distributability remains auditor/legal work.

Output: An equity-component bridge and unsupported or unreconciled movement cases with linked evidence.

Human decision/review: Classify equity movements, assess the legal validity and timing of authorizations, approve evidence and determine presentation and disclosure consequences.

Unsupported/limit: The baseline does not interpret company law, validate legal ownership, account for complex equity instruments or determine whether a dividend was legally distributable.

Independent specification example EX-039: Equity opening100,profit20,contribution10,dividend5,closing124; dividend approval not supplied.

Method: Expected equity=100+20+10-5=125; separate missing-approval flag.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"expected": 125, "difference": 1, "missing_approval": 1} | {"expected": 125, "difference": 1, "missing_approval": 1}; PASS - independent example assertion |
| Limit / edge case | Arithmetic does not establish dividend legality or authorized capital change.  |

Current recorded status: partial-evidence. Bounded application observation: approved payroll, tax and financing editions calculate exact outputs and reject unsupported inputs (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-040 - Investment holdings, income and valuation-input review

Source: F00010 p.21, card 40; F00011 matching card 40; F00009/F00012 catalogue entry 40. Workflow owner G04; cases P09-UC02, P09-UC11.

Minimum outcome: Roll investment units and cost, reconcile positions and income with custodian and ledger records, and test simple yield inputs without concluding fair value.

Inputs/schema: Required: instrument identifier, opening holdings and cost, purchases, disposals, closing position, income, custodian statement and mapped ledger balances. Yield testing requires approved cash flows and rate.

Proposed source method: 1. expected_units = opening_units + acquired_units - disposed_units + signed_other_unit_movements 2.  keep cost movement basis separate. 3. Exact-match structured custody position/income and ledger totals at approved instrument/date/currency grain. 4. For the selected simple supported profile, present_value = sum(approved_cash_flow_t / (1 + compatible_rate)^t). Unsupported complex valuation or fair-value judgment is not computed.

Output: A holdings and income bridge, position differences, simple yield variance and stale or missing input cases.

Human decision/review: Confirm instrument classification and authoritative evidence, assess valuation techniques and assumptions, investigate differences and make recognition and fair-value conclusions.

Unsupported/limit: The baseline excludes market-data retrieval, complex valuation models, expected credit loss, hierarchy classification and any automatic fair-value conclusion.

Independent specification example EX-040: Security units10+purchase5-sale2; custody12; bounded valuation input future cash110,oneperiod10%.

Method: Expected13/custody difference1; supplied discounted cashflow110/1.1=100.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"units": 13, "custody_difference": 1, "bounded_present_value": 100} | {"units": 13, "custody_difference": 1, "bounded_present_value": 100}; PASS - independent example assertion |
| Limit / edge case | A simple supplied-cashflow calculation is not an IFRS fair-value model or market-price verification.  |

Current recorded status: partial-evidence. Bounded application observation: approved payroll, tax and financing editions calculate exact outputs and reject unsupported inputs (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-041 - Connected-party and related-party review

Source: F00010 p.22, card 41; F00011 matching card 41; F00009/F00012 catalogue entry 41. Workflow owner G04; cases P09-UC09, P09-UC11.

Minimum outcome: Match the declared related-party register to transaction counterparties and reconcile known related-party balances and transactions with draft disclosures.

Inputs/schema: Required: approved related-party register, counterparty masters, registration or bank identifiers, transaction and balance populations, and structured disclosure totals.

Proposed source method: 1. Exact-match approved related-party register to customer/supplier IDs, keeping unmatched declared parties and ambiguous matches. 2. Flag shared supplied registration/account identifiers with declared parties/employees/owners as candidates 3.  retain matching basis and source. 4. Aggregate known transactions/balances once per source item and compare structured disclosure totals. Candidate links do not prove the relationship or completeness.

Output: A relationship candidate list and party-level balance, transaction and disclosure reconciliation.

Human decision/review: Assess relationship completeness, substance and terms, investigate candidates, approve party mappings and conclude on accounting and disclosure adequacy.

Unsupported/limit: The baseline does not establish beneficial ownership, search external networks, interpret unusual commercial terms or conclude that a common identifier proves a relationship.

Independent specification example EX-041: Declared related partyA transactions10; Btransactions20 shares account only; disclosure9.

Method: Reconcile confirmed related-party amount10 to disclosure9; B remains an unconfirmed indicator.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"confirmed_amount": 10, "disclosure_difference": 1, "unconfirmed_indicator": 1} | {"confirmed_amount": 10, "disclosure_difference": 1, "unconfirmed_indicator": 1}; PASS - independent example assertion |
| Limit / edge case | Do not treat shared-account evidence alone as confirmed related-party status.  |

Current recorded status: partial-evidence. Bounded application observation: technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-042 - Estimate, allowance and impairment review

Source: F00010 p.22, card 42; F00011 matching card 42; F00009/F00012 catalogue entry 42. Workflow owner G04; cases P09-UC06, P09-UC11.

Minimum outcome: Recalculate a selected structured estimate schedule and identify differences or assumption changes that require auditor evaluation.

Inputs/schema: Required: estimate identifier, opening and movement schedule, closing ledger balance, method selection and approved assumptions. Aging profiles also require exposure buckets and rates.

Proposed source method: 1. expected_close = opening + additions - use - releases + signed_other_approved_movements under the estimate's sign convention. 2. For the supported aging-rate profile, expected_allowance = sum(eligible_exposure_bucket * approved_bucket_rate) after confirming disjoint population buckets. 3. Retain changed assumptions, management overrides and incomplete inputs for review 4.  no unsupported ECL/model/impairment judgment is generated.

Output: A schedule or allowance recalculation, ledger variance and assumption or override case list.

Human decision/review: Select an appropriate method, assess data and assumptions, challenge bias and overlays, obtain specialist input where needed and make the recognition or impairment conclusion.

Unsupported/limit: The baseline does not validate model design, generate assumptions, forecast economic variables, calculate unsupported complex ECL models or conclude impairment automatically.

Independent specification example EX-042: Supplied loss matrix buckets100*10% and200*20%; ledger45; provision rollforward40+20-10.

Method: Expected loss=10+40=50; compare45; independently roll40+20-10=50.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"matrix": 50, "difference": 5, "rollforward": 50} | {"matrix": 50.0, "difference": 5.0, "rollforward": 50}; PASS - independent example assertion |
| Limit / edge case | Rates, segmentation, forward-looking adjustments and recognition need auditor evaluation.  |

Current recorded status: partial-evidence. Bounded application observation: technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-043 - Consolidation and intercompany review

Source: F00010 p.23, card 43; F00011 matching card 43; F00009/F00012 catalogue entry 43. Workflow owner G04; cases P09-UC10, P09-UC11.

Minimum outcome: Reconcile approved component trial balances to consolidation inputs, sum mapped balances and identify unmatched exact intercompany balances and elimination residuals.

Inputs/schema: Required: approved component trial balances, consolidation inputs, entity and counterparty identifiers, mapping, intercompany balances, supplied eliminations and recorded consolidated totals.

Proposed source method: 1. Compare each component final TB with imported consolidation values and approved mapping 2.  no foreign-operation translation is inferred. 3. Pair reciprocal intercompany balances by approved entity-pair/account/currency/reference grain 4.  reciprocal_residual = receivable_plus_corresponding_payable under normalised signed convention. 5. expected_consolidated = sum(approved_component_amounts) + signed_supplied_eliminations. Show import/match/elimination residuals without creating automatic eliminations.

Output: A component bridge, intercompany balance cases and consolidated summation or elimination residuals.

Human decision/review: Confirm group scope, mappings, ownership and currency treatment, investigate unmatched items and approve consolidation and elimination judgments.

Unsupported/limit: The baseline excludes foreign-operation translation, complex ownership changes, intercompany transaction matching, tax effects and automatic creation of elimination journals.

Independent specification example EX-043: Components100/200; approved elimination-30; consolidated271; reciprocal receivable50/payable-45.

Method: Consolidated=100+200-30=270; compare271; reciprocal net5.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"consolidated": 270, "difference": -1, "reciprocal_residual": 5} | {"consolidated": 270, "difference": -1, "reciprocal_residual": 5}; PASS - independent example assertion |
| Limit / edge case | Common reporting policy, dates/currencies and ownership/elimination support are prerequisites.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R16 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-044 - Going-concern financial indicators

Source: F00010 p.23, card 44; F00011 matching card 44; F00009/F00012 catalogue entry 44. Workflow owner G05; cases P09-UC08, P09-UC11.

Minimum outcome: Calculate a controlled set of liquidity, maturity, covenant-headroom and cash-runway indicators for use in the auditor's going-concern assessment.

Inputs/schema: Required: reporting-date cash, current assets and liabilities, debt maturities, approved facilities, covenant results and management cash-flow forecast.

Proposed source method: 1. Compute only approved ratios, e.g. current_ratio = current_assets / current_liabilities with a valid nonzero denominator and agreed sign basis. 2. liquidity_headroom = available_cash + approved_available_facilities - scoped_due_obligations 3.  assess restrictions on availability from supplied facts. 4. Cash runway is the first period in the supplied cumulative forecast with cash below the approved floor, or beyond-forecast/not-evaluable. Indicators do not decide going concern.

Output: An indicator pack showing liquidity, maturity concentrations, covenant headroom, cash runway and incomplete calculations.

Human decision/review: Select appropriate indicators and forecast period, test source assumptions and mitigating actions, assess feasibility and make the going-concern and reporting conclusions.

Unsupported/limit: The baseline does not validate management's forecast, estimate financing availability, model unrestricted scenarios or determine material uncertainty or report wording.

Independent specification example EX-044: Current assets200/liabilities100; cash20+committed accessible facility10-due25; forecast balances20,5,-2; floor0.

Method: Current ratio2; simple headroom5; first forecast breach period3.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"current_ratio": 2, "headroom": 5, "first_breach_period": 3} | {"current_ratio": 2.0, "headroom": 5, "first_breach_period": 3}; PASS - independent example assertion |
| Limit / edge case | Ratios and forecast deficits do not automatically conclude going-concern adequacy.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R17 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-045 - Subsequent-event transaction review

Source: F00010 p.24, card 45; F00011 matching card 45; F00009/F00012 catalogue entry 45. Workflow owner G05; cases P09-UC07, P09-UC11.

Minimum outcome: Identify material post-period transactions and exact links to year-end balances so the auditor can investigate possible subsequent events once.

Inputs/schema: Required: reporting date, review end date, post-period transaction identifier, type, date, amount, counterparty and year-end source reference where available.

Proposed source method: 1. Select post-period transactions satisfying reporting_date < transaction_date <= approved_review_end and the approved type/amount criteria. 2. Exact-match year-end source references where supplied 3.  retain unmatched and ambiguous cases without semantic inference. 4. Deduplicate repeated appearances by verified economic-event identity, preserving source rows and all triggers. Auditor determines event treatment.

Output: One post-period event case set with linked year-end records, trigger reason and unresolved status.

Human decision/review: Define the review window and thresholds, investigate the underlying event and conditions, and decide adjusting, non-adjusting, disclosure and reporting treatment.

Unsupported/limit: The baseline does not search news or legal sources, infer event meaning from narrative documents or make the adjusting versus non-adjusting conclusion.

Independent specification example EX-045: Yearend2026-12-31; approved search end2027-02-15; Jan10event100 and Mar1event100; example threshold50.

Method: Select explicit subsequent-event window and threshold; retain one event per source identity.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"in_window_candidates": 1} | {"in_window_candidates": 1}; PASS - independent example assertion |
| Limit / edge case | An event requires human adjusting/non-adjusting and disclosure assessment.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R17 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-046 - Materiality management

Source: F00010 p.24, card 46; F00011 matching card 46; F00009/F00012 catalogue entry 46. Workflow owner G02; cases P06-UC03, P06-UC05.

Minimum outcome: Calculate and preserve approved overall, performance and clearly-trivial materiality amounts from auditor-selected benchmarks and percentages.

Inputs/schema: Required: benchmark type and amount, overall and performance percentages, clearly-trivial basis, reporting period, rationale and required approval.

Proposed source method: 1. Calculate and retain the benchmark-derived candidate overall amount and any candidate dependent thresholds under explicitly declared bases. 2. Record the human-selected overall/specific/performance/trivial determinations and rationale separately. If the selected method bases dependent thresholds on selected overall, recompute from that selected amount; do not leave stale candidate-dependent values as current selections. 3. Compare old/new selected amounts and identify affected work for targeted assessment. No percentage/benchmark/base or sampling redesign is a universal default.

Output: An approved materiality record containing calculated and overridden thresholds, rationale and revision comparison.

Human decision/review: Select and justify the benchmark and percentages, approve overrides, consider qualitative materiality and decide which audit work must change after revision.

Unsupported/limit: The baseline does not select benchmarks, prescribe firm methodology, evaluate qualitative materiality or automatically redesign sampling and audit procedures.

Independent specification example EX-046: EXAMPLE benchmark10000,overall1%,performance70%of selected overall,trivial5%of selected overall. Calculated overall100; auditor selects overall95 with reason.

Method: Retain candidate100/70/5. Under this explicitly chosen selected-overall basis, recompute performance95*70%=66.5 and trivial95*5%=4.75.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"calculated_overall": "100", "candidate_performance": "70", "candidate_trivial": "5", "selected_overall": "95", "selected_performance": "66.5", "selected_trivial": "4.75"} | {"calculated_overall": "100", "candidate_performance": "70", "candidate_trivial": "5", "selected_overall": "95", "selected_performance": "66.5", "selected_trivial": "4.75"}; PASS - independent example assertion |
| Limit / edge case | No benchmark/rate/default approval is inferred. The downstream base is an explicit example method choice; other approved methods need their own declared bases (D12).  |

Current recorded status: partial-evidence. Bounded application observation: selected materiality overrides bind source rows and reopen sampling and evaluation without losing signed history (tests/pilot-materiality.test.mjs); approved materiality and its revision govern the same sample and misstatement evaluation (tests/pilot.test.mjs); the extended engagement preserves its original 34-register journey and scoped recoverable archive (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R12 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-047 - Audit sampling workspace

Source: F00010 p.25, card 47; F00011 matching card 47; F00009/F00012 catalogue entry 47. Workflow owner G04; cases P07-UC02, P07-UC03.

Minimum outcome: Draw a reproducible simple random sample from a reconciled population and evaluate recorded monetary errors under one approved projection method.

Inputs/schema: Required: reconciled population with stable item identifiers and amounts, eligibility rules, approved sample size, random seed and tested error for selected items.

Proposed source method: 1. Validate reconciled population N and approved integer sample size 0 < n <= N 2.  retain stable ordered IDs and exclusions. 3. Use a named/versioned uniform no-replacement procedure (e.g. Fisher-Yates with unbiased integer draws), retained PRNG/seed and ordering 4.  same bindings must reproduce the selection. 5. For approved simple ratio projection, projected_population_error = sample_error / sample_book_amount * population_book_amount. Nonpositive/invalid denominator, mixed-sign unsupported units or untested selected units require explicit limitation, not clean projection. 6. The eligible population amount in an inclusive ratio projection includes the tested sample units. Add known full-tested errors outside that eligible population once; do not add observed sampled error again. Stratified and monetary-unit methods are outside this minimum.

Output: A population basis, reproducible selection list, recorded test results and simple projected misstatement.

Human decision/review: Define the population and sampling unit, determine whether the method and sample size are appropriate, perform audit testing and evaluate qualitative and sampling risk.

Unsupported/limit: The baseline does not calculate statistical confidence, select an audit methodology, support monetary-unit or stratified sampling, or replace auditor evaluation of results.

Independent specification example EX-047: Approved simple without-replacement profile; population IDs1..5,n2,seed7. Sample error5/book100; eligible residual population book1000 including sampled units; separate fully-tested known error10.

Method: Python random.sample with pinned method/version gives[3,2]. Simple ratio projected error5/100*1000=50 includes observed sample error; add separate known10 once.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"selected": [3, 2], "projected_including_sample": 50, "separate_known": 10, "total": 60} | {"selected": [3, 2], "projected_including_sample": 50, "separate_known": 10, "total": 60}; PASS - independent example assertion |
| Limit / edge case | Size and projection appropriateness require actual supported human decisions. Stratified/MUS methods are outside this minimum. Unquantified sampling risk is not zero or statistical confidence. Reject n>N and duplicate population unit IDs; seed without fixed population order/method is insufficient for reproducibility. |

Current recorded status: partial-evidence. Bounded application observation: approved data feeds the same scoped analytics, multipart confirmation and sampled source rows (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R15 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-048 - Misstatement management and evaluation

Source: F00010 p.25, card 48; F00011 matching card 48; F00009/F00012 catalogue entry 48. Workflow owner G05; cases P10-UC02, P10-UC03.

Minimum outcome: Maintain one controlled record for each confirmed misstatement, track correction status and aggregate recorded effects against approved materiality.

Inputs/schema: Required: source case, affected account and statement line, amount, period, classification, correction status and active materiality version.

Proposed source method: 1. Create one canonical confirmed misstatement per verified source issue 2.  separate distinct issues even if amounts match. 3. Retain factual/projected/tax/prior-period inclusion basis and corrected/unadjusted status. An inclusive projected amount is not added again to its embedded factual errors. 4. Aggregate on approved nonduplicating bases by period/currency/classification and compare approved materiality. Qualitative evaluation and opinion selection remain human.

Output: A canonical misstatement register, correction summary and aggregate comparison with materiality.

Human decision/review: Confirm whether an exception is a misstatement, determine measurement and classification, verify management's correction and make quantitative and qualitative aggregate conclusions.

Unsupported/limit: The baseline does not infer misstatements from exceptions, verify final-ledger posting automatically, determine qualitative materiality or select an audit opinion.

Independent specification example EX-048: FindingA100 verified posted; B200 agreed/unposted; C300 declined/unposted.

Method: Exclude only verified posted correction from uncorrected total.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"uncorrected": 500, "verified_posted": 100} | {"uncorrected": 500, "verified_posted": 100}; PASS - independent example assertion |
| Limit / edge case | Agreement alone is not posting; qualitative significance is evaluated separately.  |

Current recorded status: partial-evidence. Bounded application observation: technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R18 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-049 - Legal matters, commitments and contingencies

Source: F00010 p.26, card 49; F00011 matching card 49; F00009/F00012 catalogue entry 49. Workflow owner G05; cases P09-UC09, P09-UC11.

Minimum outcome: Maintain a complete, reviewed register of identified legal matters, commitments and contingencies with supporting evidence and accounting or disclosure disposition.

Inputs/schema: Required: matter identifier, type, status, relevant dates, management assessment, linked evidence, proposed accounting or disclosure treatment and reviewer assignment.

Proposed source method: 1. Maintain one identified matter with source/support and explicitly known/unknown exposure/status 2.  completeness is assessed, not inferred from register presence. 3. Require supported accounting/disclosure disposition and assigned auditor/reviewer for every applicable active matter. 4. Flag missing support, overdue update and unresolved disposition. Do not predict legal outcomes, measure provisions or decide recognition autonomously.

Output: A matter register and completion view showing current evidence, disposition, reviewer status and unresolved matters.

Human decision/review: Identify matters, assess completeness and legal evidence, obtain specialist or counsel input, evaluate recognition and disclosure, and make the audit conclusion.

Unsupported/limit: The baseline does not discover undeclared matters, interpret legal outcomes, estimate provisions or determine recognition and disclosure automatically.

Independent specification example EX-049: MatterM1 exposure unknown/evidence absent; M2 has required support and human conclusion.

Method: Evaluate explicitly required completion items; retain unknown as unknown.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"open": 1, "ready_for_review": 1, "unknown_exposure": 1} | {"open": 1, "ready_for_review": 1, "unknown_exposure": 1}; PASS - independent example assertion |
| Limit / edge case | An unknown amount is not zero, and a complete record is not automatic matter clearance.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R17 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-050 - Going-concern evidence and conclusion

Source: F00010 p.26, card 50; F00011 matching card 50; F00009/F00012 catalogue entry 50. Workflow owner G05; cases P09-UC08, P09-UC11.

Minimum outcome: Provide a controlled workflow linking identified going-concern conditions, management's assessment, supporting evidence, mitigating actions and the auditor's reviewed conclusion.

Inputs/schema: Required: management assessment, identified conditions, forecast evidence, mitigating actions, auditor evaluation, disclosure decision, reporting decision and assigned approvals.

Proposed source method: 1. Link each identified condition and mitigation to exact source versions, responsible owner, timing and status. 2. Require auditor challenge/evaluation, uncertainty/conclusion and disclosure/reporting decisions with the required review. 3. Flag missing support and structured contradictions. No automatic assertion that financing is feasible or that forecast arithmetic proves going concern.

Output: An evidence-to-conclusion matrix with unresolved conditions, review status and the approved auditor-owned conclusion.

Human decision/review: Challenge forecasts and mitigating actions, assess evidence and material uncertainty, determine disclosure adequacy and select the appropriate audit-report treatment.

Unsupported/limit: The baseline does not validate forecasts, prove financing feasibility, choose the going-concern conclusion or generate the audit opinion and wording.

Independent specification example EX-050: Going-concern condition has unsupported mitigation and no auditor conclusion; numerical forecast check passed.

Method: Required support and human conclusion remain missing regardless of numerical pass.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"unresolved": 1, "ready": false} | {"unresolved": 1, "ready": false}; PASS - independent example assertion |
| Limit / edge case | No automatic going-concern or audit-opinion conclusion.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R17 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-051 - Subsequent-event inquiry and completion

Source: F00010 p.27, card 51; F00011 matching card 51; F00009/F00012 catalogue entry 51. Workflow owner G05; cases P09-UC07, P10-UC08.

Minimum outcome: Document that required subsequent-event inquiries and source reviews were completed through the intended auditor's-report date and every identified event was resolved.

Inputs/schema: Required: reporting and intended report dates, applicable inquiry or source-review list, completion evidence, identified event details, treatment decision and reviewer assignment.

Proposed source method: 1. Track required inquiries/source reviews with performer, completed date and explicit coverage end through intended report date. 2. Maintain each event with facts, adjusting/nonadjusting assessment, disclosure/report effect and review. 3. Required missing/stale/unresolved work blocks the corresponding completion. Earlier procedure performance date alone is not proof of coverage to the final date.

Output: A dated completion checklist and event register showing treatment, evidence, review and unresolved items.

Human decision/review: Perform inquiries and document review, identify relevant events, evaluate conditions at the reporting date and conclude on adjustment, disclosure and report implications.

Unsupported/limit: The baseline does not search transactions or external news, decide event treatment automatically or prove that inquiry procedures identified every possible event.

Independent specification example EX-051: Proposed report2027-02-28; supported subsequent-events work covered through2027-02-20.

Method: Calculate uncovered time span to proposed report boundary; readiness requires actual supported coverage through that boundary.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"gap_days": 8, "ready": false} | {"gap_days": 8, "ready": false}; PASS - independent example assertion |
| Limit / edge case | Dates alone do not prove adequate procedures. Coverage through report date may be current only if actual work supports it. |

Current recorded status: partial-evidence. Bounded application observation: technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R17 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-052 - Disclosure applicability and completion

Source: F00010 p.27, card 52; F00011 matching card 52; F00009/F00012 catalogue entry 52. Workflow owner G05; cases P10-UC04.

Minimum outcome: Show that each auditor-selected applicable disclosure requirement is linked to a completed note and supporting evidence or to an approved non-applicability rationale.

Inputs/schema: Required: controlled disclosure checklist version, entity and reporting-framework context, applicability decision, exact note reference, evidence link and required review.

Proposed source method: 1. Instantiate a controlled disclosure checklist for selected framework/edition/period 2.  auditor selects applicability with rationale. 3. For applicable items require exact selected note/version anchor, support and required preparer/reviewer disposition. 4. Flag missing note/support/review or unsupported N/A. Completed checklist does not establish full semantic compliance or fair presentation.

Output: An applicable-disclosure checklist and missing-note, support or approval register.

Human decision/review: Determine applicability and adequacy, interpret the reporting framework, prepare or audit the disclosure and approve justified non-applicability conclusions.

Unsupported/limit: The baseline does not infer applicability from transactions, read narrative notes for semantic compliance or conclude that a completed checklist proves fair presentation.

Independent specification example EX-052: Applicable disclosureA anchored/reviewed; applicableB has no note anchor; C justified N/A.

Method: Require support/anchor only for applicable requirements; distinguish N/A.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"missing_applicable": 1, "justified_na": 1} | {"missing_applicable": 1, "justified_na": 1}; PASS - independent example assertion |
| Limit / edge case | Checklist coverage does not establish accuracy or semantic compliance of disclosures.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R18 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-053 - Audit-area completion and conclusion

Source: F00010 p.28, card 53; F00011 matching card 53; F00009/F00012 catalogue entry 53. Workflow owner G05; cases P09-UC11.

Minimum outcome: Prevent an audit area from being completed until applicable procedures, evidence, exceptions and required reviews are resolved or formally approved as not performed.

Inputs/schema: Required: area scope, applicable procedure list, procedure statuses, evidence and exception links, required roles, sign-offs and auditor conclusion.

Proposed source method: 1. For each applicable procedure require actual result/support or an authorised justified non-performance disposition and alternatives as applicable. 2. Expose unresolved exceptions, notes, stale work and missing required reviews as area-specific blockers. 3. After supported resolution an authorised auditor records area conclusion. No machine status chooses evidence sufficiency or automatically waives work.

Output: An area-completion dashboard, explicit blocker list and approved auditor-owned conclusion record.

Human decision/review: Determine procedure applicability and sufficiency, evaluate evidence and exceptions, resolve blockers and own the professional conclusion for the audit area.

Unsupported/limit: The baseline does not determine whether evidence is sufficient, choose the conclusion, infer an audit opinion or automatically waive incomplete procedures.

Independent specification example EX-053: Required proceduresA performed; B justified N/A with required alternative addressed; C required/unperformed.

Method: Evaluate required performance/authorized nonperformance and required alternative completion separately.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"unperformed_blockers": 1} | {"unperformed_blockers": 1}; PASS - independent example assertion |
| Limit / edge case | Performance flags do not establish evidence sufficiency or quality.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R18 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-054 - Risk-response linkage and change-impact control

Source: F00010 p.28, card 54; F00011 matching card 54; F00009/F00012 catalogue entry 54. Workflow owner G05; cases P06-UC02, P11-UC07.

Minimum outcome: Maintain traceable links from assessed risks through audit responses, procedures, evidence and conclusions and identify work affected by approved changes.

Inputs/schema: Required: stable risk, response, procedure, evidence and conclusion identifiers; status and approval; and recorded change events.

Proposed source method: 1. Validate risk-response links and applicable response-to-procedure links. Overall staffing/supervision responses can instead link resources/arrangements 2.  source executable-procedure wording is narrowed by response kind. 3. Flag orphan required links under the approved risk/response scope 4.  keep many-to-many links and contextual optionality. 5. On approved change mark directly dependent work for reassessment with actor/owner and rationale. Do not infer every indirect impact or automatically redesign procedures.

Output: A risk-response coverage view and affected-work register showing broken links and reassessment status.

Human decision/review: Assess risks, design and approve responses, decide the actual impact of changes and reperform or reapprove work where necessary.

Unsupported/limit: The baseline does not assess risks automatically, redesign audit procedures, infer every indirect dependency or decide that prior evidence remains sufficient after change.

Independent specification example EX-054: RiskR1 linked to response/procedure; R2 has none. Overall resource arrangement is separately linked to overall risk.

Method: Require the selected risk-specific response links; do not demand a fake procedure for an overall arrangement.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"orphan_specific_risks": 1} | {"orphan_specific_risks": 1}; PASS - independent example assertion |
| Limit / edge case | Link presence does not establish an appropriate risk response.  |

Current recorded status: unverified. No direct minimum-level application observation is mapped; inspect the owning method before deciding what is missing. No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R19 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-055 - Exception, review-note and sign-off closure

Source: F00010 p.29, card 55; F00011 matching card 55; F00009/F00012 catalogue entry 55. Workflow owner G05; cases P11-UC01, P11-UC02.

Minimum outcome: Provide one controlled queue for unresolved exceptions, review notes and required sign-offs and prevent engagement completion while mandatory items remain open.

Inputs/schema: Required: source work item, exception or note, owner, required approver roles, status, resolution evidence and completion-gate configuration.

Proposed source method: 1. Register each closure item once with source, owner, status and support. A reply or task close is not reviewer clearance. 2. Evaluate configured preparer/reviewer/partner requirements against exact targets and eligible capacities 3.  keep rejected/withdrawn/reopened states. 4. Expose relevant engagement blockers and preserve resolution/reopening history. Optional consolidation of queues is not a substitute for judgments.

Output: A consolidated closure queue and completion-blocker report with ownership, aging and resolution history.

Human decision/review: Investigate and resolve exceptions, clear review notes, provide required evidence and exercise the authority to approve, reject or reopen work.

Unsupported/limit: The baseline does not resolve findings automatically, determine evidence sufficiency, infer role conflicts beyond configured rules or substitute closure status for audit judgment.

Independent specification example EX-055: One review note RESPONDED not CLEARED; one selected required R2 sign-off missing.

Method: Keep review-note clearance and required sign-off completion as separate checks.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"uncleared_notes": 1, "missing_signoffs": 1} | {"uncleared_notes": 1, "missing_signoffs": 1}; PASS - independent example assertion |
| Limit / edge case | Do not close a note automatically when a response is uploaded.  |

Current recorded status: partial-evidence. Bounded application observation: technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R19 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-056 - Final statements, conclusions and report consistency

Source: F00010 p.29, card 56; F00011 matching card 56; F00009/F00012 catalogue entry 56. Workflow owner G06; cases P10-UC06, P10-UC07.

Minimum outcome: Bind the proposed auditor's report to exact approved financial-statement and audit-conclusion versions and expose structured contradictions for partner resolution.

Inputs/schema: Required: exact financial-statement version, approved area and engagement conclusions, structured report decisions, report draft version and required technical or partner review.

Proposed source method: 1. Bind exact statement/conclusion versions and approved structured reporting decisions to the draft report. 2. Apply the approved decision-table combinations for opinion/basis/going-concern/section states 3.  missing or incompatible states yield unresolved contradictions. 4. Require authorised technical/partner resolution and retain rationale/version. Structural consistency is not semantic/legal approval of report wording.

Output: A report-consistency checklist with linked source versions, contradictions, resolutions and final approval status.

Human decision/review: Evaluate the audit evidence, select the opinion and report sections, determine legally and methodologically appropriate wording and approve the final report.

Unsupported/limit: The baseline does not select an opinion, draft unrestricted report wording, perform semantic legal review or conclude that structural consistency establishes reporting appropriateness.

Independent specification example EX-056: Report references financial statementsv1; authorization selected statement packagev2.

Method: Compare exact relied-upon report/FS bindings, not filenames.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"contradictions": 1, "ready": false} | {"contradictions": 1, "ready": false}; PASS - independent example assertion |
| Limit / edge case | Mismatch detection cannot select or change the professional opinion.  |

Current recorded status: partial-evidence. Bounded application observation: approved report preparation connects exact issue to independently completed assembly and custody (tests/pilot-reporting.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R20 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-057 - Report approval, issuance and distribution

Source: F00010 p.30, card 57; F00011 matching card 57; F00009/F00012 catalogue entry 57. Workflow owner G06; cases P10-UC08.

Minimum outcome: Issue only the exact auditor's-report version approved by an authorized partner and preserve an immutable record of what was issued, when and to whom.

Inputs/schema: Required: final report and statement versions, authorized partner identity and approval, intended issue date, approved recipient list and engagement issuance status.

Proposed source method: 1. Validate exact approved report/full-statement package bindings, actual authorization and permitted issuer/recipient scope. 2. Retain package authorization separately from the actual defined issue event/time. An identical operation identity with identical bound payload returns the same outcome; reuse with changed payload is rejected. Unknown external outcomes are reconciled before retry. 3. Record actual per-recipient distribution/replacement/withdrawal attempts and outcomes separately from authorization/issue. No signing, receipt, filing or legal-validity service is established by this specification.

Output: An immutable issued-report record, exact approval evidence and recipient-level distribution log.

Human decision/review: Confirm authorization to issue, approve the final report and recipients, comply with legal delivery requirements and authorize any withdrawal or replacement.

Unsupported/limit: The baseline does not provide regulated electronic signatures, file directly with authorities, prove external receipt or determine whether legal issuance conditions have been satisfied.

Independent specification example EX-057: Approved exact pairsR2/FS2 andR3/FS3. CMD1 R2/FS2 repeated; sameCMD1 changed toR3/FS3 rejected. WrongR2/FS1 rejected. DeliveryA succeeds/Bfails.

Method: Validate pair and command/content correlation; identical repeat yields same effect, changed payload with reused command fails; retain each actual recipient outcome.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"wrong_pair_rejected": true, "changed_payload_rejected": true, "release_effects": 1, "delivered": 1, "failed": 1, "distribution": "partial"} | {"wrong_pair_rejected": true, "changed_payload_rejected": true, "release_effects": 1, "delivered": 1, "failed": 1, "distribution": "partial"}; PASS - independent example assertion |
| Limit / edge case | This fixture specifies behavior; no live dispatch/signing/idempotency implementation was tested.  |

Current recorded status: partial-evidence. Bounded application observation: approved report preparation connects exact issue to independently completed assembly and custody (tests/pilot-reporting.test.mjs); technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R20 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## AUTO-058 - Engagement-file lock, retention and amendments

Source: F00010 p.30, card 58; F00011 matching card 58; F00009/F00012 catalogue entry 58. Workflow owner G07; cases P12-UC02.

Minimum outcome: Lock the completed engagement file against ordinary editing, calculate its retention date and preserve every authorized post-lock amendment and re-lock event.

Inputs/schema: Required: engagement file index and versions, completion-gate status, authorized locking role, retention-policy version and any amendment request and approval.

Proposed source method: 1. Lock only the exact manifest/payload after configured completion conditions are evaluated 2.  preserve assembly and lock events separately. 3. Calculate retention only under an approved applicable policy/anchor. Do not implement ten-year law as a guessed clock anchor, and check holds before disposal. 4. Restrict ordinary editing 5.  authorised amendments retain old/new content, reason, affected review and re-lock. Write-once infrastructure and cross-repository disposal are not assumed. 6. Hold management is excluded from this automation minimum. The separate M12-F08 requirement still requires hold eligibility before disposition; D19 records this boundary. Calendar-year arithmetic needs an explicit leap-day rule where applicable; an undefined anchor/calendar rule stays not evaluable.

Output: A lock and archive status record, retention schedule and immutable amendment history.

Human decision/review: Confirm completion, approve lock or reopening, select the applicable retention rule, assess affected audit work and authorize lawful amendment or disposal.

Unsupported/limit: The baseline does not provide write-once storage, manage legal holds, determine jurisdictional retention law or automate defensible disposal across external repositories.

Independent specification example EX-058: Locked manifestM1,approved amendmentM2. TEST retention policy anchor2026-12-31+10calendar years. Anchor not asserted as statutory rule.

Method: Retain old manifest; calculate only the selected supported policy date. Unknown anchor => not evaluable; leap-day policy must be explicit.


| Expected result | Historical actual / boundary |
| --- | --- |
| {"retention_date": "2036-12-31", "manifests_retained": 2, "unknown_anchor": "not evaluable"} | {"retention_date": "2036-12-31", "manifests_retained": 2, "unknown_anchor": "not evaluable"}; PASS - independent example assertion |
| Limit / edge case | AUTO-058 minimum does not manage holds. M12 hold checks/longer restrictions are separate; date alone never authorizes destruction.  |

Current recorded status: partial-evidence. Bounded application observation: approved report preparation connects exact issue to independently completed assembly and custody (tests/pilot-reporting.test.mjs); the extended engagement preserves its original 34-register journey and scoped recoverable archive (tests/pilot.test.mjs); technical changes, posting verification, exact-package EQR and independent custody form one scoped cycle (tests/pilot.test.mjs). No independent whole-minimum acceptance is recorded.

Implementation delta and proof: R21 reconciles this exact minimum with its actual current profile; implement missing supported behavior, retain algorithm/edition identity and unsupported outcomes, then test normal/exception/missing/denied/change/retry cases with independent expected values. Source replacement or parameter/mapping/method change creates a new run and affected review. Preserve old inputs/results/findings and do not duplicate exposure. See acceptance_register.csv for the generic scenario contract and the domain guide for persisted handoffs.

## Glossary

Minimum: selected bounded useful outcome, not every possible extension. Example PASS: historical specification assertion, not runtime proof. Edition: approved rule content and effective basis. Run: immutable exact-input calculation result plus separate auditor disposition. Not evaluable: required method inputs or applicability are unsupported, distinct from a passing zero. Original Mongolian labels remain in source/form/area registers and owning guides.

## Pinned code and external reference locators

All following code locators refer to the local 079f9da snapshot. File hashes and the complete symbol/action index are in code_observation_index.csv/json. The remote main/PR do not contain all of these local additions.

- scripts/pilot-area-checks.mjs: grouped at line 23; parseAreaFile at line 32; caseBook at line 73; add at line 75; qualified at line 92. SHA-256 45011285458d8f4a8e447deddf9175159ec79e28d9e82cebe582800d0f53084f.
- scripts/pilot-area-statutory.mjs: selectEdition at line 13; ruleAt at line 19; referenceGroups at line 25; flagUnmatched at line 30; payrollAnalytics at line 36. SHA-256 6db65427f6677e6582b6c783f5f59bc9a09a838c49ad97c10860c950b66ba9b1.
- scripts/pilot-area-finance.mjs: versioned at line 18; ledgerGroups at line 24; extras at line 31; caseFor at line 36; checkedPv at line 42. SHA-256 bfcf57b2e0004872ec5016564b8c45fbc67db32c8d9eaad088842e00b3d7c8f4.
- scripts/pilot-materiality.mjs: materialityBasis at line 16; materialityEvidenceCurrent at line 30; syncMateriality at line 35; materialityValues at line 48; materialityGap at line 58. SHA-256 07edce9e7d1751ba6398165bcc539ea74d6efddf9faee0196d74e97c27142f77.
- scripts/pilot-sampling.mjs: inputs at line 14; samplingView at line 41; samplingGap at line 48; syncSamplePapers at line 60; samplingAction at line 73. SHA-256 ac5433ff040d27517919898f20dd05258e14a1c67067eadb9bc1f1ed12b5d64a.

External reference pointers support the specific edition/applicability discussion, not whole-standard compliance. Fresh inspection limits, publication/effective dates and the retained original paragraph register are in external_research.csv and standards_source_edition.csv.

- [EXT01 - IAASB, Handbook Volume 1](https://ifacweb.blob.core.windows.net/publicfiles/2025-09/IAASB-2025-Handbook-Volume-1.pdf): 2025; ISA 320 paras 9-14; PDF pp329-330 (1-based). Selected text inspected, not the full 1046-page volume. Accessed 16 November 2026.
- [EXT02 - IAASB, Handbook Volume 1](https://ifacweb.blob.core.windows.net/publicfiles/2025-09/IAASB-2025-Handbook-Volume-1.pdf): 2025; ISA 530 paras 6-15; PDF p416 (1-based). Selected text inspected; sample ratio method is proposed, not a prescribed ISA formula. Accessed 16 November 2026.

The per-minimum automation_runtime_profiles.csv/json separates exact current wire types from proposed/source-only input requirements. current_area_typed_schemas provides all 35 declared area CSV schemas. An unassigned dedicated API schema is an explicit remaining contract task, not permission to invent data or claim the minimum complete.
