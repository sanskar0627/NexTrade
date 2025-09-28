'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';

interface TradingChartProps {
  symbol: string;
  height?: number;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function TradingChart({ symbol, height = 600 }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [timeframe, setTimeframe] = useState('1D');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#e0e0e0',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: '#e0e0e0',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00c896',
      downColor: '#ff4757',
      borderDownColor: '#ff4757',
      borderUpColor: '#00c896',
      wickDownColor: '#ff4757',
      wickUpColor: '#00c896',
    });

    candleSeriesRef.current = candleSeries;

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    volumeSeriesRef.current = volumeSeries;

    // Fetch and set initial data
    loadChartData();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [symbol, height]);

  const loadChartData = async () => {
    setIsLoading(true);
    
    try {
      // First, try to get real market data
      let candleData: CandleData[] = [];
      
      if (symbol.endsWith('USDT')) {
        // Crypto data from Binance
        candleData = await fetchBinanceKlines(symbol);
      } else {
        // Stock data from Finnhub or generate mock data
        candleData = await fetchStockKlines(symbol);
      }

      if (candleData.length === 0) {
        // Fallback to mock data if real data fails
        candleData = generateMockCandleData();
      }

      // Convert to lightweight-charts format
      const chartData: CandlestickData[] = candleData.map(candle => ({
        time: candle.time as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

      const volumeData = candleData.map(candle => ({
        time: candle.time as Time,
        value: candle.volume,
        color: candle.close >= candle.open ? '#00c89680' : '#ff475780',
      }));

      candleSeriesRef.current?.setData(chartData);
      volumeSeriesRef.current?.setData(volumeData);

      // Fit content
      chartRef.current?.timeScale().fitContent();

    } catch (error) {
      console.error('Failed to load chart data:', error);
      // Use mock data as fallback
      const mockData = generateMockCandleData();
      const chartData: CandlestickData[] = mockData.map(candle => ({
        time: candle.time as Time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));
      candleSeriesRef.current?.setData(chartData);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBinanceKlines = async (symbol: string): Promise<CandleData[]> => {
    const interval = getInterval(timeframe);
    const limit = getLimit(timeframe);
    
    try {
      // Use our enhanced API route with better rate limits
      const response = await fetch(
        `/api/binance?symbol=${symbol}&type=klines&interval=${interval}&limit=${limit}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch Binance data');
      
      const data = await response.json();
      
      return data.map((kline: any[]) => ({
        time: Math.floor(kline[0] / 1000), // Convert to seconds
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
      }));
    } catch (error) {
      console.log('Enhanced Binance API error, using fallback data');
      throw error;
    }
  };

  const fetchStockKlines = async (symbol: string): Promise<CandleData[]> => {
    // For now, return empty to trigger mock data
    // In production, this would use Finnhub API
    return [];
  };

  const generateMockCandleData = (): CandleData[] => {
    const data: CandleData[] = [];
    let price = symbol === 'SOLUSDT' ? 205 : 43500; // Realistic base prices
    const now = Math.floor(Date.now() / 1000);
    const intervalSeconds = getIntervalSeconds(timeframe);
    const count = getLimit(timeframe);

    for (let i = count; i > 0; i--) {
      const time = now - (i * intervalSeconds);
      const volatility = 0.02; // 2% volatility
      
      const change = (Math.random() - 0.5) * price * volatility;
      const open = price;
      const close = price + change;
      
      const high = Math.max(open, close) + Math.random() * price * 0.01;
      const low = Math.min(open, close) - Math.random() * price * 0.01;
      const volume = Math.random() * 1000000;

      data.push({ time, open, high, low, close, volume });
      price = close;
    }

    return data;
  };

  const getInterval = (timeframe: string): string => {
    const mapping: { [key: string]: string } = {
      '1D': '1d',
      '4H': '4h',
      '1H': '1h',
      '15M': '15m',
      '5M': '5m',
    };
    return mapping[timeframe] || '1d';
  };

  const getIntervalSeconds = (timeframe: string): number => {
    const mapping: { [key: string]: number } = {
      '1D': 86400,
      '4H': 14400,
      '1H': 3600,
      '15M': 900,
      '5M': 300,
    };
    return mapping[timeframe] || 86400;
  };

  const getLimit = (timeframe: string): number => {
    const mapping: { [key: string]: number } = {
      '1D': 100,
      '4H': 168,
      '1H': 168,
      '15M': 96,
      '5M': 288,
    };
    return mapping[timeframe] || 100;
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    loadChartData();
  };

  const timeframes = ['5M', '15M', '1H', '4H', '1D'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Chart Header */}
      <div className="flex justify-between items-center p-4 border-b bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{symbol}</h3>
          {isLoading && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Loading chart data...
            </div>
          )}
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex space-x-1 bg-white dark:bg-gray-600 rounded-lg p-1 border dark:border-gray-500">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => handleTimeframeChange(tf)}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        <div 
          ref={chartContainerRef} 
          className="w-full"
          style={{ height: `${height}px` }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading market data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}