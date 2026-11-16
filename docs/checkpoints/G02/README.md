# G02 published engineering checkpoint

16 November 2026. Staffing, planning, risk, controls and materiality, following the published G02 handbook.

The application now supports current methodology/scope, structured understanding and control testing, many-to-many risk responses, explicit contributor/opening-balance evaluations, versioned strategy and handoff approvals, and append-only actual effort. Dedicated programme adoption requires current explicit loss acknowledgement. Existing audit workflows remain available.

## Verified result

- **78 tests passed**, no failures or skips; clean production build and TypeScript checks.
- All eight G00 foundation contracts passed; `referenceCheckpointReady=true`.
- Six actual browser checks, six screenshots, no browser runtime errors.
- 132 of 476 source steps and 118 of 315 criteria have direct reference-fixture evidence across the application. The nine previously connected complete A-series cycles remain; G02 does not inflate that count by combining partial observations.
- All 53 G02 criteria are retained in the criterion receipt. 28 currently have direct backend links in the source verifier; the remainder identify supporting implementation/reference evidence or explicit conditional boundaries. These are engineering checks, not independent source acceptance.

Independent source acceptance remains empty and `releaseReady=false`. Firm-approved methodology, local applicability and actual audit judgments remain attributable human decisions. Conditional specialist portals and future AI allocation/grading are not supplied or silently assumed by this profile.

## Publication and preservation

Verified local source: `69ce4179b65fa54d505757f46deb01916ece13a9`. Published application commit: `99de93f6c814673fb640e776c964de3e948ad6ac`. Both have exact Git tree `2ca8b419e87cfdadb844a53ae7e1ee1a7b51c842`.

`G02_local_history.bundle` preserves the two original local commits and requires published baseline `75886cc15dd7de342874474d39d37154a6b016e9`. The later evidence publication changes only this checkpoint and the main README. `FILE_MANIFEST.json` records original file bytes, sizes and SHA-256 values.

All 25 original packages, 128 tasks and 2,247 registered obligations remain. The 70 forms, 22 variants, 58 minimum automations, 58 pending extensions, 20 dependencies and 1,012 BPMN rows are preserved. Existing data, automation, fieldwork, reporting, quality, archive and earlier G00/G01 reference tests pass. The live preview, its credentials/data, main branch and deployment were not changed. G03 has not started.

## Evidence and use

- [Implementation, working order and boundaries](../../research/g02-planning-2026-11-16.md).
- [Source verification](Source_Verification.json), [foundation verification](Foundation_Verification.json), [clean build](Verified_Build.json) and [publication provenance](Publication_Provenance.json).
- [Connected expected/actual planning observations](G02_Connected_Proof.json), [all G02 criteria](G02_Criteria.json) and [bounded workflow evidence](G02_Workflow_Evidence.json).
- [Browser verification](Browser_Verification.json), [screenshots](screenshots), [backlog preservation](Backlog_Preservation.json) and [external research](External_Research.json).

Reproduce in a clean isolated checkout with installed dependencies: set `AUDIT_PLANNING_FIXTURE_DIR=.audit-pilot/g02-fixture`, run `npm run verify:foundations -- --build`, then run `npm run verify:planning-ui -- .audit-pilot/g02-fixture/planning-fixture.json .audit-pilot/g02-ui` and repeat with `planning-loss-fixture.json` / `.audit-pilot/g02-loss-ui`. Keep verification logs inside the ignored `.audit-pilot` directory. Fixture databases, credential files and browser profiles are private test inputs and are excluded from publication.
