# Register data dictionary

Version 1.0 | 16 November 2026. JSON is authoritative for nested values. CSV is UTF-8 with BOM; arrays/objects are JSON strings within a CSV cell. Empty string, null, numeric zero and N/A are distinct. Do not treat original baselineStatus as current implementation status. Guide mappings/proposed sequences are additions, not source-owner acceptance.

## acceptance_register

204 records; JSON acceptance_register.json; CSV acceptance_register.csv.

Columns: scenario, lifecycle, title, guide, source_ids, actors, input_revisions, actions, expected_outcome, recorded_profile_evidence, observed_this_session, independent_acceptance, scope, task_package.

- guide: G00-G11 navigation assignment; interpretation, not acceptance.
- independent_acceptance: A separate accountable source decision; currently open.
- scope: Original scope disposition (core/conditional/excluded/pending); retained.
## action_contracts_source

75 records; JSON action_contracts_source.json; CSV action_contracts_source.csv.

Columns: id, case, process, authority, tables, inputs, steps, checks, failure_retry, limitations, output, state, shared, open_decisions.

## automation_methods

58 records; JSON automation_methods.json; CSV automation_methods.csv.

Columns: id, title, name, source, scope, minimum, processes, cases, criteria, inputs, method, output, human, humanResponsibility, limits, extensions, baselineStatus, exampleStatus, guide, section, current_status, recorded_observations, independent_example, example_evidence_class, current_method_proof, staleness, task_package.

- scope: Original scope disposition (core/conditional/excluded/pending); retained.
- guide: G00-G11 navigation assignment; interpretation, not acceptance.
- section: Stable Markdown anchor; source-map is the domain source-map section.
## automation_runtime_profiles

58 records; JSON automation_runtime_profiles.json; CSV automation_runtime_profiles.csv.

Columns: automation, guide, source_input_contract, current_wire_profile, candidate_method, candidate_input_kinds, units_policy, status, recorded_evidence, remaining_contract_task, independent_acceptance.

- guide: G00-G11 navigation assignment; interpretation, not acceptance.
- status: Original recorded/source status; not changed by guide mapping.
- independent_acceptance: A separate accountable source decision; currently open.
## code_observation_index

72 records; JSON code_observation_index.json; CSV code_observation_index.csv.

Columns: path, sha256, lines, symbols, command_literals, baseline.

- baseline: Inspected local commit; remote publication status is separate.
## criterion_acceptance

315 records; JSON criterion_acceptance.json; CSV criterion_acceptance.csv.

Columns: id, case, process, role, criterion, contract, screen, baselineStatus, source, verification, guide, expected, source_evidence_status, required_proof, session_execution.

- guide: G00-G11 navigation assignment; interpretation, not acceptance.
- expected: Independent/source expected outcome; never automatically an observed result.
## current_area_input_contracts

object records; JSON current_area_input_contracts.json; CSV current_area_input_contracts.csv.

Columns: baseline, file, areaProfiles, areaMethods, areaSources.

- baseline: Inspected local commit; remote publication status is separate.
## current_area_input_schemas

35 records; JSON current_area_input_schemas.json; CSV current_area_input_schemas.csv.

Columns: kind, label, columns, baseline, owning_file.

- baseline: Inspected local commit; remote publication status is separate.
## current_area_typed_schemas

35 records; JSON current_area_typed_schemas.json; CSV current_area_typed_schemas.csv.

Columns: kind, label, headers, fields, file_contract, basis, supported_boundary.

## current_workbook_observations

5 records; JSON current_workbook_observations.json; CSV current_workbook_observations.csv.

Columns: file, path, registered_sha256, current_sha256, same_binary, inspection_date, semantic_evidence.

## data_dictionary

44 records; JSON data_dictionary.json; structured JSON only.

Columns: register, json, csv, records, columns.

## data_ownership_staleness

17 records; JSON data_ownership_staleness.json; CSV data_ownership_staleness.csv.

Columns: contract, owner, consumers, change_trigger, required_effect_and_preserved_history, owning_module, classification.

## dependencies

20 records; JSON dependencies.json; CSV dependencies.csv.

Columns: from, to, targetField, type, evidence, locator, description, id, confidence, enforcement, guide, section, current_status, apply_at, change_rule, tasks.

- guide: G00-G11 navigation assignment; interpretation, not acceptance.
- section: Stable Markdown anchor; source-map is the domain source-map section.
## domain_lifecycle_map

51 records; JSON domain_lifecycle_map.json; CSV domain_lifecycle_map.csv.

Columns: id, title, totalSteps, observedSteps, currentConnectedScenarioPassed, sourceScope, plannedScope, originalWorkPackages, proposedPrimaryPackage, remainingWork, acceptance, currentBranchIds, guide, recorded_connected, recorded_direct_steps, independent_acceptance, evidence_class, source_step_ids.

