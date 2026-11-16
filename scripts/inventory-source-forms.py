"""Read-only OOXML inventory. Does not calculate formulas or edit source workbooks."""
import argparse
import collections
import csv
import hashlib
import json
import posixpath
import re
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"

def columns(label):
    value = 0
    for letter in label:
        value = value * 26 + ord(letter) - 64
    return value

def list_values(expression, values):
    if not expression:
        return None
    if expression.startswith('"') and expression.endswith('"'):
        return next(csv.reader([expression[1:-1]]))
    match = re.fullmatch(r"\$?([A-Z]+)\$?(\d+):\$?([A-Z]+)\$?(\d+)", expression)
    if not match:
        return None
    left, top, right, bottom = columns(match[1]), int(match[2]), columns(match[3]), int(match[4])
    if (right-left+1)*(bottom-top+1) > 3000:
        return None
    return [value for (col, row), value in values.items() if left <= col <= right and top <= row <= bottom and value != ""]


def inventory(path, stage):
    with zipfile.ZipFile(path) as book:
        strings = ["".join(t.text or "" for t in si.findall(".//s:t", NS)) for si in ET.fromstring(book.read("xl/sharedStrings.xml"))] if "xl/sharedStrings.xml" in book.namelist() else []
        rels = {r.attrib["Id"]: r.attrib["Target"] for r in ET.fromstring(book.read("xl/_rels/workbook.xml.rels"))}
        sheets = []
        for sheet in ET.fromstring(book.read("xl/workbook.xml")).findall("s:sheets/s:sheet", NS):
            name = sheet.attrib["name"]
            target = rels[sheet.attrib[REL]]
            member = target.lstrip("/") if target.startswith("/") else posixpath.normpath(posixpath.join("xl", target))
            xml = ET.fromstring(book.read(member))
            values = {}
            for cell in xml.findall(".//s:sheetData/s:row/s:c", NS):
                ref = re.fullmatch(r"([A-Z]+)(\d+)", cell.attrib["r"])
                raw = cell.find("s:v", NS)
                value = raw.text if raw is not None else ""
                if cell.attrib.get("t") == "s" and value:
                    value = strings[int(value)]
                elif cell.attrib.get("t") == "inlineStr":
                    value = "".join(t.text or "" for t in cell.findall(".//s:t", NS))
                values[(columns(ref[1]), int(ref[2]))] = value or ""
            formulas, validations = [], []
            shared = {f.attrib["si"]: (cell.attrib["r"], f.text) for cell in xml.findall(".//s:sheetData/s:row/s:c", NS)
                      if (f := cell.find("s:f", NS)) is not None and f.text and f.attrib.get("t") == "shared"}
            for cell in xml.findall(".//s:sheetData/s:row/s:c", NS):
                formula = cell.find("s:f", NS)
                if formula is None:
                    continue
                expression = formula.text or ""
                anchor, base = shared.get(formula.attrib.get("si"), (cell.attrib["r"], expression)) if not expression else (cell.attrib["r"], expression)
                position = re.fullmatch(r"([AB])(\d+)", anchor)
                numbering = bool(position and base in (f"1+{position[1]}{int(position[2])-1}", f"+{position[1]}{int(position[2])-1}+1", f"{position[1]}{int(position[2])-1}+1"))
                current = re.fullmatch(r"([AB])(\d+)", cell.attrib["r"])
                effective = f"{current[1]}{int(current[2])-1}+1" if numbering and current and current[1] == position[1] else expression
                formulas.append({"cell": cell.attrib["r"], "expression": expression, "attributes": formula.attrib,
                                 "sharedAnchor": anchor, "effectiveExpression": effective,
                                 "classification": "row-number-sequence" if numbering and effective else "calculation-or-reference-review",
                                 "disposition": "presentation-order-not-audit-calculation" if numbering and effective else "not-executed-in-product-pending-rule-review"})
            for rule in xml.findall("s:dataValidations/s:dataValidation", NS):
                f1, f2 = rule.find("s:formula1", NS), rule.find("s:formula2", NS)
                category = {"list": "categorical-options", "whole": "integer-input", "decimal": "numeric-input", "date": "date-input", "textLength": "text-length", "custom": "custom-rule-review"}.get(rule.attrib.get("type"), "rule-review")
                if rule.attrib.get("promptTitle") == "Хариуцлагын түвшин":
                    category = "responsibility-assignment"
                validations.append({"ranges": rule.attrib.get("sqref", ""), "attributes": rule.attrib,
                                    "formula1": f1.text if f1 is not None else None, "formula2": f2.text if f2 is not None else None,
                                    "options": list_values(f1.text, values) if f1 is not None and rule.attrib.get("type") == "list" else None,
                                    "classification": category, "disposition": "source-captured-form-specific-semantic-review-open"})
            match = re.match(r"\d+(?:\.\d+)+(?:\.?A[1-4])?", name)
            sheets.append({"stage": stage, "sheet": name, "form": match.group(0) if match else None,
                           "dimension": xml.find("s:dimension", NS).attrib.get("ref") if xml.find("s:dimension", NS) is not None else None,
                           "formulaCount": len(formulas), "validationCount": len(validations),
                           "formulas": formulas, "validations": validations, "fidelityStatus": "inventory-complete-semantic-acceptance-open"})
    return {"file": path.name, "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "sheets": sheets}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_directory", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    books = [inventory(args.source_directory / f"Audit_Stage_{stage}_Repaired.xlsx", stage) for stage in range(1, 6)]
    sheets = [sheet for book in books for sheet in book["sheets"]]
    counts = {"workbooks": len(books), "sheets": len(sheets), "formSheets": sum(s["form"] is not None for s in sheets), "referenceSheets": sum(s["form"] is None for s in sheets), "formulas": sum(s["formulaCount"] for s in sheets), "validations": sum(s["validationCount"] for s in sheets)}
    categories = {kind: dict(collections.Counter(r["classification"] for s in sheets for r in s[kind])) for kind in ["formulas", "validations"]}
    result = {"edition": "five repaired source workbooks", "readOnly": True,
              "interpretation": "Inventory and provisional categories, not Excel calculation parity or business acceptance. No formula is executed as product logic solely from this inventory.",
              "counts": counts, "categories": categories, "workbooks": books}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"counts": counts, "categories": categories, "output": str(args.output)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
