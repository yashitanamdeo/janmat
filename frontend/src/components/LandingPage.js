import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  MapPin,
  CheckCircle,
  Star,
  TrendingUp,
  Zap,
  Heart,
  Globe
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LandingPage = ({ categories = [] }) => {
  const [stats, setStats] = useState({
    total_feedback: 0,
    resolved_feedback: 0,
    resolution_rate: 0
  });

  useEffect(() => {
    fetchPublicStats();
  }, []);

  const fetchPublicStats = async () => {
    try {
      const response = await axios.get(`${API}/public/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch public stats:', error);
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Easy Feedback Submission",
      description: "Submit feedback about government services with photos, location, and detailed descriptions.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Clock,
      title: "Real-time Tracking",
      description: "Track the status of your feedback in real-time from submission to resolution.",
      color: "text-green-600", 
      bgColor: "bg-green-50"
    },
    {
      icon: BarChart3,
      title: "Transparent Analytics",
      description: "View public dashboards showing government response times and resolution statistics.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Shield,
      title: "Secure & Anonymous",
      description: "Submit feedback anonymously or with your account. Your data is always protected.",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "See community feedback and contribute to improving services for everyone.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Zap,
      title: "AI-Powered Priority",
      description: "Our AI automatically prioritizes urgent issues for faster government response.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Local Resident",
      content: "CivicPulse helped me report a pothole issue that was fixed within 48 hours. Amazing response time!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b4885e2e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Michael Chen",
      role: "Business Owner",
      content: "The transparency dashboard gives me confidence in our local government's responsiveness to citizen concerns.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Emily Rodriguez",
      role: "Student",
      content: "I love how easy it is to submit feedback about public transportation issues. The app is so user-friendly!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
                🚀 Transforming Citizen-Government Communication
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Voice,
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}Our Priority
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                CivicPulse empowers citizens to report issues, track progress, and engage with government services through a modern, transparent platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 btn-hover-lift">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/public-dashboard">
                  <Button size="lg" variant="outline" className="px-8 py-3 btn-hover-lift">
                    View Public Dashboard
                    <BarChart3 className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.total_feedback.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Total Feedback</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.resolved_feedback.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Resolved Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{stats.resolution_rate}%</div>
                  <div className="text-sm text-gray-500">Resolution Rate</div>
                </div>
              </div>
            </div>

            <div className="slide-up">
              <div className="relative">
                {/* Main illustration placeholder */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-white font-medium">Submit Feedback</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-white/20 rounded"></div>
                      <div className="h-3 bg-white/20 rounded w-3/4"></div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-white font-medium">Issue Resolved</div>
                    </div>
                    <div className="text-sm text-white/80">Response time: 2.3 days</div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Star className="w-8 h-8 text-yellow-800" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-green-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Service Categories</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Report issues across various government services and departments
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 6).map((category) => (
                <Card key={category.id} className="card-hover cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <div 
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: category.color }}
                        ></div>
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </CardTitle>
                        <div className="text-sm text-gray-500">{category.department}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {category.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose CivicPulse?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Modern technology meets civic engagement for better government services
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-0 shadow-lg">
                <CardHeader>
                  <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Citizens Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real feedback from real people making a difference in their communities
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make Your Voice Heard?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens already using CivicPulse to improve their communities. 
            Submit your first feedback today and see the difference you can make.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 btn-hover-lift"
              >
                Start Now - It's Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/public-dashboard">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 btn-hover-lift"
              >
                Explore Public Data
                <Globe className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">CivicPulse</span>
              </div>
              <p className="text-gray-400 max-w-md mb-4">
                Empowering citizens to create positive change in their communities through 
                transparent, efficient government service feedback.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Heart className="w-4 h-4 text-red-400" />
                <span>Made with care for better communities</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/public-dashboard" className="hover:text-white transition-colors">Public Dashboard</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CivicPulse. Transforming civic engagement for the digital age.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;