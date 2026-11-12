import React from 'react';
import { Sparkles, Globe, Download, Play, Sliders, Volume2, Grid } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface HeaderNavProps {
  currentTab: 'simulator' | 'studio' | 'gallery' | 'soundboard';
  onTabChange: (tab: 'simulator' | 'studio' | 'gallery' | 'soundboard') => void;
  onOpenExporter: () => void;
  onOpenMinigame: () => void;
  lang: 'pt' | 'en';
  onToggleLang: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onTabChange,
  onOpenExporter,
  onOpenMinigame,
  lang,
  onToggleLang,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('simulator');
              soundEngine.play('chuckle_giggle');
            }}
            className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2 whitespace-nowrap shrink-0 font-display hover:text-rose-400 transition-colors"
          >
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white text-base shadow-lg shadow-rose-900/30">
              😈
            </span>
            <span>SillySmile 4K</span>
          </a>
        </div>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => {
              onTabChange('simulator');
              soundEngine.play('squish_squeak');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'simulator' ? 'text-rose-400 font-semibold' : 'hover:text-white'
            }`}
          >
            {lang === 'pt' ? 'Simulador Interativo' : 'Live Simulator'}
          </button>

          <button
            onClick={() => {
              onTabChange('studio');
              soundEngine.play('squish_squeak');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'studio' ? 'text-rose-400 font-semibold' : 'hover:text-white'
            }`}
          >
            {lang === 'pt' ? 'Estúdio de Criação' : 'Custom Studio'}
          </button>

          <button
            onClick={() => {
              onTabChange('gallery');
              soundEngine.play('squish_squeak');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'gallery' ? 'text-rose-400 font-semibold' : 'hover:text-white'
            }`}
          >
            {lang === 'pt' ? 'Galeria de Papéis' : 'Wallpaper Gallery'}
          </button>

          <button
            onClick={() => {
              onOpenMinigame();
              soundEngine.play('cartoon_boing');
            }}
            className="transition-colors whitespace-nowrap shrink-0 text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            <span>{lang === 'pt' ? 'Alimentar Monstro' : 'Feed Game'}</span>
            <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">Minigame</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action button + language toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleLang}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            title="Mudar idioma / Switch language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono uppercase">{lang}</span>
          </button>

          <button
            onClick={() => {
              onOpenExporter();
              soundEngine.play('monster_chomp');
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-amber-600 rounded-xl hover:from-rose-500 hover:to-amber-500 transition-all shadow-md shadow-rose-950/40 whitespace-nowrap shrink-0 flex items-center gap-1.5 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'pt' ? 'Baixar 4K' : 'Download 4K'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
