# Materiality selection and source-form fidelity

11 November 2026. F2 first functional family and FG-02 / AUTO-046 reference implementation, following the post-redesign development plan. F2 across all 70 forms remains in progress.

## Implemented

The shared 1.3 workpaper can compare up to five named benchmark candidates with current/prior amounts, a chosen percentage, calculated candidate and rationale. One candidate supports the selected overall threshold. Calculated and auditor-overridden amounts remain distinct decisions with their own rationale. Performance and clearly trivial candidates calculate from the **selected overall amount**, including an overridden overall amount. A zero trivial threshold is retained as zero.

Specific thresholds can use the same distinction: a candidate percentage of selected overall, selected specific amount, related performance percentage and independently chosen performance amount. Existing directly entered specific amounts remain readable and usable. The new profile records prior approved overall materiality, planning/final stage, qualitative circumstances, reporting considerations and affected disclosures. No benchmark/rate is installed as a universal methodology default.

Amounts support two decimal places and percentages four decimal places. New-profile calculations round each selected monetary candidate to two decimals. Overall/performance amounts must be positive, performance below overall, and trivial between zero and the applicable performance amounts. These are the supported calculation contract. They do not turn source reference bands or the source's 5% wording into a universal rule.

Accepted source evidence, independent workpaper review, revised-decision rationale and versioned downstream inputs remain enforced. A change invalidates dependent sampling/evaluation approvals and report authorization while retaining earlier selections, sample tests, evaluations and signed work. The controls work on the existing persisted engagement model. There is no database schema migration for this addition; the optional decision version is stored with workpaper values.

## Source reconciliation for 1.3

The repaired Stage 1 worksheet `1.3А` supplies the decision structure. The original workbook remains read-only and its hash matches the previous source review.

| Source location | Owning product record |
|---|---|
| D17:I21 | Current/prior benchmark candidates, chosen rates, calculated candidates and rationale. Negative or zero comparative candidates can remain visible; a chosen effective threshold must satisfy the calculation contract. |
| E26 and F26:H26 | Prior approved overall amount and exact source/version reference, when available. |
| E27 and F27:H27 | Planning overall decision and rationale. A final revision preserves the earlier planning value in source answers and workpaper history. |
| E28 and F28:H28 | Final revised overall decision, rationale and revision reason. |
| B30 and F34:H36 | Opening-balance consequences, qualitative circumstances, reporting matters and affected disclosures. |
| B45 | Chosen performance threshold, supporting percentage and override rationale. The source reference factors remain guidance. |
| B47:D52 | Related class/account/disclosure threshold and performance decisions. |
| E58 and F58:G58 | Clearly trivial threshold and its purpose/rationale, including explicit zero. |
| B61 | Revision rationale and retained history. |

For the standard compatible 1.3 source fields, these answers are generated from their owning decision rather than separately retyped. Sending conflicting free text cannot replace the selected amount. The native renderer displays them as linked, saved decisions. Existing signed free-text answers remain in history. Published custom field types remain under their existing typed contract; this change does not silently convert them or republish a template.

## Five-workbook inventory

`form-source-inventory.json` captures source hashes, all 70 form worksheets plus one change-register sheet, formula coordinates/shared anchors, validation ranges, messages and resolved option lists. `scripts/inventory-source-forms.py` is a read-only standard-library OOXML reader. It does not execute arbitrary formulas or modify the supplied workbooks.

- All **272 formula cells** are row-number sequences, including **219 shared-formula followers**. The inventory resolves their simple shared anchors and classifies them as presentation order. They do not represent 272 missing audit calculations.
- All **1,820 validation definitions** are list rules. **1,048** explicitly identify responsibility assignment and **772** supply other categorical options. All referenced option lists resolve within their worksheets.
- Source responsibility categories remain source metadata; importing them does not grant application access or invent named staff identities.
- The inventory is complete as a structural record. Each form's applicability, clauses, repeated rows, field meaning, operative decisions, export and independent acceptance still need reconciliation. No form is marked fully accepted merely because it was inventoried.

## Verification

The suite includes a persisted new-profile regression with real accepted evidence and an approved population. It verifies candidate versus selected amounts, overall/performance overrides, a deliberate zero trivial threshold, calculated specific thresholds, exact native source answers, independent review, revision/reapproval, unchanged control reliance, stale sampling/evaluation, retained selections/history and restart. Invalid/missing rationale, unsupported version, duplicate candidate, malformed monetary/rate inputs, self-review and downgrade to a profile that would discard decisions are rejected.

The original connected A08 fixture remains unchanged and passing. Its legacy percentages and directly entered specific amounts retain their earlier behavior. Existing A11/A25/A26/A27/A28 and area/report/archive regressions remain part of the full source-linked suite. Connected-cycle coverage remains six; this batch deepens materiality behavior rather than claiming an unrelated new lifecycle.

`npm run verify:materiality-ui -- <fixture.json> <output>` checks actual preparation/save/submit and independent reviewer controls. Export a disposable checkpoint first by setting `AUDIT_MATERIALITY_FIXTURE_DIR` and running `node --test tests/pilot-materiality.test.mjs`. Engineering fixtures and browser results remain separate from independent source acceptance.

## Remaining sequence

Continue F2 with the representative acceptance, controls, assets, sampling and completion/review/report families, then reconcile all 70 individually using the inventory. Finish builder import-preview/mapping and incompatible-adoption behavior through its existing publication/version controls. FG-01 / AUTO-047 unbiased sampling and supported projection remain an explicit later minimum gap. Named identities, wider dependency/automation/E2E coverage and external adapters retain their original scope. No source-owner release acceptance is added by this engineering batch.
