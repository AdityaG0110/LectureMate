# LectureMate Engineering Handbook

## Project vision

LectureMate is an AI study workspace that turns lectures and learning materials into structured notes, summaries, flashcards, quizzes, mind maps, revision plans, and grounded AI conversations. Every product decision should reduce the distance between a student receiving material and confidently learning it.

Build for trust, clarity, speed, and calm. The product should feel premium while remaining accessible, responsive, and understandable.

## Folder structure

```text
app/                         # App Router routes, layouts, global styles
  dashboard/                 # Authenticated application area
components/
  dashboard/                 # Dashboard-specific modules and views
  ui/                        # Reusable primitive UI components (future shadcn wrappers)
lib/                         # Framework-agnostic helpers, adapters, and utilities
types/                       # Shared TypeScript domain types
public/                      # Static assets only
```

- Keep route files thin: they compose page-level components and own route metadata.
- Put reusable, feature-specific UI in `components/<feature>/`.
- Put shared domain logic, API clients, and pure utilities in `lib/`.
- Never import server-only code into a client component.

## Component architecture

- Prefer small, focused components with one clear responsibility.
- Use a page composition component for complex screens (for example, `UploadWorkspace`).
- Reuse layout primitives and cards rather than duplicating shell UI.
- Use server components by default. Add `"use client"` only for browser APIs, local interaction, animation state, or event handlers.
- Define component props with explicit TypeScript types; avoid untyped objects and `any`.
- Keep mock data adjacent to a component only while it is presentation-only. Move it to `lib/` when it becomes shared.

## Naming conventions

- Components: PascalCase (`UploadWorkspace.tsx`, `StudyProgressCard`).
- Files: kebab-case for files and folders (`upload-workspace.tsx`).
- React hooks: `use` prefix (`useUploadQueue`).
- Functions and variables: camelCase.
- Types and interfaces: PascalCase and domain-first (`UploadRecord`, `StudyMaterial`).
- Constants: camelCase unless truly immutable global configuration, where `UPPER_SNAKE_CASE` is acceptable.
- Route segments: lowercase kebab-case.

## Tailwind guidelines

- Use Tailwind utility classes for styling; do not introduce ad-hoc CSS files for a single component.
- Reuse theme tokens from `tailwind.config.ts`; keep brand colors anchored to indigo (`#4F46E5`) and green accent (`#22C55E`).
- Use `cn()` once added for conditional class composition; avoid deeply nested string interpolation.
- Extract repeated visual patterns into components before they become difficult to maintain.
- Prefer responsive modifiers over duplicate desktop/mobile components.
- Preserve dark-mode parity for all new surfaces, borders, text, and interactive states.

## Accessibility rules

- Use semantic elements (`button`, `nav`, `main`, `aside`, `label`, `section`) before ARIA.
- Every icon-only control must have an accessible name.
- Inputs need visible labels or an explicit `aria-label`.
- Support keyboard navigation, visible focus indicators, and Escape behavior for overlays.
- Do not convey state or errors by color alone.
- Keep text contrast at WCAG AA or better.
- Respect `prefers-reduced-motion` for non-essential animation.

## Responsive design standards

- Design mobile-first and test at 375px, 768px, 1024px, and 1440px.
- The dashboard sidebar must collapse into an accessible mobile drawer below the `lg` breakpoint.
- Avoid horizontal scrolling except for intentionally scrollable controls.
- Use fluid containers and readable line lengths; do not rely on fixed viewport heights for essential content.
- Ensure all interactions remain usable with touch targets of at least 40 × 40 pixels.

## TypeScript standards

- Keep `strict` mode enabled.
- Do not use `any`; use `unknown` with validation when input types are uncertain.
- Model product data with named types instead of parallel arrays as features mature.
- Use discriminated unions for async and workflow states (`idle | uploading | processing | complete | error`).
- Keep API request and response types separate from UI view models.
- Validate boundary data (forms, URL params, API results, webhooks) before use.

## State management strategy

- Use local React state for isolated UI interactions.
- Use URL search parameters for shareable filters, sorting, and selected views.
- Use server state and server components for persisted data once the backend exists.
- Introduce a query cache (for example, TanStack Query) only for client-side server-state requirements.
- Avoid global stores until state genuinely spans distant branches of the tree. If needed, use a small scoped store with typed selectors.
- Never store secrets, permissions, or authoritative entitlements solely in client state.

## Animation guidelines

