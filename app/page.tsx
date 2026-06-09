"use client";

import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Assistant from '@/components/Assistant';
import JourneyTimeline from '@/components/JourneyTimeline';
import Login from '@/components/Login';
import { Button } from '@/components/ui/button';
import { HeartPulse, LogOut, Home, Route, MessageSquare, User } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as motion from 'motion/react-client';
import { useAuth } from '@/lib/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

function ProfileView({ email }: { email: string | null }) {
  return (
    <div className="max-w-md mx-auto p-6 mt-12 mb-32 space-y-8">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-24 w-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
          <User className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Patient Profile</h2>
        <p className="text-slate-500 font-medium">{email}</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-between active:scale-[0.98] transition-transform text-slate-700 h-14 text-base font-medium rounded-xl hover:bg-slate-50"
        >
          Account Settings
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-between active:scale-[0.98] transition-transform text-slate-700 h-14 text-base font-medium rounded-xl hover:bg-slate-50"
        >
          Privacy & Security
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-between active:scale-[0.98] transition-transform text-slate-700 h-14 text-base font-medium rounded-xl hover:bg-slate-50"
        >
          Notifications
        </Button>
      </div>

      <Button 
        variant="outline" 
        onClick={() => signOut(auth)} 
        className="w-full h-14 rounded-xl text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-medium text-base active:scale-[0.98] transition-all"
      >
        <LogOut className="h-5 w-5 mr-3" />
        Sign Out
      </Button>
    </div>
  );
}

export default function App() {
  const [activeRoute, setActiveRoute] = useState('Home');
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user) {
    return <Login />;
  }

  const navItems = [
    { id: 'Home', icon: Home, label: 'Home' },
    { id: 'Journey', icon: Route, label: 'Journey' },
    { id: 'Assistant', icon: MessageSquare, label: 'Assistant' },
    { id: 'Profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans pb-24 md:pb-0">
      {/* Top Navigation - Desktop Only */}
      <nav className="hidden md:block sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/90 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveRoute('Home')}>
            <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-slate-900">CareSync</span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              {['Home', 'Journey', 'Assistant'].map((item) => (
                <button 
                  key={item}
                  onClick={() => setActiveRoute(item)}
                  className={`text-sm font-medium transition-colors relative py-2 ${activeRoute === item ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                >
                  {item}
                  {activeRoute === item && (
                    <motion.div layoutId="navbar-indicator" className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 ml-2 pl-6 border-l border-slate-200">
              <span className="text-sm font-medium text-slate-500 truncate max-w-[150px]">{user.email}</span>
              <Button variant="ghost" size="icon" onClick={() => signOut(auth)} className="text-slate-500 hover:text-red-600 hover:bg-red-50 relative group">
                <LogOut className="h-4 w-4" />
                <span className="absolute -bottom-8 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeRoute === 'Home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
              <Dashboard />
            </motion.div>
          )}
          {activeRoute === 'Journey' && (
            <motion.div key="journey" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
              <JourneyTimeline />
            </motion.div>
          )}
          {activeRoute === 'Assistant' && (
            <motion.div key="assistant" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
              <Assistant />
            </motion.div>
          )}
          {activeRoute === 'Profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
              <ProfileView email={user.email} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200/60 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-20 px-2 sm:px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveRoute(item.id)}
                className="flex flex-col items-center justify-center flex-1 h-full relative"
              >
                <div className={`flex flex-col items-center justify-center space-y-1 transition-all ${isActive ? 'text-blue-600 scale-110' : 'text-slate-500 hover:text-slate-900'}`}>
                  <Icon className={`w-6 h-6 stroke-[2] ${isActive ? 'fill-blue-100' : ''}`} />
                  <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
