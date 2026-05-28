import { create } from 'zustand';
import { Conversation, ChatMessage, AIMemory } from '../types';

interface ChatState {
  conversations: Conversation[];
  activeId: string;
  messages: ChatMessage[];
  memories: AIMemory[];
  isGenerating: boolean;
  currentResponseText: string;
  errorMsg: string | null;
  textInput: string;
  voiceState: 'idle' | 'listening' | 'speaking';
  uploadedImage: { url: string; mimeType: string; name: string } | null;
  
  // Setters
  setTextInput: (text: string) => void;
  setUploadedImage: (image: { url: string; mimeType: string; name: string } | null) => void;
  setVoiceState: (state: 'idle' | 'listening' | 'speaking') => void;
  clearError: () => void;

  // Actions
  fetchConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<string>;
  selectConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  sendMessage: (systemPrompt: string, customText?: string) => Promise<void>;
  
  // Memory actions
  fetchMemories: () => Promise<void>;
  addMemory: (memory: string, importance: 'low' | 'medium' | 'high') => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;

  // Auth actions
  currentUser: { email: string; name: string } | null;
  setCurrentUser: (user: { email: string; name: string } | null) => void;
}

const getAuthHeaders = (customHeaders: Record<string, string> = {}): Record<string, string> => {
  const email = localStorage.getItem('leo_das_user_email');
  const headers: Record<string, string> = { ...customHeaders };
  if (email) {
    headers['x-user-email'] = email;
  }
  return headers;
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeId: 'default-welcome',
  messages: [],
  memories: [],
  isGenerating: false,
  currentResponseText: '',
  errorMsg: null,
  textInput: '',
  voiceState: 'idle',
  uploadedImage: null,

  currentUser: (() => {
    const cachedEmail = localStorage.getItem('leo_das_user_email');
    if (!cachedEmail) return null;
    const cachedName = localStorage.getItem('leo_das_user_name');
    if (cachedName && cachedName !== 'Adam') {
      return { email: cachedEmail, name: cachedName };
    }
    const mailName = cachedEmail.split('@')[0];
    const derivedName = mailName.charAt(0).toUpperCase() + mailName.slice(1);
    return { email: cachedEmail, name: derivedName };
  })(),
  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem('leo_das_user_email', user.email);
      localStorage.setItem('leo_das_user_name', user.name);
    } else {
      localStorage.removeItem('leo_das_user_email');
      localStorage.removeItem('leo_das_user_name');
    }
    set({ currentUser: user });
  },

  setTextInput: (textInput) => set({ textInput }),
  setUploadedImage: (uploadedImage) => set({ uploadedImage }),
  setVoiceState: (voiceState) => set({ voiceState }),
  clearError: () => set({ errorMsg: null }),

  fetchConversations: async () => {
    try {
      const resp = await fetch('/api/conversations', {
        headers: getAuthHeaders()
      });
      if (resp.ok) {
        const data = await resp.json();
        set({ conversations: data });
      }
    } catch (e) {
      console.error("Error fetching conversations:", e);
    }
  },

  createConversation: async (title) => {
    try {
      const resp = await fetch('/api/conversations', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ title })
      });
      if (resp.ok) {
        const newConv = await resp.json();
        await get().fetchConversations();
        set({ activeId: newConv.id, messages: [] });
        return newConv.id;
      }
    } catch (e) {
      console.error("Error creating conversation", e);
    }
    return '';
  },

  selectConversation: async (id) => {
    try {
      set({ activeId: id, messages: [], errorMsg: null, currentResponseText: '' });
      const resp = await fetch(`/api/conversations/${id}/messages`, {
        headers: getAuthHeaders()
      });
      if (resp.ok) {
        const msgs = await resp.json();
        set({ messages: msgs });
      }
    } catch (e) {
      console.error("Error selecting conversation", e);
    }
  },

  renameConversation: async (id, title) => {
    try {
      const resp = await fetch(`/api/conversations/${id}/rename`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ title })
      });
      if (resp.ok) {
        get().fetchConversations();
      }
    } catch (e) {
      console.error("Error renaming conversation", e);
    }
  },

  deleteConversation: async (id) => {
    try {
      const resp = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (resp.ok) {
        await get().fetchConversations();
        const convs = get().conversations;
        if (convs.length > 0) {
          get().selectConversation(convs[0].id);
        } else {
          // Create empty defaults
          const newId = await get().createConversation("Welcome Workspace");
          get().selectConversation(newId);
        }
      }
    } catch (e) {
      console.error("Error deleting conversation", e);
    }
  },

  sendMessage: async (systemPrompt, customText) => {
    const { activeId, textInput, uploadedImage, isGenerating } = get();
    const userText = customText !== undefined ? customText : textInput;
    if (isGenerating || (!userText.trim() && !uploadedImage)) return;

    const userImg = uploadedImage;

    // Reset prompt box
    set({ textInput: '', uploadedImage: null, isGenerating: true, errorMsg: null, currentResponseText: '' });

    // Instantly append user message to local array for fluid visual state
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeId,
      sender: 'user' as const,
      text: userText || "Analyzed Multimodal Attachment",
      imageUrl: userImg?.url,
      mimeType: userImg?.mimeType,
      timestamp: new Date().toISOString()
    };
    set(state => ({ messages: [...state.messages, tempUserMessage] }));

    try {
      // Stream generation endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          conversationId: activeId,
          text: userText || "Analyze this custom image attachment",
          imageUrl: userImg?.url,
          mimeType: userImg?.mimeType,
          systemInstruction: systemPrompt
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status} - Unconfigured server keys`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Could not acquire readable response stream");

      const decoder = new TextDecoder("utf-8");
      let partialChunk = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const decoded = decoder.decode(value, { stream: true });
        partialChunk += decoded;

        // Extract Server-Sent Event formats (e.g., data: {...}\n\n)
        const lines = partialChunk.split("\n");
        partialChunk = lines.pop() || ""; // keep partial content

        for (const line of lines) {
          const cleaned = line.replace(/^data:\s+/, "").trim();
          if (!cleaned) continue;
          if (cleaned === "[DONE]") continue;

          let parsed: any = null;
          try {
            parsed = JSON.parse(cleaned);
          } catch (jsonErr) {
            // Ignore parse errors from partial or incomplete stream lines
            continue;
          }

          if (parsed) {
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              set(state => ({
                currentResponseText: state.currentResponseText + parsed.text
              }));
            }
          }
        }
      }

      // Finalize database load for crisp alignment
      await get().selectConversation(activeId);
      await get().fetchConversations();

    } catch (e: any) {
      console.error("Generation error:", e);
      set({ errorMsg: e.message || "An unexpected generation anomaly has occurred." });
    } finally {
      set({ isGenerating: false, currentResponseText: '' });
    }
  },

  fetchMemories: async () => {
    try {
      const resp = await fetch('/api/memories', {
        headers: getAuthHeaders()
      });
      if (resp.ok) {
        const data = await resp.json();
        set({ memories: data });
      }
    } catch (e) {
      console.error("Error fetching memories:", e);
    }
  },

  addMemory: async (memory, importance) => {
    try {
      const resp = await fetch('/api/memories', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ memory, importance })
      });
      if (resp.ok) {
        get().fetchMemories();
      }
    } catch (e) {
      console.error("Error adding memory:", e);
    }
  },

  deleteMemory: async (id) => {
    try {
      const resp = await fetch(`/api/memories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (resp.ok) {
        get().fetchMemories();
      }
    } catch (e) {
      console.error("Error deleting memory:", e);
    }
  }
}));
export default useChatStore;
