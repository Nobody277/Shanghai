import { getGameState, shiftDeck, popDiscardPile, addCardToOpponentHand, removeCardFromOpponentHand, addCardToDiscardPile } from './state.js';
import { endTurn } from './turnManager.js';
import { setOpponentCardCounts, displayDiscardPile } from '../ui/gameBoard.js';
import { updateStats } from '../ui/infoPanel.js';

export function simulateOpponentTurn() {
    const { currentPlayerIndex, opponents, deck, discardPile } = getGameState();
    if (currentPlayerIndex === 0) return;

    const currentOpponent = opponents[currentPlayerIndex - 1];
    if (!currentOpponent) {
        console.error(`Opponent data not found for index: ${currentPlayerIndex}`);
        endTurn();
        return;
    }

    let drawnCard = null;
    if (deck.length > 0) {
        drawnCard = shiftDeck();
        console.log(`Opponent ${currentOpponent.id} drew from deck`);
    } else if (discardPile.length > 0) {
        drawnCard = popDiscardPile();
        console.log(`Opponent ${currentOpponent.id} drew from discard (deck empty)`);
    } else {
        console.log(`Opponent ${currentOpponent.id} cannot draw (deck and discard empty!)`);
        endTurn();
        return;
    }

    addCardToOpponentHand(currentOpponent.id, drawnCard);

    if (currentOpponent.hand.length > 0) {
        const discardIndex = Math.floor(Math.random() * currentOpponent.hand.length);
        const discardedCard = removeCardFromOpponentHand(currentOpponent.id, discardIndex);

        if (discardedCard) {
            addCardToDiscardPile(discardedCard);
            console.log(`Opponent ${currentOpponent.id} discarded a card:`, discardedCard);
        } else {
            console.error(`Failed to remove card at index ${discardIndex} for opponent ${currentOpponent.id}`);
        }
    } else {
        console.log(`Opponent ${currentOpponent.id} has no cards to discard.`);
    }

    setOpponentCardCounts();
    displayDiscardPile();
    updateStats();

    setTimeout(() => {
        endTurn();
    }, 750);
}