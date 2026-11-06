# Audit workspace: connected product design specification

Prepared 6 November 2026. This is an authored design proposal informed by the supplied source package and the working-tree domain model in [workspace.ts](../../src/lib/workspace.ts). Source inspection establishes what a helper or record currently expresses; it does not establish a passed browser scenario, production access control, professional compliance or complete source coverage. The implementation and verification record must supply that evidence separately.

Audit software is the primary workflow and interface benchmark. [Audit product research](audit-products.md) and [audit pattern cards](audit-patterns.json) provide the first research track. [External product research](external-products.md) and [external pattern cards](external-patterns.json) provide secondary interaction refinements. These sources are documented public behavior, not private-product execution tests. All text wireframes here are original audit proposals, not vendor screenshots.

## Product decision

Build one engagement work system with several useful projections: personal next action, senior delivery/review, authorized partner decisions, scoped quality work, timeline, calendar, tasks and the owning audit workspaces. A deadline edited in one view must refer to the same work item in every other view. A view change must not manufacture an audit result, grant access or reinterpret a historical approval.

The daily senior workspace should default to a queue plus a contextual work inspector. A Plan/Progress tab supplies the timeline, milestones, unscheduled work and allocation detail. The queue answers what needs substantive attention now; the timeline explains delivery and allocation. Both open the exact owning work and preserve client, period, reference and version.

Keep broad coverage and implementation depth separate. Account for all current source items, then identify whether an item is only mapped, illustrated, locally interactive, verified in the frontend, dependent on a service, conditional, excluded or unresolved. A catalogue of 70 forms does not establish 70 faithful typed editors or all associated business actions.

## Evidence and status vocabulary

| Label | Meaning and evidence needed |
|---|---|
| Source-mapped | A requirement/case/form is linked to a screen and proposed action. Mapping is not implementation. |
| Static illustration | The screen shows a realistic state but the relevant action does not execute. |
| Local rule implemented | Source code expresses a behavior against browser fixtures; browser wiring still needs inspection. |
| Interactive local simulation | A user can execute the connected behavior locally with fictional data. |
| Verified frontend behavior | A named scenario was executed against the actual UI or meaningful domain test, with its result recorded. |
| Partial | The working subset and its uncovered behavior are both named. |
| Backend/service required | Durable files, concurrent users, identity enforcement, real dispatch or other external execution is not present. |
| Conditional/excluded/unresolved | Preserve the original source disposition or explicit decision; never silently count it as delivered. |

The coverage baseline commit in the machine-readable ledger identifies the earlier prototype, not proof of the expanded working tree. Refresh the shipped-status evidence only after the new UI and tests are complete. Use [coverage-ledger.json](coverage-ledger.json), [coverage-matrix.csv](coverage-matrix.csv), [source-manifest.json](source-manifest.json) and [source-form-findings.json](source-form-findings.json) for the detailed source populations and locators.

## Service blueprint: nine connected flows

These are reusable journey groups, not a universal sequential wizard. Planning, evidence receipt and selected execution can develop in parallel when their actual prerequisites permit it. Review is continuous. Follow-up requires its own mandate.

| Flow | Actor and useful entry | App work and retained output | Next consumer and normal return | Source process/screen connection |
|---|---|---|---|---|
| F01 Intake and acceptance | R1 records a client- or firm-initiated enquiry, including unknown facts. Actual declarants supply independence responses. | Known client/contact facts; enquiry; assessment; declaration; concerns; decision; exact terms/agreement. Keep receipt and clearance distinct. | R2 returns named gaps; authorized R3 accepts, defers, declines or records permitted conditions. A declined/pending enquiry is not active audit work. | P01-P02; S02-S03. Pre-engagement persistence D01 remains a distinct modeling need. |
| F02 Authorized setup and planning | R1 opens the authorized period; R2 assigns work; R3 agrees significant scope/resource changes. | Engagement profile, assigned capacity/reviewer, milestones, baseline/current dates, estimates and selected methodology version. | Assignments populate personal tasks and calendar. Capacity/access gaps return to the responsible planner; prior-year structure needs current confirmation. | P03-P04/P14; S04-S06/S24-S25. |
| F03 Data to usable populations | R1 receives an actual structured package and chooses its import context. | Raw source/version, column profile, accepted/quarantined/excluded rows, count/value bridge, mapping and selected usable population. | R2 challenges fitness or differences. A replacement retains old lineage and identifies affected work. Matching arithmetic alone does not prove source completeness. | P05/P07/P15; S08/S12/S16/S19. |
| F04 Iterative audit execution | R1 documents understanding, assesses proposed risks/responses and performs assigned work. Other contributors supply bounded outputs. | Risks/assertions, selected materiality, tailored procedures, population/sample, evidence use, actual results, exceptions and proposed conclusion. | R2 returns support gaps or directs expanded work. New information can return to planning and change affected responses. | P06-P09; S09-S15 with shared S07/S16. |
| F05 Preparation and review loop | R1 submits an exact revision; its assigned reviewer opens it. | Submission snapshot, anchored note, preparer response, reviewer clearance/return and review decision with actor/capacity/version. | Returned work appears for its named preparer. A response does not clear; changed content preserves old review and needs impact assessment. | P11/P15/P16; S07/S19-S21. |
| F06 Final evaluation and reporting | Findings and actual corrections feed final statements, representations and significant judgments. | Remaining misstatements, final package version, supported opinion, report sections, authorization, actual issue and recipient outcomes. | Partner resolves a wrong package binding or outstanding requirement. Failed distribution remains partial; later facts use their timing-specific response. | P10/P11; S17-S21. |
| F07 Final file and custody | R1 assembles; authorized approver locks; custodian receives the actual package. | Manifest/diagnostics, controlled lock, readable package, offered/accepted custody, retrieval and amendment history, hold/retention/disposition decisions. | Missing content returns to its owner; an amendment preserves the original and needs re-lock. Elapsed time alone does not authorize deletion. | P12/P15; S22. |
| F08 Firm support and governed access | Additional methodology, people, access or custody authority acts within its grant. | Published releases, suitability/capacity facts, work assignment, resource grants and revocation history. | Engagement users receive only the adopted content/actual access; support authority does not create professional audit approval powers. | P04/P14/P16; S05-S06/S24-S25. |
| F09 Agreed follow-up | An actual mandate identifies action, owner and verification responsibility. | Management progress, supporting evidence, auditor verification/retest, extension/escalation and supported closure. | Unverified implementation returns for evidence; significant overdue actions reach the assigned decision owner. It is not automatic audit step 22. | P13; S23, conditional. |

