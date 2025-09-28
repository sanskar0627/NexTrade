// Currency formatting utility with defensive type checking
export function formatCurrency(value: unknown, currency: string = 'USD', decimals: number = 2): string {
  // Handle null, undefined, or invalid values
  if (value === null || value === undefined) {
    return '–';
  }

  // Convert various types to number
  let numValue: number;
  
  if (typeof value === 'number') {
    numValue = value;
  } else if (typeof value === 'string') {
    numValue = parseFloat(value);
  } else if (typeof value === 'object' && value !== null) {
    // Handle Prisma Decimal objects
    if ('toString' in value && typeof value.toString === 'function') {
      numValue = parseFloat(value.toString());
    } else {
      numValue = 0;
    }
  } else {
    numValue = Number(value) || 0;
  }

  // Check for NaN or invalid numbers
  if (isNaN(numValue) || !isFinite(numValue)) {
    return '–';
  }

  // Format with proper currency symbol
  const symbol = currency === 'USD' ? '$' : currency;
  return `${symbol}${numValue.toFixed(decimals)}`;
}

// Utility to safely convert any value to number
export function toNumber(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'number') {
    return isNaN(value) ? fallback : value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }

  if (typeof value === 'object' && value !== null) {
    // Handle Prisma Decimal objects
    if ('toString' in value && typeof value.toString === 'function') {
      const parsed = parseFloat(value.toString());
      return isNaN(parsed) ? fallback : parsed;
    }
  }

  const converted = Number(value);
  return isNaN(converted) ? fallback : converted;
}

// Format percentage with defensive checking
export function formatPercent(value: unknown, decimals: number = 2): string {
  const numValue = toNumber(value, 0);
  const prefix = numValue >= 0 ? '+' : '';
  return `${prefix}${numValue.toFixed(decimals)}%`;
}