
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


// Updated Hero Video Section with larger, more attractive reels
<section className="min-h-screen py-20 relative overflow-hidden flex items-center">
  {/* Background gradients */}
  <div className="absolute inset-0 bg-gray-950"></div>
  <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-purple-900/20 rounded-full blur-3xl"></div>
  <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-blue-900/20 rounded-full blur-3xl"></div>
  
  {/* Grid pattern overlay */}
  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6IiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBkPSJNNTkuNSAwdjYwTTAgLjV2NTlNMCAwaDYwTTAgNjBoNjAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InNxdWFyZSIvPjwvc3ZnPg==')]"></div>
  
  <div className="container mx-auto px-4 relative z-10">
    <div className="flex flex-col md:flex-row items-center gap-12">
      <div className="md:w-1/2">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-900/50 border border-gray-800 text-sm font-medium mb-4 backdrop-blur-sm">
          <Sparkles size={16} className="mr-2 text-purple-400" />
          <span>Revolutionary AI Video Platform</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          <span className="block">One video.</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400">Infinite potential.</span>
        </h1>
        <p className="text-gray-300 text-xl mb-8 max-w-xl">
          Transform your content into platform-perfect videos for every social network. Create once, distribute everywhere with AI-powered optimization.
        </p>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <a href="#signup" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-full hover:from-purple-600 hover:to-blue-600 transition font-medium flex items-center justify-center">
            <span>Start Creating Free</span>
            <ArrowRight size={18} className="ml-2" />
          </a>
          <a href="#demo" className="w-full sm:w-auto flex items-center justify-center text-white px-6 py-4 rounded-full bg-gray-900/50 border border-gray-800 hover:bg-gray-800/50 transition backdrop-blur-sm">
            <Play size={18} className="mr-2" />
            <span>Watch Demo</span>
          </a>
        </div>
      </div>

      {/* Enhanced Video Display Section */}
      <div className="md:w-1/2 mt-12 md:mt-0">
        <div className="relative w-full">
          {/* Main featured video - larger size */}
          <div className="relative mx-auto bg-gray-900 rounded-2xl overflow-hidden border-2 border-gray-800 shadow-2xl" style={{ maxWidth: "600px" }}>
            <div className="relative w-full" style={{ paddingBottom: `${activeReel === 0 ? '177.78%' : activeReel === 1 ? '177.78%' : '56.25%'}` }}>
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                src={videoReels[activeReel].src}
              />
              
              {/* Stylish platform indicator badge */}
              <div className="absolute top-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-sm font-semibold border border-gray-700 flex items-center">
                {activeReel === 0 && <Instagram size={16} className="mr-2 text-pink-400" />}
                {activeReel === 1 && <TikTok size={16} className="mr-2 text-teal-400" />}
                {activeReel === 2 && <Youtube size={16} className="mr-2 text-red-400" />}
                <span>{videoReels[activeReel].platform}</span>
              </div>
              
              {/* Video overlay with play button */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 flex items-center justify-center group">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/20 transition group-hover:scale-110 duration-300">
                  <Play size={32} className="text-white ml-1" />
                </div>
              </div>
              
              {/* Caption overlay */}
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-gray-900 to-transparent">
                <div className="text-lg font-medium mb-2">Platform-Perfect Videos</div>
                <div className="text-gray-300 text-sm">Optimized for {videoReels[activeReel].platform}'s algorithm</div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -z-10 -top-10 -right-10 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
          
          {/* Video Selection Controls - cleaner and more stylish */}
          <div className="flex justify-center mt-8 space-x-4">
            {videoReels.map((reel, index) => (
              <button 
                key={index}
                onClick={() => selectReel(index)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeReel === index 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
              >
                {index === 0 && <Instagram size={16} className="inline mr-2" />}
                {index === 1 && <TikTok size={16} className="inline mr-2" />}
                {index === 2 && <Youtube size={16} className="inline mr-2" />}
                {reel.platform}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

// src/remotion/Composition.jsx

import { Composition, AbsoluteFill, useVideoConfig, Video as RemotionVideo, Img, Sequence, Audio } from 'remotion';
import SubtitleOverlay from '../components/SubtitleOverlay';

// VideoComposition component for rendering video or image slideshow
export const VideoComposition = ({
  videoUrls,
  images,
  subtitles,
  styleType,
  duration,
  imageDuration = 3, // Default 3 seconds per image
  audioUrl,
  audioVolume = 1, // Default volume
}) => {
  const { fps } = useVideoConfig();

  // Log props for debugging
  console.log('VideoComposition props:', {
    videoUrls,
    images,
    subtitles,
    styleType,
    duration,
    imageDuration,
    audioUrl,
    audioVolume,
    fps,
  });

  // Validate duration
  const safeDuration = Number(duration) || 30; // Fallback to 30 seconds

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* Audio */}
      {audioUrl && (
        <Audio
          src={audioUrl}
          volume={audioVolume}
          startFrom={0}
          endAt={Math.ceil(safeDuration * fps)}
          onError={(e) => console.error('Audio load error:', e)}
        />
      )}

      {/* Video mode */}
      {videoUrls && Array.isArray(videoUrls) && videoUrls.length > 0 && (
        <>
          {videoUrls.map((video, index) => (
            <Sequence
              key={index}
              from={Math.floor((video.start || 0) * fps)}
              durationInFrames={Math.floor(((video.end || safeDuration) - (video.start || 0)) * fps)}
            >
              <RemotionVideo
                src={video.src || video}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => console.error(`Remotion Video load error for ${video.src || video}:`, e)}
              />
            </Sequence>
          ))}
          <SubtitleOverlay subtitles={subtitles} styleType={styleType} />
        </>
      )}

      {/* Image slideshow mode */}
      {(!videoUrls || videoUrls.length === 0) && images && images.length > 0 && (
        <>
          {images.map((img, index) => (
            <Sequence
              key={index}
              from={index * imageDuration * fps}
              durationInFrames={imageDuration * fps}
            >
              <Img
                src={img}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Sequence>
          ))}
          <SubtitleOverlay subtitles={subtitles} styleType={styleType} />
        </>
      )}

      {/* Fallback if no videos or images */}
      {(!videoUrls || videoUrls.length === 0) && (!images || images.length === 0) && (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#111' }} />
      )}
    </AbsoluteFill>
  );
};

// RemotionComposition component for composition setup
export const RemotionComposition = ({
  videoUrls,
  audioUrl,
  audioVolume,
  images,
  subtitles,
  styleType,
  duration,
  imageDuration,
}) => {
  const fps = 30; // Define fps before usage
  const safeDuration = Number(duration) || 30; // Fallback to 30 seconds
  const durationInFrames = Math.ceil(safeDuration * fps);

  // Log props for debugging
  console.log('RemotionComposition props:', {
    videoUrls,
    audioUrl,
    audioVolume,
    images,
    subtitles,
    styleType,
    duration,
    safeDuration,
    durationInFrames,
    durationType: typeof duration,
  });

  // Validate durationInFrames
  if (isNaN(durationInFrames) || durationInFrames <= 0) {
    console.error('Invalid durationInFrames:', durationInFrames);
    throw new Error('Duration must be a positive number');
  }

  return (
    <Composition
      id="VideoWithSubtitles"
      component={VideoComposition}
      durationInFrames={durationInFrames}
      fps={fps}
      width={606}
      height={1080}
      defaultProps={{
        videoUrls: Array.isArray(videoUrls) ? videoUrls : [],
        images: Array.isArray(images) ? images : [],
        subtitles: Array.isArray(subtitles) ? subtitles : [],
        styleType: styleType || 'none',
        duration: safeDuration,
        imageDuration: Number(imageDuration) || 3,
        audioUrl: audioUrl || '',
        audioVolume: Number(audioVolume) || 1,
      }}
    />
  );
};

name: Render Remotion Video

on:
  repository_dispatch:
    types: [render-video]

jobs:
  render:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install Dependencies
        run: npm install

      - name: Render Video with Remotion
        env:
          VIDEO_URLS: ${{ toJson(github.event.client_payload.videoUrls) }}
          AUDIO_URL: ${{ github.event.client_payload.audioUrl }}
          IMAGES: ${{ toJson(github.event.client_payload.images) }}
          DURATION: ${{ github.event.client_payload.duration }}
          IMAGE_DURATION: ${{ github.event.client_payload.imageDuration }}
          SUBTITLES: ${{ toJson(github.event.client_payload.subtitles) }}
          SUBTITLE_STYLE: ${{ github.event.client_payload.styleType }}
          AUDIO_VOLUME: ${{ github.event.client_payload.audioVolume }}
        run: |
          echo "Rendering video with props:"
          echo "Video URLs: $VIDEO_URLS"
          echo "Audio URL: $AUDIO_URL"
          echo "Duration: $DURATION"
          echo "Audio Volume: $AUDIO_VOLUME"
          npx remotion render VideoWithSubtitles \
            --props "{\"videoUrls\": $VIDEO_URLS, \"audioUrl\": \"$AUDIO_URL\", \"audioVolume\": $AUDIO_VOLUME, \"images\": $IMAGES, \"subtitles\": $SUBTITLES, \"styleType\": \"$SUBTITLE_STYLE\", \"duration\": $DURATION, \"imageDuration\": $IMAGE_DURATION}" \
            --output="rendered-video.mp4"

      - name: Upload Rendered Video as Artifact
        uses: actions/upload-artifact@v4
        with:
          name: rendered-video
          path: "*.mp4"
          retention-days: 7