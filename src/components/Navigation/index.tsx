"use client"
import React, { useState } from 'react';
import { TrendingUp, Menu, X } from 'lucide-react';

export default function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="relative z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-2 animate-slide-in-left">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center animate-glow">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">BinaryPro</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8 animate-slide-in-right">
                        <button className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-3 rounded-full hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 transform hover:scale-105 hover:shadow-glow-lg">
                            Create an Account
                        </button>
                        <a href="/login" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-110">Log in</a>
                    </div>

                    <button
                        className="md:hidden text-white transition-transform duration-300 hover:scale-110"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-black/90 backdrop-blur-md border-t border-white/10 animate-slide-in-up">
                    <div className="px-4 py-6 space-y-4">
                        <button className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-full mt-4 hover:from-primary-700 hover:to-secondary-700 transition-all">
                            Create an Account
                        </button>
                        <a href="/login" className="block text-gray-300 hover:text-white transition-colors py-2">Log in</a>
                    </div>
                </div>
            )}
        </nav>
    );
}