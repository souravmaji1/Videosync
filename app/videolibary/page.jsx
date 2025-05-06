'use client'
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';
import {
  Video, Folder, ChevronRight, Home, Settings, X, HelpCircle, Plus, Sparkles, Play, Star, Zap,
  Download, Trash2, List, Grid, Search, ChevronDown, Upload as UploadIcon, Youtube, AlertCircle, CheckCircle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function VideoLibraryPage() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNav, setSelectedNav] = useState('library');
  const [videos, setVideos] = useState([]);
  const [renderWorkflows, setRenderWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch videos and render workflows from Supabase
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user videos
        const { data: videoData, error: videoError } = await supabase
          .from('user_videos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (videoError) {
          console.error('Error fetching videos:', videoError);
          return;
        }

        // Ensure all videos have a name
        const sanitizedVideos = (videoData || []).map(video => ({
          ...video,
          name: video.name || `Untitled Video ${video.id || Date.now()}`
        }));

        setVideos(sanitizedVideos);

        // Fetch render workflows
        const { data: workflowData, error: workflowError } = await supabase
          .from('render_workflows')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (workflowError) {
          console.error('Error fetching render workflows:', workflowError);
          return;
        }

        setRenderWorkflows(workflowData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Poll GitHub workflow status for in-progress workflows
  useEffect(() => {
    if (!renderWorkflows.length) return;

    const githubToken = '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';
    const repoOwner = 'souravmaji1';
    const repoName = 'Videosync';

    const pollWorkflows = async () => {
      const updatedWorkflows = [...renderWorkflows];

      for (const workflow of updatedWorkflows) {
        if (workflow.status === 'completed' || workflow.status === 'failed') continue;

        try {
          const response = await fetch(
            `https://api.github.com/repos/${repoOwner}/${repoName}/actions/runs/${workflow.workflow_id}`,
            {
              headers: {
                Authorization: `Bearer ${githubToken}`,
                Accept: 'application/vnd.github.v3+json'
              }
            }
          );

          if (!response.ok) {
            console.error(`Failed to fetch workflow ${workflow.workflow_id} status: ${response.statusText}`);
            continue;
          }

          const runData = await response.json();
          let newStatus = runData.status === 'completed' ? (runData.conclusion === 'success' ? 'completed' : 'failed') : runData.status;

          if (newStatus !== workflow.status) {
            const updateData = { status: newStatus };

            if (newStatus === 'completed' && runData.conclusion === 'success') {
              // Fetch artifact
              const artifactsResponse = await fetch(
                `https://api.github.com/repos/${repoOwner}/${repoName}/actions/runs/${workflow.workflow_id}/artifacts`,
                {
                  headers: {
                    Authorization: `Bearer ${githubToken}`,
                    Accept: 'application/vnd.github.v3+json'
                  }
                }
              );

              if (artifactsResponse.ok) {
                const artifactsData = await artifactsResponse.json();
                const videoArtifact = artifactsData.artifacts.find(artifact => artifact.name === 'rendered-video');

                if (videoArtifact) {
                  const downloadResponse = await fetch(videoArtifact.archive_download_url, {
                    headers: {
                      Authorization: `Bearer ${githubToken}`,
                      Accept: 'application/vnd.github.v3+json'
                    }
                  });

                  if (downloadResponse.ok) {
                    const artifactZip = await downloadResponse.arrayBuffer();
                    const zip = new JSZip();
                    const zipContent = await zip.loadAsync(artifactZip);
                    const mp4File = Object.values(zipContent.files).find(file => file.name.endsWith('.mp4'));

                    if (!mp4File) {
                      console.error(`No MP4 file found in artifact ZIP for workflow ${workflow.workflow_id}`);
                      newStatus = 'failed';
                    } else {
                      const mp4Blob = await mp4File.async('blob');
                      const fileName = `rendered_${workflow.segment_index}_${Date.now()}.mp4`;

                      // Upload to Supabase storage
                      const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('avatars')
                        .upload(`rendered/${fileName}`, mp4Blob, {
                          contentType: 'video/mp4'
                        });

                      if (uploadError) {
                        console.error(`Failed to upload rendered video for workflow ${workflow.workflow_id}:`, uploadError);
                        newStatus = 'failed';
                      } else {
                        const { data: urlData } = supabase.storage
                          .from('avatars')
                          .getPublicUrl(`rendered/${fileName}`);

                        updateData.video_url = urlData.publicUrl;
                        updateData.duration = workflow.duration;

                        // Add to user_videos with a guaranteed name
                        const videoName = `Rendered Segment ${workflow.segment_index + 1}`;
                        const { error: videoInsertError } = await supabase
                          .from('user_videos')
                          .insert({
                            user_id: user.id,
                            video_url: urlData.publicUrl,
                            name: videoName,
                            created_at: new Date().toISOString(),
                            duration: workflow.duration
                          });

                        if (videoInsertError) {
                          console.error('Failed to insert video into user_videos:', videoInsertError);
                        } else {
                          setVideos(prev => [{
                            user_id: user.id,
                            video_url: urlData.publicUrl,
                            name: videoName,
                            created_at: new Date().toISOString(),
                            duration: workflow.duration
                          }, ...prev]);
                        }
                      }
                    }
                  } else {
                    console.error(`Failed to download artifact for workflow ${workflow.workflow_id}: ${downloadResponse.statusText}`);
                    newStatus = 'failed';
                  }
                } else {
                  console.error(`No rendered-video artifact found for workflow ${workflow.workflow_id}`);
                  newStatus = 'failed';
                }
              } else {
                console.error(`Failed to fetch artifacts for workflow ${workflow.workflow_id}: ${artifactsResponse.statusText}`);
                newStatus = 'failed';
              }
            }

            // Update workflow status in Supabase
            const { error: updateError } = await supabase
              .from('render_workflows')
              .update(updateData)
              .eq('id', workflow.id);

            if (updateError) {
              console.error(`Failed to update workflow ${workflow.workflow_id} status:`, updateError);
            } else {
              workflow.status = newStatus;
              if (updateData.video_url) workflow.video_url = updateData.video_url;
            }
          }
        } catch (error) {
          console.error(`Error polling workflow ${workflow.workflow_id}:`, error);
        }
      }

      setRenderWorkflows(updatedWorkflows);
    };

    const interval = setInterval(pollWorkflows, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [renderWorkflows, user]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSelectVideo = (videoId) => {
    setSelectedVideos(prev =>
      prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedVideos.length) return;

    try {
      const filePaths = videos
        .filter(video => selectedVideos.includes(video.id))
        .map(video => video.video_url.split('/avatars/')[1]);

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('avatars')
        .remove(filePaths);

      if (storageError) {
        console.error('Error deleting videos from storage:', storageError);
        return;
      }

      // Delete from user_videos
      const { error: deleteError } = await supabase
        .from('user_videos')
        .delete()
        .in('id', selectedVideos);

      if (deleteError) {
        console.error('Error deleting videos:', deleteError);
        return;
      }

      setVideos(prev => prev.filter(video => !selectedVideos.includes(video.id)));
      setSelectedVideos([]);
    } catch (error) {
      console.error('Error deleting videos:', error);
    }
  };

  const handleDownloadSelected = () => {
    selectedVideos.forEach(videoId => {
      const video = videos.find(v => v.id === videoId);
      if (video) {
        const link = document.createElement('a');
        link.href = video.video_url;
        link.download = video.name || 'video.mp4';
        link.click();
      }
    });
  };

  const filteredVideos = videos.filter(video => {
    if (filter === 'all') return true;
    if (filter === 'youtube' && video.video_url.includes('youtube')) return true;
    return false;
  }).filter(video => {
    const videoName = (video.name || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();
    return videoName.includes(query);
  });

  const NavItem = ({ icon, label, active, onClick }) => (
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

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 opacity-50">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-purple-900/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '15s' }}></div>
          <div className="absolute bottom-1/3 right-1/3 w-1/2 h-1/2 bg-blue-900/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '20s' }}></div>
        </div>
      </div>

      <div className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-gray-900/90 backdrop-blur-md border-r border-gray-800/50 transition-all duration-300 flex flex-col z-10`}>
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
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800/50 transition-all"
            >
              {sidebarOpen ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

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
                icon={<Folder size={20} />}
                label="Projects"
                active={selectedNav === 'projects'}
                onClick={() => setSelectedNav('projects')}
              />
              <NavItem
                icon={<Settings size={20} />}
                label="Settings"
                active={selectedNav === 'settings'}
                onClick={() => setSelectedNav('settings')}
              />
            </ul>
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-gray-800/50">
          <Link href="/video-upload">
            <Button className="w-full flex items-center justify-center py-4 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 group relative overflow-hidden">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/0 via-white/20 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 transform -translate-x-full group-hover:translate-x-full"></div>
              {sidebarOpen ? (
                <>
                  <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="font-medium">New Video</span>
                </>
              ) : (
                <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
              )}
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col z-10">
        <header className="bg-gray-900/70 backdrop-blur-md border-b border-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Video Library
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button className="relative text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800/50 transition">
                <HelpCircle size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-purple-500"></span>
              </button>
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-sm font-medium cursor-pointer border-2 border-transparent hover:border-white transition-all">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                  <div className="p-3 border-b border-gray-800">
                    <div className="font-medium">{user?.fullName || 'User'}</div>
                    <div className="text-sm text-gray-400">{user?.primaryEmailAddress?.emailAddress || 'user@example.com'}</div>
                  </div>
                  <div className="p-2">
                    <a href="#" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm transition">Profile Settings</a>
                    <a href="#" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm transition">Sign Out</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-gray-300"
                >
                  <option value="all">All Videos</option>
                  <option value="youtube">YouTube</option>
                </select>
                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-purple-600 hover:bg-purple-500' : 'text-gray-400'}
                  >
                    <Grid size={20} />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-purple-600 hover:bg-purple-500' : 'text-gray-400'}
                  >
                    <List size={20} />
                  </Button>
                </div>
              </div>
              {selectedVideos.length > 0 && (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleDownloadSelected}
                    className="bg-blue-600 hover:bg-blue-500"
                  >
                    <Download size={16} className="mr-2" />
                    Download Selected
                  </Button>
                  <Button
                    onClick={handleDeleteSelected}
                    className="bg-red-600 hover:bg-red-500"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading your video library...</p>
              </div>
            ) : (
              <>
                {(filteredVideos.length > 0 || renderWorkflows.length > 0) ? (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {renderWorkflows.map(workflow => (
                        <div
                          key={workflow.id}
                          className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50 hover:border-gray-700 transition-all group relative"
                        >
                          <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center">
                            {workflow.status === 'completed' && workflow.video_url ? (
                              <video
                                src={workflow.video_url}
                                className="w-full h-full object-cover"
                                controls
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-gray-400">
                                <Sparkles size={36} className="mb-2 animate-pulse" />
                                <span className="text-sm">
                                  {workflow.status === 'queued' && 'Queued for Rendering'}
                                  {workflow.status === 'in_progress' && 'Rendering...'}
                                  {workflow.status === 'failed' && 'Rendering Failed'}
                                  {workflow.status === 'completed' && !workflow.video_url && 'Processing Video...'}
                                </span>
                                {workflow.status === 'in_progress' && (
                                  <Progress value={50} className="w-3/4 mt-2" />
                                )}
                                {workflow.status === 'failed' && (
                                  <AlertCircle size={24} className="mt-2 text-red-400" />
                                )}
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">Segment {workflow.segment_index + 1}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                workflow.status === 'completed' ? 'bg-green-900/20 text-green-400' :
                                workflow.status === 'failed' ? 'bg-red-900/20 text-red-400' :
                                'bg-purple-900/20 text-purple-400'
                              }`}>
                                {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-400">
                              Created: {new Date(workflow.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredVideos.map(video => (
                        <div
                          key={video.id}
                          className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50 hover:border-gray-700 transition-all group relative"
                        >
                          <div className="absolute top-4 left-4">
                            <Checkbox
                              checked={selectedVideos.includes(video.id)}
                              onCheckedChange={() => handleSelectVideo(video.id)}
                              className="border-gray-600"
                            />
                          </div>
                          <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
                            <video
                              src={video.video_url}
                              className="w-full h-full object-cover"
                              controls
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play size={36} className="text-purple-400" />
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{video.name}</h4>
                              <Star size={16} className="text-gray-400 hover:text-yellow-400 cursor-pointer" />
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-400">
                              <span>{new Date(video.created_at).toLocaleDateString()}</span>
                              <span>{video.duration ? `${Math.round(video.duration)}s` : '-'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-900/60 rounded-xl border border-gray-800 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="p-4 text-left">
                              <Checkbox
                                checked={selectedVideos.length === filteredVideos.length && filteredVideos.length > 0}
                                onCheckedChange={() => {
                                  if (selectedVideos.length === filteredVideos.length) {
                                    setSelectedVideos([]);
                                  } else {
                                    setSelectedVideos(filteredVideos.map(video => video.id));
                                  }
                                }}
                                className="border-gray-600"
                              />
                            </th>
                            <th className="p-4 text-left">Name</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-left">Created</th>
                            <th className="p-4 text-left">Duration</th>
                            <th className="p-4 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {renderWorkflows.map(workflow => (
                            <tr key={workflow.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                              <td className="p-4"></td>
                              <td className="p-4">Segment {workflow.segment_index + 1}</td>
                              <td className="p-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  workflow.status === 'completed' ? 'bg-green-900/20 text-green-400' :
                                  workflow.status === 'failed' ? 'bg-red-900/20 text-red-400' :
                                  'bg-purple-900/20 text-purple-400'
                                }`}>
                                  {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                                </span>
                              </td>
                              <td className="p-4">{new Date(workflow.created_at).toLocaleDateString()}</td>
                              <td className="p-4">{workflow.duration ? `${Math.round(workflow.duration)}s` : '-'}</td>
                              <td className="p-4">
                                {workflow.status === 'completed' && workflow.video_url && (
                                  <a href={workflow.video_url} download>
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500">
                                      <Download size={16} />
                                    </Button>
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                          {filteredVideos.map(video => (
                            <tr key={video.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                              <td className="p-4">
                                <Checkbox
                                  checked={selectedVideos.includes(video.id)}
                                  onCheckedChange={() => handleSelectVideo(video.id)}
                                  className="border-gray-600"
                                />
                              </td>
                              <td className="p-4">{video.name}</td>
                              <td className="p-4">
                                <span className="text-xs px-2 py-1 rounded-full bg-green-900/20 text-green-400">
                                  Completed
                                </span>
                              </td>
                              <td className="p-4">{new Date(video.created_at).toLocaleDateString()}</td>
                              <td className="p-4">{video.duration ? `${Math.round(video.duration)}s` : '-'}</td>
                              <td className="p-4 flex space-x-2">
                                <a href={video.video_url} download>
                                  <Button size="sm" className="bg-blue-600 hover:bg-blue-500">
                                    <Download size={16} />
                                  </Button>
                                </a>
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-500"
                                  onClick={() => handleDeleteSelected([video.id])}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <Video size={48} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-xl font-medium mb-2">Your Video Library is Empty</h3>
                    <p className="text-gray-400 mb-6">Upload or render videos to see them here.</p>
                    <Link href="/video-upload">
                      <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500">
                        <UploadIcon size={16} className="mr-2" />
                        Upload Video
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}