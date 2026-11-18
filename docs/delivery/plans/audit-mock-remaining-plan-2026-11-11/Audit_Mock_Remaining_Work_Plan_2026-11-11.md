# Audit_Mock remaining development plan

Prepared 11 November 2026. Working baseline `25486b7448e6e5fc4d830868de943962209db3f3` on `wave-0-audit-controls`.

The immediate priority is the interface redesign. This document preserves the remaining functional, automation, source-verification and release work so development can resume after the design session. It replaces the remaining-work sequence in the 9 November plan while retaining its WP-00–WP-29 identifiers for traceability. The new R00–R24 identifiers identify the work left from this baseline.

The target is one shared audit workspace in which the firm can conduct the approved audit workflows, with useful screens for each role, working forms, evidence, calculations, reviews, reporting and custody. Completion requires the applicable source workflows and their material alternatives to work together on persisted records.

## 1. Evidence basis and current position

This plan uses the current repository entry points and modules, the checked-in source registers, the original development-plan registers, and the latest saved verification run. All eight test-file hashes in that run match the current files after line-ending normalization. The repository was clean at the planning checkpoint. A fresh page-by-page review of all original documents and image-only material remains part of R00 and R23.

| Measure | Position at this checkpoint | Interpretation |
|---|---|---|
| Test suite | 58 passing, zero failed or skipped in the saved run | Evidence for the exercised behavior |
| Build | Current in that run | Build evidence belongs to the recorded commit |
| Connected lifecycle scenarios | 4 of 51 | A08, A11, A25 and the recorded issued-and-sealed A28 route |
| Directly evidenced E2E steps | 48 of 476 | Other steps require a connected demonstration or an approved scope disposition |
| Directly evidenced acceptance criteria | 59 of 315 | Implementation and criterion-specific proof still need reconciliation |
| Core features | 127 | 136 source rows comprise 127 core, eight conditional follow-up and one excluded consolidation row |
| Automation minimums | 58 | 33 have partial mapped evidence in the current verifier |
| Future automation rows | 58 | Each awaits an explicit scope decision |
| Workpapers | 70 source contracts loadable | Per-form faithful implementation and acceptance remain open |
| Fieldwork variants | 22 | Each needs its own complete applicable fieldwork scenario |
| Confirmed form references | 20 | Two have partial direct fixture evidence |
| BPMN interpretation and mapping | 185 gateways and 827 flows | All 1,012 entries remain open in the formal transition register |
| Independent source acceptance | Zero recorded decisions | Business acceptance remains a release responsibility |
| Overall release gate | Open | The verifier records `releaseReady = false` |

An open source row may already have substantial working code. Its current evidence status determines the next inspection, rather than prescribing a rebuild. The earlier approximately 65% implementation estimate was a rough work-package estimate. This plan uses named outputs and closure evidence as its progress measure.

Existing foundations include shared SQLite engagement records, scoped commands, revision checks, idempotent operations, typed intake and signed terms, roster and work assignments, tasks/calendar/Gantt, native form loading, controlled template publishing and Excel question import, accepted-source population checks, requests and sandbox confirmations, sampling, journal and area checks, findings and verified postings, review and EQR, reporting, local signing/delivery, archive grants/holds/successors and a local backup/restore rehearsal.

Later changes supersede several earlier progress notes. Independent quality and custody accounts, scoped materiality, accepted-extract provenance, active signed-terms amendments and substantive later-fact reissue now have working implementations. Their remaining work concerns uncovered scenarios, complete source coverage, user experience and release acceptance.

The repository currently has two product entry points. `/` renders `AuditWorkspaceV2`; `/pilot` renders `PilotWorkspace` and its shared services. Consolidating useful interactions onto the shared records is an explicit part of this plan. The interface inventory must establish which screens still depend on browser state and which already use authoritative server records.

## 2. Scope and completion rules

The core commitment remains all 127 core feature contracts and all 58 automation minimum contracts. All applicable workpaper, criterion, fieldwork and E2E requirements must be reconciled against that release. The 51-cycle inventory contains core audits, applicable audit situations, broader firm processes and separate services. Each cycle keeps its original ID and scope evidence.

D24 follow-up, complete wider firm processes, separate services and the 58 future automation rows retain individual mandate decisions. The audit-facing interfaces needed by the core app remain part of core delivery. M03-F07, canonical client consolidation, retains the source exclusion. AUTO-043 concerns audit review of supplied consolidation/intercompany evidence and retains its own minimum contract.

Each work item progresses through evidence states of assessed, designed where needed, implemented, technically demonstrated, source reconciled and independently accepted. Record an approved scope disposition where applicable. Keep these states separately reportable so UI approval, passing calculations and full source acceptance remain understandable.

For a completed core feature, the intended person can execute the action through its normal screen, save and reload the result, hand it to the next role, encounter appropriate failed or returned cases, and see the effect of changed inputs. Permissions, versions, evidence and history must follow the same records.

For a completed automation minimum, retain the accepted input versions, method and effective edition, independently expected results, actual output, exception dispositions, required human decision and downstream use. Exercise missing, invalid, stale and unsupported inputs and relevant retries. A human audit judgment must remain attributable to its actual decision-maker.

For a completed lifecycle, start at the source trigger and follow the same engagement through applicable steps and material branches. Capture the actor, action, expected and actual result, input/output versions and next owner. API and domain tests establish rules. Normal browser journeys establish usability and cross-role wiring.

## 3. Delivery sequence

These batches organise related work. R23 source reconciliation runs throughout them. Package dependencies govern implementation, and partial designs can be explored with clearly identified fixtures while dependent behavior is being completed.

Dependencies identify required capabilities. A package can extend an existing demonstrated path before every variant of a prerequisite package has closed. The core release still requires closure of all applicable variants and handoffs. This supports useful batches during implementation while preserving the full release obligation.

| Batch | Packages | Outcome |
|---|---|---|
| 0 | R00 | A reproducible checkpoint and an accurate distinction between built behavior, evidence gaps and actual missing work |
| 1, immediate design focus | R01–R06 | Role navigation, visual system and connected working screens grounded in actual audit tasks |
| 2 | R07–R10 | Faithful forms, builder, linked facts and complete identity/assignment foundations |
| 3 | R11–R12 | Intake, independence, terms and approved planning work together |
| 4 | R13–R17 | Accepted data, evidence, sampling, fieldwork and automation work at required source depth |
| 5 | R18–R21 | Findings, completion, independent review, issue and custody close the engagement |
| 6 | R22–R23 | Integrated source acceptance, deployment and operational readiness |
| Mandated extensions | R24 | Separately approved follow-up, firm processes, services and automation extensions |

The former next functional batch was A26/A27 reporting and custody. During the design focus, R04–R06 should include their screens and handoffs. Once design work is complete, R20/R21 can resume as a bounded connected batch, followed by the highest-priority open dependencies and earlier lifecycle gaps. The package order also shows the dependencies for a complete core release.

## 4. Detailed remaining work

### R00 — Establish the resumable baseline and scope register

**Original work packages** WP-00, WP-02, WP-25. **Priority** P0. **Relative effort** S. **Proposed owner** Tech lead and QA with methodology owner. **Dependencies** Existing baseline.

The saved verification run provides useful evidence, source hashes and current tests. The remaining assessment must distinguish observed implementation from absent behavior for each source item and reconcile older notes.

- [ ] **R00.1 — Pin the starting state.** Record branch, commit, build, source hashes, runtime assumptions and the safe disposable demo/verification databases. Retain a recovery copy before migration or redesign integration.
- [ ] **R00.2 — Reconcile the existing implementation.** Inspect the two UI entry points and their owning services. Classify each screen/action as shared, browser-local, illustrative, partial or absent, with an evidence link and specific gap.
- [ ] **R00.3 — Assign source scope and ownership.** Give each applicable feature, minimum, criterion, variant, dependency and cycle an accountable package. Keep original IDs and distinguish scope-pending extensions and bounded firm interfaces.
- [ ] **R00.4 — Resolve source conflicts and inventory dispositions.** Preserve a file/member inventory for the complete ZIP and companions, with each item classified as an owning requirement, supporting reference, duplicate/translation, historical material or explicitly scoped item. Review relevant original pages, companion cells, BPMN labels, ERD relationships and ontology terms when their interpretation affects a task. Record an actual decision and owner for D01–D29.
- [ ] **R00.5 — Correct the progress record.** Bring earlier statements into alignment with later implementations. Keep dates and links to the behavior or evidence that changed the status.

**Complete when** A new contributor can reproduce the baseline, locate the authoritative record behind each principal screen and identify the specific unfinished work without interpreting historical percentages.

### R01 — Research and define the redesigned working experience

**Original work packages** WP-04, WP-05, WP-11, WP-22–WP-24. **Priority** P0. **Relative effort** M. **Proposed owner** Product designer with senior auditor and frontend lead. **Dependencies** R00.

Existing audit and external-product research provides a starting reference library. Refresh the relevant references when this task begins and capture the mechanism, evidence date and useful interaction.

- [ ] **R01.1 — Review at least ten audit products.** Start with Caseware, Inflo, CCH, AuditFile, BrightWorkpapers, Fieldguide, DataSnipper, MindBridge, Circit and Confirmation. Use available official help, demos and walkthroughs. Capture the actual documented workflow and visibility limits of each observation.
- [ ] **R01.2 — Compare specific user actions.** Examine opening/preparing a paper, linking evidence, receiving a request, reviewing exceptions, following risks to procedures, scheduling work, approving a report and retrieving an archive. Keep a decision record for each adopted pattern.
- [ ] **R01.3 — Use secondary interface references selectively.** Review task queues, calendars, tables, search, permissions and builder interactions from appropriate work-management products. Express each transfer in audit terminology and actual role responsibilities.
- [ ] **R01.4 — Walk through representative audit tasks.** Use a preparer, senior, partner, quality reviewer and custodian scenario. Record where the existing interface hides work, repeats entry, overloads a screen or makes the next action unclear.
- [ ] **R01.5 — Produce the design brief and screen inventory.** Define primary tasks, navigation, screen purposes, key states and acceptance journeys. Reuse confirmed source requirements and stable object IDs.

**Complete when** Each proposed major screen has a named user task, source/workflow justification, selected interaction reference and a testable user outcome. The research informs original layouts, terminology and interaction decisions.

### R02 — Rebuild information architecture and role navigation

**Original work packages** WP-03, WP-04. **Priority** P0. **Relative effort** M. **Proposed owner** Designer and frontend lead with firm access owner. **Dependencies** R01.

- [ ] **R02.1 — Define global and engagement navigation.** Establish My Work, Clients/Engagements, Calendar and permitted firm administration. Inside an engagement, organise programme/workpapers, evidence/requests, data, findings, reviews, reporting and archive around their owning work.
- [ ] **R02.2 — Define role defaults.** Preparers start with assigned and returned work. Seniors start with review, blockers and delivery. Partners start with decisions and portfolio exceptions. Quality reviewers and custodians start with their assigned packages/actions.
- [ ] **R02.3 — Connect every navigation item to an action.** Remove the standalone decorative audit-flow presentation from the daily path. Keep source coverage and methodology in a reference area. Replace filler settings with actual preferences or authorised controls.
- [ ] **R02.4 — Preserve context across navigation.** Keep client, engagement, reporting period, filters, selected work and return location understandable through deep links and browser back/forward. Offer a clear way to open work in a new browser tab.
- [ ] **R02.5 — Define visibility and denial states.** Align navigation with actual permissions and show useful access-expired or unavailable states for direct links. Verify role changes and engagement switching.

**Complete when** Every daily action has a predictable home and each role can locate its next task without navigating a generic feature catalogue.

### R03 — Establish the visual system and accessible interactions

**Original work packages** WP-04, WP-05. **Priority** P0. **Relative effort** M. **Proposed owner** Designer and frontend lead. **Dependencies** R01, R02.

Theme styling already exists in the older workspace. Inspect its actual screen coverage and shared-workspace compatibility before extending it under the selected visual system.

