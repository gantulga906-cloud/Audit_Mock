# Materiality, sampling and findings

Guide PILOT | Version 1.0 | 16 November 2026

Code baseline: local 079f9da47a02eab681feeeda3de3dfb8cfc42848 on redesign/enterprise-workspace. Source edition: October 26 archive plus the registered November 11 repaired-workbook inventory; November 16 freshness observations are separate. Local additions are not merged into GitHub main. This guide describes a supported reference path and the next implementation delta, not professional acceptance.

## 1. Outcome and boundary

An auditor must be able to explain why the selected thresholds fit the users and circumstances, which approved population and risk response were tested, what each selected unit showed, and how remaining differences affect the final evaluation. The application preserves that reasoning and calculates within a named method. It does not determine an appropriate benchmark, sufficient sample size or audit opinion from arithmetic alone.

The local implementation already distinguishes benchmark candidates from chosen materiality, retains overrides and a deliberate zero trivial threshold, binds sampling to approved inputs, records tested-unit exceptions and verifies corrections against a current population. FG-02 therefore has a substantial implemented reference profile. FG-01 still requires an unbiased versioned draw and supported ratio projection. The older deterministic selection remains identifiable and usable as historical evidence; its output must never be relabeled as the new method.

Read G00 for shared identifiers, states and command concurrency, G02 for risk/controls, G03 for population/evidence, G04 for fieldwork, G05 for correction/evaluation, and G08 for form adoption. The following journey connects those owners rather than creating another materiality or findings store.

<!-- diagram: Reviewed chosen thresholds | Approved population + programme | Reviewed sample design | Selected + tested units | Findings + verified posting | Current final evaluation -->

## 2. Source map

| Source | Implementation meaning |
| --- | --- |
| P06-UC03, P06-UC05/06; AUTO-046; A08-P1-W1 through A08-P3-W3 | Prepare, challenge, approve and revise materiality. Individual criteria remain in requirement_traceability.csv. |
| P07-UC01/02/03; AUTO-047; A13 | Tailored programme, purpose/population, approved sample design, selection, testing and evaluation. A13 is not a demonstrated complete lifecycle. |
| P10-UC01/02/03; AUTO-048; A19/A20 | Findings, actual management responses, independently verified posting and final evaluation. |
| DEP-C06, DEP-C14 and full dependency register | Actual materiality/controls handoffs; apply prerequisites to the relevant action, while allowing independent drafting. |
| Repaired Stage 1, 1.3А | Benchmark choices, selected thresholds, qualitative needs and revision explanation. |
| Repaired Stage 2, 2.6А; Stage 3, 3.3.1А | Risk/reliance context and the broader native sampling record. Source cells support more methods than the current engine. |

Original locators are retained verbatim in the registers. Grounded process specification: Editable/P06, P07, P10 and Registers/Action_Contracts.csv. The source specification's SQL/ERD proposals describe a target model; the running shared pilot stores these decisions in versioned SQLite engagement snapshots.

### Form 1.3: source coordinates and ownership

| Worksheet location | Meaning and actual owning decision |
| --- | --- |
| D17:I21 | Five alternative measures, current/prior amounts, rates, calculated candidates and rationale. A negative comparative alternative may remain visible. |
| E26; F26:H26 | Prior approved overall materiality and exact reference. Missing prior information needs an explicit explanation, not zero. |
| E27; F27:H27 | Planning overall amount and rationale. A final decision preserves this earlier planning amount. |
| E28; F28:H28 | Revised final amount, reason and support. |
| F34:H36 | Qualitative circumstances, reporting matters and disclosures; monetary screening cannot replace these. |
| B45; B47:D52 | Performance decision and class/account/disclosure-specific amount/performance decisions. |
| E58; F58:G58; B61 | Clearly trivial amount, including intentional zero, its rationale and revision history. |

Compatible native answers are derived from the owning structured decision. A posted answer saying 999 cannot replace the selected 18. Custom published fields retain their typed contract; old signed text remains historical content. Source reference bands and the form's 5% wording are not automatically firm policy or legal defaults.

### Controls and sampling coordinates

In 2.6А, B10:B13 carries risk descriptions, rows 26-33 carry risk/response context, and B43 carries conclusion/further action. The current sample engine consumes the reviewed control workpaper version, reliance level none/partial/full/na, rationale and current accepted support for partial/full reliance. It does not parse the whole native matrix into a complete many-to-many risk model. Structured 2.6 responses remain R07/R12 work.

In 3.3.1А, rows 9-13 define the objective/assertion/test/programme; rows 16-21 define the population and separately tested items; rows 24-33 hold materiality/reliance/method/size; row 37 defines repeated tested units; rows 64-71 hold findings/projection/evaluation; row 75 holds the actual conclusion. Runtime corrections make row 37 column B a text identifier and column F a signed numeric difference. Presence of fields for MUS, confidence or risk allowance does not establish an implemented calculation or mandatory minimum.

