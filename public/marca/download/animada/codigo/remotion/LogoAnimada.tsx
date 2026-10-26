import React from 'react';
import { AbsoluteFill, Composition, Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { RoyalsLogo } from './RoyalsLogo';

// ROYALS · LOGO ANIMADA — kit de marca para produtores parceiros (pedido do Humberto, 26/10/2026).
// Desenvolvido por BrandSquad · brandsquad.com.br
//
// A logo oficial em camadas (RoyalsLogo, gerada do SVG oficial) se monta em 5 s:
//   0,1 s  a base da coroa sobe; as duas asas entram dos lados; o pico cai por cima
//   0,7 s  a coroa fecha com um estouro de raios dourados
//   0,8 s  R O Y A L S sobem uma a uma
//   1,3 s  ENTRETENIMENTO acende letra a letra
//   2,1 s  um brilho metálico atravessa a logo
//   2,9 s  a logo respira devagar até o fim (bom para loop ou para segurar a imagem)
// Versões: 16:9 (1920×1080) e 9:16 (1080×1920), com fundo preto ou transparente (render com alfa).
// Render: ver o README do pacote de código em D:\dev\royals\public\marca\download\animada.

const FPS = 30;
export const LOGO_ANIMADA_FRAMES = 150;
const OURO_CLARO = '#DBBC58';
const PRETO = '#050505';
const preso = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const entra = (l: number, ini: number, dur: number, de = 0, para = 1) => interpolate(l, [ini, ini + dur], [de, para], { ...preso, easing: Easing.out(Easing.exp) });
const mola = (l: number, ini: number, dur: number, de = 0, para = 1) => interpolate(l, [ini, ini + dur], [de, para], { ...preso, easing: Easing.out(Easing.back(1.7)) });

// marcos (quadros)
const COROA = 3, FECHA = 20, LETRAS = 24, SLOGAN = 40, BRILHO = 62, RESPIRA = 88;
// centro da coroa no viewBox 876×876 do SVG oficial (o símbolo ocupa 446–552 × 326–402)
const COROA_C = { x: 499, y: 364 };

const camadasNoQuadro = (f: number): Record<string, React.CSSProperties> => {
  const c: Record<string, React.CSSProperties> = { background: { display: 'none' } };
  c['crown-base'] = { opacity: entra(f, COROA, 6), transform: `translateY(${mola(f, COROA, 14, 40, 0)}px)` };
  c['crown-left'] = { opacity: entra(f, COROA + 4, 6), transform: `translate(${mola(f, COROA + 4, 14, -46, 0)}px, ${mola(f, COROA + 4, 14, 12, 0)}px) rotate(${mola(f, COROA + 4, 14, -24, 0)}deg)` };
  c['crown-right'] = { opacity: entra(f, COROA + 6, 6), transform: `translate(${mola(f, COROA + 6, 14, 46, 0)}px, ${mola(f, COROA + 6, 14, 12, 0)}px) rotate(${mola(f, COROA + 6, 14, 24, 0)}deg)` };
  c['crown-peak'] = { opacity: entra(f, COROA + 10, 5), transform: `translateY(${mola(f, COROA + 10, 12, -60, 0)}px) scale(${mola(f, COROA + 10, 12, 1.5, 1)})` };
  ['R', 'O', 'Y', 'A', 'L', 'S'].forEach((ch, i) => {
    const ini = LETRAS + i * 2;
    c[`letter-0${i + 1}-${ch}`] = { opacity: entra(f, ini, 6), transform: `translateY(${entra(f, ini, 14, 70, 0)}px) scale(${entra(f, ini, 14, 0.85, 1)})` };
  });
  'ENTRETENIMENTO'.split('').forEach((ch, i) => {
    const ini = SLOGAN + i;
    c[`tagline-letter-${String(i + 1).padStart(2, '0')}-${ch}`] = { opacity: entra(f, ini, 8), transform: `translateY(${entra(f, ini, 10, 10, 0)}px)` };
  });
  return c;
};

/** A logo inteira num quadro: camadas animadas, respiração no fim e um empurrão lento de câmera. */
const Logo: React.FC<{ f: number; largura: number; filtro?: string }> = ({ f, largura, filtro }) => {
  const respira = f >= RESPIRA ? 1 + 0.012 * Math.sin(((f - RESPIRA) / 45) * Math.PI) : 1;
  const empurra = interpolate(f, [0, LOGO_ANIMADA_FRAMES], [0.97, 1.02]);
  return (
    <div style={{ width: largura, height: largura, transform: `scale(${empurra * respira})`, filter: filtro }}>
      <RoyalsLogo className="" width={largura} height={largura} showBackground={false} layers={camadasNoQuadro(f)} />
    </div>
  );
};

/** Brilho metálico: uma segunda logo idêntica e mais clara, vista só por uma faixa que atravessa. */
const Reflexo: React.FC<{ f: number; largura: number }> = ({ f, largura }) => {
  if (f < BRILHO || f > BRILHO + 24) return null;
  const p = interpolate(f, [BRILHO, BRILHO + 24], [-30, 130], { ...preso, easing: Easing.inOut(Easing.quad) });
  const faixa = `linear-gradient(105deg, transparent ${p - 10}%, #000 ${p}%, transparent ${p + 10}%)`;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitMaskImage: faixa, maskImage: faixa }}>
      <Logo f={f} largura={largura} filtro="brightness(2.1) saturate(.55)" />
    </div>
  );
};

