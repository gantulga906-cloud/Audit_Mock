# Extended pilot feature ledger

The prior gap audit counted 34 features without a working workflow. The extended pilot now has an authenticated, persistent workflow slice for each of those IDs. The integration scenario submits and approves all 34 kinds in one synthetic engagement and verifies the state after restart. This advances those rows from absent or form/fixture only to working at pilot depth. Full source acceptance remains a separate check. The older static-demo coverage ledger remains a record of that surface.

The owning use cases below come from the supplied feature register. The verification column identifies the behavior exercised in [the extended HTTP integration scenario](../../tests/pilot.test.mjs), including selected acceptance-criterion links where a test directly probes the rule. Source IDs refer to the [normalized source registers](../../src/data/source-registers.json). The previous [source review](source-review.md) records the ZIP and companion workbook editions and their extraction limits.

| Feature | Source case | Verified pilot slice | Remaining boundary |
|---|---|---|---|
| M01-F01 | P14-UC01 | Approved identity is retained on activation after the firm name changes. Preparer write denied. | Firm-group identity and external registers |
| M01-F02 | P14-UC01 | Approved team becomes a roster relationship and a filter. | Cross-engagement portfolio reporting |
| M01-F03 | P14-UC01 | Three named practitioners with units, dates, and statuses are used in staffing. Historical firm facts remain stored. | Account provisioning and historical practitioner directory across engagements |
| M01-F04 | P14-UC02 | Credentials retain source, validity and skills and are checked by staffing. P14-UC02-AC01. | Issuer verification and firm-defined credential requirements |
| M01-F06 | P14-UC01 | Dated role and employment record links to a named person while auth roles remain separate. P14-UC01-AC02. | Firm-wide role administration and delegated technical grants |
| M02-F05 | P04-UC01 | Approved framework-matched rule and explicit inapplicable rule drive programme selection. Draft and approved versions have history. | Broader policy dimensions, controlled deployment across engagements |
| M03-F04 | P01-UC02 | Dated parent/controller record feeds integrity and entity context with provenance. | Full cross-client ownership graph, beneficial ownership checks |
| M04-F02 | P02-UC01 | Integrity assessment links an independently evaluated file, owner, outcome, and rationale. P02-UC01-AC04. | Firm-specific escalation and prohibited-client policy |
| M04-F04 | P02-UC02 | Assigned account declares, issuer submits, evaluator reviews. Self-clearance is denied. P02-UC02-AC02/03. | External access and verified identity of external declarants |
| M04-F05 | P02-UC03 | An open threat blocks activation until the safeguard and residual decision are separately approved. | Applicability of prohibitions and required authority by firm policy |
| M04-F06 | P02-UC01 | Each role has a different roster member, valid linked credential, availability and assessed hours. P02-UC01-AC04. | Aggregate scheduling conflicts, specialist access and credential policy |
| M06-F02 | P06-UC01 | Entity facts, framework, provenance and group context feed risk records. | Interview completion, control-evidence distinction and more source fields |
| M06-F04 | P06-UC02, P09-UC04 | Reviewed fraud factors, inquiry, assertion and planned response link to the risk map. | Complete fraud presumptions, response variants and escalation |
| M06-F05 | P05-UC03, P06-UC04, P09-UC10 | Opening-balance test, prior work, limitation and resulting work are recorded. P06-UC04-AC03. | Full component/group audit work and data mapping |
| M06-F06 | P06-UC03 | Explicit comparative, threshold and investigated variance carry into scope; reviewed 1.3 inputs support adoption. | Multi-period analytical models and account population imports |
| M06-F09 | P06-UC02 | Account and assertion mapping links entity, fraud and preliminary analytics to planned response and programme. | Linked chart of accounts and reusable multi-engagement risk taxonomy |
| M07-F01 | P07-UC01 | Only adopted programme enters fieldwork. Its source contract is stored and bound to the reviewed planning versions. P07-UC01-AC01/02. | Full source programme instantiation and multi-methodology adoption |
| M07-F06 | P09-UC03 | Expectation, precision, threshold, exact accepted evidence and investigated exception are reviewed. P09-UC03-AC01/02. | Structured operand imports and independent expectation timing |
| M07-F08 | P08-UC03, P08-UC04 | Nonresponse requires explicit alternative procedures; received or discrepant responses require an evidence record. P08-UC03-AC01. | Controlled live dispatch, follow-up, recipient verification and escalation |
| M07-F09 | P09-UC04 | Exact population file, selected entry/line, selection basis, test and conclusion are linked. P09-UC04-AC04. | Automated and reproducible journal selection and line normalization |
| M07-F10 | P09-UC05–UC09 | Reviewed subsequent-event record linked to evidence and completion; open special procedures block approval. | Complete subtype-specific inputs, coverage dates and applicability |
| M08-F07 | P08-UC02 | Sheet/cell reference, tick mark and separate reply stay with the exact file version. | Inline Office/PDF navigation, visual overlays and complete contradiction workflow |
| M10-F06 | P10-UC03 | Amount is checked against the selected statement line; changing it marks the reviewed analysis and dependent decisions stale. P10-UC03-AC04. | Multi-currency and full analytical models |
| M10-F08 | P10-UC06 | Reviewed conclusion links final analytics, limitations, contradictions and findings. P10-UC06-AC02 in part. | All source evidence types and professional sufficiency checks |
| M10-F09 | P10-UC06 | Human opinion and documented rationale link to the sufficiency decision and exact authorized package. P10-UC06-AC01. | Firm-approved opinion review and formal EQR policy |
| M10-F11 | P09-UC08, P10-UC06, P10-UC07 | Approved additional section links to the opinion and a preserved report template. P10-UC06-AC03. | Complete report rendering and jurisdiction-specific applicability |
| M10-F12 | P10-UC05 | Received result requires date and accepted version of signed evidence; its assessment gates authorization. P10-UC05-AC01. | Verified signer identity, signature service and reporting rules |
| M10-F13 | P10-UC07 | Reviewed governance message links the actual journal-test exception, response and delivery file. | Recipient authorization policy, live delivery and acknowledgment |
| M12-F04 | P10-UC09, P12-UC02 | Ordinary editing is denied after lock. Administrative amendment preserves the predecessor. Substantive approval opens a new reviewed revision. P12-UC02-AC01/02. | Full post-issue communication and replacement lifecycle beyond the tested reopen |
| M12-F07 | P12-UC04 | Exact archive download requires the assigned role's grant. Original-file URL is denied after lock. Export logs actor and reason. P12-UC04-AC01. | Individual identity, recipient receipt and return workflow |
| M12-F08 | P12-UC05 | Approved policy, date and holds govern eligibility. An intervening hold also blocks execution after approval. P12-UC05-AC02. | Firm-approved retention clocks, policy conflicts and external custody |
| M12-F09 | P12-UC03 | Recovery restores original bytes to scratch SQLite, then compares file hashes to the sealed manifest. P12-UC03-AC04. | Independent backup systems, format-level readability and custody acknowledgment |
| M12-F10 | P12-UC04 | Report-only inspection exports the report and issuance reference without other workpapers or files. P12-UC04-AC01. | Arbitrary multi-item selection, independent delivery and inspection acknowledgment |
| M12-F11 | P12-UC05 | Eligibility, approval and execution are separate. Disposition removes only a synthetic archived copy and retains the decision. P12-UC05-AC01/02/03. | Production authorization, destruction and verification policies |

## Design decisions

Applicability follows the pattern documented for Inflo, where engagement characteristics inform the work programme. The confirmation workflow draws on the request, response and evaluation separation documented for Circit. Evidence uses the exact source-anchor pattern noted in the DataSnipper review. [Audit-product references](audit-products.md)

The extended mode uses explicit local defaults for review roles and required registers. D05 and D06 still need firm decisions on authority and formal EQR. D15 and D18 still govern the complete release boundary and reliance model. D19 and D20 require a firm-approved retention and hold policy. D21 and D25 remain open for standards editions and external services. No legal rule or professional opinion is selected by the pilot.