- [ ] **R03.1 — Define reusable visual tokens.** Establish readable typography, spacing, widths, density, colour, borders, focus, icons and status treatment. Check real Mongolian labels and long client/form names.
- [ ] **R03.2 — Standardise working components.** Use coherent page headers, tables, filters, date/period pickers, contact/entity selectors, repeatable rows, upload controls, status messages, notes and action bars.
- [ ] **R03.3 — Design light and dark themes.** Apply theme tokens to the selected shared workspace and all principal dialogs, fields, tables, charts, evidence views and independent-role screens. Save the user's actual preference.
- [ ] **R03.4 — Design complete interaction states.** Include loading, empty, validation failure, permission denial, unsaved changes, stale revision, offline/server failure and safe retry states.
- [ ] **R03.5 — Check accessibility and layout.** Verify keyboard paths, visible focus, labelled fields, contrast, zoom, table overflow and text wrapping at representative laptop sizes. Give dense financial tables room to remain readable.

**Complete when** Principal screens use the same component rules and remain usable in both themes and keyboard-driven workflows. Screenshot review covers realistic content and error states.

### R04 — Redesign the full-page workpaper and review experience

**Original work packages** WP-05, WP-13, WP-22. **Priority** P0. **Relative effort** L. **Proposed owner** Frontend lead with preparer and senior auditor. **Dependencies** R02, R03.

- [ ] **R04.1 — Make the full-page paper the normal working view.** Open directly from tasks, programme, calendar or search. Display client, period, reference, title, revision, owner, reviewer and status in a readable header.
- [ ] **R04.2 — Make the form immediately usable.** Show its substantive sections on entry, with section navigation and progress where useful. Eliminate the mandatory extra step to open all inputs. Use structured fields for legal identity, governance contacts, dates, decisions, amounts and repeated schedules.
- [ ] **R04.3 — Integrate context and evidence.** Provide accessible evidence, linked facts, dependencies, relevant population/sample and prior reviewed versions. Allow a secondary panel to be opened or closed while the paper retains usable width.
- [ ] **R04.4 — Clarify save, submit and review.** Distinguish saved draft, submitted revision, returned work and changed reviewed content. Anchor review notes to fields/rows and let the reviewer compare the submitted content and response before a dated decision.
- [ ] **R04.5 — Test realistic form families.** Exercise 1.1.1 with incomplete acceptance, 1.3 materiality, 3.1.2 assets, 3.3.1 sampling and a completion/review paper. Include long tables, missing evidence, returned work and source changes.

**Complete when** A preparer can fill, save, reload and submit a realistic paper, a senior can return and clear it, and the user can follow its evidence and dependencies through normal navigation. Technical behavior uses existing shared services where they support the contract.

### R05 — Redesign evidence, requests and data preparation screens

**Original work packages** WP-10, WP-11, WP-13. **Priority** P0. **Relative effort** L. **Proposed owner** Frontend lead with data and audit leads. **Dependencies** R02, R03, R04.

- [ ] **R05.1 — Build the engagement evidence library view.** Show document type, source, period, receipt, assessment, version, linked requests/papers and responsible person. Support photos, PDF, Word, Excel and data exports with a useful preview or readable download path.
- [ ] **R05.2 — Design received-versus-accepted work.** Make partial request fulfilment, replacement, rejection, duplicate detection and alternative evidence understandable. Show which intended uses remain outstanding.
- [ ] **R05.3 — Integrate requests with their owning task.** Provide request creation, item requirements, contact, deadline, delivery history and follow-up action without requiring the user to re-enter engagement context.
- [ ] **R05.4 — Design the data-preparation sequence.** Present original file, import context/mapping, quarantine, reconciliation, account/statement bridge, review and approved population as connected steps. Show exact row-level problems and their resolution.
- [ ] **R05.5 — Show automation results in context.** Link the run to its paper, source version, investigated exceptions and conclusion. Present an explanation when an input revision makes earlier work stale.

**Complete when** A user can receive an actual fixture, assess its intended use, approve a suitable dataset and reach the dependent paper with a visible chain of evidence.

### R06 — Redesign planning, queues and decision desks

**Original work packages** WP-04, WP-07, WP-22–WP-24. **Priority** P0. **Relative effort** L. **Proposed owner** Frontend lead with senior, partner and independent roles. **Dependencies** R02, R03.

- [ ] **R06.1 — Build useful personal queues and calendars.** Show assigned work, due dates, returns, waiting items and review actions. Keep dated work and appointments distinguishable. Link every item to its owning action.
- [ ] **R06.2 — Make the senior's Gantt operational.** Group work by engagement/area/person, show dependencies, blockers, unscheduled work, baseline/current dates and workload. Date or assignment changes must update the same task in calendar and paper views.
- [ ] **R06.3 — Design progress measures honestly.** Show prepared, awaiting review, returned, blocked and reviewed work with a defined denominator and an as-of time. Surface the next responsible person and decision.
- [ ] **R06.4 — Design the partner decision desk.** Summarise pending acceptance, changed terms, significant matters, unresolved quality concerns, report readiness and the exact package awaiting approval.
- [ ] **R06.5 — Design independent-role desks.** Give EQR users eligibility/assignment, package and concerns. Give custodians transfer, verification, retrieval, holds and disposition actions within their grants.
- [ ] **R06.6 — Connect the selected redesigned screens.** Move approved interactions onto shared records and retire superseded entry paths after normal browser journeys and regression checks establish replacement behavior.

**Complete when** A schedule change, returned paper or newly stale approval reaches the appropriate queues and the same underlying record is visible across views. A separate screen does not create a separate copy of the engagement.

### R07 — Complete native behavior across all 70 source forms

**Original work packages** WP-05, WP-13. **Priority** P1. **Relative effort** XL. **Proposed owner** Form/domain leads with methodology owner. **Dependencies** R04, R09; shared foundation already present.

- [ ] **R07.1 — Audit meaningful fields and schedules.** Compare each repaired companion sheet with the native contract, identify composites, dates, options, repeated rows, totals, calculations and applicability. Preserve source anchors and Mongolian wording.
- [ ] **R07.2 — Classify spreadsheet behavior.** Reconcile the previously inventoried 272 formula cells and 1,820 validation objects as layout/numbering, validation or operative audit behavior. Document the implemented equivalent or an approved variance.
- [ ] **R07.3 — Implement missing native structures.** Add required field groups, row models and field-level validation. Preserve legitimate zero, blank, unknown and N/A with its rationale.
- [ ] **R07.4 — Complete persistence and presentation.** Exercise save/reload, submission, exact reviewed revisions, historical viewing, template adoption and readable export for every applicable form family.
- [ ] **R07.5 — Accept forms in coherent groups.** Work through the source stage groups of 11, 16, 31, 11 and one form while respecting actual dependencies. Give each of the 70 forms its own fidelity record and open issues.

