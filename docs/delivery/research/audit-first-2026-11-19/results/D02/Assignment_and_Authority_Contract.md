# Assignment and authority contract — R-D02-01 / M36

**Status:** specified for implementation, 19 November 2026. Sources: A04; P03-UC02; 1.4.4; 1.4.6; ISA 220 (Revised) 12(d), 13–15, 25–34, 41; ISA 230.8–10; ISQM 1.31–32; ISQM 2.17–23. Field names below are a logical contract, not a second competing HR master.

## People, roles and cardinalities

| Record/grain | Required fields and relation | Invariant |
| --- | --- | --- |
| Person | firm_id, person_id, current roster version, display name, status, employment/contract relationship, canonical identity bindings | One durable person identity; name/title/login changes never change historical actors. Existing organization/HR remains the master where published. |
| Engagement access | grant_id, engagement_id, person_id, permitted actions, first/last effective instant, issuer, reason, revision, revocation | Access alone does not establish competence, appointment, preparation or approval. Ordinary engagement access is independent of EQR's non-team status. |
| Engagement appointment | appointment_id, engagement_id, person_id, capacity, team_member flag, work scope, start/end, supervisor, suitability decision/version, credential/evidence refs | Many people per engagement and many engagements per person. Several people may share preparer/reviewer/manager capacities. One accountable engagement partner at an instant in this v1; replacement closes prior appointment without rewriting it. Joint audit is not inferred. |
| Work assignment | assignment_id, engagement_id, work_id, person_id, capacity, lead flag, contribution scope, effective start/end, due date, planned_minutes, revision, status | Many assignments per item/person. For an active item: exactly one lead preparer and one accountable lead reviewer; other preparers/reviewers permitted. An unassigned draft is valid but cannot be submitted. A review-only item may use its owning review contract rather than fabricate preparation. |
| Work contribution | work_id, artifact version, section/procedure scope, canonical person_id, action, time, evidence refs | Every substantive author remains attributable. Submission never replaces all authors with the new lead. |
| Review | work_id, exact artifact version, review scope, reviewer person_id, appointment/grant revisions, conclusion, unresolved notes, time | Reviewer cannot approve own substantive contribution in the reviewed scope. Co-reviewers do not silently count as the final accountable reviewer. |
| Transfer event | command_id, old/new assignment revisions, exact affected items, transfer time, initiator, reason, handoff snapshot, queue effects | Atomic, idempotent and historical; no duplicated reservations or lost review notes. |

Preparer, reviewer, manager and partner are capacities held for an actual engagement/work scope, not fixed global login identities. A senior may prepare complex work and review other people's work. Multiple accounts for one person do not evade self-review restrictions. A manager may also be lead preparer but must use an eligible different reviewer for their substantive work. These independence guards are selected product controls; ISA 220 does not prescribe a universal three-person staffing minimum or require every small firm to have a separate manager.

EQR is a distinct appointment/access class. An engagement quality reviewer, and assistants under ISQM 2.20, must not be engagement-team members. Viewing the engagement through a restricted quality-review grant does not add them to the team. The form's printed quality-review row is not authority to let a team manager perform EQR. Apply ISQM 2.19's two-year cooling-off after being engagement partner, or a longer applicable ethical period. Record date basis and eligibility; do not reuse that rule as a universal cooling-off for every reviewer. The substantive EQR workflow remains its existing owning workflow; D02 supplies appointment eligibility and capacity only.

## Actions and authority

