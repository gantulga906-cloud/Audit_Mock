# UI, ERD, operating tests and release

### D13 — UI, ERD, operating tests and release

#### R-D13-01 — Research task-based auditor usability

**Proposed implementation decision:** Retain the existing workspace and improve only demonstrated task barriers. Verify complete role-specific tasks and selected accessibility criteria.

**Original question:** Which current work surfaces fail real source execution?

**Prerequisites:** R-D03-05. **Original work groups:** RW31 RW32 RW33 RW34 RW35 RW36 RW39 RW40. **Methods:** M01 M02 M35 M36.

**How to implement:**

1. Use source tasks for preparer, senior, reviewer, partner, specialist and custodian
2. Exercise long schedules, conditional prompts, queue handoffs, errors and native outputs
3. Check keyboard operation, focus visibility, labels, error association, status messages and zoom/reflow
4. Fix concrete blockers and record expected/observed completion without inventing a WCAG certification

**Data/record contract:** role, task, sourceForm, screen, keyboardPath, taskOutcome, issue, criterion, build, observation

**Discriminating expected cases:**

- 200-row schedule remains editable and exportable
- Review return shows exact next action/owner
- Color alone cannot distinguish required/error states

**Owning paths:** `src/components/enterprise-workspace.tsx`, `src/components/delivery-planning.tsx`.

