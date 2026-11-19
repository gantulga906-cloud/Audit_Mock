# Evidence, documents, confirmations and sharing

### D06 — Evidence, documents, confirmations and sharing

#### R-D06-01 — Research evidence acceptance and contradictions

**Proposed implementation decision:** Evidence sufficiency is a reviewed auditor judgment over specific uses. Receipt, acceptance, request coverage and intended-use evaluation are separate states.

**Original question:** What supports intended use, and what remains an auditor sufficiency decision?

**Prerequisites:** None beyond the pinned baseline. **Original work groups:** RW08 RW13 RW14 RW26. **Methods:** M01 M09 M13 M36.

**How to implement:**

1. Record request scope and actual original/supplier/channel/time
2. Evaluate relevance, reliability, scope, readability and document anchors per procedure/assertion
3. Preserve contradictory information with follow-up, not a hidden rejected attachment
4. Replacing a source stales each relying use selectively and reaches final sufficiency assessment

**Data/record contract:** evidenceId/version/hash, requestItem, useId, assertion, purpose, page/cell, relevance, reliability, contradiction, conclusion, nextOwner

**Discriminating expected cases:**

- Accepted wrong-period evidence does not fulfill this request
- Same original supports two uses; changing one does not erase the other
- All requests covered but one material contradiction unresolved -> no automatic sufficiency

**Owning paths:** `scripts/pilot-evidence.mjs`, `scripts/pilot-requests.mjs`, `scripts/pilot-finalisation.mjs`.

**Evidence/context:** [AUD-500](https://standards.auasb.gov.au/node/1012). **Original broader standard candidates:** ISA 230, 500, 501, 505, 580, 620; applicable confidentiality and professional ethics; OWASP authorization/file handling guidance.

**Accountable capacities:** Audit evidence analyst + file/security engineer; independent review:Practicing auditor; security reviewer for object access. Actual names remain unassigned; no signature is implied.

#### R-D06-02 — Research confirmation control and alternatives

**Proposed implementation decision:** Retain auditor control of confirmation design, addressee and replies. Secure manual dispatch/receipt is sufficient for v1 when its actual evidence is recorded.

**Original question:** Who controls selection, sending, replies and nonresponses?

**Prerequisites:** R-D06-01. **Original work groups:** RW08 RW13 RW14 RW26. **Methods:** M01 M09 M13 M36.

**How to implement:**

1. Specify subject, assertion, balance/date/currency and independently checked respondent details
2. Prepare/approve actual request and record dispatch separately from draft/local link
3. Evaluate reply reliability, differences, nonresponse and management refusal
4. Document alternative work and evidence/report consequences; required positive reply cannot be silently substituted

**Data/record contract:** confirmationId, respondent, addressBasis, replyRoute, requestHash, dispatchEvidence, responseHash, difference, refusal/nonresponse, alternativeWork

**Discriminating expected cases:**

- Management-forwarded PDF is received but reliability needs evaluation
- No reply -> actual alternatives, no zero difference
- Required positive response absent -> unresolved limitation and next owner

**Owning paths:** `scripts/pilot-confirmations.mjs`, `scripts/pilot-evidence.mjs`.

**Evidence/context:** [AUD-505](https://www.ifac.org/system/files/publications/files/IAASB-2020-Handbook-Volume-1.pdf). **Original broader standard candidates:** ISA 230, 500, 501, 505, 580, 620; applicable confidentiality and professional ethics; OWASP authorization/file handling guidance.

**Accountable capacities:** Audit evidence analyst + file/security engineer; independent review:Practicing auditor; security reviewer for object access. Actual names remain unassigned; no signature is implied.

#### R-D06-03 — Research file intake and extraction limits

**Proposed implementation decision:** Support selected PDF/XLSX/DOCX content inspection as derived views of retained originals; extraction never changes the evidence or proves authenticity.

**Original question:** Which selected file formats can be safely read and reviewed?

**Prerequisites:** R-D03-01. **Original work groups:** RW08 RW13 RW14 RW26. **Methods:** M01 M09 M13 M36.

**How to implement:**

1. Validate extension, signature, size and archive expansion before parsing in an isolated bounded worker
2. Preserve original bytes and derive text/table/image previews with exact page/cell anchors
3. Mark OCR/extraction uncertainty; reviewer compares substantive values with the original
4. Quarantine unsupported/password-protected/malformed content; route manual inspection and record actual result

**Data/record contract:** originalHash, parser/version, format, extractionId, anchor, extractedValue, confidence/uncertainty, reviewerCorrection, quarantineReason

**Discriminating expected cases:**

- Scanned invoice with OCR 8/3 ambiguity -> manual comparison required
- ZIP expansion bomb -> rejected before parsing
- Corrected derived text preserves original and earlier extraction

**Owning paths:** `scripts/pilot-workbook.mjs`, `scripts/pilot-evidence.mjs`, `scripts/pilot-intake.mjs`.

**Evidence/context:** [ENG-UPLOAD](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html); ENG-OOXML; [AUD-500](https://standards.auasb.gov.au/node/1012). **Original broader standard candidates:** ISA 230, 500, 501, 505, 580, 620; applicable confidentiality and professional ethics; OWASP authorization/file handling guidance.

**Accountable capacities:** Audit evidence analyst + file/security engineer; independent review:Practicing auditor; security reviewer for object access. Actual names remain unassigned; no signature is implied.

#### R-D06-04 — Research scoped sharing and revocation

**Proposed implementation decision:** Use the D02 selected-document sharing contract for every representation: metadata, preview, originals, range downloads, bundles and returned work.

**Original question:** What permissions apply to a file and all its representations?

**Prerequisites:** R-D02-04 R-D06-03. **Original work groups:** RW08 RW13 RW14 RW26. **Methods:** M01 M09 M13 M36.

**How to implement:**

1. Create named recipient/purpose/object-version/action/expiry grants backed by actual authority
2. Enforce server-side scope on every route and prevent names/counts leaking outside the allowed set
3. Record manual packet manifest, dispatch, acknowledgment, return and revocation separately
4. Apply immediate future-access revocation; record that previously downloaded copies cannot be technically recalled

**Data/record contract:** grantId, recipient, engagement, exactObjectVersions, action, purpose, authority, expiresAt, revokedAt, packetHash, acknowledgment

**Discriminating expected cases:**

- Grant for file A denies file B and whole-engagement bundle
- Revoked user direct URL fails after revocation
- Returned specialist report remains unaccepted until audit team evaluates it

**Owning paths:** `scripts/pilot-evidence.mjs`, `scripts/pilot-server.mjs`, `scripts/pilot-oversight.mjs`.

**Evidence/context:** [ENG-AUTH](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html); [AUD-500](https://standards.auasb.gov.au/node/1012); D02-SPECIALIST. **Original broader standard candidates:** ISA 230, 500, 501, 505, 580, 620; applicable confidentiality and professional ethics; OWASP authorization/file handling guidance.

**Accountable capacities:** Audit evidence analyst + file/security engineer; independent review:Practicing auditor; security reviewer for object access. Actual names remain unassigned; no signature is implied.
