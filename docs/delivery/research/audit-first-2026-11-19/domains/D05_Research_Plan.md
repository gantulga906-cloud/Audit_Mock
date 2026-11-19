# D05 — Data intake, ledger mappings and accounting infrastructure: dedicated research plan

**Status:** PLANNED; research questions and execution instructions, not professional approval or completed implementation. **As of:** 19 November 2026. **Parent:** [audit-first execution index](../README.md). **Priority:** required audit scope or explicitly conditional child applicability.

A reconciled import can still be incomplete at origin; preserve that distinction in every automation.

## Research contract

- **Original remaining-work links:** RW04 RW05 RW12 RW18 RW20 RW32 RW40. Preserve child source IDs and earlier dispositions.
- **Lead roles to assign:** Data/accounting analyst + domain engineer. **Independent reviewer roles:** Independent accounting/audit method reviewer + QA.
- **Mandatory standards to investigate:** ISA 230, 500, 510, 520; applicable IFRS/IAS or IFRS for SMEs; IAS 8 and IAS 21; IAS 1/IFRS 18 as applicable. These are research candidates; final applicability requires edition, paragraph and adoption evidence.
- **Method work:** [M01](../Calculation_and_Method_Research_Plan.md#m01), [M02](../Calculation_and_Method_Research_Plan.md#m02), [M22](../Calculation_and_Method_Research_Plan.md#m22), [M30](../Calculation_and_Method_Research_Plan.md#m30).
- **Mandatory process:** [research protocol and gates](../Research_Protocol.md). Read full applicable standard requirements and related application material before approving a rule; official synopses are initial orientation.
- **Internal baseline:** applicable G01–G11 guide/checkpoint, original source registers and [consolidated RW register](../../../Audit_Mock_Consolidated_Remaining_Work_2026-11-18.md). Inspect actual current owning commands before calling a capability missing.

## Work packages

<a id="r-d05-01"></a>

### R-D05-01 — Research actual input families and completeness evidence

**Decision to resolve:** Which exports and control totals are necessary for audit reliance?

**Entry/dependencies:** Source baseline accessible; this task can begin without waiting for unrelated domain research. Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Inspect current GL/TB/FS/journal and subledger schemas, existing import profiles and all downstream AUTO inputs.
2. Specify source row identity, currency/unit/sign/date conventions, control totals, extract filters and period boundaries.
3. Distinguish import integrity from completeness of the original source extract; identify independent controls and source owner attestations.

**Required output:** Published schema/profile contracts, source-extract instructions and M01 bridge examples.

**Validation/contrary case:** Accepted + quarantined + excluded rows reconcile disjointly; self-generated totals alone cannot certify source completeness.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

<a id="r-d05-02"></a>

### R-D05-02 — Specify allocations and statement bridges

**Decision to resolve:** How can one source amount map to multiple statement/note destinations without duplication?

**Entry/dependencies:** R-D05-01 Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Read existing mapping/adjustment commands before extending; define allocation basis and versioned approvals.
2. Specify many-to-one, one-to-many and cross-statement/note representation, ensuring repeated presentation is not repeated financial effect.
3. Research adjustments, reversals, comparative restatement, unallocated residuals and sign normalization under the selected framework.

**Required output:** M02 schema/cardinality/ledger bridge contract and independent line-grain expected results.

**Validation/contrary case:** Split allocations preserve original amount; signed adjustments apply once; mapping edits reopen dependent results and preserve prior output.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

<a id="r-d05-03"></a>

### R-D05-03 — Research accounting method infrastructure

**Decision to resolve:** What must be common across methods without embedding a universal accounting engine?

**Entry/dependencies:** R-D01-01, R-D05-01 Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Inspect G11 current profiles and source examples; list calculation promises versus judgment/support-only obligations.
2. Define method version, policy/framework/period, typed parameters, source dependencies, precision, validation, reasoned unsupported results and review.
3. Compare bounded strategy/decision-table implementations; keep recognition, estimates and policy choices with authorized practitioners.

**Required output:** Approved method-pack contract and M01–M36 support-state register.

**Validation/contrary case:** Different methods cannot share an unlabelled formula; legacy runs retain original parameters/results when method version changes.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

<a id="r-d05-04"></a>

### R-D05-04 — Research multi-entity, currency and consolidation boundaries

**Decision to resolve:** What must be separated before amounts can be compared or aggregated?

**Entry/dependencies:** R-D05-02, R-D05-03 Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Specify entity, functional/presentation/transaction currency, rate source/date/direction, reporting period and scale.
2. Research which transformations belong to IAS 21, IFRS 10, adjustments or report presentation.
3. Design raw-to-normalized-to-consolidated line provenance and controlled reconciliation; block unsupported conversions.

**Required output:** M22/M30 data contracts and an entity/currency/period reconciliation fixture.

**Validation/contrary case:** MNT and USD amounts cannot be added without approved conversion; rate inversion, missing rate and intra-group mismatch are visible.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

<a id="r-d05-05"></a>

### R-D05-05 — Set representative data and operational targets

**Decision to resolve:** What real workloads must selected profiles support?

**Entry/dependencies:** R-D05-01 Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Obtain practitioner estimates or de-identified schema/volume characteristics; use synthetic data for trials.
2. Specify row counts, column widths, file size, concurrent operations, retry behavior, memory and acceptable latency with operating owner.
3. Research high-volume parsing and decimal handling only against selected runtime; keep external ERP adapters as contracts.

**Required output:** Measurable import benchmark protocol, proposed targets awaiting owner approval and failure/restart cases.

**Validation/contrary case:** Repeated import is idempotent; partial failure cannot publish half-approved populations; targets have evidence and an accountable owner.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

## Domain handoff and stop conditions

Deliver a source/standard paragraph crosswalk, AS-IS versus TO-BE delta, required/manual/specialist/HOLD disposition by subrequirement, approved input/action/result/review contract, adverse scenarios and unresolved decision records. The owner may size a ticket after its evidence and dependencies are known; no schedule or staffing commitment is inferred here.

Stop only the affected positive decision, calculation or release authorization when a mandatory source conflict, missing legal authority, unknown applicable edition, unsupported method or required independent review remains unresolved. Preserve drafts and unrelated approved work. Source-authorized manual judgment is supported; promised automatic calculations need an approved executable method or an explicit scope decision.
