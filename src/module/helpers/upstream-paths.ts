import { SYSTEM } from '../config/system.js';

/**
 * Data made under upstream `sra2` points its images at `systems/sra2/...`.
 * This fork installs as its own system id, so those files live under
 * `systems/<SYSTEM.id>/...` instead, and the images break when such data is
 * brought in: a Bulk Tasks export, an upstream compendium, an imported world
 * item. The assets themselves are the same files at the same relative paths.
 *
 * The rewrite runs from the documents' `migrateData`, which Foundry applies
 * both when a stored document is loaded and when a new one is created, so it
 * covers data already in a world as well as data imported from now on.
 */
const UPSTREAM_PREFIX = 'systems/sra2/';
const OWN_PREFIX = `systems/${SYSTEM.id}/`;

/** `systems/sra2/x.svg` → `systems/<id>/x.svg`; anything else is returned as is. */
export function rewriteUpstreamPath<T>(path: T): T {
  if (OWN_PREFIX === UPSTREAM_PREFIX) return path;
  if (typeof path !== 'string') return path;
  // A leading slash is accepted by Foundry for the same file.
  const lead = path.startsWith('/') ? '/' : '';
  const rest = lead ? path.slice(1) : path;
  if (!rest.startsWith(UPSTREAM_PREFIX)) return path;
  return `${lead}${OWN_PREFIX}${rest.slice(UPSTREAM_PREFIX.length)}` as T;
}

function rewriteEffects(effects: unknown): void {
  if (!Array.isArray(effects)) return;
  for (const effect of effects) {
    if (!effect || typeof effect !== 'object') continue;
    if ('img' in effect) effect.img = rewriteUpstreamPath(effect.img);
    // Pre-v12 effects stored the image as `icon`.
    if ('icon' in effect) effect.icon = rewriteUpstreamPath(effect.icon);
  }
}

/** Rewrites an Item source in place: its image and its effects' images. */
export function rewriteItemSource(source: any): any {
  if (!source || typeof source !== 'object') return source;
  if ('img' in source) source.img = rewriteUpstreamPath(source.img);
  rewriteEffects(source.effects);
  return source;
}

/**
 * Rewrites an Actor source in place: its image, its prototype token, its
 * effects and its embedded items.
 */
export function rewriteActorSource(source: any): any {
  if (!source || typeof source !== 'object') return source;
  if ('img' in source) source.img = rewriteUpstreamPath(source.img);
  const texture = source.prototypeToken?.texture;
  if (texture && typeof texture === 'object' && 'src' in texture) {
    texture.src = rewriteUpstreamPath(texture.src);
  }
  rewriteEffects(source.effects);
  if (Array.isArray(source.items)) source.items.forEach(rewriteItemSource);
  return source;
}
