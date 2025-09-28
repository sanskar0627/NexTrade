import { useMemo, useCallback, useState, useEffect } from 'react';

// Memoized hooks for expensive calculations
export function useMemoizedPriceCalculations(positions: any[]) {
  return useMemo(() => {
    if (!positions?.length) return { totalValue: 0, totalPnl: 0, totalPnlPercent: 0 };

    let totalValue = 0;
    let totalPnl = 0;
    let totalCost = 0;

    positions.forEach((position) => {
      const marketValue = position.marketValue || 0;
      const pnl = position.pnl || 0;
      
      totalValue += marketValue;
      totalPnl += pnl;
      totalCost += marketValue - pnl;
    });

    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    return {
      totalValue,
      totalPnl,
      totalPnlPercent,
    };
  }, [positions]);
}

export function useMemoizedOrderCalculations(orders: any[]) {
  return useMemo(() => {
    if (!orders?.length) return { totalOrders: 0, filledOrders: 0, openOrders: 0 };

    const totalOrders = orders.length;
    const filledOrders = orders.filter(order => order.status === 'filled').length;
    const openOrders = orders.filter(order => order.status === 'open').length;

    return {
      totalOrders,
      filledOrders,
      openOrders,
    };
  }, [orders]);
}

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  return useCallback(
    throttle(callback, delay),
    [callback, delay]
  ) as T;
}

function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return ((...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  }) as T;
}

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}