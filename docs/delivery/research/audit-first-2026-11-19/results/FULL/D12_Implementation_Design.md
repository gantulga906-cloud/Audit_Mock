# Later facts, assembly, custody and retention

### D12 — Later facts, assembly, custody and retention

#### R-D12-01 — Research later-fact dates and permitted alternatives

**Proposed implementation decision:** Use three separate dates for event occurrence, discovery and reporting stage. Dual dating is conditional, not a general alternative button.

**Original question:** Which response is required at each report/issue/assembly stage?

**Prerequisites:** R-D01-01. **Original work groups:** RW27 RW28 RW29 RW30 RW32 RW33. **Methods:** M34 M36.

**How to implement:**

1. Record original financial period, report date, issue date and discovery evidence
2. Before report date perform required subsequent-event work; after date evaluate facts that could have changed the report
3. Discuss with management/governance, determine need for amendment and response
4. Permit limited extended procedures/dual dating only where applicable law/framework permits restricted amendment; otherwise extend work to a new full date

**Data/record contract:** eventOccurredAt, discoveredAt, reportingDate, originalReportDate, issuedAt, amendmentNeed, legalPermission, limitedProcedures, datingChoice

**Discriminating expected cases:**

- Fact discovered after archive still creates an evaluated later-fact case
- Limited amendment without permission -> dual-date route denied
- Later event with no year-end accounting change may still require disclosure

**Owning paths:** `scripts/pilot-later-facts.mjs`, `scripts/pilot-archive-controls.mjs`.

**Evidence/context:** [AUD-560](https://standards.auasb.gov.au/node/634); [ACC-IAS10](https://standards.aasb.gov.au/aasb-110-mar-2020). **Original broader standard candidates:** ISA 230, 560, 220; ISQM 1; verified Mongolian documentation/retention/inspection law and operating contracts.

**Accountable capacities:** Audit documentation analyst + operating owner; independent review:Authorized documentation/quality reviewer; legal reviewer for local rules. Actual names remain unassigned; no signature is implied.

#### R-D12-02 — Research final assembly and post-assembly amendments

**Proposed implementation decision:** Final assembly is administrative; subsequent new audit work requires a substantive amendment with actual reasons and dates.

**Original question:** Which administrative actions are permitted after report date?

**Prerequisites:** R-D12-01. **Original work groups:** RW27 RW28 RW29 RW30 RW32 RW33. **Methods:** M34 M36.

**How to implement:**

1. Reconcile exact issued package, completed work and resolved notes to a manifest
2. Calculate policy-based assembly deadline independently from retention date
3. Allow indexing/cross-referencing/administrative copies with preserved history, never backdated audit work
4. Lock the assembled file; any later change records who/when/why, work, conclusion and review in an appropriate successor

**Data/record contract:** assemblyPolicy, anchorDate, deadline, manifest, administrativeChange, substantiveChange, reason, actor, reviewedAt, lockVersion

**Discriminating expected cases:**

- Missing audit test cannot be created as administrative assembly
- Typo in index creates narrow recorded successor
- Lock preserves original work and prior issue bytes

**Owning paths:** `scripts/pilot-assembly.mjs`, `scripts/pilot-archive.mjs`, `scripts/pilot-archive-controls.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-560](https://standards.auasb.gov.au/node/634). **Original broader standard candidates:** ISA 230, 560, 220; ISQM 1; verified Mongolian documentation/retention/inspection law and operating contracts.

**Accountable capacities:** Audit documentation analyst + operating owner; independent review:Authorized documentation/quality reviewer; legal reviewer for local rules. Actual names remain unassigned; no signature is implied.

#### R-D12-03 — Research retention, holds and disposal authority

**Proposed implementation decision:** Retention eligibility, legal holds, disposal authority and actual disposal are distinct. Keep files when applicability is unresolved; no automatic deletion.

**Original question:** What policy applies to which file and copies, and what suspends deletion?

**Prerequisites:** R-D12-02. **Original work groups:** RW27 RW28 RW29 RW30 RW32 RW33. **Methods:** M34 M36.

**How to implement:**

1. Record applicable local/professional/firm policy scope, period and exact anchor with evidence
2. Calculate each applicable deadline and retain the longest binding one plus active holds
3. Require independent authorization and per-copy disposition manifest before any removal
4. Record actual removal/retained residuals/backups and verification; never label a local deletion secure erasure

**Data/record contract:** retentionPolicy/version, legalSource, anchor, period, deadline, holds, dispositionAuthority, copies, actualRemoval, residuals

**Discriminating expected cases:**

- Two holds; release one -> deletion still denied
- New shorter policy cannot silently shorten an inherited binding deadline
- Unknown local retention anchor -> retain and request policy determination within the workflow

**Owning paths:** `scripts/pilot-archive-controls.mjs`, `scripts/pilot-archive.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); D01-LOCAL-LAW; ENG-RETENTION. **Original broader standard candidates:** ISA 230, 560, 220; ISQM 1; verified Mongolian documentation/retention/inspection law and operating contracts.

