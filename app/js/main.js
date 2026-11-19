// Boot + hash routing for the Leonida Tracker.
// Routes: #/ (checklist), #/trophy/<id>, #/roadmap, #/missables, #/settings.
import { loadTrophies } from './data.js';
import { isDemo, loadNotes, loadProgress, loadSettings, saveNote, saveProgress, saveSettings } from './store.js';
import { renderChecklistView } from './views/checklist.js';
import { escapeHtml } from './views/detail.js';
import { renderMissablesView } from './views/missables.js';
import { renderPlannerView } from './views/planner.js';
import { renderRoadmapView } from './views/roadmap.js';
import { bindSettingsView, renderSettingsView } from './views/settings.js';

const NAV = [
  { hash: '#/', label: 'Checklist' },
  { hash: '#/roadmap', label: 'Roadmap to Platinum' },
  { hash: '#/missables', label: 'Missables' },
  { hash: '#/planner', label: 'Next Up' },
  { hash: '#/settings', label: 'Settings & Save' },
];

const KINDS = [
  { key: 'all', label: 'All 55' },
  { key: 'story', label: 'Story' },
  { key: 'missable', label: 'Missable' },
  { key: 'collectibles', label: 'Collectibles' },
  { key: 'activities', label: 'Activities' },
  { key: 'online', label: 'Online' },
];

const ctx = {
  trophies: [],
  earned: new Set(),
  notes: {},
  settings: loadSettings(),
  selectedId: null,
  route: 'checklist',
  onSettingsChange() {
    saveSettings(this.settings);
    renderTopProgress();
  },
};

function routeFromHash() {
  const hash = location.hash || '#/';
  if (hash.startsWith('#/trophy/')) {
    const id = Number(hash.slice('#/trophy/'.length));
    ctx.selectedId = Number.isInteger(id) ? id : null;
    return 'checklist';
  }
  if (hash === '#/roadmap') return 'roadmap';
  if (hash === '#/missables') return 'missables';
  if (hash === '#/planner') return 'planner';
  if (hash === '#/settings') return 'settings';
  return 'checklist';
}

function renderTopProgress() {
  const el = document.getElementById('top-progress');
  const total = ctx.trophies.length || 55;
  const done = ctx.earned.size;
  const pct = Math.round((done / total) * 100);
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of ctx.trophies) counts[t.grade] += 1;
  el.innerHTML = `
    <div class="progress-line"><b>${done} / ${total}</b> earned · ${pct}% to platinum</div>
    <div class="progress-bar"><i style="width:${pct}%"></i></div>
    <div class="progress-sub">55/55 · 1 Platinum, 2 Gold, 6 Silver, 46 Bronze</div>
    ${isDemo() ? '<span class="demo-badge">Demo progress — example only (?demo)</span>' : ''}`;
}

function renderNav() {
  const nav = document.getElementById('mainnav');
  nav.innerHTML = NAV.map((item) => {
    const active = (ctx.route === 'checklist' && item.hash === '#/')
      || (ctx.route === 'roadmap' && item.hash === '#/roadmap')
      || (ctx.route === 'missables' && item.hash === '#/missables')
      || (ctx.route === 'planner' && item.hash === '#/planner')
      || (ctx.route === 'settings' && item.hash === '#/settings');
    return `<a href="${item.hash}" class="${active ? 'active' : ''}">${item.label}</a>`;
  }).join('');
}

