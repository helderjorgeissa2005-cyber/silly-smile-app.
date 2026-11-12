import React, { useState } from 'react';
import { SmileConfig, EyeStyle, MouthStyle, AuraType, GestureReactionType, SoundEffectType } from '../types/smile';
import {
  Upload,
  Sparkles,
  Sliders,
  Palette,
  Eye,
  Smile,
  Zap,
  Save,
  RotateCcw,
  Shuffle,
  Volume2,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface CustomizerStudioProps {
  config: SmileConfig;
  onChange: (updated: SmileConfig) => void;
  onSaveToLibrary: (config: SmileConfig) => void;
  lang: 'pt' | 'en';
}

export const CustomizerStudio: React.FC<CustomizerStudioProps> = ({
  config,
  onChange,
  onSaveToLibrary,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'eyes' | 'mouth' | 'colors' | 'media' | 'physics' | 'fx'>('media');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // File upload handler for user background media
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(lang === 'pt' ? 'Por favor selecione uma imagem válida (PNG, JPG, WebP).' : 'Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChange({
        ...config,
        userBackgroundImage: dataUrl,
        userBackgroundFit: 'cover',
        backgroundDim: config.backgroundDim ?? 0.6,
      });
      soundEngine.play('squish_squeak');
    };
    reader.readAsDataURL(file);
  };

  const removeUserBackground = () => {
    onChange({
      ...config,
      userBackgroundImage: undefined,
    });
    soundEngine.play('glitch_zap');
  };

  // Preset color palettes
  const colorThemes = [
    { name: 'Wicked Red', primary: '#ff003c', secondary: '#ffe600', glow: '#ff003c', bg: '#050203' },
    { name: 'Toxic Lime', primary: '#00ff66', secondary: '#ccff00', glow: '#00ff66', bg: '#020703' },
    { name: 'Cyber Cyan', primary: '#00f0ff', secondary: '#ff0077', glow: '#00f0ff', bg: '#02050a' },
    { name: 'Void Purple', primary: '#bf00ff', secondary: '#ff77ff', glow: '#a100ff', bg: '#040108' },
    { name: 'Gold Iced', primary: '#ffd700', secondary: '#fff5a0', glow: '#ffd700', bg: '#000000' },
    { name: 'Cute Pastel', primary: '#ff70a6', secondary: '#70d6ff', glow: '#ff70a6', bg: '#0d0408' },
    { name: 'Hellfire', primary: '#ff3700', secondary: '#ffaa00', glow: '#ff3700', bg: '#0a0200' },
    { name: 'Pure AMOLED', primary: '#ffffff', secondary: '#888888', glow: '#ffffff', bg: '#000000' },
  ];

  // Randomizer generator
  const handleRandomize = () => {
    const eyeStyles: EyeStyle[] = [
      'wicked_slit', 'psycho_round', 'hollow_void', 'hypno_spiral', 
      'glowing_cross', 'demon_flame', 'cute_kawaii', 'glitch_pixel', 
      'derp_googly', 'cat_crescent', 'lightning_bolt', 'jack_triangles'
    ];
    const mouthStyles: MouthStyle[] = [
      'razor_vampire', 'jagged_menace', 'gold_iced', 'cartoon_block', 
      'demon_maw', 'stitched_horror', 'cheshire_curve', 'tongue_out', 
      'wide_chomp', 'pumpkin_carved'
    ];
    const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
    const randomEye = eyeStyles[Math.floor(Math.random() * eyeStyles.length)];
    const randomMouth = mouthStyles[Math.floor(Math.random() * mouthStyles.length)];

    onChange({
      ...config,
      name: 'Custom Wild Smile',
      namePt: 'Sorriso Personalizado',
      eyeStyle: randomEye,
      mouthStyle: randomMouth,
      primaryColor: randomTheme.primary,
      secondaryColor: randomTheme.secondary,
      glowColor: randomTheme.glow,
      backgroundColor: randomTheme.bg,
      glowIntensity: Number((1.2 + Math.random() * 1.0).toFixed(1)),
      pupilScale: Number((0.7 + Math.random() * 0.7).toFixed(1)),
      hasGoldTooth: Math.random() > 0.6,
      hasHorns: Math.random() > 0.7,
      hasCheekBlush: Math.random() > 0.7,
      isCustom: true,
    });

    soundEngine.play('cartoon_boing');
  };

  const handleSave = () => {
    onSaveToLibrary({
      ...config,
      id: `custom_${Date.now()}`,
      name: config.name.includes('Custom') ? config.name : `Custom ${config.name}`,
      namePt: config.namePt.includes('Personalizado') ? config.namePt : `Personalizado - ${config.namePt}`,
      isCustom: true,
      createdAt: Date.now(),
    });
    setSaveSuccess(true);
    soundEngine.play('chuckle_giggle');
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl flex flex-col">
      {/* Studio Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
            <Sliders className="w-5 h-5 text-rose-500" />
            <span>{lang === 'pt' ? 'Estúdio de Criação de Papéis de Parede' : 'Live Wallpaper Studio'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'pt'
              ? 'Importe fotos, customize olhos, boca, efeitos e reações interativas ao toque'
              : 'Import photos, customize eyes, mouth, glow effects and touch gestures'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRandomize}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            title="Randomize features"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'pt' ? 'Aleatório' : 'Randomize'}</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center gap-1.5 shadow-md shadow-rose-900/30"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveSuccess ? (lang === 'pt' ? 'Salvo!' : 'Saved!') : (lang === 'pt' ? 'Salvar Papel' : 'Save Wallpaper')}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar border-b border-slate-800/60">
        {[
          { id: 'media', label: lang === 'pt' ? 'Minha Foto / Fundo' : 'My Photo / Media', icon: Upload },
          { id: 'eyes', label: lang === 'pt' ? 'Olhos & Olhar' : 'Eyes & Gaze', icon: Eye },
          { id: 'mouth', label: lang === 'pt' ? 'Boca & Dentes' : 'Mouth & Teeth', icon: Smile },
          { id: 'colors', label: lang === 'pt' ? 'Cores & Neon' : 'Colors & Glow', icon: Palette },
          { id: 'physics', label: lang === 'pt' ? 'Gestos & Toque' : 'Touch & Physics', icon: Zap },
          { id: 'fx', label: lang === 'pt' ? 'Aura & Acessórios' : 'Aura & Extras', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-rose-600/20 text-rose-400 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-4 flex-1">
        {/* TAB 1: USER MEDIA IMPORT */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-rose-400" />
                <span>{lang === 'pt' ? 'Importar Foto / Papel de Parede do Seu Celular' : 'Import Custom Background Photo'}</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                {lang === 'pt'
                  ? 'Carregue qualquer foto da sua galeria (paisagens, anime, fotos pessoais, texturas) para usar como plano de fundo animado sob o rosto interativo.'
                  : 'Upload any image from your gallery (landscapes, anime, personal photos) to use as an animated wallpaper backdrop.'}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-rose-900/30">
                  <Upload className="w-4 h-4" />
                  <span>{lang === 'pt' ? 'Escolher Foto da Galeria...' : 'Upload Image from Device...'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {config.userBackgroundImage && (
                  <button
                    onClick={removeUserBackground}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-red-950/60 text-red-400 border border-red-500/30 text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'pt' ? 'Remover Foto' : 'Remove Photo'}</span>
                  </button>
                )}
              </div>

              {/* Background controls if image is present */}
              {config.userBackgroundImage && (
                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>{lang === 'pt' ? 'Escurecimento do Fundo (Para destacar o rosto neon)' : 'Background Dimmer'}</span>
                      <span className="font-mono">{Math.round((config.backgroundDim ?? 0.6) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.95"
                      step="0.05"
                      value={config.backgroundDim ?? 0.6}
                      onChange={(e) =>
                        onChange({ ...config, backgroundDim: parseFloat(e.target.value) })
                      }
                      className="w-full accent-rose-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5">
                      {lang === 'pt' ? 'Ajuste da Imagem' : 'Image Fit Mode'}
                    </label>
                    <div className="flex gap-2">
                      {(['cover', 'contain', 'center'] as const).map((fit) => (
                        <button
                          key={fit}
                          onClick={() => onChange({ ...config, userBackgroundFit: fit })}
                          className={`px-3 py-1.5 text-xs rounded-lg uppercase font-medium transition-colors ${
                            config.userBackgroundFit === fit
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {fit}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: EYES & GAZE */}
        {activeTab === 'eyes' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                {lang === 'pt' ? 'Estilo dos Olhos (12 Formatos Únicos)' : 'Eye Styles (12 Unique Formats)'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'wicked_slit', name: 'Wicked Slit', namePt: 'Fenda Sinistra' },
                  { id: 'psycho_round', name: 'Psycho Round', namePt: 'Arregalado Louco' },
                  { id: 'cat_crescent', name: 'Cheshire Cat', namePt: 'Gato Cheshire' },
                  { id: 'hypno_spiral', name: 'Hypno Spiral', namePt: 'Espiral Hipnótica' },
                  { id: 'glowing_cross', name: 'Star Cross', namePt: 'Cruz Estelar' },
                  { id: 'cute_kawaii', name: 'Heart Kawaii', namePt: 'Coração Kawaii' },
                  { id: 'derp_googly', name: 'Derp Googly', namePt: 'Pateta Vesgo' },
                  { id: 'lightning_bolt', name: 'Lightning Bolt', namePt: 'Raio Elétrico' },
                  { id: 'jack_triangles', name: 'Pumpkin Jack', namePt: 'Abóbora Triangular' },
                  { id: 'glitch_pixel', name: 'Cyber Pixel', namePt: 'Pixel Cibernético' },
                  { id: 'hollow_void', name: 'Hollow Void', namePt: 'Vazio Sombrio' },
                  { id: 'demon_flame', name: 'Demon Ember', namePt: 'Brasa Demoníaca' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChange({ ...config, eyeStyle: item.id as EyeStyle });
                      soundEngine.play('squish_squeak');
                    }}
                    className={`p-2.5 text-xs text-left rounded-xl transition-all border ${
                      config.eyeStyle === item.id
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-semibold'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {lang === 'pt' ? item.namePt : item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders for Eyes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{lang === 'pt' ? 'Tamanho da Pupila' : 'Pupil Scale'}</span>
                  <span className="font-mono">{config.pupilScale}x</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.6"
                  step="0.05"
                  value={config.pupilScale}
                  onChange={(e) => onChange({ ...config, pupilScale: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{lang === 'pt' ? 'Tamanho dos Olhos' : 'Eye Scale'}</span>
                  <span className="font-mono">{config.eyeScale}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={config.eyeScale}
                  onChange={(e) => onChange({ ...config, eyeScale: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{lang === 'pt' ? 'Distância entre os Olhos' : 'Eye Spacing'}</span>
                  <span className="font-mono">{config.eyeDistance}px</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="35"
                  step="2"
                  value={config.eyeDistance}
                  onChange={(e) => onChange({ ...config, eyeDistance: parseInt(e.target.value) })}
                  className="w-full accent-rose-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{lang === 'pt' ? 'Frequência de Piscadelas' : 'Blink Interval'}</span>
                  <span className="font-mono">{config.blinkRate}s</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="6"
                  step="0.5"
                  value={config.blinkRate}
                  onChange={(e) => onChange({ ...config, blinkRate: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MOUTH & TEETH */}
        {activeTab === 'mouth' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                {lang === 'pt' ? 'Formato da Boca e Dentes (10 Modelos)' : 'Mouth & Teeth Style (10 Models)'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'razor_vampire', name: 'Razor Vampire', namePt: 'Presas de Vampiro' },
                  { id: 'jagged_menace', name: 'Jagged Monster', namePt: 'Monstro Serrilhado' },
                  { id: 'cheshire_curve', name: 'Cheshire Arc', namePt: 'Arco de Cheshire' },
                  { id: 'gold_iced', name: 'Gold Iced Fangs', namePt: 'Dente de Ouro Iced' },
                  { id: 'tongue_out', name: 'Tongue Out', namePt: 'Língua pra Fora' },
                  { id: 'stitched_horror', name: 'Stitched Horror', namePt: 'Boca Costurada' },
                  { id: 'pumpkin_carved', name: 'Jack Pumpkin', namePt: 'Esculpido em Abóbora' },
                  { id: 'wide_chomp', name: 'Wide Chomp', namePt: 'Mordida Aberta' },
                  { id: 'cartoon_block', name: 'Cartoon Blocks', namePt: 'Dentes em Bloco' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChange({ ...config, mouthStyle: item.id as MouthStyle });
                      soundEngine.play('monster_chomp');
                    }}
                    className={`p-2.5 text-xs text-left rounded-xl transition-all border ${
                      config.mouthStyle === item.id
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-semibold'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {lang === 'pt' ? item.namePt : item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{lang === 'pt' ? 'Tamanho da Boca' : 'Mouth Scale'}</span>
                  <span className="font-mono">{config.mouthScale}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.4"
                  step="0.05"
                  value={config.mouthScale}
                  onChange={(e) => onChange({ ...config, mouthScale: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={config.hasGoldTooth ?? false}
                    onChange={(e) => onChange({ ...config, hasGoldTooth: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700 focus:ring-0"
                  />
                  <span>{lang === 'pt' ? 'Dente de Ouro Brilhante ✨' : 'Shiny Gold Tooth ✨'}</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COLORS & GLOW */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                {lang === 'pt' ? 'Paletas Rápidas Neon' : 'Quick Neon Palettes'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {colorThemes.map((theme, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onChange({
                        ...config,
                        primaryColor: theme.primary,
                        secondaryColor: theme.secondary,
                        glowColor: theme.glow,
                        backgroundColor: theme.bg,
                      });
                      soundEngine.play('glitch_zap');
                    }}
                    className="p-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <div
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: theme.primary, boxShadow: `0 0 8px ${theme.primary}` }}
                    />
                    <span className="truncate">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">{lang === 'pt' ? 'Cor Principal (Glow)' : 'Primary Glow'}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => onChange({ ...config, primaryColor: e.target.value, glowColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-200 uppercase">{config.primaryColor}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">{lang === 'pt' ? 'Pupilas & Detalhes' : 'Pupil & Iris'}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => onChange({ ...config, secondaryColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-200 uppercase">{config.secondaryColor}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">{lang === 'pt' ? 'Cor dos Dentes' : 'Teeth Color'}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.mouthColor}
                    onChange={(e) => onChange({ ...config, mouthColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-200 uppercase">{config.mouthColor}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">{lang === 'pt' ? 'Fundo AMOLED' : 'Background'}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-200 uppercase">{config.backgroundColor}</span>
                </div>
              </div>
            </div>

            {/* Glow Intensity Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>{lang === 'pt' ? 'Intensidade do Brilho Neon (Bloom)' : 'Neon Glow Intensity'}</span>
                <span className="font-mono">{config.glowIntensity}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={config.glowIntensity}
                onChange={(e) => onChange({ ...config, glowIntensity: parseFloat(e.target.value) })}
                className="w-full accent-rose-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TAB 5: TOUCH & PHYSICS */}
        {activeTab === 'physics' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                {lang === 'pt' ? 'Reação ao Toque & Deslize na Tela' : 'Touch & Swipe Reaction'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'chomp', name: 'Monster Chomp', namePt: 'Mordida Feroz' },
                  { id: 'screech', name: 'Sinister Screech', namePt: 'Grito Sinistro' },
                  { id: 'bounce', name: 'Elastic Squish', namePt: 'Amassar Elástico' },
                  { id: 'color_burst', name: 'Neon Blast', namePt: 'Explosão de Cor' },
                  { id: 'dizzy', name: 'Spin Dizzy', namePt: 'Giro Tonto' },
                  { id: 'wink', name: 'Flirty Wink', namePt: 'Piscadinha Maliciosa' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onChange({ ...config, touchReaction: r.id as GestureReactionType });
                      soundEngine.play('chuckle_giggle');
                    }}
                    className={`p-2.5 text-xs text-left rounded-xl transition-all border ${
                      config.touchReaction === r.id
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-semibold'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'pt' ? r.namePt : r.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{lang === 'pt' ? 'Sensibilidade ao Movimento / Giroscópio' : 'Eye Tilt Sensitivity'}</span>
                  <span className="font-mono">{config.tiltSensitivity}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.2"
                  step="0.05"
                  value={config.tiltSensitivity}
                  onChange={(e) => onChange({ ...config, tiltSensitivity: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5">
                  {lang === 'pt' ? 'Som Padrão ao Tocar' : 'Default Touch Sound'}
                </label>
                <select
                  value={config.defaultSound}
                  onChange={(e) => {
                    const snd = e.target.value as SoundEffectType;
                    onChange({ ...config, defaultSound: snd });
                    soundEngine.play(snd);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="wicked_cackle">{lang === 'pt' ? 'Risada Sinistra' : 'Wicked Cackle'}</option>
                  <option value="chuckle_giggle">{lang === 'pt' ? 'Risadinha Travessa' : 'Creepy Giggle'}</option>
                  <option value="cartoon_boing">{lang === 'pt' ? 'Boing Elástico' : 'Cartoon Boing'}</option>
                  <option value="monster_chomp">{lang === 'pt' ? 'Mordida Monstruosa' : 'Jaw Chomp'}</option>
                  <option value="glitch_zap">{lang === 'pt' ? 'Choque Cibernético' : 'Glitch Zap'}</option>
                  <option value="squish_squeak">{lang === 'pt' ? 'Squeak de Brinquedo' : 'Squishy Squeak'}</option>
                  <option value="demon_growl">{lang === 'pt' ? 'Rugido Demoníaco' : 'Demon Growl'}</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={config.touchParticlesEnabled}
                  onChange={(e) => onChange({ ...config, touchParticlesEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>{lang === 'pt' ? 'Rastro de Partículas Neon ao Tocar ✨' : 'Neon Particle Trail on Touch ✨'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={config.soundOnTouch}
                  onChange={(e) => onChange({ ...config, soundOnTouch: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>{lang === 'pt' ? 'Emitir Som ao Tocar no Rosto 🔊' : 'Play Sound on Touch 🔊'}</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 6: AURA & EXTRAS */}
        {activeTab === 'fx' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-2">
                {lang === 'pt' ? 'Aura e Partículas Flutuantes' : 'Aura & Ambient Particles'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'smoke', name: 'Ethereal Smoke', namePt: 'Fumaça Etérea' },
                  { id: 'sparks', name: 'Electric Sparks', namePt: 'Faíscas Elétricas' },
                  { id: 'glitch', name: 'Holo Glitch', namePt: 'Glitch Holográfico' },
                  { id: 'purple_void', name: 'Void Mist', namePt: 'Névoa do Vazio' },
                  { id: 'stars', name: 'Kawaii Stars', namePt: 'Estrelas Mágicas' },
                  { id: 'neon_bubbles', name: 'Acid Bubbles', namePt: 'Bolhas Neon' },
                  { id: 'blood_drips', name: 'Blood Drips', namePt: 'Gotas de Sangue' },
                  { id: 'none', name: 'None', namePt: 'Nenhuma' },
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      onChange({ ...config, aura: a.id as AuraType });
                      soundEngine.play('squish_squeak');
                    }}
                    className={`p-2.5 text-xs text-left rounded-xl transition-all border ${
                      config.aura === a.id
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-semibold'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'pt' ? a.namePt : a.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={config.hasHorns ?? false}
                  onChange={(e) => onChange({ ...config, hasHorns: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>{lang === 'pt' ? 'Chifres de Demônio 😈' : 'Demon Horns 😈'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={config.hasBloodTears ?? false}
                  onChange={(e) => onChange({ ...config, hasBloodTears: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>{lang === 'pt' ? 'Lágrimas de Sangue 🩸' : 'Blood Tears 🩸'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={config.hasCheekBlush ?? false}
                  onChange={(e) => onChange({ ...config, hasCheekBlush: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>{lang === 'pt' ? 'Bochechas Coradas 🌸' : 'Kawaii Blush 🌸'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={config.hasScanlines ?? false}
                  onChange={(e) => onChange({ ...config, hasScanlines: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>{lang === 'pt' ? 'Scanlines CRT 📺' : 'CRT Scanlines 📺'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={config.hasFloatingParticles ?? false}
                  onChange={(e) => onChange({ ...config, hasFloatingParticles: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700 focus:ring-0"
                />
                <span>{lang === 'pt' ? 'Partículas Flutuantes ✨' : 'Floating Embers ✨'}</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