## 3. Records and contracts

| Owner | Retained identity and revision |
| --- | --- |
| 1.3 workpaper | Stable engagement/work ID, values['pilot.materiality.basis'], optional selection.version=1, work revision, accepted evidence ID/version/hash and reviewer. |
| Population | Exact original bytes/hash; import version; accepted/quarantined/excluded source rows; independent controls and statement bridge; separate approval. |
| Programme | Adopt/exclude decision, risk/assertion/procedure, nature/timing/extent, template version/digest and approved planning basis. |
| Sample design | Per-form design version, method, purpose, size, seed, basis stamp, preparer, independent approval, immutable selected units and append-only tests. |
| Finding/correction | Stable cause/reference and source unit; classification, actual amount, evidence, management response, actual verified posting and histories. |
| Evaluation | Statement version, reviewed materiality, finding/response/posting versions, comparison inputs, reviewer preparation and partner approval. |

The sample basis pins population version/hash, statement line, materiality work version and chosen performance amount, control work version/reliance/support, programme decision version and assigned preparer/reviewer. These exact bindings determine currency of the design. A displayed seed alone cannot reproduce a sample without population order and method identity.

## 4. Actions and permissions

| Action | Preconditions and effect |
| --- | --- |
| Save 1.3 | Assigned preparer; valid typed basis and accepted original support. Save work without pretending it is reviewed. A changed reviewed decision needs revisionReason. |
| Submit / return / respond / clear / review | Submission and review pin the exact work revision. Return identifies the issue; response does not clear it. Independent assigned reviewer clears and reviews. Self-review is denied. |
| sample-design | Approved population/bridge, current reviewed 1.3 and 2.6, permissible reliance, adopted programme where required and assigned owner. Retain a design before selection. |
| sample-approve / sample-select | Independent assigned review of the current design; select only after approval. Repeated selection of that version preserves the same selected units. |
| sample-test | Selected unit, current accepted non-population evidence, actual result/detail. Save append-only test history and stable linked finding for an exception. |
| completion-evaluate | Reviewer prepares a versioned comparison against current statements and reviewed thresholds. Partner separately approves the exact evaluation. |

Current preset business accounts demonstrate separation of roles, not a production named-identity system. Staff suitability, resource access and professional independence remain separate decisions. G09 covers migration to real identities. Sealed-file mutation, wrong-engagement access and revoked deep links remain denied.

## 5. Calculation contract and independently expected values

Supported structured materiality amounts accept two decimal places and rates up to four. Overall/performance must be positive, performance below overall; trivial is zero or positive and no greater than applicable performance amounts. These are current supported-profile guards, not an assertion that every firm uses the same policy. The selected overall amount, including an override, drives dependent candidates.

| Synthetic input or decision | Independently expected output |
| --- | --- |
| Revenue 1000; candidate rate 2% | Candidate overall = 20.00. |
| Auditor chooses overall 18.00 with rationale | Selected overall = 18.00; preserve candidate 20.00. |
| Performance 60% of selected overall | 18 x 0.60 = 10.80. |
| Specific 75% of selected overall | 18 x 0.75 = 13.50. |
| Specific performance 60% | 13.50 x 0.60 = 8.10. |
| Auditor explicitly chooses trivial 0 | Preserve 0.00; do not replace with a default or classify it as missing. |
| Final overall changes to 12.00 | Performance 7.20; specific 9.00; specific performance 5.40. Planning 18.00 remains in history/source answer. |

The recorded fixture also retains profit -100 at 5% as an alternative candidate -5. An alternative loss is not a selected negative effective threshold. The test passes strings 999 in legacy specific amount fields while the structured calculated selection derives 13.50/8.10; this checks the decision owner rather than legitimizing conflicting input.

These calculations were independently recomputed for this documentation using decimal arithmetic. Previously recorded application evidence is tests/pilot-materiality.test.mjs, especially the persisted selection/revision scenario; no new application suite was run for these handbooks.

### Current sampling method and minimum delta

Current method ID is deterministic-row-selection-v1. It uses the existing selectSample implementation, approved integer size and seed, at most 500 units and no more than the available rows. This is a repeatable reference method; its LCG/modulo shuffle is not evidence of the unbiased method required by FG-01.

Proposed new method contract: retain an explicit eligible ordered unit list/hash, population amount, unit definition and separately tested exclusions; use unbiased bounded integer draws without replacement; store algorithm/version and reproducible randomness provenance. An unbiased bounded draw can use rejection above floor(2^32 / bound) x bound before taking a remainder. A seeded generator and its distribution/reproducibility contract need an approved implementation choice; changing only a displayed method name is insufficient. Preserve old selections byte-for-byte.

