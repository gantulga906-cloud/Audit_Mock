# Design research and implementation notes

Reviewed 6 November 2026. This is a bounded public-product pattern review used to inform an immediate first prototype, not a completed competitive usability study. Official product pages describe vendor claims; no commercial application was signed into or tested. Screens and undocumented interactions have not been invented. Source architecture and role definitions take precedence over competitor features.

## Ten product references

| Product | Public evidence and relevant pattern | Adaptation in this mockup |
|---|---|---|
| [Caseware Working Papers](https://www.caseware.com/products/working-papers) | Official overview describes linked balances, supporting workpapers, firm templates and selective roll-forward. | Shared engagement context, source-linked work and separate template/engagement versions. No live accounting integration. |
| [Inflo](https://inflo.com/) | Official platform overview separates working papers, data analytics, collaboration and quality management; describes risk-based, activity-focused methodology. | Work queues and related activities lead the experience, alongside stage navigation. No AI implementation claim. |
| [CCH Axcess Audit / Engagement](https://www.wolterskluwer.com/en/expert-insights/what-is-new-with-cch-axcess-audit) | Official update describes workpaper management, notes categorization, finalization, industry methodology and analytics. | Preparation, review notes and engagement progress are distinct. No vendor-specific methodology copied. |
| [AuditFile](https://auditfile.com/product-overview) | Official feature table describes progress tracking, linked workpapers, search, permissions and final-lock diagnostics. | Searchable forms, current work queues and explicit pending-work signals. No readiness/compliance guarantee. |
| [BrightWorkpapers, formerly MyWorkpapers](https://www.brightworkpapers.com/) | Official overview presents cloud preparation, review and sign-off with centralized engagement information. | A single engagement context accompanies editor, evidence and review panels. No simultaneous co-editing. |
| [Fieldguide](https://www.fieldguide.com/) | Official overview separates planning, testing, review and reporting, and describes centralized requests and evidence. | Assigned next actions and an evidence register with links into owning work. Agentic claims are not represented as implemented features. |
| [DataSnipper](https://www.datasnipper.com/) | Official overview positions document verification and practitioner review together. Specialist evidence workflow, not a full replacement audit methodology. | Source references and evidence inspection stay beside the workpaper. No OCR or extraction is simulated as successful processing. |
| [MindBridge](https://www.mindbridge.ai/) | Official audit positioning emphasizes full-population analysis, explainable risk signals and focused testing. Specialist analytics platform. | Explanations and selected parameters accompany the deterministic materiality example. There is no risk-scoring or anomaly model. |
| [Circit](https://www.circit.io/) | Official evidence platform describes independent verification and a response to fragmented source data. Specialist evidence/confirmation scope. | Evidence has identifiable source records and related work. No bank connection or independent verification is claimed. |
| [Thomson Reuters Confirmation](https://www.confirmation.com/) | Official overview describes confirmations, attributable actions and logged activity. Specialist confirmations workflow. | Action attribution and review history are visible. The prototype does not send requests or obtain external confirmations. |

The first six references are engagement/working-paper platforms or suites. The other four are specialist evidence, analytics or confirmation products. Product references are not permissions to add every advertised feature to our scope.

## Source-backed product decisions

- **Role capacities:** R1 prepares, R2 reviews, R3 handles authorized significant decisions, R4 confirms assigned quality scope. These are capacities on work. The prototype does not put four signature gates on every form.
- **Source forms:** 11 + 16 + 31 + 11 + 1 substantive forms from the repaired stage workbooks. The administrative change log is excluded. Question/procedure text is rendered from derived definitions; exact spreadsheet layout fidelity remains a later refinement.
- **Dependencies:** 1.1.1 demonstrates the acceptance outcome from 1.4.1 and a reference to independence work in 1.4.5. This is a selected interaction demonstration, not a complete field-level dependency register. Drafting is available before the decision.
- **Review:** submitted revision identity, distinct preparer responses and reviewer clearance, prior answer snapshots and renewed review after changed content.
- **Configuration:** the selected template example separates authoring, publication and engagement adoption. These sample support assignments are explicit and do not flow from a job title automatically.
- **Automation:** the materiality example uses fictional benchmark/percentage inputs, validates missing and invalid values and distinguishes valid zero. It does not choose a professionally appropriate benchmark or percentage.
- **Data model:** template content, work records, evidence references and notes remain separate in browser state. This is a prototype state model, not the physical ERD implementation.

## First-version visual direction

A calm, light professional workspace: a fixed left rail for stages and work areas, restrained green accents, contextual actions, compact work queues, and a review/evidence side panel. Mongolian business terminology is the primary interface language. Information architecture emphasizes work and ownership; internal ERD and automation-rule codes are not the home screen.

## Deliberately deferred

Full field-type/option binding, all process and dependency variants, source-specific reporting layouts, sampling engines, external requests, actual accounting imports, production identity/access, server storage, multi-user conflicts, professional sign-off services and secure archive execution.
