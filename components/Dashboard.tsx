"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Activity, 
  FileText, 
  ChevronRight, 
  Clock,
  HeartPulse,
  Pill,
  Calendar,
  MessageSquare,
  Bookmark,
  TrendingUp,
  Brain,
  Stethoscope
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { AnimatedNumber } from '@/components/AnimatedNumber';

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'tween' as const, ease: 'easeOut', duration: 0.4 } },
};

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  const [recoveryData, setRecoveryData] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [journeys, setJourneys] = useState<any[]>([]);
  const [savedCases, setSavedCases] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const unsubs: any[] = [];
    setIsLoading(true);

    try {
      // Listen to recovery data
      unsubs.push(onSnapshot(query(collection(db, 'users', user.uid, 'recoveryData'), orderBy('createdAt', 'asc')), (snap) => {
        setRecoveryData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }));

      // Listen to appointments
      unsubs.push(onSnapshot(query(collection(db, 'users', user.uid, 'appointments'), orderBy('date', 'asc')), (snap) => {
        setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }));

      // Listen to journeys
      unsubs.push(onSnapshot(query(collection(db, 'users', user.uid, 'journeys'), orderBy('createdAt', 'desc')), (snap) => {
        setJourneys(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }));

      // Listen to saved cases
      unsubs.push(onSnapshot(query(collection(db, 'users', user.uid, 'savedCases'), orderBy('createdAt', 'desc')), (snap) => {
        setSavedCases(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }));

      // Listen to medical reports
      unsubs.push(onSnapshot(query(collection(db, 'users', user.uid, 'reports'), orderBy('createdAt', 'desc')), (snap) => {
        setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }));

      // Listen to conversations
      unsubs.push(onSnapshot(query(collection(db, 'users', user.uid, 'conversations'), orderBy('createdAt', 'desc'), limit(3)), (snap) => {
        setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }));
    } catch (e) {
      console.error("Error setting up listeners:", e);
    }
    
    setIsLoading(false);

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [user]);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div 
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 mt-4"
        >
          <div className="flex items-center gap-4 mb-8">
             <div className="h-10 w-48 bg-slate-200/60 rounded-lg animate-pulse" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[280px] bg-slate-200/60 rounded-2xl animate-pulse" />
            <div className="h-[280px] bg-slate-200/60 rounded-2xl animate-pulse" />
            <div className="lg:col-span-2 h-[240px] bg-slate-200/60 rounded-2xl animate-pulse" />
            <div className="h-[240px] bg-slate-200/60 rounded-2xl animate-pulse" />
            <div className="h-[240px] bg-slate-200/60 rounded-2xl animate-pulse" />
            <div className="lg:col-span-2 h-[240px] bg-slate-200/60 rounded-2xl animate-pulse" />
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="content"
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8"
        >
      {/* PREMIUM HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 text-white shadow-xl shadow-blue-900/10 border border-slate-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
             animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }} 
             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -top-[20%] -right-[10%] w-[60%] h-[120%] bg-teal-500 opacity-20 blur-[100px] rounded-full" 
          />
          <motion.div 
             animate={{ opacity: [0.2, 0.4, 0.2], scale: [1.1, 1, 1.1] }} 
             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[100%] bg-blue-500 opacity-20 blur-[120px] rounded-full" 
          />
        </div>

        <div className="relative z-10 px-6 sm:px-10 lg:px-12 py-10 sm:py-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-teal-100 text-sm font-medium backdrop-blur-md shadow-sm">
               Good morning, <span className="font-bold text-white truncate max-w-[120px] inline-block align-bottom">{user?.email?.split('@')[0] || 'User'}</span>
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Your Healthcare <br className="hidden sm:block" /> Journey Companion
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-teal-50/80 text-base sm:text-lg max-w-xl mx-auto md:mx-0 font-medium">
              Get guidance from symptoms to recovery.
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
               <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                 <Button size="lg" className="bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold rounded-xl text-base px-6 py-6 h-auto transition-all w-full sm:w-auto shadow-lg shadow-teal-900/20">
                   Start New Assessment
                 </Button>
               </motion.div>
               <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                 <Button size="lg" variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-xl text-base px-6 py-6 h-auto transition-all w-full sm:w-auto backdrop-blur-md">
                   Find Specialists
                 </Button>
               </motion.div>
            </motion.div>
          </div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }} 
             animate={{ opacity: 1, scale: 1 }} 
             transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
             className="relative hidden sm:flex justify-center items-center shrink-0 w-64 h-64 lg:w-80 lg:h-80"
          >
            <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-[60px] animate-pulse" />
            <div className="relative z-10 w-full h-full bg-white/5 border border-white/10 rounded-full flex flex-col items-center justify-center backdrop-blur-md shadow-2xl space-y-6">
               <div className="absolute inset-4 border border-white/10 rounded-full" />
               <div className="absolute inset-8 border border-white/5 rounded-full" />
               <HeartPulse className="w-20 h-20 text-teal-300 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
               <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/20 backdrop-blur-md">
                     <Brain className="w-6 h-6" />
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/20 backdrop-blur-md">
                     <TrendingUp className="w-6 h-6" />
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {journeys.length === 0 ? (
        <div className="space-y-8">
          <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="grid md:grid-cols-3 gap-6">
            <Card className="border-slate-200/60 shadow-sm rounded-2xl hover:shadow-md transition-all hover:border-blue-200 cursor-default bg-white">
               <CardContent className="p-6">
                  <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Understand Symptoms</h3>
                  <p className="text-slate-500 text-sm">Use our AI assistant to understand what you&apos;re experiencing before visiting a doctor.</p>
               </CardContent>
            </Card>
            <Card className="border-slate-200/60 shadow-sm rounded-2xl hover:shadow-md transition-all hover:border-blue-200 cursor-default bg-white">
               <CardContent className="p-6">
                  <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Find Specialists</h3>
                  <p className="text-slate-500 text-sm">Get matched with the right healthcare professionals based on your specific needs.</p>
               </CardContent>
            </Card>
            <Card className="border-slate-200/60 shadow-sm rounded-2xl hover:shadow-md transition-all hover:border-blue-200 cursor-default bg-white">
               <CardContent className="p-6">
                  <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Plan Treatment Journey</h3>
                  <p className="text-slate-500 text-sm">Track your progress, appointments, and recovery milestones in one place.</p>
               </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
            <h2 className="text-xl font-bold text-slate-900 mb-6 px-1">Recent Activity</h2>
            <Card className="border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-slate-50/50">
              <CardContent className="p-12 text-center flex flex-col items-center justify-center">
                 <div className="h-24 w-24 bg-white shadow-sm rounded-full flex items-center justify-center mb-6 border border-slate-100">
                   <Activity className="h-12 w-12 text-blue-200" />
                 </div>
                 <h3 className="text-lg font-semibold text-slate-700 mb-2">No activity yet</h3>
                 <p className="text-slate-500 max-w-sm mx-auto">
                   Your recent health assessments, appointments, and journey milestones will appear here.
                 </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="lg:col-span-2">
          <Card className="h-full border-slate-200/60 shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Recovery Progress
                </CardTitle>
                <CardDescription>Recent Activity Tracking (Last 7 days)</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full mt-4 flex items-center justify-center">
                {recoveryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={recoveryData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMobility" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }} 
                        dy={10} 
                      />
                      <Tooltip 
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                         itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                      />
                      <Area type="monotone" dataKey="mobility" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorMobility)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-slate-400 text-sm">No recovery data available</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
          <Card className="h-full border-slate-200/60 shadow-sm rounded-2xl bg-gradient-to-b from-blue-50/50 to-white hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                 <Calendar className="h-5 w-5 text-blue-600" />
                 Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointments.length > 0 ? appointments.map((apt: any) => (
                <div key={apt.id} className="flex gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                   <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 flex flex-col items-center justify-center shrink-0">
                     <span className="text-[10px] font-bold uppercase leading-none">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                     <span className="text-lg font-bold leading-none mt-0.5">{new Date(apt.date).getDate()}</span>
                   </div>
                   <div>
                     <h4 className="font-semibold text-slate-900 text-sm">{apt.title}</h4>
                     <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                       <Clock className="h-3 w-3" /> {new Date(apt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {apt.doctor}
                     </p>
                   </div>
                </div>
              )) : (
                <div className="text-center py-6 text-slate-400 text-sm">No upcoming appointments</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="lg:col-span-2">
           <Card className="h-full border-slate-200/60 shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300">
             <CardHeader className="flex flex-row items-center justify-between pb-2">
               <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Treatment Journeys
                  </CardTitle>
               </div>
               <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 text-sm">View all</Button>
             </CardHeader>
             <CardContent className="space-y-4">
                {journeys.length > 0 ? journeys.map((journey: any, i) => (
                   <div key={journey.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-100 transition-colors group cursor-pointer">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 bg-blue-50 text-blue-600`}>
                         <Activity className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-end mb-2 mt-1">
                            <h4 className="font-semibold text-slate-900 text-sm truncate pr-4 group-hover:text-blue-600 transition-colors">{journey.title}</h4>
                            <span className="text-xs font-semibold text-slate-700"><AnimatedNumber value={journey.progress || 0} />%</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${journey.progress || 0}%` }} transition={{ duration: 0.5, ease: "easeOut" }} className="h-full bg-blue-500 rounded-full" />
                         </div>
                         <div className="text-xs text-slate-500 mt-2">Started {new Date(journey.createdAt).toLocaleDateString()}</div>
                      </div>
                   </div>
                )) : (
                  <div className="text-center py-6 text-slate-400 text-sm">No ongoing journeys</div>
                )}
             </CardContent>
           </Card>
        </motion.div>

        <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
          <Card className="h-full border-slate-200/60 shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                 <Bookmark className="h-5 w-5 text-blue-600" />
                 Saved Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-3">
                 {savedCases.length > 0 ? savedCases.map((item: any) => (
                   <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors cursor-pointer group">
                      <div className="overflow-hidden">
                        <h4 className="font-medium text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{item.type}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0 m-2" />
                   </div>
                 )) : (
                   <div className="text-center py-6 text-slate-400 text-sm">No saved cases</div>
                 )}
               </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
          <Card className="h-full border-slate-200/60 shadow-sm rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="pb-3">
               <CardTitle className="text-lg flex items-center gap-2">
                 <FileText className="h-5 w-5 text-blue-600" />
                 Medical Reports
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-0 text-sm">
                  {reports.length > 0 ? reports.map((report: any) => (
                    <div key={report.id} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 -mx-2 rounded-lg cursor-pointer group transition-colors">
                       <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                         <FileText className="h-4 w-4" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="font-medium text-slate-800 truncate group-hover:text-blue-700">{report.name}</div>
                         <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                           <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                         </div>
                       </div>
                    </div>
                  )) : (
                    <div className="text-center py-6 text-slate-400 text-sm">No reports available</div>
                  )}
               </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="lg:col-span-2">
           <Card className="h-full border-slate-200/60 shadow-sm rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col">
             <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100 shrink-0">
               <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Recent Assistant Conversations
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0 flex-1 flex flex-col">
                <div className="divide-y divide-slate-100 flex-1">
                  {conversations.length > 0 ? conversations.map((conv: any) => (
                    <div key={conv.id} className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group">
                       <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors truncate pr-4">{conv.topic || "Consultation"}</h4>
                          <span className="text-xs text-slate-500 shrink-0">{new Date(conv.createdAt).toLocaleDateString()}</span>
                       </div>
                       <p className="text-sm text-slate-600 line-clamp-1">{conv.lastMessage || "No messages"}</p>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-400 text-sm">No recent conversations</div>
                  )}
                </div>
             </CardContent>
           </Card>
        </motion.div>
      </div>
     )}
    </motion.div>
      )}
    </AnimatePresence>
  );
}