For a supported ratio example, eligible population book amount 1000, sampled book amount 200, and signed sample misstatement 10 give ratio 10/200=5% and estimated total population misstatement 50. The projected amount is a total for that eligible population, including the sample component. Adding 50 and the same factual 10 would double-count it. The proposed finding aggregate must identify either total projected 50 with the factual component linked, or factual 10 plus incremental projected 40. Separately tested specific items stay outside this projection and are included once under their own finding identities.

Projection needs all selected units tested or a separately approved treatment of inability/replacement, a positive supported denominator, consistent currency/basis and an approved signed-error convention. Mixed-sign/zero denominator, targeted-item selection, controls deviations and unsupported designs must return a specific not-evaluable result. Do not force a numeric zero or imply a sampling-risk allowance/confidence bound. No MUS, stratification or confidence engine is silently added to FG-01's minimum.

### An unresolved signed-difference conflict

The native 3.3.1 repeated table now accepts signed numeric differences. The current sample-test command rejects negative amounts, manual completion findings reject negative amounts, and completion treats outstanding monetary amounts as absolute exposure. Therefore the existing runtime cannot simply consume a signed ratio result. Decision HB-D02 requires the methodology owner and developer to choose signed accounting differences versus exposure fields, aggregation/netting rules, currency units and stable projection/factual links. The guide proposes separate fields, not a silent alteration of existing stored amounts.

## 6. Findings, posting and evaluation

A sample exception uses a stable SAMPLE- identity derived from engagement, form, design version and unit. Repeating the same test does not duplicate its finding. Once resolution begins, the finding has its own decision history and cannot be erased by changing the unit to pass. The auditor still investigates cause, severity, evidence limits and reporting implications.

Management agreement to 100 does not establish posting. In the recorded technical/completion fixture the independently verified ledger posting is 60, leaving 40 outstanding. The remaining amount becomes stale if the approved population or relied-upon response evidence changes. The reviewer prepares evaluation; the partner approves the exact basis. Current gross exposure comparison is a supported screen, not a full signed netting, projection or qualitative opinion model.

## 7. Change impact and retained work

| Changed input | Reopen and preserve |
| --- | --- |
| Selected materiality or its accepted support | Reassess dependent sample design, evaluation and report authorization. Preserve old materiality, sample selection/tests and evaluation. |
| Population/version/mapping or programme decision | Old design/run becomes noncurrent. Retain original rows and evidence; require a fresh approved basis for new execution. |
| Actual controls reliance/support | Reassess relying programmes and sample stamp. A materiality revision alone does not reset unchanged controls work. |
| Test evidence or correction verification population | Reassess affected test/finding/posting/evaluation; keep previous evidence and review decisions. |
| Template edition | Explicit controlled adoption; compare incompatible cells. Existing signed version/digest survives. |

Work that does not depend on the changed fact can continue. A stale result is visible historical evidence, not current authorization. The app must explain the actual dependency causing a block instead of imposing a universal previous-form rule.

## 8. Current interfaces and owning files

Authenticated commands use POST /api/pilot/action?engagement=ID with action, fields, current revision and optional idempotencyKey. The scope and actor are checked server-side. Reusing a command key with changed payload/scope is rejected; stale revisions return 409 and require refresh/review of current facts. GET /api/pilot?engagement=ID is the scoped view. Payload examples here omit authentication and client-specific data.

| Actual command | Essential fields inside fields |
| --- | --- |
| save (form 1.3) | form, execution, conclusion, benchmarkSource; materialityBasis as serialized structured basis; adopted templateDigest/answers where applicable. |
| sample-design | form, line, size and seed as integer strings, purpose. |
| sample-approve | form, version as string, reason. |
| sample-select | form, version. |
| sample-test | form, version, unit, accepted evidence ID, result pass/exception, amount, detail. Current amount is nonnegative. |
| completion-evaluate / completion-evaluation-approve | note; then evaluation version and reason. |

Inspected owners at the pinned baseline: scripts/pilot-materiality.mjs (updateMaterialityBasis/readSelection), src/lib/pilot-materiality.ts (selectedMateriality/materialitySourceAnswers), scripts/pilot-sampling.mjs (inputs/samplingAction), scripts/pilot-population.mjs (approvedPopulation/cents), scripts/pilot-completion.mjs (evaluationInputs/completionAction), src/lib/workspace.ts (selectSample/review/snapshot), and tests/pilot-materiality.test.mjs. code_observation_index.csv supplies exact symbol lines and file hashes. Workspace entry is the engagement workpaper view; materiality controls sit in 1.3 and sampling beside its approved area work. Source cards alone do not execute these commands.

## 9. Persisted E2E acceptance plan

