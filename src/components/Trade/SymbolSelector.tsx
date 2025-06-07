"use client"
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';

interface SymbolSelectorProps {
    selectedSymbol: string;
    onSymbolChange: (symbol: string) => void;
    currentPrice: number;
}

interface Symbol {
    value: string;
    label: string;
    flag: string;
    category: 'forex' | 'stocks' | 'crypto' | 'commodities';
    description: string;
}

const symbols: Symbol[] = [
    // Forex
    { value: 'EURUSD', label: 'EUR/USD', flag: '🇪🇺🇺🇸', category: 'forex', description: 'Euro vs US Dollar' },
    { value: 'GBPUSD', label: 'GBP/USD', flag: '🇬🇧🇺🇸', category: 'forex', description: 'British Pound vs US Dollar' },
    { value: 'USDJPY', label: 'USD/JPY', flag: '🇺🇸🇯🇵', category: 'forex', description: 'US Dollar vs Japanese Yen' },
    { value: 'AUDUSD', label: 'AUD/USD', flag: '🇦🇺🇺🇸', category: 'forex', description: 'Australian Dollar vs US Dollar' },
    { value: 'USDCAD', label: 'USD/CAD', flag: '🇺🇸🇨🇦', category: 'forex', description: 'US Dollar vs Canadian Dollar' },
    { value: 'EURGBP', label: 'EUR/GBP', flag: '🇪🇺🇬🇧', category: 'forex', description: 'Euro vs British Pound' },

    // Stocks
    { value: 'AAPL', label: 'AAPL', flag: '🍎', category: 'stocks', description: 'Apple Inc.' },
    { value: 'GOOGL', label: 'GOOGL', flag: '🔍', category: 'stocks', description: 'Alphabet Inc.' },
    { value: 'MSFT', label: 'MSFT', flag: '🪟', category: 'stocks', description: 'Microsoft Corporation' },
    { value: 'TSLA', label: 'TSLA', flag: '🚗', category: 'stocks', description: 'Tesla Inc.' },
    { value: 'NVDA', label: 'NVDA', flag: '🎮', category: 'stocks', description: 'NVIDIA Corporation' },
    { value: 'AMZN', label: 'AMZN', flag: '📦', category: 'stocks', description: 'Amazon.com Inc.' },

    // Crypto
    { value: 'BTCUSD', label: 'BTC/USD', flag: '₿', category: 'crypto', description: 'Bitcoin vs US Dollar' },
    { value: 'ETHUSD', label: 'ETH/USD', flag: '⟠', category: 'crypto', description: 'Ethereum vs US Dollar' },
    { value: 'ADAUSD', label: 'ADA/USD', flag: '🔷', category: 'crypto', description: 'Cardano vs US Dollar' },
    { value: 'SOLUSD', label: 'SOL/USD', flag: '☀️', category: 'crypto', description: 'Solana vs US Dollar' },
    { value: 'DOTUSD', label: 'DOT/USD', flag: '🔴', category: 'crypto', description: 'Polkadot vs US Dollar' },

    // Commodities
    { value: 'XAUUSD', label: 'XAU/USD', flag: '🥇', category: 'commodities', description: 'Gold vs US Dollar' },
    { value: 'XAGUSD', label: 'XAG/USD', flag: '🥈', category: 'commodities', description: 'Silver vs US Dollar' },
    { value: 'WTIUSD', label: 'WTI/USD', flag: '🛢️', category: 'commodities', description: 'West Texas Intermediate Oil' },
    { value: 'BRENTUSD', label: 'Brent/USD', flag: '⚫', category: 'commodities', description: 'Brent Crude Oil' },
    { value: 'GASUSD', label: 'Gas/USD', flag: '⛽', category: 'commodities', description: 'Natural Gas' },
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

// Componente separado para el dropdown que no se re-renderiza con el precio
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
        {/* Búsqueda y filtros */}
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

            {/* Filtros de categoría */}
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

        {/* Lista de símbolos */}
        <div className="max-h-80 overflow-y-auto">
            {Object.entries(groupedSymbols).map(([category, categorySymbols]) => (
                <div key={category}>
                    {selectedCategory === 'all' && (
                        <div className="px-4 py-2 bg-gray-800/50 text-gray-400 text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
                            <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                            {categoryLabels[category as keyof typeof categoryLabels]}
                        </div>
                    )}
                    {categorySymbols.map((symbol) => (
                        <button
                            key={symbol.value}
                            onClick={() => handleSymbolSelect(symbol.value)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-3 ${selectedSymbol === symbol.value ? 'bg-purple-500/20 border-r-2 border-purple-500' : ''
                                }`}
                        >
                            <span className="text-xl">{symbol.flag}</span>
                            <div>
                                <div className="font-semibold text-white">{symbol.label}</div>
                                <div className="text-xs text-gray-400">{symbol.description}</div>
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

// Componente principal
const SymbolSelector: React.FC<SymbolSelectorProps> = React.memo(({
    selectedSymbol,
    onSymbolChange,
    currentPrice
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Usar refs para evitar re-renders por cambios de precio
    const currentPriceRef = useRef(currentPrice);
    const [displayPrice, setDisplayPrice] = useState(currentPrice);

    // Solo actualizar el precio mostrado cada 500ms para reducir re-renders
    useEffect(() => {
        currentPriceRef.current = currentPrice;

        const throttleTimer = setTimeout(() => {
            setDisplayPrice(currentPrice);
        }, 500);

        return () => clearTimeout(throttleTimer);
    }, [currentPrice]);

    // Memorizar datos calculados para evitar re-cálculos innecesarios
    const selectedSymbolData = useMemo(() =>
        symbols.find(s => s.value === selectedSymbol),
        [selectedSymbol]
    );

    // Calcular posición del dropdown solo cuando se abre
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

    // Manejar apertura/cierre del dropdown
    const handleToggleDropdown = useCallback(() => {
        if (!isOpen) {
            updateDropdownPosition();
        }
        setIsOpen(!isOpen);
    }, [isOpen, updateDropdownPosition]);

    // Manejar cierre con Escape
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
            // Pequeño delay para evitar cierre inmediato
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

    // Filtrar símbolos según categoría y búsqueda (memoizado)
    const filteredSymbols = useMemo(() => symbols.filter(symbol => {
        const matchesCategory = selectedCategory === 'all' || symbol.category === selectedCategory;
        const matchesSearch = symbol.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            symbol.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    }), [selectedCategory, searchTerm]);

    // Agrupar por categoría para mostrar (memoizado)
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

    // Reset search when dropdown closes
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setSelectedCategory('all');
        }
    }, [isOpen]);

    return (
        <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                {/* Selector personalizado */}
                <div className="relative min-w-[300px]">
                    <button
                        ref={buttonRef}
                        onClick={handleToggleDropdown}
                        className="w-full appearance-none bg-primary-600/20 text-white border border-primary-500/30 rounded-xl px-6 py-3 pr-10 text-lg font-semibold hover:bg-primary-500/30 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-between"
                    >
                        <span className="flex items-center gap-3">
                            <span className="text-2xl">{selectedSymbolData?.flag}</span>
                            <div className="text-left">
                                <div className="font-bold">{selectedSymbolData?.label}</div>
                                <div className="text-sm text-gray-400 font-normal">{selectedSymbolData?.description}</div>
                            </div>
                        </span>
                        <ChevronDown className={`w-5 h-5 text-primary-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Renderizar dropdown como portal */}
                    {isOpen && typeof window !== 'undefined' && createPortal(
                        <>
                            {/* Overlay para cerrar */}
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
                                    width: Math.max(dropdownPosition.width, 300),
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

                {/* Información de precio */}
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">Current Price</div>
                        <div className="text-2xl md:text-3xl font-bold text-white">
                            {selectedSymbolData?.category === 'stocks' || selectedSymbolData?.category === 'crypto'
                                ? `$${displayPrice.toFixed(2)}`
                                : displayPrice.toFixed(5)
                            }
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-sm text-gray-400 mb-1">24h Change</div>
                        <div className="text-lg font-semibold text-success-400">
                            {selectedSymbolData?.category === 'stocks' || selectedSymbolData?.category === 'crypto'
                                ? '+$12.45 (+2.1%)'
                                : '+0.0023 (+0.21%)'
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

SymbolSelector.displayName = 'SymbolSelector';

export default SymbolSelector;