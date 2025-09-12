import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  MapPin,
  Calendar,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PublicDashboard = () => {
  const [stats, setStats] = useState({
    total_feedback: 0,
    resolved_feedback: 0,
    resolution_rate: 0,
    category_stats: [],
    department_stats: [],
    last_updated: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchPublicStats();
  }, []);

  const fetchPublicStats = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API}/public/stats`);
      setStats(response.data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch public stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPublicStats();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResolutionColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Transparency Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Real-time insights into government responsiveness and community feedback. 
            Track how efficiently public services address citizen concerns.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Submit Your Feedback
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Feedback Received
              </CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.total_feedback.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Community submissions
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Issues Resolved
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.resolved_feedback.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Successfully addressed
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Resolution Rate
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getResolutionColor(stats.resolution_rate)}`}>
                {stats.resolution_rate}%
              </div>
              <Progress value={stats.resolution_rate} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Issues
              </CardTitle>
              <Clock className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {(stats.total_feedback - stats.resolved_feedback).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Pending resolution
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="categories" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>By Category</span>
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>By Department</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Category</CardTitle>
                <CardDescription>
                  Distribution of community feedback across different service categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.category_stats.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No category data available yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.category_stats.slice(0, 10).map((category, index) => (
                      <div key={category._id || index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Category {category._id ? category._id.slice(-8) : `${index + 1}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {category.count} submission{category.count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-32">
                            <Progress 
                              value={(category.count / stats.total_feedback) * 100} 
                              className="h-2" 
                            />
                          </div>
                          <Badge variant="secondary">
                            {Math.round((category.count / stats.total_feedback) * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Department</CardTitle>
                <CardDescription>
                  Government department workload and responsiveness metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.department_stats.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No department data available yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.department_stats.slice(0, 10).map((dept, index) => (
                      <div key={dept._id || index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {dept._id || `Department ${index + 1}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {dept.count} issue{dept.count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-32">
                            <Progress 
                              value={(dept.count / stats.total_feedback) * 100} 
                              className="h-2" 
                            />
                          </div>
                          <Badge variant="secondary">
                            {Math.round((dept.count / stats.total_feedback) * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Performance Indicators */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Government Responsiveness</CardTitle>
              <CardDescription className="text-green-700">
                How effectively are citizen concerns being addressed?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">Resolution Rate</span>
                  <span className={`font-bold ${getResolutionColor(stats.resolution_rate)}`}>
                    {stats.resolution_rate}%
                  </span>
                </div>
                <Progress value={stats.resolution_rate} className="h-3" />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.resolved_feedback}
                    </div>
                    <div className="text-sm text-green-700">Resolved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.total_feedback - stats.resolved_feedback}
                    </div>
                    <div className="text-sm text-green-700">Pending</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Community Engagement</CardTitle>
              <CardDescription className="text-blue-700">
                Citizen participation in government feedback system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stats.total_feedback.toLocaleString()}
                  </div>
                  <p className="text-blue-800">Total Community Contributions</p>
                </div>
                
                <div className="flex items-center justify-center space-x-6 mt-6">
                  <div className="text-center">
                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-sm text-blue-700">Citizens</div>
                    <div className="text-sm text-blue-700">Engaged</div>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <div className="text-sm text-blue-700">Issues</div>
                    <div className="text-sm text-blue-700">Resolved</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                    <div className="text-sm text-blue-700">Improving</div>
                    <div className="text-sm text-blue-700">Services</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="py-12">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">
                Be Part of the Change
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Your voice matters! Join thousands of citizens making a real difference 
                in their communities through transparent civic engagement.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3"
                  >
                    Submit Feedback Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
                  >
                    Track Your Submissions
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-12 py-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Last updated: {formatDate(lastRefresh)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <RefreshCw className="w-4 h-4" />
                <span>Data refreshes in real-time</span>
              </span>
            </div>
            
            <div className="text-gray-500">
              <p>Powered by CivicPulse • Making Government Transparent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;