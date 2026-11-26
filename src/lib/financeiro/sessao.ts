// Token da sessão do admin (cookie httpOnly): "<id>.<expira>.<hmac>". Funções puras: usadas pelo proxy e pelo auth.
import { createHmac, timingSafeEqual } from 'node:crypto';

export const COOKIE = 'royals_fin';
export const DURACAO_S = 60 * 60 * 24 * 30; // 30 dias

function segredo(): string {
  const s = process.env.FIN_SESSAO_SEGREDO?.trim();
  if (s) return s;
  if (process.env.NODE_ENV === 'production') throw new Error('FIN_SESSAO_SEGREDO não definida');
  return 'segredo-local-de-desenvolvimento-royals';
}

function assinar(valor: string): string {
  return createHmac('sha256', segredo()).update(valor).digest('base64url');
}

export function criarToken(adminId: number): string {
  const corpo = `${adminId}.${Math.floor(Date.now() / 1000) + DURACAO_S}`;
  return `${corpo}.${assinar(corpo)}`;
}

export function lerToken(token: string | undefined): number | null {
  if (!token) return null;
  const partes = token.split('.');
  if (partes.length !== 3) return null;
  const a = Buffer.from(assinar(`${partes[0]}.${partes[1]}`));
  const b = Buffer.from(partes[2]);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(partes[1]) < Date.now() / 1000) return null;
  const id = Number(partes[0]);
  return Number.isInteger(id) ? id : null;
}
