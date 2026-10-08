import { afterEach, describe, expect, it } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const tool = pathToFileURL(path.resolve(__dirname, '../../../tools/release/create-archive.mjs')).href;
const { createReleaseArchive } = await import(/* @vite-ignore */ tool);
const temporary: string[] = [];
afterEach(async () => {
  await Promise.all(temporary.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe('release archive', () => {
  it('ships built code, excludes packs and maps, and replaces an older archive', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'sra2-release-test-'));
    temporary.push(root);
    const built = path.join(root, 'dist');
    await fs.mkdir(path.join(built, 'packs'), { recursive: true });
    const manifest = { id: 'sra2-ja', version: '1.0.0-ja.1', esmodules: ['index.mjs'], styles: ['style.css'] };
    await Promise.all([
      fs.writeFile(path.join(built, 'system.json'), JSON.stringify(manifest)),
      fs.writeFile(path.join(built, 'index.mjs'), 'freshly built code'),
      fs.writeFile(path.join(built, 'style.css'), 'body {}'),
      fs.writeFile(path.join(built, 'index.mjs.map'), 'source map'),
      fs.writeFile(path.join(built, 'packs', 'private.json'), 'private pack'),
      fs.writeFile(path.join(built, 'packs.tgz'), 'private archive'),
      fs.writeFile(path.join(built, 'old.txt'), 'deleted on the next build'),
    ]);
    const archive = await createReleaseArchive(built, root);
    await fs.unlink(path.join(built, 'old.txt'));
    await createReleaseArchive(built, root);
    const entries = execFileSync('unzip', ['-Z1', archive], { encoding: 'utf8' });
    expect(entries).toContain('sra2-ja/index.mjs');
    expect(entries).not.toMatch(/packs|\.map|old\.txt/);
    expect(execFileSync('unzip', ['-p', archive, 'sra2-ja/index.mjs'], { encoding: 'utf8' }))
      .toBe('freshly built code');
  });
});
