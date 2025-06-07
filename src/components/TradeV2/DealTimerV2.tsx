"use client"
import React, { useEffect, useState } from 'react';
import { Clock, X, TrendingUp, TrendingDown } from 'lucide-react';
import { ActiveTradeV2 } from './TradeV2';

interface DealTimerV2Props {
    timeLeft: number;
    onTimerEnd: () => void;
    activeTrades: ActiveTradeV2[];
}

const DealTimerV2: React.FC<DealTimerV2Props> = ({ timeLeft: initialTime, onTimerEnd, activeTrades }) => {
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
    }, null as ActiveTradeV2 | null);

    const nextExpirySeconds = nextExpiringTrade 
        ? Math.max(0, Math.floor((nextExpiringTrade.expiryTime - Date.now()) / 1000))
        : timeLeft;

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div className={`text-white px-6 py-4 rounded-xl shadow-lg backdrop-blur-md border transition-all duration-300 ${isExpired
                    ? 'bg-red-600/90 border-red-400 animate-pulse scale-105'
                    : nextExpirySeconds <= 5
                        ? 'bg-orange-500/90 border-orange-400 animate-pulse'
                        : nextExpirySeconds <= 10
                            ? 'bg-yellow-500/90 border-yellow-400'
                            : 'bg-blue-600/90 border-blue-400'
                }`}>
                
                {isExpired ? (
                    <div className="flex items-center gap-3">
                        <X className="w-5 h-5 text-red-200" />
                        <div>
                            <div className="font-bold text-lg">Trades Expired!</div>
                            <div className="text-sm opacity-80">Results calculated</div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Clock className="w-5 h-5" />
                        <div>
                            <div className="font-bold text-lg">{nextExpirySeconds}s</div>
                            <div className="text-sm opacity-80">
                                {activeTrades.length} active trade{activeTrades.length > 1 ? 's' : ''}
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
                                backgroundColor: nextExpirySeconds <= 5 ? '#fbbf24' : 
                                                nextExpirySeconds <= 10 ? '#f59e0b' : '#ffffff'
                            }}
                        />
                    </div>
                )}

                {/* Multiple trades indicator */}
                {activeTrades.length > 1 && !isExpired && (
                    <div className="mt-2 flex gap-1">
                        {activeTrades.slice(0, 5).map((trade, index) => {
                            const tradeTimeLeft = Math.max(0, Math.floor((trade.expiryTime - Date.now()) / 1000));
                            return (
                                <div
                                    key={trade.id}
                                    className={`w-2 h-2 rounded-full ${
                                        tradeTimeLeft <= 5 ? 'bg-red-400' :
                                        tradeTimeLeft <= 10 ? 'bg-yellow-400' : 'bg-green-400'
                                    }`}
                                    title={`${trade.direction} $${trade.amount} - ${tradeTimeLeft}s`}
                                />
                            );
                        })}
                        {activeTrades.length > 5 && (
                            <div className="text-xs opacity-70 ml-1">+{activeTrades.length - 5}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DealTimerV2;