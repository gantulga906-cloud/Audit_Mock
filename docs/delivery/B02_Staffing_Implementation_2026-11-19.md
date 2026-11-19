# B02 staffing, authority and specialist implementation

**As of:** 19 November 2026. **Starting commit:** `ddd5bf98377591bbd8233bcbc088e794cea0c287`. **State:** bounded engineering v1 implemented and tested; practitioner, browser/native-reader and operational acceptance remain separate. This is an implementation checkpoint, not a claim of completed financial-statement audit software or professional compliance.

## Delivered behavior

| Research handoff | Current implementation |
| --- | --- |
| D02-E01 / R-D02-01 / M36 | Several people may hold the same preparer/reviewer capacity, with person-specific appointment/grant checks across engagements. One overlapping accountable partner remains the selected profile. Account IDs and historical actors remain durable. An engagement without the preparer capacity does not need a phantom third participant. Named users require their own current independently evaluated independence declaration in the normal acceptance profile. |
| D02-E02 / R-D02-01 | Whole-workpaper lead preparer/reviewer plus multiple contributors/co-reviewers; explicit revision checks; selected multi-item transfer validated on a copy; actionable request ownership moves with selected work; historical answers, review notes, submittedBy, authorship and actual time remain. New recipients acknowledge their exact handoff before sign-off. Contributors can prepare; lead preparer submits; co-reviewers can return work; accountable lead reviewer approves. Substantive authors cannot become reviewers of that retained work. |
| D02-E03 / M35 | Explicit local-day calendars, unknown versus known zero, IANA time zones and integer elapsed minutes. Overlapping leave is unioned, not counted twice. Daily commitments span all recorded engagements; unauthorized clients are anonymous aggregate minutes. Daily/window load denominators remain explicit; no default work week or numerical audit-quality score. |
| D02-E04 / M35 | Exclusive alternatives against a versioned baseline; source/calendar/appointment/work revisions are rechecked. An optional explicit open-work transfer commits atomically with the selected allocation changes. A stale work preview cannot partially move allocations or queues. Original/revised budgets, exact complete-local-day time comparisons, provisional recorded-time variance and explicit remaining estimates are retained. Proxy records distinguish actual worker from recorder; corrections append and supersede, and actual UTC overlap checks remain cross-engagement. |
| D02-E05 / R-D02-03 | Issuer/type/credential ID, validity, manual evidence state, practice-scope/authority facts and actual verification reference/date/evaluator. Qualification originals support bounded PDF/PNG/JPEG upload and different-person file inspection; exact bytes remain scoped to authorized firm credential access. File inspection is distinct from an actual issuer check. Unsupported current practice authority and future verification dates are rejected. No live credential API is claimed. |
| D02-E06 / R-D02-04 | Required manual specialist route using the existing approved category-specific M06-F05 contributor record. Frozen selected-file manifest, external recipient, agreement/disclosure sources, purpose, exact versions/hashes, authorized outbound interval, attributable authorization and bounded ZIP export. Manual dispatch, unknown-send reconciliation and recipient confirmation are separate records. New original returns remain unaccepted until evidence review and the owning auditor evaluation occur. Revocation blocks future local exports and never claims remote deletion or recall. |
| D02-E07 | Optional external portal remains unoffered, as selected in the research plan. The required manual route is implemented; no external email/service delivery, authentication or digital signature was fabricated. |
| D02-E08 | Engineering fixtures and existing regression checks executed. Actual auditors have not performed or signed the practitioner acceptance protocol. |

## Authority and transitions

| Actions | Current actual guard |
| --- | --- |
| `work-assign`, `work-transfer` | Scoped appointed senior/reviewer or partner; every target is an authorized named member with an appropriate current appointment and, in the normal acceptance profile, current personal independence evaluation. Exact per-item revisions and self-review guards apply. |
| `work-acknowledge` | The actual current named recipient, exact assignment revision; no professional approval is inferred from acknowledgement. |
| Save / submit / return / final review | Assigned scope, current source/appointment, role-specific command guard and retained authorship. Current lead alone submits/finally approves; own substantive work cannot be reviewed. |
| `capacity-*` | Authorized firm-planning senior/reviewer or partner; allocation targets must be visible engagements with exact worker/date appointments. Hidden work remains aggregate-only. Scenario commit also checks each explicitly selected engagement's current revision. |
| `effort-log` | Current scoped worker, or appointed senior/partner expressly recording another current appointed worker with proxy basis. Actual worker, recorder and correction lineage remain distinct. |
| `credential-document-*` | Authorized firm roster senior/reviewer or partner. An uploader cannot independently inspect the same file. Ordinary engagement and preparer endpoints cannot retrieve firm qualification originals. |
| `specialist-packet-*`, packet export | Scoped appointed senior/reviewer or partner in an open engagement. No wildcard/current-or-future file grant; current exact originals and contributor/recipient/authority versions are rechecked. Recipient receives no team account or report authority. |

