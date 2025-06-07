"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';
import SymbolSelectorV2 from './SymbolSelectorV2';
import TradingChartV2 from './TradingChartV2';
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

// Market volatility patterns for different asset types
const getVolatilityPattern = (symbol: string) => {
    if (symbol.includes('USD') && !symbol.includes('BTC') && !symbol.includes('ETH')) {
        return { base: 0.00008, trend: 0.00002, spike: 0.0002 };
    } else if (['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'].includes(symbol)) {
        return { base: 0.002, trend: 0.0005, spike: 0.008 };
    } else if (symbol.includes('BTC') || symbol.includes('ETH')) {
        return { base: 0.005, trend: 0.001, spike: 0.02 };
    } else {
        return { base: 0.001, trend: 0.0003, spike: 0.005 };
    }
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

    // Refs for price generation
    const priceGenerationRef = useRef({
        trendDirection: 1,
        trendStrength: 0,
        lastPrice: getInitialPriceV2('EURUSD'),
        volatilityMultiplier: 1,
        marketSession: 'active' as 'active' | 'low' | 'high'
    });

    // Enhanced price generation with market sessions and trends
    const generateRealisticPrice = useCallback((prevPrice: number, symbol: string) => {
        const volatility = getVolatilityPattern(symbol);
        const ref = priceGenerationRef.current;
        
        // Market session simulation (affects volatility)
        const hour = new Date().getHours();
        if (hour >= 8 && hour <= 16) {
            ref.marketSession = 'high'; // High volatility
            ref.volatilityMultiplier = 1.5;
        } else if (hour >= 17 && hour <= 22) {
            ref.marketSession = 'active'; // Normal volatility
            ref.volatilityMultiplier = 1.0;
        } else {
            ref.marketSession = 'low'; // Low volatility
            ref.volatilityMultiplier = 0.6;
        }

        // Trend persistence (70% chance to continue current trend)
        if (Math.random() < 0.3) {
            ref.trendDirection *= -1;
            ref.trendStrength = Math.random() * 0.5;
        }

        // Random spikes (2% chance)
        const isSpike = Math.random() < 0.02;
        const spikeMultiplier = isSpike ? (Math.random() < 0.5 ? 3 : -3) : 1;

        // Calculate price change
        const randomComponent = (Math.random() - 0.5) * volatility.base * ref.volatilityMultiplier;
        const trendComponent = ref.trendDirection * volatility.trend * ref.trendStrength;
        const spikeComponent = spikeMultiplier * volatility.spike;

        const totalChange = (randomComponent + trendComponent + spikeComponent) * prevPrice;
        const newPrice = prevPrice + totalChange;

        ref.lastPrice = newPrice;
        return newPrice;
    }, []);

    // Reset data when symbol changes
    useEffect(() => {
        const newPrice = getInitialPriceV2(selectedSymbol);
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
            marketSession: 'active'
        };

        // Generate initial historical data
        const initialData: PriceDataV2[] = [];
        const now = Date.now();
        let price = newPrice;

        for (let i = 100; i >= 0; i--) {
            price = generateRealisticPrice(price, selectedSymbol);
            const spread = price * 0.00002; // 0.002% spread
            
            initialData.push({
                timestamp: now - (i * 1000),
                price: price,
                volume: Math.random() * 500 + 100,
                bid: price - spread,
                ask: price + spread
            });
        }

        setPriceData(initialData);
    }, [selectedSymbol, generateRealisticPrice]);

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
        const candleMap = new Map<number, CandlestickDataV2>();

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
            .slice(-60); // Keep last 60 candles

        setCandlestickData(sortedCandles);
    }, [priceData, timeFrame]);

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

    // Enhanced price updates with realistic timing
    useEffect(() => {
        const updateInterval = timeFrame === '1s' ? 100 : timeFrame === '5s' ? 500 : 1000;
        
        const interval = setInterval(() => {
            setCurrentPrice(prevPrice => {
                const newPrice = generateRealisticPrice(prevPrice, selectedSymbol);
                const spread = newPrice * 0.00002;

                const newDataPoint: PriceDataV2 = {
                    timestamp: Date.now(),
                    price: newPrice,
                    volume: Math.random() * 1000 + 50,
                    bid: newPrice - spread,
                    ask: newPrice + spread
                };

                setPriceData(prev => [...prev.slice(-200), newDataPoint]);
                return newPrice;
            });
        }, updateInterval);

        return () => clearInterval(interval);
    }, [selectedSymbol, timeFrame, generateRealisticPrice]);

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

                <div className="mt-6 grid grid-cols-1 xl:grid-cols-5 gap-6">
                    {/* Main Chart Area */}
                    <div className="xl:col-span-3 space-y-6">
                        <TradingChartV2
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
                        
                        {/* Market Analysis */}
                        <MarketAnalysisV2
                            symbol={selectedSymbol}
                            candlestickData={candlestickData}
                            marketTrend={marketTrend}
                            currentPrice={currentPrice}
                        />
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