'use client';
// Menu do Financeiro: lateral no computador, barra fixa embaixo no celular. O "+" lança no evento aberto.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sair } from '@/app/financeiro/acoes';
import { Caixa, Calendario, Equipe, Mais } from './icones';

export function Navegacao({ nome }: { nome: string }) {
  const caminho = usePathname();
  const ev = caminho.match(/^\/financeiro\/eventos\/(\d+)/)?.[1];
  const lancar = ev ? `/financeiro/lancar?evento=${ev}` : '/financeiro/lancar';
  const atual = (h: string, exato = false) => (exato ? caminho === h : caminho.startsWith(h)) ? 'page' : undefined;
  return (
    <>
      <aside className="fin-lateral">
        <div className="fin-marca">
          <img src="/marca/royals-gold-transparent.svg" alt="Royals Entretenimento" />
          <span>Financeiro</span>
        </div>
        <nav aria-label="Financeiro">
          <Link href="/financeiro" aria-current={atual('/financeiro', true)}><Caixa />Caixa Royals</Link>
          <Link href="/financeiro/eventos" aria-current={atual('/financeiro/eventos')}><Calendario />Eventos</Link>
          <Link href={lancar} aria-current={atual('/financeiro/lancar')}><Mais />Lançamento</Link>
          <Link href="/financeiro/equipe" aria-current={atual('/financeiro/equipe')}><Equipe />Equipe</Link>
        </nav>
        <div className="fin-sair">
          {nome} · <form action={sair} style={{ display: 'inline' }}><button type="submit">sair</button></form>
        </div>
      </aside>
      <nav className="fin-baixo" aria-label="Financeiro">
        <Link href="/financeiro" aria-current={atual('/financeiro', true)}><Caixa />Caixa</Link>
        <Link href="/financeiro/eventos" aria-current={atual('/financeiro/eventos')}><Calendario />Eventos</Link>
        <Link href={lancar} className="fin-mais" aria-label="Novo lançamento">+</Link>
        <Link href="/financeiro/equipe" aria-current={atual('/financeiro/equipe')}><Equipe />Equipe</Link>
        <form action={sair} style={{ display: 'contents' }}><button type="submit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><path d="M15 4h5v16h-5M10 8l-4 4 4 4M6 12h10" /></svg>Sair</button></form>
      </nav>
    </>
  );
}
