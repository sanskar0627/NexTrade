"use client";

import { useEffect, useState } from "react";
import { getDepth, getTicker } from "../../utils/httpClient";
import { BidTable } from "./BidTable";
import { AskTable } from "./AskTable";

export function Depth({ market }: {market: string}) {
    const [bids, setBids] = useState<[string, string][]>([]);
    const [asks, setAsks] = useState<[string, string][]>([]);
    const [price, setPrice] = useState<string>('0');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDepthData();
        
        // Refresh depth data every 3 seconds
        const interval = setInterval(loadDepthData, 3000);
        return () => clearInterval(interval);
    }, [market]);

    const loadDepthData = async () => {
        try {
            const [depthData, tickerData] = await Promise.all([
                getDepth(market),
                getTicker(market)
            ]);
            
            setBids(depthData.bids || []);
            setAsks(depthData.asks || []);
            setPrice(tickerData.lastPrice || '0');
        } catch (error) {
            console.error('Failed to load depth data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return (
            <div className="bg-baseBackgroundL1 p-4 h-full">
                <div className="text-center text-gray-400">Loading order book...</div>
            </div>
        );
    }
    
    return (
        <div className="bg-baseBackgroundL1 h-full">
            <div className="px-4 py-2 border-b border-slate-800">
                <h3 className="text-sm font-medium text-white">Order Book</h3>
            </div>
            <TableHeader />
            <div className="h-32 overflow-hidden">
                <AskTable asks={asks.slice(0, 8)} />
            </div>
            <div className="px-4 py-2 border-y border-slate-800">
                <div className="text-center text-lg font-mono text-white">
                    ${parseFloat(price).toFixed(2)}
                </div>
                <div className="text-center text-xs text-gray-400">Last Price</div>
            </div>
            <div className="h-32 overflow-hidden">
                <BidTable bids={bids.slice(0, 8)} />
            </div>
        </div>
    );
}

function TableHeader() {
    return <div className="flex justify-between text-xs">
    <div className="text-white">Price</div>
    <div className="text-slate-500">Size</div>
    <div className="text-slate-500">Total</div>
</div>
}