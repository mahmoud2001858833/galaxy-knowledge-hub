import { useCallback, useRef } from 'react';

// Audio context for generating sounds
const createAudioContext = () => {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
};

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Play success sound (happy ascending tones)
  const playSuccessSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Create oscillator for melody
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);
        
        gainNode.gain.setValueAtTime(0, now + index * 0.1);
        gainNode.gain.linearRampToValueAtTime(0.3, now + index * 0.1 + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + index * 0.1 + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(now + index * 0.1);
        oscillator.stop(now + index * 0.1 + 0.3);
      });
    } catch (error) {
      console.log('Sound not available:', error);
    }
  }, [getAudioContext]);

  // Play error sound (descending buzzer)
  const playErrorSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(300, now);
      oscillator.frequency.linearRampToValueAtTime(150, now + 0.3);
      
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (error) {
      console.log('Sound not available:', error);
    }
  }, [getAudioContext]);

  // Play tick sound (for timer)
  const playTickSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, now);
      
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(now);
      oscillator.stop(now + 0.05);
    } catch (error) {
      console.log('Sound not available:', error);
    }
  }, [getAudioContext]);

  // Play warning sound (for low time)
  const playWarningSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(440, now);
      
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(now);
      oscillator.stop(now + 0.15);
    } catch (error) {
      console.log('Sound not available:', error);
    }
  }, [getAudioContext]);

  // Play bonus sound
  const playBonusSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Sparkly bonus sound
      const frequencies = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7
      
      frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);
        
        gainNode.gain.setValueAtTime(0, now + index * 0.05);
        gainNode.gain.linearRampToValueAtTime(0.2, now + index * 0.05 + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, now + index * 0.05 + 0.15);
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.start(now + index * 0.05);
        oscillator.stop(now + index * 0.05 + 0.2);
      });
    } catch (error) {
      console.log('Sound not available:', error);
    }
  }, [getAudioContext]);

  return {
    playSuccessSound,
    playErrorSound,
    playTickSound,
    playWarningSound,
    playBonusSound
  };
};
