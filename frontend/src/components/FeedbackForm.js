import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import {
  MapPin,
  Camera,
  Upload,
  X,
  AlertCircle,
  Send,
  User,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FeedbackForm = ({ categories = [] }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    priority: 'medium',
    is_anonymous: false,
    contact_info: {
      name: '',
      email: '',
      phone: ''
    },
    location: null
  });
  
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [name]: value
      }
    }));
  };

  const handleAnonymousToggle = (checked) => {
    setFormData(prev => ({
      ...prev,
      is_anonymous: checked,
      contact_info: checked ? prev.contact_info : {
        name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || ''
      }
    }));
  };

  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    
    selectedFiles.forEach(file => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not supported. Please upload images or videos.`);
        return;
      }
      
      validFiles.push(file);
    });
    
    setFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: null
          }
        }));
        toast.success('Location captured successfully!');
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Failed to get your location. Please try again.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.category_id) newErrors.category_id = 'Category is required';
      
      if (formData.is_anonymous) {
        if (!formData.contact_info.email.trim()) newErrors.contact_email = 'Email is required for anonymous feedback';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare submission data
      const submissionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category_id: formData.category_id,
        priority: formData.priority,
        is_anonymous: formData.is_anonymous,
        location: formData.location
      };
      
      if (formData.is_anonymous) {
        submissionData.contact_info = formData.contact_info;
      }
      
      // Submit feedback
      const response = await axios.post(`${API}/feedback`, submissionData);
      
      toast.success('Feedback submitted successfully!');
      navigate('/feedback');
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to submit feedback. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category_id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Submit Feedback</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Report issues, suggest improvements, or share your experience with government services
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="hidden sm:inline">Feedback Details</span>
            </div>
            <div className={`w-12 h-1 ${currentStep > 1 ? 'bg-blue-600' : 'bg-gray-200'} rounded`}></div>
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="hidden sm:inline">Additional Info</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {currentStep === 1 && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                      <span>Feedback Details</span>
                    </CardTitle>
                    <CardDescription>
                      Provide detailed information about your feedback or issue
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Title *
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Brief summary of your feedback"
                        className={`h-12 ${errors.title ? 'border-red-500 focus:border-red-500' : ''}`}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-600">{errors.title}</p>
                      )}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Category *</Label>
                      <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                        <SelectTrigger className={`h-12 ${errors.category_id ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded"
                                  style={{ backgroundColor: category.color }}
                                ></div>
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category_id && (
                        <p className="text-sm text-red-600">{errors.category_id}</p>
                      )}
                      {selectedCategory && (
                        <div className="text-sm text-gray-600">
                          <strong>Department:</strong> {selectedCategory.department}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Provide detailed information about your feedback, including specific locations, dates, and any relevant context..."
                        rows={6}
                        className={errors.description ? 'border-red-500 focus:border-red-500' : ''}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-600">{errors.description}</p>
                      )}
                      <div className="text-sm text-gray-500">
                        {formData.description.length}/1000 characters
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Priority Level</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">Low</Badge>
                              <span>Non-urgent, general feedback</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>
                              <span>Moderate issue, attention needed</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">High</Badge>
                              <span>Important issue, prompt response needed</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="urgent">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="bg-red-100 text-red-800">Urgent</Badge>
                              <span>Critical issue, immediate attention required</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Anonymous Toggle */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Submit Anonymously</Label>
                          <p className="text-sm text-gray-600">
                            Your identity will not be shared with government officials
                          </p>
                        </div>
                        <Switch
                          checked={formData.is_anonymous}
                          onCheckedChange={handleAnonymousToggle}
                        />
                      </div>

                      {formData.is_anonymous && (
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-700">
                            Please provide contact information for follow-up (this will remain confidential):
                          </p>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="contact_name" className="text-sm">Name</Label>
                              <Input
                                id="contact_name"
                                name="name"
                                value={formData.contact_info.name}
                                onChange={handleContactInfoChange}
                                placeholder="Your name"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="contact_email" className="text-sm">Email *</Label>
                              <Input
                                id="contact_email"
                                name="email"
                                type="email"
                                value={formData.contact_info.email}
                                onChange={handleContactInfoChange}
                                placeholder="your@email.com"
                                className={`mt-1 ${errors.contact_email ? 'border-red-500' : ''}`}
                              />
                              {errors.contact_email && (
                                <p className="text-sm text-red-600 mt-1">{errors.contact_email}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="contact_phone" className="text-sm">Phone (Optional)</Label>
                            <Input
                              id="contact_phone"
                              name="phone"
                              value={formData.contact_info.phone}
                              onChange={handleContactInfoChange}
                              placeholder="+1 (555) 123-4567"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Tips Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">💡 Tips for Better Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Be specific about the location and time of the issue</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Include photos or videos when possible</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Choose the most appropriate category</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p>Provide context and background information</p>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Notice */}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>AI-Powered Priority:</strong> Our system will automatically analyze your feedback to determine urgency and route it to the appropriate department.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>
                    Add location and media files to provide more context
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Location */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Location</Label>
                    <div className="flex items-center space-x-4">
                      <Button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <MapPin className="w-4 h-4" />
                        {locationLoading ? (
                          <span>Getting location...</span>
                        ) : (
                          <span>Use Current Location</span>
                        )}
                      </Button>
                      {formData.location && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Location captured
                        </Badge>
                      )}
                    </div>
                    {formData.location && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <p>Latitude: {formData.location.latitude.toFixed(6)}</p>
                        <p>Longitude: {formData.location.longitude.toFixed(6)}</p>
                      </div>
                    )}
                  </div>

                  {/* File Upload */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Attachments (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Choose Files
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                          Upload images or videos (max 10MB each, up to 5 files)
                        </p>
                      </div>
                    </div>

                    {/* File Preview */}
                    {files.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm">Selected Files:</Label>
                        <div className="space-y-2">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  {file.type.startsWith('image/') ? (
                                    <Camera className="w-5 h-5 text-blue-600" />
                                  ) : (
                                    <Upload className="w-5 h-5 text-blue-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-center space-x-4">
            {currentStep === 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="px-8"
              >
                Back
              </Button>
            )}
            
            {currentStep === 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Submit Feedback</span>
                  </div>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;