### Sixteen process responsibilities and progressive depth

The “working-tree support” column is a source-level observation of schema2, not a statement that every UI action is wired or tested. It must be reconciled with the finished prototype's implementation record.

| Process | Owning user goal and representation | Working-tree support at inspection | Next depth / important boundary |
|---|---|---|---|
| P01 Client/intake | Keep shared identity/contact facts separate from an incomplete enquiry and current-period assessment. | `Engagement` includes a pending acceptance state and three fixture clients; no independent enquiry entity is declared. | Add meaningful pre-engagement persistence before claiming full two-way intake. Do not force an unknown period into an invented active engagement. |
| P02 Acceptance/terms | Assess, obtain actual declarations, review concerns, decide, agree exact terms. | Acceptance enum plus `termsAgreed`/`independence` booleans can demonstrate readiness. | Declaration/person/version, concern treatment and exact terms agreement need richer records; a Boolean is not their full evidence contract. |
| P03 Setup/team/plan | Own work, reviewer, timetable, effort and current-period setup. | `WorkItem` schedule, baseline, owner/reviewer, estimate/actual, `reschedule` and `reassign`. | Preserve plan change reasons/baseline history, explicit unscheduled dates and operational resource suitability. Changing a plan must not edit historical event dates. |
| P04 Methodology | Draft, publish, instantiate and explicitly adopt controlled content. | `library` has draft/review/published phase, releases and per-engagement adopted versions. | The single bounded example is not a complete multi-template schema designer or migration engine. Authoring, publication and adoption remain separate grants. |
| P05 Data | Import and reconcile a selected dataset before downstream use. | `Dataset`, `DataRow`, constrained CSV parser and AUTO-003 bridge. | The parser is a 2025 fixture contract, not arbitrary Excel/ERP ingestion. Raw binary preservation, import-profile versions and full account mappings are deeper work. |
| P06 Planning/risk/materiality | Explain risks, assertions, planned responses and selected thresholds. | `Risk` links to forms; `materiality` computes overall/performance/trivial values from user parameters. | Professional risk/threshold selection and review need actual rationale and versioned decisions. Current risk links are a trace illustration, not a complete methodology engine. |
| P07 Programme/sampling | Tailor work, prepare/review design, actually select and evaluate. | Sample size/seed/designVersion/reviewedVersion/selected IDs and reproducible selection. | Design review is distinct from selection. Bind selection to exact population/method and actual execution event; full error projection/evaluation remains separate. |
| P08 Requests/evidence/confirmations | Receive progressively, evaluate support and control external confirmation cases. | `RequestItem`, evidence IDs/versions/status/anchors, fixture requests and manual histories. | Request counts are not evidence sufficiency. External confirmation dispatch/authenticity/non-response treatment requires a dedicated case contract or honest manually recorded simulation. |
| P09 Fieldwork/matters | Perform controls/details/analytics and significant matter work appropriate to the area. | Source forms and `WorkItem` values/evidence/notes support connected demonstrations. | String values do not reproduce every strategy grid, assertion column, repeated schedule or 22 area variant. Preserve source classifications and continue family-specific rendering. |
| P10 Findings/reporting | Evaluate actual corrections and bind authorization/issue to an exact package. | `Finding` distinguishes identified/agreed/posted_verified; engagement has report/FS versions, authorization, issue and recipients. | Actual posting verification requires evidence. Opinion/representations/disclosure and issue rules are selected demonstrations, not complete professional reporting policy. |
| P11 Review/quality | Review exact work, clear notes separately, assess changes and record assigned quality scope. | Submitted/current/reviewed versions, evidence snapshots, return/respond/clear, impacts and quality concerns. | Add full typed-child/anchor snapshots and concurrency decisions before claiming comprehensive integrity. Ordinary quality and formal EQR need distinct scope/eligibility. |
| P12 Archive | Assemble, approve/lock, hand over, retrieve and amend under actual authority. | Engagement `locked`, custody state and hold, plus a bounded AUTO-058 diagnostic. | No full manifest/custody receipt/readability/retention/disposal engine is established by those fields. No automatic deletion is implied. |
| P13 Follow-up | Track an agreed action through supported verification and closure. | Engagement `followup` flag identifies the conditional scenario. | A flag alone does not implement agreed actions, management progress, verification or closure. Keep the conditional source scope visible. |
| P14 People/capacity | Maintain suitability and availability, then resolve feasible allocation. | Four `Person` fixtures, engagement scopes/support grants, work estimates/actual effort and reassignment. | This is not an HR/credential/leave system. Capacity warnings need explicit available hours and actual recorded suitability before making strong claims. |
| P15 Workpapers/history | Retain exact native/external representations, references, revisions and readable export. | `Snapshot` retains values/evidence; stable work keys identify engagement/form. | Full native child rows, original binary versions, concurrent-save conflicts and package manifests remain further contracts. |
| P16 Tasks/views/access | Find the real next action and expose honest scoped metrics/navigation. | `ViewId`, people scopes, work/manual tasks/events/activity and pure helpers. | Local persona/scope checks are a prototype simulation. Production must enforce the same rules on records, files, search, counts and actions at the service. |

## Shared objects, states and responsibilities

Use the smallest owning state machine that preserves the business distinction. Views should derive presentation state rather than store contradictory copies of the same task status. Keep a stable ID and engagement scope on every link.

