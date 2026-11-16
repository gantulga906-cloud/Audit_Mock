# Functional continuation after redesign

11 November 2026. Implementation batch F0 and the F1 reference profile from the saved post-redesign development plan. Original sources, scope decisions and independent acceptance records remain unchanged.

## Delivered behavior

- **F0 — Recoverable navigation:** unavailable or revoked engagement links recover to the viewer's authorized firm context. HTTP status survives client parsing; recovery does not expose private engagement names. Returned-work metrics open the returned filter, and filter/stage survives opening a workpaper, returning and copying the URL.
- **F1 — Report preparation (M10-F10):** record the selected opinion/template, final statement revision, report date, addressee, signatory authority reference, approved template/methodology edition, accepted authority original and reporting-duty assessment. Independent approval binds these inputs. Changing them stales earlier authorization. The rendered report retains the approved addressee, signatory and edition.
- **F1 — Distribution:** preserve recipient attempts and outcome history. A partner records failed, uncertain or explicitly withdrawn attempts with a reference and reason. Uncertainty must be reconciled before another link is created. Failure permits a new link; the superseded link cannot acknowledge receipt. In the new preparation profile, each attempted recipient needs receipt or explicit withdrawal before locking, alongside existing signature/receipt controls.
- **F1 — Assembly (M12-F02):** index the exact issued report, final statements, signed key workpapers, related records and originals. Check missing bytes, hashes, signed versions, notes and reference closure. Preparation and independent approval pin the exact inventory and accepted policy original. Calculate a deadline from explicit policy anchor/calendar days and record late-completion explanations. Assembly completion, issue and locking are separate events.
- **F1 — Archive/custody:** retain the assembly, earlier authorizations, original evidence and review histories in the locked package. A custodian can return an unaccepted offer, including a corrupt manifest, with a discrepancy and corrective owner. Reoffering requires a resolution and retains earlier offers. Acceptance requires actual download and exact digest verification. Grants, expiry, revocation, holds, recovery and successor retention remain enforced.

The additions extend existing controlled registers and the authorization/archive model. Engagements without M10-F10 or M12-F02 retain earlier supported pilot paths; introducing those records enables their respective approval controls. Existing records and IDs are preserved. Delivery tables are extended on startup; back up an existing database before upgrading its running service.

## Principal actions and workspaces (F0-03)

This is the shared-product navigation/action inventory from code inspection and representative browser verification. It does not claim browser acceptance for every feature. Permissions and engagement state determine available controls.

| Destination | Owning actions and controls |
|---|---|
| **Миний ажил / My work** | Personal work/review queues; returned, blocked and reviewed metrics open the corresponding workpaper filters. |
| **Үйлчлүүлэгчид / Clients** | Firm client directory, enquiries, contacts, continuing-period confirmation, conversion, fresh engagement creation and engagement selection. Intake belongs to firm context. |
| **Ерөнхий тойм / Overview** | Engagement context, acceptance/activation, membership, signed terms/amendments, staffing/capacity and programme selection. |
| **Ажлын баримтууд / Workpapers** | Search/stage/status filters, full-page editor, save/submit, source preview, history, review notes/responses/clearance, exact-version review, dates and assignment. Sampling and area analytics open from their applicable paper. |
| **Нотлох баримт / Evidence** | Original-file upload/acceptance/version history and links; multi-part requests, issue/cancellation, received items, intended-use assessment, reopening and local confirmations. |
| **Өгөгдөл ба шинжилгээ / Data** | Population import/quarantine, independent controls, account-to-statement mapping/reconciliation; links to sampling, journal and area engines in owning papers. |
| **Төлөвлөгөө / Planning** | Shared calendar, deadlines, tasks, Gantt, planning/risk registers and approved programme decisions. A completed task does not approve audit work. |
| **Хяналт / Review** | Review queue and notes, exact-version review, consultation/judgment registers, independent quality policy/assignment and team responses. |
| **Дуусгалт ба тайлан / Completion** | Findings, management responses, verified postings/evaluation, sufficiency, communications, opinion/sections, M10-F10 preparation, statements/representations, report date, authorization, local signing, issue and recipient attempts/outcomes. |
| **Эцсийн файл / Final file** | M12-F02 assembly/index/diagnostics/approval, lock, grants/downloads, retention/holds, integrity/recovery, later facts and successors/disposal; partner custody offer/reoffer. A sealed assembly is read-only. |
| **Маягтын сан / Form library** | Firm author grants, question-list import, draft/review/publication; explicit engagement adoption of a source/published edition. Publication does not silently migrate signed work. |
| **Баг ба нөөц / People** | Firm roster/capacity/workload and related suitability/appointments. Business suitability and technical membership remain distinct. |
| **Фирмийн бүртгэл / Firm registers** | Firm-level controlled records, outside engagement-owned editing. |
| **Үйлдлийн түүх / Activity** | Attributable engagement actions; paper/register histories remain beside their records. |
| **Independent quality/custody links** | Separate credentials and scoped assignments, draft return/approval, manifest download/return/acceptance. These capacities do not infer general team access. |
| **Local recipient links** | Expiring exact-artifact download/acknowledgement; team outcome reconciliation belongs to the partner. |
| **/legacy** | Earlier browser-local prototype, including seven bounded automation demos. Existing storage keys/history remain; there is no silent SQLite migration. |

