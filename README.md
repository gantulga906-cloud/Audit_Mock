# Veritech Audit — first interactive prototype

A Mongolian-language audit workspace built with Next.js 16, React, TypeScript and Tailwind CSS 4. The application runs entirely in the browser with fictional engagement data and local persistence.

## Run

Requires Node.js 20.9+ and npm or pnpm.

```sh
npm install
npm run dev
```

Open http://localhost:3000. With pnpm, use `pnpm install` and `pnpm dev` instead. The dependency lockfile is `pnpm-lock.yaml`.

```sh
npm run typecheck
npm test
npm run build
```

The build produces a static `out/` directory. Any static web host can serve it. No database, credentials, external APIs, or server deployment are needed for this version.

## Try these journeys

1. **Preparation and review:** As Б. Номин, open **3.1.2**, enter a procedure result, link evidence and submit. Switch to Т. Тэмүүлэн, write a note and return it. Switch back to respond and resubmit. The reviewer separately clears the note and reviews the submitted version.
2. **Non-sequential forms:** Open **1.1.1**. Draft work is possible while the acceptance decision is missing. Follow its link to **1.4.1**, switch to Д. Бат-Эрдэнэ and record the acceptance decision. Return to **1.1.1** to see the linked result and updated readiness.
3. **Materiality:** Open **1.3** and change the fictional benchmark and selected percentage. Missing/invalid inputs remain distinct from a valid zero. The selected percentage is a demonstration parameter, not a professional default.
4. **Changed reviewed work:** After a review, edit the content as its preparer. The new revision requires review; prior submitted answer snapshots are visible under **Хувилбарын түүх**.
5. **Controlled template changes:** Т. Тэмүүлэн can draft a change to the **1.1.1** template. Д. Бат-Эрдэнэ has a separate demonstration publisher assignment. Publication does not change the engagement automatically; the senior explicitly adopts it while existing answers remain.
6. **Quality scope:** С. Саруул has a separate quality-confirmation action on **4.6**. It does not issue a report or grant administrator powers.

## Included

- Role-specific queues and action availability for four named fictional participants.
- Five audit stages and a searchable catalogue of 70 form definitions.
- Original Mongolian question/procedure text extracted from the five repaired stage workbooks.
- Questionnaire, programme, document-text and calculation editors.
- A sample acceptance dependency, evidence register, review notes, replies, revision history, answer snapshots and JSON export.
- One fictional engagement, local browser persistence, responsive layouts and resettable demo state.

## Boundaries

This is a product prototype, not an operational audit system. Roles are simulated client-side. There is no production authentication, server-enforced access, secure file storage, simultaneous multi-user support or audit-compliance certification.

The form catalogue is a **first rendering of extracted source text**. Native Excel layouts, assertions grids, every typed option set and all domain-specific calculations have not been reproduced. Long fixed clauses and headings may still need classification during design refinement. All forms can be opened; this does not mean every source acceptance criterion is implemented.

Only selected dependencies are demonstrated. Other related-work links are navigation examples and are not a verified complete dependency graph. Review routes are demonstrative, not a finalized per-work authority matrix. A draft can be submitted with incomplete procedures for review; submission does not certify performance or completion.

The evidence viewer clearly identifies generated specimen documents. File registration keeps metadata and short text previews locally, not the original binary files. It does not upload evidence to a service.

Research and design decisions: [docs/design-research.md](docs/design-research.md).

## Source handling

Source ZIPs and workbooks were read without modification and are not included here. `src/data/forms.json` contains derived product form definitions and source worksheet/cell locators. The wider wishlists, process specifications, roles and ERD informed the mockup; the code does not claim the entire source corpus has been implemented.
