import { z } from "zod";

export const OrderInputSchema = z.object({
  baseAsset: z.string(),
  quoteAsset: z.string(),
  price: z.number(),
  quantity: z.number(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['limit', 'market']),
  kind: z.enum(['ioc']).optional(),
});

export interface Order {
  id: string;
  price: number;
  quantity: number;
  timestamp: Date;
}

export interface Bid extends Order {}
export interface Ask extends Order {}

export interface OrderBook {
  bids: Bid[];
  asks: Ask[];
}