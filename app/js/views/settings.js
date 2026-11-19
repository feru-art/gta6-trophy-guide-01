// Settings: spoiler switch, export / import, reset, and the sources page.
import { exportData, importData, resetAll } from '../store.js';
import { escapeHtml } from './detail.js';

export function renderSettingsView(ctx) {
  const { earned, settings } = ctx;
  return `
    <h2>Settings &amp; Save</h2>
    <section class="card">
      <h3>Spoiler setting</h3>
      <label class="toggle"><input type="checkbox" id="spoiler-toggle" ${settings.spoiler ? 'checked' : ''}> Hide story trophy names &amp; descriptions until earned</label>
      <p class="meta">When on, un-earned story trophies show as “Hidden story trophy” in the list and in their guide pane. Earned ones always show.</p>
    </section>
    <section class="card">
      <h3>Your progress — export &amp; import</h3>
      <p class="meta">${earned.size} of 55 trophies earned. Progress and notes live in this browser's localStorage. Export a file to keep a copy or move it to another browser.</p>
      <div class="actions" style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn primary" id="export-btn">Export progress (.json)</button>
        <label class="btn" for="import-file" style="cursor:pointer">Import progress…</label>
        <input type="file" id="import-file" accept=".json,application/json" hidden>
        <button class="btn" id="reset-btn">Reset all progress</button>
      </div>
      <p class="meta" id="import-status"></p>
    </section>
    <section class="card">
      <h3>Sources &amp; honesty</h3>
      <p class="meta">Official names, descriptions and grades: Exophase — GTA VI trophies, cross-checked with PSNProfiles (the two agree on all 55). PSN counts and targets: PSNProfiles. Every guide is written in our own words for this guide; a source is cited, never copied.</p>
      <p class="meta">Roadmap stages and missable flags are our reading of the official descriptions. Locations and steps are <strong style="color:var(--text)">not yet checked in the game</strong> — GTA VI released 19 November 2026 and we claim nothing we have not verified. 28 of the 55 trophies are hidden on PlayStation until earned; this guide does not assign hidden flags to individual trophies because the official list gives none per trophy.</p>
      <p class="meta">No Rockstar Games logo, official artwork, box art or game screenshot is used anywhere in this guide. Unofficial fan guide, not affiliated with Rockstar Games.</p>
    </section>`;
}

export function bindSettingsView(ctx, rerender) {
  const spoilerToggle = document.getElementById('spoiler-toggle');
  if (spoilerToggle) {
    spoilerToggle.addEventListener('change', () => {
      ctx.settings.spoiler = spoilerToggle.checked;
      ctx.onSettingsChange();
      rerender();
    });
  }
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) exportBtn.addEventListener('click', () => exportData(ctx.earned, ctx.notes));
  const importFile = document.getElementById('import-file');
  const status = document.getElementById('import-status');
  if (importFile) {
    importFile.addEventListener('change', async () => {
      const file = importFile.files[0];
      if (!file) return;
      try {
        const { earned, notes } = await importData(file);
        ctx.earned = earned;
        ctx.notes = notes;
        ctx.onSettingsChange();
        status.textContent = 'Imported ' + earned.size + ' earned trophies.';
        rerender();
      } catch (err) {
        status.textContent = 'Import failed: that file is not a progress export from this guide.';
      }
    });
  }
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (window.confirm('Reset all progress and notes?')) {
        resetAll();
        location.reload();
      }
    });
  }
}