**Complete when** Every applicable form and substantive field group has source-linked behavior and a demonstrated working journey. The stage groups organise verification while dependencies determine work order.

### R08 — Complete the controlled Form Builder and Excel importer

**Original work packages** WP-05. **Priority** P1. **Relative effort** L. **Proposed owner** Frontend/domain leads with methodology publisher. **Dependencies** R04, R07, R10.

- [ ] **R08.1 — Assess the existing builder against all M02 requirements.** Record the implemented controls and missing authoring, publishing, comparison, retirement and communication behavior.
- [ ] **R08.2 — Complete the question and form model.** Support required text, numbers, currency, dates/periods, yes/no/N/A, single/multiple choice, evidence, sections and repeatable tables. Add conditional applicability and supported rules where sources require them.
- [ ] **R08.3 — Complete import mapping and preview.** Let the user map Excel columns, inspect inferred types/options, resolve duplicate IDs and unsupported rules, preview additions/changes/deactivation and commit an understood draft. Preserve original import provenance.
- [ ] **R08.4 — Complete permission and publishing workflows.** Exercise a grant for one template, independent release approval, effective dates, release comparison, retirement and communication to affected engagement owners.
- [ ] **R08.5 — Complete version adoption.** Show compatible answer carry-forward and unresolved changes before adoption. Preserve prior signed content, evidence links and reviews and enforce centrally governed professional gates through template changes.

**Complete when** An authorised person can create or adapt a real form from Excel, publish it through the required review and adopt it into an engagement with explicit treatment of old answers.

### R09 — Complete linked facts, references and roll-forward

**Original work packages** WP-02, WP-05, WP-06, WP-09. **Priority** P1. **Relative effort** L. **Proposed owner** Domain/data lead with methodology owner. **Dependencies** R00, R04; iterates with R07, R11, R12.

- [ ] **R09.1 — Resolve all 20 confirmed references.** Identify the owning fact, approved version, target field/action, authority and applicability. Use the exact DEP-C IDs in the appendix.
- [ ] **R09.2 — Implement linked values and confirmations.** Reuse client identity, contacts, period, terms and decisions from their owning records. Show provenance and require confirmation where reuse needs a current-period decision.
- [ ] **R09.3 — Apply action-specific dependencies.** Permit drafting independent fields while the relevant decision remains pending. Enforce the prerequisite at the source-supported submission, approval or progression point.
- [ ] **R09.4 — Complete change impact.** Revise each source and prove which target answer, calculation, review or authorization becomes stale. Retain the earlier reliance chain and unaffected work.
- [ ] **R09.5 — Complete period roll-forward.** Carry selected approved context and structure with source-period/version provenance. Require new-period assessment for evidence, independence, terms and judgments as applicable.

**Complete when** A fact can be followed from its owner into later forms and a changed fact produces an understandable, targeted work queue. All confirmed references have their own tests or approved disposition.

### R10 — Complete identity, permissions, staffing and work economics

**Original work packages** WP-03, WP-04, WP-07. **Priority** P1. **Relative effort** L. **Proposed owner** Backend/frontend leads with access and staffing owners. **Dependencies** R00, R02, R06.

- [ ] **R10.1 — Replace preset business-account limits.** Implement the approved named-account invitation, activation, role/engagement assignment, suspension and departure lifecycle. Preserve attributable historical signatures.
- [ ] **R10.2 — Complete authority configuration.** Provide a readable permissions matrix for firm, engagement, work and template scope, including delegation and expiry. Match every visible control to actual server enforcement.
- [ ] **R10.3 — Complete staff and specialist suitability.** Exercise roster status, competence, credentials, allocation, availability, declarations and scoped contributor access. Resolve specialist sign-in needs against approved workflows.
- [ ] **R10.4 — Add actual effort and budget monitoring.** Record attributable time/effort against owned work, compare planned and actual totals and explain variances. Keep calendar events, task dates and effort entries as their appropriate record types.
- [ ] **R10.5 — Verify access changes throughout the app.** Exercise grant, revocation and regrant across lists, search, previews, direct links, files, reports and exports. Check cross-engagement isolation and concurrent role changes.

**Complete when** Staff can join and leave the real working model, seniors can allocate and inspect work, and changing a grant has the intended scope without losing historical accountability.

### R11 — Complete intake, continuance, independence and terms

**Original work packages** WP-06, WP-08. **Priority** P1. **Relative effort** L. **Proposed owner** Domain lead with acceptance/ethics owner. **Dependencies** R09, R10.

- [ ] **R11.1 — Close A01 and A03 as complete journeys.** Join enquiry, client/contact context, required prerequisites, acceptability, exact signed terms, approval and activation for both new and continuing clients.
- [ ] **R11.2 — Close A02 independence.** Obtain team/expert declarations, record threats and safeguards, route unresolved matters, enforce the right authority and revisit clearance when relevant relationships or services change.
- [ ] **R11.3 — Complete acceptance outcomes.** Support return, deferral, decline, permitted conditions, escalation and withdrawal with an owner, rationale, dated evidence and controlled effect on active work.
- [ ] **R11.4 — Extend terms-amendment coverage.** Reuse the existing exact-file amendment and partner reassessment. Verify stale approvals, new/continuing periods, unresolved prerequisites and downstream scope consequences.
- [ ] **R11.5 — Confirm master-data boundaries.** Distinguish internal client maintenance from any authoritative source-system update. Route duplicate suspicion to its permitted owner and preserve the D03 exclusion.

**Complete when** A01–A03 can each be demonstrated from trigger to outcome, including material alternatives, with applicable facts flowing into scope workpapers.

### R12 — Complete planning, risks, controls and opening balances

**Original work packages** WP-09 and applicable WP-10/WP-19. **Priority** P1. **Relative effort** XL. **Proposed owner** Audit domain lead with methodology owner. **Dependencies** R07, R09, R11; uses R13 inputs when required.

