# Release verification — 2026-09-14

Implemented:
- Verified Supabase Auth app_metadata administrator role, checked freshly on the server. Administrator pages and privileged APIs reject anonymous and ordinary users.
- Allowlisted editable tables and columns, origin and request-size checks, shared database limits for AI requests (20 recommendations / 10 minutes per network address; 30 administrator AI requests / 10 minutes per account). Raw network addresses are not stored.
- One itinerary shared by recommendation results, map, editing and account saving. Browser drafts survive reloads in the same tab; saved courses load from the owner account on other devices.
- Atomic course / stop persistence, idempotent creation, optimistic concurrency (PT409), owner RLS, explicit personal notes without fake place identifiers.
- Existing remote changes and local email-validation commit retained in the merge.

Verification:
- Production build passed.
- Four automated regression tests passed with npm test.
- Twenty-one local HTTP integration checks passed with isolated temporary identities: anonymous endpoint rejection, administrator access, ordinary-user rejection, origin and table restrictions, create / duplicate retry / reload / update / cross-owner denial / stale-update conflict. Temporary identities, courses and consent fixtures were removed.
- SQL transaction assertions verified persistence, idempotency and owner isolation; rolled back.
- Browser verified actual OpenAI recommendation generation with the existing key, title / stop order / notes editing, unchanged itinerary on map navigation and refresh, and login guidance retaining the draft.
- Local Kakao map rendered real place markers.

Applied SQL is kept in db/save-travel-course.sql and db/ai-request-limits.sql. Administrator role assignment is an Auth Admin operation, not an email hardcoded in application logic.

Remaining outside these three release tasks:
- Recommendation ranking and full condition / budget calculation remain separate product work. The UI does not present unavailable costs as real zero-cost estimates.
- Existing Kakao REST driving request returned 401 locally; actual driving-time calculation needs provider configuration. Individual Kakao map direction links remain available.
- Supabase reports leaked-password protection disabled; service-only tables intentionally have RLS enabled with no public policies.
