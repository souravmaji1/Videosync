'use client'
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Home,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Video,
  BookOpen,
  BarChart2 as Music,
  Users,
  Sparkles,
  Zap,
  Plus,
  Check,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PricingPage() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNav, setSelectedNav] = useState('pricing');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Navigation item component for sidebar
  const NavItem = ({ icon, label, active, onClick, href }) => {
    return (
      <li>
        <Link href={href} passHref>
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
        </Link>
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
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800/50 transition-all z-50 relative"
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
                href="/dashboard"
              />
              <NavItem
                icon={<Video size={20} />}
                label="Create Videos"
                active={selectedNav === 'create'}
                onClick={() => setSelectedNav('create')}
                href="/create"
              />
              <NavItem
                icon={<BookOpen size={20} />}
                label="Video Library"
                active={selectedNav === 'library'}
                onClick={() => setSelectedNav('library')}
                href="/videolibrary"
              />
              <NavItem
                icon={<Music size={20} />}
                label="Your Stats"
                active={selectedNav === 'stats'}
                onClick={() => setSelectedNav('stats')}
                href="/stats"
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
                label="Pricing"
                active={selectedNav === 'pricing'}
                onClick={() => setSelectedNav('pricing')}
                href="/pricing"
              />
              <NavItem
                icon={<Settings size={20} />}
                label="Settings"
                active={selectedNav === 'settings'}
                onClick={() => setSelectedNav('settings')}
                href="/settings"
              />
            </ul>
          </div>

          {sidebarOpen && (
            <div className={`mt-8 transition-all duration-500 delay-200 ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
              <div className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-blue-900/40 z-0 pointer-events-none"></div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-500/20 rounded-full blur-xl z-0 pointer-events-none"></div>
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl z-0 pointer-events-none"></div>
                <div className="relative p-6 backdrop-blur-sm border border-purple-500/20 rounded-2xl z-10">
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
                  <button className="w-full py-3 text-sm font-medium rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 flex items-center justify-center group z-50 relative">
                    <Zap size={16} className="mr-2 group-hover:animate-pulse" />
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-gray-800/50">
          <button className="w-full flex items-center justify-center py-4 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 group relative overflow-hidden z-50">
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400/0 via-white/20 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 transform -translate-x-full group-hover:translate-x-full z-0 pointer-events-none"></div>
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
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                Pricing Plans
              </h1>
              <p className="text-gray-400 mt-2">
                Choose the plan that best fits your video creation needs
              </p>
            </div>

            {/* Pricing Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col">
                <h2 className="text-xl font-semibold text-white">Free</h2>
                <p className="text-gray-400 mt-2">Get started with basic features</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">$0</span>
                  <span className="text-gray-400 text-sm">/month</span>
                </div>
                <Button
                  className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-white"
                  disabled
                >
                  Current Plan
                </Button>
                <div className="mt-6 flex-1">
                  <ul className="space-y-3 text-gray-300 text-sm">
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2" size={16} />
                      5 video uploads/month
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2" size={16} />
                      Basic AI editing tools
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2" size={16} />
                      720p export quality
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2" size={16} />
                      Community support
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="bg-gradient-to-br from-purple-900/60 to-blue-900/60 border border-purple-500/50 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
                <h2 className="text-xl font-semibold text-white">Pro</h2>
                <p className="text-gray-300 mt-2">Unlock advanced features for creators</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">$19</span>
                  <span className="text-gray-300 text-sm">/month</span>
                </div>
                <Button
                  className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                >
                  Upgrade to Pro
                </Button>
                <div className="mt-6 flex-1">
                  <ul className="space-y-3 text-gray-200 text-sm">
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2" size={16} />
                      Unlimited video uploads
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2" size={16} />
                      Advanced AI editing tools
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2" size={16} />
                      4K export quality
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2" size={16} />
                      Priority support
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2" size={16} />
                      Team collaboration
                    </li>
                  </ul>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col">
                <h2 className="text-xl font-semibold text-white">Enterprise</h2>
                <p className="text-gray-400 mt-2">Custom solutions for businesses</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">Custom</span>
                  <span className="text-gray-400 text-sm">/month</span>
                </div>
                <Button
                  className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                >
                  Contact Sales
                </Button>
                <div className="mt-6 flex-1">
                  <ul className="space-y-3 text-gray-300 text-sm">
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2" size={16} />
                      Custom video upload limits
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2" size={16} />
                      Full AI toolset
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2" size={16} />
                      Dedicated support
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2" size={16} />
                      Advanced analytics
                    </li>
                    <li className="flex items-center">
                      <Check className="text-green-400 mr-2" size={16} />
                      Custom integrations
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-12 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-300">Can I switch plans anytime?</h3>
                  <p className="text-gray-400 text-sm mt-2">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-300">Is there a free trial for the Pro plan?</h3>
                  <p className="text-gray-400 text-sm mt-2">
                    We offer a 7-day free trial for the Pro plan, so you can explore all features before committing.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-300">What payment methods are accepted?</h3>
                  <p className="text-gray-400 text-sm mt-2">
                    We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
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