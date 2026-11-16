# Audit_Mock: Index, Pilot and G00 checkpoint

16 November 2026. Completed the current shared-pilot engineering checkpoint in the requested order. Verified code: 0b2118c5ba72ae963bcce95f9b4c3ce63e0be7d9. Saved locally on redesign/enterprise-workspace; no GitHub push or merge and no live-preview data changes were performed.

## What was done

- Read the Index, materiality/sampling/findings Pilot and G00 against the actual local code and preserved backlog. The supplied handbook ZIP matches SHA-256 3e88a3255ac2b245f995e18e34dc4a208fba58cab28481c91dd7f32ece0ee168.
- Fixed malformed shared commands returning misleading workflow errors. Invalid command names, fields containers and revisions now return HTTP 400 without changing the scoped view or consuming a retry key. Domain field validation and independent-role routes retain their existing contracts.
- Added a connected, persisted two-engagement G00 scenario: correct scope and original-file identity; independent exact-version review; task completion kept separate; changed statement basis selectively reopening current approval; old original/authorization bytes retained; revoked reads/downloads/replay denied; restart and retry preserving one logical effect.
- Added a machine-readable contract matrix and reproducible foundation checker. Git checkout line endings are normalized for text comparison, with raw hashes retained separately. The original source files were not edited.

## Verified result

All 71 tests passed, with zero failures or skips. The clean isolated production build passed, including TypeScript. All eight shared-contract reference checks passed. The build identifies the exact commit above. The live preview retains its earlier 079f9da build and database.

All 2,247 registered rows and their original scope remain: 75 cases, 315 criteria, 136 features, 58 automation minima, 476 E2E steps, 70 forms, 22 variants, 20 dependencies, 58 pending extensions, 1,012 BPMN rows and five operational obligations. The original 25-package/128-task plan is equal to the handbook's preserved copy, including task statuses and evidence.

The six existing connected source cycles remain A08/A11/A25/A26/A27/A28, demonstrating 60 steps and 66 criteria in their bounded fixtures. This batch adds G00 reference evidence, not another completed source lifecycle. Existing review, automation, reporting and custody scenarios still pass.

| Contract | Foundation behavior | Current reference evidence | Continuing work |
| --- | --- | --- | --- |
| SC01 | Engagement scope and stable identity | Passed (2 mapped checks) | R10.1/R22.1 named identities and intended deployment/tenant model |
| SC02 | Work revisions and exact-version review | Passed (2 mapped checks) | R07/R19 remaining form and review alternatives; independent source acceptance |
| SC03 | Original evidence and separate accepted use | Passed (2 mapped checks) | R13/R14 broader intake, evidence-use and confirmation contracts |
| SC04 | Actual authority, decisions and independent responsibilities | Passed (3 mapped checks) | R10 named lifecycle/authority; R19 professional quality-rule acceptance; actual external declarants |
| SC05 | Versioned method inputs, units, results and human disposition | Passed (2 mapped checks) | R15 FG-01 unbiased selection and ratio projection; HB-D02/HB-D03; R16 all minimum methods/variants |
| SC06 | Exact authorization, signature, issue, receipt, assembly and custody | Passed (2 mapped checks) | R20/R21 other report/timing/policy variants; R22 real signing, delivery and custody adapters |
| SC07 | External source ownership and confirmed dated facts | Passed (2 mapped checks) | R09 all 20 confirmed dependencies and publication/roll-forward semantics; no canonical client consolidation |
| SC08 | Targeted change impact and retained history | Passed (3 mapped checks) | R09/R12 complete dependency breadth; R08 dedicated programme-level loss acknowledgement |

## Meaning of this checkpoint

The engineering reference checkpoint is complete. Whole-contract professional/source acceptance and production release remain separate. Preset pilot identities, wider dependency semantics, methodology/local-policy decisions and actual external identity/signing/delivery/custody adapters remain in their owning packages. Independent source acceptance is still empty and releaseReady remains false. No requirement was silently removed, narrowed, deferred or marked accepted by this batch.

The next implementation batch recommended by the Index remains F2: remaining form fidelity, structured controls in 2.6, readable exports, import mapping/preview and programme loss acknowledgement, alongside the early F3 identity/source-contract decisions. FG-01 unbiased sampling/projection retains its signed-error/method decisions. Work stops at this G00 checkpoint for the requested report.

## Evidence and reproduction

- G00_Foundation_Verification.json: eight contracts, exact current test digests, scope/hash checks and build identity.
- Source_Verification.json: complete source-linked regression and lifecycle evidence.
- fixtures/g00-connected-evidence.json: actual synthetic fixture IDs, original digest and retained authorization digest; no login secrets.
- Backlog_Preservation.json: unchanged original plan and all source populations/scopes.
- Verified_Build.json and Preserved_Preview_Build.json: separate verified and serving builds.
- verification.log: final successful regression/build/checker output.

Reproduce in a clean isolated checkout with installed dependencies: npm run verify:foundations -- --build. The command uses disposable databases. Set AUDIT_FOUNDATION_EVIDENCE_DIR to retain the small G00 fixture proof. Do not rebuild the serving preview to run verification.
