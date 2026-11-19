# D01 AS-IS inspection and engineering handoff

**Baseline:** 13322c8a6aaa3d0a4ebda56ba94086da62545712. Static inspection only; this pack changes no application behavior. Ticket IDs below are new D01 handoff IDs, not replacements for original RW/source IDs.

**Current handoff:** the [resolved D01 design](D01_Resolved_Design.md) settles the earlier ten questions. The tickets below are implementation/verification work, not ten requests for user approval. Build the versioned/manual workflow without waiting for a universal legal engine. Actual methodology confirmation and engagement evidence remain attributable auditor work.

## Existing behavior to preserve

| Inspected location | Evidence in current code | Implication |
| --- | --- | --- |
| scripts/pilot-intake.mjs: client-save/client-contact, enquiryAction | Firm-level client/enquiry records; client versions, dated contacts, new-period context | Pre-engagement intake already exists |
| scripts/pilot-acceptance.mjs: positiveGaps, review, decide | Evidence/basis, independent review, authorized partner and exact terms binding | Preserve these checks |
| scripts/pilot-acceptance.mjs: decide | Conditional outcome has setupAuthorized=false and requires condition details | Conditional does not currently authorize activation |
| scripts/pilot-registers.mjs: M04-F05 validation | Prohibition cannot have acceptable residual risk; unknown cannot be cleared | Preserve nonwaivable prohibition semantics |
| scripts/pilot-server.mjs: activate | Combines intake, terms and acceptance gaps | New rules must integrate this owning gate |
| scripts/pilot-intake.mjs / pilot-acceptance.mjs | Client confirmation/version, agreement and evidence hashes enter decision basis | Changed evidence can stale a decision |
| scripts/pilot-acceptance.mjs: agreedTermsFields | Authorized dated signer and manually verified agreement evidence | This is manual verification, not an e-signature provider integration |
| scripts/pilot-population.mjs / G03 source/guide patterns | Mapping, preview/reconciliation concepts for engagement populations | Reuse concepts; client rows do not belong in financial population tables |

## Ordered tickets

| ID | Change / exact handoff | Depends on | Definition of done | Disposition |
| --- | --- | --- | --- | --- |
| D01-T01 | Implement versioned firm methodology profile and bounded manual checklist catalogue | Resolved design sections 1-3 and 7 | Local 2023 ethics basis/2018 reference represented; actual audit package recorded; comparison editions separate; no unsupported automatic-compliance claim | Ready to implement; firm confirms actual profile before use |
| D01-T02 | Add structured applicability/fact/result records around existing acceptance checks | T01 | Rule/version/evidence/actor persisted; manual conclusions supported; unresolved applicable rule holds only affected positive action | Ready to implement |
| D01-T03 | Add rule-specific not-applicable reasons, including firm-tenure exception | T01,T02 | Qualified exception passes; unknown category and generic N/A fail; predecessor N/A retained | Required bounded build |
| D01-T04 | Implement the 135-field answer contract and explicit source mappings | Question_Answer_Contract.csv; working baseline; T01 | Original answers retained; grouped options, polarity, qualified declaration and six mapping differences tested | Ready to implement |
| D01-T05 | Make declaration coverage attributable to actual acceptance participants | T04 | No blank/template role counts as a declaration; changed participant needs current D01 clearance | D01 validation only; D02 assignment engine deferred |
| D01-T06 | Add explicit withdrawal/change-of-assurance decision records and legal-review handoff | T01,T02 | No unauthorized continuation/downgrade; manual communication evidence; issued history preserved | Required bounded build |
| D01-T07 | Require D01 for new/subsequent-period work and explicit legacy_unassessed treatment | Resolved design section 8 | New supported cases cannot silently skip D01; legacy records preserved; current clearance required before next positive progression | Ready to implement |
| D01-T08 | Add manual agreement-validity checklist to existing exact-version terms verification | Resolved design section 5 | Paper/electronic requirements and signer authority documented; upload hash not presented as authenticity proof | Ready to implement |
| D01-T09 | Implement previewed, reviewed client import through client-master services | Import schema/field dictionary; resolved design section 9 | Atomic, idempotent, version-checked batch; import scenarios pass; no acceptance state imported | Ready to implement |
| D01-T10 | Review material-change dependency granularity | T02 | Demonstrate material change stales clearance; justify cosmetic-change policy without weakening current gates | Investigation; not a proven defect |
| D01-T11 | Execute approved D01 scenario suite and reviewer signoff | T01-T10 as applicable | Store actual run IDs/results and professional acceptance; distinguish deferred tickets | Verification after implementation |

### Specific implementation boundaries

- `acceptanceCurrent` returns true when the optional acceptance profile is absent. This is an observed compatibility path, not proof that every production engagement currently bypasses acceptance. T07 must establish intended coverage before changing it.
- `positiveGaps` currently allows not-applicable for the predecessor check only. T03 adds reviewed rule-specific applicability; it must not introduce a general escape.
- Decision outcomes currently include accept/continue/defer/decline/conditional, not a complete withdrawal lifecycle.
- Lower-assurance proposals currently carry justification text. T06 requires an explicit professional conclusion and legal/statutory analysis, not merely a nonempty field.
- Edition/requirement evidence currently includes free text. T02 structures applicability without discarding existing evidence.
- Source hashes affect source validity, not permission to delete or overwrite earlier work.

## Ticket review sequence

Use the pinned working source and resolved contracts. Implement in the existing owning commands; T09 can proceed independently of statutory calendar interpretation. Test actual behavior against the recorded scenarios. The responsible firm confirms its real methodology profile and engagement conclusions; independent release verification follows implementation.

The historical source-binary and exact ISA approval-instrument limits remain recorded in the resolved design. They do not justify waiting on unrelated implementation or claiming automatic compliance. The research pack does not confer real professional sign-off.

No estimate, assignee identity or completion date is invented. Review meetings should assign a named person and due date to every open decision before scheduling blocked implementation.
