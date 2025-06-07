"use client"
import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-black/40 border-t border-white/10 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="animate-slide-in-left">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">BinaryPro</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            Advanced binary options trading platform powered by AI and trusted by professionals worldwide.
                        </p>
                    </div>

                    <div className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                        <h4 className="text-white font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">API</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Security</a></li>
                        </ul>
                    </div>

                    <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact Us</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Community</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Tutorials</a></li>
                        </ul>
                    </div>

                    <div className="animate-slide-in-right">
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Risk Disclosure</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Compliance</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-12 pt-8 text-center">
                    <p className="text-gray-300 animate-fade-in">
                        © 2025 BinaryPro. All rights reserved. Trading involves risk and may not be suitable for all investors.
                    </p>
                </div>
            </div>
        </footer>
    );
}