- Motion should communicate hierarchy, feedback, or state change—not decoration alone.
- Use Framer Motion for component transitions and ensure animations are short (generally 150–400ms).
- Use transform and opacity rather than layout-triggering properties where possible.
- Keep looping animation subtle and pause/reduce it under `prefers-reduced-motion`.
- Avoid competing animations within the same visual hierarchy.

## Git commit conventions

Use Conventional Commits:

```text
feat(upload): add processing timeline
fix(dashboard): preserve sidebar state on navigation
docs: add engineering handbook
refactor(ui): extract metric card
test(auth): add session guard coverage
chore: update dependencies
```

- Write commits in imperative present tense.
- Keep each commit focused and buildable.
- Do not mix formatting-only changes with unrelated feature work.

## Branch naming

```text
feature/upload-queue
fix/dashboard-mobile-drawer
chore/dependency-updates
docs/contribution-guide
```

- Use one branch per focused deliverable.
- Rebase or merge the current main branch before requesting review, per team policy.

## File upload architecture

The current upload workspace is frontend-only. The production architecture must:

1. Request a short-lived, scoped upload URL from the application server.
2. Upload directly to object storage; never proxy large files through the web application.
3. Persist file metadata, ownership, MIME type, size, checksum, and status.
4. Scan and validate MIME type, extension, size, and quota server-side.
5. Dispatch an asynchronous ingestion job after storage confirmation.
6. Stream processing status to the client through polling, server-sent events, or websockets.
7. Store generated artifacts as separate, versioned records linked to the source material.

Never trust the browser-reported MIME type, filename, or upload size.

## AI architecture

- Treat AI as an asynchronous product pipeline, not a blocking page request.
- Ingest source material into normalized text, transcript, and structural representations.
- Chunk source content with stable identifiers and preserve page/timestamp provenance.
- Generate artifacts with structured outputs and schema validation.
- Ground chat responses in retrieved source chunks and cite the original material in the UI.
- Record model, prompt version, source version, token use, latency, and failure state for each run.
- Add rate limits, retry policy, idempotency keys, content moderation, and cost controls before production launch.
- Never expose provider API keys to the client.

## Database architecture (planned)

Use a relational database such as PostgreSQL with a typed ORM. Core entities should include:

- `users`, `organizations`, and `memberships`
- `subscriptions` and `usage_records`
- `materials`, `material_versions`, and `upload_jobs`
- `documents`, `document_chunks`, and `transcripts`
- `study_artifacts` (notes, cards, quizzes, mind maps)
- `conversations`, `messages`, and `citations`
- `revision_plans` and `study_sessions`

All tenant-owned tables must include an organization/user ownership boundary and supporting indexes. Use migrations, foreign keys, soft deletion where appropriate, and audit records for critical actions.

## Authentication architecture (planned)

- Use a proven session-based authentication provider compatible with Next.js App Router.
- Enforce authentication and authorization on the server for all dashboard routes and API endpoints.
- Implement organization-aware RBAC with least-privilege roles.
- Keep sessions secure, httpOnly, sameSite, and rotated according to provider guidance.
- Validate authorization for every material, artifact, and chat access by ownership—not just route membership.
- Add email verification, passwordless/OAuth flows, rate limiting, and account recovery before public launch.

## Code review checklist

- [ ] The change is scoped and does not alter unrelated UI or behavior.
- [ ] Types are explicit and no `any` was introduced.
- [ ] Loading, empty, success, and error states are considered.
- [ ] Desktop, mobile, dark mode, keyboard, and focus states were checked.
- [ ] Copy is clear and product-appropriate.
- [ ] Components are reused or extracted where repetition is meaningful.
- [ ] Tests and build checks pass.
- [ ] Security and data-ownership implications are addressed.

## Performance checklist

- [ ] Avoid unnecessary client components and browser-only dependencies.
- [ ] Use dynamic imports for large, infrequently visited feature modules.
- [ ] Optimize images and avoid layout shift.
- [ ] Virtualize long lists and paginate server data.
- [ ] Avoid duplicate API requests and N+1 database queries.
- [ ] Measure AI latency and use progress states for long-running jobs.
- [ ] Run a production build before merge.

## Security checklist

- [ ] Validate and authorize all server-side inputs.
- [ ] Never expose API keys, database URLs, or internal prompts to the client.
- [ ] Enforce tenant ownership for every database query and storage object.
- [ ] Use signed, short-lived upload and download URLs.
- [ ] Restrict file type, size, processing time, and user quota.
- [ ] Sanitize rendered user-generated content.
- [ ] Add rate limiting and audit logging to sensitive endpoints.
- [ ] Keep dependencies current and review security advisories.
