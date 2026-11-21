# What Coolify deploys for anypress-site: the image GitHub Actions built for this commit (README.md).
ARG SOURCE_COMMIT
FROM ghcr.io/otaku-solutions/anypress-site:sha-${SOURCE_COMMIT}
