import React, { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useThemeStore } from '../store/themeStore';
import { Mail, Lock, User, Sparkles, RefreshCw, LogIn, UserPlus, Sliders, Download, Cpu } from 'lucide-react';

export default function AuthPage() {
  const { setCurrentUser, fetchConversations, fetchMemories, selectConversation } = useChatStore();
  const { settings } = useThemeStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic visual styles representing the aesthetic themes
  const getLogoTypography = () => {
    if (settings.theme === 'cyber-blue') {
      return "brand-heading text-[#0066fe] text-4xl font-bold tracking-[0.05em] uppercase";
    }
    if (settings.theme === 'matte-white') {
      return "font-display font-black text-black text-3.5xl tracking-tight";
    }
    return "font-sans font-bold text-white text-3.5xl tracking-tight";
  };

  const getSubheadingTypography = () => {
    if (settings.theme === 'cyber-blue') {
      return "font-mono text-xs text-app-subtext tracking-widest uppercase mb-1.5";
    }
    if (settings.theme === 'matte-white') {
      return "font-display text-xs font-bold text-zinc-500 tracking-tight uppercase mb-1";
    }
    return "font-sans text-xs font-medium text-zinc-500 tracking-tight uppercase mb-1";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all credentials.");
      return;
    }
    
    setErrorMsg(null);
    setLoading(true);
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Authentication failed. Please verify credentials.");
      }
      
      if (result.success && result.user) {
        // Authenticated! Update storage
        setCurrentUser(result.user);
        
        // Hydrate database assets instantly
        await fetchConversations();
        await fetchMemories();
        
        // Force pick first or default session
        selectConversation('default-welcome');
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Connection failure to security server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-app-bg px-5 relative overflow-hidden">
      {settings.theme === 'cyber-blue' && (
        <div className="absolute inset-x-0 top-0 h-96 pointer-events-none opacity-[0.12] cyber-grid" />
      )}

      {/* TWO COLUMN BEAUTIFUL LANDING & AUTH PAGE CONTAINER */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10 py-6">
        
        {/* LEFT COLUMN: GORGEOUS LANDING PAGE FEATURES DESCRIPTION */}
        <div className="hidden md:flex md:col-span-6 flex-col text-left space-y-6 select-none pr-4">
          <div className="space-y-3.5">
            <span className="inline-flex text-[9.5px] font-mono font-bold tracking-widest text-app-primary uppercase py-1.5 px-3 rounded-full bg-app-primary/10 border border-app-primary/15 self-start">
              POWERED BY GOOGLE GEMINI FLASH
            </span>
            <h2 className="text-3.5xl font-black tracking-tight text-app-text font-display leading-[1.15]">
              Elevating Personal <br/>
              <span className="text-app-primary">Intellectual Computing</span>
            </h2>
            <p className="text-xs text-app-subtext font-light leading-relaxed max-w-md">
              Designed with timeless aesthetic focus, LEO DAS combines supreme processing speed, ambient memory, and robust analytical backup utility layers.
            </p>
          </div>

          {/* FEATURES BOXES GRID */}
          <div className="grid grid-cols-2 gap-3.5">
            
            <div className="p-4 rounded-2xl bg-app-surface border border-app-border shadow-xs space-y-1.5 hover:border-app-primary/30 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-app-primary/10 flex items-center justify-center text-app-primary mb-1">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-app-text uppercase tracking-wide">Gemini Flash Brain</h3>
              <p className="text-[10.5px] text-app-subtext font-light leading-relaxed">
                Supercharged by Google's state-of-the-art Flash engine for lightning context-aware chat.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-app-surface border border-app-border shadow-xs space-y-1.5 hover:border-app-primary/30 transition-all">
              <div className="w-8 h-8 rounded-xl bg-app-primary/10 flex items-center justify-center text-app-primary mb-1">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-app-text uppercase tracking-wide">Luxury Themes</h3>
              <p className="text-[10.5px] text-app-subtext font-light leading-relaxed">
                Fluid layout adaptivity across Cinematic Matte Black, Soft White, and Cyber Blue styles.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-app-surface border border-app-border shadow-xs space-y-1.5 hover:border-app-primary/30 transition-all">
              <div className="w-8 h-8 rounded-xl bg-app-primary/10 flex items-center justify-center text-app-primary mb-1">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-app-text uppercase tracking-wide">Cognitive Memory</h3>
              <p className="text-[10.5px] text-app-subtext font-light leading-relaxed">
                Active persistent retention of user preferences and attributes across multiple chat structures.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-app-surface border border-app-border shadow-xs space-y-1.5 hover:border-app-primary/30 transition-all">
              <div className="w-8 h-8 rounded-xl bg-app-primary/10 flex items-center justify-center text-app-primary mb-1">
                <Download className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-app-text uppercase tracking-wide">Offline Backup</h3>
              <p className="text-[10.5px] text-app-subtext font-light leading-relaxed">
                Safely export your analytical stream sessions directly into readable TXT or structured JSON files.
              </p>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: THE SECURE CHAT AUTHENTICATOR */}
        <div className="col-span-1 md:col-span-6 flex justify-center w-full">
          <div className="w-full max-w-[410px] bg-app-surface border border-app-border rounded-3xl p-8 relative premium-glow space-y-6">
            
            {/* LOGO & TITLE HEADING */}
            <div className="text-center">
              <p className={getSubheadingTypography()}>
                INTELLECTUAL COMPUTING PLATFORM
              </p>
              <h1 className={getLogoTypography()}>
                LEO DAS
              </h1>
              <p className="text-xs text-app-subtext font-light tracking-wide mt-2">
                {isLogin ? "Sign in to access your secure analytical workspace." : "Create a premium account to start computing."}
              </p>
            </div>

            {/* ERROR MESSAGE CARD */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-rose-500 text-xs text-center font-light">
                {errorMsg}
              </div>
            )}

            {/* FORM CONTROLS */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              
              {/* OPTIONAL REGISTER NAME BLOCK */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-app-subtext uppercase tracking-widest pl-1">
                    Your Preferred Name
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-app-subtext">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Adam"
                      className="w-full pl-10 pr-4 py-3 bg-app-card border border-app-border rounded-2xl text-[14px] text-app-text placeholder-app-subtext/60 focus:outline-none focus:border-app-primary transition-all font-light"
                    />
                  </div>
                </div>
              )}

              {/* EMAIL BLOCK */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-app-subtext uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-app-subtext">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adam@platform.com"
                    className="w-full pl-10 pr-4 py-3 bg-app-card border border-app-border rounded-2xl text-[14px] text-app-text placeholder-app-subtext/60 focus:outline-none focus:border-app-primary transition-all font-light"
                  />
                </div>
              </div>

              {/* PASSWORD BLOCK */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-app-subtext uppercase tracking-widest pl-1">
                  Secret Password
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-app-subtext">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-app-card border border-app-border rounded-2xl text-[14px] text-app-text placeholder-app-subtext/60 focus:outline-none focus:border-app-primary transition-all font-light"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 rounded-2xl bg-app-primary text-app-surface text-sm font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-all cursor-pointer shadow-md disabled:opacity-50 font-sans tracking-wide"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : isLogin ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In Workspace</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Workspace</span>
                  </>
                )}
              </button>
            </form>

            {/* FORM ALTERNATOR SWITCHER */}
            <div className="pt-2 text-center text-xs text-app-subtext border-t border-app-border/40">
              {isLogin ? (
                <p>
                  New occupant to LEO DAS?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(false); setErrorMsg(null); }}
                    className="text-app-primary font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p>
                  Already registered on system?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(true); setErrorMsg(null); }}
                    className="text-app-primary font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    Sign In Instead
                  </button>
                </p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
