"use client"
import React, { useState } from 'react';
import { Wifi, WifiOff, Server, User, Lock, Activity, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { MT4Connection, MT5Connection } from './TradeV4';

interface MT4ConnectionPanelProps {
    mt4Connection: MT4Connection;
    mt5Connection: MT5Connection;
    onConnectMT4: (server: string, login: number, password: string) => Promise<boolean>;
    onConnectMT5: (server: string, login: number, password: string) => Promise<boolean>;
    onDisconnectMT4: () => void;
    onDisconnectMT5: () => void;
}

const MT4ConnectionPanel: React.FC<MT4ConnectionPanelProps> = ({
    mt4Connection,
    mt5Connection,
    onConnectMT4,
    onConnectMT5,
    onDisconnectMT4,
    onDisconnectMT5
}) => {
    const [activeTab, setActiveTab] = useState<'mt4' | 'mt5' | 'info'>('mt4');
    const [mt4Form, setMT4Form] = useState({
        server: 'MetaQuotes-Demo',
        login: '',
        password: '',
        isConnecting: false
    });
    const [mt5Form, setMT5Form] = useState({
        server: 'MetaQuotes-MT5',
        login: '',
        password: '',
        isConnecting: false
    });

    const handleMT4Connect = async () => {
        if (!mt4Form.login || !mt4Form.password) return;
        
        setMT4Form(prev => ({ ...prev, isConnecting: true }));
        
        try {
            const success = await onConnectMT4(mt4Form.server, parseInt(mt4Form.login), mt4Form.password);
            if (success) {
                setMT4Form(prev => ({ ...prev, password: '' }));
            }
        } finally {
            setMT4Form(prev => ({ ...prev, isConnecting: false }));
        }
    };

    const handleMT5Connect = async () => {
        if (!mt5Form.login || !mt5Form.password) return;
        
        setMT5Form(prev => ({ ...prev, isConnecting: true }));
        
        try {
            const success = await onConnectMT5(mt5Form.server, parseInt(mt5Form.login), mt5Form.password);
            if (success) {
                setMT5Form(prev => ({ ...prev, password: '' }));
            }
        } finally {
            setMT5Form(prev => ({ ...prev, isConnecting: false }));
        }
    };

    return (
        <div className="card-gradient backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Server className="w-6 h-6 text-blue-400" />
                    MT4/MT5 Connection Center
                </h3>
                <div className="flex bg-gray-800/50 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('mt4')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                            activeTab === 'mt4' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        MT4
                    </button>
                    <button
                        onClick={() => setActiveTab('mt5')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                            activeTab === 'mt5' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        MT5
                    </button>
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                            activeTab === 'info' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Info
                    </button>
                </div>
            </div>

            {/* MT4 Tab */}
            {activeTab === 'mt4' && (
                <div className="space-y-6">
                    {mt4Connection.isConnected ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Wifi className="w-5 h-5 text-green-400" />
                                    <span className="font-semibold text-green-400">MT4 Connected</span>
                                </div>
                                <button
                                    onClick={onDisconnectMT4}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-all"
                                >
                                    Disconnect
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-white">{mt4Connection.account}</div>
                                    <div className="text-xs text-gray-400">Account</div>
                                </div>
                                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-green-400">${mt4Connection.balance.toFixed(2)}</div>
                                    <div className="text-xs text-gray-400">Balance</div>
                                </div>
                                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-blue-400">${mt4Connection.equity.toFixed(2)}</div>
                                    <div className="text-xs text-gray-400">Equity</div>
                                </div>
                                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-purple-400">1:{mt4Connection.leverage}</div>
                                    <div className="text-xs text-gray-400">Leverage</div>
                                </div>
                            </div>
                            
                            <div className="mt-4 text-sm text-gray-400">
                                Server: {mt4Connection.server} | Last Update: {new Date(mt4Connection.lastUpdate).toLocaleTimeString()}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Server
                                    </label>
                                    <div className="relative">
                                        <Server className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={mt4Form.server}
                                            onChange={(e) => setMT4Form(prev => ({ ...prev, server: e.target.value }))}
                                            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="MetaQuotes-Demo"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Login
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            value={mt4Form.login}
                                            onChange={(e) => setMT4Form(prev => ({ ...prev, login: e.target.value }))}
                                            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Account number"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={mt4Form.password}
                                        onChange={(e) => setMT4Form(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Account password"
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={handleMT4Connect}
                                disabled={mt4Form.isConnecting || !mt4Form.login || !mt4Form.password}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {mt4Form.isConnecting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Wifi className="w-4 h-4" />
                                        Connect to MT4
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* MT5 Tab */}
            {activeTab === 'mt5' && (
                <div className="space-y-6">
                    {mt5Connection.isConnected ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Wifi className="w-5 h-5 text-green-400" />
                                    <span className="font-semibold text-green-400">MT5 Connected</span>
                                </div>
                                <button
                                    onClick={onDisconnectMT5}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-all"
                                >
                                    Disconnect
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-white">{mt5Connection.account}</div>
                                    <div className="text-xs text-gray-400">Account</div>
                                </div>
                                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-green-400">${mt5Connection.balance.toFixed(2)}</div>
                                    <div className="text-xs text-gray-400">Balance</div>
                                </div>
                                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-blue-400">${mt5Connection.equity.toFixed(2)}</div>
                                    <div className="text-xs text-gray-400">Equity</div>
                                </div>
                                <div className="bg-gray-800/30 rounded-lg p-3 text-center">
                                    <div className="text-lg font-bold text-purple-400">1:{mt5Connection.leverage}</div>
                                    <div className="text-xs text-gray-400">Leverage</div>
                                </div>
                            </div>
                            
                            <div className="mt-4 text-sm text-gray-400">
                                Server: {mt5Connection.server} | Last Update: {new Date(mt5Connection.lastUpdate).toLocaleTimeString()}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Server
                                    </label>
                                    <div className="relative">
                                        <Server className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={mt5Form.server}
                                            onChange={(e) => setMT5Form(prev => ({ ...prev, server: e.target.value }))}
                                            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="MetaQuotes-MT5"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Login
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            value={mt5Form.login}
                                            onChange={(e) => setMT5Form(prev => ({ ...prev, login: e.target.value }))}
                                            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Account number"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="password"
                                        value={mt5Form.password}
                                        onChange={(e) => setMT5Form(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Account password"
                                    />
                                </div>
                            </div>
                            
                            <button
                                onClick={handleMT5Connect}
                                disabled={mt5Form.isConnecting || !mt5Form.login || !mt5Form.password}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {mt5Form.isConnecting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Wifi className="w-4 h-4" />
                                        Connect to MT5
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Info Tab */}
            {activeTab === 'info' && (
                <div className="space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-blue-400" />
                            <span className="font-semibold text-blue-400">MT4/MT5 Integration Information</span>
                        </div>
                        
                        <div className="space-y-4 text-sm text-gray-300">
                            <div>
                                <h4 className="font-semibold text-white mb-2">How it works:</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Connect your MT4/MT5 account to get real-time market data</li>
                                    <li>Place binary options trades based on live forex prices</li>
                                    <li>Monitor your MT4/MT5 account balance and equity in real-time</li>
                                    <li>Use professional trading tools with institutional-grade data</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-white mb-2">Requirements:</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Valid MT4 or MT5 trading account</li>
                                    <li>MetaTrader platform installed and running</li>
                                    <li>Expert Advisor or Python bridge for data connection</li>
                                    <li>Stable internet connection</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-white mb-2">Security:</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>All connections are encrypted and secure</li>
                                    <li>Your login credentials are never stored</li>
                                    <li>Read-only access to market data</li>
                                    <li>No direct trading on your MT4/MT5 account</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-yellow-400" />
                            <span className="font-semibold text-yellow-400">Demo Mode</span>
                        </div>
                        <p className="text-sm text-gray-300">
                            This is a demonstration of MT4/MT5 integration. In a production environment, 
                            you would need to install additional software bridges to connect to your actual 
                            MetaTrader platforms.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MT4ConnectionPanel;