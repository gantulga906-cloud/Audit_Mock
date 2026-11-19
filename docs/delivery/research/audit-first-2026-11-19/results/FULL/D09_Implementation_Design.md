# Findings, corrections and audit completion

### D09 — Findings, corrections and audit completion

#### R-D09-01 — Research misstatement classification and aggregation

**Proposed implementation decision:** Use a canonical issue and signed financial-effect lines. Separate factual, judgmental, projected, qualitative, control and evidence-limitation effects.

**Original question:** How should signed errors, exposure, projection, omissions and prior-period effects coexist?

**Prerequisites:** R-D07-03 R-D05-04. **Original work groups:** RW21 RW22 RW23 RW34 RW35. **Methods:** M22 M24 M25 M28 M31 M32 M33 M34.

**How to implement:**

1. Classify actual exception before creating a monetary misstatement
2. Keep economic issue identity and affected assertion/account/period/currency
3. Link sampled factual and incremental projected amounts without double counting; retain gross positive/negative exposure and justified net presentations
4. Evaluate individual, aggregate, prior-period and qualitative effects against current thresholds

**Data/record contract:** issueId, originUnit, effectType, signedLines, currency, period, projectionLink, factualAmount, incrementalProjection, qualitativeEffect

**Discriminating expected cases:**

- +100 and -80 CU show gross180/net20 with context, no automatic cancellation
- Unknown disclosure effect remains unknown
- Same exception from two procedures links one issue

**Owning paths:** `scripts/pilot-completion.mjs`, `scripts/pilot-finalisation.mjs`.

