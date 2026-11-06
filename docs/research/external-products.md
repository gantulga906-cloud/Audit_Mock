# External software design research

Reviewed 6 November 2026. This is the secondary design track for Audit_Mock; audit software remains the primary workflow and interface benchmark. Eight distinct non-audit product families cover issue/work management, scheduling, structured records/interfaces, review/collaboration, personal productivity and attention management.

Evidence is official public help documentation. No commercial product was signed into or executed, and no source screenshot was captured. Text wireframes below are original audit-design reconstructions, not vendor screenshots. Documented source behavior is kept separate from our proposed adaptation. No efficiency percentage or production-security claim is made.

## Product and workflow comparison

| Product/category | Documented reference | Example documented journey | Limits |
|---|---|---|---|
| Linear (Issue/work management) | [Custom Views / Create views / Copy view link / Peek preview](https://linear.app/docs/custom-views): Saved filtered views, view links and temporary Peek inspection. | Filter an issue list, save its view, reopen it and inspect a selected item using Peek. | Availability varies by view; saved initiative views are Enterprise-only. Link sharing does not grant access. |
| Asana (Scheduling) | [Viewing your project on a timeline / Scheduling tasks / Rescheduling tasks in bulk](https://help.asana.com/s/article/timeline): Dated tasks appear on a timeline; undated tasks remain in an unscheduled section. | Open Timeline, select an undated task, assign dates, then inspect it in the list or board. | Subtasks need explicit project/date association; timeline depth and layout behavior have documented limits. The page returned CSS-error chrome, but the article body was readable. |
| Notion (Structured records and views) | [View settings / Open pages in / Add a filter](https://www.notion.com/help/views-filters-and-sorts): Per-view layout, property visibility and filters; side-peek keeps the underlying view usable. | Create a filtered view, choose its visible properties and open a row in a side peek. | View settings and sharing choices differ; a presentation filter is not an audit authorization policy. |
| Airtable (Tailored interfaces and configuration) | [Why use Interface Designer / user roles / adding interfaces](https://support.airtable.com/articles/8078126534-getting-started-with-airtable-interface-designer): Builders configure and publish purpose-specific interfaces for end users. | Select a layout and source table, configure a draft interface, publish and grant the intended access. | Timeline visualization requires a paid plan; legacy Blank layouts have different capabilities. Interface publication does not define our methodology-adoption rules. |
| Attio (Records and workflow context) | [List entries / Types of list views / Exploring the table view](https://attio.com/help/reference/attio-101/attios-data-model/understanding-lists): A shared record can have workflow-specific list-entry attributes and table/kanban presentations. | Add a record to a list, edit its list-specific status, then inspect the corresponding board position. | Repeated entries can represent separate contexts. Automatic enrichment and identity merging are outside this adaptation. |
| GitHub (Review and collaboration) | [Review decision types / Requesting and requiring reviews](https://docs.github.com/en/pull-requests/reference/pull-request-reviews): Review decisions distinguish comment, approval and requested changes; comments may target specific lines. | Request a suitable review, discuss an anchored change, then submit a distinct review decision. | Code-review access and merge semantics are not professional audit eligibility, clearance or report authorization. |
| Google Calendar and Tasks (Personal productivity) | [Open two Google products in one window / Close or hide the right side panel](https://support.google.com/calendar/answer/106237?hl=en): A side panel exposes Calendar and task items with deadlines beside other work. | Open the side panel, select Calendar or Tasks, inspect or add the relevant planning item, then close it. | This supports an interaction reference; our prototype does not claim Google synchronization or sent invitations. |
| Slack (Communication and attention) | [How notifications work / Choose what to show in Activity / notification schedule](https://slack.com/help/articles/201355156-Configure-your-Slack-notifications): Notification relevance and schedules are configurable separately from work content. | Choose relevant alert types and delivery preferences, inspect Activity, and pause notifications outside chosen hours. | Notification preferences do not change business deadlines or resolve an audit concern. Paid exceptions and platform-specific options differ. |

## Recommended transfers

The strongest immediate transfers are saved role queues (EXT-PAT-001), context-preserving work inspection (002/008), unscheduled work beside the plan (004), one task schedule across list/Gantt/calendar (005), role-purpose navigation (010), controlled author/publisher use (011), explicit review decisions (015), agenda/task context (017/018), and actionable activity (019). These supplement the audit-derived risk, evidence, review and reporting patterns. A generic kanban drag never becomes professional clearance.

Each product contributes a mechanism, not its branding. Keep the current calm audit palette and consistent object header. Show work reference, client/period, current revision, status, owner and next action in that order. Use one table rhythm, one inspector, one status vocabulary and accessible text labels across all capacities.

## Annotated reference board (text reconstruction)

The source column below describes documented mechanisms; the audit column is our original proposed composition. It does not claim pixel-level observation of those applications.

| Problem | Source mechanism | Audit adaptation |
|---|---|---|
| Re-finding the same work every morning | Linear saved views | R1 tabs Today / Returned / Waiting, predicates over permitted WorkItem IDs. |
| Leaving the review queue for every item | Linear Peek + Notion side peek | R2 queue stays visible; selected exact revision, evidence and notes open in an inspector. |
| Missing undated work | Asana Unscheduled | An explicit unscheduled tray with owner and reason, rather than invented dates. |
| Different roles need different density | Airtable tailored interface + Notion view settings | R1 procedure/results, R2 review/revision, R3 significant decisions, R4 assigned quality concerns. |
| Source facts copied into many files | Attio record/list-entry distinction | Shared client identity separated from current-period acceptance and work results. |
| Reply mistaken for clearance | GitHub distinct decisions | Respond, Return and Clear/review remain separate audit actions with eligibility checks. |
| Planning requires abandoning current work | Google side panel | Today's agenda and linked task drawer beside the workpaper. |
| Too many status notifications | Slack relevant Activity/preferences | One scoped notice for a real next action; read is not complete. |

### Alternative A: queue-first senior workspace (recommended daily R2 default)

```text
Engagement / Period / Review scope                 [Plan] [Review]
[Mine] [Returned] [Changed]  Filters: area, owner, due date
+-------------------------+--------------------------------------+
| Review queue            | Exact submitted revision inspector   |
| > 3.1.2  v4  awaiting   | v4 submitted / current v4            |
|   3.1.5  v2  changed    | Work | Evidence | Notes | History    |
|   2.6    v3  awaiting   | Anchored notes and evidence version  |
| Filter + scroll retained| [Return] [Clear/review] [Expand]     |
+-------------------------+--------------------------------------+
```

Callouts: the left population defines the badge count and next/previous order; a selected row remains highlighted; the right header makes revision identity explicit; role actions sit beside the target, not in a generic dashboard. On narrow screens the inspector becomes a full route with a preserved Back to queue context. An unsaved note requires a deliberate save/discard/cancel choice before navigating.

### Alternative B: timeline-first senior workspace (recommended planning tab)

```text
Engagement / Period                    [Week] [Month] [Owner filter]
+--------------------+-------------------------------------------+
| Area / owner       | Baseline + current plan + today marker    |
| Planning / Temuulen| -----[review]----                         |
| Assets / Nomin     |    =====work====   [review window]        |
| Report / Partner  |                     <> target milestone   |
+--------------------+-------------------------------------------+
| Unscheduled: confirmation follow-up / owner / missing date    |
| Selected task drawer: dates, dependency, actual events, reason|
+--------------------------------------------------------------+
```

Tradeoff: A optimizes frequent substantive review and retains exact-content context. B exposes workload and milestone sequencing but can hide fine-grained review work if used as the only home. Use A as the default daily R2 view and B under Plan/Progress; both resolve the same WorkItem IDs. Schedule change edits planned dates only. A critical path needs a complete valid dependency model and is not implied by drawing connector lines.

## Connected screen application

| Audit context | Applied external patterns | Domain action preserved |
|---|---|---|
| R1 home / S01 | 001,007,009,017,018 | Open preparation/returned work; personal task closure does not clear notes. |
| R2 delivery/review / S01/S19 | 002,004,005,008,010 | Inspect exact submitted work; assign, return and clear within delegation. |
| R3 decisions / S04/S20 | 007,010,019 | Significant decision, acceptance or release in its owning workspace. |
| R4 assigned quality / S19/S21 | 007,010,018,019 | Assigned quality concern/confirmation; formal EQR classification remains separate. |
| Team plan / S05 | 004,005,018 | Amend planned dates with reason; actual event dates retained. |
| Client/enquiry / S02 | 013,014 | Save incomplete enquiry/current context without fabricating acceptance. |
| Methodology / S06 | 011,012,016 | Draft, publish and explicitly adopt a selected template version. |
| Workpaper / S07 | 008,015,016,017 | Typed/repeating responses, source anchor, submission and exact-revision review. |

These are design mappings, not assertions that all listed patterns have been implemented. The app's source/coverage record must state which behaviors actually shipped and which remain simulated, partial or deferred.

## Twenty pattern cards

`external-patterns.json` is the canonical machine-readable card set. Each card supplies the source locator/access date, evidence class, trigger/mechanism, target role/cases/screens, data/authority, edge states, effort, decision and verification.

| Pattern | Product | Decision | Audit target |
|---|---|---|
| EXT-PAT-001 Durable role work views | Linear | adopt | S01/S19 - Name personal views Today, Returned and Waiting on others; save predicates over shared work items. |
| EXT-PAT-002 Temporary work peek | Linear | adapt | S19/S07 - Keep the selected exact revision in a right inspector with the queue and scroll position visible. |
| EXT-PAT-003 Scoped view links | Linear | adopt | S01/S25 - Use stable deep links with safe denied states; resolve scope before record metadata. |
| EXT-PAT-004 Visible unscheduled tray | Asana | adopt | S05 - Add an Unscheduled list beside the Gantt with owner, estimate and missing-date cue. |
| EXT-PAT-005 One task across planning views | Asana | adopt | S01/S05 - Use one WorkItem schedule projected into list, Gantt and calendar. |
| EXT-PAT-006 Controlled bulk rescheduling | Asana | defer | S05 - Design a before/after impact preview and reason before enabling multi-task date changes. |
| EXT-PAT-007 Purpose-specific columns | Notion | adapt | S01/S04/S19 - Show result/evidence columns to preparation, revision/note columns to review, decisions to partner. |
| EXT-PAT-008 Side-peek or full detail | Notion | adapt | S07/S19 - Default review to side detail on wide screens, with Expand and a reliable return route. |
| EXT-PAT-009 Personal versus shared filters | Notion | adopt | S01/S19 - Separate transient filters, my saved view and an authorized shared-team view. |
| EXT-PAT-010 Role-purpose interfaces | Airtable | adapt | S01/S04/S25 - Compose different landing navigation for prepare, coordinate/review, decide and quality scope. |
| EXT-PAT-011 Builder and end-user separation | Airtable | adopt | S06/S25 - Give an explicit template-scoped author grant and distinct publication/adoption actions. |
| EXT-PAT-012 Choose a useful form family | Airtable | adapt | S06/S07 - Choose questionnaire, programme, schedule or document families from inspected source contracts. |
| EXT-PAT-013 Separate shared facts from period context | Attio | adapt | S02/S04 - Keep client identity/source facts separate from current-period acceptance, assignments and outcomes. |
| EXT-PAT-014 Consistent table/board state | Attio | adapt | S01/S05 - Project the same task status into table and board; contextual actions own transitions. |
| EXT-PAT-015 Distinct review decisions | GitHub | adapt | S19/S20 - Give clear Respond, Return and Clear/review actions bound to exact work and actual authority. |
| EXT-PAT-016 Anchored change discussion | GitHub | adapt | S07/S19 - Anchor audit feedback to stable field/row/evidence locations and show old/new values. |
| EXT-PAT-017 Planning panel beside work | Google Calendar and Tasks | adapt | S01/S05/S07 - Provide agenda/task detail beside the owning work, with a full calendar destination. |
| EXT-PAT-018 Task deadlines differ from appointments | Google Calendar and Tasks | adopt | S01/S05 - Use distinct deadline, meeting, review booking and focus-block event types. |
| EXT-PAT-019 Relevant activity instead of every edit | Slack | adapt | S01/S19 - Group actionable notices by returned work, review request, dependency and decision, each opening exact context. |
| EXT-PAT-020 Quiet hours without changing work | Slack | defer | S01/S25 - Specify per-user notification timing separately from business deadlines and mandatory escalation policy. |

## Coherent component specification

Use one primary navigation registry assembled by capability and scope, with personal work first. Global scope and engagement scope are visibly distinct. Role context changes destination/actions, not only avatar color. Status uses readable text plus a restrained marker; red is reserved for actionable failures/overdue flags rather than every unfinished item. Preserve long Mongolian labels and source references.

Tables have stable reference/title columns, consistent row padding, readable dates and an explicit selected state. View tabs retain query/sort/group/selection context. Filters expose their active predicates and offer Reset. A personal filter never edits shared work or grants another engagement. Inspector/full-page forms share the same action validation and object identity.

Calendar event types distinguish task deadline, meeting, review booking, fieldwork and focus block. Undated work is visible. One state update feeds task list, calendar, timeline and counts. Actual event timestamps are read-only historical events in ordinary planning. Record an authorized plan change reason without inventing legal deadline labels.

Save state is explicit: unsaved, saving, saved, failed. A failed write preserves input. Unknown/empty/unavailable/denied are different states. A return creates a real next owner and scoped notice. Review reply is not clearance. Template publication is not engagement adoption. No local visibility setting is represented as server authorization.

## Validation and evidence to collect

Use the same fictional engagement and task population before/after. Measure time to locate assigned work, navigation/context switches, retention of queue position, duplicate entry, recovery after failed save and completion of the correct domain action. These are proposed evaluation measures; no comparative timings were collected in this documentation pass.

Priority scenarios: save/reopen Returned; peek item three and restore position; leave a note unsaved then navigate; schedule an undated task and inspect calendar/list consistency; move a focus block without moving the deadline; respond without clearing; change a reviewed field and inspect old/new versions; revoke a deep link; publish without automatic adoption; mark a notice read without completing work.

## Deferred transfers

Bulk rescheduling (EXT-PAT-006) needs a complete plan-impact policy, controlled reporting milestones and undo. Quiet-hours delivery (020) needs real notification infrastructure to have meaning beyond local preferences. External calendar synchronization, vendor AI/enrichment, unrestricted workflow builders and developer merge/release semantics are not inferred from these interface references.

All audit adaptations and effort ranges are analyst proposals. Each shipped behavior must be verified in the actual prototype and linked to the owning source criterion.
