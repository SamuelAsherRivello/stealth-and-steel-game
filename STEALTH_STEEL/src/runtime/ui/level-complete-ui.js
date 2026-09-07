import { createMenu } from "./menu.js";

export function createLevelCompleteUi({ host, onContinue, outcome = "win", documentRef = globalThis.document }) {
  const menu = createMenu({
    titleText: outcome === "loss" ? "You Lost" : "Level Complete",
    bodyText: outcome === "loss" ? "Try again!" : "You did great!",
    buttons: [{ displayText: "Continue", className: "level-complete-continue" }],
    documentRef,
  });
  const { backdrop, panel } = menu;
  const [button] = menu.buttons;
  backdrop.className += " level-complete-backdrop";
  backdrop.hidden = true;
  panel.className += ` level-complete-panel outcome-${outcome === "loss" ? "loss" : "win"}`;
  button.addEventListener("click", onContinue);
  const closeOnClick = (event) => { if (outcome !== "loss" && event.target === backdrop) backdrop.remove(); };
  backdrop.addEventListener("click", closeOnClick);
  host.append(backdrop);
  return { backdrop, panel, button, show() { backdrop.hidden = false; button.focus(); }, dispose() { button.removeEventListener("click", onContinue); backdrop.removeEventListener("click", closeOnClick); backdrop.remove(); } };
}
