"use client"
import React, { useEffect, useState } from 'react';
import { Clock, X, TrendingUp, TrendingDown, Timer, Zap, Server, Wifi } from 'lucide-react';
import { ActiveTradeV4 } from './TradeV4';

interface DealTimerV4Props {
    timeLeft: number;
    onTimerEnd: () => void;
    activeTrades: ActiveTradeV4[];
    dataSource: 'mt4' | 'mt5' | 'simulated';
}

const DealTimerV4: React.FC<DealTimerV4Props> = ({ timeLeft: initialTime, onTimerEnd, activeTrades, dataSource }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isExpired, setIsExpired] = useState(false);
    const [showExpired, setShowExpired] = useState(false);

    useEffect(() => {
        setTimeLeft(initialTime);
        setIsExpired(false);
        setShowExpired(false);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsExpired(true);
                    onTimerEnd();
                    setShowExpired(true);
                    setTimeout(() => {
                        setShowExpired(false);
                    }, 3000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [initialTime, onTimerEnd]);

    if (isExpired && !showExpired) {
        return null;
    }

    // Find the trade that will expire soonest
    const nextExpiringTrade = activeTrades.reduce((earliest, trade) => {
        if (!earliest || trade.expiryTime < earliest.expiryTime) {
            return trade;
        }
        return earliest;
    }, null as ActiveTradeV4 | null);

    const nextExpirySeconds = nextExpiringTrade 
        ? Math.max(0, Math.floor((nextExpiringTrade.expiryTime - Date.now()) / 1000))
        : timeLeft;

    // Categorize trades by time remaining and source
    const urgentTrades = activeTrades.filter(trade => {
        const remaining = Math.max(0, Math.floor((trade.expiryTime - Date.now()) / 1000));
        return remaining <= 10;
    });

    const warningTrades = activeTrades.filter(trade => {
        const remaining = Math.max(0, Math.floor((trade.expiryTime - Date.now()) / 1000));
        return remaining > 10 && remaining <= 30;
    });

    // Group trades by source
    const tradesBySource = activeTrades.reduce((acc, trade) => {
        if (!acc[trade.source]) acc[trade.source] = 0;
        acc[trade.source]++;
        return acc;
    }, {} as Record<string, number>);

    const getTimerColor = () => {
        if (isExpired) return 'bg-red-600/90 border-red-400';
        if (nextExpirySeconds <= 5) return 'bg-red-500/90 border-red-400';
        if (nextExpirySeconds <= 10) return 'bg-orange-500/90 border-orange-400';
        if (nextExpirySeconds <= 30) return 'bg-yellow-500/90 border-yellow-400';
        return dataSource === 'mt4' ? 'bg-blue-600/90 border-blue-400' :
               dataSource === 'mt5' ? 'bg-green-600/90 border-green-400' :
               'bg-purple-600/90 border-purple-400';
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
            default: return 'text-purple-400';
        }
    };

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div className={`text-white px-6 py-4 rounded-xl shadow-lg backdrop-blur-md border transition-all duration-300 ${getTimerColor()} ${
                isExpired || nextExpirySeconds <= 10 ? 'animate-pulse scale-105' : ''
            }`}>
                
                {isExpired ? (
                    <div className="flex items-center gap-3">
                        <X className="w-5 h-5 text-red-200" />
                        <div>
                            <div className="font-bold text-lg">Trades Expired!</div>
                            <div className="text-sm opacity-80">Results calculated via {dataSource.toUpperCase()}</div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {nextExpirySeconds <= 5 ? <Zap className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
                            <div>
                                <div className="font-bold text-lg">{nextExpirySeconds}s</div>
                                <div className="text-sm opacity-80">
                                    {activeTrades.length} active trade{activeTrades.length > 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>

                        {/* Data Source Indicator */}
                        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/30">
                            <div className={getDataSourceColor()}>
                                {getDataSourceIcon()}
                            </div>
                            <div className="text-sm">
                                <div className="font-medium">{dataSource.toUpperCase()}</div>
                                <div className="opacity-70">Live Data</div>
                            </div>
                        </div>

                        {/* Show next expiring trade info */}
                        {nextExpiringTrade && (
                            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/30">
                                {nextExpiringTrade.direction === 'higher' ? 
                                    <TrendingUp className="w-4 h-4 text-green-400" /> : 
                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                }
                                <div className="text-sm">
                                    <div className="font-medium">${nextExpiringTrade.amount}</div>
                                    <div className="opacity-70">{nextExpiringTrade.direction}</div>
                                </div>
                            </div>
                        )}

                        {/* Trade urgency indicators */}
                        {(urgentTrades.length > 0 || warningTrades.length > 0) && (
                            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/30">
                                <div className="text-sm">
                                    {urgentTrades.length > 0 && (
                                        <div className="flex items-center gap-1 text-red-300">
                                            <Zap className="w-3 h-3" />
                                            <span>{urgentTrades.length} urgent</span>
                                        </div>
                                    )}
                                    {warningTrades.length > 0 && (
                                        <div className="flex items-center gap-1 text-yellow-300">
                                            <Clock className="w-3 h-3" />
                                            <span>{warningTrades.length} warning</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Enhanced progress bar */}
                {!isExpired && (
                    <div className="mt-3 w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full transition-all duration-1000 ease-linear"
                            style={{
                                width: `${(nextExpirySeconds / (nextExpiringTrade ? 
                                    Math.floor((nextExpiringTrade.expiryTime - nextExpiringTrade.timestamp) / 1000) : 
                                    initialTime)) * 100}%`,
                                backgroundColor: nextExpirySeconds <= 5 ? '#ef4444' : 
                                                nextExpirySeconds <= 10 ? '#f59e0b' : 
                                                nextExpirySeconds <= 30 ? '#eab308' : 
                                                dataSource === 'mt4' ? '#2563eb' :
                                                dataSource === 'mt5' ? '#10b981' : '#a855f7'
                            }}
                        />
                    </div>
                )}

                {/* Multiple trades indicator with source grouping */}
                {activeTrades.length > 1 && !isExpired && (
                    <div className="mt-3">
                        {/* Trade dots by urgency */}
                        <div className="flex gap-1 justify-center mb-2">
                            {activeTrades.slice(0, 10).map((trade, index) => {
                                const tradeTimeLeft = Math.max(0, Math.floor((trade.expiryTime - Date.now()) / 1000));
                                return (
                                    <div
                                        key={trade.id}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                            tradeTimeLeft <= 5 ? 'bg-red-400 animate-pulse' :
                                            tradeTimeLeft <= 10 ? 'bg-orange-400' :
                                            tradeTimeLeft <= 30 ? 'bg-yellow-400' : 
                                            trade.source === 'mt4' ? 'bg-blue-400' :
                                            trade.source === 'mt5' ? 'bg-green-400' : 'bg-purple-400'
                                        }`}
                                        title={`${trade.direction} $${trade.amount} - ${tradeTimeLeft}s (${trade.source.toUpperCase()})`}
                                    />
                                );
                            })}
                            {activeTrades.length > 10 && (
                                <div className="text-xs opacity-70 ml-1 flex items-center">
                                    +{activeTrades.length - 10}
                                </div>
                            )}
                        </div>

                        {/* Source breakdown */}
                        <div className="flex gap-3 justify-center text-xs">
                            {Object.entries(tradesBySource).map(([source, count]) => (
                                <div key={source} className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                        source === 'mt4' ? 'bg-blue-400' :
                                        source === 'mt5' ? 'bg-green-400' : 'bg-purple-400'
                                    }`} />
                                    <span className="opacity-80">{source.toUpperCase()}: {count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trade summary for multiple trades */}
                {activeTrades.length > 1 && !isExpired && (
                    <div className="mt-2 text-xs opacity-80 text-center">
                        Total invested: ${activeTrades.reduce((sum, trade) => sum + trade.amount, 0)} via {dataSource.toUpperCase()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DealTimerV4;