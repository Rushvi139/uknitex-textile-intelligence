# UKNITEX UI enhancement

## Goal
Create a cohesive visual reference for your working staging app, using the ten screenshots and existing UKNITEX style. Preserve all information, actions, calculations, statuses, permissions, and workflow relationships.

This is a presentation redesign, not a database, authentication, or framework migration.

## Shared improvements
- Keep the ivory/white canvas, ink typography, emerald operational actions, and violet reserved for AI.
- Simplify navigation into clear module tabs and a lighter secondary task row. Distinguish navigation from status filters.
- Standardize page headings, action placement, KPI summaries, search/filter bars, status badges, tables, and detail panels.
- Use tighter table rows, clearer column priorities, readable text, and consistent alignment.
- Reduce empty framed areas; preserve empty states without letting them dominate the page.
- Keep the main next action prominent and secondary actions quieter.

## Screens covered
1. **Purchase order detail:** clear order identity and status, aligned order facts, compact line items, receipts, amendments, documents, and history.
2. **Quality approval:** compact KPI strip, prominent godown stage counts, a coherent filter bar, and a readable back-office Kanban board.
3. **Dispatch desk and dispatch book:** clearer fulfilment stages, prioritised work table, concise attention rail, and a balanced daily dispatch layout.
4. **Godown — Today's work:** prioritised goods movement and inspection tasks, clear roll/weight totals, and a quieter directory of supporting tools.
5. **Sourcing desk:** consolidate empty summaries and emphasise actual open developments and follow-ups.
6. **Product development list and detail:** compact development rows, clear supplier/colour/sample relationships, attachments, cost-sheet access, and history.
7. **Cost sheet:** group identity, yarn, knitting, processing, and shortage fields; keep totals and save/approve actions accessible without altering formulas or blank-value meaning.

## Delivery sequence
1. Build the shared navigation treatment and **Sourcing / Product Development** reference first. These screenshots cover a summary, list, detail, and form, making them a useful pilot.
2. Review the pilot before extending the same patterns to Procurement, QC, Dispatch, and Godown.
3. Verify each reference screen's controls and desktop/mobile layout; distinguish prototype actions from verified production workflows.

## Technical boundaries
- The source is `Rushvi139/Uknitex`, branch `staging`, a separate Next.js application.
- Build the visual reference in this Lovable project using its existing TanStack framework. Do not replace or modify the external repository through the GitHub API.
- Inspect relevant source UI and handler contracts before recreating screens; preserve field names, units, status meanings, and available actions.
- Production integration remains a separate step in the existing Next.js codebase. The reference does not prove that external database writes or permissions work.
- Do not add a backend or import production records for this UI-only work.

## Acceptance
- Information and available actions from the supplied screens remain represented.
- Tabs, filters, selected records, detail views, and forms work in prototype form.
- No clipped controls or overlapping content at desktop and mobile widths.
- No changes to existing business rules or external production data.