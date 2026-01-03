# Aura Veracity — Architecture & Functional Review

This document summarises the project architecture, data flows, module responsibilities, important files, edge cases, and prioritized recommendations for improvements and safe extensions.

## High-level overview

- Stack: React + TypeScript + Vite frontend. UI built with shadcn-style components and Radix primitives. React Router for routing. React Query is included but used minimally (QueryClient is configured).
- Auth + storage + serverless function: Supabase (client in `src/integrations/supabase/client.ts`, serverless Edge Function in `supabase/functions/ai-detection/index.ts`).
- Core user flows: authentication (sign up / sign in), upload video, create a `detection_jobs` row, invoke the `ai-detection` function which simulates analysis and writes to `detection_results`, then frontend polls the jobs table and shows `Results`.

## Key files and responsibilities

- `src/main.tsx` — React app entry. Renders `App`.
- `src/App.tsx` — App root, sets up React Query, ThemeProvider, BrowserRouter, AuthProvider and routes.
- `src/hooks/useAuth.tsx` — Auth context implementing signUp, signIn, signOut; subscribes to `supabase.auth.onAuthStateChange` and `supabase.auth.getSession()`.
- `src/integrations/supabase/client.ts` — Supabase JS client instance. Uses a publishable key and URL. Client configured to persist sessions to localStorage.
- `src/pages/Auth.tsx` — Sign in / sign up UI that uses `useAuth`.
- `src/pages/Dashboard.tsx` — Upload page and main dashboard; handles file validation, uploads to Supabase Storage (`videos` bucket), creates `detection_jobs` row, invokes Supabase Function `ai-detection`, polls job status and navigates to results when finished.
- `src/components/dashboard/VideoUploader.tsx` — Drag-and-drop UI + file selection, progress bar and upload state.
- `src/components/dashboard/AnalysisProgress.tsx` — Visual progress & steps while analysis is running.
- `supabase/functions/ai-detection/index.ts` — Deno serverless function. Reads job from `detection_jobs` by id, updates status to `processing`, simulates AI detection (randomized), inserts a row into `detection_results`, then updates job to `completed`.
- `src/pages/Results.tsx` — Displays `detection_jobs` and `detection_results` entries for the authenticated user, shows detailed breakdown and raw logs.
- `src/hooks/use-toast.ts` — Simple in-memory toast dispatcher used by UI components.
- `src/contexts/ThemeContext.tsx` — Theme management stored in localStorage and applied as classes on the document element.

## Upload → Analysis → Results flow (sequence)

1. User selects or drops a video file in the `VideoUploader` UI.
2. `Dashboard.handleFileUpload` validates type and size (max 50MB).
3. File is uploaded to Supabase Storage in the `videos` bucket, using a path `${user.id}/${Date.now()}.${ext}`.
4. A `detection_jobs` row is inserted with `status: 'pending'` and `file_path` pointing to storage object.
5. Client invokes Supabase Function `ai-detection` with body `{ jobId }` via `supabase.functions.invoke('ai-detection', { body })`.
6. The Edge Function retrieves the job from `detection_jobs`, updates `status: 'processing'`, runs `simulateAIDetection(original_filename)` (currently random+filename heuristics), inserts a `detection_results` row, then updates job to `completed`.
7. Frontend polls the `detection_jobs` table (every ~5s, up to ~60 attempts) and navigates to `/results/:jobId` when job.status becomes `completed`.
8. `Results` page loads `detection_jobs` and `detection_results` for the authenticated user and displays the findings.

## Data model (assumed based on code)

- Table `detection_jobs` (columns used):
  - `id` (uuid/string)
  - `user_id` (string)
  - `original_filename` (string)
  - `file_path` (string)
  - `status` (string: pending|processing|completed|failed)
  - `upload_timestamp` (datetime)
  - `analysis_start_time`, `analysis_end_time` (datetime)

- Table `detection_results` (columns used):
  - `id`
  - `job_id` (foreign key to detection_jobs.id)
  - `prediction` ('FAKE'|'REAL')
  - `confidence_score` (float 0..1)
  - `visual_confidence`, `audio_confidence` (float)
  - `analysis_duration_seconds` (float)
  - `anomaly_timestamps` (JSON array)
  - `visual_analysis`, `audio_analysis` (JSON)

## Authentication flow and security notes

- The client-side Supabase key in `src/integrations/supabase/client.ts` is the publishable key (safe to include in frontend repos). However, double-check whether it is mistakenly a Service Role key. Service role keys must never be committed to a public repo.
- The serverless function reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from environment variables — this is correct for server-side operations.
- Important: Ensure RLS (Row Level Security) policies are in place for `detection_jobs` and `detection_results` if the Supabase project uses RLS. The frontend queries restrict by `user_id` in `Results` but other endpoints or the function must also enforce access rules.

## Observations about the Edge function