function renderToolbar() {
  const bar = document.getElementById('toolbar');
  if (ctx.route !== 'checklist') {
    bar.innerHTML = '';
    return;
  }
  const chips = KINDS.map((k) => `<button class="chip ${k.key === 'missable' ? 'missable' : ''}" data-kind="${k.key}" aria-pressed="${ctx.settings.kind === k.key}">${k.label}</button>`).join('');
  bar.innerHTML = `
    ${chips}
    <input class="search" id="search-box" type="search" placeholder="Search trophies…" value="${escapeHtml(ctx.settings.query || '')}" aria-label="Search trophies">
    <span class="spacer"></span>
    <label class="toggle"><input type="checkbox" id="hide-earned" ${ctx.settings.hideEarned ? 'checked' : ''}> Hide earned</label>
    <label class="toggle"><input type="checkbox" id="spoiler-toggle" ${ctx.settings.spoiler ? 'checked' : ''}> Spoilers off</label>
    <button class="btn" id="export-btn">Export</button>
    <label class="btn" for="import-file" style="cursor:pointer">Import</label>
    <input type="file" id="import-file" accept=".json,application/json" hidden>`;
  bar.querySelectorAll('[data-kind]').forEach((btn) => {
    btn.addEventListener('click', () => {
      ctx.settings.kind = btn.dataset.kind;
      ctx.onSettingsChange();
      render();
    });
  });
  const searchBox = document.getElementById('search-box');
  searchBox.addEventListener('input', () => {
    ctx.settings.query = searchBox.value;
    saveSettings(ctx.settings);
    render();
    // Keep focus in the search box across the re-render.
    const again = document.getElementById('search-box');
    if (again) {
      again.focus();
      again.setSelectionRange(again.value.length, again.value.length);
    }
  });
  const hideEarned = document.getElementById('hide-earned');
  hideEarned.addEventListener('change', () => {
    ctx.settings.hideEarned = hideEarned.checked;
    ctx.onSettingsChange();
    render();
  });
  const spoiler = document.getElementById('spoiler-toggle');
  spoiler.addEventListener('change', () => {
    ctx.settings.spoiler = spoiler.checked;
    ctx.onSettingsChange();
    render();
  });
  document.getElementById('export-btn').addEventListener('click', async () => {
    const { exportData } = await import('./store.js');
    exportData(ctx.earned, ctx.notes);
  });
  document.getElementById('import-file').addEventListener('change', async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    const { importData } = await import('./store.js');
    try {
      const { earned, notes } = await importData(file);
      ctx.earned = earned;
      ctx.notes = notes;
      ctx.onSettingsChange();
      render();
    } catch (err) {
      window.alert('Import failed: that file is not a progress export from this guide.');
    }
  });
}

function render() {
  ctx.route = routeFromHash();
  renderNav();
  renderToolbar();
  renderTopProgress();
  const view = document.getElementById('view');
  if (ctx.route === 'roadmap') view.innerHTML = renderRoadmapView(ctx);
  else if (ctx.route === 'missables') view.innerHTML = renderMissablesView(ctx);
  else if (ctx.route === 'planner') view.innerHTML = renderPlannerView(ctx);
  else if (ctx.route === 'settings') {
    view.innerHTML = renderSettingsView(ctx);
    bindSettingsView(ctx, render);
  } else view.innerHTML = renderChecklistView(ctx);
  view.scrollTop = 0;
}

// Event delegation for the whole view: select a trophy, toggle earned, notes.
document.getElementById('view').addEventListener('click', (ev) => {
  const selectBtn = ev.target.closest('[data-select]');
  if (selectBtn) {
    ctx.selectedId = Number(selectBtn.dataset.select);
    location.hash = '#/trophy/' + ctx.selectedId;
    render();
    return;
  }
  const toggleBtn = ev.target.closest('[data-toggle-earned]');
  if (toggleBtn) {
    const id = Number(toggleBtn.dataset.toggleEarned);
    if (ctx.earned.has(id)) ctx.earned.delete(id);
    else ctx.earned.add(id);
    saveProgress(ctx.earned);
    renderTopProgress();
    render();
    return;
  }
  if (ev.target.closest('[data-open-settings]')) {
    location.hash = '#/settings';
    render();
  }
});

document.getElementById('view').addEventListener('change', (ev) => {
  if (ev.target.id === 'note-box') {
    saveNote(Number(ev.target.dataset.id), ev.target.value);
    ctx.notes = loadNotes();
  }
});

window.addEventListener('hashchange', render);

async function boot() {
  try {
    ctx.trophies = await loadTrophies();
  } catch (err) {
    document.getElementById('view').innerHTML = '<p class="empty">Could not load the trophy list. This guide works offline — serve its app/ folder over HTTP and reload.</p>';
    return;
  }
  ctx.earned = loadProgress();
  ctx.notes = loadNotes();
  render();
}

boot();