- [ ] **R12.1 — Complete entity and systems understanding.** Structure business/reporting/IT/control understanding, fraud discussions, significant changes, opening balances and preliminary analytics with evidence and conclusions.
- [ ] **R12.2 — Complete the risk-to-response model.** Link multiple risks to accounts, assertions, significance, controls and multiple procedures. Tailor nature/timing/extent, owners, dates and applicable template versions.
- [ ] **R12.3 — Complete controls work.** Record walkthrough, design/implementation, intended reliance, tests, deviations, reviewer decisions and the resulting response changes.
- [ ] **R12.4 — Extend A08 evidence across contexts.** Reuse typed benchmark rationale and scoped thresholds. Verify relevant forms, revisions, sample/evaluation consumers and the professional selection rules in approved policy.
- [ ] **R12.5 — Complete A04–A10 and A12 handoffs.** Join mobilisation, kickoff, understanding, risks, opening balances, strategy and controls to approved work. Exercise a revised plan and targeted reopening of execution.

**Complete when** Every applicable assessed risk has an owned approved response and a changed planning input identifies the affected fieldwork. Opening-balance and controls conclusions remain supported by their actual work.

### R13 — Complete data intake, ledger/TB integrity and analytics

**Original work packages** WP-10, WP-13. **Priority** P1. **Relative effort** L. **Proposed owner** Data/backend leads with audit data reviewer. **Dependencies** R05, R09, R10.

- [ ] **R13.1 — Broaden approved import contracts.** Support the source-required export profiles, sheet/column mapping and accounting contexts. Keep original bytes, identifiers, source system, entity, period and currency visible.
- [ ] **R13.2 — Complete integrity controls.** Reconcile ledger/trial-balance relationships, opening balances, independent counts/totals, duplicate/missing keys, account splits and comparative/statement links according to the minimum contracts.
- [ ] **R13.3 — Complete reusable mappings and review.** Version import profiles and account-to-statement mapping, explain unmapped or ambiguous rows and require the owning review before dependent use.
- [ ] **R13.4 — Close AUTO-002–AUTO-008 and AUTO-010.** Compare each exact method and output with the source contract. Complete missing computations, exception handling and human conclusions with independent expected fixtures.
- [ ] **R13.5 — Extend A11 and data-revision evidence.** Preserve the working accepted-request chain and prove its behavior with supported additional profiles, replacements, partial failures, retries and downstream populations.

**Complete when** A reviewer can explain the approved population and its bridge to the supplied records, and downstream work uses that exact version with visible unresolved exceptions.

### R14 — Complete evidence requests, originals and confirmations

**Original work packages** WP-11. **Priority** P1. **Relative effort** L. **Proposed owner** Evidence/backend leads with audit reviewer. **Dependencies** R05, R09, R10.

- [ ] **R14.1 — Complete file handling and evidence assessment.** Exercise supported photos/PDF/Word/Excel/data originals, metadata, file versions, relevance/reliability, intended uses, annotations and readable retention.
- [ ] **R14.2 — Complete request and coverage behavior.** Test multipart/partial fulfilment, rejected-only, cancelled/draft requests, alternative evidence, reminders and overdue work under AUTO-001.
- [ ] **R14.3 — Close A14 confirmation alternatives.** Handle recipient validation, dispatch/reply provenance, nonresponse, returned delivery, differences and alternative procedures with the appropriate auditor decisions.
- [ ] **R14.4 — Close A18 evidence problems.** Route missing or contradictory evidence through further work, review, revised conclusions and consequences for completion.
- [ ] **R14.5 — Verify whole-app evidence scope.** Cover lists, search, previews, requests, external links, downloads, exports and archived copies, including expiry/revocation and safe replacement.

**Complete when** Receipt, assessment and reliance are traceable across the request, original file, workpaper and conclusion, including the required failure and alternative routes.

### R15 — Complete sampling, journal work and tested-unit execution

**Original work packages** WP-12, WP-13. **Priority** P1. **Relative effort** L. **Proposed owner** Domain/data leads with methodology owner. **Dependencies** R12, R13, R14.

- [ ] **R15.1 — Reconcile sampling methods to AUTO-047.** Verify the approved minimum against the existing deterministic selection and independently reviewed design. Identify any required statistical method and record its explicit assumptions and policy.
- [ ] **R15.2 — Complete selected-unit testing.** Retain original row, evidence, procedure result, factual/qualitative deviation and evaluation. Exercise duplicates, zero/negative amounts, replacements, incomplete tests and changed designs.
- [ ] **R15.3 — Complete journal and analytic investigations.** Close AUTO-009 against required filters, source provenance, review, changed datasets and disposition of each selected exception.
- [ ] **R15.4 — Complete expansion and response.** Route deviations or unsupported tests to further work, revised risk/reliance and findings. Retain the prior selection and decision history.
- [ ] **R15.5 — Demonstrate A13 fieldwork handoffs.** Start from approved programme/population and follow selected units into reviewed conclusions and findings on the same engagement.

**Complete when** The team can reconstruct why a unit was selected, what was tested, which evidence supported it and how exceptions affected the conclusion.

### R16 — Complete all 22 fieldwork variants and their area automations

**Original work packages** WP-14–WP-19 and applicable WP-13. **Priority** P1. **Relative effort** XL. **Proposed owner** Area domain leads, data engineers and methodology owner. **Dependencies** R07, R12–R15.

- [ ] **R16.1 — Inspect each area's source procedures.** Use the 22 variant rows and linked companion forms to identify required assertions, source schedules, methods, exceptions and review outcomes. Record the remaining gap against existing area runs.
- [ ] **R16.2 — Complete commercial methods.** Close revenue recognition/cutoff/credits/pricing, receivable aging and receipts, procurement matching, supplier/payee risks, liabilities and cash/bank movement as required by AUTO-011–AUTO-021.
- [ ] **R16.3 — Complete inventory and asset methods.** Close item/location/unit movements, counts, cutoff, costing, NRV indicators, roll-forward, depreciation/amortization, useful-life analysis and capitalization screening under AUTO-022–AUTO-030.
- [ ] **R16.4 — Complete statutory and finance methods.** Reconcile AUTO-031–AUTO-040 to approved supported profiles. Implement required bands, rule variants, lease/interest/currency/equity/investment methods and reject unsupported policies visibly.
- [ ] **R16.5 — Complete related-party, estimate and supplied group evidence.** Close AUTO-041–AUTO-043 within approved boundaries, including ownership revisions, assumptions, valuation inputs, contribution scope, eliminations and unresolved limitations.
- [ ] **R16.6 — Accept each variant individually.** For every applicable variant, run a supported normal case, meaningful exception, missing/unsupported input, independent review and changed-source case. Carry at least one finding through the connected completion path.

