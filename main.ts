// GTA VI Trophy Guide — entrypoint (Node 22, standard library only).
// Copies app/ and screenshots/ from this repository to the output directory
// and writes /output/dossier.json with buildDossier from the kit's library.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function copyTree(name: string): void {
  const src = join(repoRoot, name);
  const dst = join(outDir, name);
  if (!existsSync(src)) throw new Error('missing in repository: ' + name);
  rmSync(dst, { recursive: true, force: true });
  cpSync(src, dst, { recursive: true });
}

// The entry must hand in a guide that opens: refuse early when the page is gone.
function requireIndex(): void {
  const index = join(repoRoot, 'app', 'index.html');
  if (!existsSync(index)) throw new Error('missing in repository: app/index.html');
}

mkdirSync(outDir, { recursive: true });
requireIndex();
copyTree('app');
copyTree('screenshots');
// A stale dossier from an earlier run must never survive: buildDossier writes
// fresh bytes below, and the scorer compares byte for byte.
rmSync(join(outDir, 'dossier.json'), { force: true });
const dossier = buildDossier(outDir, caps);
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log('wrote dossier.json (' + dossier.length + ' bytes) to ' + outDir);
