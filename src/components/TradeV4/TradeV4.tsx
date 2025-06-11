"use client"
import React, { useState, useEffect, useCallback, useRef } from 'react';
import SymbolSelectorV4 from './SymbolSelectorV4';
import TradingChartV5 from './TradingChartV5';
import TradingPanelV4 from './TradingPanelV4';
import DealTimerV4 from './DealTimerV4';
import TradeHistoryV4 from './TradeHistoryV4';
import MarketAnalysisV4 from './MarketAnalysisV4';
import MT4ConnectionPanel from './MT4ConnectionPanel';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

export interface PriceDataV4 {
    timestamp: number;
    price: number;
    volume: number;
    bid?: number;
    ask?: number;
    source: 'mt4' | 'mt5' | 'simulated';
}

export interface CandlestickDataV4 {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    source: 'mt4' | 'mt5' | 'simulated';
}

export interface ActiveTradeV4 {
    id: string;
    direction: 'higher' | 'lower';
    entryPrice: number;
    amount: number;
    timestamp: number;
    profit: number;
    expiryTime: number;
    symbol: string;
    status: 'active' | 'won' | 'lost';
    source: 'mt4' | 'mt5' | 'simulated';
    mt4OrderId?: number;
    mt5OrderId?: number;
}

export interface CompletedTradeV4 {
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
    source: 'mt4' | 'mt5' | 'simulated';
}

export interface MT4Connection {
    isConnected: boolean;
    server: string;
    account: number;
    balance: number;
    equity: number;
    margin: number;
    freeMargin: number;
    leverage: number;
    lastUpdate: number;
}

export interface MT5Connection {
    isConnected: boolean;
    server: string;
    account: number;
    balance: number;
    equity: number;
    margin: number;
    freeMargin: number;
    leverage: number;
    lastUpdate: number;
}

