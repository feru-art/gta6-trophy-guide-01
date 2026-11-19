// Kind / text filtering and the spoiler rule.
// Spoiler rule: when spoiler mode is on, a story trophy that is not yet earned
// shows neither its name nor its description — only that it is hidden.
export function visibleTrophies(trophies, settings, earned) {
  const q = (settings.query || '').trim().toLowerCase();
  return trophies.filter((t) => {
    if (settings.kind === 'missable' && !t.missable) return false;
    if (settings.kind === 'story' && t.kind !== 'story') return false;
    if (settings.kind === 'collectibles' && t.kind !== 'collectibles') return false;
    if (settings.kind === 'activities' && t.kind !== 'activities') return false;
    if (settings.kind === 'online') return false; // No online trophies in the official list.
    if (settings.hideEarned && earned.has(t.id)) return false;
    if (q) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function isHiddenBySpoiler(trophy, settings, earned) {
  return settings.spoiler && trophy.kind === 'story' && !earned.has(trophy.id);
}

export function displayName(trophy, settings, earned) {
  return isHiddenBySpoiler(trophy, settings, earned)
    ? 'Hidden story trophy — earn it to reveal'
    : trophy.name;
}

// Short form for chips and compact lists.
export function displayShortName(trophy, settings, earned) {
  return isHiddenBySpoiler(trophy, settings, earned)
    ? 'Hidden story trophy'
    : trophy.name;
}

export function displayDescription(trophy, settings, earned) {
  return isHiddenBySpoiler(trophy, settings, earned)
    ? 'Spoiler hidden until earned.'
    : trophy.description;
}
