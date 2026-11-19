# D13 — UI, ERD, operational validation and release: dedicated research plan

**Status:** PLANNED; research questions and execution instructions, not professional approval or completed implementation. **As of:** 19 November 2026. **Parent:** [audit-first execution index](../README.md). **Priority:** release-enabling, alongside required audit slices.

Preserve current product/ERD foundation; research only demonstrated deltas and measurable release needs.

## Research contract

- **Original remaining-work links:** RW31 RW32 RW33 RW34 RW35 RW36 RW39 RW40. Preserve child source IDs and earlier dispositions.
- **Lead roles to assign:** BA + QA/architect/operating owner by task. **Independent reviewer roles:** Independent auditor/source reviewer and accountable release/operations owners.
- **Mandatory standards to investigate:** ISA 230 and applicable audit/source acceptance requirements; selected WCAG 2.2 criteria; OWASP authorization; current runtime/vendor documentation; operating policy. These are research candidates; final applicability requires edition, paragraph and adoption evidence.
- **Method work:** [M01](../Calculation_and_Method_Research_Plan.md#m01), [M02](../Calculation_and_Method_Research_Plan.md#m02), [M35](../Calculation_and_Method_Research_Plan.md#m35), [M36](../Calculation_and_Method_Research_Plan.md#m36).
- **Mandatory process:** [research protocol and gates](../Research_Protocol.md). Read full applicable standard requirements and related application material before approving a rule; official synopses are initial orientation.
- **Internal baseline:** applicable G01–G11 guide/checkpoint, original source registers and [consolidated RW register](../../../Audit_Mock_Consolidated_Remaining_Work_2026-11-18.md). Inspect actual current owning commands before calling a capability missing.

## Work packages

<a id="r-d13-01"></a>

### R-D13-01 — Research task-based auditor usability

**Decision to resolve:** Which current work surfaces fail real source execution?

**Entry/dependencies:** R-D03-05 Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Walk existing enterprise workspace and audit desks using representative source forms, roles and evidence.
2. Observe long/conditional tables, review handoffs, keyboard/focus/readability, error recovery and exports.
3. Compare mature audit product workflow patterns only as secondary design evidence; use current UI before proposing redesign.

**Required output:** Role/task observation protocol, UI gap tickets and selected accessibility criteria.

**Validation/contrary case:** Practitioners can locate source, perform work, review and correct it; decorative screenshots do not count as task success.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

<a id="r-d13-02"></a>

### R-D13-02 — Research conceptual ERD to runtime contracts

**Decision to resolve:** Which required cardinalities or invariants are actually missing?

**Entry/dependencies:** R-D05-02, R-D02-01, R-D10-01 Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Map current entities, commands and ownership to source IDs, method runs, split allocations and multiple assignees.
2. Specify uniqueness, foreign-key/equivalent integrity, entity/period/currency grain, immutability and concurrent revisions.
3. Model minimum necessary changes, migrations and backward compatibility; preserve existing history.

**Required output:** ERD/runtime/command crosswalk and scoped schema-change proposals.

**Validation/contrary case:** No wholesale rewrite without demonstrated gap; assignments, projection linkage and statement representations cannot duplicate underlying financial effect.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

<a id="r-d13-03"></a>

### R-D13-03 — Research measurable nonfunctional requirements

**Decision to resolve:** What must the selected deployment handle and recover?

**Entry/dependencies:** R-D05-05, R-D12-04 Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Agree workload, concurrency, latency, import sizes, recovery point/time, availability, audit-log and data residency requirements with operating owner.
2. Review actual authentication/session/password/MFA/TLS/backup/monitoring capabilities under selected deployment, not hypothetical enterprise tooling.
3. Create representative synthetic workloads and failure/restart/restore cases with measurable criteria.

**Required output:** Approved operating profile and benchmark/security/recovery protocol.

**Validation/contrary case:** Unmeasured targets remain proposed; local named accounts are not automatically production identity acceptance.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

<a id="r-d13-04"></a>

### R-D13-04 — Research source coverage and independent acceptance

**Decision to resolve:** How are all original obligations dispositioned without gaming counts?

**Entry/dependencies:** R-D08-05, R-D10-04, R-D11-03 Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Reconcile 128 original tasks, 2,247 obligations, 70 forms, 22 variants, 58 minima, 20 DEP-C, 51 lifecycles and 1,012 BPMN entries against exact baseline registers.
2. Separate mandatory applicable A/B work, justified conditional exclusions, HOLD external work and 58 pending future extensions.
3. Specify original-ID to research/method/design/test/reviewer evidence and independent acceptance on a pinned release.

**Required output:** Source coverage closure protocol and traceability acceptance manifest.

**Validation/contrary case:** Every source item retains identity/status history; coverage counts and passing tests never become a percent complete or professional certification.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

<a id="r-d13-05"></a>

### R-D13-05 — Research operational handoff and release blockers

**Decision to resolve:** What concrete evidence permits release of the selected audit product scope?

**Entry/dependencies:** R-D13-01, R-D13-02, R-D13-03, R-D13-04 Dependencies gate affected conclusions/tickets, not all independent reading or drafting.

1. Combine methodology, source, engineering, usability and operational gates; distinguish dependency-specific blockers from unrelated drafting.
2. Name accountable roles for production and deferred providers; specify supported manual routes, known limits and support runbook.
3. Define exact release commit/source/method versions, defect acceptance, rollback and postrelease change review.
4. Reconcile every applicable research/method/area/AUTO/dependency row to a completed decision and required later acceptance; conditional/HOLD rows need an attributable scope/owner disposition.

**Required output:** Release evidence index, blocker register and integration-owner handoff contracts.

**Validation/contrary case:** releaseReady changes only with actual required independent approvals and operating evidence; documenting a plan changes no requirement closure.

**Close research only when:** full-source/standard evidence, conflicting interpretation, supported boundary, actual owner decision and implementation-ready scenarios are recorded. Use [findings template](../templates/Research_Findings_Template.md). Engineering/practitioner acceptance remains a later separate gate.

## Domain handoff and stop conditions

Deliver a source/standard paragraph crosswalk, AS-IS versus TO-BE delta, required/manual/specialist/HOLD disposition by subrequirement, approved input/action/result/review contract, adverse scenarios and unresolved decision records. The owner may size a ticket after its evidence and dependencies are known; no schedule or staffing commitment is inferred here.

Stop only the affected positive decision, calculation or release authorization when a mandatory source conflict, missing legal authority, unknown applicable edition, unsupported method or required independent review remains unresolved. Preserve drafts and unrelated approved work. Source-authorized manual judgment is supported; promised automatic calculations need an approved executable method or an explicit scope decision.
