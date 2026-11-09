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

The pilot still uses three preset accounts. Dynamic firm identities, independent quality and custody roles, and the typed workpaper and Form Builder migration remain open.

Before upgrading a pilot database, stop the earlier pilot process and back up the database. The first new startup imports the single-workspace record into the engagement tables and tags its existing evidence, authorizations and archive rows with that engagement ID. The upgrade preserves archive payload bytes and SHA-256 hashes. Use the backup when returning to an earlier server version.
