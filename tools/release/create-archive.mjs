import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

/** Package the freshly built system, never the committed public/ bundle. */
export async function createReleaseArchive(sourceDir = path.join(ROOT, 'dist'), outputDir = ROOT) {
  const manifest = JSON.parse(await fs.readFile(path.join(sourceDir, 'system.json'), 'utf8'));
  if (manifest.id !== 'sra2-ja' || !/^[0-9][A-Za-z0-9.+-]*$/.test(manifest.version)) {
    throw new Error('Expected a versioned sra2-ja build');
  }
  for (const asset of [...manifest.esmodules, ...manifest.styles]) {
    await fs.access(path.join(sourceDir, asset));
  }

  const stage = await fs.mkdtemp(path.join(os.tmpdir(), 'sra2-ja-release-'));
  const archive = path.join(outputDir, `foundry-sra2-ja-v${manifest.version}.zip`);
  try {
    await fs.cp(sourceDir, path.join(stage, 'sra2-ja'), {
      recursive: true,
      filter(source) {
        const relative = path.relative(sourceDir, source);
        const first = relative.split(path.sep)[0];
        return first !== 'packs' && first !== 'packs.tgz' &&
          !first.startsWith('.git') && !source.endsWith('.map');
      },
    });
    await fs.copyFile(path.join(ROOT, 'ATTRIBUTION.md'), path.join(stage, 'sra2-ja', 'ATTRIBUTION.md'));
    // zip updates existing archives. Always start with a fresh one so deleted
    // assets and old compendiums cannot survive a subsequent build.
    execFileSync('zip', ['-qr', path.join(stage, 'system.zip'), 'sra2-ja'], { cwd: stage });
    await fs.mkdir(outputDir, { recursive: true });
    await fs.copyFile(path.join(stage, 'system.zip'), archive);
    return archive;
  } finally {
    await fs.rm(stage, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(await createReleaseArchive());
}
