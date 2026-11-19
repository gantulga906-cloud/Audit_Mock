# D01 research results - acceptance, independence and client intake

**As of:** 19 November 2026. **Scope:** D01 / M36 only. **Baseline:** repository commit `13322c8a6aaa3d0a4ebda56ba94086da62545712`. **Status:** research and specification drafted; professional approval and application implementation not performed.

The established methods used here are requirements traceability, standards applicability analysis and decision-table testing. A completed template is evidence of work; it is not, by itself, an acceptance decision.

| Task | Delivered evidence | Current gate |
| --- | --- | --- |
| R-D01-01 | [Applicability and standards](Applicability_and_Standards.md), [sources](Sources.csv) | Local edition/adoption instruments and firm approvals remain open |
| R-D01-02 | [Rule register](Blocker_Register.csv), [M36 decision tables](Decision_Tables.md) | Legal facts and interpretations require authorized review before rule activation |
| R-D01-03 | [29-step crosswalk](Source_and_Branch_Crosswalk.csv), [source findings](Source_Interpretation_Findings.md), [acceptance scenarios](Acceptance_Scenarios.csv) | Source edition selection and methodology approval remain open |
| R-D01-04 | [Import specification](Client_Import_Specification.md), [field dictionary](Client_Fields.csv), [JSON schema](Client_Import_Schema.json), [examples](examples/README.md) | Ready for product/engineering review; no importer implemented |

[Engineering handoff](AS_IS_and_Engineering_Tickets.md) identifies existing controls and bounded changes. [Open decisions](Decisions_Open.csv) identifies the responsible role, evidence needed and affected action. [Validation](D01_Validation.json) records structural checks, not professional approval or runtime test results.

Reproduce structural checks from the repository root: `node docs/delivery/research/audit-first-2026-11-19/results/D01/validate.cjs`.

## Findings that affect the design

- Mongolia's firm-tenure rule has an entity exception. Do not apply an unconditional five-year rule to every client or confuse it with individual partner rotation.
- The current Mongolian text of article 9.5 covers tax/accounting consultancy. An older official-hosted English translation still includes valuation; it cannot determine today's local rule.
- Several source questions use negative assertions, check-performed wording or broad service labels. A single Yes/No scoring convention would reverse some answers or invent prohibitions.
- The expert declaration's five-year employment statement is source wording requiring a policy decision, not an established universal ISA/IESBA prohibition.
- Existing code already supports firm-level enquiries, acceptance review, nonactivating conditional decisions, signed-term evidence and stale-decision checks. D01 needs targeted changes rather than replacement.
- The inspected Stage 1 workbook has a different binary hash from both previously recorded variants. Preserve all versions and choose an authoritative source before promoting extracted questions.

## Delivery boundary

No D02-D13 research was executed by this result pack. References to staff, specialists, finance and later audit work identify D01 inputs or handoffs only. No application code, master source files, live client records, external services, messages, merges or deployment were changed.

Research drafting is complete for the four D01 tasks. Their approval gates remain open because source selection, local adoption evidence and named professional decisions cannot be supplied by a document generator.
