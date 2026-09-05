import { readFile } from 'node:fs/promises'

const esm = await readFile('dist/index.js', 'utf8')
for (const dependency of ['react', 'react-dom', '@floating-ui/react-dom']) {
  if (
    !esm.includes(`from "${dependency}`) &&
    !esm.includes(`from '${dependency}`)
  ) {
    throw new Error(`${dependency} is not visibly externalized in ESM output`)
  }
}
if (esm.includes('node_modules/react/')) {
  throw new Error('React implementation was bundled')
}
process.stdout.write('Runtime externals verified.\n')
