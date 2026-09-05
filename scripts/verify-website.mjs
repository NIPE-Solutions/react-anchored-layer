import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export const requiredSiteFragments = [
  'What Anchored Layer does not own',
  'Positioning is powered by Floating UI',
  'https://opensource.nipesolutions.com',
  'https://opensource.nipesolutions.com/impressum',
  'https://opensource.nipesolutions.com/privacy',
]

export async function verifyWebsite() {
  const files = await Promise.all(
    [
      'website/index.html',
      'website/src/App.tsx',
      'website/public/robots.txt',
      'website/public/sitemap.xml',
    ].map((path) => readFile(path, 'utf8')),
  )
  const source = files.join('\n')
  for (const fragment of requiredSiteFragments)
    if (!source.includes(fragment))
      throw new Error(`Website is missing: ${fragment}`)
  for (const artifact of [
    'website/dist/index.html',
    'website/dist/robots.txt',
    'website/dist/sitemap.xml',
    'website/dist/favicon.svg',
    'website/dist/og-react-anchored-layer.svg',
  ])
    await readFile(artifact)
  process.stdout.write('Website content and static artifacts verified.\n')
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href)
  await verifyWebsite()
