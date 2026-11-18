# G09: local named access and operations

18 November 2026. Engineering implementation following G09, PILOT, INDEX and G00–G08. The user selected local accounts. No hosting, external identity provider, live deployment, production performance target or independent release acceptance has been selected by this implementation.

## Local identity and migration

The shared preparer/reviewer/partner entrances remain a migration option. Named identities are separate `U-…` subjects with their own username, staff link, capacity, activation, password hash, sessions and dated engagement grants. Individual identity is not a renamed shared role. Old shared actors, source keys, work versions, signoffs, exact originals, report artifacts and archive hashes stay unchanged.

For a new local instance first complete the existing shared setup. On an already configured instance the server console prints a local named-administrator setup code when no named administrator exists. In the firm administration page, the existing local partner uses that code and a current approved partner staff record to create the first named administrator's activation token. The named administrator activates the account and signs in through the “Named local account” entrance. Later invitations require this explicit administrator authority. Tokens are shown once for hand delivery; no email is sent.

For this loopback-only preview, `123` is accepted for named accounts as requested; a passphrase of at least 15 characters is also supported. Existing preview passwords and the running preview database are not reset. This profile is not a production password, TLS, MFA, identity-proofing or at-rest-storage approval.

Before activation/invitation, link each account to an approved active M01-F03 staff record and a current M01-F06 capacity appointment. Each staff record and username has one stable named subject. Give an explicit dated engagement grant. Active audit work also requires that exact person's current approved M04-F06 suitability/appointment. A role name or an old relationship edge alone does not give named access. The current staffing model retains one appointed named person per engagement capacity; a general multi-team/delegation editor is not implied.

Grants affect named access immediately across lists, search, deep links, templates, originals, reports, authorizations, action endpoints and selected exports. Suspension/departure revoke grants and sessions and preserve past records. Suspension can be reinvited; departed identities remain historical. Capacity changes require the newly approved staff capacity/appointment, revoke prior grants, invalidate sessions and require fresh grants. Display-name changes do not rewrite answers, typed values or professional conclusions. Password reactivation invalidates old sessions. Sessions use random server-issued opaque tokens, stored as hashes, with eight-hour absolute and 30-minute idle limits; the existing login-attempt protection is retained.

Explicitly reassign future work to the named preparer and reviewer using the existing work-assignment action. Existing role-owned work and its history are not silently reassigned. Named preparation, submission, returns, responses, note-author clearance, reviews, new domain records and action receipts record individual subjects. Capacity and actual actor are distinct. The named authoring/publishing path also retains the author capacity for permission checks while recording the actual author/publisher.

When the named team is ready, the administrator can explicitly close the shared team entrances. This expires their sessions. Until that switch is applied, possession of a shared role password remains a separate migration entrance; revoking one named account does not claim to revoke knowledge of a shared password. The switch is reversible by a named administrator.

Independent quality and archive custody keep separate entrances. Their named users also require their own staff identity and firm appointment plus an explicit engagement grant. For quality, the current independently evaluated quality policy must identify the actual staff ID or named subject ID in its reviewer field. For custody, the exact custody offer must identify that staff/subject in its custodian assignment. Existing eligibility, exact-package, authority and limited-material checks still apply. A named independent user cannot use the team entrance to obtain wider access. Shared independent entrances remain a separately governed migration facility; they are not closed by the team switch.

## Queues and counts

The current-work panel is built from the exact authorized engagement view. Each item links to its owning form and record. Submitted work's next owner is its reviewer; other open work's next owner is its preparer. Returned work carries its actual open-note reason and owner. Closing a manual task never reviews a paper, clears a note or makes a professional judgment. Opening a dashboard link does not bypass the owning action's current checks.