Adding team/resource/declaration facts renews the existing G01 acceptance basis. The normal-profile fixture explicitly reassesses and independently reapproves those changes. Routine work-only reassignment among already approved people does not rewrite acceptance or earlier audit work. A named account representing the exact canonical person recorded on a historical shared-role assessment can author its successor; the original assessment and actor labels remain in history. Ambiguous historical actors are not merged by display name.

New work assignment contracts use version 2 while legacy owner/reviewer records remain readable. Whole-paper scope is the supported unit; simultaneous field/section permission partitioning and arbitrary custom role bundles remain later D03/D10 work. Each local account retains a primary capacity; a senior can prepare one work item and independently review different work through named assignment.

## Method and data boundaries

`scripts/pilot-capacity-method.mjs` is a runtime port of D02-M35-v1, tested against all 37 separately recorded numerical/exception fixtures. It does not import the research calculator. The owning commands bind its inputs to actual stored appointments, calendars, allocations, budgets and time records. Source hash, credential issuer check, auditor resource-sufficiency judgment and professional acceptance are distinct claims.

Draft plans may show overbooking or unknown availability. This bounded v1 requires supported nonoverbooked capacity for committed plans; the optional approved-overbooking exception route and optimization solver are not offered. Recorded capacity is complete only to the entered planning population; it is not automatic proof of all firm commitments or legal working-hour compliance. Existing aggregate staffing limits remain in place.

Time comparisons require complete local-day boundaries, explicit coverage and matching daily planned scope. Missing daily planning cannot become zero. Partial/unsubmitted actuals stay provisional/unknown. Budget original/revised versions and recorded comparison inputs remain available. No fee, salary, cost or profitability engine was introduced. The UI states the browser-clock conversion used for entry and the worker zone used for appointment dates; direct API timestamps retain explicit offsets.

Specialist packets include at most 50 explicitly selected originals and 25 MB in the supported export profile. ZIP exports contain only those exact copies and the recipient manifest. Export read logs are stored separately from engagement content revisions. Provider access, encrypted/recipient-restricted transfer and actual observations remain the channel owner's responsibility; recording a send is not sending a message. Current report wording, signatures and opinions remain under their existing separate controls.

New capacity, credential-document metadata and specialist-export log tables are included in backup verification. Source catalogues, repaired workbooks, research assignments and historical checkpoint evidence were not rewritten. Broader firm HR/payroll and external integrations remain deferred.

## Verification

- `npm run test:team-foundations`: 100 tests in the main group plus 8 selected named-identity regressions passed. This includes 37 M35 fixtures, 8 connected B02 scenarios, all 70 source form contracts, normal acceptance/reassessment, proxy/correction/zone boundaries, atomic failed transfers, exclusive/stale scenarios, qualification-file scope, exact specialist ZIP contents and manual return states.
- A final targeted credential regression additionally checks that an unclassified credential cannot claim current practice authority without its source. No extra distinct test count is added for this rerun.
- TypeScript checking passed against the unchanged dependency installation. Source identity sets and all five workbook hashes match the pinned baseline. Whitespace checks passed.
- API tests execute the actual handler, authorization and SQLite transactions using the optional test-only in-process transport. A real loopback migration/workload test was previously blocked by the host's `connect EACCES` policy; it was not counted as passed. Browser rendering, live HTTP, native Office readers, practitioner acceptance and representative production operation remain unperformed for this checkpoint.

Reproduction with installed project dependencies: `npm run test:team-foundations`, `npm run typecheck`, and `npm run verify:audit-baseline`. Add `--source-root <read-only-workbook-directory>` directly to `scripts/verify-audit-baseline.mjs` to recheck original working workbook bytes. No release-ready flag, main merge or deployment was performed.

**Next dependency-ready engineering batch:** B03, form-family extensions, native XLSX/DOCX outputs and all 20 typed reliance edges; B04 remains dependent on the named authority and shared foundation delivered here.
