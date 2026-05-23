---
project: "Mieszkanioholik"
context_type: greenfield
created: 2026-05-19
updated: 2026-05-20
product_type: web-app
target_scale:
  users: small
  qps: low
  data_volume: small
timeline_budget:
  mvp_weeks: 8
  hard_deadline: null
  after_hours_only: true
checkpoint:
  current_phase: 8
  phases_completed: [1, 2, 3, 4, 5, 6, 7]
  gray_areas_resolved:
    - topic: "core pain"
      decision: "heart of MVP = data trapped + end of manual re-entry (paste→AI→record); 2nd pillar = decision paralysis (rubric+pipeline)"
    - topic: "insight"
      decision: "legality + personal context: aggregators scrape (ToS gray zone) & are generic; paste-only + private rubric + decision pipeline is a legal personal niche commercial model won't serve"
    - topic: "primary persona scope"
      decision: "single-tenant, anyone buying solo (incl. self); full data isolation; no shared access; partner sees exported list only"
    - topic: "auth model"
      decision: "OAuth-only, single provider — mainstream CONSUMER identity (explicitly NOT a developer-centric identity; GitHub working-assumption dropped 2026-05-19 per FR-001 re-challenge); concrete provider is a downstream stack decision; sign-up=sign-in; no password mgmt; flat 1-role model; unauth → redirect to login; zero public views"
    - topic: "first flow"
      decision: "paste → AI extract → acceptance gate (edit) → save → score+breakdown (5 steps); confirmed as smallest 'prove it works'"
    - topic: "timeline"
      decision: "6–8 weeks (planning: 8); user explicitly accepted longer sustained-effort timeline; MVP-too-big surfaced & accepted, not scoped down"
    - topic: "success criteria split"
      decision: "Primary: <60s + 80% fields; Secondary: short-list 5+ / ≥1 saved search / ≥60% checklist (all wk1); Guardrails: export always valid / full isolation / zero auto-save"
    - topic: "socrates round (16 FRs)"
      decision: "11 stand; 5 accepted real counters (FR-006 incommensurate criteria→OQ-1, FR-008 silent rescoring→visible NFR, FR-010 checklist quality→OQ-5, FR-011 brittle URL mapper→OQ-2, FR-013 brittle link-out→OQ-3, FR-015 hard delete→OQ-4); FR-016 PDF demoted to nice-to-have"
    - topic: "scoring model (OQ-1)"
      decision: "hard-flagged criteria = disqualifying gates; soft criteria sum to %; breakdown shows which gate cut"
    - topic: "null handling (OQ-6)"
      decision: "null field = unmet criterion (conservative), labelled 'brak danych' in breakdown"
    - topic: "one-sentence business rule"
      decision: "user-authored: app autonomously determines deal-breaker violation + soft-preference % match per listing, both with transparent per-criterion breakdown"
    - topic: "NFRs"
      decision: "≤200ms ack / visible progress >2s; no silent re-scoring; raw pasted text not persisted post-confirm; full isolation; export always valid MD; full desktop (4 browsers ×2 vers) + read-mostly mobile-web, authoring desktop-optimized"
    - topic: "socrates re-challenge (2026-05-19; FR-001/002/003/004/005/007)"
      decision: "FR-001 counter ACCEPTED (developer identity wrong for persona) → consumer-identity provider class, GitHub assumption dropped, specific provider downstream; FR-002 counter ACCEPTED → RETIRED as standalone FR (folded into Guardrails+NFR, isolation guarantee unchanged); FR-003/FR-004 re-affirmed, stand; FR-005 counter ACCEPTED → zero-auto-save scoped to CONFIRMED scored record, unconfirmed recovery-draft permitted (→ OQ-10); FR-007 counter ACCEPTED → reworded to lead with deal-breaker verdict + breakdown, disqualified flagged distinctly (aligns with resolved Business Logic)"
    - topic: "recovery-draft scope (OQ-10 partial)"
      decision: "recovery-draft persists ONLY in-progress structured/edited fields, never the raw pasted blob → privacy NFR ('raw pasted text leaves no durable, operator-accessible trace') fully preserved; FR-005 narrowed accordingly; OQ-10 remains open on: save-draft action vs transparent autosave, draft visual distinction, stale-draft retention window"
    - topic: "product framing (Phase 6)"
      decision: "product_type: web-app; target_scale.users: small (qps/data_volume ballparks → OQ-11); timeline_budget: mvp_weeks 8 (Phase-3 sustained-effort ack), hard_deadline null, after_hours_only true"
    - topic: "Non-Goals (Phase 6)"
      decision: "4 functional non-goals locked: (1) cross-user averaging / marketplace insights (Socrates 100× insight); (2) shared decks / multi-user collaboration (single-tenant lock); (3) editable pipeline / configurable checklist (FR-009/010 post-MVP); (4) versioning / price-history / decision audit-log (FR-015 post-MVP roadmap #2)"
    - topic: "pre-finalize verification pass (2026-05-20)"
      decision: "FR-005 scope KEPT (structured fields only, post-extraction; localStorage/pre-extraction explicitly rejected, storage location stays open in OQ-10); FR-008 NO score history (consistent with Non-Goal #4) + visible-notification utwardzone w linii FR; FR-015 / OQ-4 RESOLVED → soft-delete (archive), hard-delete post-MVP; FR-006 linia utwardzona o two-tier hard/soft + 'no user-assigned weights'"
    - topic: "Non-Goals expansion (+7, verification pass 2026-05-20)"
      decision: "Non-Goals rozszerzone z 4 do 11: dodatkowe — server-side scraping/URL-fetch/portal-monitoring (cross-ref FR-003), durable server-side raw paste storage (cross-ref NFR+OQ-10), AI price estimation bez prawdziwych danych transakcyjnych, user-assigned criterion weights, image/screenshot storage, native mobile/CLI/offline, GitHub-only (i ogólnie deweloperskie) OAuth (cross-ref FR-001 re-challenge); Non-Goal versioning rozszerzony o explicit 'score history per ogłoszenie'"
  frs_drafted: 15
  quality_check_status: accepted
