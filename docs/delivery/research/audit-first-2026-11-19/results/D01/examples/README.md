# D01 import examples

All entities, people and identifiers are synthetic. Leading-zero identifiers test parsing; they are not claimed valid Mongolian registrations.

- CLIENTS_template.csv and CONTACTS_template.csv: exact headers.
- CLIENTS_valid.csv and CONTACTS_valid.csv: one package with metadata from valid_package.json.
- valid_package.json: normalized logical representation under Client_Import_Schema.json.
- CLIENTS_invalid_duplicates.csv: deliberate duplicate source key/registration with conflicting name; expected E003 and zero committed rows.

Blank optional CSV cells become omitted JSON properties. These examples are specifications. No file here proves an importer exists. See Import_Scenarios.csv for update, concurrency, formula, replay and transaction expectations.
