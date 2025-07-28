# 🃏 Blackjack Strategy Master

A professional blackjack simulator with perfect basic strategy and card counting.

## 🚀 Quick Start

1. **Start the server:**
   ```bash
   npm start
   # or
   python -m http.server 8000
   ```

2. **Open in browser:**
   ```
   http://localhost:8000/src/home.html
   ```

3. **Navigate to the game:**
   Click "🎮 Play Game" or visit `http://localhost:8000/src/index.html`

## 🎯 Features

- **Perfect Basic Strategy** - 100% accurate recommendations for every situation
- **Hi-Lo Card Counting** - Industry-standard counting system with running and true count
- **Multi-Hand Splits** - Split up to 4 hands with proper Ace rules
- **Bankroll Management** - $10,000 starting bankroll with optimal bet sizing
- **Surrender Option** - Early surrender for unfavorable hands
- **Hand History** - Track last 50 hands with detailed analytics
- **Real-time Statistics** - Win rates, blackjacks, doubles, splits, and more
- **Mobile Responsive** - Works perfectly on all devices
- **Professional UI** - Modern design with smooth animations

## 📁 Project Structure

```
src/
├── home.html              # Home page (landing page)
├── index.html             # Main game simulator
├── strategy-guide.html    # Strategy guide
├── card-counting.html     # Card counting guide
├── about.html            # About page
├── css/main.css          # Styles
├── js/
│   ├── game.js          # Game logic
│   ├── strategy.js      # Strategy engine
│   ├── ui.js           # User interface
│   ├── actions.js      # Game actions
│   ├── main.js         # Initialization
│   └── test.js         # Testing utilities
└── blog/                # Blog content
```

## 🛠️ Development

```bash
# Format code
npm run format

# Lint JavaScript
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🎮 How to Play

1. **Start a new game** - Click "New Game" to begin
2. **Review strategy** - Check the strategy advice for optimal play
3. **Make decisions** - Hit, Stand, Double, Split, or Surrender
4. **Track progress** - Monitor your statistics and bankroll
5. **Learn from history** - Review your hand history for improvement

## 📄 License

MIT License


