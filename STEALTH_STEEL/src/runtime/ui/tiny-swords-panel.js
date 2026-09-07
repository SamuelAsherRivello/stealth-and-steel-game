// Source sheets separate the nine tiles with one-tile transparent gutters.
export function createPanelArt(documentRef, className = "") {
  const art = documentRef.createElement("span");
  art.className = `tiny-swords-slices ${className}`.trim();
  art.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 9; index += 1) art.append(documentRef.createElement("i"));
  return art;
}

export function addRibbonArt(title, documentRef) {
  title.className += " tiny-swords-ribbon";
  const art = documentRef.createElement("span");
  art.className = "tiny-swords-ribbon-art";
  art.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 3; index += 1) art.append(documentRef.createElement("i"));
  title.append(art);
}
