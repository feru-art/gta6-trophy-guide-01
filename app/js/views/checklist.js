// Checklist view: the trophy list on the left, the selected trophy's guide
// open beside it. The cover screenshot is this view with a guide open.
import { gradeLabel } from '../data.js';
import { displayDescription, displayName, isHiddenBySpoiler, visibleTrophies } from '../filters.js';
import { escapeHtml, trophyDetailHtml } from './detail.js';

export function renderChecklistView(ctx) {
  const { trophies, earned, settings, selectedId } = ctx;
  const list = visibleTrophies(trophies, settings, earned);
  const selected = trophies.find((t) => t.id === selectedId) || list[0];
  const rows = list.map((t) => {
    const isEarned = earned.has(t.id);
    const hidden = isHiddenBySpoiler(t, settings, earned);
    return `<button class="row ${isEarned ? 'earned' : ''} ${selected && t.id === selected.id ? 'selected' : ''}" data-select="${t.id}">
      <span class="check" aria-hidden="true">${isEarned ? '✓' : ''}</span>
      <span class="medal ${t.grade}" aria-hidden="true"></span>
      <span class="body">
        <span class="name ${hidden ? 'hidden-name' : ''}">${escapeHtml(displayName(t, settings, earned))}</span>
        <span class="desc">${escapeHtml(displayDescription(t, settings, earned))}</span>
        <span class="tags">
          <span class="tag grade-${t.grade}">${gradeLabel(t.grade)}</span>
          <span class="tag">${t.kind}</span>
          ${t.missable ? '<span class="tag miss">Missable</span>' : ''}
          ${t.count != null ? `<span class="tag">Target ${t.count}</span>` : ''}
        </span>
      </span>
    </button>`;
  }).join('');
  return `
    <div class="split">
      <section aria-label="Trophy checklist">
        <p class="meta" style="color:var(--muted);font-size:13px">Showing ${list.length} of 55 trophies · ${earned.size} earned · click a trophy to read its guide</p>
        <div class="list">${rows || '<p class="empty">No trophies match these filters.</p>'}</div>
      </section>
      <aside class="detail" aria-label="Trophy guide">
        ${selected ? trophyDetailHtml(selected, ctx) : '<p class="empty">Select a trophy to read its guide.</p>'}
      </aside>
    </div>`;
}
