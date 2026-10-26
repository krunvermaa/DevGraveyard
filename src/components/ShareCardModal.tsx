import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Grave } from '../types';
import { motion } from 'motion/react';
import html2canvas from 'html2canvas';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Check, Download, Share2, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ShareCardModalProps {
  grave: Grave;
  respects: number;
  eulogiesCount: number;
  graveOwnerUsername: string | null;
  onClose: () => void;
}

const THEMES = {
  'minimal-noir': {
    name: 'Minimal Noir',
    bg: '#050505',
    cardBg: 'bg-zinc-950',
    border: 'border-zinc-700/80',
    shadow: 'shadow-[0_0_60px_rgba(0,0,0,0.9)]',
    glow: 'from-zinc-500/15 to-transparent',
    accentText: 'text-zinc-200',
    accentBg: 'bg-zinc-800/80',
    accentBorder: 'border-zinc-600/70',
    textMain: 'text-white',
    textSub: 'text-zinc-400',
  },
  'neon-cyberpunk': {
    name: 'Cyberpunk',
    bg: '#0a0a0a',
    cardBg: 'bg-[#05080f]',
    border: 'border-[#00ffcc]/70',
    shadow: 'shadow-[0_0_60px_rgba(0,255,204,0.25)]',
    glow: 'from-[#ff00ff]/25 via-[#00ffcc]/10 to-transparent',
    accentText: 'text-[#00ffcc]',
    accentBg: 'bg-[#ff00ff]/20',
    accentBorder: 'border-[#ff00ff]/50',
    textMain: 'text-white',
    textSub: 'text-zinc-300',
  },
  'moonlit': {
    name: 'Moonlit',
    bg: '#060a14',
    cardBg: 'bg-[#0b1426]',
    border: 'border-blue-500/50',
    shadow: 'shadow-[0_0_60px_rgba(59,130,246,0.25)]',
    glow: 'from-blue-500/20 to-transparent',
    accentText: 'text-blue-300',
    accentBg: 'bg-blue-900/40',
    accentBorder: 'border-blue-400/50',
    textMain: 'text-blue-50',
    textSub: 'text-blue-200/80',
  },
  'crimson-requiem': {
    name: 'Crimson',
    bg: '#0a0505',
    cardBg: 'bg-[#140808]',
    border: 'border-red-600/50',
    shadow: 'shadow-[0_0_60px_rgba(220,38,38,0.25)]',
    glow: 'from-red-600/25 via-red-900/10 to-transparent',
    accentText: 'text-red-400',
    accentBg: 'bg-red-950/60',
    accentBorder: 'border-red-700/60',
    textMain: 'text-white',
    textSub: 'text-red-200/80',
  }
};

interface CanvasThemeConfig {
  bg: string;
  cardBg: string;
  border: string;
  glow: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  textMain: string;
  textSub: string;
  shadowColor: string;
  roseColor: string;
}

const CANVAS_THEMES: Record<keyof typeof THEMES, CanvasThemeConfig> = {
  'minimal-noir': {
    bg: '#050505',
    cardBg: '#09090b',
    border: '#27272a',
    glow: 'rgba(255, 255, 255, 0.05)',
    accentText: '#e4e4e7',
    accentBg: 'rgba(39, 39, 42, 0.8)',
    accentBorder: 'rgba(82, 82, 91, 0.9)',
    textMain: '#ffffff',
    textSub: '#a1a1aa',
    shadowColor: 'rgba(0, 0, 0, 0.9)',
    roseColor: '#f87171',
  },
  'neon-cyberpunk': {
    bg: '#0a0a0a',
    cardBg: '#05080f',
    border: '#00ffcc',
    glow: 'rgba(0, 255, 204, 0.16)',
    accentText: '#00ffcc',
    accentBg: 'rgba(255, 0, 255, 0.2)',
    accentBorder: 'rgba(255, 0, 255, 0.6)',
    textMain: '#ffffff',
    textSub: '#cbd5e1',
    shadowColor: 'rgba(0, 255, 204, 0.25)',
    roseColor: '#ff007f',
  },
  'moonlit': {
    bg: '#060a14',
    cardBg: '#0b1426',
    border: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.18)',
    accentText: '#93c5fd',
    accentBg: 'rgba(30, 58, 138, 0.45)',
    accentBorder: 'rgba(59, 130, 246, 0.6)',
    textMain: '#f0f9ff',
    textSub: '#94a3b8',
    shadowColor: 'rgba(59, 130, 246, 0.25)',
    roseColor: '#f87171',
  },
  'crimson-requiem': {
    bg: '#0a0505',
    cardBg: '#140808',
    border: '#dc2626',
    glow: 'rgba(220, 38, 38, 0.18)',
    accentText: '#f87171',
    accentBg: 'rgba(127, 29, 29, 0.45)',
    accentBorder: 'rgba(220, 38, 38, 0.6)',
    textMain: '#fff1f2',
    textSub: '#fca5a5',
    shadowColor: 'rgba(220, 38, 38, 0.25)',
    roseColor: '#ef4444',
  }
};

