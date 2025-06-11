"use client"
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, X, Filter, BarChart3, Trophy, Target, Zap, Server, Wifi } from 'lucide-react';
import { ActiveTradeV4, CompletedTradeV4 } from './TradeV4';

interface TradeHistoryV4Props {
    activeTrades: ActiveTradeV4[];
    completedTrades: CompletedTradeV4[];
    onTradeClose: (tradeId: string) => void;
    dataSource: 'mt4' | 'mt5' | 'simulated';
}

const TradeHistoryV4: React.FC<TradeHistoryV4Props> = ({
    activeTrades,
    completedTrades,
    onTradeClose,
    dataSource
}) => {
    const [activeTab, setActiveTab] = useState<'active' | 'history' | 'stats' | 'analytics'>('active');
    const [filter, setFilter] = useState<'all' | 'won' | 'lost'>('all');
    const [sourceFilter, setSourceFilter] = useState<'all' | 'mt4' | 'mt5' | 'simulated'>('all');

    const filteredCompletedTrades = completedTrades.filter(trade => {
        const matchesResult = filter === 'all' || trade.result === filter;
        const matchesSource = sourceFilter === 'all' || trade.source === sourceFilter;
        return matchesResult && matchesSource;
    });

    const filteredActiveTrades = activeTrades.filter(trade => {
        return sourceFilter === 'all' || trade.source === sourceFilter;
    });

    // Enhanced stats with source breakdown
    const stats = {
        totalTrades: completedTrades.length,
        wonTrades: completedTrades.filter(t => t.result === 'won').length,
        lostTrades: completedTrades.filter(t => t.result === 'lost').length,
        totalProfit: completedTrades.reduce((sum, t) => sum + (t.result === 'won' ? t.payout - t.amount : -t.amount), 0),
        winRate: completedTrades.length > 0 ? (completedTrades.filter(t => t.result === 'won').length / completedTrades.length) * 100 : 0,
        avgWin: 0,
        avgLoss: 0,
        bestTrade: 0,
        worstTrade: 0,
        profitFactor: 0,
        bySource: {
            mt4: completedTrades.filter(t => t.source === 'mt4'),
            mt5: completedTrades.filter(t => t.source === 'mt5'),
            simulated: completedTrades.filter(t => t.source === 'simulated')
        }
    };

    // Calculate advanced stats
    const winningTrades = completedTrades.filter(t => t.result === 'won');
    const losingTrades = completedTrades.filter(t => t.result === 'lost');

    if (winningTrades.length > 0) {
        stats.avgWin = winningTrades.reduce((sum, t) => sum + (t.payout - t.amount), 0) / winningTrades.length;
        stats.bestTrade = Math.max(...winningTrades.map(t => t.payout - t.amount));
    }

    if (losingTrades.length > 0) {
        stats.avgLoss = losingTrades.reduce((sum, t) => sum + t.amount, 0) / losingTrades.length;
        stats.worstTrade = Math.max(...losingTrades.map(t => t.amount));
    }

    const totalWinAmount = winningTrades.reduce((sum, t) => sum + (t.payout - t.amount), 0);
    const totalLossAmount = losingTrades.reduce((sum, t) => sum + t.amount, 0);
    stats.profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : 0;

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

    const getTradeUrgency = (timeRemaining: number) => {
        if (timeRemaining <= 5) return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'URGENT' };
        if (timeRemaining <= 15) return { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'WARNING' };
        if (timeRemaining <= 30) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'ACTIVE' };
        return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'STABLE' };
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'mt4':
            case 'mt5':
                return <Server className="w-3 h-3" />;
            default:
                return <Wifi className="w-3 h-3" />;
        }
    };

    const getSourceColor = (source: string) => {
        switch (source) {
            case 'mt4': return 'text-blue-400';
            case 'mt5': return 'text-green-400';
            default: return 'text-yellow-400';
        }
    };

    return (
        <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            {/* Header with Enhanced Tabs */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                    Trade Management V4
                </h3>
                <div className="flex bg-gray-800/50 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all flex items-center gap-1 ${
                            activeTab === 'active' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Clock className="w-3 h-3" />
                        Active ({filteredActiveTrades.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all flex items-center gap-1 ${
                            activeTab === 'history' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <BarChart3 className="w-3 h-3" />
                        History ({filteredCompletedTrades.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all flex items-center gap-1 ${
                            activeTab === 'stats' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Trophy className="w-3 h-3" />
                        Stats
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all flex items-center gap-1 ${
                            activeTab === 'analytics' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Target className="w-3 h-3" />
                        Analytics
                    </button>
                </div>
            </div>

            {/* Source Filter */}
            <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-400">Filter by source:</span>
                <div className="flex bg-gray-800/50 rounded-lg p-1">
                    {['all', 'mt4', 'mt5', 'simulated'].map((source) => (
                        <button
                            key={source}
                            onClick={() => setSourceFilter(source as any)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-all capitalize flex items-center gap-1 ${
                                sourceFilter === source ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {source !== 'all' && getSourceIcon(source)}
                            {source}
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Trades Tab */}
            {activeTab === 'active' && (
                <div className="space-y-3">
                    {filteredActiveTrades.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <div className="text-lg font-medium">No Active Trades</div>
                            <div className="text-sm">
                                {sourceFilter === 'all' ? 'Start trading to see your positions here' : 
                                 `No active trades from ${sourceFilter.toUpperCase()}`}
                            </div>
                        </div>
                    ) : (
                        filteredActiveTrades.map((trade) => {
                            const timeRemaining = getTimeRemaining(trade.expiryTime);
                            const urgency = getTradeUrgency(timeRemaining);
                            
                            return (
                                <div
                                    key={trade.id}
                                    className={`border rounded-xl p-4 transition-all duration-300 ${urgency.bg} ${
                                        timeRemaining <= 5 ? 'border-red-400 animate-pulse' : 
                                        timeRemaining <= 15 ? 'border-orange-400' : 'border-gray-600'
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
                                                <div className="font-semibold text-white flex items-center gap-2">
                                                    {trade.symbol}
                                                    <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${getSourceColor(trade.source)}`}>
                                                        {getSourceIcon(trade.source)}
                                                        {trade.source.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    {trade.direction.toUpperCase()} • ${trade.amount}
                                                    {trade.mt4OrderId && <span> • MT4 #{trade.mt4OrderId}</span>}
                                                    {trade.mt5OrderId && <span> • MT5 #{trade.mt5OrderId}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className={`font-bold text-lg ${urgency.color}`}>
                                                {timeRemaining}s
                                            </div>
                                            <div className={`text-xs px-2 py-1 rounded-full ${urgency.bg} ${urgency.color}`}>
                                                {urgency.label}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-400">Entry Price</span>
                                            <div className="text-white font-medium">{trade.entryPrice.toFixed(5)}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Profit</span>
                                            <div className="text-green-400 font-medium">{trade.profit}%</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Started</span>
                                            <div className="text-white font-medium">{formatTime(trade.timestamp)}</div>
                                        </div>
                                    </div>

                                    {/* Enhanced progress bar */}
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Time Progress</span>
                                            <span>{Math.round((1 - timeRemaining / ((trade.expiryTime - trade.timestamp) / 1000)) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-1000 ${
                                                    timeRemaining <= 5 ? 'bg-red-400' : 
                                                    timeRemaining <= 15 ? 'bg-orange-400' : 
                                                    timeRemaining <= 30 ? 'bg-yellow-400' : 
                                                    trade.source === 'mt4' ? 'bg-blue-500' :
                                                    trade.source === 'mt5' ? 'bg-green-500' : 'bg-purple-500'
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
                    {/* Enhanced Filter */}
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
                                <div className="text-sm">
                                    {sourceFilter === 'all' ? 'Complete some trades to see your history' :
                                     `No completed trades from ${sourceFilter.toUpperCase()}`}
                                </div>
                            </div>
                        ) : (
                            filteredCompletedTrades.map((trade) => (
                                <div
                                    key={trade.id}
                                    className={`border rounded-lg p-3 transition-all hover:bg-gray-800/30 ${
                                        trade.result === 'won' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
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
                                                <div className="font-medium text-white text-sm flex items-center gap-2">
                                                    {trade.symbol}
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                        trade.result === 'won' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                        {trade.result.toUpperCase()}
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded-full text-xs flex items-center gap-1 ${getSourceColor(trade.source)}`}>
                                                        {getSourceIcon(trade.source)}
                                                        {trade.source.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {formatTime(trade.timestamp)} • ${trade.amount} • {trade.profit}%
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

            {/* Enhanced Stats Tab with Source Breakdown */}
            {activeTab === 'stats' && (
                <div className="space-y-4">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                            <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                ${Math.abs(stats.totalProfit).toFixed(0)}
                            </div>
                            <div className="text-sm text-gray-400">Total P&L</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-400">
                                {stats.profitFactor.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-400">Profit Factor</div>
                        </div>
                    </div>

                    {/* Source Breakdown */}
                    <div className="bg-gray-800/30 rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-300 mb-3">Performance by Source</div>
                        <div className="grid grid-cols-3 gap-4">
                            {Object.entries(stats.bySource).map(([source, trades]) => {
                                const sourceWinRate = trades.length > 0 ? 
                                    (trades.filter(t => t.result === 'won').length / trades.length) * 100 : 0;
                                
                                return (
                                    <div key={source} className="text-center">
                                        <div className={`flex items-center justify-center gap-1 mb-2 ${getSourceColor(source)}`}>
                                            {getSourceIcon(source)}
                                            <span className="font-semibold">{source.toUpperCase()}</span>
                                        </div>
                                        <div className="text-lg font-bold text-white">{trades.length}</div>
                                        <div className="text-sm text-gray-400">trades</div>
                                        <div className={`text-sm font-medium ${sourceWinRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                                            {sourceWinRate.toFixed(1)}% win rate
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Advanced Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800/30 rounded-lg p-4">
                            <div className="text-sm text-gray-400 mb-2">Average Win</div>
                            <div className="text-lg font-bold text-green-400">${stats.avgWin.toFixed(2)}</div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-4">
                            <div className="text-sm text-gray-400 mb-2">Average Loss</div>
                            <div className="text-lg font-bold text-red-400">${stats.avgLoss.toFixed(2)}</div>
                        </div>
                    </div>

                    {/* Win Rate Visualization */}
                    <div className="bg-gray-800/30 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">Performance Distribution</div>
                        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                            <div
                                className="h-4 bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
                                style={{ width: `${stats.winRate}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>{stats.wonTrades} Won</span>
                            <span>{stats.lostTrades} Lost</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="space-y-4">
                    <div className="text-center py-8 text-gray-400">
                        <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <div className="text-lg font-medium">Advanced Analytics</div>
                        <div className="text-sm">MT4/MT5 integration enables advanced analytics and performance tracking</div>
                        <div className="mt-4 text-xs text-gray-500">
                            Coming soon: Real-time correlation analysis, market sentiment tracking, and AI-powered insights
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradeHistoryV4;