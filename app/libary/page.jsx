'use client'
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

import {
  Video,
  Folder,

  ChevronRight,
  Home,
  Settings,

  X,
  HelpCircle,
  Plus,

  Sparkles,
  Play,
 
  Star,
  Zap,

 
  Download,

  Trash2,
  List,
  Grid,

  Search,
  ChevronDown,
  Upload as UploadIcon,
  BabyIcon as Youtube,
 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function VideoLibraryPage() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNav, setSelectedNav] = useState('library');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [platform, setPlatform] = useState(null);
  const [googleAccount, setGoogleAccount] = useState(null);
  const [uploadSettings, setUploadSettings] = useState({
    privacyStatus: 'private',
    titleTemplate: '{filename}',
    description: '',
    categoryId: '22' // Default to "People & Blogs"
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [youtubeChannel, setYoutubeChannel] = useState(null);
  // Fetch user's videos and Google account from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch videos
        const { data: videosData, error: videosError } = await supabase
          .from('user_videos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (videosError) throw videosError;

        // Fetch Google account if exists
        const { data: googleData, error: googleError } = await supabase
          .from('user_google_accounts')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (googleError && googleError.code !== 'PGRST116') throw googleError;

        setVideos(videosData || []);
        setGoogleAccount(googleData || null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Toggle video selection
  const toggleVideoSelection = (videoId) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId) 
        : [...prev, videoId]
    );
  };

  // Select all videos
  const selectAllVideos = () => {
    if (selectedVideos.length === videos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(videos.map(video => video.id));
    }
  };

  // Handle YouTube upload
 // ... (previous imports remain the same)
 useEffect(() => {
  if (!googleAccount?.access_token) return;

  const fetchYoutubeChannel = async () => {
    try {
      const response = await fetch('/api/youtube/channel', {
        headers: {
          'Authorization': `Bearer ${googleAccount.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setYoutubeChannel(data);
      } else {
        throw new Error('Failed to fetch channel info');
      }
    } catch (error) {
      console.error('Error fetching YouTube channel:', error);
      setError('Failed to load YouTube channel information');
    }
  };

  fetchYoutubeChannel();
}, [googleAccount]);
// Modify the handleYouTubeUpload function:
const handleYouTubeUpload = async () => {
  if (selectedVideos.length === 0 || !googleAccount) return;
  
  setIsProcessing(true);
  setProgress(0);
  setError(null);
  
  try {
    // Check if token is expired and refresh if needed
    let accessToken = googleAccount.access_token;
    if (Date.now() > googleAccount.expires_at) {
      const refreshResponse = await fetch('/api/youtube/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: googleAccount.refresh_token
        })
      });
      
      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh access token');
      }
      
      const { access_token, expires_in } = await refreshResponse.json();
      accessToken = access_token;
      
      // Update Supabase with new token
      await supabase
        .from('user_google_accounts')
        .update({
          access_token,
          expires_at: Date.now() + (expires_in * 1000)
        })
        .eq('user_id', user.id);
    }

    // Upload each selected video
    for (let i = 0; i < selectedVideos.length; i++) {
      const videoId = selectedVideos[i];
      const video = videos.find(v => v.id === videoId);
      
      if (!video) continue;

      // Get the filename from the video_url if name doesn't exist
      const filename = video.name || video.video_url.split('/').pop() || `video-${Date.now()}`;
      
      // Generate title from template
      const videoTitle = uploadSettings.titleTemplate
        .replace('{filename}', filename.replace(/\.[^/.]+$/, ""))
        .replace('{date}', new Date().toLocaleDateString())
        .replace('{n}', i + 1);

      setProgress((i / selectedVideos.length) * 100);
      
      // Fetch the video file
      const videoResponse = await fetch(video.video_url);
      if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video file: ${video.video_url}`);
      }
      
      const videoBlob = await videoResponse.blob();
      const videoFile = new File([videoBlob], filename, { type: videoBlob.type });

      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', videoTitle);
      formData.append('description', uploadSettings.description || 'Uploaded via VideoSync');
      formData.append('privacyStatus', uploadSettings.privacyStatus);
      formData.append('categoryId', uploadSettings.categoryId);

      const uploadResponse = await fetch('/api/youtube/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      // Update progress
      setProgress(((i + 1) / selectedVideos.length) * 100);
    }
    
    // Reset after successful upload
    setSelectedVideos([]);
    setPlatform(null);
    setSuccess(`${selectedVideos.length} video${selectedVideos.length > 1 ? 's' : ''} uploaded successfully!`);
    setTimeout(() => setSuccess(null), 5000);
  } catch (error) {
    console.error('Upload error:', error);
    setError(`Upload failed: ${error.message}`);
  } finally {
    setIsProcessing(false);
  }
};

  // Filter videos based on search and filter options
  const filteredVideos = videos.filter(video => {
    // Apply search filter
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         video.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply type filter
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'recent' && new Date(video.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (filter === 'favorites' && video.is_favorite);
    
    return matchesSearch && matchesFilter;
  });

  // Navigation item component for sidebar
  const NavItem = ({ icon, label, active, onClick }) => {
    return (
      <li>
        <button 
          onClick={onClick}
          className={`w-full flex items-center py-3 px-4 rounded-xl transition-all duration-300 group
          ${active 
            ? 'bg-gradient-to-r from-purple-900/60 to-blue-900/40 text-white shadow-md shadow-purple-900/20' 
            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:shadow-sm hover:shadow-purple-900/10'}`}
        >
          <div className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300
            ${active 
              ? 'bg-gradient-to-br from-purple-500/30 to-blue-500/30 text-purple-300' 
              : 'text-gray-400 group-hover:text-purple-300'}`}>
            {icon}
          </div>
          {sidebarOpen && (
            <div className="ml-3 flex-1 flex flex-col items-start overflow-hidden">
              <span className={`font-medium transition-all ${active ? 'text-white' : ''}`}>{label}</span>
              {active && <div className="w-8 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 mt-1 rounded-full"></div>}
            </div>
          )}
          {active && sidebarOpen && (
            <div className="w-1.5 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full mr-1"></div>
          )}
        </button>
      </li>
    );
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden relative">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 opacity-50">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-purple-900/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '15s' }}></div>
          <div className="absolute bottom-1/3 right-1/3 w-1/2 h-1/2 bg-blue-900/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '20s' }}></div>
        </div>
      </div>
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-gray-900/90 backdrop-blur-md border-r border-gray-800/50 transition-all duration-300 flex flex-col z-10`}>
        {/* Brand Header */}
        <div className="py-6 border-b border-gray-800/50 transition-all">
          <div className={`px-6 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen ? (
              <div className="flex items-center">
                <div className="relative w-12 h-12 mr-4 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center">
                    <Video size={24} className="text-white z-10" />
                    <div className="absolute w-12 h-12 bg-white/20 rounded-full blur-lg animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/40"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">VideoSync</h1>
                  <p className="text-xs text-gray-400">AI Video Platform</p>
                </div>
              </div>
            ) : (
              <div className="relative w-12 h-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center">
                  <Video size={24} className="text-white z-10" />
                  <div className="absolute w-12 h-12 bg-white/20 rounded-full blur-lg animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-blue-500/40"></div>
                </div>
              </div>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800/50 transition-all"
            >
              {sidebarOpen ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <ScrollArea className="flex-1 py-6 px-4">
          <div className="mb-8">
            {sidebarOpen && (
              <div className="flex items-center justify-between px-4 mb-4">
                <h3 className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Main Menu</h3>
                <div className="w-8 h-0.5 bg-gray-800 rounded-full"></div>
              </div>
            )}
            <ul className="space-y-2">
              <NavItem 
                icon={<Home size={20} />} 
                label="Dashboard" 
                active={selectedNav === 'dashboard'}
                onClick={() => setSelectedNav('dashboard')} 
              />
              <NavItem 
                icon={<Video size={20} />} 
                label="Video Library" 
                active={selectedNav === 'library'} 
                onClick={() => setSelectedNav('library')}
              />
              <NavItem 
                icon={<Settings size={20} />} 
                label="Settings" 
                active={selectedNav === 'settings'} 
                onClick={() => setSelectedNav('settings')}
              />
            </ul>
          </div>

          {sidebarOpen && (
            <div className="mt-8">
              <div className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-blue-900/40"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
                
                <div className="relative p-6 backdrop-blur-sm border border-purple-500/20 rounded-2xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-xl border border-purple-500/20 shadow-inner shadow-purple-500/10">
                      <Sparkles size={20} className="text-purple-300" />
                    </div>
                    <h4 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Pro Features</h4>
                  </div>
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                    Unlock AI video enhancements, unlimited storage, and team collaboration.
                  </p>
                  <button className="w-full py-3 text-sm font-medium rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 flex items-center justify-center group">
                    <Zap size={16} className="mr-2 group-hover:animate-pulse" />
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
        
        {/* Create New Project Button */}
        <div className="p-4 border-t border-gray-800/50">
          <button className="w-full flex items-center justify-center py-4 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 group relative overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/0 via-white/20 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 transform -translate-x-full group-hover:translate-x-full"></div>
            {sidebarOpen ? (
              <>
                <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium">Create New Project</span>
              </>
            ) : (
              <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col z-10">
        {/* Navbar */}
        <header className="bg-gray-900/70 backdrop-blur-md border-b border-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="hidden md:flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition">Tutorials</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition">Templates</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition">Support</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800/50 transition">
                <HelpCircle size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-purple-500"></span>
              </button>
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-sm font-medium cursor-pointer border-2 border-transparent hover:border-white transition-all">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                    Video Library
                  </h1>
                  <p className="text-gray-400 mt-2">
                    {selectedVideos.length > 0 
                      ? `${selectedVideos.length} video${selectedVideos.length > 1 ? 's' : ''} selected`
                      : `${videos.length} video${videos.length !== 1 ? 's' : ''} in your library`}
                  </p>
                </div>
                
                {selectedVideos.length > 0 && (
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      className="bg-gray-900 border-gray-700 hover:bg-gray-800 text-gray-300"
                      onClick={() => setSelectedVideos([])}
                    >
                      Clear Selection
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white"
                      onClick={() => setPlatform('youtube')}
                    >
                      <Youtube size={18} className="mr-2" />
                      Upload to YouTube
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-900/30 border border-green-800 rounded-lg flex items-start">
                <CheckCircle className="text-green-400 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-green-300">Success</h4>
                  <p className="text-sm text-green-400 mt-1">{success}</p>
                </div>
                <button 
                  onClick={() => setSuccess(null)}
                  className="ml-auto text-green-400 hover:text-green-300"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* YouTube Upload Modal */}
            {platform === 'youtube' && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-lg">
                  <h2 className="text-2xl font-bold mb-4">
                    {isProcessing ? (
                      `Uploading to YouTube (${Math.round(progress)}%)`
                    ) : (
                      `Upload ${selectedVideos.length} video${selectedVideos.length > 1 ? 's' : ''} to YouTube`
                    )}
                  </h2>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {isProcessing ? (
                    <div className="space-y-4">
                      <Progress value={progress} className="h-2" />
                      <p className="text-gray-400 text-sm">
                        {progress < 30 && 'Preparing videos for upload...'}
                        {progress >= 30 && progress < 70 && 'Uploading to YouTube...'}
                        {progress >= 70 && progress < 100 && 'Finalizing upload...'}
                        {progress === 100 && 'Upload complete!'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {googleAccount ? (
                        <>
                          <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                            <img
                              src={googleAccount.picture}
                              alt="Google profile"
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <h4 className="font-medium">{googleAccount.name}</h4>
                              <p className="text-sm text-gray-400">{googleAccount.email}</p>
                            </div>
                          </div>
                          {youtubeChannel ? (
  <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700 mb-4">
    <img
      src={youtubeChannel.snippet.thumbnails.default.url}
      alt="YouTube channel"
      className="w-12 h-12 rounded-full border-2 border-red-500/50"
    />
    <div>
      <h4 className="font-medium">{youtubeChannel.snippet.title}</h4>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
        {youtubeChannel.statistics?.subscriberCount && (
          <span>{youtubeChannel.statistics.subscriberCount} subscribers</span>
        )}
        {youtubeChannel.statistics?.videoCount && (
          <span>{youtubeChannel.statistics.videoCount} videos</span>
        )}
        {youtubeChannel.statistics?.viewCount && (
          <span>{parseInt(youtubeChannel.statistics.viewCount).toLocaleString()} views</span>
        )}
      </div>
      {youtubeChannel.snippet.description && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
          {youtubeChannel.snippet.description}
        </p>
      )}
    </div>
  </div>
) : (
  <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700 mb-4 animate-pulse">
    <div className="w-12 h-12 rounded-full bg-gray-700"></div>
    <div className="space-y-2">
      <div className="h-4 w-32 bg-gray-700 rounded"></div>
      <div className="h-3 w-24 bg-gray-700 rounded"></div>
    </div>
  </div>
)}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Privacy Setting</label>
                              <select
                                value={uploadSettings.privacyStatus}
                                onChange={(e) => setUploadSettings({...uploadSettings, privacyStatus: e.target.value})}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                              >
                                <option value="public">Public</option>
                                <option value="unlisted">Unlisted</option>
                                <option value="private">Private</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Title Template</label>
                              <input
                                type="text"
                                value={uploadSettings.titleTemplate}
                                onChange={(e) => setUploadSettings({...uploadSettings, titleTemplate: e.target.value})}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                                placeholder="e.g., {filename} - Part {n}"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Available variables: <code className="bg-gray-800 px-1 rounded">{`{filename}`}</code>,{' '}
                                <code className="bg-gray-800 px-1 rounded">{`{date}`}</code>,{' '}
                                <code className="bg-gray-800 px-1 rounded">{`{n}`}</code>
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                              <textarea
                                value={uploadSettings.description}
                                onChange={(e) => setUploadSettings({...uploadSettings, description: e.target.value})}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white min-h-[100px]"
                                placeholder="Optional description for all videos"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                              <select
                                value={uploadSettings.categoryId}
                                onChange={(e) => setUploadSettings({...uploadSettings, categoryId: e.target.value})}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                              >
                                <option value="1">Film & Animation</option>
                                <option value="2">Autos & Vehicles</option>
                                <option value="10">Music</option>
                                <option value="15">Pets & Animals</option>
                                <option value="17">Sports</option>
                                <option value="20">Gaming</option>
                                <option value="22">People & Blogs</option>
                                <option value="23">Comedy</option>
                                <option value="24">Entertainment</option>
                                <option value="25">News & Politics</option>
                                <option value="26">Howto & Style</option>
                                <option value="27">Education</option>
                                <option value="28">Science & Technology</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-3 pt-4">
                            <Button 
                              variant="outline" 
                              className="border-gray-700 hover:bg-gray-800"
                              onClick={() => setPlatform(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500"
                              onClick={handleYouTubeUpload}
                            >
                              <UploadIcon size={18} className="mr-2" />
                              Start Upload
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                          <h3 className="text-xl font-medium mb-2">No Google Account Connected</h3>
                          <p className="text-gray-400 mb-6">
                            You need to connect your Google account in Settings to upload to YouTube.
                          </p>
                          <div className="flex justify-center space-x-3">
                            <Button 
                              variant="outline"
                              className="border-gray-700 hover:bg-gray-800"
                              onClick={() => setPlatform(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                              onClick={() => {
                                setPlatform(null);
                                setSelectedNav('settings');
                              }}
                            >
                              Go to Settings
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search videos..."
                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <select
                    className="appearance-none pl-3 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">All Videos</option>
                    <option value="recent">Recent</option>
                    <option value="favorites">Favorites</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} className="mr-2" />
                  Grid
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-400'}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} className="mr-2" />
                  List
                </Button>
              </div>
            </div>

            {/* Video List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-16">
                <Folder size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-300 mb-2">No videos found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchQuery ? 'No videos match your search.' : 'You haven\'t uploaded any videos yet.'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map((video) => (
                  <div 
                    key={video.id} 
                    className={`relative border rounded-xl overflow-hidden transition-all group
                      ${selectedVideos.includes(video.id) 
                        ? 'border-purple-500 ring-2 ring-purple-500/30' 
                        : 'border-gray-800 hover:border-gray-700'}`}
                  >
                    <div className="absolute top-3 left-3 z-10">
                      <Checkbox 
                        checked={selectedVideos.includes(video.id)}
                        onCheckedChange={() => toggleVideoSelection(video.id)}
                        className={`h-5 w-5 rounded-md border-2 
                          ${selectedVideos.includes(video.id) 
                            ? 'bg-purple-600 border-purple-600' 
                            : 'bg-gray-900 border-gray-600'}`}
                      />
                    </div>
                    
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                      <video 
                        src={video.video_url}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <div className="flex space-x-2">
                          <button className="p-2 bg-gray-800/80 rounded-full hover:bg-gray-700/80 transition">
                            <Play size={18} className="text-white" />
                          </button>
                          <button className="p-2 bg-gray-800/80 rounded-full hover:bg-gray-700/80 transition">
                            <Download size={18} className="text-white" />
                          </button>
                          <button className="p-2 bg-gray-800/80 rounded-full hover:bg-gray-700/80 transition">
                            <Trash2 size={18} className="text-white" />
                          </button>
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-900/50">
                      <h3 className="font-medium truncate">{video.title}</h3>
                      <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                        <span>{new Date(video.created_at).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-2">
                          <button className="hover:text-yellow-400 transition">
                            <Star size={16} fill={video.is_favorite ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-900/50 border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                        <Checkbox 
                          checked={selectedVideos.length === videos.length && videos.length > 0}
                          onCheckedChange={selectAllVideos}
                          className="h-4 w-4 rounded border-gray-600"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {filteredVideos.map((video) => (
                      <tr 
                        key={video.id} 
                        className={`hover:bg-gray-900/30 transition
                          ${selectedVideos.includes(video.id) ? 'bg-purple-900/10' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Checkbox 
                            checked={selectedVideos.includes(video.id)}
                            onCheckedChange={() => toggleVideoSelection(video.id)}
                            className="h-4 w-4 rounded border-gray-600"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-16 bg-gray-800 rounded overflow-hidden relative">
                              <video 
                                src={video.video_url}
                                className="absolute inset-0 w-full h-full object-cover"
                                muted
                                playsInline
                              />
                              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xxs px-1 rounded">
                                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{video.title}</div>
                              <div className="text-sm text-gray-400 line-clamp-1">{video.description || 'No description'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(video.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          <div className="flex space-x-2">
                            <button className="p-1.5 hover:bg-gray-800 rounded transition">
                              <Play size={16} className="text-gray-400 hover:text-white" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-800 rounded transition">
                              <Download size={16} className="text-gray-400 hover:text-white" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-800 rounded transition">
                              <Trash2 size={16} className="text-gray-400 hover:text-white" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}