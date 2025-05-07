import * as config from '../config.js';
import { shuffleArray } from '../utils/helpers.js';
import { setDeck, getGameState } from './state.js';

export function createDeck() {
    const newDeck = [];
    for (let d = 0; d < config.numDecks; d++) {
        for (const suit of config.suits) {
            for (const rank of config.ranks) {
                newDeck.push({ id: `card-${suit}-${rank}-${d}`, suit, rank, isJoker: false });
            }
        }
    }
    for (let j = 0; j < config.numJokers; j++) {
        newDeck.push({ id: `card-joker-${j}`, suit: "joker", rank: "Joker", isJoker: true });
    }
    return newDeck;
}

export function shuffleAndSetDeck() {
    let newDeck = createDeck();
    shuffleArray(newDeck);
    setDeck(newDeck);
}

export function dealCards(numCards) {
    const currentDeck = getGameState().deck;
    if (currentDeck.length < numCards) {
        console.warn("Not enough cards in deck for dealing!");
        // TODO: Implement reshuffling discard pile if needed in the future
        if (currentDeck.length === 0) return [];
        const dealt = currentDeck.splice(0, currentDeck.length);
        setDeck(currentDeck);
        return dealt;
    }
    const dealtCards = currentDeck.splice(0, numCards);
    setDeck(currentDeck);
    return dealtCards;
}