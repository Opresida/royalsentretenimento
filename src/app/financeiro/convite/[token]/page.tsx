import { agora } from '@/lib/financeiro/dinheiro';
import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { FormDefinirSenha } from '@/components/financeiro/Formularios';
import '../../financeiro.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Primeiro acesso · Financeiro', robots: { index: false, follow: false }, referrer: 'no-referrer' };

// Primeiro acesso: a pessoa cria a própria senha pelo link de uso único.
export default async function Convite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = await getDb();
  const [a] = /^[A-Za-z0-9_-]{16,64}$/.test(token) ? await db.select().from(schema.finAdmins).where(eq(schema.finAdmins.convite, token)).limit(1) : [];
  const valido = a && a.ativo && a.conviteExpira && a.conviteExpira.getTime() > agora();
  return (
    <div className="fin">
      <main className="fin-entrar">
        <div className="fin-entrar__caixa">
          <img src="/marca/royals-gold-transparent.svg" alt="Royals Entretenimento" />
          {valido ? (
            <>
              <div>
                <p className="fin-rot fin-rot--ouro">Primeiro acesso</p>
                <h1 className="fin-titulo" style={{ fontSize: 28 }}>Olá, {a.nome.split(' ')[0]}</h1>
                <p className="fin-sub">Seu usuário é <b className="ouro">{a.usuario}</b>. Crie sua senha para entrar no Financeiro Royals.</p>
              </div>
              <FormDefinirSenha convite={token} />
            </>
          ) : (
            <>
              <h1 className="fin-titulo" style={{ fontSize: 26 }}>Link expirado</h1>
              <p className="fin-sub">Este link de primeiro acesso já foi usado ou passou de 7 dias. Peça um novo à Royals.</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
