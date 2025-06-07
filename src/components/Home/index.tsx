"use client"
import React, { useState, useEffect } from 'react';
import { TrendingUp, Shield, Zap, Users, Star, ArrowRight, CheckCircle, BarChart3, Clock, Target, Play } from 'lucide-react';

export default function HomePage() {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [isVisible, setIsVisible] = useState<any>({});

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Professional Trader",
            content: "This platform revolutionized my trading approach. The algorithms are incredibly accurate and reliable.",
            rating: 5,
            profit: "+287%"
        },
        {
            name: "Michael Chen",
            role: "Investor",
            content: "Intuitive interface with reliable signals. My profits increased by 40% in just 3 months.",
            rating: 5,
            profit: "+156%"
        },
        {
            name: "Emma Rodriguez",
            role: "Financial Analyst",
            content: "Exceptional analysis tools. Perfect for both professionals and beginners starting out.",
            rating: 5,
            profit: "+198%"
        }
    ];

    const features = [
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Advanced Analytics",
            description: "Real-time market analysis with AI-powered insights and predictive algorithms."
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Lightning Fast",
            description: "Execute trades in milliseconds with our optimized infrastructure and low latency."
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Bank-Grade Security",
            description: "Your funds and data are protected with enterprise-level encryption and security."
        },
        {
            icon: <Target className="w-8 h-8" />,
            title: "Precision Signals",
            description: "Get accurate trading signals with 89% success rate from our AI algorithms."
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title: "24/7 Trading",
            description: "Trade around the clock with automated strategies and real-time monitoring."
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Expert Support",
            description: "Access our team of trading experts and comprehensive educational resources."
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible((prev: any) => ({ ...prev, [entry.target.id]: true }));
                    }
                });
            },
            { threshold: 0.1 }
        );

        const elements = document.querySelectorAll('[data-animate]');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <>
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="animate-slide-in-up">
                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                                Master Binary Trading with
                                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent block mt-4">AI-Powered Precision</span>
                            </h1>
                        </div>
                        <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                                Transform your trading strategy with advanced algorithms, real-time analytics, and professional-grade tools designed for maximum profitability.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
                            <button className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 transform hover:scale-105 hover:shadow-glow-lg flex items-center justify-center gap-2">
                                Start Trading Now
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button className="border-2 border-white/30 text-white px-12 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                                <Play className="w-5 h-5" />
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* Hero Stats */}
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
                        {[
                            { label: "Success Rate", value: "89%", icon: <Target className="w-8 h-8" /> },
                            { label: "Active Traders", value: "50K+", icon: <Users className="w-8 h-8" /> },
                            { label: "Avg. Monthly ROI", value: "34%", icon: <TrendingUp className="w-8 h-8" /> },
                            { label: "Uptime", value: "99.9%", icon: <Shield className="w-8 h-8" /> }
                        ].map((stat, index) => (
                            <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center hover-lift hover:bg-white/15 transition-all duration-300">
                                <div className="text-primary-400 flex justify-center mb-3 animate-pulse-slow">
                                    {stat.icon}
                                </div>
                                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                                <div className="text-gray-300">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-black/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div data-animate id="features-title" className={`${isVisible['features-title'] ? 'animate-slide-in-up' : 'opacity-0'}`}>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Powerful Features for
                                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent block">Professional Trading</span>
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Everything you need to succeed in binary options trading, powered by cutting-edge technology and years of market expertise.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                data-animate
                                id={`feature-${index}`}
                                className={`card-gradient backdrop-blur-md rounded-2xl p-8 hover-lift transition-all duration-500 hover:bg-gradient-to-br hover:from-white/15 hover:to-white/10 hover:shadow-xl hover:shadow-purple-500/20 ${isVisible[`feature-${index}`] ? 'animate-scale-in' : 'opacity-0'}`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="text-primary-400 mb-4 animate-bounce-custom" style={{ animationDelay: `${index * 0.2}s` }}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div data-animate id="testimonials-title" className={`${isVisible['testimonials-title'] ? 'animate-slide-in-up' : 'opacity-0'}`}>
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Trusted by
                                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent"> Thousands of Traders</span>
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                See what our community of successful traders has to say about their experience with BinaryPro.
                            </p>
                        </div>
                    </div>

                    <div className="relative max-w-4xl mx-auto">
                        <div className="card-gradient backdrop-blur-md rounded-3xl p-8 md:p-12 animate-fade-in">
                            <div className="flex items-center justify-center mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current animate-pulse-slow" style={{ animationDelay: `${i * 0.1}s` }} />
                                ))}
                            </div>
                            <blockquote className="text-2xl md:text-3xl text-white text-center mb-8 font-light leading-relaxed">
                                "{testimonials[currentTestimonial].content}"
                            </blockquote>
                            <div className="flex items-center justify-center space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {testimonials[currentTestimonial].name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <div className="text-white font-semibold text-lg">{testimonials[currentTestimonial].name}</div>
                                    <div className="text-gray-300">{testimonials[currentTestimonial].role}</div>
                                    <div className="text-success-400 font-bold">{testimonials[currentTestimonial].profit} profit</div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial Indicators */}
                        <div className="flex justify-center space-x-2 mt-8">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentTestimonial(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTestimonial ? 'bg-primary-500 w-8' : 'bg-white/30'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-black/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div data-animate id="pricing-title">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Choose Your
                                <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent"> Trading Plan</span>
                            </h2>
                            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                                Flexible pricing options designed to scale with your trading journey and maximize your profitability.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Starter",
                                price: "$29",
                                period: "/month",
                                features: ["Basic Trading Signals", "Email Support", "Mobile App Access", "Basic Analytics"],
                                popular: false
                            },
                            {
                                name: "Professional",
                                price: "$79",
                                period: "/month",
                                features: ["Advanced AI Signals", "Priority Support", "Advanced Analytics", "Risk Management Tools", "Custom Strategies"],
                                popular: true
                            },
                            {
                                name: "Enterprise",
                                price: "$199",
                                period: "/month",
                                features: ["White-label Solution", "API Access", "Dedicated Account Manager", "Custom Integrations", "Advanced Reporting"],
                                popular: false
                            }
                        ].map((plan, index) => (
                            <div
                                key={index}
                                data-animate
                                id={`plan-${index}`}
                                className={`relative card-gradient backdrop-blur-md rounded-3xl p-8 hover-lift ${plan.popular ? 'ring-2 ring-primary-500 scale-105 hover:scale-110' : 'hover:bg-gradient-to-br hover:from-white/15 hover:to-white/10'
                                    }`}
                                style={{ animationDelay: `${index * 0.2}s` }}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-2 rounded-full text-sm font-semibold animate-pulse-slow">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center">
                                        <span className="text-5xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">{plan.price}</span>
                                        <span className="text-gray-300 ml-2">{plan.period}</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center text-gray-300">
                                            <CheckCircle className="w-5 h-5 text-success-400 mr-3 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${plan.popular
                                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 hover:shadow-glow-lg'
                                    : 'border-2 border-white/30 text-white hover:bg-white/10'
                                    }`}>
                                    Get Started
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div data-animate id="cta-section" className={`${isVisible['cta-section'] ? 'animate-slide-in-up' : 'opacity-0'}`}>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to Transform Your
                            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent block">Trading Journey?</span>
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of successful traders who trust BinaryPro for their binary options trading needs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 transform hover:scale-105 hover:shadow-glow-lg">
                                Start Your Free Trial
                            </button>
                            <button className="border-2 border-white/30 text-white px-12 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                                Schedule a Demo
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}