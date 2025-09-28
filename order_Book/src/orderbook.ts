import type  { Order, Bid, Ask } from './types.js';
import type { OrderBook } from './types.js';

export class OrderBookManager {
  private orderBook: OrderBook = {
    bids: [],
    asks: []
  };

  insertBid(bid: Bid): void {
    const index = this.orderBook.bids.findIndex(b => b.price < bid.price);
    this.orderBook.bids.splice(index === -1 ? this.orderBook.bids.length : index, 0, bid);
  }

  insertAsk(ask: Ask): void {
    const index = this.orderBook.asks.findIndex(a => a.price > ask.price);
    this.orderBook.asks.splice(index === -1 ? this.orderBook.asks.length : index, 0, ask);
  }

  getOrderBook(): OrderBook {
    return this.orderBook;
  }

  matchOrders(): void {
    while (this.orderBook.bids.length > 0 && this.orderBook.asks.length > 0) {
      const bestBid = this.orderBook.bids[0]!;
      const bestAsk = this.orderBook.asks[0]!;

      if (bestBid.price >= bestAsk.price) {
        const matchedQuantity = Math.min(bestBid.quantity, bestAsk.quantity);
        // Update quantities
        bestBid.quantity -= matchedQuantity;
        bestAsk.quantity -= matchedQuantity;

        // Remove filled orders
        if (bestBid.quantity === 0) this.orderBook.bids.shift();
        if (bestAsk.quantity === 0) this.orderBook.asks.shift();
      } else {
        break;
      }
    }
  }
}
