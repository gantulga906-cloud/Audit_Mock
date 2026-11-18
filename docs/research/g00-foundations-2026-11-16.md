# G00 shared-foundation checkpoint

16 November 2026. Read order: implementation handbook INDEX, complete materiality/sampling/findings PILOT, then G00. Starting code: `079f9da47a02eab681feeeda3de3dfb8cfc42848` on `redesign/enterprise-workspace`. The supplied handbook ZIP matches SHA-256 `3e88a3255ac2b245f995e18e34dc4a208fba58cab28481c91dd7f32ece0ee168`.

## Implementation delta

Most shared-pilot foundations already existed. This batch strengthens their connected proof and fixes one command-boundary defect. The shared action endpoint now rejects malformed command names, non-object fields and invalid revision numbers with HTTP 400 before mutation. Previously a numeric command at firm scope returned a misleading workflow conflict. Missing empty fields remain supported. Domain validators retain ownership of field values, units, business prerequisites and permissions. Existing optional idempotency, scope checks and independent-role interfaces are preserved.

`tests/pilot-foundations.test.mjs` verifies malformed commands leave the entire scoped view and retry keys unchanged. Its connected scenario creates two persisted engagements, checks assignment and explicit evidence acceptance, reviews an exact work revision, and proves that completing a task does not approve work. It retains the original file bytes and authorization artifact while a changed statement basis invalidates only dependent current approval. Revoked deep links, original downloads and cached-command replay remain denied after restarting the same database; permitted retry produces one logical request.

The new connected scenario uses fictional records and the retained synthetic shared-core report path. It does not substitute for the separately tested controlled reporting, independent quality and custody routes. It adds no completed A-series lifecycle or independent source acceptance.

## Shared contracts and continuing ownership

The machine-readable [foundation contract matrix](foundation-contracts.json) maps all eight G00 contracts to owning modules, exact test names and remaining work. These are engineering reference checks within the current pilot profile.

| Contract | Current check | Continuing work |
| --- | --- | --- |
| SC01 engagement scope / stable identity | Two engagements, denied cross-scope reads, revoked membership, persisted retry | R10/R22 named identities, tenant and deployment model |
| SC02 work revisions / independent review | Exact submitted/reviewed version; task status remains separate | R07/R19 remaining source form/review alternatives and acceptance |
| SC03 original evidence / accepted use | Actual bytes, digest and retained original; receipt differs from accepted use | R13/R14 broader intake, evidence-use and confirmation contracts |
| SC04 actual authority / independent responsibilities | Self-review denied; scoped grants; existing staffing, quality and custody scenarios | R10 identity lifecycle and authority; R19 professional quality rules |
| SC05 versioned inputs / method / disposition | Existing materiality and edition-bound statutory calculations | R15 unbiased sampling/projection and signed-error decisions; R16 remaining methods |
| SC06 authorization / issue / assembly / custody | Existing exact-report, delivery reconciliation, independent assembly and custody scenarios | R20/R21 report/policy variants; R22 real external adapters |
| SC07 owned, dated external facts | Existing provisional intake, subsequent-period confirmation and roster scenarios | R09 all 20 dependency contracts and publication/roll-forward semantics |
| SC08 targeted staleness / retained history | Changed report basis, materiality revision and controlled form adoption | R09/R12 remaining dependency breadth; R08 programme loss acknowledgement |

## Reproducible verification

Run from a clean isolated checkout with the installed dependencies:

```sh
npm run verify:foundations -- --build
```

This executes the complete source-linked regression suite, builds the exact clean revision, checks all mapped G00 tests and their current file digests, and compares the frozen source text hashes and all 2,247 registered rows. Text digests normalize Git checkout CRLF to LF; raw checkout hashes are also recorded. It writes `.audit-pilot/source-verification.json` and `.audit-pilot/foundation-verification.json`. `referenceCheckpointReady` requires all mapped reference checks and the current clean build. `releaseReady` retains the separate source/operational acceptance rules; the foundation command cannot grant acceptance.

Set `AUDIT_FOUNDATION_EVIDENCE_DIR` to retain `g00-connected-evidence.json` with actual fixture IDs and original/authorization digests. It contains no login secrets. Tests use temporary databases; do not point them at the live preview or rebuild its serving directory to obtain proof.

## Preserved scope and next work

The original source registers, manifest and BPMN inventory remain byte-identical. All 25 original packages / 128 tasks, 136 feature dispositions (127 core, eight conditional, one excluded), 58 automation minima, 58 pending extensions, 70 forms, 22 variants and 20 dependencies retain their scope. Mapping the eight contracts does not close those obligations. Production identity, professional/local policy decisions, external effects and independent source acceptance remain open in their owning packages.

After this checkpoint, the handbook's next implementation batch remains F2: source-form fidelity, structured controls in 2.6, readable exports, import mapping/preview and programme adoption loss acknowledgement, with the early F3 identity/source-contract decisions alongside it. FG-01 stays dependent on the sampling/signed-difference decisions. G00 does not silently approve a method, rate, report wording or retention policy.

The application tree from local checkpoint `0b2118c` is published as GitHub commit `706b52a3f00cb745dd9b60988e4b05f96669d5f7` on `redesign/enterprise-workspace`. Both commits have the exact same Git tree. GitHub main and draft PR 6 remain separate baselines. Published checkpoint evidence, guides and plans are indexed in [the delivery register](../delivery/README.md).
