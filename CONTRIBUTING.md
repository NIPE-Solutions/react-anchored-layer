# Contributing

Thank you for contributing to React Anchored Layer.

## Development

Use Node 24 and npm 11. Install dependencies with `npm install`, make focused
changes, and run `npm run check` before opening a pull request. Browser-facing
changes must also pass `npm run test:e2e`.

Keep the package focused on positioning, portals, measurement, and mechanical
visibility. Interaction semantics belong in consuming applications.

## Releases

Run `npm run release:check` before preparing a release. Publishing starts only
when a GitHub Release is published and its tag exactly matches the package
version (for example, `v0.1.0-alpha.0`). The workflow runs the complete quality
gate and browser matrix, rejects versions that already exist on npm, and then
publishes the public package with provenance under the `alpha` dist-tag.

The `npm` GitHub environment must be registered as the package's trusted
publisher on npm. Manual workflow dispatch verifies a tag but cannot publish.
