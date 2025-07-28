// Main initialization script - ensures all modules work together
// Optimized for performance and error handling

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Blackjack Strategy Master Error:', e.error);
    // Could add error reporting here
});

// Performance monitoring
const startTime = performance.now();

// Wait for all modules to load
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize the game
        if (typeof createDeck === 'function') {
            createDeck();
        } else {
            console.error('Game module not loaded properly');
            return;
        }

        // Set up performance monitoring
        const loadTime = performance.now() - startTime;
        console.log(`Blackjack Strategy Master loaded in ${loadTime.toFixed(2)}ms`);

        // Verify all modules are loaded
        const modules = {
            game: typeof createDeck !== 'undefined',
            strategy: typeof getBasicStrategy !== 'undefined',
            ui: typeof displayCards !== 'undefined',
            actions: typeof newGame !== 'undefined'
        };

        const allModulesLoaded = Object.values(modules).every(loaded => loaded);

        if (allModulesLoaded) {
            console.log('✅ All modules loaded successfully:', modules);

            // Initialize any additional features
            initializeAccessibility();
            initializePerformanceOptimizations();

            // Initialize UI elements
            initializeUI();

        } else {
            console.error('❌ Some modules failed to load:', modules);
        }

    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// Initialize UI elements
function initializeUI() {
    // Initialize bankroll display
    const bankrollDisplay = document.getElementById('bankrollDisplay');
    if (bankrollDisplay) {
        bankrollDisplay.textContent = bankroll;
    }

    // Initialize bet input
    const betInput = document.getElementById('currentBet');
    if (betInput) {
        betInput.value = currentBet;
    }

    // Initialize optimal bet
    const optimalBetElement = document.getElementById('optimalBet');
    if (optimalBetElement) {
        optimalBetElement.textContent = currentBet;
    }

    // Initialize game stats
    updateGameStats();

    // Initialize count display
    updateCountDisplay();
}

// Make sure all functions are globally available for onclick handlers
// Using a more robust approach to prevent errors
const globalFunctions = [
    'newGame', 'hit', 'stand', 'double', 'split', 'surrender', 'toggleBankroll'
];

globalFunctions.forEach(funcName => {
    if (typeof window[funcName] === 'undefined') {
        // Try to get function from modules
        if (window.actionModule && window.actionModule[funcName]) {
            window[funcName] = window.actionModule[funcName];
        } else if (window.uiModule && window.uiModule[funcName]) {
            window[funcName] = window.uiModule[funcName];
        } else if (window.gameModule && window.gameModule[funcName]) {
            window[funcName] = window.gameModule[funcName];
        }
    }
});

// Accessibility improvements
function initializeAccessibility() {
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.activeElement.classList.contains('btn')) {
            document.activeElement.click();
        }
    });

    // Add ARIA labels for better screen reader support
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        if (!btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', btn.textContent.trim());
        }
    });
}

// Performance optimizations
function initializePerformanceOptimizations() {
    // Preload critical resources
    const criticalImages = [
        // Add any critical images here if needed
    ];

    // Optimize animations for better performance
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.willChange = 'auto';
                }
            });
        });

        // Observe elements that might animate
        document.querySelectorAll('.card, .btn, .count-item').forEach(el => {
            observer.observe(el);
        });
    }

    // Add service worker registration for caching (if needed)
    if ('serviceWorker' in navigator) {
        // Could register a service worker here for offline functionality
        // navigator.serviceWorker.register('/sw.js');
    }
}

// Add some utility functions for better debugging
window.debugGame = function() {
    console.log('Game State:', {
        deck: deck ? deck.length : 'undefined',
        playerHands: playerHands ? playerHands.length : 'undefined',
        dealerHand: dealerHand ? dealerHand.length : 'undefined',
        gameOver: gameOver,
        runningCount: runningCount,
        bankroll: bankroll,
        currentBet: currentBet
    });
};

// Add performance monitoring
window.performanceMonitor = {
    start: function(label) {
        this[label] = performance.now();
    },
    end: function(label) {
        if (this[label]) {
            const duration = performance.now() - this[label];
            console.log(`${label} took ${duration.toFixed(2)}ms`);
            delete this[label];
        }
    }
};
