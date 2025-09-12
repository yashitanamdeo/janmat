import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ArrowUpDown,
  Plus
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FeedbackList = ({ categories = [] }) => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    priority: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feedback, filters]);

  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${API}/feedback?limit=100&skip=0`
      );
      setFeedback(response.data);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedback];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((item) => item.category_id === filters.category);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter((item) => item.priority === filters.priority);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (filters.sortBy === 'created_at' || filters.sortBy === 'updated_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredFeedback(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      category: '',
      priority: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const getStatusStats = () => {
    const pending = feedback.filter((f) => f.status === 'pending').length;
    const inProgress = feedback.filter((f) => f.status === 'in_progress').length;
    const resolved = feedback.filter((f) => f.status === 'resolved').length;
    const rejected = feedback.filter((f) => f.status === 'rejected').length;

    return { pending, inProgress, resolved, rejected, total: feedback.length };
  };

  const stats = getStatusStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Feedback</h1>
            <p className="text-gray-600">Track and manage all your submitted feedback</p>
          </div>
          <Link to="/submit-feedback">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white mt-4 sm:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Submit New Feedback
            </Button>
          </Link>
        </div>

        {/* Stats Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <span>All</span>
              <Badge variant="secondary">{stats.total}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Pending</span>
              <Badge variant="secondary">{stats.pending}</Badge>
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">In Progress</span>
              <Badge variant="secondary">{stats.inProgress}</Badge>
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Resolved</span>
              <Badge variant="secondary">{stats.resolved}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center space-x-2">
              <span className="hidden sm:inline">Rejected</span>
              <Badge variant="secondary">{stats.rejected}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Filters */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filters & Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search feedback..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Priority Filter */}
                <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-desc">Newest first</SelectItem>
                    <SelectItem value="created_at-asc">Oldest first</SelectItem>
                    <SelectItem value="updated_at-desc">Recently updated</SelectItem>
                    <SelectItem value="priority-desc">Priority: High to Low</SelectItem>
                    <SelectItem value="priority-asc">Priority: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(filters.search || filters.status || filters.category || filters.priority) && (
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback List */}
          <TabsContent value="all" className="mt-6">
            <FeedbackGrid 
              feedback={filteredFeedback} 
              categories={categories}
              getCategoryName={getCategoryName}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <FeedbackGrid 
              feedback={filteredFeedback.filter(f => f.status === 'pending')} 
              categories={categories}
              getCategoryName={getCategoryName}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="in_progress" className="mt-6">
            <FeedbackGrid 
              feedback={filteredFeedback.filter(f => f.status === 'in_progress')} 
              categories={categories}
              getCategoryName={getCategoryName}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="resolved" className="mt-6">
            <FeedbackGrid 
              feedback={filteredFeedback.filter(f => f.status === 'resolved')} 
              categories={categories}
              getCategoryName={getCategoryName}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <FeedbackGrid 
              feedback={filteredFeedback.filter(f => f.status === 'rejected')} 
              categories={categories}
              getCategoryName={getCategoryName}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Feedback Grid Component
const FeedbackGrid = ({ 
  feedback, 
  categories,
  getCategoryName, 
  getStatusColor, 
  getPriorityColor, 
  formatDate 
}) => {
  if (feedback.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
            <p className="text-gray-600 mb-4">
              No feedback matches your current filters.
            </p>
            <Link to="/submit-feedback">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Submit Your First Feedback
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <Card key={item.id} className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Link 
                  to={`/feedback/${item.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-1"
                >
                  {item.title}
                </Link>
                <p className="text-gray-600 mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2 ml-4">
                <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                  {item.status.replace('_', ' ')}
                </Badge>
                <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                  {item.priority}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Submitted {formatDate(item.created_at)}</span>
              </span>
              
              <span className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>{getCategoryName(item.category_id)}</span>
              </span>

              {item.location && (
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Location provided</span>
                </span>
              )}

              {item.ai_urgency_score && (
                <span className="flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>AI Score: {(item.ai_urgency_score * 100).toFixed(0)}%</span>
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {item.updated_at !== item.created_at && (
                  <span>Last updated {formatDate(item.updated_at)}</span>
                )}
              </div>
              
              <Link to={`/feedback/${item.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeedbackList;