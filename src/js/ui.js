// UI Module - Handles all user interface updates and interactions

function displayCards(hand, containerId, hideSecondCard = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    hand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        if (hideSecondCard && index === 1 && containerId === 'dealerCards' && !gameOver) {
            cardElement.className = 'card card-back';
        } else {
            cardElement.className = 'card';
            if (card.suit === '♥' || card.suit === '♦') {
                cardElement.classList.add('red');
            }
            cardElement.textContent = `${card.rank}${card.suit}`;
        }
        container.appendChild(cardElement);
    });
}

function updateButtonStates() {
    const hitBtn = document.getElementById('hitBtn');
    const standBtn = document.getElementById('standBtn');
    const doubleBtn = document.getElementById('doubleBtn');
    const splitBtn = document.getElementById('splitBtn');
    const surrenderBtn = document.getElementById('surrenderBtn');

    if (!hitBtn || !standBtn || !doubleBtn || !splitBtn || !surrenderBtn) return;

    if (gameOver || playerHands.length === 0) {
        hitBtn.disabled = true;
        standBtn.disabled = true;
        doubleBtn.disabled = true;
        splitBtn.disabled = true;
        surrenderBtn.disabled = true;
        return;
    }

    const currentHand = playerHands[currentHandIndex];
    if (!currentHand) {
        hitBtn.disabled = true;
        standBtn.disabled = true;
        doubleBtn.disabled = true;
        splitBtn.disabled = true;
        surrenderBtn.disabled = true;
        return;
    }

    const handValue = calculateHandValue(currentHand);

    hitBtn.disabled = handValue >= 21;
    standBtn.disabled = false;
    doubleBtn.disabled = !canDouble() || handValue >= 21;
    splitBtn.disabled = !canSplit();
    surrenderBtn.disabled = !canSurrender();
}

function displayActiveHand() {
    const currentHand = playerHands[currentHandIndex];
    if (!currentHand) return;

    displayCards(currentHand, 'playerCards');
    const playerValueElement = document.getElementById('playerValue');
    if (playerValueElement) {
        playerValueElement.textContent = `Value: ${calculateHandValue(currentHand)}`;
    }
}

function updateSplitUI() {
    const splitContainer = document.getElementById('splitContainer');
    if (!splitContainer) return;

    splitContainer.style.display = 'flex';
    splitContainer.innerHTML = '';

    for (let i = 0; i < playerHands.length; i++) {
        const hand = playerHands[i];
        const handElement = document.createElement('div');
        handElement.className = `split-hand ${i === currentHandIndex ? 'active-hand' : ''}`;

        const title = document.createElement('div');
        title.className = 'split-hand-title';
        title.textContent = `Hand ${i + 1}`;

        const cardsDisplay = document.createElement('div');
        cardsDisplay.className = 'cards-display';

        hand.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            if (card.suit === '♥' || card.suit === '♦') {
                cardElement.classList.add('red');
            }
            cardElement.textContent = `${card.rank}${card.suit}`;
            cardsDisplay.appendChild(cardElement);
        });

        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'hand-value';
        valueDisplay.textContent = `Value: ${calculateHandValue(hand)}`;

        handElement.appendChild(title);
        handElement.appendChild(cardsDisplay);
        handElement.appendChild(valueDisplay);
        splitContainer.appendChild(handElement);
    }
}

function updateGameStats() {
    const gamesPlayedElement = document.getElementById('gamesPlayed');
    const winsElement = document.getElementById('wins');
    const lossesElement = document.getElementById('losses');
    const winRateElement = document.getElementById('winRate');
    const blackjackWinsElement = document.getElementById('blackjackWins');
    const doublesElement = document.getElementById('doubles');
    const splitsElement = document.getElementById('splits');

    if (gamesPlayedElement) {
        gamesPlayedElement.textContent = gameStats.played;
    }
    if (winsElement) {
        winsElement.textContent = gameStats.wins;
    }
    if (lossesElement) {
        lossesElement.textContent = gameStats.losses;
    }
    if (winRateElement) {
        winRateElement.textContent = gameStats.played > 0 ?
            Math.round((gameStats.wins / gameStats.played) * 100) + '%' : '0%';
    }
    if (blackjackWinsElement) {
        blackjackWinsElement.textContent = gameStats.blackjackWins;
    }
    if (doublesElement) {
        doublesElement.textContent = gameStats.doubles;
    }
    if (splitsElement) {
        splitsElement.textContent = gameStats.splits;
    }
}

