import React, { useState } from 'react';
import { SmileConfig } from '../types/smile';
import { SillySmileCanvas } from './SillySmileCanvas';
import { Sparkles, Trash2, Edit3, Check, Search, Download } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface WallpaperLibraryProps {
  presets: SmileConfig[];
  customWallpapers: SmileConfig[];
  currentConfig: SmileConfig;
  onSelect: (config: SmileConfig) => void;
  onEditInStudio: (config: SmileConfig) => void;
  onDeleteCustom: (id: string) => void;
  onDownloadQuick: (config: SmileConfig) => void;
  lang: 'pt' | 'en';
}

export const WallpaperLibrary: React.FC<WallpaperLibraryProps> = ({
  presets,
  customWallpapers,
  currentConfig,
  onSelect,
  onEditInStudio,
  onDeleteCustom,
  onDownloadQuick,
  lang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allWallpapers = [...customWallpapers, ...presets];

  const categories = [
    { id: 'all', label: lang === 'pt' ? 'Todos os Papéis' : 'All Wallpapers' },
    { id: 'custom', label: lang === 'pt' ? 'Criados por Mim' : 'My Creations' },
    { id: 'wicked', label: lang === 'pt' ? 'Sinistros & Malignos' : 'Wicked & Sinister' },
    { id: 'neon', label: lang === 'pt' ? 'Neon & Tóxico' : 'Neon & Toxic' },
    { id: 'cyber', label: lang === 'pt' ? 'Cyberpunk & Glitch' : 'Cyber & Glitch' },
    { id: 'cute', label: lang === 'pt' ? 'Fofos & Kawaii' : 'Cute & Kawaii' },
    { id: 'horror', label: lang === 'pt' ? 'Terror & Pesadelo' : 'Horror & Spooky' },
    { id: 'meme', label: lang === 'pt' ? 'Engraçados & Meme' : 'Funny & Memes' },
  ];

  const filtered = allWallpapers.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'custom'
        ? item.isCustom
        : item.category === selectedCategory;

    const query = searchQuery.toLowerCase();
    const matchesQuery =
      item.name.toLowerCase().includes(query) ||
      item.namePt.toLowerCase().includes(query) ||
      item.tagline.toLowerCase().includes(query) ||
      item.taglinePt.toLowerCase().includes(query);

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'pt' ? 'Buscar papel de parede por nome...' : 'Search wallpapers by name...'}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                soundEngine.play('squish_squeak');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Wallpapers */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8">
          <Sparkles className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">
            {lang === 'pt' ? 'Nenhum papel de parede encontrado' : 'No wallpapers found'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'pt'
              ? 'Tente outra busca ou crie seu próprio sorriso no Estúdio!'
              : 'Try another search or design your own smile in the Studio!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const isCurrent = currentConfig.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  soundEngine.play(item.defaultSound || 'chuckle_giggle');
                }}
                className={`group relative bg-slate-900/80 hover:bg-slate-900 rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden p-3.5 flex flex-col justify-between ${
                  isCurrent
                    ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-xl shadow-rose-950/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Mini Preview Window */}
                <div className="relative w-full aspect-[9/14] rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/5 shadow-inner">
                  <SillySmileCanvas
                    config={item}
                    aspectRatio="fullscreen"
                    isInteractive={false}
                    className="w-full h-full pointer-events-none"
                  />

                  {/* Active Badge */}
                  {isCurrent && (
                    <div className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Check className="w-3 h-3" />
                      <span>{lang === 'pt' ? 'ATIVO' : 'ACTIVE'}</span>
                    </div>
                  )}

                  {/* Custom User Tag */}
                  {item.isCustom && (
                    <div className="absolute top-2.5 left-2.5 bg-purple-600/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {lang === 'pt' ? 'Criado por Você' : 'User Made'}
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors font-display truncate">
                      {lang === 'pt' ? item.namePt : item.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {lang === 'pt' ? item.taglinePt : item.tagline}
                    </p>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center justify-between gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditInStudio(item);
                        soundEngine.play('glitch_zap');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors flex items-center gap-1"
                      title={lang === 'pt' ? 'Abrir no Estúdio' : 'Edit in Studio'}
                    >
                      <Edit3 className="w-3 h-3 text-rose-400" />
                      <span>{lang === 'pt' ? 'Editar' : 'Edit'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadQuick(item);
                        }}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title={lang === 'pt' ? 'Baixar 4K' : 'Download 4K'}
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                      </button>

                      {item.isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCustom(item.id);
                            soundEngine.play('glitch_zap');
                          }}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                          title={lang === 'pt' ? 'Excluir' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