- guide: G00-G11 navigation assignment; interpretation, not acceptance.
- independent_acceptance: A separate accountable source decision; currently open.
- evidence_class: What the observation actually proves and when.
## evidence_ledger

8 records; JSON evidence_ledger.json; CSV evidence_ledger.csv.

Columns: id, class, source, limit.

## external_research

13 records; JSON external_research.json; CSV external_research.csv.

Columns: id, issuing_body, document, edition, locator, publication_date, international_effective_basis, engagement_applicability, jurisdiction_adoption, url, accessed, inspection_limit, supported_point.

## fieldwork_variants

22 records; JSON fieldwork_variants.json; CSV fieldwork_variants.csv.

Columns: id, parent_case, area, scene, input_requirements, preparer_action, reviewer_goal, professional_or_method_limit, source_locators, scope_basis, handoff, guide, section, current_status, acceptance_scenarios, tasks.

- guide: G00-G11 navigation assignment; interpretation, not acceptance.
- section: Stable Markdown anchor; source-map is the domain source-map section.
## form_fidelity

70 records; JSON form_fidelity.json; CSV form_fidelity.csv.

Columns: id, title, stage, sheet, family, purpose, source, fields, sections, clauses, reserveRows, cases, roles, interpretation, formulaCount, validationCount, rowCount, columnCount, sourceLocator, bindingStatus, baselineStatus, baselineTitle, guide, governance_guide, registered_source_locator, registered_formula_cells, registered_validation_definitions, current_evidence_status, whole_form_acceptance, runtime_correction, remaining_fidelity, task_ids.

- guide: G00-G11 navigation assignment; interpretation, not acceptance.
- current_evidence_status: Recorded source-verifier status, not semantic parity.
## fresh_current_workbook_inventory

object records; JSON fresh_current_workbook_inventory.json; structured JSON only.

Columns: edition, readOnly, interpretation, counts, categories, workbooks.

## fresh_documentation_checks

9 records; JSON fresh_documentation_checks.json; CSV fresh_documentation_checks.csv.

Columns: check, actual, expected, result, class.

- expected: Independent/source expected outcome; never automatically an observed result.
## future_development_compatibility

19 records; JSON future_development_compatibility.json; CSV future_development_compatibility.csv.

Columns: proposal, tasks, affected_scope, preserved_contracts, required_adaptations, possible_conflict_or_decision, integration_sequence, requirement_disposition.

## nested_source_members

158 records; JSON nested_source_members.json; CSV nested_source_members.csv.

Columns: id, locator, bytes, sha256, pages.

## open_decisions

37 records; JSON open_decisions.json; CSV open_decisions.csv.

Columns: id, kind, question, evidence, required_decision, owner, status, guide, blocks.

- status: Original recorded/source status; not changed by guide mapping.
- guide: G00-G11 navigation assignment; interpretation, not acceptance.
## original_backlog_preserved

object records; JSON original_backlog_preserved.json; structured JSON only.

Columns: planDate, baselineCommit, intent, ownerStatus, sizing, packages, lifecycleMatrix, variantMatrix, reviewDate, previousBaselineCommit, scopeOfThisDeliverable, sourceAcceptanceChanged, reviewFindings, preservationChecks, implementationCheckpoint.

## original_plan_preservation_checks

2 records; JSON original_plan_preservation_checks.json; CSV original_plan_preservation_checks.csv.

Columns: check, result, original, compared.

## process_screen_gap_dispositions

70 records; JSON process_screen_gap_dispositions.json; CSV process_screen_gap_dispositions.csv.

Columns: kind, id, title, cases, screens, roles, criteria, guide, disposition, page, processes, evidence, resolution, owner, status.

- guide: G00-G11 navigation assignment; interpretation, not acceptance.
- status: Original recorded/source status; not changed by guide mapping.
## recorded_Original_Source_Check

object records; JSON recorded_Original_Source_Check.json; structured JSON only.

Columns: verifiedOn, inputs.

## recorded_Scope_Preservation

object records; JSON recorded_Scope_Preservation.json; structured JSON only.

Columns: date, baselineCommit, currentCommit, groups, registeredRows, connectedCycles, allPriorCyclesPreserved, sourceFileByteChanges, effectiveValidationRuleChanges, sourceAcceptance, backlog.

## recorded_source_verification

object records; JSON recorded_source_verification.json; structured JSON only.

Columns: summary, build, scenarios, testFiles, tests, lifecycles, lifecycleErrors, reports.

## recorded_Validation_Cell_Coverage_Comparison

object records; JSON recorded_Validation_Cell_Coverage_Comparison.json; structured JSON only.

Columns: date, comparedWithExactRegisteredInventory, results.

