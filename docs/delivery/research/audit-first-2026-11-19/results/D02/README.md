# D02 results — engagement staffing, capacity and specialists

**As of:** 19 November 2026. **Scope:** D02; M35 and the D02 part of M36. **Result:** research and implementation specification complete. Application changes are the next work, not unfinished research. No practitioner signature or production acceptance is fabricated.

The method is requirements engineering with standards traceability. The user's standing choices resolve ordinary product policy: multiple named assignees, senior reassignment, cross-engagement capacity, manual credential verification and controlled specialist sharing.

| Work package | Completed result | Engineering entry point |
| --- | --- | --- |
| R-D02-01 | [Assignment/authority contract](Assignment_and_Authority_Contract.md), including multiple preparers/reviewers, EQR separation, transfer, queues and retained authorship | D02-E01/E02 |
| R-D02-02 | [M35 method](Capacity_Method_M35.md), [input schema](M35_Input_Schema.json), [worked examples](M35_Fixtures.json), executable reference calculation and independently stated expected values | D02-E03/E04 |
| R-D02-03 | [Credentials](Credentials_and_Specialists.md), explicit verification/validity/competence states and local reserved-role treatment | D02-E05 |
| R-D02-04 | [Contributor classification](Credentials_and_Specialists.md), agreement/evaluation checklist and [file/manual-sharing contract](Specialist_Access_Contract.md) | D02-E06/E07 |

[Resolved decisions](Decisions.csv) contain a disposition for each research question, including contrary cases. [Source interpretation](Source_Interpretation_and_Standards.md), [authority matrix](Sources_and_Standards.csv), [source-step crosswalk](Source_Step_Crosswalk.csv), [form contract](Question_Contract.csv) and [acceptance cases](Acceptance_Scenarios.csv) provide the evidence chain. [Engineering handoff](AS_IS_and_Engineering_Tickets.md) distinguishes existing behavior from the required changes.

The [connected worked case](Connected_Worked_Case.md) combines multiple named preparers/reviewers, two engagements, capacity alternatives, transfer during review, unchanged historical actuals and a lawyer's manual evidence packet. [M36 transition rules](M36_Transition_Table.csv) specify allowed, denied, missing and changed-source outcomes.

## Completion boundary

No D02 design question is left for the user merely because reading or ordinary specification work was unfinished. Per-engagement competence, ethical threats, legally reserved authority and expert-work adequacy are **defined human decisions supported by the product**. They are not a backlog of unanswered design questions. Portal sign-in is optional; the documented secure manual route is required and sufficient for v1 participation. No live issuer integration is required.

The accepted workbook and Mongolian ISA 2020 compilation with integrated ISQM 1/2 and revised ISA 220 are carried forward from [D01's baseline decision](../D01/Baseline_Decision.json). They are settled. Subsequent international publications are not silently substituted.

Reproduce research checks from the repository root:

```text
node docs/delivery/research/audit-first-2026-11-19/results/D02/validate.cjs
```

[D02_Validation.json](D02_Validation.json) records what was actually checked. Research completion does not claim the many-person model, new capacity engine or specialist portal is already implemented. Only D02 was advanced; source files, application code and D01/D03–D13 results are unchanged.
