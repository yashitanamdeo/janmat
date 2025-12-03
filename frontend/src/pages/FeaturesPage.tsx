import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Janmat-logo-main.png';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const FeaturesPage: React.FC = () => {
    const [scrollY, setScrollY] = useState(0);
    const [activeTab, setActiveTab] = useState('citizens');

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = {
        citizens: [
            {
                icon: '📝',
                title: 'Easy Complaint Filing',
                description: 'Submit complaints in under 2 minutes with our intuitive interface',
                details: ['Photo/Video upload', 'Location tagging', 'Category selection', 'Priority marking'],
                gradient: 'from-blue-500 to-cyan-500'
            },
            {
                icon: '🔔',
                title: 'Real-Time Notifications',
                description: 'Stay updated with instant alerts on your complaint status',
                details: ['SMS alerts', 'Email updates', 'In-app notifications', 'Status changes'],
                gradient: 'from-purple-500 to-pink-500'
            },
            {
                icon: '📊',
                title: 'Track Progress',
                description: 'Monitor your complaints with detailed timeline and updates',
                details: ['Visual timeline', 'Officer comments', 'Resolution status', 'Feedback system'],
                gradient: 'from-green-500 to-emerald-500'
            },
            {
                icon: '⭐',
                title: 'Rate & Review',
                description: 'Provide feedback on resolved complaints to improve service',
                details: ['5-star rating', 'Written feedback', 'Service quality', 'Response time'],
                gradient: 'from-orange-500 to-red-500'
            },
            {
                icon: '📱',
                title: 'Mobile Responsive',
                description: 'Access from any device - phone, tablet, or desktop',
                details: ['Progressive Web App', 'Offline support', 'Touch optimized', 'Fast loading'],
                gradient: 'from-indigo-500 to-purple-500'
            },
            {
                icon: '🔒',
                title: 'Secure & Private',
                description: 'Your data is encrypted and protected with industry standards',
                details: ['End-to-end encryption', 'Secure authentication', 'Data privacy', 'GDPR compliant'],
                gradient: 'from-pink-500 to-rose-500'
            }
        ],
        officers: [
            {
                icon: '📋',
                title: 'Smart Dashboard',
                description: 'Manage all assigned complaints from a unified dashboard',
                details: ['Priority sorting', 'Quick filters', 'Bulk actions', 'Analytics view'],
                gradient: 'from-blue-500 to-indigo-500'
            },
            {
                icon: '🎯',
                title: 'AI-Powered Assignment',
                description: 'Complaints automatically routed based on expertise and workload',
                details: ['Smart routing', 'Load balancing', 'Skill matching', 'Auto-assignment'],
                gradient: 'from-purple-500 to-blue-500'
            },
            {
                icon: '📍',
                title: 'Location Intelligence',
                description: 'View complaints on interactive maps with geographic insights',
                details: ['Heat maps', 'Route optimization', 'Area analytics', 'GPS tracking'],
                gradient: 'from-green-500 to-teal-500'
            },
            {
                icon: '📈',
                title: 'Performance Metrics',
                description: 'Track your resolution rate and performance statistics',
                details: ['Resolution time', 'Success rate', 'Citizen satisfaction', 'Workload trends'],
                gradient: 'from-orange-500 to-yellow-500'
            },
            {
                icon: '✅',
                title: 'Quick Actions',
                description: 'Update status, add comments, and resolve with one click',
                details: ['Status updates', 'Photo evidence', 'Voice notes', 'Quick replies'],
                gradient: 'from-red-500 to-pink-500'
            },
            {
                icon: '📅',
                title: 'Attendance & Leave',
                description: 'Manage your attendance and leave requests seamlessly',
                details: ['Check-in/out', 'Leave application', 'Approval tracking', 'Calendar view'],
                gradient: 'from-cyan-500 to-blue-500'
            }
        ],
        admins: [
            {
                icon: '👥',
                title: 'User Management',
                description: 'Complete control over citizens, officers, and departments',
                details: ['Role assignment', 'Bulk operations', 'User analytics', 'Access control'],
                gradient: 'from-violet-500 to-purple-500'
            },
            {
                icon: '📊',
                title: 'Advanced Analytics',
                description: 'Comprehensive insights with interactive charts and reports',
                details: ['Custom reports', 'Trend analysis', 'Export data', 'Real-time stats'],
                gradient: 'from-blue-500 to-cyan-500'
            },
            {
                icon: '🏢',
                title: 'Department Management',
                description: 'Create and manage departments with officer assignments',
                details: ['Department creation', 'Officer allocation', 'Workload distribution', 'Performance tracking'],
                gradient: 'from-green-500 to-lime-500'
            },
            {
                icon: '🎨',
                title: 'Customization',
                description: 'Customize categories, priorities, and workflow settings',
                details: ['Custom categories', 'Workflow rules', 'Email templates', 'Branding options'],
                gradient: 'from-pink-500 to-rose-500'
            },
            {
                icon: '📢',
                title: 'Announcements',
                description: 'Broadcast important messages to all users or specific groups',
                details: ['Targeted messaging', 'Scheduled posts', 'Priority alerts', 'Rich content'],
                gradient: 'from-orange-500 to-amber-500'
            },
            {
                icon: '🔍',
                title: 'Audit Logs',
                description: 'Complete audit trail of all system activities and changes',
                details: ['Activity tracking', 'Change history', 'User actions', 'Security logs'],
                gradient: 'from-indigo-500 to-blue-500'
            }
        ]
    };

    const integrations = [
        { name: 'SMS Gateway', icon: '💬', description: 'Automated SMS notifications' },
        { name: 'Email Service', icon: '📧', description: 'Email alerts and updates' },
        { name: 'Maps API', icon: '🗺️', description: 'Location services' },
        { name: 'Cloud Storage', icon: '☁️', description: 'Secure file storage' },
        { name: 'Analytics', icon: '📊', description: 'Advanced reporting' },
        { name: 'Payment Gateway', icon: '💳', description: 'Online payments' }
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
                                <p className="text-xs text-gray-600 dark:text-gray-400">Features</p>
                            </div>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <Link to="/about" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                                About Us
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
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-block mb-6">
                        <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400">
                            ✨ Powerful Features for Everyone
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Everything You Need
                        </span>
                        <br />
                        <span className="text-gray-900 dark:text-white">
                            In One Platform
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Discover how JanMat empowers citizens, officers, and administrators with cutting-edge features designed for efficiency and transparency.
                    </p>
                </div>
            </section>

            {/* Tab Navigation */}
            <section className="px-4 sm:px-6 lg:px-8 mb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-4">
                        {['citizens', 'officers', 'admins'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 ${activeTab === tab
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl'
                                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                {tab === 'citizens' && '👥 For Citizens'}
                                {tab === 'officers' && '👮 For Officers'}
                                {tab === 'admins' && '👔 For Admins'}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features[activeTab as keyof typeof features].map((feature, index) => (
                            <div
                                key={index}
                                className="group relative p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
                                style={{
                                    opacity: scrollY > 300 ? 1 : 0,
                                    transform: `translateY(${scrollY > 300 ? 0 : 40}px)`,
                                    transitionDelay: `${index * 100}ms`
                                }}
                            >
                                {/* Gradient Background on Hover */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

                                <div className="relative">
                                    {/* Icon */}
                                    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                                        {feature.description}
                                    </p>

                                    {/* Details List */}
                                    <ul className="space-y-2">
                                        {feature.details.map((detail, idx) => (
                                            <li key={idx} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integrations Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Seamless Integrations
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            Connected with the best services for optimal performance
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {integrations.map((integration, index) => (
                            <div
                                key={index}
                                className="group p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-center border border-gray-100 dark:border-gray-700"
                            >
                                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                                    {integration.icon}
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                                    {integration.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {integration.description}
                                </p>
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
                                Ready to Experience These Features?
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                                Join thousands of users already benefiting from JanMat
                            </p>
                            <Link
                                to="/register"
                                className="inline-block px-10 py-5 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                            >
                                Start Free Today
                            </Link>
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
