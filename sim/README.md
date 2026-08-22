# Internal consistency stress tests

Code for the simulation brief of 22 August 2026. Findings report in
`FINDINGS.md` once experiments have run.

## Sources are NOT in this repository

This repository is public. The two canonical documents these experiments
are built against are unpublished and are deliberately excluded by
`.gitignore`. To reproduce, fetch them to `sim/sources/` and verify:

```
Part_IX_Mathematics_v3_1c.md   id 1bKsgvM820iemf7jYc17NEwerDVPtcojD   128723 bytes
Canonical_Thesis_v2_1c.md      id 1iR2RPfbB9AjQpc6HZPYmk5cocWAT91pZ   142078 bytes
```

Retrieval method: `download_file_content`, base64 decode, then check the
decoded length against Drive's reported `fileSize`. `read_file_content`
returns a representation rather than the file and has produced short
copies; do not use it.

## Status

```
+---------------------------------------+----------------------------+
| Estate generator                      | in progress                |
| Experiment 1  decomposition (H11)     | not started                |
| Experiment 2  non-additivity          | not started                |
| Experiment 3  logged corrections      | not started                |
| Experiment 4  option generation       | BLOCKED, derivation absent |
|                                       | from both sources          |
+---------------------------------------+----------------------------+
```
