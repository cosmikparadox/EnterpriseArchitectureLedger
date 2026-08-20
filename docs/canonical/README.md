# Canonical documents, revision "c"

Byte-exact copies pulled from the Drive Working Folder on 2026-08-20 via
the Drive API (`download_file_content`, base64, decoded to bytes). Sizes
verified against the Drive-reported file size for all four.

```
+--------------------------------------------+---------+------------------+
| FILE                                       |   BYTES | SHA256 (first16) |
+--------------------------------------------+---------+------------------+
| Architecture_Ledger_Research_Paper_v1_1c.md |  136144 | 4acd3ddeb107e447 |
| Canonical_Thesis_v2_1c.md                   |  142078 | 4701b38a865810c1 |
| Part_IX_Mathematics_v3_1c.md                |  128723 | d5dc0d910fe0660b |
| The_Numbers_Explained_v1_1c.md              |   83557 | f2ad319ea4c73d05 |
+--------------------------------------------+---------+------------------+
```

These supersede v2.1, v1.1 and v3.1 for all citation purposes in this
repository. Any citation to the canonical documents from 2026-08-20
onward is to the "c" revision and resolves against these local copies.

Note on method: an earlier attempt used the Drive `read_file_content`
tool, which returns a natural-language text representation rather than
the file bytes, and produced files that did not match the source size.
Those were discarded. Only byte-exact copies are committed here.
