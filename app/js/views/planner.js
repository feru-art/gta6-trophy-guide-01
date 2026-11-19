// Next-up planner: what to do next, in roadmap order. Missable trophies come
// first inside their stage — they are the ones that cannot wait.
import { STAGES } from '../data.js';
import { displayShortName } from '../filters.js';
import { escapeHtml } from './detail.js';

export function nextUp(trophies, earned, count = 5) {
  const remaining = trophies.filter((t) => !earned.has(t.id));
  remaining.sort((a, b) => {
    if (a.stage !== b.stage) return a.stage - b.stage;
    if (a.missable !== b.missable) return a.missable ? -1 : 1;
    return a.id - b.id;
  });
  return remaining.slice(0, count);
}

export function renderPlannerView(ctx) {
  const { trophies, earned, settings } = ctx;
  const picks = nextUp(trophies, earned, 5);
  const first = picks[0];
  const rows = picks.map((t, i) => `
    <button class="row" data-select="${t.id}">
      <span class="check" aria-hidden="true">${i === 0 ? '▶' : ''}</span>
      <span class="medal ${t.grade}" aria-hidden="true"></span>
      <span class="body">
        <span class="name">${escapeHtml(displayShortName(t, settings, earned))}</span>
        <span class="desc">${escapeHtml(t.description)}</span>
        <span class="tags">
          <span class="tag grade-${t.grade}">${t.grade}</span>
          <span class="tag">${t.kind}</span>
          <span class="tag">Stage ${t.stage}</span>
          ${t.missable ? '<span class="tag miss">Missable — do now</span>' : ''}
        </span>
      </span>
    </button>`).join('');
  const stageLines = STAGES.map((stage) => {
    const inStage = trophies.filter((t) => t.stage === stage.n);
    const done = inStage.filter((t) => earned.has(t.id)).length;
    const pct = inStage.length ? Math.round((done / inStage.length) * 100) : 0;
    return `<div class="card"><div class="stage-head"><h3>${escapeHtml(stage.title)}</h3><span><strong>${done}/${inStage.length}</strong> · ${pct}%</span></div><div class="stage-bar"><i style="width:${pct}%"></i></div></div>`;
  }).join('');
  return `
    <h2>Next Up — your planner</h2>
    ${first ? `<p class="nextup">Do next: <b>${escapeHtml(displayShortName(first, settings, earned))}</b> — ${escapeHtml(first.description)}${first.missable ? ' <span class="tag miss">Missable</span>' : ''}</p>` : '<p class="nextup"><b>Platinum earned — every trophy is done.</b></p>'}
    <p style="color:var(--muted)">In roadmap order, missable trophies first inside each stage. ${earned.size} of 55 earned.</p>
    <div class="list">${rows || '<p class="empty">Nothing left — platinum is yours.</p>'}</div>
    <h2 style="margin-top:20px">Roadmap progress</h2>
    ${stageLines}`;
}
