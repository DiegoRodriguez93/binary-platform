"use client"
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3, TrendingUp, Activity, Grid3X3, ZoomIn, Settings, Maximize2 } from 'lucide-react';
import { PriceDataV2, CandlestickDataV2, ActiveTradeV2 } from './TradeV2';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface TradingChartV3Props {
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

const TradingChartV3: React.FC<TradingChartV3Props> = ({
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
    const [chartType, setChartType] = useState<ChartType>('candlestick');
    const [showVolume, setShowVolume] = useState(true);
    const [showGrid, setShowGrid] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [chartKey, setChartKey] = useState(0);
    const chartRef = useRef<any>(null);
    const [isChangingType, setIsChangingType] = useState(false);

    // Ensure component is mounted on client side before rendering charts
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Handle chart type change with proper cleanup
    const handleChartTypeChange = useCallback((newType: ChartType) => {
        if (newType === chartType) return;
        
        setIsChangingType(true);
        
        // Destroy existing chart if it exists
        if (chartRef.current?.chart) {
            try {
                chartRef.current.chart.destroy();
            } catch (error) {
                console.warn('Chart destruction warning:', error);
            }
            chartRef.current = null;
        }
        
        // Small delay to ensure cleanup is complete
        setTimeout(() => {
            setChartType(newType);
            setChartKey(prev => prev + 1);
            setIsChangingType(false);
        }, 100);
    }, [chartType]);

    // Prepare candlestick data for ApexCharts
    const candlestickSeries = useMemo(() => {
        if (chartType !== 'candlestick' || candlestickData.length === 0) return [];

        const data = candlestickData.slice(-100).map(candle => ({
            x: candle.timestamp,
            y: [
                Number(candle.open.toFixed(8)),
                Number(candle.high.toFixed(8)),
                Number(candle.low.toFixed(8)),
                Number(candle.close.toFixed(8))
            ]
        }));

        return [{
            name: 'Price',
            data: data
        }];
    }, [candlestickData, chartType]);

    // Prepare line/area data for ApexCharts
    const lineSeries = useMemo(() => {
        if (chartType === 'candlestick' || priceData.length === 0) return [];

        const data = priceData.slice(-200).map(point => ({
            x: point.timestamp,
            y: Number(point.price.toFixed(8))
        }));

        return [{
            name: 'Price',
            data: data
        }];
    }, [priceData, chartType]);

    // Prepare volume data
    const volumeSeries = useMemo(() => {
        if (!showVolume) return [];

        const data = chartType === 'candlestick' 
            ? candlestickData.slice(-100).map(candle => ({
                x: candle.timestamp,
                y: Math.round(candle.volume)
            }))
            : priceData.slice(-200).map(point => ({
                x: point.timestamp,
                y: Math.round(point.volume)
            }));

        return [{
            name: 'Volume',
            data: data
        }];
    }, [candlestickData, priceData, showVolume, chartType]);

    // Get current series based on chart type
    const getCurrentSeries = () => {
        if (chartType === 'candlestick') {
            return candlestickSeries;
        } else {
            return lineSeries;
        }
    };

    // Get chart type for ApexCharts
    const getApexChartType = () => {
        switch (chartType) {
            case 'candlestick': return 'candlestick';
            case 'area': return 'area';
            case 'line': return 'line';
            default: return 'line';
        }
    };

    // ApexCharts options
    const chartOptions = useMemo(() => {
        const baseOptions: any = {
            chart: {
                id: `trading-chart-${chartKey}-${chartType}`,
                type: getApexChartType(),
                height: showVolume ? 350 : 450,
                background: 'transparent',
                fontFamily: 'Inter, sans-serif',
                toolbar: {
                    show: true,
                    offsetX: 0,
                    offsetY: 0,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    },
                    autoSelected: 'zoom'
                },
                zoom: {
                    enabled: true,
                    type: 'x',
                    autoScaleYaxis: true,
                    zoomedArea: {
                        fill: {
                            color: '#a855f7',
                            opacity: 0.4
                        },
                        stroke: {
                            color: '#a855f7',
                            opacity: 0.8,
                            width: 1
                        }
                    }
                },
                selection: {
                    enabled: true,
                    type: 'x',
                    fill: {
                        color: '#a855f7',
                        opacity: 0.1
                    },
                    stroke: {
                        width: 1,
                        dashArray: 3,
                        color: '#a855f7',
                        opacity: 0.4
                    }
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 300,
                    animateGradually: {
                        enabled: true,
                        delay: 50
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 200
                    }
                },
                events: {
                    mounted: (chart: any) => {
                        chartRef.current = { chart };
                    },
                    beforeMount: () => {
                        // Clear any existing references
                        if (chartRef.current?.chart) {
                            try {
                                chartRef.current.chart.destroy();
                            } catch (e) {
                                // Ignore errors
                            }
                        }
                    }
                }
            },
            theme: {
                mode: 'dark'
            },
            grid: {
                show: showGrid,
                borderColor: '#374151',
                strokeDashArray: 3,
                position: 'back',
                xaxis: {
                    lines: {
                        show: true
                    }
                },
                yaxis: {
                    lines: {
                        show: true
                    }
                }
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    style: {
                        colors: '#9ca3af',
                        fontSize: '10px'
                    },
                    datetimeFormatter: {
                        year: 'yyyy',
                        month: 'MMM \'yy',
                        day: 'dd MMM',
                        hour: 'HH:mm',
                        minute: 'HH:mm:ss',
                        second: 'HH:mm:ss'
                    }
                },
                axisBorder: {
                    show: true,
                    color: '#374151'
                },
                axisTicks: {
                    show: true,
                    color: '#374151'
                }
            },
            yaxis: {
                tooltip: {
                    enabled: true
                },
                labels: {
                    style: {
                        colors: '#9ca3af',
                        fontSize: '10px'
                    },
                    formatter: (value: number) => {
                        if (value === null || value === undefined || isNaN(value)) return '';
                        const decimals = symbol.includes('JPY') ? 3 : 
                                       symbol.includes('USD') && !symbol.includes('BTC') ? 5 : 2;
                        return value.toFixed(decimals);
                    }
                },
                axisBorder: {
                    show: true,
                    color: '#374151'
                }
            },
            tooltip: {
                enabled: true,
                theme: 'dark',
                style: {
                    fontSize: '12px'
                },
                x: {
                    format: 'HH:mm:ss'
                },
                y: {
                    formatter: (value: number) => {
                        if (value === null || value === undefined || isNaN(value)) return '';
                        const decimals = symbol.includes('JPY') ? 3 : 
                                       symbol.includes('USD') && !symbol.includes('BTC') ? 5 : 2;
                        return value.toFixed(decimals);
                    }
                }
            },
            legend: {
                show: false
            },
            dataLabels: {
                enabled: false
            },
            annotations: {
                yaxis: activeTrades.map(trade => ({
                    y: trade.entryPrice,
                    borderColor: currentPnL >= 0 ? '#10b981' : '#ef4444',
                    borderWidth: 2,
                    strokeDashArray: 8,
                    label: {
                        text: `${trade.direction.toUpperCase()}: ${trade.entryPrice.toFixed(5)}`,
                        style: {
                            color: '#ffffff',
                            background: currentPnL >= 0 ? '#10b981' : '#ef4444',
                            fontSize: '10px',
                            fontWeight: 'bold'
                        },
                        position: 'right'
                    }
                }))
            }
        };

        // Chart type specific options
        if (chartType === 'candlestick') {
            baseOptions.plotOptions = {
                candlestick: {
                    colors: {
                        upward: '#10b981',
                        downward: '#ef4444'
                    },
                    wick: {
                        useFillColor: true
                    }
                }
            };
            baseOptions.colors = ['#10b981', '#ef4444'];
        } else if (chartType === 'area') {
            baseOptions.fill = {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.1,
                    stops: [0, 100],
                    colorStops: [
                        {
                            offset: 0,
                            color: '#a855f7',
                            opacity: 0.7
                        },
                        {
                            offset: 100,
                            color: '#a855f7',
                            opacity: 0.1
                        }
                    ]
                }
            };
            baseOptions.stroke = {
                width: 2,
                curve: 'smooth'
            };
            baseOptions.colors = ['#a855f7'];
        } else if (chartType === 'line') {
            baseOptions.stroke = {
                width: 3,
                curve: 'smooth'
            };
            baseOptions.colors = ['#a855f7'];
            baseOptions.fill = {
                type: 'solid'
            };
        }

        return baseOptions;
    }, [chartType, showVolume, showGrid, symbol, activeTrades, currentPnL, chartKey]);

    // Volume chart options
    const volumeOptions = useMemo(() => ({
        chart: {
            id: `volume-chart-${chartKey}-${chartType}`,
            type: 'bar' as const,
            height: 100,
            background: 'transparent',
            toolbar: {
                show: false
            },
            brush: {
                enabled: false
            }
        },
        theme: {
            mode: 'dark' as const
        },
        plotOptions: {
            bar: {
                columnWidth: '80%',
                colors: {
                    ranges: [{
                        from: 0,
                        to: Number.MAX_VALUE,
                        color: '#a855f7'
                    }]
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            type: 'datetime' as const,
            labels: {
                show: false
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '9px'
                },
                formatter: (value: number) => {
                    if (value === null || value === undefined || isNaN(value)) return '';
                    if (value >= 1000) {
                        return (value / 1000).toFixed(1) + 'K';
                    }
                    return value.toFixed(0);
                }
            },
            axisBorder: {
                show: false
            }
        },
        grid: {
            show: false
        },
        tooltip: {
            enabled: true,
            theme: 'dark',
            y: {
                formatter: (value: number) => {
                    if (value === null || value === undefined || isNaN(value)) return '';
                    return value.toLocaleString();
                }
            }
        },
        colors: ['rgba(168, 85, 247, 0.3)']
    }), [chartKey, chartType]);

    const getTrendColor = () => {
        switch (marketTrend) {
            case 'bullish': return 'text-green-400';
            case 'bearish': return 'text-red-400';
            default: return 'text-yellow-400';
        }
    };

    // Don't render charts while changing type
    if (isChangingType || !isMounted) {
        return (
            <div className="w-full h-full">
                <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-4 lg:p-6 h-full">
                    <div className="flex items-center justify-center h-96 bg-gray-800/30 rounded-lg">
                        <div className="text-gray-400">Loading chart...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-4 lg:p-6 h-full">
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
                        <div className="text-sm text-gray-400">Professional trading charts with zoom and analysis tools</div>
                    </div>

                    {/* Enhanced Controls */}
                    <div className="flex flex-wrap gap-2 text-sm">
                        {/* Chart Type */}
                        <div className="flex bg-gray-800/50 rounded-lg p-1">
                            <button
                                onClick={() => handleChartTypeChange('line')}
                                disabled={isChangingType}
                                className={`px-3 py-1 rounded transition-all disabled:opacity-50 ${chartType === 'line' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Line Chart"
                            >
                                <TrendingUp className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleChartTypeChange('candlestick')}
                                disabled={isChangingType}
                                className={`px-3 py-1 rounded transition-all disabled:opacity-50 ${chartType === 'candlestick' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
                                title="Candlestick Chart"
                            >
                                <BarChart3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleChartTypeChange('area')}
                                disabled={isChangingType}
                                className={`px-3 py-1 rounded transition-all disabled:opacity-50 ${chartType === 'area' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}
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
                                <BarChart3 className="w-3 h-3" />
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

                {/* ApexCharts Container */}
                <div className="relative w-full">
                    {/* Main Price Chart */}
                    <div className="mb-2">
                        <Chart
                            key={`main-chart-${chartKey}-${chartType}`}
                            options={chartOptions}
                            series={getCurrentSeries()}
                            type={getApexChartType()}
                            height={showVolume ? 350 : 450}
                        />
                    </div>

                    {/* Volume Chart */}
                    {showVolume && (
                        <div className="border-t border-gray-700/50 pt-2">
                            <Chart
                                key={`volume-chart-${chartKey}-${chartType}`}
                                options={volumeOptions}
                                series={volumeSeries}
                                type="bar"
                                height={100}
                            />
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

                    {/* Zoom Instructions */}
                    <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <ZoomIn className="w-3 h-3" />
                            <span>Click and drag to zoom • Double-click to reset</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradingChartV3;