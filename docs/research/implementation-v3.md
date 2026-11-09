# Workspace v3: fixed-asset additions walkthrough

Start on **Урсгал нээх**, select **Оргил Технологи** (E2), and use the four fictional personas. The prototype uses browser-local synthetic data. Reset in Settings to repeat; earlier v2 storage is kept separately.

1. **Assistant / partner:** save the enquiry with a contact, leaving the period blank first. On Decisions, the partner records independence and agreed letter references, then acceptance. Enter period 2025 and activate. An acceptance alone cannot activate an incomplete enquiry.
2. **Senior:** open Planning and assign or schedule 3.1.2 (initially unscheduled). Compare its dates with the week or agenda in Calendar. Rescheduling changes the plan, not review history.
3. **Assistant:** submit 1.3 and complete the 2.6 reliance decision and rationale. **Senior:** review each exact version, then review 3.3.1 design. Select the sample. Change a relied-on input to see the old selection retained in history while a new review is required.
4. **Assistant:** in the journey, receive and assess the asset register and invoice separately. Reject the first invoice with a reason, then receive the corrected specimen. Accepted files attach to 3.1.2. Record each selected unit's result; at least one exception demonstrates a finding. Submit 3.1.2.
5. **Senior and assistant:** exercise return, response, resubmission and reviewer clearance. Complete and review 4.4 and 4.1.A1. If a relied-on input was revised, assess the resulting change impact in Review. The partner records the reason for the finding disposition; an unposted amount remains outstanding.
6. **Partner:** review the current statement and note content, bind the statement version and authorize. Change the report or statement package to see stale authorization. After applicable review and new authorization, record issue, optionally record separate recipient outcomes, then lock, offer and accept custody of the exact issued package.
7. **Quality:** E2 has no formal EQR. Switch to Тэнгэр Эрчим (E3) to see the required EQR and quality concern. An ordinary 4.6 confirmation does not satisfy EQR. Only the assigned quality persona can record the EQR for the current package, after selected prerequisites.

## Decisions and verification

| Rule | Source basis | Local evidence |
|---|---|---|
| Current release authorization and issue must identify exact content | P10-UC08-AC01/03, D15 | The regression test changes report content and then statements/notes, checks stale approval, and verifies historical package contents. |
| Acceptance links to the current decision, terms and independence; activation has its own gate | 1.1.1А rows 16–18, P01/P02, D01 | Test saves an unknown-period intake, records prerequisites, activates and carries the period forward. References are manually recorded in the demo. |
| Reviewed sample design identifies population and upstream inputs | 3.3.1А A24/K24 and A28/K28, D18/D28 | Test changes performance materiality without changing seed or population, blocks selection, retains previous selection, and requires a new design review. |
| Evidence receipt is different from acceptance; issue is different from custody | P08/P11/P12, fixed-asset programme 3.1.2 | The connected scenario test rejects one item, replaces it, records a sample exception and returned review, then authorizes, issues and receives custody. |
| EQR binds the current package and is separate from ordinary confirmation | P11-UC04-AC02, D06 | Test denies partner completion and makes a statement change invalidate prior EQR. |

Coverage shows the v2 ledger with a targeted v3 verification overlay. “Verified local scenario” does not certify every criterion on that row. AUTO-003 can compare an independently supplied control total and flags a missing total; it does not certify the origin or completeness of the file.

Release verification: 28 automated tests passed; the production build compiled, type-checked and generated a static export. A separate localhost browser session confirmed the journey shortcut, a failed and then successful intake activation, missing sampling inputs disabling selection, a rejected invoice appearing in its owner's task queue, Gantt and calendar navigation, quality navigation, and the new coverage evidence. The full issue/custody journey and stale-approval paths were verified in the automated workflow tests.

## Focused design comparison

- [Fieldguide request management](https://help.fieldguide.io/en/articles/7207259-managing-requests) separates incoming material ready for review, a request for changes and completion, and retains activity. Adaptation: item-level evidence states, reason and history inside the fixed-asset journey; local only.
- [Caseware document sign-off](https://documentation.caseware.com/2023/WorkingPapers/en/Content/Engagements/Review-Signoff/Roles/Sign-Off-Document.htm) distinguishes preparation and review by role and surfaces sign-off problems. Adaptation: ownable tasks plus exact revision history and a visible stale approval state; software sign-off here is simulated.
- [Teamwork workload planner](https://support.teamwork.com/projects/workload/using-the-workload-planner) documents a timeline of assigned and unplanned work against availability. [Karbon capacity dashboards](https://karbonhq.com/resources/karbon-work-dashboards/) show a simpler weekly view grouped by assignee. Adaptation: rolling plan plus unscheduled work and a scoped weekly capacity view. The fixed example capacity and work estimates are fixtures; actual availability and leave require firm data.

These are documented patterns. No vendor tenant or firm staff usability test was performed. Compare the four role tasks against v2 with staff before treating efficiency as established.

## Follow-on work

Validate the demo rules with the methodology owner. Expand form families in batches. Keep guidance and display edits as bounded configuration; require versioned methodology publication for required evidence/choices, and scope schema, calculation and cross-form changes with the tech lead including migration and support cost. The one-form guidance and explicit adoption already work; general schema migration and commercial entitlements are not included. The prototype does not implement production identity, a client portal, legal signatures, durable custody, or a compliance opinion.
