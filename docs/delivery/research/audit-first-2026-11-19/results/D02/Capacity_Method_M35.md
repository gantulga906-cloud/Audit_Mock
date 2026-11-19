# M35 — capacity, budgets, effort and alternative scenarios

**Version:** D02-M35-v1, 19 November 2026. **Decision:** deterministic daily capacity arithmetic, with explicit calendars and versioned alternatives. No optimization engine, payroll calculation, default 40-hour week, utilization target or audit-quality score. ISA 220 (Revised).25–28 and ISQM 1.32 require sufficient appropriate resources/time; they do not prescribe these formulas or a numerical quality threshold. The formulas below are product definitions with transparent independent examples.

## Input and grain

`M35_Input_Schema.json` describes the reproducible reference input. The owning production records supply the same facts; the research calculator is not imported by the app.

| Input | Grain / type / unit | Required meaning |
| --- | --- | --- |
| Calendar | person × local date × calendar revision | IANA time-zone identifier; scheduled and unavailable [start,end) intervals measured in actual elapsed minutes from that local day's start. Minutes are integers; dayMinutes states actual day length, normally 1440. Overnight shifts split at local midnight; DST wall-clock ambiguities resolve to explicit UTC instants before conversion. No assumed 24-hour duration for every date. |
| Missing calendar | person × date, schedule=null | Unknown availability; never convert to zero or assume a standard day. Known nonworking date uses schedule=[]. |
| Unavailable time | person × date × interval | Holiday, approved leave, training or other unavailable period. Union overlap and clip to scheduled intervals, so leave on a holiday is not deducted twice. Non-audit work either reduces availability or is an allocation, never both. |
| Allocation | unique allocation ID × person × engagement/work × local date | Nonnegative integer planned minutes; committed or proposed. Version/supersession and exact affected dates belong to owning allocation records. Unspread total hours cannot establish a daily capacity conclusion; retain total budget and require an explicit daily distribution. |
| Scenario | scenario ID/revision, base allocation revision, removeIds[], add[] | One complete alternative against the same committed baseline. Additions are provisional until committed. No summation of mutually exclusive alternatives. |
| Actual entry | worker × engagement/work × UTC interval, current correction version | Real elapsed minutes, submission/approval state, recorder/proxy, source appointment version. Split at worker-local midnight for daily comparison, retain original UTC interval. Reject negative, future or overlapping current intervals for the same person across all engagements. |
| Timesheet coverage | person × date × status | complete / partial / unsubmitted; entered zero is valid only with explicit coverage. Draft/submitted/approved actuals shown separately; actuals never silently increase available capacity. |
| Budget snapshot | engagement/work × baseline revision × comparison scope | Nonnegative minutes, effective approval and named scope. Original baseline and approved revision remain available; an estimate-to-complete is separate. |

Manual daily available-minute entry is allowed with source/evaluator and explicit missing/zero states. Calendar import can follow the same simple file pattern as D01; no HR/leave API is a prerequisite. V1 has named users, effective-dated calendars and explicit daily allocations; an automated scheduling solver is unnecessary.

## Exact definitions

For person p and date d, S is union of scheduled intervals and U is union of unavailable intervals. `available A(p,d) = duration(S) − duration(S ∩ U)`. Intervals touching at endpoints do not overlap. Unknown S produces null A.

For a selected scenario s, `live(s) = committed baseline minus explicitly replaced allocation IDs plus s.add`. Reject unknown removal IDs, duplicate allocation IDs and scenario additions colliding with retained IDs. Removing an allocation affects future planned effort only; actuals and past snapshots remain unchanged. A partially transferred row is explicitly split into retained and replacement rows in the preview.

`planned P(p,d,s) = sum(live allocations' minutes)`; `headroom H = A − P` (signed); `overbooked O = max(P − A,0)`; `load % = 100 × P/A` only when A > 0. When A=0, load%=null with zero-capacity flag if P>0. Unknown A yields null headroom/overbooking/load and an unknown-capacity flag. Display two decimals; calculations retain integer minutes and unrounded ratios. Never average daily percentages: window load uses sum(P)/sum(A) only if every included availability is known and total A>0. Window overbooking is **sum daily O**; net weekly headroom cannot hide a daily collision.

Overlap of date ranges is not proof of double-booking. Two engagements can share one day if their combined daily minutes fit. If appointments require simultaneous attendance, capture exact UTC intervals and test those separately; a daily 100% plan cannot prove two simultaneous meetings are feasible.

For equal date/person/work scope and same actual cutoff: `effort variance = actual-to-date − planned-to-date`; `variance % = 100 × variance/planned-to-date` only when planned-to-date>0. An incomplete timesheet yields a **provisional recorded-time variance**, not a complete cost/efficiency conclusion. Complete zero time is distinguishable from no submission. Do not compare a partial period with an undated full-engagement budget and call it an overrun.

`budget revision delta = approved revised budget − original budget`; denominator is original budget when >0. `forecast-at-completion = recorded actual + explicit remaining estimate`; `forecast variance = forecast-at-completion − current approved total budget`, marked provisional where actuals are incomplete. Remaining estimate excludes work already included in actuals. Raw actual-versus-total-budget is separately labelled consumed budget; never assume an unfinished engagement's final variance. No cost/profit amount without separately authorized rates, currencies and rate dates; D13 finance is not advanced here.

## Conflict and commit behavior

Draft scenarios may be overbooked and are useful comparisons. Proposed default for a **committed** plan: any daily overbooking, simultaneous attendance conflict or unknown availability needs an explicit resolution before its resource-sufficiency decision can be positive. Senior can reschedule, reassign, reduce scope only through authorized audit-scope decisions, update supported calendar capacity, or record a bounded capacity exception with partner approval, reason, compensating resource plan and expiry. An exception acknowledges the planning risk; it does not change minutes, suppress the warning, establish legal working hours, waive ethics/authority or certify sufficient audit resources. No invented 80% threshold. The current aggregate-capacity hard guard stays in place until the replacement daily guard and exception workflow are verified.

Commit is transactional across affected allocations and engagement queues: compare baseline/calendar/assignment revisions, apply exactly one selected scenario, recompute conflicts against **all** current engagements, then store the new baseline and approval. Another manager's intervening booking causes a stale-preview response, not silent last-write-wins. A cross-engagement conflict can disclose total busy minutes and dates without disclosing unauthorized client/work identities. Role labels must not cause the same person to be counted twice.

## Worked independent expectations

`M35_Fixtures.json` contains fixed expected numbers and arithmetic notes authored separately from `reference_calculator.cjs`. Examples include 480 scheduled minutes minus union of overlapping 120-minute absence intervals = 300 available minutes; two engagements of 180 and 150 minutes = 330 planned, 30 overbooked, 110% load. Moving 60 minutes to a second person changes planned totals to 270 and 60, without moving historical actuals.

Other fixtures cover part-time work, holiday/leave overlap, split shifts, zero/missing availability, alternative-not-additive scenarios, superseding time corrections, date/cutoff mismatch, changed budgets, explicit remaining estimates and invalid data. The validation runner compares all expected outputs, including null and rejection outcomes; an arithmetic check is not an independent human signature. Actual named method approver/checker remains a normal implementation governance record, not an unanswered formula question.
