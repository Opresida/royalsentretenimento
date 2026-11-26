// Cria (ou renova o convite de) um admin do Financeiro e imprime o link de primeiro acesso.
// Uso: DATABASE_URL=... pnpm financeiro:admin <usuario> "<Nome>" [https://site]
// Sem DATABASE_URL usa o banco local (PGlite em .data/). Nenhuma senha é criada aqui: a pessoa define a dela pelo link.
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import * as schema from '../src/db/schema';

async function banco() {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    const { neon } = await import('@neondatabase/serverless');
    const { drizzle } = await import('drizzle-orm/neon-http');
    return drizzle(neon(url), { schema });
  }
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  const dir = path.join(process.cwd(), '.data', 'pglite');
  (await import('node:fs')).mkdirSync(dir, { recursive: true });
  const db = drizzle(new PGlite(dir), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
  return db;
}

async function main() {
  const [usuario, nome, site = 'http://localhost:3500'] = process.argv.slice(2);
  if (!usuario || !nome) throw new Error('Uso: pnpm financeiro:admin <usuario> "<Nome>" [https://site]');
  const db = await banco();
  const convite = randomBytes(16).toString('base64url');
  const conviteExpira = new Date(Date.now() + 7 * 864e5);
  const [existe] = await db.select().from(schema.finAdmins).where(eq(schema.finAdmins.usuario, usuario.toLowerCase())).limit(1);
  if (existe) await db.update(schema.finAdmins).set({ convite, conviteExpira, ativo: true }).where(eq(schema.finAdmins.id, existe.id));
  else await db.insert(schema.finAdmins).values({ usuario: usuario.toLowerCase(), nome, senhaHash: '!', convite, conviteExpira });
  console.log(`${existe ? 'Convite renovado' : 'Admin criado'}: ${usuario.toLowerCase()}`);
  console.log(`Link de primeiro acesso (7 dias, uso único): ${site.replace(/\/$/, '')}/financeiro/convite/${convite}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
