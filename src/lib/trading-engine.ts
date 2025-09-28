import { PrismaClient, Prisma } from '@prisma/client';

export interface OrderRequest {
  userId: string;
  assetId: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  qty: number;
  limitPrice?: number;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
  fills?: Array<{
    id: string;
    price: number;
    qty: number;
    fee: number;
  }>;
}

export class TradingEngine {
  constructor(private prisma: PrismaClient) {}

  async processOrder(
    orderRequest: OrderRequest,
    currentPrice?: number
  ): Promise<OrderResult> {
    console.log('🔄 Processing order:', {
      symbol: orderRequest.assetId,
      side: orderRequest.side,
      type: orderRequest.type,
      qty: orderRequest.qty,
      limitPrice: orderRequest.limitPrice,
      currentPrice
    });

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          // Get asset info for validation
          const asset = await tx.asset.findUnique({
            where: { id: orderRequest.assetId },
          });

          if (!asset) {
            console.error('❌ Asset not found:', orderRequest.assetId);
            return { success: false, error: 'Asset not found' };
          }

          // Get user's USD account
          const account = await tx.account.findFirst({
            where: { 
              userId: orderRequest.userId,
              currency: 'USD'
            },
          });

          if (!account) {
            console.error('❌ Account not found for user:', orderRequest.userId);
            return { success: false, error: 'Account not found' };
          }

          console.log('✅ Found asset and account:', {
            asset: asset.symbol,
            balance: account.balance.toString(),
            tickSize: asset.tickSize.toString(),
            minNotional: asset.minNotional.toString()
          });

          // Validate order parameters
          const validation = this.validateOrder(orderRequest, asset, account, currentPrice);
          if (!validation.valid) {
            console.error('❌ Order validation failed:', validation.error);
            return { success: false, error: validation.error };
          }

          // Create the order
          const order = await tx.order.create({
            data: {
              userId: orderRequest.userId,
              assetId: orderRequest.assetId,
              side: orderRequest.side,
              type: orderRequest.type,
              qty: orderRequest.qty,
              limitPrice: orderRequest.limitPrice,
              status: 'open',
            },
          });

          // Determine execution price
          let executionPrice: number;
          
          if (orderRequest.type === 'market') {
            if (!currentPrice) {
              await tx.order.update({
                where: { id: order.id },
                data: { 
                  status: 'rejected',
                  reason: 'No market price available'
                },
              });
              return { success: false, error: 'No market price available' };
            }
            executionPrice = currentPrice;
          } else {
            // Limit order
            if (!orderRequest.limitPrice) {
              await tx.order.update({
                where: { id: order.id },
                data: { 
                  status: 'rejected',
                  reason: 'Limit price required for limit orders'
                },
              });
              return { success: false, error: 'Limit price required' };
            }
            
            // For demo, we'll fill limit orders immediately if they cross the market
            if (!currentPrice || !this.shouldFillLimitOrder(orderRequest, currentPrice)) {
              // Keep order open (in a real system, this would go to the order book)
              return { success: true, orderId: order.id };
            }
            
            executionPrice = orderRequest.limitPrice;
          }

          // Execute the fill
          const fillResult = await this.executeFill(
            tx,
            order,
            asset,
            account,
            executionPrice,
            orderRequest.qty
          );

          if (!fillResult.success) {
            await tx.order.update({
              where: { id: order.id },
              data: { 
                status: 'rejected',
                reason: fillResult.error
              },
            });
            return { success: false, error: fillResult.error };
          }

          // Update order status
          await tx.order.update({
            where: { id: order.id },
            data: { status: 'filled' },
          });

          return {
            success: true,
            orderId: order.id,
            fills: fillResult.fills,
          };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          timeout: 10000,
        }
      );
    } catch (error) {
      console.error('Order processing error:', error);
      return { success: false, error: 'Internal error processing order' };
    }
  }

  private validateOrder(
    orderRequest: OrderRequest,
    asset: any,
    account: any,
    currentPrice?: number
  ): { valid: boolean; error?: string } {
    // Check minimum quantity
    if (orderRequest.qty <= 0) {
      return { valid: false, error: 'Quantity must be positive' };
    }

    // Check tick size for limit orders only
    const tickSize = parseFloat(asset.tickSize.toString());
    if (orderRequest.type === 'limit' && orderRequest.limitPrice) {
      const priceRemainder = orderRequest.limitPrice % tickSize;
      if (Math.abs(priceRemainder) > 0.000001) { // Allow for floating point precision
        return { valid: false, error: `Price must be in increments of ${tickSize}` };
      }
    }

    // Check minimum notional value
    const minNotional = parseFloat(asset.minNotional.toString());
    const price = orderRequest.type === 'market' ? (currentPrice || 0) : (orderRequest.limitPrice || 0);
    const estimatedValue = orderRequest.qty * price;
    
    if (estimatedValue < minNotional && price > 0) {
      return { valid: false, error: `Order value $${estimatedValue.toFixed(2)} must be at least $${minNotional.toFixed(2)}` };
    }

    // For buy orders, check if user has enough balance
    if (orderRequest.side === 'buy') {
      const balance = parseFloat(account.balance.toString());
      const requiredBalance = estimatedValue * 1.002; // Add 0.2% buffer for fees
      if (balance < requiredBalance && price > 0) {
        return { 
          valid: false, 
          error: `Insufficient balance. Need $${requiredBalance.toFixed(2)}, have $${balance.toFixed(2)}` 
        };
      }
    }

    return { valid: true };
  }

  private shouldFillLimitOrder(
    orderRequest: OrderRequest,
    currentPrice: number
  ): boolean {
    if (!orderRequest.limitPrice) return false;

    if (orderRequest.side === 'buy') {
      return orderRequest.limitPrice >= currentPrice;
    } else {
      return orderRequest.limitPrice <= currentPrice;
    }
  }

  private async executeFill(
    tx: any,
    order: any,
    asset: any,
    account: any,
    price: number,
    qty: number
  ): Promise<{ success: boolean; error?: string; fills?: any[] }> {
    try {
      const fillValue = price * qty;
      const fee = fillValue * 0.001; // 0.1% fee
      
      // Create the fill record
      const fill = await tx.fill.create({
        data: {
          orderId: order.id,
          price,
          qty,
          fee,
        },
      });

      if (order.side === 'buy') {
        // Buying: deduct USD, add position
        const newBalance = parseFloat(account.balance.toString()) - fillValue - fee;
        
        if (newBalance < 0) {
          return { success: false, error: 'Insufficient balance after fees' };
        }

        // Update account balance
        await tx.account.update({
          where: { id: account.id },
          data: { balance: newBalance },
        });

        // Update or create position
        const existingPosition = await tx.position.findUnique({
          where: {
            userId_assetId: {
              userId: order.userId,
              assetId: order.assetId,
            },
          },
        });

        if (existingPosition) {
          const currentQty = parseFloat(existingPosition.qty.toString());
          const currentAvgPrice = parseFloat(existingPosition.avgPrice.toString());
          const newQty = currentQty + qty;
          const newAvgPrice = ((currentQty * currentAvgPrice) + (qty * price)) / newQty;

          await tx.position.update({
            where: {
              userId_assetId: {
                userId: order.userId,
                assetId: order.assetId,
              },
            },
            data: {
              qty: newQty,
              avgPrice: newAvgPrice,
            },
          });
        } else {
          await tx.position.create({
            data: {
              userId: order.userId,
              assetId: order.assetId,
              qty,
              avgPrice: price,
            },
          });
        }

        // Create ledger entries
        await tx.ledger.create({
          data: {
            userId: order.userId,
            accountId: account.id,
            change: -(fillValue + fee),
            balanceAfter: newBalance,
            refType: 'trade_fill',
            refId: fill.id,
            meta: {
              orderId: order.id,
              side: 'buy',
              symbol: asset.symbol,
              price,
              qty,
              fee,
            },
          },
        });
      } else {
        // Selling: check position, add USD
        const position = await tx.position.findUnique({
          where: {
            userId_assetId: {
              userId: order.userId,
              assetId: order.assetId,
            },
          },
        });

        if (!position) {
          return { success: false, error: 'No position to sell' };
        }

        const currentQty = parseFloat(position.qty.toString());
        if (currentQty < qty) {
          return { success: false, error: 'Insufficient position quantity' };
        }

        const newBalance = parseFloat(account.balance.toString()) + fillValue - fee;
        const newQty = currentQty - qty;

        // Update account balance
        await tx.account.update({
          where: { id: account.id },
          data: { balance: newBalance },
        });

        // Update or delete position
        if (newQty > 0) {
          await tx.position.update({
            where: {
              userId_assetId: {
                userId: order.userId,
                assetId: order.assetId,
              },
            },
            data: { qty: newQty },
          });
        } else {
          await tx.position.delete({
            where: {
              userId_assetId: {
                userId: order.userId,
                assetId: order.assetId,
              },
            },
          });
        }

        // Create ledger entry
        await tx.ledger.create({
          data: {
            userId: order.userId,
            accountId: account.id,
            change: fillValue - fee,
            balanceAfter: newBalance,
            refType: 'trade_fill',
            refId: fill.id,
            meta: {
              orderId: order.id,
              side: 'sell',
              symbol: asset.symbol,
              price,
              qty,
              fee,
            },
          },
        });
      }

      return {
        success: true,
        fills: [{
          id: fill.id,
          price,
          qty,
          fee,
        }],
      };
    } catch (error) {
      console.error('Fill execution error:', error);
      return { success: false, error: 'Failed to execute fill' };
    }
  }

  async getCurrentMarketPrice(symbol: string): Promise<number | null> {
    try {
      // Use unified price service for consistent pricing
      const { PriceService } = await import('./price-service');
      const priceService = PriceService.getInstance();
      return await priceService.getCurrentPrice(symbol);
    } catch (error) {
      console.error(`Failed to get market price for ${symbol}:`, error);
      
      // Fallback prices with correct XRP price!
      const fallbackPrices: Record<string, number> = {
        'BTCUSDT': 43500.00,
        'ETHUSDT': 2650.00,
        'SOLUSDT': 205.80,    // Correct SOL price
        'XRPUSDT': 2.831,     // Correct XRP price (NOT $43,750!)
        'AAPL': 175.50,
        'MSFT': 415.25,
        'TSLA': 248.75,
      };

      return fallbackPrices[symbol] || null;
    }
  }
}