export type EyeStyle = 
  | 'wicked_slit' 
  | 'psycho_round' 
  | 'hollow_void' 
  | 'hypno_spiral' 
  | 'glowing_cross' 
  | 'demon_flame' 
  | 'cute_kawaii' 
  | 'glitch_pixel' 
  | 'derp_googly' 
  | 'cat_crescent'
  | 'lightning_bolt'
  | 'jack_triangles';

export type MouthStyle = 
  | 'razor_vampire' 
  | 'jagged_menace' 
  | 'gold_iced' 
  | 'cartoon_block' 
  | 'demon_maw' 
  | 'stitched_horror' 
  | 'cheshire_curve' 
  | 'tongue_out' 
  | 'wide_chomp'
  | 'pumpkin_carved';

export type AuraType = 'none' | 'smoke' | 'sparks' | 'glitch' | 'purple_void' | 'matrix_rain' | 'blood_drips' | 'stars' | 'neon_bubbles';

export type GestureReactionType = 'bounce' | 'wink' | 'chomp' | 'screech' | 'color_burst' | 'dizzy';

export interface SmileConfig {
  id: string;
  name: string;
  namePt: string;
  tagline: string;
  taglinePt: string;
  category: 'wicked' | 'cute' | 'neon' | 'cyber' | 'horror' | 'meme' | 'custom';
  
  // Facial Architecture
  eyeStyle: EyeStyle;
  mouthStyle: MouthStyle;
  primaryColor: string; // Hex for glow and eyes
  secondaryColor: string; // Hex for pupils/details
  mouthColor: string; // Hex for mouth cavity/teeth
  glowColor: string; // Hex for bloom drop-shadow
  backgroundColor: string; // Hex or gradient
  
  // Custom User Media
  userBackgroundImage?: string; // Data URL or object URL of user's uploaded background
  userBackgroundFit?: 'cover' | 'contain' | 'center';
  backgroundDim?: number; // 0 to 1 overlay darkness
  
  // Sliders & Tuning
  glowIntensity: number; // 0.5 to 2.5
  pupilScale: number; // 0.4 to 1.6
  eyeDistance: number; // -30 to +40
  eyeScale: number; // 0.7 to 1.4
  mouthScale: number; // 0.7 to 1.4
  tiltSensitivity: number; // 0 to 1
  blinkRate: number; // 1 to 5 (seconds between blinks)
  
  // Visual Trait Flags
  aura: AuraType;
  hasGoldTooth?: boolean;
  hasBloodTears?: boolean;
  hasHorns?: boolean;
  hasCheekBlush?: boolean;
  hasScanlines?: boolean;
  hasChains?: boolean;
  hasFloatingParticles?: boolean;
  
  // Touch & Swipe Interactivity
  touchReaction: GestureReactionType;
  touchParticlesEnabled: boolean;
  soundOnTouch: boolean;
  defaultSound: SoundEffectType;
  
  createdAt?: number;
  isCustom?: boolean;
}

export type SoundEffectType = 
  | 'wicked_cackle' 
  | 'cartoon_boing' 
  | 'creepy_whisper' 
  | 'chuckle_giggle' 
  | 'monster_chomp' 
  | 'glitch_zap' 
  | 'squish_squeak' 
  | 'demon_growl' 
  | 'evil_snicker'
  | 'bell_chime';

export interface SoundItem {
  id: SoundEffectType;
  title: string;
  titlePt: string;
  emoji: string;
  durationSec: number;
  category: 'creepy' | 'funny' | 'scary' | 'cartoon';
}

export interface PhoneNotification {
  id: string;
  app: string;
  title: string;
  body: string;
  time: string;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}
