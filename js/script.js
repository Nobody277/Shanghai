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
    spade: "♠"
};

let deck = [];
let playerHand = [];
let discardPile = [];

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
                newDeck.push({ suit, rank });
            }
        }
    }
    for (let j = 0; j < numJokers; j++) {
        newDeck.push({ suit: "joker", rank: "Joker", isJoker: true });
    }
    return newDeck;
}

function shuffleDeck(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function dealCards(numCards) {
    if (deck.length < numCards) {
        console.error("Not enough cards in deck to deal!");
        return [];
    }
    return deck.splice(0, numCards);
}

function createCardElement(cardData) {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");

    if (cardData.isJoker) {
        cardDiv.classList.add("joker");
        cardDiv.innerHTML = `
            <span class="rank" style="font-size: 12px; text-align: center; margin-top: 5px;">JOKER</span>
            <span class="suit" style="font-size: 30px; text-align: center;">🃏</span>
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

    return cardDiv;
}

function displayPlayerHand(hand) {
    if (!playerHandElement) return;

    playerHandElement.innerHTML = "";
    if (hand.length === 0) {
         playerHandElement.innerHTML = '<div class="text-xs italic opacity-75 p-4">Hand is empty</div>';
    } else {
        hand.forEach(cardData => {
            const cardElement = createCardElement(cardData);
            playerHandElement.appendChild(cardElement);
        });
    }
}

function initializeGame(playerCount) {
    setupOpponentsUI(playerCount - 1);

    deck = createDeck(2, 4);
    shuffleDeck(deck);

    const initialCardCount = 11;
    playerHand = dealCards(initialCardCount);

    let opponentCardCounts = [];
    for (let i = 0; i < playerCount - 1; i++) {
        dealCards(initialCardCount);
        opponentCardCounts.push(initialCardCount);
    }
    setOpponentCardCounts(initialCardCount);

    displayPlayerHand(playerHand);

    updateStats({
        round: 1,
        score: 0,
        deckCount: deck.length,
        currentPlayer: "You",
    });
}

function setupOpponentsUI(opponentCount) {
    if (!opponentsArea) return;
    opponentsArea.innerHTML = "";

    for (let i = 0; i < opponentCount; i++) {
        const opponentDiv = document.createElement("div");
        opponentDiv.classList.add("opponent");
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

function setOpponentCardCounts(count) {
    if (!opponentsArea) return;
    const opponentCounters =
        opponentsArea.querySelectorAll(".opponent .card-count");
    opponentCounters.forEach((counter) => {
        counter.textContent = count;
    });
}

function updateStats(stats = {}) {
    if (roundEl) roundEl.textContent = stats.round ?? "?";
    if (scoreEl) scoreEl.textContent = stats.score ?? "0";
    if (deckCountEl) deckCountEl.textContent = stats.deckCount ?? "?";
    if (currentPlayerEl)
        currentPlayerEl.textContent = stats.currentPlayer ?? "?";
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