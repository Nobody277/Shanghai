import * as dom from '../ui/domElements.js';
import { getGameState, addCardToPlayerHand, removeCardFromPlayerHand, popDiscardPile, shiftDeck, updateState, addCardToDiscardPile } from './state.js';
import { endTurn, updateGameAfterAction } from './turnManager.js';
import { animateFlyingCard, getElementsRects } from '../ui/animations.js';
import { displayPlayerHand, displayDiscardPile } from '../ui/gameBoard.js';

const FLIP_DURATION = 600;
const FLIP_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

function getKeyFromElement(element) {
    return element?.dataset?.cardId;
}

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

export async function handleDrawFromDeck() {
    const { turnPhase, currentPlayerIndex, deck } = getGameState();
    if (turnPhase !== 'draw' || currentPlayerIndex !== 0 || deck.length === 0) return;
    if (dom.deckPileElement.dataset.animating === 'true') return;

    dom.deckPileElement.dataset.animating = 'true';
    const drawButton = dom.deckPileElement.querySelector('.deck-card');
    const firstHandCardElements = dom.playerHandElement.querySelectorAll('.card');
    const firstRects = getElementsRects(firstHandCardElements, getKeyFromElement);
    const startRect = drawButton.getBoundingClientRect();
    const drawnCardData = deck[0];
    const newCardId = drawnCardData.id;

    shiftDeck();
    addCardToPlayerHand(drawnCardData);
    updateState({ turnPhase: 'wait_anim' });
    displayPlayerHand();
    const lastHandCardElements = dom.playerHandElement.querySelectorAll('.card');
    const newCardElement = dom.playerHandElement.querySelector(`.card[data-card-id="${newCardId}"]`);

    if (!newCardElement) {
        console.error("Newly drawn card element not found!");
        updateState({ turnPhase: 'discard' });
        updateGameAfterAction();
        dom.deckPileElement.dataset.animating = 'false';
        return;
    }

    newCardElement.style.opacity = '0';
    const lastRects = getElementsRects(lastHandCardElements, getKeyFromElement);
    const targetRectInHand = newCardElement.getBoundingClientRect();
    const animations = [];

    lastHandCardElements.forEach(cardEl => {
        const cardId = getKeyFromElement(cardEl);
        if (cardId === newCardId) return;
        const firstRect = firstRects.get(cardId);
        const lastRect = lastRects.get(cardId);
        if (firstRect && lastRect) {
            const dx = firstRect.left - lastRect.left;
            const dy = firstRect.top - lastRect.top;
            cardEl.style.transform = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 ? `translate(${dx}px, ${dy}px)` : 'none';
        }
    });

    lastHandCardElements.forEach(cardEl => {
        if (getKeyFromElement(cardEl) === newCardId) return;
        const anim = cardEl.animate(
            [{ transform: cardEl.style.transform }, { transform: 'none' }],
            { duration: FLIP_DURATION, easing: FLIP_EASING }
        );
        animations.push(anim.finished);
        anim.onfinish = () => { cardEl.style.transform = ''; };
    });

    let flyingElement = null;
    const flyingCardPromise = animateFlyingCard({
        startRect: startRect,
        endRect: targetRectInHand,
        cardData: drawnCardData,
        duration: FLIP_DURATION,
        easing: FLIP_EASING,
    }).then(element => {
        flyingElement = element;
    });
    animations.push(flyingCardPromise);

    try {
        await Promise.all(animations);
        if (flyingElement) flyingElement.remove();
        if (newCardElement) newCardElement.style.opacity = '1';
        updateState({ turnPhase: 'discard' });
        updateGameAfterAction();
    } catch (error) {
        console.error("Draw animation failed:", error);
        if (flyingElement) flyingElement.remove();
        if (newCardElement) newCardElement.style.opacity = '1';
        updateState({ turnPhase: 'discard' });
        updateGameAfterAction();
    } finally {
        dom.deckPileElement.dataset.animating = 'false';
    }
}

