export const RUN_STORAGE_KEY = 'stealth-steel-level-run-v1';

export function catalogFromFiles(files) {
  const levels = files.filter(name => /^Level\d{2,}\.tmj$/.test(name))
    .map(file => ({number: Number(file.match(/\d+/)[0]), file})).sort((a,b) => a.number-b.number);
  if (!levels.length || levels.some((level,index) => level.number !== index+1)) throw Error('Packaged levels must be contiguous, starting with Level01.tmj.');
  return levels;
}

export function createLevelProgress(catalog, storage, reload) {
  let current = 1, completed = 0;
  try {
    const saved = JSON.parse(storage.getItem(RUN_STORAGE_KEY) ?? 'null');
    if (saved?.pendingTransition === true && Number.isInteger(saved.current) && catalog.some(level => level.number === saved.current) && saved.completed === saved.current-1) {
      // Continue reloads the page; consume its destination once so manual refresh starts over.
      storage.setItem(RUN_STORAGE_KEY, 'null');
      if (storage.getItem(RUN_STORAGE_KEY) !== 'null') throw Error('Level transition could not be consumed.');
      current = saved.current; completed = saved.completed;
    }
  } catch { /* Unreadable game progress starts a guest run, never touches wallet data. */ }
  const save = (next, count) => {
    const value = JSON.stringify({current: next, completed: count, pendingTransition: true});
    storage.setItem(RUN_STORAGE_KEY, value);
    if (storage.getItem(RUN_STORAGE_KEY) !== value) throw Error('Game progress could not be saved. Enable browser storage and try again.');
    reload();
  };
  return {
    current, completed, total: catalog.length,
    file: catalog.find(level => level.number === current).file,
    get hasNext() { return catalog.some(level => level.number === current+1); },
    advance() { if (this.hasNext) save(current+1, current); },
    restart() { save(1,0); },
  };
}
