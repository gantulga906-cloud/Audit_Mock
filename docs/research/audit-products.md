# Audit-product research for the next prototype

Research date: 6 November 2026. Scope: six engagement/working-paper platforms and four specialists. Audit products are the primary workflow and interface references; general productivity products are a separate research track.

This is a public-documentation study. No commercial tenant was signed into, no client information was entered, and no live audit was performed. “Documented” means official instructions or release notes describe the behavior. “Vendor overview” is a product claim. The proposed adaptations below are our design decisions, not observed features of Audit_Mock. Screens or videos that could not be inspected are not presented as tested UI.

## Decisions for implementation

1. Give the senior a workpaper index with review status, owner, next action and changed-after-review visibility. Keep exact-content review beside the queue. This combines the documented CCH index and Fieldguide inspector mechanisms; preserving selection/scroll is our proposed refinement.
2. Provide phase/readiness navigation and a searchable document/form index. Caseware documents both views. Our form numbers remain stable references, not a mandatory execution order.
3. Plan preparation, first review, significant decisions and quality work separately. Inflo’s planning guide includes assigned responsibilities, due dates, resources and review time. A Gantt bar represents a schedule; it cannot certify performed audit work.
4. Show preparation, required review, requests and blockers as separate dimensions. AuditFile distinguishes optional workpaper status from procedure progress. Fieldguide provides separate milestone, engagement and request-aging insights.
5. Build an information-request table with a contextual inspector and explicit receipt/review/return states. Do not assume a portal or external dispatch in the local prototype.
6. Place automation results beside their inputs and source evidence. Bind each run to source versions, expose stale results and preserve history. Borrow the investigation mechanics from DataSnipper and MindBridge without simulating their OCR/AI as working.
7. Use source-faithful form families, blank initial judgments, sticky table headers, outstanding-work filters and visible evidence references. BrightWorkpapers release notes describe several of these usability refinements.
8. Treat confirmations as controlled cases with recipient, authorization, dispatch, response, exception and evaluated conclusion. A locally recorded event is not a verified bank response.

The machine-readable companion contains 16 AUD-PAT cards, their source locators, role/process/screen mappings, adaptation decisions and verification scenarios.

## Comparison and documented journeys

### 1. Caseware Audit / Working Papers

**Evidence and edition.** Caseware Audit 2025/27 documentation describes the optional Work Flow Panel and Document Manager. This is a desktop/template-specific reference; it does not establish identical behavior in every Caseware Cloud product.

