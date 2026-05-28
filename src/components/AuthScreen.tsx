import React, { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useThemeStore } from '../store/themeStore';
import { ShieldCheck, Mail, Lock, User, Sparkles, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AuthScreen() {
  const { setCurrentUser, fetchConversations, selectConversation } = useChatStore();
  const { settings } = useThemeStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all requested credentials.");
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: email.trim(), password }
        : { email: email.trim(), password, name: name.trim() || 'Adam' };

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      let data: any = {};
      try {
        data = await resp.json();
      } catch (jsonErr) {
        if (!resp.ok) {
          throw new Error(`HTTP Error ${resp.status}: Secure workspace gateway is temporarily offline.`);
        }
        throw new Error("Invalid payload format returned from security credentials gate.");
      }

      if (!resp.ok) {
        throw new Error(data.error || 'Authentication challenge failed.');
      }

      if (data.success && data.user) {
        // Successful login/register
        setCurrentUser(data.user);
        // Refresh conversations and load default
        await fetchConversations();
        selectConversation('default-welcome');
      } else {
        throw new Error('Unrecognized response sequence from credentials gate.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-app-bg text-app-text relative overflow-hidden transition-all duration-300">
      {/* Dynamic background accent grids/spheres resembling premium theme details */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-app-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-app-secondary/5 blur-[120px] pointer-events-none" />
      
      {settings.theme === 'cyber-blue' && (
        <div className="absolute inset-0 pointer-events-none opacity-10 cyber-grid" />
      )}

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md bg-app-surface border border-app-border rounded-3xl p-8 shadow-2xl relative z-10 premium-glow"
      >
        {/* App Branding Heading Group */}
        <div className="text-center space-y-2 mb-8 select-none">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-app-card border border-app-primary/25 text-app-primary mb-3 shadow-sm">
            <Sparkles className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-app-text font-display">
            LEO DAS
          </h1>
          <p className="text-xs text-app-subtext font-light tracking-wide max-w-[280px] mx-auto leading-relaxed">
            Premium Intellectual Computing Platform & Cognitive Assistant
          </p>
        </div>

        {/* Error Alert Dialog */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="p-3.5 rounded-xl border border-rose-500/15 bg-rose-500/5 text-rose-400 text-xs flex items-start gap-2.5 text-left">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold">Credentials challenge declined</p>
                  <p className="opacity-90">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* Email input line */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-app-text tracking-wide uppercase px-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-app-subtext pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-app-card border border-app-border focus:border-app-primary text-sm text-app-text placeholder-app-subtext focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Password input line */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-[11px] font-bold text-app-text tracking-wide uppercase">
                Password
              </label>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-app-subtext pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-app-card border border-app-border focus:border-app-primary text-sm text-app-text placeholder-app-subtext focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          {!isLogin && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1.5"
            >
              <label className="text-[11px] font-bold text-app-text tracking-wide uppercase px-1">
                Name (Profile identifier)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-app-subtext pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adam"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-app-card border border-app-border focus:border-app-primary text-sm text-app-text placeholder-app-subtext focus:outline-none transition-all duration-200"
                />
              </div>
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 rounded-xl bg-app-primary text-app-surface text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-95"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-app-border/40 pt-4 text-center">
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-xs text-app-subtext hover:text-app-text transition-colors select-none font-medium underline underline-offset-4 cursor-pointer"
          >
            {isLogin 
              ? "Don't have an authentication account? Register here" 
              : "Already completed registration? Sign in here"}
          </button>
        </div>

        {/* Security / local storage compliance note */}
        <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] text-app-subtext font-light select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-app-primary/60" />
          <span>Local sandboxed credentials encryption compliance</span>
        </div>
      </motion.div>
    </div>
  );
}
