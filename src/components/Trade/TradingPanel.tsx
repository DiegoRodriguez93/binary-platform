"use client"
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

interface ActiveTrade {
    direction: 'higher' | 'lower';
    entryPrice: number;
    amount: number;
    timestamp: number;
    profit: number;
}

interface TradingPanelProps {
    amount: number;
    onAmountChange: (amount: number) => void;
    profit: number;
    onTrade: (direction: 'higher' | 'lower') => void;
    isDealing: boolean;
    activeTrade?: ActiveTrade | null;
    currentPnL?: number;
}

const TradingPanel: React.FC<TradingPanelProps> = ({
    amount,
    onAmountChange,
    profit,
    onTrade,
    isDealing,
    activeTrade,
    currentPnL = 0
}) => {
    const predefinedAmounts = [1, 5, 10, 25, 50, 100];

    return (
        <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-6 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Trading Panel</h3>
            </div>

            {/* Información del trade activo */}
            {activeTrade && (
                <div className="bg-primary-600/30 border border-primary-500/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Active Trade</span>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${activeTrade.direction === 'higher'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                            {activeTrade.direction === 'higher' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {activeTrade.direction.toUpperCase()}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-gray-400">Entry Price</span>
                            <div className="text-white font-semibold">{activeTrade.entryPrice.toFixed(5)}</div>
                        </div>
                        <div>
                            <span className="text-gray-400">Amount</span>
                            <div className="text-white font-semibold">${activeTrade.amount}</div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-primary-500/30">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Current P&L</span>
                            <span className={`font-bold text-lg ${currentPnL >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {currentPnL >= 0 ? '+' : ''}${currentPnL.toFixed(2)}
                            </span>
                        </div>

                        <div className="mt-2">
                            <div className={`h-2 rounded-full overflow-hidden ${currentPnL >= 0 ? 'bg-green-900/30' : 'bg-red-900/30'
                                }`}>
                                <div
                                    className={`h-full transition-all duration-300 ${currentPnL >= 0 ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                    style={{
                                        width: `${Math.min(Math.abs(currentPnL / activeTrade.amount) * 100, 100)}%`
                                    }}
                                />
                            </div>
                            <div className="text-xs text-gray-400 mt-1 text-center">
                                {((currentPnL / activeTrade.amount) * 100).toFixed(1)}% of investment
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${amount === value
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-primary-600/20 text-gray-300 hover:bg-primary-500/30'
                                }`}
                        >
                            ${value}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-primary-600/20 border border-primary-500/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Profit</span>
                    <span className="text-success-400 font-semibold">{profit}%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-300">Payout</span>
                    <span className="text-white font-bold text-lg">
                        ${(amount * (1 + profit / 100)).toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="space-y-3">
                <button
                    onClick={() => onTrade('higher')}
                    disabled={isDealing}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg hover:shadow-glow-lg"
                >
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-lg">HIGHER</span>
                </button>

                <button
                    onClick={() => onTrade('lower')}
                    disabled={isDealing}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg hover:shadow-glow-lg"
                >
                    <TrendingDown className="w-6 h-6" />
                    <span className="text-lg">LOWER</span>
                </button>
            </div>

            <div className="text-xs text-gray-400 text-center">
                Risk Warning: Trading involves substantial risk of loss
            </div>
        </div>
    );
};

export default TradingPanel;