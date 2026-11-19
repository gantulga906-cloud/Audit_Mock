# Programmes, sampling, analytics and journals

### D07 — Programmes, sampling, analytics and journals

#### R-D07-01 — Research method support and sampling purpose

**Proposed implementation decision:** Choose a method per audit objective: full examination, specific items, statistical sampling or nonstatistical sampling. Targeted items alone do not support residual-population projection.

**Original question:** Which sampling designs are required by the approved source/offering?

**Prerequisites:** R-D04-03 R-D05-01. **Original work groups:** RW15 RW16 RW17 RW34 RW35. **Methods:** M04 M05 M06 M07 M08 M14 M33.

**How to implement:**

1. Pin reconciled population, assertion, unit and deviation/misstatement definition
2. Partition specifically tested, excluded-with-reason and residual units without overlap
3. Select the approved size/design/evaluation route and document assumptions
4. Keep controls attributes, monetary variables and MUS as separate method profiles with distinct inference

**Data/record contract:** designId, purpose, unit, frameHash, strata, specificIds, exclusions, residualIds, tolerableError/deviation, expectedError, riskBasis

**Discriminating expected cases:**

- Top ten largest invoices -> specific selection, no random-residual confidence claim
- Zero/negative book units cannot silently enter positive-unit ratio projection
- Control deviation is not a monetary error

**Owning paths:** `scripts/pilot-sampling-v2.mjs`, `scripts/pilot-execution.mjs`.