/**
 * Draws a rounded rectangle path on Canvas2D
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

/**
 * Wraps text into multiple lines within a maximum pixel width
 */
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 3
): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) {
        // Last allowed line: truncate remaining words
        const remainingWords = words.slice(i).join(' ');
        let truncated = remainingWords;
        while (truncated.length > 0 && ctx.measureText(`${truncated}...`).width > maxWidth) {
          truncated = truncated.slice(0, -1).trim();
        }
        lines.push(`${truncated}...`);
        return lines;
      }
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Pure HTML5 Canvas 2D card generator fallback
 * Guarantees instantaneous, zero-CORS card generation under any network or browser restrictions
 */
function drawCanvasFallback(
  canvas: HTMLCanvasElement,
  {
    grave,
    respects,
    eulogiesCount,
    graveOwnerUsername,
    theme,
    format,
    qrCanvas,
    highRes = false
  }: {
    grave: Grave;
    respects: number;
    eulogiesCount: number;
    graveOwnerUsername: string | null;
    theme: keyof typeof THEMES;
    format: 'instagram' | 'twitter';
    qrCanvas: HTMLCanvasElement | null;
    highRes?: boolean;
  }
) {
  const isInsta = format === 'instagram';
  const baseW = isInsta ? 1080 : 1200;
  const baseH = isInsta ? 1080 : 630;
  const scale = highRes ? 2 : 1;

  canvas.width = baseW * scale;
  canvas.height = baseH * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  const t = CANVAS_THEMES[theme] || CANVAS_THEMES['minimal-noir'];

  // 1. Base Background
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, baseW, baseH);

  // 2. Ambient Radial Glow
  const glowCenterX = isInsta ? baseW / 2 : 380;
  const glowCenterY = isInsta ? 280 : 240;
  const glowRadius = isInsta ? 620 : 520;
  const glowGrad = ctx.createRadialGradient(glowCenterX, glowCenterY, 30, glowCenterX, glowCenterY, glowRadius);
  glowGrad.addColorStop(0, t.glow);
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, baseW, baseH);

  // 3. Card Outer Container
  const padX = isInsta ? 48 : 36;
  const padY = isInsta ? 48 : 36;
  const cardW = baseW - (padX * 2);
  const cardH = baseH - (padY * 2);
  const cardR = 26;

  // Outer shadow & fill
  ctx.save();
  ctx.shadowColor = t.shadowColor;
  ctx.shadowBlur = 45;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = t.cardBg;
  drawRoundedRect(ctx, padX, padY, cardW, cardH, cardR);
  ctx.fill();
  ctx.restore();

  // Border
  ctx.save();
  ctx.strokeStyle = t.border;
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, padX, padY, cardW, cardH, cardR);
  ctx.stroke();
  ctx.restore();

  if (isInsta) {
    // -------------------------------------------------------------
    // INSTAGRAM 1:1 LAYOUT (1080 x 1080)
    // -------------------------------------------------------------
    // Badge: Cause of Death
    ctx.font = 'bold 13px "Space Mono", monospace, ui-monospace';
    const causeText = (grave.cause_of_death || 'FATAL SYSTEM ERROR').toUpperCase();
    const badgeTextW = ctx.measureText(causeText).width;
    const badgeW = badgeTextW + 36;
    const badgeH = 34;
    const badgeX = (baseW - badgeW) / 2;
    const badgeY = padY + 44;

    ctx.fillStyle = t.accentBg;
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 17);
    ctx.fill();
    ctx.strokeStyle = t.accentBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = t.accentText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(causeText, baseW / 2, badgeY + badgeH / 2);

    // Project Name (Title)
    ctx.font = 'bold 50px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = t.textMain;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const titleLines = wrapCanvasText(ctx, grave.project_name, cardW - 140, 2);
    let titleY = badgeY + 54;
    for (const line of titleLines) {
      ctx.fillText(line, baseW / 2, titleY);
      titleY += 60;
    }

    // Owner tag
    if (graveOwnerUsername) {
      ctx.font = '500 15px "Space Mono", monospace';
      ctx.fillStyle = t.accentText;
      ctx.fillText(`LAID TO REST BY @${graveOwnerUsername.toUpperCase()}`, baseW / 2, titleY + 4);
      titleY += 34;
    } else {
      titleY += 10;
    }

    // Epitaph / Lesson Learned Quote
    ctx.font = 'italic 23px "Crimson Pro", Georgia, serif';
    ctx.fillStyle = t.textMain;
    const quoteLines = wrapCanvasText(ctx, `"${grave.lesson_learned || 'Resting peacefully in the graveyard.'}"`, cardW - 140, 3);
    let quoteY = titleY + 12;
    for (const line of quoteLines) {
      ctx.fillText(line, baseW / 2, quoteY);
      quoteY += 34;
    }

    // Stats Section (Row 1: Lived For & Tech Stack)
    const statsY1 = 600;
    const pill1W = 210;
    const pill1H = 54;
    const pill1Gap = 16;
    const pill1StartX = (baseW - (pill1W * 2 + pill1Gap)) / 2;

    // Lived for pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    drawRoundedRect(ctx, pill1StartX, statsY1, pill1W, pill1H, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();

    ctx.font = '10px "Space Mono", monospace';
    ctx.fillStyle = t.textSub;
    ctx.fillText('LIVED FOR', pill1StartX + pill1W / 2, statsY1 + 10);
    ctx.font = 'bold 16px "Space Mono", monospace';
    ctx.fillStyle = t.textMain;
    ctx.fillText(grave.lived_for || 'Unknown', pill1StartX + pill1W / 2, statsY1 + 28);

    // Tech stack pill
    const pill2X = pill1StartX + pill1W + pill1Gap;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    drawRoundedRect(ctx, pill2X, statsY1, pill1W, pill1H, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();

    ctx.font = '10px "Space Mono", monospace';
    ctx.fillStyle = t.textSub;
    ctx.fillText('TECH STACK', pill2X + pill1W / 2, statsY1 + 10);
    ctx.font = 'bold 15px "Space Mono", monospace';
    ctx.fillStyle = t.accentText;
    const stackText = (grave.tech_stack || 'Unknown').slice(0, 16);
    ctx.fillText(stackText, pill2X + pill1W / 2, statsY1 + 28);

    // Stats Section (Row 2: 🌹 RIPs & 📜 Eulogies)
    const statsY2 = 668;
    const pill2W = 150;
    const pill2H = 46;
    const pill2Gap = 16;
    const pill2StartX = (baseW - (pill2W * 2 + pill2Gap)) / 2;

    // RIPs
    ctx.fillStyle = 'rgba(197, 48, 48, 0.15)';
    drawRoundedRect(ctx, pill2StartX, statsY2, pill2W, pill2H, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(197, 48, 48, 0.4)';
    ctx.stroke();
    ctx.font = 'bold 15px "Space Mono", monospace';
    ctx.fillStyle = t.textMain;
    ctx.fillText(`🌹 RIPs  ${respects}`, pill2StartX + pill2W / 2, statsY2 + 15);

    // Eulogies
    const pill4X = pill2StartX + pill2W + pill2Gap;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    drawRoundedRect(ctx, pill4X, statsY2, pill2W, pill2H, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();
    ctx.font = 'bold 15px "Space Mono", monospace';
    ctx.fillStyle = t.textMain;
    ctx.fillText(`📜 Eulogies  ${eulogiesCount}`, pill4X + pill2W / 2, statsY2 + 15);

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(220, 745);
    ctx.lineTo(860, 745);
    ctx.stroke();

    // QR Code Container
    const qrBoxSize = 144;
    const qrBoxX = (baseW - qrBoxSize) / 2;
    const qrBoxY = 765;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 14);
    ctx.fill();
    ctx.restore();

    if (qrCanvas && qrCanvas.width > 0) {
      ctx.drawImage(qrCanvas, qrBoxX + 8, qrBoxY + 8, qrBoxSize - 16, qrBoxSize - 16);
    } else {
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px "Space Mono", monospace';
      ctx.fillText('QR CODE', baseW / 2, qrBoxY + qrBoxSize / 2);
    }

    // Branding
    ctx.font = 'bold 12px "Space Mono", monospace';
    ctx.fillStyle = t.textSub;
    ctx.fillText('🪦  DEV GRAVEYARD', baseW / 2, 942);

  } else {
    // -------------------------------------------------------------
    // SOCIAL / TWITTER LAYOUT (1200 x 630)
    // -------------------------------------------------------------
    const leftX = padX + 44;

    // Badge: Cause of Death
    ctx.font = 'bold 13px "Space Mono", monospace';
    const causeText = (grave.cause_of_death || 'FATAL SYSTEM ERROR').toUpperCase();
    const badgeTextW = ctx.measureText(causeText).width;
    const badgeW = badgeTextW + 32;
    const badgeH = 32;
    const badgeY = padY + 36;

    ctx.fillStyle = t.accentBg;
    drawRoundedRect(ctx, leftX, badgeY, badgeW, badgeH, 16);
    ctx.fill();
    ctx.strokeStyle = t.accentBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = t.accentText;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(causeText, leftX + 16, badgeY + badgeH / 2);

    // Project Name
    ctx.font = 'bold 50px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = t.textMain;
    ctx.textBaseline = 'top';
    const titleLines = wrapCanvasText(ctx, grave.project_name, 720, 2);
    let titleY = badgeY + 46;
    for (const line of titleLines) {
      ctx.fillText(line, leftX, titleY);
      titleY += 56;
    }

    // Owner tag
    if (graveOwnerUsername) {
      ctx.font = '500 14px "Space Mono", monospace';
      ctx.fillStyle = t.accentText;
      ctx.fillText(`LAID TO REST BY @${graveOwnerUsername.toUpperCase()}`, leftX, titleY + 4);
      titleY += 28;
    } else {
      titleY += 6;
    }

    // Epitaph
    ctx.font = 'italic 21px "Crimson Pro", Georgia, serif';
    ctx.fillStyle = t.textMain;
    const quoteLines = wrapCanvasText(ctx, `"${grave.lesson_learned || 'Code well, rest peacefully.'}"`, 720, 2);
    let quoteY = titleY + 8;
    for (const line of quoteLines) {
      ctx.fillText(line, leftX, quoteY);
      quoteY += 30;
    }

    // Stats Row
    const statsY = padY + cardH - 86;
    const statItemH = 50;

    // 1. Lived For
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    drawRoundedRect(ctx, leftX, statsY, 155, statItemH, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();
    ctx.font = '9px "Space Mono", monospace';
    ctx.fillStyle = t.textSub;
    ctx.fillText('LIVED FOR', leftX + 12, statsY + 10);
    ctx.font = 'bold 15px "Space Mono", monospace';
    ctx.fillStyle = t.textMain;
    ctx.fillText(grave.lived_for || 'Unknown', leftX + 12, statsY + 26);

    // 2. Tech Stack
    const stackX = leftX + 167;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    drawRoundedRect(ctx, stackX, statsY, 185, statItemH, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();
    ctx.font = '9px "Space Mono", monospace';
    ctx.fillStyle = t.textSub;
    ctx.fillText('TECH STACK', stackX + 12, statsY + 10);
    ctx.font = 'bold 14px "Space Mono", monospace';
    ctx.fillStyle = t.accentText;
    const stackTrunc = (grave.tech_stack || 'Unknown').slice(0, 15);
    ctx.fillText(stackTrunc, stackX + 12, statsY + 26);

    // 3. RIPs
    const ripX = stackX + 197;
    ctx.fillStyle = 'rgba(197, 48, 48, 0.15)';
    drawRoundedRect(ctx, ripX, statsY, 130, statItemH, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(197, 48, 48, 0.4)';
    ctx.stroke();
    ctx.font = 'bold 14px "Space Mono", monospace';
    ctx.fillStyle = t.textMain;
    ctx.fillText(`🌹 RIPs  ${respects}`, ripX + 12, statsY + 18);

    // 4. Eulogies
    const euloX = ripX + 142;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    drawRoundedRect(ctx, euloX, statsY, 145, statItemH, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();
    ctx.font = 'bold 14px "Space Mono", monospace';
    ctx.fillStyle = t.textMain;
    ctx.fillText(`📜 Eulogies ${eulogiesCount}`, euloX + 12, statsY + 18);

    // Divider Line between left and right
    const dividerX = 870;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(dividerX, padY + 30);
    ctx.lineTo(dividerX, padY + cardH - 30);
    ctx.stroke();

    // Right Column: QR Code & Branding
    const rightCenterX = dividerX + (padX + cardW - dividerX) / 2;
    const qrSize = 176;
    const qrBoxX = rightCenterX - qrSize / 2;
    const qrBoxY = padY + (cardH - qrSize) / 2 - 24;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, qrBoxX, qrBoxY, qrSize, qrSize, 16);
    ctx.fill();
    ctx.restore();

    if (qrCanvas && qrCanvas.width > 0) {
      ctx.drawImage(qrCanvas, qrBoxX + 10, qrBoxY + 10, qrSize - 20, qrSize - 20);
    } else {
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('QR CODE', rightCenterX, qrBoxY + qrSize / 2);
    }

    // Branding under QR
    ctx.font = 'bold 12px "Space Mono", monospace';
    ctx.fillStyle = t.textSub;
    ctx.textAlign = 'center';
    ctx.fillText('🪦  DEV GRAVEYARD', rightCenterX, qrBoxY + qrSize + 28);
  }
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  grave,
  respects,
  eulogiesCount,
  graveOwnerUsername,
  onClose
}) => {
  const [theme, setTheme] = useState<keyof typeof THEMES>('minimal-noir');
  const [format, setFormat] = useState<'instagram' | 'twitter'>('instagram'); // instagram: 1080x1080, twitter: 1200x630
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copyStatusMsg, setCopyStatusMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://devgraveyard.app';
  const qrUrl = `${origin}/#/grave/${grave.id}`;

  const currentTheme = THEMES[theme];
  const isInsta = format === 'instagram';
  const width = isInsta ? 1080 : 1200;
  const height = isInsta ? 1080 : 630;

  /**
   * Generates a card canvas using html2canvas with optimal document-bound positioning,
   * with automatic fallback to pure Canvas 2D if html2canvas encounters restrictions.
   */
  const getCardCanvas = useCallback(async (highRes: boolean = false): Promise<HTMLCanvasElement> => {
    const targetScale = highRes ? 2 : 1;

    // 1. Attempt html2canvas first (high fidelity DOM capture)
    try {
      if (cardRef.current) {
        if (typeof document !== 'undefined' && 'fonts' in document) {
          try {
            await Promise.race([
              (document as any).fonts.ready,
              new Promise((resolve) => setTimeout(resolve, 600))
            ]);
          } catch {
            // Non-critical: continue even if font ready promise times out
          }
        }

        const html2canvasPromise = html2canvas(cardRef.current, {
          scale: targetScale,
          backgroundColor: currentTheme.bg,
          logging: false,
          useCORS: true,
          allowTaint: false,
          width: width,
          height: height,
          windowWidth: width,
          windowHeight: height,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc) => {
            const container = clonedDoc.getElementById('share-card-container');
            if (container) {
              container.style.opacity = '1';
              container.style.zIndex = '1';
            }
            const node = clonedDoc.getElementById('share-card-render-node');
            if (node) {
              node.style.opacity = '1';
            }
          }
        });

        // Timeout guard: if html2canvas hangs over 3 seconds, abort and fallback
        const canvas = await Promise.race([
          html2canvasPromise,
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('html2canvas timed out')), 3000))
        ]);

        if (canvas && canvas.width > 0 && canvas.height > 0) {
          return canvas;
        }
      }
    } catch (err) {
      console.warn("html2canvas unavailable or restricted, seamlessly falling back to Canvas2D:", err);
    }

    // 2. Pure HTML5 Canvas 2D fallback generator (instant, 100% reliable)
    const fallbackCanvas = document.createElement('canvas');
    drawCanvasFallback(fallbackCanvas, {
      grave,
      respects,
      eulogiesCount,
      graveOwnerUsername,
      theme,
      format,
      qrCanvas: qrCanvasRef.current,
      highRes
    });
    return fallbackCanvas;
  }, [cardRef, currentTheme.bg, format, grave, graveOwnerUsername, height, respects, eulogiesCount, theme, width]);

  /**
   * Generates a high-resolution Blob for download or clipboard copy
   */
  const generateBlob = useCallback(async (highRes: boolean = true): Promise<Blob | null> => {
    try {
      const canvas = await getCardCanvas(highRes);
      return new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // DataURL fallback if toBlob is restricted
            try {
              const dataUrl = canvas.toDataURL('image/png');
              const arr = dataUrl.split(',');
              const mime = arr[0].match(/:(.*?);/)![1];
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              resolve(new Blob([u8arr], { type: mime }));
            } catch (fallbackErr) {
              console.error("DataURL fallback error:", fallbackErr);
              resolve(null);
            }
          }
        }, 'image/png');
      });
    } catch (err) {
      console.error("Failed to generate image blob:", err);
      return null;
    }
  }, [getCardCanvas]);

  /**
   * Generates the instant modal preview
   */
  const generatePreview = useCallback(async () => {
    setIsGenerating(true);
    try {
      const canvas = await getCardCanvas(false);
      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.88));
    } catch (err) {
      console.error("Failed to generate preview:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [getCardCanvas]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      generatePreview();
    }, 250);
    return () => clearTimeout(timeout);
  }, [generatePreview, theme, format]);

  /**
   * Triggers file download in the browser
   */
  const triggerDownload = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RIP-${grave.project_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  /**
   * Copies the memorial card image directly to system clipboard
   */
  const handleCopyImage = async () => {
    setIsGenerating(true);
    setCopyStatusMsg(null);
    try {
      const blob = await generateBlob(true);
      if (!blob) {
        throw new Error("Could not create image blob");
      }

      // Check if ClipboardItem & navigator.clipboard.write are available
      if (
        typeof navigator === 'undefined' ||
        !navigator.clipboard ||
        typeof navigator.clipboard.write !== 'function' ||
        typeof ClipboardItem === 'undefined'
      ) {
        // Fallback for browsers without direct image clipboard write support
        triggerDownload(blob);
        setCopyStatusMsg("Browser restricts direct clipboard images. Card downloaded!");
        setTimeout(() => setCopyStatusMsg(null), 4000);
        return;
      }

      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      setCopiedImage(true);
      setCopyStatusMsg("Memorial card copied! Paste directly into Slack, Discord, Twitter, or WhatsApp.");
      setTimeout(() => {
        setCopiedImage(false);
        setCopyStatusMsg(null);
      }, 4000);
    } catch (err: any) {
      console.warn("Clipboard image write failed:", err);
      // Fallback: download card so user never leaves empty-handed
      const blob = await generateBlob(true);
      if (blob) {
        triggerDownload(blob);
      }
      setCopyStatusMsg(err.name === 'NotAllowedError'
        ? "Clipboard permission denied. Card downloaded instead!"
        : "Couldn't write to clipboard directly. Card downloaded!");
      setTimeout(() => setCopyStatusMsg(null), 4000);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Downloads the high-resolution memorial card
   */
  const handleDownload = async () => {
    setIsGenerating(true);
    setCopyStatusMsg(null);
    try {
      const blob = await generateBlob(true);
      if (!blob) {
        throw new Error("Blob creation failed");
      }
      triggerDownload(blob);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Unable to generate memorial card. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Native OS Share integration
   */
  const handleNativeShare = async () => {
    setIsGenerating(true);
    setCopyStatusMsg(null);
    try {
      const blob = await generateBlob(true);
      if (!blob) throw new Error("Share blob creation failed");

      const fileName = `RIP-${grave.project_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `RIP ${grave.project_name}`,
          text: `A resting place for ${grave.project_name}. Laid to rest on DevGraveyard.\n\n"${grave.lesson_learned}"`,
          url: qrUrl,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: `RIP ${grave.project_name}`,
          text: `A resting place for ${grave.project_name}. Check out the tombstone on DevGraveyard.`,
          url: qrUrl,
        });
      } else {
        triggerDownload(blob);
        setCopyStatusMsg("Native OS share is unsupported. Card downloaded!");
        setTimeout(() => setCopyStatusMsg(null), 4000);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error("Native share error:", err);
        const blob = await generateBlob(true);
        if (blob) triggerDownload(blob);
        setCopyStatusMsg("Share aborted. Card downloaded instead!");
        setTimeout(() => setCopyStatusMsg(null), 4000);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Copies formatted text epitaph snippet
   */
  const handleCopySnippet = async () => {
    const snippet = `🪦 RIP ${grave.project_name}\n\n` +
      `💀 Cause of Death: ${grave.cause_of_death}\n` +
      `⏳ Lived For: ${grave.lived_for || 'Unknown'}\n` +
      `🛠️ Tech Stack: ${grave.tech_stack || 'Unknown'}\n\n` +
      `"${grave.lesson_learned}"\n\n` +
      (graveOwnerUsername ? `Laid to rest by @${graveOwnerUsername}\n` : '') +
      `🌹 Pay your respects: ${qrUrl}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(snippet);
        setCopiedSnippet(true);
        setTimeout(() => setCopiedSnippet(false), 2000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = snippet;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopiedSnippet(true);
          setTimeout(() => setCopiedSnippet(false), 2000);
        } catch (err) {
          console.error('Fallback copy snippet error:', err);
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Main Dialog Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[92vh] sm:max-h-[90vh]"
      >
        {/* Left Side: Preview Area */}
        <div className="flex-1 bg-zinc-900/60 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[340px] border-b md:border-b-0 md:border-r border-zinc-800 relative overflow-hidden">
          {isGenerating && !previewUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/85 z-10">
              <Loader2 className="w-8 h-8 text-zinc-300 animate-spin mb-3" />
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Generating Memorial Card...</span>
            </div>
          )}

          <div className="w-full max-w-md aspect-square flex items-center justify-center relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Share Card Preview"
                className={`w-full h-auto max-h-[42vh] sm:max-h-[50vh] object-contain shadow-2xl rounded-xl border border-zinc-800 transition-opacity duration-300 ${isGenerating ? 'opacity-50' : 'opacity-100'}`}
              />
            ) : (
              <div className="w-full aspect-square bg-zinc-900/90 animate-pulse rounded-xl border border-zinc-800 flex items-center justify-center">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Rendering Preview...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Export Controls */}
        <div className="w-full md:w-80 p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 bg-zinc-950 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg">🪦</span>
              <h3 className="text-base sm:text-lg font-bold font-sans text-white">Export Card</h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat('instagram')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all flex flex-col items-center justify-center gap-0.5 ${format === 'instagram' ? 'bg-white text-black border-white font-bold shadow' : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'}`}
              >
                <span>Instagram (1:1)</span>
                <span className={`text-[10px] ${format === 'instagram' ? 'text-zinc-600' : 'text-zinc-500'}`}>1080 × 1080</span>
              </button>
              <button
                onClick={() => setFormat('twitter')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all flex flex-col items-center justify-center gap-0.5 ${format === 'twitter' ? 'bg-white text-black border-white font-bold shadow' : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'}`}
              >
                <span>Social / X (1.9:1)</span>
                <span className={`text-[10px] ${format === 'twitter' ? 'text-zinc-600' : 'text-zinc-500'}`}>1200 × 630</span>
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">Tombstone Theme</label>
            <div className="grid grid-cols-1 gap-1.5">
              {Object.entries(THEMES).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key as keyof typeof THEMES)}
                  className={`w-full py-2 px-3.5 rounded-lg border flex items-center justify-between transition-all ${theme === key ? 'border-zinc-400 bg-zinc-900 shadow-md ring-1 ring-zinc-500/20' : 'border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/40'}`}
                >
                  <span className="text-xs sm:text-sm font-sans font-medium text-white">{t.name}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: t.bg }} />
                    <div className={`w-3.5 h-3.5 rounded-full ${t.accentBg} border border-white/10`} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Status Message Notification */}
          {copyStatusMsg && (
            <div className="p-2.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs font-mono text-zinc-200 flex items-center gap-2 shadow-sm animate-fade-in-fast">
              <span className="text-sm shrink-0">✨</span>
              <span className="leading-snug">{copyStatusMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-auto pt-3 space-y-2">
            {/* Copy Image to Clipboard (Instant Share for Slack, Discord, Twitter, WhatsApp) */}
            <button
              onClick={handleCopyImage}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-mono text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer ${copiedImage ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/20 hover:border-emerald-500/60'}`}
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : copiedImage ? <Check className="w-4 h-4 text-white" /> : <ImageIcon className="w-4 h-4" />}
              {copiedImage ? "Image Copied to Clipboard!" : "Copy Image to Clipboard"}
            </button>

            {/* Download High-Res Image */}
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 px-4 rounded-lg font-mono text-xs sm:text-sm font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 shadow-md cursor-pointer"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Download className="w-4 h-4" />}
              Download High-Res PNG
            </button>

            {/* Share via OS */}
            <button
              onClick={handleNativeShare}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-zinc-200 border border-zinc-700/80 py-2.5 px-4 rounded-lg font-mono text-xs hover:bg-zinc-800 hover:text-white hover:border-[#c53030]/60 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share via OS
            </button>

            {/* Copy Epitaph Snippet */}
            <button
              onClick={handleCopySnippet}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-zinc-200 border border-zinc-700/80 py-2.5 px-4 rounded-lg font-mono text-xs hover:bg-zinc-800 hover:text-white hover:border-[#c53030]/60 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSnippet ? "Copied Text Epitaph!" : "Copy Epitaph Snippet"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Hidden Render Node - Kept strictly within document bounds for 100% fidelity html2canvas capture */}
      <div
        id="share-card-container"
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none select-none overflow-hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${width}px`,
          height: `${height}px`,
          zIndex: -50,
          opacity: 0.01,
          backgroundColor: currentTheme.bg,
          pointerEvents: 'none'
        }}
      >
        <div
          ref={cardRef}
          id="share-card-render-node"
          className="w-full h-full relative flex flex-col items-center justify-center p-12"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: currentTheme.bg,
            boxSizing: 'border-box'
          }}
        >
          {/* Ambient Glow */}
          <div className={`absolute inset-0 ${currentTheme.glow} opacity-60`} />

          {/* Main Tombstone Card Body */}
          <div className={`relative w-full h-full ${currentTheme.cardBg} border ${currentTheme.border} ${currentTheme.shadow} rounded-3xl p-10 flex ${isInsta ? 'flex-col items-center text-center' : 'flex-row items-center justify-between text-left'} gap-8 overflow-hidden`}>
            
            {/* Left Content Area */}
            <div className={`relative z-10 flex flex-col ${isInsta ? 'items-center' : 'items-start'} flex-1 w-full h-full justify-center gap-4`}>
              <div className={`inline-flex px-4 py-1.5 rounded-full border ${currentTheme.accentBorder} ${currentTheme.accentBg} ${currentTheme.accentText} text-xs font-mono uppercase tracking-[0.2em] font-semibold`}>
                {grave.cause_of_death}
              </div>

              <div className="space-y-2 mt-2 w-full">
                <h2 className={`${isInsta ? 'text-5xl' : 'text-6xl'} font-bold ${currentTheme.textMain} font-sans tracking-tight leading-tight line-clamp-2`}>
                  {grave.project_name}
                </h2>
                {graveOwnerUsername && (
                  <p className={`text-base sm:text-lg font-mono ${currentTheme.accentText} opacity-90 uppercase tracking-widest font-medium`}>
                    Laid to rest by @{graveOwnerUsername}
                  </p>
                )}
              </div>

              <p className={`text-xl ${currentTheme.textMain} font-serif italic leading-relaxed opacity-95 max-w-2xl line-clamp-3 my-2`}>
                "{grave.lesson_learned}"
              </p>

              <div className="flex flex-col w-full gap-4 mt-auto">
                <div className={`flex flex-wrap ${isInsta ? 'justify-center' : 'justify-start'} gap-4`}>
                  <div className="flex flex-col gap-1 border border-zinc-800/80 bg-black/40 px-3.5 py-2 rounded-lg">
                    <span className={`text-xs ${currentTheme.textSub} font-mono uppercase tracking-widest`}>Lived For</span>
                    <span className={`text-lg ${currentTheme.textMain} font-mono font-bold`}>{grave.lived_for || "Unknown"}</span>
                  </div>
                  <div className="flex flex-col gap-1 border border-zinc-800/80 bg-black/40 px-3.5 py-2 rounded-lg max-w-[240px] overflow-hidden">
                    <span className={`text-xs ${currentTheme.textSub} font-mono uppercase tracking-widest`}>Tech Stack</span>
                    <span className={`text-lg ${currentTheme.accentText} font-mono font-semibold truncate`}>{grave.tech_stack || "Unknown"}</span>
                  </div>
                </div>

                <div className={`flex ${isInsta ? 'justify-center' : 'justify-start'} gap-4 mt-1`}>
                  <div className="flex items-center gap-3 bg-[#c53030]/15 border border-[#c53030]/40 px-3.5 py-2 rounded-lg shadow-inner">
                    <span className="text-xl text-[#c53030]">🌹</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#f87171] font-mono uppercase tracking-widest font-bold">RIPs</span>
                      <span className={`text-xl ${currentTheme.textMain} font-mono font-bold leading-none`}>{respects}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-800/40 border border-zinc-700/60 px-3.5 py-2 rounded-lg shadow-inner">
                    <span className="text-xl text-zinc-300">📜</span>
                    <div className="flex flex-col">
                      <span className={`text-[10px] ${currentTheme.textSub} font-mono uppercase tracking-widest font-bold`}>Eulogies</span>
                      <span className={`text-xl ${currentTheme.textMain} font-mono font-bold leading-none`}>{eulogiesCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: QR Code Container */}
            <div className={`relative z-10 flex flex-col items-center gap-3 ${isInsta ? 'mt-4 border-t border-zinc-800/60 pt-6 w-full' : 'pl-8 border-l border-zinc-800/60 shrink-0 h-full justify-center'}`}>
              <div className="p-3.5 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                <QRCodeCanvas
                  ref={qrCanvasRef}
                  value={qrUrl}
                  size={isInsta ? 144 : 176}
                  level="H"
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
              <div className={`font-mono text-xs ${currentTheme.textSub} uppercase tracking-widest flex flex-col items-center text-center gap-1.5 mt-2 font-medium`}>
                <span className="text-2xl" role="img" aria-label="grave">🪦</span>
                <span>Dev Graveyard</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