**Evidence/context:** [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-530](https://standards.auasb.gov.au/node/728); DESIGN-PROJECTION. **Original broader standard candidates:** ISA 230, 250, 260, 265, 450, 501, 540, 550, 560, 570, 580, 600, 620, 720; applicable IAS 8, 10, 12, 24, 36, 37 and disclosure requirements.

**Accountable capacities:** Completion/methodology analyst; independent review:Authorized engagement completion/review lead. Actual names remain unassigned; no signature is implied.

#### R-D09-02 — Research correction verification and unresolved effects

**Proposed implementation decision:** Correction status requires evidence of actual posting or changed disclosure, followed by independent verification. Agreement alone is insufficient.

**Original question:** What demonstrates an agreed adjustment actually reached the books?

**Prerequisites:** R-D09-01. **Original work groups:** RW21 RW22 RW23 RW34 RW35. **Methods:** M22 M24 M25 M28 M31 M32 M33 M34.

**How to implement:**

1. Record proposal, management response and approved journal/disclosure change separately
2. Match each financial-effect line to compatible final-ledger rows and prevent reuse
3. Reconcile full, partial, rejected and reversed corrections against final statements
4. Preserve remaining uncorrected effects and re-review after source changes

**Data/record contract:** correctionId, issueId, proposedLines, agreedAmount, postingSourceRows, verification, correctedAmount, residual, disclosureVersion

**Discriminating expected cases:**

- 100 CU error, management agrees100, posted60 ->40 CU remains
- Balanced journal in wrong account does not correct the issue
- Disclosure wording changed but wrong note version -> verification fails

**Owning paths:** `scripts/pilot-completion.mjs`, `scripts/pilot-finalisation.mjs`.

**Evidence/context:** [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0). **Original broader standard candidates:** ISA 230, 250, 260, 265, 450, 501, 540, 550, 560, 570, 580, 600, 620, 720; applicable IAS 8, 10, 12, 24, 36, 37 and disclosure requirements.

**Accountable capacities:** Completion/methodology analyst; independent review:Authorized engagement completion/review lead. Actual names remain unassigned; no signature is implied.

#### R-D09-03 — Research legal, estimates, going-concern and subsequent-event completion

**Proposed implementation decision:** Maintain separate legal/estimates/going-concern/subsequent-event assessments tied to actual final statements and relevant dates. Numeric indicators support, but never replace, conclusions.

**Original question:** What evidence and dates must the auditor evaluate before reporting?

**Prerequisites:** R-D01-01 R-D09-01. **Original work groups:** RW21 RW22 RW23 RW34 RW35. **Methods:** M22 M24 M25 M28 M31 M32 M33 M34.

**How to implement:**

1. Evaluate legal enquiries and recognition/disclosure facts through M31
2. Reperform selected estimates and challenge methods, assumptions, data and bias
3. Evaluate management going-concern assessment, horizon, mitigations, uncertainty and disclosures under the selected ISA570 edition
4. Perform subsequent-event enquiries/reviews through intended report date and classify accounting/report consequences

**Data/record contract:** assessmentType, finalStatementVersion, reportDate, horizon, evidence, assumptionChallenge, uncertainty, disclosure, conclusion, nextWork

**Discriminating expected cases:**

- Positive runway with uncommitted refinancing -> uncertainty still evaluated
- Later cash receipt may inform year-end recoverability without automatic revenue recognition
- Lawyer response does not itself select IAS37 accounting

**Owning paths:** `scripts/pilot-finalisation.mjs`, `scripts/pilot-execution.mjs`.

**Evidence/context:** [AUD-501](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-540](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-560](https://standards.auasb.gov.au/node/634); [AUD-570](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ACC-IAS37](https://standards.aasb.gov.au/aasb-137-jan-2026-0). **Original broader standard candidates:** ISA 230, 250, 260, 265, 450, 501, 540, 550, 560, 570, 580, 600, 620, 720; applicable IAS 8, 10, 12, 24, 36, 37 and disclosure requirements.

**Accountable capacities:** Completion/methodology analyst; independent review:Authorized engagement completion/review lead. Actual names remain unassigned; no signature is implied.

#### R-D09-04 — Research disclosure and other-information coverage

**Proposed implementation decision:** Use versioned disclosure applicability by selected framework/entity/period; keep other-information work distinct from audited statements.

**Original question:** How is an applicable disclosure checked without asserting universal completeness?

**Prerequisites:** R-D03-03 R-D09-03. **Original work groups:** RW21 RW22 RW23 RW34 RW35. **Methods:** M22 M24 M25 M28 M31 M32 M33 M34.

**How to implement:**

1. Build applicable disclosure rows from the selected standards/policy, not a universal yes/no checklist
2. Link each requirement to exact note/paragraph and supporting work or justified N/A
3. Reconcile missing, incomplete, contradictory and stale notes to matters and report consequences
4. Record actual annual-report other information obtained/read or expected later, inconsistencies, communications and subsequent handling

**Data/record contract:** disclosureRequirementId, frameworkVersion, applicability, noteAnchor, evidence, review, otherInformationVersion, obtainedAt, inconsistency

**Discriminating expected cases:**

- Checklist all checked but missing required note -> no completion
- Expected-later annual report remains unperformed read with actual follow-up owner
- Changed notes require affected disclosure review

**Owning paths:** `scripts/pilot-finalisation.mjs`, `scripts/pilot-registers.mjs`.

**Evidence/context:** [AUD-700](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-720](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [ACC-PRESENTATION](https://standards.aasb.gov.au/aasb-101-dec-2022-0). **Original broader standard candidates:** ISA 230, 250, 260, 265, 450, 501, 540, 550, 560, 570, 580, 600, 620, 720; applicable IAS 8, 10, 12, 24, 36, 37 and disclosure requirements.

**Accountable capacities:** Completion/methodology analyst; independent review:Authorized engagement completion/review lead. Actual names remain unassigned; no signature is implied.

#### R-D09-05 — Research completion-to-report handoff

**Proposed implementation decision:** Produce a current completion package with explicit outstanding matters and professional consequences. No generic green status can clear a mandatory unresolved item.

**Original question:** Which unresolved matters affect authorization, opinion or additional work?

**Prerequisites:** R-D09-02 R-D09-04. **Original work groups:** RW21 RW22 RW23 RW34 RW35. **Methods:** M22 M24 M25 M28 M31 M32 M33 M34.

**How to implement:**

1. Bind final analytics, findings, corrections, representations, communications and eight final assessments to exact versions
2. Require current reviews and actual representation evidence near the report date
3. Document overall evidence sufficiency and individual/aggregate/qualitative judgments
4. Hand limitations and conclusions to D11, separating blockers on issue from legitimate modified-opinion outcomes

**Data/record contract:** completionVersion, finalFS/notes, assessments, representations, evaluation, unresolvedMatters, qualityState, reportConsequences

**Discriminating expected cases:**

- Unsigned representation template cannot satisfy obtained representations
- Evidence limitation can require disclaimer, not an invented clean completion
- Report-date change reopens date-dependent work selectively

**Owning paths:** `scripts/pilot-finalisation.mjs`, `scripts/pilot-reporting.mjs`.

**Evidence/context:** [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-580](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-700](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-260](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 230, 250, 260, 265, 450, 501, 540, 550, 560, 570, 580, 600, 620, 720; applicable IAS 8, 10, 12, 24, 36, 37 and disclosure requirements.

**Accountable capacities:** Completion/methodology analyst; independent review:Authorized engagement completion/review lead. Actual names remain unassigned; no signature is implied.
