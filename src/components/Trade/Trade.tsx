"use client"
import React, { useState, useEffect, useCallback } from 'react';
import SymbolSelector from './SymbolSelector';
import TradingChart from './TradingChart';
import TradingPanel from './TradingPanel';
import DealTimer from './DealTimer';

interface PriceData {
    timestamp: number;
    price: number;
    volume: number;
}

interface ActiveTrade {
    direction: 'higher' | 'lower';
    entryPrice: number;
    amount: number;
    timestamp: number;
    profit: number;
}

// Precios iniciales por símbolo para mayor realismo
const getInitialPrice = (symbol: string): number => {
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

const Trade = () => {
    const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
    const [currentPrice, setCurrentPrice] = useState(getInitialPrice('EURUSD'));
    const [priceData, setPriceData] = useState<PriceData[]>([]);
    const [amount, setAmount] = useState(10);
    const [profit, setProfit] = useState(85);
    const [isDealing, setIsDealing] = useState(false);
    const [dealTimeLeft, setDealTimeLeft] = useState(0);
    const [activeTrade, setActiveTrade] = useState<ActiveTrade | null>(null);
    const [currentPnL, setCurrentPnL] = useState(0);

    // Resetear datos cuando cambia el símbolo
    useEffect(() => {
        const newPrice = getInitialPrice(selectedSymbol);
        setCurrentPrice(newPrice);
        setPriceData([]); // Limpiar datos anteriores
        setActiveTrade(null); // Cancelar trade activo
        setCurrentPnL(0);
        setIsDealing(false);
        setDealTimeLeft(0);

        // Generar algunos datos iniciales para el nuevo símbolo
        const initialData: PriceData[] = [];
        const now = Date.now();

        for (let i = 20; i >= 0; i--) {
            const variance = (Math.random() - 0.5) * 0.001; // Variación más pequeña para datos iniciales
            const price = newPrice + (variance * newPrice);

            initialData.push({
                timestamp: now - (i * 1000), // Datos cada segundo hacia atrás
                price: price,
                volume: Math.random() * 500 + 100
            });
        }

        setPriceData(initialData);
    }, [selectedSymbol]);

    // Calcular P&L en tiempo real
    useEffect(() => {
        if (activeTrade) {
            const priceDiff = currentPrice - activeTrade.entryPrice;
            const isWinning = activeTrade.direction === 'higher' ? priceDiff > 0 : priceDiff < 0;

            const percentChange = Math.abs(priceDiff / activeTrade.entryPrice) * 100;

            // Multiplicadores más agresivos para la demo
            const leverage = 2; // Simula apalancamiento alto
            const winMultiplier = 15; // Factor de ganancia agresivo
            const lossMultiplier = 20; // Factor de pérdida agresivo

            const pnl = isWinning
                ? (percentChange * activeTrade.amount * leverage * winMultiplier)
                : -(percentChange * activeTrade.amount * leverage * lossMultiplier);

            setCurrentPnL(pnl);
        }
    }, [currentPrice, activeTrade]);

    // Actualización de precios en tiempo real
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentPrice(prevPrice => {
                // Variación de precio más realista según el tipo de activo
                let variance = 0;

                if (selectedSymbol.includes('USD') && !selectedSymbol.includes('BTC') && !selectedSymbol.includes('ETH')) {
                    // Forex - variaciones pequeñas
                    variance = (Math.random() - 0.5) * 0.00008;
                } else if (['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'].includes(selectedSymbol)) {
                    // Stocks - variaciones medianas
                    variance = (Math.random() - 0.5) * 0.002;
                } else if (selectedSymbol.includes('BTC') || selectedSymbol.includes('ETH')) {
                    // Crypto - variaciones más grandes
                    variance = (Math.random() - 0.5) * 0.005;
                } else {
                    // Commodities - variaciones medianas
                    variance = (Math.random() - 0.5) * 0.001;
                }

                const newPrice = prevPrice + (variance * prevPrice);

                // Actualizar datos del gráfico
                const newDataPoint: PriceData = {
                    timestamp: Date.now(),
                    price: newPrice,
                    volume: Math.random() * 1000 + 50
                };

                setPriceData(prev => [...prev.slice(-100), newDataPoint]);

                return newPrice;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [selectedSymbol]); // Dependencia del símbolo para reiniciar el intervalo

    const handleSymbolChange = (newSymbol: string) => {
        setSelectedSymbol(newSymbol);
    };

    const handleTrade = useCallback((direction: 'higher' | 'lower') => {
        setIsDealing(true);
        setDealTimeLeft(9);

        // Crear el trade activo
        const newTrade: ActiveTrade = {
            direction,
            entryPrice: currentPrice,
            amount,
            timestamp: Date.now(),
            profit
        };

        setActiveTrade(newTrade);
        setCurrentPnL(0);
    }, [currentPrice, amount, profit]);

    const handleTradeEnd = useCallback(() => {
        setIsDealing(false);
        setDealTimeLeft(0);
        setActiveTrade(null);
        setCurrentPnL(0);
    }, []);

    return (
        <div className="min-h-screen bg-hero-gradient p-4">
            <div className="max-w-7xl mx-auto">
                <SymbolSelector
                    selectedSymbol={selectedSymbol}
                    onSymbolChange={handleSymbolChange}
                    currentPrice={currentPrice}
                />

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 relative">
                        <TradingChart
                            key={selectedSymbol} // Forzar re-mount del componente cuando cambia el símbolo
                            priceData={priceData}
                            currentPrice={currentPrice}
                            symbol={selectedSymbol}
                            activeTrade={activeTrade}
                            currentPnL={currentPnL}
                        />
                    </div>

                    <div className="lg:col-span-1">
                        <TradingPanel
                            amount={amount}
                            onAmountChange={setAmount}
                            profit={profit}
                            onTrade={handleTrade}
                            isDealing={isDealing}
                            activeTrade={activeTrade}
                            currentPnL={currentPnL}
                        />
                    </div>
                </div>

                {/* Timer posicionado fuera del grid para no tapar contenido */}
                {isDealing && dealTimeLeft > 0 && (
                    <DealTimer
                        timeLeft={dealTimeLeft}
                        onTimerEnd={handleTradeEnd}
                    />
                )}
            </div>
        </div>
    );
};

export default Trade;