/** Raios dourados que se abrem da coroa quando ela fecha. */
const Raios: React.FC<{ f: number; cx: number; cy: number; escala: number }> = ({ f, cx, cy, escala }) => {
  const l = f - FECHA;
  if (l < 0 || l > 34) return null;
  return (
    <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 22 }, (_, i) => {
        const ang = (i / 22) * Math.PI * 2 + random(`ang${i}`) * 0.25;
        const p = Easing.out(Easing.quad)(Math.min(1, l / 26));
        const r0 = (26 + 150 * p) * escala, r1 = r0 + (40 + 170 * random(`len${i}`) * p) * escala;
        return <line key={i} x1={cx + Math.cos(ang) * r0} y1={cy + Math.sin(ang) * r0} x2={cx + Math.cos(ang) * r1} y2={cy + Math.sin(ang) * r1}
          stroke={OURO_CLARO} strokeWidth={(1.5 + 2.5 * random(`w${i}`)) * escala} strokeLinecap="round" opacity={interpolate(l, [0, 4, 18, 30], [0, 0.85, 0.35, 0], preso)} />;
      })}
    </svg>
  );
};

/** Poeira dourada subindo devagar (só na versão com fundo). */
const Poeira: React.FC<{ f: number; w: number; h: number }> = ({ f, w, h }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    {Array.from({ length: 40 }, (_, i) => {
      const r = (k: string) => random(`poeira-${i}-${k}`);
      const vel = 0.6 + r('v') * 1.6;
      const y = h + 20 - ((f * vel + r('y') * (h + 40)) % (h + 40));
      const x = r('x') * w + Math.sin(f / (20 + r('o') * 30) + r('f') * 6) * 18;
      const tam = 2 + r('t') * 4;
      return <div key={i} style={{ position: 'absolute', left: x, top: y, width: tam, height: tam, borderRadius: '50%', background: OURO_CLARO, opacity: (0.25 + 0.5 * r('a')) * entra(f, 0, 20), boxShadow: `0 0 ${tam * 3}px rgba(219,188,88,.6)` }} />;
    })}
  </AbsoluteFill>
);

export const LogoAnimada: React.FC<{ w: number; h: number; transparente?: boolean }> = ({ w, h, transparente }) => {
  const f = useCurrentFrame();
  // o quadro do SVG é 876×876 e a logo ocupa 734 de largura: a escala deixa a logo com ~66% (16:9) ou ~84% (9:16) da largura
  const largura = Math.round((w > h ? 0.66 : 0.84) * w * (876 / 734));
  const escala = largura / 876;
  const cx = w / 2 + (COROA_C.x - 438) * escala, cy = h / 2 + (COROA_C.y - 438) * escala;
  const halo = interpolate(f, [FECHA, FECHA + 10, LOGO_ANIMADA_FRAMES], [0, 0.55, 0.3], preso);
  return (
    <AbsoluteFill style={{ background: transparente ? 'transparent' : PRETO }}>
      {!transparente && (
        <>
          <AbsoluteFill style={{ background: `radial-gradient(${w > h ? '45% 60%' : '70% 35%'} at 50% 50%, rgba(187,158,56,${0.22 * halo}), rgba(5,5,5,0) 70%)` }} />
          <Poeira f={f} w={w} h={h} />
        </>
      )}
      <Raios f={f} cx={cx} cy={cy} escala={escala} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Logo f={f} largura={largura} />
      </AbsoluteFill>
      <Reflexo f={f} largura={largura} />
    </AbsoluteFill>
  );
};

export const RoyalsLogoAnimadaComposicoes: React.FC = () => (
  <>
    <Composition id="Royals-Logo-Animada-16x9" component={LogoAnimada} durationInFrames={LOGO_ANIMADA_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ w: 1920, h: 1080 }} />
    <Composition id="Royals-Logo-Animada-9x16" component={LogoAnimada} durationInFrames={LOGO_ANIMADA_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ w: 1080, h: 1920 }} />
    <Composition id="Royals-Logo-Animada-16x9-Alfa" component={LogoAnimada} durationInFrames={LOGO_ANIMADA_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ w: 1920, h: 1080, transparente: true }} />
    <Composition id="Royals-Logo-Animada-9x16-Alfa" component={LogoAnimada} durationInFrames={LOGO_ANIMADA_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ w: 1080, h: 1920, transparente: true }} />
  </>
);
