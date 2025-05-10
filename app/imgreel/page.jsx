'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Video, Sparkles, Music, FileText, Play, CheckCircle, ChevronRight, Plus,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Player } from '@remotion/player';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
// Subtitle Overlay Component (Reused from VideoBulkPage)
const SubtitleOverlay = ({ subtitles, styleType }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeSubtitle = subtitles.find(
    subtitle => {
      const startFrame = Math.floor(subtitle.start * fps);
      const endFrame = Math.floor(subtitle.end * fps);
      return frame >= startFrame && frame <= endFrame;
    }
  );

  const styles = {
    hormozi: {
      position: 'absolute',
      left: '10%',
      right: '10%',
      bottom: '10%',
      textAlign: 'center',
      fontFamily: 'Impact, Arial, sans-serif',
      fontSize: '36px',
      fontWeight: '900',
      color: 'white',
      textTransform: 'uppercase',
      textShadow: '0 4px 6px rgba(0, 0, 0, 0.8)',
      padding: '15px 20px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderRadius: '12px',
      border: '4px solid #FFD700',
      zIndex: 10,
      opacity: activeSubtitle ? 1 : 0,
      transition: 'opacity 0.2s ease-in-out',
    },
    abdaal: {
      position: 'absolute',
      left: '10%',
      right: '10%',
      bottom: '10%',
      textAlign: 'center',
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontSize: '28px',
      fontWeight: '600',
      color: '#F5F5F5',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
      padding: '10px 15px',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: '10px',
      border: '2px solid #FFFFFF',
      zIndex: 10,
      opacity: activeSubtitle ? 1 : 0,
      transition: 'opacity 0.2s ease-in-out',
    },
    neonGlow: {
      position: 'absolute',
      left: '10%',
      right: '10%',
      bottom: '10%',
      textAlign: 'center',
      fontFamily: '"Orbitron", Arial, sans-serif',
      fontSize: '32px',
      fontWeight: '700',
      color: '#00FFDD',
      textShadow: '0 0 8px #00FFDD, 0 0 16px #00FFDD, 0 0 24px #FF00FF',
      padding: '12px 18px',
      background: 'linear-gradient(45deg, rgba(255, 0, 255, 0.2), rgba(0, 255, 221, 0.2))',
      borderRadius: '10px',
      border: '2px solid #FF00FF',
      zIndex: 10,
      opacity: activeSubtitle ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out',
      animation: activeSubtitle ? 'neonFlicker 1.5s infinite alternate' : 'none',
    },
    retroWave: {
      position: 'absolute',
      left: '10%',
      right: '10%',
      bottom: '10%',
      textAlign: 'center',
      fontFamily: '"VCR OSD Mono", monospace',
      fontSize: '30px',
      fontWeight: '400',
      color: '#FF69B4',
      textShadow: '0 0 10px #FF1493, 0 0 20px #9400D3',
      padding: '10px 15px',
      background: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '8px',
      border: '3px double #00FFFF',
      zIndex: 10,
      opacity: activeSubtitle ? 1 : 0,
      transition: 'opacity 0.2s ease-in-out',
      filter: 'contrast(1.2)',
      letterSpacing: '2px',
    },
    minimalPop: {
      position: 'absolute',
      left: '10%',
      right: '10%',
      bottom: '10%',
      textAlign: 'center',
      fontFamily: '"Poppins", Arial, sans-serif',
      fontSize: '28px',
      fontWeight: '500',
      color: '#FFFFFF',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      padding: '8px 12px',
      background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
      borderRadius: '12px',
      border: 'none',
      zIndex: 10,
      opacity: activeSubtitle ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out, transform 0.2s ease-in-out',
      transform: activeSubtitle ? 'scale(1)' : 'scale(0.95)',
    },
    none: {
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
      transition: 'opacity 0.2s ease-in-out',
    },
  };

  return <div style={styles[styleType] || styles.none}>{activeSubtitle ? activeSubtitle.text : ''}</div>;
};

