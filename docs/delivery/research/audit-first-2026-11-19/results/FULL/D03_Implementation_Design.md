# Source forms, native outputs and dependencies

### D03 — Source forms, native outputs and dependencies

#### R-D03-01 — Resolve original-source versions and visible content

**Proposed implementation decision:** Use the available five repaired workbooks as the working comparison corpus; retain registered and working hashes independently. D01 workbook acceptance is settled. A differing hash alone does not prove missing audit logic.

**Original question:** Which exact workbook/guidebook edition is authoritative for each of the 70 forms?

**Prerequisites:** None beyond the pinned baseline. **Original work groups:** RW01 RW02 RW03 RW04 RW05 RW39. **Methods:** M01 M02 M36.

**How to implement:**

1. Read every catalogue sheet and source anchor without resaving originals
2. Classify text, figures, repeated sections, numbering expressions, operative formulas and dropdowns separately
3. Publish a per-form discrepancy list with exact source cells and a proposed mapping; distinguish an unavailable image from an empty requirement
4. Bind the selected working edition to each new template release; historical releases retain their original pins

**Data/record contract:** formId, workbookHash, sheet, cell/range, object/image anchor, sourceEdition, discrepancyClass, selectedMapping, reviewState

**Discriminating expected cases:**

- Same wording with changed formatting -> presentation difference, no invented missing rule
- A missing pictured instruction -> explicit source-review item with page/image anchor
- Earlier accepted engagement retains the earlier template after a new release

**Owning paths:** `scripts/pilot-workbook.mjs`, `scripts/pilot-methodology.mjs`, `docs/research/form-source-inventory.json`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); ENG-OOXML. **Original broader standard candidates:** ISA 230 and the standard governing each form; approved financial reporting framework; source workbook/guidebook contracts.

**Accountable capacities:** BA + form/source analyst; independent review:Practicing auditor familiar with exact source; export reviewer. Actual names remain unassigned; no signature is implied.

#### R-D03-02 — Define supported form families and native semantics

**Proposed implementation decision:** Keep constrained form families and extend the canonical semantic field contract. Tailored engagement copies must preserve source lineage and independently reviewed conclusions.

**Original question:** What must a supported form preserve beyond its appearance?

**Prerequisites:** R-D03-01. **Original work groups:** RW01 RW02 RW03 RW04 RW05 RW39. **Methods:** M01 M02 M36.

**How to implement:**

1. Assign each of 70 forms a family and list source questions, fixed clauses and repeated columns
2. Specify unknown, false, zero, N/A-with-reason, conditional requiredness and row identity per field
3. Add exceptional family extensions only where the source cannot be represented
4. Instantiate a versioned engagement copy, allow additions/removals with a reason, and retain the original master and prior reviewed answers

**Data/record contract:** fieldId, sourceCell, semanticType, unit, applicabilityRule, requiredAtAction, repeatRowId, evidenceUse, conclusion, reviewAnchor

**Discriminating expected cases:**

- Zero and No survive save/export as distinct values
- Delete an applicable mandatory procedure -> impact assessment required before submission
- Reorder repeated rows -> evidence and review remain attached to stable row IDs

**Owning paths:** `scripts/pilot-forms.mjs`, `src/data/source-registers.json`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-FORMS. **Original broader standard candidates:** ISA 230 and the standard governing each form; approved financial reporting framework; source workbook/guidebook contracts.

**Accountable capacities:** BA + form/source analyst; independent review:Practicing auditor familiar with exact source; export reviewer. Actual names remain unassigned; no signature is implied.

#### R-D03-03 — Research operative spreadsheet logic and export fidelity

**Proposed implementation decision:** Deliver native XLSX and DOCX outputs through explicit family adapters. Preserve required substantive content first; validate layout separately. Existing HTML export remains a useful reference renderer.

**Original question:** Which formulas and layouts carry actual required meaning?

**Prerequisites:** R-D03-02. **Original work groups:** RW01 RW02 RW03 RW04 RW05 RW39. **Methods:** M01 M02 M36.

**How to implement:**