## Verification and preserved scope

One connected persisted synthetic engagement follows evidence and an actual finding/evaluation through approved opinion/sections/preparation, renewed authorization after change, signing/issue, failed/uncertain delivery reconciliation, receipt, independent assembly, lock, custody return/reoffer/acceptance, scoped retrieval, holds, successor retention and restart.

- **65 tests**, no failed/skipped tests. **Six connected cycles:** original A08/A11/A25/A28 plus A26/A27. Each new cycle has nine source steps, with six reporting and seven archive branch checks.
- Direct fixtures cover **60/476 lifecycle steps** and **66/315 criteria**. Partial evidence maps to 42 features and 34 automation minima; it does not complete all those contracts.
- F0 browser suite: 11 checks/13 screenshots. Reporting browser suite: four handoff checks/five screenshots using actual editor, approval, locking and custody controls. Approved prerequisites are API-seeded. These are engineering checks, not professional acceptance.
- All **2,247 normalized source rows**, 136 feature dispositions (127 core/eight conditional/one excluded), 58 minimum automations, 58 pending extensions, 51 lifecycles, 70 forms, 22 variants and BPMN inventories remain intact. The saved **25-package/128-task** backlog remains a reference; this batch does not close R20/R21 wholesale.
- `scripts/pilot-release-acceptance.json` remains empty. Source-owner acceptance and operational release checks remain open; `releaseReady` remains false.

The fixture supports a qualified scope-limitation report under a supplied synthetic edition, explicit reporting-duty assessment, calendar-day assembly policy, local signature and local recipient/custody sessions. Other opinion/section combinations, jurisdiction-specific authority, policy calendars, external identity/signature/delivery and remaining form/source variants need their own contracts/evidence. No legal deadline or universal wording is invented.

## Reproduce

Run `npm run verify:release -- --build` from a clean committed checkout. It runs tests/build and writes `.audit-pilot/source-verification.json` with test hashes, source links and build identity. Run `npm run verify:workspace` after building for navigation/review checks.

For reporting controls, set `AUDIT_REPORT_FIXTURE_DIR` to a writable output folder and run `node --test tests/pilot-reporting.test.mjs`. Then run `npm run verify:reporting-ui -- <folder>/reporting-fixture.json <browser-output-folder>`. The script copies the synthetic checkpoint and leaves existing user databases untouched. Set `AUDIT_CHROME_PATH` for an alternate Chrome installation.

## Next sequence

1. **F2:** reconcile real worksheet fields, repeated rows, clauses, validations, formulas and evidence needs. Start with 1.1.1, 1.3, 2.6, 3.1.2, 3.3.1 and F1 completion/report/review forms, then close all 70 individually. Classify 272 formulas and 1,820 validations before selecting operative business rules.
2. **FG-02 / AUTO-046:** auditor-selected/overridden thresholds, rationale and independent review, preserving benchmark candidates, scoped amounts and selective reopening. Current A08 evidence does not close this gap.
3. Continue F3–F7 in the saved dependency order: linked facts/named identities, earlier acceptance/planning, approved data/evidence, fieldwork and technical methods. **FG-01 / AUTO-047** unbiased no-replacement selection and supported projection remain open; preserve old method identities and selections.
4. Expand reporting/assembly to remaining applicable source variants and accountable policy decisions. Finish lifecycle, operational and independent acceptance work without relabeling fixture coverage as source acceptance.

The original plans retain all outstanding functional scope.
