// Login do admin do Financeiro: senha com scrypt, sessão em cookie httpOnly assinado (HMAC-SHA256).
// Segredo da sessão em FIN_SESSAO_SEGREDO (Vercel). Toda Server Action do financeiro chama exigirAdmin().
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';

const scrypt = promisify(_scrypt) as (s: string, salt: Buffer, len: number) => Promise<Buffer>;
import { COOKIE, DURACAO_S, criarToken, lerToken } from './sessao';

export async function hashSenha(senha: string): Promise<string> {
  const salt = randomBytes(16);
  const h = await scrypt(senha, salt, 64);
  return `scrypt.${salt.toString('base64url')}.${h.toString('base64url')}`;
}

export async function conferirSenha(senha: string, guardado: string): Promise<boolean> {
  const [alg, salt, h] = guardado.split('.');
  if (alg !== 'scrypt' || !salt || !h) return false;
  const esperado = Buffer.from(h, 'base64url');
  const calc = await scrypt(senha, Buffer.from(salt, 'base64url'), esperado.length);
  return timingSafeEqual(calc, esperado);
}

export async function gravarSessao(adminId: number) {
  (await cookies()).set(COOKIE, criarToken(adminId), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: DURACAO_S,
  });
}

export async function apagarSessao() {
  (await cookies()).delete(COOKIE);
}

export type Admin = { id: number; usuario: string; nome: string };

export async function adminAtual(): Promise<Admin | null> {
  const id = lerToken((await cookies()).get(COOKIE)?.value);
  if (!id) return null;
  const db = await getDb();
  const [a] = await db.select().from(schema.finAdmins).where(eq(schema.finAdmins.id, id)).limit(1);
  if (!a || !a.ativo) return null;
  return { id: a.id, usuario: a.usuario, nome: a.nome };
}

export async function exigirAdmin(): Promise<Admin> {
  const a = await adminAtual();
  if (!a) redirect('/financeiro/entrar');
  return a;
}

// link do sócio: 22 caracteres aleatórios (≈131 bits)
export function novoTokenSocio(): string {
  return randomBytes(16).toString('base64url');
}
