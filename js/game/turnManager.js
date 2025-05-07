import * as dom from '../ui/domElements.js';
import * as state from './state.js';
import * as cards from './cards.js';
import * as player from './player.js';
import * as opponent from './opponent.js';
import * as board from '../ui/gameBoard.js';
import * as info from '../ui/infoPanel.js';
import * as config from '../config.js';

export function initializeGame() {
    console.log("Initializing game...");
    const { selectedPlayerCount } = state.getGameState();
    if (!selectedPlayerCount) {
        console.error("Cannot initialize game - player count not set.");
        return;
    }

    state.resetState();
    cards.shuffleAndSetDeck();

    const newOpponents = [];
    for (let i = 1; i < selectedPlayerCount; i++) {
        newOpponents.push({ id: i, hand: cards.dealCards(config.initialCardCount), score: 0 });
    }
    state.updateState({ opponents: newOpponents });

    state.setPlayerHand(cards.dealCards(config.initialCardCount));
    state.updateState({ currentPlayerIndex: 0, turnPhase: 'draw' });

    board.setupOpponentsUI(selectedPlayerCount - 1);
    board.setOpponentCardCounts();
    updateGameAfterAction();

    console.log("Game Initialized. Player turn.");
}

export function updateGameAfterAction(updateHand = true) {
    if (updateHand) {
        board.displayPlayerHand();
    }
    board.displayDiscardPile();
    info.updateStats();
    addGameEventListeners();
}

export function addGameEventListeners() {
    const { turnPhase, currentPlayerIndex, discardPile } = state.getGameState();

    if (dom.deckPileElement) {
        dom.deckPileElement.removeEventListener('click', player.handleDrawFromDeck);
        if (currentPlayerIndex === 0 && turnPhase === 'draw') {
            dom.deckPileElement.addEventListener('click', player.handleDrawFromDeck);
            dom.deckPileElement.style.cursor = 'pointer';
        } else {
            dom.deckPileElement.style.cursor = 'default';
        }
    }

    const topDiscardCard = dom.discardPileElement?.querySelector('.card.top-discard');
    if (topDiscardCard) {
        topDiscardCard.removeEventListener('click', player.handleDrawFromDiscard);
        if (currentPlayerIndex === 0 && turnPhase === 'draw' && discardPile.length > 0) {
            topDiscardCard.addEventListener('click', player.handleDrawFromDiscard);
            topDiscardCard.style.cursor = 'pointer';
        } else {
            topDiscardCard.style.cursor = 'default';
        }
    }
}

export function endTurn() {
    console.log(`Ending turn for player ${state.getGameState().currentPlayerIndex}`);
    state.updateState({ turnPhase: 'waiting' });
    updateGameAfterAction();

    const { currentPlayerIndex, selectedPlayerCount } = state.getGameState();
    const nextPlayerIndex = (currentPlayerIndex + 1) % selectedPlayerCount;
    state.updateState({ currentPlayerIndex: nextPlayerIndex });

    info.updateStats();

    if (nextPlayerIndex === 0) {
        startPlayerTurn();
    } else {
        opponent.simulateOpponentTurn();
    }
}

export function startPlayerTurn() {
    console.log("Player turn started.");
    state.updateState({ turnPhase: 'draw' });
    updateGameAfterAction();
}

function handleRoundEnd() {
    console.log("Round End!");
    state.updateState({ isGameOver: true });
    alert("Round Over! (Implement scoring and next round)");
}