import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FormEntrar } from '@/components/financeiro/Formularios';
import { adminAtual } from '@/lib/financeiro/auth';
import '../financeiro.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Entrar · Financeiro',
  description: 'Acesso da equipe Royals ao financeiro dos eventos.',
  robots: { index: false, follow: false },
};

export default async function Entrar() {
  if (await adminAtual()) redirect('/financeiro');
  return (
    <div className="fin">
      <main className="fin-entrar">
        <div className="fin-entrar__caixa">
          <img src="/marca/royals-gold-transparent.svg" alt="Royals Entretenimento" />
          <div>
            <p className="fin-rot fin-rot--ouro">Uso interno</p>
            <h1 className="fin-titulo" style={{ fontSize: 30 }}>Financeiro</h1>
          </div>
          <FormEntrar />
        </div>
      </main>
    </div>
  );
}
