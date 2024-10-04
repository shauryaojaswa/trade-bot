
const config = {
    initialBalance: 10000,
    buyThreshold: -0.02, // 2% drop
    sellThreshold: 0.03, // 3% rise
    stockSymbol: 'EXAMPLE',
};

// Mock function to generate random stock prices
function mockGetStockPrice() {
    const basePrice = 100;
    const volatility = 0.05;
    return basePrice + basePrice * volatility * (Math.random() - 0.5);
}

class TradingBot {
    constructor(config) {
        this.balance = config.initialBalance;
        this.positions = {};
        this.trades = [];
        this.buyThreshold = config.buyThreshold;
        this.sellThreshold = config.sellThreshold;
        this.stockSymbol = config.stockSymbol;
    }

    async getStockPrice() {
        // Usimg  the mock function instead of an API call
        return mockGetStockPrice();
    }

    async executeTrade(action, price) {
        const quantity = Math.floor(this.balance / price);
        if (action === 'buy' && quantity > 0) {
            this.balance -= quantity * price;
            this.positions[this.stockSymbol] = (this.positions[this.stockSymbol] || 0) + quantity;
            this.trades.push({ action, price, quantity, timestamp: new Date() });
            console.log(`Bought ${quantity} shares at $${price.toFixed(2)}`);
        } else if (action === 'sell' && this.positions[this.stockSymbol] > 0) {
            const sellQuantity = this.positions[this.stockSymbol];
            this.balance += sellQuantity * price;
            delete this.positions[this.stockSymbol];
            this.trades.push({ action, price, quantity: sellQuantity, timestamp: new Date() });
            console.log(`Sold ${sellQuantity} shares at $${price.toFixed(2)}`);
        }
    }

    async run() {
        let lastPrice = null;
        while (true) {
            const currentPrice = await this.getStockPrice();
            if (currentPrice && lastPrice) {
                const priceChange = (currentPrice - lastPrice) / lastPrice;
                if (priceChange <= this.buyThreshold) {
                    await this.executeTrade('buy', currentPrice);
                } else if (priceChange >= this.sellThreshold) {
                    await this.executeTrade('sell', currentPrice);
                }
            }
            lastPrice = currentPrice;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before next iteration
        }
    }

    generateReport() {
        const totalValue = this.balance + Object.entries(this.positions).reduce((sum, [symbol, quantity]) => {
            return sum + quantity * this.getStockPrice();
        }, 0);
        const profitLoss = totalValue - config.initialBalance;

        console.log('\n--- Trading Bot Report ---');
        console.log(`Initial Balance: $${config.initialBalance}`);
        console.log(`Current Balance: $${this.balance.toFixed(2)}`);
        console.log('Current Positions:', this.positions);
        console.log(`Total Value: $${totalValue.toFixed(2)}`);
        console.log(`Profit/Loss: $${profitLoss.toFixed(2)}`);
        console.log('\nTrade History:');
        this.trades.forEach(trade => {
            console.log(`${trade.timestamp.toISOString()} - ${trade.action.toUpperCase()} ${trade.quantity} shares at $${trade.price.toFixed(2)}`);
        });
    }
}

// Start the trading bot
const bot = new TradingBot(config);
bot.run().catch(error => console.error('Bot error:', error));

// Generate report after 1 minute (for demonstration purposes)
setTimeout(() => {
    bot.generateReport();
    process.exit(0);
}, 60000);
