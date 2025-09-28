// Simple mock database for testing
const mockMarkets = [
  {
    id: '1',
    symbol: 'BTC_USDC',
    baseAsset: 'BTC',
    quoteAsset: 'USDC',
    lastPrice: '45000.00',
    high: '46500.00',
    low: '43500.00',
    volume: '1234.56',
    priceChange: '750.00',
  },
  {
    id: '2', 
    symbol: 'SOL_USDC',
    baseAsset: 'SOL',
    quoteAsset: 'USDC',
    lastPrice: '100.50',
    high: '105.00',
    low: '98.00',
    volume: '5678.90',
    priceChange: '-2.50',
  }
];

const mockTrades = [
  {
    id: '1',
    price: '45000.00',
    quantity: '0.1234',
    timestamp: new Date().toISOString(),
    side: 'BUY'
  },
  {
    id: '2',
    price: '44950.00', 
    quantity: '0.0567',
    timestamp: new Date(Date.now() - 30000).toISOString(),
    side: 'SELL'
  }
];

export { mockMarkets, mockTrades };