**Complete when** Each of the 22 variants has its own substantive scenario and supported conclusion. A successful calculation remains linked to the broader procedure and professional assessment.

### R17 — Complete cross-cutting technical and exception workflows

**Original work packages** WP-19, WP-21, WP-22. **Priority** P1. **Relative effort** L. **Proposed owner** Technical audit lead with methodology owner. **Dependencies** R12, R14, R15; iterates with R18, R19.

- [ ] **R17.1 — Complete fraud and non-compliance response.** Connect concern, evidence preservation, restricted discussion where required, escalation, extra work and the authorised conclusion for A17.
- [ ] **R17.2 — Complete specialist/component coordination.** Close A16 scope, competence/independence, instructions, contribution, auditor involvement, limitations and additional work using accountable contributor records.
- [ ] **R17.3 — Complete estimates and significant accounting matters.** Retain method/assumption evidence, contrary information, management bias assessment and a reviewed resolution for A15.
- [ ] **R17.4 — Complete cross-cutting minimums.** Close AUTO-044/045/049/050/051 for going concern, subsequent transactions/events, legal matters, commitments and contingencies using explicit source inputs and owned conclusions.
- [ ] **R17.5 — Reassess affected work.** Demonstrate how a new technical fact changes risks, procedures, findings, disclosure, report readiness or consultation while preserving the prior decision record.

**Complete when** Technical issues can travel from discovery to an authorised, evidence-supported outcome and their reporting consequences remain visible.

### R18 — Complete findings, corrections and final evaluation

**Original work packages** WP-20, WP-21. **Priority** P1. **Relative effort** L. **Proposed owner** Completion/domain lead with audit partner. **Dependencies** R12–R17.

- [ ] **R18.1 — Close A19/A20 finding and correction journeys.** Include management responses, factual/projected/qualitative classification, partial acceptance, posting attempts, exact-ledger verification and revised aggregate evaluation.
- [ ] **R18.2 — Close A21–A23 completion.** Connect period-end matters, final statements/notes, disclosures, final analytics, evidence sufficiency, signed representations and report-date coverage.
- [ ] **R18.3 — Complete A24 communications.** Track required addressees, significant matters, authorised versions, actual delivery outcomes, failed attempts and review with accountable follow-up.
- [ ] **R18.4 — Complete A30 other information.** Record expected annual-report material, receipt/version, inconsistencies, management response and appropriate action when it is pending or changes around issue.
- [ ] **R18.5 — Close completion automations.** Reconcile AUTO-048, AUTO-052, AUTO-053 and AUTO-056 against full minimums, including omitted applicable disclosures and changed statement/conclusion inputs.

**Complete when** The final package has a supported path from each unresolved matter to its disposition or reporting consequence, with all required evidence bound to the exact versions being evaluated.

### R19 — Complete consultation, review and independent quality coverage

**Original work packages** WP-22. **Priority** P1. **Relative effort** L. **Proposed owner** Review/domain lead with quality owner. **Dependencies** R10, R12, R17, R18.

- [ ] **R19.1 — Extend anchored review-note coverage.** Exercise assignment, return, response, clearance, reopening and reassignment across actual workpaper families and row-level anchors.
- [ ] **R19.2 — Extend consultation cases.** Include significant judgments, differing opinions, failed advice receipt, prohibited outcomes and changes to the exact advice/workpaper relied upon.
- [ ] **R19.3 — Complete EQR applicability and eligibility.** Confirm approved policy, independence, assignment, refusal/replacement, access and exact-package review across relevant scenarios.
- [ ] **R19.4 — Close AUTO-054/055 and extend A25.** Verify targeted change impact, unresolved-note blockers, final sign-offs, late/stale approvals and the boundary between partner review and formal independent EQR.
- [ ] **R19.5 — Obtain source-owner review of quality rules.** Reconcile D05/D06/D18 and record the actual policy authority and evidence for acceptance.

**Complete when** Each required review has a valid person, authority, exact scope/version and dated decision, and changed relied-upon content produces the required renewed review.

### R20 — Complete opinion, authorisation and issuance

**Original work packages** WP-23 and applicable WP-21. **Priority** P1. **Relative effort** L. **Proposed owner** Reporting/backend leads with reporting partner. **Dependencies** R18, R19.

- [ ] **R20.1 — Close all applicable opinion paths.** Verify the source-supported templates, basis, approved additional sections, dates, entity/period, addressees and statement package for each applicable opinion.
- [ ] **R20.2 — Close A26 as a connected source scenario.** Begin with evidence/conclusions and opinion formation, then authorise, sign, issue and record actual recipient outcomes against the approved artifact.
- [ ] **R20.3 — Complete dispatch and partial-failure handling.** Retain recipients, version/hash, attempts, failure reasons and retry/idempotency evidence. A partial distribution must have an owned next action.
- [ ] **R20.4 — Extend stale-package tests.** Change statements, disclosures, report sections, dates and relevant quality facts and verify the required authorization/review outcome.
- [ ] **R20.5 — Close AUTO-057 and operational boundaries.** Preserve working local signing and recipient receipts, then bind any approved external signer/delivery adapters through R22.

**Complete when** Each applicable opinion is demonstrated through normal UI and an issued artifact can be matched to its exact authorisation, signature and recipient outcomes.

### R21 — Complete assembly, custody, retention and later-fact variants

**Original work packages** WP-24. **Priority** P1. **Relative effort** L. **Proposed owner** Archive/backend leads with custody and methodology owners. **Dependencies** R18–R20.

- [ ] **R21.1 — Close A27 assembly.** Implement/verify source-supported completeness diagnostics, final-file organisation, missing-content returns, assembly deadlines and the distinction between assembly completion and retention anchors.
- [ ] **R21.2 — Complete custody and inspection work.** Exercise independent readable-manifest verification, returned transfer, search/retrieval, scoped inspection, expiry/revocation and the applicable support-role interface.
- [ ] **R21.3 — Complete retention and disposition policy.** Confirm effective policies, holds, inherited deadlines, approval versus performed disposal and the race where a new hold arrives after approval.
- [ ] **R21.4 — Extend A28 timing and amendment coverage.** Reuse the issued/sealed later-fact journey. Add dated-but-unsealed handling and source-supported restricted-amendment/dual-dating cases with explicit methodology decisions.
- [ ] **R21.5 — Close AUTO-058 and lineage recovery.** Verify successor packages, original retrieval, report/evidence integrity, access, holds and recovery across substantive and administrative amendments.

