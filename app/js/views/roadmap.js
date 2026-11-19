// Roadmap to platinum: five stages in order, each with its trophies, progress,
// and what the stage is for. Built from the official descriptions only.
import { STAGES } from '../data.js';
import { escapeHtml } from './detail.js';

export function renderRoadmapView(ctx) {
  const { trophies, earned } = ctx;
  const cards = STAGES.map((stage) => {
    const inStage = trophies.filter((t) => t.stage === stage.n);
    const done = inStage.filter((t) => earned.has(t.id)).length;
    const pct = inStage.length ? Math.round((done / inStage.length) * 100) : 0;
    const chips = inStage.map((t) => {
      const isDone = earned.has(t.id);
      return `<a href="#/trophy/${t.id}" class="${isDone ? 'done' : ''} ${t.missable ? 'miss' : ''}">${escapeHtml(t.name)}${t.missable ? ' ⚠' : ''}</a>`;
    }).join('');
    return `<section class="card">
      <div class="stage-head"><h2>${escapeHtml(stage.title)}</h2><span><strong>${done}/${inStage.length}</strong> · ${pct}%</span></div>
      <div class="stage-bar"><i style="width:${pct}%"></i></div>
      <p class="meta">${escapeHtml(stage.text)}</p>
      <div class="trophy-chips">${chips}</div>
    </section>`;
  }).join('');
  return `
    <h2>Roadmap to Platinum</h2>
    <p style="color:var(--muted)">The order to earn them in, built from the official descriptions. ⚠ marks a missable trophy — do it when it comes up, before the story moves on. Mission replay in GTA VI is unconfirmed.</p>
    <p style="color:var(--muted)">Overall: <strong style="color:var(--text)">${earned.size} / 55 earned</strong> · Platinum “Vice Got a Price!” unlocks when the other 54 are done.</p>
    ${cards}`;
}
