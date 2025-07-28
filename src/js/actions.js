// Game Actions Module - Handles all main game actions

function newGame() {
    if (deck.length < 20) { // Reshuffle when deck is low
        createDeck();
    }

    playerHands = [[]];
    currentHandIndex = 0;
    dealerHand = [];
    gameOver = false;

    // Update current bet from input
    const betInput = document.getElementById('currentBet');
    if (betInput) {
        currentBet = parseInt(betInput.value) || 25;
    }

    // Deal initial cards
    playerHands[0].push(dealCard());
    dealerHand.push(dealCard());
    playerHands[0].push(dealCard());
    dealerHand.push(dealCard());

    displayActiveHand();
    displayCards(dealerHand, 'dealerCards', true);

    document.getElementById('dealerValue').textContent = `Value: ${cardValues[dealerHand[0].rank]}`;

    // Hide split container
    document.getElementById('splitContainer').style.display = 'none';

    // Update UI
    updateButtonStates();
    document.getElementById('gameMessage').style.display = 'none';
    updateStrategy();

    // Check for blackjack
    const playerValue = calculateHandValue(playerHands[0]);
    const dealerValue = calculateHandValue(dealerHand);

    if (playerValue === 21) {
        if (dealerValue === 21) {
            endGame('push');
        } else {
            endGame('blackjack');
        }
    }
}

function hit() {
    if (gameOver) return;

    const currentHand = playerHands[currentHandIndex];
    currentHand.push(dealCard());
    displayActiveHand();

    const playerValue = calculateHandValue(currentHand);

    if (playerValue > 21) {
        if (playerHands.length > 1 && currentHandIndex < playerHands.length - 1) {
            // Move to next split hand
            currentHandIndex++;
            displayActiveHand();
            updateStrategy();
        } else {
            // All hands are done, dealer's turn
            stand();
        }
    } else {
        updateStrategy();
        // Disable double after hitting
        document.getElementById('doubleBtn').disabled = true;
    }

    updateButtonStates();
}

function stand() {
    if (gameOver) return;

    if (playerHands.length > 1 && currentHandIndex < playerHands.length - 1) {
        // Move to next split hand
        currentHandIndex++;
        displayActiveHand();
        updateStrategy();
        updateButtonStates();
        return;
    }

    // Dealer's turn
    gameOver = true;
    displayCards(dealerHand, 'dealerCards');
    document.getElementById('dealerValue').textContent = `Value: ${calculateHandValue(dealerHand)}`;

    // Dealer hits on 16 or less, stands on soft 17 (configurable)
    while (calculateHandValue(dealerHand) < 17 ||
          (calculateHandValue(dealerHand) === 17 && hasUsableAce(dealerHand) && dealerRules.hitSoft17)) {
        dealerHand.push(dealCard());
        displayCards(dealerHand, 'dealerCards');
        document.getElementById('dealerValue').textContent = `Value: ${calculateHandValue(dealerHand)}`;
    }

    // Evaluate all hands
    const dealerValue = calculateHandValue(dealerHand);
    let allResults = [];

    for (let i = 0; i < playerHands.length; i++) {
        const playerValue = calculateHandValue(playerHands[i]);

        if (playerValue > 21) {
            allResults.push('lose');
            gameStats.losses++;
            sessionStats.totalWon -= currentBet;
            sessionStats.netProfit -= currentBet;
        } else if (dealerValue > 21) {
            allResults.push('win');
            gameStats.wins++;
            sessionStats.totalWon += currentBet;
            sessionStats.netProfit += currentBet;
        } else if (playerValue === 21 && playerHands[i].length === 2) {
            if (dealerValue === 21 && dealerHand.length === 2) {
                allResults.push('push');
                gameStats.pushes++;
                // No change to bankroll for push
            } else {
                allResults.push('blackjack');
                gameStats.blackjackWins++;
                gameStats.wins++;
                sessionStats.totalWon += currentBet * 1.5;
                sessionStats.netProfit += currentBet * 1.5;
            }
        } else if (playerValue > dealerValue) {
            allResults.push('win');
            gameStats.wins++;
            sessionStats.totalWon += currentBet;
            sessionStats.netProfit += currentBet;
        } else if (playerValue < dealerValue) {
            allResults.push('lose');
            gameStats.losses++;
            sessionStats.totalWon -= currentBet;
            sessionStats.netProfit -= currentBet;
        } else {
            allResults.push('push');
            gameStats.pushes++;
            // No change to bankroll for push
        }
    }

    // Show final message based on all results
    if (allResults.includes('blackjack')) {
        endGame('blackjack');
    } else if (allResults.includes('win')) {
        endGame('win');
    } else if (allResults.includes('lose')) {
        endGame('lose');
    } else {
        endGame('push');
    }
}

function double() {
    if (gameOver) return;

    const currentHand = playerHands[currentHandIndex];
    currentHand.push(dealCard());
    displayActiveHand();

    // Track double down statistics
    gameStats.doubles++;

    // Double means we must stand after one card
    stand();
}

function surrender() {
    if (gameOver || !canSurrender()) return;

    // Surrender loses half the bet
    bankroll -= currentBet / 2;
    sessionStats.totalBet += currentBet;
    sessionStats.totalWon -= currentBet / 2;
    sessionStats.netProfit -= currentBet / 2;

    // Update bankroll display
    document.getElementById('bankrollDisplay').textContent = bankroll;

    // End game with surrender result
    endGame('surrender');
}

function split() {
    if (!canSplit()) return;

    const currentHand = playerHands[currentHandIndex];
    const newHand1 = [currentHand[0], dealCard()];
    const newHand2 = [currentHand[1], dealCard()];

    // Track split statistics
    gameStats.splits++;

    // Replace current hand with two new hands
    playerHands.splice(currentHandIndex, 1, newHand1, newHand2);
    currentHandIndex = 0;

    // Update UI for split hands
    updateSplitUI();

    // Special rule for Aces: get only one card per Ace and can't hit again
    if (newHand1[0].rank === 'A') {
        for (let i = 0; i < playerHands.length; i++) {
            if (playerHands[i].length === 1) {
                playerHands[i].push(dealCard());
            }
        }

        // Can't hit or double after splitting Aces
        document.getElementById('hitBtn').disabled = true;
        document.getElementById('doubleBtn').disabled = true;

        // Show all split hands
        updateSplitUI();

        // Automatically stand if all split hands have 2 cards
        let allHandsComplete = true;
        for (let hand of playerHands) {
            if (hand.length < 2) {
                allHandsComplete = false;
                break;
            }
        }

        if (allHandsComplete) {
            stand();
        }
    } else {
        // For non-Ace splits, continue with current hand
        displayActiveHand();
        updateStrategy();
        updateButtonStates();
    }
}

// Export action functions
window.actionModule = {
    newGame,
    hit,
    stand,
    double,
    surrender,
    split
};
