# Audit-first research and implementation execution pack

> **Current complete result (19 November 2026):** [Researched whole-scope implementation design](results/FULL/FULL_RESEARCH_AND_EXECUTION_PLAN.md) now supplies all60 task designs,36 methods,22 variants,58 minimums,20 dependencies,70 form contracts and the full B00-B14 plan. Earlier PLANNED registers below remain the historical assignment baseline; current design and actual implementation/acceptance states are separate.

**As of:** 19 November 2026. **Status:** Research plan prepared; detailed methodology/legal research, implementation changes and independent professional acceptance remain open. **Baseline:** supplied planning branch at ffdf647b2851a4d0239d4766ae0d162c281ea41e, over recorded G01–G11. **Method:** requirements engineering + standards traceability + method validation.

[Parent audit-first plan](../../Audit_Mock_Audit_First_Reprioritized_Plan_2026-11-19.md) retains product scope and execution order. This pack makes its research work concrete: **13 domain plans, 60 domain tasks, 36 calculation/rule research packs, all 22 original fieldwork variants, all 58 original automation minimums, all 20 confirmed dependencies, 30 source records and 12 accountable open decisions.** Counts describe planned research artifacts, not completion. Source-register entries distinguish retrieved overviews/national guidance from inaccessible legal text; they are not 30 full-standard validations.

## Start here

1. Read [mandatory research protocol](Research_Protocol.md), then assign actual task owners and independent reviewers in [Research_Tasks.csv](registers/Research_Tasks.csv).
2. Resolve applicability and source editions for the first bounded slice using D01/D03 tasks. Use [source register](Source_Register.md) and [open decision register](Decision_Register.md); obtain full applicable standard/law paragraphs before approving rules.
3. Run domain research and linked [method packs](Calculation_and_Method_Research_Plan.md) together. Use [fieldwork plan](Fieldwork_Research_Plan.md), [automation plan](Automation_Research_Plan.md) and [20-edge dependency register](registers/Dependency_Research.csv) for exact item-specific questions.
4. Produce approved source/standard interpretation, method specification, independently expected examples and the [implementation ticket](templates/Capability_Ticket_Template.md). Only then mark that ticket READY. Use existing G01–G11 owners and records.
5. Implement and verify one complete vertical slice, then obtain actual practitioner acceptance. Continue the remaining source research alongside approved slices; no need to finish every method before beginning bounded work.

## Dedicated domain research plans

| Domain | Research plan | Original RW groups | Domain tasks / methods |
| --- | --- | --- | --- |
| D01 | [Client acceptance and independence](domains/D01_Research_Plan.md) | RW02 RW06 RW07 RW10 RW34 RW35 | 4; M36 |
| D02 | [Team allocation, capacity and external specialists](domains/D02_Research_Plan.md) | RW08 RW09 RW13 RW31 RW33 | 4; M35 M36 |
| D03 | [Form fidelity, Excel, exports and cross-form dependencies](domains/D03_Research_Plan.md) | RW01 RW02 RW03 RW04 RW05 RW39 | 5; M01 M02 M36 |
| D04 | [Risk assessment, controls, planning and materiality](domains/D04_Research_Plan.md) | RW02 RW06 RW09 RW11 RW19 RW35 | 4; M03 M07 M36 |
| D05 | [Data intake, ledger mappings and accounting infrastructure](domains/D05_Research_Plan.md) | RW04 RW05 RW12 RW18 RW20 RW32 RW40 | 5; M01 M02 M22 M30 |
| D06 | [Evidence, files and confirmations](domains/D06_Research_Plan.md) | RW08 RW13 RW14 RW26 | 4; M01 M09 M13 M36 |
| D07 | [Audit programmes, sampling, analytics and execution](domains/D07_Research_Plan.md) | RW15 RW16 RW17 RW34 RW35 | 5; M04 M05 M06 M07 M08 M14 M33 |
| D08 | [Fieldwork areas and all original automation minimums](domains/D08_Research_Plan.md) | RW17 RW18 RW19 RW20 RW21 RW34 RW36 RW37 | 5; M09 M10 M11 M12 M13 M14 M15 M16 M17 M18 M19 M20 M21 M22 M23 M24 M25 M26 M27 M28 M29 M30 M31 M32 M33 M34 M36 |
| D09 | [Findings, correction and audit completion](domains/D09_Research_Plan.md) | RW21 RW22 RW23 RW34 RW35 | 5; M22 M24 M25 M28 M31 M32 M33 M34 |
| D10 | [Role configuration, review and quality management](domains/D10_Research_Plan.md) | RW08 RW09 RW24 RW31 RW33 | 5; M36 |
| D11 | [Opinions, report templates and issuance](domains/D11_Research_Plan.md) | RW23 RW24 RW25 RW26 RW27 RW35 | 4; M33 M34 M36 |
| D12 | [Later facts, assembly, retention, custody and inspection](domains/D12_Research_Plan.md) | RW27 RW28 RW29 RW30 RW32 RW33 | 5; M34 M36 |
| D13 | [UI, ERD, operational validation and release](domains/D13_Research_Plan.md) | RW31 RW32 RW33 RW34 RW35 RW36 RW39 RW40 | 5; M01 M02 M35 M36 |

## First execution queue and dependency gates

All items remain PLANNED; role suggestions are not named assignments. Start in the following order by dependency, not invented dates. Within a band, independent work can proceed concurrently using actual available people.

