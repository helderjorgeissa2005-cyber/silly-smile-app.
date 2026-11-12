import React, { useState, useEffect } from 'react';
import { SmileConfig } from '../types/smile';
import { SillySmileCanvas } from './SillySmileCanvas';
import { X, Trophy, Flame, Play, RotateCcw, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface MinigameDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: SmileConfig;
  lang: 'pt' | 'en';
}

interface FlyingItem {
  id: number;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const MinigameDrawer: React.FC<MinigameDrawerProps> = ({
  isOpen,
  onClose,
  config,
  lang,
}) => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [tickleProgress, setTickleProgress] = useState(0);
  const [frenzyActive, setFrenzyActive] = useState(false);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  // Spawning flying snacks/eyeballs
  useEffect(() => {
    if (!isOpen || !gameStarted) return;

    const snackPool = ['🍭', '🍔', '👁️', '🍕', '🍬', '👻', '⭐', '💀'];
    const interval = setInterval(() => {
      setFlyingItems((prev) => {
        if (prev.length >= 6) return prev;
        const newItem: FlyingItem = {
          id: Math.random(),
          emoji: snackPool[Math.floor(Math.random() * snackPool.length)],
          x: Math.random() * 80 + 10,
          y: -10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 1.2 + Math.random() * 1.8,
        };
        return [...prev, newItem];
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isOpen, gameStarted]);

  // Movement physics for flying items
  useEffect(() => {
    if (!isOpen || !gameStarted) return;

    const moveInterval = setInterval(() => {
      setFlyingItems((prev) =>
        prev
          .map((item) => ({
            ...item,
            x: item.x + item.vx,
            y: item.y + item.vy,
          }))
          .filter((item) => item.y < 105)
      );
    }, 50);

    return () => clearInterval(moveInterval);
  }, [isOpen, gameStarted]);

  // Catch/feed item
  const handleCatchItem = (id: number) => {
    soundEngine.play('monster_chomp');
    setFlyingItems((prev) => prev.filter((i) => i.id !== id));
    setScore((s) => s + 10 * combo);
    setCombo((c) => Math.min(8, c + 1));
    setTickleProgress((p) => {
      const next = p + 18;
      if (next >= 100) {
        triggerMegaFrenzy();
        return 100;
      }
      return next;
    });
  };

  const triggerMegaFrenzy = () => {
    setFrenzyActive(true);
    soundEngine.play('wicked_cackle');
    setTimeout(() => {
      setFrenzyActive(false);
      setTickleProgress(0);
    }, 3500);
  };

  const resetGame = () => {
    setScore(0);
    setCombo(1);
    setTickleProgress(0);
    setFlyingItems([]);
    setGameStarted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">
                {lang === 'pt' ? 'Alimente o Sorriso & Riso-Metro' : 'Feed the Smile & Tickle Meter'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {lang === 'pt' ? 'Toque na comida que cai para alimentar o rosto!' : 'Tap the falling snacks to feed the grinning beast!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Combo HUD */}
        <div className="mt-3 flex items-center justify-between px-4 py-2 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{lang === 'pt' ? 'Pontos:' : 'Score:'}</span>
            <span className="font-mono font-bold text-base text-rose-400 tabular-nums">{score}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Combo:</span>
            <span className="font-mono font-bold text-amber-400 tabular-nums">{combo}x</span>
          </div>

          <button
            onClick={resetGame}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Reiniciar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tickle Meter Progress Bar */}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>{lang === 'pt' ? 'Medidor de Frenesi de Risada:' : 'Laugh Frenzy Meter:'}</span>
            <span className="font-mono text-rose-400 font-bold">{tickleProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                frenzyActive
                  ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-pink-500 animate-pulse'
                  : 'bg-rose-600'
              }`}
              style={{ width: `${tickleProgress}%` }}
            />
          </div>
        </div>

        {/* Interactive Play Arena */}
        <div className="relative mt-4 w-full aspect-[9/13] max-h-[380px] bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
          {/* Silly Smile Face Background */}
          <SillySmileCanvas
            config={config}
            aspectRatio="fullscreen"
            className="w-full h-full pointer-events-none"
          />

          {/* Frenzy Banner Flash */}
          {frenzyActive && (
            <div className="absolute inset-0 bg-rose-600/30 flex items-center justify-center backdrop-blur-[2px] z-30 animate-pulse pointer-events-none">
              <div className="text-center p-4 bg-black/85 rounded-2xl border border-rose-500 shadow-2xl">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-spin mb-1" />
                <h4 className="text-xl font-black text-rose-400 font-display">
                  {lang === 'pt' ? 'FRENESI DE RISADA 😈' : 'MEGA LAUGH FRENZY 😈'}
                </h4>
                <p className="text-xs text-white mt-1">+100 PONTOS BÔNUS!</p>
              </div>
            </div>
          )}

          {/* Falling snacks to feed the smile */}
          {gameStarted ? (
            flyingItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleCatchItem(item.id)}
                className="absolute text-3xl select-none cursor-pointer transition-transform hover:scale-125 active:scale-75 z-20"
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))',
                }}
              >
                {item.emoji}
              </button>
            ))
          ) : (
            <div className="absolute inset-0 z-30 bg-black/75 flex flex-col items-center justify-center p-6 text-center">
              <h4 className="text-lg font-bold text-white font-display mb-1">
                {lang === 'pt' ? 'Pronto para Brincar?' : 'Ready to Play?'}
              </h4>
              <p className="text-xs text-slate-300 max-w-xs mb-4">
                {lang === 'pt'
                  ? 'Toque nos lanches voadores antes que eles caiam para alimentar o sorriso!'
                  : 'Tap the flying treats before they fall off screen to feed the smile!'}
              </p>
              <button
                onClick={() => setGameStarted(true)}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-xl shadow-rose-900/40 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{lang === 'pt' ? 'Iniciar Jogo' : 'Start Game'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
