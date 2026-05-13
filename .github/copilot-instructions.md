Repository: safiri-kenya-cars (Vite + React + TypeScript SPA)

Purpose
- Short note for Copilot-style assistants to operate effectively in this codebase: key commands, high-level structure, and repository-specific conventions.

Build / Test / Lint commands
- Install deps: npm ci  # or npm i
- Start dev server (hot-reload): npm run dev
- Production build: npm run build
- Production build (development mode): npm run build:dev
- Preview production build locally: npm run preview
- Lint (project): npm run lint
- Lint a single file: npm run lint -- src/components/CarCard.tsx  # npm scripts forward args to eslint
- Tests: No test script exists in package.json. If tests are added, follow the chosen test runner's conventions and add a "test" script.

High-level architecture (big picture)
- Single-page React application scaffolded with Vite + TypeScript.
- Entry: src/main.tsx -> src/App.tsx
  - App.tsx composes providers (React Query QueryClientProvider, TooltipProvider, Toaster) and sets up client-side routes via react-router-dom.
  - Routes map 1:1 to files under src/pages (e.g., / -> src/pages/Index.tsx, /cars/:carId -> src/pages/CarDetails.tsx).
- UI primitives: src/components/ui contains shared shadcn-ui / Radix-based components (button, dialog, form controls, etc.) — treat these as the canonical primitives for consistent styling.
- Shared components: src/components contains page-level and shared components (Navbar, Hero, CarCard, BookingWidget, etc.).
- Mock data / utilities: src/lib (mockCars.ts, utils.ts) contains in-repo mock data and helpers. Replace with API-backed queries when integrating a backend.
- Styling: Tailwind CSS (tailwind.config.ts) and index.css/App.css. Design tokens and utilities live in tailwind config and the ui components.
- Data fetching: @tanstack/react-query is already used (QueryClient in App). Prefer React Query patterns for server state.
- Path aliases: tsconfig.json maps "@/*" -> "./src/*"; imports use @/ to reference src.

Key conventions and patterns (repo-specific)
- Use the shared UI primitives in src/components/ui for any new UI building blocks — this avoids style drift and keeps Radix/shadcn wrappers consistent.
- Pages vs components
  - Add page-level views in src/pages. Route paths are declared in src/App.tsx — add new <Route> entries above the catch-all route as noted in App.tsx comments.
  - Reusable pieces go in src/components (or subfolders like src/components/ui for primitives).
- Imports: use the @/ alias (e.g., import X from "@/components/CarCard") instead of long relative paths.
- Linting: eslint is configured (eslint.config.js). Use npm run lint and pass file paths to lint single files.
- Local mock data: mockCars.ts is the current single source of car data; if swapping to an API, implement React Query hooks and keep mocks isolated under src/lib for storybook/test usage.
- Routing: keep route declarations centralized in App.tsx — the app expects routes to be added there in order and comments indicate to add custom routes above the "*" catch-all.

Files / configs to read first
- README.md (project overview and Lovable origin)
- package.json (scripts & deps)
- src/App.tsx (routing + providers)
- src/components/ui/* (available primitives)
- src/lib/mockCars.ts (sample data & types)
- tailwind.config.ts, tsconfig.json

AI/assistant integration notes
- This project was bootstrapped with Lovable (README references). Commits may be mirrored to a Lovable project; be cautious if editing files via an external tool that also syncs back.
- No CLAUDE.md, AGENTS.md, .cursorrules, or other assistant-specific configs were found in this project root. There is no existing .github/copilot-instructions.md prior to this file.

MCP Servers
- Playwright (configured)
  - Files added:
    - playwright.config.ts (project root): webServer configured to run `npm run dev` and baseURL set to http://localhost:5173
    - e2e/example.spec.ts: a minimal smoke test that asserts the page title.
  - Setup steps:
    1. Install Playwright and browsers: npm install -D @playwright/test && npx playwright install
    2. Run the dev server and tests locally (Playwright will start the dev server automatically via webServer):
       - Run full suite: npm run test:e2e
       - Run single test file: npm run test:e2e -- e2e/example.spec.ts
       - Run headed: npm run test:e2e:headed
       - Open HTML report after a run: npm run test:e2e:report
    3. CI: ensure you run `npx playwright install --with-deps` (or equivalent) in CI before running tests to install browser binaries.
  - Notes for assistants:
    - The Playwright config uses the Vite dev server at port 5173. If your environment uses a different port, update playwright.config.ts and the webServer url.
    - To run a single test by name using Playwright's grep: npx playwright test -g "homepage has expected title"
    - Playwright artifacts (traces, videos) are enabled on failure and on retries per config.


If anything is missing or you want more detailed instructions for testing frameworks, CI, or contributor workflow, say which area to expand.