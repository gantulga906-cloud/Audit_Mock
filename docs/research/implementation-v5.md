# Audit workspace v5

## Walkthrough

1. As Т. Тэмүүлэн, open **Үйлчлүүлэгчид**, register a synthetic company and contact, select the new company, and create an engagement. Enter a reporting date range, a target report date, and the team. The workpaper index starts with 70 blank workpapers. A repeat engagement can point to a prior period and reuse the current company record. The prior evidence, workpaper answers, approval records and procedure customizations stay with the prior engagement.
2. Switch to the partner. Open **Шийдвэр ба хүлээн авах**, record the independence decision reference and agreed letter version, then save the acceptance decision with a rationale. Activate the engagement from the intake card. The date range and company record are available in downstream workpapers.
3. Open **Мэдээллийн хүсэлт** and draft a request against a workpaper with a contact, owner, due date and individual document requirements. Download the request text and record issuance locally. The request owner can log a follow-up, register received files, accept each part or record why it was rejected and link a replacement. An issued incomplete request blocks the related workpaper from sign-off. When the request owner also has preparation rights on that workpaper, completing the request links accepted evidence directly. Other preparers can link accepted files from the evidence library.
4. In a programme such as 3.1.2, expand **Аудитын хөтөлбөр тохируулах**. Add or adapt a procedure, optionally link an engagement risk or assertion, and record the reason. A senior reviewer or partner can mark a procedure inapplicable. Revised procedures require fresh execution and results. Previous versions and the original firm template are preserved.

## Coverage and boundaries

The in-app source coverage view updates 16 feature entries across the client directory, engagement setup, risk and programme tailoring, evidence requests, and task follow-up. The tests exercise new-period isolation, role scope, prerequisite decisions, a rejected and replaced file, and tailoring after review. The remainder of the wishlist keeps its previous status.

The prototype uses browser-local storage and four simulated identities. Request issuance is a local record with downloadable text. Client portal uploads, email delivery, automatic reminders, specialist accounts, full cross-period workpaper carry-forward, and a complete account/assertion mapping remain outside this release. Existing v4 browser data is migrated on first load.
