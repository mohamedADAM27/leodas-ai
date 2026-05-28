import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useThemeStore } from '../store/themeStore';
import { 
  Send, Image as ImageIcon, Mic, Paperclip, AlertTriangle, RefreshCw, 
  X, ArrowDown, MicOff, VolumeX, Sparkles, GraduationCap, Dumbbell, Globe, Code, Sliders, ShieldCheck, Download, Braces
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MarkdownRenderer from './MarkdownRenderer';

export default function WorkspaceCenter() {
  const { 
    messages, isGenerating, currentResponseText, errorMsg, textInput,
    voiceState, uploadedImage, setTextInput, setUploadedImage, setVoiceState,
    sendMessage, clearError, conversations, activeId
  } = useChatStore();
  const { settings } = useThemeStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localInput, setLocalInput] = useState('');

  // Synchronize draft state when global store updates (suggestion clicks, voice etc)
  useEffect(() => {
    setLocalInput(textInput);
  }, [textInput]);

  // Offline Exporters
  const exportToJson = () => {
    if (messages.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      conversationId: activeId,
      exportedAt: new Date().toISOString(),
      messages: messages.map(m => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        imageUrl: m.imageUrl || null,
        timestamp: m.timestamp
      }))
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `conversation-${activeId || 'export'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportToTxt = () => {
    if (messages.length === 0) return;
    const title = conversations.find(c => c.id === activeId)?.title || "Current Conversation";
    const formattedText = `=============================
CONVERSATION EXPORT
Title: ${title}
ID: ${activeId || 'default'}
Exported At: ${new Date().toLocaleString()}
=============================\n\n` + 
    messages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleString();
      const sender = msg.sender === 'user' ? 'YOU' : 'LEO DAS (AI)';
      return `[${time}] ${sender}:\n${msg.text}\n${msg.imageUrl ? `[Attachment URL: ${msg.imageUrl}]\n` : ''}\n-----------------------------------\n`;
    }).join('\n');

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(formattedText);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `conversation-${activeId || 'export'}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Auto-scroll to bottom of thread
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, currentResponseText, isGenerating]);

  // Drag and drop image handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      processSelectedImage(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processSelectedImage(files[0]);
    }
  };

  const processSelectedImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage({
        url: reader.result as string,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isGenerating) return;
    const trimmed = localInput.trim();
    if (!trimmed && !uploadedImage) return;
    setLocalInput('');
    setTextInput('');
    sendMessage(settings.systemPrompt, trimmed);
  };

  const handleSuggestionClick = (text: string) => {
    setTextInput(text);
  };

  // Simulate premium speech voice sensor
  const [speechSimulationTimer, setSpeechSimulationTimer] = useState<any>(null);
  const toggleVoiceMode = () => {
    if (voiceState === 'idle') {
      setVoiceState('listening');
      const phrases = [
        "Create an optimal workout schedule based on fat loss",
        "Explain quantum computers in plain english with clear steps",
        "Review this string reversal algorithm inside python"
      ];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      
      const timer = setTimeout(() => {
        setTextInput(randomPhrase);
        setVoiceState('idle');
      }, 3500);
      setSpeechSimulationTimer(timer);
    } else {
      if (speechSimulationTimer) clearTimeout(speechSimulationTimer);
      setVoiceState('idle');
    }
  };

  // Speaks out loud if Voice (TTS) is enabled
  const handleTTS = (text: string) => {
    if (!settings.voiceEnabled) return;
    const cleanText = text.replace(/[\*\#\`]/g, '');
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      synth.speak(utterance);
    }
  };

  // Trigger speech auto run whenever generation completes
  useEffect(() => {
    if (messages.length > 0 && !isGenerating && !currentResponseText) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'assistant') {
        handleTTS(lastMsg.text);
      }
    }
  }, [isGenerating]);

  // Dynamic header styles representing the screenshot theme
  const getLogoTypography = () => {
    if (settings.theme === 'cyber-blue') {
      return "brand-heading text-[#0066fe] text-6xl md:text-[76px] tracking-[0.06em] leading-none mb-4 uppercase";
    }
    if (settings.theme === 'matte-white') {
      return "font-display font-black text-[#000000] text-5xl md:text-[68px] tracking-tight leading-none mb-3";
    }
    return "font-sans font-bold text-white text-5xl md:text-[68px] tracking-tight leading-none mb-3";
  };

  const getSubheadingTypography = () => {
    if (settings.theme === 'cyber-blue') {
      return "font-mono text-[22px] font-semibold text-white tracking-[0.1em] uppercase mb-1";
    }
    if (settings.theme === 'matte-white') {
      return "font-display text-[22px] font-extrabold text-[#111111] tracking-tight uppercase mb-1";
    }
    return "font-sans text-[22px] font-bold text-white tracking-tight uppercase mb-1";
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 h-full flex flex-col justify-between bg-app-bg relative overflow-hidden transition-all duration-300 ${
        isDragging ? 'brightness-75 scale-[0.99] border-2 border-dashed border-app-primary' : ''
      }`}
    >
      {/* Subtle visual grid accent under cyber theme */}
      {settings.theme === 'cyber-blue' && (
        <div className="absolute inset-x-0 top-0 h-96 pointer-events-none opacity-[0.15] cyber-grid" />
      )}

      {/* CONVERSATION EXPORT & SESSION HEADER BAR */}
      {messages.length > 0 && (
        <div className="px-6 py-3.5 border-b border-app-border bg-app-surface/90 backdrop-blur-md flex items-center justify-between z-20 shrink-0 select-none">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-app-primary shrink-0" />
            <h3 className="text-xs font-bold text-app-text tracking-wide uppercase truncate max-w-[150px] sm:max-w-[300px] md:max-w-[450px]">
              {conversations.find(c => c.id === activeId)?.title || "Current Conversation"}
            </h3>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-app-subtext font-mono mr-1 hidden sm:inline uppercase tracking-wider">Offline Export:</span>
            
            <button
              onClick={exportToTxt}
              className="px-2.5 py-1.5 rounded-xl border border-app-border bg-app-card hover:bg-app-muted text-app-text hover:text-app-primary text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
              title="Export conversation history to TXT file"
            >
              <Download className="w-3.5 h-3.5 text-app-primary" />
              <span>TXT</span>
            </button>
            
            <button
              onClick={exportToJson}
              className="px-2.5 py-1.5 rounded-xl border border-app-border bg-app-card hover:bg-app-muted text-app-text hover:text-app-primary text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:scale-[1.02] active:scale-[0.98]"
              title="Export conversation history to JSON file"
            >
              <Braces className="w-3.5 h-3.5 text-app-secondary" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      )}

      {/* COMPONENT BODY AREA */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 py-6 md:px-10 scroll-smooth z-10"
      >
        {messages.length === 0 ? (
          /* HERO CHAT CHANNELS SPLASH SCREEN */
          <div className="min-h-full flex flex-col justify-center max-w-[720px] mx-auto text-left py-10 space-y-8 select-none">
            
            {/* LARGE HEADER GROUP */}
            <div>
              <p className={getSubheadingTypography()}>
                HEY, I'M
              </p>
              <h2 className={`${getLogoTypography()} !mb-1`}>
                LEO DAS
              </h2>
              <p className="text-xs md:text-sm text-app-subtext font-light font-mono tracking-wider mt-1">
                AI CHAT ASSISTANT POWERED BY GEMINI FLASH
              </p>
            </div>

            {/* MESSAGE COMPOSER CONTAINER CARD */}
            <div className="bg-app-surface border border-app-border rounded-3xl p-5 shadow-xs space-y-4">
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden" 
              />
              
              <textarea
                rows={2}
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message LEO DAS..."
                className="w-full text-[15px] bg-transparent text-app-text placeholder-app-subtext resize-none focus:outline-none leading-relaxed font-light min-h-[50px]"
              />

              {/* Bottom toolbar inside Composer Card */}
              <div className="flex items-center justify-between pt-2 border-t border-app-border/40 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-app-border bg-app-card hover:bg-app-muted text-app-text text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-app-subtext" />
                    <span>Upload</span>
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-app-border bg-app-card hover:bg-app-muted text-app-text text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-app-subtext" />
                    <span>Image</span>
                  </button>
                  <button 
                    onClick={toggleVoiceMode}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                      voiceState === 'listening'
                        ? 'bg-red-500/10 text-red-500 border-red-500/30'
                        : 'border-app-border bg-app-card hover:bg-app-muted text-app-text'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-app-subtext" />
                    <span>Voice</span>
                  </button>
                </div>

                <button 
                  onClick={handleSend}
                  disabled={!localInput.trim() && !uploadedImage}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    (localInput.trim() || uploadedImage) 
                      ? 'bg-app-primary text-app-surface hover:opacity-95' 
                      : 'bg-app-muted text-app-subtext opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ROW OF PRESET SYSTEM SUGGESTIONS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              <button 
                onClick={() => handleSuggestionClick("Explain quantum physics simply with steps.")}
                className="flex items-center justify-start gap-2.5 p-3 rounded-2xl bg-app-surface border border-app-border hover:bg-app-card transition-all text-left text-[12px] font-semibold text-app-text cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-app-primary shrink-0" />
                <span className="truncate">Explain quantum physics</span>
              </button>
              <button 
                onClick={() => handleSuggestionClick("Help me write python reverse script code")}
                className="flex items-center justify-start gap-2.5 p-3 rounded-2xl bg-app-surface border border-app-border hover:bg-app-card transition-all text-left text-[12px] font-semibold text-app-text cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-app-primary shrink-0" />
                <span className="truncate">Help me write code</span>
              </button>
              <button 
                onClick={() => handleSuggestionClick("Create a detailed 30 day machine learning study plan")}
                className="flex items-center justify-start gap-2.5 p-3 rounded-2xl bg-app-surface border border-app-border hover:bg-app-card transition-all text-left text-[12px] font-semibold text-app-text cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-app-primary shrink-0" />
                <span className="truncate">Create a study plan</span>
              </button>
              <button 
                onClick={() => handleSuggestionClick("How should I optimize layout structure?")}
                className="flex items-center justify-start gap-2.5 p-3 rounded-2xl bg-app-surface border border-app-border hover:bg-app-card transition-all text-left text-[12px] font-semibold text-app-text cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-app-primary shrink-0" />
                <span className="truncate">More suggestions</span>
              </button>
            </div>

          </div>
        ) : (
          /* ACTIVE CHAT HISTORIC TIMELINE SCREEN */
          <div className="max-w-[760px] mx-auto space-y-6 pt-4 pb-10">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div 
                  key={msg.id}
                  className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col max-w-[92%] ${isUser ? 'items-end' : 'items-start'}`}>
                    
                    {/* Inline file preview image */}
                    {msg.imageUrl && (
                      <div className="mb-2 max-w-sm rounded-[20px] overflow-hidden border border-app-border bg-black/10 p-1">
                        <img 
                          src={msg.imageUrl} 
                          alt="Attachment preview" 
                          className="max-h-48 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                      isUser
                        ? (settings.theme === 'matte-black'
                          ? 'bg-app-primary border-app-primary/35 rounded-tr-none text-zinc-950 font-normal shadow-xs'
                          : 'bg-app-primary border-app-primary/35 rounded-tr-none text-white font-normal shadow-xs')
                        : 'bg-app-card border-app-border rounded-tl-none premium-glow text-app-text font-light'
                    }`}>
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <MarkdownRenderer content={msg.text} />
                      )}
                    </div>
                    
                    <span className="text-[9px] text-app-subtext font-mono mt-1 px-1 py-0.5 opacity-60">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>


                </div>
              );
            })}

            {/* REALTIME STREAMING ASSISTANT RESPONSE CHUNK */}
            {isGenerating && currentResponseText && (
              <div className="flex justify-start">
                <div className="flex flex-col max-w-[92%] items-start">
                  <div className="p-4 rounded-2xl border text-sm text-app-text leading-relaxed bg-app-card border-app-border rounded-tl-none premium-glow">
                    <MarkdownRenderer content={currentResponseText} />
                    <span className="inline-block w-1.5 h-4 bg-app-primary animate-pulse ml-1 align-middle" />
                  </div>
                  <span className="text-[9px] text-app-subtext font-mono mt-1 opacity-60">Streaming...</span>
                </div>
              </div>
            )}

            {/* THINKING METRIC PANEL INDICATOR */}
            {isGenerating && !currentResponseText && (
              <div className="flex justify-start items-center">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-app-border bg-app-card text-xs text-app-subtext">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-app-primary" />
                  <span>Synthesizing flash context...</span>
                </div>
              </div>
            )}

            {/* EXPLICIT EXCEPTION METRIC */}
            {errorMsg && (
              <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl flex items-start gap-3 text-xs max-w-xl mx-auto text-left">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="font-semibold text-rose-300">Analytical Error Anomaly</p>
                  <p className="text-rose-200/90 leading-relaxed font-mono text-[11px]">{errorMsg}</p>
                </div>
                <button 
                  onClick={() => sendMessage(settings.systemPrompt)}
                  className="flex items-center gap-1 py-1.5 px-3 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* COMPOSER FORM LAYOUT VIEW (When Thread is Active, float the composer block) */}
      {messages.length > 0 && (
        <div className="p-6 border-t border-app-border bg-app-surface/40 z-10">
          <div className="max-w-[760px] mx-auto space-y-4">
            
            {/* PHOTO DRAG PREVIEW */}
            <AnimatePresence>
              {uploadedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="inline-flex items-center gap-2 border border-app-border bg-app-card p-1.5 pr-3 rounded-xl shadow-lg relative"
                >
                  <img 
                    src={uploadedImage.url} 
                    alt="Multimodal preview" 
                    className="w-12 h-12 object-cover rounded-md border border-app-border"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left font-mono text-[10px]">
                    <p className="text-app-text font-semibold max-w-[150px] truncate">{uploadedImage.name}</p>
                    <p className="text-app-subtext uppercase text-[8px]">{uploadedImage.mimeType}</p>
                  </div>
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="p-1 rounded bg-black/40 hover:bg-black/80 text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CORE COMPOSER FORM WRAPPER IN THREAD VIEW */}
            <div className="p-2 rounded-2xl bg-app-card border border-app-border flex items-end gap-2 premium-glow relative focus-within:border-app-primary transition-all duration-300">
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden" 
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-app-subtext hover:text-app-primary hover:bg-app-muted rounded-xl transition-all shrink-0 cursor-pointer"
                title="Attach Multimodal Image"
              >
                <Paperclip className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={toggleVoiceMode}
                className={`p-3 rounded-xl transition-all shrink-0 cursor-pointer ${
                  voiceState === 'listening' 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                    : 'text-app-subtext hover:text-app-primary hover:bg-app-muted'
                }`}
                title="Voice synthesizer input"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>

              <textarea
                rows={1}
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message LEO DAS..."
                className="flex-1 max-h-36 min-h-[44px] py-3 px-1 text-sm bg-transparent text-app-text placeholder-app-subtext resize-none focus:outline-none leading-relaxed font-light"
                style={{ height: 'auto' }}
              />

              <button
                onClick={handleSend}
                disabled={isGenerating || (!localInput.trim() && !uploadedImage)}
                className={`p-2.5 rounded-xl transition-all shrink-0 cursor-pointer font-semibold ${
                  (localInput.trim() || uploadedImage) && !isGenerating
                    ? 'bg-app-primary text-app-surface hover:opacity-95'
                    : 'bg-app-muted text-app-subtext opacity-50 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VOICE LISTENING SCREEN */}
      <AnimatePresence>
        {voiceState === 'listening' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col justify-center items-center text-center p-6"
          >
            <div className="space-y-6 max-w-sm">
              <div className="flex justify-center items-end gap-1.5 h-16">
                <span className="w-2.5 bg-app-primary rounded-full animate-bounce h-8" />
                <span className="w-2.5 bg-app-primary rounded-full animate-bounce h-16 delay-75" />
                <span className="w-2.5 bg-app-primary rounded-full animate-bounce h-10 delay-150" />
                <span className="w-2.5 bg-app-primary rounded-full animate-bounce h-14 delay-200" />
                <span className="w-2.5 bg-app-primary rounded-full animate-bounce h-6 delay-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Listening</h3>
                <p className="text-xs text-app-subtext mt-1.5 leading-relaxed font-light">LEO DAS is listening to your context. Speak clearly into your microphone device.</p>
              </div>
              <button 
                onClick={toggleVoiceMode}
                className="py-2.5 px-6 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white cursor-pointer transition-colors"
              >
                Cancel Speech Sensor
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER COGNITIVE COMPLIANCE NOTICE */}
      <div className="py-3 px-6 shrink-0 border-t border-app-border bg-app-surface/20 z-10 flex items-center justify-center gap-1.5 font-light text-[10.5px] text-app-subtext select-none">
        <span>LEO DAS can make mistakes. Please verify important information.</span>
      </div>
    </div>
  );
}
