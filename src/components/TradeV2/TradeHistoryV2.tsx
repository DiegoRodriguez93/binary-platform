"use client"
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, X, Filter, BarChart3 } from 'lucide-react';
import { ActiveTradeV2, CompletedTradeV2 } from './TradeV2';

interface TradeHistoryV2Props {
    activeTrades: ActiveTradeV2[];
    completedTrades: CompletedTradeV2[];
    onTradeClose: (tradeId: string) => void;
}

const TradeHistoryV2: React.FC<TradeHistoryV2Props> = ({
    activeTrades,
    completedTrades,
    onTradeClose
}) => {
    const [activeTab, setActiveTab] = useState<'active' | 'history' | 'stats'>('active');
    const [filter, setFilter] = useState<'all' | 'won' | 'lost'>('all');

    const filteredCompletedTrades = completedTrades.filter(trade => {
        if (filter === 'all') return true;
        return trade.result === filter;
    });

    const stats = {
        totalTrades: completedTrades.length,
        wonTrades: completedTrades.filter(t => t.result === 'won').length,
        lostTrades: completedTrades.filter(t => t.result === 'lost').length,
        totalProfit: completedTrades.reduce((sum, t) => sum + (t.result === 'won' ? t.payout - t.amount : -t.amount), 0),
        winRate: completedTrades.length > 0 ? (completedTrades.filter(t => t.result === 'won').length / completedTrades.length) * 100 : 0
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getTimeRemaining = (expiryTime: number) => {
        const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
        return remaining;
    };

    return (
        <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            {/* Header with Tabs */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Trade Management</h3>
                <div className="flex bg-gray-800/50 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                            activeTab === 'active' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Active ({activeTrades.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                            activeTab === 'history' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        History ({completedTrades.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                            activeTab === 'stats' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Stats
                    </button>
                </div>
            </div>

            {/* Active Trades Tab */}
            {activeTab === 'active' && (
                <div className="space-y-3">
                    {activeTrades.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <div className="text-lg font-medium">No Active Trades</div>
                            <div className="text-sm">Start trading to see your positions here</div>
                        </div>
                    ) : (
                        activeTrades.map((trade) => {
                            const timeRemaining = getTimeRemaining(trade.expiryTime);
                            const isExpiringSoon = timeRemaining <= 10;
                            
                            return (
                                <div
                                    key={trade.id}
                                    className={`bg-gray-800/30 border rounded-xl p-4 transition-all duration-300 ${
                                        isExpiringSoon ? 'border-orange-400 bg-orange-500/10' : 'border-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${
                                                trade.direction === 'higher' 
                                                    ? 'bg-green-500/20 text-green-400' 
                                                    : 'bg-red-500/20 text-red-400'
                                            }`}>
                                                {trade.direction === 'higher' ? 
                                                    <TrendingUp className="w-4 h-4" /> : 
                                                    <TrendingDown className="w-4 h-4" />
                                                }
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white">{trade.symbol}</div>
                                                <div className="text-sm text-gray-400">
                                                    {trade.direction.toUpperCase()} • ${trade.amount}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className={`font-bold ${isExpiringSoon ? 'text-orange-400' : 'text-white'}`}>
                                                {timeRemaining}s
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {trade.profit}% profit
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">Entry Price</span>
                                            <div className="text-white font-medium">{trade.entryPrice.toFixed(5)}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Started</span>
                                            <div className="text-white font-medium">{formatTime(trade.timestamp)}</div>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Time Progress</span>
                                            <span>{Math.round((1 - timeRemaining / ((trade.expiryTime - trade.timestamp) / 1000)) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-1000 ${
                                                    isExpiringSoon ? 'bg-orange-400' : 'bg-purple-500'
                                                }`}
                                                style={{
                                                    width: `${(1 - timeRemaining / ((trade.expiryTime - trade.timestamp) / 1000)) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {/* Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <div className="flex bg-gray-800/50 rounded-lg p-1">
                            {['all', 'won', 'lost'].map((filterOption) => (
                                <button
                                    key={filterOption}
                                    onClick={() => setFilter(filterOption as any)}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-all capitalize ${
                                        filter === filterOption ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {filterOption}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Trade History List */}
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {filteredCompletedTrades.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <div className="text-lg font-medium">No Trade History</div>
                                <div className="text-sm">Complete some trades to see your history</div>
                            </div>
                        ) : (
                            filteredCompletedTrades.map((trade) => (
                                <div
                                    key={trade.id}
                                    className={`bg-gray-800/30 border rounded-lg p-3 ${
                                        trade.result === 'won' ? 'border-green-500/30' : 'border-red-500/30'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded ${
                                                trade.direction === 'higher' 
                                                    ? 'bg-green-500/20 text-green-400' 
                                                    : 'bg-red-500/20 text-red-400'
                                            }`}>
                                                {trade.direction === 'higher' ? 
                                                    <TrendingUp className="w-3 h-3" /> : 
                                                    <TrendingDown className="w-3 h-3" />
                                                }
                                            </div>
                                            <div>
                                                <div className="font-medium text-white text-sm">{trade.symbol}</div>
                                                <div className="text-xs text-gray-400">
                                                    {formatTime(trade.timestamp)} • ${trade.amount}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className={`font-bold text-sm ${
                                                trade.result === 'won' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {trade.result === 'won' ? '+' : '-'}${
                                                    trade.result === 'won' 
                                                        ? (trade.payout - trade.amount).toFixed(2)
                                                        : trade.amount.toFixed(2)
                                                }
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {trade.entryPrice.toFixed(5)} → {trade.exitPrice.toFixed(5)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
                <div className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
                            <div className="text-sm text-gray-400">Total Trades</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                            <div className={`text-2xl font-bold ${stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                {stats.winRate.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-400">Win Rate</div>
                        </div>
                    </div>

                    {/* Profit/Loss */}
                    <div className="bg-gray-800/30 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-400">Total P&L</span>
                            <span className={`text-xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit.toFixed(2)}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-green-400 font-semibold">{stats.wonTrades}</div>
                                <div className="text-gray-400">Won</div>
                            </div>
                            <div className="text-center">
                                <div className="text-red-400 font-semibold">{stats.lostTrades}</div>
                                <div className="text-gray-400">Lost</div>
                            </div>
                        </div>
                    </div>

                    {/* Win Rate Visualization */}
                    <div className="bg-gray-800/30 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">Performance</div>
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-3 bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
                                style={{ width: `${stats.winRate}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* Recent Performance */}
                    {completedTrades.length > 0 && (
                        <div className="bg-gray-800/30 rounded-lg p-4">
                            <div className="text-sm text-gray-400 mb-3">Last 10 Trades</div>
                            <div className="flex gap-1">
                                {completedTrades.slice(0, 10).map((trade, index) => (
                                    <div
                                        key={trade.id}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            trade.result === 'won' 
                                                ? 'bg-green-500 text-white' 
                                                : 'bg-red-500 text-white'
                                        }`}
                                        title={`${trade.result === 'won' ? 'Won' : 'Lost'} $${trade.amount} on ${trade.symbol}`}
                                    >
                                        {trade.result === 'won' ? 'W' : 'L'}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TradeHistoryV2;