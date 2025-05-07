import * as dom from './domElements.js';
import * as config from '../config.js';
import { updateState } from '../game/state.js';
import { initializeGame } from '../game/turnManager.js';

let localSelectedPlayerCount = null;

export function createPlayerButtons() {
    if (!dom.playerOptionsContainer) return;
    dom.playerOptionsContainer.innerHTML = "";

    for (let i = config.minPlayers; i <= config.maxPlayers; i++) {
        const button = document.createElement("button");
        button.classList.add("btn", "player-btn");
        button.textContent = i;
        button.dataset.count = i;

        button.addEventListener("click", handlePlayerSelect);
        dom.playerOptionsContainer.appendChild(button);
    }
}

function handlePlayerSelect(event) {
    const clickedButton = event.target;
    const count = parseInt(clickedButton.dataset.count, 10);

    if (!dom.playerOptionsContainer) return;

    const allPlayerButtons = dom.playerOptionsContainer.querySelectorAll(".player-btn");
    allPlayerButtons.forEach((btn) => btn.classList.remove("active"));

    clickedButton.classList.add("active");
    localSelectedPlayerCount = count;

    if (dom.startGameBtn) {
        dom.startGameBtn.disabled = false;
    }
}

export function handleStartGame() {
    if (localSelectedPlayerCount !== null) {
        updateState({ selectedPlayerCount: localSelectedPlayerCount });

        if (dom.menuContainer) dom.menuContainer.classList.add("hidden");
        if (dom.gameArea) dom.gameArea.classList.remove("hidden");

        initializeGame();
    } else {
        alert("Please select the number of players first.");
    }
}
