"use client"
import React, { useRef, useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Settings, Clock, Maximize2 } from 'lucide-react';

interface PriceData {
    timestamp: number;
    price: number;
    volume: number;
}

interface CandlestickData {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface ActiveTrade {
    direction: 'higher' | 'lower';
    entryPrice: number;
    amount: number;
    timestamp: number;
    profit: number;
}

interface TradingChartProps {
    priceData: PriceData[];
    currentPrice: number;
    symbol: string;
    activeTrade?: ActiveTrade | null;
    currentPnL?: number;
}

type ChartType = 'line' | 'candlestick' | 'area';
type TimeFrame = '1s' | '30s' | '1m' | '5m';

const TradingChart: React.FC<TradingChartProps> = ({
    priceData,
    currentPrice,
    symbol,
    activeTrade,
    currentPnL = 0
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [chartType, setChartType] = useState<ChartType>('line');
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('1s');
    const [showVolume, setShowVolume] = useState(false);
    const [showGrid, setShowGrid] = useState(true);
    const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);

    // Convertir datos de precio a candlesticks con espaciado temporal correcto
    useEffect(() => {
        if (priceData.length < 1) return;

        const timeFrameMs = {
            '1s': 1000,
            '30s': 30000,
            '1m': 60000,
            '5m': 300000
        };

        const interval = timeFrameMs[timeFrame];

        // Agrupar datos por intervalos de tiempo
        const candleMap = new Map<number, CandlestickData>();

        priceData.forEach(point => {
            const candleTime = Math.floor(point.timestamp / interval) * interval;

            if (!candleMap.has(candleTime)) {
                candleMap.set(candleTime, {
                    timestamp: candleTime,
                    open: point.price,
                    high: point.price,
                    low: point.price,
                    close: point.price,
                    volume: point.volume
                });
            } else {
                const candle = candleMap.get(candleTime)!;
                candle.high = Math.max(candle.high, point.price);
                candle.low = Math.min(candle.low, point.price);
                candle.close = point.price;
                candle.volume += point.volume;
            }
        });

        // Convertir a array y ordenar por timestamp
        const sortedCandles = Array.from(candleMap.values())
            .sort((a, b) => a.timestamp - b.timestamp);

        // NO rellenar gaps artificialmente - mantener solo las velas reales
        // para que el espaciado temporal sea correcto
        setCandlestickData(sortedCandles);
    }, [priceData, timeFrame]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const drawChart = () => {
            const rect = canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            // Reservar espacio para timeline y volumen
            const timelineHeight = 40;
            const volumeHeight = showVolume ? height * 0.2 : 0;
            const chartHeight = height - timelineHeight - volumeHeight;

            ctx.clearRect(0, 0, width, height);

            const padding = { left: 60, right: 20, top: 20, bottom: 20 };
            const chartWidth = width - padding.left - padding.right;
            const effectiveChartHeight = chartHeight - padding.top - padding.bottom;

            // Determinar datos y rango de precios
            let prices: number[] = [];
            let timestamps: number[] = [];
            let dataToUse: (PriceData | CandlestickData)[] = [];

            if (chartType === 'candlestick' && candlestickData.length > 0) {
                // Para candlesticks, usar solo las velas reales sin interpolación
                const maxVisibleCandles = 60;
                const visibleCandles = candlestickData.slice(-maxVisibleCandles);

                // Calcular rango de precios con las velas visibles
                const visiblePrices = visibleCandles.flatMap(c => [c.high, c.low]);

                prices = visiblePrices;
                timestamps = visibleCandles.map(c => c.timestamp);
                dataToUse = visibleCandles;
            } else {
                const lineData = priceData.slice(-100);
                // Para line chart, mantener interpolación suave
                const interpolatedData: PriceData[] = [];

                if (lineData.length > 1) {
                    for (let i = 0; i < lineData.length - 1; i++) {
                        const current = lineData[i];
                        const next = lineData[i + 1];

                        interpolatedData.push(current);

                        // Interpolar 1-2 puntos entre datos reales para mayor suavidad
                        const timeDiff = next.timestamp - current.timestamp;
                        const timeFrameMs = {
                            '1s': 1000, '30s': 30000, '1m': 60000, '5m': 300000
                        }[timeFrame];

                        const gaps = Math.floor(timeDiff / timeFrameMs) - 1;

                        if (gaps > 0 && gaps <= 3) {
                            for (let j = 1; j <= gaps; j++) {
                                const progress = j / (gaps + 1);
                                const interpolatedPrice = current.price +
                                    (next.price - current.price) * progress;

                                interpolatedData.push({
                                    timestamp: current.timestamp + (j * timeFrameMs),
                                    price: interpolatedPrice,
                                    volume: Math.max(1, current.volume * 0.3)
                                });
                            }
                        }
                    }
                    interpolatedData.push(lineData[lineData.length - 1]);
                }

                const finalLineData = interpolatedData.length > 0 ? interpolatedData.slice(-60) : lineData;
                prices = finalLineData.map(d => d.price);
                timestamps = finalLineData.map(d => d.timestamp);
                dataToUse = finalLineData;
            }

            if (prices.length === 0) return;

            // Calcular rango de precios con padding automático para mejor visualización
            const rawMinPrice = Math.min(...prices);
            const rawMaxPrice = Math.max(...prices);

            // Agregar padding del 5% arriba y abajo para mejor visualización
            const priceRange = rawMaxPrice - rawMinPrice || 0.001;
            const padding_percent = 0.05; // 5% de padding

            let adjustedMinPrice = rawMinPrice - (priceRange * padding_percent);
            let adjustedMaxPrice = rawMaxPrice + (priceRange * padding_percent);

            // Incluir precio de entrada del trade si existe
            if (activeTrade) {
                adjustedMinPrice = Math.min(adjustedMinPrice, activeTrade.entryPrice);
                adjustedMaxPrice = Math.max(adjustedMaxPrice, activeTrade.entryPrice);
            }

            // Incluir precio actual para asegurar que siempre sea visible
            adjustedMinPrice = Math.min(adjustedMinPrice, currentPrice);
            adjustedMaxPrice = Math.max(adjustedMaxPrice, currentPrice);

            // Recalcular el rango final con los ajustes
            const finalPriceRange = adjustedMaxPrice - adjustedMinPrice;

            // Función para convertir precio a coordenada Y
            const priceToY = (price: number) =>
                padding.top + ((adjustedMaxPrice - price) / finalPriceRange) * effectiveChartHeight;

            // Función mejorada para convertir timestamp/índice a coordenada X
            const timestampToX = (timestamp: number, allTimestamps: number[]) => {
                if (allTimestamps.length <= 1) {
                    return padding.left + chartWidth / 2;
                }

                if (chartType === 'candlestick') {
                    // Para candlesticks, usar escala temporal real
                    const minTime = Math.min(...allTimestamps);
                    const maxTime = Math.max(...allTimestamps);
                    const timeRange = maxTime - minTime || 1;

                    // Si tenemos pocas velas, mantener el espaciado temporal correcto
                    // alineando hacia la derecha como en un gráfico real
                    const timeFrameMs = {
                        '1s': 1000, '30s': 30000, '1m': 60000, '5m': 300000
                    }[timeFrame];

                    // Calcular cuántas velas "cabrian" en el tiempo disponible
                    const maxPossibleCandles = Math.floor(timeRange / timeFrameMs) + 1;
                    const actualCandles = allTimestamps.length;

                    if (actualCandles < 10) {
                        // Si hay pocas velas, alinear hacia la derecha con espaciado uniforme
                        const candleWidth = chartWidth / Math.max(10, actualCandles);
                        const startX = padding.left + chartWidth - (actualCandles * candleWidth);
                        const candleIndex = allTimestamps.indexOf(timestamp);
                        return startX + (candleIndex * candleWidth) + candleWidth / 2;
                    } else {
                        // Usar escala temporal normal
                        const progress = (timestamp - minTime) / timeRange;
                        return padding.left + progress * chartWidth;
                    }
                } else {
                    // Para line/area, usar distribución por índice como antes
                    const index = allTimestamps.indexOf(timestamp);
                    return padding.left + (index / Math.max(1, allTimestamps.length - 1)) * chartWidth;
                }
            };

            // Dibujar cuadrícula
            if (showGrid) {
                ctx.strokeStyle = '#374151';
                ctx.lineWidth = 0.5;
                ctx.setLineDash([2, 4]);

                // Líneas horizontales de precio
                for (let i = 0; i <= 8; i++) {
                    const y = padding.top + (i / 8) * effectiveChartHeight;
                    ctx.beginPath();
                    ctx.moveTo(padding.left, y);
                    ctx.lineTo(width - padding.right, y);
                    ctx.stroke();
                }

                // Líneas verticales de tiempo
                for (let i = 0; i <= 10; i++) {
                    const x = padding.left + (i / 10) * chartWidth;
                    ctx.beginPath();
                    ctx.moveTo(x, padding.top);
                    ctx.lineTo(x, chartHeight - padding.bottom);
                    ctx.stroke();
                }

                ctx.setLineDash([]);
            }

            // Dibujar según el tipo de gráfico
            if (chartType === 'candlestick' && candlestickData.length > 0) {
                const maxVisibleCandles = 60;
                const visibleCandles = candlestickData.slice(-maxVisibleCandles);
                drawCandlesticks(ctx, visibleCandles, padding, chartWidth, effectiveChartHeight, priceToY, timestampToX);
            } else if (chartType === 'area') {
                const lineData = priceData.slice(-100);
                drawAreaChart(ctx, lineData, padding, chartWidth, effectiveChartHeight, priceToY, timestampToX, chartHeight);
            } else {
                const lineData = priceData.slice(-100);
                drawLineChart(ctx, lineData, padding, chartWidth, effectiveChartHeight, priceToY, timestampToX);
            }

            // Dibujar volumen si está habilitado
            if (showVolume) {
                drawVolumeChart(ctx, dataToUse, padding, chartWidth, volumeHeight, chartHeight, timestampToX);
            }

            // Línea de entrada del trade activo
            if (activeTrade) {
                drawTradeLine(ctx, activeTrade, currentPnL, priceToY, padding, width, chartHeight);
            }

            // Etiquetas de precio (eje Y)
            drawPriceLabels(ctx, adjustedMinPrice, adjustedMaxPrice, finalPriceRange, padding, effectiveChartHeight);

            // Timeline (eje X)
            drawTimeline(ctx, timestamps, padding, chartWidth, height, timelineHeight);

            // Precio actual
            drawCurrentPrice(ctx, currentPrice, priceToY, width, padding);
        };

        drawChart();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [priceData, currentPrice, activeTrade, currentPnL, chartType, timeFrame, showVolume, showGrid, candlestickData]);

    // Funciones de dibujo mejoradas
    const drawCandlesticks = (
        ctx: CanvasRenderingContext2D,
        data: CandlestickData[],
        padding: { left: number; right: number; top: number; bottom: number },
        chartWidth: number,
        chartHeight: number,
        priceToY: (price: number) => number,
        timestampToX: (timestamp: number, allTimestamps: number[]) => number
    ) => {
        if (data.length === 0) return;

        const allTimestamps = data.map(d => d.timestamp);

        // Calcular ancho de vela dinámicamente
        let candleWidth;
        if (data.length < 10) {
            // Para pocas velas, usar un ancho fijo razonable
            candleWidth = Math.min(12, chartWidth / 15);
        } else {
            // Para más velas, calcular basado en densidad
            const avgSpacing = chartWidth / data.length;
            candleWidth = Math.max(2, Math.min(12, avgSpacing * 0.7));
        }

        data.forEach((candle) => {
            const x = timestampToX(candle.timestamp, allTimestamps);
            const openY = priceToY(candle.open);
            const closeY = priceToY(candle.close);
            const highY = priceToY(candle.high);
            const lowY = priceToY(candle.low);

            const isGreen = candle.close >= candle.open;
            const wickColor = isGreen ? '#10b981' : '#ef4444';
            const bodyColor = isGreen ? '#10b981' : '#ef4444';

            // Dibujar mecha (línea high-low)
            ctx.strokeStyle = wickColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, highY);
            ctx.lineTo(x, lowY);
            ctx.stroke();

            // Cuerpo de la vela
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(1, Math.abs(closeY - openY)); // Mínimo 1px para velas doji

            // Vela rellena tanto verde como roja
            ctx.fillStyle = bodyColor;
            ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

            // Borde del cuerpo para mejor definición
            ctx.strokeStyle = wickColor;
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        });
    };

