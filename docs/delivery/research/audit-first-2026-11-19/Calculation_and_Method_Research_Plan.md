# Calculation and method research plan

**Status:** 36 PLANNED method work packages. This is a validation plan, not adoption of 36 new native engines. Required support follows original source and approved offering. **Parent:** [execution index](README.md). Every pack receives REQUIRED-NATIVE / SUPPORTED-MANUAL-JUDGMENT / SPECIALIST / CONDITIONAL / HOLD / OUT-OF-SCOPE with original-ID justification; a manual route cannot silently replace a required automated outcome.

## Common mandatory method protocol

1. Read exact original method/source cells and current G11 profile/commands. Separate historical specification examples, engineering execution evidence and professional adoption.
2. Retrieve full applicable international/accounting/audit paragraphs, relevant interpretation/amendment and local adoption/firm policy. Label binding requirement, policy election, numerical implementation choice and professional judgment separately.
3. Specify typed input grain, provenance, entity/period/currency/unit, date/day-count, sign, null/zero, precision, rounding level and tolerance; state prerequisites and invalid/unsupported outcomes.
4. Derive chosen numerical method, estimator or decision table, including assumptions and limitations. Alternative formulas are compared only where relevant to source/offering. For statistical algorithms retrieve original methodological sources and assumptions; generic internet calculators are insufficient.
5. Produce expected examples independently of application code: hand calculation for a small transparent case plus a separately implemented workbook/script or authoritative worked example as appropriate. Record checker identity, formula, inputs, precision and actual expected values. A spreadsheet copied from the same implementation is not independent.
6. Design normal/boundary/adverse/missing/unsupported/changed-source/retry/denied cases, including interactions with approved mappings and other method outputs. Add accounting invariants such as roll-forward, disjoint effects and cross-cast where relevant.
7. Practitioner approves policy/interpretation; numerical checker verifies arithmetic/statistics; engineer implements approved delta; QA compares exact outputs; practitioner then accepts actual source workflow on a pinned build.

All example CU amounts below are **synthetic currency units**, not actual client data, prices, exchange rates or statutory rates. Numerical illustrations are bounded mathematical examples with stated assumptions; they are not a generally adopted accounting/audit policy. Every production calculation still needs completed method research and review.

## Mandatory method-specification fields

Use [method specification template](templates/Method_Specification_Template.md): original IDs and exact source; scope/framework/jurisdiction/edition/period; standard paragraph and rule/policy classification; input/output schema; algorithm/decision table; assumptions/alternatives; decimal precision/rounding/sign/date/unit; exceptions/unsupported conditions; source/mapping/parameter versions; independent expected vectors; practitioner and numerical review; downstream finding/report effects; migration/staleness; actual execution evidence.

## Individual research packs

<a id="m01"></a>

### M01 — Population integrity, control totals and reconciliations

**Owning domains:** D03 D05 D06 D08 D13. **Original minimums:** AUTO-001, AUTO-002, AUTO-003, AUTO-004, AUTO-005, AUTO-008, AUTO-011, AUTO-016, AUTO-022, AUTO-031

**Question:** What reconciliation proves transfer integrity, and what independent evidence addresses completeness?

