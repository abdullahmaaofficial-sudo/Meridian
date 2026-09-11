# Meridian — Vercel-ready structure

## What changed from the original upload
- `index.html` and `script.js` moved into `public/` so Vercel's CDN serves them
  directly, instead of FastAPI reading them off disk.
- Removed the `frontend/`-based `FileResponse` routes in `app.py` (that pattern
  doesn't fit Vercel's serverless model).
- Fixed an invalid CORS config: `allow_origins=["*"]` can't be combined with
  `allow_credentials=True` per the CORS spec — set to `False`.
- Added a dedicated `/health` route; the frontend's health check now hits that
  instead of `/`, since `/` now resolves to the static `public/index.html`.
- Replaced `vercel.json`'s stale rewrites (which pointed at a nonexistent
  `api/index.py`) with a minimal config that just raises the function's
  `maxDuration` to 30s, since translation calls can be slow.
- Capped `text` length on `/get-translation` at 1000 chars.
- Renamed `_gitignore` → `.gitignore` and expanded it.
- Added `.python-version` pinned to 3.12.

## Deploying
1. `npm i -g vercel`
2. From this folder: `vercel dev` — sanity-check it locally first.
3. Push this folder to a GitHub/GitLab/Bitbucket repo.
4. Import the repo at vercel.com/new. No build/output settings needed —
   Vercel auto-detects the FastAPI `app` instance in `app.py` and serves
   `public/` as static assets automatically.
5. After deploy, manually check: `/`, `/health`, `/get-meaning/hello`,
   `/get-translation?lang=ur&text=hello`.

## Known risk to watch
`translators` (used in `translate.py`) works by calling Google/Bing's web
front-ends, not an official API. Requests from shared cloud IPs (like
Vercel's) get blocked/rate-limited more often than from a home IP. The
existing google→bing fallback and the frontend's mock-translation fallback
soften this, but if you see frequent translation failures in production,
that's why — consider swapping to an official API (DeepL free tier,
LibreTranslate, Google Cloud Translation free quota) if reliability matters.
