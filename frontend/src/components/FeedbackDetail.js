import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle,
  Star,
  FileText,
  Camera,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FeedbackDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedbackDetail();
  }, [id]);

  const fetchFeedbackDetail = async () => {
    try {
      setIsLoading(true);
      const [feedbackResponse, categoriesResponse] = await Promise.all([
        axios.get(`${API}/feedback/${id}`),
        axios.get(`${API}/categories`)
      ]);

      const feedbackData = feedbackResponse.data;
      const categories = categoriesResponse.data;
      const feedbackCategory = categories.find(cat => cat.id === feedbackData.category_id);

      setFeedback(feedbackData);
      setCategory(feedbackCategory);
    } catch (error) {
      console.error('Failed to fetch feedback detail:', error);
      if (error.response?.status === 404) {
        setError('Feedback not found');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this feedback');
      } else {
        setError('Failed to load feedback. Please try again.');
      }
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'in_progress':
        return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Your feedback has been received and is awaiting review by the relevant department.';
      case 'in_progress':
        return 'Your feedback is being actively addressed by the responsible team.';
      case 'resolved':
        return 'This issue has been resolved. Thank you for your feedback!';
      case 'rejected':
        return 'This feedback has been reviewed and cannot be addressed at this time.';
      default:
        return 'Status information not available.';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Alert className="max-w-md mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-6">
              <Link to="/feedback">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Feedback List
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/feedback">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Feedback
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {feedback.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted {formatDate(feedback.created_at)}</span>
                </span>
                {feedback.updated_at !== feedback.created_at && (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Updated {formatDate(feedback.updated_at)}</span>
                  </span>
                )}
                <span className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>ID: {feedback.id.slice(-8)}</span>
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2 ml-4">
              <Badge className={`text-sm ${getStatusColor(feedback.status)}`}>
                {feedback.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={`text-sm ${getPriorityColor(feedback.priority)}`}>
                {feedback.priority.toUpperCase()} PRIORITY
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(feedback.status)}
                  <span>Current Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  {getStatusMessage(feedback.status)}
                </p>
                
                {feedback.assigned_to && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Assigned to:</strong> {feedback.assigned_to}
                      {feedback.assigned_at && (
                        <span className="ml-2">
                          on {formatDate(feedback.assigned_at)}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {feedback.resolved_at && (
                  <div className="bg-green-50 p-4 rounded-lg mt-4">
                    <p className="text-sm text-green-800">
                      <strong>Resolved on:</strong> {formatDate(feedback.resolved_at)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {feedback.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Resolution Notes */}
            {feedback.resolution_notes && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Resolution Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-800 whitespace-pre-wrap">
                    {feedback.resolution_notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Media Files */}
            {feedback.media_files && feedback.media_files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="w-5 h-5" />
                    <span>Attachments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {feedback.media_files.map((file, index) => (
                      <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-center space-x-2 mb-2">
                          <Camera className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700 truncate">
                            {file.filename}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {file.file_type} • {(file.file_size / 1024).toFixed(1)} KB
                        </p>
                        <Button size="sm" variant="outline" className="w-full">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Citizen Rating */}
            {feedback.status === 'resolved' && !feedback.citizen_rating && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">Rate This Resolution</CardTitle>
                  <CardDescription className="text-blue-700">
                    Help us improve by rating how satisfied you are with the resolution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                        onClick={() => toast.info('Rating feature coming soon!')}
                      >
                        <Star className="w-6 h-6 text-gray-300 hover:text-yellow-400" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {feedback.citizen_rating && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-yellow-800">Your Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= feedback.citizen_rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-yellow-800 ml-2">
                      {feedback.citizen_rating}/5 stars
                    </span>
                  </div>
                  {feedback.citizen_feedback_text && (
                    <p className="text-yellow-800 text-sm mt-2">
                      "{feedback.citizen_feedback_text}"
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Category</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {category && (
                      <>
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-sm font-medium">{category.name}</span>
                      </>
                    )}
                  </div>
                  {category?.department && (
                    <p className="text-sm text-gray-600 mt-1">
                      Department: {category.department}
                    </p>
                  )}
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-gray-600">Priority</Label>
                  <Badge className={`mt-1 ${getPriorityColor(feedback.priority)}`}>
                    {feedback.priority.toUpperCase()}
                  </Badge>
                </div>

                {feedback.ai_urgency_score && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">AI Urgency Score</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                            style={{ width: `${feedback.ai_urgency_score * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(feedback.ai_urgency_score * 100)}%
                        </span>
                      </div>
                      {feedback.ai_sentiment && (
                        <p className="text-sm text-gray-600 mt-1">
                          Sentiment: {feedback.ai_sentiment}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {feedback.location && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Location</Label>
                      <div className="flex items-start space-x-2 mt-1">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div className="text-sm">
                          <p>Lat: {feedback.location.latitude.toFixed(6)}</p>
                          <p>Lng: {feedback.location.longitude.toFixed(6)}</p>
                          {feedback.location.address && (
                            <p className="text-gray-600 mt-1">{feedback.location.address}</p>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => {
                          const { latitude, longitude } = feedback.location;
                          window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_blank');
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View on Maps
                      </Button>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-gray-600">Submission Type</Label>
                  <div className="flex items-center space-x-1 mt-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {feedback.is_anonymous ? 'Anonymous' : 'Identified'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="text-sm">
                      <p className="font-medium">Feedback Submitted</p>
                      <p className="text-gray-600">{formatDate(feedback.created_at)}</p>
                    </div>
                  </div>

                  {feedback.assigned_at && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                      <div className="text-sm">
                        <p className="font-medium">Assigned for Review</p>
                        <p className="text-gray-600">{formatDate(feedback.assigned_at)}</p>
                      </div>
                    </div>
                  )}

                  {feedback.status === 'in_progress' && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="text-sm">
                        <p className="font-medium">In Progress</p>
                        <p className="text-gray-600">Currently being addressed</p>
                      </div>
                    </div>
                  )}

                  {feedback.resolved_at && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div className="text-sm">
                        <p className="font-medium">Resolved</p>
                        <p className="text-gray-600">{formatDate(feedback.resolved_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 text-sm mb-3">
                  If you have questions about this feedback or need additional assistance:
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full border-blue-300 text-blue-700">
                    Contact Support
                  </Button>
                  <Link to="/submit-feedback">
                    <Button variant="outline" size="sm" className="w-full border-blue-300 text-blue-700">
                      Submit New Feedback
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for labels
const Label = ({ children, className = '' }) => (
  <label className={`block text-sm font-medium ${className}`}>
    {children}
  </label>
);

export default FeedbackDetail;