    const drawAreaChart = (
        ctx: CanvasRenderingContext2D,
        data: PriceData[],
        padding: { left: number; right: number; top: number; bottom: number },
        chartWidth: number,
        chartHeight: number,
        priceToY: (price: number) => number,
        timestampToX: (timestamp: number, allTimestamps: number[]) => number,
        fullHeight: number
    ) => {
        if (data.length < 2) return;

        const allTimestamps = data.map(d => d.timestamp);

        // Línea
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = timestampToX(point.timestamp, allTimestamps);
            const y = priceToY(point.price);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Área con gradiente
        const gradient = ctx.createLinearGradient(0, padding.top, 0, fullHeight);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0.05)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(padding.left, fullHeight - 60); // Altura del timeline

        data.forEach((point) => {
            const x = timestampToX(point.timestamp, allTimestamps);
            const y = priceToY(point.price);
            ctx.lineTo(x, y);
        });

        ctx.lineTo(padding.left + chartWidth, fullHeight - 60);
        ctx.closePath();
        ctx.fill();
    };

    const drawLineChart = (
        ctx: CanvasRenderingContext2D,
        data: PriceData[],
        padding: { left: number; right: number; top: number; bottom: number },
        chartWidth: number,
        chartHeight: number,
        priceToY: (price: number) => number,
        timestampToX: (timestamp: number, allTimestamps: number[]) => number
    ) => {
        if (data.length < 2) return;

        const allTimestamps = data.map(d => d.timestamp);

        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = timestampToX(point.timestamp, allTimestamps);
            const y = priceToY(point.price);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Puntos en la línea para mejor visualización
        ctx.fillStyle = '#a855f7';
        data.forEach((point) => {
            const x = timestampToX(point.timestamp, allTimestamps);
            const y = priceToY(point.price);

            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
        });
    };

    const drawVolumeChart = (
        ctx: CanvasRenderingContext2D,
        data: (PriceData | CandlestickData)[],
        padding: { left: number; right: number; top: number; bottom: number },
        chartWidth: number,
        volumeHeight: number,
        chartTop: number,
        timestampToX: (timestamp: number, allTimestamps: number[]) => number
    ) => {
        if (data.length === 0) return;

        const volumes = data.map(d => d.volume).filter(v => v > 0);
        const maxVolume = Math.max(...volumes);

        if (maxVolume === 0) return;

        const allTimestamps = data.map(d => d.timestamp);
        const barWidth = Math.max(1, chartWidth / data.length * 0.6);

        data.forEach((point) => {
            const x = timestampToX(point.timestamp, allTimestamps);
            const barHeight = (point.volume / maxVolume) * (volumeHeight - 10);

            ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
            ctx.fillRect(x - barWidth / 2, chartTop - barHeight, barWidth, barHeight);
        });
    };

    const drawTimeline = (
        ctx: CanvasRenderingContext2D,
        timestamps: number[],
        padding: { left: number; right: number; top: number; bottom: number },
        chartWidth: number,
        height: number,
        timelineHeight: number
    ) => {
        if (timestamps.length === 0) return;

        const timelineY = height - timelineHeight + 10;

        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';

        // Mostrar 5-7 etiquetas de tiempo distribuidas uniformemente
        const labelCount = Math.min(7, timestamps.length);

        for (let i = 0; i < labelCount; i++) {
            const dataIndex = Math.floor((i / (labelCount - 1)) * (timestamps.length - 1));
            const timestamp = timestamps[dataIndex];
            const x = padding.left + (i / (labelCount - 1)) * chartWidth;

            const date = new Date(timestamp);
            let timeLabel = '';

            if (timeFrame === '1s' || timeFrame === '30s') {
                timeLabel = date.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            } else {
                timeLabel = date.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            ctx.fillText(timeLabel, x, timelineY);
        }

        ctx.textAlign = 'start';
    };

    const drawTradeLine = (
        ctx: CanvasRenderingContext2D,
        trade: ActiveTrade,
        pnl: number,
        priceToY: (price: number) => number,
        padding: { left: number; right: number; top: number; bottom: number },
        width: number,
        chartHeight: number
    ) => {
        const entryY = priceToY(trade.entryPrice);
        const isWinning = pnl >= 0;

        ctx.strokeStyle = isWinning ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);

        ctx.beginPath();
        ctx.moveTo(padding.left, entryY);
        ctx.lineTo(width - padding.right, entryY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Etiqueta de precio de entrada
        ctx.fillStyle = isWinning ? '#10b981' : '#ef4444';
        ctx.font = 'bold 11px Inter';
        const entryText = `Entry: ${trade.entryPrice.toFixed(5)}`;
        const textWidth = ctx.measureText(entryText).width;

        ctx.fillRect(width - padding.right - textWidth - 10, entryY - 12, textWidth + 8, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(entryText, width - padding.right - textWidth - 6, entryY - 2);
    };

    const drawPriceLabels = (
        ctx: CanvasRenderingContext2D,
        minPrice: number,
        maxPrice: number,
        priceRange: number,
        padding: { left: number; right: number; top: number; bottom: number },
        chartHeight: number
    ) => {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px Inter';
        ctx.textAlign = 'end';

        for (let i = 0; i <= 8; i++) {
            const price = maxPrice - (i / 8) * priceRange;
            const y = padding.top + (i / 8) * chartHeight;
            ctx.fillText(price.toFixed(5), padding.left - 5, y + 3);
        }

        ctx.textAlign = 'start';
    };

    const drawCurrentPrice = (
        ctx: CanvasRenderingContext2D,
        price: number,
        priceToY: (price: number) => number,
        width: number,
        padding: { left: number; right: number; top: number; bottom: number }
    ) => {
        const y = priceToY(price);

        // Punto indicador
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(width - padding.right - 8, y, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Etiqueta de precio actual
        const priceText = price.toFixed(5);
        ctx.font = 'bold 10px Inter';
        const textWidth = ctx.measureText(priceText).width;

        ctx.fillStyle = 'rgba(168, 85, 247, 0.9)';
        ctx.fillRect(width - padding.right - textWidth - 15, y - 8, textWidth + 10, 16);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(priceText, width - padding.right - textWidth - 10, y + 2);
    };

    return (
        <div className="w-full h-full">
            <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-3 sm:p-4 lg:p-6 h-full min-h-[300px] lg:min-h-[400px]">
                {/* Header con controles */}
                <div className="mb-2 sm:mb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 lg:gap-4">
                    <div>
                        <h3 className="text-lg lg:text-xl font-bold text-white">{symbol} Chart</h3>
                        <div className="text-xs sm:text-sm text-gray-400">Real-time price movement</div>
                    </div>

                    {/* Controles del gráfico */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm">
                        {/* Tipo de gráfico */}
                        <div className="flex bg-gray-800/50 rounded-lg p-1">
                            <button
                                onClick={() => setChartType('line')}
                                className={`px-2 sm:px-3 py-1 rounded transition-all ${chartType === 'line' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                                onClick={() => setChartType('candlestick')}
                                className={`px-2 sm:px-3 py-1 rounded transition-all ${chartType === 'candlestick' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                                onClick={() => setChartType('area')}
                                className={`px-2 sm:px-3 py-1 rounded transition-all ${chartType === 'area' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                        </div>

                        {/* Timeframe */}
                        <select
                            value={timeFrame}
                            onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
                            className="bg-gray-800/50 text-white rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-600"
                        >
                            <option value="1s">1s</option>
                            <option value="30s">30s</option>
                            <option value="1m">1m</option>
                            <option value="5m">5m</option>
                        </select>

                        {/* Opciones adicionales */}
                        <div className="flex gap-1 sm:gap-2">
                            <button
                                onClick={() => setShowVolume(!showVolume)}
                                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-all ${showVolume ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'
                                    }`}
                            >
                                Vol
                            </button>
                            <button
                                onClick={() => setShowGrid(!showGrid)}
                                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-all ${showGrid ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'
                                    }`}
                            >
                                Grid
                            </button>
                        </div>
                    </div>

                    {/* Información del trade activo */}
                    {activeTrade && (
                        <div className="text-right">
                            <div className={`text-xs sm:text-sm font-medium ${currentPnL >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                P&L: {currentPnL >= 0 ? '+' : ''}${currentPnL.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-400">
                                {activeTrade.direction === 'higher' ? '⬆' : '⬇'} {activeTrade.direction.toUpperCase()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Canvas del gráfico */}
                <div className="relative w-full flex-1" style={{ height: 'calc(100% - 60px)' }}>
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full rounded-lg"
                    />
                </div>
            </div>
        </div>
    );
};

export default TradingChart;