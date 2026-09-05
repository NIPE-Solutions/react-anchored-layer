import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { test } from 'node:test'

const projectRoot = resolve(import.meta.dirname, '../..')

test('packed package supports ESM, CommonJS, SSR, types, and CSS exports', () => {
  const packOutput = JSON.parse(
    execFileSync('npm', ['pack', '--json'], {
      cwd: projectRoot,
      encoding: 'utf8',
    }),
  )[0]
  const files = packOutput.files.map(({ path }) => path).sort()

  assert.ok(
    packOutput.size <= 15_000,
    `tarball is ${String(packOutput.size)} bytes`,
  )

  assert.deepEqual(files, [
    'CHANGELOG.md',
    'LICENSE',
    'README.md',
    'dist/core.css',
    'dist/index.cjs',
    'dist/index.d.ts',
    'dist/index.js',
    'dist/styles.css',
    'dist/theme.css',
    'package.json',
  ])

  const fixture = mkdtempSync(join(tmpdir(), 'anchored-layer-package-'))
  const tarball = join(projectRoot, packOutput.filename)
  execFileSync(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      tarball,
      'react@19.2.8',
      'react-dom@19.2.8',
      'typescript@6.0.3',
      '@types/react@19.2.18',
      '@types/react-dom@19.2.7',
    ],
    { cwd: fixture, stdio: 'pipe' },
  )

  const packageRoot = join(
    fixture,
    'node_modules/@nipe-solutions/react-anchored-layer',
  )
  const esm = execFileSync(
    'node',
    [
      '--input-type=module',
      '--eval',
      "import('@nipe-solutions/react-anchored-layer').then(m => console.log(Object.keys(m).sort().join(',')))",
    ],
    { cwd: fixture, encoding: 'utf8' },
  )
  const cjs = execFileSync(
    'node',
    [
      '--eval',
      "console.log(Object.keys(require('@nipe-solutions/react-anchored-layer')).sort().join(','))",
    ],
    { cwd: fixture, encoding: 'utf8' },
  )
  const ssr = execFileSync(
    'node',
    [
      '--input-type=module',
      '--eval',
      "import React from 'react'; import {renderToString} from 'react-dom/server'; import {AnchoredLayer as A} from '@nipe-solutions/react-anchored-layer'; console.log(renderToString(React.createElement(A.Root,null,React.createElement(A.Anchor,null,'anchor'))))",
    ],
    { cwd: fixture, encoding: 'utf8' },
  )

  assert.equal(esm.trim(), 'Anchor,AnchoredLayer,Content,Portal,Provider,Root')
  assert.equal(cjs.trim(), esm.trim())
  assert.match(ssr, /anchor/)
  for (const stylesheet of ['core.css', 'theme.css', 'styles.css']) {
    assert.ok(
      readFileSync(join(packageRoot, 'dist', stylesheet), 'utf8').length > 0,
    )
  }
})
