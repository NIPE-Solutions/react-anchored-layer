import { cp, mkdir } from 'node:fs/promises'

await mkdir('dist', { recursive: true })
for (const name of ['core.css', 'theme.css', 'styles.css']) {
  await cp(`src/styles/${name}`, `dist/${name}`)
}
