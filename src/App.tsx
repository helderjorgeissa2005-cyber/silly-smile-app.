import React, { useState, useEffect } from 'react';
import { SmileConfig, SoundEffectType } from './types/smile';
import { SMILE_PRESETS } from './data/smilePresets';
import { HeaderNav } from './components/HeaderNav';
import { PhoneSimulator } from './components/PhoneSimulator';
import { CustomizerStudio } from './components/CustomizerStudio';
import { WallpaperLibrary } from './components/WallpaperLibrary';
import { WallpaperExporterModal } from './components/WallpaperExporterModal';
import { SoundboardModal } from './components/SoundboardModal';
import { MinigameDrawer } from './components/MinigameDrawer';
import { SillySmileCanvas } from './components/SillySmileCanvas';
import {
  Smartphone,
  Sliders,
  Grid,
  Volume2,
  Maximize2,
  Minimize2,
  Sparkles,
  Gamepad2,
  Download,
  Share2
} from 'lucide-react';
import { soundEngine } from './utils/soundEngine';

export default function App() {
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [currentTab, setCurrentTab] = useState<'simulator' | 'studio' | 'gallery' | 'soundboard'>('simulator');
  const [currentConfig, setCurrentConfig] = useState<SmileConfig>(SMILE_PRESETS[0]);
  const [customWallpapers, setCustomWallpapers] = useState<SmileConfig[]>([]);

  // Modals state
  const [isExporterOpen, setIsExporterOpen] = useState(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState(false);
  const [isMinigameOpen, setIsMinigameOpen] = useState(false);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);

  // Load custom saved wallpapers from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sillysmile_custom_wallpapers');
      if (saved) {
        setCustomWallpapers(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load saved wallpapers:', e);
    }
  }, []);

  // Save to custom library
  const handleSaveToLibrary = (newConfig: SmileConfig) => {
    setCustomWallpapers((prev) => {
      const exists = prev.findIndex((p) => p.id === newConfig.id);
      let updated: SmileConfig[];
      if (exists >= 0) {
        updated = [...prev];
        updated[exists] = newConfig;
      } else {
        updated = [newConfig, ...prev];
      }
      try {
        localStorage.setItem('sillysmile_custom_wallpapers', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not persist to localStorage:', err);
      }
      return updated;
    });
    setCurrentConfig(newConfig);
  };

  // Delete custom wallpaper
  const handleDeleteCustom = (id: string) => {
    setCustomWallpapers((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('sillysmile_custom_wallpapers', JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not persist delete:', err);
      }
      return updated;
    });
    if (currentConfig.id === id) {
      setCurrentConfig(SMILE_PRESETS[0]);
    }
  };

  const handleEditInStudio = (config: SmileConfig) => {
    setCurrentConfig(config);
    setCurrentTab('studio');
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'pt' ? 'en' : 'pt'));
  };

  // FULLSCREEN IMMERSIVE LIVE WALLPAPER MODE
  if (isFullscreenMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center select-none">
        <SillySmileCanvas
          config={currentConfig}
          aspectRatio="fullscreen"
          className="w-full h-full"
        />

        {/* Floating Minimal Controls (Auto-fades) */}
        <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
          <span className="text-[11px] text-white/80 font-medium font-display">
            {lang === 'pt' ? currentConfig.namePt : currentConfig.name}
          </span>
          <button
            onClick={() => {
              setIsFullscreenMode(false);
              soundEngine.play('squish_squeak');
            }}
            className="p-1 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            title="Sair da tela cheia"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-body selection:bg-rose-500 selection:text-white">
      {/* 3-Zone Top Navigation Header */}
      <HeaderNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenExporter={() => setIsExporterOpen(true)}
        onOpenMinigame={() => setIsMinigameOpen(true)}
        lang={lang}
        onToggleLang={toggleLang}
      />

      {/* Hero Announcement & Features Strip */}
      <div className="bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-amber-950/40 border-b border-slate-800/60 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-semibold text-white">
              {lang === 'pt' ? 'Papel de Parede Interativo 4K' : '4K Interactive Live Wallpaper'}
            </span>
            <span className="text-slate-500 hidden sm:inline">·</span>
            <span className="text-slate-400 hidden sm:inline">
              {lang === 'pt'
                ? 'Os olhos seguem seu dedo, piscam e reagem a toques com sons hilários!'
                : 'Eyes follow your finger, blink, and react to touches with funny sound FX!'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsFullscreenMode(true);
                soundEngine.play('glitch_zap');
              }}
              className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{lang === 'pt' ? 'Modo Tela Cheia' : 'Fullscreen Mode'}</span>
            </button>

            <button
              onClick={() => setIsMinigameOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>{lang === 'pt' ? 'Minigame' : 'Minigame'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
        {/* VIEW 1: SIMULATOR & QUICK TUNING */}
        {currentTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Phone Simulator Showcase (5 cols on lg) */}
            <div className="lg:col-span-5 flex justify-center sticky top-24">
              <PhoneSimulator
                config={currentConfig}
                lang={lang}
                onOpenExporter={() => setIsExporterOpen(true)}
                onOpenSoundboard={() => setIsSoundboardOpen(true)}
              />
            </div>

            {/* Right Column: Interactive Details & Quick Presets (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Active Wallpaper Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-mono font-bold text-rose-400 tracking-wider">
                        {currentConfig.category}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs text-slate-400">
                        {currentConfig.isCustom
                          ? (lang === 'pt' ? 'Personalizado pelo Usuário' : 'User Customized')
                          : (lang === 'pt' ? 'Predefinição 4K Oficial' : 'Official 4K Preset')}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-white font-display mt-1">
                      {lang === 'pt' ? currentConfig.namePt : currentConfig.name}
                    </h2>

                    <p className="text-sm text-slate-300 mt-1 max-w-xl">
                      {lang === 'pt' ? currentConfig.taglinePt : currentConfig.tagline}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditInStudio(currentConfig)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5 text-rose-400" />
                      <span>{lang === 'pt' ? 'Customizar no Estúdio' : 'Customize in Studio'}</span>
                    </button>

                    <button
                      onClick={() => setIsExporterOpen(true)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-900/30 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{lang === 'pt' ? 'Exportar' : 'Export'}</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Touch Instructions */}
                <div className="mt-5 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2 mb-2 font-display">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'pt' ? 'Como Interagir com o Papel de Parede:' : 'How to Interact with Live Wallpaper:'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-300">
                    <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-rose-400 block mb-0.5">
                        {lang === 'pt' ? '1. Olhar Seguidor' : '1. Eye Tracking'}
                      </span>
                      <span>{lang === 'pt' ? 'Passe o mouse ou dedo pela tela; os olhos acompanham com profundidade 3D.' : 'Move your finger or mouse; the eyes track in smooth 3D.'}</span>
                    </div>

                    <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-amber-400 block mb-0.5">
                        {lang === 'pt' ? '2. Cutucar & Morder' : '2. Poke & Bite'}
                      </span>
                      <span>{lang === 'pt' ? 'Toque diretamente nos olhos para piscar ou na boca para disparar mordidas e risadas.' : 'Tap eyes to poke/wince or touch mouth to trigger snaps and laughs.'}</span>
                    </div>

                    <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-sky-400 block mb-0.5">
                        {lang === 'pt' ? '3. Deslizar o Dedo' : '3. Swipe Gestures'}
                      </span>
                      <span>{lang === 'pt' ? 'Deslize para cima para abrir a boca ou para baixo para amassar o rosto!' : 'Swipe up to drop jaw or swipe down to squish the face!'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Preset Selector Carousel */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      {lang === 'pt' ? 'Troca Rápida de Papéis de Parede' : 'Quick Wallpaper Switcher'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {lang === 'pt' ? 'Toque para testar instantaneamente no celular' : 'Tap any face to test instantly in phone mockup'}
                    </p>
                  </div>

                  <button
                    onClick={() => setCurrentTab('gallery')}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    {lang === 'pt' ? 'Ver Todos (16+) →' : 'View All (16+) →'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SMILE_PRESETS.slice(0, 8).map((preset) => {
                    const isSelected = currentConfig.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setCurrentConfig(preset);
                          soundEngine.play(preset.defaultSound || 'chuckle_giggle');
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-rose-950/60 border-rose-500 shadow-lg shadow-rose-950/50'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-full aspect-[9/10] bg-black rounded-xl overflow-hidden mb-2 relative flex items-center justify-center">
                          <SillySmileCanvas
                            config={preset}
                            aspectRatio="fullscreen"
                            isInteractive={false}
                            className="w-full h-full pointer-events-none"
                          />
                        </div>
                        <div className="text-xs font-bold text-white truncate">
                          {lang === 'pt' ? preset.namePt : preset.name}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">{preset.category}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CUSTOMIZER STUDIO (Side-by-Side on desktop for live feedback!) */}
        {currentTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Live Phone Preview on Left (sticky) */}
            <div className="lg:col-span-5 flex justify-center sticky top-24">
              <PhoneSimulator
                config={currentConfig}
                lang={lang}
                onOpenExporter={() => setIsExporterOpen(true)}
                onOpenSoundboard={() => setIsSoundboardOpen(true)}
              />
            </div>

            {/* Customizer Panel on Right */}
            <div className="lg:col-span-7">
              <CustomizerStudio
                config={currentConfig}
                onChange={setCurrentConfig}
                onSaveToLibrary={handleSaveToLibrary}
                lang={lang}
              />
            </div>
          </div>
        )}

        {/* VIEW 3: FULL WALLPAPER GALLERY & LIBRARY */}
        {currentTab === 'gallery' && (
          <WallpaperLibrary
            presets={SMILE_PRESETS}
            customWallpapers={customWallpapers}
            currentConfig={currentConfig}
            onSelect={(config) => {
              setCurrentConfig(config);
              setCurrentTab('simulator');
            }}
            onEditInStudio={handleEditInStudio}
            onDeleteCustom={handleDeleteCustom}
            onDownloadQuick={(config) => {
              setCurrentConfig(config);
              setIsExporterOpen(true);
            }}
            lang={lang}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb Zone Optimized) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 px-4 py-2">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => {
              setCurrentTab('simulator');
              soundEngine.play('squish_squeak');
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              currentTab === 'simulator' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{lang === 'pt' ? 'Simulador' : 'Simulator'}</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab('studio');
              soundEngine.play('squish_squeak');
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              currentTab === 'studio' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{lang === 'pt' ? 'Estúdio' : 'Studio'}</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab('gallery');
              soundEngine.play('squish_squeak');
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              currentTab === 'gallery' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{lang === 'pt' ? 'Galeria' : 'Gallery'}</span>
          </button>

          <button
            onClick={() => {
              setIsSoundboardOpen(true);
              soundEngine.play('cartoon_boing');
            }}
            className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <Volume2 className="w-5 h-5 mb-0.5 text-amber-400" />
            <span className="text-[10px]">{lang === 'pt' ? 'Sons' : 'Sounds'}</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: 4K & VIDEO EXPORTER */}
      <WallpaperExporterModal
        isOpen={isExporterOpen}
        onClose={() => setIsExporterOpen(false)}
        config={currentConfig}
        lang={lang}
      />

      {/* MODAL 2: INTERACTIVE SOUNDBOARD & RINGTONE PREVIEWS */}
      <SoundboardModal
        isOpen={isSoundboardOpen}
        onClose={() => setIsSoundboardOpen(false)}
        currentConfig={currentConfig}
        onSetDefaultSound={(sound) => {
          setCurrentConfig((prev) => ({ ...prev, defaultSound: sound }));
        }}
        lang={lang}
      />

      {/* MODAL 3: FEED THE SMILE MINIGAME */}
      <MinigameDrawer
        isOpen={isMinigameOpen}
        onClose={() => setIsMinigameOpen(false)}
        config={currentConfig}
        lang={lang}
      />
    </div>
  );
}