**Documented journey.** Open the engagement in its phase panel, select a phase step, open the required document(s), perform the work and sign off. Phase indicators update. The user can return to the document tree for file customization. A separate cloud documentation page describes context-anchored review issues and retained resolve/clear history. [Work Flow Panel](https://documentation.caseware.com/2025/Audit/27_00/en/Content/User_Client_File_Setup/c_Work_Flow_Panel_Work_Flow_Panel.htm), [review issues](https://www.caseware.com/docs/en/cloud/global-statutory-reporting/documentation-and-review/add-and-complete-review-notes-issues).

**Fit.** Adapt phase-to-record drill-through and anchored issue history. Our business policy separately determines who clears a note and which revision is reviewed. Do not transplant the cloud issue permissions into our four capacities. AUD-PAT-001/002.

### 2. Inflo Working Papers

**Evidence and edition.** The official Planning Activities guide is a 17-page US Audit content-pack example, expressly noting that other packs can vary. Pages 3-4 show configuration/applicability and planning responsibilities; later pages organize understanding, risk and response links. The product page is a higher-level claim, not a substitute for that guide.

**Documented journey.** Select the appropriate methodology pack and engagement characteristics, conduct commencement/understanding work, assess risks, develop responses and route the plan for review. Assign dates, responsibilities, resources and review time as part of planning. Additional work is tailored to engagement circumstances. Exact screen clicks beyond the guide remain untested. [Planning Activities guide](https://www.inflo.com/wp-content/uploads/2025/08/Workflow-Overview-Planning_v2.pdf), [Working Papers overview](https://inflo.com/working-papers/).

**Fit.** Adapt applicability-led content, related-work links and a plan containing review demand. Retain the supplied Mongolian source methodology. Do not import US GAAS content or the guide’s internal numbering. AUD-PAT-003/004.

### 3. CCH Axcess Engagement / Knowledge Coach

**Evidence and edition.** Official help separates Tax, Attest and Knowledge Coach capabilities. Features such as locking, native workpaper links and dynamic forms are module-dependent.

**Documented journey.** Open the Engagement View, select a folder/item, inspect its notes and status, open the workpaper in its supported representation, prepare/review it and inspect attributed sign-offs. Workpaper Monitor documents active editing and an indicator when a signed-off workpaper changes. [Engagement View](https://help-engagement.cchaxcess.com/Engagement/Content/Engagement-View/Engagement-View.htm), [Workpaper Monitor](https://help-engagement.cchaxcess.com/Engagement/Content/Workpaper-Monitor/Workpaper-Monitor-Overview.htm), [sign-offs](https://help-engagement.cchaxcess.com/Engagement/Content/Workpapers/Sign-off-workpaper.htm), [license distinctions](https://help-engagement.cchaxcess.com/Engagement/Content/Engagements/CCH-Axcess-Engagement-Licenses.htm).

**Fit.** Adapt the compact status-rich index and changed-after-review signal. Our version policy must preserve exact snapshots and target renewed review. CCH’s documented order/retained-sign-off behavior is not our professional policy. AUD-PAT-005/006.

### 4. AuditFile

**Evidence and edition.** Public support provides an illustrated quick-start; the release-notes page provides narrower behavioral details.

**Documented journey.** Create a client, create an engagement with period/due date, choose template/review levels, add the team and enter the engagement dashboard. The dashboard links planning/programme/completion and an activity trail. Procedure completion updates it; review comments can notify the preparer. Optional workpaper status is a separate tracking aid. [Quick start](https://auditfile.com/support), [new features](https://auditfile.com/new-features).

**Fit.** Adapt a personal action dashboard and separate evidence/workpaper/procedure progress. Do not copy a three-step creation wizard as a universal acceptance gate. R1-R4 are capacities on work, not AuditFile staff levels. AUD-PAT-007/008.

### 5. BrightWorkpapers, formerly MyWorkpapers

**Evidence and edition.** Official current naming is BrightWorkpapers. Public release notes identify regional/Essential differences; Academy training has access requirements.

**Documented journey reconstructed from release notes.** In a trial-balance export, inspect prefilled mappings and unresolved accounts, complete the mappings and export; saved mappings support a later export. For preparation, use the workpaper index and programme/lead schedules, inspect outstanding work, then record the applicable conclusion/sign-off. Current notes describe conclusions starting blank, sticky audit-plan headers and person/date sign-off visibility. The exact Academy preparation/review walkthrough was not executed. [Release timeline](https://www.brightworkpapers.com/product/product-release-timeline/), [public training outline](https://www.brightworkpapers.com/resources/public-training-webinar/), [current product identity](https://brightsg.com/en-ie/myworkpapers-audit-practice-software/).

**Fit.** Adapt explicit unfinished judgments, table orientation and defect-driven mapping. Keep integrations and firm-template settings separate from audit authority. AUD-PAT-009/010.

### 6. Fieldguide

**Evidence and edition.** Official help documents request-table interactions. Insights documentation separately identifies Enterprise/premium and permission limits.

**Documented journey.** Create a request, open its table row in the Overview/Comments/Activity side panel, supply information, send it for review, then have the firm complete it or request changes. Status and client visibility are separate controls. The request list supports filters, grouping, configurable columns and inline edits. [Managing requests](https://help.fieldguide.io/en/articles/7207259-managing-requests).

**Progress journey.** An authorized insights user filters engagement/milestone/request metrics and drills into open or delayed items. The help defines distinct request-status aging and notes its refresh cadence. Those definitions are useful precedents, not values to reuse in our fixtures. [Fieldguide Insights](https://help.fieldguide.io/en/articles/9047554-fieldguide-insights).

**Fit.** Adapt the request inspector and defined drill-through metrics. External notifications, portals and automatically tracked time remain separate proposals. Do not copy an archive action that discards older material into our retention policy. AUD-PAT-011/012.

### 7. DataSnipper

**Evidence and edition.** The official Document Matching article covers v5 and later and identifies newer advanced-option boundaries.

**Documented journey.** Import supporting documents, select the Excel sample range, map input/output fields, run matching and review produced references against the sources. When matches are missing or ambiguous, inspect source content and adjust supported settings. The FAQ warns that reruns can overwrite output-area manual edits and describes the overwrite choice. [Document Matching](https://knowledge.datasnipper.com/en/articles/676042-how-to-automate-your-test-with-document-matching), [matching FAQ](https://knowledge.datasnipper.com/en/articles/676049-faqs-for-document-matching).

**Fit.** Adopt direct evidence-anchor navigation and explicit human validation of machine output. Improve our rerun model by retaining prior runs and separating human dispositions. The prototype must not claim DataSnipper OCR or matching. AUD-PAT-013.

### 8. MindBridge

**Evidence and edition.** Official help describes GL analysis setup, transaction investigation and current rerun behavior. These are specialist analytics workflows, not an entire audit file.

**Documented journey.** Create organization/engagement/analysis, import required data, verify accounts and run. Inspect results, open a transaction/entry’s contributing signals, and add relevant work to the audit plan. Changed data or material settings can require a rerun; the Data page retains run history. [GL workflow](https://support.mindbridge.ai/hc/en-us/articles/1500004124661-Overview-of-MindBridge-workflow-for-GL-analyses), [run/re-run](https://support.mindbridge.ai/hc/en-us/articles/360058012013-Run-an-analysis), [transaction detail](https://support.mindbridge.ai/hc/en-us/articles/1500001228061-Transaction-and-entry-details).

**Fit.** Adapt input readiness, explicit runs, freshness and explainable exceptions. Do not equate a risk score with material misstatement or audit quality. AUD-PAT-014.

### 9. Circit Confirm

**Evidence and edition.** The official Confirm page describes a lifecycle and contains captioned product-reference images. This is a vendor-described workflow; no provider network was used.

**Documented journey.** Create/upload confirmation requests, obtain required sign-off/authority, track request sub-statuses, receive and review responses, flag/reject exceptions and export the case material. The page distinguishes request creation, tracking/collaboration, connectivity and evidence finalization. [Confirm lifecycle](https://www.circit.io/platform/confirm).

**Fit.** Adapt an item-level confirmation register, clear next owner and retained exception disposition. Manual local fixtures may demonstrate the case model. Bank connectivity, identity validation, automated chasing and independent verification require actual services. AUD-PAT-015.

### 10. Thomson Reuters Confirmation

**Evidence and edition.** A publicly accessible regional “How it works” page documents the request sequence; its older copyright and region-specific framing mean current contracts and availability must be checked separately. The current global overview corroborates the product and attributable activity, not exact current UI layout.

**Documented journey.** Identify the client and responder, prepare the request, obtain client authorization, initiate it, await the response and retain the completed confirmation. Unavailable authorization is a real separate pending step; it cannot be fabricated by an auditor’s local checkbox. [Regional workflow](https://eu-en.confirmation.com/how-it-works/), [current global overview](https://www.confirmation.com/).

**Fit.** Adapt authority-before-dispatch, request/response event history and manual receipt provenance. A recorded local dispatch is explicitly a simulation or externally performed event, not provider delivery. AUD-PAT-016.

## Interface reference board

These references are annotated descriptions of documented interfaces, not copied screenshots or a claim that private screens were visually tested.

| Reference | Interface mechanism documented | Our proposed location | Design decision |
|---|---|---|---|
| Caseware Work Flow Panel | Phase steps open required documents; document-tree alternative | Engagement readiness and forms catalogue | Adapt both navigation modes |
| Inflo Planning Activities PDF, pp. 3-4 | Configuration/applicability and responsibility/date/review planning | Setup, plan and related-work detail | Adapt relationships; keep our methodology |
| CCH Engagement View, grid/columns | Indexed rows with notes, editing and review attribution | Senior index/review queue | Adapt dense operational columns |
| AuditFile support, section 3 | Personal/engagement dashboard, sidebar and phase progress | Role home and engagement home | Adapt actions; expose metric definitions |
| BrightWorkpapers release timeline, 2025/2026 entries | Blank conclusion, sticky headers, outstanding filter and mapping defects | Workpaper families/data hub | Adopt blank judgment; adapt defect workflow |
| Fieldguide Managing Requests | Table to Overview/Comments/Activity inspector | Request register and detail | Adapt explicit review/return loop |
| DataSnipper matching guide | Input mapping and result-to-document references | Automation run/evidence viewer | Adapt source drill-back only |
| MindBridge transaction detail/run help | Contributing signals, results and rerun history | Automation exceptions and change impact | Adapt explanations and freshness |
| Circit Confirm lifecycle | Request statuses and response review | Confirmation cases | Adapt item-level lifecycle |
| Confirmation regional workflow | Client authorization before initiation | Confirmation prerequisites | Adopt distinction; no integration claim |

## Why this should ease the work

The recommended design removes avoidable reconstruction: people can open the next responsible action from the queue, see why a dependency blocks a particular transition, inspect the relevant source without hunting for filenames, and distinguish work needing preparation from work waiting on review. These are design hypotheses to verify with our scenarios; no percentage time saving is claimed.

Use one authoritative work item/assignment/dependency record behind tasks, calendar, timeline and queue. Maintain current revision and submitted/reviewed revision separately. A source record may support multiple procedures by stable references; repeated uploads are not required by the design. A completed task never substitutes for actual auditor review, evidence evaluation or report authorization.

## Fit summary and non-transfers

- **Adopt:** visible exact version/context, source anchors, blank initial professional judgments, explicit actor/event history, useful status words plus icons.
- **Adapt:** phase navigation, operational grids, request inspectors, applicability tailoring, independent progress dimensions, input/run/result history and authorization prerequisites.
- **Defer:** native Word/Excel editing services, OCR/AI extraction, live accounting/bank connectors, external notification delivery, provider verification and commercial calendar synchronization.
- **Reject as automatic transfers:** vendor methodology numbering, proprietary content, universal four-signature gates, generic “green means audit complete,” deleting prior evidence to tidy an archive, or considering an untested marketing efficiency claim a measured outcome.

## Evidence limits and next verification

The six platform and four specialist populations are accounted for. Depth differs: Caseware, CCH, AuditFile, Fieldguide, DataSnipper and MindBridge provide operational help; Inflo provides a bounded US content-pack planning guide; BrightWorkpapers contributes detailed release notes plus a gated training outline; Circit and Confirmation contribute documented public lifecycle descriptions. The Confirmation regional page is older and is used only for sequence, not current UI or pricing.

No fees, compliance guarantees, integration performance, legal retention defaults or security certifications were independently assessed. No commercial account was created, no screenshot was fabricated, no proprietary asset is included, and no claim is made that all products were usability-tested. The next prototype must test our adapted behavior with consistent fictional data and retain these evidence labels.

