import { addRibbonArt, createPanelArt } from "./tiny-swords-panel.js";
import "./menu-button-label.js";

let nextMenuId = 0;

/** A native menu action; callers own its event handlers and lifecycle. */
export function createMenuButton({ displayText, className = "", documentRef = globalThis.document }) {
  const button = documentRef.createElement("button");
  button.type = "button";
  button.className = `menu-button-text tiny-swords-button ${className}`.trim();
  const label = documentRef.createElement("menu-button-label");
  label.textContent = displayText;
  button.append(label, createPanelArt(documentRef, "tiny-swords-button-art"));
  return button;
}

/** Reusable presentation; callers own mounting, visibility, focus and actions. */
export function createMenu({ titleText, bodyText, content = null, closeButton = null, buttons = [], logo = null,
  titleId = `menu-title-${++nextMenuId}`, documentRef = globalThis.document }) {
  const backdrop = documentRef.createElement("div");
  backdrop.className = `menu-backdrop tiny-swords-menu-backdrop${logo ? " has-logo" : ""}`;
  const composition = documentRef.createElement("div");
  composition.className = "tiny-swords-menu-composition";
  const panel = documentRef.createElement("section");
  panel.className = "menu-panel tiny-swords-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", titleId);
  if (!content) panel.setAttribute("aria-describedby", `${titleId}-body`);

  const title = documentRef.createElement("h2");
  title.className = "menu-title-text tiny-swords-title-text";
  title.textContent = titleText;
  title.id = titleId;
  addRibbonArt(title, documentRef);
  const body = documentRef.createElement(content ? "div" : "p");
  body.className = content ? "game-window-body" : "menu-subtitle-text tiny-swords-body-text";
  if (content) body.append(content);
  else body.textContent = bodyText;
  body.id = `${titleId}-body`;
  const actionButtons = buttons.map(options => createMenuButton({ ...options, documentRef }));
  panel.append(title);
  if (closeButton) panel.append(closeButton);
  panel.append(body, ...actionButtons, createPanelArt(documentRef));

  let logoElement = null;
  if (logo) {
    logoElement = documentRef.createElement("img");
    logoElement.className = "tiny-swords-menu-logo";
    logoElement.src = logo.src;
    logoElement.alt = logo.alt;
    composition.append(logoElement);
  }
  composition.append(panel);
  backdrop.append(composition);
  return { backdrop, composition, panel, title, body, buttons: actionButtons, logo: logoElement };
}
