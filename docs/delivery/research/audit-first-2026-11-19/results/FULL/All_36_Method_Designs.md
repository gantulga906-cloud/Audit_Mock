# All36 method designs

### M01 — Population integrity, control totals and reconciliations

**Profile:**Typed source reconciliation v1. **Original automation links:**AUTO-001 AUTO-002 AUTO-003 AUTO-004 AUTO-005 AUTO-008 AUTO-011 AUTO-016 AUTO-022 AUTO-031.

**Inputs:**Exact original rows; independent count/control evidence; entity/period/currency/scale; accepted/quarantined/excluded dispositions.

**Algorithm/steps:**

1. Preserve raw rows and source keys before conversion
2. Parse explicit amount/date/sign schemas and reject ambiguous values
3. Reconcile source count = accepted + quarantined + excluded, and per-currency signed totals including unresolved quantities
4. Reconcile TB opening + debits - credits = closing and GL debit/credit movements independently; certify completeness only to the evidenced extract boundary

**Human judgment:**Source completeness, appropriate exclusions, tolerances and intended use require actual auditor approval.

**Exceptions to test:**

- Balanced incomplete extract
- Duplicate business keys
- Unknown amount cannot enter complete total
- Mixed currencies or incompatible scales

**Independent example:**Rows 100,-20,0 CU total80 CU across3 rows. Certified4 rows/80 CU still fails count even though amounts agree.

**Evidence/context:**[AUD-500](https://standards.auasb.gov.au/node/1012); DESIGN-INTEGRITY.

### M02 — Allocations, adjustments and financial statement bridges

**Profile:**Primary allocation and statement bridge v1. **Original automation links:**AUTO-006 AUTO-007 AUTO-043 AUTO-056.

**Inputs:**Reviewed source balances; primary allocations; separate note references; signed adjustments; statement node definitions.

**Algorithm/steps:**

1. Allocate each source amount to primary destinations using exact amounts or rational coefficients
2. Require primary allocated total to equal source; report residual rather than plug
3. Apply each approved journal once by immutable identity and period
4. Resolve acyclic statement sums; repeated note references display values without increasing primary financial totals

**Human judgment:**Accounting classification, comparative restatement, current/noncurrent and cash-flow presentation are reviewed elections.

**Exceptions to test:**

- Over-allocation
- Cyclic statement reference
- Missing source
- Duplicate journal identity
- Unapproved offsetting

**Independent example:**100 CU ->60 current/40 noncurrent; note100 is a presentation reference. Primary total100, not200 CU.

**Evidence/context:**[ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0); DESIGN-ALLOCATION.

### M03 — Materiality and clearly trivial thresholds

**Profile:**Selected materiality policy arithmetic v1. **Original automation links:**AUTO-046.

**Inputs:**Benchmark source/value; explicit percentage or amount; specific levels; performance/trivial values; currency/scale; rationale.

**Algorithm/steps:**

1. Use an approved normalized benchmark; never take absolute profit silently
2. Calculate selected benchmark x rate with explicit final rounding
3. Keep specific materiality, performance materiality and clearly trivial distinct
4. Version revisions and identify affected samples, evaluation and reporting uses

**Human judgment:**Benchmark/normalization/percentages and qualitative materiality are professional judgments, not ISA-prescribed constants.

**Exceptions to test:**

- Negative/zero benchmark
- Blank versus zero trivial
- Rounding boundary
- Revised benchmark

**Independent example:**Illustrative1000000 CU x5%=50000 CU overall;60% of overall=30000 CU performance; explicitly selected trivial0 remains0 CU.

**Evidence/context:**[AUD-320](https://standards.auasb.gov.au/node/859); [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M04 — Sampling frame and reproducible selection

**Profile:**Reproducible simple random selection without replacement. **Original automation links:**AUTO-047.

**Inputs:**Stable ordered unique eligible IDs; frame hash; n; entropy/seed; exact existing selector version; specific/excluded strata.

**Algorithm/steps:**

1. Keep current HMAC/rejection/partial-Fisher-Yates implementation and its inputs
2. Partition specific, residual and excluded units disjointly
3. Draw n unique residual units without replacement; retain exact order and input basis
4. Extensions retain earlier selected prefix and tested-unit lineage under the same frame; changed frame requires new design

**Human judgment:**Audit objective, unit and design appropriateness require review. Reproducibility is not assurance.

**Exceptions to test:**

- Duplicate unit IDs
- n>N
- Changed frame
- Missing selected support
- Targeted-only items

**Independent example:**Residual IDs A,B,C; n=3 -> all three exactly once. n=4 is invalid. Same pinned selector inputs reproduce its actual order.

**Evidence/context:**[AUD-530](https://standards.auasb.gov.au/node/728); DESIGN-SELECTION.

### M05 — Audit sample-size determination

**Profile:**Bounded attribute size helper + evidenced substantive-size route. **Original automation links:**AUTO-047.

**Inputs:**N where finite; tolerable deviation p; sampling risk alpha; acceptance count c; expected-deviation rationale; statistical design.

**Algorithm/steps:**

1. For binomial zero-acceptance c=0 use smallest integer n with (1-p)^n<=alpha
2. For general c use smallest n with cumulative Binomial(n,p) at c<=alpha; expected deviation informs the approved acceptance design, not a hidden formula
3. For finite simple random sampling use exact hypergeometric cumulative probability at the declared minimally unacceptable defect count; record threshold rounding
4. Substantive/MUS sizes require a separately evidenced matching design/evaluation method; do not apply attribute formulas to money

**Human judgment:**Selected risk, tolerable deviation, acceptance plan and adequacy are professional methodology decisions; this helper is a proposed bounded design.

**Exceptions to test:**

- p/alpha outside(0,1)
- n above population
- Expected deviations incompatible with zero-acceptance plan
- Monetary projection requested from attribute plan

**Independent example:**Fictional binomial alpha=.05,p=.05,c=0 gives n=59; .95^58>.05 and .95^59<=.05.

**Evidence/context:**[AUD-530](https://standards.auasb.gov.au/node/728); [STAT-BINOM](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binom.html); [STAT-HYPERGEOM](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.hypergeom.html); [VENDOR-MUS](https://help.highbond.com/helpdocs/analytics/15/en-us/Content/analytics/data_preparation/sampling_data/calculating_sample_size_for_a_monetary_unit_sample.htm).

### M06 — Projection, sampling evaluation and risk allowance

**Profile:**Point projection with explicit risk-evaluation boundary. **Original automation links:**AUTO-047 AUTO-048.

**Inputs:**Current reconciled residual frame; tested book/audited amounts; selected projection profile; separately tested specifics; strata.

**Algorithm/steps:**

1. Require actual evaluated work on every selected item
2. Under existing positive-book same-direction ratio profile compute inclusive residual estimate = residualBook x sampledSignedError / sampleBook
3. Incremental projection = inclusive estimate - sampled factual errors; retain factual errors separately
4. Sum disjoint strata/specific effects once; record sampling-risk evaluation and additional work independently; no invented confidence bound

**Human judgment:**Projection method, anomaly classification, sampling-risk allowance and acceptable audit basis require methodology review.

**Exceptions to test:**

- Mixed-sign errors outside current profile
- Zero sample-book denominator
- Untested item
- Anomaly without evidence
- Population replacement

**Independent example:**1000 CU residual,200 sampled,10 error ->50 inclusive,40 incremental+10 factual. Separate specific error10 ->60 CU total.

**Evidence/context:**[AUD-530](https://standards.auasb.gov.au/node/728); [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-PROJECTION.

### M07 — Analytical expectations, ratios, trends and tolerances

**Profile:**Purpose-specific analytical calculations. **Original automation links:**AUTO-010 AUTO-033 AUTO-044.

**Inputs:**Comparable period/unit inputs; approved expectation; precision; absolute/relative threshold; denominator definition; reliable-data evidence.

**Algorithm/steps:**

1. Separate risk-assessment, substantive and final analytical purposes
2. Calculate actual-expected difference and ratio under explicit sign/denominator definitions
3. Freeze substantive expectation/precision/threshold before observed comparison
4. Generate distinct investigation cases with actual explanation and corroboration; preserve historical explanations on refresh

**Human judgment:**Suitability, reliable data, sufficiently precise expectation, threshold and interpretation remain auditor decisions.

**Exceptions to test:**

- Zero denominator
- Incomparable periods
- Negative base percentage
- Missing corroboration
- Expectation chosen after seeing actual

**Independent example:**Expected100 CU,actual120 ->difference20 CU and20% using expected100 as denominator. Expected0 ->relative difference not evaluable.

**Evidence/context:**[AUD-520](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-500](https://standards.auasb.gov.au/node/1012).

### M08 — Journal-entry and anomaly rules

**Profile:**Explainable journal candidate rules. **Original automation links:**AUTO-009 AUTO-021.

**Inputs:**Complete reconciled journal lines; journal/line IDs; posting date/time; preparer/approver; accounts; signed amounts; approved rule parameters.

**Algorithm/steps:**

1. Validate population and journal balancing before filtering
2. Apply explicit rules such as period-end, round amount, unusual account pair, preparer/approver conflict or missing approval using only supplied facts
3. Consolidate reasons by journal/line economic unit without multiplying exposure
4. Record selection rationale, actual test/evidence, conclusion and finding link; preserve completeness limitation

**Human judgment:**Fraud risk, rule thresholds, unusualness and final conclusions require human inquiry/investigation.

**Exceptions to test:**

- No timestamp
- System user different from human author
- Same journal triggers several rules
- Partial journal extract

**Independent example:**One500 CU journal flagged by3 rules ->one candidate,3 reasons,500 CU exposure; no fraud verdict.

**Evidence/context:**[AUD-240](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-500](https://standards.auasb.gov.au/node/1012).

### M09 — Receivables aging and subsequent-cash application

**Profile:**As-of aging and explicit receipt allocation. **Original automation links:**AUTO-013.

**Inputs:**Invoice/credit/receipt identities; due date or explicitly selected invoice-date basis; report date; signed open amount; referenced cash allocations.

**Algorithm/steps:**

1. Reconstruct open balance at reporting date, retaining later receipts separately
2. Compute age from selected date basis and assign one mutually exclusive bucket
3. Allocate each subsequent receipt to explicit invoice IDs without exceeding receipt/open balance; retain unapplied cash/FX
4. Reconcile aging totals to receivable population and evaluate corroboration and recoverability separately

**Human judgment:**Due-date basis, disputed credit allocation, confirmation alternatives and collectability are auditor decisions.

**Exceptions to test:**

- Missing due date
- Credit balances
- Partial or duplicate receipt allocation
- Receipt after evaluation cutoff
- Wrong currency

**Independent example:**Invoice100 CU; explicit subsequent receipt40 ->supported receipt40,remaining60 CU. Receipt is not subtracted from the year-end book balance.

**Evidence/context:**[AUD-505](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); DESIGN-AGING.

### M10 — Revenue and deferred-revenue schedules

**Profile:**Approved time-based revenue schedule and separate recognition record. **Original automation links:**AUTO-015.

**Inputs:**Contract/obligations; approved transaction price and allocation; performance evidence; start/end; period; time/progress convention; recorded revenue.

**Algorithm/steps:**

1. Record contract/performance-obligation, price/allocation and over-time versus point-in-time judgments first
2. For uniform time-based supported obligations calculate overlap using explicitly full-month or actual-day convention
3. Reconcile opening contract liability + applicable receipts/billings - earned release to closing using declared balance signs
4. Nonuniform progress/modifications/variable price use an explicitly supported separate method or actual external schedule review

**Human judgment:**A schedule is arithmetic support; enforceable contract, control transfer, progress, principal/agent and constraint judgments remain recorded professional work.

**Exceptions to test:**

- Nonuniform performance
- Contract modification
- Inclusive-day versus month mismatch
- Nonrefundable receipt before recognition criteria

**Independent example:**Approved uniform1200 CU/12 full months;3 completed months ->300 CU. Receipt1200 does not alone establish1200 CU revenue.

**Evidence/context:**[ACC-IFRS15](https://standards.aasb.gov.au/sites/default/files/2026-11/AASB15_12-14_COMPdec22_07-26.pdf); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M11 — Revenue cut-off, prices, discounts and credit notes

**Profile:**Commercial price/cut-off comparisons. **Original automation links:**AUTO-012 AUTO-014.

**Inputs:**Invoice lines; quantity/unit; approved dated price/discount/tax terms; delivery/control evidence; posting/invoice/credit dates; reporting cutoff.

**Algorithm/steps:**

1. Compute expected net line value under explicit sequential/combined discount policy
2. Compare commercial arithmetic with recorded amount separately from revenue recognition
3. Flag mismatched operational/accounting dates under the approved transaction/control rule
4. Link later credits to exact invoices and evaluate whether they corroborate year-end conditions

**Human judgment:**Delivery terms/control transfer, contract enforceability and adjustment versus subsequent event require actual evaluation.

**Exceptions to test:**

- Invoice date alone
- Partial delivery
- Price currency mismatch
- Discount tax-base order
- Unlinked credit

**Independent example:**10 units x20 CU with10% approved discount ->180 CU before declared tax. Dec31 invoice/Jan2 control transfer ->cut-off candidate, not automatic misstatement.

**Evidence/context:**[ACC-IFRS15](https://standards.aasb.gov.au/sites/default/files/2026-11/AASB15_12-14_COMPdec22_07-26.pdf); [ACC-IAS10](https://standards.aasb.gov.au/aasb-110-mar-2020); DESIGN-COMMERCIAL.

### M12 — Procure-to-pay matching, accruals and unrecorded liabilities

**Profile:**Line-grain P2P matching/accrual/search. **Original automation links:**AUTO-016 AUTO-017 AUTO-018 AUTO-019.

**Inputs:**PO/receipt/invoice/payment line identities; quantities; supplier/master IDs; service period; posting/payment dates; amount/currency; policy.

**Algorithm/steps:**

1. Match explicit stable document-line keys with one-to-many quantities/payments without header multiplication
2. Reconcile purchase/payable movements and detect exact duplicates/shared normalized identity candidates
3. Compute eligible service-period accrual/prepayment under approved allocation; retain unsettled balances
4. Search post-period documents/payments for pre-period obligations and record actual investigation

**Human judgment:**Receipt/service obligation, appropriate matching tolerance, shared-identity relationship and completeness are human decisions.

**Exceptions to test:**

- One invoice paid twice versus partial payments
- PO absent but valid expense
- Unmatched service period
- Accrual reversal double count

**Independent example:**Invoice100 CU paid60+40 ->settled100 once. Two invoice lines matching one PO header must not each replicate header100.

**Evidence/context:**[AUD-500](https://standards.auasb.gov.au/node/1012); [ACC-IAS37](https://standards.aasb.gov.au/aasb-137-jan-2026-0); DESIGN-P2P.

### M13 — Bank reconciliation and cash movements

**Profile:**Signed bank reconciliation and explicit matching. **Original automation links:**AUTO-020 AUTO-021.

**Inputs:**Independent bank statement; cash GL; exact account/currency/date; bank-reconciliation items with signs/status; transfers; confirmations.

**Algorithm/steps:**

1. Match explicit references or approved exact keys; retain ambiguous one-to-many matches
2. Recalculate adjusted bank and adjusted book sides with declared sign conventions
3. Trace reconciling items to later clearing and investigate stale/unusual items
4. Pair inter-account transfers only on supported references; a paired event has two cash legs but one investigation exposure

**Human judgment:**Bank authenticity, account rights/restrictions, completeness and clearing evidence require evaluation.

**Exceptions to test:**

- Offsetting unexplained items
- FX mismatch
- Duplicate bank line
- Old outstanding cheque
- Transfer across reporting cutoff

**Independent example:**Bank100 CU +deposit in transit20 -outstanding cheque5 =adjusted115 CU; book115 ->residual0, yet reconciling evidence still required.

**Evidence/context:**[AUD-505](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-500](https://standards.auasb.gov.au/node/1012); DESIGN-BANK.

### M14 — Inventory movement, count and cut-off

**Profile:**Inventory quantity/count/cut-off bridge. **Original automation links:**AUTO-022 AUTO-023 AUTO-024.

**Inputs:**Item/location/unit; opening quantity; dated receipts/issues/transfers; signed count; count date/report date; ownership evidence.

**Algorithm/steps:**

1. Reconcile quantity opening +in -out =closing by item/location/unit
2. Compare actual signed count with register and record both-direction test evidence
3. Roll counts forward/back with actual intervening movements
4. Link transfers at both locations and investigate timing/ownership/cut-off rather than treating internal movement as purchase/sale

**Human judgment:**Attendance, count instructions, ownership, consignment and reliability remain actual audit work.

**Exceptions to test:**

- Incompatible units
- Unobserved locations
- Negative stock
- Missing transfer leg
- Count date differs from report date

**Independent example:**Opening10+receipts5-issues8=closing7 units;count6 ->register overstatement1 unit before valuation.

**Evidence/context:**[AUD-501](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ACC-IAS2](https://www.endorsement-board.uk/documents/2184/IAS_2_-_Inventories.pdf); DESIGN-INVENTORY.

### M15 — Inventory cost and cost of sales

**Profile:**Periodic weighted-average costing v1; separate additional profiles. **Original automation links:**AUTO-025.

**Inputs:**Opening quantity/value; approved eligible receipt/conversion cost; issues/closing quantities; cost method; recorded COS/closing value.

**Algorithm/steps:**

1. Reconcile quantities before costing
2. Supported periodic weighted average =eligible cost available /units available; retain rational unit cost until declared issue-total rounding
3. Compute issue cost then residual closing value so total eligible cost reconciles exactly
4. Specific identification/FIFO/moving average/production overhead need their own profile when required; no silent conversion of all clients to weighted average

**Human judgment:**Permitted cost formula, eligible cost, normal capacity, abnormal waste and policy consistency require reviewed basis.

**Exceptions to test:**

- No units with nonzero cost
- Negative quantities
- Unsupported fractional units
- Production overhead unsupported
- Method change

**Independent example:**10 units/100 CU +10/140 ->20 units/240,average12. Issues15 ->180 CU;closing5 ->60 CU.

**Evidence/context:**[ACC-IAS2](https://www.endorsement-board.uk/documents/2184/IAS_2_-_Inventories.pdf); DESIGN-INVENTORY.

### M16 — Inventory NRV and obsolescence indicators

**Profile:**NRV input comparison and movement indicators. **Original automation links:**AUTO-026.

**Inputs:**Item cost/quantity; approved selling price; completion cost; necessary selling cost; observable evidence date; movement/age thresholds.

**Algorithm/steps:**

1. Calculate approved NRV per unit =selling price -completion cost -necessary selling cost
2. Compare at supported item or justified grouping level; do not offset unrelated item gains and losses
3. Calculate proposed write-down =max(0,cost-NRV) xquantity under supported nonnegative scope
4. Flag slow/nonmoving items independently; review reversals subject to original write-down limit and current evidence

**Human judgment:**Estimated selling price/costs, grouping, obsolescence and reversals require professional evidence; turnover alone is not NRV.

**Exceptions to test:**

- Missing completion cost
- Negative NRV requiring separate obligation analysis
- Post-period price changes
- Unrelated item netting

**Independent example:**Cost12 CU,price11,completion1,selling1 ->NRV9;5 units ->write-down15 CU.

**Evidence/context:**[ACC-IAS2](https://www.endorsement-board.uk/documents/2184/IAS_2_-_Inventories.pdf); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M17 — Asset roll-forward, disposals and revaluation movements

**Profile:**Dual asset roll-forwards. **Original automation links:**AUTO-027 AUTO-029.

**Inputs:**Asset/component identity; cost and accumulated charge openings; additions/disposals/transfers/revaluation; impairment; ledger.

**Algorithm/steps:**

1. Reconcile gross cost and accumulated depreciation/amortization separately
2. Preserve disposal of original cost and related accumulated charge, not net carrying value only
3. Compute carrying amount after separately recorded impairment/revaluation effects
4. Reconcile movements/classes to ledger and evidence; retain actual disposal consideration and gain/loss support

**Human judgment:**Recognition, revaluation class policy, derecognition date and classification remain human decisions.

**Exceptions to test:**

- Disposed cost without accumulated removal
- Asset transferred twice
- Revaluation across only selected class items
- Negative remaining basis

**Independent example:**Cost1000+add200-dispose100=1100;accum300+charge100-remove30=370 ->carrying730 CU before impairment.

**Evidence/context:**[ACC-IAS16](https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ias-16-property-plant-and-equipment.pdf?bypass=on); [ACC-IAS38](https://standards.aasb.gov.au/aasb-138-dec-2022-0).

### M18 — Depreciation and amortization

**Profile:**Straight-line time-apportioned charge v1. **Original automation links:**AUTO-028 AUTO-029.

**Inputs:**Cost/component; residual; useful life; available-for-use/disposal dates; reporting window; prior accumulated charge; actual days/month convention.

**Algorithm/steps:**

1. Annual base =(cost-residual)/usefulLife for supported cost model
2. Apply approved actual eligible period convention; distinguish available-for-use from purchase/payment date
3. Cap charge to remaining depreciable carrying basis and retain over-depreciation as a separate exception
4. Finite-life amortization uses its own life/support; indefinite-life intangible is not mechanically amortized; estimate changes are prospective under reviewed basis

**Human judgment:**Useful life, residual, consumption method, componentization, ready date and estimate revisions require actual review.

**Exceptions to test:**

- Zero life
- Residual above cost
- Partial reporting year beyond profile
- Indefinite life
- Fully depreciated but still used

**Independent example:**Cost1000,residual100,life3 years ->annual300 CU. Approved half-year convention ->150 CU;remaining basis100 caps charge100.

**Evidence/context:**[ACC-IAS16](https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ias-16-property-plant-and-equipment.pdf?bypass=on); [ACC-IAS38](https://standards.aasb.gov.au/aasb-138-dec-2022-0); DESIGN-DEPRECIATION.

### M19 — Capitalization, repairs and borrowing-cost support

**Profile:**Capitalization screening and borrowing-cost support. **Original automation links:**AUTO-030.

**Inputs:**Approved capitalization policy; transaction/category/date; asset/service evidence; qualifying-asset decision; borrowing costs and suspension intervals.

**Algorithm/steps:**

1. Compare additions/repairs with explicit policy categories and thresholds as candidates only
2. Distinguish direct costs from routine servicing and unsupported internal-development costs
3. For a supported borrowing-cost schedule calculate eligible costs over actual qualifying active intervals, respecting available incurred costs
4. Suspend/stop per reviewed qualifying-asset facts; route complex financing or development to reviewed specialist schedules

**Human judgment:**Recognition criteria cannot be replaced by a monetary threshold; qualifying development and asset-ready dates require evidence.

**Exceptions to test:**

- Small capital item
- Large routine repair
- Suspended project
- Training/startup costs
- Internal development criteria missing

**Independent example:**100000 CU qualifying expenditure xapproved6% x6/12 active year=3000 CU subject to applicable borrowing-cost cap and policy facts.

**Evidence/context:**[ACC-IAS16](https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ias-16-property-plant-and-equipment.pdf?bypass=on); [ACC-IAS38](https://standards.aasb.gov.au/aasb-138-dec-2022-0); [ACC-IAS23](https://standards.aasb.gov.au/aasb-123-mar-2020).

### M20 — Effective interest, borrowings and covenants

**Profile:**Contractual interest + bounded effective-interest support. **Original automation links:**AUTO-036 AUTO-040.

**Inputs:**Facility contract; principal movements; coupon/day count; approved EIR/cash flows; fees; currency; covenant definitions/date.

**Algorithm/steps:**

1. Reconcile principal separately from interest and fees
2. Contractual interest uses actual agreed balance/rate/day-count segments
3. For supported regular cash flows compute amortized-cost roll-forward opening+EIR interest-cash paid; solve EIR only with a bracketed unique-root contract and residual validation
4. Compute covenant headroom from exact signed definitions and test date; modifications/credit impairment/complex instruments route to separate approved profiles

**Human judgment:**Classification, EIR inputs, modification/derecognition and covenant rights/waivers remain reviewed judgments.

**Exceptions to test:**

- Multiple/no IRR roots
- Missing fee
- Rate reset
- Wrong day count
- Covenant waiver after reporting date

**Independent example:**Principal1000 CU x12% x30/360=10 CU contractual interest. Opening AC950 x10% EIR -coupon80 ->closing965 CU.

**Evidence/context:**[ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-INTEREST.

### M21 — Lease liability and right-of-use schedules

**Profile:**Fixed-payment lessee schedule v1. **Original automation links:**AUTO-037.

**Inputs:**Actual lease identification/term; dated fixed payments; approved discount rate; commencement; prepayments/incentives/direct/restoration costs; ROU life.

**Algorithm/steps:**

1. Determine payment timing and exclude payments already paid at initial measurement
2. Liability =sum unpaid payments/(1+periodic rate)^period; preserve rate compounding convention
3. Roll liability by interest and actual payments; ROU opening includes applicable cost adjustments separately
4. Apply approved ROU depreciation period and retain impairment/reassessment/modification as separate supported method or reviewed work

**Human judgment:**Lease definition, exemptions, options, rate, life and modifications require professional conclusions.

**Exceptions to test:**

- Advance payments
- Zero rate
- Monthly annual-rate conversion
- Indexation/modification
- Ownership transfer/life exception

**Independent example:**Two year-end110 CU payments at10% annual ->initial190.91 CU. Year1 interest19.09/payment110 ->liability100.00 CU with declared rounding.

**Evidence/context:**[ACC-IFRS16](https://www.endorsement-board.uk/documents/2148/IFRS_16_-_Leases.pdf); [ACC-IAS16](https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ias-16-property-plant-and-equipment.pdf?bypass=on).

### M22 — Foreign-currency measurement and translation

**Profile:**Rate-role-specific FX calculation. **Original automation links:**AUTO-038 AUTO-043 AUTO-048.

**Inputs:**Transaction/functional/presentation currency; monetary classification; dated rate with direction; foreign amount; carrying amount; framework.

**Algorithm/steps:**

1. Normalize explicit rate direction to functional units per foreign unit
2. Initial transaction amount =foreign amount xselected applicable transaction rate
3. Retranslate monetary closing balances at approved closing rate and compare carrying amount
4. Keep historical nonmonetary, fair-value-date, advance-consideration and foreign-operation translation profiles separate; no blanket closing-rate conversion

**Human judgment:**Functional currency, monetary nature, rate accessibility and P&L/OCI classification require review.

**Exceptions to test:**

- Inverted rate
- Missing rate date
- Nonexchangeability
- Mixed functional currency
- Historical-cost asset at closing rate

**Independent example:**100 foreign units at3 CU/foreign=300 CU initial;closing monetary rate3.2 ->320 CU,20 CU remeasurement difference before classification.

**Evidence/context:**[ACC-IAS21](https://www.endorsement-board.uk/documents/2167/IAS_21_-_The_Effects_of_Changes_in_Foreign_Exchange_Rates.pdf); DESIGN-FX.

### M23 — Investment income and fair-value input review

**Profile:**Holdings/income bridge and valuation-input evaluation. **Original automation links:**AUTO-040.

**Inputs:**Instrument/units; opening/trades; custodian evidence; prices/date/market/currency; income rights; approved classification and valuation method.

**Algorithm/steps:**

1. Reconcile units/cost/transactions to custodian and GL without substituting custodian completeness for all holdings
2. Recalculate contractual dividend/coupon/simple yield inputs with exact dates and denominator
3. Compare supplied valuation inputs to their source/date and trace calculation
4. Complex fair-value models/classification/market assessment remain reviewed specialist work; quoted input is not an automatic fair-value conclusion

**Human judgment:**Rights, classification, market activity, valuation technique and observable-input appropriateness require evaluation.

**Exceptions to test:**

- Stale quote
- Restricted holding
- Dividend after ex-date without rights
- Corporate action
- Derivative model absent

**Independent example:**10 units xapproved50 CU=500 CU quoted-value calculation. Dividend2 CU per eligible unit ->20 CU; rights and valuation date still evaluated.

**Evidence/context:**[ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); [ACC-IFRS13](https://standards.aasb.gov.au/aasb-13-dec-2022); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M24 — Expected credit losses and allowances

**Profile:**Approved provision-matrix calculation + separately reviewed ECL models. **Original automation links:**AUTO-013 AUTO-040 AUTO-042.

**Inputs:**Eligible exposure/aging/segments; disjoint specific assessments; approved rates/scenarios/discounting; actual forward-looking support.

**Algorithm/steps:**

1. Choose applicable general versus simplified impairment approach explicitly
2. For supported matrix calculate sum exposure xapproved lifetime loss rate, removing exposures separately assessed from collective double counting
3. For provided cash-flow/scenario model calculate probability-weighted discounted cash shortfalls with probability/unit/horizon checks
4. Reconcile allowance movements; review staging/SICR/default/forward-looking assumptions and model adequacy separately; twelve-month ECL is not twelve months of contractual shortfalls

**Human judgment:**Scope, segmentation, rates, forecast adjustments, staging, collateral and model appropriateness require independent professional evaluation.

**Exceptions to test:**

- Overlapping specific/collective exposure
- Probabilities not summing1
- Rate outside0..1
- Modified/credit-impaired asset
- No forward-looking basis

**Independent example:**Eligible exposures1000 CU at2% plus500 at10% ->allowance70 CU; separately assessed exposure must not also sit in either bucket.

**Evidence/context:**[ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M25 — Nonfinancial asset impairment

**Profile:**Recoverable-amount comparison + controlled valuation support. **Original automation links:**AUTO-042.

**Inputs:**Correct asset/CGU scope; carrying amount; supported VIU and FVLCD; forecasts/rate; goodwill allocations; prior impairment.

**Algorithm/steps:**

1. Separate IAS36 scope from inventory NRV and financial-asset ECL
2. For supported input comparison recoverable=max(VIU,FVLCD); loss=max(0,carrying-recoverable)
3. For a supported discounted model pin dates, pre-tax compatible cash flows/rate and terminal assumptions; require denominator/rate consistency and sensitivity
4. Allocate/reverse only under an explicit approved asset/CGU/goodwill profile; keep impairment facts and subsequent depreciation link

**Human judgment:**CGU identification, forecast plausibility, discount/terminal assumptions, recognition and reversal limits require professional work.

**Exceptions to test:**

- Goodwill reversal
- Scope includes IFRS9 asset
- Growth>=discount rate in perpetuity model
- Unsupported CGU allocation

**Independent example:**Carrying100 CU,VIU80,FVLCD90 ->recoverable90,loss10 CU. This comparison does not independently validate either valuation.

**Evidence/context:**[ACC-IAS36](https://standards.aasb.gov.au/aasb-136-jan-2026); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M26 — Payroll, benefits and gross-to-net

**Profile:**Effective-dated payroll rule-set recalculation. **Original automation links:**AUTO-031 AUTO-032 AUTO-033.

**Inputs:**Employee/run/payment identity; employment/earnings data; approved dated tax/social-insurance brackets/caps/reliefs; benefits obligations.

**Algorithm/steps:**

1. Reconcile authorized roster, gross payroll, deductions, bank payments and GL by run
2. Calculate each earnings/deduction component under explicit dated basis/brackets/caps; separate employee from employer costs
3. Reconcile gross-deductions=net and employer liabilities separately
4. Review leave/bonus/accrual obligations; actuarial defined-benefit work remains separately evidenced; rates are never inferred from this example

**Human judgment:**Employment validity, benefit classification, taxable base, relief and local legal parameters require authority and actual review.

**Exceptions to test:**

- Midperiod hire/leaver
- Threshold/cap crossing
- Duplicate employee bank account
- Retroactive correction
- Defined-benefit obligation

**Independent example:**Fictional gross1000 CU,approved deductions100+50 ->net850 CU. Employer contribution is not subtracted again from employee net.

**Evidence/context:**[ACC-IAS19](https://standards.aasb.gov.au/aasb-119-dec-2022); DESIGN-TAX-PARAMETERS.

### M27 — VAT and withholding reconciliation

**Profile:**Dated VAT/withholding arithmetic and reconciliation. **Original automation links:**AUTO-034.

**Inputs:**Transaction/register/return/GL IDs; approved tax regime/rate/base; inclusion convention; deductible status; period; payments/credits.

**Algorithm/steps:**

1. Calculate tax-exclusive base xrate or tax-inclusive gross xrate/(1+rate) explicitly
2. Apply dated eligibility/rounding/exemption rules and retain unsupported legal classifications
3. Reconcile registers to filed return, GL liability and payments with identified timing adjustments
4. Separate VAT from withholding, reversals and recoverability; discrepancies become investigation cases

**Human judgment:**Applicable rate, taxable event, deduction/exemption and filing obligations are legal/accounting decisions with actual dated authority.

**Exceptions to test:**

- Wrong effective rate
- Exempt versus zero-rated
- Inclusive/exclusive mismatch
- Credit-note period
- Unverified local law

**Independent example:**Fictional10%:gross110 CU ->base100,tax10. This is an arithmetic fixture, not a Mongolian VAT-rate claim.

**Evidence/context:**DESIGN-TAX-PARAMETERS; [AUD-500](https://standards.auasb.gov.au/node/1012).

### M28 — Current and deferred income tax

**Profile:**Approved current/deferred tax schedule arithmetic. **Original automation links:**AUTO-035.

**Inputs:**Accounting profit; approved permanent/timing adjustments; tax base/carrying values; enacted/substantively enacted rates; recognition evidence; return/GL.

**Algorithm/steps:**

1. Bridge accounting to taxable profit with each adjustment identified and approved
2. Calculate current tax/credits under selected law pack and reconcile return/payments
3. Calculate temporary differences and schedule reversals/rates; keep asset/liability sign/classification explicit
4. Recognize DTA only under reviewed criteria and retain exceptions/offset/uncertainty/PillarTwo decisions in separate supported records

**Human judgment:**Tax law, temporary versus permanent differences, recognition, rate on recovery/settlement and offsetting require actual review.

**Exceptions to test:**

- DTA without probable support
- Initial-recognition/goodwill exception
- Uncertain tax treatment
- Rate change
- Unsupported PillarTwo case

**Independent example:**Fictional taxable temporary difference200 CU x20% ->DTL40 CU if applicable. Permanent difference does not create deferred tax.

**Evidence/context:**[ACC-IAS12](https://standards.aasb.gov.au/aasb-112-sep-2023); DESIGN-TAX-PARAMETERS.

### M29 — Equity, reserves and dividends

**Profile:**Equity-class roll-forward and authorization linkage. **Original automation links:**AUTO-039.

**Inputs:**Share/class/holder; opening capital/reserves/retained earnings; approved issues/buybacks/dividends/transfers; legal evidence; GL.

**Algorithm/steps:**

1. Reconcile each equity component separately with signed movements
2. Recalculate shares xnominal/premium under actual instrument terms
3. Link each capital/distribution action to actual resolution/rights and posting evidence
4. Keep retained earnings/OCI transfers and subsequent-declared dividends distinct from reporting-date liabilities

**Human judgment:**Liability-versus-equity classification, lawful distribution, treasury shares and authorization require professional/legal work.

**Exceptions to test:**

- Declared after period end
- Preference share liability features
- Unapproved dividend
- OCI recycled twice

**Independent example:**Retained earnings500 CU +profit100 -approved dividend40 +approved transfer10 =570 CU; other component carries opposite transfer10.

**Evidence/context:**[ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0); [ACC-IAS10](https://standards.aasb.gov.au/aasb-110-mar-2020); DESIGN-EQUITY.

### M30 — Consolidation and intercompany eliminations

**Profile:**Component aggregation and explicit eliminations v1. **Original automation links:**AUTO-043.

**Inputs:**Approved group/control scope; mapped aligned component TBs; currencies/translation; ownership facts; signed elimination journals; reciprocal balances.

**Algorithm/steps:**

1. Retain each component original/mapping/translation independently
2. Aggregate only compatible mapped amounts
3. Apply approved balanced elimination journals once and reconcile unmatched reciprocal balances separately
4. Keep acquisition/NCI/goodwill/unrealized-profit/equity-method work as separately approved schedules rather than plug differences

**Human judgment:**Control, acquisition date, ownership, consolidation policy, impairment and elimination basis require actual review.

**Exceptions to test:**

- 100/95 reciprocal mismatch
- Currency mismatch
- Missing component
- NCI method absent
- Journal copied twice

**Independent example:**A receivable100 CU/B payable95 CU ->5 CU mismatch. Do not automatically erase100 on both sides or create a5 CU plug.

**Evidence/context:**[ACC-IFRS10](https://www.endorsement-board.uk/documents/2158/IFRS_10_-_Consolidated_Financial_Statements.pdf); [ACC-IAS21](https://www.endorsement-board.uk/documents/2167/IAS_21_-_The_Effects_of_Changes_in_Foreign_Exchange_Rates.pdf); [AUD-600](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M31 — Provisions, commitments and contingencies

**Profile:**Provision/contingency register and structured estimate support. **Original automation links:**AUTO-049.

**Inputs:**Matter/obligation; event; legal/constructive basis; probability assessment; estimate/range; timing; discount/reimbursement; legal evidence.

**Algorithm/steps:**

1. Capture obligation and recognition/disclosure assessment separately from numerical estimate
2. For approved large-population expected-value schedule sum probability xoutcome; a single obligation may require a different best estimate
3. Discount when applicable using compatible timing/rate and separate reimbursement asset basis
4. Reconcile opening+new+unwind-used-reversed=closing; unknown exposure remains unknown

**Human judgment:**Present obligation, probability, reliable estimate, best estimate and disclosure are professional/legal conclusions; probability alone is insufficient.

**Exceptions to test:**

- Uncertain obligation
- Onerous contract
- Reimbursement not virtually certain
- Unknown amount
- Range not a probability distribution

**Independent example:**Approved outcomes0 CU at75%,100 CU at25% ->expected value25 CU for a suitable population model; not automatic recognition of a single lawsuit.

**Evidence/context:**[ACC-IAS37](https://standards.aasb.gov.au/aasb-137-jan-2026-0); [AUD-501](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf).

### M32 — Going-concern indicators and forecast scenarios

**Profile:**Explicit forecast/liquidity/covenant indicators. **Original automation links:**AUTO-044 AUTO-050.

**Inputs:**Unrestricted cash; dated inflows/outflows; committed facilities/restrictions; maturities; covenant definitions; forecast horizon; approved scenarios.

**Algorithm/steps:**

1. Project dated cash closing =opening+inflows-outflows by scenario
2. Distinguish committed available facilities from hoped-for refinancing
3. Calculate selected ratios/headroom with defined denominators and identify earliest shortfall within supplied horizon
4. Evaluate management assessment and mitigations, sensitivity, material uncertainty, basis and disclosures independently

**Human judgment:**Going-concern basis and material uncertainty are audit/accounting judgments; indicator success cannot make a going-concern opinion.

**Exceptions to test:**

- Restricted cash
- Uncommitted funding
- Short forecast
- Zero burn/denominator
- Covenant failure accelerates debt

**Independent example:**Cash90 CU,net burn30 CU/month and no financing ->illustrative3-month simple runway; dated forecast still governs actual shortfall.

**Evidence/context:**[AUD-570](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-FORECAST.

### M33 — Signed misstatements, correction and exposure aggregation

**Profile:**Canonical signed error/correction evaluation. **Original automation links:**AUTO-048.

**Inputs:**Canonical issue; signed effect lines/account/assertion; currency/period; factual/projected/qualitative class; verified corrections; current materiality.

**Algorithm/steps:**

1. Deduplicate origins by actual economic issue with explicit links, not fuzzy text
2. Maintain signed balances and separate absolute exposure; do not net unrelated errors automatically
3. Calculate verified residual =original effect -verified compatible correction, with projection lineage
4. Evaluate individual/aggregate/prior-period/qualitative effects and current thresholds; disclosure/unknown effects retain narrative decisions

**Human judgment:**Misstatement classification, permissible offset, qualitative materiality and final evaluation require auditor judgment.

**Exceptions to test:**

- Duplicate origins
- Different currencies
- Agreed but unposted correction
- Reversed posting
- Unknown effect coerced to zero

**Independent example:**100 CU confirmed error,60 CU verified posting ->40 CU outstanding. Gross+100/-80 ->180 gross/20 signed net, neither alone determines materiality.

**Evidence/context:**[AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-PROJECTION.

### M34 — Dates, temporal states and retention clocks

**Profile:**Policy-based dates, limited amendment and retention clocks. **Original automation links:**AUTO-045 AUTO-051 AUTO-057 AUTO-058.

**Inputs:**Reporting/report/issue/discovery/assembly dates; jurisdiction/profile; selected policy anchor/period; holds; predecessor/successor.

**Algorithm/steps:**

1. Keep occurrence, discovery, approval, signing, issue and assembly dates distinct
2. For date-limited audit work compare actual coverage-through with required report date
3. Add reviewed calendar durations using explicit leap-day/month-end/timezone policy; calculate longest binding retention deadline and active holds
4. Route later facts by actual chronology; conditional dual dating binds restricted note/procedures and does not reset unrelated work automatically

**Human judgment:**Legal permission for restricted amendment, policy anchor/retention and prevention-of-reliance actions need actual authority.

**Exceptions to test:**

- Leap-day anniversary
- Issue precedes approval
- Multiple holds
- Undated policy
- Backdated procedure

**Independent example:**Fictional policy anchor2026-11-19 plus10 calendar years ->2036-11-19; active hold still denies disposal. This is not a selected statutory deadline.

**Evidence/context:**[AUD-560](https://standards.auasb.gov.au/node/634); [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); D01-LOCAL-LAW.

### M35 — Capacity, budgets and staffing scenario variance

**Profile:**Use completed D02 M35-v1 capacity specification. **Original automation links:**Source workflow/rule support.

**Inputs:**Actual per-person calendar/absence; dated daily allocations; mutually exclusive scenarios; budgets; timesheet completeness.

**Algorithm/steps:**

1. Reuse D02 Capacity_Method_M35.md and independent fixtures without redefining their denominator
2. Available hours exclude actual working-calendar absences; allocation is period/scope-specific
3. Compare baseline/alternative scenarios separately and commit one current alternative atomically
4. Keep missing actuals provisional and preserve prior actual time/authorship on reassignment

**Human judgment:**Working calendar, feasible allocations, suitability and staffing decisions are actual firm judgments; no quality/utilization target is invented.

**Exceptions to test:**

- Zero availability
- Overlapping leave
- Unsubmitted actuals
- Two alternatives added together
- Stale scenario commit

**Independent example:**Available32 hours,allocated40 ->8-hour overbooking and125% allocation/availability; not an audit-quality score. Detailed approved-design examples remain in D02.

**Evidence/context:**D02-M35; [AUD-220R](https://www.irba.co.za/upload/IAASB-International-Standard-Auditing-220-Revised.pdf).

### M36 — Coverage, decision tables, review and authorization rules

**Profile:**Versioned decision/coverage/authority tables. **Original automation links:**AUTO-001 AUTO-007 AUTO-041 AUTO-052 AUTO-053 AUTO-054 AUTO-055 AUTO-056 AUTO-057 AUTO-058.

**Inputs:**Actual actor/appointment/grants; exact object state/version; applicability; source evidence; explicit true/false/unknown/N/A; prior actor history.

**Algorithm/steps:**

1. Evaluate curated decision tables under the selected policy/version
2. Preserve unknown and justified N/A; do not treat blank as false or favorable
3. Distinguish allowed draft actions, positive professional decisions, independent review and irreversible release/disposal guards
4. Retain decision inputs/reason/actor/version; changes invalidate affected reliance and direct routes enforce the same controls

**Human judgment:**Professional judgments remain attributable decisions. Configurable roles cannot waive a nonwaivable rule or required independent review.

**Exceptions to test:**

- Unknown applicability
- Self-review
- Expired grant
- Stale revision
- Exact retry versus changed payload
- Cross-engagement object

**Independent example:**Required current work8 items;7 reviewed and1 justified N/A ->7/7 applicable reviewed, with N/A shown; this is coverage, not quality or assurance.

**Evidence/context:**[ENG-AUTH](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html); [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); D02-SPECIALIST; DESIGN-DECISIONS.
