"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Stethoscope, 
  TestTube, 
  FileText, 
  Pill, 
  TrendingUp, 
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  ArrowRight,
  Plus,
  HeartPulse,
  AlertCircle
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, doc, setDoc, addDoc } from 'firebase/firestore';
import { AnimatePresence } from 'motion/react';

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', bounce: 0.3, duration: 0.8 } },
};

const iconMap: any = {
  Activity: Activity,
  Stethoscope: Stethoscope,
  TestTube: TestTube,
  FileText: FileText,
  Pill: Pill,
  TrendingUp: TrendingUp
};

export default function JourneyTimeline() {
  const { user } = useAuth();
  const [steps, setSteps] = useState<any[]>([]);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    let isUnmounted = false;
    setIsLoading(true);
    
    const q = query(collection(db, 'users', user.uid, 'journeySteps'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      if (isUnmounted) return;
      const dbSteps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSteps(dbSteps);
      if (dbSteps.length > 0) {
        const currentStep = dbSteps.find(s => s.status === 'current') || dbSteps[dbSteps.length - 1];
        setActiveStepId(prev => prev || currentStep?.id);
      }
      setIsLoading(false);
    }, (err) => {
      if (isUnmounted) return;
      console.error(err);
      setIsError(true);
      setIsLoading(false);
    });

    const timer = setTimeout(() => {
      if (!isUnmounted) {
        setIsLoading(false);
      }
    }, 3000);

    return () => {
      isUnmounted = true;
      unsub();
      clearTimeout(timer);
    };
  }, [user]);

  const activeStep = steps.find(s => s.id === activeStepId) || steps[0];

  const initializeJourney = async () => {
    if (!user) return;
    setIsInitializing(true);
    const initialSteps = [
      {
        order: 1,
        title: 'Symptoms',
        description: 'Initial reporting of symptoms and self-assessment.',
        iconName: 'Activity',
        status: 'completed',
        date: new Date().toLocaleDateString(),
        details: 'Reported mild discomfort. Initial self-care steps followed.'
      },
      {
        order: 2,
        title: 'Specialist Consultation',
        description: 'First meeting with a specialist.',
        iconName: 'Stethoscope',
        status: 'current',
        date: new Date().toLocaleDateString(),
        details: 'Initial physical examination completed. Waiting for next steps to be scheduled.'
      },
      {
        order: 3,
        title: 'Recommended Tests',
        description: 'Visual or lab tests to confirm condition.',
        iconName: 'TestTube',
        status: 'pending',
        date: 'Upcoming',
        details: 'To be determined.'
      }
    ];

    try {
      for (const step of initialSteps) {
        await addDoc(collection(db, 'users', user.uid, 'journeySteps'), step);
      }
      // Add a journey to dashboard
      await addDoc(collection(db, 'users', user.uid, 'journeys'), {
        title: 'General Health Assessment',
        progress: 35,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error(e);
      setIsError(true);
    }
    setIsInitializing(false);
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
      >
        <div className="mb-8 h-10 w-48 bg-slate-200/60 rounded-lg animate-pulse" />
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="flex-1 lg:max-w-xl space-y-6">
             <div className="h-24 w-full bg-slate-200/60 rounded-2xl animate-pulse" />
             <div className="h-24 w-full bg-slate-200/60 rounded-2xl animate-pulse" />
             <div className="h-24 w-full bg-slate-200/60 rounded-2xl animate-pulse" />
          </div>
          <div className="flex-1">
             <div className="h-[400px] w-full bg-slate-200/60 rounded-3xl animate-pulse" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-500 mb-6 text-center max-w-sm">We ran into an issue loading your medical journey. Please try refreshing.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">
          Refresh Page
        </Button>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-24 text-center">
        <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <HeartPulse className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Start your first medical journey</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg hover:text-slate-800 transition-colors">
          Track your progress from symptoms to full recovery in one organized timeline.
        </p>
        <Button 
          onClick={initializeJourney} 
          disabled={isInitializing}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl active:scale-[0.98] transition-all px-8 py-6 text-lg shadow-md"
        >
           {isInitializing ? (
             <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
           ) : (
             <Plus className="h-6 w-6 mr-3" />
           )}
           {isInitializing ? 'Creating...' : 'Create Journey'}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Treatment Journey</h1>
          <p className="text-slate-500 mt-1">Track your progress from symptoms to full recovery.</p>
        </div>
        <Badge variant="outline" className="w-fit text-blue-700 bg-blue-50 border-blue-200 px-3 py-1 text-sm font-medium">
          Active Case
        </Badge>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Timeline Column */}
        <motion.div 
          className="flex-1 lg:max-w-xl"
          variants={CONTAINER_VARIANTS}
          initial="hidden"
          animate="show"
        >
          <div className="relative pl-4 md:pl-0">
            {/* Vertical Line */}
            <div className="absolute left-[27px] md:left-[35px] top-6 bottom-6 w-0.5 bg-slate-100 rounded-full"></div>
            
            <div className="space-y-6">
              {steps.map((step, index) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';
                const isPending = step.status === 'pending';
                const isActive = activeStepId === step.id;

                const IconComponent = iconMap[step.iconName] || Activity;
                let strokeColor = "text-slate-400";
                let bgColor = "bg-slate-100";
                let ringColor = "ring-slate-50";

                if (isCompleted) {
                  strokeColor = "text-green-600";
                  bgColor = "bg-green-100";
                  ringColor = "ring-green-50";
                } else if (isCurrent) {
                  strokeColor = "text-blue-600";
                  bgColor = "bg-blue-100";
                  ringColor = "ring-blue-50";
                }

                return (
                  <motion.div 
                    key={step.id} 
                    variants={ITEM_VARIANTS}
                    className="relative flex gap-4 md:gap-6 group"
                  >
                    {/* Timeline Node */}
                    <div className="relative flex flex-col items-center shrink-0">
                       <div className={`h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center ring-4 ${ringColor} ${bgColor} z-10 transition-colors duration-300`}>
                          {isCompleted ? (
                            <CheckCircle2 className={`h-5 w-5 md:h-6 md:w-6 ${strokeColor}`} />
                          ) : isCurrent ? (
                            <Activity className={`h-5 w-5 md:h-6 md:w-6 ${strokeColor} animate-pulse`} />
                          ) : (
                            <Circle className={`h-5 w-5 md:h-6 md:w-6 ${strokeColor}`} />
                          )}
                       </div>
                    </div>

                    {/* Content Card */}
                    <div 
                      onClick={() => setActiveStepId(step.id)}
                      className={`flex-1 rounded-2xl p-4 md:p-5 border transition-all cursor-pointer ${
                        isActive 
                          ? 'border-blue-500 bg-blue-50/30 shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`h-4 w-4 ${isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                          <h3 className={`font-semibold text-base ${isPending ? 'text-slate-500' : 'text-slate-900'}`}>
                            {step.title}
                          </h3>
                        </div>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                          {step.date}
                        </span>
                      </div>
                      
                      <p className={`text-sm mt-2 ${isPending ? 'text-slate-400' : 'text-slate-600'}`}>
                        {step.description}
                      </p>

                      {isActive && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-slate-100/80"
                        >
                          <div className="flex items-center justify-between text-sm text-blue-600 font-medium group/link">
                             <span>View full details</span>
                             <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Details Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <div className="sticky top-24">
            <Card className="border-slate-200/60 shadow-sm rounded-3xl overflow-hidden">
               <div className="h-32 bg-slate-50 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                  
                  <AnimatePresence mode="wait">
                    {activeStep && (
                       <motion.div
                         key={activeStep.id}
                         initial={{ scale: 0.8, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         exit={{ scale: 0.8, opacity: 0 }}
                         transition={{ type: 'spring', bounce: 0.4 }}
                         className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm z-10 ${
                            activeStep.status === 'completed' ? 'bg-green-100 text-green-600'
                            : activeStep.status === 'current' ? 'bg-blue-100 text-blue-600'
                            : 'bg-slate-100 text-slate-500'
                         }`}
                       >
                          {(() => {
                            const IconComponent = iconMap[activeStep.iconName] || Activity;
                            return <IconComponent className="h-8 w-8" />;
                          })()}
                       </motion.div>
                    )}
                  </AnimatePresence>
               </div>
               
               <CardContent className="p-6 md:p-8">
                 <AnimatePresence mode="wait">
                   {activeStep && (
                     <motion.div
                       key={`content-${activeStep.id}`}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       transition={{ duration: 0.3 }}
                     >
                     <div className="flex items-center gap-2 mb-2">
                       <Badge variant={activeStep.status === 'completed' ? 'default' : activeStep.status === 'current' ? 'secondary' : 'outline'}
                          className={`${
                            activeStep.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : activeStep.status === 'current' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                            : ''
                          }`}
                       >
                         {activeStep.status.charAt(0).toUpperCase() + activeStep.status.slice(1)}
                       </Badge>
                       <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {activeStep.date}
                       </span>
                     </div>
                     
                     <h2 className="text-2xl font-bold text-slate-900 mb-4">{activeStep.title}</h2>
                     
                     <div className="prose prose-slate prose-sm md:prose-base">
                       <p className="text-slate-600 leading-relaxed">
                         {activeStep.details}
                       </p>
                       
                       {activeStep.status === 'current' && (
                         <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              <Activity className="h-4 w-4" /> Action Required
                            </h4>
                            <p className="text-sm text-blue-800 mb-4">Please note any new symptoms and follow up with your provider regarding next steps.</p>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg active:scale-[0.98] transition-transform">
                               Acknowledge
                            </Button>
                         </div>
                       )}
                     </div>
                   </motion.div>
                 )}
                 </AnimatePresence>
               </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
