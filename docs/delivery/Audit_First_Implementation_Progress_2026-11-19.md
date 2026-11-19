# Audit-first implementation progress

**As of:** 19 November 2026. **Starting commit:** `469d48cfbd1bb1d6760f5ef2ae90794cd91987b3`. **Scope:** B00 and B01 engineering foundation. Practitioner, browser/network, production and release acceptance remain separate; `releaseReady` was not enabled.

The [complete plan](research/audit-first-2026-11-19/results/FULL/FULL_RESEARCH_AND_EXECUTION_PLAN.md) remains the scope baseline. Its original assignment registers are historical and are not rewritten as delivered functionality. This register records actual implementation progress.

| Batch | Current state | Implemented behavior / remaining boundary |
| --- | --- | --- |
| B00 | Engineering checks passed | Frozen original identity manifest; all five working workbook hashes checked; settled D01 adoption profile carried forward; tests use isolated temporary databases. |
| B01 | Shared foundation implemented and tested | Versioned calculation/review records; exact typed answer snapshots; stable repeated-row identity; account-grain primary splits versus nonadditive notes; existing read compatibility. This registers all 36 method specifications, not 36 fully implemented or professionally accepted accounting models. |
| B02 | Next dependency-ready batch | Many named assignees, scoped authority, credentials and specialist packet changes remain to implement. |
| B03 | Queued after B01 | Full form-family enhancements, native XLSX/DOCX and all 20 reliance edges. |
| B04 | Queued after B01/B02 | Controlled XLSX, full source bridges and remaining method/data runtime changes. Account-grain split arithmetic was implemented with B01; row-grain allocations and broader B04 scope remain. |
| B05 | Queued | Planning/control/materiality/sampling deltas. |
| B06 | Queued | Complete revenue/cut-off/receivables slice through reporting/archive consequences. |
| B07 | Queued | Purchases/payables/prepayments/expenses. |
| B08 | Queued | Cash/inventory/cost of sales. |
| B09 | Queued | PPE/intangibles/capitalization. |
| B10 | Queued | Payroll/tax/equity with actual selected parameters. |
| B11 | Queued | Finance/investments/FX/leases/group. |
| B12 | Queued | Completion/quality/all report outcomes. |
| B13 | Queued | Later facts/conditional dual dating/custody/inspection. |
| B14 | Queued | Whole-scope source, practitioner and operational acceptance. |

## B00: pinned inventory

`src/data/audit-baseline.json` pins the exact original ID sets for 60 tasks, 36 methods, 22 variants, 58 automation minimums, 20 dependencies, 70 source forms, 1,236 catalogue field keys, 128 original implementation tasks and 2,247 original obligations. Identity sets have both their sorted members and a SHA-256 digest. Original obligation identities preserve the register/ID grain. Working and historical source hashes remain distinct.

`scripts/verify-audit-baseline.mjs` checks drift against the existing research corpus. With `--source-root <read-only-workbook-directory>` it also checks every working workbook's exact bytes. The runtime API exposes this reference profile; it does not silently assign a reporting framework, determine local law or grant audit approval.

## B01: calculation and answer contracts

Every new supported data-check run records its linked M-pack IDs, algorithm/schema/registry versions, engagement/entity/reporting-period/currency scope, the existing two-decimal integer storage convention, configuration, original input versions/hashes, policy facts, result digest and intended use. Approval pins the exact run plus current evidence/case dispositions. A changed scope, configuration, source or output cannot retain current reliance. Explanations remain human records; recalculation resets changed analytical work rather than copying its former favorable conclusions. Identical retries preserve identity; changed content creates a successor.

Existing checks without this contract remain readable with their original reviews; no contract or professional approval is fabricated retrospectively. Future algorithm changes must version the owning implementation and registry. No arbitrary scripting engine was introduced.

Native typed saves retain an answer snapshot bound to the exact template digest. Zero and No stay distinct from unknown and reasoned N/A. Decimal strings preserve their exact representation; repeated rows keep durable IDs when reordered. Snapshots are copied into work history; original raw answers remain available. Draft N/A may retain a pending reason, while existing submission guards still require its reason. Full family-specific requirements and exports remain B03.

`AUTO-006` accepts either its existing one-line whole-account mapping or explicit signed source-amount splits. Every source account must reconcile to its primary allocations. Presentation references are checked separately and never add to primary totals. Duplicate destinations, unknown sources, opposing allocation signs, invalid display units, mixed primary/reference destinations and unexplained residuals remain exceptions. The UI exposes whole/split allocation, separate note references and calculation/review provenance. No journal posting or accounting-classification judgment is automated by this change.

## Verification and limits

- Baseline identity sets, all 36 specification links and all five working workbook hashes match.
- 55 distinct automated tests passed across foundation, data/evidence, automation methods, workspace, workbench, acceptance, planning and methodology suites. The methodology suite includes all 70 source contracts. The four foundation tests were rerun after extending their snapshot/restart assertions.
- TypeScript checking passed using the existing sibling installation's dependencies; no dependency version changed.
- API tests used the real handler, authorization and SQLite transactions through an optional in-process test transport. Ordinary test mode still uses real HTTP. Earlier socket attempts were blocked by this host's `connect EACCES` policy; those attempts are not passed network tests. Browser rendering, live HTTP, native Office readers and production operation were not verified by this batch.
- Source references, prior checkpoint evidence and original assignment dispositions were preserved. No real practitioner acceptance, release approval, main merge or deployment occurred.

Next implementation work follows B02's published handoff. B01 is a reviewable engineering checkpoint, not completion of the full audit product.
