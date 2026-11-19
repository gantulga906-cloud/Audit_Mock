# Permissions, review, consultation and quality

### D10 — Permissions, review, consultation and quality

#### R-D10-01 — Research permission vocabulary and immutable duties

**Proposed implementation decision:** Use configurable action permissions combined with engagement/object scope and non-bypassable actor/version duties. Existing D02 named-person assignments remain the authority base.

**Original question:** Which configurable actions are safe, and which controls must not be switchable?

**Prerequisites:** R-D02-01. **Original work groups:** RW08 RW09 RW24 RW31 RW33. **Methods:** M36.

**How to implement:**

1. Define a curated action dictionary for read/create/edit/submit/review/approve/issue/lock/share/dispose
2. Allow administrator role bundles and dated scoped grants without executable custom policies
3. Enforce current identity, appointment, object scope, stage, prior authorship and exact-version requirements server-side
4. Preserve privileged configuration history and deny self-approval where independent review is required

**Data/record contract:** actionId, roleBundle, subject, engagement/objectScope, appointment, effectiveDates, actorHistory, independentDuty, policyVersion

**Discriminating expected cases:**

- Administrator grants review action to preparer -> own-work approval still denied
- UI-hidden file remains inaccessible by direct URL
- Role change does not rewrite historical reviewer identity

**Owning paths:** `scripts/pilot-identity.mjs`, `scripts/pilot-server.mjs`, `scripts/pilot-workflow.mjs`.