// Enhanced price generation with MT4/MT5 simulation
const getInitialPriceV4 = (symbol: string): number => {
    const priceMap: Record<string, number> = {
        // Major Forex Pairs
        'EURUSD': 1.0850,
        'GBPUSD': 1.2650,
        'USDJPY': 149.25,
        'AUDUSD': 0.6620,
        'USDCAD': 1.3580,
        'EURGBP': 0.8580,
        'EURJPY': 161.45,
        'GBPJPY': 188.75,
        'AUDJPY': 98.65,
        'NZDUSD': 0.6125,

        // Minor Forex Pairs
        'EURCHF': 0.9685,
        'GBPCHF': 1.1245,
        'AUDCHF': 0.6415,
        'CADCHF': 0.7325,
        'CHFJPY': 154.25,

        // Exotic Pairs
        'USDTRY': 29.45,
        'USDZAR': 18.75,
        'USDMXN': 17.25,

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

// Enhanced market volatility patterns for MT4/MT5 simulation
const getVolatilityPatternV4 = (symbol: string) => {
    if (symbol.includes('USD') && !symbol.includes('BTC') && !symbol.includes('ETH')) {
        return { base: 0.0005, trend: 0.0003, spike: 0.002 }; // Enhanced forex volatility
    } else if (['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'].includes(symbol)) {
        return { base: 0.02, trend: 0.008, spike: 0.05 }; // Enhanced stock volatility
    } else if (symbol.includes('BTC') || symbol.includes('ETH')) {
        return { base: 0.03, trend: 0.015, spike: 0.1 }; // Enhanced crypto volatility
    } else {
        return { base: 0.01, trend: 0.005, spike: 0.03 }; // Enhanced commodities volatility
    }
};

const TradeV4 = () => {
    const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
    const [currentPrice, setCurrentPrice] = useState(getInitialPriceV4('EURUSD'));
    const [priceData, setPriceData] = useState<PriceDataV4[]>([]);
    const [candlestickData, setCandlestickData] = useState<CandlestickDataV4[]>([]);
    const [amount, setAmount] = useState(10);
    const [profit, setProfit] = useState(85);
    const [isDealing, setIsDealing] = useState(false);
    const [dealTimeLeft, setDealTimeLeft] = useState(0);
    const [activeTrades, setActiveTrades] = useState<ActiveTradeV4[]>([]);
    const [completedTrades, setCompletedTrades] = useState<CompletedTradeV4[]>([]);
    const [currentPnL, setCurrentPnL] = useState(0);
    const [marketTrend, setMarketTrend] = useState<'bullish' | 'bearish' | 'sideways'>('sideways');
    const [timeFrame, setTimeFrame] = useState<'1s' | '5s' | '30s' | '1m' | '5m'>('5s');
    
    // MT4/MT5 Connection States
    const [mt4Connection, setMT4Connection] = useState<MT4Connection>({
        isConnected: false,
        server: '',
        account: 0,
        balance: 0,
        equity: 0,
        margin: 0,
        freeMargin: 0,
        leverage: 0,
        lastUpdate: 0
    });

    const [mt5Connection, setMT5Connection] = useState<MT5Connection>({
        isConnected: false,
        server: '',
        account: 0,
        balance: 0,
        equity: 0,
        margin: 0,
        freeMargin: 0,
        leverage: 0,
        lastUpdate: 0
    });

    const [dataSource, setDataSource] = useState<'mt4' | 'mt5' | 'simulated'>('simulated');
    const [showMTPanel, setShowMTPanel] = useState(false);

    // WebSocket connections for MT4/MT5
    const mt4SocketRef = useRef<WebSocket | null>(null);
    const mt5SocketRef = useRef<WebSocket | null>(null);

    // Enhanced refs for price generation
    const priceGenerationRef = useRef({
        trendDirection: 1,
        trendStrength: 0,
        lastPrice: getInitialPriceV4('EURUSD'),
        volatilityMultiplier: 1,
        marketSession: 'active' as 'active' | 'low' | 'high',
        momentumCounter: 0,
        lastSignificantMove: 0,
        priceHistory: [] as number[],
        lastTimestamp: 0
    });

    // MT4/MT5 Connection Functions
    const connectToMT4 = useCallback(async (server: string, login: number, password: string) => {
        try {
            // In a real implementation, this would connect to MT4 via DLL or Expert Advisor
            // For demo purposes, we'll simulate the connection
            console.log('Connecting to MT4...', { server, login });
            
            // Simulate connection delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate successful connection
            setMT4Connection({
                isConnected: true,
                server,
                account: login,
                balance: 10000,
                equity: 10000,
                margin: 0,
                freeMargin: 10000,
                leverage: 500,
                lastUpdate: Date.now()
            });

            setDataSource('mt4');
            
            // In real implementation, start WebSocket connection to MT4 bridge
            // mt4SocketRef.current = new WebSocket('ws://localhost:8080/mt4');
            
            return true;
        } catch (error) {
            console.error('Failed to connect to MT4:', error);
            return false;
        }
    }, []);

    const connectToMT5 = useCallback(async (server: string, login: number, password: string) => {
        try {
            // In a real implementation, this would connect to MT5 via Python API or DLL
            console.log('Connecting to MT5...', { server, login });
            
            // Simulate connection delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate successful connection
            setMT5Connection({
                isConnected: true,
                server,
                account: login,
                balance: 15000,
                equity: 15000,
                margin: 0,
                freeMargin: 15000,
                leverage: 500,
                lastUpdate: Date.now()
            });

            setDataSource('mt5');
            
            // In real implementation, start WebSocket connection to MT5 bridge
            // mt5SocketRef.current = new WebSocket('ws://localhost:8081/mt5');
            
            return true;
        } catch (error) {
            console.error('Failed to connect to MT5:', error);
            return false;
        }
    }, []);

    const disconnectMT4 = useCallback(() => {
        setMT4Connection(prev => ({ ...prev, isConnected: false }));
        if (mt4SocketRef.current) {
            mt4SocketRef.current.close();
            mt4SocketRef.current = null;
        }
        if (dataSource === 'mt4') {
            setDataSource('simulated');
        }
    }, [dataSource]);

    const disconnectMT5 = useCallback(() => {
        setMT5Connection(prev => ({ ...prev, isConnected: false }));
        if (mt5SocketRef.current) {
            mt5SocketRef.current.close();
            mt5SocketRef.current = null;
        }
        if (dataSource === 'mt5') {
            setDataSource('simulated');
        }
    }, [dataSource]);

    // Enhanced price generation with MT4/MT5 simulation
    const generateRealisticPriceV4 = useCallback((prevPrice: number, symbol: string) => {
        const volatility = getVolatilityPatternV4(symbol);
        const ref = priceGenerationRef.current;
        
        // Market session simulation (affects volatility)
        const hour = new Date().getHours();
        if (hour >= 8 && hour <= 16) {
            ref.marketSession = 'high';
            ref.volatilityMultiplier = 3.5; // Increased multiplier for MT4/MT5 simulation
        } else if (hour >= 17 && hour <= 22) {
            ref.marketSession = 'active';
            ref.volatilityMultiplier = 2.5;
        } else {
            ref.marketSession = 'low';
            ref.volatilityMultiplier = 1.8;
        }

        // Enhanced trend persistence with momentum
        ref.momentumCounter++;
        
        // Change trend direction less frequently but with more impact
        if (Math.random() < 0.18) {
            ref.trendDirection *= -1;
            ref.trendStrength = Math.random() * 0.98 + 0.5;
            ref.momentumCounter = 0;
        }

        // Build momentum over time
        if (ref.momentumCounter > 3) {
            ref.trendStrength = Math.min(1.0, ref.trendStrength * 1.25);
        }

        // Enhanced random spikes for better MT4/MT5 simulation
        const isSpike = Math.random() < 0.18;
        let spikeMultiplier = 1;
        
        if (isSpike) {
            spikeMultiplier = (Math.random() < 0.5 ? 1 : -1) * (6 + Math.random() * 10);
            ref.lastSignificantMove = Date.now();
        }

        // Add reversal patterns after significant moves
        const timeSinceLastMove = Date.now() - ref.lastSignificantMove;
        let reversalComponent = 0;
        if (timeSinceLastMove < 12000 && Math.random() < 0.5) {
            reversalComponent = -ref.trendDirection * volatility.trend * 5;
        }

        // Add some noise for more realistic patterns
        const noiseComponent = (Math.random() - 0.5) * volatility.base * 0.8;

        // Calculate price change with enhanced volatility
        const randomComponent = (Math.random() - 0.5) * volatility.base * ref.volatilityMultiplier;
        const trendComponent = ref.trendDirection * volatility.trend * ref.trendStrength;
        const spikeComponent = spikeMultiplier * volatility.spike;

        const totalChange = (randomComponent + trendComponent + spikeComponent + reversalComponent + noiseComponent) * prevPrice;
        const newPrice = Math.max(prevPrice * 0.92, Math.min(prevPrice * 1.08, prevPrice + totalChange));

        // Keep price history for pattern analysis
        ref.priceHistory.push(newPrice);
        if (ref.priceHistory.length > 30) {
            ref.priceHistory.shift();
        }

        ref.lastPrice = newPrice;
        return newPrice;
    }, []);

    // Reset data when symbol changes
    useEffect(() => {
        const newPrice = getInitialPriceV4(selectedSymbol);
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

        // Generate initial historical data
        const initialData: PriceDataV4[] = [];
        const now = Date.now();
        let price = newPrice;

        for (let i = 150; i >= 0; i--) {
            price = generateRealisticPriceV4(price, selectedSymbol);
            const spread = price * 0.00004;
            
            initialData.push({
                timestamp: now - (i * 1000),
                price: price,
                volume: Math.random() * 1500 + 300,
                bid: price - spread,
                ask: price + spread,
                source: dataSource
            });
        }

        setPriceData(initialData);
        priceGenerationRef.current.lastTimestamp = now;
    }, [selectedSymbol, generateRealisticPriceV4, dataSource]);

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
        const candleMap = new Map<number, CandlestickDataV4>();

        priceData.forEach(point => {
            const candleTime = Math.floor(point.timestamp / interval) * interval;

            if (!candleMap.has(candleTime)) {
                candleMap.set(candleTime, {
                    timestamp: candleTime,
                    open: point.price,
                    high: point.price,
                    low: point.price,
                    close: point.price,
                    volume: point.volume,
                    source: point.source
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
            .slice(-100);

        setCandlestickData(sortedCandles);
    }, [priceData, timeFrame]);

    // Market trend analysis
    useEffect(() => {
        if (candlestickData.length < 15) return;

        const recentCandles = candlestickData.slice(-15);
        const priceChanges = recentCandles.map((candle, index) => {
            if (index === 0) return 0;
            return candle.close - recentCandles[index - 1].close;
        });

        const avgChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
        const volatility = Math.sqrt(priceChanges.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / priceChanges.length);

        if (Math.abs(avgChange) < volatility * 0.15) {
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
            
            const leverage = 3.0;
            const winMultiplier = 20;
            const lossMultiplier = 25;

            const pnl = isWinning
                ? (percentChange * trade.amount * leverage * winMultiplier)
                : -(percentChange * trade.amount * leverage * lossMultiplier);

            return total + pnl;
        }, 0);

        setCurrentPnL(totalPnL);
    }, [currentPrice, activeTrades]);

    // Enhanced price updates
    useEffect(() => {
        const updateInterval = timeFrame === '1s' ? 60 : timeFrame === '5s' ? 200 : 500;
        
        const interval = setInterval(() => {
            setCurrentPrice(prevPrice => {
                // If connected to MT4/MT5, we would get real prices here
                // For now, simulate enhanced price movement
                const newPrice = generateRealisticPriceV4(prevPrice, selectedSymbol);
                const spread = newPrice * 0.00004;

                const now = Date.now();
                const timestamp = Math.max(now, priceGenerationRef.current.lastTimestamp + 1);
                priceGenerationRef.current.lastTimestamp = timestamp;

                const newDataPoint: PriceDataV4 = {
                    timestamp: timestamp,
                    price: newPrice,
                    volume: Math.random() * 2000 + 250,
                    bid: newPrice - spread,
                    ask: newPrice + spread,
                    source: dataSource
                };

                setPriceData(prev => [...prev.slice(-500), newDataPoint]);
                return newPrice;
            });
        }, updateInterval);

        return () => clearInterval(interval);
    }, [selectedSymbol, timeFrame, generateRealisticPriceV4, dataSource]);

    const handleSymbolChange = (newSymbol: string) => {
        setSelectedSymbol(newSymbol);
    };

    const handleTrade = useCallback((direction: 'higher' | 'lower', expirySeconds: number = 30) => {
        const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiryTime = Date.now() + (expirySeconds * 1000);

        const newTrade: ActiveTradeV4 = {
            id: tradeId,
            direction,
            entryPrice: currentPrice,
            amount,
            timestamp: Date.now(),
            profit,
            expiryTime,
            symbol: selectedSymbol,
            status: 'active',
            source: dataSource
        };

        // If connected to MT4/MT5, place real order here
        if (dataSource === 'mt4' && mt4Connection.isConnected) {
            // Place MT4 order
            newTrade.mt4OrderId = Math.floor(Math.random() * 1000000);
        } else if (dataSource === 'mt5' && mt5Connection.isConnected) {
            // Place MT5 order
            newTrade.mt5OrderId = Math.floor(Math.random() * 1000000);
        }

        setActiveTrades(prev => [...prev, newTrade]);
        setIsDealing(true);
        setDealTimeLeft(expirySeconds);

        // Auto-close trade when it expires
        setTimeout(() => {
            handleTradeExpiry(tradeId);
        }, expirySeconds * 1000);
    }, [currentPrice, amount, profit, selectedSymbol, dataSource, mt4Connection.isConnected, mt5Connection.isConnected]);

    const handleTradeExpiry = useCallback((tradeId: string) => {
        setActiveTrades(prev => {
            const trade = prev.find(t => t.id === tradeId);
            if (!trade) return prev;

            const finalPrice = currentPrice;
            const priceDiff = finalPrice - trade.entryPrice;
            const isWon = trade.direction === 'higher' ? priceDiff > 0 : priceDiff < 0;
            
            const completedTrade: CompletedTradeV4 = {
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
                result: isWon ? 'won' : 'lost',
                source: trade.source
            };

            setCompletedTrades(prevCompleted => [completedTrade, ...prevCompleted.slice(0, 69)]);
            
            return prev.filter(t => t.id !== tradeId);
        });

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

    const getConnectionStatus = () => {
        if (mt4Connection.isConnected) return { type: 'MT4', status: 'connected', color: 'text-green-400' };
        if (mt5Connection.isConnected) return { type: 'MT5', status: 'connected', color: 'text-green-400' };
        return { type: 'Simulated', status: 'active', color: 'text-yellow-400' };
    };

    const connectionStatus = getConnectionStatus();

    return (
        <div className="min-h-screen bg-hero-gradient p-4">
            <div className="max-w-7xl mx-auto">
                {/* Connection Status Bar */}
                <div className="mb-4 bg-gray-900/50 backdrop-blur-lg border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                {connectionStatus.status === 'connected' ? 
                                    <Wifi className="w-5 h-5 text-green-400" /> : 
                                    <WifiOff className="w-5 h-5 text-yellow-400" />
                                }
                                <span className={`font-semibold ${connectionStatus.color}`}>
                                    {connectionStatus.type} {connectionStatus.status}
                                </span>
                            </div>
                            
                            {mt4Connection.isConnected && (
                                <div className="text-sm text-gray-300">
                                    MT4: {mt4Connection.server} | Account: {mt4Connection.account} | Balance: ${mt4Connection.balance.toFixed(2)}
                                </div>
                            )}
                            
                            {mt5Connection.isConnected && (
                                <div className="text-sm text-gray-300">
                                    MT5: {mt5Connection.server} | Account: {mt5Connection.account} | Balance: ${mt5Connection.balance.toFixed(2)}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowMTPanel(!showMTPanel)}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 text-sm font-medium"
                            >
                                {showMTPanel ? 'Hide' : 'Show'} MT4/MT5 Panel
                            </button>
                            
                            {!mt4Connection.isConnected && !mt5Connection.isConnected && (
                                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Using simulated data</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* MT4/MT5 Connection Panel */}
                {showMTPanel && (
                    <div className="mb-6">
                        <MT4ConnectionPanel
                            mt4Connection={mt4Connection}
                            mt5Connection={mt5Connection}
                            onConnectMT4={connectToMT4}
                            onConnectMT5={connectToMT5}
                            onDisconnectMT4={disconnectMT4}
                            onDisconnectMT5={disconnectMT5}
                        />
                    </div>
                )}

                {/* Enhanced Symbol Selector */}
                <SymbolSelectorV4
                    selectedSymbol={selectedSymbol}
                    onSymbolChange={handleSymbolChange}
                    currentPrice={currentPrice}
                    marketTrend={marketTrend}
                    priceData={priceData.slice(-10)}
                    dataSource={dataSource}
                />

                <div className="mt-6 grid grid-cols-1 xl:grid-cols-5 gap-6">
                    {/* Main Chart Area with Enhanced Lightweight Charts */}
                    <div className="xl:col-span-3 space-y-6">
                        <TradingChartV5
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
                            dataSource={dataSource}
                        />
                        
                        {/* Market Analysis moved below chart on desktop */}
                        <div className="hidden xl:block">
                            <MarketAnalysisV4
                                symbol={selectedSymbol}
                                candlestickData={candlestickData}
                                marketTrend={marketTrend}
                                currentPrice={currentPrice}
                                dataSource={dataSource}
                            />
                        </div>
                    </div>

                    {/* Trading Panel and History */}
                    <div className="xl:col-span-2 space-y-6">
                        <TradingPanelV4
                            amount={amount}
                            onAmountChange={setAmount}
                            profit={profit}
                            onTrade={handleTrade}
                            isDealing={isDealing}
                            activeTrades={activeTrades}
                            currentPnL={currentPnL}
                            marketTrend={marketTrend}
                            dataSource={dataSource}
                            mt4Connection={mt4Connection}
                            mt5Connection={mt5Connection}
                        />
                        
                        <TradeHistoryV4
                            activeTrades={activeTrades}
                            completedTrades={completedTrades}
                            onTradeClose={handleTradeExpiry}
                            dataSource={dataSource}
                        />
                    </div>
                </div>

                {/* Market Analysis for mobile/tablet - shown at bottom */}
                <div className="mt-6 xl:hidden">
                    <MarketAnalysisV4
                        symbol={selectedSymbol}
                        candlestickData={candlestickData}
                        marketTrend={marketTrend}
                        currentPrice={currentPrice}
                        dataSource={dataSource}
                    />
                </div>

                {/* Enhanced Timer */}
                {isDealing && dealTimeLeft > 0 && (
                    <DealTimerV4
                        timeLeft={dealTimeLeft}
                        onTimerEnd={handleTradeEnd}
                        activeTrades={activeTrades}
                        dataSource={dataSource}
                    />
                )}
            </div>
        </div>
    );
};

export default TradeV4;