"use client";

import { usePathname } from "next/navigation";
import { PrimaryButton, SuccessButton } from "./core/Button"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getUserBalance } from "../utils/httpClient";
import { getCurrentUser, logout } from "../utils/auth";

interface Balance {
  asset: string;
  available: string;
  locked: string;
}

export const Appbar = () => {
    const route = usePathname();
    const router = useRouter();
    const [balances, setBalances] = useState<Balance[]>([]);
    const [loading, setLoading] = useState(true);
    const user = getCurrentUser();

    useEffect(() => {
        if (user) {
            loadBalances();
            // Refresh balances every 10 seconds
            const interval = setInterval(loadBalances, 10000);
            return () => clearInterval(interval);
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadBalances = async () => {
        try {
            const userBalances = await getUserBalance();
            setBalances(userBalances);
        } catch (err) {
            console.error('Failed to load balances:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTotalUSDCValue = () => {
        const usdcBalance = balances.find(b => b.asset === 'USDC');
        const solBalance = balances.find(b => b.asset === 'SOL');
        const btcBalance = balances.find(b => b.asset === 'BTC');
        
        let total = parseFloat(usdcBalance?.available || '0');
        
        // Rough estimates for demo (in a real app, you'd get current market prices)
        if (solBalance) {
            total += parseFloat(solBalance.available) * 100; // Assuming SOL = $100
        }
        if (btcBalance) {
            total += parseFloat(btcBalance.available) * 45000; // Assuming BTC = $45000
        }
        
        return total.toFixed(2);
    };

    return <div className="text-white border-b border-slate-800">
        <div className="flex justify-between items-center p-2">
            <div className="flex">
                <div className={`text-xl pl-4 flex flex-col justify-center cursor-pointer text-white`} onClick={() => router.push('/')}>
                    NexTrade
                </div>
                <div className={`text-sm pt-1 flex flex-col justify-center pl-8 cursor-pointer ${route.startsWith('/markets') ? 'text-white' : 'text-slate-500'}`} onClick={() => router.push('/markets')}>
                    Markets
                </div>
                <div className={`text-sm pt-1 flex flex-col justify-center pl-8 cursor-pointer ${route.startsWith('/trade') ? 'text-white' : 'text-slate-500'}`} onClick={() => router.push('/trade/SOL_USDC')}>
                    Trade
                </div>
            </div>
            <div className="flex items-center">
                {user ? (
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-300">
                            Welcome, {user.username}
                        </div>
                        {!loading && (
                            <div className="flex items-center space-x-3 text-sm">
                                <div className="text-green-400 font-semibold">
                                    Portfolio: ${getTotalUSDCValue()}
                                </div>
                                {balances.map((balance) => (
                                    <div key={balance.asset} className="text-gray-300">
                                        {balance.asset}: {parseFloat(balance.available).toFixed(2)}
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={logout}
                            className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded border border-red-400"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => router.push('/auth/login')}
                            className="text-blue-400 hover:text-blue-300 text-sm px-3 py-1"
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => router.push('/auth/register')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                            Sign Up
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
}