1. Inventory each workbook formula and classify numbering versus audit arithmetic
2. Map each supported operative expression to a named M pack; never execute arbitrary source formula text
3. Define XLSX cells/tables/formulas/print areas and DOCX paragraphs/tables/bookmarks using template copies
4. Reopen outputs in real compatible readers and compare answers, clauses, signs, units, repeated rows, evidence and signatures against the canonical selected version

**Data/record contract:** exportId, format, templateHash, workVersion, fieldMappingVersion, formulaDisposition, layoutVariance, outputHash, readerObservation

**Discriminating expected cases:**

- A 200-row schedule expands without overwriting the conclusion or signatures
- An unsupported formula displays an unresolved disposition, not a cached success
- Export of an old reviewed version reproduces its answers even after current edits

**Owning paths:** `scripts/pilot-workpaper-export.mjs`, `scripts/pilot-workbook.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); ENG-OOXML. **Original broader standard candidates:** ISA 230 and the standard governing each form; approved financial reporting framework; source workbook/guidebook contracts.

**Accountable capacities:** BA + form/source analyst; independent review:Practicing auditor familiar with exact source; export reviewer. Actual names remain unassigned; no signature is implied.

#### R-D03-04 — Research all 20 confirmed dependency edges

**Proposed implementation decision:** Implement the 20 confirmed dependencies as typed, versioned reliance links. Only the specified dependent action is guarded; independent drafting remains available.

**Original question:** What actually moves between source and target forms?

**Prerequisites:** R-D03-02. **Original work groups:** RW01 RW02 RW03 RW04 RW05 RW39. **Methods:** M01 M02 M36.

**How to implement:**

1. Use all DEP-C01-C20 cards in this pack without renumbering
2. Store the actual selected upstream version, semantic payload and downstream use
3. On upstream change enqueue targeted impact assessment, preserving earlier approvals and unrelated work
4. Recompute derived values only under an approved method; human decision/reference links require an attributable reassessment

**Data/record contract:** dependencyId, upstreamObject/version, downstreamObject/version, payloadType, actionGuard, impactState, assessor, historicalBasis

**Discriminating expected cases:**

- Materiality revision stales the relying sample/evaluation but not unrelated evidence
- A proposed sample design cannot satisfy a selected-unit dependency
- Revoked archive grant denies future retrieval without erasing historical custody

**Owning paths:** `scripts/pilot-forms.mjs`, `scripts/pilot-workflow.mjs`, `scripts/pilot-later-facts.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-DEPENDENCIES. **Original broader standard candidates:** ISA 230 and the standard governing each form; approved financial reporting framework; source workbook/guidebook contracts.

**Accountable capacities:** BA + form/source analyst; independent review:Practicing auditor familiar with exact source; export reviewer. Actual names remain unassigned; no signature is implied.

#### R-D03-05 — Verify practical form use with auditors

**Proposed implementation decision:** Use a task-based acceptance protocol for every family and every exceptional form. A form count or structural roundtrip is insufficient acceptance.

**Original question:** Can practitioners complete and review the real work through supported families?

**Prerequisites:** R-D03-03 R-D03-04. **Original work groups:** RW01 RW02 RW03 RW04 RW05 RW39. **Methods:** M01 M02 M36.

**How to implement:**

1. Prepare one normal and one adverse example per family and each exceptional extension
2. Ask the auditor to perform the actual source procedure, correct it, review it and reopen its native export
3. Record exact omission, confusing prompt or layout variance with the source cell and work version
4. Fix engineering defects; route actual method disagreements to the named methodological decision, then rerun affected cases

**Data/record contract:** observationId, formId, sourceHash, build, actor, task, expectedOutcome, observedOutcome, issue, disposition

**Discriminating expected cases:**

- Auditor can find and answer a conditional source question without coaching
- Returned work retains the initial answer and independent review note
- No participant -> protocol prepared, observed acceptance remains unperformed

**Owning paths:** `src/components/enterprise-workspace.tsx`, `scripts/pilot-workpaper-export.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ENG-WCAG](https://www.w3.org/TR/WCAG22/). **Original broader standard candidates:** ISA 230 and the standard governing each form; approved financial reporting framework; source workbook/guidebook contracts.

**Accountable capacities:** BA + form/source analyst; independent review:Practicing auditor familiar with exact source; export reviewer. Actual names remain unassigned; no signature is implied.