---

# Shape Notes — Mieszkanioholik

> Greenfield. Body anticipates the 10 PRD sections in schema order so `/10x-prd`
> can map cleanly. Stack-shaped notes (if any) live under `## Forward: tech-stack`.

## Vision & Problem Statement

Dorosły kupujący własne mieszkanie lub dom wchodzi w 2–6-miesięczne okno
intensywnego przeglądania ofert i gromadzi typowo 20–50 ogłoszeń wartych
zapamiętania, rozrzuconych po Otodom, OLX, Trójmiasto.pl, nieruchomości-online
i innych portalach. Excel, notatnik i zakładki przeglądarki rozsypują się:
ręczne wpisywanie cen, metraży i dzielnic jest nudne i podatne na błędy,
porównanie 30 ofert wymaga otwarcia 30 kart, a po dwóch tygodniach kupujący
nie pamięta, czemu oznaczył daną ofertę jako wartą obejrzenia i co ją
wyróżniało. Rdzeń bólu jest dwuczęściowy: (1) dane są uwięzione w portalach i
wymagają ręcznego przepisywania, (2) decyzja ulega paraliżowi, bo uzasadnienia
giną. Bóle wspierające: na każdym etapie decyzji znikają z pamięci pytania i
akcje warte wykonania, a te same filtry trzeba wklepywać od nowa na każdym
portalu.

Insight: oczywistość problemu jest pozorna, bo istniejące rozwiązania komercyjne
(agregatory, monitory ofert) operują w szarej strefie ToS przez scraping i są
generyczne — narzucają cudze kryteria i model subskrypcyjny. Paste-only (brak
scrapingu, brak fetcha po URL) w połączeniu z prywatną, user-defined rubryką
oceny i pipeline'em decyzyjnym to legalna, osobista nisza, której komercyjny
model świadomie nie obsługuje, bo nie skaluje się jako subskrypcja. Wartość
nie leży w pozyskiwaniu ofert, lecz w przekształceniu wklejonej treści w
porównywalny, oceniony rekład prowadzony przez świadomą decyzję.

> Insight skali (Socrates probe 100×, 2026-05-19): reguła domenowa jest
> strukturalnie **per-user** (prywatne deal-breakery + prywatna rubryka +
> transparent breakdown) i jest IDENTYCZNA dla 1 i dla 10 000 użytkowników —
> produkt obsługuje wielu niezależnych użytkowników, ale logika decyzyjna
> nigdy nie jest dzielona między nimi. Naturalna pokusa
> „uśredniania / benchmarków między userami" (collaborative filtering,
> marketplace insights typu Zestimate / Otodom Insights) jest świadomie
> ODRZUCONA: to inna klasa produktu, wymagająca innego modelu prywatności i
> innego modelu biznesu; Mieszkanioholik celowo nią nie jest. Koszt operacyjny
> AI przy skali jest kwestią operacyjną poza regułą domenową — nie zmienia
> samej reguły. → kandydat do `## Non-Goals` (Faza 6).

## User & Persona

**Primary persona — Solo kupujący własne M.** Dorosły szukający własnego
mieszkania lub domu w aktywnym oknie 2–6 miesięcy, oglądający 20–50+ ofert,
mieszający portale (Otodom + OLX + Trójmiasto.pl + lokalne). Lokalizacja:
Polska, głównie duże miasta (Warszawa, Trójmiasto, Kraków, Wrocław). Działa
samodzielnie lub z partnerem, ale narzędzia używa **solo** — model dostępu
jest płaski i single-tenant, pełna izolacja danych, zero shared access.
Partner/rodzina widzą wyłącznie wyeksportowaną listę, nie konto.

