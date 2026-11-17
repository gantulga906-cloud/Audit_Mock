# G03 published engineering checkpoint

17 November 2026. Data, evidence, requests and confirmations, following the published G03 handbook.

The application now supports approved source-interpretation profiles, exact-source reconciliation and controlled data methods, purpose-specific evidence coverage, multipart actual receipt, independent alternatives, versioned evidence-use evaluation and separately reviewed confirmation conclusions. Original files, prior results and approval history are retained. Existing audit workflows remain available.

## Verified result

- **83 tests passed**, no failures or skips; clean production build and TypeScript checks.
- All eight G00 foundation contracts passed; `referenceCheckpointReady=true`.
- Eight actual browser checks, six screenshots, no browser runtime errors.
- 146 of 476 source steps and 133 of 315 criteria have direct reference-fixture evidence across the application. Nine complete A-series reference cycles remain; partial A14/A18 observations are not combined into a complete lifecycle.
- All 30 G03 criteria are retained: 27 direct backend fixture links and three supporting implementation/reference positions with explicit limits. These are engineering checks, not independent source acceptance.

Independent source acceptance remains empty and `releaseReady=false`. Real audit sufficiency, confirmation reliability, firm methodology and local legal adoption remain attributable human decisions. Manual dispatch records and local single-use links do not send external messages or establish respondent identity. Restricted document/portal grants and external adapters remain explicit integration work under the owning guides.

## Publication and preservation

Verified local source: `cdedf986d57c7ebbf8dd255e7792788b52590bf3`. Published application commit: `262780fa72922963e6ab40a5e9fd055418069320`. Both have exact Git tree `ddccf76d87b2895e72af1594778b3843dd7cb4f1`.

`G03_local_history.bundle` preserves the two original local commits and requires published baseline `6d467ac2557018ced0c12324c48a03e7603813e0`. The later evidence publication changes only this checkpoint and the main README. `FILE_MANIFEST.json` records original file bytes, sizes and SHA-256 values.

All 25 original packages, 128 tasks and 2,247 registered obligations remain. The 70 forms, 22 variants, 58 minimum automations, 58 pending extensions, 20 dependencies and 1,012 BPMN rows are preserved. Existing acceptance, planning, automation, fieldwork, review, reporting, quality, archive and G00 reference tests pass. Main, deployment, the running local preview and its saved data were not changed. G04 has not started.

## Evidence and use

- [Implementation, working order and boundaries](../../research/g03-data-evidence-2026-11-17.md).
- [Source verification](Source_Verification.json), [foundation verification](Foundation_Verification.json), [clean build](Verified_Build.json) and [publication provenance](Publication_Provenance.json).
- [Connected expected/actual observations](G03_Connected_Proof.json), [all G03 criteria](G03_Criteria.json) and [bounded workflow evidence](G03_Workflow_Evidence.json).
- [Browser verification](Browser_Verification.json), [screenshots](screenshots), [backlog preservation](Backlog_Preservation.json) and [external research](External_Research.json).

Reproduce in a clean isolated checkout with installed dependencies: set `AUDIT_G03_FIXTURE_DIR=.audit-pilot/g03-fixture`, run `npm run verify:foundations -- --build`, then `npm run verify:data-evidence-ui -- .audit-pilot/g03-fixture/data-fixture.json .audit-pilot/g03-data-ui` and repeat with `evidence-fixture.json` / `.audit-pilot/g03-evidence-ui`. Keep logs inside the ignored `.audit-pilot` directory. Fixture databases, credential files and browser profiles are private test inputs and are excluded from publication.