| Object | Owning states/events | Responsible actor and revision rule |
|---|---|---|
| Enquiry (proposed) | draft / information outstanding / forwarded / not proceeding | R1 records known facts; an enquiry remains separate from authorization. Unknown facts may be saved. |
| Acceptance assessment | draft / submitted / returned / conditional / accepted / declined / deferred | Preparer, reviewer and authorized decision-maker act in their real capacities. Decision references actual prerequisites and version. Current enum is a subset. |
| Declaration (proposed) | requested / received / evaluated / concern open / resolved | Actual declarant supplies their response; coordinator tracks receipt, reviewer evaluates concerns. |
| Engagement | setup / active / completion in progress / authorized / issued / final-file locked / custody accepted | Phase is a projection of relevant owning events, not permission to skip missing decisions. |
| Work item | not_started / in_progress / waiting / submitted / returned / reviewed / changed | Owner edits/submits; assigned different reviewer reviews exact submitted revision; a change preserves relied-upon content. |
| Work revision/snapshot | created / saved / submitted / reviewed; immutable historical payload | Values and evidence references change together. Child rows/anchors also need version identity where native schemas introduce them. |
| Review note | open / responded / cleared / returned / reopened | Actual author/assigned reviewer clears after evaluating response. Read/response are not clearance. |
| Manual task | open / done, with due date and optional underlying reference | Owner handles administrative task; closing it never clears a professional requirement. |
| Scheduled event | planned / confirmed / completed / cancelled (proposed event status) | Owner/planner changes planned timing within grant; actual event timestamps remain attributable history. Current `Event` type provides kinds and dates only. |
| Request item | open / partial / ready for evaluation / changes_requested / complete | Coordinator records receipts; responsible auditor evaluates actual content. Received count does not imply accepted evidence. |
| Evidence | received / accepted / rejected / replaced/superseded (proposed link) | Keep origin, original version, obtained date, anchor and specific uses. Replacement creates a new version and impact assessment. |
| Dataset/import | received / validating / partial / failed / accepted-with-defects / selected usable version | Preparer resolves conformance; reviewer evaluates fitness. Quarantined records remain visible with source lineage. |
| Sample | design draft / design reviewed / selected / performed / evaluated | Keep designVersion, population stamp, selected units and actual selection distinct. A proposed design has no fictitious selection event. |
| Automation run | unavailable / incomplete inputs / running / failed / completed-with-exceptions / completed-without-exceptions / stale | Result references input/method versions and has human disposition. Current `Run` type and run IDs express a bounded subset. |
| Finding/correction | identified / agreed / posted_verified; disputed or rejected can be proposed additions | Only evidence of actual effect permits the corrected amount to leave the remaining-total calculation. |
| Significant decision | proposed / awaiting decision / returned / decided / affected by change | Authorized R3 acts on the exact supported matter; seniority does not waive prohibitions or required independent review. |
| Ordinary quality concern | open / response supplied / resolved / confirmation recorded | Assigned R4 inspects its actual scope; no automatic report-release authority. |
| Formal EQR | applicability unresolved / not required / required-unappointed / appointed / in progress / concerns open / completed and notice | Actual requirement, eligibility, scope and timing are separate from ordinary R4 confirmation. Current Booleans are only a scenario abstraction. |
| Report package/release | draft / reviewed / authorized exact report+FS / issued / partial distribution / distributed | Authorization targets report and full FS/notes version. A retry must not create a second unintended issue event. |
| Final file/custody | assembling / diagnostics open / approved locked / offered / accepted / retrieved / amended / re-locked | Custodian acknowledges actual usable package; holds/retention/disposition have independent authority and facts. |
| Template release | draft / in_review / published / retired; engagement not-adopted/adopted separately | Author, publisher and engagement adopter act under explicit support/work grants. Publication never silently migrates answers. |

### Work transition contract

1. Save useful incomplete preparation if context and ownership are known. Show missing information beside the relevant field/action.
2. A changed value or evidence reference takes a snapshot, increments the current revision and clears an old submitted binding. Preserve historical reviews.
3. Submit the exact payload/revision to the actual assigned reviewer after the applicable submission checks. Submission does not certify every procedure was professionally performed.
4. Return with a specific anchored reason and named next owner. The preparer responds and, where needed, supplies a new revision.
5. The reviewer separately clears or returns notes. Current-review completion requires the submitted revision to match current content and applicable notes/requirements resolved.
6. A material upstream change creates a targeted impact assessment. A reasoned no-effect decision may retain unrelated work; no global reset or silent global green state.

## Persona, capacity, access and menu matrix

Employment title, capacity on work, assignment, resource scope and supporting authority are separate concepts. The schema2 fixtures model one current persona per person, named work owners/reviewers, engagement scope and explicit `support` grants. A fuller multi-capacity interface should derive the action from the assignment rather than infer it solely from a title.

| User context | Default landing/navigation | Main actions | Scope and boundary |
|---|---|---|---|
| R1 / Prepared by | My day; Tasks; Calendar; Assigned audit work; Requests; Evidence; returned-work filter | Prepare, link actual support, save, submit, respond; plan own allowed work | Fixture Nomin has E1/E2. Cannot obtain E3 through search/count/deep link. Cannot clear their own required review by switching a display label. |
| R2 / Reviewed by 1 | Delivery/Review; Progress; Team; Requests; Risks; Data; Sampling; Calendar; Tasks | Allocate within delegation, inspect exact work, return/clear, evaluate data/design and operational blockers | Fixture Temuulen has E1/E2. Preparation of a separately assigned item is possible; its different reviewer remains required. |
| R3 / Reviewed by 2 | Permitted portfolio; Decisions; Reporting readiness; Resources; Calendar; Tasks | Significant acceptance/strategy/opinion/release decisions, delegated lower work and resource changes | Fixture Bat has E1/E2/E3. Job title alone does not grant support powers; the fixture separately declares those support grants. |
| R4 / Confirmed by | Assigned quality work; Concerns; Significant judgments; Quality calendar; Tasks; formal EQR only if classified/appointed | Inspect assigned material, raise/resolve concern and record the actual quality outcome | Fixture Saruul has E1/E3. Quality responsibility is not unrestricted admin or report issuance. |
| Methodology author | Library draft/release views for explicitly granted content | Draft and submit a version | Temuulen's example grant is `methodology-author`; do not infer authority over every form from R2. |
| Methodology publisher/adopter | Release review/publication; selected engagement adoption | Publish/retire; separately compare/adopt within engagement authority | Bat's example publication grant is explicit. Publication does not overwrite an active engagement. |
| Access administrator | Access settings/grants/history | Apply or revoke approved operation/resource scope | No power to appoint an eligible EQR reviewer or decide an audit opinion merely through access administration. |
| Archive custodian | Custody, retrieval, holds and inspection package | Accept actual custody, controlled retrieval and separately authorized disposition | Record offered versus accepted, actual package identity and retained access history. |

Global navigation contains My work, permitted Engagements, Calendar and personal Tasks. Inside an engagement, group Delivery, Audit work, Review/Decisions and Final file. Put request/data/sample/automation detail in the owning group. Library, access and custody settings appear only with their additional capability. A complete source catalogue belongs in search/index/coverage, not 70 permanent left-menu rows.

