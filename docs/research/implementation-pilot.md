# Shared audit pilot

The pilot exercises one fixed-asset workstream from engagement setup through partner authorization. It uses the existing workpaper and request rules with a shared local SQLite store. The original browser demo remains available through `npm start`.

```sh
npm run build
npm run pilot
```

Open [the pilot](http://127.0.0.1:3004/pilot). Use the one-time terminal code to create a distinct password for each role. Sign out and sign back in to change roles. Separate browser profiles can keep separate sessions, and **Бүртгэл шинэчлэх** fetches changes from the other account. Conflicting saves require a refresh before retrying.

1. The reviewer registers a synthetic engagement. The partner records the independence reference, the agreed engagement letter version, and the acceptance rationale before activating it.
2. The team records a 3.1.2 evidence request. The preparer registers a file and its source. Rejection preserves the original and allows a replacement. Acceptance links the exact file version to the workpaper.
3. The preparer saves the execution and conclusion and submits the saved version. The reviewer can return it with a note. The preparer responds and resubmits, then the reviewer clears the note and signs the current workpaper.
4. The partner registers the financial-statement and disclosure content. The reviewer prepares and submits 4.4 and 4.1.A1, and the partner reviews those revisions. Authorization records the exact versions and linked evidence hashes. Revising the statements makes the prior authorization stale and returns the report paper for review. The partner can download the retained authorization history.

## Scope

This covers selected handoffs from P01, P02, P07, P08, P10 and P11. The three accounts share a single engagement. The pilot does not migrate browser-demo records. It stores the database and uploaded originals under the ignored `.audit-pilot/` directory by default. `AUDIT_PILOT_DB` can point to another local database. The pilot server listens on loopback.

Use synthetic evidence and statement content for this pilot. Multiple engagement teams, a client portal, actual report issue or signature, formal quality review, archive retention and full workbook parity remain outside the slice.
