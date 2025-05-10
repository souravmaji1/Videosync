'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Video, Sparkles, Music, FileText, Play, CheckCircle, ChevronRight, ChevronDown, 
  Plus, Upload, Camera, Palette, Settings, Film, Sparkle, Type, Zap, FileVideo, 
  Clock, Save, Share, Layers, LayoutGrid, Home, Users, BarChart2, HelpCircle, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { Player } from '@remotion/player';
import { AbsoluteFill, Audio, Img, Sequence } from 'remotion';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Animation variants for pulse effect
const pulseAnimation = {
  scale: [1, 1.03, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: 'reverse',
  }
};

// Navigation Item Component (unchanged)
const NavItem = ({ icon, label, active, onClick }) => {
  // ... (same as original)
};

// Particles Component (unchanged)
const Particles = () => {
  // ... (same as original)
};

import SubtitleOverlay from './SubtitleOverlay'; // Adjust the import path as needed

const MyVideo = ({ images, audioUrl, subtitles, subtitleStyle }) => {
  const frameRate = 30;
  const imageDuration = 3; // 3 seconds per image

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {/* Audio */}
      {audioUrl && <Audio src={audioUrl} />}

      {/* Images */}
      {images.map((img, index) => (
        <Sequence
          key={index}
          from={index * imageDuration * frameRate}
          durationInFrames={imageDuration * frameRate}
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

      {/* Subtitles */}
      <SubtitleOverlay subtitles={subtitles} styleType={subtitleStyle} />
    </AbsoluteFill>
  );
};
export default function ImagetoVideoReel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNav, setSelectedNav] = useState('create-video');
  const [activeStep, setActiveStep] = useState(1);
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
  const [subtitleStyle, setSubtitleStyle] = useState('none');
  const [subtitles, setSubtitles] = useState([]);
  const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const user = { id: 'user123' }; // Mock user for demo; replace with actual auth
const [subtitleMode, setSubtitleMode] = useState('audio'); // 'audio' or 'manual'
  const [manualSubtitle, setManualSubtitle] = useState({ text: '', start: '', end: '' });
  const [manualSubtitles, setManualSubtitles] = useState([]);
  // Sample data for demonstration (unchanged)
  const imageTypes = [
    { id: 'realistic', label: 'Realistic', description: 'High-quality photorealistic images', icon: Camera },
    { id: 'cartoon', label: 'Cartoon', description: 'Stylized cartoon-style illustrations', icon: Palette },
    { id: 'abstract', label: 'Abstract', description: 'Abstract and artistic visuals', icon: Layers },
    { id: 'pixel', label: 'Pixel Art', description: 'Retro-style pixel art graphics', icon: LayoutGrid },
  ];

  const voiceOptions = [
    { id: 'sonic', label: 'Sonic (Neutral Male)' },
    { id: 'claire', label: 'Claire (Soft Female)' },
    { id: 'morgan', label: 'Morgan (Deep Male)' },
  ];

  const emotionOptions = ['neutral', 'happy', 'sad', 'excited'];
  const speedOptions = ['slow', 'normal', 'fast'];

  const addManualSubtitle = () => {
  const { text, start, end } = manualSubtitle;

  if (!text.trim()) {
    setMessage('Subtitle text is required.');
    return;
  }

  const startTime = parseFloat(start);
  const endTime = parseFloat(end);

  if (isNaN(startTime) || isNaN(endTime)) {
    setMessage('Please enter valid start and end times.');
    return;
  }

  if (startTime < 0 || endTime <= startTime || endTime > videoDuration) {
    setMessage(`Timings must be between 0 and ${videoDuration.toFixed(1)} seconds, and end time must be greater than start time.`);
    return;
  }

  const newSubtitle = { text: text.trim(), start: startTime, end: endTime };
  setManualSubtitles([...manualSubtitles, newSubtitle]);
  setManualSubtitle({ text: '', start: '', end: '' });
  setMessage('Subtitle added successfully!');
};
  // Generate Images with Replicate API
  const generateImages = async () => {
    if (!imagePrompt.trim()) {
      setMessage('Please provide an image prompt.');
      return;
    }

    setIsGeneratingImages(true);
    setMessage('Generating images...');

    try {
      const modelPath = 'black-forest-labs/flux-schnell'; // Adjust based on imageType
      const response = await fetch('/api/generateimage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelPath,
          input: {
            prompt: `${imagePrompt}, ${imageType} style`,
            num_outputs: 4,
            width: 607,
            height: 1080,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate images');
      }

      const imageUrls = data.output.map((item) => item.url); // Adjust based on actual API response
      setGeneratedImages(data.output || []);
      setMessage('Images generated successfully!');
    } catch (error) {
      console.error('Error generating images:', error);
      setMessage(`Error generating images: ${error.message}`);
    } finally {
      setIsGeneratingImages(false);
    }
  };

  // pages/imageto-video-reel.tsx
const renderAllSegments = async () => {
  if (!generatedImages.length || !audioUrl) {
    setMessage('Please generate images and audio first.');
    return;
  }

  
  setMessage('Initiating rendering...');

  try {
    const fileName = `video_${user?.id || 'anonymous'}_${Date.now()}.mp4`;
    const props = {
      images: generatedImages,
      audioUrl,
      subtitles,
      styleType: subtitleStyle,
      duration: videoDuration,
      outputFile: fileName
    };
    console.log(props)

    // Trigger GitHub Actions workflow
    const response = await fetch('/api/bulkrender', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        segments: [props], // Wrap in array to match bulk API
        userId: user?.id || 'anonymous'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to initiate rendering');
    }

    const { workflowIds } = await response.json();
    setMessage(`Rendering initiated. Workflow ID: ${workflowIds[0]?.workflowRunId}. Check Video Library for status.`);
    
    setWorkflowData({ workflowIds, segmentPaths: [fileName] });
  } catch (error) {
    console.error('Error initiating rendering:', error);
    setMessage(`Error initiating rendering: ${error.message}`);
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
    const fileName = `audio_${user?.id || 'anonymous'}_${Date.now()}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, audioBlob, {
        contentType: 'audio/mp3',
      });

    if (uploadError) {
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to retrieve public URL');
    }

    const audioUrl = publicUrlData.publicUrl;
    setAudioUrl(audioUrl);

    // Wait for audio metadata to load
    const audioEl = document.createElement('audio');
    audioEl.src = audioUrl;

    const duration = await new Promise((resolve, reject) => {
      audioEl.onloadedmetadata = () => resolve(audioEl.duration);
      audioEl.onerror = () => reject(new Error('Failed to load audio metadata'));
      setTimeout(() => reject(new Error('Audio metadata load timeout')), 5000); // 5s timeout
    });

    setVideoDuration(duration);
    setMessage('Audio generated and uploaded successfully!');
  } catch (error) {
    console.error('Error generating audio:', error);
    setMessage(`Error generating audio: ${error.message}`);
  } finally {
    setIsGeneratingAudio(false);
  }
};


// Update subtitles state based on mode
useEffect(() => {
  if (subtitleMode === 'audio') {
    // Keep subtitles as is (from audio generation)
  } else {
    setSubtitles(manualSubtitles);
  }
}, [subtitleMode, manualSubtitles]);


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
    console.log('Transcription:', JSON.stringify(transcription, null, 2));
    console.log('videoDuration:', videoDuration);

    let subtitles = [];

    // Access utterances from results.utterances
    let utterances = transcription?.results?.utterances;
    console.log('Utterances:', utterances);

    // Use effective duration (videoDuration or metadata.duration)
    const effectiveDuration = videoDuration > 0 ? videoDuration : transcription?.metadata?.duration || 10;
    console.log('Effective duration:', effectiveDuration);

    if (utterances && Array.isArray(utterances)) {
      subtitles = utterances.flatMap((utterance) => {
        console.log(`Processing utterance: text=${utterance.transcript}, start=${utterance.start}, end=${utterance.end}`);
        // Generate subtitles from words array
        return utterance.words.map((word) => {
          console.log(`Processing word: text=${word.punctuated_word}, start=${word.start}, end=${word.end}`);
          return {
            text: word.punctuated_word,
            start: word.start,
            end: word.end,
          };
        });
      });
    } else if (transcription?.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
      // Fallback to alternatives if utterances is unavailable
      console.log('Falling back to alternatives');
      const alternative = transcription.results.channels[0].alternatives[0];
      subtitles = [{
        text: alternative.transcript,
        start: 0,
        end: effectiveDuration,
      }];
    }

    console.log('Subtitles before filter:', subtitles);
    subtitles = subtitles.filter((sub) => {
      const isValid = sub.start >= 0 && sub.end <= effectiveDuration;
      console.log(`Filtering subtitle: text=${sub.text}, start=${sub.start}, end=${sub.end}, isValid=${isValid}, effectiveDuration=${effectiveDuration}`);
      return isValid;
    });
    console.log('Subtitles after filter:', subtitles);

    if (subtitles.length === 0) {
      console.log('No valid subtitles after filtering, setting default');
      subtitles = [{ text: 'No audio detected', start: 0, end: effectiveDuration }];
    }

    console.log('Final subtitles set:', subtitles);
    setSubtitles(subtitles);
    setMessage('Subtitles generated successfully!');
  } catch (error) {
    console.error('Error generating subtitles:', error);
    setMessage(`Error generating subtitles: ${error.message}`);
    setSubtitles([{ text: 'Error generating subtitles', start: 0, end: videoDuration || 10 }]);
  } finally {
    setIsGeneratingSubtitles(false);
  }
};
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const progress = Math.min(100, activeStep * 20);

  return (
    <div className="flex h-screen  text-white  relative   ">
      {/* Animated Background */}
     
      
      
        
     

      {/* Main Content */}
      <div className="flex-1 flex flex-col z-10   ">
        {/* Navbar */}
     

        {/* Main Content Area */}

        
        <div className="flex-1    ">
          <div className="max-w-8xl mx-auto">
           

            {/* Progress Bar */}
            <div className="w-full bg-gray-800/60 h-2 rounded-full mb-8  backdrop-blur-sm">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 50 }}
                className="h-full bg-gradient-to-r from-purple-600 to-blue-500"
              />
            </div>

            <div className="flex gap-8">
              {/* Steps Sidebar */}
              <div className="lg:w-64 shrink-0">
                <div className="bg-gray-900/70 backdrop-blur-md rounded-2xl border border-gray-800/80 p-4 sticky top-4">
                  <h3 className="text-xl font-medium mb-4 px-2">Create Your Reel</h3>
                  {[
                    { num: 1, title: 'Choose Style', icon: Palette },
                    { num: 2, title: 'Generate Images', icon: Camera },
                    { num: 3, title: 'Add Audio', icon: Music },
                    { num: 4, title: 'Add Subtitles', icon: Type },
                    { num: 5, title: 'Preview & Export', icon: FileVideo }
                  ].map((step) => (
                    <motion.div
                      key={step.num}
                      whileHover={{ x: 4 }}
                      onClick={() => setActiveStep(step.num)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-2 ${
                        activeStep === step.num 
                          ? 'bg-purple-600/20 border border-purple-500/50' 
                          : 'hover:bg-gray-800/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        activeStep === step.num 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-800 text-gray-400'
                      }`}>
                        {activeStep > step.num ? (
                          <CheckCircle size={16} />
                        ) : (
                          <step.icon size={16} />
                        )}
                      </div>
                      <span className={activeStep === step.num ? 'font-medium' : 'text-gray-400'}>
                        {step.title}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <AnimatePresence mode="wait">
                {activeStep === 1 && (
  <motion.div
    key="step1"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800/80 p-6 mb-8 shadow-xl relative overflow-hidden"
  >
    <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-900/30 rounded-full filter blur-3xl animate-pulse"></div>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
          <Palette size={20} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Choose Your Style</h2>
          <p className="text-gray-400">Select the visual style for your reel</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {imageTypes.map(type => (
          <motion.div
            key={type.id}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden border ${
              imageType === type.id 
                ? 'border-purple-500 bg-gradient-to-br from-purple-900/30 to-blue-900/20' 
                : 'border-gray-800 bg-gray-900/40'
            } rounded-xl p-5 cursor-pointer transition-all group`}
            onClick={() => setImageType(type.id)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-800/80 flex items-center justify-center mr-3 group-hover:bg-purple-600/20 transition-colors">
                <type.icon size={20} className="text-purple-400" />
              </div>
              <h3 className="font-medium text-lg">{type.label}</h3>
            </div>
            <p className="text-gray-400 text-sm">{type.description}</p>
            {imageType === type.id && (
              <div className="absolute top-3 right-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center"
                >
                  <CheckCircle size={14} />
                </motion.div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <motion.button
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg flex items-center gap-2 shadow-lg shadow-purple-900/20"
          onClick={() => setActiveStep(2)}
        >
          Continue
          <ChevronRight size={18} />
        </motion.button>
      </div>
    </div>
  </motion.div>
)}
                  {activeStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800/80 p-6 mb-8 shadow-xl relative overflow-hidden"
                    >
                      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-900/30 rounded-full filter blur-3xl animate-pulse"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                            <Camera size={20} className="text-purple-400" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">Generate Images</h2>
                            <p className="text-gray-400">Describe what you want to see in your reel</p>
                          </div>
                        </div>
                        <textarea
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl py-4 px-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 shadow-inner backdrop-blur-sm"
                          placeholder="Describe what you want to see (e.g., 'A futuristic city at night with neon lights and flying cars')"
                          rows={4}
                        />
                        <div className="flex flex-wrap gap-3 mb-6">
                          {['Urban landscape', 'Nature scene', 'Abstract art', 'Product showcase', 'Minimalist'].map(tag => (
                            <motion.div 
                              key={tag}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-gray-800/60 text-gray-300 px-3 py-1 rounded-lg text-sm cursor-pointer border border-gray-700/50"
                              onClick={() => setImagePrompt(tag)}
                            >
                              {tag}
                            </motion.div>
                          ))}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={generateImages}
                          disabled={isGeneratingImages || !imagePrompt.trim()}
                          className={`${
                            isGeneratingImages || !imagePrompt.trim() ? 'opacity-50 cursor-not-allowed' : ''
                          } bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg flex items-center gap-3 shadow-lg shadow-purple-900/20`}
                        >
                          <Sparkles size={18} className="animate-pulse" />
                          {isGeneratingImages ? 'Generating...' : 'Generate Images'}
                        </motion.button>
                        {generatedImages.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
                          >
                            {generatedImages.map((img, index) => (
                              <motion.div
                                key={index}
                                whileHover={{ scale: 1.05, rotate: 1 }}
                                className="relative rounded-xl overflow-hidden aspect-[9/16] border-2 border-gray-800 group shadow-xl"
                              >
                                <img src={img} alt={`Generated ${index}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                                  <button className="bg-white/20 backdrop-blur-sm text-white rounded-lg px-3 py-1.5 text-sm">
                                    Select
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                        <div className="flex justify-between mt-6">
                          <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gray-800/80 text-white py-3 px-6 rounded-lg flex items-center gap-2"
                            onClick={() => setActiveStep(1)}
                          >
                            <ChevronRight size={18} className="rotate-180" />
                            Back
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg flex items-center gap-2 shadow-lg shadow-purple-900/20"
                            onClick={() => setActiveStep(3)}
                          >
                            Continue
                            <ChevronRight size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800/80 p-6 mb-8 shadow-xl relative overflow-hidden"
                    >
                      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-900/30 rounded-full filter blur-3xl animate-pulse"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                            <Music size={20} className="text-purple-400" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">Add Audio</h2>
                            <p className="text-gray-400">Add voice or music to your reel</p>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="md:w-1/2">
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-300 mb-2">Voice Narration</label>
                              <textarea
                                value={audioText}
                                onChange={(e) => setAudioText(e.target.value)}
                                className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
                                placeholder="Enter text for AI voice narration"
                                rows={5}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Voice</label>
                                <select
                                  value={selectedVoice}
                                  onChange={(e) => setSelectedVoice(e.target.value)}
                                  className="w-full bg-gray-900/80 border border-gray-700/80 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  {voiceOptions.map(voice => (
                                    <option key={voice.id} value={voice.id}>{voice.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Emotion</label>
                                <select
                                  value={audioEmotion}
                                  onChange={(e) => setAudioEmotion(e.target.value)}
                                  className="w-full bg-gray-900/80 border border-gray-700/80 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  {emotionOptions.map(emotion => (
                                    <option key={emotion} value={emotion}>{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Speed</label>
                                <select
                                  value={audioSpeed}
                                  onChange={(e) => setAudioSpeed(e.target.value)}
                                  className="w-full bg-gray-900/80 border border-gray-700/80 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  {speedOptions.map(speed => (
                                    <option key={speed} value={speed}>{speed.charAt(0).toUpperCase() + speed.slice(1)}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={generateAudio}
                              disabled={isGeneratingAudio || !audioText.trim()}
                              className={`${
                                isGeneratingAudio || !audioText.trim() ? 'opacity-50 cursor-not-allowed' : ''
                              } w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20`}
                            >
                              <Zap size={18} className={isGeneratingAudio ? 'animate-pulse' : ''} />
                              {isGeneratingAudio ? 'Generating...' : 'Generate Voice'}
                            </motion.button>
                          </div>
                          <div className="md:w-1/2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Background Music</label>
                            <div className="bg-gray-900/80 border border-gray-700/80 rounded-xl p-4 h-full flex flex-col">
                              <div className="flex-1 space-y-3">
                                {['Energetic', 'Cinematic', 'Lofi', 'Ambient', 'Corporate'].map((genre) => (
                                  <motion.div 
                                    key={genre}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-lg cursor-pointer group border border-gray-700/50"
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center">
                                      <Play size={16} className="text-gray-300 group-hover:text-purple-400" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{genre}</p>
                                      <p className="text-xs text-gray-400">30 seconds</p>
                                    </div>
                                    <div className="ml-auto">
                                      <Plus size={16} className="text-gray-400 group-hover:text-white" />
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="mt-3 border border-dashed border-gray-600 text-gray-400 hover:text-gray-300 rounded-lg py-3 w-full flex items-center justify-center gap-2"
                              >
                                <Upload size={16} />
                                Upload Music
                              </motion.button>
                            </div>
                          </div>
                        </div>
                        {audioUrl && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-gray-800/40 rounded-xl"
                          >
                            <h3 className="text-gray-300 mb-2 font-medium">Preview Audio</h3>
                            <div className="flex items-center gap-2">
                              <button className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                                <Play size={16} fill="white" className="ml-0.5" />
                              </button>
                              <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-gradient-to-r from-purple-500 to-blue-500 relative">
                                  <div className="absolute right-0 top-0 bottom-0 w-3 h-3 bg-white rounded-full shadow-lg transform translate-x-1/2 -translate-y-1/4" />
                                </div>
                              </div>
                              <span className="text-sm text-gray-400">00:22</span>
                            </div>
                          </motion.div>
                        )}
                        <div className="flex justify-between mt-6">
                          <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gray-800/80 text-white py-3 px-6 rounded-lg flex items-center gap-2"
                            onClick={() => setActiveStep(2)}
                          >
                            <ChevronRight size={18} className="rotate-180" />
                            Back
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg flex items-center gap-2 shadow-lg shadow-purple-900/20"
                            onClick={() => setActiveStep(4)}
                          >
                            Continue
                            <ChevronRight size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}


{activeStep === 4 && (
  <motion.div
    key="step4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800/80 p-6 mb-8 shadow-xl relative overflow-hidden"
  >
    <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-900/30 rounded-full filter blur-3xl animate-pulse"></div>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
          <Type size={20} className="text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Add Subtitles</h2>
          <p className="text-gray-400">Generate from audio or add manually</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {/* Subtitle Mode Toggle */}
          <div className="flex border border-gray-700/50 rounded-lg mb-4 overflow-hidden">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSubtitleMode('audio')}
              className={`flex-1 py-2 text-sm ${
                subtitleMode === 'audio'
                  ? 'bg-purple-600/30 text-white'
                  : 'bg-gray-800/60 text-gray-400'
              }`}
            >
              Generate from Audio
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSubtitleMode('manual')}
              className={`flex-1 py-2 text-sm ${
                subtitleMode === 'manual'
                  ? 'bg-purple-600/30 text-white'
                  : 'bg-gray-800/60 text-gray-400'
              }`}
            >
              Manual Input
            </motion.button>
          </div>

          {subtitleMode === 'audio' ? (
            <>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={generateSubtitles}
                disabled={isGeneratingSubtitles}
                className={`${
                  isGeneratingSubtitles ? 'opacity-50 cursor-not-allowed' : ''
                } w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 mb-4`}
              >
                <FileText size={18} className={isGeneratingSubtitles ? 'animate-pulse' : ''} />
                {isGeneratingSubtitles ? 'Generating...' : 'Generate Subtitles from Audio'}
              </motion.button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Subtitle Text</label>
                <textarea
                  value={manualSubtitle.text}
                  onChange={(e) =>
                    setManualSubtitle({ ...manualSubtitle, text: e.target.value })
                  }
                  className="w-full bg-gray-900/80 border border-gray-700/80 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter subtitle text"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Time (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualSubtitle.start}
                    onChange={(e) =>
                      setManualSubtitle({ ...manualSubtitle, start: e.target.value })
                    }
                    className="w-full bg-gray-900/80 border border-gray-700/80 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 0.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">End Time (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualSubtitle.end}
                    onChange={(e) =>
                      setManualSubtitle({ ...manualSubtitle, end: e.target.value })
                    }
                    className="w-full bg-gray-900/80 border border-gray-700/80 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., 3.0"
                  />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={addManualSubtitle}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
              >
                <Plus size={18} />
                Add Subtitle
              </motion.button>
            </div>
          )}

          <label className="block text-sm font-medium text-gray-300 mt-4 mb-2">Subtitle Style</label>
          <div className="grid grid-cols-3 gap-3">
            {['none', 'hormozi', 'abdaal', 'neonGlow', 'retroWave', 'minimalPop'].map((style) => (
              <motion.div
                key={style}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSubtitleStyle(style)}
                className={`${
                  subtitleStyle === style
                    ? 'bg-purple-600/30 border-purple-500'
                    : 'bg-gray-800/40 border-gray-700/50'
                } border rounded-lg p-3 text-center cursor-pointer`}
              >
                <p className={`text-sm ${subtitleStyle === style ? 'text-white' : 'text-gray-400'}`}>
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="bg-gray-900/80 border border-gray-700/80 rounded-xl p-4">
          <h3 className="text-gray-300 mb-3 font-medium">Subtitle Preview</h3>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {subtitles.map((subtitle, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-gray-800/60 rounded-lg border border-gray-700/50"
                >
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{subtitle.start.toFixed(1)}s</span>
                    <span>{subtitle.end.toFixed(1)}s</span>
                  </div>
                  <p className="text-sm">{subtitle.text}</p>
                </motion.div>
              ))}
              {subtitles.length === 0 && (
                <p className="text-gray-400 text-sm">No subtitles added yet.</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gray-800/80 text-white py-3 px-6 rounded-lg flex items-center gap-2"
          onClick={() => setActiveStep(3)}
        >
          <ChevronRight size={18} className="rotate-180" />
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg flex items-center gap-2 shadow-lg shadow-purple-900/20"
          onClick={() => setActiveStep(5)}
        >
          Continue
          <ChevronRight size={18} />
        </motion.button>
      </div>
    </div>
  </motion.div>
)}




               {activeStep === 5 && (
                    <motion.div
                      key="step5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800/80 p-6 mb-8 shadow-xl relative overflow-hidden"
                    >
                      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-900/30 rounded-full filter blur-3xl animate-pulse"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                            <FileVideo size={20} className="text-purple-400" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">Preview & Export</h2>
                            <p className="text-gray-400">Final review and export options</p>
                          </div>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div className="lg:w-2/3">
                            <div className="relative aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl mx-auto" style={{ maxWidth: '360px' }}>
                              <Player
                                component={MyVideo}
                                inputProps={{
                                  images: generatedImages,
                                  audioUrl,
                                  subtitles,
                                  subtitleStyle,
                                  videoDuration,
                                }}
                                durationInFrames={Math.ceil(videoDuration * 30)}
                                compositionWidth={360}
                                compositionHeight={640}
                                fps={30}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                }}
                                controls
                                loop={false}
                              />
                            </div>
                          </div>
                          <div className="lg:w-1/3">
                            <div className="bg-gray-900/80 border border-gray-700/80 rounded-xl p-4 h-full">
                              <h3 className="text-gray-300 mb-4 font-medium">Export Options</h3>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                                  <select className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option>MP4 (Recommended)</option>
                                    <option>MOV</option>
                                    <option>WebM</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">Quality</label>
                                  <select className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option>High (1080p)</option>
                                    <option>Medium (720p)</option>
                                    <option>Low (480p)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                                  <div className="grid grid-cols-3 gap-2">
                                    {['9:16', '4:5', '1:1'].map((ratio) => (
                                      <motion.div
                                        key={ratio}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-2 text-center text-sm cursor-pointer hover:bg-purple-600/20 hover:border-purple-500/50"
                                      >
                                        {ratio}
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={renderAllSegments}
                                className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
                              >
                                <Sparkle size={18} />
                                Export Video
                              </motion.button>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-6">
                          <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gray-800/80 text-white py-3 px-6 rounded-lg flex items-center gap-2"
                            onClick={() => setActiveStep(4)}
                          >
                            <ChevronRight size={18} className="rotate-180" />
                            Back
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg flex items-center gap-2 shadow-lg shadow-green-900/20"
                          >
                            <CheckCircle size={18} />
                            Finish
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

           
           
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}