Badge definitions must be stated: “My review” counts exact submitted current revisions assigned to me; “Returned” counts my returned owned work; “Open notes” counts uncleared notes in my permitted population. A badge is not the count of all firm records. Denied deep links must not reveal a client's title before refusing access. Counts, previews, exports and actions need the same scope projection as the list.

## Scheduling, calendar and tasks

`WorkItem.start/due` are current planned dates. `baselineStart/baselineDue` are a separately retained comparison, not automatically overwritten whenever a bar moves. `completedAt` and snapshot/event timestamps are actual events. A personal focus `Event` can link to work without changing the official due date. Manual tasks have their own completion; a `kind:'decision'` item is only a reminder unless it invokes the owning decision action.

The Gantt must offer stage/area/work hierarchy, owner/reviewer, baseline/current dates, status, estimate/actual, overdue and waiting reasons, day/week/month scale, filters, today marker, unscheduled tray and task detail. Do not draw a critical path until actual schedule dependencies and durations support one. Missing dates remain missing; missing resource availability prevents a confident capacity claim.

Calendar views: personal agenda/day/week/month, engagement planning and authorized team/portfolio. Clearly distinguish deadline, meeting, fieldwork, review booking and focus. The current `Event` kinds represent the latter four, while deadlines should be projected from WorkItem/ManualTask rather than duplicated. Use explicit date-only versus timed-event semantics and a selected firm/user timezone; current fixture date strings are not a complete timezone or holiday engine.

List, Gantt and calendar resolve the same work ID. A schedule edit previews intended changes and relevant conflicts, checks authority, preserves actual events and records history/reason. Bulk rescheduling and two-way external calendar synchronization remain deeper scope, with identifier, cancellation, retry, revocation and conflict policies. No local agenda claims that invitations were sent.

## Metric dictionary

Metrics describe operational populations, not audit assurance, risk reduction or professional sufficiency. Apply permitted engagement/resource scope first. Use one selector for tile, segment and drill-through, and state the as-of basis.

| Metric | Numerator and denominator / unit | Current schema2 definition | Display and edge-state contract |
|---|---|---|---|
| Work inventory | Count all supplied permitted WorkItems | `metrics.total = items.length` | Inventory includes optional/N/A items; do not label it applicable completion. |
| Applicable required work | Count `required && !naReason` | `metrics.applicable` | An approved N/A rationale changes the denominator visibly. A string alone is a demo abstraction of approval. |
| Preparation submitted | Applicable items in `submitted` or `reviewed` / applicable required items | `prepared`, `preparedPct`, rounded to integer | Returned/in-progress/waiting/changed are excluded. Explain that it measures submission of current work, not total audit completion. |
| Current required review | Applicable `status==='reviewed' && reviewedVersion===version` / same denominator | `reviewed`, `reviewedPct` | A changed reviewed item leaves the numerator. No old sign-off may approve new content. |
| Overdue required work | Applicable dated work with `due < asOf` and not reviewed | Current helper uses fixed `DEMO_DAY='2026-11-06'` | State “Demo as of 6 Nov 2026.” Today is not overdue under this rule. Undated work appears separately. Production needs an explicit as-of/timezone. |
| Waiting work | Applicable `status==='waiting'` / applicable work, or count only | `blocked` | This is a workflow-state count. A separate unresolved readiness/impact may also need attention even if the item is not flagged waiting. |
| Open review notes | Uncleared notes across supplied items | `notes` sums `!cleared` | Includes notes on optional work if it remains in the supplied list. Counts and drill-through must use the same scope. Response alone does not reduce it. |
| Request fulfilment | Received item count and expected count per RequestItem | `received/expected` available | Separate receipt progress from auditor-evaluated acceptance/completion. Expected zero or unknown is not automatically 100%. |
| Remaining misstatement amount | Sum findings whose status is not `posted_verified`, by selected engagement | `outstanding(m,e)` | Agreed/unposted remains included. Qualitative effects are separate; no automatic opinion follows from a threshold comparison. |
| Effort used | Sum recorded actual effort / separately stated planned effort | `actual` and `estimate` available, no complete capacity policy | Do not call it completion or earned value. Zero/missing estimates and unrecorded actuals are explicit. |
| Schedule variance | Current planned due minus retained baseline due, in declared calendar units | Date fields available | Missing baseline/date produces unavailable. Actual completion variance is a different metric. |
| Automation freshness | Current input stamp equals run's captured input stamp | `runInputs`/`stamp`/`Run.inputStamp` available | A stale result remains visible as historical and cannot claim current clean status. Method version is a future extension. |
| Reporting readiness | Named unresolved applicable demo requirements, not a completion score | `reportGaps` returns reasons | Show exact reason and route. The selected rules are not an exhaustive professional completion engine. |

For a zero applicable denominator, the helper currently returns zero percentages. The UI should display “No applicable required work”/n.a. rather than “0% complete” without context. If the UI retains 0 for chart plumbing, exclude it from averaging and expose the reason. Unknown/failed inputs must not masquerade as zero overdue or zero exceptions.

Worked example: 12 registered units, two approved N/A, ten applicable; three currently reviewed, two submitted, one returned, one in progress, one waiting and two not started. Preparation submitted is 5/10; current review is 3/10. A reduction in materiality or new evidence can require impact/renewed review without resetting unrelated work. Count-based progress of two tasks (one four-hour completed, one 100-hour incomplete) is 50%; planned-effort weighting is about 3.8%. Neither means actual effort used or audit quality. Portfolio aggregates need their stated matching numerator/denominator, not an unexplained mean of engagement percentages.

## Dependency typology and change impact

