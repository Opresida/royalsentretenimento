// Aplica as migrations de ./drizzle no Neon (roda antes do build). Sem DATABASE_URL, pula:
// localmente o banco embutido (PGlite) migra sozinho ao subir o dev.
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.log('DATABASE_URL não definida: migração pulada.');
    return;
  }
  await migrate(drizzle(neon(url)), { migrationsFolder: './drizzle' });
  console.log('Migrations aplicadas.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
