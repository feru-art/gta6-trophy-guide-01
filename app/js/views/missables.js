// Missables: every trophy the official descriptions make story-gated, with
// the reason for each. Nothing here is invented: a trophy is missable when its
// description ties it to a chapter, a named mission, a character strand's final
// mission, or a one-time choice.
import { escapeHtml } from './detail.js';

export function renderMissablesView(ctx) {
  const { trophies, earned } = ctx;
  const missables = trophies.filter((t) => t.missable);
  const done = missables.filter((t) => earned.has(t.id)).length;
  const rows = missables.map((t) => {
    const isEarned = earned.has(t.id);
    return `<button class="row ${isEarned ? 'earned' : ''}" data-select="${t.id}">
      <span class="check" aria-hidden="true">${isEarned ? '✓' : ''}</span>
      <span class="medal ${t.grade}" aria-hidden="true"></span>
      <span class="body">
        <span class="name">${escapeHtml(t.name)}</span>
        <span class="desc">${escapeHtml(t.description)}</span>
        <span class="desc"><strong style="color:var(--text)">Why missable:</strong> ${escapeHtml(t.missable_reason)}</span>
        <span class="tags"><span class="tag grade-${t.grade}">${t.grade}</span><span class="tag miss">Missable</span><span class="tag">Stage ${t.stage}</span></span>
      </span>
    </button>`;
  }).join('');
  return `
    <h2>Missable Trophies — ${done}/${missables.length} earned</h2>
    <p style="color:var(--muted)">Built from the official descriptions alone. A trophy counts as missable here when its moment passes with the story: a chapter completing, a named mission, a character strand ending, or a choice made once. Past GTA games let you replay missions — that is <strong style="color:var(--text)">unconfirmed for GTA VI</strong>, so play these as do-it-now. Everything else can be earned in free roam at any time.</p>
    <div class="list">${rows}</div>`;
}