| Type | Meaning | UI behavior and action boundary |
|---|---|---|
| Navigation/context | Related work is useful to inspect | Link and source locator; no implied hard gate. |
| Shared source fact | A field refers to a fact owned elsewhere | Show origin/version; confirm current use when needed; do not create independent contradictory copies. |
| Calculation | Selected inputs deterministically produce an output | Expose inputs/units/parameters; blank/invalid differs from valid zero. |
| Information readiness | A specific answer/result is needed for a named action | Show missing field/owner/resolution route, while allowing independent drafting. |
| Schedule predecessor | Planning dates/order relate work | Show chain and approved plan effects; it does not automatically prohibit all preparation. |
| Required review | A work unit/revision needs a particular actual review | Identify assigned reviewer and exact revision; response is not clearance. |
| Professional authorization | An authorized supported decision enables a specific outcome | Check actual authority/applicability; seniority cannot waive a prohibition. |
| Evidence reliance | Result/conclusion relies on exact evidence/version/anchor | Replacement preserves old support and creates targeted assessment of affected work. |
| Reporting-package binding | A report is authorized against a full selected FS/notes package | Mismatched versions show an explicit release blocker. |
| Retention/custody restriction | A hold or custody fact limits a particular disposition | Unknown/active restriction prevents claiming disposal eligibility; it does not rewrite audit conclusions. |

Source-located entries belong in `src/data/source-registers.json` and the coverage register. Proposed relationships below are design examples to validate at their exact source fields; their presence here is not proof that all are enforced in the current demo.

| Example | Target action and partial-work behavior | Owning process / screen |
|---|---|---|
| 1.4.1/1.4.2 acceptance outcome -> 1.1.1 decision-dependent answers | Draft known client/scope facts; block only the applicable progression/submission condition. | P02/P03; S03/S04/S07 |
| 1.4.5/1.4.6 independence concerns/declarations -> acceptance decision | Track actual responses and unresolved matters; receipt is not clearance. | P02; S03 |
| Exact agreed 1.4.3 terms -> authorized engagement setup | Draft terms/setup context separately from actual agreement event. | P02/P03; S03/S04 |
| Approved template release -> instantiated workpaper/programme | Existing engagement remains on adopted version until explicit adoption. | P04; S06/S07/S11 |
| Understanding/control work -> assessed risk/rationale | Unknown answers remain open; do not score them automatically satisfactory. | P06; S09 |
| Risk/assertion -> planned response/programme | Surface an uncovered risk or response needing change; actual tailoring remains human. | P06/P07; S09/S11 |
| Materiality version -> sample design and remaining misstatement evaluation | Recompute assistance and create targeted impact assessment. | P06/P07/P10; S10/S12/S17 |
| Selected dataset/version -> reconciled population | Quarantined rows retain their reason; a matching residual alone cannot approve fitness. | P05; S08 |
| Reviewed sample design -> actual selection | A design exists without a fictitious selected date; input changes invalidate matching review/selection as applicable. | P07; S12 |
| Request response/evidence version -> actual procedure use | Partial receipt permits independent procedure work; missing support stays named. | P08/P09; S13/S15 |
| Confirmation authorization -> actual dispatch/response case | A manual recording is distinguished from an external service dispatch. | P08; S14 |
| Procedure exception -> finding and additional work | A closed administrative task does not dispose of the finding or evidence limitation. | P09/P10; S15/S17 |
| Management agreement -> actual posting verification -> final TB/FS | An agreed unposted adjustment stays in remaining effects. | P10; S17/S18 |
| Required reviews/quality concerns/EQR -> report authorization | Apply actual selected requirement and authority; ordinary R4 confirmation is distinct. | P11/P10; S19-S21/S18 |
| Exact FS/notes version -> report package authorization/issue | A replacement exposes the mismatch and preserves what was authorized/issued. | P10; S18 |
| Issued package -> assembly/lock/custody | Administrative assembly does not create missing audit-performance evidence. | P12; S22 |
| Active hold/restriction -> disposition decision | Retain or show ineligible/unresolved; no elapsed-time auto-delete. | P12; S22 |

The current `readiness` helper demonstrates selected acceptance and lock conditions, not this full graph. The materiality change helper creates an impact record for sample/evaluation/plan targets. Broader reliance needs source/target/version/type records, actual evaluated impact and a supported no-effect outcome. Cycles require a domain resolution rule rather than permanent mutual locks.

## Controlled configuration and business cost

The owner's grant to change one form should identify template ID, operations, scope and authority. It must not imply control over the other 69 forms, professional decision policy or unrelated engagements. Stable field IDs and response codes survive label/reordering changes; semantic changes require migration assessment.

| Change layer | Example | Authority and control | Cost/support implication |
|---|---|---|---|
| Personal presentation | Column order, saved filters, own agenda view | Personal preference; no data or policy change | Low validation/support cost; user-resettable. |
| Controlled presentation content | Mongolian label/help text for one template | Granted author, review/publication, versioned label history | Small bounded change; translation and long-label layout checks. |
| Field/schema semantics | Add option, change type, split repeating row | Methodology/schema authority; compare, compatibility/migration and affected review | Higher cost than a label edit; impacts stored answers and tests. |
| Engagement tailoring | Applicable procedure, assigned owner/reviewer, planned date | Delegated engagement authority; source/methodology reason | Operational configuration; preserve baseline/history and independent eligibility. |
| Professional rule | Acceptance prohibition, review requirement, selected threshold policy | Actual methodology/professional authority and applicability evidence | Requires domain validation; not an unrestricted drag-and-drop setting. |
| Integration behavior | Send confirmation, external calendar sync, durable evidence storage | Selected service scope, identity/consent and implementation ownership | Separate engineering, provider, retry, security and operating support costs. |

| Implementation model | Good fit | Main cost/risk | Recommendation |
|---|---|---|---|
| Fixed coded workflows with small settings | Stable actions, exact review/version rules and a focused first prototype | Routine content change can require a release; customer variants risk forks | Use for state transitions and a narrow verified journey. |
| Schema-driven forms with bounded policy | Reusable inspected form families, stable field IDs, choices/applicability and approved releases | Schema validation, migrations, type fidelity and regression effort are real ongoing costs | Preferred direction for the 70 forms, introduced family by family. |
| Broad low-code configuration | Many approved process variants with a mature governance/support model | Builder complexity, permission sprawl, migration/testing and vendor/platform constraints | Evaluate against concrete customer changes; do not build a general platform merely to make the mock flexible. |

Proposed service model: personal view changes are self-service; granted content changes go through a controlled methodology release; semantic/process changes are assessed scoped work; repeated needs enter the product backlog; unsupported integration/policy changes receive a clear supported alternative or estimate. Commercial entitlement and software permission are different decisions. No vendor price or delivery estimate is invented here.

Adoption sequence: draft -> compare -> validate -> review/publish -> select affected engagement -> inspect field/answer compatibility and review impact -> explicit adoption -> retain old release/answers/history. A removed question cannot silently delete prior evidence. Rollback must restore a coherent versioned state rather than simply relabeling new answers as old.

