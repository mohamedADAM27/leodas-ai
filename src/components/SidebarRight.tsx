import React, { useState, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useThemeStore } from '../store/themeStore';
import { 
  Plus, Trash2, Check, Copy, Settings,
  MessageSquare, Image as ImageIcon, Mic, Code, Dumbbell, GraduationCap, Globe, Pencil, FileText, Sparkles, AlertCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarRightProps {
  onOpenSettings: () => void;
  onClose?: () => void;
}

export default function SidebarRight({ onOpenSettings, onClose }: SidebarRightProps) {
  const { memories, fetchMemories, addMemory, deleteMemory, voiceState, setVoiceState, setTextInput } = useChatStore();
  const { settings } = useThemeStore();
  
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newImportance, setNewImportance] = useState<'low' | 'medium' | 'high'>('medium');
  const [copiedMemoryId, setCopiedMemoryId] = useState<string | null>(null);
  const [showUpdateMemory, setShowUpdateMemory] = useState(false);

  // Auto-refresh memories on startup
  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;
    await addMemory(newMemoryText.trim(), newImportance);
    setNewMemoryText('');
    setShowUpdateMemory(false);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMemoryId(id);
    setTimeout(() => setCopiedMemoryId(null), 1500);
  };

  const handleQuickToolClick = (toolType: string) => {
    switch (toolType) {
      case 'file': {
        const fileSelector = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileSelector) {
          fileSelector.click();
        }
        break;
      }
      case 'image': {
        const imgSelector = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (imgSelector) {
          imgSelector.click();
        }
        break;
      }
      case 'voice':
        if (voiceState === 'idle') {
          setVoiceState('listening');
          setTimeout(() => {
            setTextInput("Give me a motivational quote to start my morning studies.");
            setVoiceState('idle');
          }, 3500);
        } else {
          setVoiceState('idle');
        }
        break;
      case 'code':
        setTextInput("Write an optimized script inside python to solve binary tree path navigation and evaluate time complexity.");
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-80 h-full border-l border-app-border bg-app-surface flex flex-col justify-between text-app-text select-none overflow-hidden font-sans">
      
      {/* Inline animations for sound equalizer */}
      <style>{`
        @keyframes eqWave {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(1.1); }
        }
        .animate-eq {
          animation: eqWave 1.2s ease-in-out infinite;
          transform-origin: bottom;
        }
      `}</style>

      {/* SECTION 1: SYSTEM CONTROLS TITLE & REAL-TIME AUDIO SPHERE */}
      <div className="p-5 border-b border-app-border">
        <div className="bg-app-card rounded-2xl border border-app-border p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 pl-1.5 text-left">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block relative" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute block animate-ping opacity-65" />
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-tight text-app-text uppercase">LEO DAS</h4>
              <p className="text-[10px] text-app-subtext font-light mt-0.5">Online</p>
            </div>
          </div>

          {/* Glowing Circular Audio Oscillation/Soundwave & Optional Drawer Close Toggle */}
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full border border-app-primary/20 bg-app-muted flex items-center justify-center relative overflow-hidden shrink-0">
              {/* Ripples */}
              <div className="absolute inset-2 border border-app-primary/10 rounded-full animate-pulse" />
              <div className="absolute inset-3 border border-app-secondary/15 rounded-full animate-ping" />
              
              {/* EQ equalizer waves matching the cyan stream */}
              <div className="flex items-end gap-[2px] h-4 z-10">
                <div className="w-[2px] bg-app-primary h-3.5 rounded-full animate-eq" style={{ animationDelay: '0.1s' }} />
                <div className="w-[2px] bg-app-secondary h-5 rounded-full animate-eq" style={{ animationDelay: '0.3s' }} />
                <div className="w-[2px] bg-app-primary h-2 rounded-full animate-eq" style={{ animationDelay: '0.5s' }} />
                <div className="w-[2px] bg-app-secondary h-4 rounded-full animate-eq" style={{ animationDelay: '0.2s' }} />
                <div className="w-[2px] bg-app-primary h-2.5 rounded-full animate-eq" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1 px-1.5 hover:bg-app-muted rounded-xl text-app-subtext hover:text-app-text transition-all cursor-pointer border border-app-border/70 flex items-center justify-center shrink-0"
                title="Collapse sidebar panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PANEL MAIN SCROLLCONTAINER (MODULES 4, 3, 2, 1) */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        
        {/* SECTION A: ACTIVE MEMORY PREFERENCES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-text tracking-tight uppercase">
              Active Memory
            </span>
            <button 
              onClick={() => setShowUpdateMemory(!showUpdateMemory)}
              className="text-[11px] font-semibold text-app-primary hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="space-y-2 text-left">
            {/* MEMORY PRESET BOX 1: FITNESS (High-Fidelity representation of mockup image) */}
            <div className="group relative p-3 rounded-2xl border border-app-border bg-app-card/65 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-app-muted border border-app-border flex items-center justify-center shrink-0 text-app-secondary">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-app-text truncate">You're focused on fitness</p>
                <p className="text-[10px] text-app-subtext font-light truncate mt-0.5">Calorie tracking, workouts</p>
              </div>
            </div>

            {/* MEMORY PRESET BOX 2: STUDYING AI */}
            <div className="group relative p-3 rounded-2xl border border-app-border bg-app-card/65 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-app-muted border border-app-border flex items-center justify-center shrink-0 text-app-primary">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-app-text truncate">You're studying AI</p>
                <p className="text-[10px] text-app-subtext font-light truncate mt-0.5">Machine Learning, Python</p>
              </div>
            </div>

            {/* MEMORY PRESET BOX 3: TRAVELS */}
            <div className="group relative p-3 rounded-2xl border border-app-border bg-app-card/65 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-app-muted border border-app-border flex items-center justify-center shrink-0 text-app-secondary">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-app-text truncate">You like to travel</p>
                <p className="text-[10px] text-app-subtext font-light truncate mt-0.5">Japan, nature, culture</p>
              </div>
            </div>

            {/* Render any newly dynamic facts appended under the baseline presets */}
            {memories.length > 0 && (
              <div className="pt-2 border-t border-app-border/30 space-y-1.5">
                <p className="text-[9px] font-semibold text-app-subtext uppercase tracking-wider pl-1 mb-1.5">Custom saved facts ({memories.length})</p>
                <AnimatePresence>
                  {memories.map((mem) => (
                    <motion.div
                      key={mem.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative p-2.5 rounded-xl border border-app-border/80 bg-app-card flex justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="text-app-text text-[11px] leading-relaxed break-words font-light">
                          {mem.memory}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-mono py-0.5 px-1 rounded border capitalize ${
                            mem.importance === 'high' 
                              ? 'text-red-400 bg-red-400/5 border-red-500/10' 
                              : mem.importance === 'medium'
                              ? 'text-amber-400 bg-amber-400/5 border-amber-500/10'
                              : 'text-blue-400 bg-blue-400/5 border-blue-500/10'
                          }`}>
                            {mem.importance}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-1 bg-gradient-to-l from-app-card pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyText(mem.memory, mem.id)}
                          className="p-1 rounded hover:bg-app-surface text-app-subtext hover:text-app-text cursor-pointer"
                          title="Copy fact"
                        >
                          {copiedMemoryId === mem.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => deleteMemory(mem.id)}
                          className="p-1 rounded hover:bg-app-surface text-red-400 hover:text-red-500 cursor-pointer"
                          title="Evict fact"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowUpdateMemory(!showUpdateMemory)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 mt-2 rounded-xl bg-app-card border border-app-border text-[11px] font-bold hover:bg-app-muted/60 transition-all text-app-text cursor-pointer uppercase tracking-tight"
          >
            <Pencil className="w-3 h-3 text-app-primary" />
            <span>Update Memory</span>
          </button>

          {/* Collapsible dynamic add-form */}
          {showUpdateMemory && (
            <form onSubmit={handleAddMemory} className="p-3.5 bg-app-muted rounded-2xl border border-app-border space-y-3 mt-2 text-left">
              <p className="text-[10px] font-bold text-app-text uppercase tracking-wider">Commit new active bias</p>
              <div className="relative">
                <input
                  type="text"
                  value={newMemoryText}
                  onChange={(e) => setNewMemoryText(e.target.value)}
                  placeholder="Remember custom fact..."
                  className="w-full text-xs py-2 pl-2.5 pr-8 bg-app-card border border-app-border rounded-xl text-app-text focus:outline-none focus:border-app-primary"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 w-6 h-6 rounded-lg bg-app-primary text-app-surface flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[9px] text-app-subtext font-bold">IMPORTANCE:</span>
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as const).map((imp) => (
                    <button
                      type="button"
                      key={imp}
                      onClick={() => setNewImportance(imp)}
                      className={`text-[8px] font-mono px-1.5 py-0.5 rounded border capitalize transition-all ${
                        newImportance === imp
                          ? 'bg-app-primary/10 text-app-text border-app-primary'
                          : 'bg-app-card border-app-border text-app-subtext'
                      }`}
                    >
                      {imp}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* SECTION B: QUICK TOOLS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pl-0.5">
            <span className="text-xs font-bold text-app-text tracking-tight uppercase">
              Quick Tools
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            {/* Tool 1 */}
            <button 
              onClick={() => handleQuickToolClick('file')}
              className="p-3.5 rounded-2xl bg-app-card border border-app-border hover:border-app-primary/50 text-left cursor-pointer transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="w-8 h-8 rounded-lg bg-app-muted/80 flex items-center justify-center text-app-primary mb-2 border border-app-border/40">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <h5 className="text-[11.5px] font-bold text-app-text">Upload File</h5>
              <p className="text-[10px] text-app-subtext font-light mt-0.5 leading-snug">Analyze docs, PDFs, images</p>
            </button>

            {/* Tool 2 */}
            <button 
              onClick={() => handleQuickToolClick('image')}
              className="p-3.5 rounded-2xl bg-app-card border border-app-border hover:border-app-primary/50 text-left cursor-pointer transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="w-8 h-8 rounded-lg bg-app-muted/80 flex items-center justify-center text-app-primary mb-2 border border-app-border/40">
                <ImageIcon className="w-3.5 h-3.5" />
              </div>
              <h5 className="text-[11.5px] font-bold text-app-text">Image Analysis</h5>
              <p className="text-[10px] text-app-subtext font-light mt-0.5 leading-snug">Understand images, charts</p>
            </button>

            {/* Tool 3 */}
            <button 
              onClick={() => handleQuickToolClick('voice')}
              className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                voiceState === 'listening' 
                  ? 'bg-red-500/5 border-red-500/40 text-red-400' 
                  : 'bg-app-card border-app-border hover:border-app-primary/50'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-app-muted/80 flex items-center justify-center text-app-primary mb-2 border border-app-border/40">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <h5 className="text-[11.5px] font-bold text-app-text">Voice Mode</h5>
              <p className="text-[10px] text-app-subtext font-light mt-0.5 leading-snug">Talk with LEO DAS</p>
            </button>

            {/* Tool 4 */}
            <button 
              onClick={() => handleQuickToolClick('code')}
              className="p-3.5 rounded-2xl bg-app-card border border-app-border hover:border-app-primary/50 text-left cursor-pointer transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="w-8 h-8 rounded-lg bg-app-muted/80 flex items-center justify-center text-app-primary mb-2 border border-app-border/40">
                <Code className="w-3.5 h-3.5" />
              </div>
              <h5 className="text-[11.5px] font-bold text-app-text">Code Helper</h5>
              <p className="text-[10px] text-app-subtext font-light mt-0.5 leading-snug">Write, debug and explain code</p>
            </button>
          </div>
        </div>

        {/* SECTION C: TODAY'S ACTIVITY */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between pl-0.5">
            <span className="text-xs font-bold text-app-text tracking-tight uppercase">
              Today's Activity
            </span>
            <span className="text-[11px] font-semibold text-app-primary hover:underline cursor-pointer">
              View all
            </span>
          </div>

          <div className="bg-app-card border border-app-border rounded-2xl p-4 grid grid-cols-3 gap-2 divide-x divide-app-border/40 text-center">
            {/* Stat 1 */}
            <div className="space-y-1">
              <div className="flex justify-center text-app-primary">
                <MessageSquare className="w-4 h-4" />
              </div>
              <p className="text-base font-bold text-app-text">24</p>
              <p className="text-[10px] text-app-subtext font-light leading-none">Messages</p>
            </div>

            {/* Stat 2 */}
            <div className="space-y-1">
              <div className="flex justify-center text-app-primary">
                <ImageIcon className="w-4 h-4" />
              </div>
              <p className="text-base font-bold text-app-text">8</p>
              <p className="text-[10px] text-app-subtext font-light leading-none">Images</p>
            </div>

            {/* Stat 3 */}
            <div className="space-y-1">
              <div className="flex justify-center text-app-primary">
                <Code className="w-4 h-4" />
              </div>
              <p className="text-base font-bold text-app-text">3</p>
              <p className="text-[10px] text-app-subtext font-light leading-none flex items-center justify-center gap-0.5">Code Help</p>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 4: SYSTEM PREFERENCES SETTINGS FOOTER FOOTPRINT */}
      <div className="p-4 border-t border-app-border bg-app-surface shrink-0">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-app-surface/60 border border-app-border hover:bg-app-muted transition-all text-xs font-semibold text-app-text cursor-pointer"
        >
          <span className="flex items-center gap-1.5 pl-0.5">
            <Settings className="w-3.5 h-3.5 text-app-primary" /> Core preferences
          </span>
          <Plus className="w-3.5 h-3.5 text-app-subtext" />
        </button>
      </div>

    </div>
  );
}
