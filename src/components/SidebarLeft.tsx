import React, { useState, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useThemeStore } from '../store/themeStore';
import { 
  Plus, MessageSquare, Settings, Trash2, Edit3, Check, X,
  BadgeInfo, ArrowRight, Code, Plane, Pencil, BookOpen, Star, Sliders, LogOut
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarLeftProps {
  onOpenSettings: () => void;
  onClose?: () => void;
}

export default function SidebarLeft({ onOpenSettings, onClose }: SidebarLeftProps) {
  const { 
    conversations, activeId, fetchConversations, createConversation, 
    selectConversation, renameConversation, deleteConversation, currentUser,
    setCurrentUser
  } = useChatStore();
  const { settings } = useThemeStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

  // Auto-fetch conversations on load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleCreateNewChat = async () => {
    const newId = await createConversation(`Session #${conversations.length + 1}`);
    if (newId) {
      selectConversation(newId);
    }
  };

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setRenameTitle(currentTitle);
  };

  const handleSaveRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (renameTitle.trim()) {
      await renameConversation(id, renameTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConversation(id);
  };

  const getSubtextAndIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('fitness')) {
      return { 
        subtext: "How many calories did I burn...", 
        time: "2m ago", 
        Icon: MessageSquare 
      };
    } else if (t.includes('python') || t.includes('code')) {
      return { 
        subtext: "Write a function to reverse...", 
        time: "15m ago", 
        Icon: Code 
      };
    } else if (t.includes('travel')) {
      return { 
        subtext: "Best places to visit in Japan...", 
        time: "1h ago", 
        Icon: Plane 
      };
    } else if (t.includes('design') || t.includes('ui/ux') || t.includes('ui tips')) {
      return { 
        subtext: "Give me some UI tips...", 
        time: "3h ago", 
        Icon: Pencil 
      };
    } else if (t.includes('study')) {
      return { 
        subtext: "Create a study plan for AI...", 
        time: "5h ago", 
        Icon: BookOpen 
      };
    } else if (t.includes('motivation')) {
      return { 
        subtext: "Give me a motivational quote...", 
        time: "1d ago", 
        Icon: Star 
      };
    }
    return { 
      subtext: "Click to resume conversation", 
      time: "just now", 
      Icon: MessageSquare 
    };
  };

  return (
    <div className="w-80 h-full border-r border-app-border bg-app-surface flex flex-col justify-between text-app-text select-none overflow-hidden relative">
      {/* BRANDING HEADER */}
      <div className="p-6 border-b border-app-border bg-app-surface flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-app-text active:scale-95 transition-transform cursor-pointer brand-heading">
            LEO DAS
          </h1>
          <p className="text-[9px] font-display font-medium text-app-subtext uppercase tracking-wider leading-relaxed mt-0.5">
            AI CHAT ASSISTANT POWERED BY GEMINI FLASH
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-app-border bg-app-card hover:bg-app-muted text-app-subtext hover:text-app-text transition-all cursor-pointer flex items-center justify-center"
            title="Collapse sidebar panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* NEW CHAT BUTTON */}
      <div className="px-5 py-3">
        <button
          onClick={handleCreateNewChat}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-app-primary text-app-surface hover:bg-opacity-95 border border-app-border font-bold text-xs tracking-tight transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* RECENTS CONVERSATIONS LIST */}
      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-1">
        <div className="flex items-center justify-between pl-1 pr-1 mb-3">
          <span className="text-xs font-semibold text-app-text tracking-tight">
            Recents
          </span>
          <Sliders className="w-3.5 h-3.5 text-app-subtext opacity-80" />
        </div>
        
        {conversations.length === 0 ? (
          <div className="p-4 text-center rounded-xl bg-app-card/20 border border-dashed border-app-border">
            <BadgeInfo className="w-5 h-5 mx-auto mb-1.5 text-app-subtext opacity-60" />
            <p className="text-xs text-app-subtext font-light">No sessions initiated</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = activeId === conv.id;
            const isEditing = editingId === conv.id;
            const info = getSubtextAndIcon(conv.title);
            const { subtext, time, Icon } = info;

            return (
              <div
                key={conv.id}
                onClick={() => !isEditing && selectConversation(conv.id)}
                className={`group relative flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-app-card border-app-border text-app-text font-medium shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-app-muted/45 text-app-subtext hover:text-app-text'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Styled Icon wrapper matching screenshot */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                    isActive 
                      ? 'bg-app-surface border-app-border text-app-primary' 
                      : 'bg-app-card/70 border-app-border text-app-subtext group-hover:bg-app-surface'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      {isEditing ? (
                        <input
                          type="text"
                          value={renameTitle}
                          onChange={(e) => setRenameTitle(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(conv.id, e as any);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="w-full bg-app-muted border border-app-border rounded px-1.5 py-0.5 text-xs text-app-text focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="text-[13px] font-semibold truncate block pr-2 text-app-text">
                          {conv.title}
                        </span>
                      )}
                      
                      {!isEditing && (
                        <span className="text-[9px] text-app-subtext opacity-80 shrink-0 font-light font-mono">
                          {time}
                        </span>
                      )}
                    </div>
                    
                    {!isEditing && (
                      <span className="text-[11px] text-app-subtext truncate block mt-0.5 group-hover:text-app-text/90">
                        {subtext}
                      </span>
                    )}
                  </div>
                </div>

                {/* Interactive Inline Action items */}
                {!isEditing && (
                  <div className="flex items-center gap-1 shrink-0 ml-1.5 z-10 opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleStartRename(conv.id, conv.title, e)}
                      className="p-1.5 px-2 rounded-lg border border-app-border/80 bg-app-card hover:bg-app-muted text-app-text transition-all cursor-pointer"
                      title="Rename stream"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-app-primary" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(conv.id, e)}
                      className="p-1.5 px-2 rounded-lg border border-app-border/80 bg-app-card hover:bg-[rgba(239,68,68,0.15)] text-red-500 transition-all cursor-pointer"
                      title="Delete stream"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                )}

                {isEditing && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleSaveRename(conv.id, e)}
                      className="p-1 rounded hover:bg-app-muted text-emerald-400"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                      className="p-1 rounded hover:bg-app-muted text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* View All Chats full-width button (consistent with mockup) */}
        {conversations.length > 0 && (
          <button 
            onClick={() => selectConversation(conversations[0]?.id)}
            className="w-full flex items-center justify-between p-3.5 mt-2 rounded-2xl bg-app-card border border-app-border text-xs font-semibold hover:bg-app-muted/50 transition-all text-app-text cursor-pointer"
          >
            <span>View All Chats</span>
            <ArrowRight className="w-3.5 h-3.5 text-app-subtext" />
          </button>
        )}
      </div>

      {/* FOOTER PROFILE CARD SECTION */}
      <div className="p-5 border-t border-app-border bg-app-surface">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-app-card border border-app-border">
          <div className="flex items-center gap-3 min-w-0">
            {/* Minimalist Profile Picture Circle representing the dark silhouette */}
            <div className="w-9 h-9 rounded-full bg-app-muted border border-app-border overflow-hidden flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-app-subtext" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-app-text truncate">
                  {currentUser ? currentUser.name : "Adam"}
                </span>
                <span className="text-[8px] font-mono select-none px-1 rounded bg-app-primary text-app-surface font-black uppercase tracking-wider leading-none">
                  Pro
                </span>
              </div>
              <span className="text-[11px] text-app-subtext truncate block font-medium">
                {currentUser ? currentUser.email : "Premium Plan"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl border border-app-border bg-app-surface text-app-subtext hover:text-app-text hover:bg-app-muted transition-all cursor-pointer"
              title="Open Preferences settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentUser(null)}
              className="p-2 rounded-xl border border-red-500/20 bg-red-500/5 text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
              title="Log Out / Exit Session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
