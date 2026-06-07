"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Send, User, Bot, Sparkles, Activity, FileText, MapPin, HeartPulse } from 'lucide-react';
import * as motion from 'motion/react-client';
import Markdown from 'react-markdown';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const SUGGESTED_PROMPTS = [
  { icon: Activity, text: "I have a severe headache" },
  { icon: HeartPulse, text: "I'm having chest pain" },
  { icon: FileText, text: "Recovery after surgery" },
  { icon: MapPin, text: "Finding specialists" }
];

export default function Assistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: "Hi there. I'm your CareSync Assistant. I can help you understand symptoms, navigate your healthcare options, and find the right specialists. How can I help you today?"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const saveConversationNote = async (topic: string, excerpt: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'users', user.uid, 'conversations'), {
        topic: topic,
        lastMessage: excerpt,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error saving conversation:", e);
    }
  };

  const handleSend = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (messages.length === 1) {
        // Save initial conversation metadata to Firestore
        saveConversationNote(messageText.slice(0, 30) + '...', messageText);
      }

      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

      const historyContext = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      const prompt = historyContext ? `${historyContext}\nUser: ${messageText}\nAssistant:` : messageText;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate response");
      }

      const responseData = await response.json();
      
      let formattedContent = responseData.generalResponse ? responseData.generalResponse + "\n\n" : "";
      
      if (responseData.symptomUnderstanding) {
        formattedContent += `**Understanding:** ${responseData.symptomUnderstanding}\n\n`;
      }
      if (responseData.treatmentGuidance) {
        formattedContent += `**Guidance:** ${responseData.treatmentGuidance}\n\n`;
      }
      if (responseData.followUpQuestions && responseData.followUpQuestions.length > 0) {
        formattedContent += `**Follow-up Questions:**\n${responseData.followUpQuestions.map((q: string) => `- ${q}`).join('\n')}\n\n`;
      }
      if (responseData.specialistRecommendations && responseData.specialistRecommendations.length > 0) {
        formattedContent += `**Recommended Specialists:**\n${responseData.specialistRecommendations.map((s: string) => `- ${s}`).join('\n')}\n\n`;
      }

      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId ? { ...m, content: formattedContent.trim() } : m
      ));
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId ? { ...m, content: "I encountered an error while trying to process your request. Please try again." } : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <Card className="flex-1 flex flex-col bg-white border-slate-200/60 shadow-sm overflow-hidden rounded-3xl relative">
        <div className="h-16 border-b border-slate-100 flex items-center px-6 shrink-0 bg-white/50 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
               <Bot className="h-6 w-6" />
             </div>
             <div>
                <h2 className="font-semibold text-slate-900 tracking-tight text-base leading-tight">CareSync AI</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                   <span className="text-xs font-medium text-slate-500">Always active</span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-24 scroll-smooth">
          <div className="space-y-6">
            {messages.map((message) => (
              <motion.div 
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[85%] sm:max-w-[75%] ${message.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <Avatar className={`h-8 w-8 shrink-0 mt-1 ${message.role === 'user' ? 'bg-slate-200' : 'bg-blue-100 text-blue-600'}`}>
                  {message.role === 'user' ? (
                     <User className="h-5 w-5 text-slate-600" />
                  ) : (
                     <Bot className="h-5 w-5 text-blue-600" />
                  )}
                </Avatar>
                
                <div className={`rounded-2xl p-4 overflow-hidden ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-slate-100/80 text-slate-800 rounded-tl-sm'
                }`}>
                  {message.content ? (
                     <div className={`markdown-body prose prose-sm sm:prose-base max-w-none break-words ${message.role === 'user' ? 'prose-invert text-white' : 'text-slate-800'}`}>
                       {message.role === 'user' ? (
                         <p className="m-0 leading-relaxed">{message.content}</p>
                       ) : (
                         <Markdown>{message.content}</Markdown>
                       )}
                     </div>
                  ) : (
                    <div className="flex space-x-1 h-5 items-center px-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && !isLoading && (
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8"
            >
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(prompt.text)}
                  className="px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-left flex items-start gap-3 group"
                >
                  <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border-blue-100 transition-colors">
                     <prompt.icon className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 leading-snug mt-1 group-hover:text-blue-700">{prompt.text}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="relative flex items-end gap-2"
          >
            <div className="relative w-full rounded-2xl shadow-sm bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all flex items-end">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about symptoms, recovery, or specialists..."
                className="w-full border-0 focus-visible:ring-0 bg-transparent min-h-[56px] py-4 pl-4 pr-12 text-slate-800 placeholder:text-slate-400 shadow-none rounded-2xl"
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2">
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
                >
                  <Send className="h-5 w-5 ml-0.5" />
                </Button>
              </div>
            </div>
          </form>
          <div className="text-center mt-3">
             <span className="text-[10px] md:text-xs text-slate-400 flex items-center justify-center gap-1">
               <Sparkles className="h-3 w-3" /> CareSync AI can make mistakes. Consider verifying important information.
             </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
