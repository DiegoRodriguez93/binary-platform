import React from 'react';
import Navigation from './../Navigation';
import Footer from './../Footer';
import './layout.scss'; // Importamos los estilos

interface LayoutProps {
    children: React.ReactNode;
    showFloatingElements?: boolean;
}

export default function Layout({ children, showFloatingElements = true }: LayoutProps) {
    return (
        <div className="min-h-screen bg-hero-gradient overflow-hidden">
            {/* Floating Background Elements */}
            {showFloatingElements && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="floating-element floating-element--primary"></div>
                    <div className="floating-element floating-element--secondary"></div>
                    <div className="floating-element floating-element--accent"></div>
                </div>
            )}

            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}