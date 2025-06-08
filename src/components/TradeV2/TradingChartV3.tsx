"use client"
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    const [chartKey, setChartKey] = useState(0); // Force re-render key
    const chartRef = useRef<any>(null);

    // Ensure component is mounted on client side before rendering charts
    useEffect(() => {
        setIsMounted(true);
        return () => {
            // Cleanup chart instance on unmount
            if (chartRef.current && chartRef.current.chart) {
                try {
                    chartRef.current.chart.destroy();
                } catch (error) {
                    // Ignore cleanup errors
                }
            }
        };
    }, []);

    // Force chart re-render when changing types to avoid null reference errors
    useEffect(() => {
        setChartKey(prev => prev + 1);
    }, [chartType, symbol]);

    // Prepare candlestick data for ApexCharts
    const candlestickSeries = useMemo(() => {
        if (chartType !== 'candlestick' || candlestickData.length === 0) return [];

        const data = candlestickData.slice(-100).map(candle => ({
            x: new Date(candle.timestamp),
            y: [candle.open, candle.high, candle.low, candle.close]
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
            x: new Date(point.timestamp),
            y: point.price
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
                x: new Date(candle.timestamp),
                y: candle.volume
            }))
            : priceData.slice(-200).map(point => ({
                x: new Date(point.timestamp),
                y: point.volume
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

    // Helper function to check if series has valid data
    const hasValidSeriesData = (series: any[]) => {
        return series.length > 0 && series[0]?.data?.length > 0;
    };

    // ApexCharts options with error handling
    const chartOptions = useMemo(() => {
        const baseOptions = {
            chart: {
                id: `trading-chart-${chartKey}`, // Unique ID for each chart instance
                type: chartType === 'candlestick' ? 'candlestick' : chartType === 'area' ? 'area' : 'line',
                height: showVolume ? 350 : 450,
                background: 'transparent',
                toolbar: {
                    show: true,
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
                    type: 'x' as const,
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
                    beforeMount: function(chartContext: any, config: any) {
                        // Ensure chart is properly initialized
                        if (chartRef.current) {
                            chartRef.current.chart = chartContext;
                        }
                    },
                    mounted: function(chartContext: any, config: any) {
                        // Chart successfully mounted
                        if (chartRef.current) {
                            chartRef.current.chart = chartContext;
                        }
                    }
                }
            },
            theme: {
                mode: 'dark' as const
            },
            grid: {
                show: showGrid,
                borderColor: '#374151',
                strokeDashArray: 3,
                position: 'back' as const,
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
                type: 'datetime' as const,
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
                        if (typeof value !== 'number' || isNaN(value)) return '0';
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
                        if (typeof value !== 'number' || isNaN(value)) return '0';
                        const decimals = symbol.includes('JPY') ? 3 : 
                                       symbol.includes('USD') && !symbol.includes('BTC') ? 5 : 2;
                        return value.toFixed(decimals);
                    }
                }
            },
            legend: {
                show: false
            },
            stroke: {
                width: chartType === 'line' ? 3 : chartType === 'area' ? 2 : 1,
                curve: chartType === 'line' || chartType === 'area' ? 'smooth' : 'straight'
            },
            fill: {
                type: chartType === 'area' ? 'gradient' : 'solid',
                gradient: chartType === 'area' ? {
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
                } : undefined
            },
            colors: chartType === 'candlestick' ? ['#10b981', '#ef4444'] : ['#a855f7'],
            plotOptions: {
                line: {},
                area: {},
                bar: {},
                ...(chartType === 'candlestick' ? {
                    candlestick: {
                        colors: {
                            upward: '#10b981',
                            downward: '#ef4444'
                        },
                        wick: {
                            useFillColor: true
                        }
                    }
                } : {})
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

        return baseOptions;
    }, [chartType, showVolume, showGrid, symbol, activeTrades, currentPnL, chartKey]);

    // Volume chart options with error handling
    const volumeOptions = useMemo(() => ({
        chart: {
            id: `volume-chart-${chartKey}`, // Unique ID for volume chart
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
                    if (typeof value !== 'number' || isNaN(value)) return '0';
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
                    if (typeof value !== 'number' || isNaN(value)) return '0';
                    return value.toLocaleString();
                }
            }
        },
        colors: ['rgba(168, 85, 247, 0.4)']
    }), [chartKey]);

    const getTrendColor = () => {
        switch (marketTrend) {
            case 'bullish': return 'text-green-400';
            case 'bearish': return 'text-red-400';
            default: return 'text-yellow-400';
        }
    };

    // Safe chart type change handler
    const handleChartTypeChange = (newType: ChartType) => {
        // Destroy current chart instance before changing type
        if (chartRef.current && chartRef.current.chart) {
            try {
                chartRef.current.chart.destroy();
            } catch (error) {
                // Ignore destruction errors
            }
        }
        setChartType(newType);
    };

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
                                <Activity className="w-3 h-3" />
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
                        {isMounted && hasValidSeriesData(getCurrentSeries()) && (
                            <Chart
                                ref={chartRef}
                                key={`main-chart-${chartKey}`} // Force re-render with key
                                options={chartOptions}
                                series={getCurrentSeries()}
                                type={chartType === 'candlestick' ? 'candlestick' : chartType === 'area' ? 'area' : 'line'}
                                height={showVolume ? 350 : 450}
                            />
                        )}
                        {(!isMounted || !hasValidSeriesData(getCurrentSeries())) && (
                            <div className="flex items-center justify-center h-96 bg-gray-800/30 rounded-lg">
                                <div className="text-gray-400">
                                    {!isMounted ? 'Loading chart...' : 'No data available'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Volume Chart */}
                    {showVolume && (
                        <div className="border-t border-gray-700/50 pt-2">
                            {isMounted && hasValidSeriesData(volumeSeries) && (
                                <Chart
                                    key={`volume-chart-${chartKey}`} // Force re-render with key
                                    options={volumeOptions}
                                    series={volumeSeries}
                                    type="bar"
                                    height={100}
                                />
                            )}
                            {(!isMounted || !hasValidSeriesData(volumeSeries)) && (
                                <div className="flex items-center justify-center h-24 bg-gray-800/30 rounded-lg">
                                    <div className="text-gray-400 text-sm">
                                        {!isMounted ? 'Loading volume...' : 'No volume data'}
                                    </div>
                                </div>
                            )}
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