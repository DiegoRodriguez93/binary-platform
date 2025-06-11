"use client"
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { PriceDataV3 } from './TradeV3';

interface SymbolSelectorV3Props {
    selectedSymbol: string;
    onSymbolChange: (symbol: string) => void;
    currentPrice: number;
    marketTrend: 'bullish' | 'bearish' | 'sideways';
    priceData: PriceDataV3[];
}

interface Symbol {
    value: string;
    label: string;
    flag: string;
    category: 'forex' | 'stocks' | 'crypto' | 'commodities';
    description: string;
    spread: number;
    leverage: number;
    popularity: number;
}

const symbols: Symbol[] = [
    // Forex - Most Popular
    { value: 'EURUSD', label: 'EUR/USD', flag: '🇪🇺🇺🇸', category: 'forex', description: 'Euro vs US Dollar', spread: 0.8, leverage: 500, popularity: 10 },
    { value: 'GBPUSD', label: 'GBP/USD', flag: '🇬🇧🇺🇸', category: 'forex', description: 'British Pound vs US Dollar', spread: 1.2, leverage: 500, popularity: 9 },
    { value: 'USDJPY', label: 'USD/JPY', flag: '🇺🇸🇯🇵', category: 'forex', description: 'US Dollar vs Japanese Yen', spread: 0.9, leverage: 500, popularity: 8 },
    { value: 'AUDUSD', label: 'AUD/USD', flag: '🇦🇺🇺🇸', category: 'forex', description: 'Australian Dollar vs US Dollar', spread: 1.1, leverage: 500, popularity: 7 },
    { value: 'USDCAD', label: 'USD/CAD', flag: '🇺🇸🇨🇦', category: 'forex', description: 'US Dollar vs Canadian Dollar', spread: 1.3, leverage: 500, popularity: 6 },
    { value: 'EURGBP', label: 'EUR/GBP', flag: '🇪🇺🇬🇧', category: 'forex', description: 'Euro vs British Pound', spread: 1.5, leverage: 500, popularity: 5 },

    // Stocks - Tech Giants
    { value: 'AAPL', label: 'AAPL', flag: '🍎', category: 'stocks', description: 'Apple Inc.', spread: 0.02, leverage: 20, popularity: 10 },
    { value: 'GOOGL', label: 'GOOGL', flag: '🔍', category: 'stocks', description: 'Alphabet Inc.', spread: 0.05, leverage: 20, popularity: 9 },
    { value: 'MSFT', label: 'MSFT', flag: '🪟', category: 'stocks', description: 'Microsoft Corporation', spread: 0.03, leverage: 20, popularity: 8 },
    { value: 'TSLA', label: 'TSLA', flag: '🚗', category: 'stocks', description: 'Tesla Inc.', spread: 0.08, leverage: 10, popularity: 9 },
    { value: 'NVDA', label: 'NVDA', flag: '🎮', category: 'stocks', description: 'NVIDIA Corporation', spread: 0.12, leverage: 10, popularity: 8 },
    { value: 'AMZN', label: 'AMZN', flag: '📦', category: 'stocks', description: 'Amazon.com Inc.', spread: 0.06, leverage: 20, popularity: 7 },

    // Crypto - Major Coins
    { value: 'BTCUSD', label: 'BTC/USD', flag: '₿', category: 'crypto', description: 'Bitcoin vs US Dollar', spread: 15.0, leverage: 100, popularity: 10 },
    { value: 'ETHUSD', label: 'ETH/USD', flag: '⟠', category: 'crypto', description: 'Ethereum vs US Dollar', spread: 2.5, leverage: 100, popularity: 9 },
    { value: 'ADAUSD', label: 'ADA/USD', flag: '🔷', category: 'crypto', description: 'Cardano vs US Dollar', spread: 0.002, leverage: 50, popularity: 6 },
    { value: 'SOLUSD', label: 'SOL/USD', flag: '☀️', category: 'crypto', description: 'Solana vs US Dollar', spread: 0.15, leverage: 50, popularity: 7 },
    { value: 'DOTUSD', label: 'DOT/USD', flag: '🔴', category: 'crypto', description: 'Polkadot vs US Dollar', spread: 0.08, leverage: 50, popularity: 5 },

    // Commodities - Precious Metals & Energy
    { value: 'XAUUSD', label: 'XAU/USD', flag: '🥇', category: 'commodities', description: 'Gold vs US Dollar', spread: 0.35, leverage: 100, popularity: 9 },
    { value: 'XAGUSD', label: 'XAG/USD', flag: '🥈', category: 'commodities', description: 'Silver vs US Dollar', spread: 0.03, leverage: 100, popularity: 7 },
    { value: 'WTIUSD', label: 'WTI/USD', flag: '🛢️', category: 'commodities', description: 'West Texas Intermediate Oil', spread: 0.05, leverage: 100, popularity: 8 },
    { value: 'BRENTUSD', label: 'Brent/USD', flag: '⚫', category: 'commodities', description: 'Brent Crude Oil', spread: 0.05, leverage: 100, popularity: 7 },
    { value: 'GASUSD', label: 'Gas/USD', flag: '⛽', category: 'commodities', description: 'Natural Gas', spread: 0.02, leverage: 100, popularity: 6 },
];

