---
name: inline-report
description: Produce a report as raw markdown source inside ONE fenced code block, copy-paste ready. Use whenever the user asks for an "inline report", "report inline", "md report", "markdown report", "report in md format", "detailed report of the run", or any report they intend to copy into their own document. Covers run reports, findings reports, experiment reports, and status write-ups.
---

# Inline report

The user reads on mobile, voice-transcribes, and copies reports into their own
documents. They want the RAW MARKDOWN SOURCE, in the chat, in one block they can
select and paste. Nothing else counts as delivering.

## The one rule

Emit the entire report inside a SINGLE fenced code block, opened and closed with
four backticks, with `markdown` as the language tag.

Four backticks, not three, so any three-backtick block inside the report does not
terminate the fence early.

## Hard prohibitions

These have each failed in practice. Do not repeat them.

| Do NOT | Why it fails |
|---|---|
| Write the report to a file first | The user cannot copy from a file they cannot see. A file is not a delivery. |
| Commit or push before delivering | Detour. They asked for text in the chat. |
| Emit rendered markdown as ordinary message text | The client renders it. They get formatted output but cannot copy the SOURCE. |
| Use ASCII boxed tables (`+---+---+`) | That is not markdown. Use pipe tables. |
| Split the report across several code blocks | Breaks single-select copy-paste. |
| Add preamble, meta-commentary, or an apology essay | One short line before the block, at most. Usually zero. |

Writing a file is allowed only if the user separately asks for a file. It never
substitutes for the inline block, and it never happens first.

## Content rules

- **Answer first.** Verdict, kill conditions, or headline result in the opening
  section. Never build up to it.
- **Pipe tables** for anything tabular. Short status tables beat narration.
- **No em-dashes.** Use commas, full stops, or restructure the sentence.
- **Grade load-bearing claims** where the project uses grading: Strong,
  Indicative, Asserted. Ungraded reads as Asserted.
- **Negative results get equal prominence.** A thing that failed, was
  inconclusive, or contradicted expectation is a finding, not a footnote.
- **Report what was actually run.** Never describe output you have not inspected.
- **Plain language.** Short sentences. It gets read on a phone.

## Shape that works

Adapt the sections to the task, keep the ordering.

1. Title, plus a one-line status strip: date, seed, what is done and not done
2. Verdict or kill conditions, as a table
3. The governing result, with the mechanism in a sentence or two
4. Results by measurement, one table each, graded
5. Parameter sensitivities: where it holds, where it breaks
6. What went wrong, surprised you, or is not established
7. Discrepancies found against source documents
8. The open question or decision the user now owns

## Self-check before sending

- Is the whole report inside exactly one four-backtick fence?
- Did I avoid writing a file or committing first?
- Are all tables pipe tables?
- Any em-dashes left?
- Is the headline in the first section, not the last?