export async function handleDrawFromDiscard() {
    const { turnPhase, currentPlayerIndex, discardPile } = getGameState();
    if (turnPhase !== 'draw' || currentPlayerIndex !== 0 || discardPile.length === 0) return;

    const topDiscardElement = dom.discardPileElement.querySelector('.card.top-discard');
    if (!topDiscardElement || topDiscardElement.dataset.animating === 'true') return;

    topDiscardElement.dataset.animating = 'true';
    const firstHandCardElements = dom.playerHandElement.querySelectorAll('.card');
    const firstRects = getElementsRects(firstHandCardElements, getKeyFromElement);
    const startRect = topDiscardElement.getBoundingClientRect();
    const drawnCardData = discardPile[discardPile.length - 1];
    const newCardId = drawnCardData.id;

    popDiscardPile();
    addCardToPlayerHand(drawnCardData);
    updateState({ turnPhase: 'wait_anim' });
    displayPlayerHand();
    displayDiscardPile();
    const lastHandCardElements = dom.playerHandElement.querySelectorAll('.card');
    const newCardElement = dom.playerHandElement.querySelector(`.card[data-card-id="${newCardId}"]`);

    if (!newCardElement) {
        console.error("Drawn (discard) card element not found!");
        updateState({ turnPhase: 'discard' });
        updateGameAfterAction();
        if (topDiscardElement) topDiscardElement.dataset.animating = 'false';
        return;
    }

    newCardElement.style.opacity = '0';
    const lastRects = getElementsRects(lastHandCardElements, getKeyFromElement);
    const targetRectInHand = newCardElement.getBoundingClientRect();
    const animations = [];

    lastHandCardElements.forEach(cardEl => {
        const cardId = getKeyFromElement(cardEl);
        if (cardId === newCardId) return;
        const firstRect = firstRects.get(cardId);
        const lastRect = lastRects.get(cardId);
        if (firstRect && lastRect) {
            const dx = firstRect.left - lastRect.left;
            const dy = firstRect.top - lastRect.top;
            cardEl.style.transform = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 ? `translate(${dx}px, ${dy}px)` : 'none';
        }
    });

    lastHandCardElements.forEach(cardEl => {
        if (getKeyFromElement(cardEl) === newCardId) return;
        const anim = cardEl.animate(
            [{ transform: cardEl.style.transform }, { transform: 'none' }],
            { duration: FLIP_DURATION, easing: FLIP_EASING }
        );
        animations.push(anim.finished);
        anim.onfinish = () => { cardEl.style.transform = ''; };
    });

    let flyingElement = null;
    const flyingCardPromise = animateFlyingCard({
        startRect: startRect,
        endRect: targetRectInHand,
        cardData: drawnCardData,
        duration: FLIP_DURATION,
        easing: FLIP_EASING,
    }).then(element => {
        flyingElement = element;
    });
    animations.push(flyingCardPromise);

    try {
        await Promise.all(animations);
        if (flyingElement) flyingElement.remove();
        if (newCardElement) newCardElement.style.opacity = '1';
        updateState({ turnPhase: 'discard' });
        updateGameAfterAction();
    } catch (error) {
        console.error("Draw from discard animation failed:", error);
        if (flyingElement) flyingElement.remove();
        if (newCardElement) newCardElement.style.opacity = '1';
        updateState({ turnPhase: 'discard' });
        updateGameAfterAction();
    } finally {
        const currentTopDiscard = dom.discardPileElement.querySelector('.card.top-discard');
        if (currentTopDiscard) currentTopDiscard.dataset.animating = 'false';
    }
}

export async function handleDiscardCard(event) {
    const { turnPhase, currentPlayerIndex, playerHand } = getGameState();
    if (turnPhase !== 'discard' || currentPlayerIndex !== 0) return;

    const clickedCardElement = event.currentTarget;
    if (clickedCardElement.dataset.animating === 'true') return;

    clickedCardElement.dataset.animating = 'true';
    const cardIdToDiscard = getKeyFromElement(clickedCardElement);
    const cardIndex = playerHand.findIndex(card => card.id === cardIdToDiscard);
    if (cardIndex === -1) {
        console.error("Card to discard not found in state:", cardIdToDiscard);
        clickedCardElement.dataset.animating = 'false';
        return;
    }
    const discardedCardData = { ...playerHand[cardIndex] };
    const firstHandCardElements = dom.playerHandElement.querySelectorAll('.card');
    const firstRects = getElementsRects(firstHandCardElements, getKeyFromElement);
    const startRect = firstRects.get(cardIdToDiscard);
    if (!startRect) {
        console.error("Could not get starting rect for discarded card.");
        clickedCardElement.dataset.animating = 'false';
        return;
    }

    const targetRect = calculateDiscardPileTargetRect(dom.discardPileElement);
    removeCardFromPlayerHand(cardIdToDiscard);
    addCardToDiscardPile(discardedCardData);
    updateState({ turnPhase: 'wait_anim' });
    displayPlayerHand();
    const lastHandCardElements = dom.playerHandElement.querySelectorAll('.card');
    const lastRects = getElementsRects(lastHandCardElements, getKeyFromElement);
    const animations = [];

    lastHandCardElements.forEach(cardEl => {
        const cardId = getKeyFromElement(cardEl);
        const firstRect = firstRects.get(cardId);
        const lastRect = lastRects.get(cardId);
        if (firstRect && lastRect) {
            const dx = firstRect.left - lastRect.left;
            const dy = firstRect.top - lastRect.top;
            cardEl.style.transform = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1 ? `translate(${dx}px, ${dy}px)` : 'none';
        }
    });

    lastHandCardElements.forEach(cardEl => {
        const anim = cardEl.animate(
            [{ transform: cardEl.style.transform }, { transform: 'none' }],
            { duration: FLIP_DURATION, easing: FLIP_EASING }
        );
        animations.push(anim.finished);
        anim.onfinish = () => { cardEl.style.transform = ''; };
    });

    let flyingElement = null;
    const flyingCardPromise = animateFlyingCard({
        startRect: startRect,
        endRect: targetRect,
        cardData: discardedCardData,
        duration: FLIP_DURATION * 0.9,
        easing: FLIP_EASING,
    }).then(element => {
        flyingElement = element;
    });
    animations.push(flyingCardPromise);

    try {
        await Promise.all(animations);
        if (flyingElement) flyingElement.remove();
        displayDiscardPile();
        endTurn();
    } catch (error) {
        console.error("Discard animation failed:", error);
        if (flyingElement) flyingElement.remove();
        displayDiscardPile();
        endTurn();
    }
}

function calculateDiscardPileTargetRect(discardPileElement) {
    const rect = discardPileElement.getBoundingClientRect();
    const targetWidth = 70;
    const targetHeight = 100;
    return {
        left: rect.left + window.scrollX + (rect.width / 2) - (targetWidth / 2),
        top: rect.top + window.scrollY + (rect.height / 2) - (targetHeight / 2),
        width: targetWidth,
        height: targetHeight
    };
}
