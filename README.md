
'use client';

import { useState } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';

export default function ConnectYouTube() {
  const [isConnected, setIsConnected] = useState(false);
  const [channelInfo, setChannelInfo] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
    onSuccess: async (tokenResponse) => {
      try {
        localStorage.setItem('youtube_token', tokenResponse.access_token);
        const response = await fetch('/api/youtube/channel', {
          headers: {
            'Authorization': `Bearer ${tokenResponse.access_token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setChannelInfo(data);
          setIsConnected(true);
          setError(null);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch channel info');
        }
      } catch (error: any) {
        console.error('Error:', error);
        setError(`Failed to connect YouTube account: ${error.message}`);
      }
    },
    onError: (error) => {
      console.log('Login Failed:', error);
      setError('Failed to connect YouTube account');
    },
  });

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('youtube_token');
    setIsConnected(false);
    setChannelInfo(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Suggest a title based on the filename (removing extension)
      const suggestedTitle = file.name.replace(/\.[^/.]+$/, "");
      setVideoTitle(suggestedTitle);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    const accessToken = localStorage.getItem('youtube_token');
    if (!accessToken) {
      setError('YouTube account not connected');
      return;
    }

    // Validate title
    if (!videoTitle.trim()) {
      setError('Please provide a valid video title');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('title', videoTitle.trim());
    formData.append('description', videoDescription || 'Uploaded via Next.js YouTube Uploader');

    try {
      const response = await fetch('/api/youtube/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedFile(null);
        alert('Video uploaded successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Error uploading video:', error);
      setError(`Failed to upload video: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">YouTube Account Connection</h1>
          <p className="mt-2 text-sm text-gray-600">
            Connect your YouTube account to upload videos directly from this platform.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!isConnected ? (
          <div className="text-center">
            <button
              onClick={() => login()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Connect YouTube Account
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
              {channelInfo && (
                <div className="mt-4 flex items-center">
                  <img
                    src={channelInfo.snippet.thumbnails.default.url}
                    alt="Channel thumbnail"
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{channelInfo.snippet.title}</h3>
                    <p className="text-sm text-gray-500">
                      {channelInfo.statistics?.subscriberCount} subscribers
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-medium text-gray-900">Upload Video</h2>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Video File</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>

              {selectedFile && (
                <div className="mt-4">
                  <p className="text-sm text-gray-700">
                    Selected: <span className="font-medium">{selectedFile.name}</span> (
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                </div>
              )}
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Title*</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Enter video title"
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Description</label>
                <textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Enter video description (optional)"
                  disabled={isUploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-in-out" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 text-center">Uploading... Please wait</p>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className={`px-4 py-2 rounded-md text-white ${
                    !selectedFile || isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  {isUploading ? 'Uploading...' : 'Upload to YouTube'}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                disabled={isUploading}
                className={`px-4 py-2 ${
                  isUploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`}
              >
                Disconnect Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/youtube.upload',
        },
      },
    }),
  ],
};

export default NextAuth(authOptions);

https://github.com/souravmaji1/Videosync/actions/runs/14821682081/artifacts/3057833917
https://github.com/${repoOwner}/${repoName}/actions/runs/${workflowRunId}/artifacts/${artifact.id}/

https://api.github.com/repos/souravmaji1/Videosync/actions/artifacts/3057833917/zip


