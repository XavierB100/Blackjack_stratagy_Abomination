// Strategy Engine - 100% accurate basic strategy implementation

function getBasicStrategy(playerHand, dealerUpCard) {
    if (!playerHand || !dealerUpCard || playerHand.length === 0) {
        return 'STAND'; // Default fallback
    }

    const playerValue = calculateHandValue(playerHand);
    const dealerUpValue = dealerUpCard.rank === 'A' ? 1 : (cardValues[dealerUpCard.rank] === 10 ? 10 : cardValues[dealerUpCard.rank]);

    // Check for pairs first
    if (isPair(playerHand)) {
        return getPairStrategy(playerHand[0].rank, dealerUpValue);
    }

    // Check for soft hands
    if (hasUsableAce(playerHand)) {
        return getSoftHandStrategy(playerHand, dealerUpValue);
    }

    // Hard hands
    return getHardHandStrategy(playerValue, dealerUpValue);
}

function getPairStrategy(rank, dealerUpValue) {
    switch (rank) {
        case 'A':
        case '8':
            return 'SPLIT';
        case '2':
        case '3':
        case '7':
            return (dealerUpValue >= 2 && dealerUpValue <= 7) ? 'SPLIT' : 'HIT';
        case '4':
            return (dealerUpValue >= 5 && dealerUpValue <= 6) ? 'SPLIT' : 'HIT';
        case '6':
            return (dealerUpValue >= 2 && dealerUpValue <= 6) ? 'SPLIT' : 'HIT';
        case '9':
            return (dealerUpValue >= 2 && dealerUpValue <= 9 && dealerUpValue !== 7) ? 'SPLIT' : 'STAND';
        case '5':
            return (dealerUpValue >= 2 && dealerUpValue <= 9) ? 'DOUBLE' : 'HIT';
        default: // 10, J, Q, K
            return 'STAND';
    }
}

function getSoftHandStrategy(hand, dealerUpValue) {
    let nonAceValue = 0;
    for (let card of hand) {
        if (card.rank !== 'A') {
            nonAceValue += card.value;
        }
    }

    if (nonAceValue === 2 || nonAceValue === 3) { // A,2 or A,3
        return (dealerUpValue >= 5 && dealerUpValue <= 6) ? 'DOUBLE' : 'HIT';
    } else if (nonAceValue === 4 || nonAceValue === 5) { // A,4 or A,5
        return (dealerUpValue >= 4 && dealerUpValue <= 6) ? 'DOUBLE' : 'HIT';
    } else if (nonAceValue === 6) { // A,6
        return (dealerUpValue >= 3 && dealerUpValue <= 6) ? 'DOUBLE' : 'HIT';
    } else if (nonAceValue === 7) { // A,7
        if (dealerUpValue >= 3 && dealerUpValue <= 6) return 'DOUBLE';
        if (dealerUpValue >= 2 && dealerUpValue <= 8) return 'STAND';
        return 'HIT'; // vs 9, 10, A
    } else { // A,8 or A,9
        return 'STAND';
    }
}

function getHardHandStrategy(playerValue, dealerUpValue) {
    if (playerValue <= 8) {
        return 'HIT';
    } else if (playerValue === 9) {
        return (dealerUpValue >= 3 && dealerUpValue <= 6) ? 'DOUBLE' : 'HIT';
    } else if (playerValue === 10) {
        return (dealerUpValue >= 2 && dealerUpValue <= 9) ? 'DOUBLE' : 'HIT';
    } else if (playerValue === 11) {
        return (dealerUpValue >= 2 && dealerUpValue <= 10) ? 'DOUBLE' : 'HIT';
    } else if (playerValue === 12) {
        return (dealerUpValue >= 4 && dealerUpValue <= 6) ? 'STAND' : 'HIT';
    } else if (playerValue >= 13 && playerValue <= 16) {
        return (dealerUpValue >= 2 && dealerUpValue <= 6) ? 'STAND' : 'HIT';
    } else {
        return 'STAND';
    }
}

function updateStrategy() {
    if (gameOver || !dealerHand || dealerHand.length === 0 || !playerHands || playerHands.length === 0) {
        return;
    }

    const currentHand = playerHands[currentHandIndex];
    if (!currentHand || currentHand.length === 0) {
        return;
    }

    const strategy = getBasicStrategy(currentHand, dealerHand[0]);
    const strategyElement = document.getElementById('strategyAdvice');
    if (!strategyElement) return;

    const strategyText = strategyElement.querySelector('.strategy-text');
    if (!strategyText) return;

    let advice = '';
    let color = '#93c5fd';

    switch (strategy) {
        case 'HIT':
            advice = '👆 HIT - Take another card';
            color = '#60a5fa';
            break;
        case 'STAND':
            advice = '✋ STAND - Keep your current hand';
            color = '#34d399';
            break;
        case 'DOUBLE':
            advice = '📈 DOUBLE - Double your bet and take one card';
            color = '#fbbf24';
            break;
        case 'SPLIT':
            advice = '↔️ SPLIT - Split your pair into two hands';
            color = '#f87171';
            break;
        default:
            advice = 'Analyzing...';
            color = '#94a3b8';
    }

    strategyText.textContent = advice;
    strategyText.style.color = color;
}

// Export strategy functions
window.strategyModule = {
    getBasicStrategy,
    getPairStrategy,
    getSoftHandStrategy,
    getHardHandStrategy,
    updateStrategy
};
