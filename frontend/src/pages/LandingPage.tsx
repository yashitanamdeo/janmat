import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Janmat-logo-main.png';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [scrollY, setScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        setIsVisible(true);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: '📝',
            title: 'File Complaints',
            description: 'Submit and track your civic complaints with ease',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            icon: '⚡',
            title: 'Real-Time Updates',
            description: 'Get instant notifications on complaint status',
            color: 'from-purple-500 to-pink-500'
        },
        {
            icon: '🎯',
            title: 'Smart Assignment',
            description: 'AI-powered routing to relevant departments',
            color: 'from-orange-500 to-red-500'
        },
        {
            icon: '📊',
            title: 'Analytics Dashboard',
            description: 'Comprehensive insights and reporting',
            color: 'from-green-500 to-emerald-500'
        },
        {
            icon: '🔒',
            title: 'Secure & Private',
            description: 'Your data is encrypted and protected',
            color: 'from-indigo-500 to-blue-500'
        },
        {
            icon: '📱',
            title: 'Mobile Friendly',
            description: 'Access from anywhere, anytime',
            color: 'from-pink-500 to-rose-500'
        }
    ];

    const stats = [
        { number: '10,000+', label: 'Complaints Resolved' },
        { number: '5,000+', label: 'Active Citizens' },
        { number: '50+', label: 'Departments' },
        { number: '98%', label: 'Satisfaction Rate' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
                    style={{ transform: `translateY(${scrollY * 0.5}px)` }}
                ></div>
                <div
                    className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"
                    style={{ transform: `translateY(${scrollY * 0.3}px)` }}
                ></div>
                <div
                    className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"
                    style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
                ></div>
            </div>

            {/* Navigation Header */}
            <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-3">
                            <img src={logo} alt="JanMat" className="h-16 w-auto" />
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    JanMat
                                </h1>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Citizen Complaint Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <Link
                                to="/login"
                                className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className={`relative py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="inline-block">
                                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    🎉 Welcome to the Future of Civic Engagement
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Your Voice
                                </span>
                                <br />
                                <span className="text-gray-900 dark:text-white">
                                    Matters Here
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                                JanMat is your digital bridge to local governance. File complaints, track progress,
                                and make your community better—all in one powerful platform.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate('/register')}
                                    className="group px-8 py-4 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                                >
                                    Start Filing Complaints
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-8 py-4 rounded-2xl text-lg font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                                >
                                    Sign In
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative z-10">
                                <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 shadow-2xl transform hover:rotate-2 transition-transform duration-500">
                                    <div className="h-full w-full rounded-3xl bg-white dark:bg-slate-800 p-8 flex items-center justify-center">
                                        <div className="text-center space-y-6">
                                            <div className="text-8xl">🏛️</div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                Empowering Citizens
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                Building better communities together
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Floating Elements */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-2xl transform rotate-12 animate-bounce-slow shadow-xl"></div>
                            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-green-400 rounded-xl transform -rotate-12 animate-bounce-slow animation-delay-1000 shadow-xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="text-center transform hover:scale-110 transition-transform duration-300"
                                style={{
                                    opacity: scrollY > 200 ? 1 : 0,
                                    transform: `translateY(${scrollY > 200 ? 0 : 20}px)`,
                                    transitionDelay: `${index * 100}ms`
                                }}
                            >
                                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {stat.number}
                                </div>
                                <div className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Powerful Features
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Everything you need to make your voice heard
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700"
                                style={{
                                    opacity: scrollY > 400 ? 1 : 0,
                                    transform: `translateY(${scrollY > 400 ? 0 : 40}px)`,
                                    transitionDelay: `${index * 100}ms`
                                }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity`}></div>
                                <div className="relative">
                                    <div className="text-5xl mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1 shadow-2xl">
                        <div className="rounded-3xl bg-white dark:bg-slate-900 p-12 text-center">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                                Ready to Make a Difference?
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                                Join thousands of citizens who are already using JanMat to improve their communities
                            </p>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-10 py-5 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                            >
                                Create Free Account
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-2">
                            <div className="flex items-center space-x-3 mb-4">
                                <img src={logo} alt="JanMat" className="h-12 w-auto" />
                                <div>
                                    <h3 className="text-xl font-bold">JanMat</h3>
                                    <p className="text-sm text-gray-400">Citizen Complaint Portal</p>
                                </div>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Empowering citizens to create positive change in their communities through transparent and efficient complaint management.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Contact</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>📧 support@janmat.gov</li>
                                <li>📞 1800-XXX-XXXX</li>
                                <li>📍 Government Office</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
                        <p>&copy; 2024 JanMat. All rights reserved. | Built for the people, by the people.</p>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0) rotate(12deg); }
                    50% { transform: translateY(-20px) rotate(12deg); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
