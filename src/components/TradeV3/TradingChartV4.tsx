"use client"
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, IChartApi, ISeriesApi, LineStyle, CrosshairMode, PriceScaleMode } from 'lightweight-charts';
import { BarChart3, TrendingUp, Activity, Grid3X3, ZoomIn, Settings, Maximize2, Volume2, Target } from 'lucide-react';
import { PriceDataV3, CandlestickDataV3, ActiveTradeV3 } from './TradeV3';

interface TradingChartV4Props {
    priceData: PriceDataV3[];
    candlestickData: CandlestickDataV3[];
    currentPrice: number;
    symbol: string;
    activeTrades: ActiveTradeV3[];
    currentPnL: number;
    timeFrame: '1s' | '5s' | '30s' | '1m' | '5m';
    onTimeFrameChange: (timeFrame: '1s' | '5s' | '30s' | '1m' | '5m') => void;
    marketTrend: 'bullish' | 'bearish' | 'sideways';
}

type ChartType = 'line' | 'candlestick' | 'area';

const TradingChartV4: React.FC<TradingChartV4Props> = ({
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
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
    const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
    
    const [chartType, setChartType] = useState<ChartType>('candlestick');
    const [showVolume, setShowVolume] = useState(true);
    const [showGrid, setShowGrid] = useState(true);
    const [isChartReady, setIsChartReady] = useState(false);

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Create chart with professional trading configuration
        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: showVolume ? 500 : 600,
            layout: {
                background: { color: 'transparent' },
                textColor: '#9ca3af',
                fontSize: 12,
                fontFamily: 'Inter, system-ui, sans-serif',
            },
            grid: {
                vertLines: { 
                    color: showGrid ? '#374151' : 'transparent',
                    style: LineStyle.Dotted,
                    visible: showGrid
                },
                horzLines: { 
                    color: showGrid ? '#374151' : 'transparent',
                    style: LineStyle.Dotted,
                    visible: showGrid
                },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    color: '#a855f7',
                    width: 1,
                    style: LineStyle.Dashed,
                    labelBackgroundColor: '#a855f7',
                },
                horzLine: {
                    color: '#a855f7',
                    width: 1,
                    style: LineStyle.Dashed,
                    labelBackgroundColor: '#a855f7',
                },
            },
            rightPriceScale: {
                borderColor: '#374151',
                textColor: '#9ca3af',
                scaleMargins: {
                    top: 0.1,
                    bottom: showVolume ? 0.3 : 0.1,
                },
                mode: PriceScaleMode.Normal,
            },
            timeScale: {
                borderColor: '#374151',
                textColor: '#9ca3af',
                timeVisible: true,
                secondsVisible: timeFrame === '1s' || timeFrame === '5s',
                tickMarkFormatter: (time: any) => {
                    const date = new Date(time * 1000);
                    if (timeFrame === '1s' || timeFrame === '5s') {
                        return date.toLocaleTimeString('en-US', {
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        });
                    } else {
                        return date.toLocaleTimeString('en-US', {
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                },
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
        });

        chartRef.current = chart;

        // Create volume series if enabled
        if (showVolume) {
            const volumeSeries = chart.addHistogramSeries({
                color: 'rgba(168, 85, 247, 0.4)',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: 'volume',
                scaleMargins: {
                    top: 0.8,
                    bottom: 0,
                },
            });
            volumeSeriesRef.current = volumeSeries;

            // Configure volume price scale
            chart.priceScale('volume').applyOptions({
                scaleMargins: {
                    top: 0.8,
                    bottom: 0,
                },
            });
        }

        setIsChartReady(true);

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chart) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: showVolume ? 500 : 600,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chart) {
                chart.remove();
            }
            chartRef.current = null;
            candlestickSeriesRef.current = null;
            lineSeriesRef.current = null;
            areaSeriesRef.current = null;
            volumeSeriesRef.current = null;
            setIsChartReady(false);
        };
    }, [showVolume, showGrid, timeFrame]);

    // Update chart type and series
    useEffect(() => {
        if (!chartRef.current || !isChartReady) return;

        // Remove existing price series
        if (candlestickSeriesRef.current) {
            chartRef.current.removeSeries(candlestickSeriesRef.current);
            candlestickSeriesRef.current = null;
        }
        if (lineSeriesRef.current) {
            chartRef.current.removeSeries(lineSeriesRef.current);
            lineSeriesRef.current = null;
        }
        if (areaSeriesRef.current) {
            chartRef.current.removeSeries(areaSeriesRef.current);
            areaSeriesRef.current = null;
        }

        // Create new series based on chart type
        if (chartType === 'candlestick') {
            const candlestickSeries = chartRef.current.addCandlestickSeries({
                upColor: '#10b981',
                downColor: '#ef4444',
                borderUpColor: '#10b981',
                borderDownColor: '#ef4444',
                wickUpColor: '#10b981',
                wickDownColor: '#ef4444',
                priceFormat: {
                    type: 'price',
                    precision: symbol.includes('JPY') ? 3 : symbol.includes('USD') && !symbol.includes('BTC') ? 5 : 2,
                    minMove: symbol.includes('JPY') ? 0.001 : symbol.includes('USD') && !symbol.includes('BTC') ? 0.00001 : 0.01,
                },
            });
            candlestickSeriesRef.current = candlestickSeries;
        } else if (chartType === 'line') {
            const lineSeries = chartRef.current.addLineSeries({
                color: '#a855f7',
                lineWidth: 3,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                crosshairMarkerBorderColor: '#a855f7',
                crosshairMarkerBackgroundColor: '#a855f7',
                lastValueVisible: true,
                priceLineVisible: true,
                priceFormat: {
                    type: 'price',
                    precision: symbol.includes('JPY') ? 3 : symbol.includes('USD') && !symbol.includes('BTC') ? 5 : 2,
                    minMove: symbol.includes('JPY') ? 0.001 : symbol.includes('USD') && !symbol.includes('BTC') ? 0.00001 : 0.01,
                },
            });
            lineSeriesRef.current = lineSeries;
        } else if (chartType === 'area') {
            const areaSeries = chartRef.current.addAreaSeries({
                topColor: 'rgba(168, 85, 247, 0.6)',
                bottomColor: 'rgba(168, 85, 247, 0.05)',
                lineColor: '#a855f7',
                lineWidth: 3,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                crosshairMarkerBorderColor: '#a855f7',
                crosshairMarkerBackgroundColor: '#a855f7',
                lastValueVisible: true,
                priceLineVisible: true,
                priceFormat: {
                    type: 'price',
                    precision: symbol.includes('JPY') ? 3 : symbol.includes('USD') && !symbol.includes('BTC') ? 5 : 2,
                    minMove: symbol.includes('JPY') ? 0.001 : symbol.includes('USD') && !symbol.includes('BTC') ? 0.00001 : 0.01,
                },
            });
            areaSeriesRef.current = areaSeries;
        }
    }, [chartType, isChartReady, symbol]);

    // Convert data for lightweight-charts format
    const convertedCandlestickData = useMemo(() => {
        return candlestickData.map(candle => ({
            time: Math.floor(candle.timestamp / 1000) as any,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
        }));
    }, [candlestickData]);

    const convertedLineData = useMemo(() => {
        return priceData.map(point => ({
            time: Math.floor(point.timestamp / 1000) as any,
            value: point.price,
        }));
    }, [priceData]);

    const convertedVolumeData = useMemo(() => {
        const sourceData = chartType === 'candlestick' ? candlestickData : priceData;
        return sourceData.map(point => ({
            time: Math.floor(point.timestamp / 1000) as any,
            value: point.volume,
            color: chartType === 'candlestick' && 'close' in point && 'open' in point
                ? point.close >= point.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
                : 'rgba(168, 85, 247, 0.4)',
        }));
    }, [candlestickData, priceData, chartType]);

    // Update chart data
    useEffect(() => {
        if (!isChartReady) return;

        if (chartType === 'candlestick' && candlestickSeriesRef.current && convertedCandlestickData.length > 0) {
            candlestickSeriesRef.current.setData(convertedCandlestickData);
        } else if ((chartType === 'line' || chartType === 'area') && convertedLineData.length > 0) {
            const series = chartType === 'line' ? lineSeriesRef.current : areaSeriesRef.current;
            if (series) {
                series.setData(convertedLineData);
            }
        }

        if (showVolume && volumeSeriesRef.current && convertedVolumeData.length > 0) {
            volumeSeriesRef.current.setData(convertedVolumeData);
        }
    }, [convertedCandlestickData, convertedLineData, convertedVolumeData, chartType, showVolume, isChartReady]);

    // Add trade lines
    useEffect(() => {
        if (!chartRef.current || !isChartReady) return;

        // Remove existing trade lines
        chartRef.current.removePriceLine;

        // Add trade entry lines
        activeTrades.forEach(trade => {
            const series = chartType === 'candlestick' ? candlestickSeriesRef.current :
                          chartType === 'line' ? lineSeriesRef.current : areaSeriesRef.current;
            
            if (series) {
                series.createPriceLine({
                    price: trade.entryPrice,
                    color: currentPnL >= 0 ? '#10b981' : '#ef4444',
                    lineWidth: 2,
                    lineStyle: LineStyle.Dashed,
                    axisLabelVisible: true,
                    title: `${trade.direction.toUpperCase()}: $${trade.amount}`,
                });
            }
        });
    }, [activeTrades, currentPnL, chartType, isChartReady]);

    const getTrendColor = () => {
        switch (marketTrend) {
            case 'bullish': return 'text-green-400';
            case 'bearish': return 'text-red-400';
            default: return 'text-yellow-400';
        }
    };

    const handleChartTypeChange = (newType: ChartType) => {
        setChartType(newType);
    };

    return (
        <div className="w-full">
            <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-4 lg:p-6">
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
                        <div className="text-sm text-gray-400">Professional TradingView-powered charts with advanced analysis</div>
                    </div>

                    {/* Enhanced Controls */}
                    <div className="flex flex-wrap gap-2 text-sm">
                        {/* Chart Type */}
                        <div className="flex bg-gray-800/50 rounded-lg p-1">
                            <button
                                onClick={() => handleChartTypeChange('line')}
                                className={`px-3 py-1 rounded transition-all ${chartType === 'line' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Line Chart"
                            >
                                <TrendingUp className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleChartTypeChange('candlestick')}
                                className={`px-3 py-1 rounded transition-all ${chartType === 'candlestick' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Candlestick Chart"
                            >
                                <BarChart3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleChartTypeChange('area')}
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

                {/* Lightweight Charts Container */}
                <div className="relative w-full">
                    <div 
                        ref={chartContainerRef} 
                        className="w-full rounded-lg overflow-hidden"
                        style={{ height: showVolume ? '500px' : '600px' }}
                    />
                    
                    {!isChartReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/30 rounded-lg">
                            <div className="text-gray-400">Loading professional chart...</div>
                        </div>
                    )}

                    {/* Current Price Indicator */}
                    <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">Current Price</div>
                        <div className={`text-lg font-bold ${getTrendColor()}`}>
                            {symbol.includes('JPY') ? currentPrice.toFixed(3) : 
                             symbol.includes('USD') && !symbol.includes('BTC') ? currentPrice.toFixed(5) : 
                             currentPrice.toFixed(2)}
                        </div>
                    </div>

                    {/* Chart Instructions */}
                    <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <ZoomIn className="w-3 h-3" />
                            <span>Scroll to zoom • Drag to pan • Double-click to fit</span>
                        </div>
                    </div>

                    {/* Trade Entry Indicators */}
                    {activeTrades.length > 0 && (
                        <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700">
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                                <Target className="w-3 h-3" />
                                <span>Active Trades</span>
                            </div>
                            {activeTrades.slice(0, 3).map((trade, index) => (
                                <div key={trade.id} className="flex items-center gap-2 text-xs">
                                    <div className={`w-2 h-2 rounded-full ${trade.direction === 'higher' ? 'bg-green-400' : 'bg-red-400'}`} />
                                    <span className="text-white">${trade.amount}</span>
                                    <span className="text-gray-400">@{trade.entryPrice.toFixed(symbol.includes('JPY') ? 3 : 5)}</span>
                                </div>
                            ))}
                            {activeTrades.length > 3 && (
                                <div className="text-xs text-gray-400 mt-1">+{activeTrades.length - 3} more</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TradingChartV4;