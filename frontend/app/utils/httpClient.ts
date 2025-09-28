import axios from "axios";
import { Depth, KLine, Ticker, Trade } from "./types";

export const API_BASE_URL = 'http://localhost:3001'; // Update to point to backend port

export async function getTicker(market: string): Promise<Ticker> {
    const tickers = await getTickers();
    const ticker = tickers.find(t => t.symbol === market);
    if (!ticker) {
        throw new Error(`No ticker found for ${market}`);
    }
    return ticker;
}

export async function getTickers(): Promise<Ticker[]> {
    const response = await axios.get(`${API_BASE_URL}/tickers`);
    return response.data;
}


export async function getDepth(market: string): Promise<Depth> {
    const response = await axios.get(`${API_BASE_URL}/depth?symbol=${market}`);
    return response.data;
}
export async function getTrades(market: string): Promise<Trade[]> {
    const response = await axios.get(`${API_BASE_URL}/trades?symbol=${market}`);
    return response.data;
}

export async function getKlines(market: string, interval: string, startTime: number, endTime: number): Promise<KLine[]> {
    const response = await axios.get(`${API_BASE_URL}/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`);
    const data: KLine[] = response.data;
    return data.sort((x, y) => (Number(x.end) < Number(y.end) ? -1 : 1));
}

export const orderBookApi = {
  getOrderBook: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orderbook`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orderbook:', error);
      throw error;
    }
  },

  placeBid: async (price: number, quantity: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/bid`, { price, quantity });
      return response.data;
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    }
  },

  placeAsk: async (price: number, quantity: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ask`, { price, quantity });
      return response.data;
    } catch (error) {
      console.error('Error placing ask:', error);
      throw error;
    }
  }
};
