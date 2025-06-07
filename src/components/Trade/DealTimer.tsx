"use client"
import React, { useEffect, useState, useRef } from 'react';
import { Clock, X } from 'lucide-react';

interface DealTimerProps {
    timeLeft: number;
    onTimerEnd: () => void;
}

const DealTimer: React.FC<DealTimerProps> = ({ timeLeft: initialTime, onTimerEnd }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isExpired, setIsExpired] = useState(false);
    const [showExpired, setShowExpired] = useState(false);
    const onTimerEndRef = useRef(onTimerEnd);

    useEffect(() => {
        onTimerEndRef.current = onTimerEnd;
    });

    useEffect(() => {
        setTimeLeft(initialTime);
        setIsExpired(false);
        setShowExpired(false);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setIsExpired(true);

                    // ✅ Cerrar el trade INMEDIATAMENTE cuando expira
                    onTimerEndRef.current();

                    // Mostrar mensaje "Deal Expired!" por 2 segundos
                    setShowExpired(true);
                    setTimeout(() => {
                        setShowExpired(false);
                    }, 2000);

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [initialTime]);

    // Si el timer expiró y ya no estamos mostrando el mensaje, no renderizar nada
    if (isExpired && !showExpired) {
        return null;
    }

    return (
        /* Timer compacto en la parte superior sin overlay */
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div className={`text-white px-6 py-3 rounded-xl shadow-lg backdrop-blur-md border transition-all duration-300 ${isExpired
                    ? 'bg-red-600/90 border-red-400 animate-pulse scale-105'
                    : timeLeft <= 3
                        ? 'bg-orange-500/90 border-orange-400 animate-pulse'
                        : 'bg-blue-600/90 border-blue-400'
                }`}>
                <div className="flex items-center gap-2">
                    {isExpired ? (
                        <X className="w-4 h-4 text-red-200" />
                    ) : (
                        <Clock className="w-4 h-4" />
                    )}
                    <span className="font-bold text-sm">
                        {isExpired ? 'Deal Expired!' : `${timeLeft}s`}
                    </span>
                </div>

                {/* Barra de progreso compacta */}
                {!isExpired && (
                    <div className="mt-1 w-full bg-white/20 rounded-full h-1 overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-1000 ease-linear"
                            style={{
                                width: `${(timeLeft / initialTime) * 100}%`,
                                backgroundColor: timeLeft <= 3 ? '#fbbf24' : '#ffffff'
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DealTimer;