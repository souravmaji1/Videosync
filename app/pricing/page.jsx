'use client'
import { useState, useEffect, useRef } from 'react';
import { 
  Upload, Video, Scissors, Folder, CheckCircle, ChevronDown, ChevronRight, Home, Settings, Users, 
  BarChart2, HelpCircle, Plus, ArrowRight, Sparkles, Play, Clock, Zap, BookOpen, Music, Cloud, Download
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import BulkUpload from '@/components/bulkupload';
import { Player } from '@remotion/player';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Video as RemotionVideo } from 'remotion';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Subtitle Component for Remotion
const SubtitleOverlay = ({ subtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeSubtitle = subtitles.find(
    subtitle => {
      const startFrame = Math.floor(subtitle.start * fps);
      const endFrame = Math.floor(subtitle.end * fps);
      return frame >= startFrame && frame <= endFrame;
    }
  );

  const style = {
    position: 'absolute',
    left: '10%',
    right: '10%',
    bottom: '10%',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
    padding: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '8px',
    zIndex: 10,
    opacity: activeSubtitle ? 1 : 0,
    transition: 'opacity 0.2s ease-in-out'
  };

  return <div style={style}>{activeSubtitle ? activeSubtitle.text : ''}</div>;
};

// Remotion Video Component
const VideoWithSubtitle = ({ videoUrl, subtitles }) => {
  const { durationInFrames } = useVideoConfig();
  console.log('VideoWithSubtitle rendering:', { videoUrl, durationInFrames, subtitles });

  return (
    <AbsoluteFill>
      <RemotionVideo
        src={videoUrl}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        muted // Required for auto-play in some browsers
        startFrom={0}
        endAt={durationInFrames}
        onError={(e) => console.error('Remotion Video load error:', e)}
      />
      <SubtitleOverlay subtitles={subtitles} />
    </AbsoluteFill>
  );
};

// ... (Rest of the imports and component setup remain unchanged)



// ... (Rest of VideoUploadPage.jsx remains unchanged)


export default function VideoUploadPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedNav, setSelectedNav] = useState('video-projects');
  const [bulkUploadComplete, setBulkUploadComplete] = useState(false);
  const [ffmpeg, setFFmpeg] = useState(null);
  const [isLoadingFFmpeg, setIsLoadingFFmpeg] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [segmentVideos, setSegmentVideos] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoInputRef = useRef(null);
  const [segmentSubtitles, setSegmentSubtitles] = useState([]);
  const [particleStyles, setParticleStyles] = useState([]);