| Scenario ID and actor | Expected result and evidence |
| --- | --- |
| PILOT-NORMAL: preparer/reviewer/partner | Retain accepted source, reviewed 1.3=18/10.8/0 and specific 13.5/8.1, reviewed no-reliance controls, approved population and programme, independently approved design, selected/tested units, linked finding and independently approved evaluation. Record all IDs/versions and exact outcomes. Recorded A08 covers a reference materiality revision; this larger complete projection chain is not yet accepted. |
| PILOT-ZERO / NEGATIVE | Explicit zero trivial survives reload. Blank/malformed amount and missing override rationale fail; a negative alternative is retained but cannot become a negative effective threshold. Recorded materiality regression covers these guards within its profile. |
| PILOT-UNAUTH | Preparer self-review, wrong/revoked engagement, stale approval and sealed mutation are denied without changing histories. Record HTTP and unchanged versions. |
| PILOT-CHANGE | Change overall to 12 with reason and renew review. New 7.2/9/5.4 values; old selection unchanged and noncurrent, old evaluation stale, unchanged controls review preserved. Recorded local fixture demonstrates this. |
| PILOT-MISSING | Missing accepted support, unreconciled/partial population, excluded programme or unsupported reliance blocks design/use at that action; independent drafting remains possible. |
| PILOT-PROJECTION | New approved method yields exact ratio example 50, correct factual/projection linkage and no duplicate on identical retry. Zero/mixed-sign/untested inputs produce explicit unsupported results. Proposed tests, not observed passing evidence. |
| PILOT-RECOVERY | Restart disposable persisted case; compare selected IDs, test/evidence versions and histories. Replay the same command key; one logical effect. No live preview database is used. |

For each run, capture code/build, source hashes, actors, ordered actions, prior/current revisions, expected/actual values, rejected attempts and retained history. Acceptance is a separate accountable decision linked to that evidence. Unit-test accumulation does not substitute for one connected case.

## 10. Dependency-ordered build checklist

1. R07.1/2 and R09.1: confirm the three forms' exact semantics, signed-difference conflict HB-D02, action-specific dependencies and source edition. Preserve all current FG-02 behavior.
2. R12.2/3: extend structured risk/response/reliance where the selected sample case needs it; retain approved one-risk/procedure compatibility and current controls history.
3. R15.1: introduce a separate unbiased method/version, eligible units/basis and independently expected draw/reproducibility tests. Do not rewrite legacy selections.
4. R15.2/4 and R18.1/5: implement supported ratio projection and complete testing/denominator guards; give factual/projected findings stable nonduplicating identities and explicit aggregation.
5. R07.3/4 and R08.5: expose supported methods and unsupported reasons in the native sampling form and readable export; preserve edition adoption/loss review.
6. R15.5/R16.6/R23.2/4/5: execute the connected normal/exception/change/denied/restart case with source-specific expected results, then obtain independent decisions. Keep A08/A11/A25/A26/A27/A28 regressions.

## 11. Standards and policy context

Freshly inspected IAASB 2025 Volume 1, ISA 320 paragraphs 9-14, ISA 530 paragraphs 6-15 and ISA 230 paragraphs 14-16 support judgment, sample evaluation and retained documentation. Both ISA 320 and ISA 530 carry an international effective basis of periods beginning on/after 15 December 2009. Edition/local adoption still needs engagement approval. The ratio algorithm above is a proposed product profile, not an ISA-prescribed formula. [Official inspected volume](https://ifacweb.blob.core.windows.net/publicfiles/2025-09/IAASB-2025-Handbook-Volume-1.pdf).

The current IAASB publication is the 2026 Handbook, published 30 September 2026; included fraud/going-concern revisions have future applicability dates. It does not automatically replace the engagement's approved local edition. IFAC's February 2026 Mongolia profile reports ISA 2020 in application; the underlying engagement-specific adoption instrument is still needed. See G00 source authority and the external research register.

## 12. Glossary and guide-use check

Материаллаг байдал: materiality, a documented auditor decision. Гүйцэтгэлийн материаллаг байдал: performance materiality. Эх олонлог: population. Түүвэр: sample. Илрүүлэлт: finding. Бэлтгэгч: preparer. Ахлах хянагч: reviewer. Партнер: partner. Current: every relied-upon version still matches. Approved: an attributable decision, not a substitute for currentness. Projected amount: explicitly bounded estimate, not a duplicate of observed findings.

Pilot usefulness check: this guide identifies the owner, exact arithmetic, relevant source coordinates, actual command boundary, existing evidence, missing unbiased/projection work, signed-error conflict, targeted staleness and a connected acceptance plan. The PDF layout and independent arithmetic are checked during production. No practicing auditor has yet validated its usability or approved its methodology; that remains an explicit review step rather than a claimed interview or acceptance.
