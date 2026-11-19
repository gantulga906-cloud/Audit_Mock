# D01 client-master Excel/CSV import specification

**Deliverable:** implementation-ready contract, not an implemented importer. **Design choice:** simple staged client-directory import, with optional dated contacts. Existing individual client commands remain the service boundary.

## Input package

Support one XLSX with CLIENTS and optional CONTACTS sheets, or a CLIENTS CSV plus optional CONTACTS CSV. Use the same logical field names. This pack supplies CSV examples and a JSON schema; it does not supply an executable XLSX importer.

Batch metadata: format_version=1.0, source_namespace, country_code, source_as_of, source_description, uploaded_by, uploaded_at, original_file_sha256. Namespace/country/as-of/source description are user-confirmed metadata, not repeated mandatory spreadsheet columns. Country is ISO alpha-2, selected explicitly; mixed-country batches must be split.

The [field dictionary](Client_Fields.csv) defines every column, type, requiredness, meaning and destination. All identifiers are text. Minimum CLIENTS columns: source_client_key, legal_name, registration_number, legal_form. Optional facts stay optional. A draft enquiry with unknown registration remains supported through normal enquiry capture; it is not forced into an incomplete confirmed client master.

## Workbook rules

- First row contains unique exact field names. Entirely blank trailing rows are ignored and counted separately.
- CLIENTS required; CONTACTS optional. Unknown nonempty sheets or columns fail with a clear mapping/correction message in v1, avoiding silent loss.
- Accept scalar text values only in data columns. Reject formulas, external links, macros and password-protected workbooks; never evaluate formulas. Explain how to paste values into a clean workbook.
- Require text-formatted registration/source keys; detect numeric identifier cells and reject them for correction rather than guessing lost leading zeros. Optional dates may be ISO text or genuine date cells converted to ISO with workbook date-system handling.
- No hidden rows are silently excluded. Preview counts include hidden populated rows and warns the reviewer. Merged data cells fail; header style/colors have no meaning.
- XLSX cell coordinates and CSV physical row numbers accompany every error. CSV must be UTF-8, optionally BOM, RFC 4180 quoting, comma delimiter; embedded newlines allowed in quoted text.
- Formula-like CSV text in free-text fields is retained as inert data. Spreadsheet exports must escape potentially executable leading characters without changing stored raw text. Do not execute input or emit unsafe spreadsheet cells.
- Proposed v1 limits: 10 MiB upload, 10,000 populated rows across tables, 100 columns per sheet, 100 MiB decompressed XLSX data. These are product limits, not accounting requirements; reject over-limit input before extraction. Confirm with platform owner before release.

## Normalization and identity

Preserve original file bytes, original values and parser version. Normalize ordinary text to Unicode NFC and trim outside whitespace. Do not translate or transliterate legal names. Source-row identity is country + source_namespace + source_client_key. Registration matching uses the existing globally unique key: case-folded registration with whitespace removed. Record normalization version; the reviewer must approve identity matching. Country is provenance, not permission to bypass the current global uniqueness constraint. A cross-country collision is E004 for manual resolution; a future country-scoped migration requires a separate approved design.

Registration uniqueness is checked against all existing clients regardless of namespace. Namespace prevents source-key collision; it does not permit duplicate real clients. Registration match with inconsistent names/legal form is a review conflict, not an automatic second entity.

Equal source key/registration repeated within batch: identical rows are duplicate errors requiring correction; conflicting rows are conflict errors. Similar names alone produce a warning, never a merge. Different source keys matching the same real registration require explicit match confirmation.

Do not invent a Mongolian registration-length rule without an authoritative specification. Strings such as 00012345 in examples are synthetic parser tests, not valid national identifiers.

## Updates, missing values and contacts

Matched updates show field-by-field before/after preview and the expected master version. Blank optional cells mean no change on update. On creation, blank means unknown/absent. A deliberate clear requires an explicit reviewed UI action; no magic string is interpreted as deletion.

Client amendments create a new master version with provenance. Existing engagement snapshots are unchanged until their explicit refresh/confirmation procedure. A material change may require a fresh D01 assessment. Imported framework is a client claim only; it cannot set approved statutory classification.

CONTACTS link by source_client_key. Require contact_key, full_name, capacity, effective_from and source_reference. Email is optional in this import because historical/offline contacts may exist; current workflow requirements apply before using a contact for communication. signer_claim is an assertion only, never approved authority. End dates must follow start dates; historical contacts remain historical. Dated edits preserve previous values and provenance.

