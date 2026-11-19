// Progress, notes and settings, saved in the browser's localStorage.
// Export writes a JSON file; import reads one back. Nothing leaves the device.
const PROGRESS_KEY = 'gta6-trophy-guide.progress.v1';
const NOTES_KEY = 'gta6-trophy-guide.notes.v1';
const SETTINGS_KEY = 'gta6-trophy-guide.settings.v1';

// Demo progress for screenshots only (?demo): a plausible 13/55 example set.
// Labelled clearly in the UI; never used as real progress.
export const DEMO_EARNED = [2, 3, 8, 15, 16, 20, 21, 28, 35, 42, 44, 46, 53];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // Storage full or blocked: progress just won't persist this session.
  }
}

export function isDemo() {
  return new URLSearchParams(location.search).has('demo');
}

export function loadProgress() {
  const earned = new Set(readJson(PROGRESS_KEY, []));
  if (isDemo() && earned.size === 0) return new Set(DEMO_EARNED);
  return earned;
}

export function saveProgress(earned) {
  writeJson(PROGRESS_KEY, [...earned].sort((a, b) => a - b));
}

export function loadNotes() {
  return readJson(NOTES_KEY, {});
}

export function saveNote(id, text) {
  const notes = loadNotes();
  if (text.trim()) notes[id] = text.trim();
  else delete notes[id];
  writeJson(NOTES_KEY, notes);
}

export function loadSettings() {
  const params = new URLSearchParams(location.search);
  const base = { spoiler: false, kind: 'all', query: '', hideEarned: false };
  const saved = readJson(SETTINGS_KEY, {});
  const merged = { ...base, ...saved };
  if (params.has('spoiler')) merged.spoiler = params.get('spoiler') !== '0';
  return merged;
}

export function saveSettings(settings) {
  writeJson(SETTINGS_KEY, settings);
}

export function exportData(earned, notes) {
  const payload = {
    app: 'gta6-trophy-guide',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    notes,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophies-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importData(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!data || !Array.isArray(data.earned)) throw new Error('Not a progress export');
  const earned = new Set(data.earned.filter((n) => Number.isInteger(n)));
  const notes = data.notes && typeof data.notes === 'object' ? data.notes : {};
  saveProgress(earned);
  writeJson(NOTES_KEY, notes);
  return { earned, notes };
}

export function resetAll() {
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(NOTES_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}