// Remotion Video Component
const AIVideo = ({ images, audioUrl, subtitles, styleType }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const imageDuration = durationInFrames / images.length;

  const currentImageIndex = Math.floor(frame / imageDuration);
  const currentImage = images[currentImageIndex] || images[images.length - 1];

  return (
    <AbsoluteFill>
      <img
        src={currentImage}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <audio src={audioUrl} autoPlay />
      <SubtitleOverlay subtitles={subtitles} styleType={styleType} />
    </AbsoluteFill>
  );
};

// Animation variants
const pulseAnimation = {
  scale: [1, 1.03, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: 'reverse',
  },
};

export default function AICreateVideo() {
  const { user } = useUser();
  const [imageType, setImageType] = useState(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [audioText, setAudioText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('sonic');
  const [audioEmotion, setAudioEmotion] = useState('neutral');
  const [audioSpeed, setAudioSpeed] = useState('normal');
  const [audioUrl, setAudioUrl] = useState(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [subtitles, setSubtitles] = useState([]);
  const [subtitleStyle, setSubtitleStyle] = useState('none');
  const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState(false);
  const [message, setMessage] = useState('');
  const [videoDuration, setVideoDuration] = useState(30); // Default 30 seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);

  const imageTypes = [
    { id: 'realistic', label: 'Realistic', description: 'High-quality photorealistic images' },
    { id: 'cartoon', label: 'Cartoon', description: 'Stylized cartoon-style illustrations' },
    { id: 'abstract', label: 'Abstract', description: 'Abstract and artistic visuals' },
    { id: 'pixel', label: 'Pixel Art', description: 'Retro-style pixel art graphics' },
  ];

  const voiceOptions = [
    { id: 'sonic', label: 'Sonic (Neutral Male)' },
    { id: 'claire', label: 'Claire (Soft Female)' },
    { id: 'morgan', label: 'Morgan (Deep Male)' },
  ];

  const emotionOptions = ['neutral', 'happy', 'sad', 'excited'];
  const speedOptions = ['slow', 'normal', 'fast'];

  // Generate Images with Replicate API
  const generateImages = async () => {
    if (!imageType || !imagePrompt) {
      setMessage('Please select an image type and provide a prompt.');
      return;
    }

    setIsGeneratingImages(true);
    setMessage('Generating images...');

    try {
      const selectedImageType = imageTypes.find(type => type.id === imageType);
      const modelPath = 'black-forest-labs/flux-schnell';
      const input = {
        prompt: `${imagePrompt}, ${selectedImageType.style} style`,
        go_fast: true,
        megapixels: '1',
        num_outputs: 4, // Generate 4 images
        aspect_ratio: '9:16', // For Instagram Reels
        output_format: 'webp',
        output_quality: 80,
        num_inference_steps: 4,
      };

      const response = await fetch('/api/generateimage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelPath, input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate images');
      }

      // Assuming data.output contains an array of image URLs
      setGeneratedImages(data.output || []);
      setMessage('Images generated successfully!');
    } catch (error) {
      console.error('Error generating images:', error);
      setMessage(`Error generating images: ${error.message}`);
    } finally {
      setIsGeneratingImages(false);
    }
  };

  // Generate Audio with Cartesia API
  const generateAudio = async () => {
    if (!audioText) {
      setMessage('Please provide text for audio generation.');
      return;
    }

    setIsGeneratingAudio(true);
    setMessage('Generating audio...');

    try {
      const response = await axios.post(
        'https://api.cartesia.ai/tts/bytes',
        {
          model_id: selectedVoice,
          transcript: audioText,
          voice: {
            mode: 'id',
            id: 'fa7bfcdc-603c-4bf1-a600-a371400d2f8c',
          },
          output_format: {
            container: 'mp3',
            bit_rate: 64000,
            sample_rate: 44100,
          },
          language: 'en',
        },
        {
          headers: {
            'Cartesia-Version': '2024-06-10',
            'X-API-Key': process.env.NEXT_PUBLIC_CARTESIA_API_KEY,
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        }
      );

      const audioBlob = new Blob([response.data], { type: 'audio/mp3' });

    // Generate a unique file name
    const fileName = `audio_${user?.id || 'anonymous'}_${Date.now()}.mp3`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('avatars') // Replace with your bucket name
      .upload(fileName, audioBlob, {
        contentType: 'audio/mp3',
      });

    if (uploadError) {
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to retrieve public URL');
    }

    const audioUrl = publicUrlData.publicUrl;
    setAudioUrl(audioUrl);

    // Estimate duration for video
    const audioEl = document.createElement('audio');
    audioEl.src = audioUrl;
    audioEl.onloadedmetadata = () => {
      setVideoDuration(audioEl.duration);
    };

    setMessage('Audio generated and uploaded successfully!');
    } catch (error) {
      console.error('Error generating audio:', error);
      setMessage(`Error generating audio: ${error.message}`);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Generate Subtitles with Transcription API
  const generateSubtitles = async () => {
    if (!audioUrl) {
      setMessage('Please generate audio first.');
      return;
    }

    setIsGeneratingSubtitles(true);
    setMessage('Generating subtitles...');

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl, segmentStart: 0 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }

      const transcription = await response.json();
      let subtitles = [];

      const utterances = transcription?.results?.channels?.[0]?.utterances;
      if (utterances && Array.isArray(utterances)) {
        subtitles = utterances.map(utterance => ({
          text: utterance.transcript,
          start: utterance.start,
          end: utterance.end,
        })).filter(sub => sub.start >= 0 && sub.end <= videoDuration);
      }

      if (subtitles.length === 0) {
        subtitles = [{ text: 'No audio detected', start: 0, end: videoDuration }];
      }

      setSubtitles(subtitles);
      setMessage('Subtitles generated successfully!');
    } catch (error) {
      console.error('Error generating subtitles:', error);
      setMessage(`Error generating subtitles: ${error.message}`);
      setSubtitles([{ text: 'Error generating subtitles', start: 0, end: videoDuration }]);
    } finally {
      setIsGeneratingSubtitles(false);
    }
  };

  // Handle Play/Pause
  const togglePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 opacity-50 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-purple-900/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '15s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-1/2 h-1/2 bg-blue-900/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '20s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
          Create AI Video
        </h1>
        <p className="text-gray-400 mb-8">Generate a video with AI-powered images, audio, and subtitles.</p>

        {/* Image Type Selection */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Step 1: Choose Image Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {imageTypes.map(type => (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.03 }}
                className={`border ${imageType === type.id ? 'border-purple-500 bg-purple-900/20' : 'border-gray-800'} rounded-xl p-4 cursor-pointer transition-all`}
                onClick={() => setImageType(type.id)}
              >
                <div className="flex items-center mb-2">
                  <Video size={24} className="text-purple-400 mr-2" />
                  <h3 className="font-medium">{type.label}</h3>
                </div>
                <p className="text-gray-400 text-sm">{type.description}</p>
                {imageType === type.id && (
                  <CheckCircle size={20} className="text-purple-400 mt-2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Image Prompt and Generation */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Step 2: Generate Images</h2>
          <textarea
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            className="w-full bg-gray-900/70 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            placeholder="Describe the images you want to generate (e.g., 'A futuristic city at night')"
            rows={4}
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateImages}
            disabled={isGeneratingImages}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3 px-6 rounded-lg flex items-center disabled:opacity-50 shadow-lg shadow-purple-900/20"
          >
            <Sparkles size={18} className="mr-2" />
            {isGeneratingImages ? 'Generating...' : 'Generate Images'}
          </motion.button>
          {generatedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {generatedImages.map((img, index) => (
                <img key={index} src={img} alt={`Generated ${index}`} className="rounded-lg w-full h-auto" />
              ))}
            </div>
          )}
        </div>

        {/* Audio Generation */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Step 3: Generate Audio</h2>
          <textarea
            value={audioText}
            onChange={(e) => setAudioText(e.target.value)}
            className="w-full bg-gray-900/70 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            placeholder="Enter the script for audio narration"
            rows={4}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Voice</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-gray-900/70 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {voiceOptions.map(voice => (
                  <option key={voice.id} value={voice.id}>{voice.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Emotion</label>
              <select
                value={audioEmotion}
                onChange={(e) => setAudioEmotion(e.target.value)}
                className="w-full bg-gray-900/70 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {emotionOptions.map(emotion => (
                  <option key={emotion} value={emotion}>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Speed</label>
              <select
                value={audioSpeed}
                onChange={(e) => setAudioSpeed(e.target.value)}
                className="w-full bg-gray-900/70 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {speedOptions.map(speed => (
                  <option key={speed} value={speed}>{speed.charAt(0).toUpperCase() + speed.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateAudio}
            disabled={isGeneratingAudio}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3 px-6 rounded-lg flex items-center disabled:opacity-50 shadow-lg shadow-purple-900/20"
          >
            <Music size={18} className="mr-2" />
            {isGeneratingAudio ? 'Generating...' : 'Generate Audio'}
          </motion.button>
          {audioUrl && (
            <audio controls src={audioUrl} className="mt-4 w-full" />
          )}
        </div>

        {/* Subtitle Generation and Style */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Step 4: Generate Subtitles</h2>
          <div className="flex items-center space-x-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateSubtitles}
              disabled={isGeneratingSubtitles || !audioUrl}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3 px-6 rounded-lg flex items-center disabled:opacity-50 shadow-lg shadow-purple-900/20"
            >
              <FileText size={18} className="mr-2" />
              {isGeneratingSubtitles ? 'Generating...' : 'Generate Subtitles'}
            </motion.button>
            <select
              value={subtitleStyle}
              onChange={(e) => setSubtitleStyle(e.target.value)}
              className="bg-gray-900/70 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="none">None</option>
              <option value="hormozi">Hormozi</option>
              <option value="abdaal">Abdaal</option>
              <option value="neonGlow">Neon Glow</option>
              <option value="retroWave">Retro Wave</option>
              <option value="minimalPop">Minimal Pop</option>
            </select>
          </div>
          {subtitles.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {subtitles.map((subtitle, index) => (
                <div key={index} className="bg-gray-900/50 p-3 rounded-lg">
                  <p className="text-sm text-white">{subtitle.text}</p>
                  <p className="text-xs text-gray-400">
                    {subtitle.start.toFixed(1)}s - {subtitle.end.toFixed(1)}s
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Preview */}
        {generatedImages.length > 0 && audioUrl && subtitles.length > 0 && (
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
            <h2 className="text-2xl font-semibold mb-4">Step 5: Preview Video</h2>
            <div className="relative aspect-[9/16] max-w-[607px] mx-auto">
              <Player
                ref={playerRef}
                component={AIVideo}
                inputProps={{
                  images: generatedImages,
                  audioUrl,
                  subtitles,
                  styleType: subtitleStyle,
                }}
                durationInFrames={Math.ceil(videoDuration * 30)}
                compositionWidth={607}
                compositionHeight={1080}
                fps={30}
                controls={true}
                autoPlay={false}
                loop={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  background: 'black',
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={togglePlayPause}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isPlaying ? 0 : 1, scale: isPlaying ? 0.8 : 1 }}
                  className="w-16 h-16 rounded-full bg-purple-600/80 flex items-center justify-center backdrop-blur-sm shadow-xl shadow-purple-900/50"
                >
                  <Play size={30} fill="white" className="text-white ml-1" />
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className="mt-4 text-center text-gray-300">{message}</div>
        )}
      </div>

      <style jsx>{`
        @keyframes neonFlicker {
          0%, 100% {
            text-shadow: 0 0 8px #00FFDD, 0 0 16px #00FFDD, 0 0 24px #FF00FF;
          }
          50% {
            text-shadow: 0 0 4px #00FFDD, 0 0 8px #00FFDD, 0 0 12px #FF00FF;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in forwards;
        }
      `}</style>
    </div>
  );
}