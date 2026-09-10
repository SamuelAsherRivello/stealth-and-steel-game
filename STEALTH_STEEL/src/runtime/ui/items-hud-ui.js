const FAMILIES = ["Shoes", "Dagger", "Shield"];

export function createItemsHudUi({ host, snapshot, documentRef = globalThis.document }) {
  const element = documentRef.createElement("p");
  element.className = "items-counter";
  const label = documentRef.createElement("span");
  label.textContent = "Items: ";
  element.append(label);

  const slots = FAMILIES.map((family) => {
    const slot = documentRef.createElement("span");
    slot.className = "items-counter-slot";
    slot.setAttribute("data-family", family);
    element.append(slot);
    return slot;
  });

  function render(next = snapshot) {
    snapshot = next;
    FAMILIES.forEach((family, index) => {
      const slot = slots[index];
      slot.textContent = "";
      const item = snapshot?.slots?.[family];
      if (!item) {
        slot.textContent = "[]";
        slot.setAttribute("aria-label", `${family}: empty`);
        return;
      }
      const open = documentRef.createElement("span");
      open.textContent = "[";
      const icon = documentRef.createElement("img");
      icon.src = item.iconUrl;
      icon.alt = item.name;
      icon.title = `${item.name}: ${item.effect}`;
      const close = documentRef.createElement("span");
      close.textContent = "]";
      slot.setAttribute("aria-label", `${family}: ${item.name}`);
      slot.append(open, icon, close);
    });
  }

  render(snapshot);
  host.append(element);
  return { element, render };
}