**Complete when** A26/A27 form a complete issue-to-custody journey and applicable A28 outcomes retain the correct package lineage, controls and actual communication evidence.

### R22 — Complete integrations and operational readiness

**Original work packages** WP-02, WP-03, WP-11, WP-23–WP-25. **Priority** P2, with early architecture decisions. **Relative effort** XL. **Proposed owner** Tech/backend/security/operations leads. **Dependencies** R00, R10; final rehearsal after R13–R21.

- [ ] **R22.1 — Decide the shared deployment model.** Select identity/session governance, hosting, database/storage and environment configuration against actual concurrency, data and recovery needs. Keep configuration and secrets appropriate to each environment.
- [ ] **R22.2 — Implement approved external adapters.** Connect document transfer, messages, client access and signing where mandated. Use durable dispatch state, idempotency, explicit failure outcomes and approved integration sandboxes.
- [ ] **R22.3 — Rehearse upgrade, cutover and rollback.** Compare IDs, counts, versions, grants, dates, signatures and package bytes on a copy of representative old data. Route ambiguous legacy facts for accountable review.
- [ ] **R22.4 — Demonstrate recovery and workload targets.** Agree service/recovery targets with the team, then test representative evidence volumes, imports, simultaneous editing/review and restoration of current and historical archives.
- [ ] **R22.5 — Complete deployment and support operation.** Exercise fresh setup, configuration validation, logging/monitoring, health/failure visibility, controlled release and operator recovery instructions.

**Complete when** The intended deployment can be installed, upgraded, operated and recovered against agreed targets, with demonstrated external effects where the release mandates them. Production readiness has its own acceptance evidence.

### R23 — Close source traceability and independent core acceptance

**Original work packages** WP-25. **Priority** P1, continuous. **Relative effort** XL. **Proposed owner** QA lead with methodology, product and tech owners. **Dependencies** Runs from R00; final closure depends on applicable R01–R22.

- [ ] **R23.1 — Reconcile all core feature and minimum rows.** Inspect implementation, exact requirement and current evidence for each of the 127 core features and 58 minimums. Link missing behavior to an R-package task and retain its original ID.
- [ ] **R23.2 — Close criteria, forms, variants and references.** Give applicable criteria and substantive form groups meaningful assertions. Complete each variant and confirmed dependency with positive, exception, revision and role evidence as appropriate.
- [ ] **R23.3 — Map all BPMN entries.** Resolve every gateway and flow against the actual process, original diagram and owning action. Record implemented behavior, an approved interpretation or explicit scope disposition.
- [ ] **R23.4 — Run connected release journeys.** Demonstrate the applicable A-series branches and approved B-series audit interfaces using persisted records and normal UI across named roles. Preserve all 51 cycle IDs and explain wider-scope dispositions.
- [ ] **R23.5 — Obtain genuine independent decisions.** Record accountable owner, distinct reviewer, source-row hash, approval reference/reason, scenario/test hash and expected/observed outcomes in the acceptance manifest. Reopen stale decisions after relevant changes.
- [ ] **R23.6 — Publish the release evidence.** Report counts by source population and stage of acceptance, resolved scope, known limitations and operational gates against the exact release commit/build.

**Complete when** Every applicable core obligation has demonstrated and independently accepted behavior or a permitted approved disposition, and the strict release verifier passes for the intended scope.

### R24 — Deliver separately mandated wider scope

**Original work packages** WP-26–WP-29. **Priority** Conditional. **Relative effort** To be sized per approved stream. **Proposed owner** Product sponsor and relevant firm/service owner. **Dependencies** Explicit mandate and affected core interfaces.

- [ ] **R24.1 — Decide follow-up scope.** If mandated, implement A29 and the eight M11 features from authorised recommendation through owner, due date, evidence, retest, escalation and supported closure.
- [ ] **R24.2 — Decide complete firm-process scope.** For each B-series cycle, distinguish the audit-facing interface from the broader firm process. Size and deliver approved wider workflows with accountable owners.
- [ ] **R24.3 — Decide separate-service scope.** For C01–C05, define the offered service, appropriate output, role boundaries, professional method and complete cross-role journey before implementation.
- [ ] **R24.4 — Decide each future automation row.** Record include/defer/exclude with owner and reason. Split approved multi-capability rows into implementable tasks, each with independent results, failure handling and review boundaries.
- [ ] **R24.5 — Release approved streams explicitly.** Verify their handoffs to core and obtain their own business acceptance. Report them separately in the source register.

**Complete when** Every optional row has an accountable disposition and each commissioned stream meets its agreed functional and source acceptance.

## 5. The immediate design session

Begin with a compact working demonstration containing two engagements, realistic Mongolian content, a normal paper, a returned paper, a missing-evidence task, a changed-source blocker and a pending partner decision. Use synthetic records with clear provenance and retain the working service contracts.

1. Establish the role navigation and engagement structure in R02.
2. Establish the component/visual rules and both themes in R03.
3. Build the principal full-page workpaper and review loop in R04.
4. Connect evidence/request context and a data-review example in R05.
5. Connect the senior queue, calendar/Gantt and partner readiness view in R06.
6. Check a quality-review and custody handoff so their needs shape the same design.

Design completion is demonstrated when a preparer can find and complete assigned work, a senior can inspect evidence and return it with a specific note, the preparer can revise/resubmit, and the reviewer can clear the current revision. The next responsible user should see each handoff in their queue. A changed dependency should explain the new work required.

The design review should inspect task success, readability, context, next action, errors and keyboard behavior at realistic laptop sizes. Record the chosen decisions and remaining questions with screenshots of the actual build. A structural or visual decision can be reviewed in batches while work continues on already agreed components.

## 6. Functional batches after the design focus

The detailed dependencies above govern scheduling. Use these connected demonstrations to close several related features together.

