"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';
import SymbolSelectorV3 from './SymbolSelectorV3';
import TradingChartV4 from './TradingChartV4';
import TradingPanelV3 from './TradingPanelV3';
import DealTimerV3 from './DealTimerV3';
import TradeHistoryV3 from './TradeHistoryV3';
import MarketAnalysisV3 from './MarketAnalysisV3';

export interface PriceDataV3 {
    timestamp: number;
    price: number;
    volume: number;
    bid?: number;
    ask?: number;
}

export interface CandlestickDataV3 {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface ActiveTradeV3 {
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

export interface CompletedTradeV3 {
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
const getInitialPriceV3 = (symbol: string): number => {
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
const getVolatilityPatternV3 = (symbol: string) => {
    if (symbol.includes('USD') && !symbol.includes('BTC') && !symbol.includes('ETH')) {
        return { base: 0.0004, trend: 0.0002, spike: 0.0015 }; // Enhanced forex volatility
    } else if (['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'].includes(symbol)) {
        return { base: 0.015, trend: 0.005, spike: 0.04 }; // Enhanced stock volatility
    } else if (symbol.includes('BTC') || symbol.includes('ETH')) {
        return { base: 0.025, trend: 0.01, spike: 0.08 }; // Enhanced crypto volatility
    } else {
        return { base: 0.008, trend: 0.003, spike: 0.025 }; // Enhanced commodities volatility
    }
};

const TradeV3 = () => {
    const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
    const [currentPrice, setCurrentPrice] = useState(getInitialPriceV3('EURUSD'));
    const [priceData, setPriceData] = useState<PriceDataV3[]>([]);
    const [candlestickData, setCandlestickData] = useState<CandlestickDataV3[]>([]);
    const [amount, setAmount] = useState(10);
    const [profit, setProfit] = useState(85);
    const [isDealing, setIsDealing] = useState(false);
    const [dealTimeLeft, setDealTimeLeft] = useState(0);
    const [activeTrades, setActiveTrades] = useState<ActiveTradeV3[]>([]);
    const [completedTrades, setCompletedTrades] = useState<CompletedTradeV3[]>([]);
    const [currentPnL, setCurrentPnL] = useState(0);
    const [marketTrend, setMarketTrend] = useState<'bullish' | 'bearish' | 'sideways'>('sideways');
    const [timeFrame, setTimeFrame] = useState<'1s' | '5s' | '30s' | '1m' | '5m'>('5s');

    // Enhanced refs for price generation
    const priceGenerationRef = useRef({
        trendDirection: 1,
        trendStrength: 0,
        lastPrice: getInitialPriceV3('EURUSD'),
        volatilityMultiplier: 1,
        marketSession: 'active' as 'active' | 'low' | 'high',
        momentumCounter: 0,
        lastSignificantMove: 0,
        priceHistory: [] as number[],
        lastTimestamp: 0 // Add timestamp tracking
    });

    // Enhanced price generation with better candlestick patterns
    const generateRealisticPriceV3 = useCallback((prevPrice: number, symbol: string) => {
        const volatility = getVolatilityPatternV3(symbol);
        const ref = priceGenerationRef.current;
        
        // Market session simulation (affects volatility)
        const hour = new Date().getHours();
        if (hour >= 8 && hour <= 16) {
            ref.marketSession = 'high';
            ref.volatilityMultiplier = 3.0; // Increased multiplier
        } else if (hour >= 17 && hour <= 22) {
            ref.marketSession = 'active';
            ref.volatilityMultiplier = 2.2; // Increased multiplier
        } else {
            ref.marketSession = 'low';
            ref.volatilityMultiplier = 1.5;
        }

        // Enhanced trend persistence with momentum
        ref.momentumCounter++;
        
        // Change trend direction less frequently but with more impact
        if (Math.random() < 0.15) { // Reduced frequency for stronger trends
            ref.trendDirection *= -1;
            ref.trendStrength = Math.random() * 0.95 + 0.4; // Stronger trends
            ref.momentumCounter = 0;
        }

        // Build momentum over time
        if (ref.momentumCounter > 3) {
            ref.trendStrength = Math.min(1.0, ref.trendStrength * 1.2);
        }

        // Enhanced random spikes for better hammer/shooting star patterns
        const isSpike = Math.random() < 0.15; // Increased spike frequency
        let spikeMultiplier = 1;
        
        if (isSpike) {
            // Create more dramatic spikes for better patterns
            spikeMultiplier = (Math.random() < 0.5 ? 1 : -1) * (5 + Math.random() * 8);
            ref.lastSignificantMove = Date.now();
        }

        // Add reversal patterns after significant moves
        const timeSinceLastMove = Date.now() - ref.lastSignificantMove;
        let reversalComponent = 0;
        if (timeSinceLastMove < 10000 && Math.random() < 0.45) { // 45% chance of reversal within 10 seconds
            reversalComponent = -ref.trendDirection * volatility.trend * 4;
        }

        // Add some noise for more realistic patterns
        const noiseComponent = (Math.random() - 0.5) * volatility.base * 0.6;

        // Calculate price change with enhanced volatility
        const randomComponent = (Math.random() - 0.5) * volatility.base * ref.volatilityMultiplier;
        const trendComponent = ref.trendDirection * volatility.trend * ref.trendStrength;
        const spikeComponent = spikeMultiplier * volatility.spike;

        const totalChange = (randomComponent + trendComponent + spikeComponent + reversalComponent + noiseComponent) * prevPrice;
        const newPrice = Math.max(prevPrice * 0.94, Math.min(prevPrice * 1.06, prevPrice + totalChange)); // Prevent extreme moves

        // Keep price history for pattern analysis
        ref.priceHistory.push(newPrice);
        if (ref.priceHistory.length > 25) {
            ref.priceHistory.shift();
        }

        ref.lastPrice = newPrice;
        return newPrice;
    }, []);

    // Reset data when symbol changes
    useEffect(() => {
        const newPrice = getInitialPriceV3(selectedSymbol);
        setCurrentPrice(newPrice);
        setPriceData([]);
        setCandlestickData([]);
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
            priceHistory: [],
            lastTimestamp: 0
        };

        // Generate initial historical data with more variation
        const initialData: PriceDataV3[] = [];
        const now = Date.now();
        let price = newPrice;

        for (let i = 120; i >= 0; i--) {
            price = generateRealisticPriceV3(price, selectedSymbol);
            const spread = price * 0.00003;
            
            initialData.push({
                timestamp: now - (i * 1000),
                price: price,
                volume: Math.random() * 1200 + 250, // Increased volume range
                bid: price - spread,
                ask: price + spread
            });
        }

        setPriceData(initialData);
        // Update lastTimestamp to the latest timestamp from initial data
        priceGenerationRef.current.lastTimestamp = now;
    }, [selectedSymbol, generateRealisticPriceV3]);

    // Enhanced candlestick generation
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
        const candleMap = new Map<number, CandlestickDataV3>();

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
            .slice(-80);

        setCandlestickData(sortedCandles);
    }, [priceData, timeFrame]);

