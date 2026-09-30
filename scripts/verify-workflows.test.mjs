import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { validateReleaseWorkflow } from './verify-workflows.mjs'

test('CI and browser workflows enforce the quality gates', async () => {
  const ci = await readFile('.github/workflows/ci.yml', 'utf8')
  const browser = await readFile('.github/workflows/browser.yml', 'utf8')
  assert.match(ci, /npm ci/)
  assert.match(ci, /npm run check/)
  for (const engine of ['chromium', 'firefox', 'webkit'])
    assert.match(browser, new RegExp(engine))
})

test('release workflow allows staging only from current main through full gates', async () => {
  assert.deepEqual(
    validateReleaseWorkflow(
      await readFile('.github/workflows/release.yml', 'utf8'),
    ),
    [],
  )
})

test('workflow requires consumer checks on the exact retained tarball before upload', async () => {
  const source = await readFile('.github/workflows/release.yml', 'utf8')
  const withoutSmoke = source.replace(
    '      - run: ANCHORED_LAYER_PACKAGE_TARBALL=./artifacts/nipe-solutions-react-anchored-layer-1.0.0.tgz npm run test:package\n',
    '',
  )
  assert.ok(validateReleaseWorkflow(withoutSmoke).length > 0)
})

test('workflow contract rejects weakened staging policy and unsafe executable additions', async () => {
  const source = await readFile('.github/workflows/release.yml', 'utf8')
  const mutations = [
    [
      'release trigger',
      source.replace(
        '  workflow_dispatch:',
        '  release:\n    types: [published]',
      ),
    ],
    [
      'wrong dispatch ref',
      source.replace(
        "github.ref == 'refs/heads/main'",
        "github.ref == 'refs/heads/feature'",
      ),
    ],
    [
      'unprotected environment',
      source.replace('environment: npm', 'environment: preview'),
    ],
    ['missing OIDC', source.replace('id-token: write', 'id-token: read')],
    [
      'unsafe concurrency',
      source.replace('cancel-in-progress: false', 'cancel-in-progress: true'),
    ],
    [
      'conditional gates',
      source.replace(
        '      - run: npm run check',
        '      - run: npm run check\n        if: false',
      ),
    ],
    [
      'skipped browser engine',
      source.replace('chromium firefox webkit', 'chromium'),
    ],
    [
      'missing website browser gate',
      source.replace('      - run: npm run test:website:e2e\n', ''),
    ],
    [
      'missing preparation guard',
      source.replace(
        '      - run: node scripts/verify-release.mjs --verify-current-main\n',
        '',
      ),
    ],
    [
      'missing final guard',
      source.replace(
        / {6}- run: node scripts\/verify-release.mjs --verify-current-main\n(?= {6}- run: npm stage)/,
        '',
      ),
    ],
    [
      'no uniqueness lookup',
      source.replaceAll('--ensure-unpublished', '--dry-run'),
    ],
    ['unverified artifact', source.replace('--verify-retained', '--dry-run')],
    [
      'wrong stage artifact',
      source.replace(
        './artifacts/nipe-solutions-react-anchored-layer-1.0.0.tgz',
        '.',
      ),
    ],
    ['wrong channel', source.replace('--tag latest', '--tag alpha')],
    ['missing provenance', source.replace('--provenance ', '')],
    [
      'unsafe extra stage flag',
      source.replace('--tag latest', '--tag latest --provenance=false'),
    ],
    ['direct publish', source + '      - run: npm publish --access public\n'],
    [
      'missing artifact upload',
      source.replace(
        'actions/upload-artifact@v7',
        'actions/download-artifact@v7',
      ),
    ],
    [
      'ignored missing artifact',
      source.replace('if-no-files-found: error', 'if-no-files-found: ignore'),
    ],
    [
      'overridden npm config',
      source.replace(
        'NPM_CONFIG_USERCONFIG: /dev/null',
        'NPM_CONFIG_USERCONFIG: /tmp/credentials',
      ),
    ],
    ['unknown shell command', source + '      - run: echo unverified\n'],
    [
      'credential override',
      source.replace(
        '    environment: npm',
        '    environment: npm\n    env:\n      NODE_AUTH_TOKEN: unsafe',
      ),
    ],
    [
      'alternate working directory',
      source.replace(
        '      - run: npm stage',
        '      - working-directory: /tmp\n        run: npm stage',
      ),
    ],
  ]
  for (const [label, mutated] of mutations) {
    assert.notEqual(mutated, source, `mutation must apply: ${label}`)
    assert.ok(validateReleaseWorkflow(mutated).length > 0, label)
  }
})

test('workflow contract rejects duplicate keys and YAML aliases', () => {
  assert.ok(
    validateReleaseWorkflow('on:\n  workflow_dispatch:\non:\n  release:\n')
      .length > 0,
  )
  assert.ok(
    validateReleaseWorkflow('jobs: &unsafe\n  release: *unsafe\n').length > 0,
  )
})
