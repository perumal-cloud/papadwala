'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  profilePicture?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchUserProfile(token);
  }, [router]);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setName(data.user.name);
        setProfilePicture(data.user.profilePicture || '');
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          profilePicture: profilePicture.trim() || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        // Update the header by triggering a re-fetch
        window.dispatchEvent(new Event('userProfileUpdated'));
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('An error occurred while updating your profile');
    } finally {
      setUpdating(false);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture('');
    setSuccess('Profile picture removed. Click "Update Profile" to save.');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setSelectedImage(file);
      setError('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      // Validate file size (5MB max)
      if (imageFile.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(imageFile);
      setError('');
    } else {
      setError('Please drop a valid image file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const uploadImageToCloudinary = async () => {
    if (!selectedImage) {
      setError('Please select an image to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', selectedImage);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/users/upload-profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const data = await response.json();
        setProfilePicture(data.imageUrl);
        setSelectedImage(null);
        setSuccess('Profile image uploaded successfully! Click "Update Profile" to save.');
        
        // Clear the file input
        const fileInput = document.getElementById('profileImageFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload image');
      }
    } catch (error) {
      setError('An error occurred while uploading the image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Image Card - Top Center */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
            <div className="text-center">
              {/* Profile Image */}
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-white">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.setAttribute('style', 'display: flex');
                      }}
                    />
                  ) : null}
                  <span className={`text-white text-6xl font-bold ${user.profilePicture ? 'hidden' : ''}`}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              
              {/* User Info */}
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full text-sm font-medium capitalize shadow-md">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Profile Form */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Update Profile
              </h2>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                    minLength={2}
                    maxLength={50}
                  />
                </div>

                <div>
                  <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  
                  {/* Current Profile Picture */}
                  {profilePicture && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Current Picture:</p>
                        <button
                          type="button"
                          onClick={removeProfilePicture}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove Picture
                        </button>
                      </div>
                      <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center overflow-hidden">
                        <img 
                          src={profilePicture} 
                          alt="Current profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling!.setAttribute('style', 'display: flex');
                          }}
                        />
                        <span className="text-white text-sm font-medium">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Upload Section */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 transition-colors mb-4 ${
                      dragActive ? 'border-teal-400 bg-teal-50' : 'border-gray-300'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Upload Profile Picture</h4>
                        <p className="text-xs text-gray-500 mb-4">
                          Drag and drop an image here or click to select
                        </p>
                        
                        <input
                          type="file"
                          id="profileImageFile"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                        />

                        {selectedImage && (
                          <div className="mt-3 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg w-full">
                            <strong>Selected file:</strong> {selectedImage.name}
                          </div>
                        )}

                        {isUploading && (
                          <div className="w-full mt-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Uploading to Cloudinary...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <button
                          type="button"
                          onClick={uploadImageToCloudinary}
                          disabled={!selectedImage || isUploading}
                          className="mt-4 px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isUploading ? 'Uploading...' : 'Upload to Cloudinary'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    Upload an image (JPG, PNG, GIF, or WebP) to use as your profile picture. Images will be optimized and stored securely.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updating ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Account Information */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account Information
              </h3>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span className="text-sm text-gray-500 font-medium">Email Address</span>
                  </div>
                  <p className="text-gray-900 font-semibold">{user.email}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm text-gray-500 font-medium">Account Role</span>
                  </div>
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full text-sm font-medium capitalize shadow-sm">
                    {user.role}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-500 font-medium">Verification Status</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.isVerified ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <p className={`font-semibold ${user.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {user.isVerified ? 'Verified Account' : 'Unverified Account'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8V9m0 6h0m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-500 font-medium">Member Since</span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-500 font-medium">Last Updated</span>
                  </div>
                  <p className="text-gray-900 font-semibold">
                    {new Date(user.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}