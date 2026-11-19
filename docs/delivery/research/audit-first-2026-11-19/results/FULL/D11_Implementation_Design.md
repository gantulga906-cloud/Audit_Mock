# Opinion, wording, authorization and issuance

### D11 — Opinion, wording, authorization and issuance

#### R-D11-01 — Research opinion and report-structure decisions

**Proposed implementation decision:** Use a supported single-cause opinion matrix plus an explicit professional multi-cause route. The software validates completeness/contradiction; auditor determines materiality and pervasiveness.

**Original question:** Which report outcomes follow each source situation and combination?

**Prerequisites:** R-D09-05 R-D10-03. **Original work groups:** RW23 RW24 RW25 RW26 RW27 RW35. **Methods:** M33 M34 M36.

**How to implement:**

1. Record sufficient evidence versus limitation, known misstatement and possible effects separately
2. Apply the standard matrix for supported cases; preserve grounds and final-evaluation links
3. For combined causes document each cause, interaction, professional opinion and consultations instead of rejecting the whole engagement forever
4. Record KAM, going-concern, emphasis, other-matter and other-information choices independently; sections cannot cure an inappropriate opinion

**Data/record contract:** opinionDecision, evidenceAdequacy, knownEffects, possibleEffects, materialityJudgments, pervasivenessJudgments, combinedCauseMemo, sectionDecisions

**Discriminating expected cases:**

- Material nonpervasive known effect -> qualified candidate for auditor approval
- Material pervasive known effect -> adverse candidate
- Combined material known error and limitation -> specialist/professional determination with rationale, no automatic precedence rule

**Owning paths:** `scripts/pilot-reporting.mjs`, `scripts/pilot-registers.mjs`.

**Evidence/context:** [AUD-705](https://standards.auasb.gov.au/asa-705-apr-2022); [AUD-700](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-701](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-706](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 700, 701, 705, 706, 710, 720, 570, 560, 220; ISA 800/805/810 only if selected source offerings require; applicable local report law.

**Accountable capacities:** Audit reporting/methodology lead; independent review:Authorized reporting practitioner; local reviewer for statutory wording. Actual names remain unassigned; no signature is implied.

#### R-D11-02 — Research exact report wording and applicability

**Proposed implementation decision:** Use versioned reviewed report templates and exact engagement instances. Correct the identified adverse-template conflict through a controlled successor, preserving the source.

**Original question:** Which template edition and local wording may be used for the selected report?

**Prerequisites:** R-D11-01 R-D01-01. **Original work groups:** RW23 RW24 RW25 RW26 RW27 RW35. **Methods:** M33 M34 M36.

**How to implement:**

1. Select framework, jurisdiction, entity category, audit edition and report language
2. Map mandatory report components and conditional sections to exact supporting decisions
3. Review title/addressee/opinion/basis/responsibilities/date/signature/duties as an instance
4. Produce DOCX/PDF or the agreed native output from exact approved content; retain approved wording variance and original source reference

**Data/record contract:** templateRelease, applicabilityProfile, sectionIds, wording, reviewer, reportDate, signatureIdentity, localDuties, outputHash

**Discriminating expected cases:**

- Adverse label with unmodified opinion wording -> contradiction requiring correction
- Changing one approved sentence creates a new reviewable version
- KAM omitted/included with actual applicability rationale

**Owning paths:** `scripts/pilot-reporting.mjs`, `scripts/pilot-report.mjs`, `scripts/pilot-workpaper-export.mjs`.

**Evidence/context:** [AUD-700](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-705](https://standards.auasb.gov.au/asa-705-apr-2022); [AUD-701](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-706](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 700, 701, 705, 706, 710, 720, 570, 560, 220; ISA 800/805/810 only if selected source offerings require; applicable local report law.

**Accountable capacities:** Audit reporting/methodology lead; independent review:Authorized reporting practitioner; local reviewer for statutory wording. Actual names remain unassigned; no signature is implied.

#### R-D11-03 — Research authorization and issuance evidence

**Proposed implementation decision:** Authorize and issue exact bytes bound to approved statements, notes and conclusions. Signing, issue, dispatch and receipt are separate events.

**Original question:** What exact state and bytes may be signed and released?

**Prerequisites:** R-D11-02 R-D10-05. **Original work groups:** RW23 RW24 RW25 RW26 RW27 RW35. **Methods:** M33 M34 M36.

**How to implement:**

1. Freeze approved report/FS/notes package and verify all hashes/current reviews
2. Authorize exact package with actual eligible partner and required quality completion
3. Record actual signing and issue; provider adapters only if selected, otherwise supported manual evidence
4. Record recipients, each dispatch attempt/result and acknowledgment; reconcile unknown external effects before retry

**Data/record contract:** authorizationId, reportHash, fsHash, notesHash, conclusionVersions, signerAuthority, signatureEvidence, issueAt, recipientAttempt, receipt

**Discriminating expected cases:**

- Changed report after signature -> old signature unusable
- Local link creation -> pending delivery, not receipt
- One recipient acknowledged while another missing -> distribution incomplete

**Owning paths:** `scripts/pilot-reporting.mjs`, `scripts/pilot-release.mjs`, `scripts/pilot-external-effects.mjs`.

**Evidence/context:** [AUD-700](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [QM-2](https://www.ifac.org/system/files/publications/files/IAASB-Quality-Management-ISQM-2-Engagement-Quality-Reviews.pdf); [ENG-AUTH](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html). **Original broader standard candidates:** ISA 700, 701, 705, 706, 710, 720, 570, 560, 220; ISA 800/805/810 only if selected source offerings require; applicable local report law.

**Accountable capacities:** Audit reporting/methodology lead; independent review:Authorized reporting practitioner; local reviewer for statutory wording. Actual names remain unassigned; no signature is implied.

#### R-D11-04 — Research amended/reissued reporting interactions

**Proposed implementation decision:** Amended reporting creates a successor package with its own procedures, authority, date and communications; the prior issued report remains immutable.

**Original question:** When are new wording, date, procedures or communications required?

**Prerequisites:** R-D11-03 R-D12-01. **Original work groups:** RW23 RW24 RW25 RW26 RW27 RW35. **Methods:** M33 M34 M36.

**How to implement:**

1. Use the D12 later-fact classification and management amendment decision
2. Choose full redating or the permitted limited-procedure/dual-date route with actual legal/professional basis
3. Reperform affected procedures, update completion and independently approve successor wording
4. Issue new exact package and record prior-recipient communication/prevention-of-reliance effects

**Data/record contract:** predecessorIssue, laterFactId, amendmentScope, datingDecision, proceduresThrough, amendedFSApproval, successorReport, communications

**Discriminating expected cases:**

- New report cannot predate approval of amended statements
- Old report retained while new report clearly supersedes it
- Failed notice remains unresolved; no pretend prevention of reliance

**Owning paths:** `scripts/pilot-later-facts.mjs`, `scripts/pilot-reporting.mjs`.

**Evidence/context:** [AUD-560](https://standards.auasb.gov.au/node/634); [AUD-700](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-705](https://standards.auasb.gov.au/asa-705-apr-2022). **Original broader standard candidates:** ISA 700, 701, 705, 706, 710, 720, 570, 560, 220; ISA 800/805/810 only if selected source offerings require; applicable local report law.

**Accountable capacities:** Audit reporting/methodology lead; independent review:Authorized reporting practitioner; local reviewer for statutory wording. Actual names remain unassigned; no signature is implied.
