const themeToggle = document.getElementById("theme-toggle");
const htmlElement = document.documentElement;

const menuContainer = document.getElementById("menu-container");
const playerOptionsContainer = document.getElementById("player-options");
const startGameBtn = document.getElementById("start-game-btn");

const gameArea = document.getElementById("game-area");
const infoContainer = document.getElementById("info-container");
const infoToggle = document.getElementById("info-toggle");
const infoPanel = document.getElementById("info-panel");
const opponentsArea = document.getElementById("opponents-area");
const centerArea = document.getElementById("center-area");
const playerArea = document.getElementById("player-area");
const playerHandElement = document.getElementById("player-hand");
const deckPileElement = document.getElementById("deck-pile");
const discardPileElement = document.getElementById("discard-pile");
const cardPopSound = document.getElementById("card-pop-sound");

const roundEl = document.getElementById("stat-round");
const scoreEl = document.getElementById("stat-score");
const deckCountEl = document.getElementById("stat-deck-count");
const currentPlayerEl = document.getElementById("stat-current-player");

let isThemeAnimating = false;
let selectedPlayerCount = null;
const minPlayers = 3;
const maxPlayers = 6;

const suits = ["heart", "diamond", "club", "spade"];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const suitSymbols = {
    heart: "♥",
    diamond: "♦",
    club: "♣",
    spade: "♠",
    joker: '🃏'
};

let deck = [];
let playerHand = [];
let discardPile = [];
let opponents = [];
let currentPlayerIndex = 0;
let currentRound = 1;
let playerScore = 0;
let turnPhase = 'waiting';

function toggleTheme() {
    if (isThemeAnimating || !themeToggle) return;

    isThemeAnimating = true;
    themeToggle.classList.add("rolling");

    const isDark = htmlElement.classList.contains("dark");
    if (isDark) {
        htmlElement.classList.remove("dark");
        htmlElement.classList.add("light");
        localStorage.setItem("theme", "light");
    } else {
        htmlElement.classList.remove("light");
        htmlElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    }

    const visibleIcon = themeToggle.querySelector(
        isDark ? ".sun-icon" : ".moon-icon"
    );
    if (visibleIcon) {
        visibleIcon.style.animation = "none";
        setTimeout(() => {
            visibleIcon.style.animation = "";
            visibleIcon.classList.add("rolling-effect");
        }, 0);
    }

    setTimeout(() => {
        themeToggle.classList.remove("rolling");
        if (visibleIcon) {
            visibleIcon.classList.remove("rolling-effect");
        }
        isThemeAnimating = false;
    }, 500);
}

function toggleInfoPanel() {
    if (infoContainer) {
        infoContainer.classList.toggle("info-open");
    }
}

function createPlayerButtons() {
    if (!playerOptionsContainer) return;

    playerOptionsContainer.innerHTML = "";

    for (let i = minPlayers; i <= maxPlayers; i++) {
        const button = document.createElement("button");
        button.classList.add("btn", "player-btn");
        button.textContent = i;
        button.dataset.count = i;

        button.addEventListener("click", handlePlayerSelect);
        playerOptionsContainer.appendChild(button);
    }
}

function handlePlayerSelect(event) {
    const clickedButton = event.target;
    const count = parseInt(clickedButton.dataset.count, 10);

    if (!playerOptionsContainer) return;

    const allPlayerButtons =
        playerOptionsContainer.querySelectorAll(".player-btn");
    allPlayerButtons.forEach((btn) => btn.classList.remove("active"));

    clickedButton.classList.add("active");

    selectedPlayerCount = count;

    if (startGameBtn) {
        startGameBtn.disabled = false;
    }
}

function handleStartGame() {
    if (selectedPlayerCount !== null) {
        if (menuContainer) {
            menuContainer.classList.add("hidden");
        }
        if (gameArea) {
            gameArea.classList.remove("hidden");
        }
        initializeGame(selectedPlayerCount);
    } else {
        alert("Please select the number of players first.");
    }
}

function createDeck(numDecks = 2, numJokers = 4) {
    const newDeck = [];
    for (let d = 0; d < numDecks; d++) {
        for (const suit of suits) {
            for (const rank of ranks) {
                newDeck.push({ id: `card-${suit}-${rank}-${d}`, suit, rank });
            }
        }
    }
    for (let j = 0; j < numJokers; j++) {
        newDeck.push({ id: `card-joker-${j}`, suit: "joker", rank: "Joker", isJoker: true });
    }
    return newDeck;
}

