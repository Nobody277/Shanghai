import * as dom from './ui/domElements.js';
import { createPlayerButtons, handleStartGame } from './ui/menu.js';
import { toggleTheme } from './ui/theme.js';
import { toggleInfoPanel } from './ui/infoPanel.js';

function initializeUI() {
    console.log("UI Initializing...");
    createPlayerButtons();

    if (dom.themeToggle) {
        dom.themeToggle.addEventListener("click", toggleTheme);
    } else {
        console.error("Theme toggle button not found.");
    }

    if (dom.infoToggle) {
        dom.infoToggle.addEventListener("click", toggleInfoPanel);
    } else {
        console.error("Info toggle button not found.");
    }

    if (dom.startGameBtn) {
        dom.startGameBtn.addEventListener("click", handleStartGame);
    } else {
        console.error("Start game button not found.");
    }

    console.log("UI Initialized.");
}

document.addEventListener("DOMContentLoaded", initializeUI);