| Demonstration | Main packages and source cycles | Required result |
|---|---|---|
| Issue through custody | R18–R21, A25/A26/A27/A28 | Correct opinion/package, current approvals, actual delivery/receipt, assembly/custody and controlled later fact |
| Enquiry through approved plan | R09–R12, A01–A10 as applicable | New and continuing acceptance, declarations/terms, staffing, risks and tailored programme |
| Controls and fieldwork | R12–R17, A12–A18 | Control conclusions, accepted data/evidence, selected tests, exceptions, specialist/fraud responses and reviewed area conclusion |
| Findings through final evaluation | R17–R20, A19–A24/A30 | Verified corrections, outstanding amounts, final statements, representations, communications and other-information outcomes |
| Configuration and shared operations | R07–R10/R22 | Controlled template release/import/adoption, scoped staff changes, concurrent work, migration and recovery |

The examples are reusable acceptance engagements. All applicable source obligations still retain individual traceability. Existing A08/A11/A25/A28 evidence remains regression material while uncovered branches are added.

## 7. Verification and progress tracking

Use a task record with ID, owning package, source IDs, intended role, current behavior, specific remaining gap, dependency, implementation location, acceptance scenario, evidence/build, owner and status. `Remaining_Work_Backlog.json` provides the initial task records. Proposed owner roles remain assignments to confirm with the team.

Track design acceptance, functional implementation, connected technical evidence, independent source acceptance and operational readiness separately. Report exact numerators and denominators for the selected scope. A source scope change must have an owner, rationale and preserved original row. Avoid silently changing denominators or converting missing evidence into a claim that code is absent.

Use targeted rule tests for calculations and transitions, server tests for persistence/access/concurrency, and browser journeys for real role handoffs and interaction states. Choose meaningful independent expectations and material failed cases. Expand verification when new behavior or unresolved risk requires it. Do not infer source compliance from a build or test count alone.

The current release command is `npm run verify:release -- --build`. It writes `.audit-pilot/source-verification.json`. Independent decisions belong in `scripts/pilot-release-acceptance.json` with the supported schema. For an implementation batch, run the appropriate regression tests and record its exact UI journey/build. Run the complete release gate when assembling a release candidate.

## 8. Policy and scope decisions

The appendix preserves all D01–D29 decisions. Group their resolution with the work they affect.

| Decision group | Source IDs | Required outcome |
|---|---|---|
| Intake/master records | D01–D04 | Authoritative ownership, provisional intake, contacts/history and consolidation boundary |
| Identity and shared state | D05–D10 | Actual authority, quality eligibility, scope, business keys and effective versions |
| Methods and workpaper model | D11–D14, D23, D28, D29 | Mapping, human-selected materiality, source-item uniqueness, typed answers, workbook rules, design-before-selection and retained artifacts |
| Reporting and changes | D15–D18 | Complete package, other information, applicable disclosures and targeted renewed review |
| Custody and editions | D19–D22 | Holds, distinct completion clocks, authoritative rule editions and conflicting-services assessment |
| Wider scope and external effects | D24–D27 | Mandates, actual integrations, wider services and review of relevant supporting corpus |

Each decision records what is approved, who has authority, source edition, effective scope, implementation consequence and acceptance evidence. Engineering can continue with labelled synthetic profiles where appropriate while a business rule remains open. Rules used for real professional work require the applicable owner decision and authoritative edition review.

## 9. Release exits

| Exit | Required evidence |
|---|---|
| Design exit | Approved role navigation and components, full-page working papers, usable evidence/planning/review screens, coherent themes and normal task journeys |
| Functional core exit | Every applicable core action and minimum works on shared records through intended roles with required calculations, returns, revisions and handoffs |
| Source exit | Applicable features, criteria, forms, variants, dependencies, E2E steps and BPMN entries reconciled and independently accepted |
| Operational exit | Intended deployment, identity, storage, external integrations, migration/rollback, workload and recovery pass agreed targets |
| Extended-scope exit | Each separately mandated follow-up, firm, service or future-automation stream meets its own agreed acceptance |

The full core release requires its functional, source and applicable operational exits. Design work can be delivered and reviewed before that release.

## 10. Resume instructions

When development resumes, first inspect the repository's actual branch, commit and working tree. Read this plan, `Source_Closure_Appendix.md`, `Remaining_Work_Backlog.json`, `Source_Closure_Register.json`, current progress notes and the latest verification evidence. Compare the code with the planning baseline before assuming that a listed gap remains open.

For the design session, start with R00 assessment and R01–R06. Continue through connected batches without requiring a new user prompt at every package boundary. Resolve reversible implementation choices using the approved scope. Record material assumptions and obtain actual policy decisions where professional authority is required.

After each completed batch, update task status and source evidence, preserve the current branch/build and identify the next ready package. Save a reproducible demonstration and meaningful verification. Carry forward unfinished source obligations and any real external blocker.

The plan uses relative sizes S, M, L and XL to express bounded, owning-workflow, cross-role and multi-workflow work. Calendar dates and delivery cost require actual staffing, integration availability and the resolved policy/scope decisions. The package and task counts describe work organisation rather than a completion percentage.

Priority P0 identifies the baseline and immediate design work. P1 identifies remaining core behavior and source acceptance. P2 identifies deployment and production readiness whose architecture decisions may be needed earlier. Conditional work requires its own mandate. A dependency or correctness defect can raise an individual task's execution priority.

## 11. Files and source references

- `Source_Closure_Appendix.md` contains the exact source feature inventory, all 58 minimum contracts, all 51 lifecycle closure targets, 22 variants, 70 forms, 20 references and 29 decisions.
- `Remaining_Work_Backlog.json` contains the R00–R24 packages and their individually identified tasks for later implementation.
- `Source_Closure_Register.json` contains every row exported from the current verification report with its existing evidence status, source hash and proposed owning package. The original status is preserved.
- `Verification_Baseline.json` preserves the exact verification report used for this checkpoint.
- `Plan_Manifest.json` records document/source hashes and validation counts for this package.

Repository references include `docs/research/development-progress.md`, `docs/research/source-manifest.json`, `src/data/source-registers.json`, `src/data/source-bpmn-transitions.json`, `scripts/verify-release.mjs` and `scripts/pilot-release-acceptance.json`. The original WP mapping and scope commitments come from `outputs/audit-mock-development-plan` and the 9 November development plan.

The source archive, companion workbooks and synced project references remain read-only inputs. This planning deliverable records the remaining work and design priority. The application implementation is at the baseline identified above.
