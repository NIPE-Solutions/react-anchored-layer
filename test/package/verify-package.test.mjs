import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { test } from 'node:test'

const projectRoot = resolve(import.meta.dirname, '../..')
const packageManifest = JSON.parse(
  readFileSync(join(projectRoot, 'package.json'), 'utf8'),
)
const consumerFiles = [
  'consumer.mjs',
  'consumer.cjs',
  'assert-consumer.cjs',
  'consumer-types.tsx',
  'consumer-types.cts',
]
const consumers = [
  {
    name: 'React 18.3',
    react: '18.3.1',
    reactTypes: '18.3.31',
    reactDomTypes: '18.3.7',
  },
  {
    name: 'React 19',
    react: '19.2.8',
    reactTypes: '19.2.18',
    reactDomTypes: '19.2.7',
  },
]

function runConsumer(fixture, filename) {
  const result = spawnSync(process.execPath, [filename], {
    cwd: fixture,
    encoding: 'utf8',
  })
  assert.ifError(result.error)
  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.equal(result.stderr, '', `${filename} emitted a server warning`)
  assert.equal(result.stdout.trim(), 'consumer contracts verified')
}

function compileConsumer(fixture, moduleResolution) {
  const config = {
    compilerOptions: {
      strict: true,
      exactOptionalPropertyTypes: true,
      skipLibCheck: false,
      noEmit: true,
      jsx: 'react-jsx',
      target: 'ES2022',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      module: moduleResolution === 'NodeNext' ? 'NodeNext' : 'ESNext',
      moduleResolution,
      types: ['react', 'react-dom'],
    },
    files:
      moduleResolution === 'NodeNext'
        ? ['consumer-types.tsx', 'consumer-types.cts']
        : ['consumer-types.tsx'],
  }
  writeFileSync(join(fixture, 'tsconfig.json'), JSON.stringify(config))
  return spawnSync(
    process.execPath,
    ['node_modules/typescript/bin/tsc', '--project', 'tsconfig.json'],
    { cwd: fixture, encoding: 'utf8' },
  )
}

test('packed package preserves the published consumer contract', async (t) => {
  const scratch = mkdtempSync(join(tmpdir(), 'anchored-layer-package-'))
  try {
    const suppliedTarball = process.env.ANCHORED_LAYER_PACKAGE_TARBALL
    const tarball = suppliedTarball
      ? resolve(suppliedTarball)
      : join(
          scratch,
          JSON.parse(
            execFileSync(
              'npm',
              ['pack', '--json', '--pack-destination', scratch],
              {
                cwd: projectRoot,
                encoding: 'utf8',
                env: { ...process.env, NPM_CONFIG_USERCONFIG: '/dev/null' },
              },
            ),
          )[0].filename,
        )

    await t.test(
      'archive manifest and ten public files satisfy the tarball budget',
      () => {
        const size = statSync(tarball).size
        assert.ok(size <= 15_000, `tarball is ${String(size)} bytes`)
        const archiveFiles = execFileSync('tar', ['-tzf', tarball], {
          encoding: 'utf8',
        })
          .trim()
          .split(/\r?\n/)
          .sort()
        assert.deepEqual(archiveFiles, [
          'package/CHANGELOG.md',
          'package/LICENSE',
          'package/README.md',
          'package/dist/core.css',
          'package/dist/index.cjs',
          'package/dist/index.d.ts',
          'package/dist/index.js',
          'package/dist/styles.css',
          'package/dist/theme.css',
          'package/package.json',
        ])
        const archivedManifest = JSON.parse(
          execFileSync('tar', ['-xOzf', tarball, 'package/package.json'], {
            encoding: 'utf8',
          }),
        )
        assert.equal(archivedManifest.name, packageManifest.name)
        assert.equal(archivedManifest.version, packageManifest.version)
      },
    )

    for (const consumer of consumers) {
      await t.test(
        `${consumer.name} installed consumer`,
        async (consumerTest) => {
          const fixture = join(scratch, `react-${consumer.react}`)
          mkdirSync(fixture)
          writeFileSync(
            join(fixture, 'package.json'),
            JSON.stringify({ private: true, type: 'module' }),
          )
          execFileSync(
            'npm',
            [
              'install',
              '--ignore-scripts',
              '--no-audit',
              '--no-fund',
              '--package-lock=false',
              tarball,
              `react@${consumer.react}`,
              `react-dom@${consumer.react}`,
              'typescript@6.0.3',
              `@types/react@${consumer.reactTypes}`,
              `@types/react-dom@${consumer.reactDomTypes}`,
            ],
            {
              cwd: fixture,
              stdio: 'pipe',
              env: { ...process.env, NPM_CONFIG_USERCONFIG: '/dev/null' },
            },
          )
          for (const filename of consumerFiles) {
            copyFileSync(
              join(import.meta.dirname, `${filename}.fixture`),
              join(fixture, filename),
            )
          }

          await consumerTest.test(
            'ESM exports, open SSR, and CSS resolution',
            () => {
              runConsumer(fixture, 'consumer.mjs')
            },
          )
          await consumerTest.test(
            'CommonJS exports, open SSR, and CSS resolution',
            () => {
              runConsumer(fixture, 'consumer.cjs')
            },
          )
          for (const resolution of ['NodeNext', 'Bundler']) {
            await consumerTest.test(
              `${resolution} declarations and DOM refs compile`,
              () => {
                const result = compileConsumer(fixture, resolution)
                assert.ifError(result.error)
                assert.equal(result.status, 0, result.stdout || result.stderr)
              },
            )
          }

          await consumerTest.test(
            'type validation rejects an incompatible published anchor ref',
            () => {
              const declarations = join(
                fixture,
                'node_modules/@nipe-solutions/react-anchored-layer/dist/index.d.ts',
              )
              const original = readFileSync(declarations, 'utf8')
              const incompatible = original.replaceAll(
                'RefAttributes<HTMLElement>',
                'RefAttributes<SVGSVGElement>',
              )
              assert.notEqual(
                incompatible,
                original,
                'anchor ref mutation was not applied',
              )
              try {
                writeFileSync(declarations, incompatible)
                const result = compileConsumer(fixture, 'NodeNext')
                assert.ifError(result.error)
                assert.notEqual(
                  result.status,
                  0,
                  'incompatible ref declarations compiled',
                )
                assert.match(
                  result.stdout,
                  /consumer-types\.(tsx|cts)\(\d+,\d+\): error TS(2322|2769):/,
                )
              } finally {
                writeFileSync(declarations, original)
              }
            },
          )
        },
      )
    }
  } finally {
    // Only this test-owned directory is removed; a supplied release tarball is retained.
    rmSync(scratch, { recursive: true, force: true })
  }
})
