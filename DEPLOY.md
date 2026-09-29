# DEPLOY.md — clasificat.ro on Cloudflare Pages via GitHub (29.09.2026)

Repo: https://github.com/iuliagarbacea/clasificat (private). Deploy folder: `site/`.
Build pipeline stays local (`build/build-ghid.js` → `build-seo.js` → `bump-assets.js`); commit the output, push, done.
`build/make-zip.js` is fallback only.

## Migration from the upload-only project (one time)

Old project `clasificat` (direct upload, clasificat.pages.dev) cannot be switched to Git → new project, then move domains.

**Phase A — new project (Iulia, dashboard)**
1. Workers & Pages → Create → **Pages tab** (not Workers) → Connect to Git → repository `clasificat`.
2. Project name `clasificat-site` · production branch `main` · framework **None** · build command **empty** · output directory **`site`** · Save and Deploy.
3. Co-founder verifies https://clasificat-site.pages.dev against the live site before any domain move.

**Phase B — move domains (Iulia, dashboard; no manual DNS edits)**
4. Old project `clasificat` → Custom domains → ⋯ → Remove: `clasificat.ro`, then `www.clasificat.ro`. This detaches only; DNS records stay.
5. New project `clasificat-site` → Custom domains → Set up a custom domain → `clasificat.ro` → Cloudflare offers to update the existing CNAME → confirm. Repeat for `www.clasificat.ro`.
6. Co-founder verifies root 200, www 301 → root, kit pages still noindex. Old project can then be deleted.

Expected downtime: under a minute while the new project's domain goes Active.