| Action | Permitted actor | Preconditions / result |
| --- | --- | --- |
| Maintain roster/credential evidence | Authorized firm administrator or delegated roster custodian | Record facts and evidence; no automatic audit authority or engagement clearance. |
| Add/reassign preparers and reviewers | Appointed senior/manager with allocate permission; engagement partner | Target is active, suitably assessed for assigned scope, has required declarations and appropriate authority. Ordinary transfer needs no second administrative approval. Self-appointment cannot create professional authority. |
| Replace engagement partner | Firm authority authorized to appoint engagement partners | Current local authority and suitability, named successor, effective handoff; no gap at a report authorization instant. |
| Appoint/replace EQR | Competent authorized appointing person under firm policy | Eligible outside-team reviewer, ethical/authority/time checks; cannot self-certify EQR eligibility and completion. |
| Edit assigned section | Current named preparer/contributor with edit permission | Exact version and contribution scope; optimistic concurrency; record author. |
| Submit item | Lead preparer or expressly delegated submitting contributor | Required contributions included, declarations current, review route exists; actual authors are retained. |
| Review/return/clear note | Assigned eligible reviewer for that scope | Exact current version, no self-approval, open notes preserved; final item approval by lead reviewer or expressly designated successor. |
| Prepare own timesheet | Named person, or authorized proxy recording actual worker and proxy identity | No overlap for the same worker across engagements; correction appends and supersedes. Proxy is never recorded as the worker. |
| Share specialist packet | Senior/manager with share permission; partner | Permissible purpose, authorized exact files and recipient; use Specialist_Access_Contract. Sharing grants no report/clearance capacity. |
| Issue/authorize audit opinion | Existing separately authorized partner workflow | Staffing changes cannot bypass its current evidence, ethics, review and EQR guards. |

Temporary absence uses an effective-dated substitute appointment and explicit assignment scope. Returning staff do not automatically regain transferred work. Firm-account administration remains separate from auditor judgment; an administrator cannot clear a threat, validate their own regulated authority or approve audit work merely because they manage logins.

## State and transfer semantics

Appointments: draft → active → ended; active → suspended → active only after a new suitability/access check. Declined/withdrawn drafts remain historical. Work assignment rows: proposed → active → completed/ended; replacement creates a successor and closes only the transferred future scope. Dates are instants with offsets; use half-open [start,end) intervals. UI date ranges convert to explicit local start and next-day end. No silent UTC-date truncation.

1. Senior selects specific items, open request responsibilities and future planned allocations; preview shows previous/new people, pending reviews, unresolved notes, permissions, capacity impact and omitted items. Default is **selected open work**, not all completed historical work.
2. Re-check command authority, target membership/eligibility and current assignment/artifact/calendar revisions at commit. A concurrent revoke or changed allocation rejects the stale command with a fresh preview; it never partially transfers queues.
3. At the effective instant close old assignment scope, create successors, replace the specified future allocation rows, move actionable queues and selected open requests, and store one transfer event. Preserve completed requests, actual time, submittedBy, contributions, evidence and every review/note author.
4. The recipient acknowledges outstanding scope/notes before the next submission/final review. Reassignment by itself does not alter audit answers or erase a completed independent review. Any new content version requires review of the changed scope under the owning workflow. Pending final decisions use current appointment/grant revisions; an old assignee's pending permission is not inherited.
5. Replacing the reviewer during review retains every open note. New reviewer may resolve prior notes with their own recorded evaluation. The new preparer cannot clear their own work by taking a reviewer capacity. Ineligibility facts relevant to prior work trigger an impact assessment; routine expiry later does not automatically void legitimate historical signatures.

On departure/revocation: deny new reads/writes promptly, list open work as requiring reassignment, preserve history, mark pending authority-dependent actions unavailable. Regrant restores permitted access only; it does not resurrect ended assignments, old release authorizations or stale handoffs. Future-dated departure leaves current authority until its effective instant unless separately revoked now.

## UI, export and migration

Staffing screen: named team, scope, lead/contributor/reviewer/partner distinctions, effective dates, manual suitability basis, credential/declaration links; no fixed number of rows. Work screen: all contributors, accountable leads, handoff state and open notes. Portfolio view: availability, committed/draft/actual effort and conflict reasons; hide unauthorized client names and work descriptions. EQR and specialists appear with their actual non-team category.

Exports contain durable IDs, human-readable names, capacity, effective interval, assignment and artifact revisions, authority/suitability basis, prior actors, actual-time corrections and handoff history. Export authorization applies to every included item/file; no firm-wide workbook is available through ordinary engagement membership.

Migrate existing three-slot appointments and work owner/reviewer fields to named rows with legacy IDs and original sign-off snapshots. Verify identity-to-person mapping; ambiguous records enter an explicit migration exception queue without merging actors by display name. Read compatibility remains until verified. No rewrite of historical submissions or conversion of an ordinary reviewer into EQR.
