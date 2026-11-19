# M36 / D01 acceptance decision tables

**Status:** implementation specification for review. Rule catalogue version D01-2026-11-19-draft1. [Rule register](Blocker_Register.csv), [scenarios](Acceptance_Scenarios.csv), [open decisions](Decisions_Open.csv).

This is decision modelling, not a weighted acceptance score. Adverse reputation, a low proposed fee and going-concern uncertainty do not become prohibitions by adding points. Auditors reach and document the professional conclusion.

## State and evidence contract

Each assessment fact has `unknown | supported | adverse | not_applicable`, raw response, normalized meaning, evidence IDs/hash/version, person/role, date, applicable rule and rationale. Use not_applicable only with a rule-specific applicability reason and reviewer approval. Never use it to clear a prohibition.

Separate:
- applicability: applies / does_not_apply / unresolved;
- legal or ethical rule result: clear / prohibited / review_required / unresolved;
- professional review: open / returned / concluded;
- acceptance decision: draft / defer / decline / conditional / accept / continue / withdrawal_review / withdrawn;
- terms: draft / independently_reviewed / agreed_verified / superseded;
- activation: authorized / held.

A prohibition is cleared only by removing the underlying prohibited circumstance where permitted, or proving the rule inapplicable under its actual exception. Authority signatures cannot waive it.

## Action table

Apply rows in order. A rule must be applicable and the triggering facts established before recording an actual prohibition. An unresolved mandatory rule holds the affected positive action but does not falsely accuse the client of breaching law.

| Condition | Draft / investigate | Decline or defer | Agree terms | Positive accept/continue | Activate or continue affected work |
| --- | --- | --- | --- | --- | --- |
| Confirmed applicable prohibition | Yes; retain facts | Yes, attributable reason | Draft only; no commitment prohibited by law | No | No |
| Mandatory applicability/evidence unresolved | Yes | Yes | Draft; any binding step needs separate authority | No | No |
| Review matter unresolved | Yes | Yes | Draft | No until professional conclusion | No |
| Conditional decision with named owner, due date and effect | Yes | Yes | Draft / explicitly conditional proposal | No final authorization | No |
| All rules resolved, current independent review, terms not yet verified | Yes | Yes | Yes under authorized procedure | No under current product sequence | No |
| All rules resolved, current review and verified exact terms | Yes | Yes | Yes | Authorized partner may decide | Yes if all existing activation gates also pass |
| Decision/evidence expired or material fact changed | Yes | Yes | Reassess/amend as applicable | Fresh decision required | Hold affected continuation pending review |

This product sequence requires the final positive decision after verified terms, matching the existing command. A reviewed recommendation or permissible terms negotiation is not permission to perform audit work.

## Exception table

| Case | Required authority/evidence | Outcome |
| --- | --- | --- |
| Audit Law 8.3 exception | Approved Accounting Law 4.1.2/4.1.3 classification; rule applicability conclusion | 8.1 may be not applicable; all other independence/return checks remain |
| Three-year return issue | Replacement history and whether replacement was under 8.1 | Specific 8.2 assessment; no generic exemption inferred |
| Statutorily compelled acceptance under ISA 210 | Exact law compelling this auditor, scope of exception, required reporting response and legal review | Dedicated approved exception route for the affected ISA 210 condition only |
| Client merely required to obtain an audit | Client obligation without obligation on this firm | Not evidence that this firm must accept |
| Framework prescribed by law | Document the specific ISA 210 paragraph 18-22 analysis and required terms/report response | No universal bypass switch |
| Individual conflict removable by reassignment | Rule permits removal; actual person removed and replacement assessed | Reassess affected assignment and acceptance; do not waive firm-wide prohibitions |
| Source template stricter than external minimum | Approved firm policy, scope, version and permitted qualification | Record policy result separately from legal/ethical classification |

## Branches and persisted records

1. **New request:** firm enquiry -> identity/period/service facts -> assessment -> declarations/threats -> independent review -> terms agreement verification -> authorized positive decision -> activation.
2. **Continuance:** create next-period enquiry/context -> refresh facts/declarations/tenure/services -> determine whether terms require change -> current review/decision. Prior acceptance is context, never a copied clearance.
3. **Adverse information:** attach source and corroboration; reviewer assesses integrity/resources or the applicable prohibition. Decline/defer remains possible without finishing every positive-acceptance field.
4. **Predecessor:** record permission request/result, communication attempts, information received or alternative steps; refusal/no response receives a reasoned conclusion, not a fabricated clean answer.
5. **Conditional:** record condition, responsible person, due date and progression effect. Resolution creates new evidence and a fresh reviewed decision; time expiry never activates automatically.
6. **Changes after acceptance:** log change, identify material dependencies, place affected continuation on hold, reassess and reapprove. Preserve prior decision and work history.
7. **Term amendment/lower assurance:** record requested change, circumstances, professional conclusion on justification and legal limits. Do not reduce assurance solely to escape an audit problem.
8. **Unable to continue/withdrawal:** open withdrawal_review, record consultation, legal ability to withdraw and notification obligations, authorize disposition and preserve records. Record communications/evidence; do not send messages automatically.
9. **Refusal of amendment while unable to continue:** return to withdrawal/legal review, not silent continuation on old terms.
10. **Sealed/issued historical engagement:** preserve original decision and agreement. Later facts become linked subsequent records; no rewriting issued history.

## D01 method details and golden cases

No default financial score, formula, national identifier regex, legal calendar arithmetic or automated credential validation is approved. M36 is an explicit rules table evaluated against evidence.

For tenure research retain service-by-year history, gaps, first/last dates, replacement reason and entity classification. Golden cases include fifth/sixth consecutive service year, a break in service, partial periods, an SME category change, and return immediately before/on/after the asserted cooling boundary. The local reviewer must decide counting conventions and dates before executable date arithmetic is approved.

For same-year services retain provider/recipient, actual work and covered financial year. A tax consultation for the audited year is not cleared merely because its invoice date falls in a different calendar year. Conversely, a generic service label alone does not establish overlap.

For client comparison preserve raw registration text and a separately versioned normalized key; do not use approximate name matching as identity proof. These deterministic import methods are specified separately.

## Review acceptance criteria

The reviewer must be able to reconstruct the facts, source/edition, applicability, judgment, reviewer, partner, terms version and resulting allowed action. Demonstrate every scenario in Acceptance_Scenarios.csv; repeat relevant cases under two deliberately different applicability versions. A scenario expectation is a specification, not evidence that the current app passes it.
