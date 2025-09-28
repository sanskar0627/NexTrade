"use client";
import { useState, useEffect } from "react";
import { getUserBalance, createOrder, getTicker } from "../utils/httpClient";
import { getCurrentUser } from "../utils/auth";

interface Balance {
    asset: string;
    available: string;
    locked: string;
}

export function SwapUI({ market }: {market: string}) {
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
    const [type, setType] = useState<'MARKET' | 'LIMIT'>('LIMIT');
    const [balances, setBalances] = useState<Balance[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [marketPrice, setMarketPrice] = useState('0');

    const user = getCurrentUser();
    const [baseAsset, quoteAsset] = market.split('_');

    useEffect(() => {
        if (user) {
            loadBalances();
            loadMarketPrice();
        }
    }, [user, market]);

    const loadBalances = async () => {
        try {
            const userBalances = await getUserBalance();
            setBalances(userBalances);
        } catch (err) {
            console.error('Failed to load balances:', err);
        }
    };

    const loadMarketPrice = async () => {
        try {
            const ticker = await getTicker(market);
            setMarketPrice(ticker.lastPrice);
            if (type === 'LIMIT') {
                setPrice(ticker.lastPrice);
            }
        } catch (err) {
            console.error('Failed to load market price:', err);
        }
    };

    const getAvailableBalance = (asset: string): string => {
        const balance = balances.find(b => b.asset === asset);
        return balance ? parseFloat(balance.available).toFixed(2) : '0.00';
    };

    const getCurrentBalance = (): string => {
        const asset = activeTab === 'buy' ? quoteAsset : baseAsset;
        return getAvailableBalance(asset);
    };

    const calculateTotal = (): string => {
        const qty = parseFloat(quantity) || 0;
        const prc = parseFloat(price) || parseFloat(marketPrice) || 0;
        return (qty * prc).toFixed(2);
    };

    const setPercentage = (percentage: number) => {
        const availableBalance = parseFloat(getCurrentBalance());
        if (activeTab === 'buy') {
            // For buying, use available quote asset balance
            const currentPrice = parseFloat(price) || parseFloat(marketPrice) || 0;
            if (currentPrice > 0) {
                const maxQuantity = availableBalance / currentPrice;
                const targetQuantity = (maxQuantity * percentage) / 100;
                setQuantity(targetQuantity.toFixed(6));
            }
        } else {
            // For selling, use available base asset balance
            const targetQuantity = (availableBalance * percentage) / 100;
            setQuantity(targetQuantity.toFixed(6));
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            setError('Please log in to trade');
            return;
        }

        if (!quantity || parseFloat(quantity) <= 0) {
            setError('Please enter a valid quantity');
            return;
        }

        if (type === 'LIMIT' && (!price || parseFloat(price) <= 0)) {
            setError('Please enter a valid price');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const orderData = {
                market,
                side: activeTab.toUpperCase() as 'BUY' | 'SELL',
                quantity: quantity,
                price: type === 'LIMIT' ? price : marketPrice,
                type: type,
            };

            await createOrder(orderData);
            setSuccess(`${activeTab} order placed successfully!`);
            setQuantity('');
            if (type === 'MARKET') {
                setPrice('');
            }
            
            // Reload balances
            loadBalances();
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col w-[250px] p-4">
                <div className="text-center text-white">
                    <p>Please log in to start trading</p>
                    <a href="/auth/login" className="text-blue-400 hover:text-blue-300 mt-2 block">
                        Login here
                    </a>
                </div>
            </div>
        );
    }

    return <div>
        <div className="flex flex-col">
            <div className="flex flex-row h-[60px]">
                <BuyButton activeTab={activeTab} setActiveTab={setActiveTab} />
                <SellButton activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <div className="flex flex-col gap-1">
                <div className="px-3">
                    <div className="flex flex-row flex-0 gap-5 undefined">
                        <LimitButton type={type} setType={setType} />
                        <MarketButton type={type} setType={setType} />                       
                    </div>
                </div>
                
                {error && (
                    <div className="mx-3 mb-2 p-2 bg-red-600 text-white text-sm rounded">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="mx-3 mb-2 p-2 bg-green-600 text-white text-sm rounded">
                        {success}
                    </div>
                )}
                
                <div className="flex flex-col px-3">
                    <div className="flex flex-col flex-1 gap-3 text-baseTextHighEmphasis">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between flex-row">
                                <p className="text-xs font-normal text-baseTextMedEmphasis">Available Balance</p>
                                <p className="font-medium text-xs text-baseTextHighEmphasis">
                                    {getCurrentBalance()} {activeTab === 'buy' ? quoteAsset : baseAsset}
                                </p>
                            </div>
                        </div>
                        
                        {type === 'LIMIT' && (
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-normal text-baseTextMedEmphasis">
                                    Price ({quoteAsset})
                                </p>
                                <div className="flex flex-col relative">
                                    <input 
                                        step="0.01" 
                                        placeholder="0" 
                                        className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-right text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0" 
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                    <div className="flex flex-row absolute right-1 top-1 p-2">
                                        <span className="text-xs text-gray-400">{quoteAsset}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-normal text-baseTextMedEmphasis">
                                Quantity ({baseAsset})
                            </p>
                            <div className="flex flex-col relative">
                                <input 
                                    step="0.000001" 
                                    placeholder="0" 
                                    className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-right text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0" 
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                                <div className="flex flex-row absolute right-1 top-1 p-2">
                                    <span className="text-xs text-gray-400">{baseAsset}</span>
                                </div>
                            </div>
                            <div className="flex justify-end flex-row">
                                <p className="font-medium pr-2 text-xs text-baseTextMedEmphasis">
                                    ≈ {calculateTotal()} {quoteAsset}
                                </p>
                            </div>
                            <div className="flex justify-center flex-row mt-2 gap-3">
                                <div 
                                    className="flex items-center justify-center flex-row rounded-full px-[16px] py-[6px] text-xs cursor-pointer bg-baseBackgroundL2 hover:bg-baseBackgroundL3"
                                    onClick={() => setPercentage(25)}
                                >
                                    25%
                                </div>
                                <div 
                                    className="flex items-center justify-center flex-row rounded-full px-[16px] py-[6px] text-xs cursor-pointer bg-baseBackgroundL2 hover:bg-baseBackgroundL3"
                                    onClick={() => setPercentage(50)}
                                >
                                    50%
                                </div>
                                <div 
                                    className="flex items-center justify-center flex-row rounded-full px-[16px] py-[6px] text-xs cursor-pointer bg-baseBackgroundL2 hover:bg-baseBackgroundL3"
                                    onClick={() => setPercentage(75)}
                                >
                                    75%
                                </div>
                                <div 
                                    className="flex items-center justify-center flex-row rounded-full px-[16px] py-[6px] text-xs cursor-pointer bg-baseBackgroundL2 hover:bg-baseBackgroundL3"
                                    onClick={() => setPercentage(100)}
                                >
                                    Max
                                </div>
                            </div>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        className={`font-semibold focus:ring-blue-200 focus:none focus:outline-none text-center h-12 rounded-xl text-base px-4 py-2 my-4 ${
                            activeTab === 'buy' 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : 'active:scale-98'}`}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : `${activeTab === 'buy' ? 'Buy' : 'Sell'} ${baseAsset}`}
                    </button>
                </div>
            </div>
        </div>
    </div>
}

function LimitButton({ type, setType }: { type: 'MARKET' | 'LIMIT', setType: (type: 'MARKET' | 'LIMIT') => void }) {
    return <div className="flex flex-col cursor-pointer justify-center py-2" onClick={() => setType('LIMIT')}>
    <div className={`text-sm font-medium py-1 border-b-2 ${type === 'LIMIT' ? "border-accentBlue text-baseTextHighEmphasis" : "border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"}`}>
        Limit
    </div>
</div>
}

function MarketButton({ type, setType }: { type: 'MARKET' | 'LIMIT', setType: (type: 'MARKET' | 'LIMIT') => void }) {
    return  <div className="flex flex-col cursor-pointer justify-center py-2" onClick={() => setType('MARKET')}>
    <div className={`text-sm font-medium py-1 border-b-2 ${type === 'MARKET' ? "border-accentBlue text-baseTextHighEmphasis" : "border-b-2 border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"} `}>
        Market
    </div>
    </div>
}

function BuyButton({ activeTab, setActiveTab }: { activeTab: 'buy' | 'sell', setActiveTab: (tab: 'buy' | 'sell') => void }) {
    return <div className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === 'buy' ? 'border-b-green-500 bg-green-900/20' : 'border-b-gray-600 hover:border-b-gray-400'}`} onClick={() => setActiveTab('buy')}>
        <p className="text-center text-sm font-semibold text-green-400">
            Buy
        </p>
    </div>
}

function SellButton({ activeTab, setActiveTab }: { activeTab: 'buy' | 'sell', setActiveTab: (tab: 'buy' | 'sell') => void }) {
    return <div className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === 'sell' ? 'border-b-red-500 bg-red-900/20' : 'border-b-gray-600 hover:border-b-gray-400'}`} onClick={() => setActiveTab('sell')}>
        <p className="text-center text-sm font-semibold text-red-400">
            Sell
        </p>
    </div>
}