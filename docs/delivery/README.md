# Published Audit_Mock development materials

16 November 2026. These files publish the previously local implementation guides, development plans, reference evidence and original Git history alongside the application. Continue using the existing backlog; publication does not change requirement scope or grant source acceptance.

## Start here

1. [Implementation handbook Index](handbooks/START_HERE.md).
2. [Materiality, sampling and findings Pilot](handbooks/masters/PILOT_Materiality_Sampling_Findings.md).
3. [G00 shared foundations](handbooks/masters/G00_System_foundations_and_shared_contracts.md), then the owning domain guide.
4. [Current G00 implementation notes](../research/g00-foundations-2026-11-16.md) and [checkpoint evidence](checkpoints/g00/G00_Checkpoint.md).
5. [Build sequence](handbooks/CURRENT_STATE_AND_BUILD_SEQUENCE.md) and [latest preserved development backlog](plans/audit-form-adoption-2026-11-16/Updated_Development_Backlog.json).

The handbooks directory includes all 14 PDFs, editable masters and complete source/task/compatibility registers from the supplied 136-member package. The packages directory retains all ten generated Audit_Mock ZIP deliverables currently present in the project outputs, including the redesign research, original/remaining/post-redesign plans, functional continuation, F2, source coverage and G00 evidence. Dated historical notes remain available in historical-notes.

## Publication identity

- Published application checkpoint: 706b52a3f00cb745dd9b60988e4b05f96669d5f7 on redesign/enterprise-workspace.
- Exact tested local checkpoint: 0b2118c5ba72ae963bcce95f9b4c3ce63e0be7d9.
- Both application snapshots have Git tree 74b63f9f403ba003c54eee7c1c4fe1fa574718c1.
- The connected GitHub account created the publication commit because the command-line Git client had no write credentials. The commit IDs differ; the entire application tree is identical.
- Verification at that application checkpoint: 71 tests passed; clean production build including TypeScript passed; eight G00 reference contracts passed; all 2,247 source rows and 128 original tasks retained. Six source cycles, 60 steps and 66 criteria remain fixture-demonstrated. Independent source acceptance and production release remain open.
- This accompanying publication changes documentation, evidence and development instructions only. The application code remains the tested version above.

The original local branch histories and verification checkout references are preserved in [the complete Git bundle](history/Audit_Mock_Local_History_2026-11-16.bundle). It includes historical local commits whose equivalent file trees had previously been published under different GitHub commit IDs. It can be checked with git bundle verify and cloned or fetched to recover the original references.

## Historical wording and file identity

Historical plans and evidence intentionally retain their original bytes, dates, baseline IDs and then-current descriptions such as “local only.” They describe the point when they were produced. This delivery index records the subsequent publication. FILE_MANIFEST.json gives SHA-256 and size for every delivered file. The repository preserves these artifacts without checkout newline conversion so the original hashes remain reproducible.

Runtime databases, browser profiles, dependency caches and raw reference-source archives are not development deliverables. Their absence does not narrow functional requirements. Live preview data and deployment were not changed by this publication.

## Continuing development

The user instructed that completed, verified work must be published continuously rather than left only on a local checkout. The repository AGENTS.md records that standing instruction. Publish each completed batch through the authenticated GitHub connection, verify the remote result and keep the checkout aligned. Merge into main and deployment are separate operations. The next implementation sequence remains the one in the handbook Index; this publishing batch adds no domain functionality.
