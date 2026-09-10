import { createMenu } from "./menu.js";

const START_PROMPT_BODY = "Collect gold. Reach the dungeon steps to win.\n\n Avoid enemies. Use bushes to hide.";

export function shouldShowStartGamePrompt({ showStartPrompt = true } = {}) {
  return showStartPrompt !== false;
}

export function shouldSkipIntro({ isDevelopment = false, search = "" } = {}) {
  return isDevelopment && new URLSearchParams(search).get("skipIntro") === "true";
}

export function createStartGamePrompt({ host, onStart, documentRef = globalThis.document }) {
  const menu = createMenu({
    titleText: "Start Menu",
    bodyText: START_PROMPT_BODY,
    buttonClicksOnly: true,
    titleId: "start-game-prompt-title",
    showLogo: true,
    logoAlt: "Stealth & Steel",
    buttons: [{ displayText: "Start", className: "start-game-prompt-start" }],
    documentRef,
  });
  const { backdrop, panel } = menu;
  const [startButton] = menu.buttons;
  backdrop.className += " start-game-prompt-backdrop";
  backdrop.setAttribute("data-start-game-prompt", "true");
  panel.className += " start-game-prompt-panel";
  menu.body.className += " start-game-prompt-body";
  menu.body.style.whiteSpace = "pre-line";
  menu.composition.className += " start-game-prompt-composition";
  menu.logo.className += " start-game-prompt-logo";
  const handleStart = () => {
    onStart?.();
    prompt.close();
  };
  startButton.addEventListener("click", handleStart);

  host.append(backdrop);
  startButton.focus();

  const prompt = {
    backdrop,
    panel,
    startButton,
    close() {
      startButton.removeEventListener("click", handleStart);
      backdrop.remove();
    },
  };
  return prompt;
}

export { START_PROMPT_BODY };
