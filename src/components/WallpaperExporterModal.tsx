import React, { useState, useRef } from 'react';
import { SmileConfig } from '../types/smile';
import { X, Download, Video, CheckCircle, Film, Sparkles, AlertCircle } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface WallpaperExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SmileConfig;
  lang: 'pt' | 'en';
}

export const WallpaperExporterModal: React.FC<WallpaperExporterModalProps> = ({
  isOpen,
  onClose,
  config,
  lang,
}) => {
  const [resolution, setResolution] = useState<'phone' | '4k' | 'square'>('phone');
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen) return null;

  // Render high-res frame to canvas
  const renderFrameToCanvas = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) => {
    // 1. Clear & Background
    ctx.fillStyle = config.backgroundColor || '#020205';
    ctx.fillRect(0, 0, width, height);

    // Ambient radial glow
    const cx = width / 2;
    const cy = height * 0.45;
    const radGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, width * 0.6);
    radGlow.addColorStop(0, `${config.glowColor}55`);
    radGlow.addColorStop(0.5, `${config.glowColor}15`);
    radGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = radGlow;
    ctx.fillRect(0, 0, width, height);

    // Floating particles
    if (config.hasFloatingParticles) {
      for (let i = 0; i < 25; i++) {
        const px = (Math.sin(i * 99 + time * 0.5) * 0.5 + 0.5) * width;
        const py = ((i * 123 - time * 40) % height + height) % height;
        ctx.fillStyle = config.primaryColor;
        ctx.globalAlpha = 0.4 + 0.4 * Math.sin(i + time);
        ctx.beginPath();
        ctx.arc(px, py, 2.5 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }

    // Dynamic eyes & mouth positioning
    const scale = Math.min(width, height) / 420;
    const eyeSpacing = (75 + (config.eyeDistance || 0)) * scale;
    const eyeY = cy - 40 * scale;
    const mouthY = cy + 90 * scale;

    const blink = Math.sin(time * 2.5) > 0.95 ? 0.1 : 1.0;
    const pupilX = Math.sin(time * 1.5) * 12 * scale;
    const pupilY = Math.cos(time * 1.2) * 8 * scale;

    ctx.save();
    ctx.shadowBlur = 30 * (config.glowIntensity || 1.5);
    ctx.shadowColor = config.primaryColor;
    ctx.strokeStyle = config.primaryColor;
    ctx.lineWidth = 4 * scale;

    // LEFT EYE
    drawEye(ctx, cx - eyeSpacing, eyeY, scale * (config.eyeScale || 1), blink, pupilX, pupilY, false);
    // RIGHT EYE
    drawEye(ctx, cx + eyeSpacing, eyeY, scale * (config.eyeScale || 1), blink, pupilX, pupilY, true);

    // MOUTH
    drawMouth(ctx, cx, mouthY, scale * (config.mouthScale || 1));

    ctx.restore();
  };

  // Canvas eye drawer
  const drawEye = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    blink: number,
    pupilX: number,
    pupilY: number,
    isRight: boolean
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale * blink);

    // Outer eye socket
    ctx.fillStyle = '#050204';
    ctx.beginPath();
    if (config.eyeStyle === 'psycho_round' || config.eyeStyle === 'derp_googly') {
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
    } else {
      // Slit / crescent
      ctx.ellipse(0, 0, 38, 26, isRight ? 0.2 : -0.2, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    // Pupil
    ctx.fillStyle = config.secondaryColor;
    ctx.shadowBlur = 15;
    ctx.shadowColor = config.secondaryColor;
    ctx.beginPath();
    ctx.ellipse(pupilX, pupilY, 7 * (config.pupilScale || 1), 20 * (config.pupilScale || 1), 0, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pupilX - 2, pupilY - 6, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Canvas mouth drawer
  const drawMouth = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Cavity
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(0, 0, 95, 45, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // Teeth
    ctx.fillStyle = config.hasGoldTooth ? '#ffd700' : config.mouthColor;
    for (let i = -4; i <= 4; i++) {
      const tx = i * 18;
      ctx.beginPath();
      ctx.moveTo(tx - 7, 0);
      ctx.lineTo(tx, 22);
      ctx.lineTo(tx + 7, 0);
      ctx.fill();
    }

    ctx.restore();
  };

  // 1. Download Static 4K Ultra HD PNG
  const handleDownloadStatic = () => {
    const canvas = hiddenCanvasRef.current;
    if (!canvas) return;

    let width = 1080;
    let height = 2400; // Phone 9:20 4K
    if (resolution === '4k') {
      width = 3840;
      height = 2160; // Desktop 4K
    } else if (resolution === 'square') {
      width = 2048;
      height = 2048;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderFrameToCanvas(ctx, width, height, 1.2);

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `SillySmile_4K_${config.name.replace(/\s+/g, '_')}.png`;
    link.href = dataUrl;
    link.click();

    soundEngine.play('wicked_cackle');
    setExportSuccess(lang === 'pt' ? 'Papel de Parede 4K baixado com sucesso!' : '4K Wallpaper downloaded!');
    setTimeout(() => setExportSuccess(null), 3000);
  };

  // 2. Record Animated WebM Live Wallpaper loop
  const handleRecordLiveLoop = async () => {
    const canvas = hiddenCanvasRef.current;
    if (!canvas) return;

    const width = 720;
    const height = 1600;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsRecording(true);
    setRecordProgress(0);
    soundEngine.play('glitch_zap');

    const stream = canvas.captureStream(30);
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    } catch {
      recorder = new MediaRecorder(stream);
    }

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `SillySmile_AnimatedLoop_${config.name.replace(/\s+/g, '_')}.webm`;
      link.href = url;
      link.click();

      setIsRecording(false);
      setRecordProgress(0);
      soundEngine.play('chuckle_giggle');
      setExportSuccess(lang === 'pt' ? 'Vídeo animado do papel de parede salvo!' : 'Animated live wallpaper saved!');
      setTimeout(() => setExportSuccess(null), 3000);
    };

    recorder.start();

    // Render 4 seconds of animation (120 frames at 30fps)
    const totalFrames = 120;
    let currentFrame = 0;

    const recordInterval = setInterval(() => {
      currentFrame++;
      const time = currentFrame / 30;
      renderFrameToCanvas(ctx, width, height, time);
      setRecordProgress(Math.round((currentFrame / totalFrames) * 100));

      if (currentFrame >= totalFrames) {
        clearInterval(recordInterval);
        recorder.stop();
      }
    }, 1000 / 30);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col">
        {/* Hidden render canvas */}
        <canvas ref={hiddenCanvasRef} className="hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/30 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                {lang === 'pt' ? 'Exportar Papel de Parede Animado' : 'Export Live Wallpaper'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'pt' ? `Download de ${config.namePt} em 4K UHD` : `Download ${config.name} in 4K UHD`}
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

        {/* Success Alert */}
        {exportSuccess && (
          <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportSuccess}</span>
          </div>
        )}

        {/* Resolution Format Selector */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            {lang === 'pt' ? 'Formato & Resolução da Tela' : 'Display Format & Resolution'}
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'phone', label: lang === 'pt' ? 'Celular 4K' : 'Phone 4K', sub: '1080 × 2400' },
              { id: '4k', label: lang === 'pt' ? 'Monitor 4K' : 'Desktop 4K', sub: '3840 × 2160' },
              { id: 'square', label: lang === 'pt' ? 'Quadrado HD' : 'Square HD', sub: '2048 × 2048' },
            ].map((res) => (
              <button
                key={res.id}
                onClick={() => setResolution(res.id as typeof resolution)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  resolution === res.id
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">{res.label}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{res.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recording Progress Bar */}
        {isRecording && (
          <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span className="flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                {lang === 'pt' ? 'Renderizando Loop Animado...' : 'Rendering Animated Loop...'}
              </span>
              <span className="font-mono font-bold text-rose-400">{recordProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-100"
                style={{ width: `${recordProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Download 4K Image */}
          <button
            onClick={handleDownloadStatic}
            disabled={isRecording}
            className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-slate-700 shadow-md active:scale-98 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{lang === 'pt' ? 'Baixar Imagem 4K (PNG)' : 'Download 4K Image (PNG)'}</span>
          </button>

          {/* Download Animated Video */}
          <button
            onClick={handleRecordLiveLoop}
            disabled={isRecording}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-900/40 active:scale-98 disabled:opacity-50"
          >
            <Video className="w-4 h-4" />
            <span>
              {isRecording
                ? (lang === 'pt' ? 'Gravando...' : 'Recording...')
                : (lang === 'pt' ? 'Gerar Vídeo Animado (WebM)' : 'Generate Video Loop (WebM)')}
            </span>
          </button>
        </div>

        {/* Hint on how to set as wallpaper on Android */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>
            {lang === 'pt'
              ? 'Dica: No Android, use o app "Vídeo Papel de Parede Animado" da Play Store para definir o arquivo .webm baixado como papel de parede da tela de bloqueio com animação contínua.'
              : 'Tip: On Android, set the exported .webm video file as your live lockscreen wallpaper using any Video Live Wallpaper app from Google Play.'}
          </span>
        </div>
      </div>
    </div>
  );
};
