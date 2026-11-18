# Audit_Mock status after redesign

11 November 2026. Review only. Application baseline: `9909b218930de4796c6e1a6f31cac5bbdbc6c77e`, branch `redesign/enterprise-workspace`.

The existing service implementations and recorded source coverage survived the redesign. Two navigation/error-recovery regressions were reproduced. Full feature-by-feature browser parity remains open. Functional development can resume after a small preservation repair batch; another design programme is unnecessary for that work.

No application source, acceptance decisions, working databases, branches or GitHub refs were changed during this review. Verification ran in a disposable checkout with synthetic databases and isolated browser profiles. The running preview's database was not used for test writes. Review documents and evidence were created outside `audit_mock`.

## 1. Reconciled starting point

| Checkpoint | Identity | Meaning |
|---|---|---|
| Previous functional baseline | `25486b7448e6e5fc4d830868de943962209db3f3` | Latest later-fact/reissue implementation before redesign |
| Current local implementation | `9909b218930de4796c6e1a6f31cac5bbdbc6c77e` | One redesign commit after the functional baseline |
| Remote draft PR #6 | `wave-0-audit-controls`, head `937e692c7e43e5338575aeddfd5b53c1c083fa50` | Still open/draft when checked; redesign has not been pushed |
| PR base/main | `69f0548de5f897127be671bba81cc61cfd524dfe` | Older than the accumulated shared-pilot work; do not resume from main and accidentally lose that work |
| New verification checkout | `work/audit-status-review-2026-11-11` | Disposable local clone of current redesign commit |
| Verification build | See `Verification_Current.json` | Fresh clean production build of that checkout, separate from the running preview |