function toggleBankroll() {
    const bankrollSection = document.querySelector('.bankroll-section');
    const toggleBtn = document.querySelector('.btn-secondary');

    if (!bankrollSection || !toggleBtn) return;

    if (bankrollSection.style.display === 'none' || bankrollSection.style.display === '') {
        bankrollSection.style.display = 'block';
        toggleBtn.textContent = '💰 Hide Bankroll';
    } else {
        bankrollSection.style.display = 'none';
        toggleBtn.textContent = '💰 Show Bankroll';
    }
}

function endGame(result) {
    gameOver = true;

    // Show dealer's full hand
    displayCards(dealerHand, 'dealerCards');
    const dealerValueElement = document.getElementById('dealerValue');
    if (dealerValueElement) {
        dealerValueElement.textContent = `Value: ${calculateHandValue(dealerHand)}`;
    }

    // Disable buttons
    const hitBtn = document.getElementById('hitBtn');
    const standBtn = document.getElementById('standBtn');
    const doubleBtn = document.getElementById('doubleBtn');
    const splitBtn = document.getElementById('splitBtn');

    if (hitBtn) hitBtn.disabled = true;
    if (standBtn) standBtn.disabled = true;
    if (doubleBtn) doubleBtn.disabled = true;
    if (splitBtn) splitBtn.disabled = true;

    // Show message
    const messageElement = document.getElementById('gameMessage');
    if (messageElement) {
        messageElement.style.display = 'block';

        let message = '';
        let className = '';

        switch (result) {
            case 'win':
                message = '🎉 You Win!';
                className = 'win';
                bankroll += currentBet;
                sessionStats.totalWon += currentBet;
                sessionStats.netProfit += currentBet;
                break;
            case 'lose':
                message = '😞 You Lose!';
                className = 'lose';
                bankroll -= currentBet;
                sessionStats.totalWon -= currentBet;
                sessionStats.netProfit -= currentBet;
                break;
            case 'push':
                message = '🤝 Push (Tie)';
                className = 'push';
                // No change to bankroll
                break;
            case 'blackjack':
                message = '🃏 Blackjack! You Win 3:2!';
                className = 'blackjack';
                bankroll += currentBet * 1.5;
                sessionStats.totalWon += currentBet * 1.5;
                sessionStats.netProfit += currentBet * 1.5;
                // Increment blackjack stats
                gameStats.blackjackWins++;
                gameStats.wins++;
                break;
            case 'surrender':
                message = '🏳️ Surrendered - Lost Half Bet';
                className = 'surrender';
                break;
        }

        messageElement.textContent = message;
        messageElement.className = `message ${className}`;
    }

    // Update bankroll display
    const bankrollDisplay = document.getElementById('bankrollDisplay');
    if (bankrollDisplay) {
        bankrollDisplay.textContent = bankroll;
    }

    // Add to hand history
    addToHandHistory(result, playerHands[0], dealerHand, currentBet);

    // Update game stats
    gameStats.played++;
    updateGameStats();

    // Clear strategy advice
    const strategyText = document.querySelector('.strategy-text');
    if (strategyText) {
        strategyText.textContent = 'Game Over - Click "New Game" to play again';
        strategyText.style.color = '#94a3b8';
    }
}

// Export UI functions
window.uiModule = {
    displayCards,
    updateButtonStates,
    displayActiveHand,
    updateSplitUI,
    updateGameStats,
    toggleBankroll,
    endGame
};