Moment sięgnięcia po produkt: tuż po zobaczeniu wartej zapamiętania oferty na
dowolnym portalu — kupujący chce ją „zarchiwizować decyzyjnie” zanim zniknie z
pamięci kontekst, oraz później, gdy porównuje krótką listę i przygotowuje się
do oglądania / due diligence.

> Persona scope (single-tenant, solo) jest bindujący dla całego MVP — patrz
> `## Access Control` (Faza 2) i `## Non-Goals` (Faza 6).

## Access Control

Model wieloużytkownikowy, **płaski — dokładnie jedna rola** (właściciel
konta). Brak ról admin/member/guest. Każdy zalogowany user jest wyłącznym
właścicielem swoich danych; pełna izolacja — żaden user nie widzi danych
innego użytkownika w żadnym widoku.

- **Uwierzytelnianie:** wyłącznie OAuth z jednym providerem zewnętrznym.
  Provider musi być **mainstreamową tożsamością konsumencką** — taką, jaką
  realnie ma przeciętny kupujący mieszkanie — a **nie** tożsamością
  deweloperską (założenie „GitHub" porzucone 2026-05-19 w re-challenge
  FR-001, bo persona zwykle nie ma takiego konta). Konkretny provider jest
  decyzją kroku doboru stacku; bindująca produktowo pozostaje sama reguła
  „OAuth-only, single provider, tożsamość konsumencka". Brak email+hasło w
  MVP, brak zarządzania hasłami, brak reset-flow, brak weryfikacji e-mail.
- **Sign-up = sign-in:** pierwszy udany login providerem tworzy konto;
  kolejne logują. Brak oddzielnego flow rejestracji.
- **Route gated:** niezalogowany użytkownik trafiający na dowolny chroniony
  route (w tym deep linki do ofert) jest przekierowany do logowania. Zero
  widoków publicznych — brak landingu read-only, brak demo, brak
  publicznych ofert.
- **Macierz rola→uprawnienie:** trywialna (1 rola = pełny dostęp do
  własnych zasobów, zero dostępu do cudzych). Nie wymaga tabeli.

## Success Criteria

### Primary
- Wygenerowanie wpisu z pojedynczego ogłoszenia zajmuje użytkownikowi
  **mniej niż 60 sekund** od wklejenia do zapisu.
- **80% wygenerowanych pól strukturalnych** akceptowanych bez większych
  edycji (mierzone procentem edit-distance między propozycją AI a
  zatwierdzoną wartością).

> Te dwa razem dowodzą, że rdzeń (dane uwięzione + koniec ręcznego
> przepisywania) realnie działa: szybko i wystarczająco trafnie.

### Secondary
- Użytkownik dochodzi do short-listy 5+ ogłoszeń w ciągu pierwszego
  tygodnia używania.
- Użytkownik definiuje co najmniej 1 Saved Search w pierwszym tygodniu
  (sygnał, że feature dyskoweryjny jest używany).
- Co najmniej 60% ogłoszeń na statusie „oglądnięte" lub dalej ma
  przejście przez wszystkie checkboxy checklisty.

### Guardrails
- Eksport short-listy **zawsze** parsowalny jako poprawny markdown
  (nigdy uszkodzony plik). Dotyczy markdown jako must-have; PDF jest
  nice-to-have (FR-016) i nie podlega temu guardrailowi.
- Pełna izolacja danych: żaden użytkownik nigdy nie widzi danych innego
  użytkownika w żadnym widoku ani eksporcie.
- Zero auto-save **trwałego, ocenionego rekordu**: propozycja AI nigdy nie
  staje się trwałym ocenionym rekordem bez świadomego zatwierdzenia lub
  edycji przez właściciela konta (bramka akceptacji zawsze obecna).
  Niezatwierdzony draft roboczy może istnieć wyłącznie jako ochrona przed
  utratą danych, jest jawnie oznaczony jako roboczy i nigdy nie jest
  traktowany jako oceniony rekord (mechanizm — patrz OQ-10).

## Timeline acknowledgment

Acknowledged on 2026-05-19: 6–8-week MVP (planning number: 8 weeks)
requires sustained dedication across evenings/weekends and tolerance for
stretches where progress feels invisible; user explicitly accepted the
sustained-effort cost with eyes open. Full described MVP is larger than a
3-week first flow and requires multiple integrations (OAuth + AI
extraction) before user-visible value — this was surfaced and accepted,
not enforced.

## User Stories

### US-01: User captures a listing from pasted text

- **Given** a logged-in user with a defined scoring rubric
- **When** they paste raw listing text from any portal and confirm (or edit)
  the AI-proposed structured fields
