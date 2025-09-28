import express from 'express';
import cors from 'cors';
import { OrderBookManager } from './orderbook.js';
import { redisManager } from './redisClient.js';
import { v4 as uuidv4 } from 'uuid';
import type { Bid, Ask } from './types.js';

const app = express();
const orderBookManager = new OrderBookManager();

app.use(cors());
app.use(express.json());

// Validation middleware
const validateOrder = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { price, quantity } = req.body;
  if (!price || !quantity || price <= 0 || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid order parameters' });
  }
  next();
};

app.post('/bid', validateOrder, async (req, res) => {
  try {
    const bid: Bid = {
      id: uuidv4(),
      price: req.body.price,
      quantity: req.body.quantity,
      timestamp: new Date()
    };
    orderBookManager.insertBid(bid);
    orderBookManager.matchOrders();
    await redisManager.saveOrderBook(orderBookManager.getOrderBook());
    res.json({ success: true, orderId: bid.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process bid' });
  }
});

app.post('/ask', validateOrder, async (req, res) => {
  try {
    const ask: Ask = {
      id: uuidv4(),
      price: req.body.price,
      quantity: req.body.quantity,
      timestamp: new Date()
    };
    orderBookManager.insertAsk(ask);
    orderBookManager.matchOrders();
    await redisManager.saveOrderBook(orderBookManager.getOrderBook());
    res.json({ success: true, orderId: ask.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process ask' });
  }
});

app.get('/orderbook', async (req, res) => {
  try {
    res.json(orderBookManager.getOrderBook());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orderbook' });
  }
});

const PORT = process.env.PORT || 3001; // Changed from 3000 to 3001
app.listen(PORT, () => console.log(`Order book server running on port ${PORT}`));
