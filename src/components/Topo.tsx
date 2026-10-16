'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MENU } from '@/lib/site';
import { Logo, Marcador } from './Marca';

/** Header fixo de 72 px: transparente sobre a foto do topo e sólido depois de rolar. CTA de ingressos sempre visível
 *  no desktop; no mobile o menu abre em tela cheia e os ingressos ficam na barra fixa do rodapé. */
export function Topo({ ingressos, solido = false }: { ingressos?: { href: string; externo?: boolean }; solido?: boolean }) {
  const [rolou, setRolou] = useState(false);
  const [aberto, setAberto] = useState(false);
  const caminho = usePathname();
  useEffect(() => {
    const f = () => setRolou(window.scrollY > 40);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : '';
    if (!aberto) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [aberto]);
  const ativo = (href: string) => caminho === href || caminho.startsWith(href + '/');
  return (
    <>
      <header className="topo" data-solido={solido || rolou ? 'true' : 'false'}>
        <div className="container topo__barra">
          <Link href="/" className="topo__logo" aria-label="Royals Entretenimento, início"><Logo largura={112} brilho /></Link>
          <nav className="topo__nav" aria-label="Principal">
            {MENU.map((m) => <Link key={m.href} href={m.href} className="link" aria-current={ativo(m.href) ? 'page' : undefined}>{m.rotulo}</Link>)}
          </nav>
          <div className="topo__acoes">
            {ingressos && (
              ingressos.externo
                ? <a className="botao botao--sm" href={ingressos.href} target="_blank" rel="noopener noreferrer">Ingressos<span className="seta" aria-hidden="true">↗</span></a>
                : <Link className="botao botao--sm" href={ingressos.href}>Ingressos<span className="seta" aria-hidden="true">→</span></Link>
            )}
            <button type="button" className="topo__menu" aria-label="Abrir menu" aria-expanded={aberto} onClick={() => setAberto(true)}><Marcador /></button>
          </div>
        </div>
      </header>
      {aberto && (
        <div className="menu-cheio" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="menu-cheio__topo">
            <Link href="/" onClick={() => setAberto(false)} aria-label="Início"><Logo largura={112} brilho /></Link>
            <button type="button" className="fechar" aria-label="Fechar menu" onClick={() => setAberto(false)}>×</button>
          </div>
          <nav className="menu-cheio__lista" aria-label="Principal">
            <Link href="/" onClick={() => setAberto(false)}>Início</Link>
            {MENU.map((m) => <Link key={m.href} href={m.href} onClick={() => setAberto(false)}>{m.rotulo}</Link>)}
            <Link href="/contato" onClick={() => setAberto(false)}>Contato</Link>
          </nav>
        </div>
      )}
    </>
  );
}