Every count returns its exact row IDs, grain, population, status/date rule, current server revision and UTC as-of timestamp. Clicking a count displays those same rows. Missing or invalid due dates stay in an unknown-date population and are excluded from overdue counts. The reviewed-work fraction uses visible required work, excluding justified N/A; manual-task completion is separate. Neither is an audit-risk or audit-quality score. “Current server snapshot” describes the read, not external source freshness. External freshness/outcomes remain unknown without their own evidence. No external email or client notification is sent.

## Local connection boundary

The durable local trial register covers delivery, signing and ERP adapter contracts. It records stable logical correlation, operation/version IDs, exact canonical payload and accepted-original hashes, a separate named approver, individual attempt IDs, known success/failure/unknown states and receipts. A changed payload creates an explicit correction with its predecessor preserved. Unknown results block blind retry and correction until a current accepted receipt reconciles the exact attempt. Trials do not alter report issuance, legal signatures, ERP records or audit conclusions.

The implemented provider is explicitly `local-conformance`. It makes no network call and has no external effect. Real provider choice, credential handling, authority/scope, remote idempotency/reconciliation and real success/failure evidence remain required before connecting a service. A local idempotency key is not a promise of remote exactly-once effects.

The firm administration page contains named account controls. The local connection panel is available on the administration view when an actual open engagement is selected; it uses the same protected actions. The normal audit UI remains intact.

## Operations and release acceptance

`rehearse:local-operations` takes a source SQLite database, a fresh output directory and a private configuration file containing the copied account's login, request count, concurrency and optionally an explicitly approved target with owner/basis. It opens the source read-only, takes supported SQLite backups, migrates only the disposable copy and compares meaningful tables. The rollback copy stays unchanged. Recovery verifies exact records, identities, grants, scope, histories, original bytes, authorizations and archives. Credentials, sessions, runtime databases, browser profiles and private configuration never belong in the published checkpoint.

The rehearsal records the five original operational IDs: OPS-BOOTSTRAP, OPS-MIGRATION, OPS-RECOVERY, OPS-WORKLOAD and OPS-DEPLOYMENT. Bounded read timings are engineering observations. They do not establish representative firm-scale performance, write contention, large-file performance, provider latency, RPO/RTO or an approved target. Deployment stays unperformed. A copy rehearsal is not permission for live cutover. Meaningful earlier-version cutover needs the attributable prior code/database and a reviewed rollback decision.

The existing source verification and exact independent acceptance mechanism remain the release authority. Engineering test success cannot populate the independent acceptance list. All 25 packages, 128 tasks and 2,247 registered obligations remain. G09 fixture evidence does not accept G00–G08 retained professional/source cases or G10/G11 work. Release-ready remains false until those exact requirements and operational gates are actually accepted by accountable people.

## Retained requirements

- Independent acceptance against exact source rows/versions and current technical proof; no fabricated reviewer approvals.
- Actual operating owners, hosting/storage/security profiles, representative workloads and approved performance/recovery targets; full operational release acceptance.
- Real selected delivery/signing/ERP adapters and evidenced remote reconciliation, where required; local trials are not integrations.
- Full identity proofing, production password/MFA/TLS/storage controls, broader tenant/staff lifecycle and generalized multi-person delegation if selected; named local access does not certify a production directory.
- Meaningful old data and `/legacy` reconciliation before retiring any old entrance or capability. No legacy retirement occurred here.
- Current and prior source editions, all source forms, automations, feature contracts, complete source E2E variants and all earlier retained work remain in their owning packages. G10 and G11 remain next handbook work.

## External references and implementation decisions

Fresh official documentation was consulted on 18 November 2026. OWASP's [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) supports default-deny resource checks and validating permission on every request. Its [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) informed opaque server-issued sessions and invalidation around account/authority changes. [SQLite's Online Backup API](https://www.sqlite.org/backup.html) supports making consistent snapshots without treating a casual live-file copy as a backup. These are selected engineering references, not whole-standard compliance claims. G09's ASVS 5.0.0 reference remains a scoped assessment requirement, not a certification.