- **Then** a structured, scored record is persisted with a transparent
  per-criterion breakdown

#### Acceptance Criteria
- Paste → save completes in under 60 seconds for a typical listing
- No scored record is persisted until the user deliberately confirms (zero
  auto-save of scored records); an unconfirmed draft may be retained only for
  loss-recovery and is never a scored record (see OQ-10)
- Fields drawn from closed sets are presented as constrained choices, not
  free text
- An AI summary and red flags are shown alongside the extracted fields
- The saved record displays a 0–100% score with per-criterion met/unmet
  breakdown

### US-02: User defines a rubric and sees transparent scoring

- **Given** a logged-in user
- **When** they define a personal rubric of 5–10 criteria (e.g. max price,
  min m², required amenities, max building age, districts yes/no)
- **Then** every existing and future listing is scored 0–100% against the
  rubric with a per-criterion breakdown

#### Acceptance Criteria
- Rubric supports between 5 and 10 criteria
- Editing the rubric automatically re-scores all affected listings
- The breakdown shows, per listing, which criteria are met and which are not
- Behaviour on missing/null listing fields is well-defined (see
  `## Open Questions`)

## Functional Requirements

### Authentication & data isolation
- FR-001: User can sign in via a single external OAuth provider (mainstream consumer identity, not developer-centric). Priority: must-have
  > Socrates: Counter considered (round 1): provider lock-in / excludes users without that account / over-engineered for a solo tool. Resolution: stands — single-provider OAuth is the deliberate minimal access model (sign-up=sign-in, no password mgmt).
  > Re-challenged 2026-05-19. Counter ACCEPTED: a developer-centric identity (the GitHub working-assumption) is wrong for the persona — a mainstream solo home buyer in PL cities likely has no such account, creating friction at the first screen. Resolution: the "OAuth-only, single provider" model stands, but the provider class is now constrained to a mainstream CONSUMER identity (explicitly not developer-centric); the GitHub working-assumption is dropped; the specific provider stays a downstream stack decision. Ripple: `## Access Control` updated to match.
- FR-002: ~~User can see and operate on only their own data; no user can access another user's data.~~ **RETIRED 2026-05-19** — folded into Success Criteria › Guardrails and Non-Functional Requirements, where full per-user isolation already lives verbatim. No longer a counted standalone FR; the isolation guarantee is unchanged. ID retained (not renumbered) so downstream references stay stable.
  > Socrates: Counter considered (round 1): isolation is a free consequence of per-user auth / collides with future partner share. Resolution: stands — the explicit FR is deliberately defensive; full isolation is load-bearing for the single-tenant promise.
  > Re-challenged 2026-05-19. Counter ACCEPTED: phrased as "no user can access another's data" this is a negative guardrail, not a functional capability, and full isolation already lives in Success Criteria › Guardrails and the NFRs — keeping it as an FR duplicates it. Resolution: retired as a standalone FR; the isolation guarantee is preserved (Guardrails + NFR), not weakened.

### Listing capture & AI extraction
- FR-003: User can paste raw listing text from any portal (paste-only; no scraping, no URL fetch). Priority: must-have
  > Socrates: Counter considered (round 1): high friction → abandonment / paste loses structured JSON-LD lowering accuracy. Resolution: stands — paste-only is the only legal and practical path and is the conscious product core.
  > Re-challenged 2026-05-19 (relocates-the-drudgery / dirty-input-risks-the-80%-criterion / URL-ban-over-restricts). Re-affirmed — stands as written.
- FR-004: System proposes AI-extracted structured fields (from closed sets where applicable) plus an AI summary and red flags from the pasted text. Priority: must-have
  > Socrates: Counter considered (round 1): AI red flags risk the same harm as rejected AI price-estimation / summary is filler / enum hallucination. Resolution: stands — extraction is gated by FR-005 (user confirms every field), which neutralises hallucination and over-trust risk.
  > Re-challenged 2026-05-19 (red-flags-as-AI-judgement / summary-is-gold-plating / blocked-on-OQ-7-OQ-8). Re-affirmed — stands as written.
- FR-005: User can review, edit, and complete proposed fields; no scored record is persisted without a deliberate confirm (acceptance gate, zero auto-save of confirmed scored records). An unconfirmed in-progress draft MAY be retained solely for crash/loss recovery and contains ONLY the in-progress structured/edited fields, never the raw pasted text; it is clearly marked as a draft and is never treated as a scored record. Priority: must-have
  > Socrates: Counter considered (round 1): the gate fights the <60s criterion / redundant at 80% accept-rate. Resolution: stands — zero auto-save is the core business rule (conscious confirmation), non-negotiable; <60s is a target measured with the gate in place.
  > Re-challenged 2026-05-19. Counter ACCEPTED: an absolute zero-auto-save is over-strict — a clearly-marked unconfirmed draft protects against data loss (e.g. a browser crash mid 50-listing session) without violating conscious confirmation. Resolution: FR revised — zero-auto-save is scoped to the CONFIRMED scored record (core rule intact, non-negotiable); a non-confirmed recovery-draft is permitted and is never a scored record. Exact draft/recovery mechanism → Open Question OQ-10. Ripple: Success Criteria › Guardrails and US-01 AC tightened to match.

