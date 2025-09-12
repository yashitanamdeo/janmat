import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import {
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Filter,
  Search,
  Eye,
  Edit,
  RefreshCw,
  Settings,
  Bell
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_feedback: 0,
    pending_feedback: 0,
    in_progress_feedback: 0,
    resolved_feedback: 0,
    urgent_feedback: 0,
    high_priority_feedback: 0,
    recent_feedback_week: 0,
    resolution_rate: 0
  });
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: '',
    search: ''
  });

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates (simulation)
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [statsResponse, feedbackResponse] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/feedback?limit=20&skip=0`)
      ]);
      
      setStats(statsResponse.data);
      setRecentFeedback(feedbackResponse.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (feedbackId, newStatus) => {
    try {
      await axios.put(`${API}/feedback/${feedbackId}`, {
        status: newStatus
      });
      
      toast.success('Feedback status updated successfully');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to update feedback status:', error);
      toast.error('Failed to update feedback status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'dept_head':
        return 'Department Head';
      case 'officer':
        return 'Officer';
      default:
        return role;
    }
  };

  const filteredFeedback = recentFeedback.filter(feedback => {
    if (filters.status && feedback.status !== filters.status) return false;
    if (filters.priority && feedback.priority !== filters.priority) return false;
    if (filters.department && feedback.department !== filters.department) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return feedback.title.toLowerCase().includes(searchLower) ||
             feedback.description.toLowerCase().includes(searchLower);
    }
    return true;
  });

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome, {user?.full_name} • {getRoleDisplayName(user?.role)}
              {user?.department && ` • ${user.department}`}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <Button variant="outline" onClick={fetchDashboardData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Alert for high priority items */}
        {(stats.urgent_feedback > 0 || stats.high_priority_feedback > 0) && (
          <Alert className="mb-8 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Attention Required:</strong> You have {stats.urgent_feedback} urgent and {stats.high_priority_feedback} high priority feedback items that need immediate attention.
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Feedback
              </CardTitle>
              <Users className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.total_feedback}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                +{stats.recent_feedback_week} this week
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Review
              </CardTitle>
              <Clock className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.pending_feedback}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Awaiting action
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                In Progress
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.in_progress_feedback}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Being addressed
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Resolution Rate
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.resolution_rate}%
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {stats.resolved_feedback} resolved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Priority Alerts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Urgent Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-2">
                {stats.urgent_feedback}
              </div>
              <p className="text-red-700 text-sm">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                High Priority
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.high_priority_feedback}
              </div>
              <p className="text-orange-700 text-sm">
                Need prompt response
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Management */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Recent Feedback</CardTitle>
                <CardDescription>
                  Manage and respond to citizen feedback
                </CardDescription>
              </div>
              
              {/* Filters */}
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search feedback..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No feedback found
                </h3>
                <p className="text-gray-600">
                  No feedback matches your current filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedback.map((feedback) => (
                  <div key={feedback.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {feedback.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {feedback.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span>Submitted {formatDate(feedback.created_at)}</span>
                          {feedback.is_anonymous ? (
                            <Badge variant="secondary" className="text-xs">Anonymous</Badge>
                          ) : (
                            <span>• By User {feedback.user_id?.slice(-8)}</span>
                          )}
                          {feedback.ai_urgency_score && (
                            <span>• AI Score: {Math.round(feedback.ai_urgency_score * 100)}%</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <div className="flex items-center space-x-2">
                          <Badge className={`text-xs ${getStatusColor(feedback.status)}`}>
                            {feedback.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(feedback.priority)}`}>
                            {feedback.priority}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          
                          <Select 
                            value={feedback.status} 
                            onValueChange={(value) => handleStatusUpdate(feedback.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Admin Dashboard • Last updated: {formatDate(new Date())}</p>
          <p className="mt-1">
            Showing {user?.role === 'officer' && user?.department ? `${user.department} department` : 'all'} feedback
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;