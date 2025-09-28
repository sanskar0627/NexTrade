// Professional asset logos with brand-accurate styling
interface AssetLogoProps {
  symbol: string;
  size?: number;
  className?: string;
}

export function AssetLogo({ symbol, size = 32, className = '' }: AssetLogoProps) {
  // Brand-accurate asset configuration - matches real exchange logos
  const assetConfig: { [key: string]: { 
    color?: string; 
    icon?: string; 
    gradient?: string;
    textColor?: string;
    shadow?: string;
  } } = {
    // Major Cryptocurrencies - Exact brand colors
    'BTCUSDT': { 
      gradient: 'linear-gradient(135deg, #F7931A 0%, #FFA500 100%)', 
      icon: '₿',
      shadow: '0 4px 12px rgba(247, 147, 26, 0.3)'
    },
    'BTC': { 
      gradient: 'linear-gradient(135deg, #F7931A 0%, #FFA500 100%)', 
      icon: '₿',
      shadow: '0 4px 12px rgba(247, 147, 26, 0.3)'
    },
    'ETHUSDT': { 
      gradient: 'linear-gradient(135deg, #627EEA 0%, #8A92B2 100%)', 
      icon: 'Ξ',
      shadow: '0 4px 12px rgba(98, 126, 234, 0.3)'
    },
    'ETH': { 
      gradient: 'linear-gradient(135deg, #627EEA 0%, #8A92B2 100%)', 
      icon: 'Ξ',
      shadow: '0 4px 12px rgba(98, 126, 234, 0.3)'
    },
    'SOLUSDT': { 
      gradient: 'linear-gradient(135deg, #9945FF 0%, #14F195 50%, #00D4AA 100%)', 
      icon: '◎',
      shadow: '0 4px 12px rgba(153, 69, 255, 0.4)'
    },
    'SOL': { 
      gradient: 'linear-gradient(135deg, #9945FF 0%, #14F195 50%, #00D4AA 100%)', 
      icon: '◎',
      shadow: '0 4px 12px rgba(153, 69, 255, 0.4)'
    },
    'BNBUSDT': { 
      gradient: 'linear-gradient(135deg, #F3BA2F 0%, #FFD700 100%)', 
      icon: 'B',
      textColor: '#000',
      shadow: '0 4px 12px rgba(243, 186, 47, 0.3)'
    },
    'BNB': { 
      gradient: 'linear-gradient(135deg, #F3BA2F 0%, #FFD700 100%)', 
      icon: 'B',
      textColor: '#000',
      shadow: '0 4px 12px rgba(243, 186, 47, 0.3)'
    },
    'XRPUSDT': { 
      gradient: 'linear-gradient(135deg, #23292F 0%, #000 100%)', 
      icon: '✕',
      shadow: '0 4px 12px rgba(35, 41, 47, 0.4)'
    },
    'XRP': { 
      gradient: 'linear-gradient(135deg, #23292F 0%, #000 100%)', 
      icon: '✕',
      shadow: '0 4px 12px rgba(35, 41, 47, 0.4)'
    },
    'ADAUSDT': { 
      gradient: 'linear-gradient(135deg, #0033AD 0%, #0066FF 100%)', 
      icon: '₳',
      shadow: '0 4px 12px rgba(0, 51, 173, 0.3)'
    },
    'ADA': { 
      gradient: 'linear-gradient(135deg, #0033AD 0%, #0066FF 100%)', 
      icon: '₳',
      shadow: '0 4px 12px rgba(0, 51, 173, 0.3)'
    },
    'DOGEUSDT': { 
      gradient: 'linear-gradient(135deg, #C2A633 0%, #FFD700 100%)', 
      icon: 'Ð',
      textColor: '#000',
      shadow: '0 4px 12px rgba(194, 166, 51, 0.3)'
    },
    'DOGE': { 
      gradient: 'linear-gradient(135deg, #C2A633 0%, #FFD700 100%)', 
      icon: 'Ð',
      textColor: '#000',
      shadow: '0 4px 12px rgba(194, 166, 51, 0.3)'
    },
    'MATICUSDT': { 
      gradient: 'linear-gradient(135deg, #8247E5 0%, #A855F7 100%)', 
      icon: '◆',
      shadow: '0 4px 12px rgba(130, 71, 229, 0.3)'
    },
    'MATIC': { 
      gradient: 'linear-gradient(135deg, #8247E5 0%, #A855F7 100%)', 
      icon: '◆',
      shadow: '0 4px 12px rgba(130, 71, 229, 0.3)'
    },

    // Major Stocks - Brand colors
    'AAPL': { 
      gradient: 'linear-gradient(135deg, #1D1D1F 0%, #000 100%)', 
      icon: '',
      shadow: '0 4px 12px rgba(29, 29, 31, 0.4)'
    },
    'MSFT': { 
      gradient: 'linear-gradient(135deg, #00BCF2 0%, #0078D4 100%)', 
      icon: '⊞',
      shadow: '0 4px 12px rgba(0, 188, 242, 0.3)'
    },
    'AMZN': { 
      gradient: 'linear-gradient(135deg, #FF9900 0%, #FFB84D 100%)', 
      icon: 'A',
      textColor: '#000',
      shadow: '0 4px 12px rgba(255, 153, 0, 0.3)'
    },
    'GOOGL': { 
      gradient: 'linear-gradient(135deg, #4285F4 0%, #34A853 25%, #FBBC05 50%, #EA4335 100%)', 
      icon: 'G',
      shadow: '0 4px 12px rgba(66, 133, 244, 0.3)'
    },
    'TSLA': { 
      gradient: 'linear-gradient(135deg, #CC0000 0%, #E53E3E 100%)', 
      icon: 'T',
      shadow: '0 4px 12px rgba(204, 0, 0, 0.3)'
    },
    'NVDA': { 
      gradient: 'linear-gradient(135deg, #76B900 0%, #90EE90 100%)', 
      icon: '⚡',
      shadow: '0 4px 12px rgba(118, 185, 0, 0.3)'
    },
    'META': { 
      gradient: 'linear-gradient(135deg, #1877F2 0%, #42A5F5 100%)', 
      icon: 'f',
      shadow: '0 4px 12px rgba(24, 119, 242, 0.3)'
    },
    'NFLX': { 
      gradient: 'linear-gradient(135deg, #E50914 0%, #B71C1C 100%)', 
      icon: 'N',
      shadow: '0 4px 12px rgba(229, 9, 20, 0.3)'
    },
    'AMD': { 
      gradient: 'linear-gradient(135deg, #ED1C24 0%, #FF5722 100%)', 
      icon: '▲',
      shadow: '0 4px 12px rgba(237, 28, 36, 0.3)'
    },
    'JPM': { 
      gradient: 'linear-gradient(135deg, #0066B2 0%, #1976D2 100%)', 
      icon: '$',
      shadow: '0 4px 12px rgba(0, 102, 178, 0.3)'
    },
  };

  const config = assetConfig[symbol] || { 
    gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)', 
    icon: symbol[0]?.toUpperCase() || '?',
    shadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
  };
  
  const logoStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: config.textColor || 'white',
    fontSize: size * 0.4,
    background: config.gradient || config.color || '#6B7280',
    boxShadow: config.shadow,
    border: '2px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.2s ease-in-out',
  };

  return (
    <div 
      className={`inline-flex items-center justify-center rounded-full hover:scale-110 transition-transform ${className}`}
      style={logoStyle}
      title={`${symbol} Logo`}
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