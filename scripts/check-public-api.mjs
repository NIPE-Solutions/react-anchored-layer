import { pathToFileURL } from 'node:url'

export const expectedExports = [
  'Anchor',
  'AnchoredLayer',
  'Content',
  'Portal',
  'Provider',
  'Root',
]

export async function checkPublicApi() {
  const api = await import(pathToFileURL(`${process.cwd()}/dist/index.js`))
  const actual = Object.keys(api).sort()
  if (JSON.stringify(actual) !== JSON.stringify(expectedExports)) {
    throw new Error(`Unexpected public exports: ${actual.join(', ')}`)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await checkPublicApi()
  process.stdout.write(
    `Public API verified (${String(expectedExports.length)} exports).\n`,
  )
}
