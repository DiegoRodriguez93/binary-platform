"use client"
import React, { useRef, useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Settings, Clock, Maximize2, Volume2, Grid3X3, Crosshair } from 'lucide-react';
import { PriceDataV2, CandlestickDataV2, ActiveTradeV2 } from './TradeV2';

interface TradingChartV2Props {
    priceData: PriceDataV2[];
    candlestickData: CandlestickDataV2[];
    currentPrice: number;
    symbol: string;
    activeTrades: ActiveTradeV2[];
    currentPnL: number;
    timeFrame: '1s' | '5s' | '30s' | '1m' | '5m';
    onTimeFrameChange: (timeFrame: '1s' | '5s' | '30s' | '1m' | '5m') => void;
    marketTrend: 'bullish' | 'bearish' | 'sideways';
}

type ChartType = 'line' | 'candlestick' | 'area';

const TradingChartV2: React.FC<TradingChartV2Props> = ({
    priceData,
    candlestickData,
    currentPrice,
    symbol,
    activeTrades,
    currentPnL,
    timeFrame,
    onTimeFrameChange,
    marketTrend
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [chartType, setChartType] = useState<ChartType>('candlestick');
    const [showVolume, setShowVolume] = useState(true);
    const [showGrid, setShowGrid] = useState(true);
    const [showCrosshair, setShowCrosshair] = useState(true);
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
    const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);

    // Enhanced drawing functions
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

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setMousePosition({ x, y });

            // Calculate hovered price
            const padding = { left: 80, right: 40, top: 20, bottom: 60 };
            const chartHeight = rect.height - padding.top - padding.bottom - (showVolume ? rect.height * 0.2 : 0);
            
            if (y >= padding.top && y <= padding.top + chartHeight) {
                const dataToUse = chartType === 'candlestick' ? candlestickData : priceData;
                if (dataToUse.length > 0) {
                    const prices = chartType === 'candlestick' 
                        ? candlestickData.flatMap(c => [c.high, c.low])
                        : priceData.map(d => d.price);
                    
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    const priceRange = maxPrice - minPrice || 0.001;
                    
                    const relativeY = (y - padding.top) / chartHeight;
                    const price = maxPrice - (relativeY * priceRange);
                    setHoveredPrice(price);
                }
            }
        };

        const handleMouseLeave = () => {
            setMousePosition(null);
            setHoveredPrice(null);
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        const drawChart = () => {
            const rect = canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            const timelineHeight = 50;
            const volumeHeight = showVolume ? height * 0.2 : 0;
            const chartHeight = height - timelineHeight - volumeHeight;

            ctx.clearRect(0, 0, width, height);

            const padding = { left: 80, right: 40, top: 20, bottom: 20 };
            const chartWidth = width - padding.left - padding.right;
            const effectiveChartHeight = chartHeight - padding.top - padding.bottom;

            // Determine data and price range
            let prices: number[] = [];
            let timestamps: number[] = [];
            let dataToUse: (PriceDataV2 | CandlestickDataV2)[] = [];

            if (chartType === 'candlestick' && candlestickData.length > 0) {
                const maxVisibleCandles = 100;
                const visibleCandles = candlestickData.slice(-maxVisibleCandles);
                prices = visibleCandles.flatMap(c => [c.high, c.low]);
                timestamps = visibleCandles.map(c => c.timestamp);
                dataToUse = visibleCandles;
            } else {
                const lineData = priceData.slice(-200);
                prices = lineData.map(d => d.price);
                timestamps = lineData.map(d => d.timestamp);
                dataToUse = lineData;
            }

            if (prices.length === 0) return;

            // Enhanced price range calculation
            const rawMinPrice = Math.min(...prices);
            const rawMaxPrice = Math.max(...prices);
            const priceRange = rawMaxPrice - rawMinPrice || 0.001;
            const padding_percent = 0.05;

            let adjustedMinPrice = rawMinPrice - (priceRange * padding_percent);
            let adjustedMaxPrice = rawMaxPrice + (priceRange * padding_percent);

            // Include active trade prices
            activeTrades.forEach(trade => {
                adjustedMinPrice = Math.min(adjustedMinPrice, trade.entryPrice);
                adjustedMaxPrice = Math.max(adjustedMaxPrice, trade.entryPrice);
            });

            adjustedMinPrice = Math.min(adjustedMinPrice, currentPrice);
            adjustedMaxPrice = Math.max(adjustedMaxPrice, currentPrice);

            const finalPriceRange = adjustedMaxPrice - adjustedMinPrice;

            const priceToY = (price: number) =>
                padding.top + ((adjustedMaxPrice - price) / finalPriceRange) * effectiveChartHeight;

            const timestampToX = (timestamp: number, allTimestamps: number[]) => {
                if (allTimestamps.length <= 1) {
                    return padding.left + chartWidth / 2;
                }

                if (chartType === 'candlestick') {
                    const timeFrameMs = {
                        '1s': 1000, '5s': 5000, '30s': 30000, '1m': 60000, '5m': 300000
                    }[timeFrame];

                    const minTime = Math.min(...allTimestamps);
                    const maxTime = Math.max(...allTimestamps);
                    const timeRange = maxTime - minTime || 1;

                    if (allTimestamps.length < 10) {
                        const candleWidth = chartWidth / Math.max(10, allTimestamps.length);
                        const startX = padding.left + chartWidth - (allTimestamps.length * candleWidth);
                        const candleIndex = allTimestamps.indexOf(timestamp);
                        return startX + (candleIndex * candleWidth) + candleWidth / 2;
                    } else {
                        const progress = (timestamp - minTime) / timeRange;
                        return padding.left + progress * chartWidth;
                    }
                } else {
                    const index = allTimestamps.indexOf(timestamp);
                    return padding.left + (index / Math.max(1, allTimestamps.length - 1)) * chartWidth;
                }
            };

            // Draw enhanced grid
            if (showGrid) {
                ctx.strokeStyle = '#374151';
                ctx.lineWidth = 0.5;
                ctx.setLineDash([2, 4]);

                // Horizontal price lines
                for (let i = 0; i <= 10; i++) {
                    const y = padding.top + (i / 10) * effectiveChartHeight;
                    ctx.beginPath();
                    ctx.moveTo(padding.left, y);
                    ctx.lineTo(width - padding.right, y);
                    ctx.stroke();
                }

                // Vertical time lines
                for (let i = 0; i <= 12; i++) {
                    const x = padding.left + (i / 12) * chartWidth;
                    ctx.beginPath();
                    ctx.moveTo(x, padding.top);
                    ctx.lineTo(x, chartHeight - padding.bottom);
                    ctx.stroke();
                }

                ctx.setLineDash([]);
            }

            // Draw chart based on type
            if (chartType === 'candlestick' && candlestickData.length > 0) {
                const maxVisibleCandles = 100;
                const visibleCandles = candlestickData.slice(-maxVisibleCandles);
                drawEnhancedCandlesticks(ctx, visibleCandles, padding, chartWidth, effectiveChartHeight, priceToY, timestampToX, timeFrame);
            } else if (chartType === 'area') {
                const lineData = priceData.slice(-200);
                drawEnhancedAreaChart(ctx, lineData, padding, chartWidth, effectiveChartHeight, priceToY, timestampToX, chartHeight);
            } else {
                const lineData = priceData.slice(-200);
                drawEnhancedLineChart(ctx, lineData, padding, chartWidth, effectiveChartHeight, priceToY, timestampToX);
            }

            // Draw volume if enabled
            if (showVolume) {
                drawEnhancedVolumeChart(ctx, dataToUse, padding, chartWidth, volumeHeight, chartHeight, timestampToX);
            }

            // Draw active trade lines
            activeTrades.forEach(trade => {
                drawEnhancedTradeLine(ctx, trade, currentPnL, priceToY, padding, width, chartHeight);
            });

            // Draw price labels
            drawEnhancedPriceLabels(ctx, adjustedMinPrice, adjustedMaxPrice, finalPriceRange, padding, effectiveChartHeight, symbol);

            // Draw timeline
            drawEnhancedTimeline(ctx, timestamps, padding, chartWidth, height, timelineHeight, timeFrame);

            // Draw current price line
            drawEnhancedCurrentPrice(ctx, currentPrice, priceToY, width, padding, marketTrend);

            // Draw crosshair
            if (showCrosshair && mousePosition && hoveredPrice) {
                drawCrosshair(ctx, mousePosition, hoveredPrice, priceToY, padding, width, chartHeight, symbol);
            }
        };

        drawChart();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [priceData, candlestickData, currentPrice, activeTrades, currentPnL, chartType, timeFrame, showVolume, showGrid, showCrosshair, mousePosition, hoveredPrice, marketTrend, symbol]);

    // Enhanced drawing functions
    const drawEnhancedCandlesticks = (
        ctx: CanvasRenderingContext2D,
        data: CandlestickDataV2[],
        padding: any,
        chartWidth: number,
        chartHeight: number,
        priceToY: (price: number) => number,
        timestampToX: (timestamp: number, allTimestamps: number[]) => number,
        timeFrame: string
    ) => {
        if (data.length === 0) return;

        const allTimestamps = data.map(d => d.timestamp);
        let candleWidth;

        if (data.length < 10) {
            candleWidth = Math.min(16, chartWidth / 15);
        } else {
            const avgSpacing = chartWidth / data.length;
            candleWidth = Math.max(3, Math.min(16, avgSpacing * 0.8));
        }

        data.forEach((candle, index) => {
            const x = timestampToX(candle.timestamp, allTimestamps);
            const openY = priceToY(candle.open);
            const closeY = priceToY(candle.close);
            const highY = priceToY(candle.high);
            const lowY = priceToY(candle.low);

            const isGreen = candle.close >= candle.open;
            const wickColor = isGreen ? '#10b981' : '#ef4444';
            const bodyColor = isGreen ? '#10b981' : '#ef4444';

            // Enhanced wick drawing
            ctx.strokeStyle = wickColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, highY);
            ctx.lineTo(x, lowY);
            ctx.stroke();

            // Enhanced body drawing
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(2, Math.abs(closeY - openY));

            // Gradient fill for body
            const gradient = ctx.createLinearGradient(x - candleWidth/2, bodyTop, x + candleWidth/2, bodyTop + bodyHeight);
            gradient.addColorStop(0, bodyColor);
            gradient.addColorStop(1, isGreen ? '#059669' : '#dc2626');

            ctx.fillStyle = gradient;
            ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

            // Enhanced border
            ctx.strokeStyle = isGreen ? '#065f46' : '#991b1b';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

            // Volume-based transparency
            const volumeAlpha = Math.min(1, candle.volume / 1000);
            ctx.globalAlpha = 0.7 + (volumeAlpha * 0.3);
        });

        ctx.globalAlpha = 1;
    };

    const drawEnhancedAreaChart = (
        ctx: CanvasRenderingContext2D,
        data: PriceDataV2[],
        padding: any,
        chartWidth: number,
        chartHeight: number,
        priceToY: (price: number) => number,
        timestampToX: (timestamp: number, allTimestamps: number[]) => number,
        fullHeight: number
    ) => {
        if (data.length < 2) return;

        const allTimestamps = data.map(d => d.timestamp);

        // Enhanced line with glow effect
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
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
        ctx.shadowBlur = 0;

        // Enhanced gradient area
        const gradient = ctx.createLinearGradient(0, padding.top, 0, fullHeight);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.3)');
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0.05)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(padding.left, fullHeight - 60);

        data.forEach((point) => {
            const x = timestampToX(point.timestamp, allTimestamps);
            const y = priceToY(point.price);
            ctx.lineTo(x, y);
        });

        ctx.lineTo(padding.left + chartWidth, fullHeight - 60);
        ctx.closePath();
        ctx.fill();
    };

    const drawEnhancedLineChart = (
        ctx: CanvasRenderingContext2D,
        data: PriceDataV2[],
        padding: any,
        chartWidth: number,
        chartHeight: number,
        priceToY: (price: number) => number,
        timestampToX: (timestamp: number, allTimestamps: number[]) => number
    ) => {
        if (data.length < 2) return;

        const allTimestamps = data.map(d => d.timestamp);

        // Enhanced line with glow
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2.5;
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
        ctx.shadowBlur = 0;

        // Enhanced data points
        data.forEach((point, index) => {
            if (index % 5 === 0) { // Show every 5th point to avoid clutter
                const x = timestampToX(point.timestamp, allTimestamps);
                const y = priceToY(point.price);

                ctx.fillStyle = '#a855f7';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
    };

    const drawEnhancedVolumeChart = (
        ctx: CanvasRenderingContext2D,
        data: (PriceDataV2 | CandlestickDataV2)[],
        padding: any,
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
        const barWidth = Math.max(1, chartWidth / data.length * 0.8);

        data.forEach((point, index) => {
            const x = timestampToX(point.timestamp, allTimestamps);
            const barHeight = (point.volume / maxVolume) * (volumeHeight - 20);

            // Volume color based on price movement
            let volumeColor = 'rgba(168, 85, 247, 0.6)';
            if ('close' in point && 'open' in point) {
                volumeColor = point.close >= point.open 
                    ? 'rgba(16, 185, 129, 0.6)' 
                    : 'rgba(239, 68, 68, 0.6)';
            }

            ctx.fillStyle = volumeColor;
            ctx.fillRect(x - barWidth / 2, chartTop - barHeight, barWidth, barHeight);

            // Volume bar border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x - barWidth / 2, chartTop - barHeight, barWidth, barHeight);
        });
    };

    const drawEnhancedTradeLine = (
        ctx: CanvasRenderingContext2D,
        trade: ActiveTradeV2,
        pnl: number,
        priceToY: (price: number) => number,
        padding: any,
        width: number,
        chartHeight: number
    ) => {
        const entryY = priceToY(trade.entryPrice);
        const isWinning = pnl >= 0;

        // Enhanced trade line with glow
        ctx.shadowColor = isWinning ? '#10b981' : '#ef4444';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = isWinning ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([15, 8]);

        ctx.beginPath();
        ctx.moveTo(padding.left, entryY);
        ctx.lineTo(width - padding.right, entryY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // Enhanced entry price label
        const entryText = `${trade.direction.toUpperCase()}: ${trade.entryPrice.toFixed(5)}`;
        ctx.font = 'bold 12px Inter';
        const textWidth = ctx.measureText(entryText).width;

        // Label background with gradient
        const gradient = ctx.createLinearGradient(
            width - padding.right - textWidth - 20, entryY - 15,
            width - padding.right, entryY + 5
        );
        gradient.addColorStop(0, isWinning ? '#10b981' : '#ef4444');
        gradient.addColorStop(1, isWinning ? '#059669' : '#dc2626');

        ctx.fillStyle = gradient;
        ctx.fillRect(width - padding.right - textWidth - 20, entryY - 15, textWidth + 16, 20);

        // Label border
        ctx.strokeStyle = isWinning ? '#065f46' : '#991b1b';
        ctx.lineWidth = 1;
        ctx.strokeRect(width - padding.right - textWidth - 20, entryY - 15, textWidth + 16, 20);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(entryText, width - padding.right - textWidth - 12, entryY - 2);
    };

    const drawEnhancedPriceLabels = (
        ctx: CanvasRenderingContext2D,
        minPrice: number,
        maxPrice: number,
        priceRange: number,
        padding: any,
        chartHeight: number,
        symbol: string
    ) => {
        ctx.fillStyle = '#9ca3af';
        ctx.font = '11px Inter';
        ctx.textAlign = 'end';

        const decimals = symbol.includes('JPY') ? 3 : symbol.includes('USD') && !symbol.includes('BTC') ? 5 : 2;

        for (let i = 0; i <= 10; i++) {
            const price = maxPrice - (i / 10) * priceRange;
            const y = padding.top + (i / 10) * chartHeight;
            
            // Price label background
            const priceText = price.toFixed(decimals);
            const textWidth = ctx.measureText(priceText).width;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(padding.left - textWidth - 10, y - 8, textWidth + 8, 16);
            
            ctx.fillStyle = '#9ca3af';
            ctx.fillText(priceText, padding.left - 5, y + 3);
        }

        ctx.textAlign = 'start';
    };

    const drawEnhancedTimeline = (
        ctx: CanvasRenderingContext2D,
        timestamps: number[],
        padding: any,
        chartWidth: number,
        height: number,
        timelineHeight: number,
        timeFrame: string
    ) => {
        if (timestamps.length === 0) return;

        const timelineY = height - timelineHeight + 15;

        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';

        const labelCount = Math.min(8, timestamps.length);

        for (let i = 0; i < labelCount; i++) {
            const dataIndex = Math.floor((i / (labelCount - 1)) * (timestamps.length - 1));
            const timestamp = timestamps[dataIndex];
            const x = padding.left + (i / (labelCount - 1)) * chartWidth;

            const date = new Date(timestamp);
            let timeLabel = '';

            if (timeFrame === '1s' || timeFrame === '5s') {
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

            // Time label background
            const textWidth = ctx.measureText(timeLabel).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x - textWidth/2 - 4, timelineY - 8, textWidth + 8, 16);
            
            ctx.fillStyle = '#9ca3af';
            ctx.fillText(timeLabel, x, timelineY + 3);
        }

        ctx.textAlign = 'start';
    };

    const drawEnhancedCurrentPrice = (
        ctx: CanvasRenderingContext2D,
        price: number,
        priceToY: (price: number) => number,
        width: number,
        padding: any,
        trend: string
    ) => {
        const y = priceToY(price);

        // Trend-based color
        const trendColor = trend === 'bullish' ? '#10b981' : trend === 'bearish' ? '#ef4444' : '#a855f7';

        // Animated pulse effect
        ctx.shadowColor = trendColor;
        ctx.shadowBlur = 15;
        ctx.fillStyle = trendColor;
        ctx.beginPath();
        ctx.arc(width - padding.right - 12, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Enhanced price label
        const priceText = price.toFixed(5);
        ctx.font = 'bold 12px Inter';
        const textWidth = ctx.measureText(priceText).width;

        // Gradient background
        const gradient = ctx.createLinearGradient(
            width - padding.right - textWidth - 25, y - 10,
            width - padding.right, y + 10
        );
        gradient.addColorStop(0, trendColor);
        gradient.addColorStop(1, trend === 'bullish' ? '#059669' : trend === 'bearish' ? '#dc2626' : '#7c3aed');

        ctx.fillStyle = gradient;
        ctx.fillRect(width - padding.right - textWidth - 25, y - 10, textWidth + 20, 20);

        // Border
        ctx.strokeStyle = trend === 'bullish' ? '#065f46' : trend === 'bearish' ? '#991b1b' : '#5b21b6';
        ctx.lineWidth = 1;
        ctx.strokeRect(width - padding.right - textWidth - 25, y - 10, textWidth + 20, 20);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(priceText, width - padding.right - textWidth - 15, y + 3);
    };

    const drawCrosshair = (
        ctx: CanvasRenderingContext2D,
        mousePos: { x: number; y: number },
        price: number,
        priceToY: (price: number) => number,
        padding: any,
        width: number,
        chartHeight: number,
        symbol: string
    ) => {
        const { x, y } = mousePos;

        // Crosshair lines
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        // Vertical line
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, chartHeight - padding.bottom);
        ctx.stroke();

        ctx.setLineDash([]);

        // Price label at crosshair
        if (price) {
            const decimals = symbol.includes('JPY') ? 3 : symbol.includes('USD') && !symbol.includes('BTC') ? 5 : 2;
            const priceText = price.toFixed(decimals);
            ctx.font = 'bold 11px Inter';
            const textWidth = ctx.measureText(priceText).width;

            ctx.fillStyle = 'rgba(168, 85, 247, 0.9)';
            ctx.fillRect(padding.left - textWidth - 15, y - 10, textWidth + 12, 20);

            ctx.fillStyle = '#ffffff';
            ctx.fillText(priceText, padding.left - textWidth - 9, y + 3);
        }
    };

    return (
        <div className="w-full h-full">
            <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-4 lg:p-6 h-full min-h-[500px]">
                {/* Enhanced Header */}
                <div className="mb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h3 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-3">
                            {symbol} Chart
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                marketTrend === 'bullish' ? 'bg-green-500/20 text-green-400' :
                                marketTrend === 'bearish' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                            }`}>
                                {marketTrend.toUpperCase()}
                            </span>
                        </h3>
                        <div className="text-sm text-gray-400">Real-time market analysis</div>
                    </div>

                    {/* Enhanced Controls */}
                    <div className="flex flex-wrap gap-2 text-sm">
                        {/* Chart Type */}
                        <div className="flex bg-gray-800/50 rounded-lg p-1">
                            <button
                                onClick={() => setChartType('line')}
                                className={`px-3 py-1 rounded transition-all ${chartType === 'line' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Line Chart"
                            >
                                <TrendingUp className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setChartType('candlestick')}
                                className={`px-3 py-1 rounded transition-all ${chartType === 'candlestick' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Candlestick Chart"
                            >
                                <BarChart3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setChartType('area')}
                                className={`px-3 py-1 rounded transition-all ${chartType === 'area' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Area Chart"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Timeframe */}
                        <select
                            value={timeFrame}
                            onChange={(e) => onTimeFrameChange(e.target.value as any)}
                            className="bg-gray-800/50 text-white rounded-lg px-3 py-1 text-sm border border-gray-600"
                        >
                            <option value="1s">1s</option>
                            <option value="5s">5s</option>
                            <option value="30s">30s</option>
                            <option value="1m">1m</option>
                            <option value="5m">5m</option>
                        </select>

                        {/* Additional Options */}
                        <div className="flex gap-1">
                            <button
                                onClick={() => setShowVolume(!showVolume)}
                                className={`px-3 py-1 rounded text-sm transition-all flex items-center gap-1 ${showVolume ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'}`}
                                title="Toggle Volume"
                            >
                                <Volume2 className="w-3 h-3" />
                                Vol
                            </button>
                            <button
                                onClick={() => setShowGrid(!showGrid)}
                                className={`px-3 py-1 rounded text-sm transition-all flex items-center gap-1 ${showGrid ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'}`}
                                title="Toggle Grid"
                            >
                                <Grid3X3 className="w-3 h-3" />
                                Grid
                            </button>
                            <button
                                onClick={() => setShowCrosshair(!showCrosshair)}
                                className={`px-3 py-1 rounded text-sm transition-all flex items-center gap-1 ${showCrosshair ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:text-white'}`}
                                title="Toggle Crosshair"
                            >
                                <Crosshair className="w-3 h-3" />
                                Cross
                            </button>
                        </div>
                    </div>

                    {/* Active Trades Summary */}
                    {activeTrades.length > 0 && (
                        <div className="text-right">
                            <div className={`text-sm font-medium ${currentPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                Total P&L: {currentPnL >= 0 ? '+' : ''}${currentPnL.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-400">
                                {activeTrades.length} active trade{activeTrades.length > 1 ? 's' : ''}
                            </div>
                        </div>
                    )}
                </div>

                {/* Enhanced Canvas */}
                <div className="relative w-full flex-1" style={{ height: 'calc(100% - 80px)' }}>
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full rounded-lg cursor-crosshair"
                    />
                    
                    {/* Price tooltip */}
                    {hoveredPrice && mousePosition && (
                        <div
                            className="absolute bg-gray-900/90 text-white px-2 py-1 rounded text-xs pointer-events-none z-10"
                            style={{
                                left: mousePosition.x + 10,
                                top: mousePosition.y - 25
                            }}
                        >
                            {hoveredPrice.toFixed(symbol.includes('JPY') ? 3 : symbol.includes('USD') && !symbol.includes('BTC') ? 5 : 2)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TradingChartV2;