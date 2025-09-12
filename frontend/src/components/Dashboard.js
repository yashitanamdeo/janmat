import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Plus,
  Eye,
  BarChart3
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_feedback: 0,
    pending_feedback: 0,
    in_progress_feedback: 0,
    resolved_feedback: 0,
    resolution_rate: 0,
    recent_feedback_week: 0
  });
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's feedback statistics
      const [feedbackResponse] = await Promise.all([
        axios.get(`${API}/feedback?limit=5`)
      ]);
      
      const feedback = feedbackResponse.data;
      setRecentFeedback(feedback);
      
      // Calculate stats from user's feedback
      const totalFeedback = feedback.length;
      const pendingFeedback = feedback.filter(f => f.status === 'pending').length;
      const inProgressFeedback = feedback.filter(f => f.status === 'in_progress').length;
      const resolvedFeedback = feedback.filter(f => f.status === 'resolved').length;
      
      setStats({
        total_feedback: totalFeedback,
        pending_feedback: pendingFeedback,
        in_progress_feedback: inProgressFeedback,
        resolved_feedback: resolvedFeedback,
        resolution_rate: totalFeedback > 0 ? Math.round((resolvedFeedback / totalFeedback) * 100) : 0,
        recent_feedback_week: feedback.filter(f => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(f.created_at) >= weekAgo;
        }).length
      });
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
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
      year: 'numeric'
    });
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-gray-600">
            Track your feedback submissions and see their progress
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link to="/submit-feedback">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Submit New Feedback
            </Button>
          </Link>
          <Link to="/feedback">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Feedback
            </Button>
          </Link>
          <Link to="/public-dashboard">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Public Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Feedback
              </CardTitle>
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.total_feedback}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {stats.recent_feedback_week} submitted this week
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending
              </CardTitle>
              <Clock className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.pending_feedback}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Awaiting review
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
                Resolved
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.resolved_feedback}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {stats.resolution_rate}% resolution rate
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Feedback */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Feedback</span>
                  <Link to="/feedback">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardTitle>
                <CardDescription>
                  Your latest feedback submissions and their status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentFeedback.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No feedback yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start by submitting your first feedback to track issues and improvements.
                    </p>
                    <Link to="/submit-feedback">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Submit Feedback
                      </Button>
                    </Link>
                  </div>
                ) : (
                  recentFeedback.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Link 
                            to={`/feedback/${feedback.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                          >
                            {feedback.title}
                          </Link>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {feedback.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <Badge className={`text-xs ${getStatusColor(feedback.status)}`}>
                            {feedback.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(feedback.priority)}`}>
                            {feedback.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Submitted {formatDate(feedback.created_at)}</span>
                        {feedback.ai_urgency_score && (
                          <span className="flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>AI Score: {(feedback.ai_urgency_score * 100).toFixed(0)}%</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Impact</CardTitle>
                <CardDescription>
                  Track your civic engagement progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Resolution Rate</span>
                    <span>{stats.resolution_rate}%</span>
                  </div>
                  <Progress value={stats.resolution_rate} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Submissions</span>
                    <span className="font-medium">{stats.total_feedback}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Issues Resolved</span>
                    <span className="font-medium text-green-600">{stats.resolved_feedback}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active Issues</span>
                    <span className="font-medium text-blue-600">
                      {stats.pending_feedback + stats.in_progress_feedback}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">💡 Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-blue-800">
                  <p className="mb-2">
                    <strong>Follow up:</strong> Check back regularly for updates on your feedback.
                  </p>
                  <p className="mb-2">
                    <strong>Be specific:</strong> Include photos and exact locations for faster resolution.
                  </p>
                  <p>
                    <strong>Stay engaged:</strong> Rate resolved issues to help improve the system.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-900">Community Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700 mb-1">
                    {stats.total_feedback > 0 ? '🎉' : '🚀'}
                  </div>
                  <p className="text-sm text-green-800">
                    {stats.total_feedback > 0 
                      ? `You've contributed ${stats.total_feedback} feedback${stats.total_feedback > 1 ? 's' : ''} to improve your community!`
                      : 'Ready to make your first contribution to the community?'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;