- The function uses `Deno.serve` and the server runtime expects Deno environment variables for Supabase keys.
- It handles CORS preflight and basic error paths.
- Simulated detection is non-deterministic and for demo; it inserts result data into `detection_results` and updates the job status.
- On errors, it tries to mark job as failed if `error.jobId` is present — but the code checks `error.jobId` on the JavaScript `Error` instance which won't include jobId by default; consider attaching jobId to the thrown error or updating job status defensively.

## UI & UX notes

- The UI provides a friendly, animated upload and analysis UX; `Dashboard` handles upload, creates job row, invokes function and polls. After `completed`, it navigates to `Results`.
- Polling approach is simple and works but has drawbacks: fixed interval, linear attempts, and no exponential backoff.
- `VideoUploader` simulates progress; actual upload progress via `supabase.storage.from(...).upload()` does not currently use resumable or progress callbacks (Supabase JS currently does not expose native progress events for browser uploads — check SDK). The simulation is OK for demo but inaccurate for large/slow networks.

## Edge cases, failure modes, and race conditions

- Upload may fail silently: `supabase.storage.from('videos').upload()` returns an error checked by code — handled.
- Race: If function is slow or fails, polling times out after ~60 attempts (~5 minutes). This is configurable but may lead to poor UX.
- If the server function fails after job insertion, the job remains `pending` — there's a timeout to consider and a process to re-run failed jobs.
- Unauthenticated requests: `Results` and `Dashboard` guard against unauthenticated users in the UI, but API-level checks + RLS should enforce ownership.
- Duplicate uploads & idempotency: If the client retries the upload, duplicate jobs and storage objects may be created. Consider idempotency tokens or client-side deduplication.
- Storage cleanup: Uploaded video objects are never garbage-collected. Consider lifecycle rules or a background cleanup job.
- Large files & streaming: The app currently limits to 50MB in the UI, but storage and function processing may fail on files larger than the function's allowed payload size.

## Quick security & privacy findings

- Confirm the key in `src/integrations/supabase/client.ts` is a public anon key and NOT a service role key. Service role keys MUST be kept secret.
- Ensure the `ai-detection` function does not leak service role keys to client-side responses or logs.
- Consider encrypting or restricting access to stored videos (e.g., signed URLs) to avoid public access if privacy is a concern.

## Prioritized recommendations (High → Low)

High priority
- Verify and, if needed, rotate Supabase keys if the repo unintentionally contains a service role key.
- Add RLS policies to `detection_jobs` and `detection_results` to ensure users can only access their own data, and ensure the server function uses the Service Role key to write results but does not expose it.
- Improve error handling in the Edge Function: attach jobId when throwing so frontend can mark jobs failed; also add retries/backoff for transient DB errors.

Medium priority
- Replace polling with a server-side push or Realtime channel (Supabase Realtime or WebSocket) to notify clients of job updates, or use Postgres triggers + realtime.
- Implement durable upload progress (if required) and more accurate UI progress for uploads.
- Add job re-queue / worker retries for failed analyses and a way to manually retry from the UI.
- Add lifecycle management for stored videos (e.g., auto-delete after X days) to control storage costs and privacy.

Low priority
- Add analytics and observability: structured logs in function, metrics for processing time and failure rates.
- Provide downloadable PDF reports and integrate more detailed export options.
- Replace the simulated AI with a real inference pipeline behind a queue (e.g., Cloud Run/Workers + GPU-backed workers) if production-grade detection is required.

## Tests and quality gates to add

- Unit tests for `useAuth` (mock supabase client) and `Dashboard.handleFileUpload` (mock storage + functions). Use Vitest or Jest.
- Integration test for the upload+job lifecycle using Supabase test project or a mocked API.
- Add an ESLint run to CI and run `vite build` in a CI job to ensure production builds succeed.

## Extension points for future features

- Swap `simulateAIDetection` with a job queue (e.g., RQ, Bull, or serverless job queue) that enqueues the video processing on worker instances.
- Add an admin UI for viewing and re-running jobs, auditing uses and attaching reasons for failed jobs.
- Add multi-tenant controls and billing if public usage is intended.

## Files reviewed during this analysis

- package.json
- src/main.tsx
- src/App.tsx
- src/hooks/useAuth.tsx
- src/integrations/supabase/client.ts
- supabase/functions/ai-detection/index.ts
- src/pages/Dashboard.tsx
- src/pages/Results.tsx
- src/pages/Auth.tsx
- src/components/dashboard/VideoUploader.tsx
- src/components/dashboard/AnalysisProgress.tsx
- src/components/SettingsPanel.tsx
- src/contexts/ThemeContext.tsx
- src/hooks/use-toast.ts

## Next steps I can take (pick any)
- Fix any accidental secrets in source; rotate keys and move secrets to env vars and CI secrets.
- Implement server-side job retries and attach clearer job failure metadata.
- Replace polling with realtime updates and add graceful backoff.
- Add tests and a basic CI config that runs lint, typecheck and build.

---

Generated by an automated deep-review run. If you want, I can implement one of the next steps above; tell me which to start with and I'll open a focused todo and implement it.