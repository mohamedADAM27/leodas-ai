import { useThemeStore } from '../store/themeStore';
import { useChatStore } from '../store/chatStore';
import { X, Sparkles, Sliders, Volume2, ShieldCheck, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, setTheme, setAnimationsEnabled, setVoiceEnabled, setVoiceName, setSystemPrompt } = useThemeStore();
  const { memories, addMemory, deleteMemory } = useChatStore();

  if (!isOpen) return null;

  const themes = [
    { id: 'cyber-blue', name: 'Cyber Blue', desc: 'Neon glow & technical metrics' },
    { id: 'matte-white', name: 'Matte White', desc: 'Minimalist warm Apple look' },
    { id: 'matte-black', name: 'Matte Black', desc: 'Cinematic soft luxury black' }
  ] as const;

  const voices = ['Kore', 'Zephyr', 'Puck', 'Charon', 'Fenrir'] as const;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-app-border bg-app-surface text-app-text premium-glow flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-app-border px-6 py-4 bg-app-card">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-app-primary animate-pulse" />
              <div>
                <h3 className="font-display font-semibold text-lg">System Preferences</h3>
                <p className="text-xs text-app-subtext">Configure LEO DAS Environment</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-app-muted text-app-subtext hover:text-app-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Scroll Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Theme / Appearance Selection */}
            <section className="space-y-3">
              <h4 className="text-xs font-mono tracking-widest text-app-subtext uppercase flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-app-primary" /> Appearance Theme
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {themes.map((t) => {
                  const isActive = settings.theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`group relative text-left p-4 rounded-xl border transition-all duration-300 ${
                        isActive 
                        ? 'border-app-primary bg-app-muted/80 shadow-sm' 
                        : 'border-app-border hover:border-app-primary/50 bg-app-card hover:bg-app-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{t.name}</span>
                        {isActive && (
                          <div className="w-2.5 h-2.5 rounded-full bg-app-primary" />
                        )}
                      </div>
                      <p className="text-xs text-app-subtext leading-relaxed group-hover:text-app-text/90 transition-colors">
                        {t.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Animation and Voice Config togglers */}
            <section className="space-y-3">
              <h4 className="text-xs font-mono tracking-widest text-app-subtext uppercase flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-app-primary" /> Core Controls
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-app-card p-4 rounded-xl border border-app-border">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium block">Fluid Animations</span>
                    <span className="text-xs text-app-subtext">Enable premium micro-interactions</span>
                  </div>
                  <button
                    onClick={() => setAnimationsEnabled(!settings.animationsEnabled)}
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                      settings.animationsEnabled ? 'bg-app-primary' : 'bg-app-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                        settings.animationsEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t md:border-t-0 md:border-l border-app-border pt-4 md:pt-0 md:pl-4">
                  <div>
                    <span className="text-sm font-medium block">Interactive Speech (TTS)</span>
                    <span className="text-xs text-app-subtext">Speak Gemini responses out loud</span>
                  </div>
                  <button
                    onClick={() => setVoiceEnabled(!settings.voiceEnabled)}
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                      settings.voiceEnabled ? 'bg-app-primary' : 'bg-app-muted'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                        settings.voiceEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Voice select */}
            {settings.voiceEnabled && (
              <section className="space-y-3">
                <h4 className="text-xs font-mono tracking-widest text-app-subtext uppercase flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-app-primary" /> Audio Voice Timbre
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {voices.map((v) => (
                    <button
                      key={v}
                      onClick={() => setVoiceName(v)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border text-center transition-all ${
                        settings.voiceName === v
                          ? 'bg-app-primary text-app-surface border-app-primary shadow-sm'
                          : 'bg-app-card hover:bg-app-muted text-app-text border-app-border'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* System Instruction Prompt Settings */}
            <section className="space-y-3">
              <h4 className="text-xs font-mono tracking-widest text-app-subtext uppercase flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-app-primary" /> Base System Directives
              </h4>
              <div className="space-y-2">
                <textarea
                  value={settings.systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full h-24 p-3 text-sm rounded-xl bg-app-card border border-app-border text-app-text focus:outline-none focus:border-app-primary transition-all font-mono resize-none leading-relaxed"
                  placeholder="Insert custom assistant persona instructions..."
                />
                <p className="text-[11px] text-app-subtext">The base instruction defines the assistant's tone and intellectual boundaries.</p>
              </div>
            </section>

            {/* Subname display */}
            <section className="pt-4 border-t border-app-border flex items-center justify-between text-xs text-app-subtext">
              <span className="flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Model: Gemini Flash (3.5-flash)
              </span>
              <span>v1.2.0 (Premium build)</span>
            </section>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
