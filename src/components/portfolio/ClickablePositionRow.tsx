'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AssetLogo } from '@/components/ui/AssetLogo';
import { formatCurrency, toNumber, formatPercent } from '@/lib/format-currency';

interface Position {
  id: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  pnl: number;
  pnlPercent: number;
  asset: {
    id?: string;
    symbol: string;
    name: string;
    type?: string;
  };
}

interface ClickablePositionRowProps {
  position: Position;
}

export function ClickablePositionRow({ position }: ClickablePositionRowProps) {
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/trade/${position.asset.symbol}`);
  };

  return (
    <tr 
      className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
      onClick={handleRowClick}
    >
      <td className="py-4">
        <div className="flex items-center space-x-3">
          <AssetLogo symbol={position.asset.symbol} size={24} />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {position.asset.symbol}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {position.asset.name}
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 text-right text-gray-900 dark:text-white">{position.qty}</td>
      <td className="py-4 text-right text-gray-900 dark:text-white">{formatCurrency(position.avgPrice)}</td>
      <td className="py-4 text-right text-gray-900 dark:text-white">{formatCurrency(position.currentPrice)}</td>
      <td className="py-4 text-right text-gray-900 dark:text-white">{formatCurrency(position.marketValue)}</td>
      <td className={`py-4 text-right ${toNumber(position.pnl) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {formatCurrency(position.pnl)}
      </td>
      <td className={`py-4 text-right ${toNumber(position.pnlPercent) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {formatPercent(position.pnlPercent)}
      </td>
      <td className="py-4 text-right">
        <Link
          href={`/trade/${position.asset.symbol}`}
          onClick={(e) => e.stopPropagation()}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          Trade
        </Link>
      </td>
    </tr>
  );
}