const categoryLabels = {
    forex: 'Forex',
    stocks: 'Stocks',
    crypto: 'Crypto',
    commodities: 'Commodities'
};

const categoryIcons = {
    forex: '💱',
    stocks: '📈',
    crypto: '🪙',
    commodities: '🏭'
};

const DropdownContent = React.memo(({
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredSymbols,
    groupedSymbols,
    selectedSymbol,
    handleSymbolSelect
}: {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    selectedCategory: string;
    setSelectedCategory: (value: string) => void;
    filteredSymbols: Symbol[];
    groupedSymbols: Record<string, Symbol[]>;
    selectedSymbol: string;
    handleSymbolSelect: (symbol: string) => void;
}) => (
    <div>
        <div className="p-4 border-b border-gray-700">
            <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search symbols..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    autoFocus
                />
            </div>

            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${selectedCategory === 'all'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    All
                </button>
                {Object.entries(categoryLabels).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${selectedCategory === key
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        <span>{categoryIcons[key as keyof typeof categoryIcons]}</span>
                        {label}
                    </button>
                ))}
            </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
            {Object.entries(groupedSymbols).map(([category, categorySymbols]) => (
                <div key={category}>
                    {selectedCategory === 'all' && (
                        <div className="px-4 py-2 bg-gray-800/50 text-gray-400 text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
                            <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                            {categoryLabels[category as keyof typeof categoryLabels]}
                        </div>
                    )}
                    {categorySymbols
                        .sort((a, b) => b.popularity - a.popularity) // Sort by popularity
                        .map((symbol) => (
                        <button
                            key={symbol.value}
                            onClick={() => handleSymbolSelect(symbol.value)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-3 ${selectedSymbol === symbol.value ? 'bg-purple-500/20 border-r-2 border-purple-500' : ''
                                }`}
                        >
                            <span className="text-xl">{symbol.flag}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">{symbol.label}</span>
                                    {symbol.popularity >= 8 && (
                                        <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                                            <Zap className="w-2 h-2" />
                                            Hot
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-400">{symbol.description}</div>
                            </div>
                            <div className="text-right text-xs">
                                <div className="text-gray-400">Spread: {symbol.spread}</div>
                                <div className="text-gray-500">1:{symbol.leverage}</div>
                            </div>
                        </button>
                    ))}
                </div>
            ))}

            {filteredSymbols.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400">
                    <div className="text-2xl mb-2">🔍</div>
                    <div>No symbols found</div>
                    <div className="text-sm">Try adjusting your search or filters</div>
                </div>
            )}
        </div>
    </div>
));

const SymbolSelectorV3: React.FC<SymbolSelectorV3Props> = React.memo(({
    selectedSymbol,
    onSymbolChange,
    currentPrice,
    marketTrend,
    priceData
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const selectedSymbolData = useMemo(() =>
        symbols.find(s => s.value === selectedSymbol),
        [selectedSymbol]
    );

    // Calculate 24h change from price data
    const priceChange = useMemo(() => {
        if (priceData.length < 2) return { change: 0, percentage: 0 };
        
        const oldPrice = priceData[0].price;
        const change = currentPrice - oldPrice;
        const percentage = (change / oldPrice) * 100;
        
        return { change, percentage };
    }, [priceData, currentPrice]);

    const updateDropdownPosition = useCallback(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    }, []);

    const handleToggleDropdown = useCallback(() => {
        if (!isOpen) {
            updateDropdownPosition();
        }
        setIsOpen(!isOpen);
    }, [isOpen, updateDropdownPosition]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        const handleClickOutside = () => {
            setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            const timer = setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 100);

            return () => {
                document.removeEventListener('keydown', handleEscape);
                document.removeEventListener('click', handleClickOutside);
                clearTimeout(timer);
            };
        }
    }, [isOpen]);

    const filteredSymbols = useMemo(() => symbols.filter(symbol => {
        const matchesCategory = selectedCategory === 'all' || symbol.category === selectedCategory;
        const matchesSearch = symbol.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            symbol.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    }), [selectedCategory, searchTerm]);

    const groupedSymbols = useMemo(() => filteredSymbols.reduce((acc, symbol) => {
        if (!acc[symbol.category]) {
            acc[symbol.category] = [];
        }
        acc[symbol.category].push(symbol);
        return acc;
    }, {} as Record<string, Symbol[]>), [filteredSymbols]);

    const handleSymbolSelect = useCallback((symbolValue: string) => {
        onSymbolChange(symbolValue);
        setIsOpen(false);
        setSearchTerm('');
        setSelectedCategory('all');
    }, [onSymbolChange]);

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setSelectedCategory('all');
        }
    }, [isOpen]);

    const getTrendIcon = () => {
        switch (marketTrend) {
            case 'bullish':
                return <TrendingUp className="w-5 h-5 text-green-400" />;
            case 'bearish':
                return <TrendingDown className="w-5 h-5 text-red-400" />;
            default:
                return <Activity className="w-5 h-5 text-yellow-400" />;
        }
    };

    const getTrendColor = () => {
        switch (marketTrend) {
            case 'bullish':
                return 'text-green-400';
            case 'bearish':
                return 'text-red-400';
            default:
                return 'text-yellow-400';
        }
    };

    return (
        <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Symbol Selector */}
                <div className="relative min-w-[380px]">
                    <button
                        ref={buttonRef}
                        onClick={handleToggleDropdown}
                        className="w-full appearance-none bg-primary-600/20 text-white border border-primary-500/30 rounded-xl px-6 py-4 pr-12 text-lg font-semibold hover:bg-primary-500/30 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-between"
                    >
                        <span className="flex items-center gap-4">
                            <span className="text-3xl">{selectedSymbolData?.flag}</span>
                            <div className="text-left">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-xl">{selectedSymbolData?.label}</span>
                                    {selectedSymbolData?.popularity && selectedSymbolData.popularity >= 8 && (
                                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                                            <Zap className="w-2 h-2" />
                                            Hot
                                        </span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-400 font-normal">{selectedSymbolData?.description}</div>
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                                    <span>Spread: {selectedSymbolData?.spread}</span>
                                    <span>Leverage: 1:{selectedSymbolData?.leverage}</span>
                                </div>
                            </div>
                        </span>
                        <ChevronDown className={`w-6 h-6 text-primary-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && typeof window !== 'undefined' && createPortal(
                        <>
                            <div
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                                style={{ zIndex: 999998 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                }}
                            />
                            <div
                                className="fixed bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl max-h-96 overflow-hidden"
                                style={{
                                    top: dropdownPosition.top,
                                    left: dropdownPosition.left,
                                    width: Math.max(dropdownPosition.width, 380),
                                    zIndex: 999999
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <DropdownContent
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                    selectedCategory={selectedCategory}
                                    setSelectedCategory={setSelectedCategory}
                                    filteredSymbols={filteredSymbols}
                                    groupedSymbols={groupedSymbols}
                                    selectedSymbol={selectedSymbol}
                                    handleSymbolSelect={handleSymbolSelect}
                                />
                            </div>
                        </>,
                        document.body
                    )}
                </div>

                {/* Price Information */}
                <div className="flex items-center gap-8">
                    <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">Current Price</div>
                        <div className="text-3xl font-bold text-white">
                            {selectedSymbolData?.category === 'stocks' || selectedSymbolData?.category === 'crypto'
                                ? `$${currentPrice.toFixed(2)}`
                                : currentPrice.toFixed(5)
                            }
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">24h Change</div>
                        <div className={`text-lg font-semibold ${priceChange.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {priceChange.change >= 0 ? '+' : ''}{priceChange.change.toFixed(selectedSymbolData?.category === 'forex' ? 5 : 2)}
                            <span className="text-sm ml-1">
                                ({priceChange.percentage >= 0 ? '+' : ''}{priceChange.percentage.toFixed(2)}%)
                            </span>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">Market Trend</div>
                        <div className={`flex items-center justify-center gap-2 ${getTrendColor()}`}>
                            {getTrendIcon()}
                            <span className="font-semibold capitalize">{marketTrend}</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">Bid/Ask</div>
                        <div className="text-sm">
                            <div className="text-red-400">
                                Bid: {(currentPrice - (currentPrice * selectedSymbolData?.spread! / 10000)).toFixed(selectedSymbolData?.category === 'forex' ? 5 : 2)}
                            </div>
                            <div className="text-green-400">
                                Ask: {(currentPrice + (currentPrice * selectedSymbolData?.spread! / 10000)).toFixed(selectedSymbolData?.category === 'forex' ? 5 : 2)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

SymbolSelectorV3.displayName = 'SymbolSelectorV3';

export default SymbolSelectorV3;