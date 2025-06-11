"use client"
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Clock, Zap, Shield, Star, Flame } from 'lucide-react';
import { ActiveTradeV3 } from './TradeV3';

interface TradingPanelV3Props {
    amount: number;
    onAmountChange: (amount: number) => void;
    profit: number;
    onTrade: (direction: 'higher' | 'lower', expirySeconds: number) => void;
    isDealing: boolean;
    activeTrades: ActiveTradeV3[];
    currentPnL: number;
    marketTrend: 'bullish' | 'bearish' | 'sideways';
}

const TradingPanelV3: React.FC<TradingPanelV3Props> = ({
    amount,
    onAmountChange,
    profit,
    onTrade,
    isDealing,
    activeTrades,
    currentPnL,
    marketTrend
}) => {
    const [selectedExpiry, setSelectedExpiry] = useState(30);
    const [riskLevel, setRiskLevel] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
    const [tradingMode, setTradingMode] = useState<'standard' | 'turbo' | 'long'>('standard');

    const predefinedAmounts = [1, 5, 10, 25, 50, 100, 250, 500, 1000];
    
    const expiryOptions = {
        turbo: [
            { value: 15, label: '15s', risk: 'high', multiplier: 1.3 },
            { value: 30, label: '30s', risk: 'high', multiplier: 1.2 },
            { value: 60, label: '1m', risk: 'medium', multiplier: 1.1 }
        ],
        standard: [
            { value: 30, label: '30s', risk: 'medium', multiplier: 1.0 },
            { value: 60, label: '1m', risk: 'medium', multiplier: 1.0 },
            { value: 120, label: '2m', risk: 'low', multiplier: 0.95 },
            { value: 300, label: '5m', risk: 'low', multiplier: 0.9 }
        ],
        long: [
            { value: 300, label: '5m', risk: 'low', multiplier: 0.9 },
            { value: 600, label: '10m', risk: 'low', multiplier: 0.85 },
            { value: 900, label: '15m', risk: 'very_low', multiplier: 0.8 },
            { value: 1800, label: '30m', risk: 'very_low', multiplier: 0.75 }
        ]
    };

    const getRiskMultiplier = () => {
        switch (riskLevel) {
            case 'aggressive': return 1.25;
            case 'conservative': return 0.85;
            default: return 1.0;
        }
    };

    const getTradingModeMultiplier = () => {
        switch (tradingMode) {
            case 'turbo': return 1.15;
            case 'long': return 0.9;
            default: return 1.0;
        }
    };

    const getAdjustedProfit = () => {
        const baseProfit = profit;
        const riskMultiplier = getRiskMultiplier();
        const modeMultiplier = getTradingModeMultiplier();
        const currentOptions = expiryOptions[tradingMode];
        const selectedOption = currentOptions.find(opt => opt.value === selectedExpiry);
        const expiryMultiplier = selectedOption?.multiplier || 1.0;
        
        return Math.round(baseProfit * riskMultiplier * modeMultiplier * expiryMultiplier);
    };

    const getMarketSentiment = () => {
        switch (marketTrend) {
            case 'bullish':
                return { 
                    text: 'Market is trending UP', 
                    color: 'text-green-400', 
                    icon: <TrendingUp className="w-4 h-4" />,
                    suggestion: 'Consider HIGHER trades'
                };
            case 'bearish':
                return { 
                    text: 'Market is trending DOWN', 
                    color: 'text-red-400', 
                    icon: <TrendingDown className="w-4 h-4" />,
                    suggestion: 'Consider LOWER trades'
                };
            default:
                return { 
                    text: 'Market is sideways', 
                    color: 'text-yellow-400', 
                    icon: <Target className="w-4 h-4" />,
                    suggestion: 'Wait for clear direction'
                };
        }
    };

    const sentiment = getMarketSentiment();
    const adjustedProfit = getAdjustedProfit();
    const potentialPayout = amount * (1 + adjustedProfit / 100);
    const currentOptions = expiryOptions[tradingMode];

    // Update selected expiry when trading mode changes
    React.useEffect(() => {
        const newOptions = expiryOptions[tradingMode];
        if (!newOptions.find(opt => opt.value === selectedExpiry)) {
            setSelectedExpiry(newOptions[0].value);
        }
    }, [tradingMode, selectedExpiry]);

    return (
        <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-400" />
                    Trading Panel V3
                </h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${sentiment.color} bg-gray-800/50`}>
                    {sentiment.icon}
                    <span className="font-medium">{sentiment.text}</span>
                </div>
            </div>

            {/* Market Suggestion */}
            <div className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-3">
                <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">AI Suggestion:</span>
                    <span className={sentiment.color}>{sentiment.suggestion}</span>
                </div>
            </div>

            {/* Active Trades Summary */}
            {activeTrades.length > 0 && (
                <div className="bg-primary-600/30 border border-primary-500/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Active Trades ({activeTrades.length})</span>
                        <div className={`text-lg font-bold ${currentPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {currentPnL >= 0 ? '+' : ''}${currentPnL.toFixed(2)}
                        </div>
                    </div>

                    <div className="space-y-2">
                        {activeTrades.slice(0, 3).map((trade, index) => (
                            <div key={trade.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    {trade.direction === 'higher' ? 
                                        <TrendingUp className="w-3 h-3 text-green-400" /> : 
                                        <TrendingDown className="w-3 h-3 text-red-400" />
                                    }
                                    <span className="text-gray-300">${trade.amount}</span>
                                </div>
                                <div className="text-gray-400">
                                    {Math.max(0, Math.floor((trade.expiryTime - Date.now()) / 1000))}s
                                </div>
                            </div>
                        ))}
                        {activeTrades.length > 3 && (
                            <div className="text-xs text-gray-400 text-center">
                                +{activeTrades.length - 3} more trades
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Trading Mode Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                    Trading Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { value: 'turbo', label: 'Turbo', icon: <Zap className="w-4 h-4" />, desc: 'High risk, high reward' },
                        { value: 'standard', label: 'Standard', icon: <Target className="w-4 h-4" />, desc: 'Balanced approach' },
                        { value: 'long', label: 'Long Term', icon: <Shield className="w-4 h-4" />, desc: 'Lower risk, stable' }
                    ].map(mode => (
                        <button
                            key={mode.value}
                            onClick={() => setTradingMode(mode.value as any)}
                            disabled={isDealing}
                            className={`px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1 ${tradingMode === mode.value
                                    ? 'bg-purple-500 text-white border border-purple-400'
                                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600'
                                }`}
                        >
                            {mode.icon}
                            <span className="font-semibold">{mode.label}</span>
                            <span className="text-xs opacity-80">{mode.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Investment Amount */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                    Investment Amount
                </label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => onAmountChange(Number(e.target.value))}
                        className="w-full bg-primary-600/20 border border-primary-500/30 rounded-xl pl-10 pr-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                        min="1"
                        max="10000"
                        disabled={isDealing}
                    />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3">
                    {predefinedAmounts.map(value => (
                        <button
                            key={value}
                            onClick={() => onAmountChange(value)}
                            disabled={isDealing}
                            className={`px-2 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${amount === value
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-primary-600/20 text-gray-300 hover:bg-primary-500/30'
                                }`}
                        >
                            ${value}
                        </button>
                    ))}
                </div>
            </div>

            {/* Expiry Time */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                    Expiry Time ({tradingMode})
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {currentOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setSelectedExpiry(option.value)}
                            disabled={isDealing}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1 ${selectedExpiry === option.value
                                    ? 'bg-secondary-500 text-white'
                                    : 'bg-secondary-600/20 text-gray-300 hover:bg-secondary-500/30'
                                }`}
                        >
                            <Clock className="w-3 h-3" />
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Risk Level */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                    Risk Management
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { value: 'conservative', label: 'Conservative', icon: <Shield className="w-4 h-4" />, color: 'bg-green-600/20 text-green-400' },
                        { value: 'balanced', label: 'Balanced', icon: <Target className="w-4 h-4" />, color: 'bg-yellow-600/20 text-yellow-400' },
                        { value: 'aggressive', label: 'Aggressive', icon: <Zap className="w-4 h-4" />, color: 'bg-red-600/20 text-red-400' }
                    ].map(risk => (
                        <button
                            key={risk.value}
                            onClick={() => setRiskLevel(risk.value as any)}
                            disabled={isDealing}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${riskLevel === risk.value
                                    ? risk.color.replace('/20', '/40') + ' border border-current'
                                    : risk.color + ' hover:bg-opacity-30'
                                }`}
                        >
                            {risk.icon}
                            {risk.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Profit Information */}
            <div className="bg-primary-600/20 border border-primary-500/30 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Base Profit</span>
                    <span className="text-white font-semibold">{profit}%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Adjusted Profit</span>
                    <span className="text-success-400 font-semibold">{adjustedProfit}%</span>
                </div>
                <div className="flex justify-between items-center border-t border-primary-500/30 pt-3">
                    <span className="text-gray-300">Potential Payout</span>
                    <span className="text-white font-bold text-lg">
                        ${potentialPayout.toFixed(2)}
                    </span>
                </div>
                <div className="text-xs text-gray-400 text-center">
                    Risk-adjusted return: {((potentialPayout - amount) / amount * 100).toFixed(1)}%
                </div>
            </div>

            {/* Trading Buttons */}
            <div className="space-y-3">
                <button
                    onClick={() => onTrade('higher', selectedExpiry)}
                    disabled={isDealing}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg hover:shadow-glow-lg"
                >
                    <TrendingUp className="w-6 h-6" />
                    <div className="text-left">
                        <div className="text-lg">HIGHER</div>
                        <div className="text-xs opacity-80">{selectedExpiry}s • {adjustedProfit}% profit • {tradingMode}</div>
                    </div>
                </button>

                <button
                    onClick={() => onTrade('lower', selectedExpiry)}
                    disabled={isDealing}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg hover:shadow-glow-lg"
                >
                    <TrendingDown className="w-6 h-6" />
                    <div className="text-left">
                        <div className="text-lg">LOWER</div>
                        <div className="text-xs opacity-80">{selectedExpiry}s • {adjustedProfit}% profit • {tradingMode}</div>
                    </div>
                </button>
            </div>

            {/* Risk Warning */}
            <div className="text-xs text-gray-400 text-center bg-gray-800/30 rounded-lg p-3">
                <div className="font-semibold mb-1">⚠️ Risk Warning</div>
                <div>Trading involves substantial risk of loss. Only trade with money you can afford to lose.</div>
                <div className="mt-1 text-gray-500">Mode: {tradingMode} • Risk: {riskLevel}</div>
            </div>
        </div>
    );
};

export default TradingPanelV3;