## Preview, review and commit

1. Upload -> verify file and limits -> compute original hash -> parse inert values.
2. Validate schema, links, duplicates, normalized identities, conflicts and date ranges.
3. Generate preview: create/update/unchanged/invalid counts, changes, warnings, master versions and row lineage.
4. User corrects the file or resolves matches; any changed mapping/content generates a new preview version.
5. Independent reviewer approves the exact preview hash and explicit matches. Warnings require acknowledged rationale; invalid rows prevent commit.
6. Recheck versions, duplicates, reviewer authority and exact preview. Commit **all accepted rows atomically** through client/contact domain services.
7. Persist receipt, input/preview hashes, row outcomes, actors, timestamps, before/after versions and batch totals.

No partial commit in v1. Invalid rows remain visible; correction and re-preview is required. Do not silently drop invalid rows to make counts reconcile.

Idempotency key: source_namespace + country_code + original file hashes + canonical mapping/schema version. Exact approved replay returns original receipt, without duplicate writes. Changed bytes or mapping require a new batch/preview; business matching still prevents duplicate clients. Concurrent master changes return E012; the user re-previews and re-reviews.

Atomicity applies to the database transaction. Keep uploaded-file storage staged until receipt durability is confirmed; a failed transaction must not leave a success receipt. Store row-level journal entries within the same transaction.

## Reconciliation and audit trail

For each table: populated_input_rows = valid_create + valid_update + unchanged + invalid. Duplicate/conflict rows are invalid and never counted twice. Ignored blank rows reported separately. For a successful batch: committed_create + committed_update + committed_unchanged = populated_input_rows and invalid=0.

Do not compare one CONTACT row with one CLIENT row; reconcile each table separately. Preview and commit totals must agree. An unchanged row still has a recorded lineage outcome, not a rewritten master.

Retain batch ID, source metadata, file hashes, schema/parser/mapping version, row/table/coordinate, original and normalized values, validation codes, match decision, reviewer and commit outcome. Storage/access/retention use the existing evidence policies; this ticket does not invent a new retention period.

## Error dictionary

| Code | Meaning | Expected correction / outcome |
| --- | --- | --- |
| E001 | Missing/duplicate required header or unknown column | Correct header/mapping; no commit |
| E002 | Missing mandatory value / wrong scalar type | Correct source; draft enquiry alternative remains |
| E003 | Duplicate source key or same-batch registration | Resolve duplicate/conflicting rows |
| E004 | Existing identity conflict / ambiguous match | Reviewer-approved explicit match or corrected facts |
| E005 | CONTACTS references unknown CLIENTS key | Supply/link parent in the same import package |
| E006 | Invalid date / date range | Correct ISO date or workbook date encoding |
| E007 | Formula, macro, external link or unsafe workbook | Paste values into clean supported input |
| E008 | Numeric identifier cell / lost leading-zero risk | Resupply original identifier as text |
| E009 | Privileged status/approval column or unknown sheet | Remove unsupported column/sheet; use owning workflow |
| E010 | File/row/expansion limit exceeded | Split batch or supported platform configuration |
| E011 | Preview modified/stale/not independently approved | Re-preview/review exact batch |
| E012 | Master version changed during review | Reconcile with current master; re-review |
| E013 | Transaction failed / reconciliation mismatch | Roll back; no success receipt |
| W001 | Similar name / normalized identity needs confirmation | Acknowledge or explicitly resolve; no fuzzy auto-merge |
| W002 | Imported framework/signer claim unverified | Preserve claim; complete professional/authority checks later |
| W003 | Hidden populated rows | Include and acknowledge in preview |

## Prohibited effects and integration boundary

Reject columns that attempt acceptance/continuance, independence clearance, approved classification, permit verified, role assignment, active engagement, signatures, reviewer identity or issued status. Importing a client never accepts the engagement.

Use existing client-save/client-contact validation through a shared transaction-aware service. Do not call sequential HTTP commands and claim atomicity. Do not put client-directory rows in G03 GL/population tables. Reuse its mapping, preview and reconciliation ideas only.

Government/ERP/credential/CPA validation APIs, automatic legal classification, fuzzy auto-merge and migration of historical engagement snapshots are deferred. Manual files and attributable review satisfy the proposed v1 boundary.
