# D01 research results - acceptance, independence and client intake

**As of:** 19 November 2026. **Scope:** D01 / M36 only. **State:** research/specification ready for implementation within the defined manual-review scope. Application implementation and runtime acceptance are not complete. No external professional approval is claimed.

The [resolved design](D01_Resolved_Design.md) is the implementation basis. The ten earlier questions have explicit research/design dispositions in [Decisions_Open.csv](Decisions_Open.csv); the filename is retained for link compatibility. They are not ten decisions awaiting the user.

| Task | Completed specification | Remaining product work |
| --- | --- | --- |
| R-D01-01 | [Applicability](Applicability_and_Standards.md), [primary sources](Sources.csv), verified local 2023 ethics basis and versioned audit-profile contract | Configure actual firm methodology evidence; implement profile records |
| R-D01-02 | [25-rule register](Blocker_Register.csv), [M36 tables](Decision_Tables.md), explicit manual legal conclusions | Implement fact/result persistence and affected-action guards |
| R-D01-03 | [29-step crosswalk](Source_and_Branch_Crosswalk.csv), [135-field answer contract](Question_Answer_Contract.csv), [source findings](Source_Interpretation_Findings.md), [44 acceptance cases](Acceptance_Scenarios.csv) | Implement targeted question/decision changes and run scenarios |
| R-D01-04 | [Import specification](Client_Import_Specification.md), [field dictionary](Client_Fields.csv), [schema](Client_Import_Schema.json), [examples](examples/README.md), [32 import cases](Import_Scenarios.csv) | Implement importer and run actual transactions/tests |

[Engineering handoff](AS_IS_and_Engineering_Tickets.md) preserves existing controls and identifies bounded changes. [Ten tenure-method cases](Tenure_Method_Cases.csv) define manual v1 treatment. [Workbook comparison](Workbook_Comparison.json) supports the selected working source and explicit field mappings.

## Findings resolved in this continuation

- Primary local ethics resolution/code found: 2023 resolution 23/14, with an explicit 2018 international-code reference. Newer international publications remain separately versioned comparisons.
- Local legal cross-references for related parties and gift/donation definitions retrieved.
- Credentials, local-rule interpretation, tenure conclusions, agreement validity and special dispositions have defined manual workflows. No live APIs or universal legal engine are prerequisites.
- Working workbook selected for D01; deployed fields compared and six instruction/table-label mappings identified. Historical hashes retained.
- New/continuing coverage, legacy handling, question polarity, qualified declarations and import transaction/review choices decided.

## Evidence limits and honest completion boundary

Two limits remain: historical workbook binaries were not recovered; exact ISA approval/amendment instruments were not obtained. Their effects are contained by pinned source identities, explicit mappings, versioned firm-methodology evidence and manual applicability confirmation. No unsupported claim of automatic legal compliance is made.

Engagement-specific evidence and auditor conclusions are normal product work. They are not unresolved software design questions. Independent release verification and actual test execution remain necessary after implementation.

Only D01 was worked on. Application code, original source files and other domains were unchanged by this research batch.

[Validation](D01_Validation.json) is structural/source-traceability evidence, not application runtime or professional approval. Reproduce from repository root: `node docs/delivery/research/audit-first-2026-11-19/results/D01/validate.cjs`.
