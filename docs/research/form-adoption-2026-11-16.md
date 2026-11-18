# Controlled form adoption and repeated schedules

16 November 2026. Continued F2 and R08 from the saved post-redesign plan, following the materiality implementation in `e5ae99c`. Original source inventories, functional scope and independent acceptance decisions remain unchanged.

## Delivered behavior

The engagement form-library action now compares the pinned and target editions before applying an update. The preview shows added, changed and removed definitions, answers/cells that cannot carry forward, evidence links that would detach, and whether work needs renewed review. It is read-only. Incompatible direct adoption requires acknowledgement of a digest bound to that engagement, work revision, target edition, answers and evidence. A changed workpaper invalidates the earlier loss review. Obsolete published editions are rejected through the existing latest-edition rule.

Repeated schedules migrate cell by cell. Compatible cells retain their exact strings, including zero, negative values and leading-zero identifiers; row IDs remain stable. Removing a column, changing its type or narrowing its choices clears only incompatible cells after review. Hidden answers that no longer meet applicability conditions are listed too. Earlier answers, templates, sign-offs and original evidence stay in history. Detached links are removed from the current workpaper; the original file is retained.

The controlled builder now saves actual table-column definitions instead of silently substituting the default description/amount pair. Authors can name, add, remove and type columns and define scalar choice lists. The server rejects duplicate keys, empty choices, nested tables and malformed definitions. Supported columns are text, narrative, numeric, date, categorical, multiple-choice, yes/no and accepted evidence, with up to 30 columns and the existing 100-row limit. Evidence inside table rows must belong to the engagement and be accepted/current. It participates in workpaper linkage and adoption diagnostics.

Column changes remain draft changes until independent publication and explicit engagement adoption. Existing pinned work is not silently updated. First adoption and compatible API adoption preserve their existing calling contract; direct adoption that would drop current content now requires `adoptionReview` and `adoptionAck: reviewed` from the current preview.

## Source-form corrections

| Source form / column | Corrected runtime contract |
|---|---|
| 3.1.2 / additional procedures / I | Procedure/test result is a narrative, matching the source result heading. Planned and actual hours remain numeric. |
| 3.3.1 / tested units / B | Unit/customer reference is text. Values such as `INV-0007` and leading-zero references remain intact. |
| 3.3.1 / tested units / F | Recorded difference is a signed numeric amount; explanatory narrative remains in its own column. |

Corrections are applied by the shared source-contract adapter used by manual adoption and newly approved programme decisions. The frozen source JSON remains unchanged; the implementation does not edit the workbooks. Existing published/pinned editions keep their original digests. Adopting the corrected source edition exposes any incompatible existing cells through the same comparison.

The November 16 freshness check found externally resaved Stage 2/3 workbook files dated November 13. All 2,584 cells covered by list validation retain the exact registered options and effective rules. Stage 3 consolidated 1,148 validation definitions into 315 while retaining its cell values, formulas and merges. The current five-book raw total is therefore 987 definitions; the registered November 11 snapshot correctly retains 1,820. The retained Stage 2 repair copy is older than the exact registered binary and differs in four heading-help cells, so it is not treated as proof of an exact whole-file baseline match. File hashes and semantic comparisons are recorded separately; no source edition or acceptance record is silently replaced.

## Compatibility and remaining work

- Existing acceptance, materiality, sampling, review, reporting and archive workflows remain in the full regression suite. Independent source acceptance remains empty; these are engineering implementation results.
- The approved programme-decision route retains its existing approval flow and now uses the same cell-preserving migration and stored change summary. A dedicated programme-level loss-acknowledgement interaction remains open; the new acknowledgement gate applies to direct form adoption.
- Full Excel import mapping/preview, unsupported-rule resolution, release effective dates/retirement and complete change communication remain R08 work. The existing question-list importer remains available.
- Structured risk/response work in 2.6, remaining source fields, repeated schedules, readable exports and whole-form acceptance remain F2 work. Corrections to selected columns do not close all of 3.1.2 or 3.3.1, and the 22 fieldwork variants retain their own acceptance requirements.
- FG-01 unbiased sampling/projection, named identities and the wider automation, E2E and external-integration backlog remain unchanged.

## Verification

`tests/pilot-form-adoption.test.mjs` exercises read-only previews, invalid schemas, role and revoked-scope denial, stale loss reviews, explicit acknowledgement, per-cell migration, evidence within rows, retained originals/templates/signatures, unchanged repeated adoption and persistence after restart. A second scenario saves actual additional asset-procedure narratives and alphanumeric sample references, and rejects nonnumeric differences.

The existing independently published/signed questionnaire regression now checks the loss-review gate before continuing its original history and authorization assertions. It retains the old functional coverage.

`npm run verify:form-adoption-ui -- <fixture.json> <output>` verifies the actual preview/acknowledge/apply controls and table-column editing. To export a disposable checkpoint, set `AUDIT_ADOPTION_FIXTURE_DIR` and run `node --test tests/pilot-form-adoption.test.mjs`. Browser prerequisites are API-seeded synthetic editions; this does not represent professional acceptance.
