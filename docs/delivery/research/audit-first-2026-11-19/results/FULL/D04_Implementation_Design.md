# Risk, controls, planning and materiality

### D04 — Risk, controls, planning and materiality

#### R-D04-01 — Research risk taxonomy and assertion coverage

**Proposed implementation decision:** Represent financial-statement-level and assertion-level risks separately; fraud is a risk dimension that can affect several procedures. Avoid a universal numeric risk score.

**Original question:** What distinctions are required between entity risks, FS risks, assertion risks and fraud risks?

**Prerequisites:** R-D01-01. **Original work groups:** RW02 RW06 RW09 RW11 RW19 RW35. **Methods:** M03 M07 M36.

**How to implement:**

1. Capture entity/business/IT/service-organization understanding and actual risk-assessment work
2. Link significant classes, balances and disclosures to assertions and identified risks
3. Record inherent/control assessment, significance rationale, fraud/override and professional judgments under the selected edition
4. Maintain many-to-many risk-response-procedure links and reassess only affected work when facts change

**Data/record contract:** riskId, level, account/disclosure, assertion, inherentFactors, controlAssessment, significantRisk, fraudDimension, rationale, responseIds

**Discriminating expected cases:**

- Fraud risk links to journal tests and revenue procedures simultaneously
- New IT dependency generates specific work rather than an automatic high-risk score
- An assertion with no response remains a visible planning gap

**Owning paths:** `scripts/pilot-planning.mjs`, `scripts/pilot-registers.mjs`.

**Evidence/context:** [AUD-315](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-240](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-330](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 200, 240, 250, 260, 265, 300, 315, 320, 330, 402, 510, 600, 610, 620; relevant IESBA/firm policies.

**Accountable capacities:** Audit methodology analyst + BA; independent review:Authorized practicing audit planning/review lead. Actual names remain unassigned; no signature is implied.

#### R-D04-02 — Separate control design, implementation and operating effectiveness

**Proposed implementation decision:** Keep design evaluation, implementation and operating effectiveness as separate records. Reliance is a reviewed conclusion over actual period evidence.

**Original question:** Which work justifies reliance, and what happens when it fails?

**Prerequisites:** R-D04-01. **Original work groups:** RW02 RW06 RW09 RW11 RW19 RW35. **Methods:** M03 M07 M36.

**How to implement:**

1. Identify each control objective, owner, frequency, relevant IT dependencies and design
2. Record implementation evidence and walkthrough without treating these as operating tests
3. Plan period-specific instances, record deviations and assess operating effectiveness
4. Reconsider reliance, substantive work and deficiency communications when a deviation or dependency changes

**Data/record contract:** controlId, riskIds, objective, designResult, implementationResult, testPeriod, instances, deviations, relianceDecision, responseRevision

**Discriminating expected cases:**

- Good walkthrough plus no operating tests -> operating effectiveness unknown
- Failed control -> reassessment queued; original approval preserved
- One control supports several assertions without duplicating tested instances

**Owning paths:** `scripts/pilot-planning.mjs`, `scripts/pilot-execution.mjs`.

**Evidence/context:** [AUD-315](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-330](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-265](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 200, 240, 250, 260, 265, 300, 315, 320, 330, 402, 510, 600, 610, 620; relevant IESBA/firm policies.

**Accountable capacities:** Audit methodology analyst + BA; independent review:Authorized practicing audit planning/review lead. Actual names remain unassigned; no signature is implied.

#### R-D04-03 — Research materiality policy and calculations

**Proposed implementation decision:** M03 computes selected values; benchmark, normalization, performance percentage and clearly trivial threshold remain documented auditor/firm choices.

**Original question:** Which benchmarks, normalizations and percentages are firm judgments?

**Prerequisites:** R-D01-01. **Original work groups:** RW02 RW06 RW09 RW11 RW19 RW35. **Methods:** M03 M07 M36.

**How to implement:**

1. Select benchmark source and normalize only with explicit adjustment evidence
2. Record overall, specific, performance and clearly trivial amounts with distinct purpose
3. Calculate in explicit currency/scale and retain percentage basis, precision and rationale
4. Revise on new facts and reassess affected samples, procedures and aggregated findings

**Data/record contract:** benchmarkSource, benchmarkAmount, normalization, overallAmount, specificLevels, performanceAmount, trivialAmount, policyVersion, rationale

**Discriminating expected cases:**

- Benchmark 1000000 CU x 5% -> 50000 CU; 60% of that -> 30000 CU, illustrative policy only
- Explicit zero trivial threshold remains zero
- Negative profit needs a reasoned benchmark choice, not silent absolute value

**Owning paths:** `scripts/pilot-materiality.mjs`, `scripts/pilot-planning.mjs`.

**Evidence/context:** [AUD-320](https://standards.auasb.gov.au/node/859); [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 200, 240, 250, 260, 265, 300, 315, 320, 330, 402, 510, 600, 610, 620; relevant IESBA/firm policies.

**Accountable capacities:** Audit methodology analyst + BA; independent review:Authorized practicing audit planning/review lead. Actual names remain unassigned; no signature is implied.

#### R-D04-04 — Complete planning and opening/component branches

**Proposed implementation decision:** Planning is iterative. Initial audits, components, changed scope and reliance on others require their own conditional work and responsibilities.

**Original question:** What source work changes for a first audit, component or revised scope?

**Prerequisites:** R-D04-01 R-D04-02 R-D04-03. **Original work groups:** RW02 RW06 RW09 RW11 RW19 RW35. **Methods:** M03 M07 M36.

**How to implement:**

1. Preserve current strategy, plan, team discussion and governance communications
2. For first audits capture prior opinion, opening balances, accounting-policy consistency and alternative work
3. For groups distinguish component scope/materiality/instructions/communication and group review under the chosen ISA600 edition
4. Version changed scope and resources; propagate actual consequences to programmes and reviewers

**Data/record contract:** strategyVersion, initialAudit, openingBalanceWork, componentScope, instructions, materialityBasis, changeReason, governanceCommunication

**Discriminating expected cases:**

- Opening balance arithmetic agrees but audit evidence is unavailable -> limitation remains
- Component report received -> group review still required
- Scope expands after planning -> new procedures/assignments, historical plan retained

**Owning paths:** `scripts/pilot-planning.mjs`, `scripts/pilot-registers.mjs`.

**Evidence/context:** [AUD-300](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-510](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-600](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 200, 240, 250, 260, 265, 300, 315, 320, 330, 402, 510, 600, 610, 620; relevant IESBA/firm policies.

**Accountable capacities:** Audit methodology analyst + BA; independent review:Authorized practicing audit planning/review lead. Actual names remain unassigned; no signature is implied.
