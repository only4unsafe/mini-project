# Professional Dashboard Creator

A no-code, drag-and-drop dashboard builder. Anyone can lay out widgets on an
infinite canvas, wire up simple visual behaviors, describe a dashboard in
plain English and have it generated automatically, and export the result as
either a reusable project file or a fully standalone web app.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`).

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

No API keys, accounts, or network services are required. Everything —
including the natural-language dashboard generator — runs entirely in the
browser and persists to `localStorage`.

## What you can do

- **Infinite canvas** — pan (space + drag, or middle-click drag) and zoom
  (Ctrl/Cmd + scroll, or the zoom controls) across an unbounded workspace.
- **Drag-and-drop widgets** — drag from the widget library or click to drop
  a widget in the center of your view. Move, resize (8 handles, rotation-
  aware), and rotate every widget freely.
- **8 widget types** — Text, KPI Card, Chart (bar/line/area/pie), Table,
  Image, Button, Shape, and Gauge — each with a full set of visual, no-code
  properties in the inspector.
- **Property inspector** — edit every property of the selected widget(s):
  position, size, rotation, colors, content, chart data points, table rows
  and columns, and more.
- **Layer manager** — reorder, rename, lock, and hide widgets in a
  drag-to-reorder list.
- **Undo / redo** — a full history stack (default 80 steps) covering every
  edit, including canvas drags, resizes, and workflow changes.
- **Keyboard shortcuts** — `Ctrl/Cmd+Z` / `Shift+Z` undo/redo, `Delete`
  remove, `Ctrl/Cmd+D` duplicate, `Ctrl/Cmd+C/V` copy/paste, `Ctrl/Cmd+A`
  select all, `Ctrl/Cmd+S` save, arrow keys to nudge, `Escape` to deselect.
- **Autosave** — unsaved work is saved to a local draft a little over a
  second after you stop editing, and is offered back to you if you reopen
  the dashboard before an explicit save.
- **Templates** — six ready-made dashboards (Sales, Marketing, Project
  Tracker, Server Monitoring, E-commerce, and a blank canvas) to start from.
- **Visual workflow editor** — a node-based editor (its own tab) for wiring
  triggers (button clicked, dashboard opened) to actions (show/hide/toggle
  a widget, change text, show a message) without writing code.
- **Natural-language generation** — describe a dashboard in a sentence and
  a local, rule-based parser lays out matching widgets for you. See
  `src/features/editor/NaturalLanguage/nlEngine.js` — there is no network
  call and no external AI model involved.
- **Export as a reusable application** — export either a re-editable
  `.json` project file, or a single dependency-free `.html` file that
  renders your dashboard and replays your workflow logic with no build
  step, no CDN, and no install required to open it.
- **Import** — reopen an exported `.json` file (or one shared by someone
  else) from the home page to keep editing it.
- **Light / dark themes** — toggle from the home page or the editor
  toolbar; the choice is remembered.

## Project structure

```
src/
  app/store/            Global zustand stores (project data + undo/redo
                         history, ephemeral editor UI state, theme, toasts)
  components/            Small, reusable, presentation-only UI primitives
    fields/               Labeled form inputs used by the inspector
  features/
    home/                 Dashboard library (list, create, import) page
    editor/
      Canvas/              Infinite canvas, per-widget drag/resize/rotate
      WidgetLibrary/        Widget type registry + drag-and-drop palette
      Inspector/            Property inspector (per-widget-type fields)
      Layers/                Layer manager panel
      Toolbar/               Top editor toolbar
      Workflow/              Visual workflow editor + runtime engine
      NaturalLanguage/       Rule-based text-to-dashboard generator
      Preview/               Live, interactive dashboard preview overlay
      Shortcuts/             Global keyboard shortcut handling
      Autosave/              Debounced local-draft autosave
      widgets/               Presentational renderer for each widget type
  lib/                    Framework-agnostic helpers: geometry/rotation
                          math, persistence, templates, JSON and standalone
                          HTML export/import
```

Each feature folder is self-contained and only reaches into `lib/` and
`app/store/` — there are no circular dependencies between feature folders.

## Why these libraries

- **zustand** — the app has several independent pieces of state (project
  data + history, canvas viewport/selection, theme, toasts) that many
  unrelated components need to read and update. Zustand's selector-based
  hooks let each component subscribe to just the slice it needs without
  prop-drilling or a tree of context providers, and its plain-function
  actions made it straightforward to implement snapshot-based undo/redo
  (`beginHistoryEntry` + transient updates during drags) by hand.
- **@xyflow/react** — a visual, node-and-edge workflow editor is exactly
  the problem this library solves: draggable nodes, typed connection
  handles, pan/zoom, and a fully controlled data model that maps directly
  onto this app's own `{ nodes, edges }` representation, which is also
  what gets replayed by the plain-JS runtime engine used by the standalone
  HTML export.
- **recharts** — declarative, SVG-based charts that compose naturally as
  React components, so a chart widget's props map directly onto
  `<BarChart>` / `<LineChart>` / `<AreaChart>` / `<PieChart>` with no
  imperative chart-instance lifecycle to manage inside a draggable,
  resizable canvas widget.
- **lucide-react** — a single consistent, tree-shakeable icon set used
  everywhere (toolbar, widget library, inspector, workflow nodes) so the
  UI reads as one coherent design system rather than a mix of icon styles.
- **react-router-dom** — two real views (the dashboard library and the
  editor for a given dashboard id) with shareable, bookmarkable URLs
  (`/editor/:projectId`) instead of hand-rolled view-state switching.
- **nanoid** — small, dependency-free unique ids for widgets, workflow
  nodes, and projects.
- **clsx** — small utility for conditionally composing the many
  state-dependent Tailwind class lists used throughout (selected/locked/
  active/dark-mode variants) without string-concatenation bugs.
- **Tailwind CSS** — the whole UI is themed through a small set of CSS
  custom properties (`--surface-*`, `--ink-*`) mapped into Tailwind's
  color scale, so light/dark theming and consistent spacing/typography are
  enforced by the design tokens rather than by one-off inline styles.

## Notes on the natural-language generator

`nlEngine.js` is a deliberately local, offline, rule-based interpreter: it
splits a description into clauses, matches widget-type and chart-type
keywords, extracts labels/counts with a few regular expressions, and falls
back to the closest matching prebuilt template (or a small generic starter
layout) when nothing explicit is detected. It is intentionally isolated
behind a single `interpretPrompt(text)` function so a real AI API could be
substituted in later without touching any other part of the app.
