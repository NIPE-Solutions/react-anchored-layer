import { readFile } from 'node:fs/promises'

const files = ['ci.yml', 'browser.yml', 'release.yml']
for (const file of files) {
  const source = await readFile(`.github/workflows/${file}`, 'utf8')
  if (!source.includes('permissions:'))
    throw new Error(`${file} lacks permissions`)
}
process.stdout.write('Workflow contracts verified.\n')
