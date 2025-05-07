import * as config from '../config.js';

let state = {
    deck: [],
    playerHand: [],
    discardPile: [],
    opponents: [],
    currentPlayerIndex: 0,
    currentRound: 1,
    playerScore: 0,
    turnPhase: 'waiting',
    selectedPlayerCount: null,
    isGameOver: false,
};

export function getGameState() {
    return { ...state };
}

export function updateState(newState) {
    state = { ...state, ...newState };
}

export function resetState() {
    state = {
        deck: [],
        playerHand: [],
        discardPile: [],
        opponents: [],
        currentPlayerIndex: 0,
        currentRound: 1,
        playerScore: 0,
        turnPhase: 'waiting',
        selectedPlayerCount: state.selectedPlayerCount,
        isGameOver: false,
    };
}

export function setDeck(newDeck) {
    state.deck = newDeck;
}

export function setPlayerHand(newHand) {
    state.playerHand = newHand;
}

export function setDiscardPile(newPile) {
    state.discardPile = newPile;
}

export function addCardToPlayerHand(card) {
    state.playerHand.push(card);
}

export function removeCardFromPlayerHand(cardId) {
    const cardIndex = state.playerHand.findIndex(card => card.id === cardId);
    if (cardIndex > -1) {
        return state.playerHand.splice(cardIndex, 1)[0];
    }
    return null;
}

export function addCardToDiscardPile(card) {
    state.discardPile.push(card);
}

export function popDiscardPile() {
    return state.discardPile.pop();
}

export function shiftDeck() {
    return state.deck.shift();
}

export function setOpponents(newOpponents) {
    state.opponents = newOpponents;
}

export function setOpponentHand(opponentId, hand) {
    const opponent = state.opponents.find(o => o.id === opponentId);
    if (opponent) {
        opponent.hand = hand;
    }
}

export function addCardToOpponentHand(opponentId, card) {
    const opponent = state.opponents.find(o => o.id === opponentId);
    if (opponent) {
        opponent.hand.push(card);
    }
}

export function removeCardFromOpponentHand(opponentId, cardIndex) {
    const opponent = state.opponents.find(o => o.id === opponentId);
    if (opponent && cardIndex >= 0 && cardIndex < opponent.hand.length) {
        return opponent.hand.splice(cardIndex, 1)[0];
    }
    return null;
}
