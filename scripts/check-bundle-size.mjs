import { readFile } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'

const budgets = {
  'dist/index.cjs': 2100,
  'dist/index.js': 2500,
}

for (const [path, budget] of Object.entries(budgets)) {
  const bytes = gzipSync(await readFile(path)).byteLength
  if (bytes > budget) {
    throw new Error(
      `${path} is ${String(bytes)} gzip bytes; budget is ${String(budget)}`,
    )
  }
  process.stdout.write(`${path}: ${String(bytes)} gzip bytes\n`)
}
