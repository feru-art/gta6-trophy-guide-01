// The trophy detail pane: official name, description and grade, our guide in
// our own words, its named sources, and the missable / stage / count facts.
import { countText, gradeLabel, stageOf } from '../data.js';
import { displayDescription, displayName, isHiddenBySpoiler } from '../filters.js';
import { loadNotes } from '../store.js';

export function trophyDetailHtml(trophy, ctx) {
  const { earned, settings } = ctx;
  const hidden = isHiddenBySpoiler(trophy, settings, earned);
  const notes = loadNotes();
  const note = notes[trophy.id] || '';
  const earnedNow = earned.has(trophy.id);
  return `
    <h2>${escapeHtml(displayName(trophy, settings, earned))}</h2>
    <p class="grade-line">${gradeLabel(trophy.grade)} · ${trophy.kind} · Stage ${trophy.stage} — ${escapeHtml(stageOf(trophy).title.replace(/^Stage \d+ — /, ''))}</p>
    <p><em>${escapeHtml(displayDescription(trophy, settings, earned))}</em></p>
    ${trophy.count != null ? `<p><strong>${escapeHtml(countText(trophy))}</strong></p>` : ''}
    ${trophy.missable ? `<p class="miss-box"><strong>Missable.</strong> ${escapeHtml(trophy.missable_reason)} Mission replay in GTA VI is unconfirmed, so treat this as do-it-now.</p>` : ''}
    ${hidden ? '' : `
      <h3>Guide</h3>
      <p class="guide">${escapeHtml(trophy.guide)}</p>
      <p class="sources"><strong>Sources:</strong> ${escapeHtml(trophy.sources)}</p>
      <p class="warn">Locations and steps are <strong>not yet checked in the game</strong> — the game is a day old. We claim nothing we have not verified.</p>
      <h3>Your note</h3>
      <textarea id="note-box" data-id="${trophy.id}" placeholder="Your own note for this trophy — a location, a loadout, a reminder. Saved in this browser only.">${escapeHtml(note)}</textarea>
    `}
    <div class="actions">
      <button class="btn primary" data-toggle-earned="${trophy.id}">${earnedNow ? '✓ Earned — undo' : 'Mark earned'}</button>
      <button class="btn" data-open-settings>Export / Import</button>
    </div>
  `;
}

export function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
