# Start here: Audit_Mock implementation handbooks

Guide INDEX | Version 1.0 | 16 November 2026

Code baseline: local 079f9da47a02eab681feeeda3de3dfb8cfc42848, redesign/enterprise-workspace. Source edition: October 26 archive plus registered November 11 repaired-workbook inventory, with November 16 freshness observations separately retained. Documentation only; application and source files, live data and GitHub branches remain unchanged.

## What this package does

These guides reconcile the audit source requirements with the newer local implementation and the original 25-package/128-task plan. They tell a developer what work is supported now, what must be added, what source decisions remain open and what evidence is needed to accept it. They preserve working functions and unfinished scope. They do not claim a completed production audit platform or independently approved methodology.

Start with the complete PILOT for materiality -> sampling -> findings, then G00 shared contracts and the domain you will implement. G08 controls forms across domains; G09 controls access/operations/acceptance; G10 covers each of the 22 variants; G11 retains all 58 minimum automation methods and expected source examples. Each guide has a matching editable Markdown master and navigable PDF.

## Read by the work you are doing

- [Materiality, sampling and findings pilot](pdf/PILOT_Materiality_Sampling_Findings.pdf) - actual threshold behavior, source coordinates, current commands, FG-01 and the signed-difference/projection issue.
- [G00 - System foundations and shared contracts](pdf/G00_System_foundations_and_shared_contracts.pdf) ([editable master](masters/G00_System_foundations_and_shared_contracts.md)).
- [G01 - Client acceptance, independence and terms](pdf/G01_Client_acceptance_independence_and_terms.pdf) ([editable master](masters/G01_Client_acceptance_independence_and_terms.md)).
- [G02 - Staffing, planning, risk, controls and materiality](pdf/G02_Staffing_planning_risk_controls_and_materiality.pdf) ([editable master](masters/G02_Staffing_planning_risk_controls_and_materiality.md)).
- [G03 - Data, evidence, requests and confirmations](pdf/G03_Data_evidence_requests_and_confirmations.pdf) ([editable master](masters/G03_Data_evidence_requests_and_confirmations.md)).
- [G04 - Programmes, sampling and fieldwork execution](pdf/G04_Programmes_sampling_and_fieldwork_execution.pdf) ([editable master](masters/G04_Programmes_sampling_and_fieldwork_execution.md)).
- [G05 - Findings, completion, consultation and quality](pdf/G05_Findings_completion_consultation_and_quality.pdf) ([editable master](masters/G05_Findings_completion_consultation_and_quality.md)).
- [G06 - Opinion, report preparation and controlled issue](pdf/G06_Opinion_report_preparation_and_controlled_issue.pdf) ([editable master](masters/G06_Opinion_report_preparation_and_controlled_issue.md)).
- [G07 - Assembly, custody, retention and later facts](pdf/G07_Assembly_custody_retention_and_later_facts.pdf) ([editable master](masters/G07_Assembly_custody_retention_and_later_facts.md)).
- [G08 - Source forms and controlled methodology](pdf/G08_Source_forms_and_controlled_methodology.pdf) ([editable master](masters/G08_Source_forms_and_controlled_methodology.md)).
- [G09 - Access, operations and release acceptance](pdf/G09_Access_operations_and_release_acceptance.pdf) ([editable master](masters/G09_Access_operations_and_release_acceptance.md)).
- [G10 - Fieldwork area implementation cards](pdf/G10_Fieldwork_area_implementation_cards.pdf) ([editable master](masters/G10_Fieldwork_area_implementation_cards.md)).
- [G11 - Automation minimum methods and expected examples](pdf/G11_Automation_minimum_methods_and_expected_examples.pdf) ([editable master](masters/G11_Automation_minimum_methods_and_expected_examples.md)).

## Current state and next sequence

GitHub main remains 69f0548; open draft PR 6 is wave-0-audit-controls at 937e692, sixteen commits ahead of main. The newer local workspace at 079f9da includes report/assembly, structured materiality and controlled adoption. These additions are local, not merged into main.

