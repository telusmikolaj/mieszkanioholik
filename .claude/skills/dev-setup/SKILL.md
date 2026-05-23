---
name: dev-setup
description: Pierwsza konfiguracja środowiska deweloperskiego Mieszkanioholika (Astro + Supabase local + Cloudflare). Pokazuje krok po kroku jak skopiować env, uruchomić lokalny stack Supabase, wyłączyć email-confirmation w Studio, wygenerować Database types i odpalić dev server. Użyj przy pierwszym uruchomieniu projektu lub po sklonowaniu na świeżą maszynę.
disable-model-invocation: true
---

# /dev-setup — pierwsza konfiguracja środowiska

Cel: doprowadzić świeżo sklonowany / sklonowany-i-zbootstrapowany projekt do działającego `npm run dev` z lokalnym Supabase i poprawnymi typami Database.

## Sprawdź stan początkowy

```bash
test -f .dev.vars && echo ".dev.vars: EXISTS" || echo ".dev.vars: MISSING"
test -d supabase && echo "supabase/: EXISTS" || echo "supabase/: MISSING"
test -f src/db/database.types.ts && echo "Database types: EXISTS" || echo "Database types: MISSING"
which supabase || echo "supabase CLI: brak (użyj npx)"
docker info >/dev/null 2>&1 && echo "Docker: OK" || echo "Docker: NIE DZIAŁA (Supabase local wymaga Dockera)"
```

Jeśli Docker nie działa — przerwij i poproś użytkownika o uruchomienie Docker Desktop. Supabase local nie wystartuje bez Dockera.

## Krok 1: skonfiguruj env

Cloudflare lokalnie czyta **`.dev.vars`** (nie `.env`). Skopiuj template:

```bash
cp .env.example .dev.vars
```

Otwórz `.dev.vars` i wklej wartości z lokalnego Supabase (które pojawią się w kroku 2). Na razie zostaw placeholdery — wrócimy tu po `npx supabase start`.

## Krok 2: uruchom lokalny Supabase

```bash
npx supabase init   # jeśli supabase/config.toml jeszcze nie istnieje (pomiń jeśli istnieje)
npx supabase start  # boots Postgres + GoTrue + Studio (wymaga Dockera)
```

Komenda wypisze blok credentials, w tym:
- `API URL: http://127.0.0.1:54321` → wklej do `SUPABASE_URL` w `.dev.vars`
- `anon key: eyJhbGciOi...` → wklej do `SUPABASE_KEY` w `.dev.vars`
- `Studio URL: http://127.0.0.1:54323` — przyda się w następnym kroku

## Krok 3: wyłącz email confirmation w Studio (tylko local dev)

Otwórz **http://127.0.0.1:54323** w przeglądarce:
1. **Authentication** → **Providers** → **Email**
2. Toggle **Confirm email** → **OFF**
3. **Save**

Powód: lokalny SMTP nie jest skonfigurowany, więc każda rejestracja zawisałaby na nieotrzymanym mailu potwierdzającym. Ten toggle dotyczy WYŁĄCZNIE lokalnej instancji — produkcja w `mieszkanioholik` jest osobnym projektem Supabase z włączonym confirmation.

## Krok 4: wygeneruj Database types

Bez tego `src/middleware.ts` / `src/lib/supabase.ts` / `src/pages/auth/confirm-email.astro` mają 20 `@typescript-eslint/no-unsafe-*` errorów (Supabase client zwraca `any` w trybie generic).

```bash
mkdir -p src/db
npx supabase gen types typescript --local > src/db/database.types.ts
```

Potem zaktualizuj `src/lib/supabase.ts`:

```ts
import type { Database } from "@/db/database.types";
// ...
return createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, { ... });
```

I powtórz przy każdej zmianie schematu (lub po `npx supabase db reset` / nowej migracji).

## Krok 5: sync Astro types i pierwsze odpalenie

```bash
npx astro sync   # generuje typy z astro.config + env.d.ts
npm run dev
```

Jeśli wszystko OK — terminal pokaże `http://localhost:4321/`. Otwórz w przeglądarce.

## Krok 6: weryfikacja smoke testowa

W innym terminalu, z tego samego cwd:

```bash
npm run lint    # po wygenerowaniu Database types powinno być 0 errorów
npx astro check # type check — 0 errorów (4 deprecation hints w eslint.config.js to OK)
npm audit       # 0 vulnerabilities (overrides yaml/ws w package.json są load-bearing)
```

Jeśli `npm run lint` wciąż pokazuje `no-unsafe-*` errory — wróć do Kroku 4, prawdopodobnie zapomniałeś podpiąć `<Database>` w `createServerClient`.

## Co dalej

- Pierwsze migracje: `supabase/migrations/YYYYMMDDHHmmss_<nazwa>.sql` (timestamp prefix obowiązkowy).
- Po każdej migracji: `npx supabase db reset && npx supabase gen types typescript --local > src/db/database.types.ts`.
- Pierwszy `git init` + commit (skill nie zarządza git — to świadoma decyzja użytkownika kiedy zacząć trackować historię).

## Failure modes

| Objaw | Przyczyna | Fix |
|---|---|---|
| `supabase start` zawisa na "Pulling images" | wolny pull / Docker bez sieci | poczekaj lub `docker pull supabase/postgres:15.8.1.060` ręcznie |
| `EADDRINUSE :54321` przy `supabase start` | poprzedni instance zombie | `npx supabase stop` lub `docker ps` + `docker stop <id>` |
| `npm run dev` → "SUPABASE_URL is undefined" | `.dev.vars` nie istnieje lub puste | wróć do Kroku 1+2 |
| Email-magic-link rejestracja zawisa | email confirmation NIE wyłączone | wróć do Kroku 3 |
| `gen types` → "Cannot find project" | `npx supabase start` nie działa lub stoppped | `npx supabase status` żeby sprawdzić |
