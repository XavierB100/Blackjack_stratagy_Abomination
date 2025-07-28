// Optimized Game State Management
const GameState = {
    deck: [],
    playerHands: [],
    currentHandIndex: 0,
    dealerHand: [],
    gameOver: false,
    runningCount: 0,
    cardsDealt: 0,
    totalDecks: 6,
    initialDeckSize: 312, // 6 * 52

    // Performance optimization: Cache frequently accessed values
    _decksLeft: 6.0,
    _trueCount: 0.0,
    _penetration: 0,

    // Reset state
    reset() {
        this.playerHands = [];
        this.currentHandIndex = 0;
        this.dealerHand = [];
        this.gameOver = false;
        this.runningCount = 0;
        this.cardsDealt = 0;
        this._decksLeft = 6.0;
        this._trueCount = 0.0;
        this._penetration = 0;
    }
};

// Legacy support - keep global variables for backward compatibility
let deck = GameState.deck;
let playerHands = GameState.playerHands;
let currentHandIndex = GameState.currentHandIndex;
let dealerHand = GameState.dealerHand;
let gameOver = GameState.gameOver;
let runningCount = GameState.runningCount;
let cardsDealt = GameState.cardsDealt;
let totalDecks = GameState.totalDecks;
let initialDeckSize = GameState.initialDeckSize;

// Enhanced game statistics
let gameStats = {
    played: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    blackjackWins: 0,
    doubles: 0,
    splits: 0
};

// Dealer rules configuration
const dealerRules = {
    hitSoft17: true, // Most common rule
    doubleAfterSplit: true,
    surrender: true // Enable surrender
};

// Bankroll management
let bankroll = 10000;
let currentBet = 25;
let handHistory = [];
let sessionStats = {
    startTime: Date.now(),
    totalBet: 0,
    totalWon: 0,
    netProfit: 0
};

// Card values and suits
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const cardValues = {
    'A': 11, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10
};

// Optimized deck initialization and card dealing
function createDeck() {
    // Performance optimization: Pre-allocate array size
    const deckSize = totalDecks * 52;
    deck = new Array(deckSize);

    let index = 0;
    for (let d = 0; d < totalDecks; d++) {
        for (let suit of suits) {
            for (let rank of ranks) {
                deck[index++] = {
                    rank: rank,
                    suit: suit,
                    value: cardValues[rank]
                };
            }
        }
    }

    initialDeckSize = deck.length;
    GameState.initialDeckSize = deck.length;
    shuffleDeck();
}

function shuffleDeck() {
    // Optimized Fisher-Yates shuffle
    const len = deck.length;
    for (let i = len - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements
        const temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }

    // Reset counters
    runningCount = 0;
    cardsDealt = 0;
    GameState.runningCount = 0;
    GameState.cardsDealt = 0;
    updateCountDisplay();
}

function dealCard() {
    if (deck.length === 0) {
        createDeck();
    }
    const card = deck.pop();
    cardsDealt++;
    GameState.cardsDealt = cardsDealt;
    updateCount(card);
    return card;
}

// Optimized card counting with lookup table
const countValues = {
    '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
    '7': 0, '8': 0, '9': 0,
    '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
};

function updateCount(card) {
    const countValue = countValues[card.rank];
    if (countValue !== undefined) {
        runningCount += countValue;
        GameState.runningCount = runningCount;
    }
    updateCountDisplay();
}

function updateCountDisplay() {
    // Performance optimization: Cache calculations
    const decksLeft = Math.max(0.5, Math.round((deck.length / 52) * 10) / 10);
    const trueCount = decksLeft > 0 ? runningCount / decksLeft : 0;
    const penetration = ((initialDeckSize - deck.length) / initialDeckSize) * 100;

    // Cache values for performance
    GameState._decksLeft = decksLeft;
    GameState._trueCount = trueCount;
    GameState._penetration = penetration;

    // Reshuffle at 75% penetration (industry standard)
    if (penetration >= 75) {
        createDeck();
        return;
    }

    const runningCountElement = document.getElementById('runningCount');
    const trueCountElement = document.getElementById('trueCount');
    const decksLeftElement = document.getElementById('decksLeft');
    const penetrationElement = document.getElementById('penetration');

    if (runningCountElement) runningCountElement.textContent = runningCount;
    if (trueCountElement) trueCountElement.textContent = trueCount.toFixed(1);
    if (decksLeftElement) decksLeftElement.textContent = decksLeft.toFixed(1);
    if (penetrationElement) penetrationElement.textContent = penetration.toFixed(1) + '%';

    // Update optimal bet based on count
    updateOptimalBet(trueCount);

    const bettingAdvice = document.getElementById('bettingAdvice');
    if (bettingAdvice) {
        if (trueCount >= 2) {
            bettingAdvice.textContent = `🔥 RAISE YOUR BET! True count is +${trueCount.toFixed(1)} (Favorable)`;
            bettingAdvice.style.background = 'rgba(34, 197, 94, 0.3)';
            bettingAdvice.style.borderColor = '#22c55e';
        } else {
            bettingAdvice.textContent = `Bet table minimum - True count: ${trueCount.toFixed(1)} (Not favorable)`;
            bettingAdvice.style.background = 'rgba(239, 68, 68, 0.2)';
            bettingAdvice.style.borderColor = '#ef4444';
        }
    }
}

function updateOptimalBet(trueCount) {
    const optimalBetElement = document.getElementById('optimalBet');
    if (optimalBetElement) {
        let optimalBet = currentBet;
        if (trueCount >= 2) {
            optimalBet = Math.min(currentBet * Math.floor(trueCount), bankroll * 0.02);
        }
        optimalBetElement.textContent = Math.round(optimalBet);
    }
}

function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;

    for (let card of hand) {
        value += card.value;
        if (card.rank === 'A') aces++;
    }

    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }

    return value;
}

function hasUsableAce(hand) {
    let value = 0;
    let aces = 0;

    for (let card of hand) {
        value += card.value;
        if (card.rank === 'A') aces++;
    }

    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }

    return aces > 0;
}

function isPair(hand) {
    return hand.length === 2 && hand[0].rank === hand[1].rank;
}

function canSplit() {
    if (playerHands.length >= 4) return false; // Max 4 hands
    const currentHand = playerHands[currentHandIndex];
    return currentHand && currentHand.length === 2 && currentHand[0].rank === currentHand[1].rank;
}

function canDouble() {
    const currentHand = playerHands[currentHandIndex];
    return currentHand && currentHand.length === 2;
}

function canSurrender() {
    const currentHand = playerHands[currentHandIndex];
    return dealerRules.surrender && currentHand && currentHand.length === 2 && playerHands.length === 1;
}

function addToHandHistory(result, playerHand, dealerHand, bet) {
    handHistory.push({
        timestamp: Date.now(),
        result: result,
        playerHand: playerHand.map(card => `${card.rank}${card.suit}`),
        dealerHand: dealerHand.map(card => `${card.rank}${card.suit}`),
        bet: bet,
        count: runningCount
    });

    // Keep only last 50 hands
    if (handHistory.length > 50) {
        handHistory.shift();
    }
}

// Export functions for use in other modules
window.gameModule = {
    createDeck,
    dealCard,
    calculateHandValue,
    hasUsableAce,
    isPair,
    canSplit,
    canDouble,
    canSurrender,
    updateCountDisplay,
    addToHandHistory,
    gameStats,
    sessionStats,
    bankroll,
    currentBet,
    handHistory,
    playerHands,
    currentHandIndex,
    dealerHand,
    gameOver,
    runningCount,
    dealerRules,
    cardValues
};
