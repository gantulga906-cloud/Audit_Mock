# All fieldwork areas and automation minimums

### D08 — All fieldwork areas and automation minimums

#### R-D08-01 — Reconcile all 22 source fieldwork variants

**Proposed implementation decision:** Use the 22 original variants as coverage units, each with the exact source programme, assertions, records and conditional work. A generic area card is only a container.

**Original question:** What exact procedures, assertions and exceptions belong to each original variant?

**Prerequisites:** R-D03-01 R-D05-03. **Original work groups:** RW17 RW18 RW19 RW20 RW21 RW34 RW36 RW37. **Methods:** M09 M10 M11 M12 M13 M14 M15 M16 M17 M18 M19 M20 M21 M22 M23 M24 M25 M26 M27 M28 M29 M30 M31 M32 M33 M34 M36.

**How to implement:**

1. Read all variant rows, source locators and current G10 area-work contracts
2. For each source procedure specify test purpose, evidence, actual work, judgment, exception and review
3. Attach the relevant M packs and preserve manual/specialist procedures with actual work records
4. Trace each output to finding, area conclusion, completion and report impact

**Data/record contract:** variantId, sourceProcedureKey, assertion, inputUse, actualWork, methodRun, judgment, matter, reviewer, downstreamUse

**Discriminating expected cases:**

- All22 cards present but one programme step missing -> coverage gap remains
- Manual rights inspection supported with evidence is valid actual work
- Generic narrative cannot claim automated costing

**Owning paths:** `scripts/pilot-area-cards.mjs`, `scripts/pilot-execution.mjs`, `src/data/source-registers.json`.

