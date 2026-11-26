import type { PgliteDatabase } from 'drizzle-orm/pglite';
import * as schema from './schema';

export type Db = PgliteDatabase<typeof schema>;

const g = globalThis as unknown as { __royalsDb?: Promise<Db> };

// Com DATABASE_URL → Neon. Sem ela → PGlite em .data/ (Postgres embutido, só para desenvolvimento local),
// com as mesmas migrations aplicadas na subida. Mesmo esquema do site da BrandSquad.
async function criar(): Promise<Db> {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    const { neon } = await import('@neondatabase/serverless');
    const { drizzle } = await import('drizzle-orm/neon-http');
    return drizzle(neon(url), { schema }) as unknown as Db;
  }
  if (process.env.NODE_ENV === 'production') throw new Error('DATABASE_URL não definida em produção');
  const path = await import('node:path');
  const fs = await import('node:fs');
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  const dir = path.join(process.cwd(), '.data', 'pglite');
  fs.mkdirSync(dir, { recursive: true });
  const db = drizzle(new PGlite(dir), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') });
  return db;
}

export function getDb(): Promise<Db> {
  return (g.__royalsDb ??= criar());
}

export { schema };