## recorded_Workbook_Semantic_Comparison

object records; JSON recorded_Workbook_Semantic_Comparison.json; structured JSON only.

Columns: date, readOnly, results.

## remote_baseline_observation

object records; JSON remote_baseline_observation.json; structured JSON only.

Columns: checked_on, branches, prs, compare, chat.

## requirement_traceability

2247 records; JSON requirement_traceability.json; CSV requirement_traceability.csv.

Columns: id, title, scope, status, fixturePassed, sourceRowSha256, source, relatedCases, observations, relatedScenarios, register, guide, section, disposition, owning_module_candidate, code_baseline, evidence_class, acceptance_scenario, open_decision, implementation_note, sourceDisposition.

- scope: Original scope disposition (core/conditional/excluded/pending); retained.
- status: Original recorded/source status; not changed by guide mapping.
- fixturePassed: Direct engineering fixture evidence flag; independent acceptance is separate.
- sourceRowSha256: Frozen normalized source-row hash from recorded verifier; retained.
- observations: Previously recorded bounded test observations, not this-session app execution.
- guide: G00-G11 navigation assignment; interpretation, not acceptance.
- section: Stable Markdown anchor; source-map is the domain source-map section.
- evidence_class: What the observation actually proves and when.
## role_action_runtime

11 records; JSON role_action_runtime.json; CSV role_action_runtime.csv.

Columns: action, actor, preconditions, outcome_and_independence, owning_file, baseline, evidence_class.

- baseline: Inspected local commit; remote publication status is separate.
- evidence_class: What the observation actually proves and when.
## role_action_source

375 records; JSON role_action_source.json; CSV role_action_source.csv.

Columns: case, process, capacity, primary_capacity, command_or_goal, owning_contract, perform_goal, read, review_boundary, revocation.

## source_alias_crosswalk

14 records; JSON source_alias_crosswalk.json; CSV source_alias_crosswalk.csv.

Columns: source_id, canonical_source_id, historical_path, historical_sha256, current_archive_exact_hash_matches, authority, historical_review_status, current_review_limit, edition_conflict, historical_file_present, current_historical_path_sha256, current_historical_path_matches, decision_reference.

## source_conflicts

16 records; JSON source_conflicts.json; CSV source_conflicts.csv.

Columns: id, source, issue, resolution, affected.

## source_edition_register

200 records; JSON source_edition_register.json; CSV source_edition_register.csv.

Columns: id, identity, locator, sha256, edition, observation_date, authority, content_date, inspection_limit, conflict, duplicate_canonical.

## source_edition_registered

23 records; JSON source_edition_registered.json; CSV source_edition_registered.csv.

Columns: id, path, sha256, bytes, review.

## source_populations

15 records; JSON source_populations.json; CSV source_populations.csv.

Columns: population, rows.

## standards_source_edition

52 records; JSON standards_source_edition.json; CSV standards_source_edition.csv.

Columns: reference_id, authority, reference, edition_inspected, provisions_inspected, effective_basis, effective_date, application_condition, local_applicability_status, affected_use_cases, reference_topic, verification_limit, related_decisions, primary_source_url, local_context_url, verified_on.

## task_to_guide

128 records; JSON task_to_guide.json; CSV task_to_guide.csv.

Columns: id, title, workAndExpectedResult, status, owner, evidence, priorStatus, checkpointStatus, proposedExecutionBatch, reviewAssessment, implementationAssessment, implementationStatus, implementationEvidence, package, package_title, original_prerequisites, guide, recommended_sequence, handbook_status, done_condition, implementationCheckpoints.

- status: Original recorded/source status; not changed by guide mapping.
- guide: G00-G11 navigation assignment; interpretation, not acceptance.
## variant_acceptance_scenarios

110 records; JSON variant_acceptance_scenarios.json; CSV variant_acceptance_scenarios.csv.

Columns: scenario, variant, guide, source, expected, status, evidence.

- guide: G00-G11 navigation assignment; interpretation, not acceptance.
- expected: Independent/source expected outcome; never automatically an observed result.
- status: Original recorded/source status; not changed by guide mapping.
## workflow_form_uses_source

316 records; JSON workflow_form_uses_source.json; CSV workflow_form_uses_source.csv.

Columns: lifecycle, phase, form_code, title, source, locator, source_use, lifetime, condition, cases, status.

- status: Original recorded/source status; not changed by guide mapping.

## CSV projection note

current_area_input_contracts.json preserves profiles, methods and source declarations. Its CSV is a readable projection of the 35 areaSources declarations, also provided as current_area_input_schemas.csv/json. current_area_typed_schemas gives per-field types and units. Original source-action and standards registers preserve historical proposal/edition status, not automatic runtime or normative approval.
