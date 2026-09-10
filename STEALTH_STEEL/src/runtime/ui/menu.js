import { addRibbonArt, createPanelArt } from "./tiny-swords-panel.js";
import "./menu-button-label.js";
import "./menu-title-label.js";

let nextMenuId = 0;
const DEFAULT_LOGO_SRC = `${import.meta.env?.BASE_URL ?? "/"}ui/tiny-swords/`
  + "stealth-and-steel-logo-transparent.png";

/**
 * @typedef {Object} MenuButtonProps
 * @property {string} displayText Text displayed inside the button.
 * @property {string | null} [icon] Optional leading icon text.
 * @property {string} [className] Optional class hook for the caller.
 * @property {Document} [documentRef] DOM document used by tests and runtime.
 */

/**
 * @typedef {Object} MenuProps
 * @property {string} titleText Dialog title text.
 * @property {string} [bodyText] Plain body text when `content` is not supplied.
 * @property {Element | null} [content] Custom body content for richer windows.
 * @property {HTMLButtonElement | null} [closeButton] Header close control.
 * @property {(MenuButtonProps | HTMLButtonElement)[]} [buttons] Action
 * buttons rendered after the body.
 * @property {boolean} [showHeader] Whether to show the ribbon title header.
 * @property {boolean} [showLogo] Whether to show the game logo above the panel.
 * @property {string} [logoSrc] Logo image source used when `showLogo` is true.
 * @property {string} [logoAlt] Accessible logo text used when `showLogo` is true.
 * @property {boolean} [buttonClicksOnly] Blocks Enter/Space keyboard activation.
 * @property {string} [titleId] Stable accessible title id override.
 * @property {Document} [documentRef] DOM document used by tests and runtime.
 */

/** A native menu action; callers own its event handlers and lifecycle. */
export function createMenuButton({ displayText, icon = null, className = "", documentRef = globalThis.document }) {
  const button = documentRef.createElement("button");
  button.type = "button";
  button.className = `menu-button-text tiny-swords-button ${className}`.trim();
  const label = documentRef.createElement("menu-button-label");
  label.textContent = displayText;
  button.menuLabel = label;
  if (icon) {
    const symbol = documentRef.createElement('span');
    symbol.className = 'menu-button-icon'; symbol.textContent = icon; symbol.setAttribute('aria-hidden','true');
    button.className += ' has-menu-icon'; button.append(symbol);
  }
  button.append(label, createPanelArt(documentRef, "tiny-swords-button-art"));
  return button;
}

/**
 * Reusable presentation; callers own mounting, visibility, focus and actions.
 * @param {MenuProps} props
 */
export function createMenu({
  titleText,
  bodyText,
  content = null,
  closeButton = null,
  buttons = [],
  showHeader = true,
  showLogo = false,
  logoSrc = DEFAULT_LOGO_SRC,
  logoAlt = "",
  buttonClicksOnly = false,
  titleId = `menu-title-${++nextMenuId}`,
  documentRef = globalThis.document,
}) {
  const backdrop = documentRef.createElement("div");
  backdrop.className = `menu-backdrop tiny-swords-menu-backdrop${showLogo ? " has-logo" : ""}`;
  if (buttonClicksOnly) {
    // Focused native buttons otherwise activate on Enter or Space.
    const containKeyboard = event => {
      event.stopPropagation();
      if (event.key === "Enter" || event.key === " " || event.code === "Space") event.preventDefault();
    };
    backdrop.addEventListener("keydown", containKeyboard);
    backdrop.addEventListener("keyup", containKeyboard);
  }
  const composition = documentRef.createElement("div");
  composition.className = "tiny-swords-menu-composition";
  const panel = documentRef.createElement("section");
  panel.className = "menu-panel tiny-swords-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  if (showHeader) panel.setAttribute("aria-labelledby", titleId);
  else if (titleText) panel.setAttribute("aria-label", titleText);

  let title = null;
  let header = null;
  if (showHeader) {
    title = documentRef.createElement("h2");
    title.className = "menu-title-text tiny-swords-title-text";
    const label = documentRef.createElement("menu-title-label");
    label.textContent = titleText;
    title.menuTitleLabel = label;
    title.append(label);
    title.id = titleId;
    header = closeButton ? documentRef.createElement("div") : title;
    if (closeButton) {
      header.className = "game-window-header";
      header.append(title, closeButton);
    }
    addRibbonArt(header, documentRef);
  }
  const bodyArea = documentRef.createElement("div");
  bodyArea.className = "menu-body game-window-body";
  let body = null;
  if (bodyText != null) {
    body = documentRef.createElement("p");
    body.className = "menu-subtitle-text tiny-swords-body-text";
    body.textContent = bodyText;
    body.id = `${titleId}-body`;
    panel.setAttribute("aria-describedby", body.id);
    bodyArea.append(body);
  }
  if (content) bodyArea.append(content);
  const actionButtons = buttons.map(options => (
    typeof options?.addEventListener === "function" && options.type === "button"
      ? options
      : createMenuButton({ ...options, documentRef })
  ));
  const actions = documentRef.createElement("div");
  actions.className = "menu-actions";
  actions.append(...actionButtons);
  const contentStack = documentRef.createElement("div");
  contentStack.className = "menu-content-stack";
  contentStack.append(bodyArea, actions);
  if (header) panel.append(header);
  panel.append(contentStack, createPanelArt(documentRef));

  let logoElement = null;
  if (showLogo) {
    logoElement = documentRef.createElement("img");
    logoElement.className = "tiny-swords-menu-logo";
    logoElement.src = logoSrc;
    logoElement.alt = logoAlt;
    composition.append(logoElement);
  }
  composition.append(panel);
  backdrop.append(composition);
  return {
    backdrop,
    composition,
    panel,
    header,
    title,
    body: body ?? bodyArea,
    bodyArea,
    contentStack,
    actions,
    buttons: actionButtons,
    logo: logoElement,
  };
}
