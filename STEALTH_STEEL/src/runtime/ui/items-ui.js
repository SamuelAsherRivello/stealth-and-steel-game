import { GameWindow } from "./game-window.js";

const FAMILIES = ["Shoes", "Dagger", "Shield"];

export function createItemsUi({ host, screenLayer, opener, equipmentProvider,
  onClose = () => {}, onState = () => {}, documentRef = globalThis.document }) {
  const content = documentRef.createElement("div");
  content.className = "items-menu";
  const status = documentRef.createElement("p");
  status.className = "items-menu-status";
  status.setAttribute("role", "status");
  const grid = documentRef.createElement("div");
  grid.className = "items-menu-grid";
  content.append(status, grid);

  let disposed = false;
  let equipment;
  const window = new GameWindow({
    host,
    title: "Items",
    content,
    documentRef,
    opener,
    closeLabel: "Close items",
    screenLayer,
    onClose() {
      disposed = true;
      onClose();
    },
  });

  function render(state) {
    if (disposed) return;
    grid.textContent = "";
    if (state?.status !== "ready") {
      status.textContent = "Items are unavailable. The game continues without item bonuses.";
      return;
    }
    if (!state.profileId) {
      status.textContent = "Log in through Account to select owned items.";
      return;
    }
    status.textContent = state.ownedItems.length
      ? "Choose at most one Shoes, one Dagger, and one Shield. Changes apply on the next player spawn."
      : "This wallet owns no game items.";
    for (const family of FAMILIES) {
      const group = documentRef.createElement("section");
      group.className = "items-menu-family";
      const heading = documentRef.createElement("h3");
      heading.textContent = family;
      group.append(heading);
      for (const item of state.ownedItems.filter(candidate => candidate.family === family)) {
        const selected = state.effective?.[family]?.assetId === item.assetId;
        const button = documentRef.createElement("button");
        button.type = "button";
        button.className = `items-menu-card${selected ? " is-selected" : ""}`;
        button.setAttribute("aria-pressed", String(selected));
        button.setAttribute("data-asset-id", item.assetId);
        const icon = documentRef.createElement("img");
        icon.src = item.iconUrl;
        icon.alt = "";
        const name = documentRef.createElement("strong");
        name.textContent = item.name;
        const effect = documentRef.createElement("span");
        effect.textContent = item.effect;
        button.append(icon, name, effect);
        button.addEventListener("click", async () => {
          try {
            const next = selected ? await equipment.clear(family) : await equipment.select(item.assetId);
            onState(next);
            render(next);
          } catch {
            status.textContent = "That selection could not be saved. Refresh Items and try again.";
          }
        });
        group.append(button);
      }
      grid.append(group);
    }
  }

  void (async () => {
    try {
      equipment = await equipmentProvider();
      const state = await equipment.refresh();
      onState(state);
      render(state);
    } catch {
      render({ status: "unavailable" });
    }
  })();

  return { window, content, get equipment() { return equipment; } };
}
