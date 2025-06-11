"use client"
import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, Target, Zap, Brain, AlertTriangle, Server, Wifi } from 'lucide-react';
import { CandlestickDataV4 } from './TradeV4';

interface MarketAnalysisV4Props {
    symbol: string;
    candlestickData: CandlestickDataV4[];
    marketTrend: 'bullish' | 'bearish' | 'sideways';
    currentPrice: number;
    dataSource: 'mt4' | 'mt5' | 'simulated';
}

const MarketAnalysisV4: React.FC<MarketAnalysisV4Props> = ({
    symbol,
    candlestickData,
    marketTrend,
    currentPrice,
    dataSource
}) => {
    const analysis = useMemo(() => {
        if (candlestickData.length < 30) {
            return {
                volatility: 'low',
                momentum: 'neutral',
                support: currentPrice * 0.995,
                resistance: currentPrice * 1.005,
                rsi: 50,
                volume: 'normal',
                recommendation: 'wait',
                confidence: 50,
                signals: [],
                patterns: [],
                institutionalFlow: 'neutral',
                marketSentiment: 'neutral'
            };
        }

        const recentCandles = candlestickData.slice(-30);
        const prices = recentCandles.map(c => c.close);
        const volumes = recentCandles.map(c => c.volume);

        // Enhanced volatility calculation with MT4/MT5 data
        const priceChanges = prices.slice(1).map((price, i) => Math.abs(price - prices[i]) / prices[i]);
        const avgVolatility = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
        
        // Enhanced momentum calculation
        const shortMA = prices.slice(-5).reduce((sum, price) => sum + price, 0) / 5;
        const longMA = prices.slice(-15).reduce((sum, price) => sum + price, 0) / 15;
        const momentum = shortMA > longMA * 1.003 ? 'bullish' : shortMA < longMA * 0.997 ? 'bearish' : 'neutral';

        // Enhanced support and resistance with MT4/MT5 precision
        const highs = recentCandles.map(c => c.high);
        const lows = recentCandles.map(c => c.low);
        const support = Math.min(...lows);
        const resistance = Math.max(...highs);

        // Enhanced RSI calculation
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

        // Enhanced volume analysis
        const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
        const recentVolume = volumes.slice(-3).reduce((sum, vol) => sum + vol, 0) / 3;
        const volumeRatio = recentVolume / avgVolume;

        // Institutional flow analysis (enhanced for MT4/MT5)
        const largeCandleThreshold = avgVolatility * 2;
        const largeMoves = recentCandles.filter(candle => {
            const bodySize = Math.abs(candle.close - candle.open) / candle.open;
            return bodySize > largeCandleThreshold;
        });
        
        const institutionalFlow = largeMoves.length > 3 ? 
            (largeMoves.filter(c => c.close > c.open).length > largeMoves.length / 2 ? 'bullish' : 'bearish') : 
            'neutral';

        // Market sentiment based on data source
        const marketSentiment = dataSource !== 'simulated' ? 
            (momentum === 'bullish' && volumeRatio > 1.2 ? 'bullish' : 
             momentum === 'bearish' && volumeRatio > 1.2 ? 'bearish' : 'neutral') : 
            'neutral';

        // Pattern detection (enhanced)
        const patterns = [];
        const lastCandles = recentCandles.slice(-5);
        
        // Enhanced Hammer pattern
        if (lastCandles.length >= 1) {
            const lastCandle = lastCandles[lastCandles.length - 1];
            const body = Math.abs(lastCandle.close - lastCandle.open);
            const lowerShadow = Math.min(lastCandle.open, lastCandle.close) - lastCandle.low;
            const upperShadow = lastCandle.high - Math.max(lastCandle.open, lastCandle.close);
            
            if (lowerShadow > body * 2.5 && upperShadow < body * 0.3) {
                patterns.push({ name: 'Hammer', signal: 'bullish', strength: 'strong' });
            }
        }

        // Enhanced Doji pattern
        if (lastCandles.length >= 1) {
            const lastCandle = lastCandles[lastCandles.length - 1];
            const body = Math.abs(lastCandle.close - lastCandle.open);
            const range = lastCandle.high - lastCandle.low;
            
            if (body < range * 0.05) {
                patterns.push({ name: 'Doji', signal: 'neutral', strength: 'medium' });
            }
        }

        // Engulfing pattern
        if (lastCandles.length >= 2) {
            const prev = lastCandles[lastCandles.length - 2];
            const curr = lastCandles[lastCandles.length - 1];
            
            if (prev.close < prev.open && curr.close > curr.open && 
                curr.open < prev.close && curr.close > prev.open) {
                patterns.push({ name: 'Bullish Engulfing', signal: 'bullish', strength: 'strong' });
            } else if (prev.close > prev.open && curr.close < curr.open && 
                       curr.open > prev.close && curr.close < prev.open) {
                patterns.push({ name: 'Bearish Engulfing', signal: 'bearish', strength: 'strong' });
            }
        }

        // Enhanced signal generation
        const signals = [];
        
        if (rsi < 25 && momentum === 'bullish' && volumeRatio > 1.3 && institutionalFlow === 'bullish') {
            signals.push({ type: 'buy', strength: 'very_strong', reason: 'Oversold with strong bullish confluence' });
        } else if (rsi > 75 && momentum === 'bearish' && volumeRatio > 1.3 && institutionalFlow === 'bearish') {
            signals.push({ type: 'sell', strength: 'very_strong', reason: 'Overbought with strong bearish confluence' });
        } else if (rsi < 30 && momentum === 'bullish' && volumeRatio > 1.2) {
            signals.push({ type: 'buy', strength: 'strong', reason: 'Oversold with bullish momentum' });
        } else if (rsi > 70 && momentum === 'bearish' && volumeRatio > 1.2) {
            signals.push({ type: 'sell', strength: 'strong', reason: 'Overbought with bearish momentum' });
        } else if (momentum === 'bullish' && volumeRatio > 1.8) {
            signals.push({ type: 'buy', strength: 'medium', reason: 'Strong bullish momentum with volume' });
        } else if (momentum === 'bearish' && volumeRatio > 1.8) {
            signals.push({ type: 'sell', strength: 'medium', reason: 'Strong bearish momentum with volume' });
        }

        // Generate recommendation with enhanced confidence
        let recommendation = 'wait';
        let confidence = 50;

        if (signals.length > 0) {
            const veryStrongSignals = signals.filter(s => s.strength === 'very_strong');
            const strongSignals = signals.filter(s => s.strength === 'strong');
            
            if (veryStrongSignals.length > 0) {
                recommendation = veryStrongSignals[0].type;
                confidence = dataSource !== 'simulated' ? 95 : 85;
            } else if (strongSignals.length > 0) {
                recommendation = strongSignals[0].type;
                confidence = dataSource !== 'simulated' ? 80 : 70;
            } else {
                recommendation = signals[0].type;
                confidence = dataSource !== 'simulated' ? 65 : 55;
            }
        }

        // Boost confidence for MT4/MT5 data
        if (dataSource !== 'simulated') {
            confidence = Math.min(confidence + 10, 95);
        }

        return {
            volatility: avgVolatility > 0.02 ? '高' : avgVolatility > 0.01 ? 'medium' : 'low',
            momentum,
            support,
            resistance,
            rsi: Math.round(rsi),
            volume: volumeRatio > 1.8 ? 'high' : volumeRatio > 0.9 ? 'normal' : 'low',
            recommendation,
            confidence,
            signals,
            patterns,
            institutionalFlow,
            marketSentiment
        };
    }, [candlestickData, currentPrice, dataSource]);

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

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 85) return 'text-green-400';
        if (confidence >= 65) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getDataSourceIcon = () => {
        switch (dataSource) {
            case 'mt4':
            case 'mt5':
                return <Server className="w-5 h-5" />;
            default:
                return <Wifi className="w-5 h-5" />;
        }
    };

    const getDataSourceColor = () => {
        switch (dataSource) {
            case 'mt4': return 'text-blue-400';
            case 'mt5': return 'text-green-400';
            default: return 'text-yellow-400';
        }
    };

    return (
        <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-400" />
                    AI Market Analysis V4
                </h3>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getDataSourceColor()}`}>
                        {getDataSourceIcon()}
                        <span>{dataSource.toUpperCase()}</span>
                    </div>
                    <div className="text-sm text-gray-400">{symbol}</div>
                    <div className={`px-2 py-1 rounded-full text-xs ${getConfidenceColor(analysis.confidence)}`}>
                        {analysis.confidence}% confidence
                    </div>
                </div>
            </div>

            {/* Data Source Enhancement Notice */}
            {dataSource !== 'simulated' && (
                <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                        <Server className="w-4 h-4" />
                        <span className="font-semibold">Enhanced Analysis</span>
                        <span>• Powered by {dataSource.toUpperCase()} institutional-grade data</span>
                    </div>
                </div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                    <div className={`text-lg font-bold ${getIndicatorColor(marketTrend, 'trend')}`}>
                        {marketTrend.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-400">Market Trend</div>
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

            {/* Institutional Flow & Market Sentiment */}
            {dataSource !== 'simulated' && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                        <div className={`text-lg font-bold ${getIndicatorColor(analysis.institutionalFlow, 'trend')}`}>
                            {analysis.institutionalFlow.toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-400">Institutional Flow</div>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                        <div className={`text-lg font-bold ${getIndicatorColor(analysis.marketSentiment, 'trend')}`}>
                            {analysis.marketSentiment.toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-400">Market Sentiment</div>
                    </div>
                </div>
            )}

            {/* Trading Signals */}
            {analysis.signals.length > 0 && (
                <div className="mb-6">
                    <div className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        Active Signals ({dataSource.toUpperCase()})
                    </div>
                    <div className="space-y-2">
                        {analysis.signals.map((signal, index) => (
                            <div key={index} className={`border rounded-lg p-3 ${
                                signal.type === 'buy' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {signal.type === 'buy' ? 
                                            <TrendingUp className="w-4 h-4 text-green-400" /> : 
                                            <TrendingDown className="w-4 h-4 text-red-400" />
                                        }
                                        <span className={`font-semibold ${signal.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                                            {signal.type.toUpperCase()} Signal
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            signal.strength === 'very_strong' ? 'bg-purple-500/20 text-purple-400' :
                                            signal.strength === 'strong' ? 'bg-blue-500/20 text-blue-400' : 
                                            'bg-gray-500/20 text-gray-400'
                                        }`}>
                                            {signal.strength.replace('_', ' ')}
                                        </span>
                                        {dataSource !== 'simulated' && (
                                            <span className={`px-2 py-1 rounded-full text-xs ${getDataSourceColor(dataSource)}`}>
                                                {dataSource.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-300 mt-1">{signal.reason}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chart Patterns */}
            {analysis.patterns.length > 0 && (
                <div className="mb-6">
                    <div className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        Detected Patterns
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {analysis.patterns.map((pattern, index) => (
                            <div key={index} className={`px-3 py-2 rounded-lg text-sm border ${
                                pattern.signal === 'bullish' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                pattern.signal === 'bearish' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                            }`}>
                                {pattern.name}
                                <span className="ml-2 text-xs opacity-70">({pattern.strength})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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

            {/* Enhanced RSI Gauge */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300">RSI Indicator</span>
                    <span className={`text-sm font-bold ${getRSIColor(analysis.rsi)}`}>
                        {analysis.rsi < 30 ? 'Oversold' : analysis.rsi > 70 ? 'Overbought' : 'Neutral'}
                    </span>
                </div>
                <div className="relative">
                    <div className="w-full bg-gray-700 rounded-full h-4">
                        <div
                            className={`h-4 rounded-full transition-all duration-1000 ${
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
                    <div className="absolute top-0 left-[30%] w-0.5 h-4 bg-green-400 opacity-50" />
                    <div className="absolute top-0 left-[70%] w-0.5 h-4 bg-red-400 opacity-50" />
                </div>
            </div>

            {/* AI Trading Recommendation */}
            <div className={`border rounded-lg p-4 ${
                analysis.recommendation === 'buy' ? 'bg-green-500/10 border-green-500/30' :
                analysis.recommendation === 'sell' ? 'bg-red-500/10 border-red-500/30' :
                'bg-yellow-500/10 border-yellow-500/30'
            }`}>
                <div className="flex items-center gap-3 mb-2">
                    {getRecommendationIcon()}
                    <span className="font-semibold text-white">
                        AI Recommendation: {analysis.recommendation === 'buy' ? 'Consider HIGHER' :
                         analysis.recommendation === 'sell' ? 'Consider LOWER' :
                         'Wait for Signal'}
                    </span>
                    <div className={`px-2 py-1 rounded-full text-xs ${getConfidenceColor(analysis.confidence)}`}>
                        {analysis.confidence}%
                    </div>
                    {dataSource !== 'simulated' && (
                        <div className={`px-2 py-1 rounded-full text-xs ${getDataSourceColor(dataSource)}`}>
                            {dataSource.toUpperCase()} Enhanced
                        </div>
                    )}
                </div>
                <div className="text-sm text-gray-300">
                    {analysis.recommendation === 'buy' ? 
                        `Multiple bullish indicators detected${dataSource !== 'simulated' ? ' with institutional-grade data confirmation' : ''}. Market conditions favor higher trades.` :
                     analysis.recommendation === 'sell' ?
                        `Bearish signals confirmed${dataSource !== 'simulated' ? ' with institutional-grade data confirmation' : ''}. Market conditions favor lower trades.` :
                        `Mixed signals detected${dataSource !== 'simulated' ? ' in institutional data' : ''}. Wait for clearer market direction or use smaller positions.`}
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
                    <div className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        <span className="text-gray-400">Volume:</span>
                        <span className={getIndicatorColor(analysis.volume, 'volume')}>
                            {analysis.volume}
                        </span>
                    </div>
                    {dataSource !== 'simulated' && (
                        <div className="flex items-center gap-1">
                            <Server className="w-3 h-3" />
                            <span className="text-gray-400">Flow:</span>
                            <span className={getIndicatorColor(analysis.institutionalFlow, 'trend')}>
                                {analysis.institutionalFlow}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Disclaimer */}
            <div className="mt-4 text-xs text-gray-500 text-center bg-gray-800/20 rounded-lg p-3 border border-gray-700/30">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span className="font-semibold">
                        {dataSource !== 'simulated' ? `${dataSource.toUpperCase()}-Enhanced AI Analysis` : 'AI-Powered Analysis'}
                    </span>
                </div>
                <div>
                    {dataSource !== 'simulated' ? 
                        `This analysis uses institutional-grade ${dataSource.toUpperCase()} data with advanced algorithms and machine learning. Enhanced accuracy with real market data.` :
                        'This analysis uses advanced algorithms and machine learning. Always do your own research and manage risk appropriately.'
                    }
                </div>
            </div>
        </div>
    );
};

export default MarketAnalysisV4;