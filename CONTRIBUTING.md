# Contributing

Thank you for contributing to React Anchored Layer.

## Development

Use Node 24 and npm 11. Install dependencies with `npm install`, make focused
changes, and run `npm run check` before opening a pull request. Browser-facing
changes must also pass `npm run test:e2e`.

Keep the package focused on positioning, portals, measurement, and mechanical
visibility. Interaction semantics belong in consuming applications.

## Releases

Run `NPM_CONFIG_USERCONFIG=/dev/null npm run release:check` before preparing the
stable release. The release policy requires exactly `1.0.0`, public access,
provenance, and the `latest` dist-tag. A supplied release tag must be `v1.0.0`.

After the release PR passes CI and is merged, manually dispatch
`.github/workflows/release.yml` from `main`. Keep this filename registered with
the npm trusted publisher, with the protected `npm` GitHub environment, and
enable its permission to stage packages. The workflow installs npm 11.19.0,
runs the full quality gate and the Chromium, Firefox, WebKit, and website
browser suites, and fails closed if the npm version lookup is unsuccessful or
the version already exists. It compares the checked-out commit, `GITHUB_SHA`,
and a fresh remote `refs/heads/main` lookup immediately before preparation and
again immediately before staging. If main moves, dispatch again from its new
commit.

The workflow packs once and uploads the retained tarball, SHA-512 checksum, and
`release-artifact.json` containing its source commit and publication policy. It
rechecks those bytes, the embedded package manifest, and the exact package file
surface, and runs the React 18 and 19 runtime, SSR, type, and CSS consumer tests
on that exact retained tarball before uploading it. It then runs
`npm stage publish` on that tarball with public access,
provenance, and `latest`. GitHub Releases do not trigger staging or publication.

Before approving the staged package, download its bytes and compare their
SHA-512 checksum to the workflow artifact. Check the source commit, package
identity, version, and provenance. Approve the exact stage through npm's 2FA
approval flow only after that review. Record the stage ID and integrity alongside
the release evidence, then create the `v1.0.0` tag and GitHub Release at that
verified source commit. This repository's workflow never publishes directly.