**Evidence/context:** [ENG-WCAG](https://www.w3.org/TR/WCAG22/); DESIGN-ACCEPTANCE. **Original broader standard candidates:** ISA 230 and applicable audit/source acceptance requirements; selected WCAG 2.2 criteria; OWASP authorization; current runtime/vendor documentation; operating policy.

**Accountable capacities:** BA + QA/architect/operating owner by task; independent review:Independent auditor/source reviewer and accountable release/operations owners. Actual names remain unassigned; no signature is implied.

#### R-D13-02 — Research conceptual ERD to runtime contracts

**Proposed implementation decision:** Produce targeted ERD/runtime deltas for assignments, allocations, method runs and versioned reliance; preserve the current owning stores and history.

**Original question:** Which required cardinalities or invariants are actually missing?

**Prerequisites:** R-D05-02 R-D02-01 R-D10-01. **Original work groups:** RW31 RW32 RW33 RW34 RW35 RW36 RW39 RW40. **Methods:** M01 M02 M35 M36.

**How to implement:**

1. Map conceptual objects to actual tables/snapshots/commands and source IDs
2. Specify cardinalities, uniqueness, same-engagement/entity/period constraints and immutable version identity
3. Add only required records/fields/indexes and explicit legacy adapters
4. Rehearse migration on a copy, compare counts/hashes/actors and rollback; concurrent edits use expected revisions

**Data/record contract:** conceptId, runtimeOwner, key, scope, cardinality, constraint, migration, legacyMapping, rollback, evidence

**Discriminating expected cases:**

- Many assignees do not duplicate a workpaper
- Split allocation cannot exceed source effect silently
- Migration preserves historical signers and original hashes

**Owning paths:** `scripts/pilot-store.mjs`, `scripts/pilot-registers.mjs`, `scripts/pilot-workflow.mjs`.

**Evidence/context:** [ENG-SQLITE](https://www.sqlite.org/backup.html); DESIGN-METHODS; DESIGN-ALLOCATION. **Original broader standard candidates:** ISA 230 and applicable audit/source acceptance requirements; selected WCAG 2.2 criteria; OWASP authorization; current runtime/vendor documentation; operating policy.

**Accountable capacities:** BA + QA/architect/operating owner by task; independent review:Independent auditor/source reviewer and accountable release/operations owners. Actual names remain unassigned; no signature is implied.

#### R-D13-03 — Research measurable nonfunctional requirements

**Proposed implementation decision:** Define an explicit deployment profile before production tests; use measured targets and real storage/security owners. Prototype limits are documented facts, not production requirements.

**Original question:** What must the selected deployment handle and recover?

**Prerequisites:** R-D05-05 R-D12-04. **Original work groups:** RW31 RW32 RW33 RW34 RW35 RW36 RW39 RW40. **Methods:** M01 M02 M35 M36.

**How to implement:**

1. Select user/concurrency/import/export/write workloads, security boundary and recovery needs
2. Set owner-approved latency/error/storage/RPO/RTO criteria after baseline measurement
3. Run representative load, write contention, partial failure, recovery and denied-access scenarios on isolated systems
4. Record pass/fail with environment, sample size and percentiles; unresolved target/adapter blocks only the affected release claim

**Data/record contract:** deploymentProfile, owner, workload, hardware, p50/p95/p99, errorRateBase, RPO, RTO, backupScope, securityControls, measuredResult

**Discriminating expected cases:**

- Fast read-only demo cannot prove write contention
- Restore without originals -> recovery failed
- Local weak-password profile cannot be relabeled production-ready

**Owning paths:** `scripts/pilot-operations-rehearsal.mjs`, `scripts/pilot-operations.mjs`, `scripts/pilot-recovery.mjs`.

**Evidence/context:** ENG-NFR; [ENG-SQLITE](https://www.sqlite.org/backup.html); [ENG-AUTH](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). **Original broader standard candidates:** ISA 230 and applicable audit/source acceptance requirements; selected WCAG 2.2 criteria; OWASP authorization; current runtime/vendor documentation; operating policy.

**Accountable capacities:** BA + QA/architect/operating owner by task; independent review:Independent auditor/source reviewer and accountable release/operations owners. Actual names remain unassigned; no signature is implied.

#### R-D13-04 — Research source coverage and independent acceptance

**Proposed implementation decision:** Reconcile every original obligation and branch to a concrete result/status. Coverage links, executed fixtures and independent acceptance are separate dimensions.

**Original question:** How are all original obligations dispositioned without gaming counts?

**Prerequisites:** R-D08-05 R-D10-04 R-D11-03. **Original work groups:** RW31 RW32 RW33 RW34 RW35 RW36 RW39 RW40. **Methods:** M01 M02 M35 M36.

**How to implement:**

1. Preserve all original package/task/criterion/form/variant/AUTO/DEP/lifecycle/BPMN IDs
2. Map each to current engineering evidence and the new planned change/expected case
3. Classify supported manual, native automation, external owner, product deferral and genuine gap with rationale
4. Run exact-set and orphan checks; obtain attributable source/professional acceptance per required item, never aggregate away a failed branch

**Data/record contract:** originalId, requirementType, sourceLocator, owningTicket, expectedCase, actualEvidence, evidenceClass, limitation, acceptance

**Discriminating expected cases:**

- A branch with no owner/case is an orphan even when its parent is covered
- Two partial lifecycles do not become one complete lifecycle
- Deferred external API retains its contract/manual route and source disposition

**Owning paths:** `scripts/pilot-source-evidence.mjs`, `scripts/pilot-release.mjs`, `src/data/source-registers.json`.

**Evidence/context:** DESIGN-ACCEPTANCE; [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 230 and applicable audit/source acceptance requirements; selected WCAG 2.2 criteria; OWASP authorization; current runtime/vendor documentation; operating policy.

**Accountable capacities:** BA + QA/architect/operating owner by task; independent review:Independent auditor/source reviewer and accountable release/operations owners. Actual names remain unassigned; no signature is implied.

#### R-D13-05 — Research operational handoff and release blockers

**Proposed implementation decision:** Release only the selected full-audit scope after engineering, professional and operational evidence is complete. Planning completion never toggles releaseReady.

**Original question:** What concrete evidence permits release of the selected audit product scope?

**Prerequisites:** R-D13-01 R-D13-02 R-D13-03 R-D13-04. **Original work groups:** RW31 RW32 RW33 RW34 RW35 RW36 RW39 RW40. **Methods:** M01 M02 M35 M36.

**How to implement:**

1. Use the complete dependency-based batch plan in this pack
2. Assign actual people and size bounded tickets after inspecting the specified delta; no fictional dates/capacity
3. Resolve required native-method/form branches, independent source acceptance and chosen operating profile
4. Prepare release decision with known limitations, rollback/recovery evidence and accountable owners; publish authored development batches to the development branch only

**Data/record contract:** releaseCandidate, scopeManifest, source/methodVersions, engineeringEvidence, practitionerAcceptance, operationalEvidence, unresolvedBlockers, rollback

**Discriminating expected cases:**

- All structural plan checks pass but no practitioner acceptance -> release remains false
- External service not selected -> no fake deployment dependency
- Published branch is not a main merge or deployment

**Owning paths:** `scripts/pilot-release.mjs`, `scripts/verify-release.mjs`.

**Evidence/context:** DESIGN-ACCEPTANCE; ENG-NFR; [QM-1](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 230 and applicable audit/source acceptance requirements; selected WCAG 2.2 criteria; OWASP authorization; current runtime/vendor documentation; operating policy.

**Accountable capacities:** BA + QA/architect/operating owner by task; independent review:Independent auditor/source reviewer and accountable release/operations owners. Actual names remain unassigned; no signature is implied.
