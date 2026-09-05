import { execFileSync } from 'node:child_process'
import { mkdirSync, renameSync } from 'node:fs'
import { resolve } from 'node:path'

const output = JSON.parse(
  execFileSync('npm', ['pack', '--json'], { encoding: 'utf8' }),
)[0]
mkdirSync('artifacts', { recursive: true })
const destination = resolve('artifacts', output.filename)
renameSync(resolve(output.filename), destination)
process.stdout.write(`${destination}\n`)
