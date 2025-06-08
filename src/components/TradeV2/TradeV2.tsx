"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';
import SymbolSelectorV2 from './SymbolSelectorV2';
import TradingChartV3 from './TradingChartV3';
import TradingPanelV2 from './TradingPanelV2';
import DealTimerV2 from './DealTimerV2';
import TradeHistoryV2 from './TradeHistoryV2';
import MarketAnalysisV2 from './MarketAnalysisV2';

export interface PriceDataV2 {
    timestamp: number;
    price: number;
    volume: number;
    bid?: number;
    ask?: number;
}

export interface CandlestickDataV2 {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface ActiveTradeV2 {
    id: string;
    direction: 'higher' | 'lower';
    entryPrice: number;
    amount: number;
    timestamp: number;
    profit: number;
    expiryTime: number;
    symbol: string;
    status: 'active' | 'won' | 'lost';
}

export interface CompletedTradeV2 {
    id: string;
    direction: 'higher' | 'lower';
    entryPrice: number;
    exitPrice: number;
    amount: number;
    profit: number;
    payout: number;
    timestamp: number;
    expiryTime: number;
    symbol: string;
    result: 'won' | 'lost';
}

// Enhanced price generation with more realistic market behavior
const getInitialPriceV2 = (symbol: string): number => {
    const priceMap: Record<string, number> = {
        // Forex
        'EURUSD': 1.0850,
        'GBPUSD': 1.2650,
        'USDJPY': 149.25,
        'AUDUSD': 0.6620,
        'USDCAD': 1.3580,
        'EURGBP': 0.8580,

        // Stocks
        'AAPL': 185.50,
        'GOOGL': 142.30,
        'MSFT': 378.90,
        'TSLA': 245.60,
        'NVDA': 875.40,
        'AMZN': 155.20,

        // Crypto
        'BTCUSD': 42850.00,
        'ETHUSD': 2650.00,
        'ADAUSD': 0.485,
        'SOLUSD': 98.50,
        'DOTUSD': 6.25,

        // Commodities
        'XAUUSD': 2025.50,
        'XAGUSD': 24.85,
        'WTIUSD': 73.20,
        'BRENTUSD': 78.50,
        'GASUSD': 2.85
    };

    return priceMap[symbol] || 1.0000;
};

// Enhanced market volatility patterns for better candlestick patterns
const getVolatilityPattern = (symbol: string) => {
    if (symbol.includes('USD') && !symbol.includes('BTC') && !symbol.includes('ETH')) {
        return { base: 0.0003, trend: 0.0001, spike: 0.001 }; // Enhanced forex volatility
    } else if (['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'].includes(symbol)) {
        return { base: 0.01, trend: 0.003, spike: 0.03 }; // Enhanced stock volatility
    } else if (symbol.includes('BTC') || symbol.includes('ETH')) {
        return { base: 0.02, trend: 0.008, spike: 0.06 }; // Enhanced crypto volatility
    } else {
        return { base: 0.005, trend: 0.002, spike: 0.02 }; // Enhanced commodities volatility
    }
};

// Generate historical candlesticks to ensure we always have enough data
const generateHistoricalCandles = (symbol: string, timeFrame: '1s' | '5s' | '30s' | '1m' | '5m', count: number = 200): CandlestickDataV2[] => {
    const timeFrameMs = {
        '1s': 1000,
        '5s': 5000,
        '30s': 30000,
        '1m': 60000,
        '5m': 300000
    };

    const interval = timeFrameMs[timeFrame];
    const basePrice = getInitialPriceV2(symbol);
    const volatility = getVolatilityPattern(symbol);
    const candles: CandlestickDataV2[] = [];
    
    let currentPrice = basePrice;
    const now = Date.now();
    
    // Generate historical candles going backwards in time
    for (let i = count; i >= 0; i--) {
        const timestamp = now - (i * interval);
        
        // Generate realistic OHLC for this candle
        const open = currentPrice;
        
        // Generate price movements within the candle
        const movements = [];
        for (let j = 0; j < 4; j++) {
            const variance = (Math.random() - 0.5) * volatility.base * 2;
            const change = variance * currentPrice;
            movements.push(currentPrice + change);
        }
        
        const high = Math.max(open, ...movements);
        const low = Math.min(open, ...movements);
        const close = movements[movements.length - 1];
        
        // Ensure realistic OHLC relationships
        const finalHigh = Math.max(open, high, low, close);
        const finalLow = Math.min(open, high, low, close);
        
        candles.push({
            timestamp,
            open: Number(open.toFixed(8)),
            high: Number(finalHigh.toFixed(8)),
            low: Number(finalLow.toFixed(8)),
            close: Number(close.toFixed(8)),
            volume: Math.random() * 1000 + 200
        });
        
        // Update current price for next candle
        currentPrice = close;
        
        // Add some trend persistence
        if (Math.random() < 0.1) {
            const trendChange = (Math.random() - 0.5) * volatility.trend * currentPrice;
            currentPrice += trendChange;
        }
    }
    
    return candles;
};

const TradeV2 = () => {
    const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
    const [currentPrice, setCurrentPrice] = useState(getInitialPriceV2('EURUSD'));
    const [priceData, setPriceData] = useState<PriceDataV2[]>([]);
    const [candlestickData, setCandlestickData] = useState<CandlestickDataV2[]>([]);
    const [amount, setAmount] = useState(10);
    const [profit, setProfit] = useState(85);
    const [isDealing, setIsDealing] = useState(false);
    const [dealTimeLeft, setDealTimeLeft] = useState(0);
    const [activeTrades, setActiveTrades] = useState<ActiveTradeV2[]>([]);
    const [completedTrades, setCompletedTrades] = useState<CompletedTradeV2[]>([]);
    const [currentPnL, setCurrentPnL] = useState(0);
    const [marketTrend, setMarketTrend] = useState<'bullish' | 'bearish' | 'sideways'>('sideways');
    const [timeFrame, setTimeFrame] = useState<'1s' | '5s' | '30s' | '1m' | '5m'>('5s');
    const [autoScroll, setAutoScroll] = useState(true);

    // Enhanced refs for price generation
    const priceGenerationRef = useRef({
        trendDirection: 1,
        trendStrength: 0,
        lastPrice: getInitialPriceV2('EURUSD'),
        volatilityMultiplier: 1,
        marketSession: 'active' as 'active' | 'low' | 'high',
        momentumCounter: 0,
        lastSignificantMove: 0,
        priceHistory: [] as number[]
    });

    // Enhanced price generation with better candlestick patterns
    const generateRealisticPrice = useCallback((prevPrice: number, symbol: string) => {
        const volatility = getVolatilityPattern(symbol);
        const ref = priceGenerationRef.current;
        
        // Market session simulation (affects volatility)
        const hour = new Date().getHours();
        if (hour >= 8 && hour <= 16) {
            ref.marketSession = 'high';
            ref.volatilityMultiplier = 2.5; // Increased multiplier
        } else if (hour >= 17 && hour <= 22) {
            ref.marketSession = 'active';
            ref.volatilityMultiplier = 1.8; // Increased multiplier
        } else {
            ref.marketSession = 'low';
            ref.volatilityMultiplier = 1.2;
        }

        // Enhanced trend persistence with momentum
        ref.momentumCounter++;
        
        // Change trend direction less frequently but with more impact
        if (Math.random() < 0.12) { // Reduced frequency for stronger trends
            ref.trendDirection *= -1;
            ref.trendStrength = Math.random() * 0.9 + 0.3; // Stronger trends
            ref.momentumCounter = 0;
        }

        // Build momentum over time
        if (ref.momentumCounter > 3) {
            ref.trendStrength = Math.min(1.0, ref.trendStrength * 1.15);
        }

        // Enhanced random spikes for better hammer/shooting star patterns
        const isSpike = Math.random() < 0.12; // Increased spike frequency
        let spikeMultiplier = 1;
        
        if (isSpike) {
            // Create more dramatic spikes for better patterns
            spikeMultiplier = (Math.random() < 0.5 ? 1 : -1) * (4 + Math.random() * 6);
            ref.lastSignificantMove = Date.now();
        }

        // Add reversal patterns after significant moves
        const timeSinceLastMove = Date.now() - ref.lastSignificantMove;
        let reversalComponent = 0;
        if (timeSinceLastMove < 8000 && Math.random() < 0.4) { // 40% chance of reversal within 8 seconds
            reversalComponent = -ref.trendDirection * volatility.trend * 3;
        }

        // Add some noise for more realistic patterns
        const noiseComponent = (Math.random() - 0.5) * volatility.base * 0.5;

        // Calculate price change with enhanced volatility
        const randomComponent = (Math.random() - 0.5) * volatility.base * ref.volatilityMultiplier;
        const trendComponent = ref.trendDirection * volatility.trend * ref.trendStrength;
        const spikeComponent = spikeMultiplier * volatility.spike;

        const totalChange = (randomComponent + trendComponent + spikeComponent + reversalComponent + noiseComponent) * prevPrice;
        const newPrice = Math.max(prevPrice * 0.95, Math.min(prevPrice * 1.05, prevPrice + totalChange)); // Prevent extreme moves

        // Keep price history for pattern analysis
        ref.priceHistory.push(newPrice);
        if (ref.priceHistory.length > 20) {
            ref.priceHistory.shift();
        }

        ref.lastPrice = newPrice;
        return newPrice;
    }, []);

    // Reset data when symbol changes
    useEffect(() => {
        const newPrice = getInitialPriceV2(selectedSymbol);
        setCurrentPrice(newPrice);
        setPriceData([]);
        setActiveTrades([]);
        setCurrentPnL(0);
        setIsDealing(false);
        setDealTimeLeft(0);

        // Reset price generation state
        priceGenerationRef.current = {
            trendDirection: 1,
            trendStrength: 0,
            lastPrice: newPrice,
            volatilityMultiplier: 1,
            marketSession: 'active',
            momentumCounter: 0,
            lastSignificantMove: 0,
            priceHistory: []
        };

        // Generate historical candlesticks first
        const historicalCandles = generateHistoricalCandles(selectedSymbol, timeFrame, 200);
        setCandlestickData(historicalCandles);

        // Generate initial price data based on the last few candles
        const initialData: PriceDataV2[] = [];
        const now = Date.now();
        const lastCandles = historicalCandles.slice(-10);
        
        lastCandles.forEach((candle, index) => {
            const spread = candle.close * 0.00002;
            initialData.push({
                timestamp: now - ((lastCandles.length - index) * 1000),
                price: candle.close,
                volume: candle.volume,
                bid: candle.close - spread,
                ask: candle.close + spread
            });
        });

        setPriceData(initialData);
    }, [selectedSymbol, timeFrame, generateRealisticPrice]);

    // Enhanced candlestick generation with historical data
    useEffect(() => {
        if (priceData.length < 1) return;

        const timeFrameMs = {
            '1s': 1000,
            '5s': 5000,
            '30s': 30000,
            '1m': 60000,
            '5m': 300000
        };

        const interval = timeFrameMs[timeFrame];
        
        // Start with existing historical candles
        const candleMap = new Map<number, CandlestickDataV2>();
        
        // Add existing historical candles to the map
        candlestickData.forEach(candle => {
            candleMap.set(candle.timestamp, candle);
        });

        // Process new price data into candles
        priceData.forEach(point => {
            const candleTime = Math.floor(point.timestamp / interval) * interval;

            if (!candleMap.has(candleTime)) {
                candleMap.set(candleTime, {
                    timestamp: candleTime,
                    open: point.price,
                    high: point.price,
                    low: point.price,
                    close: point.price,
                    volume: point.volume
                });
            } else {
                const candle = candleMap.get(candleTime)!;
                candle.high = Math.max(candle.high, point.price);
                candle.low = Math.min(candle.low, point.price);
                candle.close = point.price;
                candle.volume += point.volume;
            }
        });

        const sortedCandles = Array.from(candleMap.values())
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(-200); // Keep last 200 candles

        setCandlestickData(sortedCandles);
    }, [priceData, timeFrame, candlestickData]);

    // Market trend analysis
    useEffect(() => {
        if (candlestickData.length < 10) return;

        const recentCandles = candlestickData.slice(-10);
        const priceChanges = recentCandles.map((candle, index) => {
            if (index === 0) return 0;
            return candle.close - recentCandles[index - 1].close;
        });

        const avgChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
        const volatility = Math.sqrt(priceChanges.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / priceChanges.length);

        if (Math.abs(avgChange) < volatility * 0.1) {
            setMarketTrend('sideways');
        } else if (avgChange > 0) {
            setMarketTrend('bullish');
        } else {
            setMarketTrend('bearish');
        }
    }, [candlestickData]);

    // Calculate P&L for all active trades
    useEffect(() => {
        if (activeTrades.length === 0) {
            setCurrentPnL(0);
            return;
        }

        const totalPnL = activeTrades.reduce((total, trade) => {
            const priceDiff = currentPrice - trade.entryPrice;
            const isWinning = trade.direction === 'higher' ? priceDiff > 0 : priceDiff < 0;
            const percentChange = Math.abs(priceDiff / trade.entryPrice) * 100;
            
            const leverage = 2;
            const winMultiplier = 15;
            const lossMultiplier = 20;

            const pnl = isWinning
                ? (percentChange * trade.amount * leverage * winMultiplier)
                : -(percentChange * trade.amount * leverage * lossMultiplier);

            return total + pnl;
        }, 0);

        setCurrentPnL(totalPnL);
    }, [currentPrice, activeTrades]);

    // Enhanced price updates with auto-scroll control
    useEffect(() => {
        if (!autoScroll) return; // Don't update prices if auto-scroll is disabled
        
        const updateInterval = timeFrame === '1s' ? 100 : timeFrame === '5s' ? 300 : 800; // Optimized intervals
        
        const interval = setInterval(() => {
            setCurrentPrice(prevPrice => {
                const newPrice = generateRealisticPrice(prevPrice, selectedSymbol);
                const spread = newPrice * 0.00002;

                const newDataPoint: PriceDataV2 = {
                    timestamp: Date.now(),
                    price: newPrice,
                    volume: Math.random() * 1500 + 150, // Increased volume range
                    bid: newPrice - spread,
                    ask: newPrice + spread
                };

                setPriceData(prev => [...prev.slice(-300), newDataPoint]); // Keep more data points
                return newPrice;
            });
        }, updateInterval);

        return () => clearInterval(interval);
    }, [selectedSymbol, timeFrame, generateRealisticPrice, autoScroll]);

    const handleSymbolChange = (newSymbol: string) => {
        setSelectedSymbol(newSymbol);
    };

    const handleTrade = useCallback((direction: 'higher' | 'lower', expirySeconds: number = 30) => {
        const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiryTime = Date.now() + (expirySeconds * 1000);

        const newTrade: ActiveTradeV2 = {
            id: tradeId,
            direction,
            entryPrice: currentPrice,
            amount,
            timestamp: Date.now(),
            profit,
            expiryTime,
            symbol: selectedSymbol,
            status: 'active'
        };

        setActiveTrades(prev => [...prev, newTrade]);
        setIsDealing(true);
        setDealTimeLeft(expirySeconds);

        // Auto-close trade when it expires
        setTimeout(() => {
            handleTradeExpiry(tradeId);
        }, expirySeconds * 1000);
    }, [currentPrice, amount, profit, selectedSymbol]);

    const handleTradeExpiry = useCallback((tradeId: string) => {
        setActiveTrades(prev => {
            const trade = prev.find(t => t.id === tradeId);
            if (!trade) return prev;

            const finalPrice = currentPrice;
            const priceDiff = finalPrice - trade.entryPrice;
            const isWon = trade.direction === 'higher' ? priceDiff > 0 : priceDiff < 0;
            
            const completedTrade: CompletedTradeV2 = {
                id: trade.id,
                direction: trade.direction,
                entryPrice: trade.entryPrice,
                exitPrice: finalPrice,
                amount: trade.amount,
                profit: trade.profit,
                payout: isWon ? trade.amount * (1 + trade.profit / 100) : 0,
                timestamp: trade.timestamp,
                expiryTime: trade.expiryTime,
                symbol: trade.symbol,
                result: isWon ? 'won' : 'lost'
            };

            setCompletedTrades(prevCompleted => [completedTrade, ...prevCompleted.slice(0, 49)]);
            
            return prev.filter(t => t.id !== tradeId);
        });

        // Check if this was the last active trade
        setActiveTrades(current => {
            const remaining = current.filter(t => t.id !== tradeId);
            if (remaining.length === 0) {
                setIsDealing(false);
                setDealTimeLeft(0);
            }
            return remaining;
        });
    }, [currentPrice]);

    const handleTradeEnd = useCallback(() => {
        setIsDealing(false);
        setDealTimeLeft(0);
    }, []);

    return (
        <div className="min-h-screen bg-hero-gradient p-4">
            <div className="max-w-7xl mx-auto">
                {/* Enhanced Symbol Selector */}
                <SymbolSelectorV2
                    selectedSymbol={selectedSymbol}
                    onSymbolChange={handleSymbolChange}
                    currentPrice={currentPrice}
                    marketTrend={marketTrend}
                    priceData={priceData.slice(-10)}
                />

                {/* Desktop Layout: Chart + Sidebar */}
                <div className="mt-6 grid grid-cols-1 xl:grid-cols-5 gap-6">
                    {/* Main Chart Area */}
                    <div className="xl:col-span-3 space-y-6">
                        <TradingChartV3
                            key={selectedSymbol}
                            priceData={priceData}
                            candlestickData={candlestickData}
                            currentPrice={currentPrice}
                            symbol={selectedSymbol}
                            activeTrades={activeTrades}
                            currentPnL={currentPnL}
                            timeFrame={timeFrame}
                            onTimeFrameChange={setTimeFrame}
                            marketTrend={marketTrend}
                            autoScroll={autoScroll}
                            onAutoScrollChange={setAutoScroll}
                        />
                        
                        {/* Market Analysis moved below chart on desktop */}
                        <div className="hidden xl:block">
                            <MarketAnalysisV2
                                symbol={selectedSymbol}
                                candlestickData={candlestickData}
                                marketTrend={marketTrend}
                                currentPrice={currentPrice}
                            />
                        </div>
                    </div>

                    {/* Trading Panel and History */}
                    <div className="xl:col-span-2 space-y-6">
                        <TradingPanelV2
                            amount={amount}
                            onAmountChange={setAmount}
                            profit={profit}
                            onTrade={handleTrade}
                            isDealing={isDealing}
                            activeTrades={activeTrades}
                            currentPnL={currentPnL}
                            marketTrend={marketTrend}
                        />
                        
                        <TradeHistoryV2
                            activeTrades={activeTrades}
                            completedTrades={completedTrades}
                            onTradeClose={handleTradeExpiry}
                        />
                    </div>
                </div>

                {/* Market Analysis for mobile/tablet (below everything) */}
                <div className="mt-6 xl:hidden">
                    <MarketAnalysisV2
                        symbol={selectedSymbol}
                        candlestickData={candlestickData}
                        marketTrend={marketTrend}
                        currentPrice={currentPrice}
                    />
                </div>

                {/* Enhanced Timer */}
                {isDealing && dealTimeLeft > 0 && (
                    <DealTimerV2
                        timeLeft={dealTimeLeft}
                        onTimerEnd={handleTradeEnd}
                        activeTrades={activeTrades}
                    />
                )}
            </div>
        </div>
    );
};

export default TradeV2;