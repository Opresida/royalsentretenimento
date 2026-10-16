import Link from 'next/link';

type Props = {
  href: string; children: React.ReactNode; variante?: 'primario' | 'secundario' | 'fantasma' | 'evento'; tamanho?: 'sm' | 'md' | 'lg';
  seta?: boolean; externo?: boolean; cheio?: boolean; desligado?: boolean; className?: string;
};

/** Botão da marca: verbo curto em caixa alta, cantos retos, seta que avança 4 px no hover. Link externo abre em nova aba. */
export function Botao({ href, children, variante = 'primario', tamanho = 'md', seta = true, externo, cheio, desligado, className = '' }: Props) {
  const cls = ['botao', variante !== 'primario' && `botao--${variante}`, tamanho !== 'md' && `botao--${tamanho}`, cheio && 'botao--cheio', className].filter(Boolean).join(' ');
  const miolo = <>{children}{seta && <span className="seta" aria-hidden="true">{externo ? '↗' : '→'}</span>}</>;
  if (desligado) return <span className={cls} aria-disabled="true">{children}</span>;
  if (externo) return <a className={cls} href={href} target="_blank" rel="noopener noreferrer">{miolo}</a>;
  return <Link className={cls} href={href}>{miolo}</Link>;
}