### Rubric & scoring
- FR-006: User can define a personal scoring rubric of 5–10 criteria, each criterion explicitly typed as either a HARD constraint (deal-breaker — a single violation disqualifies the listing) or a SOFT preference (contributes to the 0–100% soft-match); criterion weights are NOT user-assigned. Priority: must-have
  > Socrates: Counter ACCEPTED: criteria are incommensurate — max-price (numeric threshold), required-amenities (boolean set), districts yes/no (allow/deny) are different rule types; collapsing them into one 0–100% is semantically questionable. Resolution: FR stands, but the scoring model for heterogeneous criterion types (how typed criteria combine into 0–100%) is now an explicit Open Question (OQ-1) and shapes `## Business Logic`.
- FR-007: System presents, per listing, the deal-breaker verdict AND the 0–100% soft-preference match, with a transparent per-criterion breakdown; a disqualified listing is unambiguously flagged as disqualified and is never represented solely by a high soft %. Priority: must-have
  > Socrates: Counter considered (round 1): one number false-precisions the decision / breakdown alone suffices. Resolution: stands — the mandatory transparent per-criterion breakdown is exactly the mitigation for over-trust in the aggregate.
  > Re-challenged 2026-05-19. Counter ACCEPTED: per the resolved Business Logic a single hard deal-breaker disqualifies regardless of the soft %, so a lone 0–100% headline misleads exactly when it matters most (a 92% listing that is actually disqualified). Resolution: FR reworded to lead with the deal-breaker verdict alongside the soft % + breakdown, disqualified listings flagged distinctly. Aligns FR-007 with the already-resolved Business Logic — no new Open Question.
- FR-008: System automatically re-scores affected listings when the rubric or a listing's fields change AND visibly notifies the user that the re-score occurred (never silent); the new verdict + breakdown replaces the prior view — per-listing score history is NOT retained (consistent with the no-audit-log Non-Goal). Priority: must-have
  > Socrates: Counter ACCEPTED: silent re-scoring changes scores "under" the user and erodes trust. Resolution: FR stands, but re-scoring must be VISIBLE — the user is made aware that scores were recalculated and why. Captured as an NFR (see `## Non-Functional Requirements`).

### Decision pipeline
- FR-009: User can move a listing through a fixed status pipeline. Priority: must-have
  > Socrates: Counter considered: a fixed 6-status pipeline imposes a workflow not every buyer follows / status vs score overlap. Resolution: stands — the fixed pipeline is the second core pillar (anti-decision-paralysis); editable pipeline is a conscious post-MVP.
- FR-010: User sees a predefined per-status checklist of conscious questions/actions. Priority: must-have
  > Socrates: Counter ACCEPTED: non-editable generic checklists won't match a user's process and will be ignored — directly threatens the "≥60% checklist completed" success criterion. Resolution: FR stands (predefined in MVP per brief), but checklist items must be tightly targeted per status, not generic; the success-criterion risk is acknowledged (OQ-5). Editability is post-MVP.

### Saved searches
- FR-011: User can define and persist a saved-search filter configuration and re-open it one-click as ready deep links to Otodom, OLX, and Trójmiasto.pl. Priority: must-have
  > Socrates: Counter ACCEPTED: portal URL query-param syntax is brittle and changes without notice — the mapper is ongoing maintenance and silent breakage; filter mapping is not 1:1 across portals. Resolution: FR stands, but mapper brittleness is acknowledged; degradation must be graceful (a changed portal still opens, dropping unmappable filters) and mapper granularity (1:1 vs per-portal filters) is an Open Question (OQ-2, already flagged in brief).

### Organize, annotate, export
- FR-012: User can browse listings with sorting and filtering. Priority: must-have
  > Socrates: Counter considered: at 20–50 listings sort/filter is over-built / score already orders the list. Resolution: stands — sort by price-per-m² and filter by status/district are decision-relevant cuts the score alone doesn't give.
- FR-013: User can open per-listing external link-outs (Street View from coordinates; Deweloperuch.pl price stats by city/district). Priority: must-have
  > Socrates: Counter ACCEPTED: Deweloperuch.pl is a brittle third-party dependency that can change/disappear, and coordinates are often absent from pasted text so Street View may have nothing to point at. Resolution: FR stands, but link-out brittleness is accepted as low-criticality — link-outs degrade gracefully (shown only when the input exists; a broken external target is tolerated, not a regression). Captured as OQ-3.
