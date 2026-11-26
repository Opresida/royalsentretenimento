import type { Metadata } from 'next';
import { Navegacao } from '@/components/financeiro/Navegacao';
import { exigirAdmin } from '@/lib/financeiro/auth';
import '../financeiro.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { default: 'Financeiro', template: '%s · Financeiro Royals' },
  robots: { index: false, follow: false },
};

export default async function LayoutFinanceiro({ children }: { children: React.ReactNode }) {
  const admin = await exigirAdmin();
  return (
    <div className="fin">
      <div className="fin-casca">
        <Navegacao nome={admin.nome} />
        <header className="fin-topo-cel"><img src="/marca/royals-gold-transparent.svg" alt="Royals" /><span>Financeiro</span></header>
        <main className="fin-miolo">{children}</main>
      </div>
    </div>
  );
}