**Evidence/context:** [AUD-530](https://standards.auasb.gov.au/node/728); [AUD-500](https://standards.auasb.gov.au/node/1012); [STAT-BINOM](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binom.html). **Original broader standard candidates:** ISA 230, 240, 330, 500, 501, 520, 530; applicable approved firm sampling methodology.

**Accountable capacities:** Audit sampling/methodology analyst + domain engineer; independent review:Independent qualified method reviewer + QA computation owner. Actual names remain unassigned; no signature is implied.

#### R-D07-02 — Research sample size and selection implementation

**Proposed implementation decision:** Retain the unbiased reproducible random selector. Add explicit size-method records; begin with approved professional sizes and a bounded exact attribute-size helper, not an unvalidated universal MUS engine.

**Original question:** What assumptions justify size, confidence and selection probabilities?

**Prerequisites:** R-D07-01. **Original work groups:** RW15 RW16 RW17 RW34 RW35. **Methods:** M04 M05 M06 M07 M08 M14 M33.

**How to implement:**

1. Keep ordered eligible IDs, frame hash, entropy, seed and selector version
2. For zero-acceptance attribute plans calculate the smallest n satisfying the declared binomial or finite-population hypergeometric bound
3. Record tolerable deviation, expected deviation rationale, sampling risk, population assumptions and independent size approval
4. For substantive/MUS sizes accept an evidenced external/manual calculation until its exact matching evaluation method has its own verified profile

**Data/record contract:** sizeMethod, populationN, tolerableRate, acceptanceCount, alpha, n, finiteModel, externalSizeEvidence, selectorVersion, entropy, seed

**Discriminating expected cases:**

- Illustrative binomial alpha .05, tolerable deviation .05, zero acceptance -> n=59
- n greater than population -> full examination or a reviewed finite model
- Rerun with identical frame and selector facts reproduces selection

**Owning paths:** `scripts/pilot-sampling-v2.mjs`, `scripts/pilot-sampling.mjs`.

**Evidence/context:** [AUD-530](https://standards.auasb.gov.au/node/728); [STAT-BINOM](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.binom.html); [STAT-HYPERGEOM](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.hypergeom.html); [VENDOR-MUS](https://help.highbond.com/helpdocs/analytics/15/en-us/Content/analytics/data_preparation/sampling_data/calculating_sample_size_for_a_monetary_unit_sample.htm). **Original broader standard candidates:** ISA 230, 240, 330, 500, 501, 520, 530; applicable approved firm sampling methodology.

**Accountable capacities:** Audit sampling/methodology analyst + domain engineer; independent review:Independent qualified method reviewer + QA computation owner. Actual names remain unassigned; no signature is implied.

#### R-D07-03 — Research projection and evaluation

**Proposed implementation decision:** Keep tested factual errors, inclusive projection and incremental residual projection separate. Sampling-risk evaluation is additional work and cannot be inferred from a point estimate.

**Original question:** How do tested specifics, sampled errors and projected residuals reach findings once?

**Prerequisites:** R-D07-02. **Original work groups:** RW15 RW16 RW17 RW34 RW35. **Methods:** M04 M05 M06 M07 M08 M14 M33.

**How to implement:**

1. Require actual tests or justified alternate procedures for every selected unit
2. Use only the approved matching evaluation method and reconcile strata, factual errors and incremental projection
3. Treat anomalies only with demonstrated evidence and retained additional work
4. Record risk allowance/evaluation, need to extend or change procedures, and reviewed findings handoff

**Data/record contract:** testedUnit, bookAmount, auditedAmount, signedError, projectionProfile, residualPopulation, inclusiveProjection, incrementalProjection, riskEvaluation

**Discriminating expected cases:**

- Population1000/sample200/error10 CU -> point projection50; additional40 plus factual10
- Separate fully tested error10 -> total60 CU without duplicate sample error
- Mixed-direction errors outside existing profile -> explicit unsupported, approved alternative required

**Owning paths:** `scripts/pilot-sampling-v2.mjs`, `scripts/pilot-completion.mjs`.

**Evidence/context:** [AUD-530](https://standards.auasb.gov.au/node/728); [AUD-450](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); DESIGN-PROJECTION. **Original broader standard candidates:** ISA 230, 240, 330, 500, 501, 520, 530; applicable approved firm sampling methodology.

**Accountable capacities:** Audit sampling/methodology analyst + domain engineer; independent review:Independent qualified method reviewer + QA computation owner. Actual names remain unassigned; no signature is implied.

#### R-D07-04 — Research substantive analytics and journal investigation

**Proposed implementation decision:** Separate preliminary/final analytics from substantive analytical procedures. Journal rules generate investigation candidates and never automatic fraud conclusions.

**Original question:** What can a rule flag, and what requires investigation?

**Prerequisites:** R-D04-01 R-D05-01. **Original work groups:** RW15 RW16 RW17 RW34 RW35. **Methods:** M04 M05 M06 M07 M08 M14 M33.

**How to implement:**

1. Freeze substantive expectation, reliable data basis, precision and threshold before comparison
2. Calculate comparable periods/ratios with explicit zero/missing denominator handling
3. Investigate differences with corroborating evidence and actual follow-up
4. Run explainable journal filters over a reconciled complete population, retain rule versions and deduplicate cases/exposure

**Data/record contract:** analyticPurpose, expectationBasis, expectation, precision, threshold, actual, difference, corroboration, journalRule/version, candidateUnit, disposition

**Discriminating expected cases:**

- Plausible management explanation without corroboration cannot close substantive deviation
- One journal triggering three rules is one investigation with three reasons
- Denominator zero -> not evaluable, never zero growth

**Owning paths:** `scripts/pilot-journals.mjs`, `scripts/pilot-execution.mjs`, `scripts/pilot-data-methods.mjs`.

**Evidence/context:** [AUD-520](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-240](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-500](https://standards.auasb.gov.au/node/1012). **Original broader standard candidates:** ISA 230, 240, 330, 500, 501, 520, 530; applicable approved firm sampling methodology.

**Accountable capacities:** Audit sampling/methodology analyst + domain engineer; independent review:Independent qualified method reviewer + QA computation owner. Actual names remain unassigned; no signature is implied.

#### R-D07-05 — Complete programme execution and native schedule parity

**Proposed implementation decision:** Make each programme step executable and attributable, with distinct scope approval, actual performance, reviewer challenge, conclusion and native export.

**Original question:** Can planned work become actual attributable, reviewable audit work?

**Prerequisites:** R-D03-02 R-D07-03 R-D07-04. **Original work groups:** RW15 RW16 RW17 RW34 RW35. **Methods:** M04 M05 M06 M07 M08 M14 M33.

**How to implement:**

1. Instantiate the source programme and every applicable procedure with reasoned tailoring
2. Record work performed, units/evidence/results and unsupported or unavailable work
3. Submit exact versions, allow reviewer return and preparer response, and clear actual notes independently
4. Carry limitations/findings into D09 and test native sampling schedules against the form contract

**Data/record contract:** programme/version, sourceProcedureKey, applicability, assignedActors, performedAt, workNarrative, results, evidence, reviewNotes, conclusion

**Discriminating expected cases:**

- Approved programme but no actual work -> incomplete
- Missing selected support cannot be replaced by an unrecorded new sample
- Reviewer returns one procedure; unrelated approved procedures remain identifiable

**Owning paths:** `scripts/pilot-execution.mjs`, `scripts/pilot-workflow.mjs`, `scripts/pilot-workpaper-export.mjs`.

**Evidence/context:** [AUD-230](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-330](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf); [AUD-530](https://standards.auasb.gov.au/node/728). **Original broader standard candidates:** ISA 230, 240, 330, 500, 501, 520, 530; applicable approved firm sampling methodology.

**Accountable capacities:** Audit sampling/methodology analyst + domain engineer; independent review:Independent qualified method reviewer + QA computation owner. Actual names remain unassigned; no signature is implied.