[Draft PR #6](https://github.com/gantulga906-cloud/Audit_Mock/pull/6) was read through the GitHub connector. The earlier baseline-to-remote file equality is recorded by the redesign research; this review confirms the PR head remains that same SHA. Local pre/post preservation is checked directly using Git blob identities.

The deliberately requested chat **Assess traditional coding tradeoffs** was read using the desktop chat tool. Its latest 12 turns were reviewed, including the detailed remaining-work discussion and the preceding implementation updates. The latest relevant conclusions were:

- Working functional baseline was `25486b7`, with 58 tests and four connected source lifecycle fixtures.
- A08 materiality, A11 data intake, A25 review/quality and the issued/sealed A28 later-fact route were the four fixtures.
- The proposed next functional batch was **A26 reporting plus A27 assembly/custody**, developed together and verified separately by cycle.
- Earlier waves had working reference paths and substantive remaining business behavior. Their labels were not evidence of complete coverage.
- The approximately 65% estimate was expressly withdrawn as a verified completion measure in the later explanation.
- Older notes saying independent quality/custody, scoped materiality or active terms amendments were absent had been superseded by later code and tests.

Historical instructions to continue implementation do not override the current review-only request. Selected messages are preserved in `Development_Chat_Evidence.json`.

## 2. Did redesign remove implemented work?

### Preserved in code and regression evidence

The redesign changes 18 tracked files. All 54 pre-existing files selected for the service/library/data/source/test preservation check have identical Git blobs before and after it. This includes the pilot server/domain modules, every pre-existing `src/lib` and `src/data` file, source manifest, coverage ledger and existing tests. See `Code_Preservation_Check.json` for the complete path/hash list.

No literal workflow command disappeared from the five modified existing components:

| Component | Distinct literal commands before | After | Removed |
|---|---:|---:|---:|
| Main shared workspace | 31 | 31 | 0 |
| Controlled form library | 6 | 6 | 0 |
| Independent-role/recipient screens | 7 | 7 | 0 |
| Register editor | 2 | 2 | 0 |
| Delivery visual components | 0 | 0 | 0 |

This comparison covers literal `action` attributes and `run(...)` calls in changed components. It is not a count of all features, nor proof that every control is reachable in every state. Nested unchanged desks retain their own commands.

The original `AuditWorkspaceV2` implementation, its automation functions and browser-state files were not changed. `/legacy` renders that original component. `/` and `/pilot` now render the shared service application. Preserving the older code and storage is different from migrating every older interaction to shared records. No automatic browser-state-to-SQLite migration was implemented.

### Confirmed redesign regressions, left unfixed

**FR-01 — Invalid engagement link loses typed error recovery and retains stale URL context. Priority P1.**

The request helper now throws a plain `Error` for every HTTP 404 at [pilot-workspace.tsx:72](C:/Users/Zoloo/.codex/.chatgpt-projects/g-p-6a66a9aa57e88191a4efe80e2002a0a4/audit_mock/src/components/pilot-workspace.tsx:72). The existing fallback at line 472 requires `PilotRequestError` with status 404, so that fallback is unreachable for this response. A fresh authenticated navigation to a nonexistent synthetic engagement produced the generic connection-error screen. The explicit retry loaded firm scope but left the nonexistent engagement ID in the URL. This is an error/context recovery regression, not an access bypass or record deletion.

Expected repair: retain structured API status for actual API errors, distinguish an unavailable server from an unavailable engagement, and canonicalise the URL and selected scope after recovery. Test missing, revoked and inaccessible engagement links without exposing private metadata. Evidence: `probes/targeted-findings.json`, `probes/missing-engagement.png`.

**FR-02 — Returned-work metric opens the submitted-review filter. Priority P2.**

In a fresh preparer session with one returned workpaper, the “Буцаасан / өөрчлөгдсөн” metric displayed that count. Clicking it opened `view=review`, whose default filter is `review`. That filter selects `reviewable` papers rather than returned/changed papers, so the table was empty. Selecting the returned tab manually still finds the work. The return workflow and record exist; the shortcut points to the wrong list state.

Expected repair: pass an explicit attention/filter state or use a dedicated returned-work destination, align counts with the resulting queue and retain context on return. Test preparer/reviewer/partner roles and persisted filters. Evidence: `probes/targeted-findings.json`, `probes/returned-shortcut.png`; owning code is `enterprise-workspace.tsx` lines 66 and 79.

### Remaining preservation uncertainty

The fresh normal browser journey passed eight checks. It does not cover the entire old daily workflow, all 70 form families, all report/custody branches, every permission-denial case or full Office preview fidelity. A command surviving in source does not establish full UI parity. The preservation repair batch must also map major controls to their current owning destinations and identify anything available only in `/legacy`.

## 3. Fresh verification and source coverage

`node scripts/verify-release.mjs --build` completed in the disposable checkout. All 60 tests passed, with no failed or skipped tests, a current clean build, and zero lifecycle evidence errors. The 58 previous tests remain; the two additions concern navigation identity/attention classification. They do not add source lifecycle coverage.

| Measure | Before redesign | Fresh current result | Interpretation |
|---|---:|---:|---|
| Automated tests passing | 58 | 60 | Two navigation tests added |
| Connected lifecycle fixtures | 4 / 51 | 4 / 51 | A08, A11, A25, A28 preserved |
| Directly evidenced E2E steps | 48 / 476 | 48 / 476 | No new source-step closure from redesign |
| Directly evidenced criteria | 59 / 315 | 59 / 315 | No lost or new criterion fixture coverage |
| Feature rows with mapped partial evidence | 36 / 136 | 36 / 136 | Not completed feature totals |
| Automation rows with mapped partial evidence | 33 / 58 | 33 / 58 | Other rows need inspection; no mapping does not prove no code |
| Dependencies with mapped partial evidence | 2 / 20 | 2 / 20 | Full dependency closure remains open |
| Independently accepted contracts | 0 | 0 | Acceptance manifest is still empty |
| Formal BPMN closure | 0 / 1,012 | 0 / 1,012 | 185 gateways and 827 flows remain to reconcile |
| Release ready | false | false | Passing tests/build are not a complete source release |

All **2,247** source-report rows retain their IDs, scope, evidence status and source-row hashes compared with the saved pre-redesign verification baseline. No feature, automation minimum, form, variant, dependency, transition or operational row was silently removed or relabelled accepted.

The four fixture branch counts are A08: 5, A11: 7, A25: 7 and A28: 5. Each covers nine source steps on its recorded route. Broader direct evidence totals 48 steps because some other steps are exercised in reference scenarios without completing their whole lifecycle.

The older `current-coverage-summary.json` contains labels for seven bounded automation demos and 51 unimplemented engines in the earlier browser-local coverage layer. Those labels must not be substituted for the current shared service inventory. The fresh source verifier maps partial evidence to 33 automation minimums. That is also not a count of 33 completed engines. Use the exact current contract, owning implementation and bounded evidence together.

`node scripts/verify-workspace-ui.mjs` also passed in the disposable checkout with eight checks, 13 screenshots and no recorded runtime exceptions. The targeted review then reproduced FR-01 and FR-02. These additional probes demonstrate why a passing representative browser journey is not a universal regression guarantee.

Verification setup initially lacked the dependency junction, so its first build attempt failed with module-not-found after the 60 tests passed. After the junction was available, the complete verifier was rerun successfully. This was a disposable-checkout setup issue; the final evidence records `buildCurrent=true`. No dependency installation or application repair was performed.

## 4. Source editions and inventory

The attached remaining-work Markdown matches the workspace's saved 11 November plan exactly. The supplied plan ZIP was inventoried. The original materials ZIP, its 17 recorded top-level members and the five repaired workbooks all match their recorded SHA-256 values: **23 of 23 recorded inputs match**. The nested grounded specification contains 42 register CSV tables, whose row counts and columns were reopened and inventoried.

The five workbook structures were read directly. All 70 registered form sheets were found:

| Stage | Form sheets | Formula cells in workbook | Validation objects in workbook |
|---|---:|---:|---:|
| 1 | 11 | 9 | 131 |
| 2 | 16 | 5 | 146 |
| 3 | 31 | 233 | 1,148 |
| 4 | 11 | 25 | 362 |
| 5 | 1 | 0 | 33 |
| Total | 70 | 272 | 1,820 |

These are source structure counts. Some formulas/validations concern layout or numbering; each must be classified before treating it as a business behavior obligation. Merely loading a form contract does not prove faithful repeated rows, calculations, validation, applicability or downstream effects.

The source commitment remains **127 core features and 58 automation minimums**, with eight conditional M11 features, excluded M03-F07 canonical consolidation, 58 separately scoped future automation rows, 22 fieldwork variants and 20 confirmed form references. The 51-cycle inventory includes 30 A, 16 B and five C cycles. A29, wider firm work and separate services need their preserved mandate decisions. The verifier currently treats all 51 as applicable because no approved lifecycle scope decisions have been recorded; this does not establish a business mandate for every wider service.

Source reading here combines direct archive/workbook inventory, exact edition comparison, current normalized requirements and the retained original plan. A new page-by-page visual/semantic acceptance of every guide, PDF, ERD, ontology and BPMN diagram is not claimed. Where interpretation affects implementation, reopen the exact original page/cell/diagram under its owning task.

## 5. Actual working capabilities and remaining depth

| Capability | Current working implementation/evidence | Remaining work |
|---|---|---|
| Shared records and access | SQLite, scoped engagement revisions, authenticated commands, retry keys, membership/revocation and historical packages | Dynamic named accounts, broader delegation, complete UI/direct-link access matrix, deployment |
| Intake and terms | Client/enquiry records, contact history, confirmed subsequent period, exact signed terms, active amendment hold/reapproval | Complete A01–A03 alternatives, continuing independence, conditional/declined/withdrawal cases |
| Staffing and planning | Approved roster/credential/seat capacity, assignments, tasks/calendar/Gantt; one risk/procedure programme decision | Actual effort, richer authority, many-risk/many-procedure tailoring, controls/opening-balance depth |
| Forms and builder | All 70 contracts load; typed saves, independent review, form grants, controlled publication, explicit adoption and structured Excel import | Complete form fidelity, operative workbook behavior, import mapping/comparison, retirement, compatible/incompatible adoption |
| Data and evidence | Accepted originals, scoped CSV import, quarantine, independent controls, statement bridge, multipart requests and sandbox confirmation | Ledger/TB and master-data integrity, additional supported profiles, evidence anchors/alternatives, actual external adapters |
| Materiality | Reviewed rationale/evidence, calculated thresholds, explicit area-specific amounts, downstream staleness; A08 fixture preserved | Source-required human override/candidate distinction and all policy contexts; see FG-02 below |
| Sampling and journals | Approved population/design, reproducible selected rows, tested-unit evidence/findings, filter investigations and staleness | Uniform-draw validation, minimum ratio projection, journal fingerprint/trigger coverage; see FG-01 |
| Commercial and asset work | Supported single-currency/exact-reference sales, receivables, purchases, bank, inventory and asset checks | Revenue schedules, supplier identities, alternative unique matching, costing/NRV, useful-life and capitalization profiles |
| Statutory and financing | Named accepted synthetic editions, supported payroll/tax/loan/lease/FX/equity/investment calculations | Complete each minimum's declared profiles and invalid/unsupported cases; no automatic law/rate assumptions |
| Technical matters | Related-party/estimate/component records, reviewed sources and targeted reopening | Full supplied consolidation/intercompany minimum, fraud, going concern, legal/contingency and specialist cases |
| Completion and review | Findings, partial posting verification, aggregate evaluation, representations, communication outcomes, exact notes/consultation and independent EQR | Complete A19–A25/A30 variants, final statement/disclosure/report decision consistency and all material branches |
| Reporting and custody | Exact authorization, local signature, recipient download/receipt, locked package, grants/holds/successors/backup; issued/sealed A28 fixture | Connected A26/A27 completeness, assembly/retention distinctions, additional A28 timing and dual-dating variants |

### Specific pre-existing gaps sharpened by this review

**FG-01 — AUTO-047 minimum is deeper than deterministic selection.** `selectSample` at `src/lib/workspace.ts:118` uses Fisher–Yates with `s % (i+1)`. Direct modulo reduction is biased when the PRNG range is not divisible by the pool size. The source minimum specifies uniform draws. The shared sampling action records selection, unit tests and findings but no simple ratio-projection workflow was found in that action/view. Both points existed before redesign; the relevant files are unchanged. Implement a named versioned unbiased selection method while retaining old selections, and the approved minimum projection including denominator, incomplete-test, mixed-sign and double-counting guards. Stratified/MUS/confidence methods are explicitly outside this minimum and must not be added as mandatory scope by vague references to “statistical sampling.”

**FG-02 — AUTO-046 requires candidate and selected/overridden amounts to remain distinct.** `materiality` at `src/lib/workspace.ts:119` calculates overall from benchmark × percentage and derives performance/trivial amounts from that result. The current materiality basis adds narrative/evidence and explicit specific thresholds, but there is no explicit overall/performance/trivial override path in this active calculator. The source output includes calculated and overridden thresholds with rationale. Reconcile and implement that distinction, declared bases and downstream reliance without rebuilding the existing A08 flow. This is a pre-existing source-depth gap, not a redesign regression.

Other listed gaps are established by source requirements, current code and prior bounded implementation notes; they are not a claim that every unmapped requirement has no implementation. `Automation_Status.json` preserves all 58 exact minimum contracts and current mapped evidence for inspection.

## 6. What changes in the development plan

1. Pause visual redesign work at the current checkpoint. Keep its remaining formal acceptance visible.
2. Add a small functional preservation batch for FR-01/FR-02 and the outstanding action/legacy parity inventory.
3. Resume the previously selected **A26/A27** connected reporting/custody batch, reusing the working A25/A28 controls.
4. Complete source-faithful forms, method gaps, linked facts and operational identities incrementally, then earlier lifecycle and fieldwork breadth in connected batches.
5. Keep R23 source reconciliation and genuine independent acceptance running throughout, with R22 deployment/integration decisions made early enough to avoid later rework.

The companion **Audit_Mock_Further_Development_Plan_2026-11-11.md** defines the batches, completion evidence and continuation order. **Updated_Development_Backlog.json** retains all 25 original packages and 128 original task IDs and texts, adding checkpoint status and execution guidance. It also records new review findings separately. No old task is silently deleted or marked fully complete.

## 7. Review evidence

- `Verification_Current.json`: full fresh source verifier report, including tests, build and 2,247 source rows.
- `Verification_Comparison.json`: pre/post counts and row-level identity/scope/status/hash comparison.
- `Code_Preservation_Check.json`: changed paths, unchanged critical blobs and command comparison.
- `Source_Input_Check.json`: original file/member hashes, workbook structure and nested register inventory.
- `Development_Chat_Evidence.json`: historical user messages and final answers from the latest 12 turns.
- `browser/verification.json`: fresh representative browser regression result.
- `probes/targeted-findings.json`: two confirmed unfixed UI regressions, with screenshots.

The conclusion is preservation of working service code and recorded technical coverage, with two specific interface regressions and remaining parity/acceptance work. There is no evidence of a removed automation engine in this redesign. That conclusion is narrower and better supported than claiming that every existing feature has been revalidated through the new screens.