**Evidence/context:** [ENG-AUTH](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html); [AUD-220R](https://www.irba.co.za/upload/IAASB-International-Standard-Auditing-220-Revised.pdf); D02-SPECIALIST. **Original broader standard candidates:** ISA 220, 230, 260, 265; ISQM 1 and ISQM 2; applicable IESBA Code; OWASP authorization; NIST separation of duty.

**Accountable capacities:** Quality methodology lead + security/BA; independent review:Authorized quality reviewer distinct from author; security reviewer. Actual names remain unassigned; no signature is implied.

#### R-D10-02 — Research ordinary review, consultation and disagreements

**Proposed implementation decision:** Separate preparer response, reviewer clearance, consultation advice, applied resolution and difference-of-opinion resolution.

**Original question:** What work must be performed and documented before a matter is resolved?

**Prerequisites:** R-D10-01. **Original work groups:** RW08 RW09 RW24 RW31 RW33. **Methods:** M36.

**How to implement:**

1. Anchor each note to exact work/evidence version and actual reviewer
2. Return for specific work, record preparer response and independent clearance
3. Consult using facts, scope, adviser competence, actual advice and application evidence
4. Resolve disagreements through designated authority and retain unresolved report-date guards

**Data/record contract:** noteId, workVersion, noteAuthor, responseVersion, clearanceActor, consultationId, advice, appliedWork, disagreement, resolutionAuthority

**Discriminating expected cases:**

- Preparer answers note -> note remains open until authorized clearance
- Advice obtained but not applied -> consultation unresolved
- Reviewer reassignment preserves earlier challenge and response

**Owning paths:** `scripts/pilot-oversight.mjs`, `scripts/pilot-finalisation.mjs`, `scripts/pilot-workflow.mjs`.

**Evidence/context:** [AUD-220R](https://www.irba.co.za/upload/IAASB-International-Standard-Auditing-220-Revised.pdf); [QM-1](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 220, 230, 260, 265; ISQM 1 and ISQM 2; applicable IESBA Code; OWASP authorization; NIST separation of duty.

**Accountable capacities:** Quality methodology lead + security/BA; independent review:Authorized quality reviewer distinct from author; security reviewer. Actual names remain unassigned; no signature is implied.

#### R-D10-03 — Research EQR applicability, eligibility and timing

**Proposed implementation decision:** Formal EQR is conditional and distinct from ordinary final review. Its eligible reviewer evaluates significant judgments and completes the review on or before report date.

**Original question:** When is EQR required, and what makes it independent and complete?

**Prerequisites:** R-D01-01 R-D10-02. **Original work groups:** RW08 RW09 RW24 RW31 RW33. **Methods:** M36.

**How to implement:**

1. Determine requirement from applicable law, firm quality policy and relevant engagement category
2. Evaluate reviewer/assistants competence, time, authority, ethics, team separation and former-partner cooling-off
3. Capture significant judgments, selected documentation/discussions, concerns and their actual resolution
4. Record reviewer completion notice and guard report dating/issue until required EQR is complete; retain separate ordinary review

**Data/record contract:** eqrRequired, basis, reviewerEligibility, formerPartnerDates, significantJudgments, reviewWork, concerns, completionNotice, completionAt

**Discriminating expected cases:**

- Ordinary R4 confirmation does not satisfy formal EQR
- Required EQR completed after report date -> invalid dating sequence
- New unresolved EQR concern invalidates earlier readiness

**Owning paths:** `scripts/pilot-oversight.mjs`, `scripts/pilot-reporting.mjs`.

**Evidence/context:** [QM-2](https://www.ifac.org/system/files/publications/files/IAASB-Quality-Management-ISQM-2-Engagement-Quality-Reviews.pdf); [QM-1](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-220R](https://www.irba.co.za/upload/IAASB-International-Standard-Auditing-220-Revised.pdf). **Original broader standard candidates:** ISA 220, 230, 260, 265; ISQM 1 and ISQM 2; applicable IESBA Code; OWASP authorization; NIST separation of duty.

**Accountable capacities:** Quality methodology lead + security/BA; independent review:Authorized quality reviewer distinct from author; security reviewer. Actual names remain unassigned; no signature is implied.

#### R-D10-04 — Research audit-facing firm quality minimums

**Proposed implementation decision:** Retain audit-facing firm quality controls while deferring general CRM/billing/HR. A quality system includes monitoring and remediation beyond one engagement sign-off.

**Original question:** Which B-series obligations are needed for the selected audit practice?

**Prerequisites:** R-D10-03. **Original work groups:** RW08 RW09 RW24 RW31 RW33. **Methods:** M36.

**How to implement:**

1. Map B-series source obligations individually to audit necessity versus broader operations
2. Provide independence confirmations, methodology resources, consultation, complaints/breaches and engagement inspection records
3. Record quality-risk response, identified deficiency, root cause, remediation owner and effectiveness follow-up
4. Keep conditional other-service mandates separate from statutory audit records and permissions

**Data/record contract:** qualityObjective/risk, response, independenceConfirmation, complaint, inspectionFinding, rootCause, remediation, effectiveness, serviceMandate

**Discriminating expected cases:**

- Billing deferred does not defer independence confirmation
- Closed remediation task without effectiveness evidence -> monitoring incomplete
- Advisory follow-up cannot silently edit an issued audit file

**Owning paths:** `scripts/pilot-registers.mjs`, `scripts/pilot-finalisation.mjs`.

**Evidence/context:** [QM-1](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-SCOPE. **Original broader standard candidates:** ISA 220, 230, 260, 265; ISQM 1 and ISQM 2; applicable IESBA Code; OWASP authorization; NIST separation of duty.

**Accountable capacities:** Quality methodology lead + security/BA; independent review:Authorized quality reviewer distinct from author; security reviewer. Actual names remain unassigned; no signature is implied.

#### R-D10-05 — Threat-model authorization and history

**Proposed implementation decision:** Threat-model actual authorization boundaries and history rather than treating role labels as security proof.

**Original question:** Can configuration changes or direct requests bypass the approved controls?

**Prerequisites:** R-D10-01 R-D06-04. **Original work groups:** RW08 RW09 RW24 RW31 RW33. **Methods:** M36.

**How to implement:**

1. Inventory every server route, object family, metadata view, export and external-like token
2. Build actor x action x object/state test matrix including direct requests
3. Test cross-client, guessed IDs, replay, stale revisions, grant expiry, suspension, role changes and history integrity
4. Fix centrally in existing guards, then rerun affected routes and preserve evidence without credentials

**Data/record contract:** route, action, actorContext, objectScope, state, expectedDecision, directRequestResult, replayKey, historyEvidence

**Discriminating expected cases:**

- Revoked user cannot retrieve cached bundle route
- Same idempotency key with changed payload rejected
- Partner capacity cannot delete historical audit events

**Owning paths:** `scripts/pilot-server.mjs`, `scripts/pilot-identity.mjs`, `scripts/pilot-store.mjs`.

**Evidence/context:** [ENG-AUTH](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html); [ENG-UPLOAD](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html); ENG-NFR. **Original broader standard candidates:** ISA 220, 230, 260, 265; ISQM 1 and ISQM 2; applicable IESBA Code; OWASP authorization; NIST separation of duty.

**Accountable capacities:** Quality methodology lead + security/BA; independent review:Authorized quality reviewer distinct from author; security reviewer. Actual names remain unassigned; no signature is implied.
