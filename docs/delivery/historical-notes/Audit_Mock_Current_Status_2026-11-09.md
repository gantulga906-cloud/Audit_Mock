# Audit Mock: current website audit

9 November 2026 · Local preview on port 3003 · Audit_Mock commit `39ae9e64a67e5de3a6b6cd4e0350c119b8a8924d`

**Verdict: useful for a stakeholder walkthrough, incomplete against the research brief and the source workflows.** The prototype accounts for the principal source populations and demonstrates selected handoffs with browser-local data. It cannot yet carry a new audit from enquiry to a defensible issued and archived file. The main risk in the demo is assuming that a form, map, status label or green readiness check proves its underlying work was done.

## What was checked

- **This pass:** read the 61-page research brief as the evaluation rubric; reopened the original ZIP and the five companion workbooks read-only; matched the ZIP and workbook hashes to the previous source inventory. Compared IDs in eight original CSV registers to the application's data, matched the 70 substantive worksheet names to the form contracts, and read specific worksheet cells for disputed dependencies. Checked the nine named flows and S01–S25 against the original screen-requirements PDF, and parsed sequence-flow endpoints in the five BPMNs.
- **Live browser:** viewed the four persona menus, assistant calendar/task list, senior Gantt, requests and the partial-receipt example, automation catalogue, and coverage screen. Followed the quality home’s team-progress link and restored the original persona and request screen. No workpaper or audit decision data was changed.
- **Implementation:** reviewed the route, workspace/editor and rule helpers. TypeScript and all 23 existing tests passed. Three additional negative-path findings below were reproduced with fresh in-memory fixtures against the shipped helpers. The earlier [release verification](../audit_mock/docs/research/implementation.md#final-release-validation) provides separate browser evidence of save/submit/return/respond/clear/review, rescheduling, sampling, request receipt and template adoption. This pass did not repeat every state-changing browser journey.
- **Limits:** this is source and frontend verification, not legal or professional compliance verification. Structural reconciliation does not imply a new semantic review of every BPMN branch, cell, ERD invariant, ontology reference, or page of the historical corpus. A category-level partial status is not an executed acceptance test.

## Reconciliation

The [current ledger](../audit_mock/docs/research/current-coverage.json) has 1,269 distinct entries. Nine service-blueprint flows and 16 process groups organize the work; they are separate from that row count. Here is what the current ledger claims, with its qualifiers intact:

| Source population | Current status |
|---|---|
| 136 feature/common-scope rows | 121 associated with partial workflows, 6 planned/reference, 8 conditional, 1 excluded (audit-owned consolidation). The 127 unconditional source rows are candidates, not release commitments. |
| 75 use cases | 69 associated with partial workflows, 3 planned intake cases, 3 conditional follow-up cases. |
| 315 acceptance criteria | 289 associated with partial workflows, 13 planned/reference, 13 conditional. No criterion-level complete acceptance sign-off is established by the ledger. Many rows share a process-level evidence note. |
| 476 E2E steps | 377 associated with partial workflows, 90 planned/reference, 9 conditional. The EN and MN lifecycle books are alternate editions of the same population, not two separate implementations. |
| 58 automation minimums | 7 bounded local demos, 51 catalogue-only. No full minimum sign-off established for the seven. |
| 58 automation extensions | All listed and unimplemented. |
| 22 area variants | All mapped; the programme editor and selected methods are shared support, not 22 fully verified owning workflows. |
| 70 forms | All have derived editors, stage counts 11 / 16 / 31 / 11 / 1. The 71st worksheet is the terminology change log. Exact layout, composite fields, workbook calculations, applicability and submit rules are not certified. The source has 272 formula cells and 1,820 validation objects; those are structural counts, not distinct business rules. |
| 25 screen groups | 22 associated with partial workflows, 2 planned, 1 conditional. These are intended page/tab/drawer groups, not 25 separate routes. |
| 5 BPMNs | All five structurally mapped; 827 sequence flows, zero unresolved endpoints in this check. The app does not execute the five graphs or prove their conditions and returns. |
| 29 decisions | All retained as open. The app uses selected assumptions; the prototype does not close the underlying model decisions. |

**Coverage screen issue:** the live coverage view reads the source registers and can display baseline labels for `581b70c`. The current v2 status and verification limits live in a separate repository ledger. A user searching inside the site cannot reliably tell which current action works, where it opens, or what remains. Put v2 disposition, owning action, role, exact evidence and remaining gap side by side.

## Role and planning status

| Role | What a person can see or do | What would make it useful in daily work |
|---|---|---|
| R1 Assistant / auditor | Personal queue, calendar, tasks, forms, requests, evidence, data and sampling; prepare a form and respond to returned review. | Make each queue item name the next action, exact work/evidence, reason, owner and due date; add item-level evidence requests and tracking. |
| R2 Senior | Review queue and inspector, Gantt, stage matrix, dependency view, dates and owner/reviewer assignment. | Live blocker/review/aging filters, date ranges, separate cross-engagement workload and reviewer capacity, and reliable metric drill-down. The Gantt uses November 2026 and a demonstration baseline; the workload uses a fixed 40-hour example. |
| R3 Partner | Acceptance, decisions, progress, selected report readiness, release history and archive. | Signed-off decisions and exact versions of terms, statements, report content and relied-upon evidence; report authorization must expire when that package changes. |
| R4 Quality | Narrower demo engagement selection and a quality queue with calendar/tasks and reporting inspection. | Case/work-specific access and an independent formal EQR lifecycle where applicable. The home still advertises team progress, which leads to a denied page for R4. The home totals are engagement-wide while its main queue is quality-specific. |

Calendar has a shared source for work deadlines and shows dated events and manual tasks in month/agenda. Calendar arrows do not change the month; timed day/week views, recurrence, free/busy and external sync are absent. Tasks mix work derived from current status and manual checkboxes. Manual completion does not perform professional clearance. The personas and record scopes are simulations: the whole model is in browser storage, with no server access enforcement.

## Process status

| Process | What works locally | Important uncovered work |
|---|---|---|
| P01 Intake | Existing fixture engagements and source references. | No two-way enquiry, contact history, unknown-period intake or handoff into authorized setup. |
| P02 Acceptance, independence, terms | Partner decision flags, 1.1.1 linked answers, acceptance gate. | Individual disclosures, clearance, exact agreed letter/terms and authoritative decision-to-activation gate. |
| P03 Setup and plan | Existing team/date assignments, timeline, baseline vs current due, calendar reflection. | New/continuing setup, current-period carry-forward, plan revisions, unscheduled work, workable staffing constraints. |
| P04 Methodology | Assigned senior can propose guidance on 1.1.1; separate publisher; explicit adoption. | No general form/schema editor, per-operation grants, semantic diff/migration, rollback tooling or commercial entitlement flow. |
| P05 Data | Narrow CSV import, quarantine/exclusion and demo reconciliation. | Raw/versioned ingestion with file lineage, TB/account mapping, bridge to statements and real ERP import. |
| P06 Risks and materiality | Risk trace and materiality arithmetic with saved inputs. | Versioned risk/response decisions, selected/approved thresholds and renewed review when relied-upon inputs change. |
| P07 Programme and sampling | Typed programme; proposal, design review and reproducible selection against a selected CSV population. | Source dependencies on approved materiality and controls reliance; linked selection-to-tests, missing evidence and exception evaluation. |
| P08 Requests and evidence | Partial receipt vs acceptance, manual counts, local files and version records. | Item/file-level assessment and follow-up, external dispatch/confirmation authentication and non-response treatment. |
| P09 Fieldwork | Programme/result/assertion/hours inputs, evidence links and an example depreciation calculation. | Each area’s actual tests, exception/escalation and conclusions, including specialists and significant matters. |
| P10 Findings and reporting | Agreed-but-unposted remains outstanding; selected gates; simulated authorization, issue and recipient outcomes. | Final TB/statements/notes and representations, supported opinion, full readiness, exact content binding, later facts and reissue. |
| P11 Review and quality | Exact workpaper revision review; return, response and reviewer clearance; selected change impacts and quality concerns. | End-to-end reliance invalidation, significant consultation and formal EQR appointment/eligibility/completion evidence. |
| P12 Archive | JSON manifest, local lock, custody offer/receipt and hold display. | Verified assembled/readable package, retrieval, integrity/recovery, amendment/relock, retention and authorized disposition. |
| P13 Follow-up | Conditional source entries. | Owning workflow only if separately mandated: management action, evidence, verification and closure. |
| P14 Capacity | Assignments and fixed-effort totals. | Actual availability/leave/credentials/competence and cross-engagement load and conflict resolution. |
| P15 Workpapers/history | Source coordinates, typed families, repeated rows, local revision and evidence snapshots. | Faithful behavior and validation by family, exact readable package, durable/concurrent versions and record-level access. |
| P16 Access/tasks/views | Four persona menus, work/task views, search and local scope-filtered export. | Consistent role links, record-level authorization/revocation, next-action reason/deadline, tested metric reconciliation. |

## Three important rule failures

1. **A changed report workpaper can still be issued under the old authorization.** In a fresh E1 fixture, align report and statement versions, set current completion review and clear the seeded note, then authorize as partner. Edit report form 4.1.A1 as its assigned owner. Workpaper revision advances from 1 to 2, but the release report version stays 1; the readiness helper reports no gaps and issue succeeds under the old authorization. This is a content-binding failure against P10-UC08-AC01/AC03. Bind authorization to the exact report workpaper revision and full statement/notes package, then reject issue until changed content is reviewed and reauthorized. See [report authorization and issue](../audit_mock/src/lib/workspace.ts#L105) and [workpaper change](../audit_mock/src/lib/workspace.ts#L52).
2. **The non-sequential acceptance example is only partly enforced.** Stage 1 sheet `1.1.1А` rows 16–18 identify the exact acceptance/continuance decision, agreed scope and letter version, and independence/ethics outcome. The editor pulls the decision and independence flag, but terms are not an exact version link and the submission gate checks only acceptance. Reproduction: set E1 acceptance to accepted, independence and terms false; with one draft answer, the assigned preparer can submit 1.1.1. Drafting should stay available; explicitly define which unresolved facts stop submission versus engagement activation, and test each boundary. See [readiness and submission](../audit_mock/src/lib/workspace.ts#L59) and [linked answers](../audit_mock/src/components/workpaper-editor.tsx#L16).
3. **Sampling can run without required upstream evidence.** Stage 3 sheet `3.3.1А!A24,K24,A28,K28` calls for approved performance materiality/version from 1.3 and planned controls reliance/evidence from 2.6. The editor shows a calculation link and the graph shows the relationships. The sample stamp uses dataset, size, seed and design version. Reproduction: review a design, clear the 1.3 inputs, then run AUTO-047; it returns three selections. Carry the selected upstream records and revisions into the design, show missing/unknown conditions and invalidate review when a relied-on input changes. See [design stamp and review](../audit_mock/src/lib/workspace.ts#L95).

The repository lists 20 curated reference relationships: seven direct source references and 13 with proposed/conditional form associations. Do not make all of them hard gates. For each, choose whether it is a reference, reused answer, warning, action prerequisite or review invalidation. Historical numeric mentions are not dependencies by default.

## Automations and competitive research

The seven runnable demos are AUTO-003 import reconciliation, AUTO-028 one-asset straight-line depreciation, AUTO-046 materiality arithmetic, AUTO-047 seeded sampling, AUTO-048 unposted misstatement summary, AUTO-056 selected release readiness and AUTO-058 archive diagnostics. Some retain inputs, result rows, exceptions, failures and freshness. These are explicit partial methods; e.g. import totals derived from the same parsed rows cannot attest to completeness of a client source. The other 51 have source descriptions but no runner. No engine should substitute its result for an auditor decision.

[Audit-product research](../audit_mock/docs/research/audit-products.md) records ten audit product families (six platforms and four specialists) and 16 pattern cards. [External research](../audit_mock/docs/research/external-products.md) records eight products and 20 cards. The [design spec](../audit_mock/docs/research/design-spec.md#selected-pattern-to-screen-matrix) selects eight audit and four external patterns and describes nine flows, role menus and connected wireframes. Audit-derived workpaper indexing, explicit review states and version/context, and the external inspector and shared scheduling ideas are recognizable in the mock. The evidence is mainly official public help and text reconstructions. The separate two-tool adjacent scheduling/practice comparison is not clearly delivered as its own track; Asana and Google Calendar/Tasks are documented in the eight-product track. Native workbook thumbnails, criterion-by-criterion execution evidence, and before/after usability measurements are not established by the delivered research.

## Recommended next release

1. **Prove one continuous multi-role journey.** Start from a partly complete intake; record actual independence/terms and activate; assign and schedule work; receive evidence; prepare and return an exact revision; clear and review it; create a finding; block then authorize an exact package; hand the issued file to custody. Carry the same record IDs through the queues, Gantt, calendar and screens. Include the denied, stale and partial cases above as acceptance checks.
2. **Make the senior plan and personal queues operational.** Add navigable date windows, actual review/blocked status and reason, owner and overdue filters, work outside the plotted window, useful reviewer workload, and drill-down counts that match their rows. Remove role dead ends. Keep a schedule edit separate from work/review history.
3. **Deepen specific forms and methods before widening the catalogue.** Validate 1.1.1/1.4, 1.3/2.6/3.3.1, one fieldwork programme, findings/reporting and archive with methodology owners. Show per-criterion results and explicit unsupported states in the site. Keep ordinary settings and the one-form permission bounded; charge or scope semantic form changes separately, with validation and migration as part of the work.

Source originals were read without edits. No application changes, publication, or deployment were made during this audit.