| Order | Concrete work | Tasks / output | Gate and next use |
| --- | --- | --- | --- |
| 0 | Pin original source and applicability for selected first slice | R-D01-01; R-D03-01; R-D08-01; authoritative source/applicability rows | Source discrepancies and local adoption issues bounded; unrelated drafting continues |
| 1 | Define import/family/permission facts needed for revenue slice | R-D05-01; R-D03-02; R-D02-01; R-D10-01; R-D06-01 | Accepted input grain, semantic form fields, actor authority and evidence states |
| 2 | Approve planning/materiality and revenue methods | R-D04-01/02/03; R-D05-03; R-D08-02/03; M01/02/03/09/10/11/24/33/36 as applicable | Full applicable clauses, firm elections and independent worked cases; conditional methods need explicit scope |
| 3 | Approve sample/evidence/confirmation path if used | R-D07-01/02/03/04/05; R-D06-02; M04/05/06/07/08 | Method-specific prerequisites and no unsupported statistical/confidence claim |
| 4 | Prepare and execute revenue/cut-off/receivables → finding → completion → report consequence | R-D08-04; R-D09-01/02/05; R-D11-01; each affected DEP-C from R-D03-04 | Actual current source data/result/review/export and independent practitioner acceptance |
| 5 | Replicate approved patterns through remaining areas and all minima | R-D08-05; 22-area and 58-minimum individual registers | Each source item has its own applicable procedure and method/evidence disposition |
| 6 | Close report/later facts/quality/operating and global coverage | D09–D13; RW mapping retained in parent plan | Exact build/source/method acceptance, operational evidence and required release blockers resolved |

Task CSV lists explicit prerequisites; the sequence above is a practical starting queue, not a replacement for dependency checks. An affected ticket can proceed under a signed bounded assumption where professional authority permits; an unresolved nonwaivable blocker cannot be assumed away.

## Standards mandate and verified changes shaping the plan

- **[high]** Read applicable full ISA/ISQM/IESBA and IFRS/IAS/interpretation or selected SME texts in every relevant domain/method. Official landing pages are orientation, not paragraph-level approval. [SRC-01/02/09](Source_Register.md).
- **[high]** Official issuer pages give 15 December 2026 period-start effectiveness for revised ISA 240/570; IFRS 18 and the 2025 SME edition have 1 January 2027 period-start effectiveness with early application permitted. Preserve old/new profiles and check local adoption. [SRC-07/08/24/25](Source_Register.md).
- **[med, reported]** IFAC's Mongolia/MonICPA profiles report ISA 2020 application and do not confirm adoption of later ISA revisions; reported quality-management adoption differs. Obtain standard-specific local instruments; do not equate international publication with mandatory local adoption. These profiles share evidence origin. [SRC-03/04](Source_Register.md).
- **[high]** Retrieved ISA 330/500/520 consultation is proposal-stage, not an enacted method mandate. [SRC-26](Source_Register.md).
- **[unverified]** Mongolian primary legal texts returned access errors. No local legal blocker, tax rate, retention period or statutory interpretation is certified here. [SRC-05/06](Source_Register.md).

## Required outputs and review responsibilities

| Output | Accountable role to assign | Independent check |
| --- | --- | --- |
| Source/edition and standards applicability matrix | BA + methodology lead | Practicing auditor; local legal/adoption authority where needed |
| Exact paragraph/source-procedure trace | Domain analyst | Source-familiar professional reviewer |
| Method spec + independent expected examples | Accounting/audit methodology analyst | Separate numerical/statistical checker and professional policy approver |
| Capability design/ticket + implemented delta | Owning domain engineer/BA | QA verifies expected behavior, authority, change/history/export |
| Actual source-user acceptance | Authorized practicing auditor | Identity, scope and build/source/method versions recorded |
| Production/provider handoff | Operating/integration owner | Actual selected workload/recovery/access/provider effects verified |

Research reports are stored alongside this pack when produced, with actual evidence and status changes. Templates are empty where decisions or signatures are not yet available. Passing the pack validator proves structural consistency only. Existing requirement statuses, historical evidence, source bytes, runtime data and releaseReady remain unchanged.

## Mapping every section of the parent plan

| Parent section | Research execution coverage |
| --- | --- |
| 1 Delivery contract | Protocol gates; D01 applicability; D13 original-ID/source acceptance |
| 2 Priority bands | First execution queue; each task priority and prerequisites; HOLD boundaries |
| 3 Architecture guardrails | D03 semantic contracts; D05/M01–M36 bounded methods; D10 access/SoD; D13 runtime mapping |
| 4 D01–D13 | Thirteen dedicated linked domain plans and 60 explicit work packages |
| 5 Waves W0–W7 | Research READY gates integrated with each vertical slice; queue and operational handoff |
| 6 RW01–RW40 | Parent's complete mapping preserved; per-task RW links; mixed children dispositioned individually |
| 7 Definition of done | Full paragraph/source trace, independent expected cases and distinct G-E/G-A/G-O evidence |
| 8 Standards watchlist | Source register statuses, adoption gaps and exact edition/effective-date research |
| 9 Immediate tasks | Dependency-based concrete queue and ticket templates |
| 10 Open decisions | Twelve decision records with evidence needed, owner role and affected-task boundary |

**Outstanding:** full paragraph-level research, authoritative local adoption/law, real named owners/independent reviewers and professional/operational acceptance. Best next work: R-D01-01 + R-D03-01, then approve one complete revenue slice's contracts/methods and independent examples.
