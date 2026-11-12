import React, { useState } from 'react';
import { SOUND_LIBRARY } from '../data/smilePresets';
import { SoundEffectType, SmileConfig } from '../types/smile';
import { soundEngine } from '../utils/soundEngine';
import { X, Volume2, VolumeX, Play, BellRing, Sparkles, Check } from 'lucide-react';

interface SoundboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: SmileConfig;
  onSetDefaultSound: (sound: SoundEffectType) => void;
  lang: 'pt' | 'en';
}

export const SoundboardModal: React.FC<SoundboardModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSetDefaultSound,
  lang,
}) => {
  const [activePlaying, setActivePlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(soundEngine.getVolume());
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [ringtoneLooping, setRingtoneLooping] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlaySound = (soundId: SoundEffectType) => {
    setActivePlaying(soundId);
    soundEngine.play(soundId);
    setTimeout(() => {
      setActivePlaying((curr) => (curr === soundId ? null : curr));
    }, 1200);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundEngine.setVolume(newVol);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const toggleSimulatedRingtone = (soundId: SoundEffectType) => {
    if (ringtoneLooping === soundId) {
      setRingtoneLooping(null);
    } else {
      setRingtoneLooping(soundId);
      soundEngine.play(soundId);
      // Ringtone loop interval
      const interval = setInterval(() => {
        setRingtoneLooping((curr) => {
          if (curr === soundId) {
            soundEngine.play(soundId);
            return curr;
          }
          clearInterval(interval);
          return null;
        });
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                {lang === 'pt' ? 'Mesa de Sons & Efeitos Sonoros' : 'Silly Soundboard & SFX'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'pt'
                  ? 'Toque para testar risadas, mordidas, sons bizarros e toques de celular'
                  : 'Tap to trigger laughs, bites, spooky whispers, and custom ringtones'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setRingtoneLooping(null);
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Master Slider */}
        <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          <div className="flex-1 flex items-center gap-2">
            <span className="text-[11px] text-slate-400">{lang === 'pt' ? 'Volume' : 'Volume'}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-400 w-8">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        {/* Sound Pads Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto no-scrollbar pr-1">
          {SOUND_LIBRARY.map((item) => {
            const isPlaying = activePlaying === item.id;
            const isDefault = currentConfig.defaultSound === item.id;
            const isRingtoneActive = ringtoneLooping === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handlePlaySound(item.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isPlaying
                    ? 'bg-amber-950/60 border-amber-500 scale-[1.02] shadow-lg shadow-amber-950/50'
                    : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">{item.emoji}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {lang === 'pt' ? item.titlePt : item.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.durationSec}s · {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {/* Set as Wallpaper Sound */}
                  <button
                    onClick={() => {
                      onSetDefaultSound(item.id);
                      handlePlaySound(item.id);
                    }}
                    title={lang === 'pt' ? 'Definir som padrão deste papel' : 'Set as wallpaper default sound'}
                    className={`p-1.5 rounded-lg text-[10px] font-medium transition-colors flex items-center gap-1 ${
                      isDefault
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isDefault ? <Check className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                  </button>

                  {/* Ringtone Looper preview */}
                  <button
                    onClick={() => toggleSimulatedRingtone(item.id)}
                    title={lang === 'pt' ? 'Simular toque de chamada (loop)' : 'Simulate call ringtone (loop)'}
                    className={`p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                      isRingtoneActive
                        ? 'bg-emerald-600 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <BellRing className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
