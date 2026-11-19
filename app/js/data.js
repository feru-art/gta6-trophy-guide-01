// Loads the official trophy list with our guides. One fetch, cached for the session.
let cache = null;

export async function loadTrophies() {
  if (cache) return cache;
  const res = await fetch('./data/trophies.json');
  if (!res.ok) throw new Error('trophies.json failed to load');
  const data = await res.json();
  cache = data.trophies.slice().sort((a, b) => a.id - b.id);
  return cache;
}

export const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

export function kindLabel(kind) {
  return { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' }[kind] || kind;
}

export const STAGES = [
  { n: 1, title: 'Stage 1 — Story first', text: 'Play the campaign in order: the opening mission, Chapters 1–4, the named story missions and the final mission. These 12 trophies come naturally from the story.' },
  { n: 2, title: 'Stage 2 — Strangers & side strands', text: 'Finish the character strands (Andy, Kenton, Billy, Randy, Tyrone) and 8 stranger strands across Leonida, plus Bret’s hunt. Do these before the story moves past their arcs.' },
  { n: 3, title: 'Stage 3 — Activities & feats', text: 'The open-world activities: stunts, shooting range, races, fishing, arcade, meditation, challenges and the one-off feats. All available in free roam.' },
  { n: 4, title: 'Stage 4 — Collectibles, money & clean-up', text: 'Cards, WAiNK It spots, vehicles, areas, bank vaults, gangs, laundering, spending and properties. The long grind — chip away at it between story beats.' },
  { n: 5, title: 'Stage 5 — Platinum', text: '100% completion, then the platinum. The last two trophies unlock only when everything else is done.' },
];

export function stageOf(trophy) {
  return STAGES.find((s) => s.n === trophy.stage) || STAGES[0];
}

export function countText(trophy) {
  if (trophy.count == null) return '';
  if (trophy.id === 52) return 'Target: $250,000 laundered';
  if (trophy.id === 53) return 'Target: $100,000 spent';
  return 'PSN target: ' + trophy.count;
}
