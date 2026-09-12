# UKNITEX: Textile Intelligence

Create a polished, desktop-first UI reference web app for a Fabric Textile Trader ERP, intended to guide design integration into an existing Next.js/Claude Code codebase. Do not implement real backend workflows. Use the attached screenshots only as directional references, not as designs to copy.

Build a cohesive, premium operational UI called “UKNITEX” with a calm ivory/white canvas, ink/navy typography, deep emerald as the primary operational color, and a restrained violet accent exclusively for AI signals. Avoid excessive rounded cards, gradients, or generic SaaS appearance. Make dense information feel composed, scannable and decision-oriented.

Include realistic seeded data and interactive navigation across these screens:
1) Executive dashboard: a decision-first overview with top KPIs, a clearly prioritised “Today needs attention” queue, a short operations flow / pipeline visualization, purchase-vs-sales trend, and a compact table for active orders. Include an “AI briefing” panel that gives specific management insights, actions and confidence/source chips, not a chatbot-first interface.
2) Procurement / Purchase orders: operations command-center list page with a title, KPI strip, tabs/status filter, search and filters, clear data table, priorities, delivery risk and row action affordances. Include a right-side AI suggestion drawer or contextual panel offering reorder recommendations grounded in sales commitments and stock coverage.
3) Inventory product detail: product identity and fabric image/placeholder, stock status summary, shelf/roll/batch table with meaningful statuses, and a right rail combining stock composition, supplier/rate context, documents and event history. Make the information hierarchy obvious.
4) Quality check workspace: split screen queue and selected inspection context, with QC overview, next actions, inspection/failed item/claim details presented as progressive disclosure rather than one overwhelming canvas.
5) AI workbench: a concise command center for management reporting and task generation. Present suggested prompts such as “Create delayed PO report”, “Identify stock exposed against confirmed sales orders”, “Prepare a supplier follow-up brief”, with previewable sources, output types (task/report/PDF) and an audit/history area. It should feel embedded in the OS and trustworthy.

Use reusable visual primitives and responsive behavior. Sidebar should be concise and group modules intelligently: Overview, Operations (Procurement, Inventory, Sales, Godown), Commercial (CRM, Accounts), Intelligence (AI workbench, Reports), and Settings. Include global search and a command palette trigger. Use labels, status language, currencies/units appropriate to Indian textile trade (₹, rolls, kg/metres). Interactions should work in prototype form: nav routes/screen switching, filters/tabs toggle, selected table rows update details, AI prompts update a generated preview state. Prioritize desktop, but ensure it does not break on tablet/mobile.

At the end, make this a visually complete working reference app, not a raw wireframe.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/080c7bc1-ea46-4293-8932-a2afd83af6af).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
