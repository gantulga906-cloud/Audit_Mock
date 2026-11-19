# Data, mappings and method infrastructure

### D05 — Data, mappings and method infrastructure

#### R-D05-01 — Research actual input families and completeness evidence

**Proposed implementation decision:** Extend the existing controlled CSV import to a bounded XLSX adapter; retain raw originals, typed rows, certified totals and all excluded/quarantined rows.

**Original question:** Which exports and control totals are necessary for audit reliance?

**Prerequisites:** None beyond the pinned baseline. **Original work groups:** RW04 RW05 RW12 RW18 RW20 RW32 RW40. **Methods:** M01 M02 M22 M30.

**How to implement:**

1. Define source families and stable grains before mapping columns
2. Preview explicit dates, decimal separators, debit/credit sign, units and currency; never infer ambiguous inputs
3. Reconcile original count and per-currency totals to disjoint accepted/quarantined/excluded cohorts and independent control evidence
4. Approve exact usable populations; changes create successor revisions and targeted stale uses

**Data/record contract:** sourceId/hash, sourceRow, sourceBusinessKey, family, entity, period, currency, scale, rawValue, typedValue, disposition, controlEvidence

**Discriminating expected cases:**

- Balanced subset with omitted row -> count bridge fails
- Blank amount remains unknown while genuine zero remains usable
- Duplicate payment candidate retained and investigated rather than silently deleted

**Owning paths:** `scripts/pilot-intake.mjs`, `scripts/pilot-population.mjs`, `scripts/pilot-data-methods.mjs`.

