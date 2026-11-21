# Release images

anypress.io runs on the Hostinger VPS under Coolify (app `anypress-site`). The server never builds it:

1. `.github/workflows/image-app.yml` builds the image on GitHub. On a pull request it builds it and starts it to check
   it answers on port 3000.
2. On `main` it publishes `ghcr.io/otaku-solutions/anypress-site:sha-<commit>` and moves the branch
   `release/anypress-site` to that commit.
3. Coolify deploys from `release/anypress-site` with `release/anypress-site.Dockerfile` and "Include source commit in
   build" on, so a deploy only downloads the image that already exists.

Runtime settings (`AB_SUPABASE_URL`, `AB_SUPABASE_KEY`) come from Infisical `otaku-internal`, `prod`, `/anypress-site`.
