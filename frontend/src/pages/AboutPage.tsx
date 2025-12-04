import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Janmat-logo-main.png';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const AboutPage: React.FC = () => {
    const [count, setCount] = useState({ complaints: 0, citizens: 0, officers: 0 });

    useEffect(() => {
        // Animated counter
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        const targets = { complaints: 10000, citizens: 5000, officers: 150 };
        let step = 0;

        const timer = setInterval(() => {
            step++;
            setCount({
                complaints: Math.floor((targets.complaints / steps) * step),
                citizens: Math.floor((targets.citizens / steps) * step),
                officers: Math.floor((targets.officers / steps) * step)
            });

            if (step >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, []);

    const team = [
        {
            name: 'Vision',
            role: 'Our Mission',
            icon: '🎯',
            description: 'To create a transparent, efficient, and citizen-centric governance platform that bridges the gap between citizens and government.',
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            name: 'Innovation',
            role: 'Our Approach',
            icon: '💡',
            description: 'Leveraging cutting-edge technology and user-centered design to revolutionize civic engagement and complaint management.',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            name: 'Impact',
            role: 'Our Goal',
            icon: '🌟',
            description: 'Empowering millions of citizens to voice their concerns and ensuring every complaint receives the attention it deserves.',
            gradient: 'from-green-500 to-emerald-500'
        }
    ];

    const values = [
        {
            icon: '🤝',
            title: 'Transparency',
            description: 'Complete visibility into complaint status and resolution process',
            color: 'blue'
        },
        {
            icon: '⚡',
            title: 'Efficiency',
            description: 'Streamlined workflows for faster complaint resolution',
            color: 'purple'
        },
        {
            icon: '🔒',
            title: 'Security',
            description: 'Bank-grade encryption to protect citizen data',
            color: 'green'
        },
        {
            icon: '🎨',
            title: 'User-Centric',
            description: 'Intuitive design focused on user experience',
            color: 'orange'
        },
        {
            icon: '📊',
            title: 'Data-Driven',
            description: 'Analytics and insights for better decision making',
            color: 'pink'
        },
        {
            icon: '🌍',
            title: 'Accessibility',
            description: 'Available to everyone, everywhere, anytime',
            color: 'indigo'
        }
    ];

    const timeline = [
        {
            year: '2023',
            title: 'The Beginning',
            description: 'JanMat was conceived to address the growing need for digital governance',
            icon: '🚀'
        },
        {
            year: '2024',
            title: 'Platform Launch',
            description: 'Successfully launched with 10+ departments and 1000+ citizens',
            icon: '🎉'
        },
        {
            year: '2024',
            title: 'Rapid Growth',
            description: 'Expanded to 50+ departments serving 5000+ active citizens',
            icon: '📈'
        },
        {
            year: 'Future',
            title: 'National Scale',
            description: 'Vision to become the leading civic engagement platform nationwide',
            icon: '🌟'
        }
    ];

    const achievements = [
        { number: '98%', label: 'Satisfaction Rate', icon: '⭐' },
        { number: '24hrs', label: 'Avg Response Time', icon: '⚡' },
        { number: '85%', label: 'Resolution Rate', icon: '✅' },
        { number: '50+', label: 'Departments', icon: '🏢' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Navigation */}
            <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex items-center space-x-3">
                            <img src={logo} alt="JanMat" className="h-16 w-auto" />
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    JanMat
                                </h1>
                                <p className="text-xs text-gray-600 dark:text-gray-400">About Us</p>
                            </div>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <Link to="/features" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                                Features
                            </Link>
                            <Link to="/login" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block mb-6">
                            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400">
                                🏛️ Building Better Communities
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                            <span className="text-gray-900 dark:text-white">
                                Empowering Citizens,
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Transforming Governance
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            JanMat is more than a platform—it's a movement towards transparent, efficient, and citizen-centric governance. We're revolutionizing how communities interact with their local government.
                        </p>
                    </div>

                    {/* Animated Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        <div className="text-center p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-xl transform hover:scale-105 transition-all">
                            <div className="text-5xl mb-4">📝</div>
                            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                {count.complaints.toLocaleString()}+
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 font-medium">Complaints Resolved</div>
                        </div>
                        <div className="text-center p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-xl transform hover:scale-105 transition-all">
                            <div className="text-5xl mb-4">👥</div>
                            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                {count.citizens.toLocaleString()}+
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 font-medium">Active Citizens</div>
                        </div>
                        <div className="text-center p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-xl transform hover:scale-105 transition-all">
                            <div className="text-5xl mb-4">👮</div>
                            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                                {count.officers}+
                            </div>
                            <div className="text-gray-600 dark:text-gray-400 font-medium">Dedicated Officers</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission, Vision, Impact */}
            <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((item, index) => (
                            <div
                                key={index}
                                className="group relative p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity`}></div>
                                <div className="relative">
                                    <div className="text-6xl mb-4">{item.icon}</div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-4">
                                        {item.role}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            The principles that guide everything we do
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all border border-gray-100 dark:border-gray-700"
                            >
                                <div className="text-4xl mb-3">{value.icon}</div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {value.title}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Our Journey
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            From concept to reality
                        </p>
                    </div>
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>

                        {timeline.map((item, index) => (
                            <div key={index} className={`relative mb-12 ${index % 2 === 0 ? 'text-right pr-1/2' : 'text-left pl-1/2'}`}>
                                <div className={`flex items-center ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                                            <div className="text-3xl mb-2">{item.icon}</div>
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                                {item.year}
                                            </div>
                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                {item.title}
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full border-4 border-white dark:border-slate-900 shadow-lg"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Achievements */}
            <section className="px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Our Achievements
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Numbers that speak for themselves
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {achievements.map((achievement, index) => (
                            <div
                                key={index}
                                className="text-center p-8 rounded-3xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700 shadow-xl transform hover:scale-110 transition-all"
                            >
                                <div className="text-5xl mb-4">{achievement.icon}</div>
                                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                    {achievement.number}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {achievement.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1 shadow-2xl">
                        <div className="rounded-3xl bg-white dark:bg-slate-900 p-12 text-center">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                                Be Part of Our Story
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                                Join us in creating a more transparent and efficient governance system
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/register"
                                    className="px-10 py-5 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                                >
                                    Join Now
                                </Link>
                                <Link
                                    to="/features"
                                    className="px-10 py-5 rounded-2xl text-lg font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                                >
                                    Explore Features
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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
            `}</style>
        </div>
    );
};
