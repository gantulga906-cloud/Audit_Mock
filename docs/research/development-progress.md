# Audit_Mock development progress

## Wave 0

The source audit baseline is GitHub main `69f0548de5f897127be671bba81cc61cfd524dfe`. The original archive and five repaired workbooks matched the SHA-256 values in [the source manifest](source-manifest.json).

| Work package and source | Implemented behavior and verification |
|---|---|
| WP-00 · Build and regression baseline | `npm run build` produces `/build-info.json`. The local server sends the build ID with pilot API responses. The test suite checks original register counts and runs the existing synthetic engagements against disposable SQLite databases. |
| WP-01 · M10-F09/F10/F11/F14 · AUTO-056/057 · A26 | The approved opinion selects 4.1.A1–A4. The pilot assembles a downloadable HTML artifact from the reviewed paper, approved sections, and financial statements and notes. Tests cover a qualified opinion, rejection of a mismatched additional-section template, and identical bytes and SHA-256 across approval, issue and archive. |
| WP-01 · M07-F10 · AUTO-051 · A21 | The extended pilot requires approved 3.2.1 coverage through the target report date. Changing the date reopens the report review. Tests block issue on an older coverage date and permit fresh authorization after updated review. |
| WP-01 · M12-F07/F10 · A27 | Sealed archive listings omit file metadata for noncustodial pilot roles. Scoped downloads require a current grant. Tests exercise unauthorized metadata and direct file access, report-only download, expiry and revocation. The pilot partner retains archive administration. |
| WP-01 · AUTO-001/002 · A11/A18 | Evidence coverage excludes drafts and cancellations. The CSV importer preserves malformed or blank amount inputs separately from genuine zero and negative values. |

Report issue records the external issue reference and the authorized artifact hash. Signing and delivery integration, independent custody, and full source acceptance remain open for their later work packages.

## Wave 1 in progress

| Work package and source | Implemented behavior and verification |
|---|---|
| WP-02 · D07–D09 | SQLite separates engagement records, revisions, membership, evidence, authorizations and archive packages. Firm registers are shared. Command retries bind to the original scope. Tests cover independent revisions, duplicate periods, retry across restart and migration with unchanged IDs and archive bytes. |
| WP-03 · CC01/CC02 · D05/D07 | The partner grants or revokes the pilot reviewer and preparer on an engagement. Every scoped read and write checks membership, including direct evidence, report and archive routes. Revocation also closes existing archive grants for that role in the engagement. Tests cover denial, revocation and regrant. |
| WP-04 · CC03/CC08 · A04/A05 | Tasks, calendar, Gantt and the scoped portfolio read workpaper deadlines and statuses from the server. Tests verify cross-account visibility, task ownership, isolated portfolio deadlines and persistence after restart. |
| WP-05 · M02-F02/F03/F09 · P04 · D14/D29 | The shared pilot can load all 70 source form contracts. Teams explicitly attach a source or published version, save typed answers and evidence links, and submit for independent review. The acceptance workpaper reads legal name, entity type, registration, dates and decision references from the owning records. The tests follow typed intake, a fixed-asset programme, and a custom form through report authorization. |
| WP-05 · Controlled form library | The partner can grant or revoke authoring for one form. An author can change questions and answer types, import a structured Excel question list, and submit a draft for partner approval. Publishing leaves existing workpapers pinned. When an engagement adopts a later release, compatible answers carry forward and prior signed answers, evidence links and template digests remain in history. |

The pilot still uses three preset accounts. Dynamic firm identities and independent quality and custody roles remain open. Workbook formula parity, row-by-row source acceptance, and workflow-specific controls for each form still need verification.

Before upgrading a pilot database, stop the earlier pilot process and back up the database. The first new startup imports the single-workspace record into the engagement tables and tags its existing evidence, authorizations and archive rows with that engagement ID. The upgrade preserves archive payload bytes and SHA-256 hashes. Use the backup when returning to an earlier server version.

## Wave 2 in progress

| Work package and source | Implemented behavior and verification |
|---|---|
| WP-06 · M03-F01–F06/F08 · P01-UC01–UC03 · A01 | The portfolio has a scoped client directory and separate enquiry inbox. Drafts retain unknown dates and frameworks. An enquiry can be forwarded, returned with an item and reason, declined, or converted to a pending engagement. Client contacts retain source, effective dates and previous details. The regression covers both enquiry origins, role checks, duplicate periods, declined history and database restart. |
| WP-06 · P03-UC04 · D01/D04 | A subsequent period can confirm a client-profile version and selected contact with a link to an accessible prior period. The new engagement has its own identity, evidence, terms and approval history. Its intake paper reads the confirmed company name, reporting framework, sector, period and decision references. |
| WP-07 · M01-F03/F04/F06 · M04-F06 · P03-UC02 · P14-UC01–UC03 · A04 | Staff suitability binds an approved roster entry, credential and firm appointment to an engagement capacity and planned dates. The server checks the total planned allocations against the firm's stated availability window. The portfolio shows only assignments in the viewer's scope. External specialist records require a declaration, deliverable and responsible auditor. |
| WP-07 · Work assignment and history | Teams can reassign a workpaper and route its unfinished evidence requests while retaining completed correspondence and exact named sign-offs. Planned work and tasks require a current eligible staff seat on managed engagements. The regression covers insufficient capacity, missing or expired credential evidence, departed staff, separate technical access and restart. |
| WP-08 · A01/A03 · 1.4.3 | A converted enquiry requires the partner to approve the exact signed letter revision, period, client confirmation and evidence hash before activation. A changed confirmation invalidates the old approval. The test blocks activation on unresolved independence, preserves the prior letter version and verifies that the earlier period stays unchanged. |
| WP-09 · P06-UC02/03/05/06 · P07-UC01 · A08-P2-W1/A10-P2-W2 | Reviewed materiality and applicable control reliance feed the approved programme decision. The decision links a reviewed risk and assertion to an exact template procedure and its planned nature, timing and extent. Adoption binds the selected source or published template to the workpaper. Exclusions stay out of fieldwork. The integration scenario tests stale submission, missing mapped execution, selective reopening after reliance changes, and retention of earlier sign-offs and threshold figures. |