**Accountable capacities:** Audit documentation analyst + operating owner; independent review:Authorized documentation/quality reviewer; legal reviewer for local rules. Actual names remain unassigned; no signature is implied.

#### R-D12-04 — Research custody, retrieval, inspection and recovery

**Proposed implementation decision:** Custody acceptance requires actual completeness/readability inspection and authorized retrieval. Backup success and hash equality do not by themselves prove usable recovery.

**Original question:** Can the selected storage actually preserve and recover a reviewable audit file?

**Prerequisites:** R-D12-03 R-D06-04. **Original work groups:** RW27 RW28 RW29 RW30 RW32 RW33. **Methods:** M34 M36.

**How to implement:**

1. Offer exact package to the authorized custodian with scope and restrictions
2. Inspect each Office/PDF/original in a compatible reader and record actual acknowledgment
3. Support limited inspector requests, approval, dispatch/receipt, return, revocation and disclosure log
4. Rehearse isolated restore and scoped retrieval; preserve holds, identities, grants and exact originals

**Data/record contract:** custodyOffer, manifestHash, inspector, formatReader, perItemReadability, acceptedAt, retrievalGrant, dispatchReceipt, recoveryObservation

**Discriminating expected cases:**

- All hashes match but Office file fails to open -> custody discrepancy
- Report-only grant hides unrelated original names/counts
- Restore preserves revoked status and does not resurrect access

**Owning paths:** `scripts/pilot-oversight.mjs`, `scripts/pilot-recovery.mjs`, `scripts/pilot-archive-controls.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ENG-SQLITE](https://www.sqlite.org/backup.html); [ENG-AUTH](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). **Original broader standard candidates:** ISA 230, 560, 220; ISQM 1; verified Mongolian documentation/retention/inspection law and operating contracts.

**Accountable capacities:** Audit documentation analyst + operating owner; independent review:Authorized documentation/quality reviewer; legal reviewer for local rules. Actual names remain unassigned; no signature is implied.

#### R-D12-05 — Research postarchive service boundaries

**Proposed implementation decision:** Postarchive recommendations/advisory work require a separate mandate and workspace; statutory later-fact duties remain linked to the original audit.

**Original question:** Which later recommendations are a separate offering?

**Prerequisites:** R-D12-01. **Original work groups:** RW27 RW28 RW29 RW30 RW32 RW33. **Methods:** M34 M36.

**How to implement:**

1. Classify a new request as audit later fact, inspection/retrieval or separate service
2. Create actual authority, scope, dates and permitted source references for an optional service
3. Record management implementation claim separately from independent effectiveness verification
4. Return audit-relevant new facts through D12-01 without rewriting the sealed file or reusing audit approval as service authority

**Data/record contract:** requestClass, serviceMandate, authorizedDates, sourceAuditReference, recommendation, implementationClaim, retest, laterFactLink

**Discriminating expected cases:**

- Expired service mandate denies new service work
- Failed retest remains failed despite management completion claim
- Separate advisory edit cannot alter archived statutory findings

**Owning paths:** `scripts/pilot-finalisation.mjs`, `scripts/pilot-later-facts.mjs`.

**Evidence/context:** DESIGN-SCOPE; [AUD-560](https://standards.auasb.gov.au/node/634); [QM-1](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 230, 560, 220; ISQM 1; verified Mongolian documentation/retention/inspection law and operating contracts.

**Accountable capacities:** Audit documentation analyst + operating owner; independent review:Authorized documentation/quality reviewer; legal reviewer for local rules. Actual names remain unassigned; no signature is implied.
