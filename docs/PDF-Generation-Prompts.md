# Manit Hub — PDF Generation Prompts

Three reusable prompts. Each one tells another project/agent exactly what document to
produce, how to structure it, and how to style + render it to PDF. Hand the target
project its codebase plus one of these prompts.

**Shared rendering note (applies to all three):** produce a single self-contained
`.html` file (all CSS inline in a `<style>` block, no external fonts/scripts), then
render it to A4 PDF with headless Chrome:
`chrome --headless --disable-gpu --no-sandbox --print-to-pdf="OUT.pdf" --no-pdf-header-footer "IN.html"`.
Use a **fresh `--user-data-dir`** each run (a "crashpad" stderr line is harmless).
Verify page count/text with `pypdf` afterward. Use `@page { size:A4; margin:16–18mm }`,
`page-break-inside:avoid` on boxes/tables/timeline items, and `page-break-before:always`
for chapter/part breaks.

---

## PROMPT 1 — "The Build Story" (narrative dev history)

> **Goal:** Write a long-form narrative document titled **"<Project> — The Build Story"**
> that tells how the project was actually built, in chronological order, decision by
> decision and mistake by mistake. It is a *story*, not a reference — prose in
> justified serif body text, readable in one sitting. Audience: an engineer who wants to
> understand the reasoning and the war stories behind the codebase.
>
> **Source of truth:** derive the timeline from the **git commit history** (`git log`
> with dates), the actual code, config files, and any existing docs. Every claim must be
> traceable to a real commit, file, or decision. Do not invent features that aren't in
> the repo.
>
> **Structure (adapt chapter list to the project):**
> 1. A **cover page**: crest/emoji, title, one-paragraph subtitle describing the app,
>    a gradient rule, a meta line (development window + commit count + live URLs), and a
>    2-column **table of contents** listing every chapter.
> 2. Group chapters into **Parts** (e.g. "Part I — Before any code", "Part II —
>    Foundations", "Part III — Building the product", "Part IV — Real-time and reality",
>    "Part V — Native/structure/security", "Part VI — Reflection"). Each Part gets a small
>    uppercase gold kicker label.
> 3. Chapters (~15–20), numbered, each opening with a one-sentence italic **lead**. Cover:
>    the idea/motivation; the process decided up front; **stack choices each against a
>    named rejected alternative in a table** (Layer | Chosen | Rejected | The actual
>    reason); designing the database; writing the backend conventions; day-one deployment
>    war; each major feature wave; the **hardest bugs told in depth** (problem → root
>    cause → fix → lesson); any infra migrations; the real design mistakes and how they
>    were fixed *durably* (including fixes that didn't stick the first time); security
>    hardening; the frontend as it ended up.
> 4. A **"Lessons learned"** chapter: the whole story compressed to ~10 numbered lines.
> 5. An **Appendix — full timeline**: a commit-log-resolution timeline (date chip on the
>    left, bold-lead description on the right, cross-referencing chapter numbers).
> 6. A centered footer noting companion documents and a "built by students, for students"
>    style disclaimer if relevant.
>
> **Voice & devices:** honest and reflective — document the corrections in public rather
> than hiding them ("the corrections taught more than the choices did"). Use recurring
> **colored callout boxes** with uppercase tag labels:
> - `.problem` (crimson, left border) — "Problem — …"
> - `.fix` (green) — "Fix — …"
> - `.why` (navy) — "Why …?" rationale boxes
> - `.lesson` (gold) — the takeaway
> Include short `<pre><code>` snippets only where a snippet *is* the point (e.g. the
> offending index declaration and its corrected form).
>
> **Design system:** serif body (Georgia/Times) at ~11.5pt, justified, line-height 1.6;
> sans-serif (Segoe UI/Arial) for all headings, tables, boxes, timeline. Palette:
> navy `#1e4f92`, crimson `#bb2735`, gold `#bd8a1e`, ink `#1c2330`, green `#157a42`.
> Auto-numbered headings via CSS counters (`h2` shows "N · Title" with the number in
> crimson; `h3` shows "N.M"). Navy table headers with white text, zebra rows. A
> flex-based timeline with a crimson date column and a left-ruled body column.
>
> Output one self-contained HTML file, then render to A4 PDF as described above.
> Target length ~15–20 printed pages.

---

## PROMPT 2 — "Database Schema Reference" (compact data dictionary)

> **Goal:** Produce a **"<Project> — Database Schema Reference"** PDF: a dense,
> scannable data dictionary of every database collection/table, generated directly from
> the model definitions (e.g. `backend/models/*.js` Mongoose schemas). This is a
> reference, not prose — tables do the talking.
>
> **Source of truth:** read every model file. For each field capture: name, type,
> whether required, and constraints/notes (enums, defaults, regex/validators, min/max,
> `select:false`, references to other collections, whether indexed). Also capture
> schema-level indexes, pre/post hooks, instance methods, and virtuals.
>
> **Structure:**
> 1. **Cover page** (vertically centered): app name, subtitle
>    ("Database Schema Reference — <DB> Collections"), a row of **pills**
>    (e.g. "21 collections", "MongoDB + Mongoose", "Multi-tenant by University",
>    "Generated <month year>"), and a meta line pointing at the source path.
> 2. **Overview page:** a yellow **conventions note** (implicit `_id`, `createdAt`/
>    `updatedAt` timestamps, the multi-tenant `university` reference, `*` = required,
>    `ObjectId→X` = reference), then a **summary table** of every model
>    (Model | Collection | Domain | Purpose). Force a page break after.
> 3. **One section per domain** (Identity & Tenancy, Marketplace, Chat, Academics,
>    Campus Life, Infra/Moderation…), each as a white-on-navy section banner (`h2.section`).
> 4. **One block per collection:** an `h3.collection` heading with the Model name and the
>    raw collection name floated right in monospace; a one-line italic **purpose**; a
>    **field table** (Field | Type | Constraints/Notes) — required fields marked with a
>    red `*`, types in blue monospace, `ObjectId→X` for refs; then a navy-left-border
>    **`.extras`** box listing **Indexes**, and **Hooks & methods / virtuals** where they
>    exist. Keep each table row `page-break-inside:avoid` and repeat the table header on
>    each page (`thead { display:table-header-group }`).
> 5. A final **Relationship Map** section (in an `.extras` box): name the tenant root and
>    what references it, list what the central `User`/tenant is referenced by, call out
>    **polymorphic links** (refPath/typed-by-field) and **denormalized counters** kept in
>    sync by controllers.
>
> **Design system:** compact sans-serif (Segoe UI/Arial) at ~10.5px, line-height 1.45.
> Palette: deep navy `#0f2c59`, required-red `#b42318`, type-blue `#175cd3`, muted
> `#4a5a76`. Light zebra rows (`#f7f9fd`), light-blue table headers (`#e8eef8`) with navy
> uppercase text. Pills `#eef3fb`/border `#c9d8ef`. `.extras` boxes with a navy left
> border on a `#f4f7fc` background. Yellow conventions note (`#fffaeb`/`#f5deac`).
>
> Output one self-contained HTML file → A4 PDF (~8–12 pages). Field names, types, enums,
> defaults, and index definitions must exactly match the code.

---

## PROMPT 3 — "The Complete Developer Study Guide" (deep interview-grade reference)

> **Goal:** Write **"<Project> — The Complete Developer Study Guide"**: an exhaustive,
> book-length technical reference that explains *every* function, *every* library, and
> *every* design decision "the way a top-tier SDE-1 interview would interrogate it." This
> is the deepest of the three documents — combine narrative explanation, reference tables,
> code snippets, and interview Q&A. Audience: someone who must be able to defend every
> line of the codebase in an interview.
>
> **Source of truth:** the entire codebase — every backend endpoint file, every shared
> module (config, middleware, utils, socket, jobs), every model, and the key frontend
> functions. Read them; do not summarize from memory.
>
> **Structure (~21 numbered parts + appendix), each part on its own page:**
> 1. The product — what it is and why it exists (include a "30-second pitch" paragraph and
>    a "problem on campus → feature → interesting engineering bit" table).
> 2. The 10,000-foot architecture — a monorepo tree, an ASCII **runtime diagram**
>    (clients → API server → DB, with uploads/push sidecars), and the non-negotiable
>    invariants (stateless auth, tenant isolation, one response envelope, graceful
>    degradation, same code everywhere).
> 3. The complete tech stack — **every** dependency (backend + frontend) in tables of
>    Library | Role | *Why it / why not the alternative*.
> 4. One codebase, two apps — how the web build and the native shell stay identical.
> 5. Backend architecture — the one-file-per-endpoint pattern and the middleware chain.
> 6. Authentication & authorization end-to-end.
> 7. Multi-tenancy / scoping.
> 8. The data layer — the ODM + connection cache; then a **complete data dictionary**
>    (all collections, field-by-field) and an **end-to-end data-flow map** (what data
>    leaves the device, its path, where it rests).
> 9. File & media storage — answer "how are the PDFs/files stored?" properly, including a
>    "why not GridFS / S3 / local disk" comparison.
> 10. Real-time chat & presence — Socket.IO deep dive.
> 11. Notifications & push (in-app + FCM).
> 12. Background jobs (cron reminders).
> 13. Feature-by-feature walkthrough (all modules).
> 14. The frontend — framework, routing, state, design system.
> 15. Gamification (points, badges, leaderboard).
> 16. Security model — threats & mitigations, plus a hardening-pass deep dive (rate
>     limiting, email verification, token-versioned revocation, CORS & mass-assignment,
>     content-moderation stack), each with "why this, not the alternative".
> 17. Deployment & infrastructure.
> 18. Performance & scaling — what breaks first and the fix.
> 19. Rapid-fire interview question bank.
> 20. **Appendix — the complete function-by-function reference:** for *every* endpoint and
>     shared function, a bordered `.fn` card with a monospace **signature**, and a small
>     key/value table covering: libraries used, what it does, step-by-step workflow, and
>     why it's built that way. Group by folder (config · middleware · utils · socket ·
>     jobs · each feature folder · frontend functions).
> 21. **Notable fixes — before → after:** the bugs that actually shipped, each framed as a
>     question with the buggy "before" and the "after" that fixed it.
>
> **Voice & devices:** teach, then interrogate. Sprinkle **interview-style Q&A boxes**
> (`.qa`, blue) with a bold **Q:** and an **A:** answer, and **"why not the alternative"**
> boxes (`.why`, red). Also `.note` (gold) and `.keyidea` (green) callouts. Use dark-themed
> `<pre><code>` blocks liberally for real code and ASCII diagrams. Use `.tag`/`.pill`
> chips for tech labels.
>
> **Design system:** sans-serif body (Segoe UI/Inter) at ~10.6pt, line-height 1.5.
> Palette: navy `#152b4c`, deep navy `#0b1a30`, crimson `#bb2735`, gold `#bd8a1e`,
> green `#1f9d57`, dark code background `#0f1b30` with light `#e7edf7` text. A **full-bleed
> gradient cover** (dark navy gradient, white title, gold rule, a row of tech chips, a
> meta line). A no-numbers nested **table of contents** page (parts in navy with crimson
> counters, sub-items indented). `h2` = 16pt with a 3px navy bottom border; `h4` in crimson.
> `.fn` function cards bordered and rounded; `.kvs` tables with a fixed-width bold navy
> label column.
>
> Output one self-contained HTML file → A4 PDF. This is the long one — expect 60+ pages.
> Completeness is the point: do not skip functions or libraries.

---

### Quick tips for the receiving project
- Feed the target its own `git log --pretty=format:'%ad %s' --date=short` for Prompt 1.
- Point Prompt 2 at the models directory; point Prompt 3 at the whole repo.
- All three share the MANIT navy/crimson/gold identity — keep it or swap the palette
  variables at the top of each `<style>` block to rebrand.
