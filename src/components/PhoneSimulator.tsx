import React, { useState, useEffect } from 'react';
import { SmileConfig } from '../types/smile';
import { SillySmileCanvas } from './SillySmileCanvas';
import {
  Wifi,
  BatteryCharging,
  Flashlight,
  Camera,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Smartphone,
  Eye,
  Check,
  Bell
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface PhoneSimulatorProps {
  config: SmileConfig;
  lang: 'pt' | 'en';
  onOpenExporter: () => void;
  onOpenSoundboard: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  config,
  lang,
  onOpenExporter,
  onOpenSoundboard,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'lockscreen' | 'homescreen' | 'pure'>('lockscreen');
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [activeNotificationIndex, setActiveNotificationIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(true);
  const [reactionToast, setReactionToast] = useState<string | null>(null);

  // Live Clock updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(lang === 'pt' ? 'pt-BR' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
      setCurrentDate(
        now.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  // Notifications pool
  const notifications = [
    {
      app: 'WhatsApp',
      time: lang === 'pt' ? 'agora' : 'now',
      title: lang === 'pt' ? 'Mamãe' : 'Mom',
      body:
        lang === 'pt'
          ? 'Filho, por que a tela do seu celular tá rindo e me encarando? 👀'
          : 'Why is your phone screen staring at me and grinning? 👀',
    },
    {
      app: 'SillySmile 4K',
      time: '1m',
      title: lang === 'pt' ? 'Olhar Detectado' : 'Gaze Detected',
      body:
        lang === 'pt'
          ? 'Toque na tela ou deslize o dedo para alimentar o sorriso!'
          : 'Touch screen or swipe finger to feed the grin!',
    },
    {
      app: lang === 'pt' ? 'Segurança' : 'Security',
      time: '3m',
      title: lang === 'pt' ? 'Alerta Noturno' : 'Night Alert',
      body:
        lang === 'pt'
          ? 'Não encare os olhos vermelhos por mais de 10 segundos no escuro...'
          : 'Do not stare into the red eyes for more than 10 seconds...',
    },
  ];

  const handleFaceReact = (reaction: string) => {
    const messages: Record<string, { pt: string; en: string }> = {
      eye_poke: { pt: 'Ai! Não cutuque meus olhos! 😵', en: 'Ouch! Do not poke my eyes! 😵' },
      mouth_bite: { pt: 'CHOMP! Quase pegou seu dedo! 🦷', en: 'CHOMP! Almost bit your finger! 🦷' },
      swipe_up: { pt: 'BOCA ABERTA! Risada ativada! 😈', en: 'JAW DROP! Cackle triggered! 😈' },
      swipe_down: { pt: 'SQUISH! Amassou o rosto! 🤪', en: 'SQUISH! Face squashed! 🤪' },
      swipe_horizontal: { pt: 'Piscadinha travessa! 😉', en: 'Mischievous wink! 😉' },
      screech: { pt: 'Aaaaaagh! Grito demoníaco!', en: 'Aaaaaagh! Demonic screech!' },
      color_burst: { pt: 'Explosão de neon ativada! ⚡', en: 'Neon blast triggered! ⚡' },
      dizzy: { pt: 'Ficou tonto de tanto girar! 💫', en: 'Got dizzy from spinning! 💫' },
    };

    if (messages[reaction]) {
      setReactionToast(messages[reaction][lang]);
      setTimeout(() => setReactionToast(null), 1800);
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Simulation Mode Switcher & Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md">
        <button
          onClick={() => setPreviewMode('lockscreen')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
            previewMode === 'lockscreen'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{lang === 'pt' ? 'Bloqueio de Tela' : 'Lock Screen'}</span>
        </button>

        <button
          onClick={() => setPreviewMode('homescreen')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
            previewMode === 'homescreen'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'pt' ? 'Tela Inicial' : 'Home Screen'}</span>
        </button>

        <button
          onClick={() => setPreviewMode('pure')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
            previewMode === 'pure'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{lang === 'pt' ? 'Só Papel de Parede' : 'Wallpaper Only'}</span>
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

        <button
          onClick={toggleMute}
          title={isMuted ? 'Desmutar' : 'Mutar'}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Realistic Smartphone Frame Mockup */}
      <div className="relative">
        {/* Outer Phone Bezel */}
        <div
          className="relative w-[310px] sm:w-[350px] aspect-[9/19.2] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-[5px] border-slate-800 ring-1 ring-slate-700/50 overflow-hidden"
          style={{
            boxShadow: `0 25px 60px -15px ${config.glowColor}30, 0 0 100px -20px ${config.glowColor}20`,
          }}
        >
          {/* Speaker Earpiece & Punch-Hole Camera */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-1 bg-black/90 rounded-full border border-slate-800/80 shadow-md">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-700 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-sky-500/80 animate-pulse" />
            </div>
            <div className="w-10 h-1 bg-slate-800 rounded-full" />
          </div>

          {/* Flashlight Beam Highlight (when enabled) */}
          {isFlashlightOn && (
            <div className="absolute inset-0 z-50 bg-white/20 pointer-events-none mix-blend-screen animate-pulse" />
          )}

          {/* Toast feedback overlay */}
          {reactionToast && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 max-w-[90%] px-3 py-1.5 bg-black/85 border border-rose-500/50 text-rose-300 text-[11px] font-medium rounded-full backdrop-blur-md shadow-xl text-center pointer-events-none animate-bounce">
              {reactionToast}
            </div>
          )}

          {/* Phone Inner Display Container */}
          <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-black flex flex-col justify-between">
            {/* The Live Interactive Silly Smile Wallpaper */}
            <div className="absolute inset-0 z-0">
              <SillySmileCanvas
                config={config}
                aspectRatio="fullscreen"
                onFaceReact={handleFaceReact}
                className="w-full h-full"
              />
            </div>

            {/* Top Status Bar */}
            <div className="relative z-30 pt-3 px-6 flex items-center justify-between text-[11px] text-white/90 font-medium select-none">
              <span>{currentTime}</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[10px] tracking-tight">5G</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px]">98%</span>
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* LOCK SCREEN MODE CONTENT */}
            {previewMode === 'lockscreen' && (
              <div className="relative z-20 flex-1 flex flex-col justify-between p-5 select-none pointer-events-none">
                {/* Big Clock & Date */}
                <div className="flex flex-col items-center mt-6">
                  <h1 className="text-6xl font-light tracking-tighter text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] font-display">
                    {currentTime}
                  </h1>
                  <p className="text-xs font-medium text-white/80 capitalize mt-1 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
                    {currentDate}
                  </p>
                </div>

                {/* Spooky / Quirky Notification Card */}
                {showNotification && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNotificationIndex((prev) => (prev + 1) % notifications.length);
                      soundEngine.play('chuckle_giggle');
                    }}
                    className="pointer-events-auto bg-black/60 hover:bg-black/75 border border-white/10 backdrop-blur-xl p-3 rounded-2xl shadow-xl transition-all cursor-pointer active:scale-95"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <span className="w-3.5 h-3.5 rounded bg-emerald-500/80 flex items-center justify-center text-[9px] text-white">
                          <Bell className="w-2.5 h-2.5" />
                        </span>
                        <span>{notifications[activeNotificationIndex].app}</span>
                      </div>
                      <span>{notifications[activeNotificationIndex].time}</span>
                    </div>
                    <p className="text-[11px] font-bold text-white">
                      {notifications[activeNotificationIndex].title}
                    </p>
                    <p className="text-[10px] text-slate-300 leading-tight line-clamp-2 mt-0.5">
                      {notifications[activeNotificationIndex].body}
                    </p>
                    <div className="mt-1 text-[9px] text-rose-400 font-medium">
                      {lang === 'pt' ? 'Toque para alternar notificação' : 'Tap to toggle notification'}
                    </div>
                  </div>
                )}

                {/* Bottom Quick Actions (Flashlight & Camera) */}
                <div className="flex items-center justify-between pointer-events-auto pb-2">
                  <button
                    onClick={() => {
                      setIsFlashlightOn(!isFlashlightOn);
                      soundEngine.play('glitch_zap');
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${
                      isFlashlightOn
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/50'
                        : 'bg-black/40 text-white border border-white/20'
                    }`}
                  >
                    <Flashlight className="w-4 h-4" />
                  </button>

                  <div className="text-[10px] font-medium text-white/70 animate-pulse tracking-wide">
                    {lang === 'pt' ? 'Deslize ou toque nos olhos' : 'Swipe or tap on eyes'}
                  </div>

                  <button
                    onClick={() => {
                      soundEngine.play('monster_chomp');
                      onOpenExporter();
                    }}
                    className="w-10 h-10 rounded-full bg-black/40 text-white border border-white/20 flex items-center justify-center backdrop-blur-md active:scale-90"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* HOME SCREEN (APP ICONS) MODE */}
            {previewMode === 'homescreen' && (
              <div className="relative z-20 flex-1 flex flex-col justify-end p-5 select-none pointer-events-none">
                <div className="grid grid-cols-4 gap-3.5 mb-6">
                  {['Telefone', 'Mensagens', 'Fotos', 'Chrome', 'Spotify', 'TikTok', 'Jogos', 'Câmera'].map(
                    (app, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                          <div
                            className="w-5 h-5 rounded-lg"
                            style={{
                              backgroundColor: idx % 2 === 0 ? config.primaryColor : config.secondaryColor,
                              opacity: 0.8,
                            }}
                          />
                        </div>
                        <span className="text-[9px] text-white/90 truncate drop-shadow">{app}</span>
                      </div>
                    )
                  )}
                </div>

                {/* Dock */}
                <div className="p-2.5 bg-white/10 border border-white/20 backdrop-blur-2xl rounded-3xl flex items-center justify-around mb-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PURE WALLPAPER MODE (HINT) */}
            {previewMode === 'pure' && (
              <div className="relative z-20 flex-1 flex flex-col justify-end p-4 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-md p-2 rounded-xl text-center text-[10px] text-white/70">
                  {lang === 'pt'
                    ? 'Toque, arraste os olhos, cutuque a boca ou faça carinho!'
                    : 'Touch, drag eyes, poke the mouth or tickle!'}
                </div>
              </div>
            )}

            {/* Home Indicator Bar */}
            <div className="relative z-30 pb-2 flex justify-center">
              <div className="w-28 h-1 bg-white/60 rounded-full" />
            </div>
          </div>
        </div>

        {/* Ambient Phone Glow Backdrop */}
        <div
          className="absolute -inset-6 -z-10 rounded-[60px] opacity-40 blur-3xl pointer-events-none transition-all duration-500"
          style={{ backgroundColor: config.glowColor }}
        />
      </div>

      {/* Quick Action Footer Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
        <button
          onClick={() => {
            soundEngine.play(config.defaultSound || 'wicked_cackle');
            handleFaceReact('swipe_up');
          }}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-rose-500 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>{lang === 'pt' ? 'Risada Maligna' : 'Evil Cackle'}</span>
        </button>

        <button
          onClick={onOpenSoundboard}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-amber-500 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'pt' ? 'Mesa de Sons' : 'Soundboard'}</span>
        </button>

        <button
          onClick={onOpenExporter}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white hover:from-rose-500 hover:to-amber-500 transition-all flex items-center gap-1.5 shadow-lg shadow-rose-900/30 active:scale-95"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{lang === 'pt' ? 'Exportar 4K / Vídeo' : 'Export 4K / Video'}</span>
        </button>
      </div>
    </div>
  );
};
