# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

A fork of [ddvk/rmfakecloud](https://github.com/ddvk/rmfakecloud) — a self-hosted
sync cloud for reMarkable tablets — with a **complete UI redesign**. The Go
backend is upstream; the React UI (`ui/`) has been rewritten with a custom
black-and-white design system (no Bootstrap).

## Repository layout

| Path | Purpose |
| --- | --- |
| `cmd/rmfakecloud` | Main server entrypoint |
| `internal/app` | Sync protocol, device connection, hub |
| `internal/ui` | Web UI HTTP API: routes, auth middleware, handlers |
| `internal/storage` | Filesystem document/metadata storage |
| `internal/mqtt`, `internal/screenshare` | Notifications, screen sharing |
| `internal/hwr` | Handwriting recognition (MyScript) |
| `internal/integrations` | Dropbox/WebDAV integration |
| `internal/config` | Env-var based configuration |
| `ui/` | React 18 SPA (Vite + pnpm) — the fork's focus |
| `nix/package.nix`, `flake.nix` | Nix package + overlay |
| `Makefile` | Backend build orchestration (`make dist/rmfakecloud-x64`) |

## Build & dev commands

```bash
# Backend (needs Go 1.24+; on NixOS: nix-shell -p go gcc)
go build ./cmd/rmfakecloud
go test ./...

# UI
cd ui
pnpm i
pnpm dev      # Vite dev server (needs a backend to proxy API calls)
pnpm lint     # eslint — MUST stay clean
pnpm build    # produces ui/dist — REQUIRED after any UI change

# Full binary with embedded UI
make dist/rmfakecloud-x64        # or: nix build
```

**Critical:** `ui/dist` is embedded into the Go binary via `go:embed` in
`ui/assets.go`. After changing anything under `ui/`, run `pnpm build` before
building the Go binary, or your changes won't ship.

### Running a test instance

```bash
OPEN_REGISTRATION=1 JWT_SECRET_KEY=dev LOGLEVEL=WARN \
  DATADIR=/tmp/rmf-data PORT=3002 MQTT_PORT=18884 ./rmfakecloud
```

When the data dir has no users, the **first login attempt creates that user as
admin** (`CreateFirstUser`). The `/register` endpoint only accepts requests from
localhost. Run `pnpm dev` separately for UI work and log in through the dev
server (it proxies `/ui/api`).

## Architecture essentials

- **Auth is cookie-based.** Login sets an HttpOnly cookie; `apiservice.header()`
  sends no `Authorization` header — don't add one. Middleware
  (`internal/ui/middleware.go`) checks the cookie first, then falls back to a
  Bearer token (handy for `curl` testing).
- **API routes** live in `internal/ui/routes.go`; admin-only routes sit behind
  `adminMiddleware` (403 for non-admins).
- The UI polls `passcode/resets` every 5 s from `Layout.jsx` (device
  password-reset requests appear on every page).

## UI design system

The fork replaces Bootstrap with a custom system in `ui/src/styles/`:

| File | Contents |
| --- | --- |
| `tokens.css` | CSS custom properties: colors, spacing, radii, shadows, fonts |
| `base.css` | Reset, typography, grain/texture |
| `ui.css` | Reusable components (buttons, inputs, cards, modals, alerts, dropdowns) |
| `app.css` | App shell + page-specific styles |

Rules:

- **Strict black-and-white palette.** Depth comes from subtle gradients,
  layered shadows, and a grain overlay — never color.
- **Two themes**: `data-theme="paper"` (light, default) and `"ink"` (dark) on
  `<html>`, managed by `ui/src/common/useTheme.js`, persisted in localStorage
  key `rmf-theme`.
- **Fonts** (via `@fontsource/*`, see `ui/package.json`): Noto Sans (UI),
  Literata (serif body text), Forum (display/page headings), Fira Code (mono,
  used for pairing codes etc.). Do not add more.
- **Icons**: `lucide-react` only.
- **react-router-dom v5** — `Switch`/`Redirect`, not v6 `Routes`/`Navigate`.
- Pages: `Home` (recent files + upload), `Documents` (explorer with list/grid
  views, folder tree, breadcrumbs, search, selection), `Connect`, `ScreenShare`,
  `Integrations`, `Profile`, `Admin`. Desktop sidebar collapses to a mobile
  drawer.

## Conventions & gotchas

- **pdf.js worker**: imported as `import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"`
  in `ui/src/App.jsx`. `pdfjs-dist` is pinned at `4.4.168` as an **explicit**
  dependency to match `react-pdf@9.1.1` — do not remove or casually bump it;
  Vite cannot resolve the worker otherwise.
- **Guard list responses before `.map`**: on failure the API returns
  `{"error": ...}` JSON, not an array. Use `Array.isArray(list) ? list : []`
  (see `PasscodeResets.jsx`).
- **Role-gated routes** (`PrivateRoute.tsx`) redirect to `/` — do not
  reintroduce the old upstream behavior of logging the user out on a role
  mismatch; it destroyed the session cookie and could crash-loop the app.
- `handleError` (`ui/src/services/api.service.js`) clears local auth and
  reloads on any 401.
- Keep `pnpm lint` clean; `react-hooks` rules are enabled.
- Document counts use the `itemCount()` helper in
  `ui/src/pages/Documents/Listing.jsx` ("1 item" / "N items").

## Nix

`flake.nix` exposes `packages.<system>.rmfakecloud` (and `.default`) plus
`overlays.default` for swapping the nixpkgs package. `nix/package.nix` builds
the UI with `fetchPnpmDeps` (pnpm 11) then the Go module.

- After changing Go deps: update `vendorHash`.
- After changing `ui/pnpm-lock.yaml`: update the `pnpmDeps` hash.
- Set either hash to an empty string and build once; Nix prints the correct
  value ("got: sha256-...").

## Verification checklist before finishing UI work

1. `pnpm lint` passes.
2. `pnpm build` passes (regenerates `ui/dist`).
3. Go binary still builds: `nix-shell -p go gcc --run 'go build ./cmd/rmfakecloud'`.
4. Smoke-test key flows in a browser: login, folder create/delete, upload,
   PDF preview, theme toggle, mobile drawer.