    // Market trend analysis
    useEffect(() => {
        if (candlestickData.length < 12) return;

        const recentCandles = candlestickData.slice(-12);
        const priceChanges = recentCandles.map((candle, index) => {
            if (index === 0) return 0;
            return candle.close - recentCandles[index - 1].close;
        });

        const avgChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
        const volatility = Math.sqrt(priceChanges.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / priceChanges.length);

        if (Math.abs(avgChange) < volatility * 0.12) {
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
            
            const leverage = 2.5;
            const winMultiplier = 18;
            const lossMultiplier = 22;

            const pnl = isWinning
                ? (percentChange * trade.amount * leverage * winMultiplier)
                : -(percentChange * trade.amount * leverage * lossMultiplier);

            return total + pnl;
        }, 0);

        setCurrentPnL(totalPnL);
    }, [currentPrice, activeTrades]);

    // Enhanced price updates with more frequent updates for better patterns
    useEffect(() => {
        const updateInterval = timeFrame === '1s' ? 80 : timeFrame === '5s' ? 250 : 600; // Optimized intervals
        
        const interval = setInterval(() => {
            setCurrentPrice(prevPrice => {
                const newPrice = generateRealisticPriceV3(prevPrice, selectedSymbol);
                const spread = newPrice * 0.00003;

                // Ensure timestamp is strictly increasing
                const now = Date.now();
                const timestamp = Math.max(now, priceGenerationRef.current.lastTimestamp + 1);
                priceGenerationRef.current.lastTimestamp = timestamp;

                const newDataPoint: PriceDataV3 = {
                    timestamp: timestamp,
                    price: newPrice,
                    volume: Math.random() * 1800 + 200, // Increased volume range
                    bid: newPrice - spread,
                    ask: newPrice + spread
                };

                setPriceData(prev => [...prev.slice(-400), newDataPoint]); // Keep more data points
                return newPrice;
            });
        }, updateInterval);

        return () => clearInterval(interval);
    }, [selectedSymbol, timeFrame, generateRealisticPriceV3]);

