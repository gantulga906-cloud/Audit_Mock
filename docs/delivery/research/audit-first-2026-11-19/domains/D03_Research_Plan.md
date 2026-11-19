# D03 — Form fidelity, Excel, exports and cross-form dependencies: dedicated research plan

**Status:** PLANNED; research questions and execution instructions, not professional approval or completed implementation. **As of:** 19 November 2026. **Parent:** [audit-first execution index](../README.md). **Priority:** required audit scope or explicitly conditional child applicability.

Source fidelity is requirements traceability and contract testing, not a universal spreadsheet emulator.

## Research contract

- **Original remaining-work links:** RW01 RW02 RW03 RW04 RW05 RW39. Preserve child source IDs and earlier dispositions.
- **Lead roles to assign:** BA + form/source analyst. **Independent reviewer roles:** Practicing auditor familiar with exact source; export reviewer.
- **Mandatory standards to investigate:** ISA 230 and the standard governing each form; approved financial reporting framework; source workbook/guidebook contracts. These are research candidates; final applicability requires edition, paragraph and adoption evidence.
- **Method work:** [M01](../Calculation_and_Method_Research_Plan.md#m01), [M02](../Calculation_and_Method_Research_Plan.md#m02), [M36](../Calculation_and_Method_Research_Plan.md#m36).
- **Mandatory process:** [research protocol and gates](../Research_Protocol.md). Read full applicable standard requirements and related application material before approving a rule; official synopses are initial orientation.
- **Internal baseline:** applicable G01–G11 guide/checkpoint, original source registers and [consolidated RW register](../../../Audit_Mock_Consolidated_Remaining_Work_2026-11-18.md). Inspect actual current owning commands before calling a capability missing.

## Work packages

<a id="r-d03-01"></a>

### R-D03-01 — Resolve original-source versions and visible content

**Decision to resolve:** Which exact workbook/guidebook edition is authoritative for each of the 70 forms?

**Entry/dependencies:** Source baseline accessible; this task can begin without waiting for unrelated domain research. Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Read source edition/conflict registers and the G08 comparison; retain original hashes and distinguish source numbers from formulas.
2. Compare current and registered Stage 1–3 visible content, images, formula cells and validation definitions; Stage 4–5 still require semantic review.
3. Investigate Stage 2 pictured/book content using page/image anchors and human reading; record unavailable earlier bytes explicitly.

**Required output:** Per-form authoritative edition register and discrepancy dispositions, including unavailable-source escalation.

**Validation/contrary case:** 987 versus 1,820 validation definitions remains a version observation, never a count of missing audit rules; 272 presentation-numbering formulas are classified by purpose.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

<a id="r-d03-02"></a>

### R-D03-02 — Define supported form families and native semantics

**Decision to resolve:** What must a supported form preserve beyond its appearance?

**Entry/dependencies:** R-D03-01 Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Classify every form into questionnaire, narrative, checklist, reconciliation, repeated schedule, analytical, request, approval or report/archive families.
2. For each source cell/question record meaning, type, unit, conditional applicability, permitted blanks, repeats, evidence, actor and conclusion.
3. Trace semantic field to UI, persisted record, calculation, review and export; keep source coordinates separate from display numbering.

**Required output:** 70-form semantic crosswalk, family contracts and explicit exceptional extensions.

**Validation/contrary case:** Each family has one fully reviewed example before replication; copied labels or roundtrip success cannot establish semantic completeness.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

<a id="r-d03-03"></a>

### R-D03-03 — Research operative spreadsheet logic and export fidelity

**Decision to resolve:** Which formulas and layouts carry actual required meaning?

**Entry/dependencies:** R-D03-02 Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Inventory formulas, validations, named ranges, merged blocks, hidden rows, print areas and embedded figures; identify operative versus cosmetic behavior.
2. Inspect source formula assumptions and compare independently with applicable standards and method cards; quarantine macros/external links.
3. Specify which outputs need XLSX, DOCX or layout parity, which allow controlled variance, and who accepts it.

**Required output:** Formula disposition register, output/print contracts and independent expected workbook examples.

**Validation/contrary case:** Blank, zero, negative, expanded rows, formula error and unsupported feature remain distinguishable; required native output reopens correctly.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

<a id="r-d03-04"></a>

### R-D03-04 — Research all 20 confirmed dependency edges

**Decision to resolve:** What actually moves between source and target forms?

**Entry/dependencies:** R-D03-02 Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Read every DEP-C row individually; classify value/reference/evidence/decision/approval dependency.
2. Specify source and target versions, timing, one-to-many behavior, applicability, manual confirmation and stale-result rules.
3. Test change impact and prior-period preservation; do not make every source reference a hard block on saving a draft.

**Required output:** 20 individually dispositioned dependency cards and source-to-target examples.

**Validation/contrary case:** Change one depended-on fact and reopen only affected work; unrelated drafts remain usable; old accepted records are preserved.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

<a id="r-d03-05"></a>

### R-D03-05 — Verify practical form use with auditors

**Decision to resolve:** Can practitioners complete and review the real work through supported families?

**Entry/dependencies:** R-D03-03, R-D03-04 Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Walk actual form steps with an auditor against visible source; include long schedules and conditional branches.
2. Record omissions, ambiguous prompts, output needs, evidence anchors and role handoffs as attributable observations.
3. Separate usability defects from methodological conflicts and accepted format variances.

**Required output:** Per-family observation notes, remediation tickets and independent semantic acceptance rubric.

**Validation/contrary case:** Acceptance identifies exact source, export, UI/build and reviewer; no blanket sign-off from a template count.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

## Domain handoff and stop conditions

Deliver a source/standard paragraph crosswalk, AS-IS versus TO-BE delta, required/manual/specialist/HOLD disposition by subrequirement, approved input/action/result/review contract, adverse scenarios and unresolved decision records. The owner may size a ticket after its evidence and dependencies are known; no schedule or staffing commitment is inferred here.

Stop only the affected positive decision, calculation or release authorization when a mandatory source conflict, missing legal authority, unknown applicable edition, unsupported method or required independent review remains unresolved. Preserve drafts and unrelated approved work. Source-authorized manual judgment is supported; promised automatic calculations need an approved executable method or an explicit scope decision.
