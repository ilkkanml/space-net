import { gameState } from "../core/gameState.js";
import { getLatestEVANotification } from "../systems/evaNotificationSystem.js";

const currentMessageEl = document.querySelector("#eva-current-message");
const logEl = document.querySelector("#eva-notification-log");

export function initEVAPanel() {
  renderEVAPanel();
}

export function refreshEVAPanel() {
  renderEVAPanel();
}

function renderEVAPanel() {
  const latest = getLatestEVANotification();

  currentMessageEl.textContent = latest
    ? latest.text
    : "Signal pending...";

  logEl.innerHTML = "";

  gameState.eva.notifications.slice(1, 6).forEach((notification) => {
    const item = document.createElement("div");
    item.className = "eva-log-item";
    item.textContent = notification.text;
    logEl.append(item);
  });
}
