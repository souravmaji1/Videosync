'use client'; // This is a Client Component

import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function VideoCutter() {
  const [ffmpeg, setFFmpeg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Loading FFmpeg...');
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [segmentDuration, setSegmentDuration] = useState(10); // Default segment duration in seconds
  const [segmentVideos, setSegmentVideos] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoInputRef = useRef(null);

  // Initialize FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        const ffmpegInstance = new FFmpeg();
        
        ffmpegInstance.on('progress', ({ progress }) => {
          setProgress(progress * 100);
        });

        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        setFFmpeg(ffmpegInstance);
        setIsLoading(false);
        setMessage('FFmpeg is ready. Upload a video to begin.');
      } catch (error) {
        console.error('Error loading FFmpeg:', error);
        setMessage('Failed to load FFmpeg');
      }
    };

    loadFFmpeg();
  }, []);

  const handleVideoUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('video/')) {
        setMessage('Please upload a valid video file.');
        return;
      }
      
      setMessage('Analyzing video...');
      
      try {
        // Create a video element to get duration and dimensions
        const videoEl = document.createElement('video');
        videoEl.preload = 'metadata';
        
        // Create a promise to handle the metadata loading
        const metadataLoaded = new Promise((resolve) => {
          videoEl.onloadedmetadata = () => resolve(videoEl);
        });
        
        videoEl.src = URL.createObjectURL(file);
        
        // Wait for metadata to load
        const loadedVideo = await metadataLoaded;
        
        const info = {
          name: file.name,
          duration: loadedVideo.duration,
          width: loadedVideo.videoWidth,
          height: loadedVideo.videoHeight
        };
        
        setUploadedVideo(file);
        setVideoInfo(info);
        
        // Clear previous segments
        setSegmentVideos([]);
        
        // Check if video is longer than 5 minutes (300 seconds)
        if (info.duration > 300) {
          setMessage(`Video is ${info.duration.toFixed(1)} seconds long. It will be split into 4 segments of 30 seconds each.`);
        } else if (info.duration > 30) {
          setMessage(`Video is ${info.duration.toFixed(1)} seconds long. It will be split into equal segments.`);
        } else {
          setMessage(`Video is ${info.duration.toFixed(1)} seconds long. Video must be longer than 30 seconds to split.`);
        }
        
        // Cleanup
        URL.revokeObjectURL(loadedVideo.src);
      } catch (error) {
        console.error(`Error analyzing video ${file.name}:`, error);
        setMessage('Error analyzing video');
      }
    }
  };

  const splitVideo = async () => {
    if (!ffmpeg || !uploadedVideo || !videoInfo) return;
    if (videoInfo.duration <= 30) {
      setMessage('Video must be longer than 30 seconds to split.');
      return;
    }

    setIsProcessing(true);
    setMessage('Processing video...');
    setSegmentVideos([]); // Clear previous segments

    try {
      // Special case for videos longer than 5 minutes (300 seconds)
      if (videoInfo.duration > 300) {
        // Cut exactly 4 segments of 30 seconds each
        setMessage('Splitting into 4 segments of 30 seconds each...');
        
        // Write video file to FFmpeg virtual filesystem
        const videoData = await fetchFile(uploadedVideo);
        await ffmpeg.writeFile('input.mp4', videoData);
        
        const newSegments = [];
        const fixedDuration = 30; // 30 seconds for each segment
        
        // Process the 4 segments (30 seconds each)
        for (let i = 0; i < 4; i++) {
          const startTime = i * fixedDuration;
          
          setMessage(`Creating segment ${i+1} of 4...`);
          
          // Cut the segment from the original video
          await ffmpeg.exec([
            '-i', 'input.mp4',
            '-ss', startTime.toString(),
            '-t', fixedDuration.toString(),
            '-c:v', 'libx264', // Re-encode video
            '-c:a', 'aac',     // Re-encode audio
            '-pix_fmt', 'yuv420p',
            '-preset', 'fast', // Use faster preset for quicker processing
            `segment_${i}.mp4`
          ]);
          
          // Read the segment file
          const data = await ffmpeg.readFile(`segment_${i}.mp4`);
          const blob = new Blob([data], { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
          
          newSegments.push({
            url,
            startTime,
            duration: fixedDuration,
            index: i
          });
        }
        
        setSegmentVideos(newSegments);
        setMessage('Video successfully split into 4 segments of 30 seconds each.');
      } else {
        // Regular case: split based on user-defined segment duration
        // Calculate number of segments (at least 2)
        const numSegments = Math.max(2, Math.ceil(videoInfo.duration / segmentDuration));
        // Recalculate segment duration for equal segments
        const actualSegmentDuration = videoInfo.duration / numSegments;
        
        setMessage(`Splitting into ${numSegments} equal segments of ${actualSegmentDuration.toFixed(2)} seconds each...`);
        
        // Write video file to FFmpeg virtual filesystem
        const videoData = await fetchFile(uploadedVideo);
        await ffmpeg.writeFile('input.mp4', videoData);
        
        const newSegments = [];
        
        // Process each segment
        for (let i = 0; i < numSegments; i++) {
          const startTime = i * actualSegmentDuration;
          
          setMessage(`Creating segment ${i+1} of ${numSegments}...`);
          
          // Cut the segment from the original video
          await ffmpeg.exec([
            '-i', 'input.mp4',
            '-ss', startTime.toString(),
            '-t', actualSegmentDuration.toString(),
            '-c:v', 'libx264', // Re-encode video
            '-c:a', 'aac',     // Re-encode audio
            '-pix_fmt', 'yuv420p',
            '-preset', 'fast', // Use faster preset for quicker processing
            `segment_${i}.mp4`
          ]);
          
          // Read the segment file
          const data = await ffmpeg.readFile(`segment_${i}.mp4`);
          const blob = new Blob([data], { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
          
          newSegments.push({
            url,
            startTime,
            duration: actualSegmentDuration,
            index: i
          });
        }
        
        setSegmentVideos(newSegments);
        setMessage(`Video successfully split into ${numSegments} equal segments of ${actualSegmentDuration.toFixed(2)} seconds each.`);
      }
    } catch (error) {
      console.error('Error splitting video:', error);
      setMessage('Error splitting video: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const downloadSegment = (index) => {
    if (!segmentVideos[index]) return;
    
    const a = document.createElement('a');
    a.href = segmentVideos[index].url;
    a.download = `segment_${index+1}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const triggerVideoInput = () => {
    videoInputRef.current?.click();
  };

  useEffect(() => {
    // Auto-process when a video longer than 30 seconds is uploaded
    if (uploadedVideo && videoInfo && videoInfo.duration > 30) {
      splitVideo();
    }
  }, [uploadedVideo, videoInfo]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Video Segment Cutter</h1>
        
        {isLoading ? (
          <div className="text-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-gray-600">{message} ({progress.toFixed(1)}%)</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {/* Video Upload Section */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Upload Video</h2>
                <p className="text-gray-600 mb-3">
                  Upload a video longer than 30 seconds and it will automatically be split into segments.
                  Videos longer than 5 minutes will be split into 4 segments of 30 seconds each.
                </p>
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoUpload}
                  accept="video/*"
                  className="hidden"
                />
                <button
                  onClick={triggerVideoInput}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                >
                  {uploadedVideo ? 'Change Video' : 'Select Video'}
                </button>
              </div>

              {/* Video Info */}
              {uploadedVideo && videoInfo && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Video Information</h3>
                  <p className="mb-1"><strong>Name:</strong> {videoInfo.name}</p>
                  <p className="mb-1"><strong>Duration:</strong> {videoInfo.duration.toFixed(1)} seconds</p>
                  <p className="mb-1"><strong>Resolution:</strong> {videoInfo.width}×{videoInfo.height}</p>
                  
                  {videoInfo.duration <= 30 && (
                    <div className="mt-3 p-2 bg-yellow-100 text-yellow-700 rounded">
                      Video must be longer than 30 seconds to be split into segments.
                    </div>
                  )}
                  
                  {videoInfo.duration > 300 && (
                    <div className="mt-3 p-2 bg-blue-100 text-blue-700 rounded">
                      Video is longer than 5 minutes. It will be split into 4 segments of 30 seconds each.
                    </div>
                  )}
                </div>
              )}

              {/* Segment Duration Control - Only shown for videos between 30s and 5min */}
              {uploadedVideo && videoInfo && videoInfo.duration > 30 && videoInfo.duration <= 300 && !isProcessing && segmentVideos.length === 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Segment Duration</h2>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max={Math.min(30, videoInfo.duration / 2)}
                      value={segmentDuration}
                      onChange={(e) => setSegmentDuration(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-gray-700 w-24">{segmentDuration} seconds</span>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={splitVideo}
                      disabled={isProcessing}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Split Video
                    </button>
                  </div>
                </div>
              )}

              {/* Status Message */}
              {message && (
                <div className={`text-center p-3 rounded-lg ${message.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
                  <p className="font-medium">{message}</p>
                  {isProcessing && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}

              {/* Segments Preview */}
              {segmentVideos.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Video Segments</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {segmentVideos.map((segment, index) => (
                      <div key={index} className="bg-gray-100 rounded-lg p-3">
                        <video 
                          src={segment.url} 
                          className="w-full h-40 object-contain rounded" 
                          controls
                        />
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">
                            Segment {index + 1}
                          </p>
                          <p className="text-xs text-gray-500">
                            {segment.startTime.toFixed(1)}s - {(segment.startTime + segment.duration).toFixed(1)}s 
                            ({segment.duration.toFixed(1)}s)
                          </p>
                          <button
                            onClick={() => downloadSegment(index)}
                            className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-1 px-3 rounded transition duration-200"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}