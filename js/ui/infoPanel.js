import * as dom from './domElements.js';
import { getGameState } from '../game/state.js';

export function toggleInfoPanel() {
    if (dom.infoContainer) {
        dom.infoContainer.classList.toggle("info-open");
    }
}

export function updateStats() {
    const { currentRound, playerScore, deck, currentPlayerIndex, turnPhase, selectedPlayerCount } = getGameState();

    if (dom.roundEl) dom.roundEl.textContent = currentRound;
    if (dom.scoreEl) dom.scoreEl.textContent = playerScore;
    if (dom.deckCountEl) dom.deckCountEl.textContent = deck ? deck.length : '?';
    if (dom.currentPlayerEl) {
        dom.currentPlayerEl.textContent = currentPlayerIndex === 0 
            ? "Your Turn" 
            : `Opponent ${currentPlayerIndex}'s Turn`;
    }

    document.body.classList.remove('phase-draw', 'phase-discard', 'phase-waiting');
    if (currentPlayerIndex === 0) {
        document.body.classList.add(`phase-${turnPhase}`);
    } else {
        document.body.classList.add('phase-waiting');
    }
}