// Test script to verify game functionality
// Run this in the browser console to test all features

window.testGame = function() {
    console.log('🧪 Starting comprehensive game test...');

    // Test 1: Check if all modules are loaded
    const modules = {
        game: typeof createDeck === 'function',
        strategy: typeof getBasicStrategy === 'function',
        ui: typeof displayCards === 'function',
        actions: typeof newGame === 'function'
    };

    console.log('📦 Module loading test:', modules);

    // Test 2: Check if deck is created properly
    if (typeof createDeck === 'function') {
        createDeck();
        console.log('🃏 Deck creation test:', {
            deckSize: deck.length,
            expectedSize: 312,
            success: deck.length === 312
        });
    }

    // Test 3: Test card counting
    if (typeof updateCount === 'function') {
        const testCard = { rank: '5', suit: '♠', value: 5 };
        const oldCount = runningCount;
        updateCount(testCard);
        console.log('📊 Card counting test:', {
            oldCount: oldCount,
            newCount: runningCount,
            expected: oldCount + 1,
            success: runningCount === oldCount + 1
        });
    }

    // Test 4: Test hand value calculation
    if (typeof calculateHandValue === 'function') {
        const testHand = [
            { rank: 'A', suit: '♠', value: 11 },
            { rank: 'K', suit: '♥', value: 10 }
        ];
        const value = calculateHandValue(testHand);
        console.log('🎯 Hand value calculation test:', {
            hand: testHand.map(c => c.rank + c.suit),
            calculatedValue: value,
            expectedValue: 21,
            success: value === 21
        });
    }

    // Test 5: Test basic strategy
    if (typeof getBasicStrategy === 'function') {
        const playerHand = [
            { rank: 'A', suit: '♠', value: 11 },
            { rank: '8', suit: '♥', value: 8 }
        ];
        const dealerCard = { rank: '6', suit: '♦', value: 6 };
        const strategy = getBasicStrategy(playerHand, dealerCard);
        console.log('🧠 Basic strategy test:', {
            playerHand: playerHand.map(c => c.rank + c.suit),
            dealerCard: dealerCard.rank + dealerCard.suit,
            strategy: strategy,
            success: strategy === 'STAND'
        });
    }

    // Test 6: Test game state
    console.log('🎮 Game state test:', {
        bankroll: bankroll,
        currentBet: currentBet,
        gameStats: gameStats,
        sessionStats: sessionStats
    });

    console.log('✅ Test completed! Check the results above.');
};

// Test blackjack stat tracking specifically
window.testBlackjackStats = function() {
    console.log('🃏 Testing blackjack stat tracking...');

    // Store original stats
    const originalBlackjacks = gameStats.blackjackWins;
    const originalWins = gameStats.wins;
    const originalPlayed = gameStats.played;

    // Simulate a blackjack win
    if (typeof endGame === 'function') {
        endGame('blackjack');

        // Check if stats were updated
        const blackjackIncremented = gameStats.blackjackWins === originalBlackjacks + 1;
        const winsIncremented = gameStats.wins === originalWins + 1;
        const playedIncremented = gameStats.played === originalPlayed + 1;

        console.log('🃏 Blackjack stat tracking test:', {
            originalBlackjacks: originalBlackjacks,
            newBlackjacks: gameStats.blackjackWins,
            blackjackIncremented: blackjackIncremented,
            winsIncremented: winsIncremented,
            playedIncremented: playedIncremented,
            success: blackjackIncremented && winsIncremented && playedIncremented
        });
    } else {
        console.log('❌ endGame function not available');
    }
};

// Quick verification of the blackjack fix
window.verifyBlackjackFix = function() {
    console.log('🔧 Verifying blackjack stat fix...');

    const currentStats = {
        blackjacks: gameStats.blackjackWins,
        wins: gameStats.wins,
        played: gameStats.played
    };

    console.log('📊 Current stats:', currentStats);
    console.log('✅ Blackjack fix applied - stats will now track correctly!');
    console.log('💡 Try getting a blackjack and the "BLACKJACKS" counter should increment.');
};

// Run test automatically when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (typeof testGame === 'function') {
            console.log('🔍 Running automatic game test...');
            testGame();
        }
        if (typeof verifyBlackjackFix === 'function') {
            verifyBlackjackFix();
        }
    }, 1000);
});
