"use client";
import { MarketBar } from "@/app/components/MarketBar";
import { SwapUI } from "@/app/components/SwapUI";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { Trades } from "@/app/components/Trades";
import { OrderHistory } from "@/app/components/OrderHistory";
import { useParams } from "next/navigation";

export default function Page() {
    const { market } = useParams();
    return <div className="flex flex-row flex-1">
        <div className="flex flex-col flex-1">
            <MarketBar market={market as string} />
            <div className="flex flex-row h-[920px] border-y border-slate-800">
                <div className="flex flex-col flex-1">
                    <div className="h-2/3">
                        <TradeView market={market as string} />
                    </div>
                    <div className="h-1/3 border-t border-slate-800">
                        <Trades market={market as string} />
                    </div>
                </div>
                <div className="flex flex-col w-[250px] overflow-hidden">
                    <Depth market={market as string} /> 
                </div>
            </div>
        </div>
        <div className="w-[10px] flex-col border-slate-800 border-l"></div>
        <div>
            <div className="flex flex-col w-[300px]">
                <div className="h-1/2">
                    <SwapUI market={market as string} />
                </div>
                <div className="h-1/2 border-t border-slate-800">
                    <OrderHistory market={market as string} />
                </div>
            </div>
        </div>
    </div>
}