Recorded local evidence has 69 passing tests, six connected reference cycles A08/A11/A25/A26/A27/A28, 60 directly demonstrated steps and 66 criteria. Independent source acceptance is empty; releaseReady=false. These are prior application results; this documentation session adds source/hash/count/ref, arithmetic and PDF checks, not another application test run.

Next: finish F2 form fidelity/structured controls/exports/import preview/programme loss acknowledgement, with early F3 identity/source-contract decisions. Then F3 shared facts/people, F4 acceptance/planning, F5 data/evidence, F6 unbiased sampling/projection and commercial/assets, F7 statutory/finance/technical breadth, F8 completion/opinion/quality/later facts and F9 operational release. R23 runs throughout. FG-01 can be pulled forward once its signed-error/aggregation/method decisions are approved. Conditional wider streams remain separately mandated.

## Use the registers during development

- requirement_traceability.csv/json: all 2,247 verifier rows, exact original scope/status/hash/evidence plus guide disposition. Mapping is not completion; 1,012 BPMN rows still need exact stage-owner semantics.
- form_fidelity, fieldwork_variants and automation_methods: all 70 forms, 22 variants and 58 minima with explicit gaps/limits. The 58 future extensions stay pending.
- task_to_guide and original_backlog_preserved: all 128 original task IDs/descriptions/statuses plus recommended sequence. No fake closure.
- domain_lifecycle_map, acceptance_register and criterion_acceptance: all 51 lifecycle inventories, persisted scenario designs and all 315 criteria; actual prior evidence stays separate.
- data_ownership_staleness, dependencies and role_action_runtime/source: shared contracts, all 20 confirmed references and actual/source role distinctions.
- future_development_compatibility and open_decisions: preservation/adaptation/conflicts and the 29 original plus eight handbook clarifications.
- source_edition_registered, nested_source_members, current_workbook_observations, external_research and evidence_ledger: identities, editions, provenance and access limits.
- [Data dictionary](DATA_DICTIONARY.md) explains each register. JSON retains nested values losslessly; CSV uses UTF-8 with BOM and serializes nested arrays/objects as JSON cells.

## Important limits and decisions

Stage 2/3 workbook binaries changed externally; effective validation comparison is preserved, but the exact registered Stage 2 whole-content baseline is unavailable. Current workbook inventory has 987 validation definitions; registered inventory has 1,820; 272 formulas are row numbering. No source edition is silently replaced.

Resolve signed sampling differences versus current nonnegative findings exposure before ratio projection; approve the unbiased reproducible method; finish dedicated programme loss acknowledgement; choose named identities/deployment/external adapters; confirm applicable local professional/legal editions and retention anchors; obtain independent source/guide acceptance. No universal percentages, sample-size formula, tax rates, report wording or retention defaults are installed by these guides.

Official 2026 standard publication/effective-date metadata was checked, selected 2025 auditing passages were inspected, and official IFRS/IFAC/OWASP/SQLite context was used where relevant. Direct legal full-text pages returned 403. Ten recent turns of Assess traditional coding tradeoffs were read; no whole-chat or full historical-corpus review is claimed. Practicing-auditor usability/methodology approval remains open.

## How to start a development batch

1. Read G00 and the selected domain; pin actual source/code versions and identify the concrete implementation delta.
2. Use exact source rows, method/card and task IDs; preserve the contracts in the compatibility register.
3. Extend the owning shared records/commands and add independent expected examples in disposable persisted scenarios.
4. Prove normal/exception/missing/unauthorized/change/recovery behavior and preserve earlier bytes/answers/signatures.
5. Record technical evidence, then obtain a separate accountable source decision. Keep unaccepted/unsupported scope visible.

## Glossary

Source requirement: original product obligation. Current code: inspected behavior at the pinned local ref. Recorded fixture: previous engineering execution within a stated profile. Proposed: a documented next behavior requiring implementation/decision. Independent acceptance: a separate attributable decision against exact source and proof. Бэлтгэгч / Ахлах хянагч / Партнер: preparer / reviewer / partner; the quality and custodian roles have separate responsibilities.
