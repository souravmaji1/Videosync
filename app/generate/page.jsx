'use client'
import { useState, useEffect } from 'react';
import { 
  Upload,
  Video,
  Scissors,
  Folder,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Home,

  Settings,
  Users,
  BarChart2,
  HelpCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Play,
  Clock,
  Star,
  Zap,
  Layout,
  Coffee,
  BookOpen,
  Music,
  Cloud
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function VideoUploadPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedNav, setSelectedNav] = useState('video-projects');
  const recentProjects =[
    { name: "Product Demo", date: "2 days ago", progress: 85 },
    { name: "Promo Video", date: "1 week ago", progress: 100 },
    { name: "Tutorial Series", date: "2 weeks ago", progress: 100 }
  ];

  // Animation effect on mount
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
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
    // Handle file drop
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Process files here
    }
  };

  // Particle effect component
  const Particles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-2 h-2 rounded-full bg-purple-500 opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animation: 'float 15s infinite ease-in-out'
            }}
          />
        ))}
      </div>
    );
  };

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
    
    <Particles />

    {/* Enhanced Sidebar */}
    <div className={`${sidebarOpen ? 'w-72' : 'w-24'} bg-gray-900/90 backdrop-blur-md border-r border-gray-800/50 transition-all duration-300 flex flex-col z-10`}>
      {/* Brand Header with Glass Effect */}
      <div className="py-6 border-b border-gray-800/50 transition-all">
        <div className={`px-6 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen ? (
            <div className="flex items-center">
              <div className="relative w-12 h-12 mr-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center">
                  <Video size={24} className="text-white z-10" />
                  {/* Animated glow effect */}
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
                {/* Animated glow effect */}
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
      
      {/* Navigation with enhanced visual elements */}
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
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-blue-900/40"></div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
              
              {/* Card content */}
              <div className="relative p-6 backdrop-blur-sm border border-purple-500/20 rounded-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-xl border border-purple-500/20 shadow-inner shadow-purple-500/10">
                    <Sparkles size={20} className="text-purple-300" />
                  </div>
                  <h4 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Pro Features</h4>
                </div>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
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
      
      {/* Create New Project Button */}
      <div className="p-4 border-t border-gray-800/50">
        <button className="w-full flex items-center justify-center py-4 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 group relative overflow-hidden">
          {/* Button glow effect */}
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
                  <a href="#" className="block px-3 py-2 rounded-md hover:bg-gray-800 text-sm text-red-400 transition">Sign Out</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className={`transition-all duration-700 ${isAnimating ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'}`}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
                How would you like to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">create</span>?
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/0 via-purple-500 to-blue-500/0"></div>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Choose your workflow to get started with your video project
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Bulk Upload Option */}
            <div 
              className={`relative group bg-gray-900/40 backdrop-blur-md rounded-xl border-2 ${selectedOption === 'bulk' ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-800 hover:border-gray-700 group-hover:shadow-lg group-hover:shadow-purple-500/10'} p-8 transition-all cursor-pointer overflow-hidden ${isAnimating ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'}`}
              style={{ transitionDelay: '100ms' }}
              onClick={() => setSelectedOption('bulk')}
            >
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-800/50 mr-4 shadow-md shadow-purple-900/20 group-hover:shadow-purple-900/40 transition-all">
                  <Folder size={24} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold">Bulk Upload</h3>
              </div>
              <p className="text-gray-400 mb-6 relative z-10">
                Upload multiple videos at once to create separate posts for each one. Perfect for content libraries or batch processing.
              </p>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center text-purple-300">
                  <CheckCircle size={16} className="mr-2 text-purple-400" />
                  <span className="text-sm">Process multiple videos simultaneously</span>
                </div>
                <div className="flex items-center text-purple-300">
                  <CheckCircle size={16} className="mr-2 text-purple-400" />
                  <span className="text-sm">Apply consistent edits across all</span>
                </div>
                <div className="flex items-center text-purple-300">
                  <CheckCircle size={16} className="mr-2 text-purple-400" />
                  <span className="text-sm">Schedule all at once</span>
                </div>
              </div>
              
              {selectedOption === 'bulk' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle size={14} className="text-white" />
                </div>
              )}
            </div>

            {/* Single Video Option */}
            <div 
              className={`relative group bg-gray-900/40 backdrop-blur-md rounded-xl border-2 ${selectedOption === 'single' ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-800 hover:border-gray-700 group-hover:shadow-lg group-hover:shadow-blue-500/10'} p-8 transition-all cursor-pointer overflow-hidden ${isAnimating ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'}`}
              style={{ transitionDelay: '200ms' }}
              onClick={() => setSelectedOption('single')}
            >
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-800/50 mr-4 shadow-md shadow-blue-900/20 group-hover:shadow-blue-900/40 transition-all">
                  <Scissors size={24} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold">Single Video</h3>
              </div>
              <p className="text-gray-400 mb-6 relative z-10">
                Upload one video and cut it into multiple clips. Ideal for long-form content or extracting highlights.
              </p>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center text-blue-300">
                  <CheckCircle size={16} className="mr-2 text-blue-400" />
                  <span className="text-sm">AI-powered clip detection</span>
                </div>
                <div className="flex items-center text-blue-300">
                  <CheckCircle size={16} className="mr-2 text-blue-400" />
                  <span className="text-sm">Customize each clip individually</span>
                </div>
                <div className="flex items-center text-blue-300">
                  <CheckCircle size={16} className="mr-2 text-blue-400" />
                  <span className="text-sm">Optimize for different platforms</span>
                </div>
              </div>
              
              {selectedOption === 'single' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle size={14} className="text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Recent Projects Section (New) */}
          {!selectedOption && (
            <div className={`mt-12 transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'}`} style={{ transitionDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Recent Projects</h3>
                <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition">View All</a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentProjects.map((project, index) => (
                  <div key={index} className="bg-gray-900/40 backdrop-blur-md rounded-xl border border-gray-800 hover:border-gray-700 p-4 transition-all group cursor-pointer hover:shadow-lg hover:shadow-purple-900/10">
                    <div className="w-full h-32 bg-gray-800 rounded-lg mb-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                          <Play size={20} className="text-white ml-1" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">03:24</div>
                    </div>
                    <h4 className="font-medium mb-1">{project.name}</h4>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{project.date}</span>
                      </div>
                      {project.progress < 100 ? (
                        <div className="flex items-center">
                          <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden mr-1">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${project.progress}%` }}></div>
                          </div>
                          <span>{project.progress}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-green-400">
                          <CheckCircle size={14} className="mr-1" />
                          <span>Complete</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Section */}
          {selectedOption && (
            <div 
              className={`mt-12 bg-gray-900/40 backdrop-blur-md rounded-xl border ${dragActive ? 'border-purple-500 bg-purple-900/10 shadow-lg shadow-purple-500/20' : 'border-gray-800'} p-8 transition-all duration-300 relative overflow-hidden ${isAnimating ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'}`}
              style={{ transitionDelay: '300ms' }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {/* Animated background elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-900/20 rounded-full filter blur-xl opacity-50"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-900/20 rounded-full filter blur-xl opacity-50"></div>
              
              <div className="text-center relative z-10">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-full flex items-center justify-center mb-4 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-400/30 animate-spin-slow"></div>
                  <Upload size={28} className="text-purple-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  {selectedOption === 'bulk' ? 'Upload Multiple Videos' : 'Upload Your Video'}
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {selectedOption === 'bulk' 
                    ? 'Drag and drop your video files here, or click to browse. You can upload up to 10 videos at once.'
                    : 'Drag and drop your video file here, or click to browse. We support MP4, MOV, and AVI formats.'}
                </p>
                
                <div className="relative mb-6">
                  <input 
                    type="file" 
                    className="hidden" 
                    id="file-upload" 
                    multiple={selectedOption === 'bulk'}
                    accept="video/*"
                  />
                  <label 
                    htmlFor="file-upload"
                    className="block w-full md:w-96 mx-auto py-4 px-6 text-center border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl bg-gray-800/50 hover:bg-purple-900/10 cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-center justify-center">
                      <Upload size={20} className="mr-2 text-purple-400" />
                      <span>Browse for files</span>
                    </div>
                  </label>
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-4">
                  <button className="w-full md:w-auto bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center">
                    <Layout size={18} className="mr-2" />
                    Choose Template
                  </button>
                  
                  <button className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-3 px-8 rounded-lg transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 flex items-center justify-center group">
                    Continue
                    <ArrowRight size={18} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Features Section */}
          {selectedOption && (
            <div className={`mt-12 transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'}`} style={{ transitionDelay: '400ms' }}>
              <div className="flex items-center mb-6">
                <h3 className="text-xl font-semibold mr-3">AI Features</h3>
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
                  <Sparkles size={12} className="mr-1" />
                  <span>Premium</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/40 backdrop-blur-md rounded-xl border border-gray-800 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-900/10 p-5 transition-all cursor-pointer group">
                  <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-800/50 mb-4 w-12 h-12 flex items-center justify-center shadow-md shadow-purple-900/20 group-hover:shadow-purple-900/40 transition-all">
                    <Scissors size={22} className="text-purple-400" />
                  </div>
                  <h4 className="font-medium mb-2">AI Auto-Cut</h4>
                  <p className="text-sm text-gray-400">Automatically detect and cut scenes, silences, and transitions in your video.</p>
                </div>
                
                <div className="bg-gray-900/40 backdrop-blur-md rounded-xl border border-gray-800 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-900/10 p-5 transition-all cursor-pointer group">
                  <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-800/50 mb-4 w-12 h-12 flex items-center justify-center shadow-md shadow-blue-900/20 group-hover:shadow-blue-900/40 transition-all">
                    <BookOpen size={22} className="text-blue-400" />
                  </div>
                  <h4 className="font-medium mb-2">Transcript & Captions</h4>
                  <p className="text-sm text-gray-400">Generate accurate transcriptions and auto-sync subtitles in multiple languages.</p>
                </div>
                
                <div className="bg-gray-900/40 backdrop-blur-md rounded-xl border border-gray-800 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-900/10 p-5 transition-all cursor-pointer group">
                  <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-800/50 mb-4 w-12 h-12 flex items-center justify-center shadow-md shadow-purple-900/20 group-hover:shadow-purple-900/40 transition-all">
                    <Coffee size={22} className="text-purple-400" />
                  </div>
                  <h4 className="font-medium mb-2">Content Optimization</h4>
                  <p className="text-sm text-gray-400">AI suggestions for thumbnails, titles, and descriptions to maximize engagement.</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Help & Tips */}
          <div className={`mt-12 transition-all duration-500 ${isAnimating ? 'opacity-0 transform translate-y-8' : 'opacity-100 transform translate-y-0'}`} style={{ transitionDelay: '500ms' }}>
            <div className="flex items-center mb-6">
              <h3 className="text-xl font-semibold">Help & Tips</h3>
            </div>
            
            <div className="bg-gray-900/40 backdrop-blur-md rounded-xl border border-gray-800 p-6 transition-all">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="flex items-start mb-4 md:mb-0">
                  <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-800/50 mr-4 shadow-md shadow-blue-900/20">
                    <Star size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Need help getting started?</h4>
                    <p className="text-sm text-gray-400">Check out our beginner-friendly video tutorials and guides.</p>
                  </div>
                </div>
                <div className="w-full md:w-auto">
                  <button className="w-full md:w-auto bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center">
                    <Play size={18} className="mr-2" />
                    Watch Tutorial
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  </div>
);
}