**Evidence/context:** [AUD-330](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-500](https://standards.auasb.gov.au/node/1012); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-AREAS. **Original broader standard candidates:** Applicable ISA 240, 330, 500, 501, 505, 510, 520, 530, 540, 550, 560, 570, 600, 620; area-specific IFRS/IAS or selected SME sections.

**Accountable capacities:** Area BA + accounting/audit specialist; independent review:Independent practicing auditor for area; separate numerical checker. Actual names remain unassigned; no signature is implied.

#### R-D08-02 — Reconcile each of the 58 automation minima

**Proposed implementation decision:** Reconcile each of the 58 original minimums against its actual owning workflow; preserve all future extensions separately.

**Original question:** Which exact minimum is implemented, missing or only partially evidenced?

**Prerequisites:** R-D05-03. **Original work groups:** RW17 RW18 RW19 RW20 RW21 RW34 RW36 RW37. **Methods:** M09 M10 M11 M12 M13 M14 M15 M16 M17 M18 M19 M20 M21 M22 M23 M24 M25 M26 M27 M28 M29 M30 M31 M32 M33 M34 M36.

**How to implement:**

1. Use the exact original minimum, inputs, human responsibility and boundary
2. Inspect current G11 locator and actual code/profile for the selected minimum
3. Implement the specific missing logic or state/permission/export delta specified in the automation cards
4. Execute its normal, adverse, missing/unsupported, denied and source-change cases and retain actual results

**Data/record contract:** automationId, minimumHash, owningCommand, supportedProfile, methodId, exactSourceIds, expectedCase, observedCase, limitation

**Discriminating expected cases:**

- Matching menu label without computation does not fulfill a minimum
- Existing bounded computation is retained and tested rather than declared absent
- Optional future OCR suggestion is not promoted into mandatory v1 scope

**Owning paths:** `scripts/pilot-automation-checks.mjs`, `scripts/pilot-data-methods.mjs`, `scripts/pilot-area-cards.mjs`.

**Evidence/context:** [AUD-500](https://standards.auasb.gov.au/node/1012); DESIGN-AUTOMATIONS. **Original broader standard candidates:** Applicable ISA 240, 330, 500, 501, 505, 510, 520, 530, 540, 550, 560, 570, 600, 620; area-specific IFRS/IAS or selected SME sections.

**Accountable capacities:** Area BA + accounting/audit specialist; independent review:Independent practicing auditor for area; separate numerical checker. Actual names remain unassigned; no signature is implied.

#### R-D08-03 — Research accounting and audit methods per area

**Proposed implementation decision:** Adopt bounded method profiles for required native arithmetic and a complete evidenced human route for recognition, classification and complex transactions. Unsupported automation remains a visible requirement gap until implemented or explicitly dispositioned.

**Original question:** Which recognition, measurement, recalculation and audit procedures must be supported?

**Prerequisites:** R-D08-01 R-D08-02 R-D01-01. **Original work groups:** RW17 RW18 RW19 RW20 RW21 RW34 RW36 RW37. **Methods:** M09 M10 M11 M12 M13 M14 M15 M16 M17 M18 M19 M20 M21 M22 M23 M24 M25 M26 M27 M28 M29 M30 M31 M32 M33 M34 M36.

**How to implement:**

1. Use all M09-M34 cards and applicable framework profile
2. Match each source procedure to a deterministic subcalculation and a separately attributable professional decision
3. Define additional method profiles only for demonstrated source needs; attach policy/assumptions and independent examples
4. For complex cases capture external schedule, actual auditor reperformance/evaluation and limitation without claiming native computation

**Data/record contract:** framework, method/version, transactionClass, assumptions, calculation, professionalDecision, specialistSchedule, review, unsupportedReason

**Discriminating expected cases:**

- Straight-line allocation cannot establish IFRS15 performance recognition
- Approved ECL rates calculate allowance but do not validate model adequacy
- IFRS for SMEs case cannot silently call full-IFRS lease/ECL rules

**Owning paths:** `scripts/pilot-area-checks.mjs`, `scripts/pilot-area-finance.mjs`, `scripts/pilot-area-statutory.mjs`.

**Evidence/context:** [ACC-IFRS9](https://standards.aasb.gov.au/aasb-9-feb-2025-0); [ACC-IFRS15](https://standards.aasb.gov.au/sites/default/files/2026-11/AASB15_12-14_COMPdec22_07-26.pdf); [ACC-IFRS16](https://www.endorsement-board.uk/documents/2148/IFRS_16_-_Leases.pdf); [ACC-IAS2](https://www.endorsement-board.uk/documents/2184/IAS_2_-_Inventories.pdf); [ACC-IAS16](https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2022/issued/part-a/ias-16-property-plant-and-equipment.pdf?bypass=on); [ACC-IAS36](https://standards.aasb.gov.au/aasb-136-jan-2026). **Original broader standard candidates:** Applicable ISA 240, 330, 500, 501, 505, 510, 520, 530, 540, 550, 560, 570, 600, 620; area-specific IFRS/IAS or selected SME sections.

**Accountable capacities:** Area BA + accounting/audit specialist; independent review:Independent practicing auditor for area; separate numerical checker. Actual names remain unassigned; no signature is implied.

#### R-D08-04 — Design complete vertical fieldwork slices

**Proposed implementation decision:** Build a full revenue/cut-off/receivables slice first as a verification pattern; then implement every remaining variant in the sequenced batches, including its completion/report consequence.

**Original question:** What is the smallest complete source-supported result for each area?

**Prerequisites:** R-D08-03 R-D07-05. **Original work groups:** RW17 RW18 RW19 RW20 RW21 RW34 RW36 RW37. **Methods:** M09 M10 M11 M12 M13 M14 M15 M16 M17 M18 M19 M20 M21 M22 M23 M24 M25 M26 M27 M28 M29 M30 M31 M32 M33 M34 M36.

**How to implement:**

1. Start from accepted client, actual team, current plan/materiality and reconciled source data
2. Execute source procedures, native calculations, manual judgments, exceptions and independent review
3. Create or link canonical findings, verify corrections and complete affected final assessments
4. Rehearse an unmodified path and a material/unresolved path through exact report package and archive

**Data/record contract:** sliceId, variantIds, procedureIds, methodRuns, findings, finalAssessment, opinionDecision, issuedPackage, archiveManifest

**Discriminating expected cases:**

- Revenue before delivery -> cut-off matter reaches reviewed finding
- Same issue identified in confirmation and sample links one canonical error
- Unresolved material issue remains visible at report decision

**Owning paths:** `scripts/pilot-execution.mjs`, `scripts/pilot-completion.mjs`, `scripts/pilot-reporting.mjs`.

**Evidence/context:** DESIGN-SLICES; [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-700](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** Applicable ISA 240, 330, 500, 501, 505, 510, 520, 530, 540, 550, 560, 570, 600, 620; area-specific IFRS/IAS or selected SME sections.

**Accountable capacities:** Area BA + accounting/audit specialist; independent review:Independent practicing auditor for area; separate numerical checker. Actual names remain unassigned; no signature is implied.

#### R-D08-05 — Plan independent fieldwork acceptance

**Proposed implementation decision:** Use one evidence ledger per original variant/minimum with independently expected outcomes and actual observation. Completeness is item-level, not an average score.

**Original question:** What evidence permits a source reviewer to accept an area and its automations?

**Prerequisites:** R-D08-04. **Original work groups:** RW17 RW18 RW19 RW20 RW21 RW34 RW36 RW37. **Methods:** M09 M10 M11 M12 M13 M14 M15 M16 M17 M18 M19 M20 M21 M22 M23 M24 M25 M26 M27 M28 M29 M30 M31 M32 M33 M34 M36.

**How to implement:**

1. Run the five scenario classes for every original variant and the minimum-specific cases
2. Include native export, denied access, changed-source impact, restart and actual downstream use
3. Distinguish engineering success, source-semantic acceptance and professional method approval
4. Record exact build, source/method versions, actual reviewer and remaining limitations; only attributable acceptance changes accepted status

**Data/record contract:** originalId, scenarioId, expected, observed, build, source/methodHash, actor, reviewer, evidencePath, acceptanceClass

**Discriminating expected cases:**

- One failed required branch prevents that item acceptance even when most cases pass
- Unassigned reviewer is pending acceptance, not signed
- Reused engineering fixture is not independent professional acceptance

**Owning paths:** `scripts/pilot-source-evidence.mjs`, `scripts/pilot-release.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-ACCEPTANCE. **Original broader standard candidates:** Applicable ISA 240, 330, 500, 501, 505, 510, 520, 530, 540, 550, 560, 570, 600, 620; area-specific IFRS/IAS or selected SME sections.

**Accountable capacities:** Area BA + accounting/audit specialist; independent review:Independent practicing auditor for area; separate numerical checker. Actual names remain unassigned; no signature is implied.
