export type ThemeType = 'cyber-blue' | 'matte-white' | 'matte-black';

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant';
  text: string;
  imageUrl?: string;
  mimeType?: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMemory {
  id: string;
  memory: string;
  importance: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface UserSettings {
  theme: ThemeType;
  animationsEnabled: boolean;
  voiceEnabled: boolean;
  voiceName: 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir';
  systemPrompt: string;
}