**Standards/policy to verify:** ISA 500, 510; source import contracts. **Retrieved starting sources:** [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance), [SRC-09](https://www.ifrs.org/issued-standards/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Define extraction scope, source counts, signed debit/credit totals, row grain and disjoint accepted/quarantined/excluded sets.
2. Research identifier uniqueness, historical master validity, opening balances and joined-table cardinality.
3. Write count and amount bridges by entity/period/currency; specify tolerances and residual treatment.

**Inputs to specify:** Source manifest; original row IDs; certified totals; statuses; exclusions; entity/period/currency/sign/scale.

**Independent validation to produce:** Independent small population with omitted, duplicated, null, negative and quarantined rows; totals recomputed outside application. Balanced bridge must still disclose source-extract completeness limit.

**Unsupported/judgment boundary:** Never coerce malformed values to zero, delete suspect duplicates or call an internally balanced extract complete.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m02"></a>

### M02 — Allocations, adjustments and financial statement bridges

**Owning domains:** D03 D05 D08 D13. **Original minimums:** AUTO-006, AUTO-007, AUTO-043, AUTO-056

**Question:** How can source rows contribute to statements and notes without duplicate economic effects?

**Standards/policy to verify:** Applicable IAS 1/IFRS 18, IAS 8, IAS 7 and disclosure standards; ISA 500. **Retrieved starting sources:** [SRC-07](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/), [SRC-09](https://www.ifrs.org/issued-standards/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Specify source grain and mapping coefficients, residuals, account splits, overlapping presentation and controlled many-to-many links.
2. Research adjustment/posting/reversal and comparative restatement rules; distinguish linked presentation from financial aggregation.
3. Define cast/cross-cast and statement/note/cash-flow bridges with materiality-independent integrity checks.

**Inputs to specify:** Approved TB/GL; mappings; allocation basis; journals; statement/node graph; period/currency.

**Independent validation to produce:** Split one source amount between destinations, then show it in a note: financial total unchanged; adjustment/reversal applied once. Independent line-level bridge identifies every difference.

**Unsupported/judgment boundary:** A balancing plug or forced allocation cannot hide unknown mapping; IFRS Taxonomy tags alone do not prove correct recognition/presentation.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m03"></a>

### M03 — Materiality and clearly trivial thresholds

**Owning domains:** D04 D07 D09. **Original minimums:** AUTO-046

**Question:** Which values are computed and which choices require professional judgment?

**Standards/policy to verify:** ISA 320, 450; approved firm policy. **Retrieved starting sources:** [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance), [SRC-20](https://standards.auasb.gov.au/asa-320-apr-2022). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research benchmark selection/normalization, qualitative circumstances, performance and specific materiality, and revision.
2. Compare source percentage examples with actual standard requirements and firm policy; record policy authority.
3. Specify precision, zero/negative bases, absolute versus relative inputs, override rationale and dependency staleness.

**Inputs to specify:** Reviewed benchmark source; selected value; authorized percentages/amounts; framework/period; rationale.

**Independent validation to produce:** Independent workbook for each approved policy; negative profit, exceptional items, zero clearly-trivial threshold, revised benchmarks and boundary rounding. Test historical source values only under documented assumptions.

**Unsupported/judgment boundary:** No universal benchmark/percentage or automatic materiality judgment; clearly trivial is distinct from not material.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m04"></a>

### M04 — Sampling frame and reproducible selection

**Owning domains:** D07 D08. **Original minimums:** AUTO-047

**Question:** Which unit/probability frame does each selector implement?

**Standards/policy to verify:** ISA 500, 530; approved sampling policy. **Retrieved starting sources:** [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance), [SRC-21](https://standards.auasb.gov.au/node/729). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Compare random, systematic, haphazard, targeted, stratified and value-weighted approaches for actual offering.
2. Research algorithm version, deterministic replay, random-byte-to-index bias, unit deduplication, ordering and seed governance.
3. Specify treatment of selected high-value items, negative/zero monetary units and changed populations.

**Inputs to specify:** Approved population/version; unique unit ID; design; strata; seed/random source; algorithm version.

**Independent validation to produce:** Independently enumerated tiny frames validate eligibility, unit uniqueness and deterministic replay; technical distribution/bias checks are proportionate to algorithm. Changing source creates a new design.

**Unsupported/judgment boundary:** Reproducible HMAC selection is not itself proof of a statistical sampling plan, independence assumptions or confidence evaluation.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m05"></a>

### M05 — Audit sample-size determination

**Owning domains:** D07 D08. **Original minimums:** AUTO-047

**Question:** Which sample-size approach is justified for controls or substantive testing?

**Standards/policy to verify:** ISA 530; approved original statistical references and firm policy. **Retrieved starting sources:** [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance), [SRC-21](https://standards.auasb.gov.au/node/729). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research assumptions for population, expected error/deviation, tolerable misstatement/deviation, sampling risk and finite frame.
2. For selected statistical methods obtain original formula/table/model and explain distributional assumptions; compare independent reference values.
3. For nonstatistical design document human rationale and factors; specify full-population escalation and unsupported combinations.

**Inputs to specify:** Purpose; population; risk; expected error; tolerable amount/rate; strata; reliance; selected method.

**Independent validation to produce:** Independent reference table or separately coded computation over approved parameter grid; monotonicity and impossible-risk/size cases. Manual size retains rationale and reviewer.

**Unsupported/judgment boundary:** Generic opinion-poll sample-size formulas or n=30 rules cannot substitute for an audit method. No unsourced confidence claims.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m06"></a>

### M06 — Projection, sampling evaluation and risk allowance

**Owning domains:** D07 D08 D09. **Original minimums:** AUTO-047, AUTO-048

**Question:** What population does each estimator describe and how is sampling risk evaluated?

**Standards/policy to verify:** ISA 530, 450; selected sampling methodology. **Retrieved starting sources:** [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance), [SRC-21](https://standards.auasb.gov.au/node/729). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research ratio/difference and selected MUS/stratified estimators; define signed book/audited/error amounts and separate specifics.
2. Specify total projected versus incremental unsampled effect, anomalies, missing tests and replacement conditions.
3. Research method-specific allowance/confidence calculation separately from point estimation and from booking an adjustment.

**Inputs to specify:** Approved design; all selected/tested units; audited values; error types; strata; specifics; currency.

**Independent validation to produce:** Independent ratio example: eligible CU1,000, sampled CU200, signed error CU10 gives total CU50 only under approved ratio assumptions; do not add same CU10 again. Test zero/mixed-sign/untested/strata cases.

**Unsupported/judgment boundary:** Ratio illustration supplies no confidence bound; controls deviations are not monetary misstatements; anomaly exclusions require auditor evidence.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m07"></a>

### M07 — Analytical expectations, ratios, trends and tolerances

**Owning domains:** D04 D07 D08 D09. **Original minimums:** AUTO-010, AUTO-033, AUTO-044

**Question:** Which expectation and precision make an analytical comparison useful?

**Standards/policy to verify:** ISA 520, 315, 330, 570; approved policy. **Retrieved starting sources:** [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance), [SRC-25](https://www.iaasb.org/publications/isa-570-revised-2024-going-concern). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research planning analytics versus substantive analytical procedures and final review.
2. Specify comparable periods, seasonal/volume drivers, independent nonfinancial data, expected value and acceptable difference.
3. Compare absolute/percentage/ratio/trend algorithms, denominator failure, disaggregation and corroboration of explanations.

**Inputs to specify:** Period-aligned population; expectation source; drivers; threshold basis; review and explanations.

**Independent validation to produce:** Independent data with zero/negative denominator, seasonality, offsetting subgroups and missing periods. Explainable flags route to investigation, not an automatic conclusion.

**Unsupported/judgment boundary:** Variance threshold is a policy parameter; a ratio flag cannot establish misstatement, fraud or going-concern outcome.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m08"></a>

### M08 — Journal-entry and anomaly rules

**Owning domains:** D07 D08. **Original minimums:** AUTO-009, AUTO-021

**Question:** Which indicators warrant testing, and at what journal/line grain?

**Standards/policy to verify:** ISA 240, 315, 330, 500; approved fraud-response policy. **Retrieved starting sources:** [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance), [SRC-24](https://www.iaasb.org/publications/isa-240-revised-auditor-s-responsibilities-relating-fraud-audit-financial-statements). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research journal population completeness and risk-based criteria under applicable fraud edition.
2. Specify whole-entry balance, split lines, unusual dates/users/accounts, rule overlap and authorized exceptions.
3. Evaluate false positives, source-system timestamps and actual investigation/evidence obligations.

**Inputs to specify:** Complete journal header/line population; accounts/users/calendar; selected rule version; investigation evidence.

**Independent validation to produce:** Independent small journals where several rules flag one event; one factual exposure with several indicators. Reversal, legitimate unusual entry and changed criteria cases.

**Unsupported/judgment boundary:** No Benford/anomaly score or passed rule set certifies fraud presence/absence. Risk thresholds require policy justification.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m09"></a>

### M09 — Receivables aging and subsequent-cash application

**Owning domains:** D06 D08. **Original minimums:** AUTO-013

**Question:** Which date and cash-allocation rules produce an auditable aging schedule?

**Standards/policy to verify:** ISA 500, 505, 540; IFRS 9 and applicable contractual terms. **Retrieved starting sources:** [SRC-11](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/), [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research invoice/due date, reporting-date aging buckets, credit balances, disputed invoices, unapplied cash and partial receipts.
2. Specify many receipts to many invoices with approvals and prevent reuse of one receipt.
3. Separate aging/past-due indicators and subsequent receipt evidence from IFRS 9 ECL or confirmation sufficiency.

**Inputs to specify:** Invoice/open items; due terms; cutoff date; receipts; allocation keys; currencies; reversals.

**Independent validation to produce:** Independent invoices across bucket boundaries, partial/multi-invoice receipts, credit notes and postperiod cash; reconcile opening/closing balance and unapplied remainder.

**Unsupported/judgment boundary:** Aged days do not automatically select an ECL rate; cash after date does not alone establish original recognition or complete recoverability.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m10"></a>

### M10 — Revenue and deferred-revenue schedules

**Owning domains:** D08. **Original minimums:** AUTO-015

**Question:** What contractual judgments precede each revenue calculation?

**Standards/policy to verify:** IFRS 15 or separate selected SME revenue sections; ISA 240, 500, 540. **Retrieved starting sources:** [SRC-12](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/), [SRC-08](https://www.ifrs.org/issued-standards/ifrs-for-smes/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research contract/performance obligations, transaction price, variable consideration, standalone prices, modifications and point/over-time criteria.
2. Specify supported progress/output/input method, contract asset/liability and receivable distinctions.
3. Document returns, principal/agent, significant financing and specialized cases as conditional research rather than automatic scope.

**Inputs to specify:** Approved contract facts; obligations; allocation basis; dates; progress evidence; estimates/policy.

**Independent validation to produce:** Independent two-obligation allocation and schedule, advance receipt, partial performance, returns and modification. Reconcile contract balances with approved GL.

**Unsupported/judgment boundary:** Equal monthly recognition is not universal; invoice/cash date cannot automatically determine IFRS 15 recognition.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m11"></a>

### M11 — Revenue cut-off, prices, discounts and credit notes

**Owning domains:** D08. **Original minimums:** AUTO-012, AUTO-014

**Question:** Which operational dates and contractual conditions support the tested revenue?

**Standards/policy to verify:** IFRS 15; ISA 240, 500, 530; approved contracts. **Retrieved starting sources:** [SRC-12](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/), [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research control transfer using terms, dispatch/delivery/service evidence, returns and postperiod credits.
2. Specify approved price/discount versions, quantity/unit conversion, taxes, currency and exception tolerances.
3. Keep cut-off/pricing indicators separate from final recognition judgments and evidence sufficiency.

**Inputs to specify:** Sales lines; contract/price lists; dispatch/receipt/service dates; credit notes; tax/FX basis.

**Independent validation to produce:** Independent before/on/after-period examples, authorized discount, partial delivery, backdated invoice and later return; one underlying event finding.

**Unsupported/judgment boundary:** Window length and anomaly thresholds are audit/firm choices, not universal IFRS/ISA values.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m12"></a>

### M12 — Procure-to-pay matching, accruals and unrecorded liabilities

**Owning domains:** D08. **Original minimums:** AUTO-016, AUTO-017, AUTO-018, AUTO-019

**Question:** What relationships and date evidence identify unrecorded or mismatched obligations?

**Standards/policy to verify:** ISA 500, 505, 530; applicable accrual/IAS 37/IFRS 9 requirements. **Retrieved starting sources:** [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance), [SRC-19](https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research PO/receipt/invoice/payment line cardinality, partial deliveries, deposits, tolerances and supplier identity exceptions.
2. Specify accrual periods and search for unrecorded liabilities using postperiod records and actual receipt/service evidence.
3. Separate duplicate exposure indicator from factual duplicate payment or legal liability conclusion.

**Inputs to specify:** PO/receipt/invoice/payment lines; supplier masters; dates; service periods; currencies and sign.

**Independent validation to produce:** Independent partial three-way match, duplicate invoice number across suppliers, unbilled receipt, prepaid expense and postperiod payment. Reconcile unresolved values once.

**Unsupported/judgment boundary:** No PO does not prove invalid expense; similarity alone cannot establish fraud or an unrecorded obligation.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m13"></a>

### M13 — Bank reconciliation and cash movements

**Owning domains:** D06 D08. **Original minimums:** AUTO-020, AUTO-021

**Question:** What controlled matching and reconciliation support the cash balance?

**Standards/policy to verify:** ISA 500, 505; IAS 7, IAS 21 where applicable. **Retrieved starting sources:** [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance), [SRC-16](https://www.ifrs.org/issued-standards/list-of-standards/ias-21-the-effects-of-changes-in-foreign-exchange-rates/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research ledger/bank sign, opening/closing controls, clearing dates, bank fees, transfers and reconciling items.
2. Specify exact/proposed many-to-many matches, partial amounts, approved tolerances and unmatched items.
3. Retain bank evidence identity and confirmation control; distinguish matching from cash-equivalent classification/restriction.

**Inputs to specify:** Bank statement/GL; balance controls; transaction IDs; dates/currencies; approved matches.

**Independent validation to produce:** Independent outstanding cheque/deposit, duplicate bank line, interbank transfer, fee and FX item; row/amount residuals reconcile.

**Unsupported/judgment boundary:** Matched rows do not prove bank authenticity, ownership, unrestricted cash or absence of omitted accounts.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m14"></a>

### M14 — Inventory movement, count and cut-off

**Owning domains:** D07 D08. **Original minimums:** AUTO-022, AUTO-023, AUTO-024

**Question:** Which physical/recorded unit and timing bridges are required?

**Standards/policy to verify:** ISA 501, 500, 530; IAS 2. **Retrieved starting sources:** [SRC-10](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/), [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research count attendance, floor-to-sheet/sheet-to-floor, location/ownership, third-party stock and count-date roll-forward/back.
2. Specify quantity units, transfers in transit, count adjustments, receipts/issues, duplicate count sheets and signs.
3. Separate count existence/condition work from costing and NRV.

**Inputs to specify:** Item/location/lot; count records; units; movements; ownership terms; period dates.

**Independent validation to produce:** Independent count at different date, transfer between sites, negative count adjustment and consignment; quantity bridge before valuation.

**Unsupported/judgment boundary:** A reconciled inventory file or uploaded count sheet is not evidence that attendance and physical procedures occurred.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m15"></a>

### M15 — Inventory cost and cost of sales

**Owning domains:** D08. **Original minimums:** AUTO-025

**Question:** Which cost formula and overhead treatment apply to each inventory class?

**Standards/policy to verify:** IAS 2 or separate SME inventory sections; approved accounting policy. **Retrieved starting sources:** [SRC-10](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/), [SRC-08](https://www.ifrs.org/issued-standards/ifrs-for-smes/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research specific identification, FIFO and weighted average applicability, consistency and periodic versus perpetual calculations.
2. Specify purchase/conversion costs, normal capacity/overhead allocation, rebates, returns, freight, WIP and negative-stock boundaries.
3. Define item/location/currency units, rounding level and movements-to-COS bridge.

**Inputs to specify:** Opening layers; receipts/issues; eligible costs; quantities; selected cost policy.

**Independent validation to produce:** Synthetic vector: 100 units at CU10 plus 50 at CU14, issue 120; FIFO issue CU1,280/closing CU420; periodic weighted average issue CU1,360/closing CU340 before policy rounding. Independently verify additional cases.

**Unsupported/judgment boundary:** Weighted average timing matters; production costing cannot be claimed from a simple trading-stock formula. IAS 2 does not permit arbitrary method substitution.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m16"></a>

### M16 — Inventory NRV and obsolescence indicators

**Owning domains:** D08. **Original minimums:** AUTO-026

**Question:** How are estimated selling prices and sale/completion costs corroborated?

**Standards/policy to verify:** IAS 2; ISA 540, 500. **Retrieved starting sources:** [SRC-10](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research item/group basis, postperiod sales evidence, damaged/obsolete stock, write-down and reversal conditions.
2. Specify approved estimates, completion/selling costs and lower-of-cost/NRV comparison.
3. Distinguish slow-moving flags from a supportable valuation conclusion.

**Inputs to specify:** Costed items; quantities; selling evidence; completion/selling cost assumptions; previous write-downs.

**Independent validation to produce:** Independent inventory with cost above/below NRV, partial sales evidence, negative estimated proceeds and constrained reversal.

**Unsupported/judgment boundary:** No universal age bucket/write-down percentage; approved estimates and applicable policy remain necessary.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m17"></a>

### M17 — Asset roll-forward, disposals and revaluation movements

**Owning domains:** D08. **Original minimums:** AUTO-027, AUTO-029

**Question:** Which cost, accumulated charge and carrying-value movements must reconcile?

**Standards/policy to verify:** IAS 16, IAS 38, IAS 36; relevant IAS 40/IFRS 5 only if applicable. **Retrieved starting sources:** [SRC-14](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/), [SRC-15](https://www.ifrs.org/issued-standards/list-of-standards/ias-36-impairment-of-assets/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research additions, disposals, transfers, impairments, revaluations and held-for-sale changes by asset class.
2. Specify register-to-GL reconciliation, component identity and disposal gain/loss evidence.
3. Separate movement arithmetic from recognition, life/revaluation judgment and title inspection.

**Inputs to specify:** Asset/component register; opening balances; movements; disposal proceeds; accumulated charges; GL.

**Independent validation to produce:** Independent addition/partial disposal/transfer with cost and accumulated depreciation bridges; carrying value and GL reconcile separately.

**Unsupported/judgment boundary:** A balanced asset register cannot certify asset existence, rights or correct capitalization.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m18"></a>

### M18 — Depreciation and amortization

**Owning domains:** D08. **Original minimums:** AUTO-028, AUTO-029

**Question:** Which method, component, service dates and estimate changes govern the charge?

**Standards/policy to verify:** IAS 16, IAS 38, IAS 8; selected policy. **Retrieved starting sources:** [SRC-14](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/), [SRC-09](https://www.ifrs.org/issued-standards/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research straight-line, reducing-balance/units-of-production if applicable, components, residual value and available-for-use rules.
2. Specify daily/monthly conventions, leap years, disposals, idle/fully-depreciated assets, life changes and indefinite-life intangibles.
3. Separate prospective estimate changes from policy/error corrections and test floors/rounding.

**Inputs to specify:** Cost; residual; life; method; component; service/disposal dates; prior charge; policy version.

**Independent validation to produce:** Synthetic whole-year straight-line CU120 cost, CU20 residual, five-year life gives CU20 charge; separately test first/last periods, revised life and cumulative floor with independent schedule.

**Unsupported/judgment boundary:** No automatic useful-life selection or tax-depreciation substitution; a formula passing does not approve capitalization.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m19"></a>

### M19 — Capitalization, repairs and borrowing-cost support

**Owning domains:** D08. **Original minimums:** AUTO-030

**Question:** Which costs qualify and what evidence supports the chosen treatment?

**Standards/policy to verify:** IAS 16, IAS 38, IAS 23; IAS 8 where relevant. **Retrieved starting sources:** [SRC-14](https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/), [SRC-09](https://www.ifrs.org/issued-standards/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research directly attributable costs, development/research distinctions, replacements/components, decommissioning and borrowing-cost criteria.
2. Specify candidate screens as prompts for professional classification; define supported capitalization period and eligible amounts.
3. Identify conditional specialized assets/investment property and prevent silent adoption from keywords.

**Inputs to specify:** Cost lines; contracts; project stage; available-for-use facts; rates; management policy and evidence.

**Independent validation to produce:** Independent mixed repair/enhancement/development cost set with separately approved classification; calculation follows approved decisions.

**Unsupported/judgment boundary:** Cost label, invoice size or successful depreciation cannot determine recognition; qualification stays human.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m20"></a>

### M20 — Effective interest, borrowings and covenants

**Owning domains:** D08. **Original minimums:** AUTO-036, AUTO-040

**Question:** Which cash flows, fees, day counts and contract terms determine the schedule?

**Standards/policy to verify:** IFRS 9, IFRS 7, IAS 23; IAS 1/IFRS 18 for presentation; contract covenants. **Retrieved starting sources:** [SRC-11](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/), [SRC-07](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research amortized cost/EIR versus contractual interest, fees/premiums, modifications, floating resets and impairment interactions.
2. Specify cash-flow timing, compounding, numerical solver behavior, day-count conventions and residual reconciliation.
3. Research covenant definitions, testing dates, waivers and presentation as separate contract/judgment questions.

**Inputs to specify:** Instrument contract; initial carrying value; contractual cash flows; fees; dates; rates; covenant definitions.

**Independent validation to produce:** Independent premium/discount/fee schedule and terminal balance; irregular periods, variable rates, no-root/multiple-root boundaries and covenant waiver timing.

**Unsupported/judgment boundary:** A generic simple-interest or spreadsheet IRR result does not prove IFRS 9 correctness; covenant failure is not an automatic opinion.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m21"></a>

### M21 — Lease liability and right-of-use schedules

**Owning domains:** D08. **Original minimums:** AUTO-037

**Question:** Which contract decisions and rates are required before recalculation?

**Standards/policy to verify:** IFRS 16; applicable separate SME lease sections. **Retrieved starting sources:** [SRC-13](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-16-leases/), [SRC-08](https://www.ifrs.org/issued-standards/ifrs-for-smes/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research lease identification/components, term/options, eligible payments, discount rate, exemptions and initial ROU costs.
2. Specify advance/arrears payments, modifications, remeasurement, index changes, incentives, impairment and disclosures for selected scope.
3. Separate lessee/lessor and sale-and-leaseback requirements; do not silently promise unapproved complex cases.

**Inputs to specify:** Approved lease facts; payment dates/amounts; rate and compounding; initial costs; term/options; amendments.

**Independent validation to produce:** Independent present-value and movement schedule with zero rate, advance rent, changed index, extension and termination; rate is synthetic/approved input, never a default law.

**Unsupported/judgment boundary:** Lease term and incremental borrowing rate are judgments; periodic PV alone is not complete IFRS 16 compliance.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m22"></a>

### M22 — Foreign-currency measurement and translation

**Owning domains:** D05 D08 D09. **Original minimums:** AUTO-038, AUTO-043, AUTO-048

**Question:** Which currency, rate/date and measurement basis govern each transformation?

**Standards/policy to verify:** IAS 21, IFRIC 22; IAS 29 only if applicability requires. **Retrieved starting sources:** [SRC-16](https://www.ifrs.org/issued-standards/list-of-standards/ias-21-the-effects-of-changes-in-foreign-exchange-rates/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research transaction recognition, monetary/nonmonetary closing treatment, settlements and presentation translation.
2. Specify rate direction, source/version, unavailable rates, lack of exchangeability, functional currency and intercompany differences.
3. Identify translation reserve versus profit/loss effects and historical rates; maintain transaction/functional/presentation amounts.

**Inputs to specify:** Amounts; currency roles; dates; rate source/direction; monetary classification; policy; rounding.

**Independent validation to produce:** Independent inverted-rate and mixed-currency vectors, historical versus closing rate and missing-date case; line-level bridge and separate FX effects.

**Unsupported/judgment boundary:** No current market rate is assumed; average/closing/historical rates are not interchangeable; unknown rate cannot become 1.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m23"></a>

### M23 — Investment income and fair-value input review

**Owning domains:** D08. **Original minimums:** AUTO-040

**Question:** Which classification and valuation inputs can the system verify?

**Standards/policy to verify:** IFRS 9, IFRS 7, IFRS 13; IAS 28/IFRS 11 only if applicable; ISA 540, 620. **Retrieved starting sources:** [SRC-11](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/), [SRC-09](https://www.ifrs.org/issued-standards/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research classification, quoted-price suitability, valuation dates, ownership/quantity, accrued income and fair-value hierarchy.
2. Specify approved price sources, model input provenance, units, FX and investment movement bridges.
3. Separate model arithmetic from fair-value technique/assumption approval and specialist work.

**Inputs to specify:** Holding quantities/rights; prices/valuation model; dates; source; accrued flows; classification decisions.

**Independent validation to produce:** Independent quantity × approved price plus approved adjustments, stale quote, corporate action and valuation sensitivity; specialist unsupported cases remain explicit.

**Unsupported/judgment boundary:** A market quote does not automatically establish appropriate fair value; ownership/control and active-market judgments require evidence.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m24"></a>

### M24 — Expected credit losses and allowances

**Owning domains:** D08 D09. **Original minimums:** AUTO-013, AUTO-040, AUTO-042

**Question:** Which ECL model applies and what assumptions require approval?

**Standards/policy to verify:** IFRS 9; ISA 540; selected SME requirements separately. **Retrieved starting sources:** [SRC-11](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-9-financial-instruments/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research simplified/general approach, lifetime versus 12-month ECL, credit risk/staging, discounting, forward-looking scenarios and data.
2. Compare provision matrix and PD/LGD/EAD implementations only for their approved portfolios and assumptions.
3. Specify scenario weights, segmentation, recoveries/collateral, write-offs, modifications and validation/sensitivity.

**Inputs to specify:** Exposure and cash-flow data; segments/stages; historical loss; forecasts; approved assumptions; discount basis.

**Independent validation to produce:** Independent small discounted scenario model and approved provision-matrix example; changed weights, missing data, credit-impaired asset and recoveries tested.

**Unsupported/judgment boundary:** Aging × arbitrary percentage or PD×LGD×EAD alone cannot be advertised as universal IFRS 9 ECL.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m25"></a>

### M25 — Nonfinancial asset impairment

**Owning domains:** D08 D09. **Original minimums:** AUTO-042

**Question:** Which asset/CGU and recoverable amount inputs are appropriate?

**Standards/policy to verify:** IAS 36; ISA 540, 620. **Retrieved starting sources:** [SRC-15](https://www.ifrs.org/issued-standards/list-of-standards/ias-36-impairment-of-assets/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research IAS 36 scope exclusions, indicators, annual tests, CGU/goodwill allocation and recoverable amount.
2. Specify approved cash flows, discounting, terminal assumptions, fair value less disposal costs and sensitivity.
3. Research impairment allocation/floors/reversals and future depreciation consequences; separate unsupported valuation judgments.

**Inputs to specify:** Carrying amount; approved CGU; cash flows; discount basis; disposal costs; allocation; prior impairment.

**Independent validation to produce:** Independent recoverable-amount comparison, CGU allocation and reversal cap; goodwill reversal denied; asset outside IAS 36 routed to proper standard.

**Unsupported/judgment boundary:** No one impairment algorithm covers inventory, IFRS 9 assets and goodwill; valuation assumptions require practitioner/specialist approval.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m26"></a>

### M26 — Payroll, benefits and gross-to-net

**Owning domains:** D08. **Original minimums:** AUTO-031, AUTO-032, AUTO-033

**Question:** Which dated legal and contractual rules govern each component?

**Standards/policy to verify:** IAS 19, IAS 26 where applicable; verified Mongolian labor/tax/social-insurance law. **Retrieved starting sources:** [SRC-09](https://www.ifrs.org/issued-standards/), [SRC-05](https://legalinfo.mn/mn/detail?lawId=11191&type=2). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research employee versus employer obligations, earnings/benefits, caps, exemptions, progressive brackets, prorating and effective dates.
2. Reconcile roster, payroll run, bank payments and GL; separate payroll taxes from IAS 19 benefit measurement.
3. Specify pay-period/annual cumulative behavior, off-cycle reversals, leave and personal-data access.

**Inputs to specify:** Employee terms; payroll categories; hours/dates; approved statutory rule pack; deductions; payments.

**Independent validation to produce:** Independent payroll examples around each verified threshold and period change, partial month and correction; no real employee identifiers in synthetic fixtures.

**Unsupported/judgment boundary:** No tax/social-insurance rate from an old example becomes law; defined-benefit valuation may need a separately approved actuarial route.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m27"></a>

### M27 — VAT and withholding reconciliation

**Owning domains:** D08. **Original minimums:** AUTO-034

**Question:** Which taxable base, recognition date and return lines apply?

**Standards/policy to verify:** Verified applicable Mongolian tax law, regulations and tax authority guidance; ISA 250, 500. **Retrieved starting sources:** [SRC-05](https://legalinfo.mn/mn/detail?lawId=11191&type=2), [SRC-06](https://legalinfo.mn/mn/detail?lawId=11192&type=11). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Retrieve primary provisions for VAT/withholding scope, rates, exemptions, credits, currency, dates and filing corrections.
2. Specify sales/purchase/GL/return bridges, credit notes, reverse/withholding cases and unavailable tax evidence.
3. Research rates at transaction/return period; distinguish tax-law calculation from accounting presentation.

**Inputs to specify:** Tax rule version; taxable transactions; invoice/return/GL; exemptions; credits; FX/date basis.

**Independent validation to produce:** Independent legal example or independently computed vector for every approved rate/bracket/exception; reconciliation exposes timing/permanent differences.

**Unsupported/judgment boundary:** This plan approves no Mongolian tax rates; statutory lookup remains open until primary-source verification.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m28"></a>

### M28 — Current and deferred income tax

**Owning domains:** D08 D09. **Original minimums:** AUTO-035

**Question:** How do taxable profit, tax bases and recoverability support the provision?

**Standards/policy to verify:** IAS 12, IFRIC 23; verified income-tax law; selected SME requirements separately. **Retrieved starting sources:** [SRC-17](https://www.ifrs.org/issued-standards/list-of-standards/ias-12-income-taxes/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research current tax bridge, temporary/permanent differences, enacted/substantively enacted rate and tax-loss/credit evidence.
2. Specify taxable/deductible differences, reversal timing, recognition exceptions, uncertain treatments, offset/presentation and OCI/equity effects.
3. Assess special rules such as Pillar Two only if entity/scope requires; separate deferred tax arithmetic from recognition judgment.

**Inputs to specify:** Accounting/tax bases; law/rates/dates; tax return bridge; forecasts; loss expiry; approved recognition.

**Independent validation to produce:** Independent asset/liability temporary-difference examples, changed rate, loss and recognition constraint with synthetic assumptions; recoverability conclusion stays human.

**Unsupported/judgment boundary:** A flat rate times accounting profit is not complete current/deferred tax; no generic DTA recognition from a positive number.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m29"></a>

### M29 — Equity, reserves and dividends

**Owning domains:** D08. **Original minimums:** AUTO-039

**Question:** What is accounting classification versus legal entitlement/authorization?

**Standards/policy to verify:** IAS 32, IAS 10, IAS 1/IFRS 18; applicable company law and authorizations. **Retrieved starting sources:** [SRC-07](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/), [SRC-09](https://www.ifrs.org/issued-standards/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research instrument terms, contribution/issuance, reserves, dividend declaration dates, treasury shares and distributability law.
2. Specify opening/movement/closing and cash/equity/GL reconciliation with source resolutions.
3. Separate equity/liability classification and valid authorization from register arithmetic.

**Inputs to specify:** Instrument register; opening equity; resolutions; dates; payments; shareholder/ownership facts.

**Independent validation to produce:** Independent contribution/dividend/treasury movement, postperiod dividend, unauthorized proposal and foreign currency cases.

**Unsupported/judgment boundary:** A board resolution upload alone does not prove legal validity; dividends after period date need applicable IAS 10 treatment.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m30"></a>

### M30 — Consolidation and intercompany eliminations

**Owning domains:** D05 D08. **Original minimums:** AUTO-043

**Question:** Which entities, dates and transformations belong in the group result?

**Standards/policy to verify:** IFRS 10, IFRS 3, IAS 21; IFRS 11/12, IAS 27/28 as applicable; ISA 600. **Retrieved starting sources:** [SRC-18](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-10-consolidated-financial-statements/), [SRC-16](https://www.ifrs.org/issued-standards/list-of-standards/ias-21-the-effects-of-changes-in-foreign-exchange-rates/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research control/scope decisions, component periods/policies, acquisition/disposal, ownership/NCI and group-audit responsibilities.
2. Specify intercompany matching, dividends, balances, unrealized profit, tax effects and approved elimination entries.
3. Separate financial-statement aggregation, currency translation and group-audit materiality/evidence; retain residual mismatches.

**Inputs to specify:** Approved scope/ownership; component TBs/policies; FX; intercompany details; acquisition facts; eliminations.

**Independent validation to produce:** Independent two-entity balance and unrealized-profit case plus minority ownership/foreign component; each elimination applied once and unexplained mismatch retained.

**Unsupported/judgment boundary:** Ownership percentage alone does not determine control; a consolidating spreadsheet does not perform ISA 600 responsibilities.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m31"></a>

### M31 — Provisions, commitments and contingencies

**Owning domains:** D08 D09. **Original minimums:** AUTO-049

**Question:** What recognition, measurement and disclosure judgments are needed?

**Standards/policy to verify:** IAS 37; ISA 501, 540, 620; applicable legal evidence. **Retrieved starting sources:** [SRC-19](https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research present/legal/constructive obligation, probability, reliable estimate, expected-value/best-estimate approaches and discounting.
2. Specify provision movement, reimbursements, onerous contracts, contingent assets/liabilities and evidence changes.
3. Separate lawyer assessment, management estimate and auditor evaluation; preserve disagreements.

**Inputs to specify:** Matter facts; legal replies; probabilities/cash flows; discount basis; dates; reimbursements; judgments.

**Independent validation to produce:** Independent provision movement and approved estimate calculations; remote/possible/probable branches, disputed legal reply and missing range.

**Unsupported/judgment boundary:** Litigation keyword or probability slider cannot automatically decide recognition; confidential legal evidence needs scoped access.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m32"></a>

### M32 — Going-concern indicators and forecast scenarios

**Owning domains:** D08 D09. **Original minimums:** AUTO-044, AUTO-050

**Question:** Which assessment horizon, forecast and evidence support the auditor's conclusion?

**Standards/policy to verify:** ISA 570 applicable edition; IAS 1/IAS 8/IFRS 18 as applicable. **Retrieved starting sources:** [SRC-25](https://www.iaasb.org/publications/isa-570-revised-2024-going-concern), [SRC-07](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/), [SRC-09](https://www.ifrs.org/issued-standards/). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research management and auditor responsibilities/horizons separately for pre/post-revised ISA 570 and actual reporting framework.
2. Specify cash-flow forecasts, financing commitments/covenants, sensitivities, mitigation feasibility and events beyond assessment period.
3. Define missing forecasts, contradictory assumptions, material uncertainty and report handoff with human conclusion.

**Inputs to specify:** Approved forecast; actuals; debt/commitments; assessment/report dates; scenarios; evidence.

**Independent validation to produce:** Independent cash runway/forecast/sensitivity with negative cash, unavailable financing and changed assumptions; horizons follow approved edition.

**Unsupported/judgment boundary:** No ratio score decides going concern; mathematical forecast validity does not establish supportability of assumptions.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m33"></a>

### M33 — Signed misstatements, correction and exposure aggregation

**Owning domains:** D07 D08 D09 D11. **Original minimums:** AUTO-048

**Question:** Which signed/nonmonetary effects may be aggregated, netted or carried forward?

**Standards/policy to verify:** ISA 450, 530, 705; applicable accounting adjustments and firm policy. **Retrieved starting sources:** [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance), [SRC-21](https://standards.auasb.gov.au/node/729). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research factual/judgmental/projected/prior-period/disclosure effects and clearly trivial treatment.
2. Specify stable event identity, sample total/incremental linkage, actual posting, partial correction and approved netting/currency basis.
3. Separate signed accounting misstatement, gross risk exposure, qualitative materiality and report opinion.

**Inputs to specify:** Finding IDs; signed amounts; currencies; periods; projection links; verified corrections; qualitative effects.

**Independent validation to produce:** Independent over/understatement, total-projection duplicate, partial/reversed correction and disclosure-only fixtures; unknown amount never zero.

**Unsupported/judgment boundary:** Absolute exposure sum alone cannot decide opinion; netting and pervasiveness require professional judgment.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m34"></a>

### M34 — Dates, temporal states and retention clocks

**Owning domains:** D09 D11 D12. **Original minimums:** AUTO-045, AUTO-051, AUTO-057, AUTO-058

**Question:** Which source-defined event starts each time-sensitive obligation?

**Standards/policy to verify:** ISA 230, 560, 700; ISQM 1; verified local law/operating policy. **Retrieved starting sources:** [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance), [SRC-25](https://www.iaasb.org/publications/isa-570-revised-2024-going-concern), [SRC-05](https://legalinfo.mn/mn/detail?lawId=11191&type=2), [SRC-06](https://legalinfo.mn/mn/detail?lawId=11192&type=11). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research report/issue/discovery/assembly/retention events, period-start rules and dual dating conditions.
2. Specify timezone/calendar, amendments, holds, longer governing retention and copy/backup effects.
3. Distinguish international effective dates from local adoption and policy configuration.

**Inputs to specify:** Exact dated events; edition/adoption; policy source; calendar; holds; report/copy lineage.

**Independent validation to produce:** Boundary cases across midnight/year/leap year, limited-date report, hold added/removed and amended successor; independently expected deadlines.

**Unsupported/judgment boundary:** No universal retention or assembly deadline without source; a policy date is not authority to silently delete.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m35"></a>

### M35 — Capacity, budgets and staffing scenario variance

**Owning domains:** D02 D13. **Original minimums:** Enabling source staffing obligations; no invented AUTO ID.

**Question:** Which calendars and definitions make resource comparisons meaningful?

**Standards/policy to verify:** ISA 220/ISQM resource sufficiency; approved staffing policy. **Retrieved starting sources:** [SRC-22](https://www.iaasb.org/publications/international-standard-quality-management-isqm-1-quality-management-firms-perform-audits-or-reviews). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Define planned/actual/available hours, leave, overlapping allocation, scenario version and effective dates.
2. Specify absolute variance and percentage base, zero availability, unsubmitted actuals and part-time capacity.
3. Separate alerts from automatic quality or competence judgments.

**Inputs to specify:** Named appointments; calendars; budgets; time entries; scenario version; approval.

**Independent validation to produce:** Independent two-engagement overlap and transfer, partial-week leave, zero capacity and late actuals; denominators and units explicit.

**Unsupported/judgment boundary:** No invented utilization benchmark, normative senior/junior ratio or quality score.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.

<a id="m36"></a>

### M36 — Coverage, decision tables, review and authorization rules

**Owning domains:** D01 D02 D03 D04 D06 D08 D10 D11 D12 D13. **Original minimums:** AUTO-001, AUTO-007, AUTO-041, AUTO-052, AUTO-053, AUTO-054, AUTO-055, AUTO-056, AUTO-057, AUTO-058

**Question:** Which facts and decisions establish a valid workflow transition?

**Standards/policy to verify:** Applicable ISA/ISQM/IESBA per decision; OWASP and NIST technical controls. **Retrieved starting sources:** [SRC-01](https://www.iaasb.org/publications/2026-handbook-international-quality-management-auditing-review-sustainability-and-other-assurance), [SRC-02](https://www.ethicsboard.org/publications/2026-handbook-international-code-ethics-professional-accountants), [SRC-27](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [SRC-28](https://csrc.nist.gov/glossary/term/separation_of_duty). Consult source register for overview/access limits; obtain full applicable clauses and method-specific references.

1. Research precise applicability, prerequisites, allowed actors, independent approval and changed-source effects for each decision.
2. Specify unknown/not-applicable/blocked/unsupported outcomes, conflicting rules, priority and evidence requirements.
3. Test decision-table completeness, impossible combinations, many-to-many links and source-ID coverage without reducing professional decisions to checkmarks.

**Inputs to specify:** Versioned source/standard decisions; actor history; grants; facts; evidence; build/source/method versions.

**Independent validation to produce:** Independent positive/adverse/unknown/denied/change/concurrent cases; all AUTO/V source IDs linked; no unauthorized transition or false source closure.

**Unsupported/judgment boundary:** Coverage monitoring is not audit sufficiency, disclosure adequacy, independence clearance or professional acceptance.

**Required outputs / gate:** an approved M-card specification, typed schema, independently checked expected dataset and implementation-delta ticket linked to exact original IDs. Record author, independent checker, professional approver and source/method version. Until completed, state PLANNED; no engine is certified by this card.