    const handleSymbolChange = (newSymbol: string) => {
        setSelectedSymbol(newSymbol);
    };

    const handleTrade = useCallback((direction: 'higher' | 'lower', expirySeconds: number = 30) => {
        const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiryTime = Date.now() + (expirySeconds * 1000);

        const newTrade: ActiveTradeV3 = {
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
            
            const completedTrade: CompletedTradeV3 = {
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

            setCompletedTrades(prevCompleted => [completedTrade, ...prevCompleted.slice(0, 59)]);
            
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
                <SymbolSelectorV3
                    selectedSymbol={selectedSymbol}
                    onSymbolChange={handleSymbolChange}
                    currentPrice={currentPrice}
                    marketTrend={marketTrend}
                    priceData={priceData.slice(-10)}
                />

                <div className="mt-6 grid grid-cols-1 xl:grid-cols-5 gap-6">
                    {/* Main Chart Area with Lightweight Charts */}
                    <div className="xl:col-span-3 space-y-6">
                        <TradingChartV4
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
                        />
                        
                        {/* Market Analysis moved below chart on desktop */}
                        <div className="hidden xl:block">
                            <MarketAnalysisV3
                                symbol={selectedSymbol}
                                candlestickData={candlestickData}
                                marketTrend={marketTrend}
                                currentPrice={currentPrice}
                            />
                        </div>
                    </div>

                    {/* Trading Panel and History */}
                    <div className="xl:col-span-2 space-y-6">
                        <TradingPanelV3
                            amount={amount}
                            onAmountChange={setAmount}
                            profit={profit}
                            onTrade={handleTrade}
                            isDealing={isDealing}
                            activeTrades={activeTrades}
                            currentPnL={currentPnL}
                            marketTrend={marketTrend}
                        />
                        
                        <TradeHistoryV3
                            activeTrades={activeTrades}
                            completedTrades={completedTrades}
                            onTradeClose={handleTradeExpiry}
                        />
                    </div>
                </div>

                {/* Market Analysis for mobile/tablet - shown at bottom */}
                <div className="mt-6 xl:hidden">
                    <MarketAnalysisV3
                        symbol={selectedSymbol}
                        candlestickData={candlestickData}
                        marketTrend={marketTrend}
                        currentPrice={currentPrice}
                    />
                </div>

                {/* Enhanced Timer */}
                {isDealing && dealTimeLeft > 0 && (
                    <DealTimerV3
                        timeLeft={dealTimeLeft}
                        onTimerEnd={handleTradeEnd}
                        activeTrades={activeTrades}
                    />
                )}
            </div>
        </div>
    );
};

export default TradeV3;