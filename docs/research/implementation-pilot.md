# Shared audit pilot

The pilot uses the existing workpaper and request rules with a shared local SQLite store. New engagements can enable the extended register workflow from firm setup through archive. Existing fixed-asset pilot engagements keep their original required steps and can use the new registers where applicable. The browser demo remains available through `npm start`.

```sh
npm run build
npm run pilot
```

Open [the pilot](http://127.0.0.1:3004/pilot). Use the one-time terminal code to create a distinct password for each role. Sign out and sign back in to change roles. Separate browser profiles can keep separate sessions, and **Бүртгэл шинэчлэх** fetches changes from the other account. Conflicting saves require a refresh before retrying.

## Walkthrough

1. Sign in as the reviewer. Under **Аудитын бүртгэл ба шийдвэр**, draft firm identity, an organizational unit, the three practitioners, and their credentials. Submit the records. The partner approves the submitted versions. The reviewer creates a synthetic engagement with the extended workflow enabled.
2. Under **Хүлээн авах ба хараат бус байдал**, record ownership, integrity, and staffing assessments. Issue each team declaration. The assigned account records its own declaration, then an eligible reviewer evaluates it. An unresolved threat or missing required assessment blocks partner activation. Upon activation the pilot keeps the exact approved firm facts used.
3. The preparer completes **1.3** and **2.6** for review. Record entity facts, preliminary analytics, and a risk mapped to an account and planned programme. An approved applicability rule and reviewed planning inputs support the programme decision. The adopted programme becomes a workpaper. An excluded programme stays out of the workpaper and request lists.
4. Request evidence against an adopted programme. The preparer can replace a rejected file and attach the accepted version. Supporting files for acceptance or other assessments can be uploaded separately and assessed by another account. Use the fieldwork registers for substantive analytics, confirmations, journal testing, completion procedures, and evidence annotations.
5. The partner saves statements, disclosures, and the actual line amounts. In extended mode enter one `CODE,AMOUNT` pair per line. Final analytics validates its actual amount against that version. Record the evidence conclusion and human-selected opinion. Review 4.4 and 4.1.A1. Authorization retains the adopted templates, statement lines, supporting decisions and source file hashes. A changed financial-statement version makes the dependent decisions stale.
6. The partner records the issuance reference and seals the exact package. Downloading an archived package requires a reviewed grant. Inspection can limit the export to the report or one file. A recovery exercise restores file bytes to a temporary SQLite table and checks their hashes. A substantive amendment opens a controlled review and reissue path. An active hold blocks disposition even if it was approved before the hold was added.

## Scope

The three role accounts share a single engagement. The SQLite migration adds tables and accepts existing pilot workspace JSON. Browser-demo records remain separate. The database and uploaded originals are stored under the ignored `.audit-pilot/` directory by default. `AUDIT_PILOT_DB` can point to another local database. The pilot server listens on loopback.

Use synthetic evidence and statement content. The pilot records manual delivery and issuance references, and it implements only the selected retention policy and synthetic archive-copy disposal. Separate external accounts, multi-engagement tenancy, formal EQR, live delivery services, production retention and archival infrastructure, and full workbook parity remain open. [Feature-by-feature verification and boundaries](pilot-feature-coverage.md)