**Evidence/context:** [AUD-500](https://standards.auasb.gov.au/node/1012); ENG-OOXML. **Original broader standard candidates:** ISA 230, 500, 510, 520; applicable IFRS/IAS or IFRS for SMEs; IAS 8 and IAS 21; IAS 1/IFRS 18 as applicable.

**Accountable capacities:** Data/accounting analyst + domain engineer; independent review:Independent accounting/audit method reviewer + QA. Actual names remain unassigned; no signature is implied.

#### R-D05-02 — Specify allocations and statement bridges

**Proposed implementation decision:** Add split allocation at a declared source grain; distinguish additive primary destinations from repeated presentation references and note disclosures.

**Original question:** How can one source amount map to multiple statement/note destinations without duplication?

**Prerequisites:** R-D05-01. **Original work groups:** RW04 RW05 RW12 RW18 RW20 RW32 RW40. **Methods:** M01 M02 M22 M30.

**How to implement:**

1. Map source balances to one or more primary destinations with exact coefficients or amounts
2. Require allocated primary amounts to reconcile to each source amount; keep residuals explicit
3. Model adjustments, reversals and comparative restatements as independently approved signed journals
4. Generate TB-to-statements-to-notes bridges without counting note references as additional financial effects

**Data/record contract:** allocationSet/version, sourceRow, primaryDestination, amount/coefficient, presentationReference, adjustmentId, residual, signConvention

**Discriminating expected cases:**

- 100 CU split 60/40 plus a note showing 100 -> primary total 100 CU
- Two 60 CU allocations -> residual -20 CU and approval blocked
- Same adjustment referenced twice posts once by immutable journal identity

**Owning paths:** `scripts/pilot-data-methods.mjs`, `scripts/pilot-completion.mjs`.

**Evidence/context:** [AUD-500](https://standards.auasb.gov.au/node/1012); [ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0); DESIGN-ALLOCATION. **Original broader standard candidates:** ISA 230, 500, 510, 520; applicable IFRS/IAS or IFRS for SMEs; IAS 8 and IAS 21; IAS 1/IFRS 18 as applicable.

**Accountable capacities:** Data/accounting analyst + domain engineer; independent review:Independent accounting/audit method reviewer + QA. Actual names remain unassigned; no signature is implied.

#### R-D05-03 — Research accounting method infrastructure

**Proposed implementation decision:** Build a small versioned method registry around current owning calculations. No arbitrary scripting engine or universal accounting engine is required.

**Original question:** What must be common across methods without embedding a universal accounting engine?

**Prerequisites:** R-D01-01 R-D05-01. **Original work groups:** RW04 RW05 RW12 RW18 RW20 RW32 RW40. **Methods:** M01 M02 M22 M30.

**How to implement:**

1. Create M01-M36 contracts with allowed input schema, scope and required policy facts
2. Bind each run to exact source hashes, entity/period/currency and approved parameter versions
3. Separate deterministic arithmetic from recognition/classification/rate/life judgments
4. Persist outputs, row exceptions, unsupported reasons, independent expected cases and current review; migrations preserve old methods

**Data/record contract:** methodId/version, frameworkProfile, inputSchemaVersion, parameters, authority, algorithmVersion, rounding, inputHashes, outputs, exceptions, reviewer

**Discriminating expected cases:**

- Same method/input/policy -> exact retry retains output identity
- Changed discount rate -> new run and affected review
- Unsupported modification returns a defined manual-work route, never a standard-compliant label

**Owning paths:** `scripts/pilot-data-methods.mjs`, `scripts/pilot-automation-checks.mjs`, `scripts/pilot-area-checks.mjs`.

**Evidence/context:** [AUD-500](https://standards.auasb.gov.au/node/1012); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-METHODS. **Original broader standard candidates:** ISA 230, 500, 510, 520; applicable IFRS/IAS or IFRS for SMEs; IAS 8 and IAS 21; IAS 1/IFRS 18 as applicable.

**Accountable capacities:** Data/accounting analyst + domain engineer; independent review:Independent accounting/audit method reviewer + QA. Actual names remain unassigned; no signature is implied.

#### R-D05-04 — Research multi-entity, currency and consolidation boundaries

**Proposed implementation decision:** Keep legal entity, consolidation scope, transaction/functional/presentation currencies and reporting period explicit before any aggregation.

**Original question:** What must be separated before amounts can be compared or aggregated?

**Prerequisites:** R-D05-02 R-D05-03. **Original work groups:** RW04 RW05 RW12 RW18 RW20 RW32 RW40. **Methods:** M01 M02 M22 M30.

**How to implement:**

1. Pin control/scope conclusions and component period/policy alignment
2. Translate or remeasure only through M22 with a declared rate source/date/convention
3. Use M30 for separately approved eliminations and unmatched reciprocal balances
4. Reconcile pre-elimination, adjustment, elimination and final statements without deleting components or creating plugs

**Data/record contract:** entityId, groupId, scopeDecision, periodAlignment, currencyRole, rateTable, translationRun, eliminationJournal, unmatchedReciprocal

**Discriminating expected cases:**

- 100 USD and 100 MNT cannot sum as 200 CU
- Reciprocal 100/95 CU yields 5 CU unresolved difference
- Sub acquired during year -> relevant results date boundary is explicit

**Owning paths:** `scripts/pilot-area-finance.mjs`, `scripts/pilot-automation-checks.mjs`.

**Evidence/context:** [ACC-IFRS10](https://www.endorsement-board.uk/documents/2158/IFRS_10_-_Consolidated_Financial_Statements.pdf); [ACC-IAS21](https://www.endorsement-board.uk/documents/2167/IAS_21_-_The_Effects_of_Changes_in_Foreign_Exchange_Rates.pdf); [AUD-600](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 230, 500, 510, 520; applicable IFRS/IAS or IFRS for SMEs; IAS 8 and IAS 21; IAS 1/IFRS 18 as applicable.

**Accountable capacities:** Data/accounting analyst + domain engineer; independent review:Independent accounting/audit method reviewer + QA. Actual names remain unassigned; no signature is implied.

#### R-D05-05 — Set representative data and operational targets

**Proposed implementation decision:** Use current bounded limits as the safe prototype profile; establish larger operational limits from a measured workload rather than invented production capacity.

**Original question:** What real workloads must selected profiles support?

**Prerequisites:** R-D05-01. **Original work groups:** RW04 RW05 RW12 RW18 RW20 RW32 RW40. **Methods:** M01 M02 M22 M30.

**How to implement:**

1. Record current file/row/relationship caps and explicit rejection behavior
2. Construct small, normal and boundary synthetic datasets including wide schedules and many evidence links
3. Measure import, validation, review, concurrent edit and export separately on declared hardware
4. Propose a larger operating profile only with measured resource use and an accountable owner; keep staging/rollback/recovery tests separate

**Data/record contract:** workloadProfile, rows, columns, fileBytes, users, read/writeMix, hardware, latencyDistribution, memory, failureOutcome

**Discriminating expected cases:**

- 3001 rows under the existing 3000-row cap -> explicit unsupported limit
- Interrupted import leaves no approved partial population
- Concurrent reviewers cannot approve different stale revisions

**Owning paths:** `scripts/pilot-data-methods.mjs`, `scripts/pilot-operations.mjs`, `scripts/pilot-operations-rehearsal.mjs`.

**Evidence/context:** ENG-NFR; [ENG-SQLITE](https://www.sqlite.org/backup.html). **Original broader standard candidates:** ISA 230, 500, 510, 520; applicable IFRS/IAS or IFRS for SMEs; IAS 8 and IAS 21; IAS 1/IFRS 18 as applicable.

**Accountable capacities:** Data/accounting analyst + domain engineer; independent review:Independent accounting/audit method reviewer + QA. Actual names remain unassigned; no signature is implied.
