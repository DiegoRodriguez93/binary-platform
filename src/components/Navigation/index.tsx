"use client"
import React, { useState } from 'react';
import { TrendingUp, Menu, X, User, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/' });
    };

    const handleAuthClick = () => {
        if (session) {
            // Si está logueado, ir al trading
            router.push('/trade-v2');
        } else {
            // Si no está logueado, ir al signup
            router.push('/auth/signup');
        }
    };

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

                    <div className="hidden md:flex items-center space-x-6 animate-slide-in-right">
                        {session ? (
                            <>
                                {/* User Info */}
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <div className="text-white font-semibold">{session.user?.name}</div>
                                        <div className="text-sm text-gray-400">
                                            Balance: ${session.user?.balance?.toLocaleString() || '0'}
                                        </div>
                                    </div>
                                    {session.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt="Profile"
                                            className="w-10 h-10 rounded-full border-2 border-primary-500"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Trading Button */}
                                <button
                                    onClick={() => router.push('/trade-v2')}
                                    className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-2 rounded-full hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 transform hover:scale-105"
                                >
                                    Trade Now
                                </button>

                                {/* Logout Button */}
                                <button
                                    onClick={handleSignOut}
                                    className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleAuthClick}
                                    className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-3 rounded-full hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 transform hover:scale-105 hover:shadow-glow-lg"
                                >
                                    Get $5000 Bonus
                                </button>
                                <a 
                                    href="/auth/signin" 
                                    className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-110"
                                >
                                    Log in
                                </a>
                            </>
                        )}
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
                        {session ? (
                            <>
                                <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
                                    {session.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt="Profile"
                                            className="w-12 h-12 rounded-full border-2 border-primary-500"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-white font-semibold">{session.user?.name}</div>
                                        <div className="text-sm text-gray-400">
                                            Balance: ${session.user?.balance?.toLocaleString() || '0'}
                                        </div>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => router.push('/trade-v2')}
                                    className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-full hover:from-primary-700 hover:to-secondary-700 transition-all"
                                >
                                    Trade Now
                                </button>
                                
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-gray-300 hover:text-white transition-colors py-2 flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleAuthClick}
                                    className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-full mt-4 hover:from-primary-700 hover:to-secondary-700 transition-all"
                                >
                                    Get $5000 Bonus
                                </button>
                                <a 
                                    href="/auth/signin" 
                                    className="block text-gray-300 hover:text-white transition-colors py-2 text-center"
                                >
                                    Log in
                                </a>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}