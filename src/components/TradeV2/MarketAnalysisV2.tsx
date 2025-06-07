"use client"
import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, Target, Zap } from 'lucide-react';
import { CandlestickDataV2 } from './TradeV2';

interface MarketAnalysisV2Props {
    symbol: string;
    candlestickData: CandlestickDataV2[];
    marketTrend: 'bullish' | 'bearish' | 'sideways';
    currentPrice: number;
}

const MarketAnalysisV2: React.FC<MarketAnalysisV2Props> = ({
    symbol,
    candlestickData,
    marketTrend,
    currentPrice
}) => {
    const analysis = useMemo(() => {
        if (candlestickData.length < 20) {
            return {
                volatility: 'low',
                momentum: 'neutral',
                support: currentPrice * 0.995,
                resistance: currentPrice * 1.005,
                rsi: 50,
                volume: 'normal',
                recommendation: 'wait'
            };
        }

        const recentCandles = candlestickData.slice(-20);
        const prices = recentCandles.map(c => c.close);
        const volumes = recentCandles.map(c => c.volume);

        // Calculate volatility
        const priceChanges = prices.slice(1).map((price, i) => Math.abs(price - prices[i]) / prices[i]);
        const avgVolatility = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
        
        // Calculate momentum
        const shortMA = prices.slice(-5).reduce((sum, price) => sum + price, 0) / 5;
        const longMA = prices.slice(-10).reduce((sum, price) => sum + price, 0) / 10;
        const momentum = shortMA > longMA ? 'bullish' : shortMA < longMA ? 'bearish' : 'neutral';

        // Calculate support and resistance
        const highs = recentCandles.map(c => c.high);
        const lows = recentCandles.map(c => c.low);
        const support = Math.min(...lows);
        const resistance = Math.max(...highs);

        // Simple RSI calculation
        const gains = [];
        const losses = [];
        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) {
                gains.push(change);
                losses.push(0);
            } else {
                gains.push(0);
                losses.push(Math.abs(change));
            }
        }
        const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / gains.length;
        const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / losses.length;
        const rs = avgGain / (avgLoss || 0.001);
        const rsi = 100 - (100 / (1 + rs));

        // Volume analysis
        const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
        const recentVolume = volumes.slice(-3).reduce((sum, vol) => sum + vol, 0) / 3;
        const volumeRatio = recentVolume / avgVolume;

        // Generate recommendation
        let recommendation = 'wait';
        if (momentum === 'bullish' && rsi < 70 && volumeRatio > 1.2) {
            recommendation = 'buy';
        } else if (momentum === 'bearish' && rsi > 30 && volumeRatio > 1.2) {
            recommendation = 'sell';
        }

        return {
            volatility: avgVolatility > 0.01 ? 'high' : avgVolatility > 0.005 ? 'medium' : 'low',
            momentum,
            support,
            resistance,
            rsi: Math.round(rsi),
            volume: volumeRatio > 1.5 ? 'high' : volumeRatio > 0.8 ? 'normal' : 'low',
            recommendation
        };
    }, [candlestickData, currentPrice]);

    const getIndicatorColor = (value: string, type: 'trend' | 'volatility' | 'volume' | 'recommendation') => {
        switch (type) {
            case 'trend':
                return value === 'bullish' ? 'text-green-400' : value === 'bearish' ? 'text-red-400' : 'text-yellow-400';
            case 'volatility':
                return value === 'high' ? 'text-red-400' : value === 'medium' ? 'text-yellow-400' : 'text-green-400';
            case 'volume':
                return value === 'high' ? 'text-green-400' : value === 'normal' ? 'text-yellow-400' : 'text-red-400';
            case 'recommendation':
                return value === 'buy' ? 'text-green-400' : value === 'sell' ? 'text-red-400' : 'text-yellow-400';
            default:
                return 'text-gray-400';
        }
    };

    const getRecommendationIcon = () => {
        switch (analysis.recommendation) {
            case 'buy':
                return <TrendingUp className="w-5 h-5 text-green-400" />;
            case 'sell':
                return <TrendingDown className="w-5 h-5 text-red-400" />;
            default:
                return <Activity className="w-5 h-5 text-yellow-400" />;
        }
    };

    const getRSIColor = (rsi: number) => {
        if (rsi > 70) return 'text-red-400';
        if (rsi < 30) return 'text-green-400';
        return 'text-yellow-400';
    };

    return (
        <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                    Market Analysis
                </h3>
                <div className="text-sm text-gray-400">{symbol}</div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                    <div className={`text-lg font-bold ${getIndicatorColor(marketTrend, 'trend')}`}>
                        {marketTrend.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400">Trend</div>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                    <div className={`text-lg font-bold ${getIndicatorColor(analysis.volatility, 'volatility')}`}>
                        {analysis.volatility.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400">Volatility</div>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                    <div className={`text-lg font-bold ${getRSIColor(analysis.rsi)}`}>
                        {analysis.rsi}
                    </div>
                    <div className="text-xs text-gray-400">RSI</div>
                </div>

                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                    <div className={`text-lg font-bold ${getIndicatorColor(analysis.volume, 'volume')}`}>
                        {analysis.volume.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400">Volume</div>
                </div>
            </div>

            {/* Support & Resistance */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400">Support</span>
                    </div>
                    <div className="text-lg font-bold text-white">
                        {analysis.support.toFixed(symbol.includes('JPY') ? 3 : 5)}
                    </div>
                    <div className="text-xs text-gray-400">
                        {((currentPrice - analysis.support) / currentPrice * 100).toFixed(2)}% below
                    </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">Resistance</span>
                    </div>
                    <div className="text-lg font-bold text-white">
                        {analysis.resistance.toFixed(symbol.includes('JPY') ? 3 : 5)}
                    </div>
                    <div className="text-xs text-gray-400">
                        {((analysis.resistance - currentPrice) / currentPrice * 100).toFixed(2)}% above
                    </div>
                </div>
            </div>

            {/* RSI Gauge */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300">RSI Indicator</span>
                    <span className={`text-sm font-bold ${getRSIColor(analysis.rsi)}`}>
                        {analysis.rsi < 30 ? 'Oversold' : analysis.rsi > 70 ? 'Overbought' : 'Neutral'}
                    </span>
                </div>
                <div className="relative">
                    <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-1000 ${
                                analysis.rsi < 30 ? 'bg-green-500' :
                                analysis.rsi > 70 ? 'bg-red-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${analysis.rsi}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>0</span>
                        <span>30</span>
                        <span>50</span>
                        <span>70</span>
                        <span>100</span>
                    </div>
                    {/* RSI markers */}
                    <div className="absolute top-0 left-[30%] w-0.5 h-3 bg-green-400 opacity-50" />
                    <div className="absolute top-0 left-[70%] w-0.5 h-3 bg-red-400 opacity-50" />
                </div>
            </div>

            {/* Trading Recommendation */}
            <div className={`border rounded-lg p-4 ${
                analysis.recommendation === 'buy' ? 'bg-green-500/10 border-green-500/30' :
                analysis.recommendation === 'sell' ? 'bg-red-500/10 border-red-500/30' :
                'bg-yellow-500/10 border-yellow-500/30'
            }`}>
                <div className="flex items-center gap-3 mb-2">
                    {getRecommendationIcon()}
                    <span className="font-semibold text-white">
                        {analysis.recommendation === 'buy' ? 'Consider HIGHER' :
                         analysis.recommendation === 'sell' ? 'Consider LOWER' :
                         'Wait for Signal'}
                    </span>
                </div>
                <div className="text-sm text-gray-300">
                    {analysis.recommendation === 'buy' ? 
                        'Bullish momentum with good volume support. Consider higher trades.' :
                     analysis.recommendation === 'sell' ?
                        'Bearish momentum with volume confirmation. Consider lower trades.' :
                        'Mixed signals detected. Wait for clearer market direction.'}
                </div>
                
                {/* Confidence indicators */}
                <div className="flex gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span className="text-gray-400">Momentum:</span>
                        <span className={getIndicatorColor(analysis.momentum, 'trend')}>
                            {analysis.momentum}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span className="text-gray-400">Volatility:</span>
                        <span className={getIndicatorColor(analysis.volatility, 'volatility')}>
                            {analysis.volatility}
                        </span>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 text-xs text-gray-500 text-center bg-gray-800/20 rounded-lg p-2">
                ⚠️ Analysis is for educational purposes only. Always do your own research before trading.
            </div>
        </div>
    );
};

export default MarketAnalysisV2;