## Selected pattern-to-screen matrix

The first selection contains eight audit-derived patterns and four external patterns. “Selected” means design choice; shipped behavior requires verification. Additional external patterns remain useful supporting research but do not displace audit-specific evidence, procedures and judgments. Exact cards and source links live in the named JSON files.

| Pattern / research file | Mechanism to adapt | Connected audit destination | Verification / progressive boundary |
|---|---|---|---|
| AUD-PAT-001 / `audit-patterns.json` | Phase-to-document drill-through | Engagement home S04 -> selected work S07; role home S01 | Defined unresolved count opens the same permitted rows. Source index is available alongside process navigation. |
| AUD-PAT-002 / `audit-patterns.json` | Anchored retained review history | S07/S19 | Respond and clear are distinct; old review target remains inspectable after a change. |
| AUD-PAT-004 / `audit-patterns.json` | Include review demand in plan | S05/S24 | Preparation and review windows/effort are distinguishable. Fixture effort is not proven capacity. |
| AUD-PAT-006 / `audit-patterns.json` | Visible change after review | S07/S19 | Changed current work leaves current-reviewed population; prior content remains. |
| AUD-PAT-010 / `audit-patterns.json` | Mapping defects before export | S08 | Missing/ambiguous mapping is explicit. Current constrained CSV import is a subset, not full mapping delivery. |
| AUD-PAT-011 / `audit-patterns.json` | Request table with review inspector | S13 -> S07/S15 | Partial receipt, evaluation and specific next owner remain distinct. |
| AUD-PAT-013 / `audit-patterns.json` | Result-to-evidence anchor | S07/S13/S16 | A result opens its actual permitted source version/anchor or an honest unavailable state. |
| AUD-PAT-015 / `audit-patterns.json` | Confirmation lifecycle register | S14 | Manual dispatch/response evidence is separate from a network integration; dedicated full case is deeper scope. |
| EXT-PAT-001 / `external-patterns.json` | Durable personal/role views | Four S01 contexts; S19 | Saved filter persists without editing records or granting access. |
| EXT-PAT-004 / `external-patterns.json` | Unscheduled work tray | S05 -> task detail | Unknown date stays unknown until an authorized plan is entered. |
| EXT-PAT-005 / `external-patterns.json` | One schedule across task/list/timeline/calendar | S01/S05/S07 | Changing a due date moves all projections and leaves actual event dates alone. |
| EXT-PAT-010 / `external-patterns.json` | Purpose-specific role navigation | S01/S04/S19/S21/S25 | Four personas have materially different menus/queues/actions within permitted scope. |

## Connected screen wireframes

The following are authored text reconstructions. Each spec gives enough context to build the interaction while preserving the owning source action. They are not evidence that the current UI has already passed them. Source screen IDs may be tabs/drawers rather than separate top-level routes.

### W01: R1 My day (S01)

```text
My work    [Engagement: E1] [Date: demo as-of]        Calendar | Tasks
Today [n]   Returned [n]   Waiting on others [n]
Reference / Work / Current state / Due / Actual next action
3.1.8  Bank reconciliation  Returned   6 Nov   [Answer reviewer note]
3.1.4  Inventory             Waiting    7 Nov   [Open missing requests]
Side agenda: meeting | task deadlines | focus block, each clearly typed
```

Entry: sign in/select a permitted persona, a task or returned-note deep link. Actions: open work, save preparation, respond and submit through S07. Returned work names the reason and reviewer; an administrative task has its own closure. Empty/unknown/denied states are different. Sources P16-UC01, P11-UC01; patterns AUD-001 and EXT-001/005/010.

### W02: R2 Delivery and review (S01/S19)

```text
E1 / FY2025                     [Delivery] [Plan] [Review] [Team]
Prepared submitted: 5/10   Current reviewed: 3/10   Open notes: n
[My review] [Returned] [Changed]  Area/owner/date filters
Queue with selected row | Inspector: exact submitted/current revision
                        | Work | Evidence | Notes | History
                        | [Return with reason] [Clear/review] [Expand]
```

This queue-first alternative is the recommended daily senior default. It retains sort/filter/scroll/selection and next/previous order. The inspector uses the same scope and action checks as the full workpaper. If content changed or input is unsaved, show the conflict and a deliberate recovery choice. Sources P11-UC02, P16-UC02, P15-UC02; patterns AUD-002/006/011 and EXT-001.

### W03: R3 Portfolio and decisions (S04/S20/S18)

```text
Permitted engagements       [Decisions] [Reporting] [Resources] [Calendar]
E1: package mismatch     E2: acceptance pending    E3: required EQR concern
Decision / Required evidence / Current owner / Due / [Open owning matter]
Selected significant judgment: rationale, consultation, supporting versions
[Return for support] [Record authorized decision]   Related reporting package
```

Entry: permitted portfolio or named decision. A tile opens its actual underlying records; it does not approve from the dashboard. Separate report authorization, issue and recipient distribution. R3 support menus appear only through actual additional grants. Sources P02-UC04, P06-UC06, P10-UC06/08, P11-UC03; patterns AUD-001 and EXT-010.

### W04: R4 Assigned quality (S19/S21)

```text
Assigned quality scope               [Concerns] [Plan] [Calendar]
E1: ordinary assigned confirmation | E3: formal EQR required, incomplete
Matter / Exact support / Concern state / Responsible engagement owner
Inspector: scope, inspected versions, response and disposition
[Raise concern] [Record actual assigned outcome]
```

No generic issue-report button or unrestricted firm administration. Formal requirement, eligibility, appointment and completion remain separate. A not-required EQR must not display as fictitiously completed. Sources P11-UC04/05/06; EXT-010. Current Booleans support a selected demo, not a full eligibility engine.

### W05: Team timeline and allocation (S05/S24)

```text
E1 / Plan                  [Day] [Week] [Month] [Area] [Owner] [Review demand]
Work / owner / reviewer | baseline --- | current ===== | review [ ] | <> target
Planning / Temuulen     | ...
Assets / Nomin         | ...
Unscheduled tray: work / owner / estimate / missing date
Selected task: planned dates, baseline, actual events, dependency, [Change plan]
```

