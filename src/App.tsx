import { useState, useEffect } from 'react';
import SidebarLeft from './components/SidebarLeft';
import WorkspaceCenter from './components/WorkspaceCenter';
import SidebarRight from './components/SidebarRight';
import SettingsPanel from './components/SettingsPanel';
import AuthPage from './components/AuthPage';
import { useChatStore } from './store/chatStore';
import { useThemeStore } from './store/themeStore';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, BrainCircuit, Sliders } from 'lucide-react';

export default function App() {
  const { settings } = useThemeStore();
  const { activeId, selectConversation, fetchConversations, fetchMemories, currentUser } = useChatStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Responsive mobile drawer states
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [desktopLeftOpen, setDesktopLeftOpen] = useState(true);
  const [desktopRightOpen, setDesktopRightOpen] = useState(true);

  // Sync initial theme and databases on startup
  useEffect(() => {
    // Apply current settings theme on class element
    document.documentElement.className = settings.theme || 'cyber-blue';
    
    if (currentUser) {
      // Initial fetch passes
      fetchConversations().then(() => {
        // Pick active default session if empty
        selectConversation(activeId || 'default-welcome');
      });
      fetchMemories();
    }
  }, [fetchConversations, fetchMemories, selectConversation, activeId, settings.theme, currentUser]);

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-app-bg text-app-text flex flex-col relative font-sans transition-colors duration-300">
      
      {/* MOBILE HEADER RESPONSIVE TOGGLES */}
      <header className="lg:hidden flex items-center justify-between px-6 py-3.5 border-b border-app-border bg-app-surface/90 shrink-0 z-30">
        <button
          onClick={() => setMobileLeftOpen(!mobileLeftOpen)}
          className="p-1.5 rounded-lg border border-app-border hover:bg-app-muted hover:text-app-primary transition-colors text-app-subtext"
          title="Toggling Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight brand-heading text-app-text">LEO DAS</span>
        </div>

        <button
          onClick={() => setMobileRightOpen(!mobileRightOpen)}
          className="p-1.5 rounded-lg border border-app-border hover:bg-app-muted hover:text-app-primary transition-colors text-app-subtext"
          title="Toggling Telemetry Details"
        >
          <BrainCircuit className="w-5 h-5" />
        </button>
      </header>

      {/* MOBILE LEFT DRAWER (Covering top fully) */}
      <AnimatePresence>
        {mobileLeftOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileLeftOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            {/* Slideover panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
              className="relative w-80 max-w-[85vw] h-full bg-app-surface border-r border-app-border flex flex-col z-10"
            >
              <SidebarLeft 
                onOpenSettings={() => { setIsSettingsOpen(true); setMobileLeftOpen(false); }} 
                onClose={() => setMobileLeftOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE RIGHT DRAWER (Covering top fully) */}
      <AnimatePresence>
        {mobileRightOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileRightOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            {/* Slideover panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.25 }}
              className="relative w-80 max-w-[85vw] h-full bg-app-surface border-l border-app-border flex flex-col z-10"
            >
              <SidebarRight 
                onOpenSettings={() => { setIsSettingsOpen(true); setMobileRightOpen(false); }} 
                onClose={() => setMobileRightOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CORE DESKTOP GRID LAYOUT */}
      <div className="flex-1 w-full h-full flex overflow-hidden relative">
        
        {/* DESKTOP SIDEBARS (Always open & integrated seamlessly) */}
        {desktopLeftOpen ? (
          <aside className="h-full shrink-0 hidden lg:flex border-r border-app-border">
            <SidebarLeft 
              onOpenSettings={() => setIsSettingsOpen(true)} 
              onClose={() => setDesktopLeftOpen(false)}
            />
          </aside>
        ) : (
          /* Sleek persistent float toggle button on the left edge */
          <button
            onClick={() => setDesktopLeftOpen(true)}
            className="absolute top-4 left-4 z-40 p-2.5 rounded-xl border border-app-border bg-app-surface/90 text-app-subtext hover:text-app-primary hover:bg-app-card transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer hidden lg:flex items-center justify-center"
            title="Expand Left Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* MAIN CENTER CHAT WORKSPACE (Module 5) */}
        <main className="flex-1 h-full flex flex-col overflow-hidden">
          <WorkspaceCenter />
        </main>

        {desktopRightOpen ? (
          <aside className="h-full shrink-0 hidden lg:flex border-l border-app-border">
            <SidebarRight 
              onOpenSettings={() => setIsSettingsOpen(true)} 
              onClose={() => setDesktopRightOpen(false)}
            />
          </aside>
        ) : (
          /* Sleek float toggle button on the right edge */
          <button
            onClick={() => setDesktopRightOpen(true)}
            className="absolute top-4 right-4 z-40 p-2.5 rounded-xl border border-app-border bg-app-surface/90 text-app-subtext hover:text-app-primary hover:bg-app-card transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer hidden lg:flex items-center justify-center"
            title="Expand Right Preferences"
          >
            <BrainCircuit className="w-4 h-4" />
          </button>
        )}

      </div>

      {/* SYSTEM SETTINGS PREFERENCE MODAL OVERLAY */}
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

    </div>
  );
}
