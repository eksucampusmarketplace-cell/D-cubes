import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  darkMode: boolean;
  soundEnabled: boolean;
  orderSoundEnabled: boolean;
  chatSoundEnabled: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  playSound: (type: 'order' | 'chat' | 'notification') => void;
}

const defaultSettings: Settings = {
  darkMode: true,
  soundEnabled: true,
  orderSoundEnabled: true,
  chatSoundEnabled: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('dcubes-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('dcubes-settings', JSON.stringify(settings));
    
    // Apply dark/light mode to document
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const playSound = (type: 'order' | 'chat' | 'notification') => {
    if (!settings.soundEnabled) return;
    
    if (type === 'order' && !settings.orderSoundEnabled) return;
    if (type === 'chat' && !settings.chatSoundEnabled) return;

    // Create audio context for notification sounds
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'order') {
        // Rising tone for new orders
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } else if (type === 'chat') {
        // Gentle ping for chat
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
      } else {
        // Simple notification beep
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      }
    } catch (error) {
      console.log('Audio not available');
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, playSound }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