This timeline-first alternative is the recommended planning tab rather than the only senior home. It emphasizes delivery sequencing and resource demand. Date controls preview actual intended changes and preserve historical events. Capacity is unavailable without an actual availability basis. Sources P03-UC02/03, P14-UC03; AUD-004 and EXT-004/005.

### W06: Calendar and personal task detail (S01/S05)

```text
[Personal] [Engagement] [Team within scope]       Agenda | Week | Month
Legend: deadline / meeting / fieldwork / review booking / focus
Today: task deadline 3.1.2 | 10:00 meeting | afternoon personal focus block
Task drawer: exact work link, owner, due, blocker, next action, history
```

A focus block is not the official due date. A planned review window is not a recorded performed review. Reassign/schedule only within grant. The current fixture stores dates; timed recurrence, holidays, external sync and conflicts require further explicit semantics. Sources P16-UC01/P03-UC03; EXT-005/010, with EXT-017/018 as supporting research.

### W07: Workpaper with actual support (S07/S11/S15)

```text
E1 / 3.1.2 / v4 / Submitted / Owner Nomin / Reviewer Temuulen
Source-faithful family: fixed instructions + typed/repeating procedure rows
Procedure / performed result / evidence version+anchor / exception / conclusion
Dependencies | Work | Evidence | Review notes | Revision history
[Save draft] [Submit]   or reviewer [Return] [Clear/review exact revision]
```

Retain source coordinates and stable field/row keys. Headings and fixed letter clauses are not editable survey questions. Show old/new payloads and evidence-reference changes. Unknown/N/A/zero remain distinct. Source programme/assertion/schedule families determine the renderer. Sources P04/P07/P09/P11/P15; AUD-002/006/013.

### W08: Requests and evidence inspector (S13/S14)

```text
Request / entity-period / contact / owner / due / received-expected / evaluation
REQ-01 Inventory acts   1 of 3 received   Partial   [Open]
Inspector: actual receipt versions, missing remainder, message/history
Evidence: origin/version/page-cell anchor/relevance/reliability/linked work
[Record receipt] [Request changes] [Evaluate]   Confirmation case separately
```

Manual receipt/dispatch is labeled as recorded rather than actually sent. Confirmation case additionally needs controlled addressee/authorization, response, non-response/alternative work and evaluated outcome. Source P08; AUD-011/013/015. Source-file preview can show a clearly marked specimen; an unavailable real file must not get a fabricated preview.

### W09: Data, sample and automation chain (S08/S12/S16)

```text
Data package v2 -> validation -> accepted/quarantined/excluded -> bridge
Source row / account / amount / period / state / reason / downstream uses
Sample: exact population, design v2, size/seed/rationale -> review -> actual selection
Run panel: input stamp, parameters/method, output, exceptions, human disposition
Old run: stale on current inputs | [Inspect original] [Run supported method]
```

The constrained CSV and seeded random selection are bounded demonstrations. Invalid/failed/partial runs never show a clean result. Seven current runnable IDs do not mean all 58 engines are implemented. Sources P05/P07/P09 and automation catalogue; AUD-010/013/014 (the latter supporting research).

### W10: Risks, findings and changed work (S09/S10/S17/S19)

```text
Risk -> assertion -> selected response -> procedure -> evidence -> conclusion
Materiality: selected benchmark/percentages/rationale; calculated outputs separately
Finding: identified / agreed-unposted / actual posting verified + evidence
Impact: changed source/version -> affected work/owner -> renewed review or no-effect
```

An amount calculation is assistance, not an opinion or significance decision. Agreed but unposted amounts stay in remaining effects. The affected-work view opens exact records; unrelated work is not automatically reset. Sources P06/P10/P11; AUD-006/013 and exact-revision proposal.

### W11: Reporting through final custody (S18/S21/S22)

```text
Report v2 -> FS+notes package v3     Bound package: v3 / current: v4 [Mismatch]
Readiness gaps with exact owning links; required EQR/quality concerns separately
[Authorize exact package] -> [Record actual issue] -> recipients delivered/failed
Final file: manifest/diagnostics -> approved lock -> offer custody -> acknowledge
Hold: active | controlled retrieval/amendment history | disposition decision
```

Professional authority and actual outcome remain distinct. No local action claims real external delivery, secure archive execution or legal disposal. Full final-package identity, retention anchor and hold policy remain explicit decisions. Sources P10-P12; selected report/file diagnostics are a demonstration subset.

### W12: Methodology release and adoption (S06/S25)

```text
Template 1.1.1 / granted author scope     Draft -> Review -> Publish v2
Compare: stable field IDs, wording/type/options/requiredness, affected work
Engagement E1 adopted v1, latest v2  [Inspect compatibility] [Explicit adoption]
Preserved answers, source evidence, earlier reviews and adoption reason/history
```

Only actual author/publisher/adopter grants act. Label changes do not reinterpret saved codes. Unsupported schema migration stays a named gap. Sources P04/P16; EXT-010/011 plus audit applicability/content patterns where supported.

## Component and interaction rules

Use one restrained professional visual system: clear type hierarchy, consistent row padding, readable dates/numbers, a selected-row state, accessible focus and textual status. Color supplements state; it never substitutes for the status/why/owner. Long Mongolian terms wrap or receive appropriate column width, and source form references remain scan anchors.

Context header: client/period, work reference/title, current/submitted version, status, current capacity, actual owner/reviewer and next action. Contextual actions sit beside their object. A command/search result opens the exact permitted item; bulk selection shows exact scope and supported outcomes. A deep link cannot skip authority or reveal denied metadata.

Save behavior: unsaved/saving/saved/failed with recoverable input. Empty versus no permission versus unknown source versus unavailable file are separate explanations. A toast alone is not a durable record of a significant action. History gives actor, actual capacity, time, target version and meaningful reason.

Responsive behavior: queue/inspector becomes list -> detail with a retained return target; Gantt offers a practical agenda/task alternative rather than squeezing all bars into a phone. All relevant controls have accessible labels and keyboard operation. Do not require drag-and-drop for essential schedule actions.

## Prioritized next slices and acceptance evidence

Effort categories below are comparative design estimates under a single-developer local-prototype assumption, not commercial quotes. They exclude production identity, durable concurrent storage, third-party services and methodology approval.

