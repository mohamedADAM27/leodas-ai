import { create } from 'zustand';
import { ThemeType, UserSettings } from '../types';

interface ThemeState {
  settings: UserSettings;
  setTheme: (theme: ThemeType) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceName: (voiceName: UserSettings['voiceName']) => void;
  setSystemPrompt: (prompt: string) => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'cyber-blue',
  animationsEnabled: true,
  voiceEnabled: false,
  voiceName: 'Kore',
  systemPrompt: 'You are LEO DAS, a highly sophisticated AI companion of exceptional intelligence, professional charm, and helpful accuracy. Keep responses extremely crisp, informative, and beautifully structured with markdown.',
};

export const useThemeStore = create<ThemeState>((set) => {
  // Safe load from localStorage
  const getInitialSettings = (): UserSettings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem('leo-das-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Apply theme to document element immediately
        const theme = parsed.theme || 'cyber-blue';
        document.documentElement.className = theme;
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
    document.documentElement.className = 'cyber-blue';
    return DEFAULT_SETTINGS;
  };

  const initialSettings = getInitialSettings();

  return {
    settings: initialSettings,
    setTheme: (theme) => set((state) => {
      const updated = { ...state.settings, theme };
      localStorage.setItem('leo-das-settings', JSON.stringify(updated));
      document.documentElement.className = theme;
      return { settings: updated };
    }),
    setAnimationsEnabled: (animationsEnabled) => set((state) => {
      const updated = { ...state.settings, animationsEnabled };
      localStorage.setItem('leo-das-settings', JSON.stringify(updated));
      return { settings: updated };
    }),
    setVoiceEnabled: (voiceEnabled) => set((state) => {
      const updated = { ...state.settings, voiceEnabled };
      localStorage.setItem('leo-das-settings', JSON.stringify(updated));
      return { settings: updated };
    }),
    setVoiceName: (voiceName) => set((state) => {
      const updated = { ...state.settings, voiceName };
      localStorage.setItem('leo-das-settings', JSON.stringify(updated));
      return { settings: updated };
    }),
    setSystemPrompt: (systemPrompt) => set((state) => {
      const updated = { ...state.settings, systemPrompt };
      localStorage.setItem('leo-das-settings', JSON.stringify(updated));
      return { settings: updated };
    }),
  };
});
