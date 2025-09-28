// Asset logos and icons
interface AssetLogoProps {
  symbol: string;
  size?: number;
  className?: string;
}

export function AssetLogo({ symbol, size = 32, className = '' }: AssetLogoProps) {
  const logoStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: 'white',
    fontSize: size * 0.4,
  };

  // Define colors and icons for major assets
  const assetConfig: { [key: string]: { color?: string; icon?: string; gradient?: string } } = {
    // Crypto
    'BTCUSDT': { color: '#F7931A', icon: '₿' },
    'BTC': { color: '#F7931A', icon: '₿' },
    'ETHUSDT': { color: '#627EEA', icon: 'Ξ' },
    'ETH': { color: '#627EEA', icon: 'Ξ' },
    'SOLUSDT': { gradient: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)', icon: '◎' },
    'SOL': { gradient: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)', icon: '◎' },
    'BNBUSDT': { color: '#F3BA2F', icon: 'B' },
    'BNB': { color: '#F3BA2F', icon: 'B' },
    'XRPUSDT': { color: '#23292F', icon: 'X' },
    'XRP': { color: '#23292F', icon: 'X' },
    'ADAUSDT': { color: '#0033AD', icon: '₳' },
    'ADA': { color: '#0033AD', icon: '₳' },
    'DOGEUSDT': { color: '#C2A633', icon: 'D' },
    'DOGE': { color: '#C2A633', icon: 'D' },
    'MATICUSDT': { color: '#8247E5', icon: 'M' },
    'MATIC': { color: '#8247E5', icon: 'M' },
    'LTCUSDT': { color: '#BFBBBB', icon: 'L' },
    'LTC': { color: '#BFBBBB', icon: 'L' },
    'DOTUSDT': { color: '#E6007A', icon: '●' },
    'DOT': { color: '#E6007A', icon: '●' },

    // Stocks
    'AAPL': { color: '#007AFF', icon: '' },
    'MSFT': { color: '#00BCF2', icon: '⊞' },
    'AMZN': { color: '#FF9900', icon: 'A' },
    'GOOGL': { gradient: 'linear-gradient(135deg, #4285F4 0%, #34A853 25%, #FBBC05 50%, #EA4335 75%)', icon: 'G' },
    'TSLA': { color: '#CC0000', icon: 'T' },
    'NVDA': { color: '#76B900', icon: 'N' },
    'META': { color: '#1877F2', icon: 'f' },
    'NFLX': { color: '#E50914', icon: 'N' },
    'AMD': { color: '#ED1C24', icon: 'A' },
    'JPM': { color: '#0066B2', icon: 'J' },
  };

  const config = assetConfig[symbol] || { color: '#6B7280', icon: symbol[0] };
  
  const style = {
    ...logoStyle,
    background: config.gradient || config.color || '#6B7280',
  };

  return (
    <div 
      className={`inline-flex items-center justify-center rounded-full shadow-sm ${className}`}
      style={style}
    >
      {config.icon}
    </div>
  );
}

// Alternative component for larger, more detailed logos
export function AssetIcon({ symbol, size = 24, className = '' }: AssetLogoProps) {
  return (
    <div className={`relative ${className}`}>
      <AssetLogo symbol={symbol} size={size} />
    </div>
  );
}