// Fisher–Yates shuffle algorithm
function shuffleDeck(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function dealCards(numCards) {
    if (deck.length < numCards) {
        console.warn("Not enough cards in deck, reshuffling discard pile.");
        // Reshuffle logic would go here if needed
        if(deck.length === 0) return [];
    }
    return deck.splice(0, numCards);
}

function createCardElement(cardData) {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.dataset.cardId = cardData.id;

    if (cardData.isJoker) {
        cardDiv.classList.add("joker");
        cardDiv.innerHTML = `
            <span class="rank" style="font-size: 12px; text-align: center; margin-top: 5px;">JOKER</span>
            <span class="suit" style="font-size: 30px; text-align: center;">${suitSymbols.joker}</span>
            <span class="rank" style="font-size: 12px; text-align: center; transform: rotate(180deg); margin-bottom: 5px;">JOKER</span>`;
    } else {
        cardDiv.classList.add(cardData.suit);
        const suitSymbol = suitSymbols[cardData.suit];
        cardDiv.innerHTML = `
            <span class="rank">${cardData.rank}</span>
            <span class="suit">${suitSymbol}</span>
            ${['J', 'Q', 'K', 'A'].includes(cardData.rank) ? `<span class="center-suit">${suitSymbol}</span>` : ''}
            `;
    }
    cardDiv.dataset.rank = cardData.rank;
    cardDiv.dataset.suit = cardData.suit;
    if (cardData.isJoker) {
        cardDiv.dataset.isJoker = "true";
    }

    return cardDiv;
}

function displayPlayerHand(hand) {
    if (!playerHandElement) return;
    playerHandElement.innerHTML = "";

    if (hand.length === 0) {
        playerHandElement.innerHTML = '<div class="text-xs italic opacity-75 p-4">Hand is empty</div>';
        return;
    }

    const lastCardIndex = hand.length - 1;

    hand.forEach((cardData, index) => {
        const cardElement = createCardElement(cardData);
        if (turnPhase === 'discard') {
            cardElement.classList.add('discardable');
            cardElement.addEventListener('click', handleDiscardCard);
        } else {
            cardElement.classList.remove('discardable');
        }
        if (index === lastCardIndex && currentPlayerIndex === 0 && turnPhase === 'discard') {
            cardElement.classList.add('card-pop-in');

            if (cardPopSound && cardPopSound.src && cardPopSound.src !== window.location.href) {
                cardPopSound.volume = 0.4;
                cardPopSound.currentTime = 0;
                cardPopSound.play().catch(error => console.error("Audio play failed:", error));
            }

            cardElement.addEventListener('animationend', () => {
                cardElement.classList.remove('card-pop-in');
            }, { once: true });
        }
        playerHandElement.appendChild(cardElement);
    });
}

function displayDiscardPile() {
    if (!discardPileElement) return;
    discardPileElement.innerHTML = "";

    if (discardPile.length > 0) {
        const topCardData = discardPile[discardPile.length - 1];
        const cardElement = createCardElement(topCardData);
        cardElement.classList.add('top-discard');
        if (turnPhase === 'draw') {
            cardElement.addEventListener('click', handleDrawFromDiscard);
            cardElement.style.cursor = 'pointer';
        } else {
            cardElement.style.cursor = 'default';
        }
        discardPileElement.appendChild(cardElement);
    } else {
        discardPileElement.innerHTML = '<div class="discard-pile-placeholder"></div>';
    }
}

function initializeGame(playerCount) {
    deck = createDeck(2, 4);
    shuffleDeck(deck);

    setupOpponentsUI(playerCount - 1);

    const initialCardCount = 11;
    playerHand = dealCards(initialCardCount);

    opponents.forEach(opponent => {
        opponent.hand = dealCards(initialCardCount);
    });

    discardPile = [];

    currentPlayerIndex = 0;
    turnPhase = 'draw';

    addGameEventListeners();
    displayPlayerHand(playerHand);
    displayDiscardPile();
    setOpponentCardCounts();
    updateStats();
}

function addGameEventListeners() {
   if (deckPileElement) {
       deckPileElement.removeEventListener('click', handleDrawFromDeck);
        if (turnPhase === 'draw') {
           deckPileElement.addEventListener('click', handleDrawFromDeck);
           deckPileElement.style.cursor = 'pointer';
        } else {
            deckPileElement.style.cursor = 'default';
        }
   }
}

function handleDrawFromDeck() {
    if (turnPhase !== 'draw' || currentPlayerIndex !== 0 || deck.length === 0) return;

    if (document.querySelector('.card-draw-animation')) return;

    const drawnCardData = deck.shift();
    const tempCardElement = createCardElement(drawnCardData);
    const deckRect = deckPileElement.getBoundingClientRect();
    const relativeParent = gameArea.offsetParent || document.body;
    const parentRect = relativeParent.getBoundingClientRect();
    const startTop = deckRect.top - parentRect.top;
    const startLeft = deckRect.left - parentRect.left;

    tempCardElement.style.position = 'absolute';
    tempCardElement.style.top = `${startTop}px`;
    tempCardElement.style.left = `${startLeft}px`;
    relativeParent.appendChild(tempCardElement);

    requestAnimationFrame(() => {
        tempCardElement.classList.add('card-draw-animation');
    });

    tempCardElement.addEventListener('animationend', () => {
        tempCardElement.remove();
        playerHand.push(drawnCardData);
        turnPhase = 'discard';
        updateGameAfterAction();
    }, { once: true });

    updateStats();
}

function handleDrawFromDiscard() {
    if (turnPhase !== 'draw' || currentPlayerIndex !== 0 || discardPile.length === 0) return;

    const drawnCard = discardPile.pop();
    playerHand.push(drawnCard);
    turnPhase = 'discard';

    console.log("Drew from discard:", drawnCard);

    updateGameAfterAction();
}

function handleDiscardCard(event) {
    if (turnPhase !== 'discard' || currentPlayerIndex !== 0) return;

    const cardElement = event.currentTarget;
    const cardIdToDiscard = cardElement.dataset.cardId;

    const cardIndex = playerHand.findIndex(card => card.id === cardIdToDiscard);

    if (cardIndex === -1) {
        console.error("Card not found in hand:", cardIdToDiscard);
        return;
    }

    const discardedCard = playerHand.splice(cardIndex, 1)[0];
    discardPile.push(discardedCard);

    console.log("Discarded:", discardedCard);

    endTurn();
}

function updateGameAfterAction() {
    displayPlayerHand(playerHand);
    displayDiscardPile();
    addGameEventListeners();
    updateStats();
}

function endTurn() {
    turnPhase = 'waiting';
    updateGameAfterAction();

    currentPlayerIndex = (currentPlayerIndex + 1) % selectedPlayerCount;
    updateStats();

    if (currentPlayerIndex === 0) {
        startPlayerTurn();
    } else {
        setTimeout(simulateOpponentTurn, 1000);
    }
}

function startPlayerTurn() {
    console.log("Your turn!");
    turnPhase = 'draw';
    updateGameAfterAction();
}

function simulateOpponentTurn() {
    if (currentPlayerIndex === 0) return;

    // Very basic AI: draw from deck, discard randomly
    const opponent = opponents[currentPlayerIndex - 1];

    if (deck.length > 0) {
        const drawnCard = deck.shift();
        opponent.hand.push(drawnCard);
        console.log(`Opponent ${currentPlayerIndex} drew from deck`);
    } else {
        if (discardPile.length > 0) {
            const drawnCard = discardPile.pop();
            opponent.hand.push(drawnCard);
            console.log(`Opponent ${currentPlayerIndex} drew from discard`);
        } else {
            console.log(`Opponent ${currentPlayerIndex} cannot draw, deck and discard empty!`);
            endTurn();
            return;
        }
    }

    // Discard phase (randomly discard)
    if (opponent.hand.length > 0) {
        const discardIndex = Math.floor(Math.random() * opponent.hand.length);
        const discardedCard = opponent.hand.splice(discardIndex, 1)[0];
        discardPile.push(discardedCard);
        console.log(`Opponent ${currentPlayerIndex} discarded`);
    }

    setOpponentCardCounts();
    displayDiscardPile();
    updateStats();

    endTurn();
}

function setupOpponentsUI(opponentCount) {
    if (!opponentsArea) return;
    opponentsArea.innerHTML = "";
    opponents = [];

    for (let i = 0; i < opponentCount; i++) {
        opponents.push({ id: i + 1, hand: [], score: 0 });
        const opponentDiv = document.createElement("div");
        opponentDiv.classList.add("opponent");
        opponentDiv.dataset.opponentId = i + 1;
        opponentDiv.innerHTML = `
            <div class="fan-icon">
                <div class="fan-card"></div>
                <div class="fan-card"></div>
                <div class="fan-card"></div>
                <div class="fan-card"></div>
                <div class="fan-card"></div>
            </div>
            <div class="card-count">?</div>
        `;
        opponentsArea.appendChild(opponentDiv);
    }
}

function setOpponentCardCounts() {
    if (!opponentsArea) return;
    opponents.forEach(opponent => {
        const opponentDiv = opponentsArea.querySelector(`.opponent[data-opponent-id="${opponent.id}"]`);
        if (opponentDiv) {
            const counter = opponentDiv.querySelector('.card-count');
            if(counter) counter.textContent = opponent.hand.length;
        }
    });
}

function updateStats() {
    if (roundEl) roundEl.textContent = currentRound;
    if (scoreEl) scoreEl.textContent = playerScore;
    if (deckCountEl) deckCountEl.textContent = deck.length;
    if (currentPlayerEl) {
        currentPlayerEl.textContent = (currentPlayerIndex === 0) ? "Your Turn" : `Opponent ${currentPlayerIndex}'s Turn`;
    }

    document.body.classList.remove('phase-draw', 'phase-discard', 'phase-waiting');
    if (currentPlayerIndex === 0) {
        document.body.classList.add(`phase-${turnPhase}`);
    } else {
        document.body.classList.add('phase-waiting');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    createPlayerButtons();

    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    } else {
        console.error("Theme toggle button not found.");
    }

    if (infoToggle) {
        infoToggle.addEventListener("click", toggleInfoPanel);
    } else {
        console.error("Info toggle button not found.");
    }

    if (startGameBtn) {
        startGameBtn.addEventListener("click", handleStartGame);
    } else {
        console.error("Start game button not found.");
    }
});