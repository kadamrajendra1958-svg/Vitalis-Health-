"use client";

import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Assistant from '@/components/Assistant';
import JourneyTimeline from '@/components/JourneyTimeline';
import Login from '@/components/Login';
import { Button } from '@/components/ui/button';
import { Menu, X, HeartPulse, LogOut } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as motion from 'motion/react-client';
import { useAuth } from '@/lib/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function App() {
  const [activeRoute, setActiveRoute] = useState('Dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/90 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveRoute('Dashboard')}>
            <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-slate-900">CareSync</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {['Dashboard', 'Journey', 'Assistant'].map((item) => (
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
              <Button variant="ghost" size="icon" onClick={() => signOut(auth)} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="md:hidden text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-slate-100 bg-white pb-6 shadow-xl absolute w-full left-0 top-16"
          >
            <div className="px-4 pt-4 space-y-4">
              <div className="flex flex-col space-y-2">
                {['Dashboard', 'Journey', 'Assistant'].map((item) => (
                  <button 
                    key={item}
                    onClick={() => {
                      setActiveRoute(item);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-4 py-3 rounded-xl text-left text-base font-medium transition-colors ${activeRoute === item ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 truncate">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={() => signOut(auth)} className="text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      <main className="relative z-10 w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeRoute === 'Dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
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
        </AnimatePresence>
      </main>
    </div>
  );
}