| Slice | Priority/outcome | Connected implementation | Depth and acceptance evidence |
|---|---|---|---|
| N01 Shared work model | P0; prevent drift between views | Schema2 stable work ID, owner/reviewer, dates/revisions and scope selectors | Local rules plus meaningful domain tests; list/calendar/timeline/review use the same records. |
| N02 Role workspaces | P0; each person sees relevant next actions | Four navigation/landing contexts and permitted engagement switch | Browser verify four roles, no cross-scope totals/deep-link leak; record mock enforcement boundary. |
| N03 Plan/calendar/tasks | P0; make detailed delivery visible | Gantt/agenda/calendar/task detail, unscheduled work, planning history | Verify reschedule/reassign consistency and unchanged actual events. Bulk scheduling remains explicit future depth. |
| N04 Work/review/evidence loop | P0; substantive connected audit work | Source-aware editor, exact evidence snapshot, return/respond/clear, change impact | Browser verify a complete multi-person revision cycle plus changed evidence; list criteria still uncovered. |
| N05 Requests/data/sample | P1; usable information rather than standalone forms | Partial requests, evidence use, constrained import bridge, reviewed sample design and actual selection | Verify wrong-period/duplicate/invalid inputs, design review, seeded reproduction and replacement freshness. |
| N06 Risks/findings/readiness | P1; connect work to final consequences | Risk-response trace, selected materiality, remaining effects and package gap reasons | Verify agreed-unposted amount remains, materiality impact appears and wrong FS binding blocks selected release. |
| N07 Reporting/archive/quality | P1; show final handoffs honestly | Scope-specific quality concern, formal-EQR scenario, exact package authorization/issue, recipients, lock/custody/hold | Verify required-not-complete state, partial distribution, no duplicate issue and hold visibility; full legal archive execution remains service work. |
| N08 Source coverage and methodology | P1; make all current items inspectable | Searchable 70-form/source coverage, controlled release/adoption, per-row implementation statuses | Check original populations/IDs, malformed title correction, active v1 retained after v2 publication. |
| N09 Native-family depth | P2; refine source fidelity rather than generic editing | Strategy/assertion tables, repeated schedules, documents, sampling and archive families | Independently validate meaningful formulas/options/row identity and old-version representation. |
| N10 Production contracts | Later selected implementation | Service authorization, concurrency, durable files, dispatch/retry, full archive identity and integration adapters | Separate implementation/acceptance plan. A mock cannot certify these by hiding a menu or using local storage. |

## Verification checklist

Record test ID, fixture, exact action, observed output and remaining limit. Link to the source criterion/coverage row. Passing a pure helper test does not imply a full browser journey passed, and a successful build does not establish business semantics.

1. **V01 scoped navigation:** each persona's default menus/actions differ; unknown/revoked engagement links reveal no restricted title or count.
2. **V02 metric reconciliation:** a tile count opens the same permitted population using its declared predicate/as-of basis.
3. **V03 denominator:** approved N/A is excluded visibly; changed current work is not currently reviewed; no applicable denominator is clearly explained.
4. **V04 one schedule:** move a task due date, inspect list/calendar/Gantt, and confirm snapshot/review event dates did not change.
5. **V05 undated work:** a task with no date remains in Unscheduled and is not silently placed today.
6. **V06 assignment:** reassign within scope; old authorship/history remains; self-independent-review and cross-scope assignment fail.
7. **V07 returned work:** return with an anchor/reason; named preparer receives it; a response leaves the note open until reviewer clearance.
8. **V08 exact revision:** change submitted/reviewed values or evidence, preserve the old payload and expose required current review/impact.
9. **V09 queue recovery:** open item three, inspect/expand/return and preserve filter/order/selection; unsaved notes require deliberate recovery.
10. **V10 non-sequential draft:** save known 1.1.1 facts while acceptance is missing, then resolve the actual upstream decision and observe only the applicable gate.
11. **V11 partial receipt:** record one of three requested items; show two outstanding and distinct auditor evaluation, not “complete” from one file.
12. **V12 honest evidence:** a clearly marked specimen is distinguishable from an uploaded file; unavailable data is never a successful preview.
13. **V13 import defects:** use wrong-period, duplicate-ID, blank/invalid amount and clean rows; keep source-row reasons and reconciled populations visible.
14. **V14 valid zero:** an allowed zero remains numeric zero; missing/invalid input is unavailable/failed, not a clean zero result.
15. **V15 sample design:** design exists before selection, reviewedVersion matches designVersion, and changing population/design requires the applicable renewed decision.
16. **V16 reproducible run:** same eligible population/seed yields the same selected IDs; input changes make old results visibly historical/stale.
17. **V17 automation limits:** only implemented IDs execute; an unsupported method is honestly unavailable; failure/exception is not labeled a clean result.
18. **V18 remaining differences:** agreed-but-unposted stays in the amount; actual posting verification requires support and only then changes its classification.
19. **V19 significant quality:** ordinary confirmation and formal EQR required/not-required/completed are distinct; R4 cannot issue a report through role seniority.
20. **V20 exact package:** a report bound to FS v2 cannot authorize current FS v3 under the selected readiness rule; retain earlier binding/history.
21. **V21 issue/distribution:** retrying the same intended issue does not create a second release; one failed recipient means partial distribution.
22. **V22 lock/custody/hold:** locked ordinary editing is blocked; offer and accepted custody differ; an active/unknown restriction never implies disposal eligibility.
23. **V23 governed adoption:** publish v2 while E1 remains adopted v1; explicit compatibility/adoption preserves old answers, evidence and review history.
24. **V24 personal planning:** moving a focus block does not move the official task deadline; reading a notice does not close work.
25. **V25 source coverage:** current case/criterion/feature/automation/form/E2E/screen/gap populations have explicit dispositions; all selected dependencies retain provenance and uncovered depth.

## Open decisions to retain

The source's D01-D29 decision register remains the authoritative inventory of unresolved model/scope/applicability questions. Prioritize incomplete pre-engagement persistence (D01), per-work authority (D05), ordinary quality versus formal EQR (D06), native child/review snapshots (D14/D29), full reporting-package binding (D15), targeted renewed review (D18), holds/retention clocks (D19/D20), professional/local applicability (D21/D22), actual external services (D25), sample design before selection (D28), and the current source-review limitation (D27).

The schema2 domain model helps make the prototype coherent, but it does not close every source decision. Preserve analyst recommendations as proposals until actual business decisions, implementation and verification justify a different status. The outcome is a reviewable path from every source need to a screen/action and an honest implementation depth.