// Mock recent projects data
const recentProjects = [
  { name: 'Summer Campaign', date: '2023-10-15', progress: 100 },
  { name: 'Product Launch', date: '2023-10-10', progress: 75 },
  { name: 'Event Recap', date: '2023-10-05', progress: 100 },
];
  // Initialize FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        setIsLoadingFFmpeg(true);
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        const ffmpegInstance = new FFmpeg();
        
        ffmpegInstance.on('progress', ({ progress }) => {
          setProgress(progress * 100);
        });

        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
       console.log(isLoadingFFmpeg)
        setFFmpeg(ffmpegInstance);
        setIsLoadingFFmpeg(false);
      } catch (error) {
        console.error('Error loading FFmpeg:', error);
        setMessage('Failed to load FFmpeg');
        setIsLoadingFFmpeg(false);
      }
    };

    if (selectedOption === 'single' && !ffmpeg) {
      loadFFmpeg();
    }
  }, [selectedOption]);

  // Animation effect on mount
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize subtitles array when segments are created
  useEffect(() => {
    if (segmentVideos.length > 0) {
      setSegmentSubtitles(segmentVideos.map(() => []));
    }
  }, [segmentVideos]);

  // Generate particle styles on client side only
  useEffect(() => {
    const styles = [...Array(20)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animation: 'float 15s infinite ease-in-out'
    }));
    setParticleStyles(styles);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleVideoUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('video/')) {
        setMessage('Please upload a valid video file.');
        return;
      }
      
      setMessage('Analyzing video...');
      
      try {
        const videoEl = document.createElement('video');
        videoEl.preload = 'metadata';
        
        const metadataLoaded = new Promise((resolve) => {
          videoEl.onloadedmetadata = () => resolve(videoEl);
        });
        
        videoEl.src = URL.createObjectURL(file);
        
        const loadedVideo = await metadataLoaded;
        
        const info = {
          name: file.name,
          duration: loadedVideo.duration,
          width: loadedVideo.videoWidth,
          height: loadedVideo.videoHeight
        };
        
        setUploadedVideo(file);
        setVideoInfo(info);
        
        setSegmentVideos([]);
        setSegmentSubtitles([]);
        
        if (selectedOption === 'single') {
          if (info.duration > 30) {
            await splitVideo(info);
          } else {
            setMessage(`Video is ${info.duration.toFixed(1)} seconds long. Processing as a single segment.`);
            await splitVideo(info);
          }
        } else {
          setMessage(`Video "${file.name}" is ready for processing.`);
        }
        
        URL.revokeObjectURL(loadedVideo.src);
      } catch (error) {
        console.error(`Error analyzing video ${file.name}:`, error);
        setMessage('Error analyzing video');
      }
    }
  };

  const splitVideo = async (videoInfo) => {
    if (!ffmpeg || !uploadedVideo || !videoInfo) return;

    setIsProcessing(true);
    setMessage('Processing video...');
    setSegmentVideos([]);

    try {
      const segmentDuration = 30;
      const maxSegments = Math.min(4, Math.ceil(videoInfo.duration / segmentDuration));
      setMessage(`Splitting into ${maxSegments} segment(s) of up to 30 seconds each for Instagram Reels...`);
      
      const videoData = await fetchFile(uploadedVideo);
      await ffmpeg.writeFile('input.mp4', videoData);
      
      const newSegments = [];
      
      for (let i = 0; i < maxSegments; i++) {
        const startTime = i * segmentDuration;
        const remainingDuration = Math.min(segmentDuration, videoInfo.duration - startTime);
        if (remainingDuration <= 0) break;
        
        setMessage(`Creating segment ${i+1} of ${maxSegments}...`);
        
        await ffmpeg.exec([
          '-i', 'input.mp4',
          '-ss', startTime.toString(),
          '-t', remainingDuration.toString(),
          '-vf', 'scale=-1:1080, crop=607:1080',
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-pix_fmt', 'yuv420p',
          '-movflags', '+faststart',
          '-preset', 'fast',
          '-f', 'mp4',
          `segment_${i}.mp4`
        ]);
        
        const data = await ffmpeg.readFile(`segment_${i}.mp4`);
        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        console.log(`Segment ${i+1} size: ${blob.size} bytes`);
        
        const videoEl = document.createElement('video');
        videoEl.src = URL.createObjectURL(blob);
        const canPlay = await new Promise(resolve => {
          videoEl.oncanplay = () => resolve(true);
          videoEl.onerror = () => resolve(false);
          videoEl.load();
        });
        
        if (!canPlay) {
          throw new Error(`Segment ${i+1} is not a valid video`);
        }
        
        const url = URL.createObjectURL(blob);
        newSegments.push({
          url,
          startTime,
          duration: remainingDuration,
          index: i
        });
      }
      
      setSegmentVideos(newSegments);
      await generateSubtitles(newSegments);
      setMessage(`Video successfully split into ${newSegments.length} Instagram Reels with subtitles.`);
    } catch (error) {
      console.error('Error splitting video:', error);
      setMessage('Error splitting video: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSubtitles = async (segments) => {
    setMessage('Uploading segments to Supabase and generating subtitles...');
    const newSubtitles = [];
    
    for (const segment of segments) {
      try {
        const fileName = `segment_${segment.index}_${Date.now()}.mp4`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`input/${fileName}`, await fetch(segment.url).then(res => res.blob()), {
            contentType: 'video/mp4'
          });
    console.log(uploadData)
        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          setMessage(`Failed to upload segment ${segment.index + 1}: ${uploadError.message}`);
          newSubtitles.push([{ text: 'No audio detected', start: 0, end: segment.duration }]);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(`input/${fileName}`);
        
        const publicUrl = urlData.publicUrl;

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl: publicUrl, segmentStart: segment.startTime })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Transcription error:', errorData);
          setMessage(`Failed to transcribe segment ${segment.index + 1}`);
          newSubtitles.push([{ text: 'Transcription failed', start: 0, end: segment.duration }]);
          continue;
        }

        const transcription = await response.json();
        console.log(`Transcription for segment ${segment.index + 1}:`, transcription);

        let subtitles = [];
        const utterances = transcription?.results?.channels?.[0]?.utterances;
        const paragraphs = transcription?.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.paragraphs;

        if (utterances && Array.isArray(utterances)) {
          subtitles = utterances.map(utterance => ({
            text: utterance.transcript,
            start: utterance.start - segment.startTime,
            end: utterance.end - segment.startTime
          })).filter(sub => sub.start >= 0 && sub.end <= segment.duration);
        } else if (paragraphs && Array.isArray(paragraphs)) {
          subtitles = paragraphs.flatMap(paragraph =>
            paragraph.sentences.map(sentence => ({
              text: sentence.text,
              start: sentence.start - segment.startTime,
              end: sentence.end - segment.startTime
            }))
          ).filter(sub => sub.start >= 0 && sub.end <= segment.duration);
        }

        if (subtitles.length === 0) {
          subtitles.push({ text: 'No audio detected', start: 0, end: segment.duration });
        }

        newSubtitles.push(subtitles);
      } catch (error) {
        console.error(`Error processing segment ${segment.index + 1}:`, error);
        setMessage(`Error processing segment ${segment.index + 1}: ${error.message}`);
        newSubtitles.push([{ text: 'Error generating subtitles', start: 0, end: segment.duration }]);
      }
    }

    setSegmentSubtitles(newSubtitles);
  };

  const downloadSegmentWithRemotion = async (index) => {
    if (!segmentVideos[index]) return;
  
    setMessage(`Preparing to render segment ${index + 1} with subtitles...`);
    setIsProcessing(true);
  
    try {
      const segment = segmentVideos[index];
      const subtitles = segmentSubtitles[index] || [];
      console.log('Sending subtitles to API:', JSON.stringify(subtitles, null, 2));
      const fileName = `segment_${index}_${Date.now()}.mp4`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`input/${fileName}`, await fetch(segment.url).then(res => res.blob()), {
          contentType: 'video/mp4'
        });
     console.log(uploadData)
      if (uploadError) {
        throw new Error(`Failed to upload video to Supabase: ${uploadError.message}`);
      }
  
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(`input/${fileName}`);
      
      const publicUrl = urlData.publicUrl;
      console.log(publicUrl)
      const videoPath = `input/${fileName}`;
  
      console.log('Sending to /api/render:', {
        videoPath,
        subtitles,
        subtitlePosition: 'bottom',
        duration: segment.duration,
        segmentIndex: index
      });
  
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoPath,
          subtitles,
          subtitlePosition: 'bottom',
          duration: segment.duration,
          segmentIndex: index
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Render-video API error:', errorData);
        throw new Error(errorData.message || 'Failed to process video rendering');
      }
  
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
  
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `reel_with_subtitle_${index + 1}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      URL.revokeObjectURL(downloadUrl);
      setMessage(`Segment ${index + 1} rendered and downloaded successfully.`);
    } catch (error) {
      console.error('Error in downloadSegmentWithRemotion:', error);
      setMessage(`Error rendering video: ${error.message}`);
      const a = document.createElement('a');
      a.href = segmentVideos[index].url;
      a.download = `reel_segment_${index + 1}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsProcessing(false);
    }
  };


  const triggerVideoInput = () => {
    videoInputRef.current?.click();
  };

  const Particles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particleStyles.map((style, i) => (
          <div 
            key={i}
            className="absolute w-2 h-2 rounded-full bg-purple-500 opacity-20"
            style={style}
          />
        ))}
      </div>
    );
  };

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
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 opacity-50">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-purple-900/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '15s' }}></div>
          <div className="absolute bottom-1/3 right-1/3 w-1/2 h-1/2 bg-blue-900/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '20s' }}></div>
        </div>
      </div>
      
      <Particles />

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
          <div className={`mb-8 transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
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
                label="Video Projects" 
                active={selectedNav === 'video-projects'} 
                onClick={() => setSelectedNav('video-projects')}
              />
              <NavItem 
                icon={<BookOpen size={20} />} 
                label="Templates" 
                active={selectedNav === 'templates'} 
                onClick={() => setSelectedNav('templates')}
              />
              <NavItem 
                icon={<Music size={20} />} 
                label="Audio Library" 
                active={selectedNav === 'audio'} 
                onClick={() => setSelectedNav('audio')}
              />
            </ul>
          </div>

          <div className={`mb-8 transition-all duration-500 delay-100 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
            {sidebarOpen && (
              <div className="flex items-center justify-between px-4 mb-4">
                <h3 className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Workspace</h3>
                <div className="w-8 h-0.5 bg-gray-800 rounded-full"></div>
              </div>
            )}
            <ul className="space-y-2">
              <NavItem 
                icon={<Users size={20} />} 
                label="Team Members" 
                active={selectedNav === 'team'} 
                onClick={() => setSelectedNav('team')}
              />
              <NavItem 
                icon={<BarChart2 size={20} />} 
                label="Analytics" 
                active={selectedNav === 'analytics'} 
                onClick={() => setSelectedNav('analytics')}
              />
              <NavItem 
                icon={<Cloud size={20} />} 
                label="Cloud Storage" 
                active={selectedNav === 'cloud'} 
                onClick={() => setSelectedNav('cloud')}
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
            <div className={`mt-8 transition-all duration-500 delay-200 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
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
                  <div className="w-full h-1.5 bg-gray-800/60 rounded-full mb-2 overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span>75% complete</span>
                    <span>7 days left</span>
                  </div>
                  <button className="w-full py-3 text-sm font-medium rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 flex items-center justify-center group">
                    <Zap size={16} className="mr-2 group-hover:animate-pulse" />
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
        
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

      <div className="flex-1 flex flex-col z-10">
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
                  U
                </div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                  <div className="p-3 border-b border-gray-800">
                    <div className="font-medium">User Name</div>
                    <div className="text-sm text-gray-400">user@example.com</div>
                  </div>
                  <div className="p-2">
                    <a href="#" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm transition">Profile Settings</a>
                    <a href="#" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm transition">Subscription</a>
                    <a href="#" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm transition">Sign Out</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Create New Video Project
              </h1>
              <p className="text-gray-400 mt-2">
                Upload and transform your videos for social media platforms automatically
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div 
                className={`relative border ${selectedOption === 'single' ? 'border-purple-500 bg-purple-900/10' : 'border-gray-800 hover:border-purple-400/40 hover:bg-gray-800/30'} 
                rounded-2xl p-6 transition-all duration-300 cursor-pointer overflow-hidden group`}
                onClick={() => setSelectedOption('single')}
              >
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-xl group-hover:w-60 group-hover:h-60 transition-all duration-500"></div>
                <div className="absolute top-0 right-0 p-4">
                  {selectedOption === 'single' && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white animate-fadeIn">
                      <CheckCircle size={16} />
                    </div>
                  )}
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl w-14 h-14 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-all duration-300">
                  <Video className="text-purple-400 group-hover:text-purple-300 transition-all" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-purple-300 transition-colors">Single Video</h3>
                <p className="text-gray-400 mb-4 text-sm">
                  Upload a single video to split into Instagram Reels format with AI-powered editing
                </p>
                <div className="inline-flex items-center text-purple-400 text-sm font-medium">
                  Choose <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              <div 
                className={`relative border ${selectedOption === 'bulk' ? 'border-blue-500 bg-blue-900/10' : 'border-gray-800 hover:border-blue-400/40 hover:bg-gray-800/30'} 
                rounded-2xl p-6 transition-all duration-300 cursor-pointer overflow-hidden group`}
                onClick={() => setSelectedOption('bulk')}
              >
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-xl group-hover:w-60 group-hover:h-60 transition-all duration-500"></div>
                <div className="absolute top-0 right-0 p-4">
                  {selectedOption === 'bulk' && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white animate-fadeIn">
                      <CheckCircle size={16} />
                    </div>
                  )}
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl w-14 h-14 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-all duration-300">
                  <Folder className="text-blue-400 group-hover:text-blue-300 transition-all" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors">Bulk Upload</h3>
                <p className="text-gray-400 mb-4 text-sm">
                  Process multiple videos at once for different social media platforms
                </p>
                <div className="inline-flex items-center text-blue-400 text-sm font-medium">
                  Choose <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {selectedOption === 'single' && (
              <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 mb-8 transition-all animate-fadeIn">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold mb-2">Upload Video</h2>
                  <p className="text-gray-400">Select or drag and drop your video to automatically split it into Instagram Reels</p>
                </div>

                <div 
                  className={`border-2 border-dashed ${dragActive ? 'border-purple-500 bg-purple-900/10' : 'border-gray-700 hover:border-purple-400/40'} 
                  rounded-xl p-8 transition-all duration-300 text-center`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleVideoUpload} 
                    className="hidden" 
                    ref={videoInputRef}
                  />
                  
                  {!uploadedVideo && (
                    <div>
                      <div className="mx-auto w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                        <Upload size={28} className="text-purple-400" />
                      </div>
                      <p className="text-gray-300 mb-4">Drag and drop your video here or</p>
                      <button 
                        onClick={triggerVideoInput}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50"
                      >
                        Select Video
                      </button>
                      <p className="mt-4 text-sm text-gray-500">Supports MP4, MOV, AVI up to 1GB</p>
                    </div>
                  )}
                  
                  {uploadedVideo && videoInfo && (
                    <div>
                      <div className="mx-auto w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={28} className="text-green-400" />
                      </div>
                      <p className="text-gray-300 mb-2">Video uploaded successfully</p>
                      <h3 className="text-lg font-medium mb-2">{videoInfo.name}</h3>
                      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-4">
                        <span>Duration: {videoInfo.duration.toFixed(1)}s</span>
                        <span>Resolution: {videoInfo.width}x{videoInfo.height}</span>
                      </div>
                      
                      {!isProcessing && segmentVideos.length === 0 && (
                        <button 
                          onClick={() => splitVideo(videoInfo)}
                          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 flex items-center justify-center mx-auto"
                          disabled={isProcessing}
                        >
                          <Scissors size={18} className="mr-2" />
                          Split into Instagram Reels
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isProcessing && (
                  <div className="mt-6 animate-fadeIn">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Processing video...</span>
                      <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{message}</p>
                  </div>
                )}

                {segmentVideos.length > 0 && (
                  <div className="mt-8 animate-fadeIn">
                    <h3 className="text-xl font-semibold mb-4">Instagram Reels Segments</h3>
                    <p className="text-gray-400 mb-6">Your video has been split into {segmentVideos.length} Instagram Reels format clips with auto-generated subtitles.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {segmentVideos.map((segment, index) => (
                        <div key={index} className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50 group">
                          <div className="aspect-[9/16] relative overflow-hidden bg-black">
                            <Player
                              component={VideoWithSubtitle}
                              inputProps={{
                                videoUrl: segment.url,
                                subtitles: segmentSubtitles[index] || []
                              }}
                              durationInFrames={Math.ceil(segment.duration * 30)}
                              compositionWidth={607}
                              compositionHeight={1080}
                              fps={30}
                              controls
                              autoPlay
                              loop // Ensure continuous playback
                              style={{
                                width: '100%',
                                height: '100%'
                              }}
                            />
                          </div>
                          
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">Segment {index + 1}</h4>
                              <span className="text-sm text-gray-400">
                                {Math.floor(segment.startTime / 60)}:{(segment.startTime % 60).toString().padStart(2, '0')} - 
                                {Math.floor((segment.startTime + segment.duration) / 60)}:{((segment.startTime + segment.duration) % 60).toString().padStart(2, '0')}
                              </span>
                            </div>
                            
                            <div className="mb-4">
                              <label className="text-sm text-gray-400 block mb-1">Subtitles</label>
                              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 h-20 overflow-auto">
                                {segmentSubtitles[index]?.length > 0 ? (
                                  segmentSubtitles[index].map((sub, i) => (
                                    <div key={i}>{`${sub.start.toFixed(1)}s - ${sub.end.toFixed(1)}s: ${sub.text}`}</div>
                                  ))
                                ) : (
                                  <span className="text-gray-500">No subtitles generated</span>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => downloadSegmentWithRemotion(index)}
                              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg text-white font-medium transition-all shadow-md shadow-purple-900/20 hover:shadow-purple-900/40 flex items-center justify-center"
                              disabled={isProcessing}
                            >
                              <Download size={18} className="mr-2" />
                              Download with Subtitles
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {selectedOption === 'bulk' && (
              <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 mb-8 transition-all animate-fadeIn">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold mb-2">Bulk Upload</h2>
                  <p className="text-gray-400">Process multiple videos for different social media platforms at once</p>
                </div>
                
                {!bulkUploadComplete ? (
                  <BulkUpload onComplete={() => setBulkUploadComplete(true)} />
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={28} className="text-green-400" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Bulk Processing Complete!</h3>
                    <p className="text-gray-400 mb-6">Your videos have been processed and are ready for download</p>
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50">
                      View All Processed Videos
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 transition-all animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Recent Projects</h2>
                <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center">
                  View All <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentProjects.map((project, index) => (
                  <div key={index} className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50 hover:border-gray-700 transition-all group">
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play size={36} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
                      </div>
                      {project.progress < 100 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{project.name}</h4>
                        {project.progress === 100 ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-900/20 text-green-400">Completed</span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-900/20 text-purple-400">In Progress</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span className="flex items-center"><Clock size={14} className="mr-1" /> {project.date}</span>
                        <span>Instagram Reels</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

