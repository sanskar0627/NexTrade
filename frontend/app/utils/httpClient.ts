import axios from "axios";
import { Depth, KLine, Ticker, Trade } from "./types";
import { getToken } from "./auth";

const BASE_URL = "http://localhost:3001/api/v1";

// Create axios instance with auth interceptor
const apiClient = axios.create({
    baseURL: BASE_URL,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function getTicker(market: string): Promise<Ticker> {
    const tickers = await getTickers();
    const ticker = tickers.find(t => t.symbol === market);
    if (!ticker) {
        throw new Error(`No ticker found for ${market}`);
    }
    return ticker;
}

export async function getTickers(): Promise<Ticker[]> {
    const response = await apiClient.get(`/tickers`);
    return response.data;
}

export async function getDepth(market: string): Promise<Depth> {
    const response = await apiClient.get(`/depth?symbol=${market}`);
    return response.data;
}

export async function getTrades(market: string): Promise<Trade[]> {
    const response = await apiClient.get(`/trades?symbol=${market}`);
    return response.data;
}

export async function getKlines(market: string, interval: string, startTime: number, endTime: number): Promise<KLine[]> {
    const response = await apiClient.get(`/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`);
    const data: KLine[] = response.data;
    return data.sort((x, y) => (Number(x.end) < Number(y.end) ? -1 : 1));
}

// User-specific API functions
export async function getUserBalance(): Promise<any[]> {
    const response = await apiClient.get('/user/balance');
    return response.data;
}

export async function getUserOrders(market?: string): Promise<any[]> {
    const params = market ? { market } : {};
    const response = await apiClient.get('/order/history', { params });
    return response.data;
}

export async function getUserTrades(market?: string): Promise<any[]> {
    const params = market ? { market } : {};
    const response = await apiClient.get('/user/trades', { params });
    return response.data;
}

export async function createOrder(order: {
    market: string;
    side: 'BUY' | 'SELL';
    quantity: string;
    price: string;
    type: 'MARKET' | 'LIMIT';
}): Promise<any> {
    const response = await apiClient.post('/order/create', order);
    return response.data;
}

export async function cancelOrder(orderId: string): Promise<any> {
    const response = await apiClient.delete(`/order/${orderId}`);
    return response.data;
}