New extended conversions use managed staffing. Existing pilot files can adopt it explicitly once the three core seats are approved. Business appointments still map to the three preset technical accounts. External specialists are documented contributors. Actual-effort entry, separate specialist sign-ins and independent EQR remain open.

Client registration is an internal pilot workflow. Source-system verification and canonical client consolidation are separate. The pilot records the reviewed signed copy as an artifact. External signature and dispatch services remain open.

The linked programme workflow records one risk response and one selected template procedure per decision. Existing decisions retain their review history and can be revised into the linked workflow. Multi-risk and multi-procedure tailoring, structured control walkthroughs and specific materiality by area remain open.

## Wave 3 reference workflow

| Work package and source | Implemented behavior and verification |
|---|---|
| WP-10 · P05-UC01/02 · A11-P2 · AUTO-006 | Store and hash the original UTF-8 CSV. Quarantine malformed amounts and dates, duplicates, missing keys and entity/period/currency mismatches. True zero stays numeric. An approved independent control artifact supports accepted counts and signed totals. One reviewed account-to-statement mapping per account produces the line bridge. A revised source or reconciliation retains earlier inputs and makes dependent approvals stale. |
| WP-10/13 · P06-UC03 · M06-F06 | Select a statement bridge line and read its actual amount from the approved population without re-entering it. The record retains the exact population version, line and source hash. |
| WP-11 · P08-UC01–03 | Multi-part requests have draft, issued, cancelled and per-item use histories. One original can support several requested parts. Reopening a use preserves the original and its signed history and invalidates affected work. An expiring single-use local confirmation link accepts a reply and original for the exact request, item and named contact. The audit team evaluates the reply separately. |
| WP-12 · DEP-C06/C07 · 3.3.1 | Design and independent approval bind the approved population, selected statement line, 1.3 thresholds, 2.6 reliance and assigned workpaper. Selection is deterministic for a stated size and seed. Every test retains the original row and accepted evidence version. A qualitative zero-amount exception becomes a finding. |
| WP-13 · P09-UC04 · AUTO-009 | Run manual-entry, posting-amount and period-end filters on the approved journal CSV. Selected journals show their source postings and exact filter reasons. Repeated inputs produce the same run. Independent review requires a documented investigation of every selected journal. |

The integration scenario takes a fixed-assets file through all four work packages, including an independent confirmation session, partial receipt, replacement, stale population and a restart. The pilot currently uses one signed-amount population and one currency per approved revision. Full ledger-to-trial-balance roll-forward, richer import profiles, external message delivery and identity verification, statistical sample methods, and the remaining fieldwork automations and variants are open.

### Area workpapers

| Work package and source | Implemented behavior and verification |
|---|---|
| WP-14 · P09-UC02/11 · AUTO-012–014 · 3.1.5/3.1.16 | Approved invoice, credit, cash and pricing files reconcile to the selected ledger line. Date crossings, duplicate credits, missing terms and unauthorized prices produce separate cases. Aging uses the supplied closing open amount and due date. Exact-reference later receipts are allocated in date and row order, capped at the remaining balance. Source rows remain inspectable for both matches and exceptions. |
| WP-15 · P09-UC02/11 · AUTO-016/018–020 · 3.1.8/3.1.10 | Trace the supplier receipt, invoice, approved ledger posting and payment. Duplicate payment candidates stay out of matched totals. A late or missing posting for a pre-close receipt creates a potential liability case. Bank matching uses unique exact references and signed amounts. Opening-plus-movement checks and documented reconciling items show the remaining balance residual. |
| WP-16 · P09-UC05/11 · AUTO-022/023/027 · 3.1.2/3.1.4 | Roll inventory forward by item, location and unit and compare it with the year-end count. Show separate quantity and ledger-value differences. Roll asset cost and accumulated depreciation forward, tie additions to their original supporting rows and compare net carrying value with the mapped ledger. |

The area integration scenario independently calculates expected results for all six workpapers. It verifies case disposition, independent review, the exact run reference on the signed workpaper, re-opening after a changed population and retention after restart. Current methods use normalized single-currency exports and exact references. Revenue recognition schedules, supplier identity analysis, alternative bank matching methods, inventory costing and NRV, and asset useful-life analysis remain open.