- FR-014: User can write markdown notes per listing. Priority: must-have
  > Socrates: Counter considered: overlaps with AI summary + structured fields / markdown is gold-plating. Resolution: stands — free-text notes capture the "why this one" rationale that structured fields can't; markdown is the lightweight rendering choice, not gold-plating.
- FR-015: User can edit and archive saved listings; archived listings are retrievable from an archive view but are excluded from the active short-list and scoring. Edits trigger automatic re-scoring per FR-008. Permanent deletion is post-MVP. Priority: must-have
  > Socrates: Counter ACCEPTED: permanently erasing a listing without preservation removes "why I rejected this" — directly contradicts the anti-decision-paralysis core. Resolution: FR stands, but deletion semantics (archive that preserves decision history vs permanent deletion) was an Open Question (OQ-4); archive is the recommended MVP default since it is cheap and protects the core, while versioning/price-history remains post-MVP (roadmap #2).
- FR-016: User can export the short-list to markdown (PDF export is nice-to-have). Priority: must-have (markdown); nice-to-have (PDF)
  > Socrates: Counter ACCEPTED: PDF generation plus the "always valid" guardrail is a disproportionate cost in a 6–8-week budget; markdown alone satisfies the partner-sharing need. Resolution: FR revised — markdown export is must-have and carries the export guardrail; PDF export is demoted to nice-to-have (recorded in `## Non-Goals` so it isn't silently assumed).

## Non-Functional Requirements

- Każda akcja użytkownika jest kwitowana w czasie ≤ 200 ms, a każda
  operacja trwająca dłużej niż 2 s (ekstrakcja AI, masowy re-scoring) ma
  ciągły, widoczny postęp.
- Żadna zmiana oceny nie zachodzi w sposób cichy: gdy werdykty zmieniają
  się wskutek edycji rubryki lub pól ogłoszenia, użytkownik jest
  poinformowany, że przeliczenie nastąpiło.
- Surowa wklejona treść ogłoszenia nie pozostawia trwałego śladu w
  magazynie dostępnym operatorowi po zakończeniu żądania zatwierdzającego
  rekord — trwały zostaje wyłącznie rekord strukturalny i AI summary.
- Żaden użytkownik nie może zaobserwować danych innego użytkownika w
  żadnym widoku ani w eksporcie.
- Wyeksportowana short-lista jest zawsze poprawnym, parsowalnym
  dokumentem markdown.
- Produkt jest w pełni używalny (wszystkie funkcje, sensowny layout) na
  dwóch ostatnich głównych wersjach czterech mainstreamowych przeglądarek
  desktop (Chrome, Safari, Firefox, Edge). Na mobile-web pozostaje w pełni
  używalny dla zadań typu read-mostly (przeglądanie listy, czytanie
  breakdown scoringu, dodawanie notatek, przejście statusu, przeglądanie
  saved searches); złożone zadania autorskie (pełna edycja rubryki,
  definicja saved search, eksport PDF) nie są gwarantowane na mobile-web —
  są zoptymalizowane pod desktop.

## Business Logic

Dla każdego wklejonego ogłoszenia Mieszkanioholik samodzielnie określa, czy
oferta narusza zdefiniowane przez użytkownika deal-breakery oraz w jakim
stopniu procentowym odpowiada jego soft preferences, prezentując oba
werdykty z transparent breakdown per kryterium.

Reguła konsumuje dwa wejścia użytkownika: (1) zatwierdzone pola
strukturalne ogłoszenia (tam, gdzie to możliwe — z zamkniętych zbiorów), (2)
prywatną rubrykę 5–10 kryteriów, w której każde kryterium jest oznaczone
jako twardy deal-breaker albo miękka preferencja. Wyjściem są dwa werdykty:
binarny werdykt deal-breakerów (oferta narusza / nie narusza) oraz
procentowe (0–100%) dopasowanie do miękkich preferencji — wraz z
rozbiciem per kryterium pokazującym, co jest spełnione, co nie i który
deal-breaker (jeśli) zadecydował.

Kryteria niewspółmierne łączą się następująco: naruszenie dowolnego
twardego kryterium dyskwalifikuje ofertę (werdykt deal-breakerów = naruszone,
a dopasowanie traktowane jako odcięte), niezależnie od miękkiego procentu;
miękkie kryteria sumują się do procentu dopasowania. Pole brakujące lub
puste (null) liczy się jako kryterium niespełnione — konserwatywnie, nigdy
nie zawyża dopasowania — i jest jawnie oznaczone w rozbiciu jako „brak
danych", żeby użytkownik widział, że to nieobecność danych, a nie
rzeczywiste niespełnienie.

Użytkownik napotyka regułę zaraz po świadomym zatwierdzeniu ogłoszenia
przez bramkę akceptacji: oba werdykty pojawiają się natychmiast. Werdykty
są przeliczane automatycznie i **w sposób widoczny** za każdym razem, gdy
zmieni się rubryka lub pola ogłoszenia — użytkownik jest informowany, że
ocena została przeliczona; przeliczenie nigdy nie jest ciche.

## Non-Goals

Świadome zakresy, których MVP **NIE** realizuje — zafiksowane wprost, żeby
nie wpełzły z powrotem przez decyzje podejmowane ad hoc.

- **Brak uśredniania / benchmarków między userami** (cross-user averaging,
  collaborative filtering, marketplace-insights typu Zestimate / Otodom
  Insights). Logika decyzyjna jest strukturalnie per-user; agregaty
  między-userowe to inna klasa produktu i inny model biznesu — Mieszkanioholik
  celowo nią nie jest. (Patrz Insight skali w `## Vision & Problem Statement`.)
- **Brak shared decks / współdzielonych kont / partnerstwa wewnątrz
  aplikacji.** Partner widzi wyłącznie wyeksportowaną listę (markdown); w
  aplikacji nigdy nie ma drugiego konta, dzielonej rubryki, dzielonej
  short-listy ani roli innej niż account-owner. Pełna izolacja pozostaje
  absolutna w MVP.
- **Brak edytowalnego pipeline'u statusów i konfigurowalnej checklisty.**
  FR-009 (sztywny pipeline) i FR-010 (predefiniowana checklista per status)
  są celową kotwicą anty-paraliżową — customisation jednego ani drugiego
  nie znajdzie się w MVP; pozostaje post-MVP, żeby chronić rdzeń przed
  regresją do „skonfiguruj-wszystko".
- **Brak versioningu / historii cen / audit-logu decyzji.** FR-015
  (archiwizacja zachowująca „dlaczego odrzuciłem") wystarcza w MVP; pełny
  version-history edycji ogłoszeń, historia cen w czasie, oraz audit-log
  zmian decyzji (w tym **score history per ogłoszenie**) to roadmap post-MVP
  (#2). Sprzężone z FR-008: re-score zastępuje widok, nie tworzy historii.
- **Brak scrapingu / URL-fetch / portal-monitoringu po stronie produktu.**
  Reguła wiążąca z FR-003 (paste-only): aplikacja NIGDY nie pobiera URL-a
  samodzielnie, nie crawluje portali, nie monitoruje saved-search w sposób
  autonomiczny. Saved-search deep-linki (FR-011) otwierają się przez
  kliknięcie użytkownika w jego przeglądarce — to akcja użytkownika, nie
  autonomiczne pobieranie przez produkt.
- **Brak trwałego, operator-dostępnego przechowywania surowego wklejonego
  ogłoszenia.** Cross-ref: NFR „raw pasted text leaves no durable,
  operator-accessible trace" + OQ-10 RESOLVED scope (recovery-draft =
  structured fields only, post-extraction). Po confirm trwa wyłącznie
  rekord strukturalny + AI summary; surowy paste znika.
- **Brak AI price estimation bez prawdziwych danych transakcyjnych.**
  AI nie szacuje wartości oferty z samej treści ogłoszenia ani z
  generycznych danych rynkowych. Rzetelna wycena wymaga datasetu
  rzeczywistych transakcji, którego MVP nie buduje i nie integruje.
  (Kwalifikator zostawia furtkę: z prawdziwym datasetem transakcyjnym jest
  to inny produkt do rozważenia poza MVP.)
- **Brak user-assigned criterion weights w soft criteria.** Soft criteria
  sumują się do procentu według reguły z Business Logic, BEZ
  konfigurowalnych per-criterion wag. Wagi są wektorem nawrotu
  decision-paralysis („ile waży zarobki / m²?") i nie wnoszą wartości,
  której transparent breakdown już nie daje.
- **Brak storage zdjęć / screenshotów ogłoszeń.** Aplikacja nie
  przechowuje obrazów (zdjęć z portali, screenshotów wybranych pomieszczeń).
  Pasuje do paste-only (tekst) + brak durable raw. Wizualne podglądy
  pozostają zewnętrzne — przez deep-link do oryginalnego ogłoszenia /
  Street View (FR-013).
- **Brak natywnej aplikacji mobilnej, CLI, ani offline-first.** Produkt to
  web-app desktop-primary (NFR: full desktop 4× przeglądarki, read-mostly
  mobile-web; authoring desktop-optimized). MVP nie buduje natywnego
  iOS/Android, CLI dla power-userów, ani offline-first sync.
- **Brak GitHub-only OAuth (i ogólnie deweloperskich tożsamości jako
  bramki dla persony).** Porzucone 2026-05-19 w re-challenge FR-001: GitHub
  to identity deweloperska, persona to mainstream PL home-buyer. Provider
  musi być mainstreamową tożsamością konsumencką; konkret pozostaje
  decyzją kroku doboru stacku.

## Open Questions

> Running block. `/10x-prd` mirrors these verbatim into the PRD's
> `## Open Questions`. Items flagged by the user as "wymaga uściślenia
> w sesji" plus any gaps surfaced during shaping.

1. ~~**OQ-1 — Scoring model for heterogeneous criterion types.**~~ **RESOLVED 2026-05-19:** hard-flagged criteria act as disqualifying gates (listing fails / score → 0); soft criteria sum to a percentage; breakdown shows which gate cut. Carried into `## Business Logic`.
2. **OQ-2 — Saved-search URL mapper granularity.** Otodom, OLX, Trójmiasto.pl each have distinct query-param syntax. Is filter→URL mapping 1:1 across all three, or are some filters per-portal only? What is the graceful-degradation behaviour when a portal changes its schema? Owner: user. (Flagged in brief + FR-011 Socrates.)
3. **OQ-3 — Brittle external link-out behaviour.** Deweloperuch.pl is a third-party dependency that may change/disappear; Street View needs coordinates often absent from pasted text. Confirm: link-outs shown only when input exists; broken external target tolerated (not a regression). Owner: user.
4. ~~**OQ-4 — Delete semantics: archive vs permanent deletion.**~~ **RESOLVED 2026-05-20:** archive for MVP — archived listings retrievable from an archive view, excluded from the active short-list and scoring; permanent deletion is post-MVP. Carried into FR-015.
5. **OQ-5 — Checklist quality vs the ≥60% completion criterion.** Predefined non-editable checklists risk being ignored if not tightly targeted per status. Item content per status needs definition; editability is post-MVP. Owner: user.
6. ~~**OQ-6 — Scoring behaviour on missing/null fields.**~~ **RESOLVED 2026-05-19:** a null/missing field counts as an unmet criterion (conservative; never inflates score) and is explicitly labelled "brak danych" in the breakdown. Carried into `## Business Logic`.
7. **OQ-7 — Canonical surface-area model.** One `powierzchnia_uzytkowa_m2` + separate `powierzchnia_dzialki_m2` for houses, or more granular? Conditional fields by `typ_nieruchomosci` (mieszkanie / dom / działka)? (Flagged in brief — data-model granularity, resolved downstream of `/10x-prd`.)
8. **OQ-8 — Ownership-form value set.** Include `dzierżawa_rod` alongside typical ownership forms; final closed-set membership. (Flagged in brief — closed-set definition, downstream.)
9. **OQ-9 — Saved-search activity tracking.** Should a Saved Search track last-clicked / last-modified timestamps? (Flagged in brief.) Owner: user.
10. **OQ-10 — Unconfirmed-draft / loss-recovery semantics.** Draft scope RESOLVED 2026-05-19: the recovery-draft contains only the in-progress structured/edited fields, never the raw pasted blob — the privacy NFR ("raw pasted text leaves no durable, operator-accessible trace") is fully preserved. Still open: is recovery an explicit "save draft" action or a transparent autosave of the structured-fields-in-progress? How is a draft visibly distinguished from a confirmed record? What is the retention window before a stale draft is discarded? Must not become a back-door around zero-auto-save of scored records. Owner: user.
11. ~~**OQ-11 — `target_scale.qps` and `target_scale.data_volume` ballparks.**~~ **RESOLVED 2026-05-20:** confirmed `qps: low` and `data_volume: small` at `users: small` (the natural inference). Carried into PRD frontmatter `target_scale`.

## Quality cross-check

Run 2026-05-20. All five soft-gate elements present — no gate-blocking gaps.

- **Access Control:** present (OAuth-only single-provider, mainstream consumer identity; sign-up=sign-in; flat single-role; full per-user isolation; route-gated; no public views).
- **Business Logic:** present (one-sentence rule locked; hard gates disqualify, soft criteria sum to %, transparent breakdown; null/missing = "brak danych" conservative; FR-006 / FR-007 / FR-008 lines aligned to the rule).
- **Project artifacts:** present (`context/foundation/shape-notes.md` with valid frontmatter `checkpoint:`).
- **Timeline-cost acknowledged:** present (8-week MVP, sustained-effort cost surfaced and accepted 2026-05-19; `## Timeline acknowledgment` block in body).
- **Non-Goals:** present (11 entries — 4 from Phase-6 multi-select + 7 from the 2026-05-20 pre-finalize verification pass).

`quality_check_status: accepted`.

Carried forward to `/10x-prd` for verbatim mirror into the PRD's `## Open Questions` (8 live items — owned-by-user gaps, NOT shaping gaps): OQ-2, OQ-3, OQ-5, OQ-7, OQ-8, OQ-9, OQ-10, OQ-11. Resolved-and-carried-into-body: OQ-1, OQ-4, OQ-6.

