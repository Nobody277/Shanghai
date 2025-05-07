import * as dom from './domElements.js';
import * as config from '../config.js';
import { getGameState } from '../game/state.js';
import { handleDiscardCard } from '../game/player.js';
import { handleDrawFromDiscard } from '../game/player.js';

export function createCardElement(cardData) {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.dataset.cardId = cardData.id;

    if (cardData.isJoker) {
        cardDiv.classList.add("joker");
        cardDiv.innerHTML = `
            <span class="rank" style="font-size: 12px; text-align: center; margin-top: 5px;">JOKER</span>
            <span class="suit" style="font-size: 30px; text-align: center;">${config.suitSymbols.joker}</span>
            <span class="rank" style="font-size: 12px; text-align: center; transform: rotate(180deg); margin-bottom: 5px;">JOKER</span>`;
        cardDiv.dataset.isJoker = "true";
    } else {
        cardDiv.classList.add(cardData.suit);
        const suitSymbol = config.suitSymbols[cardData.suit];
        cardDiv.innerHTML = `
            <span class="rank">${cardData.rank}</span>
            <span class="suit">${suitSymbol}</span>
            ${['J', 'Q', 'K', 'A'].includes(cardData.rank) ? `<span class="center-suit">${suitSymbol}</span>` : ''}`;
        cardDiv.dataset.isJoker = "false";
    }

    cardDiv.dataset.rank = cardData.rank;
    cardDiv.dataset.suit = cardData.suit;

    return cardDiv;
}

export function displayPlayerHand() {
    if (!dom.playerHandElement) return;
    const { playerHand, turnPhase, currentPlayerIndex } = getGameState();
    dom.playerHandElement.innerHTML = "";

    if (playerHand.length === 0) {
        dom.playerHandElement.innerHTML = '<div class="text-xs italic opacity-75 p-4">Hand is empty</div>';
        return;
    }

    const isPlayerTurn = currentPlayerIndex === 0;
    const isDiscardPhase = turnPhase === 'discard';

    playerHand.forEach((cardData) => {
        const cardElement = createCardElement(cardData);

        if (isPlayerTurn && isDiscardPhase) {
            cardElement.classList.add('discardable');
            cardElement.style.cursor = 'pointer';
            cardElement.addEventListener('click', handleDiscardCard);
        } else {
            cardElement.style.cursor = 'default';
        }

        dom.playerHandElement.appendChild(cardElement);
    });
}

export function displayDiscardPile() {
    if (!dom.discardPileElement) return;
    const { discardPile, turnPhase, currentPlayerIndex } = getGameState();
    dom.discardPileElement.innerHTML = "";

    if (discardPile.length > 0) {
        const topCardData = discardPile[discardPile.length - 1];
        const cardElement = createCardElement(topCardData);
        cardElement.classList.add('top-discard');

        if (currentPlayerIndex === 0 && turnPhase === 'draw') {
            cardElement.style.cursor = 'pointer';
            cardElement.addEventListener('click', handleDrawFromDiscard);
        } else {
            cardElement.style.cursor = 'default';
        }

        dom.discardPileElement.appendChild(cardElement);
    } else {
        dom.discardPileElement.innerHTML = '<div class="discard-pile-placeholder"></div>';
    }
}

export function setupOpponentsUI(opponentCount) {
    if (!dom.opponentsArea) return;
    dom.opponentsArea.innerHTML = "";

    for (let i = 0; i < opponentCount; i++) {
        const opponentId = i + 1;
        const opponentDiv = document.createElement("div");
        opponentDiv.classList.add("opponent");
        opponentDiv.dataset.opponentId = opponentId;
        opponentDiv.innerHTML = `
            <div class="fan-icon">
                <div class="fan-card"></div>
                <div class="fan-card"></div>
                <div class="fan-card"></div>
                <div class="fan-card"></div>
                <div class="fan-card"></div>
            </div>
            <div class="card-count">?</div>`;
        dom.opponentsArea.appendChild(opponentDiv);
    }
}

export function setOpponentCardCounts() {
    const { opponents } = getGameState();
    if (!dom.opponentsArea || !opponents) return;

    opponents.forEach(opponent => {
        const opponentDiv = dom.opponentsArea.querySelector(`.opponent[data-opponent-id="${opponent.id}"]`);
        if (opponentDiv) {
            const counter = opponentDiv.querySelector('.card-count');
            if (counter) {
                counter.textContent = opponent.hand ? opponent.hand.length : '?';
            }
        }
    });
}

function playSound(soundElement) {
    if (soundElement && soundElement.src && soundElement.src !== window.location.href) {
        soundElement.volume = 0.4;
        soundElement.currentTime = 0;
        soundElement.play().catch(error => console.error("Audio play failed:", error));
    }
}
